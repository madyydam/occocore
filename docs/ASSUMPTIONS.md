# Assumptions & Design Decisions Register

This document tracks all foundational assumptions, architectural decisions, and open technical points for the Next.js Multi-Tenant Education ERP SaaS platform.

---

## 1. Multi-Tenancy Architecture
- **Tenant Resolution Strategy**: Host-based routing via Next.js Middleware (`request.headers.get('host')`).
  - Standard format: `app.edusaas.com` (Super Admin), `{tenant}.edusaas.com` (Tenant Subdomain), and `{custom-domain.com}` (Verified Custom CNAME).
  - Middleware injects `x-tenant-id`, `x-tenant-slug`, and `x-tenant-type` headers into the request downstream.
- **Database Isolation Strategy**: **Shared Database with PostgreSQL Row-Level Security (RLS)** + Tenant-scoped Prisma Client extension (`prisma.$extends`).
  - *Rationale*: Balance between cost-efficiency, operational simplicity for 1000+ tenants, and strict cryptographic/logical isolation.
  - Every tenant-owned table contains `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`.
  - Database queries automatically append `WHERE tenant_id = current_setting('app.current_tenant_id')` or use Prisma client middleware to eliminate multi-tenant leakage risk.
  - Custom domain routing uses CNAME pointing to platform edge (Vercel / Cloudflare for Platforms) with automatic Let's Encrypt SSL issuance.

---

## 2. Institute Type Terminology & Hierarchy
The ERP supports 4 distinct organizational archetypes configured at tenant onboarding:
1. **K-12 School (CBSE / ICSE / State Board / IB / Cambridge)**:
   - Level 1: Wing / Department (e.g., Primary, Middle, Secondary, Senior Secondary)
   - Level 2: Grade / Standard / Class (e.g., Class 10)
   - Level 3: Section (e.g., Section A, Section B)
   - Student Identifier: Admission No / Scholar No, Roll No, APAAR / PEN ID
2. **Degree College / Autonomous College (UGC / AICTE / State University affiliated)**:
   - Level 1: Stream / Faculty (e.g., Science, Commerce, Arts)
   - Level 2: Program / Degree (e.g., B.Tech, B.Com, BCA)
   - Level 3: Branch / Specialization (e.g., Computer Science, Mechanical)
   - Level 4: Academic Year / Semester (e.g., Semester 5)
   - Level 5: Division / Batch (e.g., Div A, Batch B1)
   - Student Identifier: Permanent Registration Number (PRN), University Enrollment No, Roll No, ABC ID
3. **University (Central / State / Deemed / Private)**:
   - Level 1: School / Institute / Faculty (e.g., School of Engineering)
   - Level 2: Department (e.g., Department of Computer Science & Engineering)
   - Level 3: Program / Curriculum (e.g., B.Tech CSE with AI/ML specialization)
   - Level 4: Semester & CBCS / NEP Credit System (Majors, Minors, Open Electives)
   - Student Identifier: University PRN, Hall Ticket No, APAAR / DigiLocker ABC ID
4. **Coaching Institute / Academy / Training Center**:
   - Level 1: Course / Goal (e.g., JEE Advanced, NEET, UPSC, Full-Stack Bootcamp)
   - Level 2: Batch / Cohort (e.g., Target 2027 Morning Batch)
   - Level 3: Phase / Track (e.g., Phase 1: Mechanics & Organic)
   - Student Identifier: Student Registration ID, Roll ID

---

## 3. Indian Education Regulations & Localization Coverage
- **National Education Policy (NEP 2020)**: Multiple entry/exit points, Academic Bank of Credits (ABC), APAAR (Automated Permanent Academic Account Registry), choice-based credit system (CBCS).
- **UDISE+ & AISHE Reporting**: Standard demographic, categorical (General/OBC/SC/ST/EWS), RTE (Right to Education 25% quota), and institutional code mappings.
- **Financial Compliance**:
  - GST invoicing (optional per educational service exemption, mandatory for coaching/commercial modules and transport/hostel above thresholds).
  - SAC code support (9992 for educational services).
  - Indian payment gateway adapters: Razorpay, Cashfree, PayU, and direct NPCI UPI QR dynamic generation.
- **Notification Compliance**:
  - TRAI DLT registration compliance (Principal Entity ID, Sender ID / Header, registered Template IDs) for SMS.
  - Official WhatsApp Business API (Meta Cloud API / Gupshup / Aisensy) for automated fee alerts, attendance SMS, and circulars.
- **Languages**: English (default), Hindi (हिन्दी), Marathi (मराठी) - expandable via standard JSON i18n dictionaries.

---

## 4. Offline-First & Synchronization Mechanics
- **Client Storage**: **Dexie.js (IndexedDB)** caching core working datasets (Students list, Attendance registers, Mark entry sheets, Fee receipt forms, Timetable).
- **Offline Mutations**: Stored in a durable `SyncOutbox` object store with idempotency keys (`client_mutation_id: UUID`).
- **Conflict Handling**:
  - Strategy: Server-authoritative timestamping (`updated_at`) with field-level Last-Write-Wins (LWW) and optimistic locking for transactional records (e.g., Fee receipt numbering).
  - Fee receipts generated offline use temporary offline receipt tokens (`OFF-RCP-xxxx`) which convert into sequential tenant fiscal receipts upon server synchronization.
- **Network Resilience**: Service Worker (`Serwist`) precaches app shell, fonts, icons, and dynamic cache for read queries.

---

## 5. Technology Stack Decisions
- **Frontend & Server**: Next.js 15 (App Router, Server Actions, React 19).
- **TypeScript**: Strict mode enabled (`noImplicitAny: true`, `strictNullChecks: true`).
- **Database & ORM**: PostgreSQL 16+ with Prisma ORM (and pgvector for AI semantic search in knowledge base).
- **Validation**: Zod 3.x for both server action validations and client form schemas via `react-hook-form` and `@hookform/resolvers/zod`.
- **UI System**: Tailwind CSS v4 + Shadcn UI (Radix UI primitives, Lucide Icons, Sonner toast, Vaul drawers).
- **Job Processing**: Redis + BullMQ (or serverless background workflows via Inngest) for bulk email/WhatsApp dispatch, report generation, and fee reminder crons.
- **Storage**: S3-compatible cloud storage (Cloudflare R2 or AWS S3) with presigned direct uploads.
- **Testing**: Vitest for unit & integration tests, Playwright for multi-role end-to-end tests.
