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

## PRD 4: Attendance Module v2 (Single Source of Truth & Statutory Engine)

### 4.1 Objective & Scope
Serve as the single source of truth for presence across every time horizon (day, week, month, term, academic year), every capture mode (manual, biometric, RFID, QR), and every downstream decision (parent alerts, leave, condonation, exam eligibility, board reports).

### 4.2 Key System Components
1. **Attendance Code Engine**:
   - Replaced simple P/A/L with an 11-code rule engine:
     - `P`: Present (1.0 weight)
     - `L`: Late before register close (1.0 weight, flagged)
     - `LC`: Late after register close (0.0 weight, absent, alert trigger)
     - `HD`: Half Day (0.5 weight)
     - `OD`: On Duty / Sports / Competition (1.0 weight with circular/letter)
     - `EL`: Excused Leave (0.0 weight in denominator)
     - `ML`: Medical Leave (0.0 weight with mandatory doctor certificate)
     - `A`: Unexplained Absent (0.0 weight, automated DLT SMS/WhatsApp trigger)
     - `SU`: Suspended (0.0 weight, disciplinary tracking)
     - `H`: Institutional Holiday (excluded from possible days)
     - `NE`: Not Enrolled / Transferred (excluded from possible days)
2. **Persistent Global Control Bar**:
   - Multi-tenant selectors: Campus/Branch · Academic Year · Term/Semester · Class/Section · Roll Call Date · Session/Period.
   - Every metric explicitly labels denominator and scope (e.g., *1 Apr to 3 Nov 2026 · 142 Possible Working Days*).
3. **Registers & Monthly Muster Grid**:
   - **Classic Monthly Register (Grid 1-30/31)**: Sticky student column, dynamic date columns with shaded Sundays and holidays, audit click trail per cell, totals for P, A, L, and %.
   - **Week View (Student × Mon-Sat)**, **Day View (All Classes Matrix)**, **Term & Year Trend**.
   - **Student 360 Profile Dossier**: Complete 12-month trend, day-of-week drop-off analysis, class comparison, 75% recovery targets, and guardian communications.
4. **Statutory Defaulter & Condonation Workflow**:
   - **Zero Silent Auto-Barring**: Exam holds and admit-card barring require explicit human/principal review and sign-off.
   - **Attendance Shortfall Bands**: Safe (≥90%), Watch (75-89%), Warning (65-74%), Critical (<65%).
   - **Recovery Calculator**: Computes exact number of future working days student must attend to cross 75% before board cut-off date (e.g., 1 January 2027).
   - **Condonation Case Builder**: Document checklist (hospital discharge, fitness certificate, parent affidavit), multi-tier approval chain, and CBSE/Board proforma export.
5. **Devices & Hardware Sync**:
   - Fleet telemetry for 4 hardware terminals (RFID Turnstiles, Fingerprint Scanners, Facial Pods) with IP, battery, and heartbeat.
   - Idempotent queue with 0 dropped punches.
   - **Unmatched Punches Inbox** with 1-click reassignment.
   - Conflict rule: Manual teacher roll call overrides biometric punch; both preserved in audit log.
6. **Parent Alerts Log & DLT Compliance**:
   - Govt DLT-registered SMS (`DLT-TE-2026-ATT-01`) & WhatsApp Business Cloud API telemetry.
   - Real-time status tracking (`Delivered`, `Read`, `Failed`) with one-tap parent reason capture.

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

### 10.3 Owner & Institute Admin Portal Architecture (`/admin`)
The Owner / Admin Portal implements a high-craft, dual-navigation administrative experience designed for institutional directors and executive heads:

