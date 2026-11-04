"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  FileText,
  Calendar,
  Download,
  X,
  QrCode,
  Printer,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";

interface ExamBroadsheetRecord {
  id: string;
  studentName: string;
  studentId: string;
  cohort: string;
  totalMarksOrScore: string;
  gradeOrSgpaOrRank: string;
  status: "Passed" | "Qualified" | "Distinction" | "Remedial";
  subjectScores: { subject: string; score: string; grade: string }[];
  archetype: InstitutionalArchetype;
}

interface ExamScheduleItem {
  id: string;
  examTitle: string;
  subjectCode: string;
  date: string;
  timeSlot: string;
  hallNo: string;
  chiefInvigilator: string;
  archetype: InstitutionalArchetype;
}

interface HallTicketRecord {
  id: string;
  studentName: string;
  studentId: string;
  cohort: string;
  attendancePct: number;
  eligible: boolean;
  rollNoOrSeatNo: string;
  centerCode: string;
  archetype: InstitutionalArchetype;
}

const SAMPLE_EXAM_RECORDS: ExamBroadsheetRecord[] = [
  // School
  {
    id: "ex-1",
    studentName: "Aarav Sharma",
    studentId: "APX-0491",
    cohort: "Class 10-A",
    totalMarksOrScore: "468 / 500 (93.6%)",
    gradeOrSgpaOrRank: "CBSE Grade A1",
    status: "Distinction",
    subjectScores: [
      { subject: "Mathematics (041)", score: "96 / 100", grade: "A1" },
      { subject: "General Science (086)", score: "94 / 100", grade: "A1" },
      { subject: "English Literature", score: "92 / 100", grade: "A1" },
      { subject: "Social Science", score: "94 / 100", grade: "A1" },
      { subject: "Hindi Course A", score: "92 / 100", grade: "A1" },
    ],
    archetype: "K12_SCHOOL",
  },
  {
    id: "ex-2",
    studentName: "Diya Patel",
    studentId: "APX-0492",
    cohort: "Class 10-A",
    totalMarksOrScore: "442 / 500 (88.4%)",
    gradeOrSgpaOrRank: "CBSE Grade A2",
    status: "Passed",
    subjectScores: [
      { subject: "Mathematics (041)", score: "88 / 100", grade: "A2" },
      { subject: "General Science (086)", score: "90 / 100", grade: "A1" },
      { subject: "English Literature", score: "86 / 100", grade: "A2" },
      { subject: "Social Science", score: "89 / 100", grade: "A2" },
      { subject: "Hindi Course A", score: "89 / 100", grade: "A2" },
    ],
    archetype: "K12_SCHOOL",
  },
  // College
  {
    id: "ex-201",
    studentName: "Aaditya Singhania",
    studentId: "PRN-2026-014",
    cohort: "B.Tech CSE (Sem IV)",
    totalMarksOrScore: "542 / 600 (24 Credits)",
    gradeOrSgpaOrRank: "SGPA: 9.42 (Grade O)",
    status: "Distinction",
    subjectScores: [
      { subject: "Data Structures & Algos", score: "92 / 100 (4 Cr)", grade: "O" },
      { subject: "Database Management", score: "95 / 100 (4 Cr)", grade: "O" },
      { subject: "Operating Systems", score: "88 / 100 (4 Cr)", grade: "A+" },
      { subject: "Discrete Mathematics", score: "90 / 100 (4 Cr)", grade: "O" },
    ],
    archetype: "DEGREE_COLLEGE",
  },
  // University
  {
    id: "ex-301",
    studentName: "Dr. Siddharth Sen",
    studentId: "UNI-9812",
    cohort: "M.Tech / Ph.D. Computing",
    totalMarksOrScore: "Research Broadsheet (18 Cr)",
    gradeOrSgpaOrRank: "CGPA: 9.80 (ABC Verified)",
    status: "Distinction",
    subjectScores: [
      { subject: "Distributed Machine Learning", score: "98 / 100", grade: "O" },
      { subject: "Research Methodology", score: "95 / 100", grade: "O" },
      { subject: "Doctoral Seminar", score: "Satisfactory", grade: "Pass" },
    ],
    archetype: "UNIVERSITY",
  },
  // Coaching
  {
    id: "ex-401",
    studentName: "Harshwardhan Patil",
    studentId: "ASP-881",
    cohort: "Rankers JEE 2027",
    totalMarksOrScore: "284 / 300 (99.8%ile)",
    gradeOrSgpaOrRank: "All-India Rank: 14",
    status: "Qualified",
    subjectScores: [
      { subject: "Physics (+4/-1)", score: "96 / 100", grade: "AIR 8" },
      { subject: "Chemistry (+4/-1)", score: "92 / 100", grade: "AIR 22" },
      { subject: "Mathematics (+4/-1)", score: "96 / 100", grade: "AIR 12" },
    ],
    archetype: "COACHING_ACADEMY",
  },
];

