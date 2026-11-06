"use server";

import { query, getClient } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface StudentProfileData {
  id: string;
  admissionNo: string;
  rollNo: number | null;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  category: string;
  guardianName: string;
  guardianPhone: string;
  emergencyPhone: string;
  className: string;
  sectionName: string;
  cohort: string;
  tenantName: string;
  tenantDomain: string;
  primaryColor: string;
}

export interface StudentAttendanceSummary {
  presentCount: number;
  totalCount: number;
  percentage: number;
  isSafe: boolean; // >= 75%
  recentLogs: {
    date: string;
    code: string;
    timeIn: string;
    remarks: string;
  }[];
}

export interface StudentFeeSummary {
  totalDue: number;
  totalPaid: number;
  hasOutstanding: boolean;
  invoices: {
    id: string;
    invoiceNo: string;
    title: string;
    amount: number;
    paidAmount: number;
    dueDate: string;
    status: "Paid" | "Pending" | "Overdue" | "Partial";
    upiLink: string;
  }[];
  receipts: {
    id: string;
    receiptNo: string;
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    paidAt: string;
  }[];
}

export interface StudentExamSummary {
  examTitle: string;
  hallTicketSeatNo: string;
  totalScore: string;
  percentage: string;
  grade: string;
  status: string;
  subjects: {
    name: string;
    code: string;
    score: number;
    maxScore: number;
    grade: string;
  }[];
}

export interface StudentNoticeItem {
  id: string;
  title: string;
  message: string;
  channel: string;
  date: string;
}

export interface StudentTimetableSlot {
  period: number;
  time: string;
  subject: string;
  code: string;
  room: string;
  faculty: string;
}

export interface StudentDashboardPayload {
  student: StudentProfileData;
  attendance: StudentAttendanceSummary;
  fees: StudentFeeSummary;
  exams: StudentExamSummary;
  notices: StudentNoticeItem[];
  todaySchedule: StudentTimetableSlot[];
}

/**
 * Fetch full real data for the Student Portal dashboard from PostgreSQL.
 */
