-- ============================================================================
-- OCCO Core / EduSaaS - Production PostgreSQL Database Schema
-- Multi-Tenant Education ERP Architecture
-- Compatible with PostgreSQL 14, 15, 16, 17, 18+
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerated Types
DO $$ BEGIN
    CREATE TYPE tenant_type_enum AS ENUM ('K12_SCHOOL', 'DEGREE_COLLEGE', 'UNIVERSITY', 'COACHING_ACADEMY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status_enum AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_HEAD', 'HOSTEL_WARDEN', 'STUDENT', 'PARENT', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_code_enum AS ENUM ('P', 'L', 'LC', 'HD', 'OD', 'EL', 'ML', 'A', 'SU', 'H', 'NE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status_enum AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('CASH', 'UPI_QR', 'CARD_POS', 'ONLINE_GATEWAY', 'BANK_TRANSFER', 'CHEQUE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 3. Multi-Tenant Core Tables
-- ============================================================================

-- 3.1 Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(63) NOT NULL UNIQUE,
    type tenant_type_enum NOT NULL DEFAULT 'K12_SCHOOL',
    status subscription_status_enum NOT NULL DEFAULT 'TRIAL',
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'STARTER',
    max_students INT NOT NULL DEFAULT 500,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(7) NOT NULL DEFAULT '#DC2626',
    secondary_color VARCHAR(7) NOT NULL DEFAULT '#091D17',
    font_family VARCHAR(50) NOT NULL DEFAULT 'Plus Jakarta Sans',
    motto VARCHAR(255),
    custom_domain VARCHAR(255) UNIQUE,
    domain_verified BOOLEAN NOT NULL DEFAULT FALSE,
    enable_students BOOLEAN NOT NULL DEFAULT TRUE,
    enable_parents BOOLEAN NOT NULL DEFAULT TRUE,
    feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled_modules JSONB NOT NULL DEFAULT '["dashboard","admissions","academics","attendance","fees","exams","communication","roles","settings"]'::jsonb,
    udise_code VARCHAR(20),
    aishe_code VARCHAR(20),
    affiliation_no VARCHAR(50),
    gstin VARCHAR(15),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Tenant Custom Domains
CREATE TABLE IF NOT EXISTS tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ssl_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant ON tenant_domains(tenant_id);

-- 3.3 Users Table (3-Tier Auth: Email + Pass + 4-Digit Security PIN)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    pin_hash VARCHAR(255),
    role user_role_enum NOT NULL DEFAULT 'STUDENT',
    custom_role_key VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_pin_on_login BOOLEAN NOT NULL DEFAULT FALSE,
    allowed_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_email UNIQUE(tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- 3.4 Audit Logs Table (DPDPA 2023 & CERT-In 180-Day Rule)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_lookup ON audit_logs(tenant_id, entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================================
-- 4. Academic Structure
-- ============================================================================

-- 4.1 Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_academic_year UNIQUE(tenant_id, title)
);

-- 4.2 Classes Table (Program / Degree / Standard)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    numeric_level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_classes_tenant_year ON classes(tenant_id, academic_year_id);

-- 4.3 Sections Table (Division / Batch)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sections_tenant_class ON sections(tenant_id, class_id);

-- 4.4 Subjects Table (Course Catalog / NEP Credit Bank)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    is_theory BOOLEAN NOT NULL DEFAULT TRUE,
    is_lab BOOLEAN NOT NULL DEFAULT FALSE,
    credits NUMERIC(4, 2) NOT NULL DEFAULT 4.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subjects_tenant_class ON subjects(tenant_id, class_id);

-- ============================================================================
-- 5. Student Enrollment & Directory
-- ============================================================================

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    admission_no VARCHAR(100) NOT NULL,
    roll_no INT,
    prn VARCHAR(100),
    apaar_id VARCHAR(12),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender gender_enum NOT NULL DEFAULT 'MALE',
    blood_group VARCHAR(5),
    category VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    is_rte_quota BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url TEXT,
    emergency_phone VARCHAR(20),
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_admission_no UNIQUE(tenant_id, admission_no)
);
CREATE INDEX IF NOT EXISTS idx_students_tenant_section ON students(tenant_id, section_id);
CREATE INDEX IF NOT EXISTS idx_students_tenant_roll ON students(tenant_id, roll_no);

-- ============================================================================
-- 6. Attendance Engine (V2 11-Code Rule System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    session VARCHAR(50) NOT NULL DEFAULT 'Full Day',
    code attendance_code_enum NOT NULL DEFAULT 'P',
    reason TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    marked_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_student_date_session UNIQUE(tenant_id, student_id, date, session)
);
CREATE INDEX IF NOT EXISTS idx_attendance_records_lookup ON attendance_records(tenant_id, section_id, date);

-- ============================================================================
-- 7. Fee Structures, Invoices & Receipts
-- ============================================================================

-- 7.1 Fee Structure Master
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    total_fee NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fee_structures_tenant ON fee_structures(tenant_id);

-- 7.2 Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    invoice_no VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status invoice_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_invoice_no UNIQUE(tenant_id, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_invoices_student_status ON invoices(tenant_id, student_id, status);

-- 7.3 Receipts Table (POS & Counter Collections)
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    receipt_no VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method payment_method_enum NOT NULL DEFAULT 'CASH',
    transaction_ref VARCHAR(150),
    collected_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_receipt_no UNIQUE(tenant_id, receipt_no)
);
CREATE INDEX IF NOT EXISTS idx_receipts_student ON receipts(tenant_id, student_id);

-- ============================================================================
-- 8. Examinations, Grading & Marksheet
-- ============================================================================

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_exams_tenant ON exams(tenant_id);

CREATE TABLE IF NOT EXISTS marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL,
    score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.0,
    grade VARCHAR(5),
    is_absent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_mark UNIQUE(tenant_id, exam_id, student_id, subject_id)
);
CREATE INDEX IF NOT EXISTS idx_marks_lookup ON marks(tenant_id, exam_id, student_id);

-- ----------------------------------------------------------------------------
-- 8B. Transfer Certificates & Multi-Department Clearance (Statutory TC Engine)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transfer_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    tc_number VARCHAR(64) NOT NULL,
    reason_for_leaving VARCHAR(255) DEFAULT 'Course Completion / Parent Relocation',
    conduct_remarks VARCHAR(255) DEFAULT 'Exemplary',
    dues_cleared BOOLEAN DEFAULT TRUE,
    library_cleared BOOLEAN DEFAULT TRUE,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_tc UNIQUE(tenant_id, tc_number)
);
CREATE INDEX IF NOT EXISTS idx_tc_tenant_student ON transfer_certificates(tenant_id, student_id);

-- ============================================================================
-- 9. Row-Level Security (RLS) Kernel Isolation
-- ============================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic Tenant RLS Policy
DROP POLICY IF EXISTS tenant_isolation_students ON students;
CREATE POLICY tenant_isolation_students ON students
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

DROP POLICY IF EXISTS tenant_isolation_attendance ON attendance_records;
CREATE POLICY tenant_isolation_attendance ON attendance_records
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR current_setting('app.is_super_admin', true) = 'true'
    );

