"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface RealExamItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export interface RealSubjectItem {
  id: string;
  name: string;
  code: string;
  credits: number;
}

export interface RealExamBroadsheetRecord {
  id: string;
  studentUuid: string;
  studentName: string;
  studentId: string;
  cohort: string;
  totalMarksOrScore: string;
  gradeOrSgpaOrRank: string;
  status: "Passed" | "Qualified" | "Distinction" | "Remedial";
  subjectScores: { subjectId: string; subject: string; score: string; grade: string; numericScore: number; maxScore: number }[];
}

export interface RealHallTicketRecord {
  id: string;
  studentName: string;
  studentId: string;
  cohort: string;
  attendancePct: number;
  eligible: boolean;
  rollNoOrSeatNo: string;
  centerCode: string;
}

export interface RealExamScheduleItem {
  id: string;
  examTitle: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  timeSlot: string;
  hallNo: string;
  chiefInvigilator: string;
}

function calculateGrade(percentage: number): string {
  if (percentage >= 91) return "A1";
  if (percentage >= 81) return "A2";
  if (percentage >= 71) return "B1";
  if (percentage >= 61) return "B2";
  if (percentage >= 51) return "C1";
  if (percentage >= 41) return "C2";
  if (percentage >= 33) return "D";
  return "E";
}

export async function getExamsAction(): Promise<{ success: boolean; exams: RealExamItem[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, exams: [] };
    const tenantId = tenantRes.rows[0].id;

    // Check existing exams
    const res = await query<{
      id: string;
      title: string;
      start_date: string;
      end_date: string;
      is_locked: boolean;
    }>(
      `SELECT id, title, to_char(start_date, 'YYYY-MM-DD') AS start_date, to_char(end_date, 'YYYY-MM-DD') AS end_date, is_locked
       FROM exams
       WHERE tenant_id = $1
       ORDER BY start_date ASC`,
      [tenantId]
    );

    const exams: RealExamItem[] = res.rows.map((row) => ({
      id: row.id,
      title: row.title,
      startDate: row.start_date,
      endDate: row.end_date,
      isLocked: row.is_locked,
    }));

    return { success: true, exams };
  } catch (error) {
    console.error("Failed to load exams from PostgreSQL:", error);
    return { success: false, exams: [] };
  }
}

export async function getSubjectsAction(): Promise<{ success: boolean; subjects: RealSubjectItem[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, subjects: [] };
    const tenantId = tenantRes.rows[0].id;

    const res = await query<{
      id: string;
      name: string;
      code: string;
      credits: number;
    }>(
      `SELECT DISTINCT ON (name) id, name, code, credits
       FROM subjects
       WHERE tenant_id = $1
       ORDER BY name ASC`,
      [tenantId]
    );

    const subjects: RealSubjectItem[] = res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code || "SUB",
      credits: Number(row.credits),
    }));

    return { success: true, subjects };
  } catch (error) {
    console.error("Failed to load subjects from PostgreSQL:", error);
    return { success: false, subjects: [] };
  }
}

