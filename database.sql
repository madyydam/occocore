-- ============================================================================
-- OCCO Core / EduSaaS - All-in-One Complete PostgreSQL Database Script
-- Multi-Tenant Educational ERP Architecture (DDL + Initial Master Data)
-- Compatible with PostgreSQL 14, 15, 16, 17, 18+
--
-- How to run in psql:
--   psql -U postgres -d occocore_db -f database.sql
-- Or open this file in pgAdmin / DBeaver / TablePlus and click "Execute" (F5)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable Required PostgreSQL Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. Enumerated Custom Types
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 3. Core Multi-Tenant Tables
-- ----------------------------------------------------------------------------

-- 3.1 Tenants
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

-- 3.3 Users (3-Tier Auth: Email + Pass + 4-Digit Security PIN)
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

-- 3.4 Audit Logs (DPDPA 2023 & CERT-In 180-Day Rule)
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

-- ----------------------------------------------------------------------------
-- 4. Academic Structure
-- ----------------------------------------------------------------------------

-- 4.1 Academic Years
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

-- 4.2 Classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    numeric_level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_classes_tenant_year ON classes(tenant_id, academic_year_id);

-- 4.3 Sections
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sections_tenant_class ON sections(tenant_id, class_id);

-- 4.4 Subjects
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

-- ----------------------------------------------------------------------------
-- 5. Student Enrollment & Directory
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 6. Attendance Engine (11-Code Rule System)
-- ----------------------------------------------------------------------------
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

-- 6.1 Leave Requests (Approvals & Condonations)
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'Medical Leave',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    has_attachment BOOLEAN NOT NULL DEFAULT FALSE,
    medical_doc_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant ON leave_requests(tenant_id, status);

-- 6.2 Biometric Devices & Turnstiles Telemetry
CREATE TABLE IF NOT EXISTS biometric_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Fingerprint',
    ip_address VARCHAR(45) NOT NULL,
    location VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Online',
    battery_status VARCHAR(50) NOT NULL DEFAULT 'Mains AC (100%)',
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_punches_today INT NOT NULL DEFAULT 0,
    queue_length INT NOT NULL DEFAULT 0,
    firmware VARCHAR(50) NOT NULL DEFAULT 'v4.2.1-sec',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_biometric_devices_tenant ON biometric_devices(tenant_id);

