/**
 * Scalable Role-Based Access Control (RBAC) & Extensible Role Registry
 * Designed for senior enterprise architecture: any future role can be plugged in
 * by adding a role definition to `ROLE_DEFINITIONS` without breaking existing portals.
 */

export type PortalCategory = "super_admin" | "staff" | "student" | "parent" | "custom";

export type AuthStrategy = "password" | "password_2fa" | "otp" | "prn_password";

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
}

/**
 * Enterprise Core Role Definitions
 * Extensible: add new keys to this registry anytime.
 */
export const ROLE_DEFINITIONS: Record<string, RoleConfig> = {
  SUPER_ADMIN: {
    key: "SUPER_ADMIN",
    label: "Super Admin",
    category: "super_admin",
    description: "Global Platform Owner with complete SaaS governance and tenant control.",
    authStrategy: "password_2fa",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    defaultRoute: "/super-admin",
    iconName: "ShieldAlert",
    permissions: ["*"], // All permissions
  },
  ADMIN: {
    key: "ADMIN",
    label: "Principal / Director",
    category: "staff",
    description: "Head of Institution with full administrative control over the tenant.",
    authStrategy: "password",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    defaultRoute: "/admin/dashboard",
    iconName: "Building",
    permissions: [
      "settings:*",
      "academics:*",
      "admissions:*",
      "staff:*",
      "fees:*",
      "exams:*",
      "reports:*",
      "compliance:*",
    ],
  },
  COORDINATOR: {
    key: "COORDINATOR",
    label: "Academic HOD / Dean",
    category: "staff",
    description: "Curriculum oversight, faculty workloads, timetable scheduling & exam moderation.",
    authStrategy: "password",
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
  },
  TEACHER: {
    key: "TEACHER",
    label: "Faculty / Teacher",
    category: "staff",
    description: "Classroom roll call, test markbooks, daily homework, and parent communication.",
    authStrategy: "password",
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
  },
  ACCOUNTANT: {
    key: "ACCOUNTANT",
    label: "Finance Officer / Bursar",
    category: "staff",
    description: "Fee structures, POS cash counter collection, refunds, and bank reconciliations.",
    authStrategy: "password",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    defaultRoute: "/accounts/pos",
    iconName: "CreditCard",
    permissions: [
      "fees:collect",
      "fees:view_ledgers",
      "receipts:issue",
      "receipts:void",
      "bank:reconcile",
    ],
  },
  LIBRARIAN: {
    key: "LIBRARIAN",
    label: "Librarian",
    category: "staff",
    description: "Catalog accession, barcode scanning, checkouts, and overdue fine collection.",
    authStrategy: "password",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    defaultRoute: "/library/circulation",
    iconName: "BookOpen",
    permissions: [
      "library:catalog",
      "library:issue",
      "library:return",
      "library:fines",
    ],
  },
  TRANSPORT_HEAD: {
    key: "TRANSPORT_HEAD",
    label: "Transport Supervisor",
    category: "staff",
    description: "Bus routes, stops, vehicle insurance & driver assignment tracking.",
    authStrategy: "password",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    defaultRoute: "/transport/fleet",
    iconName: "Bus",
    permissions: [
      "transport:routes",
      "transport:vehicles",
      "transport:attendance",
    ],
  },
  HOSTEL_WARDEN: {
    key: "HOSTEL_WARDEN",
    label: "Hostel Warden",
    category: "staff",
    description: "Room & bed allocations, mess meal planning, and night curfew digital out-passes.",
    authStrategy: "password",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    defaultRoute: "/hostel/rooms",
    iconName: "Home",
    permissions: [
      "hostel:rooms",
      "hostel:curfew",
      "hostel:outpass_verify",
    ],
  },
  STUDENT: {
    key: "STUDENT",
    label: "Student",
    category: "student",
    description: "Personal schedule, report cards, fee receipts, digital ID card, and library.",
    authStrategy: "prn_password",
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
  },
  PARENT: {
    key: "PARENT",
    label: "Parent / Guardian",
    category: "parent",
    description: "Multi-child switcher, live attendance alerts, 1-tap fee payments, and teacher chat.",
    authStrategy: "otp",
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
  },
};

/**
 * Dynamic registry function to add new custom roles in the future
 * e.g., registerCustomRole({ key: "EXAM_CONTROLLER", ... })
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