export async function getExamBroadsheetAction(examId?: string): Promise<{ success: boolean; records: RealExamBroadsheetRecord[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, records: [] };
    const tenantId = tenantRes.rows[0].id;

    // 1. Resolve target exam
    let targetExamId = examId;
    if (!targetExamId) {
      const examRes = await query<{ id: string }>(
        `SELECT id FROM exams WHERE tenant_id = $1 ORDER BY start_date ASC LIMIT 1`,
        [tenantId]
      );
      if (examRes.rows.length > 0) {
        targetExamId = examRes.rows[0].id;
      }
    }

    if (!targetExamId) return { success: false, records: [] };

    // 2. Fetch all real students
    const studentsRes = await query<{
      id: string;
      admission_no: string;
      roll_no: number | null;
      first_name: string;
      last_name: string;
      class_name: string;
      section_name: string;
    }>(
      `SELECT s.id, s.admission_no, s.roll_no, s.first_name, s.last_name,
              c.name AS class_name, sec.name AS section_name
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       WHERE s.tenant_id = $1 AND s.is_active = TRUE
       ORDER BY s.roll_no ASC`,
      [tenantId]
    );

    // 3. Fetch distinct subjects for the class
    const subjectsRes = await query<{
      id: string;
      name: string;
      code: string;
    }>(
      `SELECT DISTINCT ON (name) id, name, code
       FROM subjects
       WHERE tenant_id = $1
       ORDER BY name ASC`,
      [tenantId]
    );

    // 4. Fetch all marks recorded for this exam
    const marksRes = await query<{
      student_id: string;
      subject_id: string;
      score: number;
      max_score: number;
      grade: string | null;
      is_absent: boolean;
    }>(
      `SELECT student_id, subject_id, score, max_score, grade, is_absent
       FROM marks
       WHERE tenant_id = $1 AND exam_id = $2`,
      [tenantId, targetExamId]
    );

    // Map marks: key = student_id:subject_id
    const marksMap = new Map<string, { score: number; maxScore: number; grade: string; isAbsent: boolean }>();
    for (const m of marksRes.rows) {
      marksMap.set(`${m.student_id}:${m.subject_id}`, {
        score: Number(m.score),
        maxScore: Number(m.max_score),
        grade: m.grade || calculateGrade((Number(m.score) / Number(m.max_score)) * 100),
        isAbsent: m.is_absent,
      });
    }

    // 5. Construct broadsheet rows
    const records: RealExamBroadsheetRecord[] = studentsRes.rows.map((st) => {
      let totalObtained = 0;
      let totalMax = 0;

      const subjectScores = subjectsRes.rows.slice(0, 5).map((sub) => {
        const mark = marksMap.get(`${st.id}:${sub.id}`);
        if (mark) {
          totalObtained += mark.score;
          totalMax += mark.maxScore;
          return {
            subjectId: sub.id,
            subject: `${sub.name} (${sub.code || "041"})`,
            score: mark.isAbsent ? "ABSENT" : `${mark.score} / ${mark.maxScore}`,
            grade: mark.isAbsent ? "AB" : mark.grade,
            numericScore: mark.score,
            maxScore: mark.maxScore,
          };
        } else {
          return {
            subjectId: sub.id,
            subject: `${sub.name} (${sub.code || "041"})`,
            score: "Pending Entry",
            grade: "-",
            numericScore: 0,
            maxScore: 100,
          };
        }
      });

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const overallGrade = totalMax > 0 ? calculateGrade(percentage) : "-";
      let status: "Passed" | "Qualified" | "Distinction" | "Remedial" = "Passed";

      if (totalMax === 0) status = "Remedial";
      else if (percentage >= 85) status = "Distinction";
      else if (percentage >= 33) status = "Passed";
      else status = "Remedial";

      return {
        id: st.id,
        studentUuid: st.id,
        studentName: `${st.first_name} ${st.last_name}`,
        studentId: st.admission_no,
        cohort: `${st.class_name} - ${st.section_name}`,
        totalMarksOrScore: `${totalObtained} / ${totalMax} (${percentage.toFixed(1)}%)`,
        gradeOrSgpaOrRank: `CBSE Grade ${overallGrade}`,
        status,
        subjectScores,
      };
    });

    return { success: true, records };
  } catch (error) {
    console.error("Failed to load exam broadsheet from PostgreSQL:", error);
    return { success: false, records: [] };
  }
}

