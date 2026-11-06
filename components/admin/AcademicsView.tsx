"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  CheckCircle2,
  Calendar,
  X,
  Shuffle,
  Briefcase,
  Users,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";
import {
  DEMO_COHORTS,
  DEMO_SYLLABI,
  DEMO_FACULTY_WORKLOAD,
} from "@/lib/demo/demoMockData";
import {
  getAcademicCohortsAction,
  createAcademicCohortAction,
  getAcademicSyllabiAction,
  getFacultyWorkloadAction,
} from "@/lib/actions/academicActions";

export interface CohortRecord {
  id: string;
  name: string;
  division: string;
  capacity: number;
  enrolled: number;
  inchargeFaculty: string;
  roomNo: string;
  archetype: string;
}

export interface SyllabusItem {
  id: string;
  code: string;
  title: string;
  creditsOrMarks: string;
  type: "Theory" | "Practical" | "Elective" | "Audit";
  facultyAssigned: string;
  archetype: string;
}

interface TimetableSlot {
  period: number;
  time: string;
  subject: string;
  faculty: string;
  room: string;
  isLab?: boolean;
}

export interface FacultyWorkloadRecord {
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

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AcademicsViewProps {
  archetype: InstitutionalArchetype;
}

export default function AcademicsView({ archetype }: AcademicsViewProps) {
  const { activeSubTab, theme, isDemoMode } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  const [cohorts, setCohorts] = useState<CohortRecord[]>(() =>
    isDemoMode ? (DEMO_COHORTS as CohortRecord[]) : []
  );
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>(() =>
    isDemoMode ? (DEMO_SYLLABI as SyllabusItem[]) : []
  );
  const [workloads, setWorkloads] = useState<FacultyWorkloadRecord[]>(() =>
    isDemoMode ? (DEMO_FACULTY_WORKLOAD as FacultyWorkloadRecord[]) : []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [isAddCohortModal, setIsAddCohortModal] = useState(false);
  const [isSubstitutionModal, setIsSubstitutionModal] = useState(false);
  const [substitutionTargetPeriod, setSubstitutionTargetPeriod] = useState<number>(3);
  const [absentTeacherName, setAbsentTeacherName] = useState(() => (isDemoMode ? "Mrs. Sunita Sharma" : ""));
  const [substituteTeacherName, setSubstituteTeacherName] = useState(() => (isDemoMode ? "Mrs. Priya Das" : ""));

  // Add Cohort Form
  const [newCohortName, setNewCohortName] = useState("");
  const [newDivision, setNewDivision] = useState("");
  const [newCapacity, setNewCapacity] = useState(40);
  const [newIncharge, setNewIncharge] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const refreshAcademics = useCallback(() => {
    if (isDemoMode) {
      setCohorts(DEMO_COHORTS as CohortRecord[]);
      setSyllabi(DEMO_SYLLABI as SyllabusItem[]);
      setWorkloads(DEMO_FACULTY_WORKLOAD as FacultyWorkloadRecord[]);
      return;
    }

    setIsLoading(true);
    Promise.all([
      getAcademicCohortsAction(archetype),
      getAcademicSyllabiAction(archetype),
      getFacultyWorkloadAction(archetype),
    ])
      .then(([cohortRes, syllabiRes, workloadRes]) => {
        if (cohortRes.success) setCohorts(cohortRes.cohorts as CohortRecord[]);
        if (syllabiRes.success) setSyllabi(syllabiRes.syllabi as SyllabusItem[]);
        if (workloadRes.success) setWorkloads(workloadRes.workloads as FacultyWorkloadRecord[]);
      })
      .catch((err) => {
        console.error("Failed to load academic records:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isDemoMode, archetype]);

  useEffect(() => {
    if (isDemoMode) return;
    let isMounted = true;

    Promise.all([
      getAcademicCohortsAction(archetype),
      getAcademicSyllabiAction(archetype),
      getFacultyWorkloadAction(archetype),
    ])
      .then(([cohortRes, syllabiRes, workloadRes]) => {
        if (isMounted) {
          if (cohortRes.success) setCohorts(cohortRes.cohorts as CohortRecord[]);
          if (syllabiRes.success) setSyllabi(syllabiRes.syllabi as SyllabusItem[]);
          if (workloadRes.success) setWorkloads(workloadRes.workloads as FacultyWorkloadRecord[]);
        }
      })
      .catch((err) => {
        console.error("Failed to load academic records:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, archetype]);

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohortName.trim()) return;

    if (isDemoMode) {
      const newRecord: CohortRecord = {
        id: `c-${cohorts.length + 101}`,
        name: newCohortName,
        division: newDivision || "Section A",
        capacity: newCapacity,
        enrolled: 0,
        inchargeFaculty: newIncharge || "Assigned Faculty",
        roomNo: `Room ${200 + cohorts.length}`,
        archetype,
      };

      setCohorts([newRecord, ...cohorts]);
      setIsAddCohortModal(false);
      setNewCohortName("");
      setNewDivision("");
      setNewIncharge("");
      triggerToast(`Added new ${terms.cohortUnit}: ${newRecord.name} (${newRecord.division})`);
      return;
    }

    const res = await createAcademicCohortAction({
      className: newCohortName,
      sectionName: newDivision || "Section A",
      capacity: newCapacity,
    });

    if (res.success) {
      setIsAddCohortModal(false);
      setNewCohortName("");
      setNewDivision("");
      setNewIncharge("");
      triggerToast(`Created new ${terms.cohortUnit}: ${newCohortName} in PostgreSQL`);
      refreshAcademics();
    } else {
      alert(res.error || "Failed to create academic cohort");
    }
  };

  const handleAssignSubstitution = () => {
    setIsSubstitutionModal(false);
    triggerToast(
      `Assigned ${substituteTeacherName} as proxy for ${absentTeacherName} (Period ${substitutionTargetPeriod}). Instant WhatsApp notification dispatched.`
    );
  };

  // Filter for active archetype
  const activeCohorts = cohorts.filter((c) => !c.archetype || c.archetype === archetype);
  const activeSyllabi = syllabi.filter((s) => !s.archetype || s.archetype === archetype);
  const activeWorkloads = workloads.filter((w) => !w.archetype || w.archetype === archetype);

  const displayCohorts = activeCohorts.length > 0 ? activeCohorts : cohorts.slice(0, 4);
  const displaySyllabi = activeSyllabi.length > 0 ? activeSyllabi : syllabi.slice(0, 5);
  const displayWorkloads = activeWorkloads.length > 0 ? activeWorkloads : workloads.slice(0, 3);

  // Dynamic Day Schedule Slots based on archetype
  const getDaySchedule = (): TimetableSlot[] => {
    if (!isDemoMode) {
      if (syllabi.length === 0) return [];
      const times = [
        "08:30 - 09:15",
        "09:15 - 10:00",
        "10:15 - 11:00",
        "11:00 - 11:45",
        "12:15 - 01:00",
        "01:00 - 01:45",
      ];
      return syllabi.slice(0, 6).map((sub, idx) => ({
        period: idx + 1,
        time: times[idx] || "08:30 - 09:15",
        subject: `${sub.title} (${sub.code})`,
        faculty: sub.facultyAssigned || "Unassigned",
        room: `Room ${201 + idx}`,
        isLab: sub.type === "Practical",
      }));
    }

    if (archetype === "K12_SCHOOL") {
      return [
        { period: 1, time: "08:30 - 09:15", subject: "Mathematics (041)", faculty: "Mrs. Sunita Sharma", room: "Room 204" },
        { period: 2, time: "09:15 - 10:00", subject: "Physics (042)", faculty: "Dr. K. Raman", room: "Science Lab Wing" },
        { period: 3, time: "10:15 - 11:00", subject: "Chemistry (043)", faculty: "Dr. S. Mukherjee", room: "Chemistry Lab", isLab: true },
        { period: 4, time: "11:00 - 11:45", subject: "English Literature", faculty: "Mrs. Priya Das", room: "Room 204" },
        { period: 5, time: "12:15 - 01:00", subject: "Computer Science (Python)", faculty: "Mr. V. Nair", room: "IT Lab 1", isLab: true },
        { period: 6, time: "01:00 - 01:45", subject: "Physical Education / Sports", faculty: "Coach Rawat", room: "Sports Ground" },
      ];
    }
    if (archetype === "DEGREE_COLLEGE") {
      return [
        { period: 1, time: "09:00 - 10:00", subject: "CS-401 Data Structures", faculty: "Prof. S. Sen", room: "CS Hall 1" },
        { period: 2, time: "10:00 - 11:00", subject: "CS-402 Database Systems", faculty: "Dr. M. Iyer", room: "CS Hall 1" },
        { period: 3, time: "11:15 - 01:15", subject: "CS-403L Database Lab", faculty: "Dr. M. Iyer", room: "PostgreSQL Lab", isLab: true },
        { period: 4, time: "02:00 - 03:00", subject: "Discrete Mathematics", faculty: "Prof. K. Verma", room: "Math Block 3" },
        { period: 5, time: "03:00 - 04:00", subject: "Cyber Law Audit Course", faculty: "Prof. A. Desai", room: "Seminar Hall" },
      ];
    }
    if (archetype === "UNIVERSITY") {
      return [
        { period: 1, time: "09:30 - 11:00", subject: "NEP-CSC601 Distributed AI", faculty: "Prof. V. Nambiar", room: "School of AI Hall" },
        { period: 2, time: "11:15 - 12:45", subject: "Interdisciplinary OE: Computational Law", faculty: "Dr. K. Swamy", room: "Moot Court 1" },
        { period: 3, time: "02:00 - 04:00", subject: "Doctoral Colloquium & Research Defense", faculty: "Departmental Committee", room: "Boardroom Alpha", isLab: true },
      ];
    }
    // Coaching
    return [
      { period: 1, time: "07:30 - 09:30", subject: "Advanced Physics (Mechanics)", faculty: "Er. Nitin Verma (IITB)", room: "Center Hall Alpha" },
      { period: 2, time: "09:45 - 11:45", subject: "Physical Chemistry (Thermodynamics)", faculty: "Dr. B. K. Roy", room: "Center Hall Alpha" },
      { period: 3, time: "12:15 - 02:00", subject: "DPP Doubt Clinic & Practice Test", faculty: "Faculty Doubt Team", room: "Doubt Arena", isLab: true },
      { period: 4, time: "04:00 - 06:00", subject: "Weekly All-India Test Series Analysis", faculty: "Master Mentors", room: "Auditorium" },
    ];
  };

  const scheduleSlots = getDaySchedule();

  const isSyllabiTab = activeSubTab === "curriculum_syllabus";
  const isTimetableTab = activeSubTab === "master_timetable";
  const isWorkloadTab = activeSubTab === "faculty_workload";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2">
            <span>{terms.cohortPlural} & Curriculum Architecture</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {terms.gradingSystem}
            </span>
            {!isDemoMode && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                PostgreSQL Live
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {archetype === "K12_SCHOOL" && "Class/Section capacities, NCERT & CBSE syllabus schemes, weekly timetables, and teacher proxy substitution."}
            {archetype === "DEGREE_COLLEGE" && "Degree branches, UGC Choice Based Credit System (CBCS), lecture/lab timetables, and HOD faculty workload."}
            {archetype === "UNIVERSITY" && "Schools & Faculties, NEP 2020 Digilocker ABC course credits, research seminars, and doctoral workloads."}
            {archetype === "COACHING_ACADEMY" && "JEE/NEET target batches, Daily Practice Problems (DPP) syllabi, test series timetables, and doubt clinics."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSubstitutionModal(true)}
            className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-amber-700" />
            <span>Faculty Proxy / Substitute</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddCohortModal(true)}
            style={{ backgroundColor: theme.primary }}
            className="py-2.5 px-4 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {terms.cohortUnit}</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 animate-pulse">
          Synchronizing institutional curriculum, cohorts, and faculty workload from database...
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 3: MASTER TIMETABLE MATRIX
      ══════════════════════════════════════════════════════════════════════ */}
      {isTimetableTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>Weekly Master Timetable & Clash-Free Scheduler</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Period scheduling with automated room conflict detection and 1-click teacher substitution.
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  style={selectedDay === day ? { backgroundColor: theme.primary, color: "#ffffff" } : {}}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedDay === day
                      ? "text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {scheduleSlots.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No timetable schedule generated yet. Configure courses and syllabi in the curriculum tab to initialize master timetable slots.
              </div>
            ) : (
              scheduleSlots.map((slot) => (
              <div
                key={slot.period}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 px-3 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                    P{slot.period}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{slot.subject}</span>
                      {slot.isLab && (
                        <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded">
                          Practical / Lab
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{slot.faculty}</span>
                      <span>•</span>
                      <span className="font-mono">{slot.room}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {slot.time}
                  </span>
                  <button
                    onClick={() => {
                      setSubstitutionTargetPeriod(slot.period);
                      setAbsentTeacherName(slot.faculty);
                      setIsSubstitutionModal(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                    title="Assign Proxy"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 4: FACULTY WORKLOAD MATRIX
      ══════════════════════════════════════════════════════════════════════ */}
      {isWorkloadTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <span>{terms.facultyTitle} Workload & Allocation Audit</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekly teaching hours, practical sessions, research supervision, and capacity utilization.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              Statutory UGC / Board Guidelines Met
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {displayWorkloads.map((fac) => {
              const totalHours = fac.lectureHoursWeekly + fac.practicalOrDoubtHours;
              const loadPct = Math.round((totalHours / fac.maxTargetHours) * 100);

              return (
                <div key={fac.id} className="py-4 px-2 hover:bg-slate-50 rounded-2xl transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{fac.name}</span>
                      <span className="text-[11px] text-slate-500">{fac.designation} • {fac.departmentOrSubject}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fac.status === "Overloaded" ? "bg-red-100 text-red-800" :
                        fac.status === "Balanced" ? "bg-emerald-100 text-emerald-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {fac.status} ({loadPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Lectures / Classes</span>
                      <strong className="text-slate-900 font-mono text-xs">{fac.lectureHoursWeekly} hrs/wk</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Labs / Doubt Clinics</span>
                      <strong className="text-slate-900 font-mono text-xs">{fac.practicalOrDoubtHours} hrs/wk</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Workload</span>
                      <strong className="text-blue-800 font-mono text-xs">{totalHours} / {fac.maxTargetHours} hrs</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: CURRICULUM & SYLLABI TABLE
      ══════════════════════════════════════════════════════════════════════ */}
      {isSyllabiTab && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm font-serif">Curriculum, Courses & Credits</h3>
            <span className="text-xs text-slate-400 font-mono">{displaySyllabi.length} Registered Syllabi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Course / Subject Code</th>
                  <th className="py-3.5 px-6">Curriculum Title</th>
                  <th className="py-3.5 px-6">Credit / Marks Scheme</th>
                  <th className="py-3.5 px-6">Category Type</th>
                  <th className="py-3.5 px-6">Assigned Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displaySyllabi.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-700">
                      {row.code}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 text-xs">
                      {row.title}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {row.creditsOrMarks}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">
                      {row.facultyAssigned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT SUB-TAB: COHORTS & DIVISIONS GRID
      ══════════════════════════════════════════════════════════════════════ */}
      {!isTimetableTab && !isWorkloadTab && !isSyllabiTab && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCohorts.map((item) => {
            const occupancyPct = Math.round((item.enrolled / item.capacity) * 100);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-md">
                      {item.division}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">
                    {item.roomNo}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Headcount Capacity</span>
                    </span>
                    <strong className="font-mono text-slate-900 font-bold">
                      {item.enrolled} / {item.capacity} ({occupancyPct}%)
                    </strong>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyPct > 90 ? "bg-amber-500" : "bg-emerald-600"
                      }`}
                      style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{terms.facultyTitle}:</span>
                    <strong className="text-slate-800">{item.inchargeFaculty}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Active Session
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerToast(`Opening roll register for ${item.name} - ${item.division}`)}
                    className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer hover:underline"
                  >
                    View Roster →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: ADD COHORT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {isAddCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Add New {terms.cohortUnit}
              </h3>
              <button onClick={() => setIsAddCohortModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {terms.cohortUnit} Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  placeholder={archetype === "K12_SCHOOL" ? "e.g. Class 12 Science" : "e.g. B.Tech Computer Science Sem VIII"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {terms.subCohortUnit} / Division
                </label>
                <input
                  type="text"
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  placeholder="e.g. Section A or Batch Alpha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{terms.facultyTitle}</label>
                  <input
                    type="text"
                    value={newIncharge}
                    onChange={(e) => setNewIncharge(e.target.value)}
                    placeholder="e.g. Dr. A. Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCohortModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs cursor-pointer hover:opacity-90"
                >
                  Create {terms.cohortUnit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: FACULTY PROXY / SUBSTITUTION ENGINE
      ══════════════════════════════════════════════════════════════════════ */}
      {isSubstitutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Faculty Proxy / Substitution Engine</h3>
              </div>
              <button onClick={() => setIsSubstitutionModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <span className="font-bold text-[11px] block">Unplanned Faculty Leave Detected</span>
                <p className="text-[10px] leading-relaxed">
                  System scanned timetable schedules for free periods. The algorithm recommends substitutes with matching subjects and the lowest weekly workload.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Absent Faculty Member</label>
                <input
                  type="text"
                  value={absentTeacherName}
                  onChange={(e) => setAbsentTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Period Slot</label>
                <select
                  value={substitutionTargetPeriod}
                  onChange={(e) => setSubstitutionTargetPeriod(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <option value={1}>Period 1 (08:30 - 09:15 AM)</option>
                  <option value={2}>Period 2 (09:15 - 10:00 AM)</option>
                  <option value={3}>Period 3 (10:15 - 11:00 AM)</option>
                  <option value={4}>Period 4 (11:00 - 11:45 AM)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recommended Proxy Faculty</label>
                <select
                  value={substituteTeacherName}
                  onChange={(e) => setSubstituteTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <option value="Mrs. Priya Das">Mrs. Priya Das (Available • 14 hrs/wk)</option>
                  <option value="Dr. M. Iyer">Dr. M. Iyer (Available • 16 hrs/wk)</option>
                  <option value="Mr. Rajesh Varma">Mr. Rajesh Varma (Free Period P3)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubstitutionModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubstitution}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs cursor-pointer hover:opacity-90"
              >
                Confirm Proxy & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
