"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface StudentInputPayload {
  admissionNo: string;
  rollNo?: number;
  firstName: string;
  lastName: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  guardianName?: string;
  emergencyPhone?: string;
  dob?: string;
}

export async function quickAddStudentAction(data: StudentInputPayload) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found." };
    const tenantId = tenantRes.rows[0].id;

    // Find default section (Section A of Class 10)
    const sectionRes = await query<{ id: string }>(
      `SELECT s.id
       FROM sections s
       JOIN classes c ON s.class_id = c.id
       WHERE s.tenant_id = $1 AND s.name = 'Section A'
       LIMIT 1`,
      [tenantId]
    );

    let sectionId = sectionRes.rows[0]?.id;
    if (!sectionId) {
      const anySection = await query<{ id: string }>(
        `SELECT id FROM sections WHERE tenant_id = $1 LIMIT 1`,
        [tenantId]
      );
      sectionId = anySection.rows[0]?.id;
    }

    if (!sectionId) {
      return { success: false, error: "No class section available in the database. Please initialize classes first." };
    }

    const rollNo = Number(data.rollNo) || null;
    const dob = data.dob || "2011-05-15";
    const gender = data.gender || "MALE";

    const insertRes = await query<{ id: string }>(
      `INSERT INTO students (
          tenant_id,
          section_id,
          admission_no,
          roll_no,
          first_name,
          last_name,
          dob,
          gender,
          guardian_name,
          emergency_phone,
          is_active,
          updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
          roll_no = EXCLUDED.roll_no,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          gender = EXCLUDED.gender,
          guardian_name = EXCLUDED.guardian_name,
          emergency_phone = EXCLUDED.emergency_phone,
          updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [
        tenantId,
        sectionId,
        data.admissionNo.trim(),
        rollNo,
        data.firstName.trim(),
        data.lastName.trim(),
        dob,
        gender,
        data.guardianName ? data.guardianName.trim() : null,
        data.emergencyPhone ? data.emergencyPhone.trim() : null,
      ]
    );

    try {
      revalidatePath("/admin");
    } catch {
      // outside request context
    }

    return { success: true, studentId: insertRes.rows[0]?.id };
  } catch (error) {
    console.error("Failed to add student to PostgreSQL:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add student record." };
  }
}

export async function bulkImportStudentsAction(students: StudentInputPayload[]) {
  try {
    if (!students || students.length === 0) {
      return { success: false, error: "No student records provided for import." };
    }

    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found." };
    const tenantId = tenantRes.rows[0].id;

    const sectionRes = await query<{ id: string }>(
      `SELECT s.id
       FROM sections s
       JOIN classes c ON s.class_id = c.id
       WHERE s.tenant_id = $1 AND s.name = 'Section A'
       LIMIT 1`,
      [tenantId]
    );

    let sectionId = sectionRes.rows[0]?.id;
    if (!sectionId) {
      const anySection = await query<{ id: string }>(
        `SELECT id FROM sections WHERE tenant_id = $1 LIMIT 1`,
        [tenantId]
      );
      sectionId = anySection.rows[0]?.id;
    }

    if (!sectionId) {
      return { success: false, error: "No class section available in the database." };
    }

    let insertedCount = 0;

    for (const st of students) {
      if (!st.admissionNo || !st.firstName) continue;

      const rollNo = Number(st.rollNo) || null;
      const dob = st.dob || "2011-05-15";
      const gender = st.gender || "MALE";

      await query(
        `INSERT INTO students (
            tenant_id,
            section_id,
            admission_no,
            roll_no,
            first_name,
            last_name,
            dob,
            gender,
            guardian_name,
            emergency_phone,
            is_active,
            updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
            roll_no = EXCLUDED.roll_no,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            gender = EXCLUDED.gender,
            guardian_name = EXCLUDED.guardian_name,
            emergency_phone = EXCLUDED.emergency_phone,
            updated_at = CURRENT_TIMESTAMP`,
        [
          tenantId,
          sectionId,
          st.admissionNo.trim(),
          rollNo,
          st.firstName.trim(),
          (st.lastName || "").trim(),
          dob,
          gender,
          st.guardianName ? st.guardianName.trim() : null,
          st.emergencyPhone ? st.emergencyPhone.trim() : null,
        ]
      );
      insertedCount++;
    }

    try {
      revalidatePath("/admin");
    } catch {
      // outside request context
    }

    return { success: true, count: insertedCount };
  } catch (error) {
    console.error("Failed to bulk import students into PostgreSQL:", error);
    return { success: false, error: error instanceof Error ? error.message : "Bulk import failed." };
  }
}

