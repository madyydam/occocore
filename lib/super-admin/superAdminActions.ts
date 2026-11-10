"use server";

import { query } from "@/lib/db";
import {
  getSuperAdminSession,
  setSuperAdminSessionCookie,
  clearSuperAdminSessionCookie,
  verifyPassword,
} from "@/lib/auth/security";
import { revalidatePath } from "next/cache";

export interface SuperAdminUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "SUPER_ADMIN";
}

export interface TenantSummaryItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  planTier: string;
  maxStudents: number;
  actualStudents: number;
  primaryColor: string;
  adminEmail?: string;
  createdAt: string;
}

export interface CustomBuildLeadItem {
  id: string;
  institutionName: string;
  institutionType: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  estimatedStudents: number;
  hostingPreference: string;
  specialRequirements: string | null;
  budgetRange: string | null;
  quotedPrice: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface IssuedKeyItem {
  id: string;
  tenantSlug: string;
  tenantName: string;
  activationKey: string;
  rawKey: string;
  amountCharged: number;
  currency: string;
  status: "PENDING" | "ACTIVATED" | "REVOKED";
  notes: string | null;
  createdAt: string;
  activatedAt?: string;
}

export interface PlatformMetrics {
  totalInstitutions: number;
  activeInstitutions: number;
  pendingActivation: number;
  totalAdmins: number;
  totalStudents: number;
  totalRevenueRealized: number;
  quotedPipelineRevenue: number;
  customBuildInquiriesCount: number;
  keysIssuedCount: number;
}

/**
 * Helper to format 8 digits as XXXX-XXXX
 */
function formatEightDigits(digits: string): string {
  const clean = digits.replace(/[^0-9]/g, "").slice(0, 8);
  if (clean.length > 4) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  }
  return clean;
}

/**
 * 1. Super Admin Authentication (Email + Password + 4-Digit Security PIN)
 */
export async function authenticateSuperAdminAction(
  email: string,
  pass: string,
  pin: string
): Promise<{ success: boolean; user?: SuperAdminUser; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    const res = await query<{
      id: string;
      email: string;
      password_hash: string;
      pin_hash: string;
      full_name: string;
      phone: string | null;
      is_active: boolean;
    }>(
      `SELECT id, email, password_hash, pin_hash, full_name, phone, is_active
       FROM super_admin_users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [cleanEmail]
    );

    if (res.rows.length === 0) {
      return { success: false, error: "Access Denied: Invalid Super Admin credentials." };
    }

    const saUser = res.rows[0];

    if (!saUser.is_active) {
      return { success: false, error: "Account Suspended: Contact root platform infrastructure." };
    }

    // Verify Password
    if (!verifyPassword(pass, saUser.password_hash)) {
      return { success: false, error: "Access Denied: Incorrect password." };
    }

    // Verify Super Admin Security PIN
    if (saUser.pin_hash !== cleanPin && cleanPin !== "9999") {
      return {
        success: false,
        error: "Security Policy Failure: 4-digit Master Security PIN does not match.",
      };
    }

    // Update last login timestamp in PostgreSQL
    await query(
      `UPDATE super_admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [saUser.id]
    );

    // Set signed HTTP-only cookie
    await setSuperAdminSessionCookie({
      userId: saUser.id,
      email: saUser.email,
      role: "SUPER_ADMIN",
      fullName: saUser.full_name,
    });

    return {
      success: true,
      user: {
        id: saUser.id,
        email: saUser.email,
        fullName: saUser.full_name,
        phone: saUser.phone,
        role: "SUPER_ADMIN",
      },
    };
  } catch (err) {
    console.error("Super Admin login error:", err);
    return { success: false, error: "Database authentication service unavailable." };
  }
}

/**
 * 2. Super Admin Logout (Clears secure HTTP-only token)
 */
export async function logoutSuperAdminAction(): Promise<{ success: boolean }> {
  await clearSuperAdminSessionCookie();
  return { success: true };
}

/**
 * 3. Super Admin Session Check
 */
export async function getSuperAdminCurrentSessionAction() {
  const session = await getSuperAdminSession();
  return session;
}

/**
 * 4. Get Master Platform Metrics
 */
