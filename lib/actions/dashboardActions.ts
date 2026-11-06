"use server";

import { query } from "@/lib/db";

export interface DashboardMetricStats {
  admissions: string;
  pending: string;
  attendance: string;
  collections: string;
}

export interface ActivityFeedItem {
  id: string;
  name: string;
  phone: string;
  program: string;
  timestamp: string;
  status: "Pending" | "Confirmed" | "Collected" | "Rejected";
  category: "admissions" | "fees" | "attendance" | "exams";
  feeAmount?: string;
  details?: string;
}

export async function getDashboardOverviewStatsAction(
  slug: string = "apexacademy"
): Promise<{ success: boolean; data?: DashboardMetricStats; error?: string }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (tenantRes.rows.length === 0) {
      return { success: false, error: `Tenant '${slug}' not found.` };
    }
    const tenantId = tenantRes.rows[0].id;

    // 1. Total Enrolled Active Students
    const studentRes = await query<{ count: string }>(
      `SELECT count(*) as count FROM students WHERE tenant_id = $1 AND is_active = TRUE`,
      [tenantId]
    );
    const totalStudents = parseInt(studentRes.rows[0]?.count || "0", 10);

    // 2. Pending Admissions
    const pendingRes = await query<{ count: string }>(
      `SELECT count(*) as count FROM admission_applications WHERE tenant_id = $1 AND status = 'PENDING'`,
      [tenantId]
    );
    const pendingCount = parseInt(pendingRes.rows[0]?.count || "0", 10);

    // 3. Real Aggregate Attendance Rate (using valid code column & weighted presence)
    const attRes = await query<{ rate: string | null }>(
      `SELECT ROUND(AVG(CASE 
                WHEN code IN ('P', 'L', 'LC', 'OD') THEN 100.0 
                WHEN code = 'HD' THEN 50.0 
                ELSE 0.0 
              END), 1) as rate
       FROM attendance_records
       WHERE tenant_id = $1`,
      [tenantId]
    );
    const attRate = attRes.rows[0]?.rate !== null ? `${attRes.rows[0].rate}%` : "0.0%";

    // 4. Collections
    const feesRes = await query<{ total: string | null }>(
      `SELECT SUM(paid_amount) as total FROM invoices WHERE tenant_id = $1`,
      [tenantId]
    );
    const totalCollected = parseFloat(feesRes.rows[0]?.total || "0");
    const formattedCollections =
      totalCollected >= 100000
        ? `₹${(totalCollected / 100000).toFixed(2)}L`
        : `₹${totalCollected.toLocaleString("en-IN")}`;

    return {
      success: true,
      data: {
        admissions: String(totalStudents),
        pending: String(pendingCount),
        attendance: attRate,
        collections: formattedCollections,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard overview stats from PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}

export async function getRecentDashboardActivitiesAction(
  slug: string = "apexacademy"
): Promise<{ success: boolean; data?: ActivityFeedItem[]; error?: string }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (tenantRes.rows.length === 0) {
      return { success: false, error: `Tenant '${slug}' not found.` };
    }
    const tenantId = tenantRes.rows[0].id;

    const activities: (ActivityFeedItem & { rawDate: Date })[] = [];

    // 1. Fee Receipts from real receipts table
    const receiptsRes = await query<{
      id: string;
      receipt_no: string;
      amount: string;
      payment_method: string;
      created_at: Date;
      first_name: string;
      last_name: string;
      admission_no: string;
      emergency_phone: string | null;
      class_name: string | null;
    }>(
      `SELECT r.id, r.receipt_no, r.amount, r.payment_method, r.created_at,
              s.first_name, s.last_name, s.admission_no, s.emergency_phone, c.name as class_name
       FROM receipts r
       JOIN students s ON r.student_id = s.id
       LEFT JOIN sections sec ON s.section_id = sec.id
       LEFT JOIN classes c ON sec.class_id = c.id
       WHERE r.tenant_id = $1
       ORDER BY r.created_at DESC
       LIMIT 4`,
      [tenantId]
    );

    receiptsRes.rows.forEach((r) => {
      const amt = parseFloat(r.amount);
      activities.push({
        id: `fee-${r.id}`,
        name: `${r.first_name} ${r.last_name}`,
        phone: r.emergency_phone || "Not recorded",
        program: `${r.class_name || "Enrolled Student"} • Fee Settlement`,
        timestamp: new Date(r.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: "Confirmed",
        category: "fees",
        feeAmount: `₹${amt.toLocaleString("en-IN")}`,
        details: `Paid via ${r.payment_method.replace("_", " ")} (Receipt #${r.receipt_no}). Official ledger reconciled.`,
        rawDate: new Date(r.created_at),
      });
    });

    // 2. Admission Applications
    const admRes = await query<{
      id: string;
      first_name: string;
      last_name: string;
      guardian_phone: string | null;
      program: string;
      status: string;
      created_at: Date;
      numeric_score: string | null;
    }>(
      `SELECT id, first_name, last_name, guardian_phone, program, status, created_at, numeric_score
       FROM admission_applications
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT 4`,
      [tenantId]
    );

    admRes.rows.forEach((a) => {
      const statusMap: Record<string, "Pending" | "Confirmed" | "Collected" | "Rejected"> = {
        PENDING: "Pending",
        DOCS_VERIFIED: "Pending",
        SHORTLISTED: "Pending",
        ENROLLED: "Confirmed",
        CONFIRMED: "Confirmed",
        ADMITTED: "Confirmed",
        REJECTED: "Rejected",
      };
      activities.push({
        id: `adm-${a.id}`,
        name: `${a.first_name} ${a.last_name}`,
        phone: a.guardian_phone || "Not recorded",
        program: `Admission Application • ${a.program}`,
        timestamp: new Date(a.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: statusMap[a.status] || "Pending",
        category: "admissions",
        details: `Applied for ${a.program}${a.numeric_score ? ` with ${a.numeric_score}% merit score` : ""}. Status: ${a.status.replace("_", " ")}.`,
        rawDate: new Date(a.created_at),
      });
    });

    // 3. Exam Score Records
    const marksRes = await query<{
      id: string;
      score: string;
      max_score: string;
      created_at: Date;
      first_name: string;
      last_name: string;
      emergency_phone: string | null;
      exam_title: string;
      subject_name: string;
    }>(
      `SELECT m.id, m.score, m.max_score, m.created_at,
              s.first_name, s.last_name, s.emergency_phone,
              e.title as exam_title, sub.name as subject_name
       FROM marks m
       JOIN students s ON m.student_id = s.id
       JOIN exams e ON m.exam_id = e.id
       JOIN subjects sub ON m.subject_id = sub.id
       WHERE m.tenant_id = $1
       ORDER BY m.created_at DESC
       LIMIT 4`,
      [tenantId]
    );

    marksRes.rows.forEach((m) => {
      activities.push({
        id: `exam-${m.id}`,
        name: `${m.first_name} ${m.last_name}`,
        phone: m.emergency_phone || "Not recorded",
        program: `${m.subject_name} • ${m.exam_title}`,
        timestamp: new Date(m.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: "Confirmed",
        category: "exams",
        details: `Scored ${m.score} / ${m.max_score} in ${m.subject_name} examination. Grade recorded in database.`,
        rawDate: new Date(m.created_at),
      });
    });

    // Sort descending by created_at
    activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    // Clean rawDate before returning
    const finalData: ActivityFeedItem[] = activities.slice(0, 10).map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      program: item.program,
      timestamp: item.timestamp,
      status: item.status,
      category: item.category,
      feeAmount: item.feeAmount,
      details: item.details,
    }));

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error("Error fetching dashboard activities from PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}
