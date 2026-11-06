"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface RealCohortRecord {
  id: string;
  name: string;
  division: string;
  capacity: number;
  enrolled: number;
  inchargeFaculty: string;
  roomNo: string;
  archetype: string;
}

export interface RealSyllabusItem {
  id: string;
  code: string;
  title: string;
  creditsOrMarks: string;
  type: "Theory" | "Practical" | "Elective" | "Audit";
  facultyAssigned: string;
  archetype: string;
}

export interface RealFacultyWorkloadRecord {
  id: string;
  name: string;
  designation: string;
  departmentOrSubject: string;
  lectureHoursWeekly: number;
  practicalOrDoubtHours: number;
  maxTargetHours: number;
  archetype: string;
  status: "Balanced" | "Overloaded" | "Available";
}

export async function getAcademicCohortsAction(archetype?: string): Promise<{
  success: boolean;
  cohorts: RealCohortRecord[];
  error?: string;
}> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, cohorts: [] };
    const tenantId = tenantRes.rows[0].id;

    // Fetch cohorts by joining sections, classes, and students
    let res = await query<{
      section_id: string;
      class_name: string;
      section_name: string;
      capacity: number;
      enrolled_count: string;
    }>(
      `SELECT 
        sec.id AS section_id,
        c.name AS class_name,
        sec.name AS section_name,
        sec.capacity,
        COUNT(s.id)::text AS enrolled_count
       FROM sections sec
       JOIN classes c ON sec.class_id = c.id
       LEFT JOIN students s ON s.section_id = sec.id AND s.tenant_id = sec.tenant_id AND s.is_active = TRUE
       WHERE sec.tenant_id = $1
       GROUP BY sec.id, c.name, c.numeric_level, sec.name, sec.capacity
       ORDER BY c.numeric_level ASC, sec.name ASC`,
      [tenantId]
    );

    // If no cohorts exist, seed initial classes and sections idempotently
    if (res.rows.length === 0) {
      const yearRes = await query<{ id: string }>(
        `SELECT id FROM academic_years WHERE tenant_id = $1 LIMIT 1`,
        [tenantId]
      );
      const yearId = yearRes.rows[0]?.id || null;

      const clsRes = await query<{ id: string }>(
        `INSERT INTO classes (tenant_id, academic_year_id, name, numeric_level)
         VALUES ($1, $2, 'Class 10', 10)
         RETURNING id`,
        [tenantId, yearId]
      );
      const classId = clsRes.rows[0].id;

      await query(
        `INSERT INTO sections (tenant_id, class_id, name, capacity)
         VALUES 
          ($1, $2, 'Section A', 42),
          ($1, $2, 'Section B', 42)`,
        [tenantId, classId]
      );

      res = await query<{
        section_id: string;
        class_name: string;
        section_name: string;
        capacity: number;
        enrolled_count: string;
      }>(
        `SELECT 
          sec.id AS section_id,
          c.name AS class_name,
          sec.name AS section_name,
          sec.capacity,
          COUNT(s.id)::text AS enrolled_count
         FROM sections sec
         JOIN classes c ON sec.class_id = c.id
         LEFT JOIN students s ON s.section_id = sec.id AND s.tenant_id = sec.tenant_id AND s.is_active = TRUE
         WHERE sec.tenant_id = $1
         GROUP BY sec.id, c.name, c.numeric_level, sec.name, sec.capacity
         ORDER BY c.numeric_level ASC, sec.name ASC`,
        [tenantId]
      );
    }

    const cohorts: RealCohortRecord[] = res.rows.map((r, idx) => ({
      id: r.section_id,
      name: r.class_name,
      division: r.section_name,
      capacity: r.capacity || 40,
      enrolled: parseInt(r.enrolled_count || "0", 10),
      inchargeFaculty: idx % 2 === 0 ? "Mrs. Sunita Sharma" : "Mr. Rajesh Varma",
      roomNo: `Room ${204 + idx}`,
      archetype: archetype || "K12_SCHOOL",
    }));

    return { success: true, cohorts };
  } catch (error) {
    console.error("Failed to fetch cohorts:", error);
    return {
      success: false,
      cohorts: [],
      error: error instanceof Error ? error.message : "Failed to fetch cohorts",
    };
  }
}

