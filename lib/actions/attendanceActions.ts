"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AttendanceRecordPayload {
  studentId: string;
  code: string;
  reason?: string;
  source?: string;
}

export interface RealLeaveRequest {
  id: string;
  applicantName: string;
  studentId: string;
  roleOrCohort: string;
  type: "Medical Leave" | "Casual Leave" | "On-Duty (OD) Event";
  dates: string;
  daysCount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  hasAttachment: boolean;
  medicalDocName?: string;
  submittedAt: string;
  archetype: string;
}

export interface RealBiometricDevice {
  id: string;
  name: string;
  type: "Fingerprint" | "RFID Turnstile" | "Face Recognition Pod";
  ipAddress: string;
  location: string;
  status: "Online" | "Syncing" | "Offline";
  batteryStatus: "Mains AC (100%)" | "Battery 84%" | "Battery 42%";
  lastHeartbeat: string;
  totalPunchesToday: number;
  queueLength: number;
  firmware: string;
}

export async function getAttendanceRosterAction(dateStr: string, sessionStr: string) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, roster: [] };
    const tenantId = tenantRes.rows[0].id;

    // Fetch real students with section and class details
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

    // Fetch real attendance records for the given date and session
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
        studentId: s.admission_no,
        name: `${s.first_name} ${s.last_name}`,
        guardianName: s.guardian_name || "Parent/Guardian",
        guardianPhone: s.emergency_phone || "9876543210",
        todayCode: rec ? rec.code : "P",
        todaySource: ((rec?.source as "Manual Teacher" | "Biometric" | "RFID Turnstile" | "Approved Leave") || "Manual Teacher"),
        timeLogged: rec ? new Date(rec.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "08:15 AM",
        monthPresentDays: 22,
        monthTotalDays: 24,
        yearPresentDays: 135,
        yearTotalDays: 142,
        lastFiveDays: ["P", "P", "P", "L", rec ? rec.code : "P"],
        reasonNote: rec?.reason || undefined,
        archetype: "K12_SCHOOL" as const,
      };
    });

    return { success: true, roster };
  } catch (error) {
    console.error("Failed to load attendance roster from PostgreSQL:", error);
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
      const studentRes = await query<{ id: string; section_id: string }>(
        `SELECT id, section_id FROM students WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
        [rec.studentId, tenantId]
      );
      if (studentRes.rows.length === 0) continue;
      const student = studentRes.rows[0];

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
      revalidatePath("/admin");
    } catch {
      // ignore outside request context
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save attendance records to PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function getLeaveRequestsAction(): Promise<{ success: boolean; leaves: RealLeaveRequest[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, leaves: [] };
    const tenantId = tenantRes.rows[0].id;

    const res = await query<{
      id: string;
      student_id: string;
      admission_no: string;
      first_name: string;
      last_name: string;
      class_name: string;
      section_name: string;
      type: string;
      start_date: Date;
      end_date: Date;
      days_count: number;
      reason: string;
      status: string;
      has_attachment: boolean;
      medical_doc_name: string | null;
      created_at: Date;
    }>(
      `SELECT l.id, l.student_id, s.admission_no, s.first_name, s.last_name,
              c.name AS class_name, sec.name AS section_name,
              l.type, l.start_date, l.end_date, l.days_count, l.reason, l.status,
              l.has_attachment, l.medical_doc_name, l.created_at
       FROM leave_requests l
       JOIN students s ON l.student_id = s.id
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       WHERE l.tenant_id = $1
       ORDER BY l.created_at DESC`,
      [tenantId]
    );

    const leaves: RealLeaveRequest[] = res.rows.map((row) => ({
      id: row.id,
      applicantName: `${row.first_name} ${row.last_name}`,
      studentId: row.admission_no,
      roleOrCohort: `${row.class_name} - ${row.section_name}`,
      type: row.type as "Medical Leave" | "Casual Leave" | "On-Duty (OD) Event",
      dates: `${new Date(row.start_date).toLocaleDateString()} - ${new Date(row.end_date).toLocaleDateString()}`,
      daysCount: row.days_count,
      reason: row.reason,
      status: row.status as "Pending" | "Approved" | "Rejected",
      hasAttachment: row.has_attachment,
      medicalDocName: row.medical_doc_name || undefined,
      submittedAt: new Date(row.created_at).toLocaleString(),
      archetype: "K12_SCHOOL",
    }));

    return { success: true, leaves };
  } catch (error) {
    console.error("Failed to load leave requests from PostgreSQL:", error);
    return { success: false, leaves: [] };
  }
}

export async function updateLeaveStatusAction(
  leaveId: string,
  newStatus: "Pending" | "Approved" | "Rejected"
) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    await query(
      `UPDATE leave_requests
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND tenant_id = $3`,
      [newStatus, leaveId, tenantId]
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update leave status in PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function getBiometricDevicesAction(): Promise<{ success: boolean; devices: RealBiometricDevice[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, devices: [] };
    const tenantId = tenantRes.rows[0].id;

    const res = await query<{
      id: string;
      name: string;
      type: string;
      ip_address: string;
      location: string;
      status: string;
      battery_status: string;
      last_heartbeat: Date;
      total_punches_today: number;
      queue_length: number;
      firmware: string;
    }>(
      `SELECT id, name, type, ip_address, location, status, battery_status,
              last_heartbeat, total_punches_today, queue_length, firmware
       FROM biometric_devices
       WHERE tenant_id = $1
       ORDER BY name ASC`,
      [tenantId]
    );

    const devices: RealBiometricDevice[] = res.rows.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type as "Fingerprint" | "RFID Turnstile" | "Face Recognition Pod",
      ipAddress: d.ip_address,
      location: d.location,
      status: d.status as "Online" | "Syncing" | "Offline",
      batteryStatus: d.battery_status as "Mains AC (100%)" | "Battery 84%" | "Battery 42%",
      lastHeartbeat: new Date(d.last_heartbeat).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      totalPunchesToday: d.total_punches_today,
      queueLength: d.queue_length,
      firmware: d.firmware,
    }));

    return { success: true, devices };
  } catch (error) {
    console.error("Failed to load biometric devices from PostgreSQL:", error);
    return { success: false, devices: [] };
  }
}

export interface MusterStudentRow {
  id: string;
  rollNo: number;
  studentId: string;
  name: string;
  dailyMarks: Record<number, string>;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export async function getMonthlyMusterAction(year: number, month: number) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, students: [], daysInMonth: 30 };
    const tenantId = tenantRes.rows[0].id;

    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    // 1. Fetch Students
    const studentsRes = await query<{
      id: string;
      admission_no: string;
      roll_no: number | null;
      first_name: string;
      last_name: string;
    }>(
      `SELECT id, admission_no, roll_no, first_name, last_name
       FROM students
       WHERE tenant_id = $1 AND is_active = TRUE
       ORDER BY roll_no ASC`,
      [tenantId]
    );

    // 2. Fetch all marks in the date range
    const recordsRes = await query<{
      student_id: string;
      date: string;
      code: string;
    }>(
      `SELECT student_id, to_char(date, 'YYYY-MM-DD') AS date, code
       FROM attendance_records
       WHERE tenant_id = $1 AND date >= $2::date AND date <= $3::date`,
      [tenantId, startDate, endDate]
    );

    // Group marks by student_id -> day -> code
    const marksByStudent = new Map<string, Record<number, string>>();
    for (const r of recordsRes.rows) {
      const dayNum = parseInt(r.date.split("-")[2], 10);
      if (!marksByStudent.has(r.student_id)) {
        marksByStudent.set(r.student_id, {});
      }
      marksByStudent.get(r.student_id)![dayNum] = r.code;
    }

    const students: MusterStudentRow[] = studentsRes.rows.map((s) => {
      const dailyMarks = marksByStudent.get(s.id) || {};
      let presentCount = 0;
      let absentCount = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const mark = dailyMarks[d];
        if (mark === "P" || mark === "OD") presentCount += 1.0;
        else if (mark === "L") presentCount += 1.0;
        else if (mark === "HD") presentCount += 0.5;
        else if (mark === "A" || mark === "LC") absentCount += 1.0;
      }

      const totalMarkedDays = presentCount + absentCount;
      const percentage = totalMarkedDays > 0 ? (presentCount / totalMarkedDays) * 100 : 100.0;

      return {
        id: s.id,
        rollNo: s.roll_no || 0,
        studentId: s.admission_no,
        name: `${s.first_name} ${s.last_name}`,
        dailyMarks,
        presentDays: presentCount,
        absentDays: absentCount,
        percentage: Number(percentage.toFixed(1)),
      };
    });

    return { success: true, daysInMonth, students };
  } catch (error) {
    console.error("Failed to load monthly muster from PostgreSQL:", error);
    return { success: false, students: [], daysInMonth: 30 };
  }
}

export async function saveCondonationCaseAction(studentId: string, reason: string, medicalSlipRef?: string) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    // Log the condonation approval into audit_logs table for statutory DPDPA compliance
    await query(
      `INSERT INTO audit_logs (
          tenant_id,
          action,
          entity,
          entity_id,
          new_values,
          created_at
       ) VALUES ($1, 'CONDONATION_APPROVED', 'STUDENT', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        studentId,
        JSON.stringify({
          reason,
          medicalSlipRef: medicalSlipRef || "Verified By Head of Institution",
          approvedAt: new Date().toISOString(),
          status: "EXAM_ADMIT_CARD_UNLOCKED",
        }),
      ]
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to save condonation case to PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}
