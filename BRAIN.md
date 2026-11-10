# BRAIN.md — Core ERP Definitive Project Memory & Architectural Rules
> **DO NOT DELETE OR ALTER WITHOUT OWNER CONSENT**  
> Permanent System Knowledge Base & Architectural Invariants  
> Last Updated: 2026-11-10

---

## 👑 1. The Core Hierarchy & Identity (CRITICAL)

### Who is the Super Admin?
* **YOU (The User) = The ONLY Super Admin & Platform Owner.**
* You are the owner of the **Core ERP** business. You sell this ERP software to education businesses.
* You are **NOT** a school principal, college owner, or teacher.
* You control the central command plane at **`/super-admin`**.
* Only you have root access (Email: `superadmin@occo.in`, Password, Master PIN: `9999`).

### Who are the Clients?
* Educational Institutions: Schools, Degree Colleges, Universities, Coaching Academies.
* **Their top person is the "Institute Admin" (or Campus Owner / Director), NOT Super Admin.**
* Under the Institute Admin are campus personnel: Principal, HOD, Teachers, Accountants, Admission Officers, Students, Parents.
* **An individual campus must NEVER have a "Super Admin" role.** Their highest role is `ADMIN` / `Institute Admin`.
* An institution must **never** see Super Admin options, 8-digit key generation, or another institution's data.

---

## 🏛️ 2. The 3-Tier Application Structure

```
c:\Users\madhu\Documents\Univercity ERP\app\
│
├── super-admin/    ← 🔑 TIER 1: PLATFORM OWNER ONLY (YOU)
│                      • Route: /super-admin and /super-admin/login
│                      • Auth: HMAC-SHA256 cookie (core_superadmin_token).
│                      • Functions:
│                        1. Manage all registered institutions & tenant statuses.
│                        2. Generate unique 8-digit activation keys & record license fees (₹).
│                        3. Manage custom on-premise build requests & deal pricing for universities.
│                        4. System health, database isolation telemetry, and audit logs.
│
├── erp/            ← 🏫 TIER 2: MULTI-TENANT INSTITUTIONAL ERP
│                      • Route: /erp and /erp/[tenant] (aliased to /admin)
│                      • Used by: Institute Owners, Principals, Faculty, Staff.
│                      • Strict tenant data isolation: Every query scoped by tenant_id.
│                      • Standalone & Modular: Can be extracted and deployed on a client's
│                        dedicated on-premise server for custom enterprise contracts.
│
└── demo/           ← 🎭 TIER 3: SALES DEMO SANDBOX
                       • Route: /demo
                       • 100% hardcoded mock data (lib/demo/demoMockData.ts).
                       • Zero database mutations — changes stay in browser memory.
                       • 11 Authentic Personas: Institute Admin, College Admin, Principal,
                         HOD, Faculty, Admission Officer, Accountant, HR Manager, Librarian,
                         Student, Parent.
```

---

## 💰 3. Monetization & Onboarding Flow

1. **Self-Service Trial**: A prospect tries `/demo` to inspect features.
2. **Onboarding**: Prospect runs `/onboarding` to configure their school profile (Steps 1–6).
3. **8-Digit Security Key Gate**:
   - At the end of onboarding, the system locks and asks for their **8-Digit Activation Key**.
   - No testing keys or Super Admin links are shown to the client.
4. **License Fee Collection**:
   - The client contacts you.
   - You log in to `/super-admin`, enter the client's name, record the amount charged (e.g. ₹75,000 / ₹1,50,000), and click **"Generate 8-Digit Key"**.
   - The key is saved in PostgreSQL (`tenant_activation_keys` table).
   - You give the key to the client after receiving payment.
5. **System Activation**:
   - Client enters the 8-digit key on `/onboarding`.
   - The system validates against PostgreSQL, marks the key as `ACTIVATED`, unlocks the tenant, and redirects to `/erp/[tenant]`.

---

## 🏢 4. Custom On-Premise Builds for Big Universities

* When a large university requests a private installation on their own campus servers:
  1. The inquiry is logged in the `custom_build_requests` table.
  2. In `/super-admin`, you review their student sizing, set custom pricing (e.g. ₹15,00,000+), and manage deal status.
  3. The `/app/erp/` codebase is packaged and deployed directly on their private servers.

---

## 🔒 5. Invariant Security Rules (NEVER BREAK)

1. **NO Master Backdoor Keys**: Never hardcode bypass keys (`88889999`, `12345678`, etc.) in any file. All keys must be generated and verified through the PostgreSQL database.
2. **NO Super Admin Controls in School Dashboards**: School/College dashboards (`/admin`, `/erp`, `/demo`) must NEVER contain key generation, license vaults, or Super Admin consoles.
3. **Strict Tenant Data Isolation**: Server actions must never hardcode a single tenant slug (like `"apexacademy"`). Queries must always be scoped to the authenticated tenant.
4. **Branding is "Core"**: The platform is branded as **"Core"** (formerly OCCO Core).
5. **Protected Super Admin Route**: `/super-admin/*` must always require the `core_superadmin_token` cookie via Edge Middleware.

---

## 🗄️ 6. Key Database Tables

* `super_admin_users`: Platform owner credentials (`superadmin@occo.in` / Master PIN: `9999`).
* `tenant_activation_keys`: 8-digit activation keys, amount charged, currency, status (`PENDING`, `ACTIVATED`, `REVOKED`), timestamps.
* `custom_build_requests`: University on-premise leads, student sizing, hosting models, quoted prices, deal statuses.
* `tenants`: Registered institutions (schools, colleges, universities, academies).
* `users`: Institution staff, faculty, students, and parents.

