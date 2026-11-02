# Master Architecture, Product & Engineering Specification

> **Single Source of Truth** for the Next.js Multi-Tenant, Offline-First Education ERP SaaS Platform.

---

## 1. Executive Summary & Document Navigation

This master document acts as the definitive index and technical blueprint for replacing the legacy single-tenant monolithic Laravel application with a modern, production-grade, multi-tenant Education ERP SaaS platform.

### Core Documentation Index

| Ref | Document | Focus & Scope |
| :---: | :--- | :--- |
| **00** | [ASSUMPTIONS.md](file:///c:/xampp/htdocs/lav_sms-master/docs/ASSUMPTIONS.md) | Foundational assumptions, architectural decisions & design choices |
| **00** | [DAILY-LOG.md](file:///c:/xampp/htdocs/lav_sms-master/docs/DAILY-LOG.md) | Daily execution log, milestone verification records & decision audit |
| **01** | [01-research-report.md](file:///c:/xampp/htdocs/lav_sms-master/docs/01-research-report.md) | Benchmark analysis of 100+ global & Indian ERPs, feature matrix & market gaps |
| **02** | [02-vision-and-personas.md](file:///c:/xampp/htdocs/lav_sms-master/docs/02-vision-and-personas.md) | Product vision, 4 institutional archetypes & 7 detailed user personas |
| **03** | [03-feature-catalogue.md](file:///c:/xampp/htdocs/lav_sms-master/docs/03-feature-catalogue.md) | **580 distinct features** classified across 23 modules, tagged P0/P1/P2 with flag keys |
| **04** | [04-module-PRDs.md](file:///c:/xampp/htdocs/lav_sms-master/docs/04-module-PRDs.md) | Detailed Product Requirement Documents for every core functional module |
| **05** | [05-architecture.md](file:///c:/xampp/htdocs/lav_sms-master/docs/05-architecture.md) | Next.js 15 App Router, host-based routing, RLS isolation & Dexie sync topology |
| **06** | [06-database-schema-and-ERD.md](file:///c:/xampp/htdocs/lav_sms-master/docs/06-database-schema-and-ERD.md) | Complete Prisma ORM relational schema, Mermaid ERD & PostgreSQL RLS policies |
| **07** | [07-multi-tenancy-domains-branding.md](file:///c:/xampp/htdocs/lav_sms-master/docs/07-multi-tenancy-domains-branding.md) | Subdomain routing, custom domain CNAME verification & dynamic CSS theme injection |
| **08** | [08-rbac-permission-matrix.md](file:///c:/xampp/htdocs/lav_sms-master/docs/08-rbac-permission-matrix.md) | Role hierarchy, 120+ granular permission matrix & server-side authorization guards |
| **09** | [09-ux-design-system-and-tour-spec.md](file:///c:/xampp/htdocs/lav_sms-master/docs/09-ux-design-system-and-tour-spec.md) | Design tokens, Command Palette (Ctrl+K) & Driver.js role-based guided tour scripts |
| **10** | [10-api-spec.md](file:///c:/xampp/htdocs/lav_sms-master/docs/10-api-spec.md) | Server Action contracts, REST endpoints, Zod schemas & sync payloads |
| **11** | [11-fees-and-payments.md](file:///c:/xampp/htdocs/lav_sms-master/docs/11-fees-and-payments.md) | Indian fee ledger, dynamic NPCI UPI QR generation, Razorpay webhooks & POS |
| **12** | [12-security-and-compliance.md](file:///c:/xampp/htdocs/lav_sms-master/docs/12-security-and-compliance.md) | DPDPA 2023 compliance, OWASP Top 10 defenses & cryptographic audit trails |
| **13** | [13-testing-strategy.md](file:///c:/xampp/htdocs/lav_sms-master/docs/13-testing-strategy.md) | Unit tests (Vitest), offline-sync test harness & multi-tenant isolation tests |
| **14** | [14-20-day-plan.md](file:///c:/xampp/htdocs/lav_sms-master/docs/14-20-day-plan.md) | Atomic 20-day build plan with exact tasks, files touched, DoD & demo steps |
| **15** | [15-deployment-runbook.md](file:///c:/xampp/htdocs/lav_sms-master/docs/15-deployment-runbook.md) | Docker containerization, cloud topology, zero-downtime DB migrations & backups |
| **16** | [16-coding-standards.md](file:///c:/xampp/htdocs/lav_sms-master/docs/16-coding-standards.md) | TypeScript strictness, zero `any` policy, Zod validation & commit conventions |
| **17** | [17-risk-register.md](file:///c:/xampp/htdocs/lav_sms-master/docs/17-risk-register.md) | Technical and operational risk matrix, impact ratings & mitigation protocols |
| **18** | [18-indian-statutory-and-legal-compliance.md](file:///c:/xampp/htdocs/lav_sms-master/docs/18-indian-statutory-and-legal-compliance.md) | **Comprehensive Indian Law & Statutory Compliance**: DPDPA 2023, RTE, MoE Coaching Guidelines 2024, NEP 2020, GST SAC 9992, TRAI DLT, POCSO & POSH |

---

## 2. Architectural Pillars

1. **Host-Based Multi-Tenancy**:
   - `app.edusaas.com` -> Super Admin Control Center.
   - `{tenant}.edusaas.com` -> Dedicated Institute Tenant Portal.
   - `{custom-domain.com}` -> Verified CNAME with automatic SSL termination.
2. **True Offline-First Resilience**:
   - Dexie.js (IndexedDB) client-side storage for zero-latency classroom operations.
   - Durable Outbox Mutation Queue with automatic background sync upon internet reconnection.
3. **Adaptive Terminology Engine**:
   - A single unified codebase dynamically morphs its terminology and hierarchy between **K-12 Schools**, **Degree Colleges**, **Universities**, and **Coaching Academies**.
4. **India-Native Regulatory & Financial Stack**:
   - Out-of-the-box support for PRN, APAAR/ABC ID, UDISE+ & AISHE exports, RTE 25% quota, CBSE 9-point & SGPA/CGPA grading, dynamic NPCI UPI QR generation, and TRAI DLT-compliant WhatsApp/SMS notifications.
5. **Radical Usability**:
   - Built-in Driver.js guided tours for every role, universal Command Palette (`Ctrl + K`), and 500+ granular modular features toggled per tenant via feature flags.