const SAMPLE_SCHEDULES: ExamScheduleItem[] = [
  // School
  { id: "sch-1", examTitle: "Term 1 Board Pattern Examination", subjectCode: "MATH-041", date: "18 Nov 2026", timeSlot: "09:30 AM - 12:30 PM", hallNo: "Main Hall A & B", chiefInvigilator: "Mrs. Sunita Sharma", archetype: "K12_SCHOOL" },
  { id: "sch-2", examTitle: "Term 1 Board Pattern Examination", subjectCode: "SCI-086", date: "21 Nov 2026", timeSlot: "09:30 AM - 12:30 PM", hallNo: "Main Hall A & B", chiefInvigilator: "Dr. K. Raman", archetype: "K12_SCHOOL" },
  // College
  { id: "sch-201", examTitle: "University End-Semester Theory", subjectCode: "CS-401 (DSA)", date: "25 Nov 2026", timeSlot: "10:00 AM - 01:00 PM", hallNo: "Engineering Exam Block 2", chiefInvigilator: "Prof. S. Sen", archetype: "DEGREE_COLLEGE" },
  { id: "sch-202", examTitle: "University End-Semester Lab Exam", subjectCode: "CS-402L (DBMS)", date: "28 Nov 2026", timeSlot: "02:00 PM - 05:00 PM", hallNo: "PostgreSQL Lab Hall", chiefInvigilator: "Dr. M. Iyer", archetype: "DEGREE_COLLEGE" },
  // University
  { id: "sch-301", examTitle: "NEP 2020 Multi-Disciplinary Exam", subjectCode: "NEP-CSC601", date: "30 Nov 2026", timeSlot: "09:30 AM - 12:30 PM", hallNo: "Auditorium Wing A", chiefInvigilator: "Prof. V. Nambiar", archetype: "UNIVERSITY" },
  // Coaching
  { id: "sch-401", examTitle: "Sunday All-India Grand Mock Test #5", subjectCode: "JEE-ADV-P1", date: "10 Nov 2026", timeSlot: "09:00 AM - 12:00 PM", hallNo: "CBT Test Arena 1", chiefInvigilator: "Er. Nitin Verma", archetype: "COACHING_ACADEMY" },
];

const SAMPLE_HALL_TICKETS: HallTicketRecord[] = [
  // School
  { id: "ht-1", studentName: "Aarav Sharma", studentId: "APX-0491", cohort: "Class 10-A", attendancePct: 96.4, eligible: true, rollNoOrSeatNo: "101491", centerCode: "CBSE-CTR-8901", archetype: "K12_SCHOOL" },
  { id: "ht-2", studentName: "Rohan Varma", studentId: "APX-0493", cohort: "Class 10-A", attendancePct: 71.5, eligible: false, rollNoOrSeatNo: "101493", centerCode: "CBSE-CTR-8901", archetype: "K12_SCHOOL" },
  // College
  { id: "ht-201", studentName: "Aaditya Singhania", studentId: "PRN-2026-014", cohort: "B.Tech CSE", attendancePct: 89.2, eligible: true, rollNoOrSeatNo: "PRN-BTECH-014", centerCode: "UNI-ENG-441", archetype: "DEGREE_COLLEGE" },
  { id: "ht-202", studentName: "Meera Krishnan", studentId: "PRN-2026-088", cohort: "B.Sc Biotech", attendancePct: 69.8, eligible: false, rollNoOrSeatNo: "PRN-BSC-088", centerCode: "UNI-SCI-102", archetype: "DEGREE_COLLEGE" },
  // University
  { id: "ht-301", studentName: "Dr. Siddharth Sen", studentId: "UNI-9812", cohort: "Ph.D. Computing", attendancePct: 96.0, eligible: true, rollNoOrSeatNo: "PHD-COMP-9812", centerCode: "CAMPUS-EXAM-01", archetype: "UNIVERSITY" },
  // Coaching
  { id: "ht-401", studentName: "Harshwardhan Patil", studentId: "ASP-881", cohort: "Rankers JEE 2027", attendancePct: 99.1, eligible: true, rollNoOrSeatNo: "JEE-AIR-881", centerCode: "TEST-CENTER-A", archetype: "COACHING_ACADEMY" },
];

interface ExamsViewProps {
  archetype: InstitutionalArchetype;
}

