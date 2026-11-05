"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsersList() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apexacademy" },
    });
    if (!tenant) return [];

    const users = await prisma.user.findMany({
      where: { tenant_id: tenant.id },
      orderBy: { created_at: "asc" },
    });

    return users.map((u) => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      role: u.role,
      roleKey: u.role,
      status: u.is_active ? "ACTIVE" : "LOCKED",
      password: u.password_hash,
      pin: u.pin_hash || "2468",
      mustChangePinOnLogin: u.must_change_pin_on_login,
      lastLogin: u.last_login_at ? u.last_login_at.toISOString() : "Never",
    }));
  } catch (error) {
    console.error("Failed to fetch users from PostgreSQL:", error);
    return [];
  }
}

export async function updateUserCredentials(userId: string, data: {
  password?: string;
  pin?: string;
  status?: "ACTIVE" | "LOCKED" | "PENDING_FIRST_LOGIN";
  mustChangePinOnLogin?: boolean;
}) {
  try {
    const updatePayload: Record<string, unknown> = {};
    if (data.password) updatePayload.password_hash = data.password;
    if (data.pin) updatePayload.pin_hash = data.pin;
    if (data.status) updatePayload.is_active = data.status === "ACTIVE";
    if (data.mustChangePinOnLogin !== undefined) {
      updatePayload.must_change_pin_on_login = data.mustChangePinOnLogin;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    try {
      revalidatePath("/admin/roles");
    } catch {
      // ignore when outside request context
    }
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Failed to update user credentials in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function authenticateRealUser(email: string, pass: string, pin: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase() },
      include: { tenant: true },
    });

    if (!user) {
      return { success: false, error: "No user found with this email." };
    }

    if (user.password_hash !== pass) {
      return { success: false, error: "Incorrect password." };
    }

    if (user.pin_hash && user.pin_hash !== pin) {
      return { success: false, error: "Security Policy Violation: 4-digit Security PIN does not match." };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
      },
    };
  } catch (error) {
    console.error("Authentication error in PostgreSQL:", error);
    return { success: false, error: "Authentication system error." };
  }
}
