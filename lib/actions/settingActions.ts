"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  IdNumberingFormatConfig,
  DEFAULT_ID_NUMBERING_CONFIG,
  buildPrnString,
  buildRollNoString,
} from "@/lib/utils/idFormatUtils";

export type { IdNumberingFormatConfig };

export interface TenantDomainRecord {
  id: string;
  domain: string;
  isVerified: boolean;
  sslStatus: string;
  createdAt: string;
}

export interface TenantSettingsData {
  id: string;
  name: string;
  slug: string;
  type: string;
  primaryColor: string;
  secondaryColor: string;
  motto: string;
  customDomain: string;
  domainVerified: boolean;
  affiliationNo: string;
  udiseCode: string;
  aisheCode: string;
  gstin: string;
  executiveHead: string;
  registeredAddress: string;
  idNumberingConfig: IdNumberingFormatConfig;
  domains: TenantDomainRecord[];
}

export async function getTenantSettingsAction(
  slug: string = "apexacademy"
): Promise<{ success: boolean; data?: TenantSettingsData; error?: string }> {
  try {
    const tenantRes = await query<{
      id: string;
      name: string;
      slug: string;
      type: string;
      primary_color: string;
      secondary_color: string;
      motto: string | null;
      custom_domain: string | null;
      domain_verified: boolean;
      affiliation_no: string | null;
      udise_code: string | null;
      aishe_code: string | null;
      gstin: string | null;
      feature_flags: Record<string, unknown> | null;
    }>(
      `SELECT id, name, slug, type, primary_color, secondary_color, motto, 
              custom_domain, domain_verified, affiliation_no, udise_code, aishe_code, gstin, feature_flags
       FROM tenants
       WHERE slug = $1
       LIMIT 1`,
      [slug]
    );

    if (tenantRes.rows.length === 0) {
      return { success: false, error: `Tenant with slug '${slug}' not found.` };
    }

    const t = tenantRes.rows[0];
    const flags = (t.feature_flags && typeof t.feature_flags === "object") ? t.feature_flags : {};

    const domainsRes = await query<{
      id: string;
      domain: string;
      is_verified: boolean;
      ssl_status: string;
      created_at: string;
    }>(
      `SELECT id, domain, is_verified, ssl_status, created_at
       FROM tenant_domains
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [t.id]
    );

    const domains: TenantDomainRecord[] = domainsRes.rows.map((d) => ({
      id: d.id,
      domain: d.domain,
      isVerified: d.is_verified,
      sslStatus: d.ssl_status,
      createdAt: String(d.created_at),
    }));

    return {
      success: true,
      data: {
        id: t.id,
        name: t.name || "",
        slug: t.slug,
        type: t.type,
        primaryColor: t.primary_color || "#DC2626",
        secondaryColor: t.secondary_color || "#091D17",
        motto: t.motto || "",
        customDomain: t.custom_domain || "",
        domainVerified: Boolean(t.domain_verified),
        affiliationNo: t.affiliation_no || "",
        udiseCode: t.udise_code || "",
        aisheCode: t.aishe_code || "",
        gstin: t.gstin || "",
        executiveHead: (flags.executive_head as string) || "",
        registeredAddress: (flags.registered_address as string) || "",
        idNumberingConfig: (flags.id_numbering_config as IdNumberingFormatConfig) || DEFAULT_ID_NUMBERING_CONFIG,
        domains,
      },
    };
  } catch (error) {
    console.error("Error fetching tenant settings from PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateTenantSettingsAction(data: {
  slug?: string;
  name?: string;
  affiliationNo?: string;
  motto?: string;
  primaryColor?: string;
  executiveHead?: string;
  registeredAddress?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const slug = data.slug || "apexacademy";

    const tenantRes = await query<{ id: string; feature_flags: Record<string, unknown> | null }>(
      `SELECT id, feature_flags FROM tenants WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (tenantRes.rows.length === 0) {
      return { success: false, error: `Tenant '${slug}' not found.` };
    }

    const tenantId = tenantRes.rows[0].id;
    const currentFlags = (tenantRes.rows[0].feature_flags && typeof tenantRes.rows[0].feature_flags === "object")
      ? tenantRes.rows[0].feature_flags
      : {};

    const updatedFlags = {
      ...currentFlags,
      ...(data.executiveHead !== undefined ? { executive_head: data.executiveHead } : {}),
      ...(data.registeredAddress !== undefined ? { registered_address: data.registeredAddress } : {}),
    };

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.affiliationNo !== undefined) {
      updates.push(`affiliation_no = $${idx++}`);
      values.push(data.affiliationNo);
    }
    if (data.motto !== undefined) {
      updates.push(`motto = $${idx++}`);
      values.push(data.motto);
    }
    if (data.primaryColor !== undefined) {
      updates.push(`primary_color = $${idx++}`);
      values.push(data.primaryColor);
    }

    updates.push(`feature_flags = $${idx++}`);
    values.push(JSON.stringify(updatedFlags));

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(tenantId);
    const sql = `
      UPDATE tenants
      SET ${updates.join(", ")}
      WHERE id = $${idx}
      RETURNING id, name
    `;

    await query(sql, values);

    // DPDPA & CERT-In compliant audit log
    await query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        tenantId,
        "SETTINGS_UPDATE",
        "TENANT",
        tenantId,
        JSON.stringify({
          name: data.name,
          affiliation_no: data.affiliationNo,
          motto: data.motto,
          primary_color: data.primaryColor,
        }),
      ]
    );

    try {
      revalidatePath("/admin");
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating tenant settings in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function verifyTenantDomainAction(data: {
  slug?: string;
  domain: string;
}): Promise<{ success: boolean; isVerified: boolean; error?: string }> {
  try {
    const slug = data.slug || "apexacademy";
    const domain = data.domain.trim().toLowerCase();

    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (tenantRes.rows.length === 0) {
      return { success: false, isVerified: false, error: `Tenant '${slug}' not found.` };
    }

    const tenantId = tenantRes.rows[0].id;

    // Record in tenant_domains
    await query(
      `INSERT INTO tenant_domains (tenant_id, domain, is_verified, ssl_status)
       VALUES ($1, $2, TRUE, 'ACTIVE')
       ON CONFLICT (domain) DO UPDATE SET is_verified = TRUE, ssl_status = 'ACTIVE'`,
      [tenantId, domain]
    );

    // Update primary custom domain on tenant
    await query(
      `UPDATE tenants
       SET custom_domain = $1, domain_verified = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [domain, tenantId]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        tenantId,
        "DOMAIN_VERIFIED",
        "TENANT_DOMAIN",
        domain,
        JSON.stringify({ domain, is_verified: true, ssl_status: "ACTIVE" }),
      ]
    );

    try {
      revalidatePath("/admin");
    } catch {
      // ignore
    }

    return { success: true, isVerified: true };
  } catch (error) {
    console.error("Error verifying domain in PostgreSQL:", error);
    return { success: false, isVerified: false, error: String(error) };
  }
}

export async function updateIdNumberingConfigAction(data: {
  slug?: string;
  config: IdNumberingFormatConfig;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const slug = data.slug || "apexacademy";

    const tenantRes = await query<{ id: string; feature_flags: Record<string, unknown> | null }>(
      `SELECT id, feature_flags FROM tenants WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (tenantRes.rows.length === 0) {
      return { success: false, error: `Tenant '${slug}' not found.` };
    }

    const tenantId = tenantRes.rows[0].id;
    const currentFlags = (tenantRes.rows[0].feature_flags && typeof tenantRes.rows[0].feature_flags === "object")
      ? tenantRes.rows[0].feature_flags
      : {};

    const updatedFlags = {
      ...currentFlags,
      id_numbering_config: data.config,
    };

    await query(
      `UPDATE tenants SET feature_flags = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [JSON.stringify(updatedFlags), tenantId]
    );

    try {
      revalidatePath("/admin");
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update ID numbering config in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function applyIdNumberingToExistingStudentsAction(slug: string = "apexacademy"): Promise<{
  success: boolean;
  updatedCount: number;
  previewSamples: { admissionNo: string; oldRoll: string; newRoll: string; oldPrn: string; newPrn: string }[];
  error?: string;
}> {
  try {
    const tenantRes = await query<{ id: string; feature_flags: Record<string, unknown> | null }>(
      `SELECT id, feature_flags FROM tenants WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (tenantRes.rows.length === 0) {
      return { success: false, updatedCount: 0, previewSamples: [], error: `Tenant '${slug}' not found.` };
    }

    const tenantId = tenantRes.rows[0].id;
    const flags = (tenantRes.rows[0].feature_flags && typeof tenantRes.rows[0].feature_flags === "object")
      ? tenantRes.rows[0].feature_flags
      : {};

    const config: IdNumberingFormatConfig =
      (flags.id_numbering_config as IdNumberingFormatConfig) || DEFAULT_ID_NUMBERING_CONFIG;

    const studentsRes = await query<{
      id: string;
      admission_no: string;
      roll_no: string | null;
      prn: string | null;
      class_name: string;
      section_name: string;
    }>(
      `SELECT s.id, s.admission_no, s.roll_no, s.prn, c.name AS class_name, sec.name AS section_name
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       WHERE s.tenant_id = $1
       ORDER BY s.admission_no ASC`,
      [tenantId]
    );

    const previewSamples: { admissionNo: string; oldRoll: string; newRoll: string; oldPrn: string; newPrn: string }[] = [];
    let seq = 1;

    for (const stu of studentsRes.rows) {
      const newRoll = buildRollNoString(config.rollNo, {
        year: 2026,
        cohort: `${stu.class_name}-${stu.section_name}`,
        seq,
      });

      const newPrn = buildPrnString(config.prn, {
        year: 2026,
        dept: "CSE",
        seq,
      });

      await query(
        `UPDATE students SET roll_no = $1, prn = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [newRoll, newPrn, stu.id]
      );

      if (previewSamples.length < 5) {
        previewSamples.push({
          admissionNo: stu.admission_no,
          oldRoll: stu.roll_no || "None",
          newRoll,
          oldPrn: stu.prn || "None",
          newPrn,
        });
      }
      seq++;
    }

    try {
      revalidatePath("/admin");
      revalidatePath("/student");
    } catch {
      // ignore
    }

    return {
      success: true,
      updatedCount: studentsRes.rows.length,
      previewSamples,
    };
  } catch (error) {
    console.error("Failed to apply ID numbering to existing students:", error);
    return { success: false, updatedCount: 0, previewSamples: [], error: String(error) };
  }
}

