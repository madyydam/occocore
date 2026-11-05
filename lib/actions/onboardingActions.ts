"use server";

import prisma from "@/lib/prisma";
import { TenantType, UserRole, Gender } from "@prisma/client";

export async function saveOnboardingToDatabase(formData: {
  institutionName: string;
  archetype: string;
  affiliationBoard?: string;
  brandPrimaryColor: string;
  motto?: string;
  subdomain: string;
  adminFullName: string;
  adminEmail: string;
  adminPassword: string;
  adminPin: string;
  selectedModules: string[];
  academicSession?: string;
  startMonth?: string;
  seedDemoData?: boolean;
}) {
  try {
    const slug = formData.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "my-institute";

    const archetypeMap: Record<string, TenantType> = {
      K12_SCHOOL: TenantType.K12_SCHOOL,
      DEGREE_COLLEGE: TenantType.DEGREE_COLLEGE,
      UNIVERSITY: TenantType.UNIVERSITY,
      COACHING_ACADEMY: TenantType.COACHING_ACADEMY,
    };
    const tenantType = archetypeMap[formData.archetype] || TenantType.K12_SCHOOL;

    const [firstName, ...restName] = formData.adminFullName.trim().split(" ");
    const lastName = restName.join(" ") || "Admin";

    // Create or update Tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug },
      update: {
        name: formData.institutionName || "My Institute",
        type: tenantType,
        primary_color: formData.brandPrimaryColor || "#DC2626",
        motto: formData.motto || "",
        enabled_modules: formData.selectedModules || [],
        affiliation_no: formData.affiliationBoard || "",
      },
      create: {
        name: formData.institutionName || "My Institute",
        slug,
        type: tenantType,
        primary_color: formData.brandPrimaryColor || "#DC2626",
        motto: formData.motto || "",
        enabled_modules: formData.selectedModules || [],
        affiliation_no: formData.affiliationBoard || "",
      },
    });

    // Create or update Admin User
    await prisma.user.upsert({
      where: {
        tenant_id_email: {
          tenant_id: tenant.id,
          email: formData.adminEmail.trim().toLowerCase(),
        },
      },
      update: {
        first_name: firstName || "Admin",
        last_name: lastName,
        password_hash: formData.adminPassword || "AdminPass@2026",
        pin_hash: formData.adminPin || "2468",
        role: UserRole.ADMIN,
      },
      create: {
        tenant_id: tenant.id,
        email: formData.adminEmail.trim().toLowerCase(),
        first_name: firstName || "Admin",
        last_name: lastName,
        password_hash: formData.adminPassword || "AdminPass@2026",
        pin_hash: formData.adminPin || "2468",
        role: UserRole.ADMIN,
      },
    });

    // Create Academic Year
    const yearTitle = formData.academicSession || "2026-2027";
    const academicYear = await prisma.academicYear.upsert({
      where: {
        tenant_id_title: {
          tenant_id: tenant.id,
          title: yearTitle,
        },
      },
      update: { is_current: true },
      create: {
        tenant_id: tenant.id,
        title: yearTitle,
        start_date: new Date("2026-04-01"),
        end_date: new Date("2027-03-31"),
        is_current: true,
      },
    });

    // Create base Class & Section
    let defaultClass = await prisma.class.findFirst({
      where: { tenant_id: tenant.id, name: "Class 10" },
    });
    if (!defaultClass) {
      defaultClass = await prisma.class.create({
        data: {
          tenant_id: tenant.id,
          academic_year_id: academicYear.id,
          name: "Class 10",
          numeric_level: 10,
        },
      });
    }

    let defaultSection = await prisma.section.findFirst({
      where: { tenant_id: tenant.id, class_id: defaultClass.id, name: "Section A" },
    });
    if (!defaultSection) {
      defaultSection = await prisma.section.create({
        data: {
          tenant_id: tenant.id,
          class_id: defaultClass.id,
          name: "Section A",
          capacity: 40,
        },
      });
    }

    // Pre-seed sample students if requested
    if (formData.seedDemoData) {
      const sampleStudents = [
        { adm: `${slug.toUpperCase()}/2026/01`, roll: 1, fn: "Aarav", ln: "Sharma", gen: Gender.MALE },
        { adm: `${slug.toUpperCase()}/2026/02`, roll: 2, fn: "Ananya", ln: "Deshmukh", gen: Gender.FEMALE },
        { adm: `${slug.toUpperCase()}/2026/03`, roll: 3, fn: "Rohan", ln: "Kulkarni", gen: Gender.MALE },
      ];

      for (const s of sampleStudents) {
        await prisma.student.upsert({
          where: {
            tenant_id_admission_no: {
              tenant_id: tenant.id,
              admission_no: s.adm,
            },
          },
          update: { roll_no: s.roll, first_name: s.fn, last_name: s.ln },
          create: {
            tenant_id: tenant.id,
            section_id: defaultSection.id,
            admission_no: s.adm,
            roll_no: s.roll,
            first_name: s.fn,
            last_name: s.ln,
            gender: s.gen,
            dob: new Date("2011-05-15"),
          },
        });
      }
    }

    return {
      success: true,
      tenantId: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      primaryColor: tenant.primary_color,
    };
  } catch (error) {
    console.error("Error creating tenant onboarding in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}
