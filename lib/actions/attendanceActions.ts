"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AttendanceRecordPayload {
  studentId: string;
  code: string;
  reason?: string;
  source?: string;
}

export async function getAttendanceRosterAction(dateStr: string, sessionStr: string) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, roster: [] };
    const tenantId = tenantRes.rows[0].id;

    // Fetch students with section and class details
    const studentsRes = await query<{
      id: string;
      admission_no: string;
      roll_no: number | null;
      first_name: string;
      last_name: string;
      photo_url: string | null;
      category: string;
      is_rte_quota: boolean;
      guardian_name: string | null;
      emergency_phone: string | null;
      section_name: string;
      class_name: string;
    }>(
      `SELECT s.id, s.admission_no, s.roll_no, s.first_name, s.last_name,
              s.photo_url, s.category, s.is_rte_quota, s.guardian_name, s.emergency_phone,
              sec.name AS section_name, c.name AS class_name
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       WHERE s.tenant_id = $1 AND s.is_active = TRUE
       ORDER BY s.roll_no ASC`,
      [tenantId]
    );

    // Fetch existing attendance records for the date and session
    const recordsRes = await query<{
      student_id: string;
      code: string;
      reason: string | null;
      source: string;
      updated_at: Date;
    }>(
      `SELECT student_id, code, reason, source, updated_at
       FROM attendance_records
       WHERE tenant_id = $1 AND date = $2::date AND session = $3`,
      [tenantId, dateStr, sessionStr]
    );

    const recordMap = new Map(recordsRes.rows.map((r) => [r.student_id, r]));

    const roster = studentsRes.rows.map((s) => {
      const rec = recordMap.get(s.id);
      return {
        id: s.id,
        rollNo: s.roll_no || 0,
        admissionNo: s.admission_no,
        name: `${s.first_name} ${s.last_name}`,
        photo: s.photo_url || "",
        currentMark: rec ? rec.code : "P",
        reason: rec?.reason || undefined,
        reasonCategory: rec?.reason ? "Recorded Note" : undefined,
        markedAt: rec ? new Date(rec.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        markedBy: "Class Teacher",
        source: (rec?.source as "MANUAL" | "BIOMETRIC" | "RFID") || "MANUAL",
        category: s.category,
        isRte: s.is_rte_quota,
        yearToDatePct: 88.5,
        sparklineLast5: ["P", "P", "P", "L", rec ? rec.code : "P"],
        attendanceBand: "SAFE" as const,
        futureDaysToReach75: 0,
        guardianName: s.guardian_name || "Parent/Guardian",
        guardianPhone: s.emergency_phone || "9876543210",
      };
    });

    return { success: true, roster };
  } catch (error) {
    console.error("Failed to load attendance roster from PostgreSQL via native SQL:", error);
    return { success: false, roster: [] };
  }
}

export async function saveAttendanceRecordsAction(
  dateStr: string,
  sessionStr: string,
  records: AttendanceRecordPayload[]
) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found." };
    const tenantId = tenantRes.rows[0].id;

    for (const rec of records) {
      // Find student and their section
      const studentRes = await query<{ id: string; section_id: string }>(
        `SELECT id, section_id FROM students WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
        [rec.studentId, tenantId]
      );
      if (studentRes.rows.length === 0) continue;
      const student = studentRes.rows[0];

      // Native PostgreSQL Upsert
      await query(
        `INSERT INTO attendance_records (
            tenant_id,
            student_id,
            section_id,
            date,
            session,
            code,
            reason,
            source,
            updated_at
         ) VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, CURRENT_TIMESTAMP)
         ON CONFLICT (tenant_id, student_id, date, session) DO UPDATE SET
            code = EXCLUDED.code,
            reason = EXCLUDED.reason,
            source = EXCLUDED.source,
            updated_at = CURRENT_TIMESTAMP`,
        [
          tenantId,
          student.id,
          student.section_id,
          dateStr,
          sessionStr,
          rec.code,
          rec.reason || null,
          rec.source || "MANUAL",
        ]
      );
    }

    try {
      revalidatePath("/admin/attendance");
    } catch {
      // ignore outside request context
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save attendance records to PostgreSQL via native SQL:", error);
    return { success: false, error: String(error) };
  }
}
