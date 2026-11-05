"use server";

import prisma from "@/lib/prisma";
import { AttendanceCode } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface AttendanceRecordPayload {
  studentId: string;
  code: string;
  reason?: string;
  source?: string;
}

export async function getAttendanceRosterAction(dateStr: string, sessionStr: string) {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apexacademy" },
    });
    if (!tenant) return { success: false, roster: [] };

    const students = await prisma.student.findMany({
      where: { tenant_id: tenant.id },
      orderBy: { roll_no: "asc" },
      include: {
        section: {
          include: { class: true },
        },
      },
    });

    const parsedDate = new Date(dateStr);

    const existingRecords = await prisma.attendanceRecord.findMany({
      where: {
        tenant_id: tenant.id,
        date: parsedDate,
        session: sessionStr,
      },
    });

    const recordMap = new Map(existingRecords.map((r) => [r.student_id, r]));

    const roster = students.map((s) => {
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
        markedAt: rec ? rec.updated_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
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
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apexacademy" },
    });
    if (!tenant) return { success: false, error: "Tenant not found." };

    const parsedDate = new Date(dateStr);

    for (const rec of records) {
      const student = await prisma.student.findUnique({
        where: { id: rec.studentId },
      });
      if (!student) continue;

      const codeVal = Object.values(AttendanceCode).includes(rec.code as AttendanceCode)
        ? (rec.code as AttendanceCode)
        : AttendanceCode.P;

      await prisma.attendanceRecord.upsert({
        where: {
          tenant_id_student_id_date_session: {
            tenant_id: tenant.id,
            student_id: student.id,
            date: parsedDate,
            session: sessionStr,
          },
        },
        update: {
          code: codeVal,
          reason: rec.reason || null,
          source: rec.source || "MANUAL",
        },
        create: {
          tenant_id: tenant.id,
          student_id: student.id,
          section_id: student.section_id,
          date: parsedDate,
          session: sessionStr,
          code: codeVal,
          reason: rec.reason || null,
          source: rec.source || "MANUAL",
        },
      });
    }

    try {
      revalidatePath("/admin");
    } catch {
      // ignore when outside request context
    }
    return { success: true, count: records.length };
  } catch (error) {
    console.error("Failed to save attendance records to PostgreSQL:", error);
    return { success: false, error: String(error) };
  }
}