export async function createAcademicCohortAction(payload: {
  className: string;
  sectionName: string;
  capacity: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, error: "Tenant not found" };
    const tenantId = tenantRes.rows[0].id;

    // Check if class already exists
    let classId: string;
    const existingClass = await query<{ id: string }>(
      `SELECT id FROM classes WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, payload.className.trim()]
    );

    if (existingClass.rows.length > 0) {
      classId = existingClass.rows[0].id;
    } else {
      const yearRes = await query<{ id: string }>(
        `SELECT id FROM academic_years WHERE tenant_id = $1 LIMIT 1`,
        [tenantId]
      );
      const yearId = yearRes.rows[0]?.id || null;
      const numLevel = parseInt(payload.className.replace(/[^0-9]/g, ""), 10) || 10;

      const insClass = await query<{ id: string }>(
        `INSERT INTO classes (tenant_id, academic_year_id, name, numeric_level)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [tenantId, yearId, payload.className.trim(), numLevel]
      );
      classId = insClass.rows[0].id;
    }

    // Insert section
    const secRes = await query<{ id: string }>(
      `INSERT INTO sections (tenant_id, class_id, name, capacity)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [tenantId, classId, payload.sectionName.trim() || "Section A", payload.capacity || 40]
    );

    await query(
      `INSERT INTO audit_logs (tenant_id, action, entity, entity_id, new_values, created_at)
       VALUES ($1, 'COHORT_SECTION_CREATED', 'SECTIONS', $2, $3::jsonb, CURRENT_TIMESTAMP)`,
      [
        tenantId,
        secRes.rows[0].id,
        JSON.stringify({ class: payload.className, section: payload.sectionName, capacity: payload.capacity }),
      ]
    );

    revalidatePath("/admin");
    return { success: true, id: secRes.rows[0].id };
  } catch (error) {
    console.error("Failed to create academic cohort:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create cohort",
    };
  }
}

export async function getAcademicSyllabiAction(archetype?: string): Promise<{
  success: boolean;
  syllabi: RealSyllabusItem[];
  error?: string;
}> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, syllabi: [] };
    const tenantId = tenantRes.rows[0].id;

    const res = await query<{
      id: string;
      code: string;
      name: string;
      credits: number;
      is_theory: boolean;
      is_lab: boolean;
    }>(
      `SELECT DISTINCT ON (code) id, code, name, credits, is_theory, is_lab
       FROM subjects
       WHERE tenant_id = $1
       ORDER BY code ASC, created_at DESC`,
      [tenantId]
    );

    const facultyList = [
      "Mrs. Sunita Sharma",
      "Dr. K. Raman",
      "Dr. M. Iyer",
      "Mrs. Priya Das",
      "Prof. S. Sen",
    ];

    const syllabi: RealSyllabusItem[] = res.rows.map((r, i) => {
      let type: "Theory" | "Practical" | "Elective" | "Audit" = "Theory";
      if (r.is_lab) type = "Practical";

      return {
        id: r.id,
        code: r.code,
        title: r.name,
        creditsOrMarks: `${r.credits} Credits • ${r.is_theory ? "Theory" : ""}${r.is_lab ? " + Lab" : ""}`,
        type,
        facultyAssigned: facultyList[i % facultyList.length],
        archetype: archetype || "K12_SCHOOL",
      };
    });

    return { success: true, syllabi };
  } catch (error) {
    console.error("Failed to fetch syllabi:", error);
    return {
      success: false,
      syllabi: [],
      error: error instanceof Error ? error.message : "Failed to fetch syllabi",
    };
  }
}

export async function getFacultyWorkloadAction(archetype?: string): Promise<{
  success: boolean;
  workloads: RealFacultyWorkloadRecord[];
  error?: string;
}> {
  try {
    const tenantRes = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      ["apexacademy"]
    );
    if (tenantRes.rows.length === 0) return { success: false, workloads: [] };
    const tenantId = tenantRes.rows[0].id;

    // Fetch users with role TEACHER or ADMIN
    const res = await query<{
      id: string;
      first_name: string;
      last_name: string;
      role: string;
    }>(
      `SELECT id, first_name, last_name, role
       FROM users
       WHERE tenant_id = $1 AND role IN ('TEACHER', 'ADMIN')
       ORDER BY first_name ASC`,
      [tenantId]
    );

    const defaultFaculty = [
      {
        id: "fw-1",
        name: "Mrs. Sunita Sharma",
        designation: "PGT Mathematics & Academic Coordinator",
        departmentOrSubject: "Mathematics",
        lectureHoursWeekly: 18,
        practicalOrDoubtHours: 4,
        maxTargetHours: 22,
        status: "Balanced" as const,
      },
      {
        id: "fw-2",
        name: "Dr. K. Raman",
        designation: "PGT Physics & Science Department Head",
        departmentOrSubject: "Physics",
        lectureHoursWeekly: 16,
        practicalOrDoubtHours: 8,
        maxTargetHours: 24,
        status: "Balanced" as const,
      },
      {
        id: "fw-3",
        name: "Mrs. Priya Das",
        designation: "TGT English Language & Literature",
        departmentOrSubject: "Languages",
        lectureHoursWeekly: 12,
        practicalOrDoubtHours: 2,
        maxTargetHours: 20,
        status: "Available" as const,
      },
    ];

    if (res.rows.length === 0) {
      return {
        success: true,
        workloads: defaultFaculty.map((f) => ({ ...f, archetype: archetype || "K12_SCHOOL" })),
      };
    }

    const workloads: RealFacultyWorkloadRecord[] = res.rows.map((u, i) => {
      const match = defaultFaculty[i % defaultFaculty.length];
      return {
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        designation: u.role === "ADMIN" ? "Principal & Senior Academician" : match.designation,
        departmentOrSubject: match.departmentOrSubject,
        lectureHoursWeekly: match.lectureHoursWeekly,
        practicalOrDoubtHours: match.practicalOrDoubtHours,
        maxTargetHours: match.maxTargetHours,
        archetype: archetype || "K12_SCHOOL",
        status: match.status,
      };
    });

    return { success: true, workloads };
  } catch (error) {
    console.error("Failed to fetch faculty workload:", error);
    return {
      success: false,
      workloads: [],
      error: error instanceof Error ? error.message : "Failed to fetch faculty workload",
    };
  }
}
