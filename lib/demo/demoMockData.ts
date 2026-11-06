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

export interface DemoFeeInvoiceRecord {
  id: string;
  invoiceNo: string;
  studentName: string;
  studentId: string;
  cohort: string;
  heads: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue" | "Partial";
  paymentMode?: string;
  paidOn?: string;
  guardianPhone?: string;
  archetype: InstitutionalArchetype;
}

export interface DemoFeeStructureHead {
  id: string;
  headName: string;
  frequency: "Annual" | "Per Semester" | "Quarterly" | "Monthly";
  amount: number;
  isOptional: boolean;
  concessionAllowed: boolean;
  archetype: InstitutionalArchetype;
}

export const DEMO_INVOICES: DemoFeeInvoiceRecord[] = [
  // School
  { id: "inv-1", invoiceNo: "INV-2026-891", studentName: "Aarav Sharma", studentId: "APX-0491", cohort: "Class 10-A", heads: "Q3 Tuition + Smart Lab + Bus", amount: 24500, paidAmount: 24500, dueDate: "10 Nov 2026", status: "Paid", paymentMode: "Dynamic UPI QR (GPay)", paidOn: "Today • 10:45 AM", guardianPhone: "9876543210", archetype: "K12_SCHOOL" },
  { id: "inv-2", invoiceNo: "INV-2026-892", studentName: "Rohan Varma", studentId: "APX-0493", cohort: "Class 10-A", heads: "Q3 Tuition + Transport", amount: 22000, paidAmount: 0, dueDate: "25 Oct 2026", status: "Overdue", guardianPhone: "9444123890", archetype: "K12_SCHOOL" },
  { id: "inv-3", invoiceNo: "INV-2026-893", studentName: "Vikramaditya Roy", studentId: "APX-0499", cohort: "Grade 4", heads: "RTE 25% EWS 100% Exemption", amount: 0, paidAmount: 0, dueDate: "31 Mar 2027", status: "Paid", paymentMode: "State Govt Grant #MH-914", paidOn: "1 Oct 2026", guardianPhone: "9822334455", archetype: "K12_SCHOOL" },
  // College
  { id: "inv-201", invoiceNo: "COL-2026-401", studentName: "Aaditya Singhania", studentId: "PRN-2026-014", cohort: "B.Tech CSE (Sem IV)", heads: "Sem IV Tuition + Uni Exam Fee", amount: 54000, paidAmount: 54000, dueDate: "15 Nov 2026", status: "Paid", paymentMode: "NetBanking HDFC", paidOn: "Yesterday", guardianPhone: "9833445566", archetype: "DEGREE_COLLEGE" },
  { id: "inv-202", invoiceNo: "COL-2026-402", studentName: "Meera Krishnan", studentId: "PRN-2026-088", cohort: "B.Sc Biotech (Sem II)", heads: "Semester Tuition + Lab Safety", amount: 48500, paidAmount: 0, dueDate: "30 Oct 2026", status: "Overdue", guardianPhone: "9844556677", archetype: "DEGREE_COLLEGE" },
  // University
  { id: "inv-301", invoiceNo: "UNI-2026-101", studentName: "Dr. Siddharth Sen", studentId: "UNI-9812", cohort: "Ph.D. Computing", heads: "Doctoral Research Bench Fee", amount: 32000, paidAmount: 0, dueDate: "30 Nov 2026", status: "Pending", guardianPhone: "9855667788", archetype: "UNIVERSITY" },
  // Coaching
  { id: "inv-401", invoiceNo: "CCH-2026-701", studentName: "Harshwardhan Patil", studentId: "ASP-881", cohort: "Rankers JEE 2027", heads: "Installment 2 + All-India Test Series (18% GST)", amount: 45000, paidAmount: 0, dueDate: "5 Nov 2026", status: "Pending", guardianPhone: "9866778899", archetype: "COACHING_ACADEMY" },
  { id: "inv-402", invoiceNo: "CCH-2026-702", studentName: "Roshni Deshpande", studentId: "ASP-884", cohort: "Champions NEET", heads: "Installment 1 Tuition", amount: 38000, paidAmount: 0, dueDate: "20 Oct 2026", status: "Overdue", guardianPhone: "9877889900", archetype: "COACHING_ACADEMY" },
];

