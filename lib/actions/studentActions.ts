"use server";

import { query, getClient } from "@/lib/db";
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
  sectionId?: string;
  cohortName?: string;
}

export async function quickAddStudentAction(data: StudentInputPayload) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found." };
    const tenantId = tenantRes.rows[0].id;

    let targetSectionId = data.sectionId;

    // If explicit sectionId provided, verify it belongs to this tenant
    if (targetSectionId) {
      const verifySec = await query<{ id: string }>(
        `SELECT id FROM sections WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
        [targetSectionId, tenantId]
      );
      if (verifySec.rows.length === 0) {
        targetSectionId = undefined;
      }
    }

    // If cohortName provided (e.g. "Grade 10" or "Class 10 - Section A"), try matching
    if (!targetSectionId && data.cohortName) {
      const matchSec = await query<{ id: string }>(
        `SELECT s.id 
         FROM sections s
         JOIN classes c ON s.class_id = c.id
         WHERE s.tenant_id = $1 AND (c.name ILIKE $2 OR s.name ILIKE $2)
         LIMIT 1`,
        [tenantId, `%${data.cohortName.trim()}%`]
      );
      targetSectionId = matchSec.rows[0]?.id;
    }

    // Default fallback to first section
    if (!targetSectionId) {
      const sectionRes = await query<{ id: string }>(
        `SELECT s.id
         FROM sections s
         JOIN classes c ON s.class_id = c.id
         WHERE s.tenant_id = $1
         ORDER BY c.numeric_level ASC, s.name ASC
         LIMIT 1`,
        [tenantId]
      );
      targetSectionId = sectionRes.rows[0]?.id;
    }

    if (!targetSectionId) {
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
        targetSectionId,
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

    // Audit log
    await query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values, created_at)
       VALUES ($1, 'STUDENT_CREATED', 'STUDENT', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        insertRes.rows[0]?.id,
        JSON.stringify({
          admission_no: data.admissionNo,
          name: `${data.firstName} ${data.lastName}`,
          section_id: targetSectionId,
        }),
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
  if (!students || students.length === 0) {
    return { success: false, error: "No student records provided for import." };
  }

  const client = await getClient();
  try {
    const tenantRes = await client.query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found." };
    const tenantId = tenantRes.rows[0].id;

    // Find default fallback section
    const defaultSectionRes = await client.query<{ id: string }>(
      `SELECT s.id
       FROM sections s
       JOIN classes c ON s.class_id = c.id
       WHERE s.tenant_id = $1
       ORDER BY c.numeric_level ASC, s.name ASC
       LIMIT 1`,
      [tenantId]
    );

    const defaultSectionId = defaultSectionRes.rows[0]?.id;
    if (!defaultSectionId) {
      return { success: false, error: "No class section available in the database." };
    }

    await client.query("BEGIN");

    let insertedCount = 0;

    for (let i = 0; i < students.length; i++) {
      const st = students[i];
      if (!st.admissionNo || !st.firstName) continue;

      const rollNo = Number(st.rollNo) || null;
      const dob = st.dob || "2011-05-15";
      const gender = st.gender || "MALE";
      const targetSectionId = st.sectionId || defaultSectionId;

      await client.query(
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
          targetSectionId,
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

    await client.query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values, created_at)
       VALUES ($1, 'BULK_STUDENTS_IMPORTED', 'STUDENT_BATCH', $1, $2::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        JSON.stringify({
          batch_size: insertedCount,
          imported_at: new Date().toISOString(),
        }),
      ]
    );

    await client.query("COMMIT");

    try {
      revalidatePath("/admin");
    } catch {
      // outside request context
    }

    return { success: true, count: insertedCount };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to bulk import students into PostgreSQL:", error);
    return { success: false, error: error instanceof Error ? error.message : "Bulk import failed." };
  } finally {
    client.release();
  }
}