1. **Navigation Hierarchy**:
   - **Left Dark Sidebar (`#091D17`)**: Dedicated exclusively to Core Main Modules:
     - 📊 Dashboard (`/admin`)
     - 🎓 Admissions & Enrollments
     - 📚 Academics & Curriculum
     - 📋 Attendance & Roll Call
     - 💳 Fee Ledgers & Invoicing
     - 🏆 Examinations & Grading
     - 💬 Omnichannel Communication
     - 🛡️ Security, Roles & 4-Digit PINs (`/admin/roles`)
     - ⚙️ Settings
     - Persistent Super Admin profile badge with instant logout capability.
   - **Top Header Bar**:
     - **Dynamic Sub-Module Pills**: Sub-components dynamically change based on the active main module (e.g., when on Dashboard: `Overview`, `Admissions Feed`, `Collections`, `Live Roll Call`, `Statutory Shield`; when on Admissions: `All Inquiries`, `Entrance Merit`, `Document Vault`, `RTE 25% Quotas`).
     - **Live Archetype Model Switcher**: School / College / University / Coaching Academy switcher allowing live demonstration of dynamic terminology morphing across the entire UI.
     - **Super Admin Profile Pill & Dedicated "Log out" Button**.

2. **Component & Card Systems**:
   - **KPI Metric Cards**: 4 rounded-3xl pure white cards featuring distinct color-coded icon pods (Emerald, Teal, Indigo, Amber) paired with high-contrast bold metric counters and terminology-adapted subtitles.
   - **2-Column Operational Split**:
     - **Recent Activity Column**: Filterable activity stream with live status pills (`Pending`, `Confirmed`, `Collected`, `Rejected`), multi-category pills (`All`, `Admissions`, `Fees`, `Roll Call`), and instant row actions (Inspect modal, Approve, Reject, Archive).
     - **Quick Actions Column**: Tactical rounded dark-pill buttons (`#153E35`) for rapid execution: Manage Admissions, Dynamic UPI QR Collection Counter, Roll Call, and 4-Digit PIN Governance.
     - **Live Operational Gateways**: Real-time status indicators for offline Dexie sync, Razorpay/Cashfree gateway latency, and DPDPA 2023 Statutory Consent seal.
   - **Table & Inquiries View**: Integrated data table with live debounced search, status filter dropdowns, sorting, and inline audit modals.


---

## PRD 11: Enterprise Architectural Hardening & High-Reliability Additions

### 11.1 Quarantined Zero-Leak Demo Mode Sandbox (`isDemoMode`)
- **Objective**: Allow frictionless 1-click prospective customer product demonstrations without contaminating production database records or risking accidental data loss.
- **Specification**:
  - All mock records and sample arrays are strictly quarantined in `lib/demo/demoMockData.ts`.
  - When `isDemoMode === false` (Real Mode), all server actions connect 100% directly to native PostgreSQL (`occocore_db`). Zero mock fallbacks, auto-seeders, or synthetic arrays are permitted.
  - If a database table is empty, server actions return clean empty arrays `[]` and the UI renders actionable empty states with one-click creation modals.

### 11.2 Multi-Query ACID Transaction Safety & Row-Level Locking
- **Objective**: Prevent split-brain states, orphaned financial records, or partial admissions enrollments under concurrent access.
- **Specification**:
  - Implemented via `getClient()` from `@/lib/db`.
  - Multi-step operations (`enrollApplicantAsStudentAction`, `recordFeePaymentAction`, `bulkImportStudentsAction`, `issueTransferCertificateAction`) are strictly wrapped in `BEGIN ... COMMIT` blocks with automatic `ROLLBACK` in error handlers and mandatory connection release in `finally`.
  - Pessimistic locking (`FOR UPDATE`) is enforced on target invoices and student records to eliminate double-collection and concurrent enrollment race conditions.

### 11.3 Statutory Transfer Certificate (TC) & Clearance Engine
- **Objective**: Government-compliant departure certification with automated multi-department clearance validation.
- **Specification**:
  - **Automated Dues Check**: `checkStudentClearanceAction` queries unpaid fee invoices and library loans. TC issuance is strictly blocked if outstanding dues > ₹0.
  - **Atomic Issuance**: `issueTransferCertificateAction` writes to the `transfer_certificates` table, generates an atomic sequential number (`TC/YYYY/XXXX`), deactivates student enrollment seat, and logs an immutable audit event.
  - **A4 Print Engine**: Built-in government-standard A4 printable certificate with institution crest, affiliation codes, conduct remarks, principal signature seal, and QR verification stamp.