export const DEMO_FEE_STRUCTURES: DemoFeeStructureHead[] = [
  // School
  { id: "fh-1", headName: "Tuition Fee (Q3)", frequency: "Quarterly", amount: 18000, isOptional: false, concessionAllowed: true, archetype: "K12_SCHOOL" },
  { id: "fh-2", headName: "Smart STEM & Computer Lab", frequency: "Quarterly", amount: 2500, isOptional: false, concessionAllowed: false, archetype: "K12_SCHOOL" },
  { id: "fh-3", headName: "AC School Bus (Route Slab 2)", frequency: "Quarterly", amount: 4000, isOptional: true, concessionAllowed: false, archetype: "K12_SCHOOL" },
  // College
  { id: "fh-201", headName: "Semester Tuition & Instruction", frequency: "Per Semester", amount: 45000, isOptional: false, concessionAllowed: true, archetype: "DEGREE_COLLEGE" },
  { id: "fh-202", headName: "University Examination & Registration", frequency: "Per Semester", amount: 4000, isOptional: false, concessionAllowed: false, archetype: "DEGREE_COLLEGE" },
  { id: "fh-203", headName: "Advanced Computing Lab Deposit", frequency: "Annual", amount: 5000, isOptional: false, concessionAllowed: false, archetype: "DEGREE_COLLEGE" },
  // University
  { id: "fh-301", headName: "Doctoral Bench & Research Infrastructure", frequency: "Annual", amount: 28000, isOptional: false, concessionAllowed: true, archetype: "UNIVERSITY" },
  { id: "fh-302", headName: "Hostel & Mess Amenities", frequency: "Per Semester", amount: 36000, isOptional: true, concessionAllowed: false, archetype: "UNIVERSITY" },
  // Coaching
  { id: "fh-401", headName: "JEE Advanced Classroom Instruction", frequency: "Quarterly", amount: 35000, isOptional: false, concessionAllowed: true, archetype: "COACHING_ACADEMY" },
  { id: "fh-402", headName: "All-India Computer Based Test Series (CBT)", frequency: "Annual", amount: 10000, isOptional: false, concessionAllowed: false, archetype: "COACHING_ACADEMY" },
];

