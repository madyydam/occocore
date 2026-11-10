/**
 * Scalable Role-Based Access Control (RBAC), Extensible Role Registry & PIN Security Engine
 * Designed for senior enterprise architecture:
 * 1. Admin can manage all roles and dynamically register new custom roles.
 * 2. Admin can toggle granular module access per role.
 * 3. Mandatory 3-Tier Security: Email + Password + 4-Digit PIN on all logins.
 * 4. Admin can set/reset user passwords and 4-digit PINs with force-reset flags.
 */

export type PortalCategory = "admin" | "staff" | "student" | "parent" | "custom";
export type AuthStrategy = "email_password_pin" | "password_2fa";

export interface RoleConfig {
  key: string;
  label: string;
  category: PortalCategory;
  description: string;
  authStrategy: AuthStrategy;
  badgeColor: string;
  defaultRoute: string;
  iconName: string;
  isCustom?: boolean;
  permissions: string[];
  allowedModules: string[];
}

export interface SystemModule {
  id: string;
  name: string;
  category: "Core" | "Academics" | "Finance" | "Logistics" | "Engagement" | "Compliance";
  description: string;
}

export const SYSTEM_MODULES: SystemModule[] = [
  { id: "admissions", name: "Admissions & SIS Profiles", category: "Core", description: "Online inquiries, applicant verification, 60+ field student vault & TC issuance" },
  { id: "academics", name: "Academics & Curriculum", category: "Academics", description: "Syllabus mapping, subject allocation, lesson plans & academic terms" },
  { id: "timetable", name: "Timetable & Workloads", category: "Academics", description: "Automated schedule matrix, room allocation & faculty substitution solver" },
  { id: "attendance", name: "Attendance & RFID Gate", category: "Core", description: "Classroom roll call, biometric turnstile sync & instant WhatsApp alerts" },
  { id: "fees", name: "Fee Engine & POS Cashier", category: "Finance", description: "Instalment slabs, offline cash counter receipts, fine waivers & UPI reconciliation" },
  { id: "exams", name: "Exams & CBCS Marksheets", category: "Academics", description: "Exam schedules, hall tickets, markbook entry & automated PDF report cards" },
  { id: "transport", name: "Transport Fleet & GPS", category: "Logistics", description: "Bus routes, stop geofences, driver roster & live parent bus tracking" },
  { id: "hostel", name: "Hostel & Room Allocation", category: "Logistics", description: "Dorm inventory, night curfew roll call & digital out-pass gatekeeper" },
  { id: "library", name: "Library OPAC & Barcodes", category: "Academics", description: "Catalog accession, barcode check-in/out & overdue automated fines" },
  { id: "communication", name: "Circulars & Parent Chat", category: "Engagement", description: "Institutional notices, DLT-verified SMS & 1-on-1 teacher chat" },
  { id: "reports", name: "Compliance & Audit Exports", category: "Compliance", description: "UDISE+ exports, RTE 25% audits, statutory tax reports & NAAC matrices" },
];

/**
 * Enterprise Core Role Definitions
 * Extensible: Admin can customize module access or register custom roles at runtime.
 */
