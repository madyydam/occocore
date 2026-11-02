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
