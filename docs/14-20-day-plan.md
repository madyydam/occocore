# The 20-Day Production Build Plan & Milestone Deliverables

This document defines the day-by-day production engineering roadmap. Each day is an atomic milestone with explicit tasks, touched files, test requirements, Definition of Done (DoD), and live demo verification steps.

---

## Day 1: Project Scaffolding, Tooling, CI, Design Tokens & Base Layouts
- **Goal**: Establish the production-grade Next.js 15 TypeScript codebase with zero lint/build errors, design system tokens, and shell layouts.
- **Exact Tasks**:
  1. Initialize Next.js 15 (App Router, React 19, TypeScript strict mode).
  2. Setup Tailwind CSS v4, Shadcn UI base components, Lucide icons, and Sonner toast.
  3. Configure ESLint, Prettier, Vitest, and GitHub Actions CI configuration.
  4. Create responsive base layout shells: Platform Root, Tenant Portal, and Auth Portal.
  5. Setup dynamic CSS custom properties for tenant theme variables (`--tenant-primary`).
- **Files Touched**: `package.json`, `tailwind.config.ts`, `app/layout.tsx`, `components/ui/*`, `lib/utils.ts`.
- **Tests Required**: Lint check (`pnpm lint`), TypeScript typecheck (`pnpm tsc --noEmit`), build test (`pnpm build`).
- **Definition of Done**: Clean Next.js build running on local dev server; responsive shell layout rendering cleanly.
- **Demo Steps**: Open `localhost:3000` -> verify responsive navbar, dark/light theme toggle, and Sonner toast notification.

---

## Day 2: Database Schema, Relational Migrations, Multi-Tenant Model & Seeding
- **Goal**: Deploy PostgreSQL relational schema via Prisma ORM with RLS policies and realistic seed data.
- **Exact Tasks**:
  1. Define complete `prisma/schema.prisma` with all 25+ relational entities.
  2. Execute baseline migration (`prisma migrate dev --name init`).
  3. Implement Prisma Client extension with automatic `tenant_id` query scoping.
  4. Author comprehensive seed script (`prisma/seed.ts`) generating 1 Super Admin, 2 demo institutes (School & College), and sample records.
  5. Apply database indexes on all `tenant_id` foreign key columns.
- **Files Touched**: `prisma/schema.prisma`, `lib/prisma.ts`, `prisma/seed.ts`.
- **Tests Required**: Database migration test, Prisma seed test, database connection pooling test.
- **Definition of Done**: Schema successfully applied to PostgreSQL; seed script executes with zero errors.
- **Demo Steps**: Run `pnpm db:seed` -> inspect tables in Prisma Studio (`pnpm prisma studio`) showing seeded records.

---

## Day 3: Authentication, Host-Based Tenant Resolution & Sessions
- **Goal**: Implement multi-role authentication with dynamic host-based tenant resolution in Next.js Middleware.
- **Exact Tasks**:
  1. Build Next.js `middleware.ts` for host header parsing (`{slug}.edusaas.com` vs `custom-domain.com`).
  2. Implement NextAuth.js v5 with multi-tenant JWT strategy.
  3. Build unified modern login screen with dynamic tenant branding (logo, title, colors).
  4. Add session security: `httpOnly` cookies, CSRF protection, and session timeout handling.
  5. Build quick one-click role switcher buttons for local evaluation.
- **Files Touched**: `middleware.ts`, `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/(auth)/login/page.tsx`.
- **Tests Required**: Host parsing unit tests, credential login unit tests, cross-tenant login rejection test.
- **Definition of Done**: Accessing `school1.localhost:3000/login` loads School 1 branding; credentials log in user into correct tenant context.
- **Demo Steps**: Visit `dps.localhost:3000/login` -> click "Super Admin" pill -> verify successful redirection to dashboard with active session.

---

