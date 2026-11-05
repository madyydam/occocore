# OCCO Core - PostgreSQL Native Database Engine

This directory contains the production-grade, multi-tenant PostgreSQL database definition files for **OCCO Core** (Universal Education ERP). 

The platform connects directly to PostgreSQL via `node-postgres` (`pg.Pool` in `lib/db.ts`) executing native, parameterised SQL queries without ORM abstraction layers.

---

## 📁 File Structure

| File | Purpose |
|------|---------|
| `database/init.sql` | **Master entry point**. Executes `schema.sql`, followed by `seed.sql`, and outputs a verification summary table of all entity counts. |
| `database/schema.sql` | Native PostgreSQL DDL: ENUM types, multi-tenant tables, indexes, constraints, foreign keys, and Row-Level Security (RLS) policies. |
| `database/seed.sql` | Idempotent PL/pgSQL master seed: seeds the default production tenant (`apexacademy`), super admin user (`principal@apexacademy.edu`), academic year (`2026-2027`), standard Class 10 & Section A, core subjects, 5 representative scholars, today's attendance records, fee structures, invoices, and receipts. |

---

## 🚀 Quick Execution via `psql`

To run the entire database initialization from scratch or refresh seed data:

```bash
# Connect as postgres superuser to database occocore_db
psql -U postgres -d occocore_db -f database/init.sql
```

Or execute individually:

```bash
# 1. Apply DDL schema
psql -U postgres -d occocore_db -f database/schema.sql

# 2. Seed initial master records
psql -U postgres -d occocore_db -f database/seed.sql
```

---

## 🔐 3-Tier Authentication & PIN Model

Every administrative user in `users` requires:
1. **Registered Work Email**: (e.g. `principal@apexacademy.edu`)
2. **Password**: (e.g. `Admin@123`)
3. **4-Digit Security PIN**: (e.g. `2468`)

---

## 🏛️ Multi-Tenant Architecture & RLS

Multi-tenancy is enforced natively at the database level:
- Every table contains a `tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE`.
- Row-Level Security (RLS) is enabled on operational tables (`students`, `attendance_records`, `invoices`, `receipts`, `marks`, `audit_logs`).
- Application sessions set `SET LOCAL app.current_tenant_id = '...'` to guarantee strict mathematical isolation between schools, colleges, and academies.

