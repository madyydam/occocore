"use server";

import prisma from "@/lib/prisma";
import { TenantType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getTenantConfig() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apexacademy" },
    });
    if (!tenant) return null;
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      type: tenant.type,
      primaryColor: tenant.primary_color,
      secondaryColor: tenant.secondary_color,
      motto: tenant.motto || "",
      enabledModules: Array.isArray(tenant.enabled_modules)
        ? (tenant.enabled_modules as string[])
        : ["dashboard", "admissions", "academics", "attendance", "fees", "exams", "communication", "roles", "settings"],
    };
  } catch (error) {
    console.error("Failed to fetch tenant config from PostgreSQL:", error);
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
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.primaryColor) updateData.primary_color = data.primaryColor;
    if (data.motto !== undefined) updateData.motto = data.motto;
    if (data.enabledModules) updateData.enabled_modules = data.enabledModules;
    if (data.type) updateData.type = data.type as TenantType;

    const tenant = await prisma.tenant.update({
      where: { slug: "apexacademy" },
      data: updateData,
    });

    try {
      revalidatePath("/admin");
    } catch {
      // ignore when outside request context
    }
    return { success: true, tenant };
  } catch (error) {
    console.error("Failed to update tenant branding in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}