## Day 4: Granular RBAC Engine, Cryptographic Audit Log & Feature Flags
- **Goal**: Implement role-based access control, per-tenant feature flag engine, and immutable audit logging.
- **Exact Tasks**:
  1. Implement server-side authorization guard (`requirePermission(perm)`).
  2. Build UI component authorization gate `<Can I="student:create">...</Can>`.
  3. Implement asynchronous audit logging utility tracking entity diffs, IP, and user-agent.
  4. Create Tenant Feature Flag evaluator (`hasFeature(tenantId, 'feat_key')`).
  5. Build interactive Audit Log viewer table with JSON before/after inspector.
- **Files Touched**: `lib/auth/permissions.ts`, `lib/audit.ts`, `lib/features.ts`, `components/auth/can.tsx`, `app/admin/audit-logs/page.tsx`.
- **Tests Required**: Permission matrix evaluation unit tests, audit log insertion test, feature flag fallback test.
- **Definition of Done**: Unauthorized users blocked with 403 Forbidden; every update operation generates an audit log row.
- **Demo Steps**: Log in as Teacher -> attempt to navigate to `/admin/settings` -> verify redirection/403 page; check audit log in DB.

---

## Day 5: Super Admin Control Center, Tenant Registry & Impersonation
- **Goal**: Build complete platform governance panel for the platform owner with tenant management and audited impersonation.
- **Exact Tasks**:
  1. Build Super Admin Executive KPI dashboard (Total Active Students, MRR, Active Tenants).
  2. Implement Global Tenant Directory with search, status filtering, and subscription plan tags.
  3. Build Tenant Feature Flag Matrix modal (toggle any of 500 features per school).
  4. Implement Audited Impersonation flow (Super Admin can 1-click enter any school with signed audit token).
  5. Build platform-wide broadcast announcement banner creator.
- **Files Touched**: `app/(super-admin)/*`, `components/super-admin/*`, `lib/impersonation.ts`.
- **Tests Required**: Impersonation security token test, tenant suspension test, feature flag toggle test.
- **Definition of Done**: Super Admin can provision new institutes, toggle feature flags, and impersonate tenant admins.
- **Demo Steps**: Open `localhost:3000/super-admin` -> find "Delhi Public School" -> click "Impersonate" -> verify seamless login into DPS portal with banner "Impersonating DPS".

---

## Day 6: Institute Admin Onboarding Wizard, Custom Domains & Type Presets
- **Goal**: Deliver the 10-minute self-service onboarding wizard for newly registered school owners.
- **Exact Tasks**:
  1. Build multi-step interactive wizard (Identity, Domain, Roles, Modules, Academic Year).
  2. Implement Archetype selector (School, College, University, Academy) with live terminology preview.
  3. Build custom domain CNAME verification checker with real-time DNS resolution.
  4. Implement live theme color picker injecting CSS variables dynamically.
  5. Build Onboarding Progress Checklist widget on the Admin dashboard.
- **Files Touched**: `app/admin/onboarding/*`, `components/onboarding/*`, `lib/dns.ts`.
- **Tests Required**: DNS resolution unit test, onboarding state validation test, terminology mapping test.
- **Definition of Done**: New admin completes 5-step wizard and arrives on personalized dashboard with chosen branding.
- **Demo Steps**: Register new institute "Apex Academy" -> select "Coaching" archetype -> pick violet color -> complete wizard -> observe terms adapt to "Course/Batch" instead of "Class/Section".

---

## Day 7: Academic Structure, Curriculum & NEP 2020 Course Catalog
- **Goal**: Build academic structure management for classes, sections, subjects, NEP credit allocations, and academic sessions.
- **Exact Tasks**:
  1. Implement Academic Year session manager (Active, Upcoming, Rollover).
  2. Build Class / Program CRUD with numeric hierarchy levels.
  3. Build Section / Division manager with classroom capacity validation.
  4. Implement Subject Catalog with Course Codes, Theory/Practical tags, and NEP credit values.
  5. Build Subject-to-Faculty assignment matrix.
