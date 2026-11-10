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
    { id: "admissions_feed", label: "Admissions Feed", badge: "12" },
    { id: "fees_feed", label: "Collections", badge: "3 Pending" },
    { id: "attendance_feed", label: "Live Roll Call", badge: "96.8%" },
    { id: "statutory_shield", label: "Statutory Shield", badge: "100%" },
  ],
  admissions: [
    { id: "all_applications", label: "All Inquiries & Applications" },
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
    { id: "activation_keys", label: "License & 8-Digit Keys", badge: "Super Admin" },
  ],
  settings: [
    { id: "institute_profile", label: "Institute Profile" },
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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModuleState] = useState<AdminMainModule>("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");

  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("mode") === "demo" || urlParams.get("demo") === "true") {
          return true;
        }
        return localStorage.getItem("occo_demo_mode") === "true";
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
        localStorage.setItem("occo_demo_mode", demo ? "true" : "false");
      } catch {
        // ignore
      }
    }
  };

  const [currentArchetype, setCurrentArchetypeState] = useState<InstitutionalArchetype>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("occo_archetype") as InstitutionalArchetype;
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return "K12_SCHOOL";
  });

  const [institutionName, setInstitutionNameState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("occo_institution_name");
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return "Apex International Global Academy";
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
    return "#DC2626";
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

  const adminName = "Super Admin";
  const adminRole = isDemoMode ? "Guest Evaluator (Demo Sandbox)" : "Institution Owner / Super Admin";

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
