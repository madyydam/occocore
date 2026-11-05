"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  type: string;
  primaryColor: string;
  secondaryColor: string;
  motto: string;
  enabledModules: string[];
}

export async function getTenantConfig(): Promise<TenantConfig | null> {
  try {
    const res = await query<{
      id: string;
      name: string;
      slug: string;
      type: string;
      primary_color: string;
      secondary_color: string;
      motto: string | null;
      enabled_modules: unknown;
    }>(
      `SELECT id, name, slug, type, primary_color, secondary_color, motto, enabled_modules
       FROM tenants
       WHERE slug = $1
       LIMIT 1`,
      ["apexacademy"]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const enabledModules = Array.isArray(row.enabled_modules)
      ? (row.enabled_modules as string[])
      : ["dashboard", "admissions", "academics", "attendance", "fees", "exams", "communication", "roles", "settings"];

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.type,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      motto: row.motto || "",
      enabledModules,
    };
  } catch (error) {
    console.error("Failed to fetch tenant config from PostgreSQL via native SQL:", error);
    return null;
  }
}

export async function updateTenantBranding(data: {
  name?: string;
  primaryColor?: string;
  motto?: string;
  enabledModules?: string[];
  type?: string;
}) {
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.primaryColor !== undefined) {
      fields.push(`primary_color = $${idx++}`);
      values.push(data.primaryColor);
    }
    if (data.motto !== undefined) {
      fields.push(`motto = $${idx++}`);
      values.push(data.motto);
    }
    if (data.enabledModules !== undefined) {
      fields.push(`enabled_modules = $${idx++}`);
      values.push(JSON.stringify(data.enabledModules));
    }
    if (data.type !== undefined) {
      fields.push(`type = $${idx++}`);
      values.push(data.type);
    }

    if (fields.length === 0) {
      return { success: true };
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push("apexacademy"); // for slug WHERE condition

    const sql = `
      UPDATE tenants
      SET ${fields.join(", ")}
      WHERE slug = $${idx}
      RETURNING id, name, slug, type, primary_color, secondary_color, motto, enabled_modules
    `;

    const res = await query(sql, values);

    try {
      revalidatePath("/admin");
    } catch {
      // ignore when outside Next.js request context
    }

    return { success: true, tenant: res.rows[0] };
  } catch (error) {
    console.error("Failed to update tenant branding in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}
