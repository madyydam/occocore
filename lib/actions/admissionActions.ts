"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface RealAdmissionCandidate {
  id: string;
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  program: string;
  archetype: string;
  appliedDate: string;
  status: "Pending" | "Confirmed" | "Admitted" | "Waitlisted" | "Rejected";
  meritScore: string;
  numericScore: number;
  quotaType: string;
  documentsVerified: boolean;
  notes: string;
  enrolledStudentId?: string;
  documents: { title: string; verified: boolean; type: string }[];
}

export async function getAdmissionCandidatesAction(archetype?: string): Promise<{
  success: boolean;
  candidates: RealAdmissionCandidate[];
  error?: string;
}> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, candidates: [] };
    const tenantId = tenantRes.rows[0].id;

    // Check existing candidates
    const res = await query<{
      id: string;
      application_no: string;
      first_name: string;
      last_name: string;
      guardian_name: string;
      guardian_phone: string;
      email: string;
      program: string;
      merit_score: string;
      numeric_score: string;
      quota_type: string;
      documents_verified: boolean;
      documents: { title: string; verified: boolean; type: string }[];
      notes: string;
      status: string;
      enrolled_student_id: string | null;
      created_at: string;
    }>(
      `SELECT 
        id, application_no, first_name, last_name, guardian_name, guardian_phone, 
        email, program, merit_score, numeric_score, quota_type, documents_verified, 
        documents, notes, status, enrolled_student_id,
        to_char(created_at, 'DD Mon YYYY • HH12:MI AM') AS created_at
       FROM admission_applications
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );

    const candidates: RealAdmissionCandidate[] = res.rows.map((r) => {
      let mappedStatus: "Pending" | "Confirmed" | "Admitted" | "Waitlisted" | "Rejected" = "Pending";
      const s = (r.status || "").toUpperCase();
      if (s === "CONFIRMED") mappedStatus = "Confirmed";
      else if (s === "ADMITTED") mappedStatus = "Admitted";
      else if (s === "WAITLISTED") mappedStatus = "Waitlisted";
      else if (s === "REJECTED") mappedStatus = "Rejected";

      return {
        id: r.id,
        name: `${r.first_name} ${r.last_name}`,
        guardianName: r.guardian_name,
        phone: r.guardian_phone,
        email: r.email,
        program: r.program,
        archetype: archetype || "K12_SCHOOL",
        appliedDate: r.created_at,
        status: mappedStatus,
        meritScore: r.merit_score || "N/A",
        numericScore: parseFloat(r.numeric_score || "0"),
        quotaType: r.quota_type,
        documentsVerified: Boolean(r.documents_verified),
        notes: r.notes || "",
        enrolledStudentId: r.enrolled_student_id || undefined,
        documents: Array.isArray(r.documents) ? r.documents : [],
      };
    });

    return { success: true, candidates };
  } catch (error) {
    console.error("Failed to fetch admission candidates:", error);
    return {
      success: false,
      candidates: [],
      error: error instanceof Error ? error.message : "Failed to fetch candidates",
    };
  }
}

export async function createAdmissionCandidateAction(payload: {
  name: string;
  guardianName: string;
  phone: string;
  email?: string;
  program: string;
  meritScore: string;
  quotaType: string;
  notes?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    // Split name
    const parts = payload.name.trim().split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || "Student";

    // Generate Application No
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM admission_applications WHERE tenant_id = $1`,
      [tenantId]
    );
    const nextNum = parseInt(countRes.rows[0]?.count || "0", 10) + 101;
    const applicationNo = `APP/2026/${String(nextNum).padStart(4, "0")}`;

    const numScore = parseFloat(payload.meritScore.replace(/[^0-9.]/g, "")) || 85.0;
    const isRte = payload.quotaType.toLowerCase().includes("rte");

    const defaultDocs = [
      { title: "Academic Scorecard / Previous Marksheet", verified: false, type: "Academic" },
      { title: "Statutory Identification Document (Aadhaar / ID)", verified: false, type: "Identity" },
      { title: "Transfer Certificate / Conduct Letter", verified: false, type: "Statutory" },
    ];

    const insRes = await query<{ id: string }>(
      `INSERT INTO admission_applications (
        tenant_id, application_no, first_name, last_name, guardian_name, guardian_phone,
        email, program, merit_score, numeric_score, quota_type, is_rte_quota,
        documents_verified, documents, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE, $13::jsonb, $14, 'PENDING')
      RETURNING id`,
      [
        tenantId,
        applicationNo,
        firstName,
        lastName,
        payload.guardianName,
        payload.phone,
        payload.email || `${firstName.toLowerCase()}@applicant.in`,
        payload.program,
        payload.meritScore,
        numScore,
        payload.quotaType,
        isRte,
        JSON.stringify(defaultDocs),
        payload.notes || "New applicant registered via Admissions Registry.",
      ]
    );

    await query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values, created_at)
       VALUES ($1, 'ADMISSION_APPLICATION_CREATED', 'ADMISSION_APPLICATION', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        insRes.rows[0].id,
        JSON.stringify({
          application_no: applicationNo,
          name: payload.name,
          program: payload.program,
        }),
      ]
    );

    revalidatePath("/admin");
    return { success: true, id: insRes.rows[0].id };
  } catch (error) {
    console.error("Failed to create admission candidate:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create candidate",
    };
  }
}