export const ROLE_DEFINITIONS: Record<string, RoleConfig> = {
  ADMIN: {
    key: "ADMIN",
    label: "Institution Administrator",
    category: "staff",
    description: "Head & Owner of the Institution with full administrative control over the campus.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    defaultRoute: "/erp",
    iconName: "Building",
    permissions: [
      "admissions:read",
      "admissions:write",
      "academics:read",
      "academics:write",
      "fees:read",
      "fees:collect",
      "attendance:read",
      "attendance:write",
      "exams:read",
      "exams:write",
      "roles:manage",
      "settings:branding",
    ],
    allowedModules: [
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
    ],
  },
  COORDINATOR: {
    key: "COORDINATOR",
    label: "Academic HOD / Dean",
    category: "staff",
    description: "Curriculum oversight, faculty workloads, timetable scheduling & exam moderation.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    defaultRoute: "/coordinator/academics",
    iconName: "GraduationCap",
    permissions: [
      "academics:view",
      "academics:edit",
      "timetable:manage",
      "exams:moderate",
      "staff:view",
    ],
    allowedModules: ["academics", "timetable", "attendance", "exams", "communication"],
  },
  TEACHER: {
    key: "TEACHER",
    label: "Faculty / Teacher",
    category: "staff",
    description: "Classroom roll call, test markbooks, daily homework, and parent communication.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    defaultRoute: "/teacher/classroom",
    iconName: "Users",
    permissions: [
      "attendance:mark",
      "marks:enter",
      "homework:post",
      "circulars:view",
      "chat:parents",
    ],
    allowedModules: ["academics", "attendance", "exams", "communication"],
  },
  ACCOUNTANT: {
    key: "ACCOUNTANT",
    label: "Finance Officer / Bursar",
    category: "staff",
    description: "Fee structures, POS cash counter collection, refunds, and bank reconciliations.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    defaultRoute: "/accounts/fees",
    iconName: "CreditCard",
    permissions: [
      "fees:collect",
      "fees:structure",
      "fees:refund",
      "reports:financial",
    ],
    allowedModules: ["fees", "admissions", "reports"],
  },
  LIBRARIAN: {
    key: "LIBRARIAN",
    label: "Chief Librarian",
    category: "staff",
    description: "Book accession, barcode scanning, issue/return circulation, and overdue fines.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    defaultRoute: "/library/circulation",
    iconName: "BookOpen",
    permissions: [
      "library:catalog",
      "library:issue",
      "library:return",
      "library:fines",
    ],
    allowedModules: ["library"],
  },
  TRANSPORT_HEAD: {
    key: "TRANSPORT_HEAD",
    label: "Transport Supervisor",
    category: "staff",
    description: "Bus fleet management, GPS tracking, driver allocations, and route stops.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    defaultRoute: "/transport/fleet",
    iconName: "Bus",
    permissions: [
      "transport:routes",
      "transport:drivers",
      "transport:vehicles",
      "transport:gps_live",
    ],
    allowedModules: ["transport"],
  },
  WARDEN: {
    key: "WARDEN",
    label: "Hostel Warden",
    category: "staff",
    description: "Dormitory allocations, night curfew roll call, mess menus, and digital out-passes.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    defaultRoute: "/hostel/curfew",
    iconName: "Home",
    permissions: [
      "hostel:rooms",
      "hostel:curfew",
      "hostel:outpass_verify",
    ],
    allowedModules: ["hostel"],
  },
  STUDENT: {
    key: "STUDENT",
    label: "Student",
    category: "student",
    description: "Personal schedule, report cards, fee receipts, digital ID card, and library.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    defaultRoute: "/student/portal",
    iconName: "UserCheck",
    permissions: [
      "student:view_self",
      "attendance:view_own",
      "marks:view_own",
      "fees:pay_online",
      "library:reserve",
    ],
    allowedModules: ["academics", "timetable", "attendance", "fees", "exams", "library"],
  },
  PARENT: {
    key: "PARENT",
    label: "Parent / Guardian",
    category: "parent",
    description: "Multi-child switcher, live attendance alerts, 1-tap fee payments, and teacher chat.",
    authStrategy: "email_password_pin",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    defaultRoute: "/parent/dashboard",
    iconName: "HeartHandshake",
    permissions: [
      "parent:view_wards",
      "attendance:view_ward",
      "fees:pay_online",
      "chat:teacher",
      "leave:apply_ward",
    ],
    allowedModules: ["academics", "attendance", "fees", "exams", "transport", "communication"],
  },
};

/**
 * Managed Institutional User Account with Mandatory 4-Digit Security PIN
 */
export interface ManagedUserAccount {
  id: string;
  name: string;
  email: string;
  roleKey: string;
  pin: string; // 4-digit PIN (e.g. "2468")
  defaultPassword?: string;
  status: "ACTIVE" | "PENDING_FIRST_LOGIN" | "LOCKED";
  allowedModules: string[];
  lastLogin?: string;
  mustChangePinOnLogin: boolean;
}

/**
 * Pre-seeded Institutional Demo Accounts
 * All accounts require Email + Password + 4-Digit Security PIN to authenticate.
 */
