-- ============================================================================
-- OCCO Core / EduSaaS - Master Database Initialization Entry Point
-- Multi-Tenant Native PostgreSQL Schema & Seed Runner
--
-- Usage:
--   psql -U postgres -d occocore_db -f database/init.sql
-- ============================================================================

\set ON_ERROR_STOP on

\echo '---------------------------------------------------------'
\echo '>>> Initializing OCCO Core Multi-Tenant PostgreSQL DB <<<'
\echo '---------------------------------------------------------'

-- Step 1: Run Full DDL Schema
\echo '--> Step 1/2: Applying schema, types, indexes, and RLS policies...'
\ir schema.sql

-- Step 2: Run Seed Data
\echo '--> Step 2/2: Seeding master data (Tenants, Admin, Roster, Fees, Attendance)...'
\ir seed.sql

\echo '---------------------------------------------------------'
\echo '>>> Verification: Relational Entity Count Summary <<<'
\echo '---------------------------------------------------------'

SELECT 'tenants' AS entity, count(*) AS total_rows FROM tenants
UNION ALL
SELECT 'users', count(*) FROM users
UNION ALL
SELECT 'academic_years', count(*) FROM academic_years
UNION ALL
SELECT 'classes', count(*) FROM classes
UNION ALL
SELECT 'sections', count(*) FROM sections
UNION ALL
SELECT 'subjects', count(*) FROM subjects
UNION ALL
SELECT 'students', count(*) FROM students
UNION ALL
SELECT 'attendance_records', count(*) FROM attendance_records
UNION ALL
SELECT 'fee_structures', count(*) FROM fee_structures
UNION ALL
SELECT 'invoices', count(*) FROM invoices
UNION ALL
SELECT 'receipts', count(*) FROM receipts;

\echo '---------------------------------------------------------'
\echo '>>> Database Initialization Completed Successfully! <<<'
\echo '---------------------------------------------------------'

