"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { getThemeFromColor, BrandThemePalette } from "@/lib/admin/themeUtils";

export type DemoMainModule =
  | "dashboard"
  | "admissions"
  | "academics"
  | "attendance"
  | "fees"
  | "exams"
  | "communication"
  | "roles"
  | "settings"
  | "library"
  | "transport"
  | "hostel"
  | "placements";

export interface DemoSubModuleTab {
  id: string;
  label: string;
  badge?: string | number;
}

export interface DemoModuleMetadata {
  id: DemoMainModule;
  label: string;
  category: "Core Academics" | "Operations & Finance" | "Administration" | "Campus Add-ons";
  description: string;
  isCore?: boolean;
}

export const DEMO_AVAILABLE_MODULES: DemoModuleMetadata[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    category: "Administration",
    description: "Executive KPI command center and live activity feed.",
    isCore: true,
  },
  {
    id: "admissions",
    label: "Admissions",
    category: "Core Academics",
    description: "Inquiries, entrance merit lists, RTE 25% quotas & document verification.",
  },
  {
    id: "academics",
    label: "Academics",
    category: "Core Academics",
    description: "Cohorts, section allotments, master timetables & faculty workloads.",
  },
  {
    id: "attendance",
    label: "Attendance",
    category: "Core Academics",
    description: "Daily roll call, biometric hardware sync & below-75% defaulter alerts.",
  },
  {
    id: "fees",
    label: "Fee Ledgers",
    category: "Operations & Finance",
    description: "Collection counter, Dynamic UPI QR gateway & digital receipts.",
  },
  {
    id: "exams",
    label: "Examinations",
    category: "Core Academics",
    description: "Exam schedules, NEP SGPA grading, admit cards & broadsheets.",
  },
  {
    id: "communication",
    label: "Communication",
    category: "Administration",
    description: "Emergency broadcasts, parent WhatsApp pushes & Govt DLT SMS.",
  },
  {
    id: "roles",
    label: "Security & Roles",
    category: "Administration",
    description: "Granular RBAC matrix, user credentials & 4-digit security PINs.",
  },
  {
    id: "settings",
    label: "Settings",
    category: "Administration",
    description: "Institutional profile, branding, CNAME DNS & DPDPA consent vault.",
  },
  {
    id: "library",
    label: "Library & RFID",
    category: "Campus Add-ons",
    description: "ISBN cataloging, book checkout desk, overdue fines & digital resources.",
  },
  {
    id: "transport",
    label: "Transport & GPS",
    category: "Campus Add-ons",
    description: "Bus routes, live driver GPS tracking, vehicle fitness & transport fees.",
  },
  {
    id: "hostel",
    label: "Hostel & Mess",
    category: "Campus Add-ons",
    description: "Room & bed allocation, mess dietary schedules & digital gate passes.",
  },
  {
    id: "placements",
    label: "Placements & Internships",
    category: "Campus Add-ons",
    description: "Campus recruitment drives, corporate recruiter directory & CTC stats.",
  },
];

