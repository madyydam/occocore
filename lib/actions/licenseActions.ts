"use server";

import { query } from "@/lib/db";

export interface TenantActivationKey {
  id: string;
  tenantSlug: string;
  tenantName: string;
  activationKey: string; // Formatted 8-digit key e.g. "8492-7163"
  rawKey: string; // Plain 8 digits e.g. "84927163"
  status: "PENDING" | "ACTIVATED" | "REVOKED";
  amountCharged?: number;
  currency?: string;
  createdAt: string;
  activatedAt?: string;
}

// Helper to format 8 digits into XXXX-XXXX
function formatEightDigits(digits: string): string {
  const clean = digits.replace(/[^0-9]/g, "").slice(0, 8);
  if (clean.length > 4) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  }
  return clean;
}

// Helper to generate a random 8-digit number string
function generateRandom8DigitString(): string {
  // Generates genuine 8-digit numeric string without leading zero
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return num.toString();
}

/**
 * Super Admin Action: Generate a unique 8-digit security activation key for an institution.
 * Stores strictly in PostgreSQL tenant_activation_keys table.
 */
export async function generateTenantActivationKeyAction(
  tenantSlug: string,
  tenantName: string,
  amountCharged: number = 0,
  notes: string = ""
): Promise<{ success: boolean; data?: TenantActivationKey; error?: string }> {
  try {
    const rawKey = generateRandom8DigitString();
    const formattedKey = formatEightDigits(rawKey);
    const cleanSlug = tenantSlug.trim().toLowerCase() || "unassigned";
    const cleanName = tenantName.trim() || "New Institutional Tenant";

    const res = await query<{
      id: string;
      tenant_slug: string;
      tenant_name: string;
      activation_key: string;
      amount_charged: string;
      currency: string;
      status: string;
      created_at: string;
    }>(
      `INSERT INTO tenant_activation_keys (
          tenant_slug, tenant_name, activation_key, amount_charged, currency, status, notes
       ) VALUES ($1, $2, $3, $4, 'INR', 'PENDING', $5)
       RETURNING id, tenant_slug, tenant_name, activation_key, amount_charged, currency, status, created_at`,
      [cleanSlug, cleanName, rawKey, amountCharged, notes]
    );

    if (res.rows.length === 0) {
      throw new Error("Failed to insert key record into PostgreSQL.");
    }

    const row = res.rows[0];
    const newKeyEntry: TenantActivationKey = {
      id: row.id,
      tenantSlug: row.tenant_slug,
      tenantName: row.tenant_name,
      activationKey: formattedKey,
      rawKey: row.activation_key,
      amountCharged: parseFloat(row.amount_charged || "0"),
      currency: row.currency || "INR",
      status: "PENDING",
      createdAt: new Date(row.created_at).toLocaleString(),
    };

    return {
      success: true,
      data: newKeyEntry,
    };
  } catch (err) {
    console.error("Failed to generate activation key:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate security activation key.",
    };
  }
}

/**
 * Institution Verification Action: Verify an 8-digit activation key entered on the onboarding gate.
 * Validates strictly against PostgreSQL tenant_activation_keys table. Zero backdoors.
 */
export async function verifyAndActivateTenantKeyAction(
  tenantSlug: string,
  inputKey: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanInput = inputKey.replace(/[^0-9]/g, "");

    if (cleanInput.length !== 8) {
      return {
        success: false,
        error: "Activation key must be exactly 8 digits (e.g. 8492-7163).",
      };
    }

    // Check PostgreSQL database directly
    const dbCheck = await query<{
      id: string;
      tenant_slug: string;
      tenant_name: string;
      status: string;
    }>(
      `SELECT id, tenant_slug, tenant_name, status 
       FROM tenant_activation_keys 
       WHERE activation_key = $1 AND status != 'REVOKED'
       LIMIT 1`,
      [cleanInput]
    );

    if (dbCheck.rows.length > 0) {
      const keyRecord = dbCheck.rows[0];

      // Mark the key as ACTIVATED
      await query(
        `UPDATE tenant_activation_keys 
         SET status = 'ACTIVATED', 
             activated_at = CURRENT_TIMESTAMP,
             tenant_slug = COALESCE(NULLIF(tenant_slug, 'unassigned'), $2)
         WHERE id = $1`,
        [keyRecord.id, tenantSlug.toLowerCase()]
      );

      // Activate tenant in tenants table if matching slug exists
      if (tenantSlug) {
        await query(
          `UPDATE tenants 
           SET status = 'ACTIVE', domain_verified = TRUE 
           WHERE LOWER(slug) = LOWER($1)`,
          [tenantSlug.toLowerCase()]
        );
      }

      return {
        success: true,
        message: `Institutional license confirmed. ${keyRecord.tenant_name} is now active and unlocked.`,
      };
    }

    return {
      success: false,
      error: "Invalid or unassigned 8-digit activation key. Please obtain a valid key from the Platform Super Administrator.",
    };
  } catch (err) {
    console.error("Failed to verify activation key in PostgreSQL:", err);
    return {
      success: false,
      error: "Verification failed due to a database service error. Please retry.",
    };
  }
}

/**
 * Super Admin Action: Retrieve all generated activation keys from PostgreSQL.
 */
export async function getTenantActivationKeysListAction(): Promise<{
  success: boolean;
  data: TenantActivationKey[];
}> {
  try {
    const res = await query<{
      id: string;
      tenant_slug: string;
      tenant_name: string;
      activation_key: string;
      amount_charged: string;
      currency: string;
      status: string;
      created_at: string;
      activated_at: string;
    }>(
      `SELECT id, tenant_slug, tenant_name, activation_key, amount_charged, currency, status, created_at, activated_at 
       FROM tenant_activation_keys 
       ORDER BY created_at DESC 
       LIMIT 100`
    );

    const data: TenantActivationKey[] = res.rows.map((r) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      tenantName: r.tenant_name,
      rawKey: r.activation_key,
      activationKey: formatEightDigits(r.activation_key),
      amountCharged: parseFloat(r.amount_charged || "0"),
      currency: r.currency || "INR",
      status: (r.status as TenantActivationKey["status"]) || "PENDING",
      createdAt: new Date(r.created_at).toLocaleString(),
      activatedAt: r.activated_at ? new Date(r.activated_at).toLocaleString() : undefined,
    }));

    return { success: true, data };
  } catch (err) {
    console.error("Failed to load keys from PostgreSQL:", err);
    return { success: false, data: [] };
  }
}

/**
 * Super Admin Action: Revoke an activation key.
 */
export async function revokeTenantKeyAction(
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await query(
      `UPDATE tenant_activation_keys 
       SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [keyId]
    );
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to revoke key.",
    };
  }
}
