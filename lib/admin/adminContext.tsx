"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { InstitutionalArchetype } from "@/lib/terminology";
import { getThemeFromColor, BrandThemePalette } from "./themeUtils";
import { getTenantConfig, updateTenantBranding } from "@/lib/actions/tenantActions";

export type AdminMainModule =
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

export interface SubModuleTab {
  id: string;
  label: string;
  badge?: string | number;
}

export interface ModuleMetadata {
  id: AdminMainModule;
  label: string;
  category: "Core Academics" | "Operations & Finance" | "Administration" | "Campus Add-ons";
  description: string;
  isCore?: boolean;
}

export const ALL_AVAILABLE_MODULES: ModuleMetadata[] = [
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

export const DEFAULT_ENABLED_MODULES: AdminMainModule[] = [
  "dashboard",
  "admissions",
  "academics",
  "attendance",
  "fees",
  "exams",
  "communication",
  "roles",
  "settings",
];

export const MODULE_SUBTABS: Record<AdminMainModule, SubModuleTab[]> = {
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
  initials: string;
  badge: string;
  department: string;
  allowedModules: AdminMainModule[];
  permissionsDescription: string;
  sampleStats: { label: string; value: string; hint?: string }[];
}

export const DEMO_ROLES: Record<DemoRoleKey, DemoRoleDefinition> = {
  super_admin: {
    key: "super_admin",
    label: "Super Admin",
    shortTitle: "Super Admin",
    initials: "SA",
    badge: "bg-red-50 text-red-700 border-red-200",
    department: "Campus IT & Cloud Architecture",
    allowedModules: [
      "dashboard", "admissions", "academics", "attendance", "fees", "exams",
      "communication", "roles", "settings", "library", "transport", "hostel", "placements"
    ],
    permissionsDescription: "Full unrestricted platform governance, schema provisioning, multi-tenant RBAC policies & audit logs.",
    sampleStats: [
      { label: "Campus Nodes", value: "4 Multi-Tenant Nodes", hint: "Healthy" },
      { label: "System Health", value: "99.98% SLA", hint: "Optimal" },
      { label: "Daily DB Transactions", value: "48,290 Logged", hint: "Zero Drop" },
      { label: "Active Connections", value: "312 Staff & Students", hint: "Live Ingress" },
    ],
  },
  college_admin: {
    key: "college_admin",
    label: "College Admin",
    shortTitle: "College Admin",
    initials: "CA",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    department: "Central Institutional Operations",
    allowedModules: [
      "dashboard", "admissions", "academics", "attendance", "fees", "exams",
      "communication", "roles", "settings", "library", "transport", "hostel", "placements"
    ],
    permissionsDescription: "Complete institutional governance across academics, admissions, fee ledgers, exam schedules & faculty rosters.",
    sampleStats: [
      { label: "Total Enrolled", value: "4,850 Students", hint: "Active Roll" },
      { label: "Teaching Faculty", value: "218 Professors", hint: "8 Wings" },
      { label: "Daily Attendance", value: "96.4% Today", hint: "RFID / Biometric" },
      { label: "Fee Collections", value: "₹1.42 Cr Settled", hint: "Term Recovery" },
    ],
  },
  principal: {
    key: "principal",
    label: "Principal",
    shortTitle: "Principal",
    initials: "PR",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    department: "Office of the Principal & Director",
    allowedModules: [
      "dashboard", "admissions", "academics", "attendance", "fees", "exams",
      "communication", "roles", "settings", "placements"
    ],
    permissionsDescription: "Institutional oversight, statutory council approvals, NAAC/UGC compliance, and faculty workloads.",
    sampleStats: [
      { label: "College Pass Rate", value: "96.4% This Term", hint: "CBCS Standard" },
      { label: "NAAC Rating", value: "Grade A++ (3.74)", hint: "Accredited" },
      { label: "Campus Placements", value: "94.2% CTC Placed", hint: "Top Recruiters" },
      { label: "Faculty Appraisal", value: "100% Completed", hint: "UGC Matrix" },
    ],
  },
  hod: {
    key: "hod",
    label: "HOD",
    shortTitle: "HOD (Computer Science)",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    initials: "HD",
    department: "Department of Computer Science & AI",
    allowedModules: ["dashboard", "academics", "attendance", "exams", "communication", "library"],
    permissionsDescription: "Curriculum mapping, laboratory timetables, faculty proxy substitution, and semester internal marks moderation.",
    sampleStats: [
      { label: "Dept Students", value: "840 Scholars", hint: "CSE & AI" },
      { label: "Dept Faculty", value: "36 Professors", hint: "Full Strength" },
      { label: "Lab Utilization", value: "92% Capacity", hint: "6 Labs Active" },
      { label: "Syllabus Progress", value: "88% Covered", hint: "On Schedule" },
    ],
  },
  faculty: {
    key: "faculty",
    label: "Faculty",
    shortTitle: "Faculty In-Charge",
    badge: "bg-teal-50 text-teal-800 border-teal-200",
    initials: "FC",
    department: "Software Systems & Information Tech",
    allowedModules: ["dashboard", "academics", "attendance", "exams", "communication", "library"],
    permissionsDescription: "Classroom roll call, lesson notes, assignment grading, SGPA internal markbook, and student mentoring.",
    sampleStats: [
      { label: "Weekly Workload", value: "16 Hours / Week", hint: "4 Courses" },
      { label: "Class In-Charge", value: "B.Tech Sem 6 (A)", hint: "64 Scholars" },
      { label: "Attendance Marked", value: "100% On-Time", hint: "Today 08:30" },
      { label: "Internal Marks", value: "Verified & Locked", hint: "CBCS Scale" },
    ],
  },
  admission_officer: {
    key: "admission_officer",
    label: "Admission Officer",
    shortTitle: "Admission Officer",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    initials: "AO",
    department: "Counseling & Enrollment Desk",
    allowedModules: ["dashboard", "admissions", "fees", "communication"],
    permissionsDescription: "Application scrutiny, entrance cut-off verification, caste/income quota allotments, and admission dossier generation.",
    sampleStats: [
      { label: "Inquiries Received", value: "1,420 Applicants", hint: "AY 2026-27" },
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

interface AdminContextType {
  activeModule: AdminMainModule;
  setActiveModule: (mod: AdminMainModule) => void;
  activeSubTab: string;
  setActiveSubTab: (tabId: string) => void;
  currentArchetype: InstitutionalArchetype;
  setCurrentArchetype: (arch: InstitutionalArchetype) => void;
  institutionName: string;
  setInstitutionName: (name: string) => void;
  adminName: string;
  adminRole: string;
  adminInitials: string;
  brandColor: string;
  setBrandColor: (color: string) => void;
  theme: BrandThemePalette;
  // Dynamic Modules Management
  enabledModules: AdminMainModule[];
  addModule: (mod: AdminMainModule) => void;
  removeModule: (mod: AdminMainModule) => void;
  toggleModule: (mod: AdminMainModule) => void;
  resetModules: () => void;
  // Demo Mode
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
  // Demo Role Simulation
  currentDemoRole: DemoRoleKey;
  setCurrentDemoRole: (role: DemoRoleKey) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModuleState] = useState<AdminMainModule>("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");

  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        // Explicit query param takes highest authority
        if (urlParams.get("mode") === "demo" || urlParams.get("demo") === "true") {
          return true;
        }
        if (urlParams.get("mode") === "real" || urlParams.get("real") === "true") {
          localStorage.removeItem("occo_demo_mode");
          document.cookie = "occo_demo_mode=; path=/; max-age=0;";
          return false;
        }
        // In real mode (when no mode=demo query param), do not fall back to demo mode
        return false;
      } catch {
        // ignore
      }
    }
    return false;
  });

  const setIsDemoMode = (demo: boolean) => {
    setIsDemoModeState(demo);
    if (typeof window !== "undefined") {
      try {
        if (demo) {
          localStorage.setItem("occo_demo_mode", "true");
          document.cookie = "occo_demo_mode=true; path=/; max-age=86400;";
        } else {
          localStorage.removeItem("occo_demo_mode");
          document.cookie = "occo_demo_mode=; path=/; max-age=0;";
        }
      } catch {
        // ignore
      }
    }
  };

  const [currentArchetype, setCurrentArchetypeState] = useState<InstitutionalArchetype>(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("mode") === "demo" || urlParams.get("demo") === "true") {
          return "DEGREE_COLLEGE";
        }
        const saved = localStorage.getItem("occo_archetype") as InstitutionalArchetype;
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return "DEGREE_COLLEGE";
  });

  const [institutionName, setInstitutionNameState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("mode") === "demo" || urlParams.get("demo") === "true") {
          return "Apex Institute of Engineering & Technology";
        }
        const saved = localStorage.getItem("occo_institution_name");
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return "Apex Institute of Engineering & Technology";
  });

  const [brandColor, setBrandColorState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("occo_theme_color");
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return "#153E35";
  });

  const [enabledModules, setEnabledModules] = useState<AdminMainModule[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("occo_enabled_modules");
        if (saved) {
          const parsed = JSON.parse(saved) as AdminMainModule[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (!parsed.includes("dashboard")) parsed.unshift("dashboard");
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_ENABLED_MODULES;
  });

  const [currentDemoRole, setCurrentDemoRole] = useState<DemoRoleKey>("college_admin");

  // Fetch real persistent configuration from PostgreSQL on mount if not in demo mode
  useEffect(() => {
    if (isDemoMode) return;
    let isMounted = true;
    getTenantConfig()
      .then((cfg) => {
        if (!isMounted || !cfg) return;
        if (cfg.name) setInstitutionNameState(cfg.name);
        if (cfg.primaryColor) setBrandColorState(cfg.primaryColor);
        if (cfg.type) setCurrentArchetypeState(cfg.type as InstitutionalArchetype);
        if (Array.isArray(cfg.enabledModules) && cfg.enabledModules.length > 0) {
          setEnabledModules(cfg.enabledModules as AdminMainModule[]);
        }
      })
      .catch((err) => {
        console.warn("Could not sync tenant config with PostgreSQL:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [isDemoMode]);

  const adminName = isDemoMode
    ? DEMO_ROLES[currentDemoRole].label
    : "Institution Owner";
  const adminRole = isDemoMode
    ? DEMO_ROLES[currentDemoRole].shortTitle
    : currentArchetype === "K12_SCHOOL"
    ? "Principal & Institution Head"
    : currentArchetype === "DEGREE_COLLEGE"
    ? "Principal & College Head"
    : currentArchetype === "UNIVERSITY"
    ? "Vice-Chancellor / Dean"
    : "Institution Director & Owner";
  const adminInitials = isDemoMode
    ? DEMO_ROLES[currentDemoRole].initials
    : "IO";

  const setBrandColor = (color: string) => {
    setBrandColorState(color);
    try {
      localStorage.setItem("occo_theme_color", color);
    } catch {
      // ignore
    }
    if (!isDemoMode) {
      updateTenantBranding({ primaryColor: color }).catch(console.error);
    }
  };

  const setInstitutionName = (name: string) => {
    setInstitutionNameState(name);
    try {
      localStorage.setItem("occo_institution_name", name);
    } catch {
      // ignore
    }
    if (!isDemoMode) {
      updateTenantBranding({ name }).catch(console.error);
    }
  };

  const setCurrentArchetype = (arch: InstitutionalArchetype) => {
    setCurrentArchetypeState(arch);
    try {
      localStorage.setItem("occo_archetype", arch);
    } catch {
      // ignore
    }
    if (!isDemoMode) {
      updateTenantBranding({ type: arch }).catch(console.error);
    }
  };

  const persistModules = (mods: AdminMainModule[]) => {
    setEnabledModules(mods);
    try {
      localStorage.setItem("occo_enabled_modules", JSON.stringify(mods));
    } catch {
      // ignore
    }
    if (!isDemoMode) {
      updateTenantBranding({ enabledModules: mods }).catch(console.error);
    }
  };

  const addModule = (mod: AdminMainModule) => {
    if (!enabledModules.includes(mod)) {
      persistModules([...enabledModules, mod]);
    }
  };

  const removeModule = (mod: AdminMainModule) => {
    if (mod === "dashboard") return; // Dashboard cannot be deleted
    const updated = enabledModules.filter((m) => m !== mod);
    persistModules(updated);
    if (activeModule === mod) {
      setActiveModuleState("dashboard");
      setActiveSubTab("overview");
    }
  };

  const toggleModule = (mod: AdminMainModule) => {
    if (mod === "dashboard") return;
    if (enabledModules.includes(mod)) {
      removeModule(mod);
    } else {
      addModule(mod);
    }
  };

  const resetModules = () => {
    persistModules(DEFAULT_ENABLED_MODULES);
  };

  const theme = getThemeFromColor(brandColor);

  const setActiveModule = (mod: AdminMainModule) => {
    setActiveModuleState(mod);
    const subtabs = MODULE_SUBTABS[mod];
    if (subtabs && subtabs.length > 0) {
      setActiveSubTab(subtabs[0].id);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        activeModule,
        setActiveModule,
        activeSubTab,
        setActiveSubTab,
        currentArchetype,
        setCurrentArchetype,
        institutionName,
        setInstitutionName,
        adminName,
        adminRole,
        adminInitials,
        brandColor,
        setBrandColor,
        theme,
        enabledModules,
        addModule,
        removeModule,
        toggleModule,
        resetModules,
        isDemoMode,
        setIsDemoMode,
        currentDemoRole,
        setCurrentDemoRole,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
