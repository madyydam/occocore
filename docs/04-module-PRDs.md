# Comprehensive Module Product Requirement Documents (PRDs)

This document contains exhaustive Product Requirement Documents (PRDs) for every core functional module of the Education ERP SaaS platform. Each PRD outlines user goals, technical architecture, data contracts, UX specifications, and edge-case handling.

---

## PRD 1: Multi-Tenancy, Self-Service Onboarding & White-Labeling

### 1.1 Objective & Scope
Enable school, college, university, and coaching academy owners to register, configure their entire institute, customize visual branding, configure custom domain CNAMEs, and begin onboarding staff/students in under 10 minutes without manual intervention.

### 1.2 User Personas Involved
- **Super Admin**: Defines global plan limits (max students, allowed modules, custom domain feature flag).
- **Institute Admin (Owner)**: Executes the self-service setup wizard, connects custom domain, uploads branding assets.

### 1.3 Key Requirements & Functional Flows
1. **Host-Based Routing**:
   - Next.js Middleware inspects `request.headers.get('host')`.
   - If host is `app.edusaas.com` -> routes to Super Admin portal (`/super-admin`).
   - If host is `{tenant}.edusaas.com` or custom domain `portal.stmarys.edu.in` -> resolves `tenant_id` from Redis cache/Postgres, injects headers `x-tenant-id`, `x-tenant-slug`, and rewrites to tenant app routes.
2. **Onboarding Wizard Steps (6 Steps)**:
   - *Step 1: Institute Identity*: Name, Affiliation Code, Institute Archetype (School / College / University / Academy), Logo upload, Primary brand color picker.
   - *Step 2: Domain Setup*: Subdomain reservation (`apexacademy.edusaas.com`) + optional custom domain CNAME setup instructions with instant DNS `check-cname` button.
   - *Step 3: User Types & Roles*: Admin toggles checkboxes: "Enable Student Portal", "Enable Parent Portal", "Enable Accountant Role".
   - *Step 4: Module Selection*: Admin toggles active modules: Transport, Hostel, Library, LMS, Examinations.
   - *Step 5: Academic Year & Structure*: Start month (e.g. April for Indian schools, August for colleges), Grade/Degree levels, Section division presets.
   - *Step 6: Quick Data Import or Demo Data*: Option to seed realistic sample data for instant exploration or download tailored CSV templates.

### 1.4 Technical & Edge Cases
- **Duplicate Subdomain Collision**: Real-time debounce check on `/api/tenants/check-slug` before form submission.
- **SSL Propagation Delay**: Custom domain setup informs user: *"DNS changes may take up to 30 minutes. Your subdomain `xyz.edusaas.com` is active immediately."*
- **Database Isolation**: All queries executed under `WHERE tenant_id = current_tenant_id` via Postgres RLS.

### 1.5 Mandatory 3-Tier Authentication & PIN Governance Specification
1. **Universal 3-Tier Login Pipeline**:
   - Every portal login (Staff, Student, Parent, Super Admin) requires three validated factors:
     1. **Email Identifier**: Institutional email address.
     2. **Password**: Salted Argon2id credential.
     3. **4-Digit Security PIN**: Mandatory numeric PIN.
   - Access to any dashboard is strictly rejected unless all three credentials match.
2. **Administrator Role, Module & PIN Management (`/admin/roles`)**:
   - The Institute Admin possesses full authority to:
     - View all configured and custom roles.
     - Toggle authorization per module (Admissions, Academics, Timetable, Attendance, Fees, Exams, Transport, Hostel, Library, Communication, Reports).
     - Register new dynamic custom roles at runtime.
     - Reset any user's password and update their 4-digit Security PIN.
     - Flag accounts with `mustChangePinOnLogin` to force first-time setup upon login.


---

## PRD 2: Academic Hierarchy & Terminology Transformer

### 2.1 Objective & Scope
Support diverse educational institutions worldwide by dynamically adapting organizational hierarchy, labels, and forms to match the institute's real-world terminology.

