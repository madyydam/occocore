"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Send,
  Fingerprint,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Printer,
  ShieldCheck,
  Check,
  X,
  Eye,
  Users,
  FileSpreadsheet,
  Inbox,
  Info,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";

// ══════════════════════════════════════════════════════════════════════════
// ATTENDANCE CODE ENGINE TYPES (PRD SECTION 7.1)
// ══════════════════════════════════════════════════════════════════════════
export type AttendanceCode =
  | "P"   // Present (1.0)
  | "L"   // Late before register close (1.0 / policy flagged)
  | "LC"  // Late after register close (0.0 absent or policy)
  | "HD"  // Half day (0.5)
  | "OD"  // On duty (sports, competition, school circular, 1.0)
  | "EL"  // Excused leave (approved parent leave, 0.0 in denominator)
  | "ML"  // Medical leave (doctor certificate attached, 0.0 in denominator)
  | "A"   // Absent, unexplained (0.0, triggers parent alert)
  | "SU"  // Suspended (disciplinary order, 0.0)
  | "H"   // Holiday / No school (excluded from possible days)
  | "NE"; // Not enrolled yet / transferred (excluded from possible days)

export interface CodeRuleDefinition {
  code: AttendanceCode;
  label: string;
  name: string;
  weight: number; // 1.0, 0.5, 0.0
  inDenominator: boolean;
  isAuthorised: boolean;
  triggersAlert: boolean;
  requiresDocument: boolean;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const ATTENDANCE_CODES: Record<AttendanceCode, CodeRuleDefinition> = {
  P: { code: "P", label: "P", name: "Present", weight: 1.0, inDenominator: true, isAuthorised: true, triggersAlert: false, requiresDocument: false, badgeBg: "bg-emerald-50", badgeText: "text-emerald-700", badgeBorder: "border-emerald-200" },
  L: { code: "L", label: "L", name: "Late (Before Cutoff)", weight: 1.0, inDenominator: true, isAuthorised: true, triggersAlert: false, requiresDocument: false, badgeBg: "bg-amber-50", badgeText: "text-amber-700", badgeBorder: "border-amber-200" },
  LC: { code: "LC", label: "LC", name: "Late (After Cutoff)", weight: 0.0, inDenominator: true, isAuthorised: false, triggersAlert: true, requiresDocument: false, badgeBg: "bg-orange-50", badgeText: "text-orange-700", badgeBorder: "border-orange-200" },
  HD: { code: "HD", label: "HD", name: "Half Day", weight: 0.5, inDenominator: true, isAuthorised: true, triggersAlert: false, requiresDocument: false, badgeBg: "bg-blue-50", badgeText: "text-blue-700", badgeBorder: "border-blue-200" },
  OD: { code: "OD", label: "OD", name: "On Duty (Sports/Event)", weight: 1.0, inDenominator: true, isAuthorised: true, triggersAlert: false, requiresDocument: true, badgeBg: "bg-indigo-50", badgeText: "text-indigo-700", badgeBorder: "border-indigo-200" },
  EL: { code: "EL", label: "EL", name: "Excused Leave", weight: 0.0, inDenominator: true, isAuthorised: true, triggersAlert: false, requiresDocument: false, badgeBg: "bg-sky-50", badgeText: "text-sky-700", badgeBorder: "border-sky-200" },
  ML: { code: "ML", label: "ML", name: "Medical Leave", weight: 0.0, inDenominator: true, isAuthorised: true, triggersAlert: false, requiresDocument: true, badgeBg: "bg-teal-50", badgeText: "text-teal-700", badgeBorder: "border-teal-200" },
  A: { code: "A", label: "A", name: "Unexplained Absent", weight: 0.0, inDenominator: true, isAuthorised: false, triggersAlert: true, requiresDocument: false, badgeBg: "bg-rose-50", badgeText: "text-rose-700", badgeBorder: "border-rose-200" },
  SU: { code: "SU", label: "SU", name: "Suspended", weight: 0.0, inDenominator: true, isAuthorised: false, triggersAlert: true, requiresDocument: true, badgeBg: "bg-slate-100", badgeText: "text-slate-700", badgeBorder: "border-slate-300" },
  H: { code: "H", label: "H", name: "Holiday / Recess", weight: 0.0, inDenominator: false, isAuthorised: true, triggersAlert: false, requiresDocument: false, badgeBg: "bg-purple-50", badgeText: "text-purple-700", badgeBorder: "border-purple-200" },
  NE: { code: "NE", label: "NE", name: "Not Enrolled / Exited", weight: 0.0, inDenominator: false, isAuthorised: true, triggersAlert: false, requiresDocument: false, badgeBg: "bg-slate-50", badgeText: "text-slate-400", badgeBorder: "border-slate-200" },
};

// ══════════════════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ══════════════════════════════════════════════════════════════════════════
export interface StudentRosterRecord {
  id: string;
  name: string;
  studentId: string;
  rollNo: number;
  guardianName: string;
  guardianPhone: string;
  todayCode: AttendanceCode;
  todaySource: "Biometric" | "RFID Turnstile" | "Manual Teacher" | "Approved Leave" | "Unmarked";
  timeLogged: string;
  monthPresentDays: number;
  monthTotalDays: number;
  yearPresentDays: number;
  yearTotalDays: number;
  lastFiveDays: AttendanceCode[];
  hasMedicalCertificate?: boolean;
  isCondonationApplied?: boolean;
  condonationStatus?: "Pending" | "Approved" | "Not Applied";
  reasonNote?: string;
  examHoldApproved?: boolean;
  archetype: InstitutionalArchetype;
}

export interface BiometricDevice {
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

export interface LeaveRequestItem {
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
  archetype: InstitutionalArchetype;
}

export interface UnmatchedPunchItem {
  id: string;
  badgeUid: string;
  deviceLocation: string;
  timestamp: string;
  suggestedMatch: string;
  status: "Unresolved" | "Resolved";
}

export interface ParentAlertLogItem {
  id: string;
  studentName: string;
  studentId: string;
  guardianPhone: string;
  triggerEvent: "Absent Today" | "Late After 08:30" | "3rd Consecutive Absent" | "Below 75% Notice";
  channel: "WhatsApp Business" | "Govt DLT SMS";
  dltTemplateId: string;
  timestamp: string;
  status: "Delivered" | "Read" | "Failed";
  parentReply?: string;
}

// Initial Sample Roster with realistic Indian names & attendance metrics
const INITIAL_ROSTER: StudentRosterRecord[] = [
  {
    id: "st-1",
    name: "Aarav Sharma",
    studentId: "APX-0491",
    rollNo: 1,
    guardianName: "Sunil Sharma",
    guardianPhone: "9845497084",
    todayCode: "P",
    todaySource: "Biometric",
    timeLogged: "08:14 AM",
    monthPresentDays: 22,
    monthTotalDays: 24,
    yearPresentDays: 136,
    yearTotalDays: 142,
    lastFiveDays: ["P", "P", "P", "L", "P"],
    archetype: "K12_SCHOOL",
  },
  {
    id: "st-2",
    name: "Diya Patel",
    studentId: "APX-0492",
    rollNo: 2,
    guardianName: "Ramesh Patel",
    guardianPhone: "9820123456",
    todayCode: "P",
    todaySource: "RFID Turnstile",
    timeLogged: "08:11 AM",
    monthPresentDays: 24,
    monthTotalDays: 24,
    yearPresentDays: 140,
    yearTotalDays: 142,
    lastFiveDays: ["P", "P", "P", "P", "P"],
    archetype: "K12_SCHOOL",
  },
  {
    id: "st-3",
    name: "Rohan Varma",
    studentId: "APX-0493",
    rollNo: 3,
    guardianName: "Mahesh Varma",
    guardianPhone: "9444123890",
    todayCode: "ML",
    todaySource: "Approved Leave",
    timeLogged: "Leave Slip",
    monthPresentDays: 15,
    monthTotalDays: 24,
    yearPresentDays: 98,
    yearTotalDays: 142,
    lastFiveDays: ["P", "A", "ML", "ML", "ML"],
    hasMedicalCertificate: true,
    isCondonationApplied: true,
    condonationStatus: "Pending",
    reasonNote: "Viral hepatitis recovery; hospital discharge summary verified.",
    archetype: "K12_SCHOOL",
  },
  {
    id: "st-4",
    name: "Ananya Deshmukh",
    studentId: "APX-0494",
    rollNo: 4,
    guardianName: "Sanjay Deshmukh",
    guardianPhone: "9123456780",
    todayCode: "P",
    todaySource: "Manual Teacher",
    timeLogged: "08:20 AM",
    monthPresentDays: 23,
    monthTotalDays: 24,
    yearPresentDays: 134,
    yearTotalDays: 142,
    lastFiveDays: ["P", "P", "P", "P", "P"],
    archetype: "K12_SCHOOL",
  },
  {
    id: "st-5",
    name: "Karan Johar",
    studentId: "APX-0495",
    rollNo: 5,
    guardianName: "Yash Johar",
    guardianPhone: "9988776655",
    todayCode: "L",
    todaySource: "Biometric",
    timeLogged: "08:24 AM",
    monthPresentDays: 21,
    monthTotalDays: 24,
    yearPresentDays: 125,
    yearTotalDays: 142,
    lastFiveDays: ["P", "L", "P", "P", "L"],
    archetype: "K12_SCHOOL",
  },
  {
    id: "st-6",
    name: "Siddharth Sen",
    studentId: "APX-0496",
    rollNo: 6,
    guardianName: "Abhijit Sen",
    guardianPhone: "9811443322",
    todayCode: "A",
    todaySource: "Unmarked",
    timeLogged: "--:--",
    monthPresentDays: 14,
    monthTotalDays: 24,
    yearPresentDays: 91,
    yearTotalDays: 142,
    lastFiveDays: ["A", "P", "A", "A", "A"],
    examHoldApproved: false,
    reasonNote: "Chronic absenteeism on Mondays/Fridays; counsellor call scheduled.",
    archetype: "K12_SCHOOL",
  },
  {
    id: "st-7",
    name: "Pooja Hegde",
    studentId: "APX-0497",
    rollNo: 7,
    guardianName: "Manjunath Hegde",
    guardianPhone: "9766554433",
    todayCode: "OD",
    todaySource: "Approved Leave",
    timeLogged: "Circular #44",
    monthPresentDays: 22,
    monthTotalDays: 24,
    yearPresentDays: 138,
    yearTotalDays: 142,
    lastFiveDays: ["P", "P", "OD", "OD", "OD"],
    reasonNote: "State Level Inter-School Badminton Championship (Bengaluru).",
    archetype: "K12_SCHOOL",
  },
  {
    id: "st-8",
    name: "Tanmay Bhat",
    studentId: "APX-0498",
    rollNo: 8,
    guardianName: "Satish Bhat",
    guardianPhone: "9977881122",
    todayCode: "LC",
    todaySource: "RFID Turnstile",
    timeLogged: "08:44 AM",
    monthPresentDays: 18,
    monthTotalDays: 24,
    yearPresentDays: 112,
    yearTotalDays: 142,
    lastFiveDays: ["P", "P", "LC", "P", "LC"],
    reasonNote: "School bus delay on Outer Ring Road.",
    archetype: "K12_SCHOOL",
  },
];

const INITIAL_DEVICES: BiometricDevice[] = [
  { id: "dev-1", name: "Main Campus Gate Turnstile Alpha", type: "RFID Turnstile", ipAddress: "192.168.10.45", location: "North Main Gate", status: "Online", batteryStatus: "Mains AC (100%)", lastHeartbeat: "Just now", totalPunchesToday: 842, queueLength: 0, firmware: "v4.2.1-sec" },
  { id: "dev-2", name: "Senior Block Biometric Terminal #1", type: "Fingerprint", ipAddress: "192.168.10.48", location: "Academic Block 1st Floor", status: "Online", batteryStatus: "Battery 84%", lastHeartbeat: "3s ago", totalPunchesToday: 215, queueLength: 0, firmware: "v4.1.8-bio" },
  { id: "dev-3", name: "Science & Robotics Lab Facial Pod", type: "Face Recognition Pod", ipAddress: "192.168.10.52", location: "Innovation Hub Foyer", status: "Online", batteryStatus: "Mains AC (100%)", lastHeartbeat: "8s ago", totalPunchesToday: 310, queueLength: 0, firmware: "v5.0.2-ai" },
  { id: "dev-4", name: "Hostel & Mess Gatekeeper Terminal", type: "RFID Turnstile", ipAddress: "192.168.10.60", location: "Dormitory Block C", status: "Online", batteryStatus: "Mains AC (100%)", lastHeartbeat: "Just now", totalPunchesToday: 420, queueLength: 0, firmware: "v4.2.1-sec" },
];

const INITIAL_LEAVES: LeaveRequestItem[] = [
  { id: "lv-1", applicantName: "Rohan Varma", studentId: "APX-0493", roleOrCohort: "Class 10-A", type: "Medical Leave", dates: "1 Nov - 5 Nov 2026", daysCount: 5, reason: "Viral hepatitis under specialist care. Medical fitness slip attached.", status: "Approved", hasAttachment: true, medicalDocName: "Apollo_Clinic_Cert_981.pdf", submittedAt: "1 Nov 2026 09:00 AM", archetype: "K12_SCHOOL" },
  { id: "lv-2", applicantName: "Siddharth Sen", studentId: "APX-0496", roleOrCohort: "Class 10-A", type: "Casual Leave", dates: "4 Nov 2026", daysCount: 1, reason: "Family religious pilgrimage.", status: "Pending", hasAttachment: false, submittedAt: "Today 07:30 AM", archetype: "K12_SCHOOL" },
  { id: "lv-3", applicantName: "Pooja Hegde", studentId: "APX-0497", roleOrCohort: "Class 10-A", type: "On-Duty (OD) Event", dates: "2 Nov - 4 Nov 2026", daysCount: 3, reason: "Selected for State Badminton Championship under Sports Authority of India.", status: "Approved", hasAttachment: true, medicalDocName: "SAI_Selection_Order_2026.pdf", submittedAt: "28 Oct 2026 11:30 AM", archetype: "K12_SCHOOL" },
];

const INITIAL_UNMATCHED_PUNCHES: UnmatchedPunchItem[] = [
  { id: "un-1", badgeUid: "RFID-CARD-099418", deviceLocation: "North Main Gate Turnstile", timestamp: "Today 08:08 AM", suggestedMatch: "Rohan Varma (Card Re-issue)", status: "Unresolved" },
  { id: "un-2", badgeUid: "FP-SENSOR-HASH-2291", deviceLocation: "Academic Block 1st Floor", timestamp: "Today 08:12 AM", suggestedMatch: "Aarav Sharma (Dry skin retry)", status: "Unresolved" },
];

const INITIAL_ALERTS_LOG: ParentAlertLogItem[] = [
  { id: "alt-1", studentName: "Siddharth Sen", studentId: "APX-0496", guardianPhone: "9811443322", triggerEvent: "Absent Today", channel: "WhatsApp Business", dltTemplateId: "DLT-TE-2026-ATT-01", timestamp: "Today 08:35 AM", status: "Delivered", parentReply: "Viral fever, visiting clinic" },
  { id: "alt-2", studentName: "Tanmay Bhat", studentId: "APX-0498", guardianPhone: "9977881122", triggerEvent: "Late After 08:30", channel: "Govt DLT SMS", dltTemplateId: "DLT-TE-2026-ATT-02", timestamp: "Today 08:45 AM", status: "Delivered", parentReply: "School bus was delayed at toll plaza" },
  { id: "alt-3", studentName: "Rohan Varma", studentId: "APX-0493", guardianPhone: "9444123890", triggerEvent: "Below 75% Notice", channel: "WhatsApp Business", dltTemplateId: "DLT-TE-2026-ATT-04", timestamp: "Yesterday 04:30 PM", status: "Read", parentReply: "Medical certificate submitted to Principal" },
];

interface AttendanceViewProps {
  archetype: InstitutionalArchetype;
}

export default function AttendanceView({ archetype }: AttendanceViewProps) {
  const { activeSubTab, theme } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  // ══════════════════════════════════════════════════════════════════════════
  // GLOBAL CONTROL BAR STATES (PRD SECTION 6)
  // ══════════════════════════════════════════════════════════════════════════
  const [selectedCampus, setSelectedCampus] = useState("Main Campus (North Wing)");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2026-2027");
  const [selectedTerm, setSelectedTerm] = useState("Term 1 (April - September 2026)");
  const [selectedCohort, setSelectedCohort] = useState(
    archetype === "K12_SCHOOL" ? "Class 10-A" : archetype === "DEGREE_COLLEGE" ? "B.Tech CSE - Sem IV" : "Batch Alpha"
  );
  const [selectedDate, setSelectedDate] = useState("2026-11-03");
  const [selectedSession, setSelectedSession] = useState("Full Day");

  // Roster, Devices, Leaves, and Alerts state
  const [roster, setRoster] = useState<StudentRosterRecord[]>(INITIAL_ROSTER);
  const [devices] = useState<BiometricDevice[]>(INITIAL_DEVICES);
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>(INITIAL_LEAVES);
  const [unmatchedPunches, setUnmatchedPunches] = useState<UnmatchedPunchItem[]>(INITIAL_UNMATCHED_PUNCHES);
  const [alertsLog] = useState<ParentAlertLogItem[]>(INITIAL_ALERTS_LOG);

  // Register state: Draft -> Submitted -> Locked
  const [registerStatus, setRegisterStatus] = useState<"Draft" | "Submitted" | "Locked">("Draft");
  const [toastMessage, setToastMessage] = useState("");
  const [undoSnapshot, setUndoSnapshot] = useState<StudentRosterRecord[] | null>(null);

  // Modals & Drawers
  const [reasonDrawerStudent, setReasonDrawerStudent] = useState<StudentRosterRecord | null>(null);
  const [reasonCategory, setReasonCategory] = useState("Medical / Illness");
  const [reasonNoteText, setReasonNoteText] = useState("");

  const [student360Dossier, setStudent360Dossier] = useState<StudentRosterRecord | null>(null);
  const [registerCellAudit, setRegisterCellAudit] = useState<{
    student: StudentRosterRecord;
    day: number;
    code: AttendanceCode;
    source: string;
    timestamp: string;
  } | null>(null);

  const [isMarkAllModal, setIsMarkAllModal] = useState(false);
  const [isAlertsBroadcastModal, setIsAlertsBroadcastModal] = useState(false);
  const [isCondonationModal, setIsCondonationModal] = useState<StudentRosterRecord | null>(null);

  // Register View Mode
  const [registerViewMode, setRegisterViewMode] = useState<"month" | "week" | "day" | "term" | "year">("month");
  const [selectedRegisterMonth] = useState("November 2026");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // CALCULATIONS FOLLOWING METRIC DICTIONARY (PRD SECTION 7.2)
  // ══════════════════════════════════════════════════════════════════════════
  const metrics = useMemo(() => {
    const total = roster.length;
    let presentEquivalent = 0;
    let absent = 0;
    let late = 0;
    let onLeave = 0;
    let unmarked = 0;

    roster.forEach((st) => {
      if (st.todaySource === "Unmarked") {
        unmarked++;
      } else if (st.todayCode === "P" || st.todayCode === "OD") {
        presentEquivalent += 1.0;
      } else if (st.todayCode === "L") {
        presentEquivalent += 1.0;
        late++;
      } else if (st.todayCode === "HD") {
        presentEquivalent += 0.5;
        onLeave++;
      } else if (st.todayCode === "LC") {
        absent++;
        late++;
      } else if (st.todayCode === "A" || st.todayCode === "SU") {
        absent++;
      } else if (st.todayCode === "EL" || st.todayCode === "ML") {
        onLeave++;
      }
    });

    const activePossible = total - roster.filter((r) => r.todayCode === "H" || r.todayCode === "NE").length;
    const percentage = activePossible > 0 ? ((presentEquivalent / activePossible) * 100).toFixed(1) : "0.0";

    return {
      total,
      presentEquivalent: presentEquivalent.toFixed(1),
      absent,
      late,
      onLeave,
      unmarked,
      percentage,
      activePossible,
    };
  }, [roster]);

  // Code modification handler
  const handleSetCode = (studentId: string, newCode: AttendanceCode) => {
    setRoster((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            todayCode: newCode,
            todaySource: "Manual Teacher",
            timeLogged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        }
        return s;
      })
    );

