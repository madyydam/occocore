# Role-Based Access Control (RBAC) & Granular Permission Matrix

This document defines the complete security authorization architecture, role taxonomy, and the 120+ granular permission matrix across all ERP modules.

---

## 1. Role Taxonomy & Hierarchy

1. **SUPER ADMIN**: Platform owner. Global SaaS governance, subscription management, tenant feature flag matrix, and audited impersonation.
2. **ADMIN (Institute Owner / Principal)**: Head of tenant institution. Complete administrative governance over academic years, staff, admissions, fees, and compliance exports.
3. **ACADEMIC COORDINATOR / HOD**: Oversight over departmental faculty, lesson plans, timetable scheduling, and examination moderation.
4. **TEACHER / FACULTY**: Daily classroom roll call, mark entry, assignment creation, student behavior notes, and parent chat.
5. **ACCOUNTANT**: Fee structure configuration, invoice generation, POS cash counter collection, receipts, and bank reconciliation.
6. **LIBRARIAN**: Catalog accession, barcode generation, book checkout/checkin, and overdue fine collection.
7. **TRANSPORT HEAD**: Route and stop planning, driver profiles, vehicle compliance alerts, and student bus boarding rosters.
8. **HOSTEL WARDEN**: Room/bed allocations, night curfew roll call, mess menu planning, and digital out-pass gatekeeper verification.
9. **STUDENT**: Personal timetable, marksheet download, online fee payment, digital library OPAC, and homework submissions.
10. **PARENT**: Multi-child switcher, live attendance tracking, instant 1-tap fee payment, report cards, and teacher messaging.

---

## 2. Granular Permission Matrix (Sample of 120+ Permissions)

Legend:
- `C`: Create
- `R`: Read / View
- `U`: Update / Edit
- `D`: Delete
- `-`: Forbidden

| Module | Permission Key | Admin | Coordinator | Teacher | Accountant | Student | Parent |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Settings** | `settings:view` | CRUD | R | - | - | - | - |
| **Settings** | `settings:domains` | CRUD | - | - | - | - | - |
| **Settings** | `settings:branding` | CRUD | - | - | - | - | - |
| **Academics** | `class:manage` | CRUD | CRUD | R | R | R | R |
| **Academics** | `subject:manage` | CRUD | CRUD | R | - | R | R |
| **Admissions** | `student:create` | CRUD | R | - | - | - | - |
| **Admissions** | `student:view_all` | CRUD | R | R (My Class) | R | - | - |
| **Admissions** | `student:edit` | CRUD | - | - | - | - | - |
| **Admissions** | `student:issue_tc` | CRUD | - | - | - | - | - |
| **Attendance** | `attendance:mark` | CRUD | CRUD | CRU | - | - | - |
| **Attendance** | `attendance:view` | CRUD | R | R | R | R (Self) | R (Ward) |
| **Attendance** | `attendance:lock_override` | CRUD | - | - | - | - | - |
| **Timetable** | `timetable:manage` | CRUD | CRUD | R | - | R | R |
| **Timetable** | `timetable:substitute` | CRUD | CRUD | - | - | - | - |
| **Fees** | `fees:structure_manage`| CRUD | - | - | CRUD | - | - |
| **Fees** | `fees:collect_cash` | CRUD | - | - | CRU | - | - |
| **Fees** | `fees:issue_concession`| CRUD | - | - | R | - | - |
| **Fees** | `fees:view_own` | - | - | - | - | R (Self) | R (Ward) |
| **Fees** | `fees:pay_online` | - | - | - | - | CR | CR |
| **Exams** | `exam:schedule` | CRUD | CRUD | R | - | R | R |
| **Exams** | `marks:enter` | CRUD | CRUD | CRU | - | - | - |
| **Exams** | `marks:moderate` | CRUD | CRUD | - | - | - | - |
| **Exams** | `report_card:publish` | CRUD | R | - | - | R | R |
| **Comm** | `notice:broadcast` | CRUD | CRUD | CRU (Class) | - | R | R |
| **Comm** | `chat:parent_teacher` | - | - | CRU | - | - | CRU |
| **Library** | `library:checkout` | CRUD | - | - | - | - | - |
| **Transport** | `transport:routes` | CRUD | - | - | - | R | R |
| **Hostel** | `hostel:allocation` | CRUD | - | - | - | R | R |

---

## 3. Server-Side Permission Guard Hook

```typescript
// lib/auth/permissions.ts
import { getServerSession } from '@/lib/auth';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';

export async function requirePermission(permission: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // Super Admin bypasses all checks
  if (session.user.role === 'SUPER_ADMIN') {
    return session.user;
  }

  // Institute Admin has all tenant permissions
  if (session.user.role === 'ADMIN') {
    return session.user;
  }

  const userPermissions = session.user.permissions || [];
  if (!userPermissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }

  return session.user;
}
```