### 2.2 Terminology Transformation Matrix
| Abstract Concept | K-12 School Preset | Degree College Preset | University Preset | Coaching Academy Preset |
| :--- | :--- | :--- | :--- | :--- |
| **Top Unit** | Wing (Primary, Senior) | Faculty / Stream (Science, Arts) | School (Engineering, Law) | Goal / Category (JEE, UPSC) |
| **Cohort Unit** | Class / Standard (Class 10) | Program / Degree (B.Tech, B.Com) | Program (B.Tech CSE) | Course (Target 2027) |
| **Sub-Cohort** | Section (Section A) | Branch / Specialization (CS) | Department (CSE) | Batch (Morning Batch A) |
| **Term Unit** | Term (Term 1, Term 2) | Semester (Semester 5) | Semester & CBCS Credits | Phase / Track (Phase 1) |
| **Student ID** | Admission / Scholar No | PRN / Roll No | University PRN / Roll No | Student Reg ID |
| **Leader** | Principal / Class Teacher | Principal / HOD | Chancellor / Dean / HOD | Director / Mentor |

### 2.3 Implementation Architecture
- React Context `useTerminology()` loads active tenant's translation dictionary.
- UI elements use semantic helper:
  ```tsx
  const { t } = useTerminology();
  return <h1>{t('class')} Directory</h1>; // Renders "Class Directory" or "Program Directory"
  ```
- Database schema remains clean and generalized (`academic_levels`, `cohorts`, `sub_cohorts`, `terms`).

---

## PRD 3: Student Admissions & Lifecycle Management

### 3.1 Objective & Scope
Manage student journey from initial inquiry/lead to admission, document vault storage, category tracking, annual promotion, and eventual graduation/Transfer Certificate issuance.

### 3.2 Data Entities & Validation (Zod Schema)
- **Student Profile**:
  - `admission_no`: Alphanumeric, unique per tenant.
  - `roll_no`: Numeric/Alphanumeric, section-scoped.
  - `prn`: 16-character alphanumeric (Indian university Permanent Registration Number).
  - `apaar_id`: 12-digit Indian national student registry ID.
  - `first_name`, `last_name`, `dob`, `gender`, `blood_group`.
  - `caste_category`: `GENERAL` | `OBC_NCL` | `OBC_CL` | `SC` | `ST` | `EWS`.
  - `is_rte_quota`: Boolean (Right to Education 25% waiver).
  - `guardian`: Father, Mother, or Legal Guardian name, phone, email, occupation, annual income.
  - `address`: Street, City, State, Pincode, Country.
  - `status`: `ACTIVE` | `SUSPENDED` | `PROMOTED` | `GRADUATED` | `TRANSFERRED` | `ALUMNI`.

### 3.3 Core Workflows
1. **Bulk CSV Import with Error Preview**:
   - User uploads CSV. Client parses file using PapaParse.
   - Validation engine checks every row against Zod schema.
   - Displays interactive grid highlighting errors (e.g. Row 14: invalid date format; Row 29: duplicate roll number).
   - Only clean records are committed in an all-or-nothing database transaction.
2. **Transfer Certificate (TC) Issuance**:
   - Triggers multi-department clearance check (Fee dues = 0, Library books returned = 0).
   - Generates official government-formatted TC with serial number, school affiliation code, conduct remarks, and security QR.
   - Automatically marks student status as `TRANSFERRED` and releases classroom seat.

---

## PRD 4: Offline-First Attendance & Roll Call Engine

### 4.1 Objective & Scope
Enable faculty to complete classroom roll call in under 30 seconds with 0ms UI latency, complete offline durability in poor-connectivity areas, and automated parent notifications upon synchronization.

### 4.2 Offline Architecture (Dexie.js + Outbox)
1. **Client Storage**:
   - `db.students`: Local cache of students in teacher's assigned classes.
   - `db.attendance_records`: Local attendance logs.
   - `db.sync_outbox`: Durable FIFO queue of pending mutations.
