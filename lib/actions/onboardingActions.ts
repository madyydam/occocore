"use server";

import { query } from "@/lib/db";

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

    const archetypeMap: Record<string, string> = {
      K12_SCHOOL: "K12_SCHOOL",
      DEGREE_COLLEGE: "DEGREE_COLLEGE",
      UNIVERSITY: "UNIVERSITY",
      COACHING_ACADEMY: "COACHING_ACADEMY",
    };
    const tenantType = archetypeMap[formData.archetype] || "K12_SCHOOL";

    const [firstName, ...restName] = formData.adminFullName.trim().split(" ");
    const lastName = restName.join(" ") || "Admin";

    // 1. Native PostgreSQL Upsert for Tenant
    const tenantRes = await query<{ id: string }>(
      `INSERT INTO tenants (
          name, slug, type, primary_color, motto, enabled_modules, affiliation_no, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          primary_color = EXCLUDED.primary_color,
          motto = EXCLUDED.motto,
          enabled_modules = EXCLUDED.enabled_modules,
          affiliation_no = EXCLUDED.affiliation_no,
          updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [
        formData.institutionName || "My Institute",
        slug,
        tenantType,
        formData.brandPrimaryColor || "#DC2626",
        formData.motto || "",
        JSON.stringify(formData.selectedModules || []),
        formData.affiliationBoard || "",
      ]
    );

    let tenantId = tenantRes.rows[0]?.id;
    if (!tenantId) {
      const fallbackRes = await query<{ id: string }>(
        `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      tenantId = fallbackRes.rows[0]?.id;
    }

    // 2. Native PostgreSQL Upsert for Admin User
    await query(
      `INSERT INTO users (
          tenant_id, email, first_name, last_name, password_hash, pin_hash, role, is_active, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id, email) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          password_hash = EXCLUDED.password_hash,
          pin_hash = EXCLUDED.pin_hash,
          role = EXCLUDED.role,
          is_active = TRUE,
          updated_at = CURRENT_TIMESTAMP`,
      [
        tenantId,
        formData.adminEmail.trim().toLowerCase(),
        firstName || "Admin",
        lastName,
        formData.adminPassword || "AdminPass@2026",
        formData.adminPin || "2468",
        "ADMIN",
      ]
    );

    // 3. Native PostgreSQL Upsert for Academic Year
    const yearTitle = formData.academicSession || "2026-2027";
    const yearRes = await query<{ id: string }>(
      `INSERT INTO academic_years (
          tenant_id, title, start_date, end_date, is_current
       ) VALUES ($1, $2, '2026-04-01'::date, '2027-03-31'::date, TRUE)
       ON CONFLICT (tenant_id, title) DO UPDATE SET
          is_current = TRUE
       RETURNING id`,
      [tenantId, yearTitle]
    );

    let academicYearId = yearRes.rows[0]?.id;
    if (!academicYearId) {
      const fallbackYear = await query<{ id: string }>(
        `SELECT id FROM academic_years WHERE tenant_id = $1 AND title = $2 LIMIT 1`,
        [tenantId, yearTitle]
      );
      academicYearId = fallbackYear.rows[0]?.id;
    }

    // 4. Default Class (e.g. Standard 10)
    let classId: string;
    const classCheck = await query<{ id: string }>(
      `SELECT id FROM classes WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, "Standard 10"]
    );
    if (classCheck.rows.length > 0) {
      classId = classCheck.rows[0].id;
    } else {
      const newClassRes = await query<{ id: string }>(
        `INSERT INTO classes (tenant_id, academic_year_id, name, numeric_level)
         VALUES ($1, $2, $3, 10)
         RETURNING id`,
        [tenantId, academicYearId, "Standard 10"]
      );
      classId = newClassRes.rows[0].id;
    }

    // 5. Default Section (Section A)
    let sectionId: string;
    const sectionCheck = await query<{ id: string }>(
      `SELECT id FROM sections WHERE tenant_id = $1 AND class_id = $2 AND name = $3 LIMIT 1`,
      [tenantId, classId, "Section A"]
    );
    if (sectionCheck.rows.length > 0) {
      sectionId = sectionCheck.rows[0].id;
    } else {
      const newSectionRes = await query<{ id: string }>(
        `INSERT INTO sections (tenant_id, class_id, name, capacity)
         VALUES ($1, $2, 'Section A', 40)
         RETURNING id`,
        [tenantId, classId]
      );
      sectionId = newSectionRes.rows[0].id;
    }

    // 6. Optional Roster Seeding
    if (formData.seedDemoData) {
      const sampleStudents = [
        { admissionNo: "SCH/2026/0101", roll: 1, first: "Aarav", last: "Patel", gender: "MALE" },
        { admissionNo: "SCH/2026/0102", roll: 2, first: "Diya", last: "Shah", gender: "FEMALE" },
        { admissionNo: "SCH/2026/0103", roll: 3, first: "Reyansh", last: "Mehta", gender: "MALE" },
        { admissionNo: "SCH/2026/0104", roll: 4, first: "Anvi", last: "Joshi", gender: "FEMALE" },
        { admissionNo: "SCH/2026/0105", roll: 5, first: "Vivaan", last: "Reddy", gender: "MALE" },
      ];

      for (const st of sampleStudents) {
        await query(
          `INSERT INTO students (
              tenant_id, section_id, admission_no, roll_no, first_name, last_name,
              dob, gender, is_active, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, '2011-06-15'::date, $7, TRUE, CURRENT_TIMESTAMP)
           ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
              roll_no = EXCLUDED.roll_no,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              updated_at = CURRENT_TIMESTAMP`,
          [tenantId, sectionId, st.admissionNo, st.roll, st.first, st.last, st.gender]
        );
      }
    }

    return {
      success: true,
      tenant: {
        id: tenantId,
        slug,
        name: formData.institutionName,
      },
    };
  } catch (error) {
    console.error("Failed to persist onboarding data to PostgreSQL via native SQL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save onboarding configuration to PostgreSQL database.",
    };
  }
}