-- ----------------------------------------------------------------------------
-- 6.1 Admission Applications & Candidate Pipeline
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admission_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    application_no VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    guardian_name VARCHAR(100) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    dob DATE,
    gender gender_enum NOT NULL DEFAULT 'MALE',
    program VARCHAR(100) NOT NULL,
    target_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    target_section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    merit_score VARCHAR(100),
    numeric_score NUMERIC(6, 2) DEFAULT 0.0,
    category VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    quota_type VARCHAR(100) NOT NULL DEFAULT 'General Merit',
    is_rte_quota BOOLEAN NOT NULL DEFAULT FALSE,
    documents_verified BOOLEAN NOT NULL DEFAULT FALSE,
    documents JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    enrolled_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_application UNIQUE(tenant_id, application_no)
);
CREATE INDEX IF NOT EXISTS idx_admissions_tenant_status ON admission_applications(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_admissions_tenant_created ON admission_applications(tenant_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 7. Fee Structures, Invoices & Receipts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    total_fee NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fee_structures_tenant ON fee_structures(tenant_id);

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

-- ----------------------------------------------------------------------------
-- 8. Examinations, Grading & Marksheet
-- ----------------------------------------------------------------------------
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
-- 8.1 Broadcast Communications & Circulars
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    target_audience VARCHAR(100) NOT NULL,
    recipients_count INT NOT NULL DEFAULT 0,
    delivery_rate VARCHAR(20) NOT NULL DEFAULT '100%',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_broadcast_tenant_created ON broadcast_messages(tenant_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 9. Row-Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS tenant_isolation_leave_requests ON leave_requests;
CREATE POLICY tenant_isolation_leave_requests ON leave_requests
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR current_setting('app.is_super_admin', true) = 'true'
    );

DROP POLICY IF EXISTS tenant_isolation_biometric_devices ON biometric_devices;
CREATE POLICY tenant_isolation_biometric_devices ON biometric_devices
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- ----------------------------------------------------------------------------
-- 10. Initial Master Seed Data (Single Executable Transaction)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_tenant_id UUID;
    v_year_id UUID;
    v_class_id UUID;
    v_section_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_student4_id UUID;
    v_student5_id UUID;
    v_fee_struct_id UUID;
    v_inv1_id UUID;
    v_inv2_id UUID;
    v_inv3_id UUID;
    v_inv4_id UUID;
    v_inv5_id UUID;
BEGIN
    -- 10.1 Master Tenant
    INSERT INTO tenants (
        name,
        slug,
        type,
        status,
        plan_tier,
        max_students,
        primary_color,
        secondary_color,
        font_family,
        motto,
        currency,
        timezone,
        enabled_modules
    ) VALUES (
        'Apex International Global Academy',
        'apexacademy',
        'K12_SCHOOL',
        'ACTIVE',
        'ENTERPRISE',
        2500,
        '#DC2626',
        '#091D17',
        'Plus Jakarta Sans',
        'Excellence in Education, Integrity in Character',
        'INR',
        'Asia/Kolkata',
        '["dashboard","admissions","academics","attendance","fees","exams","communication","roles","settings"]'::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        motto = EXCLUDED.motto,
        enabled_modules = EXCLUDED.enabled_modules,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_tenant_id;

    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'apexacademy';
    END IF;

    -- 10.2 Super Admin User (Email: principal@apexacademy.edu, Pass: Admin@123, PIN: 2468)
    INSERT INTO users (
        tenant_id,
        email,
        phone,
        password_hash,
        pin_hash,
        role,
        first_name,
        last_name,
        is_active,
        must_change_pin_on_login,
        allowed_modules
    ) VALUES (
        v_tenant_id,
        'principal@apexacademy.edu',
        '+91 98765 43210',
        'Admin@123',
        '2468',
        'SUPER_ADMIN',
        'Aarav',
        'Sharma',
        TRUE,
        FALSE,
        '["dashboard","admissions","academics","attendance","fees","exams","communication","roles","settings"]'::jsonb
    )
    ON CONFLICT (tenant_id, email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        pin_hash = EXCLUDED.pin_hash,
        role = EXCLUDED.role,
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP;

    -- 10.3 Academic Year 2026-2027
    INSERT INTO academic_years (
        tenant_id,
        title,
        start_date,
        end_date,
        is_current
    ) VALUES (
        v_tenant_id,
        '2026-2027',
        '2026-04-01',
        '2027-03-31',
        TRUE
    )
    ON CONFLICT (tenant_id, title) DO UPDATE SET
        is_current = TRUE
    RETURNING id INTO v_year_id;

    IF v_year_id IS NULL THEN
        SELECT id INTO v_year_id FROM academic_years WHERE tenant_id = v_tenant_id AND title = '2026-2027';
    END IF;

    -- 10.4 Class 10
    SELECT id INTO v_class_id FROM classes WHERE tenant_id = v_tenant_id AND name = 'Class 10';
    IF v_class_id IS NULL THEN
        INSERT INTO classes (tenant_id, academic_year_id, name, numeric_level)
        VALUES (v_tenant_id, v_year_id, 'Class 10', 10)
        RETURNING id INTO v_class_id;
    END IF;

    -- 10.5 Section A
    SELECT id INTO v_section_id FROM sections WHERE tenant_id = v_tenant_id AND class_id = v_class_id AND name = 'Section A';
    IF v_section_id IS NULL THEN
        INSERT INTO sections (tenant_id, class_id, name, capacity)
        VALUES (v_tenant_id, v_class_id, 'Section A', 40)
        RETURNING id INTO v_section_id;
    END IF;

    -- 10.6 Core Subjects
    INSERT INTO subjects (tenant_id, class_id, name, code, is_theory, is_lab, credits)
    VALUES
        (v_tenant_id, v_class_id, 'Mathematics', 'MATH-101', TRUE, FALSE, 4.0),
        (v_tenant_id, v_class_id, 'Physics', 'PHYS-101', TRUE, TRUE, 4.0),
        (v_tenant_id, v_class_id, 'Chemistry', 'CHEM-101', TRUE, TRUE, 4.0),
        (v_tenant_id, v_class_id, 'English Language & Lit', 'ENG-101', TRUE, FALSE, 3.0),
        (v_tenant_id, v_class_id, 'Computer Applications', 'CS-101', TRUE, TRUE, 4.0)
    ON CONFLICT DO NOTHING;

    -- 10.7 Student Directory (5 Scholars)
    INSERT INTO students (
        tenant_id, section_id, admission_no, roll_no, first_name, last_name,
        dob, gender, blood_group, category, is_rte_quota, emergency_phone,
        guardian_name, guardian_phone, is_active
    ) VALUES (
        v_tenant_id, v_section_id, 'SCH/2026/0491', 1, 'Vihaan', 'Deshmukh',
        '2011-04-12', 'MALE', 'B+', 'GENERAL', FALSE, '+91 98201 11223',
        'Sanjay Deshmukh', '+91 98201 11223', TRUE
    )
    ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
        roll_no = EXCLUDED.roll_no, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student1_id;
    IF v_student1_id IS NULL THEN SELECT id INTO v_student1_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0491'; END IF;

    INSERT INTO students (
        tenant_id, section_id, admission_no, roll_no, first_name, last_name,
        dob, gender, blood_group, category, is_rte_quota, emergency_phone,
        guardian_name, guardian_phone, is_active
    ) VALUES (
        v_tenant_id, v_section_id, 'SCH/2026/0492', 2, 'Ananya', 'Iyer',
        '2011-08-25', 'FEMALE', 'O+', 'GENERAL', FALSE, '+91 98334 55667',
        'Lakshmi Iyer', '+91 98334 55667', TRUE
    )
    ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
        roll_no = EXCLUDED.roll_no, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student2_id;
    IF v_student2_id IS NULL THEN SELECT id INTO v_student2_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0492'; END IF;

    INSERT INTO students (
        tenant_id, section_id, admission_no, roll_no, first_name, last_name,
        dob, gender, blood_group, category, is_rte_quota, emergency_phone,
        guardian_name, guardian_phone, is_active
    ) VALUES (
        v_tenant_id, v_section_id, 'SCH/2026/0493', 3, 'Rohan', 'Kulkarni',
        '2011-02-18', 'MALE', 'A+', 'OBC', FALSE, '+91 98450 77889',
        'Prakash Kulkarni', '+91 98450 77889', TRUE
    )
    ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
        roll_no = EXCLUDED.roll_no, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student3_id;
    IF v_student3_id IS NULL THEN SELECT id INTO v_student3_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0493'; END IF;

    INSERT INTO students (
        tenant_id, section_id, admission_no, roll_no, first_name, last_name,
        dob, gender, blood_group, category, is_rte_quota, emergency_phone,
        guardian_name, guardian_phone, is_active
    ) VALUES (
        v_tenant_id, v_section_id, 'SCH/2026/0494', 4, 'Meera', 'Nair',
        '2011-11-09', 'FEMALE', 'AB+', 'GENERAL', FALSE, '+91 98661 22334',
        'Devan Nair', '+91 98661 22334', TRUE
    )
    ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
        roll_no = EXCLUDED.roll_no, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student4_id;
    IF v_student4_id IS NULL THEN SELECT id INTO v_student4_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0494'; END IF;

    INSERT INTO students (
        tenant_id, section_id, admission_no, roll_no, first_name, last_name,
        dob, gender, blood_group, category, is_rte_quota, emergency_phone,
        guardian_name, guardian_phone, is_active
    ) VALUES (
        v_tenant_id, v_section_id, 'SCH/2026/0495', 5, 'Kabir', 'Sen',
        '2011-07-03', 'MALE', 'O-', 'GENERAL', TRUE, '+91 98772 44556',
        'Amitava Sen', '+91 98772 44556', TRUE
    )
    ON CONFLICT (tenant_id, admission_no) DO UPDATE SET
        roll_no = EXCLUDED.roll_no, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student5_id;
    IF v_student5_id IS NULL THEN SELECT id INTO v_student5_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0495'; END IF;

    -- 10.8 Today's Attendance Records
    INSERT INTO attendance_records (tenant_id, student_id, section_id, date, session, code, reason, source)
    VALUES
        (v_tenant_id, v_student1_id, v_section_id, CURRENT_DATE, 'Full Day', 'P', 'Regular presence', 'MANUAL'),
        (v_tenant_id, v_student2_id, v_section_id, CURRENT_DATE, 'Full Day', 'P', 'Regular presence', 'MANUAL'),
        (v_tenant_id, v_student3_id, v_section_id, CURRENT_DATE, 'Full Day', 'L', 'Late arrival due to transit delay', 'MANUAL'),
        (v_tenant_id, v_student4_id, v_section_id, CURRENT_DATE, 'Full Day', 'LC', 'Medical slip verified for late entry', 'MANUAL'),
        (v_tenant_id, v_student5_id, v_section_id, CURRENT_DATE, 'Full Day', 'HD', 'Half day permission for sports trial', 'MANUAL')
    ON CONFLICT (tenant_id, student_id, date, session) DO UPDATE SET
        code = EXCLUDED.code, reason = EXCLUDED.reason, updated_at = CURRENT_TIMESTAMP;

    -- 10.9 Fee Structures Master
    SELECT id INTO v_fee_struct_id FROM fee_structures WHERE tenant_id = v_tenant_id AND title = 'Class 10 Annual Academic Fee';
    IF v_fee_struct_id IS NULL THEN
        INSERT INTO fee_structures (tenant_id, title, total_fee)
        VALUES (v_tenant_id, 'Class 10 Annual Academic Fee', 85000.00)
        RETURNING id INTO v_fee_struct_id;
    END IF;

    -- 10.10 Invoices
    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student1_id, 'INV/2026/001', 'Term 1 Tuition & Lab Fee', 42500.00, 42500.00, '2026-05-15', 'PAID')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv1_id;
    IF v_inv1_id IS NULL THEN SELECT id INTO v_inv1_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/001'; END IF;

    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student2_id, 'INV/2026/002', 'Term 1 Tuition & Lab Fee', 42500.00, 42500.00, '2026-05-15', 'PAID')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv2_id;
    IF v_inv2_id IS NULL THEN SELECT id INTO v_inv2_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/002'; END IF;

    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student3_id, 'INV/2026/003', 'Term 1 Tuition & Lab Fee', 42500.00, 20000.00, '2026-05-15', 'PARTIAL')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv3_id;
    IF v_inv3_id IS NULL THEN SELECT id INTO v_inv3_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/003'; END IF;

    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student4_id, 'INV/2026/004', 'Term 1 Tuition & Lab Fee', 42500.00, 0.00, '2026-05-15', 'PENDING')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv4_id;
    IF v_inv4_id IS NULL THEN SELECT id INTO v_inv4_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/004'; END IF;

    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student5_id, 'INV/2026/005', 'Term 1 Tuition & Lab Fee', 42500.00, 42500.00, '2026-05-15', 'PAID')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv5_id;
    IF v_inv5_id IS NULL THEN SELECT id INTO v_inv5_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/005'; END IF;

    -- 10.11 Receipts
    INSERT INTO receipts (tenant_id, invoice_id, student_id, receipt_no, amount, payment_method, transaction_ref, notes)
    VALUES
        (v_tenant_id, v_inv1_id, v_student1_id, 'RCP/2026/0081', 42500.00, 'UPI_QR', 'UPI/2026/98218172', 'Online payment via UPI QR'),
        (v_tenant_id, v_inv2_id, v_student2_id, 'RCP/2026/0082', 42500.00, 'BANK_TRANSFER', 'NEFT/HDFC/881239', 'Bank transfer settlement'),
        (v_tenant_id, v_inv3_id, v_student3_id, 'RCP/2026/0083', 20000.00, 'CASH', 'CASH/COUNTER/019', 'Partial cash counter payment')
    ON CONFLICT (tenant_id, receipt_no) DO NOTHING;

    RAISE NOTICE 'Database setup and master seed completed successfully for tenant: apexacademy!';
END $$;

-- ----------------------------------------------------------------------------
-- 11. Final Verification Counts
-- ----------------------------------------------------------------------------
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