2. **Roll Call UX Flow**:
   - Teacher opens page. Student list renders instantly from IndexedDB.
   - Button: "Mark All Present" sets all to `PRESENT`.
   - Teacher taps absent students -> switches to `ABSENT` (red pill).
   - Click "Save Attendance":
     - Local IndexedDB updates immediately.
     - Outbox record created: `{ id: UUID, type: 'RECORD_ATTENDANCE', payload: {...}, created_at: ISO }`.
     - Sonner toast: *"Attendance saved locally (Offline)"*.
3. **Synchronization Event**:
   - Window fires `online` event or teacher clicks "Sync Now".
   - Sync Manager sends pending outbox records to `/api/sync/attendance`.
   - Server commits to Postgres inside an atomic transaction.
   - Background job enqueues parent WhatsApp/SMS notifications for absent students.
   - Server returns `{ success: true, synced_ids: [...] }`.
   - Client marks records `sync_status = 'SYNCED'` and cleans outbox.

---

## PRD 5: Fee Structures, Invoicing, Dynamic UPI QR & Payment Gateways

### 5.1 Objective & Scope
Provide a rock-solid, leakage-free financial management system handling tuition structures, installments, concessions, cash counter POS printing, dynamic NPCI UPI QR code generation, and automated gateway reconciliation.

### 5.2 Functional Specifications
1. **Fee Structure & Heads**:
   - Fee Heads: Tuition, Term, Science Lab, Computer Lab, Library, Annual Day, Uniform, Transport.
   - Mapping: Linked to Class/Program with customizable installment split (Annual, Bi-Annual, Quarterly, Monthly).
2. **Concession Rules Engine**:
   - Sibling Concession: Auto-applied (e.g. 25% off tuition for 2nd sibling, 50% for 3rd sibling).
   - Staff Ward: 100% waiver on tuition fees.
   - RTE Quota: 100% waiver per statutory rules.
   - Late Fine: Flat fee (₹100) or compounding per-day rate (₹20/day) after grace period.
3. **Dynamic UPI QR Generation (India-Native)**:
   - Invoices render dynamic BharatPe/NPCI standard UPI intent QR code:
     `upi://pay?pa={institute_vpa}&pn={institute_name}&am={due_amount}&tr={invoice_no}&cu=INR`
   - Parents scan using Google Pay, PhonePe, Paytm, or BHIM; payment settles directly to school account.
4. **Point of Sale (POS) Cash Counter**:
   - Optimized for desktop cashier speed.
   - Single screen: Enter Admission/Roll No -> shows pending terms -> select terms to pay -> pick payment mode (Cash, Card, UPI, Cheque) -> Click "Collect & Print".
   - Generates dual output: 3-inch (80mm) Thermal POS receipt and full A4 PDF invoice.

---

## PRD 6: Examination, Grading & Report Cards (CBSE, NEP & SGPA)

### 6.1 Objective & Scope
Automate the entire evaluation lifecycle from exam scheduling and hall tickets to fast batch mark entry, tabulation sheets, and official digital report cards.

### 6.2 Key Features
1. **Batch Mark Entry Table**:
   - High-speed data entry grid with full keyboard navigation (Down Arrow / Enter moves to next student; Tab moves to next subject).
   - Validates scores against subject maximum marks (e.g. alerts if entering 85 when max is 80).
   - Auto-calculates totals, percentages, and letter grades in real-time.
2. **Grading Schemes Supported**:
   - *CBSE 9-Point Scale*: A1 (Top 1/8th), A2 (Next 1/8th) down to E (Failed).
   - *University SGPA / CGPA*: 10-point UGC grade point scale with weighted semester credits.
   - *Percentage & Custom Divisions*: Distinction (>75%), First Class (60-74%), Second Class (50-59%), Pass (35-49%).
3. **Tabulation Sheet (Broadsheet / Muster)**:
   - Large-format grid view displaying all students, all subject breakdowns (Theory + Practical + Internal), Grand Total, Percentage, Result (Pass/Fail/Compartment), and Rank.
   - Exportable to Excel (.xlsx) and printable A3 format for Board records.