- **Files Touched**: `app/admin/academics/*`, `components/academics/*`, `lib/actions/academics.ts`.
- **Tests Required**: Academic rollover unit test, duplicate class validation test, capacity check test.
- **Definition of Done**: Complete academic catalog operational; subjects mapped to faculty and sections.
- **Demo Steps**: Create "Class 11 - Science" -> add Section A & B -> assign Physics & Chemistry with 4 credits -> assign teachers.

---

## Day 8: Student Admissions, Directory, PRN / Roll Rules & Bulk CSV Import
- **Goal**: Deliver student profile management, identity numbering rules (PRN, APAAR, Roll No), and bulk CSV import.
- **Exact Tasks**:
  1. Build comprehensive Student Profile form (60+ fields across tabs).
  2. Implement configurable auto-numbering engines for Admission No, Roll No, and PRN.
  3. Integrate in-browser passport photo cropper.
  4. Build Bulk CSV Import Wizard with column auto-mapping and real-time validation grid.
  5. Build Student Transfer Certificate (TC) generator with printable government layout.
- **Files Touched**: `app/admin/students/*`, `components/students/*`, `lib/actions/students.ts`, `lib/csv-parser.ts`.
- **Tests Required**: CSV validation parser test, duplicate admission number rejection test, TC clearance validation test.
- **Definition of Done**: Bulk student CSV imported with 0 errors; student profiles searchable in directory.
- **Demo Steps**: Upload sample 50-student CSV -> view preview with 1 highlighted error -> fix error -> commit import -> search student in global directory.

---

## Day 9: Staff, Faculty & Human Resources Management
- **Goal**: Manage employee directory, teacher workload allocations, leave workflows, and digital staff credentials.
- **Exact Tasks**:
  1. Build Staff Directory across Teaching, Administrative, and Support departments.
  2. Implement Faculty Workload Calculator (lecture hours/week tracking).
  3. Build Digital Leave Application & Multi-tier Approval workflow (Staff applies, Principal approves).
  4. Implement statutory payroll fields (PAN, PF UAN, ESI IP, Bank Account NEFT).
  5. Build Staff Experience and Relieving Certificate generator.
- **Files Touched**: `app/admin/staff/*`, `components/staff/*`, `lib/actions/staff.ts`.
- **Tests Required**: Workload calculation test, leave quota deduction test.
- **Definition of Done**: Staff members enrolled with departments; leave applications deduct from balance upon approval.
- **Demo Steps**: Apply for 2 days Casual Leave as Teacher -> switch to Principal account -> approve leave -> verify teacher balance decrements.

---

## Day 10: Attendance & Roll Call Engine (True Offline-First Sync)
- **Goal**: Implement 30-second classroom roll call with 0ms latency, IndexedDB caching, and automatic outbox sync.
- **Exact Tasks**:
  1. Build Dexie.js client-side schema (`students`, `attendance_records`, `sync_outbox`).
  2. Build high-speed Roll Call UI ("Mark All Present", tap to toggle Absent).
  3. Implement Outbox Mutation Queue and browser `online` event listener.
  4. Build Server Sync endpoint `/api/sync/outbox` with atomic database insertion.
  5. Implement 75% attendance threshold badge and consecutive absence alert triggers.
- **Files Touched**: `lib/offline/*`, `app/teacher/attendance/*`, `components/attendance/*`, `app/api/sync/outbox/route.ts`.
- **Tests Required**: Offline sync test harness, attendance percentage calculation test, outbox retry test.
- **Definition of Done**: Teacher takes roll call while offline in browser DevTools; restoring network automatically syncs data to server.
- **Demo Steps**: Disconnect Wi-Fi in DevTools -> mark 3 students absent -> click Save -> verify offline pill -> reconnect Wi-Fi -> observe sync toast and server DB updated.

---

