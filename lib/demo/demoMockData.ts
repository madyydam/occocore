import { InstitutionalArchetype } from "@/lib/terminology";

export type AttendanceCode =
  | "P"   // Present (1.0)
  | "L"   // Late before register close (1.0)
  | "LC"  // Late after register close (0.0)
  | "HD"  // Half day (0.5)
  | "OD"  // On duty (1.0)
  | "EL"  // Excused leave (0.0)
  | "ML"  // Medical leave (0.0)
  | "A"   // Absent (0.0)
  | "SU"  // Suspended (0.0)
  | "H"   // Holiday (0.0)
  | "NE"; // Not enrolled (0.0)

export interface DemoStudentRosterRecord {
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

export interface DemoBiometricDevice {
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

export interface DemoLeaveRequestItem {
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

export interface DemoUnmatchedPunchItem {
  id: string;
  badgeUid: string;
  deviceLocation: string;
  timestamp: string;
  suggestedMatch: string;
  status: "Unresolved" | "Resolved";
}

export interface DemoParentAlertLogItem {
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

// ============================================================================
// ISOLATED DEMO SANDBOX DATA (USED EXCLUSIVELY WHEN isDemoMode === true)
// NEVER MERGED INTO PRODUCTION DATABASE OR REAL UNIVERSITY SESSIONS
// ============================================================================

export const DEMO_ROSTER: DemoStudentRosterRecord[] = [
  {
    id: "demo-st-1",
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
    id: "demo-st-2",
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
    id: "demo-st-3",
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
    id: "demo-st-4",
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
    id: "demo-st-5",
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
    id: "demo-st-6",
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
    id: "demo-st-7",
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
    id: "demo-st-8",
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

export const DEMO_DEVICES: DemoBiometricDevice[] = [
  { id: "demo-dev-1", name: "Main Campus Gate Turnstile Alpha", type: "RFID Turnstile", ipAddress: "192.168.10.45", location: "North Main Gate", status: "Online", batteryStatus: "Mains AC (100%)", lastHeartbeat: "Just now", totalPunchesToday: 842, queueLength: 0, firmware: "v4.2.1-sec" },
  { id: "demo-dev-2", name: "Senior Block Biometric Terminal #1", type: "Fingerprint", ipAddress: "192.168.10.48", location: "Academic Block 1st Floor", status: "Online", batteryStatus: "Battery 84%", lastHeartbeat: "3s ago", totalPunchesToday: 215, queueLength: 0, firmware: "v4.1.8-bio" },
  { id: "demo-dev-3", name: "Science & Robotics Lab Facial Pod", type: "Face Recognition Pod", ipAddress: "192.168.10.52", location: "Innovation Hub Foyer", status: "Online", batteryStatus: "Mains AC (100%)", lastHeartbeat: "8s ago", totalPunchesToday: 310, queueLength: 0, firmware: "v5.0.2-ai" },
  { id: "demo-dev-4", name: "Hostel & Mess Gatekeeper Terminal", type: "RFID Turnstile", ipAddress: "192.168.10.60", location: "Dormitory Block C", status: "Online", batteryStatus: "Mains AC (100%)", lastHeartbeat: "Just now", totalPunchesToday: 420, queueLength: 0, firmware: "v4.2.1-sec" },
];

export const DEMO_LEAVES: DemoLeaveRequestItem[] = [
  { id: "demo-lv-1", applicantName: "Rohan Varma", studentId: "APX-0493", roleOrCohort: "Class 10-A", type: "Medical Leave", dates: "1 Nov - 5 Nov 2026", daysCount: 5, reason: "Viral hepatitis under specialist care. Medical fitness slip attached.", status: "Approved", hasAttachment: true, medicalDocName: "Apollo_Clinic_Cert_981.pdf", submittedAt: "1 Nov 2026 09:00 AM", archetype: "K12_SCHOOL" },
  { id: "demo-lv-2", applicantName: "Siddharth Sen", studentId: "APX-0496", roleOrCohort: "Class 10-A", type: "Casual Leave", dates: "4 Nov 2026", daysCount: 1, reason: "Family religious pilgrimage.", status: "Pending", hasAttachment: false, submittedAt: "Today 07:30 AM", archetype: "K12_SCHOOL" },
  { id: "demo-lv-3", applicantName: "Pooja Hegde", studentId: "APX-0497", roleOrCohort: "Class 10-A", type: "On-Duty (OD) Event", dates: "2 Nov - 4 Nov 2026", daysCount: 3, reason: "Selected for State Badminton Championship under Sports Authority of India.", status: "Approved", hasAttachment: true, medicalDocName: "SAI_Selection_Order_2026.pdf", submittedAt: "28 Oct 2026 11:30 AM", archetype: "K12_SCHOOL" },
];

export const DEMO_UNMATCHED_PUNCHES: DemoUnmatchedPunchItem[] = [
  { id: "demo-un-1", badgeUid: "RFID-CARD-099418", deviceLocation: "North Main Gate Turnstile", timestamp: "Today 08:08 AM", suggestedMatch: "Rohan Varma (Card Re-issue)", status: "Unresolved" },
  { id: "demo-un-2", badgeUid: "FP-SENSOR-HASH-2291", deviceLocation: "Academic Block 1st Floor", timestamp: "Today 08:12 AM", suggestedMatch: "Aarav Sharma (Dry skin retry)", status: "Unresolved" },
];

export const DEMO_ALERTS_LOG: DemoParentAlertLogItem[] = [
  { id: "demo-alt-1", studentName: "Siddharth Sen", studentId: "APX-0496", guardianPhone: "9811443322", triggerEvent: "Absent Today", channel: "WhatsApp Business", dltTemplateId: "DLT-TE-2026-ATT-01", timestamp: "Today 08:35 AM", status: "Delivered", parentReply: "Viral fever, visiting clinic" },
  { id: "demo-alt-2", studentName: "Tanmay Bhat", studentId: "APX-0498", guardianPhone: "9977881122", triggerEvent: "Late After 08:30", channel: "Govt DLT SMS", dltTemplateId: "DLT-TE-2026-ATT-02", timestamp: "Today 08:45 AM", status: "Delivered", parentReply: "School bus was delayed at toll plaza" },
  { id: "demo-alt-3", studentName: "Rohan Varma", studentId: "APX-0493", guardianPhone: "9444123890", triggerEvent: "Below 75% Notice", channel: "WhatsApp Business", dltTemplateId: "DLT-TE-2026-ATT-04", timestamp: "Yesterday 04:30 PM", status: "Read", parentReply: "Medical certificate submitted to Principal" },
];