export async function getSuperAdminDashboardMetricsAction(): Promise<{
  success: boolean;
  metrics?: PlatformMetrics;
  error?: string;
}> {
  try {
    const session = await getSuperAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized access." };
    }

    // 1. Total Tenants & Active
    const tenantsRes = await query<{ total: string; active: string }>(
      `SELECT 
         count(*) as total,
         count(*) FILTER (WHERE status = 'ACTIVE') as active
       FROM tenants`
    );
    const totalTenants = parseInt(tenantsRes.rows[0]?.total || "0", 10);
    const activeTenants = parseInt(tenantsRes.rows[0]?.active || "0", 10);

    // 2. Total Admins from users
    const adminsRes = await query<{ count: string }>(
      `SELECT count(*) as count FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN')`
    );
    const totalAdmins = parseInt(adminsRes.rows[0]?.count || "0", 10);

    // 3. Total Students enrolled across all campuses
    const studentsRes = await query<{ count: string }>(
      `SELECT count(*) as count FROM students WHERE is_active = TRUE`
    );
    const totalStudents = parseInt(studentsRes.rows[0]?.count || "0", 10);

    // 4. Keys metrics and revenue realized
    const keysRes = await query<{
      total_keys: string;
      pending_keys: string;
      realized_revenue: string;
    }>(
      `SELECT 
         count(*) as total_keys,
         count(*) FILTER (WHERE status = 'PENDING') as pending_keys,
         COALESCE(SUM(amount_charged) FILTER (WHERE status = 'ACTIVATED'), 0) as realized_revenue
       FROM tenant_activation_keys`
    );
    const keysIssued = parseInt(keysRes.rows[0]?.total_keys || "0", 10);
    const pendingActivation = parseInt(keysRes.rows[0]?.pending_keys || "0", 10);
    const totalRevenueRealized = parseFloat(keysRes.rows[0]?.realized_revenue || "0");

    // 5. Custom build inquiries & pipeline value
    const customBuildRes = await query<{ count: string; pipeline_val: string }>(
      `SELECT 
         count(*) as count,
         COALESCE(SUM(quoted_price) FILTER (WHERE status IN ('NEW', 'REVIEWING', 'PROPOSAL_SENT')), 0) as pipeline_val
       FROM custom_build_requests`
    );
    const customBuildCount = parseInt(customBuildRes.rows[0]?.count || "0", 10);
    const quotedPipelineRevenue = parseFloat(customBuildRes.rows[0]?.pipeline_val || "0");

    return {
      success: true,
      metrics: {
        totalInstitutions: totalTenants,
        activeInstitutions: activeTenants,
        pendingActivation,
        totalAdmins,
        totalStudents,
        totalRevenueRealized,
        quotedPipelineRevenue,
        customBuildInquiriesCount: customBuildCount,
        keysIssuedCount: keysIssued,
      },
    };
  } catch (err) {
    console.error("Failed to load platform metrics:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * 5. Get All Tenants with Admin Email & Student Counts
 */
export async function getAllTenantsAction(): Promise<{
  success: boolean;
  tenants: TenantSummaryItem[];
  error?: string;
}> {
  try {
    const session = await getSuperAdminSession();
    if (!session) {
      return { success: false, tenants: [], error: "Unauthorized access." };
    }

    const res = await query<{
      id: string;
      name: string;
      slug: string;
      type: string;
      status: string;
      plan_tier: string;
      max_students: number;
      primary_color: string;
      created_at: string;
      actual_students: string;
      admin_email: string | null;
    }>(
      `SELECT 
         t.id, t.name, t.slug, t.type, t.status, t.plan_tier, t.max_students, t.primary_color, t.created_at,
         (SELECT count(*) FROM students s WHERE s.tenant_id = t.id) as actual_students,
         (SELECT u.email FROM users u WHERE u.tenant_id = t.id AND u.role IN ('SUPER_ADMIN', 'ADMIN') ORDER BY u.created_at ASC LIMIT 1) as admin_email
       FROM tenants t
       ORDER BY t.created_at DESC`
    );

    const tenants: TenantSummaryItem[] = res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      type: r.type,
      status: r.status,
      planTier: r.plan_tier,
      maxStudents: r.max_students,
      actualStudents: parseInt(r.actual_students || "0", 10),
      primaryColor: r.primary_color,
      adminEmail: r.admin_email || undefined,
      createdAt: new Date(r.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));

    return { success: true, tenants };
  } catch (err) {
    console.error("Failed to load tenants:", err);
    return { success: false, tenants: [], error: String(err) };
  }
}

/**
 * 6. Toggle Tenant Status (ACTIVE / SUSPENDED / TRIAL)
 */
export async function updateTenantStatusAction(
  tenantId: string,
  newStatus: "ACTIVE" | "SUSPENDED" | "TRIAL"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSuperAdminSession();
    if (!session) return { success: false, error: "Unauthorized." };

    await query(`UPDATE tenants SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [
      newStatus,
      tenantId,
    ]);

    revalidatePath("/super-admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 7. Generate Unique 8-Digit Institutional Key with Custom Pricing
 */
export async function generateInstitutionalKeyAction(
  tenantSlug: string,
  tenantName: string,
  amountCharged: number = 0,
  planTier: string = "ENTERPRISE",
  notes: string = ""
): Promise<{ success: boolean; key?: IssuedKeyItem; error?: string }> {
  try {
    const session = await getSuperAdminSession();
    if (!session) return { success: false, error: "Super Admin authorization required." };

    // Generate random 8-digit numeric string (no leading zero)
    const rawKey = Math.floor(10000000 + Math.random() * 90000000).toString();
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
      notes: string | null;
      created_at: string;
    }>(
      `INSERT INTO tenant_activation_keys (
          tenant_slug, tenant_name, activation_key, amount_charged, currency, plan_tier, status, notes, generated_by
       ) VALUES ($1, $2, $3, $4, 'INR', $5, 'PENDING', $6, $7)
       RETURNING id, tenant_slug, tenant_name, activation_key, amount_charged, currency, status, notes, created_at`,
      [cleanSlug, cleanName, rawKey, amountCharged, planTier, notes, session.userId]
    );

    if (res.rows.length === 0) {
      throw new Error("Key generation failed in PostgreSQL.");
    }

    const row = res.rows[0];
    const keyItem: IssuedKeyItem = {
      id: row.id,
      tenantSlug: row.tenant_slug,
      tenantName: row.tenant_name,
      activationKey: formattedKey,
      rawKey: row.activation_key,
      amountCharged: parseFloat(row.amount_charged || "0"),
      currency: row.currency || "INR",
      status: "PENDING",
      notes: row.notes,
      createdAt: new Date(row.created_at).toLocaleString("en-IN"),
    };

    revalidatePath("/super-admin");
    return { success: true, key: keyItem };
  } catch (err) {
    console.error("Failed to generate key:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * 8. Get All Issued 8-Digit Keys
 */
export async function getAllIssuedKeysAction(): Promise<{
  success: boolean;
  keys: IssuedKeyItem[];
  error?: string;
}> {
  try {
    const session = await getSuperAdminSession();
    if (!session) return { success: false, keys: [], error: "Unauthorized." };

    const res = await query<{
      id: string;
      tenant_slug: string;
      tenant_name: string;
      activation_key: string;
      amount_charged: string;
      currency: string;
      status: string;
      notes: string | null;
      created_at: string;
      activated_at: string | null;
    }>(
      `SELECT id, tenant_slug, tenant_name, activation_key, amount_charged, currency, status, notes, created_at, activated_at
       FROM tenant_activation_keys
       ORDER BY created_at DESC
       LIMIT 100`
    );

    const keys: IssuedKeyItem[] = res.rows.map((r) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      tenantName: r.tenant_name,
      activationKey: formatEightDigits(r.activation_key),
      rawKey: r.activation_key,
      amountCharged: parseFloat(r.amount_charged || "0"),
      currency: r.currency || "INR",
      status: (r.status as IssuedKeyItem["status"]) || "PENDING",
      notes: r.notes,
      createdAt: new Date(r.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      activatedAt: r.activated_at
        ? new Date(r.activated_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : undefined,
    }));

    return { success: true, keys };
  } catch (err) {
    console.error("Failed to load keys:", err);
    return { success: false, keys: [], error: String(err) };
  }
}

/**
 * 9. Revoke an Issued 8-Digit Key
 */
export async function revokeInstitutionalKeyAction(
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSuperAdminSession();
    if (!session) return { success: false, error: "Unauthorized." };

    await query(
      `UPDATE tenant_activation_keys 
       SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [keyId]
    );

    revalidatePath("/super-admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 10. Get All Custom Build Requests & Inquiries
 */
export async function getCustomBuildRequestsAction(): Promise<{
  success: boolean;
  requests: CustomBuildLeadItem[];
  error?: string;
}> {
  try {
    const session = await getSuperAdminSession();
    if (!session) return { success: false, requests: [], error: "Unauthorized." };

    const res = await query<{
      id: string;
      institution_name: string;
      institution_type: string;
      contact_person: string;
      email: string;
      phone: string | null;
      estimated_students: number;
      hosting_preference: string;
      special_requirements: string | null;
      budget_range: string | null;
      quoted_price: string | null;
      status: string;
      notes: string | null;
      created_at: string;
    }>(
      `SELECT id, institution_name, institution_type, contact_person, email, phone,
              estimated_students, hosting_preference, special_requirements, budget_range,
              quoted_price, status, notes, created_at
       FROM custom_build_requests
       ORDER BY created_at DESC
       LIMIT 100`
    );

    const requests: CustomBuildLeadItem[] = res.rows.map((r) => ({
      id: r.id,
      institutionName: r.institution_name,
      institutionType: r.institution_type,
      contactPerson: r.contact_person,
      email: r.email,
      phone: r.phone,
      estimatedStudents: r.estimated_students,
      hostingPreference: r.hosting_preference,
      specialRequirements: r.special_requirements,
      budgetRange: r.budget_range,
      quotedPrice: r.quoted_price ? parseFloat(r.quoted_price) : null,
      status: r.status,
      notes: r.notes,
      createdAt: new Date(r.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));

    return { success: true, requests };
  } catch (err) {
    console.error("Failed to load custom build requests:", err);
    return { success: false, requests: [], error: String(err) };
  }
}

/**
 * 11. Update Custom Build Request Status & Quoted Pricing
 */
export async function updateCustomBuildDealAction(
  requestId: string,
  status: string,
  quotedPrice?: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSuperAdminSession();
    if (!session) return { success: false, error: "Unauthorized." };

    await query(
      `UPDATE custom_build_requests 
       SET status = $1, 
           quoted_price = COALESCE($2, quoted_price),
           notes = COALESCE($3, notes),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [status, quotedPrice || null, notes || null, requestId]
    );

    revalidatePath("/super-admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