## Day 11: Master Timetable, Scheduling Matrix & Instant Substitutions
- **Goal**: Build weekly timetable scheduling grid with clash detection and 1-click teacher substitution recommender.
- **Exact Tasks**:
  1. Build weekly drag-and-drop timetable grid (Periods 1-8, Mon-Sat).
  2. Implement real-time collision detection (prevents double-booking teacher or classroom).
  3. Implement 1-Click Substitution Engine recommending free eligible teachers during sick leave.
  4. Generate high-resolution printable Master Timetable PDF for staffroom.
  5. Build Student & Teacher "Today's Schedule" mobile dashboard cards.
- **Files Touched**: `app/admin/timetable/*`, `components/timetable/*`, `lib/actions/timetable.ts`.
- **Tests Required**: Timetable clash validator unit test, substitution ranking algorithm test.
- **Definition of Done**: Timetable renders clash-free; mark teacher absent -> system suggests substitute with 1-click assignment.
- **Demo Steps**: Schedule Math in Period 2 -> attempt to assign same teacher to Class 9-B -> observe clash warning; assign substitute teacher.

---

## Day 12: Fee Structures, Installments, Concession Engine & POS Invoicing
- **Goal**: Build comprehensive tuition ledger, installment plans, sibling/merit concessions, and POS cashier receipts.
- **Exact Tasks**:
  1. Implement Fee Head Master and Class-wise annual installment structures.
  2. Build Sibling, Staff Ward, and RTE concession calculation rules.
  3. Implement daily/flat late fine rules with grace period cutoffs.
  4. Build Fast Cash Counter POS interface (sub-30 second checkout).
  5. Build 80mm ESC/POS Thermal Receipt and A4 PDF invoice generator with verification QR code.
- **Files Touched**: `app/admin/fees/*`, `components/fees/*`, `lib/actions/fees.ts`, `lib/pdf/receipt.ts`.
- **Tests Required**: Concession engine unit tests, late fine calculation tests, receipt numbering sequence test.
- **Definition of Done**: Cashier can search student, view due installments, apply concession, collect cash, and print receipt.
- **Demo Steps**: Open Fee Counter -> enter student roll 14 -> see ₹15,000 due -> select Cash -> click "Collect & Print" -> view generated thermal receipt.

---

## Day 13: Payments II: Gateways, Webhooks, Dynamic UPI QR & Defaulters
- **Goal**: Integrate Razorpay, Cashfree, dynamic NPCI UPI QR generation, webhook reconciliation, and defaulter tracking.
- **Exact Tasks**:
  1. Implement dynamic BharatPe/NPCI UPI QR code generator on invoices.
  2. Build Razorpay and Cashfree gateway checkout flows with webhook signature verification.
  3. Build Fee Defaulters Aging Report (1-30, 31-60, 90+ days overdue).
  4. Implement 1-Click WhatsApp payment link defaulter broadcast.
  5. Build End-of-Day Cashier Reconciliation report.
- **Files Touched**: `app/api/webhooks/razorpay/route.ts`, `app/admin/fees/defaulters/*`, `lib/payments/*`.
- **Tests Required**: Webhook signature verification test, idempotent payment processing test.
- **Definition of Done**: Parent pays via UPI/Gateway; webhook reconciles invoice and issues digital receipt automatically.
- **Demo Steps**: Open student invoice -> scan dynamic UPI QR code on phone -> trigger test webhook -> observe invoice status update to "PAID" in real-time.

---

## Day 14: Examination, Grading, Tabulation Broadsheet & Report Cards
- **Goal**: Automate evaluation lifecycle from exam schedules to fast batch mark entry, tabulation sheets, and CBSE/SGPA report cards.
- **Exact Tasks**:
  1. Build Exam Term master (Mid-Term, Pre-Board, Finals) with subject passing criteria.
  2. Build Fast Batch Mark Entry table with keyboard navigation (Enter key down).
  3. Implement CBSE 9-point grading scale (A1-E) and UGC 10-point SGPA/CGPA engine.
  4. Build A3 Class Tabulation Sheet (Muster Marksheet) with Excel export.
  5. Build official branded digital Report Card PDF generator with student photo, marks, remarks, and QR code.