### 11.4 Official Report Cards & Holistic Progress Card (HPC) Hub
- **Objective**: Statutory CBSE / NEP 2020 student progress reporting with continuous evaluation rubrics.
- **Specification**:
  - Dedicated Report Cards Generator view with batch printing and individual student card generation.
  - High-craft A4 printable layout featuring Part 1 Scholastic Subject Performance (Scores, Grades, Percentile), Part 2 Co-Scholastic & Life Skills (Work Education, Art/Music, Sports), and Attendance verification seal.

### 11.5 Collision-Free Atomic Sequential Numbering Engine
- **Objective**: Guarantee collision-free, human-readable serial numbers across concurrent fee counter payments and admissions.
- **Specification**:
  - Replaced insecure `Math.random()` with database-backed atomic sequential counters:
    - Fee Receipts: `RCP/YYYY/0001`
    - Fee Invoices: `INV/YYYY/001`
    - Student Admissions: `SCH/YYYY/0491`
    - Transfer Certificates: `TC/YYYY/0001`

### 11.6 Universal 1-Click Client-Side CSV Data Portability
- **Objective**: Zero-friction data export for board audits, accountant reconciliation, and external backups.
- **Specification**:
  - Built-in CSV generators with RFC-4180 quotation escaping across Admissions Candidates, Fee Ledgers, Attendance Monthly Muster, and Exam Tabulation Broadsheets.

### 11.7 Real-Time Search & Cohort Filtering
- **Objective**: Sub-second keyboard navigation and instant data discovery across large institutional directories.
- **Specification**:
  - Real-time debounced filtering across Cohorts, Syllabi, Admissions Inquiries, and Invoices.

---

## 12. PRD 12: Dedicated Student Portal (`/student`)

### 12.1 Objective & Architecture
- **Enterprise Benchmarks**: Modeled after Tier-1 Higher-Ed & K-12 systems (PowerSchool, Ellucian Banner, Canvas Student, TCS iON).
- **Zero-Mock Policy**: 100% of student profile, attendance logs, fee invoices, receipts, examination scores, and timetables are queried live from PostgreSQL (`occocore_db`) via `studentPortalActions.ts`.
- **Responsive Standard**: Mobile-first bottom navigation dock with seamless desktop sidebar transitions.

### 12.2 Functional Pillars
1. **Dashboard & Daily Overview**:
   - Institutional banner, student registration number (PRN/Roll No), current class/section, and academic year.
   - Live KPI cards: Attendance Percentage, Outstanding Fee Dues, Enrolled Courses count, and Pending Leave Requests.
   - Today's Class Schedule ticker and recent emergency broadcast notices.

2. **Attendance Diary & Self-Service Leave Engine**:
   - Real calculated attendance percentage derived from `attendance_records` (`COUNT(status='PRESENT') / COUNT(*)`).
   - Dynamic statutory compliance indicator (75% minimum threshold warning/safe state).
   - 30-day chronological attendance ledger with status badges (Present, Absent, Late, Excused).
   - Interactive Leave Application drawer inserting atomically into `leave_requests` table with start/end date validation and reason fields.

3. **Academics & Dynamic Timetable**:
   - Interactive day-of-week timetable browser (Monday through Saturday).
   - Real-time slot breakdown: Period timing, subject title, assigned faculty, and room/lab designation.

4. **Fee Invoicing & NPCI Dynamic UPI Checkout**:
   - Live fee invoice ledger querying `invoices` where student matches current user.
   - Outstanding balance alert banner with immediate 1-click payment CTA.
   - **Dynamic NPCI UPI QR Generator**: Generates `upi://pay?pa=...&am=...&tr=...` links for instant scan-and-pay via BHIM, Google Pay, PhonePe, and Paytm.
   - Official Fee Receipts history with instantaneous A4 view & print modal for tax/reimbursement documentation.

5. **Marksheet & Official Progress Report Card**:
   - Live examination marks breakdown queried from `marks`, `exams`, and `subjects` tables.
   - Subject-wise scores, maximum marks, earned letter grades, and total percentage calculation.
   - Built-in A4 Holistic Progress Card print preview with CBSE/NEP statutory alignment.

6. **Broadcast Notices & Institutional Circulars**:
   - Priority-tagged institutional notices (Emergency, Examination, General, Holiday).
   - Full publication date, author attribution, and formatted message body.