export const INITIAL_USER_ACCOUNTS: ManagedUserAccount[] = [
  {
    id: "usr-01",
    name: "Governing Council / Institution Owner",
    email: "owner@apexcollege.edu",
    roleKey: "ADMIN",
    pin: "2468",
    defaultPassword: "AdminPass@2026",
    status: "ACTIVE",
    allowedModules: ["admissions", "academics", "timetable", "attendance", "fees", "exams", "transport", "hostel", "library", "communication", "reports"],
    lastLogin: "2 mins ago (10:11 AM)",
    mustChangePinOnLogin: false,
  },
  {
    id: "usr-02",
    name: "Dean of Academic Affairs & HOD",
    email: "dean.academics@apexcollege.edu",
    roleKey: "COORDINATOR",
    pin: "1357",
    defaultPassword: "StaffPass@2026",
    status: "ACTIVE",
    allowedModules: ["academics", "timetable", "attendance", "exams", "communication"],
    lastLogin: "1 hour ago",
    mustChangePinOnLogin: false,
  },
  {
    id: "usr-03",
    name: "Senior Faculty & Department In-Charge",
    email: "faculty.lead@apexcollege.edu",
    roleKey: "TEACHER",
    pin: "9876",
    defaultPassword: "StaffPass@2026",
    status: "ACTIVE",
    allowedModules: ["academics", "attendance", "exams", "communication"],
    lastLogin: "Today 08:30 AM",
    mustChangePinOnLogin: false,
  },
  {
    id: "usr-04",
    name: "Chief Accounts Officer & Bursar",
    email: "accounts.bursar@apexcollege.edu",
    roleKey: "ACCOUNTANT",
    pin: "4321",
    defaultPassword: "StaffPass@2026",
    status: "ACTIVE",
    allowedModules: ["fees", "admissions", "reports"],
    lastLogin: "Yesterday",
    mustChangePinOnLogin: false,
  },
  {
    id: "usr-05",
    name: "Student Council Representative",
    email: "student.council@apexcollege.edu",
    roleKey: "STUDENT",
    pin: "2026",
    defaultPassword: "StudentPass@2026",
    status: "ACTIVE",
    allowedModules: ["academics", "timetable", "attendance", "fees", "exams", "library"],
    lastLogin: "Today 08:15 AM",
    mustChangePinOnLogin: false,
  },
  {
    id: "usr-06",
    name: "Parent-Teacher Council Executive",
    email: "parent.council@apexcollege.edu",
    roleKey: "PARENT",
    pin: "7788",
    defaultPassword: "ParentPass@2026",
    status: "ACTIVE",
    allowedModules: ["academics", "attendance", "fees", "exams", "transport", "communication"],
    lastLogin: "Today 08:20 AM",
    mustChangePinOnLogin: false,
  },
];

/**
 * Dynamic registry function to add new custom roles in the future
 */
export function registerCustomRole(role: RoleConfig): void {
  ROLE_DEFINITIONS[role.key] = {
    ...role,
    isCustom: true,
  };
}

/**
 * Get all role keys
 */
export function getAllRoleKeys(): string[] {
  return Object.keys(ROLE_DEFINITIONS);
}

/**
 * Filter roles by portal category
 */
export function getRolesByCategory(category: PortalCategory): RoleConfig[] {
  return Object.values(ROLE_DEFINITIONS).filter((r) => r.category === category);
}

/**
 * Check if a role has a given permission
 */
export function hasPermission(roleKey: string, permission: string): boolean {
  const role = ROLE_DEFINITIONS[roleKey];
  if (!role) return false;
  if (role.permissions.includes("*")) return true;
  if (role.permissions.includes(permission)) return true;

  // Wildcard check (e.g. "academics:*" matches "academics:view")
  const [scope] = permission.split(":");
  return role.permissions.includes(`${scope}:*`);
}

/**
 * Check if a role is authorized to access a given system module
 */
export function canRoleAccessModule(roleKey: string, moduleId: string): boolean {
  const role = ROLE_DEFINITIONS[roleKey];
  if (!role) return false;
  if (role.permissions.includes("*")) return true;
  return role.allowedModules.includes(moduleId);
}