export interface DemoExamBroadsheetRecord {
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

export interface DemoExamScheduleItem {
  id: string;
  examTitle: string;
  subjectCode: string;
  date: string;
  timeSlot: string;
  hallNo: string;
  chiefInvigilator: string;
  archetype: InstitutionalArchetype;
}

export interface DemoHallTicketRecord {
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

export const DEMO_EXAM_RECORDS: DemoExamBroadsheetRecord[] = [
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

export const DEMO_EXAM_SCHEDULES: DemoExamScheduleItem[] = [
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

export const DEMO_HALL_TICKETS: DemoHallTicketRecord[] = [
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

export interface DemoAdmissionCandidate {
  id: string;
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  program: string;
  archetype: InstitutionalArchetype;
  appliedDate: string;
  status: "Pending" | "Confirmed" | "Waitlisted" | "Rejected";
  meritScore: string;
  numericScore: number;
  quotaType: string;
  documentsVerified: boolean;
  notes: string;
  documents: { title: string; verified: boolean; type: string }[];
}

export const DEMO_ADMISSIONS: DemoAdmissionCandidate[] = [
  // School
  {
    id: "adm-101",
    name: "Raghvendra Mukhopadhyay",
    guardianName: "Sunil Mukhopadhyay",
    phone: "9845497084",
    email: "ragh.m@family.org",
    program: "Class 11 - Science (PCMB)",
    archetype: "K12_SCHOOL",
    appliedDate: "3 Nov 2026 • 12:00",
    status: "Pending",
    meritScore: "94.2% (Class 10 CBSE)",
    numericScore: 94.2,
    quotaType: "General Merit",
    documentsVerified: true,
    notes: "Applied for Senior Secondary Science stream. Board marksheet and transfer certificate submitted.",
    documents: [
      { title: "Class 10 CBSE Board Marksheet", verified: true, type: "Academic" },
      { title: "Transfer Certificate (TC)", verified: true, type: "Statutory" },
      { title: "Birth Certificate & DPDPA Consent", verified: true, type: "Legal" },
    ],
  },
  {
    id: "adm-102",
    name: "Vikramaditya Roy",
    guardianName: "Anil Roy",
    phone: "9988776655",
    email: "anil.roy@workmail.in",
    program: "Grade 4 - Primary Wing",
    archetype: "K12_SCHOOL",
    appliedDate: "Today • 09:15 AM",
    status: "Confirmed",
    meritScore: "RTE 25% EWS Allotment",
    numericScore: 99.0,
    quotaType: "RTE 25% Free Seat",
    documentsVerified: true,
    notes: "State Education Dept RTE portal allotment #RTE-2026-9014. Zero tuition fee assigned.",
    documents: [
      { title: "State RTE Allotment Letter", verified: true, type: "Govt Quota" },
      { title: "Tehsildar EWS Income Certificate", verified: true, type: "Legal" },
      { title: "Aadhaar Card of Child & Guardian", verified: true, type: "ID Proof" },
    ],
  },
  {
    id: "adm-103",
    name: "Ananya Deshmukh",
    guardianName: "Sanjay Deshmukh",
    phone: "9123456780",
    email: "sanjay.deshmukh@mail.com",
    program: "Class 9 - Section A",
    archetype: "K12_SCHOOL",
    appliedDate: "Yesterday • 02:00 PM",
    status: "Confirmed",
    meritScore: "91.5% in Class 8",
    numericScore: 91.5,
    quotaType: "General Merit",
    documentsVerified: true,
    notes: "Direct transfer from ICSE Board school. Equivalence verified.",
    documents: [
      { title: "Class 8 Progress Report", verified: true, type: "Academic" },
      { title: "Medical Fitness Certificate", verified: true, type: "Health" },
    ],
  },
  // College
  {
    id: "adm-201",
    name: "Aaditya Singhania",
    guardianName: "Rajesh Singhania",
    phone: "9820123456",
    email: "aaditya.singh@campus.in",
    program: "B.Tech Computer Science & AI (Sem I)",
    archetype: "DEGREE_COLLEGE",
    appliedDate: "2 Nov 2026 • 03:30 PM",
    status: "Confirmed",
    meritScore: "98.4 Percentile (MHT-CET / JEE)",
    numericScore: 98.4,
    quotaType: "State CAP Merit Quota",
    documentsVerified: true,
    notes: "Round 1 CAP allotment. First semester tuition fee paid via Dynamic UPI QR.",
    documents: [
      { title: "MHT-CET / JEE Scorecard", verified: true, type: "Entrance" },
      { title: "Higher Secondary (12th) Marksheet", verified: true, type: "Academic" },
      { title: "State Domicile & Nationality Certificate", verified: true, type: "Statutory" },
    ],
  },
  {
    id: "adm-202",
    name: "Meera Krishnan",
    guardianName: "S. Krishnan",
    phone: "9444123890",
    email: "meera.k@gmail.com",
    program: "B.Sc Biotechnology & Genetics (Sem I)",
    archetype: "DEGREE_COLLEGE",
    appliedDate: "Yesterday • 11:20 AM",
    status: "Pending",
    meritScore: "91.8% in Higher Secondary",
    numericScore: 91.8,
    quotaType: "Institutional Merit",
    documentsVerified: false,
    notes: "Lab safety undertaking pending verification. Migration certificate submitted.",
    documents: [
      { title: "12th Science Marksheet (PCB)", verified: true, type: "Academic" },
      { title: "Lab Safety & Biosafety Declaration", verified: false, type: "Compliance" },
      { title: "Migration Certificate", verified: true, type: "Statutory" },
    ],
  },
  // University
  {
    id: "adm-301",
    name: "Dr. Siddharth Sen",
    guardianName: "Self-Sponsored",
    phone: "9811443322",
    email: "s.sen@research.ac.in",
    program: "Ph.D. in Distributed Systems & AI",
    archetype: "UNIVERSITY",
    appliedDate: "1 Nov 2026 • 05:00 PM",
    status: "Pending",
    meritScore: "UGC-NET JRF (AIR 42)",
    numericScore: 99.2,
    quotaType: "National Research Fellowship",
    documentsVerified: true,
    notes: "Research synopsis approved by Departmental Doctoral Committee. Guide assigned.",
    documents: [
      { title: "UGC-NET JRF Award Letter", verified: true, type: "Fellowship" },
      { title: "Postgraduate Degree (M.Tech) Transcript", verified: true, type: "Academic" },
      { title: "APAAR / DigiLocker National ID", verified: true, type: "Govt ID" },
    ],
  },
  {
    id: "adm-302",
    name: "Tanya Senapati",
    guardianName: "Prof. K. Senapati",
    phone: "9711223344",
    email: "tanya.s@uni.ac.in",
    program: "School of Legal Studies (LL.M)",
    archetype: "UNIVERSITY",
    appliedDate: "Today • 11:00 AM",
    status: "Confirmed",
    meritScore: "CUET-PG Score 284/300",
    numericScore: 94.6,
    quotaType: "Central CUET Quota",
    documentsVerified: true,
    notes: "NEP 2020 Digilocker Academic Bank of Credits (ABC) ID linked: 8941-2094-1192.",
    documents: [
      { title: "CUET-PG Official Rank Card", verified: true, type: "Entrance" },
      { title: "B.A. LL.B Degree Certificate", verified: true, type: "Academic" },
      { title: "DigiLocker ABC Verification Token", verified: true, type: "NEP 2020" },
    ],
  },
  // Coaching
  {
    id: "adm-401",
    name: "Harshwardhan Patil",
    guardianName: "Mahesh Patil",
    phone: "9766554433",
    email: "harsh.patil@testprep.in",
    program: "Rankers Super-30 (JEE Advanced 2027)",
    archetype: "COACHING_ACADEMY",
    appliedDate: "Today • 10:00 AM",
    status: "Confirmed",
    meritScore: "Score 96/100 (DAT AIR 4)",
    numericScore: 96.0,
    quotaType: "75% Scholarship Waiver",
    documentsVerified: true,
    notes: "Rank 4 in Diagnostic Admission Test. Assigned to Morning Batch A1.",
    documents: [
      { title: "DAT Test Hall Ticket & Score Record", verified: true, type: "Diagnostic" },
      { title: "Class 10 School Marksheet", verified: true, type: "Academic" },
      { title: "Guardian Post-Dated Cheque / Mandate", verified: true, type: "Fee Agreement" },
    ],
  },
  {
    id: "adm-402",
    name: "Roshni Deshpande",
    guardianName: "Dr. S. Deshpande",
    phone: "9977881122",
    email: "roshni.d@testprep.in",
    program: "Champions Intensive (NEET 2026)",
    archetype: "COACHING_ACADEMY",
    appliedDate: "Yesterday • 05:00 PM",
    status: "Pending",
    meritScore: "Score 88/100 (DAT Tier 2)",
    numericScore: 88.0,
    quotaType: "50% Scholarship Waiver",
    documentsVerified: false,
    notes: "Awaiting parent consultation and batch timing confirmation.",
    documents: [
      { title: "Diagnostic Admission Test OMR Sheet", verified: true, type: "Diagnostic" },
      { title: "Parent Undertaking for Attendance", verified: false, type: "Policy" },
    ],
  },
];

export interface DemoCohortRecord {
  id: string;
  name: string;
  division: string;
  capacity: number;
  enrolled: number;
  inchargeFaculty: string;
  roomNo: string;
  archetype: InstitutionalArchetype;
}

export interface DemoSyllabusItem {
  id: string;
  code: string;
  title: string;
  creditsOrMarks: string;
  type: "Theory" | "Practical" | "Elective" | "Audit";
  facultyAssigned: string;
  archetype: InstitutionalArchetype;
}

export interface DemoFacultyWorkloadRecord {
  id: string;
  name: string;
  designation: string;
  departmentOrSubject: string;
  lectureHoursWeekly: number;
  practicalOrDoubtHours: number;
  maxTargetHours: number;
  archetype: InstitutionalArchetype;
  status: "Balanced" | "Overloaded" | "Available";
}

export const DEMO_COHORTS: DemoCohortRecord[] = [
  // School
  { id: "c-1", name: "Class 10", division: "Section A", capacity: 42, enrolled: 40, inchargeFaculty: "Mrs. Sunita Sharma", roomNo: "Room 204", archetype: "K12_SCHOOL" },
  { id: "c-2", name: "Class 10", division: "Section B", capacity: 42, enrolled: 41, inchargeFaculty: "Mr. Rajesh Varma", roomNo: "Room 205", archetype: "K12_SCHOOL" },
  { id: "c-3", name: "Class 11 Science", division: "Section PCMB", capacity: 35, enrolled: 34, inchargeFaculty: "Dr. K. Raman", roomNo: "Lab Wing 3", archetype: "K12_SCHOOL" },
  { id: "c-4", name: "Class 9", division: "Section A", capacity: 45, enrolled: 43, inchargeFaculty: "Mrs. Priya Das", roomNo: "Room 102", archetype: "K12_SCHOOL" },
  // College
  { id: "c-201", name: "B.Tech Computer Science", division: "Sem IV - Div A", capacity: 60, enrolled: 58, inchargeFaculty: "Prof. S. Sen", roomNo: "CS Hall 1", archetype: "DEGREE_COLLEGE" },
  { id: "c-202", name: "B.Tech Electronics & Comm", division: "Sem VI - Div A", capacity: 60, enrolled: 54, inchargeFaculty: "Dr. M. Iyer", roomNo: "ECE Block 2", archetype: "DEGREE_COLLEGE" },
  { id: "c-203", name: "B.Com (Honors)", division: "Sem II - Div B", capacity: 70, enrolled: 68, inchargeFaculty: "Prof. A. Desai", roomNo: "Commerce 301", archetype: "DEGREE_COLLEGE" },
  // University
  { id: "c-301", name: "School of Computing & AI", division: "M.Tech AI - Sem II", capacity: 30, enrolled: 28, inchargeFaculty: "Prof. V. Nambiar (HOD)", roomNo: "PG Lab 4", archetype: "UNIVERSITY" },
  { id: "c-302", name: "Faculty of Legal Studies", division: "B.A. LL.B - Sem VI", capacity: 50, enrolled: 47, inchargeFaculty: "Dr. K. Swamy", roomNo: "Moot Court 1", archetype: "UNIVERSITY" },
  // Coaching
  { id: "c-401", name: "Rankers Super-30", division: "JEE Advanced 2027", capacity: 30, enrolled: 30, inchargeFaculty: "Er. Nitin Verma (IITB)", roomNo: "Center Hall Alpha", archetype: "COACHING_ACADEMY" },
  { id: "c-402", name: "Champions Intensive", division: "NEET Repeaters 2026", capacity: 45, enrolled: 44, inchargeFaculty: "Dr. Anjali Rao (AIIMS)", roomNo: "Bio-Arena 1", archetype: "COACHING_ACADEMY" },
];

export const DEMO_SYLLABI: DemoSyllabusItem[] = [
  // School
  { id: "s-1", code: "CBSE-041", title: "Class 10 Mathematics", creditsOrMarks: "Theory 80 + Internal 20", type: "Theory", facultyAssigned: "Mrs. Sunita Sharma", archetype: "K12_SCHOOL" },
  { id: "s-2", code: "CBSE-086", title: "Class 10 General Science (PCM)", creditsOrMarks: "Theory 80 + Lab 20", type: "Practical", facultyAssigned: "Dr. K. Raman", archetype: "K12_SCHOOL" },
  { id: "s-3", code: "CBSE-184", title: "English Language & Literature", creditsOrMarks: "Theory 80 + Oral 20", type: "Theory", facultyAssigned: "Mrs. Priya Das", archetype: "K12_SCHOOL" },
  // College
  { id: "s-201", code: "CS-401", title: "Data Structures & Algorithms", creditsOrMarks: "4 Credits (UGC CBCS)", type: "Theory", facultyAssigned: "Prof. S. Sen", archetype: "DEGREE_COLLEGE" },
  { id: "s-202", code: "CS-402L", title: "Database Management Lab (PostgreSQL)", creditsOrMarks: "2 Credits (Practical)", type: "Practical", facultyAssigned: "Dr. M. Iyer", archetype: "DEGREE_COLLEGE" },
  { id: "s-203", code: "AUD-101", title: "Constitution of India & Cyber Ethics", creditsOrMarks: "Mandatory Audit (Pass/Fail)", type: "Audit", facultyAssigned: "Prof. A. Desai", archetype: "DEGREE_COLLEGE" },
  // University
  { id: "s-301", code: "NEP-CSC601", title: "Advanced Distributed Deep Learning", creditsOrMarks: "4 Credits (ABC Digilocker)", type: "Theory", facultyAssigned: "Prof. V. Nambiar", archetype: "UNIVERSITY" },
  { id: "s-302", code: "NEP-OE302", title: "Interdisciplinary: Computational Law", creditsOrMarks: "3 Credits (Multi-Disciplinary)", type: "Elective", facultyAssigned: "Dr. K. Swamy", archetype: "UNIVERSITY" },
  // Coaching
  { id: "s-401", code: "DPP-JEE-PH", title: "Physics: Rotational Dynamics & Optics", creditsOrMarks: "120 MCQs / Week (+4/-1)", type: "Theory", facultyAssigned: "Er. Nitin Verma", archetype: "COACHING_ACADEMY" },
  { id: "s-402", code: "DPP-NEET-BIO", title: "Biology: Human Genetics & Cell Biology", creditsOrMarks: "180 MCQs / Week", type: "Practical", facultyAssigned: "Dr. Anjali Rao", archetype: "COACHING_ACADEMY" },
];

export const DEMO_FACULTY_WORKLOAD: DemoFacultyWorkloadRecord[] = [
  // School
  { id: "fw-1", name: "Mrs. Sunita Sharma", designation: "PGT Mathematics", departmentOrSubject: "Mathematics", lectureHoursWeekly: 18, practicalOrDoubtHours: 4, maxTargetHours: 22, archetype: "K12_SCHOOL", status: "Balanced" },
  { id: "fw-2", name: "Dr. K. Raman", designation: "PGT Physics & Science Head", departmentOrSubject: "Physics", lectureHoursWeekly: 16, practicalOrDoubtHours: 8, maxTargetHours: 24, archetype: "K12_SCHOOL", status: "Balanced" },
  { id: "fw-3", name: "Mrs. Priya Das", designation: "TGT English", departmentOrSubject: "Languages", lectureHoursWeekly: 12, practicalOrDoubtHours: 2, maxTargetHours: 20, archetype: "K12_SCHOOL", status: "Available" },
  // College
  { id: "fw-201", name: "Prof. S. Sen", designation: "Associate Professor & HOD", departmentOrSubject: "Computer Science", lectureHoursWeekly: 14, practicalOrDoubtHours: 6, maxTargetHours: 18, archetype: "DEGREE_COLLEGE", status: "Overloaded" },
  { id: "fw-202", name: "Dr. M. Iyer", designation: "Assistant Professor", departmentOrSubject: "Information Tech", lectureHoursWeekly: 12, practicalOrDoubtHours: 6, maxTargetHours: 18, archetype: "DEGREE_COLLEGE", status: "Balanced" },
  // University
  { id: "fw-301", name: "Prof. V. Nambiar", designation: "Dean & Research Chair", departmentOrSubject: "Artificial Intelligence", lectureHoursWeekly: 8, practicalOrDoubtHours: 12, maxTargetHours: 16, archetype: "UNIVERSITY", status: "Balanced" },
  // Coaching
  { id: "fw-401", name: "Er. Nitin Verma (IITB)", designation: "Senior Master Faculty", departmentOrSubject: "Advanced Physics", lectureHoursWeekly: 20, practicalOrDoubtHours: 10, maxTargetHours: 28, archetype: "COACHING_ACADEMY", status: "Overloaded" },
  { id: "fw-402", name: "Dr. Anjali Rao (AIIMS)", designation: "Head of Biology", departmentOrSubject: "Botany & Zoology", lectureHoursWeekly: 18, practicalOrDoubtHours: 8, maxTargetHours: 26, archetype: "COACHING_ACADEMY", status: "Balanced" },
];

export interface DemoBroadcastRecord {
  id: string;
  title: string;
  channel: "WhatsApp & SMS" | "WhatsApp Only" | "Govt DLT SMS" | "In-App Portal";
  targetAudience: string;
  timestamp: string;
  recipientsCount: number;
  deliveryRate: string;
  content: string;
  archetype: InstitutionalArchetype;
}

export interface DemoWhatsAppTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  bodyPreview: string;
  language: string;
  status: "APPROVED (Meta Verified)" | "PENDING_REVIEW";
  archetype: InstitutionalArchetype;
}

export interface DemoDltSmsLog {
  id: string;
  headerSenderId: string;
  peid: string;
  templateId: string;
  recipientPhone: string;
  messageSnippet: string;
  charCount: number;
  deliveredAt: string;
  status: "DELIVERED" | "QUEUED";
}

export const DEMO_BROADCASTS: DemoBroadcastRecord[] = [
  // School
  {
    id: "bc-1",
    title: "Parent-Teacher Conference (PTC) Schedule Announcement",
    channel: "WhatsApp & SMS",
    targetAudience: "All Parents (Nursery to Class 12)",
    timestamp: "Today • 09:30 AM",
    recipientsCount: 1240,
    deliveryRate: "99.4%",
    content: "Dear Parents, Term 1 Parent-Teacher Conferences are scheduled for Saturday 9:00 AM. Please book your 15-minute slot through the parent portal.",
    archetype: "K12_SCHOOL",
  },
  {
    id: "bc-2",
    title: "Winter Uniform & Bus Schedule Update",
    channel: "WhatsApp Only",
    targetAudience: "Junior Wing Parents",
    timestamp: "Yesterday • 04:15 PM",
    recipientsCount: 480,
    deliveryRate: "99.8%",
    content: "Notice: Mandatory switch to winter blazer and sweater effective Monday. Morning bus pickups will commence 10 minutes earlier on Route 4 & 7.",
    archetype: "K12_SCHOOL",
  },
  // College
  {
    id: "bc-201",
    title: "Campus Placement Drive 2026-27: Tier 1 Tech Day",
    channel: "WhatsApp & SMS",
    targetAudience: "B.Tech Final Year (CSE & ECE)",
    timestamp: "2 Nov 2026 • 11:00 AM",
    recipientsCount: 240,
    deliveryRate: "98.8%",
    content: "Campus recruitment drive commences next Monday. Eligible students with CGPA > 8.0 must upload resume PDFs to the placement portal before Friday 5 PM.",
    archetype: "DEGREE_COLLEGE",
  },
  // University
  {
    id: "bc-301",
    title: "38th Annual Convocation Robe Distribution & Rehearsal",
    channel: "In-App Portal",
    targetAudience: "Graduating PG & Ph.D. Scholars",
    timestamp: "1 Nov 2026 • 02:00 PM",
    recipientsCount: 850,
    deliveryRate: "100%",
    content: "The 38th University Convocation will be held at the Main Auditorium. Gown collection counter open from 10 AM to 4 PM at the Central Library foyer.",
    archetype: "UNIVERSITY",
  },
  // Coaching
  {
    id: "bc-401",
    title: "All-India Mock Test #4 Answer Key & Rank List Live",
    channel: "WhatsApp & SMS",
    targetAudience: "Rankers Super-30 & Champions NEET",
    timestamp: "Today • 08:00 AM",
    recipientsCount: 320,
    deliveryRate: "99.7%",
    content: "Sunday Grand Test #4 results and video solutions are now live! Check your All-India Rank, question-wise time analysis, and negative marking scorecards.",
    archetype: "COACHING_ACADEMY",
  },
];

export const DEMO_WHATSAPP_TEMPLATES: DemoWhatsAppTemplate[] = [
  {
    id: "wt-1",
    name: "attendance_absent_alert_v2",
    triggerEvent: "Classroom Roll Call marked Absent",
    bodyPreview: "Dear Parent, your child {{1}} was marked ABSENT today ({{2}}) in {{3}}. For queries, reply to this official institution line.",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "K12_SCHOOL",
  },
  {
    id: "wt-2",
    name: "dynamic_fee_upi_receipt",
    triggerEvent: "Counter / Online Fee Payment",
    bodyPreview: "Dear Parent, thank you for paying ₹{{1}} towards invoice #{{2}}. Click here to download your tax invoice receipt: {{3}}",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "K12_SCHOOL",
  },
  {
    id: "wt-201",
    name: "hall_ticket_admit_card_release",
    triggerEvent: "Semester Exam Hall Ticket Generated",
    bodyPreview: "Dear {{1}}, your semester hall ticket for {{2}} is ready. Verify your exam seat number and center rules here: {{3}}",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "DEGREE_COLLEGE",
  },
  {
    id: "wt-401",
    name: "test_series_air_scorecard",
    triggerEvent: "Weekly Mock Test Evaluation",
    bodyPreview: "Dear Parent, {{1}} secured All-India Rank {{2}} in Mock Test #{{3}} with score {{4}}/300. Detailed analysis attached.",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "COACHING_ACADEMY",
  },
];

export const DEMO_DLT_LOGS: DemoDltSmsLog[] = [
  { id: "dlt-1", headerSenderId: "APXACD", peid: "140129384729104", templateId: "110716182930491", recipientPhone: "+91 9845497084", messageSnippet: "Vihaan Deshmukh marked ABSENT today. - APEX ACD", charCount: 46, deliveredAt: "Today • 08:35 AM", status: "DELIVERED" },
  { id: "dlt-2", headerSenderId: "APXACD", peid: "140129384729104", templateId: "110716182930492", recipientPhone: "+91 9444123890", messageSnippet: "Fee due reminder for Ananya Iyer: ₹24,500 due on 25 Nov. - APEX ACD", charCount: 68, deliveredAt: "Yesterday • 05:00 PM", status: "DELIVERED" },
  { id: "dlt-3", headerSenderId: "APXACD", peid: "140129384729104", templateId: "110716182930493", recipientPhone: "+91 9820123456", messageSnippet: "Paid ₹24,500 via Dynamic UPI QR for Vihaan Deshmukh. Rec #891. - APEX ACD", charCount: 71, deliveredAt: "Today • 10:46 AM", status: "DELIVERED" },
];

export interface DemoActivityItem {
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

export const DEMO_ACTIVITIES: DemoActivityItem[] = [
  {
    id: "act-1",
    name: "Raghvendra Mukhopadhyay",
    phone: "9845497084",
    program: "Senior Secondary • Science Major",
    timestamp: "3 Nov 2026 • 12:00",
    status: "Pending",
    category: "admissions",
    details: "Applied for CBSE Class 11 Science (PCMB) with 94.2% in Class 10 Board exams. Verification pending for TC.",
  },
  {
    id: "act-2",
    name: "Pavan Sharma",
    phone: "9845497084",
    program: "Term 2 Tuition & Lab Fee",
    timestamp: "29 Oct 2026 • 11:00",
    status: "Confirmed",
    category: "fees",
    feeAmount: "₹24,500",
    details: "Paid via Dynamic UPI QR (Transaction ID: UPI/2026/982147). Automated digital invoice generated.",
  },
  {
    id: "act-3",
    name: "Swaraj Wadavale",
    phone: "07385249974",
    program: "Class 10-A • Term 1 Terminology Exam",
    timestamp: "30 Sept 2026 • 11:15",
    status: "Confirmed",
    category: "exams",
    details: "NEP 2020 Holistic Progress Card (HPC) generated with Grade A+ (9.2 SGPA equivalent).",
  },
  {
    id: "act-4",
    name: "Ananya Deshmukh",
    phone: "9123456780",
    program: "Class 9-B • Daily Roll Call",
    timestamp: "Today • 08:30 AM",
    status: "Collected",
    category: "attendance",
    details: "Biometric attendance marked present via Fingerprint Device Terminal #2. Offline log synced.",
  },
  {
    id: "act-5",
    name: "Vikramaditya Roy",
    phone: "9988776655",
    program: "Primary Wing • Grade 4 Admission",
    timestamp: "Today • 09:15 AM",
    status: "Pending",
    category: "admissions",
    details: "RTE 25% EWS category application. Income certificate #MH-2026-914 verified.",
  },
  {
    id: "act-6",
    name: "Kavita Reddy",
    phone: "9765432100",
    program: "Annual Transport & Bus Fee",
    timestamp: "Yesterday • 04:30 PM",
    status: "Confirmed",
    category: "fees",
    feeAmount: "₹18,000",
    details: "Route 14 (South Campus Express). Paid via NetBanking.",
  },
];

export interface DemoLibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  borrower: string;
  due: string;
  status: "Checked Out" | "Overdue" | "Reserved";
}

export const DEMO_LIBRARY_BOOKS: DemoLibraryBook[] = [
  { id: "BK-101", title: "Higher Engineering Mathematics", author: "B.S. Grewal", isbn: "978-81-7409-195-5", borrower: "Aarav Sharma", due: "08 Nov 2026", status: "Checked Out" },
  { id: "BK-102", title: "Concepts of Physics (Vol 1 & 2)", author: "H.C. Verma", isbn: "978-81-7709-187-0", borrower: "Priya Nair", due: "10 Nov 2026", status: "Checked Out" },
  { id: "BK-103", title: "Principles of Anatomy & Physiology", author: "Tortora & Derrickson", isbn: "978-11-1970-138-5", borrower: "Kabir Khan", due: "02 Nov 2026", status: "Overdue" },
  { id: "BK-104", title: "Organic Chemistry: Structure & Reactivity", author: "Morrison & Boyd", isbn: "978-93-3257-789-3", borrower: "Ananya Deshmukh", due: "15 Nov 2026", status: "Reserved" },
];

export interface DemoTransportRoute {
  id: string;
  name: string;
  busNo: string;
  driver: string;
  stops: string;
  status: string;
  speed: string;
}

export const DEMO_TRANSPORT_ROUTES: DemoTransportRoute[] = [
  { id: "RT-01", name: "North Ring Road Express", busNo: "MH-12-AB-4021", driver: "Ramesh Gurjar (9811223344)", stops: "7 Stops", status: "GPS Online", speed: "34 km/h" },
  { id: "RT-02", name: "Metro Station Feeder", busNo: "KA-01-CD-8910", driver: "Mohd. Aslam (9822334455)", stops: "5 Stops", status: "GPS Online", speed: "28 km/h" },
  { id: "RT-03", name: "South City Expressway", busNo: "AP-09-EF-3321", driver: "Gurpreet Singh (9833445566)", stops: "9 Stops", status: "Parked / Idle", speed: "0 km/h" },
];