export async function toggleAdmissionDocumentVerificationAction(
  candidateId: string,
  docIndex: number
): Promise<{ success: boolean; documentsVerified?: boolean; error?: string }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    const cur = await query<{ documents: { title: string; verified: boolean; type: string }[] }>(
      `SELECT documents FROM admission_applications WHERE id = $1 AND tenant_id = $2`,
      [candidateId, tenantId]
    );
    if (cur.rows.length === 0) return { success: false, error: "Candidate not found" };

    const docs = cur.rows[0].documents || [];
    if (docIndex >= 0 && docIndex < docs.length) {
      docs[docIndex].verified = !docs[docIndex].verified;
    }
    const allVerified = docs.length > 0 && docs.every((d) => d.verified);

    await query(
      `UPDATE admission_applications 
       SET documents = $1::jsonb, documents_verified = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND tenant_id = $4`,
      [JSON.stringify(docs), allVerified, candidateId, tenantId]
    );

    revalidatePath("/admin");
    return { success: true, documentsVerified: allVerified };
  } catch (error) {
    console.error("Failed to toggle document verification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle verification",
    };
  }
}

export async function updateAdmissionStatusAction(
  candidateId: string,
  status: "PENDING" | "CONFIRMED" | "WAITLISTED" | "REJECTED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    await query(
      `UPDATE admission_applications 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND tenant_id = $3`,
      [status, candidateId, tenantId]
    );

    await query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values, created_at)
       VALUES ($1, 'ADMISSION_STATUS_UPDATED', 'ADMISSION_APPLICATION', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [tenantId, candidateId, JSON.stringify({ status })]
    );

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update admission status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function enrollApplicantAsStudentAction(candidateId: string): Promise<{
  success: boolean;
  studentId?: string;
  admissionNo?: string;
  invoiceNo?: string;
  error?: string;
}> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    // 1. Fetch candidate
    const candRes = await query<{
      id: string;
      application_no: string;
      first_name: string;
      last_name: string;
      guardian_name: string;
      guardian_phone: string;
      email: string;
      gender: string;
      dob: string | null;
      is_rte_quota: boolean;
      status: string;
      enrolled_student_id: string | null;
    }>(
      `SELECT id, application_no, first_name, last_name, guardian_name, guardian_phone, 
              email, gender, to_char(dob, 'YYYY-MM-DD') AS dob, is_rte_quota, status, enrolled_student_id
       FROM admission_applications
       WHERE id = $1 AND tenant_id = $2`,
      [candidateId, tenantId]
    );

    if (candRes.rows.length === 0) return { success: false, error: "Candidate not found" };
    const cand = candRes.rows[0];

    if (cand.enrolled_student_id) {
      return {
        success: false,
        error: "Candidate is already enrolled with student ID: " + cand.enrolled_student_id,
      };
    }

    // 2. Locate default section (e.g. Class 10 Section A)
    const secRes = await query<{ id: string }>(
      `SELECT id FROM sections WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );
    if (secRes.rows.length === 0) {
      return { success: false, error: "No academic class section found in institution" };
    }
    const sectionId = secRes.rows[0].id;

    // 3. Generate sequential Admission No
    const nextRollRes = await query<{ max_roll: number; total_students: number }>(
      `SELECT COALESCE(MAX(roll_no), 0) AS max_roll, COUNT(*)::int AS total_students 
       FROM students 
       WHERE tenant_id = $1`,
      [tenantId]
    );
    const nextRoll = (nextRollRes.rows[0]?.max_roll || 0) + 1;
    const admissionNo = `SCH/2026/0${String(490 + nextRoll).slice(-4)}`;

    // 4. Insert Student
    const stuRes = await query<{ id: string }>(
      `INSERT INTO students (
        tenant_id, section_id, admission_no, roll_no, first_name, last_name,
        dob, gender, category, is_rte_quota, emergency_phone, guardian_name,
        guardian_phone, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        COALESCE($7::date, '2011-05-15'::date), $8,
        CASE WHEN $9 = TRUE THEN 'RTE' ELSE 'GENERAL' END,
        $9, $10, $11, $10, TRUE
      ) RETURNING id`,
      [
        tenantId,
        sectionId,
        admissionNo,
        nextRoll,
        cand.first_name,
        cand.last_name,
        cand.dob,
        cand.gender || "MALE",
        cand.is_rte_quota,
        cand.guardian_phone,
        cand.guardian_name,
      ]
    );

    const studentId = stuRes.rows[0].id;

    // 5. Update Admission Application as Admitted
    await query(
      `UPDATE admission_applications
       SET status = 'ADMITTED', enrolled_student_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND tenant_id = $3`,
      [studentId, candidateId, tenantId]
    );

    // 6. Generate Admission Fee Invoice
    const invCountRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM invoices WHERE tenant_id = $1`,
      [tenantId]
    );
    const invSeq = parseInt(invCountRes.rows[0]?.count || "0", 10) + 1;
    const invoiceNo = `INV/2026/${String(invSeq).padStart(3, "0")}`;
    const initialTuitionFee = cand.is_rte_quota ? 0 : 24500;

    await query(
      `INSERT INTO invoices (
        tenant_id, student_id, invoice_no, title, amount, paid_amount,
        due_date, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, 'Term 1 Admission & Tuition Fee', $4, 0,
        CURRENT_DATE + INTERVAL '15 days',
        CASE WHEN $4 = 0 THEN 'PAID' ELSE 'PENDING' END,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )`,
      [tenantId, studentId, invoiceNo, initialTuitionFee]
    );

    // 7. Log in Audit Trail
    await query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values, created_at)
       VALUES ($1, 'APPLICANT_ENROLLED_AS_STUDENT', 'STUDENT', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        studentId,
        JSON.stringify({
          candidate_id: candidateId,
          admission_no: admissionNo,
          invoice_no: invoiceNo,
          name: `${cand.first_name} ${cand.last_name}`,
        }),
      ]
    );

    revalidatePath("/admin");
    return {
      success: true,
      studentId,
      admissionNo,
      invoiceNo,
    };
  } catch (error) {
    console.error("Failed to enroll applicant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to enroll applicant",
    };
  }
}

export async function deleteAdmissionCandidateAction(candidateId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    await query(
      `DELETE FROM admission_applications WHERE id = $1 AND tenant_id = $2`,
      [candidateId, tenantId]
    );

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete admission candidate:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete candidate",
    };
  }
}