    // If absent or late after close, prompt quick reason drawer
    if (newCode === "A" || newCode === "LC" || newCode === "ML") {
      const target = roster.find((s) => s.id === studentId);
      if (target) {
        setReasonDrawerStudent(target);
        setReasonCategory(newCode === "ML" ? "Medical / Illness" : "Unexplained / Personal");
        setReasonNoteText(target.reasonNote || "");
      }
    }
  };

  // Mark all present with 10-second undo
  const executeMarkAllPresent = () => {
    setUndoSnapshot([...roster]);
    setRoster((prev) =>
      prev.map((s) => {
        if (s.todaySource === "Unmarked" || s.todayCode === "A") {
          return {
            ...s,
            todayCode: "P",
            todaySource: "Manual Teacher",
            timeLogged: "08:15 AM",
          };
        }
        return s;
      })
    );
    setIsMarkAllModal(false);
    triggerToast("Marked all unmarked students as Present. Click Undo within 10s if accidental.");
  };

  const handleUndo = () => {
    if (undoSnapshot) {
      setRoster(undoSnapshot);
      setUndoSnapshot(null);
      triggerToast("Reverted attendance state to previous snapshot.");
    }
  };

  const saveReasonNote = () => {
    if (reasonDrawerStudent) {
      setRoster((prev) =>
        prev.map((s) =>
          s.id === reasonDrawerStudent.id
            ? { ...s, reasonNote: `[${reasonCategory}] ${reasonNoteText}` }
            : s
        )
      );
      triggerToast(`Saved verified reason note for ${reasonDrawerStudent.name}`);
      setReasonDrawerStudent(null);
    }
  };