export const DEMO_MODULE_SUBTABS: Record<DemoMainModule, DemoSubModuleTab[]> = {
  dashboard: [
    { id: "overview", label: "Overview" },
  ],
  admissions: [
    { id: "all_applications", label: "All Inquiries & Applications" },
    { id: "admissions_feed", label: "Admissions Feed", badge: "12" },
    { id: "entrance_merit", label: "Entrance Merit List" },
    { id: "document_vault", label: "Document Verification" },
    { id: "rte_quotas", label: "RTE 25% & Quotas" },
    { id: "transfer_certificates", label: "Transfer Certificates (TC)", badge: "Statutory" },
  ],
  academics: [
    { id: "cohorts_sections", label: "Cohorts & Class Divisions" },
    { id: "curriculum_syllabus", label: "Curriculum & Syllabi" },
    { id: "master_timetable", label: "Master Timetable" },
    { id: "faculty_workload", label: "Faculty Workload" },
  ],
  attendance: [
    { id: "today_rollcall", label: "Today (Roll Call)" },
    { id: "attendance_feed", label: "Live Roll Call Feed", badge: "96.8%" },
    { id: "registers", label: "Registers & Monthly Muster", badge: "Month Grid" },
    { id: "analytics", label: "Analytics & Morning View", badge: "Live 9:30" },
    { id: "eligibility_shortfall", label: "Eligibility & Shortfall", badge: "7 At Risk" },
    { id: "leave_corrections", label: "Leave & Corrections", badge: "3" },
    { id: "devices_sync", label: "Devices & Sync", badge: "4 Online" },
    { id: "alerts_log", label: "Parent Alerts Log", badge: "DLT Verified" },
    { id: "policy_codes", label: "Policy & Code Engine" },
  ],
  fees: [
    { id: "collection_counter", label: "Collection Counter" },
    { id: "fees_feed", label: "Collections Feed", badge: "3 Pending" },
    { id: "upi_qr_gateway", label: "Dynamic UPI QR Gateway" },
    { id: "defaulters_ledger", label: "Defaulters Ledger", badge: "₹4.85L" },
    { id: "fee_structures", label: "Fee Heads & Concessions" },
  ],
  exams: [
    { id: "exam_schedules", label: "Exam Schedules" },
    { id: "mark_entry_grading", label: "Mark Entry & NEP SGPA" },
    { id: "report_cards", label: "Report Cards Generator" },
    { id: "hall_tickets", label: "Hall Tickets / Admit Cards" },
  ],
  communication: [
    { id: "broadcasts", label: "Emergency Broadcasts" },
    { id: "whatsapp_pushes", label: "Automated WhatsApp Pushes" },
    { id: "sms_dlt_logs", label: "Govt DLT SMS Logs" },
  ],
  roles: [
    { id: "roles_matrix", label: "Roles & Access Matrix" },
    { id: "user_pins", label: "Users, Passwords & 4-Digit PINs" },
    { id: "security_policies", label: "Security & Lockout Policies" },
  ],
  settings: [
    { id: "institute_profile", label: "Institute Profile" },
    { id: "statutory_shield", label: "Statutory Shield", badge: "100%" },
    { id: "id_numbering_formats", label: "Roll No & PRN Formats" },
    { id: "branding_theme", label: "Branding & Live Theme" },
    { id: "subdomain_cname", label: "Subdomain & CNAME DNS" },
    { id: "dpdpa_vault", label: "Data Privacy & Governance" },
  ],
  library: [
    { id: "catalog", label: "Book Catalog & RFID" },
    { id: "circulation", label: "Circulation Desk", badge: "14 Checked Out" },
    { id: "overdue_fines", label: "Overdue Fines", badge: "₹1,240" },
  ],
  transport: [
    { id: "routes_stops", label: "Bus Routes & Stops" },
    { id: "fleet_gps", label: "Live GPS Tracking", badge: "8 Active" },
    { id: "driver_mgmt", label: "Drivers & RTO Compliance" },
  ],
  hostel: [
    { id: "room_allotment", label: "Room & Bed Allotment" },
    { id: "mess_dining", label: "Mess Menu & Nutrition" },
    { id: "gate_passes", label: "Digital Gate Passes", badge: "3 Pending" },
  ],
  placements: [
    { id: "recruitment_drives", label: "Recruitment Drives", badge: "2 Upcoming" },
    { id: "internships", label: "Internships & CTC" },
    { id: "recruiters_dir", label: "Corporate Partners" },
  ],
};

export type DemoRoleKey =
  | "super_admin"
  | "college_admin"
  | "principal"
  | "hod"
  | "faculty"
  | "admission_officer"
  | "accountant"
  | "hr_manager"
  | "librarian"
  | "student"
  | "parent";