export default function ExamsView({ archetype }: ExamsViewProps) {
  const { activeSubTab, theme } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  const [records] = useState<ExamBroadsheetRecord[]>(SAMPLE_EXAM_RECORDS);
  const [schedules] = useState<ExamScheduleItem[]>(SAMPLE_SCHEDULES);
  const [hallTickets] = useState<HallTicketRecord[]>(SAMPLE_HALL_TICKETS);
  const [selectedReportCard, setSelectedReportCard] = useState<ExamBroadsheetRecord | null>(null);
  const [selectedAdmitCard, setSelectedAdmitCard] = useState<HallTicketRecord | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Filter for active archetype
  const activeRecords = records.filter((r) => r.archetype === archetype);
  const displayRecords = activeRecords.length > 0 ? activeRecords : records.slice(0, 3);

  const activeSchedules = schedules.filter((s) => s.archetype === archetype);
  const displaySchedules = activeSchedules.length > 0 ? activeSchedules : schedules.slice(0, 3);

  const activeHallTickets = hallTickets.filter((h) => h.archetype === archetype);
  const displayHallTickets = activeHallTickets.length > 0 ? activeHallTickets : hallTickets.slice(0, 3);

  const isScheduleTab = activeSubTab === "exam_schedules";
  const isHallTicketsTab = activeSubTab === "hall_tickets";

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
            <span>Evaluation, Broadsheets &amp; Report Cards</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {terms.gradingSystem}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {archetype === "K12_SCHOOL" && "CBSE 9-Point grading, NEP 2020 Holistic Progress Cards (HPC), and board pre-examination schedules."}
            {archetype === "DEGREE_COLLEGE" && "UGC 10-Point SGPA/CGPA evaluation, weighted semester credits, and admit card barring (<75%)."}
            {archetype === "UNIVERSITY" && "Doctoral qualifying broadsheets, dissertation defenses, and DigiLocker ABC credit push."}
            {archetype === "COACHING_ACADEMY" && "Negative marking analysis (+4/-1), All-India Rank (AIR), and speed-accuracy percentiles."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => triggerToast("Exporting consolidated tabulation broadsheet (.xlsx / PDF).")}
          style={{ backgroundColor: theme.primary }}
          className="py-2.5 px-4 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 hover:opacity-90"
        >
          <Download className="w-4 h-4 text-emerald-300" />
          <span>Export Muster / Broadsheet</span>
        </button>
      </div>

      {/* KPI Metric Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grading Architecture</span>
          <span className="text-sm sm:text-base font-black text-slate-900 block mt-1">
            {terms.gradingSystem}
          </span>
          <span className="text-[10px] text-blue-600 mt-1 block">Statutory Validated</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pass / Qualification Rate</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-0.5 font-sans">
            97.8%
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Academic Excellence</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Score / Rank</span>
          <span className="text-xl sm:text-2xl font-black text-amber-700 block mt-0.5 font-sans">
            {archetype === "COACHING_ACADEMY" ? "AIR 14" : "96.2%"}
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">Institution Topper</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hall Ticket Defaulters</span>
          <span className="text-xl sm:text-2xl font-black text-red-700 block mt-0.5 font-sans">
            {displayHallTickets.filter((h) => !h.eligible).length} Barred
          </span>
          <span className="text-[10px] text-red-600 mt-1 block">&lt; 75% Attendance Enforced</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 1: EXAM SCHEDULES
      ══════════════════════════════════════════════════════════════════════ */}
      {isScheduleTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>Examination Timetable &amp; Invigilator Rosters</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory date sheets, session timings, and center hall allocations.
              </p>
            </div>
            <button
              onClick={() => triggerToast("Downloaded examination schedule notice for students & parents.")}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Download Date Sheet</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {displaySchedules.map((sch) => (
              <div key={sch.id} className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{sch.examTitle}</span>
                  <span className="text-[11px] text-slate-500">Subject: {sch.subjectCode} • Chief Invigilator: {sch.chiefInvigilator}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 font-mono text-xs block">{sch.date}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{sch.timeSlot} • {sch.hallNo}</span>
                  </div>

                  <button
                    onClick={() => triggerToast(`Invigilator instructions dispatched for ${sch.subjectCode}`)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer"
                  >
                    Invigilator Roster
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 4: HALL TICKETS & ADMIT CARDS
      ══════════════════════════════════════════════════════════════════════ */}
      {isHallTicketsTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>Examination Hall Tickets &amp; Statutory Eligibility</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enforcing mandatory 75% attendance policy. Defaulters are barred automatically.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
              QR Verification Encrypted
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {displayHallTickets.map((ht) => (
              <div key={ht.id} className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{ht.studentName}</span>
                  <span className="text-[11px] text-slate-500">Seat No: {ht.rollNoOrSeatNo} • Center: {ht.centerCode}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`font-extrabold font-mono text-xs block ${ht.eligible ? "text-emerald-700" : "text-red-700"}`}>
                      {ht.attendancePct}% Attendance
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full inline-block mt-0.5 ${
                      ht.eligible ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {ht.eligible ? "Eligible (Admit Card Live)" : "Barred (< 75% Defaulter)"}
                    </span>
                  </div>

                  {ht.eligible ? (
                    <button
                      onClick={() => setSelectedAdmitCard(ht)}
                      style={{ backgroundColor: theme.primary }}
                      className="px-3 py-1.5 rounded-xl text-white font-bold text-[11px] hover:opacity-90 flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print Admit Card</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerToast(`Issued statutory barring warning notice to ${ht.studentName}'s guardian.`)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-800 font-bold text-[11px] cursor-pointer"
                    >
                      Barring Notice
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT SUB-TAB: TABULATION SHEET / BROADSHEET & REPORT CARDS
      ══════════════════════════════════════════════════════════════════════ */}
      {(!isScheduleTab && !isHallTicketsTab) && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif">Official Broadsheet &amp; Evaluation Muster</h3>
              <span className="text-xs text-slate-500 font-mono">{terms.cohortPlural} Evaluation Register</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Verified By Controller
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Scholar / ID</th>
                  <th className="py-3.5 px-4">Subject Breakdown</th>
                  <th className="py-3.5 px-4">Total Evaluation</th>
                  <th className="py-3.5 px-4">Grade / SGPA / Rank</th>
                  <th className="py-3.5 px-4 text-right">Progress Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>
                        <span className="block font-bold text-slate-900 text-xs">{row.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{row.studentId} • {row.cohort}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        {row.subjectScores.slice(0, 2).map((sub, i) => (
                          <div key={i} className="flex items-center gap-2 text-slate-600">
                            <span>{sub.subject}:</span>
                            <strong className="text-slate-900 font-mono">{sub.score} ({sub.grade})</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {row.totalMarksOrScore}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {row.gradeOrSgpaOrRank}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReportCard(row)}
                        style={{ backgroundColor: theme.primary }}
                        className="py-1 px-3 rounded-xl text-white font-bold text-[11px] hover:opacity-90 flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-300" />
                        <span>View HPC Card</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: HOLISTIC PROGRESS CARD (HPC) PREVIEW MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {archetype === "K12_SCHOOL" ? "CBSE Holistic Progress Card (HPC)" : "Semester Grade Broadsheet"}
                </h3>
              </div>
              <button onClick={() => setSelectedReportCard(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="text-center pb-2 border-b">
                <strong className="text-slate-900 block font-serif text-base">Apex Global Academy</strong>
                <span className="text-[10px] text-slate-500 font-mono">Academic Year 2026-27 • Statutory Assessment Record</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scholar Name</span>
                  <strong className="text-slate-900">{selectedReportCard.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrollment / Seat ID</span>
                  <strong className="text-slate-900 font-mono">{selectedReportCard.studentId}</strong>
                </div>
              </div>

              <div className="pt-2 border-t">
                <span className="font-bold text-slate-700 block mb-1">Subject Scholastic Performance:</span>
                <div className="space-y-1">
                  {selectedReportCard.subjectScores.map((s, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-200/60 text-[11px]">
                      <span>{s.subject}</span>
                      <strong className="font-mono text-slate-900">{s.score} ({s.grade})</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between font-bold text-sm text-slate-900 border-t">
                <span>Final Result:</span>
                <span className="text-emerald-700">{selectedReportCard.gradeOrSgpaOrRank}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Printed Holistic Progress Card for ${selectedReportCard.studentName}`);
                  setSelectedReportCard(null);
                }}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF Progress Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: PRINT ADMIT CARD PREVIEW MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedAdmitCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-sm">Official Examination Admit Card</h3>
              </div>
              <button onClick={() => setSelectedAdmitCard(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Scholar:</span>
                <strong className="text-slate-900">{selectedAdmitCard.studentName}</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Seat / Roll No:</span>
                <strong className="text-slate-900 font-mono">{selectedAdmitCard.rollNoOrSeatNo}</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Exam Center:</span>
                <strong className="text-slate-900">{selectedAdmitCard.centerCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attendance:</span>
                <strong className="text-emerald-700">{selectedAdmitCard.attendancePct}% (Statutory Eligible)</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Printed official Admit Card for ${selectedAdmitCard.studentName}`);
                  setSelectedAdmitCard(null);
                }}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Official Admit Card (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