- **Files Touched**: `app/admin/exams/*`, `components/exams/*`, `lib/actions/exams.ts`, `lib/pdf/report-card.ts`.
- **Tests Required**: CBSE grade conversion test, SGPA weighted average test, mark validation bounds test.
- **Definition of Done**: Teacher enters scores -> system calculates grades and ranks -> generates bulk printable report cards.
- **Demo Steps**: Open Class 10 Math exam -> enter scores for 5 students -> verify A1/A2 grades auto-populate -> click "Generate Report Cards" -> view generated PDF.

---

## Day 15: Learning Management (LMS), Study Material & Online Quizzes
- **Goal**: Build classroom digital homework, chapter-wise PDF study notes repository, and auto-graded MCQ quizzes.
- **Exact Tasks**:
  1. Build Homework creator with file attachments and student submission dropzone.
  2. Build Class Study Material & PDF Notes repository categorized by subject and unit.
  3. Build Multiple Choice Quiz builder with timer and randomized option shuffling.
  4. Build Instant Quiz Scorecard and student leaderboard.
  5. Implement Live Classroom meeting link hub (Zoom / Google Meet).
- **Files Touched**: `app/lms/*`, `components/lms/*`, `lib/actions/lms.ts`.
- **Tests Required**: Quiz auto-grading test, submission deadline enforcement test.
- **Definition of Done**: Teacher posts assignment and quiz; student submits homework and takes timed quiz with instant score.
- **Demo Steps**: Post 5-question Science quiz -> take quiz as student -> submit -> observe instant score 80% and leaderboard update.

---

## Day 16: Omnichannel Communication: WhatsApp, TRAI DLT SMS & Notices
- **Goal**: Deploy institutional communication center with WhatsApp Business API, TRAI DLT SMS, and Parent-Teacher chat.
- **Exact Tasks**:
  1. Build Institutional Digital Noticeboard with audience targeting (Class, Staff, All).
  2. Integrate WhatsApp Business API adapter for template broadcasts.
  3. Build TRAI DLT SMS adapter with Principal Entity ID and template verification.
  4. Implement Parent-Teacher 1-on-1 chat with teacher phone privacy masking and Quiet Hours (DND).
  5. Build Emergency Flash Alert Red Banner for sudden closures.
- **Files Touched**: `app/communication/*`, `components/communication/*`, `lib/communication/*`.
- **Tests Required**: SMS template interpolation test, WhatsApp payload validation test, chat privacy guard test.
- **Definition of Done**: Notice published on portal; instant WhatsApp/SMS notification delivered to target parents.
- **Demo Steps**: Compose "Heavy Rain Holiday" circular -> select "All Parents" -> click Broadcast -> verify flash emergency banner appears on student dashboard.

---

## Day 17: Operations: Library, Transport, Hostel & Inventory
- **Goal**: Build auxiliary operational modules with barcode scanning, asset allocation, and compliance logs.
- **Exact Tasks**:
  1. **Library**: Book catalog accession, barcode label generator, 10-second checkout, overdue fines.
  2. **Transport**: Bus fleet, routes, stops, student allocation, vehicle fitness/insurance expiry alerts.
  3. **Hostel**: Room/bed matrix, night curfew roll call, digital out-pass QR verification, mess menu.
  4. **Inventory**: Item catalog, vendor directory, Purchase Orders (PO), Goods Received Notes (GRN).
  5. Modular toggles: Ensure all 4 modules can be enabled/disabled per tenant.
- **Files Touched**: `app/operations/*`, `components/operations/*`, `lib/actions/operations.ts`.
- **Tests Required**: Library fine calculation test, bus capacity guard test, hostel bed collision test.
- **Definition of Done**: All 4 auxiliary modules functional with barcode checkout, bus route allocation, and room assignments.
- **Demo Steps**: Issue library book via barcode -> allocate student to Bus Route 3 -> verify transport fee automatically appends to student fee ledger.