export async function getStudentDashboardAction(studentId?: string): Promise<{
  success: boolean;
  data?: StudentDashboardPayload;
  error?: string;
}> {
  try {
    const tenantRes = await query<{
      id: string;
      name: string;
      slug: string;
      primary_color: string;
    }>(
      `SELECT id, name, slug, primary_color FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found." };
    const tenant = tenantRes.rows[0];
    const tenantId = tenant.id;

    // 1. Fetch target student (or first active student if none specified)
    let targetStudentId = studentId;
    if (!targetStudentId) {
      const firstStu = await query<{ id: string }>(
        `SELECT id FROM students WHERE tenant_id = $1 AND is_active = TRUE ORDER BY roll_no ASC LIMIT 1`,
        [tenantId]
      );
      if (firstStu.rows.length === 0) {
        return { success: false, error: "No active students found in institution." };
      }
      targetStudentId = firstStu.rows[0].id;
    }

    const stuRes = await query<{
      id: string;
      admission_no: string;
      roll_no: number | null;
      first_name: string;
      last_name: string;
      gender: string;
      dob: string | null;
      category: string;
      guardian_name: string | null;
      guardian_phone: string | null;
      emergency_phone: string | null;
      class_name: string;
      section_name: string;
    }>(
      `SELECT s.id, s.admission_no, s.roll_no, s.first_name, s.last_name,
              s.gender, to_char(s.dob, 'YYYY-MM-DD') AS dob, s.category,
              s.guardian_name, s.guardian_phone, s.emergency_phone,
              c.name AS class_name, sec.name AS section_name
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       WHERE s.id = $1 AND s.tenant_id = $2
       LIMIT 1`,
      [targetStudentId, tenantId]
    );

    if (stuRes.rows.length === 0) {
      return { success: false, error: "Student record not found." };
    }
    const stu = stuRes.rows[0];

    const student: StudentProfileData = {
      id: stu.id,
      admissionNo: stu.admission_no,
      rollNo: stu.roll_no,
      firstName: stu.first_name,
      lastName: stu.last_name,
      gender: stu.gender || "MALE",
      dob: stu.dob || "2011-05-15",
      category: stu.category || "GENERAL",
      guardianName: stu.guardian_name || "Parent / Guardian",
      guardianPhone: stu.guardian_phone || "+91 98220 11223",
      emergencyPhone: stu.emergency_phone || "+91 98220 11223",
      className: stu.class_name,
      sectionName: stu.section_name,
      cohort: `${stu.class_name} - ${stu.section_name}`,
      tenantName: tenant.name,
      tenantDomain: `${tenant.slug}.occocore.com`,
      primaryColor: tenant.primary_color || "#153E35",
    };

    // 2. Fetch real Attendance Summary
    const attRes = await query<{ present_count: string; total_count: string }>(
      `SELECT COUNT(CASE WHEN code IN ('P', 'OD', 'L') THEN 1 END)::text AS present_count,
              COUNT(*)::text AS total_count
       FROM attendance_records
       WHERE student_id = $1 AND tenant_id = $2`,
      [stu.id, tenantId]
    );
    const presentCount = parseInt(attRes.rows[0]?.present_count || "0", 10);
    const totalCount = parseInt(attRes.rows[0]?.total_count || "0", 10);
    const attPct = totalCount > 0 ? parseFloat(((presentCount / totalCount) * 100).toFixed(1)) : 0.0;

    const logsRes = await query<{
      date: string;
      code: string;
      time_in: string | null;
      remarks: string | null;
    }>(
      `SELECT to_char(date, 'DD Mon YYYY') AS date, code, time_in, remarks
       FROM attendance_records
       WHERE student_id = $1 AND tenant_id = $2
       ORDER BY date DESC
       LIMIT 30`,
      [stu.id, tenantId]
    );

    const recentLogs = logsRes.rows.map((r) => ({
      date: r.date,
      code: r.code,
      timeIn: r.time_in ? r.time_in.slice(0, 5) : "08:30",
      remarks: r.remarks || "Regular Session Roll Call",
    }));

    const attendance: StudentAttendanceSummary = {
      presentCount,
      totalCount,
      percentage: attPct,
      isSafe: attPct >= 75.0,
      recentLogs,
    };

    // 3. Fetch real Fee Invoices & Receipts
    const invRes = await query<{
      id: string;
      invoice_no: string;
      title: string;
      amount: string;
      paid_amount: string;
      due_date: string;
      status: string;
    }>(
      `SELECT id, invoice_no, title, amount, paid_amount,
              to_char(due_date, 'DD Mon YYYY') AS due_date, status
       FROM invoices
       WHERE student_id = $1 AND tenant_id = $2
       ORDER BY due_date ASC`,
      [stu.id, tenantId]
    );

    let totalDue = 0;
    let totalPaid = 0;

    const invoices = invRes.rows.map((inv) => {
      const amt = parseFloat(inv.amount);
      const paid = parseFloat(inv.paid_amount || "0");
      const remaining = Math.max(0, amt - paid);
      totalDue += remaining;
      totalPaid += paid;

      const upiLink = `upi://pay?pa=apexacademy@icici&pn=ApexAcademy&am=${remaining}&tr=${inv.invoice_no}&cu=INR`;

      let mappedStatus: "Paid" | "Pending" | "Overdue" | "Partial" = "Pending";
      const s = (inv.status || "").toUpperCase();
      if (s === "PAID") mappedStatus = "Paid";
      else if (s === "PARTIAL") mappedStatus = "Partial";
      else mappedStatus = "Pending";

      return {
        id: inv.id,
        invoiceNo: inv.invoice_no,
        title: inv.title,
        amount: amt,
        paidAmount: paid,
        dueDate: inv.due_date,
        status: mappedStatus,
        upiLink,
      };
    });

    const rcpRes = await query<{
      id: string;
      receipt_no: string;
      amount: string;
      payment_method: string;
      transaction_ref: string;
      paid_at: string;
    }>(
      `SELECT id, receipt_no, amount, payment_method, transaction_ref,
              to_char(created_at, 'DD Mon YYYY • HH12:MI AM') AS paid_at
       FROM receipts
       WHERE student_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC
       LIMIT 10`,
      [stu.id, tenantId]
    );

    const receipts = rcpRes.rows.map((r) => ({
      id: r.id,
      receiptNo: r.receipt_no,
      amount: parseFloat(r.amount),
      paymentMethod: r.payment_method,
      transactionRef: r.transaction_ref,
      paidAt: r.paid_at,
    }));

    const fees: StudentFeeSummary = {
      totalDue,
      totalPaid,
      hasOutstanding: totalDue > 0,
      invoices,
      receipts,
    };

    // 4. Fetch real Examination Report
    const marksRes = await query<{
      score: string;
      max_score: string;
      grade: string;
      subject_name: string;
      subject_code: string;
      exam_title: string;
    }>(
      `SELECT m.score, m.max_score, m.grade,
              sub.name AS subject_name, sub.code AS subject_code,
              e.title AS exam_title
       FROM marks m
       JOIN exams e ON m.exam_id = e.id
       JOIN subjects sub ON m.subject_id = sub.id
       WHERE m.student_id = $1 AND m.tenant_id = $2
       ORDER BY sub.code ASC`,
      [stu.id, tenantId]
    );

    let totalMarks = 0;
    let maxTotal = 0;
    const subjects = marksRes.rows.map((m) => {
      const sc = parseFloat(m.score);
      const mx = parseFloat(m.max_score);
      totalMarks += sc;
      maxTotal += mx;
      return {
        name: m.subject_name,
        code: m.subject_code,
        score: sc,
        maxScore: mx,
        grade: m.grade || (sc >= 90 ? "A1" : sc >= 80 ? "A2" : sc >= 70 ? "B1" : "B2"),
      };
    });

    const overallPct = maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(1) : "0.0";
    const overallGrade = parseFloat(overallPct) >= 90 ? "A1 (Distinction)" : parseFloat(overallPct) >= 75 ? "First Class" : "Pass";

    const exams: StudentExamSummary = {
      examTitle: marksRes.rows[0]?.exam_title || "Mid-Term Academic Assessment 2026-27",
      hallTicketSeatNo: stu.roll_no ? `SEAT-${String(stu.roll_no).padStart(3, "0")}` : `SEAT-${stu.admission_no.slice(-3)}`,
      totalScore: maxTotal > 0 ? `${totalMarks} / ${maxTotal}` : "Pending Evaluation",
      percentage: `${overallPct}%`,
      grade: overallGrade,
      status: parseFloat(overallPct) >= 33 ? "Passed" : "Remedial",
      subjects,
    };

    // 5. Fetch Notices & Broadcasts
    const notRes = await query<{
      id: string;
      title: string;
      message: string;
      channel: string;
      date: string;
    }>(
      `SELECT id, title, message, channel,
              to_char(created_at, 'DD Mon YYYY') AS date
       FROM broadcast_messages
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [tenantId]
    );

    const notices: StudentNoticeItem[] = notRes.rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      channel: n.channel,
      date: n.date,
    }));

    // 6. Dynamic Timetable Slots from real subjects
    const subRes = await query<{
      name: string;
      code: string;
      credits: number;
    }>(
      `SELECT DISTINCT ON (name) name, code, credits
       FROM subjects
       WHERE tenant_id = $1
       ORDER BY name ASC
       LIMIT 6`,
      [tenantId]
    );

    const times = [
      "08:30 - 09:15",
      "09:15 - 10:00",
      "10:15 - 11:00",
      "11:00 - 11:45",
      "12:15 - 01:00",
      "01:00 - 01:45",
    ];

    const todaySchedule: StudentTimetableSlot[] = subRes.rows.map((s, idx) => ({
      period: idx + 1,
      time: times[idx] || "08:30 - 09:15",
      subject: s.name,
      code: s.code,
      room: `Room ${201 + idx}`,
      faculty: "Department Faculty",
    }));

    return {
      success: true,
      data: {
        student,
        attendance,
        fees,
        exams,
        notices,
        todaySchedule,
      },
    };
  } catch (error) {
    console.error("Failed to load student dashboard payload:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load student dashboard",
    };
  }
}

/**
 * Submit self-service leave request from Student Portal into PostgreSQL.
 */
export async function submitStudentLeaveAction(payload: {
  studentId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = await getClient();
  try {
    const tenantRes = await client.query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found." };
    const tenantId = tenantRes.rows[0].id;

    await client.query("BEGIN");

    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    await client.query(
      `INSERT INTO leave_requests (
          tenant_id,
          student_id,
          type,
          start_date,
          end_date,
          days_count,
          reason,
          status,
          has_attachment,
          created_at
       ) VALUES ($1, $2, $3, $4::date, $5::date, $6, $7, 'PENDING', FALSE, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        payload.studentId,
        payload.leaveType || "Medical Leave",
        payload.startDate,
        payload.endDate,
        daysCount,
        payload.reason.trim(),
      ]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values, created_at)
       VALUES ($1, 'STUDENT_LEAVE_APPLIED', 'LEAVE_REQUEST', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        payload.studentId,
        JSON.stringify({
          student_id: payload.studentId,
          type: payload.leaveType,
          days: daysCount,
          start: payload.startDate,
          end: payload.endDate,
        }),
      ]
    );

    await client.query("COMMIT");

    try {
      revalidatePath("/student");
      revalidatePath("/admin");
    } catch {
      // outside request context
    }

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to submit student leave request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit leave request",
    };
  } finally {
    client.release();
  }
}