export interface DemoRoleDefinition {
  key: DemoRoleKey;
  label: string;
  shortTitle: string;
  badge: string;
  initials: string;
  department: string;
  allowedModules: DemoMainModule[];
  permissionsDescription: string;
  sampleStats: { label: string; value: string; hint: string }[];
}

export const DEMO_ROLES: Record<DemoRoleKey, DemoRoleDefinition> = {
  super_admin: {
    key: "super_admin",
    label: "Super Admin",
    shortTitle: "Super Administrator",
    badge: "bg-red-50 text-red-800 border-red-200",
    initials: "SA",
    department: "Apex Trust Executive Directorate",
    allowedModules: [
      "dashboard", "admissions", "academics", "attendance", "fees", "exams",
      "communication", "roles", "settings", "library", "transport", "hostel", "placements"
    ],
    permissionsDescription: "Full root multi-campus authority, institutional security policies, fee structures, and audit logs.",
    sampleStats: [
      { label: "Active Cohorts", value: "64 Classes", hint: "Across 4 Wings" },
      { label: "Enrollment", value: "3,842 Scholars", hint: "98.4% Registered" },
      { label: "System Uptime", value: "99.98% SLA", hint: "PostgreSQL Live" },
      { label: "Compliance Score", value: "100% Audited", hint: "DPDPA & Statutory" },
    ],
  },
  college_admin: {
    key: "college_admin",
    label: "College Admin",
    shortTitle: "College Administrator",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    initials: "CA",
    department: "Registrar Office & Administration",
    allowedModules: [
      "dashboard", "admissions", "academics", "attendance", "fees", "exams",
      "communication", "settings", "library", "transport", "hostel", "placements"
    ],
    permissionsDescription: "Operational administration, admissions quotas, daily attendance registers, and departmental oversight.",
    sampleStats: [
      { label: "Daily Attendance", value: "96.4% Present", hint: "Live Biometric Sync" },
      { label: "Applications", value: "1,420 Received", hint: "AY 2026-27 Pipeline" },
      { label: "Fee Realization", value: "₹24.8 Lakhs", hint: "Dynamic UPI QR Settled" },
      { label: "Faculty On-Duty", value: "148 Active", hint: "12 on Sanctioned Leave" },
    ],
  },
  principal: {
    key: "principal",
    label: "Principal",
    shortTitle: "Principal & Academic Head",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    initials: "PR",
    department: "Office of the Principal",
    allowedModules: [
      "dashboard", "admissions", "academics", "attendance", "exams", "communication"
    ],
    permissionsDescription: "Academic master timetables, examination broadsheets, faculty workload reviews, and parent broadcast approvals.",
    sampleStats: [
      { label: "Pass Percentage", value: "98.2% SGPA", hint: "NEP Credit Scheme" },
      { label: "Teacher Workload", value: "18.4 Hrs/Wk", hint: "Optimally Balanced" },
      { label: "Defaulter Alerts", value: "7 At Risk", hint: "Below 75% Attendance" },
      { label: "Statutory Approvals", value: "Zero Backlog", hint: "TC & Certifications" },
    ],
  },
  hod: {
    key: "hod",
    label: "HOD",
    shortTitle: "HOD & Dept Chair",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    initials: "HD",
    department: "Dept of Computer Science & Engineering",
    allowedModules: [
      "dashboard", "academics", "attendance", "exams", "communication"
    ],
    permissionsDescription: "Department syllabus scheme, laboratory rosters, subject teacher allocations, and internal assessment reviews.",
    sampleStats: [
      { label: "CSE Dept Students", value: "720 Scholars", hint: "8 Batches Active" },
      { label: "Lab Utilization", value: "92% Efficiency", hint: "AI & Cloud Labs" },
      { label: "Internal Marks", value: "100% Submitted", hint: "Mid-Term Cycle 1" },
      { label: "Electives Opted", value: "6 Specializations", hint: "Full Capacity" },
    ],
  },
  faculty: {
    key: "faculty",
    label: "Faculty",
    shortTitle: "Assistant Professor",
    badge: "bg-teal-50 text-teal-800 border-teal-200",
    initials: "FC",
    department: "Dept of Information Technology",
    allowedModules: [
      "dashboard", "academics", "attendance", "exams", "communication"
    ],
    permissionsDescription: "Single-tap classroom roll calls, curriculum lesson planning, assignment grading, and student mentoring.",
    sampleStats: [
      { label: "Assigned Lectures", value: "16 Hours / Week", hint: "Theory + Practicals" },
      { label: "Today's Attendance", value: "100% Marked", hint: "Period 1 to 4" },
      { label: "Evaluations Pending", value: "24 Papers", hint: "Due This Friday" },
      { label: "Mentees Monitored", value: "28 Scholars", hint: "Active Mentorship" },
    ],
  },
  admission_officer: {
    key: "admission_officer",
    label: "Admission Officer",
    shortTitle: "Dean of Admissions",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    initials: "AO",
    department: "Central Admissions Directorate",
    allowedModules: ["dashboard", "admissions", "communication"],
    permissionsDescription: "Direct merit list processing, DigiLocker statutory document audits, entrance counseling, and RTE verification.",
    sampleStats: [
      { label: "Applications", value: "1,420 Applicants", hint: "AY 2026-27" },
      { label: "Docs Verified", value: "640 Candidates", hint: "DigiLocker Synced" },
      { label: "Merit Cut-Off", value: "Round 2 Allotment", hint: "Live Selection" },
      { label: "Quota Seats", value: "100% Compliance", hint: "RTE & EWS Audited" },
    ],
  },
  accountant: {
    key: "accountant",
    label: "Accountant",
    shortTitle: "Accountant & Bursar",
    badge: "bg-yellow-50 text-yellow-800 border-yellow-200",
    initials: "AC",
    department: "Finance & Accounts Division",
    allowedModules: ["dashboard", "fees", "admissions", "settings"],
    permissionsDescription: "Fee collection counter receipts, dynamic UPI QR gateways, fee concession waivers, and defaulter tracking.",
    sampleStats: [
      { label: "Today's Collections", value: "₹4,85,000 Settled", hint: "POS Counter + UPI" },
      { label: "Term Clearance", value: "91.4% Dues Paid", hint: "Semester 4 & 6" },
      { label: "Outstanding Defaulters", value: "34 Scholars Flagged", hint: "Below Threshold" },
      { label: "UPI Reconciliation", value: "Zero Unmatched", hint: "Bank Gateway" },
    ],
  },
  hr_manager: {
    key: "hr_manager",
    label: "HR Manager",
    shortTitle: "HR Manager",
    badge: "bg-purple-50 text-purple-800 border-purple-200",
    initials: "HR",
    department: "Human Resources & Payroll",
    allowedModules: ["dashboard", "academics", "attendance", "roles", "communication"],
    permissionsDescription: "Staff biometric sync, leave sanctions, teaching contracts, salary slips, and UGC employment compliance.",
    sampleStats: [
      { label: "Staff Present", value: "298 Checked-In", hint: "Today 08:30" },
      { label: "Leave Requests", value: "6 Sanctioned", hint: "Medical & Duty" },
      { label: "Monthly Payroll", value: "₹1.18 Cr Processed", hint: "Salary Accounts" },
      { label: "Compliance Status", value: "100% PF & Tax ECR", hint: "Audited" },
    ],
  },
  librarian: {
    key: "librarian",
    label: "Librarian",
    shortTitle: "Chief Librarian",
    badge: "bg-cyan-50 text-cyan-800 border-cyan-200",
    initials: "LB",
    department: "Central Digital Library & RFID Desk",
    allowedModules: ["dashboard", "library", "communication"],
    permissionsDescription: "Book accession register, RFID turnstile checkout, automated fine notices, and DELNET digital cataloging.",
    sampleStats: [
      { label: "Physical Volumes", value: "38,400 Titles", hint: "RFID Tagged" },
      { label: "Books in Circulation", value: "842 Checked-Out", hint: "Due This Week" },
      { label: "Digital E-Journals", value: "14,500 Subscribed", hint: "IEEE & Scopus" },
      { label: "Overdue Dues", value: "₹1,240 Assessed", hint: "Auto-Fine Receipt" },
    ],
  },
  student: {
    key: "student",
    label: "Student",
    shortTitle: "Scholar (Student)",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
    initials: "ST",
    department: "Computer Science & Engineering (Sem 6)",
    allowedModules: ["dashboard", "academics", "attendance", "fees", "exams", "library", "placements"],
    permissionsDescription: "Self-service timetable, biometric attendance percentage, fee receipts, digital hall tickets, and placement applications.",
    sampleStats: [
      { label: "Current CGPA", value: "8.94 / 10.0", hint: "Distinction Rank" },
      { label: "Attendance Meter", value: "96.2% Present", hint: "Eligible for Exams" },
      { label: "Fee Clearance", value: "Zero Dues", hint: "Receipt #5812" },
      { label: "Exam Admit Card", value: "Hall Ticket Issued", hint: "Verified" },
    ],
  },
  parent: {
    key: "parent",
    label: "Parent",
    shortTitle: "Parent / Guardian",
    badge: "bg-violet-50 text-violet-800 border-violet-200",
    initials: "PT",
    department: "Parent-Institute Council",
    allowedModules: ["dashboard", "attendance", "fees", "exams", "communication", "transport"],
    permissionsDescription: "Daily classroom roll call alerts, live GPS bus tracking, 1-tap fee payments, and faculty mentor chat.",
    sampleStats: [
      { label: "Ward Status", value: "Present (08:14 AM)", hint: "Class 10-A / Lab 2" },
      { label: "Fee Balance", value: "₹0 Outstanding", hint: "Fully Cleared" },
      { label: "Term Performance", value: "8.80 SGPA", hint: "Top 5% of Cohort" },
      { label: "Bus Route #4", value: "Live On-Time GPS", hint: "ETA 04:15 PM" },
    ],
  },
};

