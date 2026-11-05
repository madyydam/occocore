"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUsersList() {
  try {
    const res = await query<{
      id: string;
      email: string;
      phone: string | null;
      password_hash: string;
      pin_hash: string | null;
      role: string;
      first_name: string;
      last_name: string;
      is_active: boolean;
      must_change_pin_on_login: boolean;
      last_login_at: Date | null;
    }>(
      `SELECT u.id, u.email, u.phone, u.password_hash, u.pin_hash, u.role,
              u.first_name, u.last_name, u.is_active, u.must_change_pin_on_login, u.last_login_at
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE t.slug = $1
       ORDER BY u.created_at ASC`,
      ["apexacademy"]
    );

    return res.rows.map((u) => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      role: u.role,
      roleKey: u.role,
      status: u.is_active ? ("ACTIVE" as const) : ("LOCKED" as const),
      password: u.password_hash,
      pin: u.pin_hash || "2468",
      mustChangePinOnLogin: u.must_change_pin_on_login,
      lastLogin: u.last_login_at ? u.last_login_at.toISOString() : "Never",
    }));
  } catch (error) {
    console.error("Failed to fetch users from PostgreSQL via native SQL:", error);
    return [];
  }
}

export async function updateUserCredentials(
  userId: string,
  data: {
    password?: string;
    pin?: string;
    status?: "ACTIVE" | "LOCKED" | "PENDING_FIRST_LOGIN";
    mustChangePinOnLogin?: boolean;
  }
) {
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.password !== undefined) {
      fields.push(`password_hash = $${idx++}`);
      values.push(data.password);
    }
    if (data.pin !== undefined) {
      fields.push(`pin_hash = $${idx++}`);
      values.push(data.pin);
    }
    if (data.status !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(data.status === "ACTIVE");
    }
    if (data.mustChangePinOnLogin !== undefined) {
      fields.push(`must_change_pin_on_login = $${idx++}`);
      values.push(data.mustChangePinOnLogin);
    }

    if (fields.length === 0) {
      return { success: true };
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const sql = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, email, first_name, last_name, role, is_active
    `;

    const res = await query(sql, values);

    try {
      revalidatePath("/admin/roles");
    } catch {
      // ignore when outside request context
    }

    return { success: true, user: res.rows[0] };
  } catch (error) {
    console.error("Failed to update user credentials in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function authenticateRealUser(email: string, pass: string, pin: string) {
  try {
    const res = await query<{
      id: string;
      tenant_id: string;
      email: string;
      password_hash: string;
      pin_hash: string | null;
      role: string;
      first_name: string;
      last_name: string;
      is_active: boolean;
      tenant_name: string;
      tenant_slug: string;
      tenant_type: string;
      primary_color: string;
    }>(
      `SELECT u.id, u.tenant_id, u.email, u.password_hash, u.pin_hash, u.role,
              u.first_name, u.last_name, u.is_active,
              t.name AS tenant_name, t.slug AS tenant_slug, t.type AS tenant_type, t.primary_color
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE LOWER(u.email) = LOWER($1)
       LIMIT 1`,
      [email.trim()]
    );

    if (res.rows.length === 0) {
      return { success: false, error: "No user found with this email." };
    }

    const user = res.rows[0];

    if (!user.is_active) {
      return { success: false, error: "Your account has been locked. Please contact your Super Administrator." };
    }

    if (user.password_hash !== pass) {
      return { success: false, error: "Incorrect password." };
    }

    if (user.pin_hash && user.pin_hash !== pin) {
      return {
        success: false,
        error: "Security Policy Violation: 4-digit Security PIN does not match.",
      };
    }

    // Update last login timestamp in PostgreSQL
    await query(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    return {
      success: true,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name,
        tenantSlug: user.tenant_slug,
        tenantType: user.tenant_type,
        primaryColor: user.primary_color,
      },
    };
  } catch (error) {
    console.error("Authentication error in PostgreSQL via native SQL:", error);
    return { success: false, error: "Database error occurred during authentication." };
  }
}