export async function saveStudentMarksAction(payload: {
  examId: string;
  studentId: string;
  subjectId: string;
  score: number;
  maxScore?: number;
  isAbsent?: boolean;
}) {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    const maxScore = payload.maxScore || 100;
    const score = payload.isAbsent ? 0 : payload.score;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const grade = payload.isAbsent ? "AB" : calculateGrade(percentage);

    const res = await query<{ id: string; score: number; grade: string }>(
      `INSERT INTO marks (
          tenant_id,
          exam_id,
          student_id,
          subject_id,
          score,
          max_score,
          grade,
          is_absent,
          updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id, exam_id, student_id, subject_id)
       DO UPDATE SET
          score = EXCLUDED.score,
          max_score = EXCLUDED.max_score,
          grade = EXCLUDED.grade,
          is_absent = EXCLUDED.is_absent,
          updated_at = CURRENT_TIMESTAMP
       RETURNING id, score, grade`,
      [
        tenantId,
        payload.examId,
        payload.studentId,
        payload.subjectId,
        score,
        maxScore,
        grade,
        !!payload.isAbsent,
      ]
    );

    // Log to audit trail
    await query(
      `INSERT INTO audit_logs (
          tenant_id,
          action,
          entity,
          entity_id,
          new_values,
          created_at
       ) VALUES ($1, 'MARKS_RECORDED', 'MARKS', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        res.rows[0].id,
        JSON.stringify({
          examId: payload.examId,
          studentId: payload.studentId,
          subjectId: payload.subjectId,
          score,
          maxScore,
          grade,
        }),
      ]
    );

    try {
      revalidatePath("/admin");
    } catch {
      // outside request context
    }

    return { success: true, markId: res.rows[0].id, grade };
  } catch (error) {
    console.error("Failed to save student marks to PostgreSQL:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save marks" };
  }
}

export async function getRealHallTicketsAction(): Promise<{ success: boolean; hallTickets: RealHallTicketRecord[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, hallTickets: [] };
    const tenantId = tenantRes.rows[0].id;

    // Fetch students with attendance aggregation
    const res = await query<{
      id: string;
      admission_no: string;
      roll_no: number | null;
      first_name: string;
      last_name: string;
      class_name: string;
      section_name: string;
      present_count: string;
      total_count: string;
    }>(
      `SELECT s.id, s.admission_no, s.roll_no, s.first_name, s.last_name,
              c.name AS class_name, sec.name AS section_name,
              COUNT(CASE WHEN ar.code IN ('P', 'OD', 'L') THEN 1 END) AS present_count,
              COUNT(ar.id) AS total_count
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       LEFT JOIN attendance_records ar ON ar.student_id = s.id AND ar.tenant_id = s.tenant_id
       WHERE s.tenant_id = $1 AND s.is_active = TRUE
       GROUP BY s.id, s.admission_no, s.roll_no, s.first_name, s.last_name, c.name, sec.name
       ORDER BY s.roll_no ASC`,
      [tenantId]
    );

    const hallTickets: RealHallTicketRecord[] = res.rows.map((row) => {
      const present = Number(row.present_count);
      const total = Number(row.total_count);
      // Strictly real attendance calculation: 0.0% if no attendance records logged yet
      const attendancePct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0.0;
      const eligible = total > 0 && attendancePct >= 75.0;

      return {
        id: row.id,
        studentName: `${row.first_name} ${row.last_name}`,
        studentId: row.admission_no,
        cohort: `${row.class_name} - ${row.section_name}`,
        attendancePct,
        eligible,
        rollNoOrSeatNo: row.roll_no ? `SEAT-${String(row.roll_no).padStart(3, "0")}` : `SEAT-${row.admission_no.slice(-3)}`,
        centerCode: `EXAM-CTR-${(row.class_name || "MAIN").replace(/\s+/g, "").toUpperCase()}`,
      };
    });

    return { success: true, hallTickets };
  } catch (error) {
    console.error("Failed to load hall tickets from PostgreSQL:", error);
    return { success: false, hallTickets: [] };
  }
}

export async function getRealExamSchedulesAction(): Promise<{ success: boolean; schedules: RealExamScheduleItem[] }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, schedules: [] };
    const tenantId = tenantRes.rows[0].id;

    const subjectsRes = await query<{
      id: string;
      name: string;
      code: string;
    }>(
      `SELECT DISTINCT ON (name) id, name, code
       FROM subjects
       WHERE tenant_id = $1
       ORDER BY name ASC`,
      [tenantId]
    );

    // Query real faculty users for invigilation assignment
    const facultyRes = await query<{ first_name: string; last_name: string }>(
      `SELECT first_name, last_name FROM users WHERE tenant_id = $1 AND role IN ('TEACHER', 'ADMIN') ORDER BY first_name ASC`,
      [tenantId]
    );
    const facultyNames = facultyRes.rows.map((f) => `${f.first_name} ${f.last_name}`);

    const schedules: RealExamScheduleItem[] = subjectsRes.rows.map((sub, i) => ({
      id: sub.id,
      examTitle: "Scheduled Assessment",
      subjectCode: sub.code || `SUB-0${i + 1}`,
      subjectName: sub.name,
      date: "Scheduled per date sheet",
      timeSlot: "09:30 AM - 12:30 PM",
      hallNo: "Designated Examination Hall",
      chiefInvigilator: facultyNames.length > 0 ? facultyNames[i % facultyNames.length] : "Unassigned Invigilator",
    }));

    return { success: true, schedules };
  } catch (error) {
    console.error("Failed to load exam schedules from PostgreSQL:", error);
    return { success: false, schedules: [] };
  }
}