interface DemoContextType {
  activeModule: DemoMainModule;
  setActiveModule: (mod: DemoMainModule) => void;
  activeSubTab: string;
  setActiveSubTab: (tabId: string) => void;
  institutionName: string;
  setInstitutionName: (name: string) => void;
  currentDemoRole: DemoRoleKey;
  setCurrentDemoRole: (role: DemoRoleKey) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
  theme: BrandThemePalette;
  enabledModules: DemoMainModule[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModuleState] = useState<DemoMainModule>("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");
  const [institutionName, setInstitutionName] = useState<string>("Apex Institute of Engineering & Technology");
  const [currentDemoRole, setCurrentDemoRole] = useState<DemoRoleKey>("college_admin");
  const [brandColor, setBrandColor] = useState<string>("#153E35"); // Default Premium Emerald Green

  const theme = getThemeFromColor(brandColor);

  const setActiveModule = (mod: DemoMainModule) => {
    setActiveModuleState(mod);
    const subtabs = DEMO_MODULE_SUBTABS[mod];
    if (subtabs && subtabs.length > 0) {
      setActiveSubTab(subtabs[0].id);
    }
  };

  const enabledModules: DemoMainModule[] = [
    "dashboard",
    "admissions",
    "academics",
    "attendance",
    "fees",
    "exams",
    "communication",
    "roles",
    "settings",
    "library",
    "transport",
    "hostel",
    "placements",
  ];

  return (
    <DemoContext.Provider
      value={{
        activeModule,
        setActiveModule,
        activeSubTab,
        setActiveSubTab,
        institutionName,
        setInstitutionName,
        currentDemoRole,
        setCurrentDemoRole,
        brandColor,
        setBrandColor,
        theme,
        enabledModules,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