---

## 4. Scalable Dynamic Role Registry & Custom Role Engine (`lib/auth/roles.ts`)

To ensure long-term architectural scalability without hardcoding roles in UI forms, all roles are centralized in `lib/auth/roles.ts`. Any new custom role (e.g. *Hostel Warden*, *Admission Counselor*, *Trustee Auditor*) can be plugged in dynamically:

```typescript
import { ROLE_DEFINITIONS, registerCustomRole } from '@/lib/auth/roles';

// Example: Dynamically registering a new custom role at runtime
registerCustomRole({
  key: "ADMISSION_COUNSELOR",
  label: "Admissions Counselor",
  category: "staff",
  description: "Handles prospect leads, campus tours, inquiry conversion and application review.",
  authStrategy: "password",
  badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
  defaultRoute: "/staff/admissions",
  iconName: "UserCheck",
  permissions: ["admissions:view", "admissions:create", "admissions:edit"],
});
```

### 5. Implemented Enterprise Authentication Screens

| Screen | Route | Security Model & Features |
| :--- | :--- | :--- |
| **Unified Portal Login** | `/auth/login` | 3-Tier Multi-Portal Login: Email + Password + 4-Digit PIN strictly enforced across Staff, Student, Parent & Super Admin. 10-role instant test filler. |
| **Owner / Admin Dashboard** | `/admin` | Executive dashboard with dual navigation: dark left sidebar for core modules, top header for dynamic sub-modules & archetype selector, KPI cards, recent activity, and dynamic UPI QR collection counter. |
| **Admin Role & PIN Manager** | `/admin/roles` | Admin controls: toggle module access per role, create custom roles, manage user passwords, set/reset 4-digit PINs, enforce force-reset flags. |
| **Parent OTP Vault** | `/auth/verify-otp` | 6-box segmented auto-advance OTP, WhatsApp & SMS dual dispatch, 45s countdown timer, multi-ward student selector upon verification. |
| **Self-Service Recovery** | `/auth/forgot-password` | Work email or mobile challenge, 15-min expiring token, live zxcvbn entropy meter, device session revocation. |
| **First-Time Activation** | `/auth/first-login` | Mandatory change of temporary password + initial 4-digit PIN setup + DPDPA 2023 statutory data processing consent vault. |
| **Institutional Onboarding** | `/auth/register` | 6-step self-service wizard: Identity -> Domain/CNAME -> Master Admin -> Modular Features -> Academic Year -> PostgreSQL Isolated Schema Provisioning. |

---

## 6. Mandatory 3-Tier Authentication & 4-Digit PIN Architecture

To satisfy enterprise banking-grade security and prevent unauthorized classroom or kiosk access, the platform enforces a **3-Tier Verification Pipeline** across all roles:

1. **Tier 1 (Identity)**: Verified Institutional Email (`user@school.edu` or PRN ID for students).
2. **Tier 2 (Primary Secret)**: Enterprise-complexity Password (salted & hashed via Argon2id).
3. **Tier 3 (Institutional Device PIN)**: Mandatory **4-Digit Security PIN** (configured by the Institute Admin or initialized during first login).
   - *Strict Rule*: The portal session **will not open** unless all three credentials (Email + Password + 4-Digit PIN) match the active profile.
   - *Brute-Force Protection*: 3 consecutive failed PIN attempts trigger automatic account lock (`status: "LOCKED"`), requiring Administrator PIN reset.

```
[ User Ingress ]
       │
       ▼
 ┌──────────────────────────────────────────────┐
 │  Email + Password + 4-Digit Security PIN     │
 └──────────────────────┬───────────────────────┘
                        │
                        ▼
 ┌──────────────────────────────────────────────┐
 │       Next.js 16 Edge Auth Guard             │
 ├──────────────────────────────────────────────┤
 │ 1. Validate email format & tenant domain     │
 │ 2. Verify Argon2id password hash             │
 │ 3. Verify tenant HMAC-salted 4-digit PIN     │
 └──────────────────────┬───────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
 [ All 3 Valid ]                 [ Any Check Fails ]
       │                                 │
       ▼                                 ▼
 JWT Session Issued &             Access Rejected
 Portal Dashboard Opens           (Attempts Decremented)
```

## 7. Administrator Role, Module Access & PIN Governance Console

The Administrator Console (`/admin/roles`) grants the Head of Institution complete governance over:
- **Module Authorization Matrix**: Toggling active permissions for Admissions, Academics, Timetable, Attendance, Fees, Exams, Transport, Hostel, Library, Communication, and Reports.
- **Dynamic Role Creation**: On-the-fly registration of custom roles without engineering support.
- **User Credential Vault**: Directly resetting any user's password, updating their mandatory 4-digit PIN, and toggling `"mustChangePinOnLogin"`.