4. **Report Card PDF Engine**:
   - High-fidelity PDF generation using `@react-pdf/renderer`.
   - Incorporates school crest, student photo, attendance record, scholastic scores, co-scholastic grades, teacher remarks, and verification QR code.

---

## PRD 7: Master Timetable, Schedules & Faculty Substitutions

### 7.1 Objective & Scope
Create, manage, and optimize clash-free classroom schedules, manage room capacity constraints, and handle daily teacher leaves with 1-click substitute allocation.

### 7.2 Functional Specifications
1. **Master Timetable Matrix**:
   - Visual drag-and-drop grid (Monday through Saturday, Periods 1 to 8).
   - Real-time clash detection: Throws instant warning if Teacher X or Room Y is already booked in that exact period slot.
2. **Substitution Engine (Proxy Management)**:
   - When Teacher X logs Sick Leave, system scans all faculty schedules for that period.
   - Ranks available teachers based on: (a) Same department subject match, (b) Lowest weekly workload so far.
   - Admin clicks "Assign Proxy" -> auto-dispatches WhatsApp/Push notification to the substitute teacher.
3. **Student & Parent Schedule Views**:
   - Mobile-first daily card showing today's subject line-up, classroom numbers, and active teacher.

---

## PRD 8: Omnichannel Communication & Notification Center

### 8.1 Objective & Scope
Provide multi-channel broadcast and two-way engagement across WhatsApp Business API, TRAI DLT SMS, Email, and Push Notifications while strictly protecting teacher personal privacy.

### 8.2 Channel Adapters & Fallback Hierarchy
1. **Official WhatsApp Business API**:
   - High open rate (>95%).
   - Uses pre-approved templates for attendance alerts, fee receipts, report cards, and urgent notices.
2. **TRAI DLT SMS (India Compliance)**:
   - Fallback when parent does not have active WhatsApp or internet data.
   - Compliant with Indian DLT regulations: requires registered Principal Entity ID (PEID) and Header.
3. **Parent-Teacher Chat with Privacy Masking**:
   - In-app messaging where parents can message class teachers directly.
   - Teacher's personal mobile number is never exposed.
   - Automated "Quiet Hours" (DND): Chat messages received after 6:00 PM are queued for next working morning.

---

## PRD 9: Operations & Auxiliary Services (Library, Transport, Hostel, Inventory)

### 9.1 Library Management
- Barcode/QR scanning for 10-second book issue and return.
- Automatic fine calculation (e.g. ₹2/day overdue).
- Student OPAC catalog search with reservation queue.

### 9.2 Transport Fleet
- Route and stop management with morning/evening timings.
- Student-to-stop mapping linked to fee distance slabs.
- Vehicle compliance tracker (Insurance, RTO Fitness, Pollution/PUC expiry alerts).

### 9.3 Hostel & Dormitories
- Building, floor, room, and bed allocation matrix (Single, Double, Dormitory).
- Curfew roll call register and digital out-pass gatekeeper QR verification.
- Mess menu schedule and student dietary restriction logs.

### 9.4 Inventory & Assets
- Stationery, science lab chemicals, and uniform store inventory.
- Purchase Orders (PO), Goods Received Notes (GRN), and departmental stock issues.
- Fixed asset QR tagging for computers, lab microscopes, and classroom projectors.

---

## PRD 10: Super Admin Platform Governance & SaaS Billing

### 10.1 Objective & Scope
Allow the platform owner (Super Admin) to monitor all client institutes, govern subscription plans, inspect system health, manage pre-paid SMS/WhatsApp balances, and perform audited impersonation.

### 10.2 Features & Security Controls
- **Global Tenant Directory**: Searchable overview of all registered institutes with active student headcounts and subscription renewal dates.
- **Audited Impersonation**: Super Admin can click "Log in as Institute Admin" to troubleshoot customer issues. Generates an immutable, cryptographically signed audit log entry recording exact Super Admin identity, reason, timestamp, and actions taken.
- **Metered Headcount Billing**: System automatically tallies active student enrollments on the 1st of every month to compute monthly SaaS invoices.