---

## Day 18: Dedicated Portals (Student, Parent, Teacher) & Global Search
- **Goal**: Polish dedicated mobile-first portals for students, parents, and teachers with Universal Command Palette (Ctrl + K).
- **Exact Tasks**:
  1. Build Student Dashboard (today's schedule, marksheet download, attendance calendar).
  2. Build Parent Dashboard with Multi-Child switcher and 1-tap fee pay button.
  3. Build Teacher Classroom Command Center with quick roll call and homework launcher.
  4. Implement Universal Command Palette (Ctrl + K) with keyboard navigation.
  5. Build Multi-Format Exporter (Excel, CSV, PDF) on all tabular views.
- **Files Touched**: `app/(portals)/*`, `components/portals/*`, `components/command-palette.tsx`.
- **Tests Required**: Parent multi-child switch test, command palette search index test.
- **Definition of Done**: Responsive portals operating cleanly across mobile and desktop; Ctrl+K jumps anywhere in 2 keystrokes.
- **Demo Steps**: Log in as Parent with 2 children -> switch from "Aarav (Class 10)" to "Diya (Class 6)" in 1 tap -> press Ctrl+K -> type "pay" -> jump to fee cart.

---

## Day 19: Guided Tours, Multilingual i18n (EN/HI/MR), Dark Mode & PWA
- **Goal**: Integrate role-based guided walkthroughs, multi-language localization (English, Hindi, Marathi), PWA installability, and accessibility audits.
- **Exact Tasks**:
  1. Integrate Driver.js interactive guided tours for Admin, Teacher, and Parent roles.
  2. Implement i18n localization dictionary system with English, हिन्दी (Hindi), and मराठी (Marathi) language toggle.
  3. Finalize high-contrast sleek Dark Mode and Light Mode adhering to WCAG 2.1 AA.
  4. Build Progressive Web App (PWA) manifest (`manifest.json`) and service worker for native desktop/mobile installation.
  5. Run automated Lighthouse accessibility and performance audit.
- **Files Touched**: `components/tours/*`, `lib/i18n/*`, `public/manifest.json`, `public/sw.js`.
- **Tests Required**: i18n dictionary completeness test, PWA manifest audit, accessibility contrast test.
- **Definition of Done**: First-time user guided by interactive spotlight tour; portal switches between English, Hindi, and Marathi seamlessly.
- **Demo Steps**: Log in as new Admin -> observe 5-step guided tour highlight key buttons -> toggle language to "हिन्दी" -> observe interface labels update -> verify PWA install prompt.

---

## Day 20: Security Hardening, E2E Test Suite, Backups & Final Deliverable
- **Goal**: Execute comprehensive security audit, automated Playwright E2E suite, database backup runbook, and production demo dataset.
- **Exact Tasks**:
  1. Run complete Playwright E2E regression suite covering all 20 milestones.
  2. Execute OWASP security scan and rate-limiting stress test.
  3. Verify PostgreSQL automated daily backup script (`pg_dump` to encrypted S3).
  4. Seed rich, hyper-realistic production demo dataset (100 students, full academic structure, attendance, fee transactions, marks).
  5. Finalize master documentation and deployment verification.
- **Files Touched**: `tests/e2e/*`, `scripts/backup.sh`, `prisma/seed.ts`, `docs/MASTER.md`.
- **Tests Required**: 100% passing Playwright E2E suite, zero security vulnerabilities in audit.
- **Definition of Done**: Complete platform verified green across all quality gates; ready for commercial deployment.
- **Demo Steps**: Run `pnpm test:e2e` -> all tests pass -> open live demo instance -> demonstrate complete end-to-end journey from tenant onboarding to offline roll call and report card generation.