  const handleSubmitRegister = () => {
    setRegisterStatus("Submitted");
    triggerToast("Class Roll Call submitted! Auto-lock scheduled in 3 days.");
  };

  const handleApproveLeave = (leaveId: string, studentName: string) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: "Approved" } : l))
    );
    triggerToast(`Approved leave request for ${studentName}. Synchronized register codes.`);
  };

  // Resolve unmatched punch
  const handleResolveUnmatched = (punchId: string) => {
    setUnmatchedPunches((prev) => prev.filter((p) => p.id !== punchId));
    triggerToast("Assigned biometric punch to scholar record successfully.");
  };

  // Condonation case approval
  const handleApproveCondonation = (studentId: string) => {
    setRoster((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, condonationStatus: "Approved", examHoldApproved: false }
          : s
      )
    );
    setIsCondonationModal(null);
    triggerToast("Statutory condonation case approved under CBSE Examination Bye-Laws!");
  };

  // Human-gated admit card hold toggle
  const handleToggleExamHold = (studentId: string, currentHold: boolean) => {
    setRoster((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, examHoldApproved: !currentHold } : s
      )
    );
    triggerToast(
      !currentHold
        ? "Principal approved statutory admit-card hold."
        : "Released admit-card hold following student counsel."
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Bar */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-3 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
          <span>{toastMessage}</span>
          {undoSnapshot && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] cursor-pointer"
            >
              Undo (10s)
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          1. PERSISTENT GLOBAL CONTROL BAR (PRD SECTION 6)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Institutional Attendance Command Bar
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                >
                  Single Source of Truth
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {terms.cohortUnit} presence across day, week, month muster and annual board eligibility
              </p>
            </div>
          </div>

          {/* Sync Chip & Status */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>TCP/IP Biometrics Synced (0 in Queue)</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
              Register: <span className="text-slate-900 font-extrabold">{registerStatus}</span>
            </div>
          </div>
        </div>

        {/* Control Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* 1. Campus */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Campus / Branch
            </label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Main Campus (North Wing)">Main Campus (North Wing)</option>
              <option value="South City Annex">South City Annex</option>
              <option value="Executive City Campus">Executive City Campus</option>
            </select>
          </div>

          {/* 2. Academic Year */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026-2027">2026-2027 (Active Session)</option>
              <option value="2025-2026">2025-2026 (Archived)</option>
            </select>
          </div>

          {/* 3. Term / Semester */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Term / Semester
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Term 1 (April - September 2026)">Term 1 (Apr - Sept 2026)</option>
              <option value="Term 2 (October - March 2027)">Term 2 (Oct - Mar 2027)</option>
              <option value="Semester IV (Autonomous)">Semester IV (Autonomous)</option>
            </select>
          </div>

          {/* 4. Class / Section */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {terms.cohortUnit} &amp; Section
            </label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Class 10-A">Class 10-A (CBSE Broadsheet)</option>
              <option value="Class 10-B">Class 10-B (CBSE Broadsheet)</option>
              <option value="Class 9-A">Class 9-A (Middle Wing)</option>
              <option value="Grade 12-Science">Grade 12-Science (Board Candidates)</option>
              <option value="B.Tech CSE - Sem IV">B.Tech CSE - Sem IV (UGC 75%)</option>
            </select>
          </div>

          {/* 5. Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Roll Call Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {/* 6. Session / Period */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Session / Period
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Full Day">Full Day (Morning Roll Call)</option>
              <option value="Morning AM">Morning Session (AM)</option>
              <option value="Afternoon PM">Afternoon Session (PM)</option>
              <option value="Period 1">Period 1 (08:30 - 09:15)</option>
              <option value="Period 2">Period 2 (09:15 - 10:00)</option>
              <option value="Period 3">Period 3 (10:15 - 11:00)</option>
            </select>
          </div>
        </div>

        {/* Metric Scope Indicator Banner (PRD Section 3 & 4) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Audit Scope:</span>
            <span className="font-mono font-bold text-slate-900">
              1 Apr to 3 Nov 2026 · 142 Possible Working Days
            </span>
            <span className="text-slate-300">•</span>
            <span>Register Close: <strong className="text-slate-800">08:30 AM</strong></span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span>Teacher: <strong>Mrs. Sunita Sharma</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">Auto-lock in 3 days</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. SUB-TAB 1: TODAY (ROLL CALL)
      ══════════════════════════════════════════════════════════════════════ */}
      {(!activeSubTab || activeSubTab === "today_rollcall" || activeSubTab === "daily_roll_call") && (
        <div className="space-y-6">
          {/* KPI Metric Pods (Strict Metric Dictionary) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Tile 1: Present Equivalent */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Present Equivalent</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                  {metrics.percentage}%
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans block">
                {metrics.presentEquivalent} <span className="text-xs text-slate-400 font-normal">/ {metrics.activePossible}</span>
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Includes P, L, OD &amp; 0.5×HD
              </span>
            </div>

            {/* Tile 2: Unexplained Absent */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Unexplained Absent</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800">
                  Alert Active
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-rose-600 font-sans block">
                {metrics.absent}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Triggers parent SMS/WhatsApp
              </span>
            </div>

            {/* Tile 3: Late Arrivals */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Late Arrivals</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                  Cutoff 08:30
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-amber-700 font-sans block">
                {metrics.late}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                1 Before bell, 1 After cutoff (LC)
              </span>
            </div>

            {/* Tile 4: Authorised Leave */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>On Approved Leave</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                  Slip Verified
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-blue-700 font-sans block">
                {metrics.onLeave}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Medical (ML) + Sports (OD)
              </span>
            </div>

            {/* Tile 5: Unmarked */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Unmarked Roster</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metrics.unmarked === 0 ? "Complete" : "Action Needed"}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans block">
                {metrics.unmarked}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Requires teacher sign-off
              </span>
            </div>
          </div>

          {/* Action Header & Roster Grid */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-serif">
                  {selectedCohort} · Roll Call Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Session: {selectedSession} · Bell Time 08:00 AM · Register Closes 08:30 AM
                </p>
              </div>

              {/* Fast Roll-Call Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsMarkAllModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAlertsBroadcastModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Notify Absentees ({metrics.absent})</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitRegister}
                  style={{ backgroundColor: theme.primary }}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Register</span>
                </button>
              </div>
            </div>

            {/* Roster Table with Code Engine Palette */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-2 w-12 text-center">Roll</th>
                    <th className="py-3 px-3">Scholar &amp; ID</th>
                    <th className="py-3 px-3">Today&apos;s Source</th>
                    <th className="py-3 px-3">5-Day Strip</th>
                    <th className="py-3 px-3">Year %</th>
                    <th className="py-3 px-3">Mark Code (Palette)</th>
                    <th className="py-3 px-2 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.map((st) => {
                    const isDefaulter = (st.yearPresentDays / st.yearTotalDays) * 100 < 75.0;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Roll No */}
                        <td className="py-3 px-2 text-center font-bold text-slate-500 font-mono">
                          {st.rollNo}
                        </td>

                        {/* Scholar Name & Contact */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              onClick={() => setStudent360Dossier(st)}
                              className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs text-white shrink-0 cursor-pointer shadow-2xs hover:opacity-90"
                              style={{ backgroundColor: theme.primary }}
                            >
                              {st.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span
                                onClick={() => setStudent360Dossier(st)}
                                className="font-extrabold text-slate-900 text-xs block truncate hover:underline cursor-pointer"
                              >
                                {st.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {st.studentId} • {st.guardianPhone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Today's Source & Capture Time */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 text-[11px] block">
                              {st.todaySource}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{st.timeLogged}</span>
                            </span>
                          </div>
                        </td>

                        {/* 5-Day Sparkline Strip */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            {st.lastFiveDays.map((c, i) => {
                              const r = ATTENDANCE_CODES[c];
                              return (
                                <span
                                  key={i}
                                  title={`Day ${i + 1}: ${r.name}`}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-extrabold ${r.badgeBg} ${r.badgeText} border ${r.badgeBorder}`}
                                >
                                  {c}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Year % & Statutory Warning */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono font-bold text-xs ${
                                  isDefaulter ? "text-rose-600" : "text-emerald-700"
                                }`}
                              >
                                {((st.yearPresentDays / st.yearTotalDays) * 100).toFixed(1)}%
                              </span>
                              {isDefaulter && (
                                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-rose-100 text-rose-800">
                                  &lt;75% Risk
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              {st.yearPresentDays}/{st.yearTotalDays} days
                            </span>
                          </div>
                        </td>

                        {/* Code Engine Interactive Palette */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {(["P", "L", "LC", "HD", "OD", "EL", "ML", "A"] as AttendanceCode[]).map((c) => {
                              const r = ATTENDANCE_CODES[c];
                              const isSelected = st.todayCode === c;

                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleSetCode(st.id, c)}
                                  title={`${r.name} (${r.weight * 100}%)`}
                                  className={`w-6 h-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "ring-2 ring-slate-800 shadow-xs scale-105 " + r.badgeBg + " " + r.badgeText + " border " + r.badgeBorder
                                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/80"
                                  }`}
                                >
                                  {c}
                                </button>
                              );
                            })}

                            {/* Note button */}
                            {st.reasonNote && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReasonDrawerStudent(st);
                                  setReasonNoteText(st.reasonNote || "");
                                }}
                                title={st.reasonNote}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200 cursor-pointer truncate max-w-28"
                              >
                                {st.reasonNote.split(" ")[0]}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Dossier action */}
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => setStudent360Dossier(st)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Inspect Student 360 Attendance Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          3. SUB-TAB 2: REGISTERS & CLASSIC MONTHLY MUSTER (PRD SECTION 8.2)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "registers" && (
        <div className="space-y-6">
          {/* View Mode Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRegisterViewMode("month")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  registerViewMode === "month"
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Month Muster (Grid 1-30)
              </button>
              <button
                type="button"
                onClick={() => setRegisterViewMode("week")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  registerViewMode === "week"
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Week (Mon - Sat)
              </button>
              <button
                type="button"
                onClick={() => setRegisterViewMode("day")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  registerViewMode === "day"
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Day Matrix (All Classes)
              </button>
              <button
                type="button"
                onClick={() => setRegisterViewMode("term")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  registerViewMode === "term"
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Term / Cumulative
              </button>
            </div>

            {/* Print & Export Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerToast("Generating print-ready CBSE Board Register Muster PDF...")}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Muster (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast("Exporting consolidated Register to Excel (.xlsx)...")}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Classic Monthly Register Grid (Students as Rows, Days 1-30 as Columns) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-serif">
                  Official Attendance Register · {selectedRegisterMonth}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCohort} · Total Possible Working Days: 24 · Click any cell to inspect audit history
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                  <span>Present (P)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
                  <span>Absent (A)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                  <span>Late (L)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-purple-100 border border-purple-300" />
                  <span>Holiday (H)</span>
                </span>
              </div>
            </div>

            {/* Scrollable Register Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase bg-slate-50">
                    <th className="py-2.5 px-3 text-left sticky left-0 bg-slate-50 z-10 w-44">
                      Scholar Name / Roll
                    </th>
                    {/* Days 1 to 30 */}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                      const isSunday = day % 7 === 1; // Sundays simulation
                      const isDiwaliHoliday = day === 12 || day === 13;

                      return (
                        <th
                          key={day}
                          className={`py-2 px-1 w-7 text-center font-mono ${
                            isSunday ? "bg-slate-200/70 text-slate-600" : isDiwaliHoliday ? "bg-purple-100/60 text-purple-700" : ""
                          }`}
                        >
                          {day}
                        </th>
                      );
                    })}
                    {/* Totals */}
                    <th className="py-2 px-2 bg-slate-100 font-bold">P</th>
                    <th className="py-2 px-2 bg-slate-100 font-bold">A</th>
                    <th className="py-2 px-2 bg-slate-100 font-bold">L</th>
                    <th className="py-2 px-2 bg-slate-100 font-bold">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.map((st) => {
                    const isBelow75 = (st.monthPresentDays / st.monthTotalDays) * 100 < 75.0;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Sticky Student Name */}
                        <td className="py-2 px-3 text-left sticky left-0 bg-white z-10 font-bold text-slate-800 truncate shadow-xs">
                          <span className="text-slate-400 font-mono text-[10px] pr-1.5">{st.rollNo}.</span>
                          <span
                            onClick={() => setStudent360Dossier(st)}
                            className="hover:underline cursor-pointer"
                          >
                            {st.name}
                          </span>
                        </td>

                        {/* Days 1 to 30 cells */}
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                          const isSunday = day % 7 === 1;
                          const isDiwali = day === 12 || day === 13;
                          let dayCode: AttendanceCode = "P";

                          if (isSunday || isDiwali) {
                            dayCode = "H";
                          } else if (st.id === "st-3" && day >= 1 && day <= 5) {
                            dayCode = "ML";
                          } else if (st.id === "st-6" && (day === 2 || day === 6 || day === 9 || day === 16 || day === 23)) {
                            dayCode = "A";
                          } else if (st.id === "st-5" && (day === 4 || day === 18)) {
                            dayCode = "L";
                          } else if (st.id === "st-7" && day >= 2 && day <= 4) {
                            dayCode = "OD";
                          }

                          const r = ATTENDANCE_CODES[dayCode];

                          return (
                            <td
                              key={day}
                              onClick={() =>
                                setRegisterCellAudit({
                                  student: st,
                                  day,
                                  code: dayCode,
                                  source: dayCode === "ML" ? "Approved Medical Leave Slip" : dayCode === "H" ? "Institutional Holiday Calendar" : "RFID Turnstile #1",
                                  timestamp: "08:14 AM",
                                })
                              }
                              className={`py-1.5 px-0.5 text-[10px] font-mono font-bold cursor-pointer transition-transform hover:scale-110 ${
                                isSunday
                                  ? "bg-slate-100 text-slate-400"
                                  : isDiwali
                                  ? "bg-purple-50 text-purple-600"
                                  : r.badgeBg + " " + r.badgeText
                              }`}
                            >
                              {isSunday ? "—" : dayCode}
                            </td>
                          );
                        })}

                        {/* Summary Totals */}
                        <td className="py-2 px-2 font-mono font-bold text-emerald-700 bg-emerald-50/40">
                          {st.monthPresentDays}
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-rose-600 bg-rose-50/40">
                          {st.monthTotalDays - st.monthPresentDays}
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-amber-700 bg-amber-50/40">
                          {st.lastFiveDays.filter((c) => c === "L").length}
                        </td>
                        <td className="py-2 px-2 font-mono font-black bg-slate-50">
                          <span className={isBelow75 ? "text-rose-600" : "text-emerald-700"}>
                            {((st.monthPresentDays / st.monthTotalDays) * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4. SUB-TAB 3: ANALYTICS & TRENDS (PRINCIPAL MORNING VIEW BY 9:30 AM)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          {/* Principal's Morning View Banner */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Principal Executive View · 09:30 AM Cutoff
                </span>
                <h3 className="text-base font-extrabold text-slate-900 font-serif">
                  Morning Roll Call Compliance &amp; Campus Attendance Pulse
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                14 / 16 Classes Submitted (87.5%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <span className="font-extrabold text-amber-900 block text-xs">
                  2 Classes Unmarked / Delayed
                </span>
                <p className="text-[11px] text-amber-800">
                  Class 8-C (Mr. V. Joshi) and Class 11-Commerce (Mrs. K. Pillai) have not marked by 09:30 AM.
                </p>
                <button
                  type="button"
                  onClick={() => triggerToast("Pushed reminder notification to delayed faculty via WhatsApp.")}
                  className="px-3 py-1 rounded-lg bg-amber-700 text-white font-bold text-[10px] shadow-2xs cursor-pointer hover:bg-amber-800"
                >
                  Nudge Faculty via WhatsApp
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5">
                <span className="font-extrabold text-blue-900 block text-xs">
                  Parent Alerts Dispatch Status
                </span>
                <p className="text-[11px] text-blue-800">
                  98 Absentees dispatched via DLT SMS &amp; WhatsApp Business. 2 failures queued for phone call.
                </p>
                <span className="font-mono font-bold text-blue-900 text-[11px] block">
                  97.9% Delivered within 12 min
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-slate-900 block text-xs">
                  Biometric Terminal Network Health
                </span>
                <p className="text-[11px] text-slate-600">
                  4 of 4 devices online with 1,787 total punches synced. 0 dropped packets.
                </p>
                <span className="font-mono font-bold text-emerald-700 text-[11px] block">
                  AIS-140 GPS &amp; TCP/IP Latency: 14ms
                </span>
              </div>
            </div>
          </div>

          {/* Weekday Absenteeism Heatmap (PRD Section 8.3) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-serif">
              Day-of-Week Drop-off Heatmap (Term 1)
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing chronic absenteeism patterns across days. Noticeable Monday/Friday drops trigger counsellor intervention.
            </p>

            <div className="grid grid-cols-6 gap-3 text-center">
              {[
                { day: "Monday", pct: "93.2%", status: "Mild Drop", color: "bg-amber-50 text-amber-800 border-amber-200" },
                { day: "Tuesday", pct: "96.8%", status: "Peak Attendance", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                { day: "Wednesday", pct: "97.4%", status: "Peak Attendance", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                { day: "Thursday", pct: "96.1%", status: "Good Standing", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                { day: "Friday", pct: "91.5%", status: "Weekend Extension", color: "bg-orange-50 text-orange-800 border-orange-200" },
                { day: "Saturday", pct: "89.4%", status: "Activity Day Slump", color: "bg-rose-50 text-rose-800 border-rose-200" },
              ].map((item) => (
                <div key={item.day} className={`p-4 rounded-2xl border ${item.color} space-y-1`}>
                  <span className="font-bold text-xs block">{item.day}</span>
                  <span className="text-xl font-black block font-mono">{item.pct}</span>
                  <span className="text-[10px] font-semibold block">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          5. SUB-TAB 4: ELIGIBILITY & SHORTFALL (DEFECT/DEFULTER MANAGEMENT)
      ══════════════════════════════════════════════════════════════════════ */}
      {(activeSubTab === "eligibility_shortfall" || activeSubTab === "defaulter_alerts") && (
        <div className="space-y-6">
          {/* Statutory Compliance Banner (PRD Section 8.4 - Human Gated) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-serif">
                    Statutory Board Attendance Shortfall &amp; Condonation Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    CBSE Rule 13 / UGC 75% Mandate · 1 January 2027 Cut-off Date · Zero Silent Auto-Barring
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  Threshold: 75.0%
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Cut-off: 1 Jan 2027
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Human-Gated Decision Mandate:</strong> The system identifies attendance shortfall and generates counsel tasks. An admit-card hold or board exam barring requires explicit Principal review and authenticated digital sign-off with justified cause.
              </span>
            </div>
          </div>

          {/* Shortfall Candidates Ledger & Recovery Planner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 font-serif">
              Scholars Below Statutory 75% Threshold (Class 10-A)
            </h4>

            <div className="divide-y divide-slate-100">
              {roster
                .filter((st) => (st.yearPresentDays / st.yearTotalDays) * 100 < 75.0)
                .map((st) => {
                  const currentPct = ((st.yearPresentDays / st.yearTotalDays) * 100).toFixed(1);
                  // Recovery math: Days remaining = 35; Need 75% of (142 + 35 = 177) => 133 days; Needs (133 - st.yearPresentDays)
                  const requiredDays = Math.max(0, Math.ceil(0.75 * 177) - st.yearPresentDays);

                  return (
                    <div key={st.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{st.name}</span>
                          <span className="font-mono text-xs text-slate-400">({st.studentId})</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {currentPct}% Present
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Guardian: {st.guardianName} ({st.guardianPhone})
                        </p>
                        {st.reasonNote && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 inline-block">
                            {st.reasonNote}
                          </p>
                        )}
                      </div>

                      {/* Recovery Planner (PRD ATT-205) */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          75% Recovery Target Before 1 Jan 2027
                        </span>
                        <span className="font-bold text-slate-800 block">
                          Must attend <strong className="text-emerald-700 font-mono text-sm">{requiredDays}</strong> of next 35 working days
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Condonation eligibility: {st.hasMedicalCertificate ? "Qualified on Medical Grounds" : "Awaiting Medical Slips"}
                        </span>
                      </div>

                      {/* Actions: Condonation & Exam Hold */}
                      <div className="flex items-center gap-2 self-start lg:self-center">
                        <button
                          type="button"
                          onClick={() => setIsCondonationModal(st)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
                        >
                          Condonation Dossier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleExamHold(st.id, !!st.examHoldApproved)}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            st.examHoldApproved
                              ? "bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                              : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {st.examHoldApproved ? "Admit Card Barred (Hold Active)" : "Authorize Hold"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          6. SUB-TAB 5: LEAVE & RETROSPECTIVE CORRECTIONS (PRD SECTION 8.5)
      ══════════════════════════════════════════════════════════════════════ */}
      {(activeSubTab === "leave_corrections" || activeSubTab === "leave_requests") && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-serif">
                  Leave Applications &amp; Retrospective Corrections
                </h3>
                <p className="text-xs text-slate-500">
                  Parent-submitted leave slips, medical certificate verification, and register code overrides.
                </p>
              </div>

              <button
                type="button"
                onClick={() => triggerToast("Opened New Administrative Leave Application form.")}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all self-start sm:self-auto cursor-pointer"
              >
                + Apply Scholar Leave
              </button>
            </div>

            <div className="space-y-3">
              {leaves.map((lv) => (
                <div
                  key={lv.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">{lv.applicantName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({lv.roleOrCohort})</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {lv.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lv.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {lv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{lv.reason}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Dates: <strong>{lv.dates}</strong> ({lv.daysCount} days)</span>
                      {lv.hasAttachment && (
                        <span className="text-indigo-600 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{lv.medicalDocName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-center">
                    {lv.status === "Pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveLeave(lv.id, lv.applicantName)}
                          style={{ backgroundColor: theme.primary }}
                          className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 cursor-pointer"
                        >
                          Approve Leave
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Rejected leave application for ${lv.applicantName}.`)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Synchronized to Register</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          7. SUB-TAB 6: DEVICES & HARDWARE SYNC (PRD SECTION 8.6)
      ══════════════════════════════════════════════════════════════════════ */}
      {(activeSubTab === "devices_sync" || activeSubTab === "biometric_sync") && (
        <div className="space-y-6">
          {/* Fleet Status & Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {devices.map((dev) => (
              <div key={dev.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {dev.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs block leading-tight">
                    {dev.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    IP: {dev.ipAddress} • {dev.type}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Today&apos;s Punches:</span>
                    <strong className="text-slate-900 font-mono">{dev.totalPunchesToday}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Power / Battery:</span>
                    <span className="text-emerald-700 font-bold">{dev.batteryStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Heartbeat:</span>
                    <span className="text-slate-500">{dev.lastHeartbeat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Unmatched Punches Inbox (PRD ATT-604) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900 font-serif">
                  Unmatched Punches Inbox ({unmatchedPunches.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Cryptographic Idempotent Event Queue
              </span>
            </div>

            {unmatchedPunches.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                All hardware punches successfully reconciled with enrolled scholars.
              </div>
            ) : (
              <div className="space-y-3">
                {unmatchedPunches.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{p.badgeUid}</span>
                        <span className="text-[10px] text-slate-500">at {p.deviceLocation}</span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Suggested Match: <strong>{p.suggestedMatch}</strong> • Time: {p.timestamp}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResolveUnmatched(p.id)}
                      style={{ backgroundColor: theme.primary }}
                      className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-2xs hover:opacity-90 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      Assign to Scholar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          8. SUB-TAB 7: PARENT ALERTS LOG (DLT COMPLIANCE - PRD SECTION 8.7)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "alerts_log" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-serif">
                  Parent Absence &amp; Defaulter Alerts Dispatch Log
                </h3>
                <p className="text-xs text-slate-500">
                  Govt DLT-Registered Service Implicit SMS &amp; WhatsApp Business Cloud API Telemetry.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAlertsBroadcastModal(true)}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all cursor-pointer"
              >
                + Broadcast Attendance Alerts
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Scholar &amp; ID</th>
                    <th className="py-3 px-3">Guardian Contact</th>
                    <th className="py-3 px-3">Trigger Event</th>
                    <th className="py-3 px-3">Channel &amp; DLT ID</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Parent Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alertsLog.map((alt) => (
                    <tr key={alt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 block">{alt.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{alt.studentId}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {alt.guardianPhone}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {alt.triggerEvent}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block text-xs">{alt.channel}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{alt.dltTemplateId}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            alt.status === "Delivered" || alt.status === "Read"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {alt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-600 text-xs italic">
                          {alt.parentReply ? `"${alt.parentReply}"` : "Awaiting response"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          9. SUB-TAB 8: POLICY & CODE ENGINE MATRIX (PRD SECTION 7.1 & 8.8)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "policy_codes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-serif">
              Attendance Policy &amp; Code Engine Rules
            </h3>
            <p className="text-xs text-slate-500">
              A mark is a fact, its meaning is policy. The rules engine below dictates how each code counts towards possible days and student percentage.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Code Name</th>
                    <th className="py-3 px-3">In Possible Days</th>
                    <th className="py-3 px-3">Counts as Present</th>
                    <th className="py-3 px-3">Authorised</th>
                    <th className="py-3 px-3">Parent Alert</th>
                    <th className="py-3 px-3">Document Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.values(ATTENDANCE_CODES).map((def) => (
                    <tr key={def.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${def.badgeBg} ${def.badgeText} border ${def.badgeBorder}`}>
                          {def.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{def.name}</td>
                      <td className="py-3 px-3">{def.inDenominator ? "Yes" : "No (Excluded)"}</td>
                      <td className="py-3 px-3 font-mono font-bold">{def.weight === 1.0 ? "1.0 (Full)" : def.weight === 0.5 ? "0.5 (Half)" : "0.0 (None)"}</td>
                      <td className="py-3 px-3">{def.isAuthorised ? "Yes" : "No"}</td>
                      <td className="py-3 px-3">{def.triggersAlert ? "Yes (Instant SMS/WA)" : "No"}</td>
                      <td className="py-3 px-3">{def.requiresDocument ? "Yes (Medical/Letter)" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: QUICK REASON DRAWER (PRD ATT-104)
      ══════════════════════════════════════════════════════════════════════ */}
      {reasonDrawerStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-serif">
                  Capture Absence / Late Verification Reason
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {reasonDrawerStudent.name} ({reasonDrawerStudent.studentId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReasonDrawerStudent(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Reason Category
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Medical / Illness">Medical / Severe Illness</option>
                  <option value="Family Emergency">Family Emergency / Bereavement</option>
                  <option value="School Bus / Transport Breakdown">School Bus / Traffic Delay</option>
                  <option value="Special State Competition">Special State / Sports Activity</option>
                  <option value="Unexplained / Truancy">Unexplained / Truancy</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teacher Verified Notes
                </label>
                <textarea
                  value={reasonNoteText}
                  onChange={(e) => setReasonNoteText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Guardian confirmed appointment with pediatrician at 10 AM..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReasonDrawerStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveReasonNote}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 cursor-pointer"
              >
                Save Verified Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: STUDENT 360 ATTENDANCE PROFILE (PRD ATT-203)
      ══════════════════════════════════════════════════════════════════════ */}
      {student360Dossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
                  style={{ backgroundColor: theme.primary }}
                >
                  {student360Dossier.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base font-serif">
                    {student360Dossier.name} · Student 360 Dossier
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {student360Dossier.studentId} · Roll #{student360Dossier.rollNo} · {selectedCohort}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStudent360Dossier(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cumulative Attendance
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono block mt-0.5">
                    {((student360Dossier.yearPresentDays / student360Dossier.yearTotalDays) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {student360Dossier.yearPresentDays} of {student360Dossier.yearTotalDays} sessions
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Class Average
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono block mt-0.5">
                    94.2%
                  </span>
                  <span className="text-[10px] text-slate-500">Cohort comparison</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Board Status
                  </span>
                  <span
                    className={`text-sm font-extrabold block mt-2 ${
                      (student360Dossier.yearPresentDays / student360Dossier.yearTotalDays) * 100 >= 75.0
                        ? "text-emerald-700"
                        : "text-rose-600"
                    }`}
                  >
                    {(student360Dossier.yearPresentDays / student360Dossier.yearTotalDays) * 100 >= 75.0
                      ? "Statutory Eligible"
                      : "Shortfall Warning"}
                  </span>
                </div>
              </div>

              {/* Monthly Breakdown Trend */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 text-xs block">
                  Month-on-Month Attendance Trend (2026)
                </span>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
                  {[
                    { m: "Apr", pct: "96%" },
                    { m: "May", pct: "98%" },
                    { m: "Jul", pct: "94%" },
                    { m: "Aug", pct: "92%" },
                    { m: "Sep", pct: "90%" },
                    { m: "Oct", pct: "88%" },
                    { m: "Nov", pct: "86%" },
                  ].map((x) => (
                    <div key={x.m} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block">{x.m}</span>
                      <strong className="text-slate-800 font-mono block">{x.pct}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guardian Contact & History */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 text-xs block">
                  Guardian &amp; Emergency Escalation Contacts
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Primary Guardian:</span>
                  <strong className="text-slate-900">{student360Dossier.guardianName}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Registered Mobile (SMS / WA):</span>
                  <strong className="text-slate-900 font-mono">+91 {student360Dossier.guardianPhone}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudent360Dossier(null)}
                className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: REGISTER CELL AUDIT POPUP (PRD ATT-202)
      ══════════════════════════════════════════════════════════════════════ */}
      {registerCellAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Cell Attendance Audit Trail</h4>
                <span className="text-[10px] text-slate-500">
                  {registerCellAudit.student.name} · {registerCellAudit.day} Nov 2026
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRegisterCellAudit(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Code:</span>
                <span className="font-bold font-mono text-slate-900">
                  {registerCellAudit.code} ({ATTENDANCE_CODES[registerCellAudit.code].name})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Policy Weight:</span>
                <span className="font-bold font-mono text-emerald-700">
                  {ATTENDANCE_CODES[registerCellAudit.code].weight * 100}% Present
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capture Source:</span>
                <span className="font-bold text-slate-800">{registerCellAudit.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded By:</span>
                <span className="font-bold text-slate-800">Mrs. Sunita Sharma (Faculty)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-600">{registerCellAudit.timestamp}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRegisterCellAudit(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: CONFIRM MARK ALL PRESENT (PRD ATT-102)
      ══════════════════════════════════════════════════════════════════════ */}
      {isMarkAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-slate-900 text-base font-serif">
                Confirm Mark All Present?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will mark all currently unmarked scholars in <strong>{selectedCohort}</strong> as Present (P). Existing approved leave codes (ML/OD) will not be overwritten. A 10-second undo bar will be provided.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMarkAllModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeMarkAllPresent}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 cursor-pointer"
              >
                Confirm &amp; Fill Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 5: PARENT ALERTS BROADCAST (PRD ATT-702)
      ══════════════════════════════════════════════════════════════════════ */}
      {isAlertsBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-serif">
                  Dispatch Parent Absence Notice
                </h3>
                <p className="text-xs text-slate-500">
                  Govt DLT-Approved Service Implicit SMS &amp; WhatsApp Business Template Preview
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAlertsBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Approved DLT Template: DLT-TE-2026-ATT-01
              </span>
              <p className="text-slate-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-slate-200">
                &ldquo;Dear Guardian, your ward <strong>[Student Name]</strong> was marked <strong>ABSENT</strong> on [Date] for [Class] at Apex International Global Academy. If this is an error or illness, kindly submit an e-leave slip on the portal. Call front office: 011-892188.&rdquo;
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Total Recipients: <strong>{metrics.absent} Guardians</strong></span>
                <span>Language: <strong>English + Hindi</strong></span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAlertsBroadcastModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Dispatched DLT attendance alert to ${metrics.absent} guardians.`);
                  setIsAlertsBroadcastModal(false);
                }}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send via WhatsApp &amp; SMS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 6: CONDONATION CASE DOSSIER (PRD ATT-404)
      ══════════════════════════════════════════════════════════════════════ */}
      {isCondonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-serif">
                  Statutory Condonation Dossier (CBSE Rule 13)
                </h3>
                <p className="text-xs text-slate-500">
                  {isCondonationModal.name} · Current Attendance: {((isCondonationModal.yearPresentDays / isCondonationModal.yearTotalDays) * 100).toFixed(1)}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCondonationModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">
                  Mandatory Document Checklist for Board Submission:
                </span>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600 cursor-pointer" />
                  <span>Hospital Admission &amp; Discharge Summary (Apollo Clinic)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600 cursor-pointer" />
                  <span>Government Medical Officer Fitness Certificate</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600 cursor-pointer" />
                  <span>Parent Written Undertaking / Affidavit (Form 8-B)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600 cursor-pointer" />
                  <span>Class Teacher Recommendation Endorsement</span>
                </label>
              </div>

              <div className="flex justify-between items-center text-xs p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                <span>Maximum Permissible Condonation:</span>
                <strong className="font-mono text-sm">Up to 15.0% Shortfall</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCondonationModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApproveCondonation(isCondonationModal.id)}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve &amp; Endorse for Board Proforma</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
