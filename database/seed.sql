-- ============================================================================
-- OCCO Core / EduSaaS - Production PostgreSQL Database Seed Script
-- Idempotent, Relational Master Data Seeder using Native PostgreSQL PL/pgSQL
-- ============================================================================

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
    -- 1. Master Tenant: Apex International Global Academy
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

    -- If existing tenant was updated without returning (on conflict update), ensure id is fetched:
    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'apexacademy';
    END IF;

    -- 2. Master Super Admin User (3-Tier Auth: Email, Password, 4-Digit Security PIN)
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

    -- 3. Academic Year 2026-2027
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

    -- 4. Standard Class 10
    SELECT id INTO v_class_id FROM classes WHERE tenant_id = v_tenant_id AND name = 'Class 10';
    IF v_class_id IS NULL THEN
        INSERT INTO classes (
            tenant_id,
            academic_year_id,
            name,
            numeric_level
        ) VALUES (
            v_tenant_id,
            v_year_id,
            'Class 10',
            10
        )
        RETURNING id INTO v_class_id;
    END IF;

    -- 5. Standard Section A
    SELECT id INTO v_section_id FROM sections WHERE tenant_id = v_tenant_id AND class_id = v_class_id AND name = 'Section A';
    IF v_section_id IS NULL THEN
        INSERT INTO sections (
            tenant_id,
            class_id,
            name,
            capacity
        ) VALUES (
            v_tenant_id,
            v_class_id,
            'Section A',
            40
        )
        RETURNING id INTO v_section_id;
    END IF;

    -- 6. Core Subjects
    INSERT INTO subjects (tenant_id, class_id, name, code, is_theory, is_lab, credits)
    VALUES
        (v_tenant_id, v_class_id, 'Mathematics', 'MATH-101', TRUE, FALSE, 4.0),
        (v_tenant_id, v_class_id, 'Physics', 'PHYS-101', TRUE, TRUE, 4.0),
        (v_tenant_id, v_class_id, 'Chemistry', 'CHEM-101', TRUE, TRUE, 4.0),
        (v_tenant_id, v_class_id, 'English Language & Lit', 'ENG-101', TRUE, FALSE, 3.0),
        (v_tenant_id, v_class_id, 'Computer Applications', 'CS-101', TRUE, TRUE, 4.0)
    ON CONFLICT DO NOTHING;

    -- 7. Student Directory (5 Representative Scholars)
    -- Student 1: Vihaan Deshmukh
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
        roll_no = EXCLUDED.roll_no,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        emergency_phone = EXCLUDED.emergency_phone,
        guardian_name = EXCLUDED.guardian_name,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student1_id;
    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0491';
    END IF;

    -- Student 2: Ananya Iyer
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
        roll_no = EXCLUDED.roll_no,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        emergency_phone = EXCLUDED.emergency_phone,
        guardian_name = EXCLUDED.guardian_name,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student2_id;
    IF v_student2_id IS NULL THEN
        SELECT id INTO v_student2_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0492';
    END IF;

    -- Student 3: Rohan Kulkarni
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
        roll_no = EXCLUDED.roll_no,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        emergency_phone = EXCLUDED.emergency_phone,
        guardian_name = EXCLUDED.guardian_name,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student3_id;
    IF v_student3_id IS NULL THEN
        SELECT id INTO v_student3_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0493';
    END IF;

    -- Student 4: Meera Nair
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
        roll_no = EXCLUDED.roll_no,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        emergency_phone = EXCLUDED.emergency_phone,
        guardian_name = EXCLUDED.guardian_name,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student4_id;
    IF v_student4_id IS NULL THEN
        SELECT id INTO v_student4_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0494';
    END IF;

    -- Student 5: Kabir Sen
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
        roll_no = EXCLUDED.roll_no,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        emergency_phone = EXCLUDED.emergency_phone,
        guardian_name = EXCLUDED.guardian_name,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_student5_id;
    IF v_student5_id IS NULL THEN
        SELECT id INTO v_student5_id FROM students WHERE tenant_id = v_tenant_id AND admission_no = 'SCH/2026/0495';
    END IF;

    -- 8. Today's Attendance Records (Using V2 11-Code Rule System)
    INSERT INTO attendance_records (tenant_id, student_id, section_id, date, session, code, reason, source)
    VALUES
        (v_tenant_id, v_student1_id, v_section_id, CURRENT_DATE, 'Full Day', 'P', 'Regular presence', 'MANUAL'),
        (v_tenant_id, v_student2_id, v_section_id, CURRENT_DATE, 'Full Day', 'P', 'Regular presence', 'MANUAL'),
        (v_tenant_id, v_student3_id, v_section_id, CURRENT_DATE, 'Full Day', 'L', 'Late arrival due to transit delay', 'MANUAL'),
        (v_tenant_id, v_student4_id, v_section_id, CURRENT_DATE, 'Full Day', 'LC', 'Medical slip verified for late entry', 'MANUAL'),
        (v_tenant_id, v_student5_id, v_section_id, CURRENT_DATE, 'Full Day', 'HD', 'Half day permission for sports trial', 'MANUAL')
    ON CONFLICT (tenant_id, student_id, date, session) DO UPDATE SET
        code = EXCLUDED.code,
        reason = EXCLUDED.reason,
        updated_at = CURRENT_TIMESTAMP;

    -- 9. Fee Structures Master
    SELECT id INTO v_fee_struct_id FROM fee_structures WHERE tenant_id = v_tenant_id AND title = 'Class 10 Annual Academic Fee';
    IF v_fee_struct_id IS NULL THEN
        INSERT INTO fee_structures (tenant_id, title, total_fee)
        VALUES (v_tenant_id, 'Class 10 Annual Academic Fee', 85000.00)
        RETURNING id INTO v_fee_struct_id;
    END IF;

    -- 10. Student Invoices
    -- Student 1 Invoice: Paid
    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student1_id, 'INV/2026/001', 'Term 1 Tuition & Lab Fee', 42500.00, 42500.00, '2026-05-15', 'PAID')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv1_id;
    IF v_inv1_id IS NULL THEN SELECT id INTO v_inv1_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/001'; END IF;

    -- Student 2 Invoice: Paid
    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student2_id, 'INV/2026/002', 'Term 1 Tuition & Lab Fee', 42500.00, 42500.00, '2026-05-15', 'PAID')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv2_id;
    IF v_inv2_id IS NULL THEN SELECT id INTO v_inv2_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/002'; END IF;

    -- Student 3 Invoice: Partial
    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student3_id, 'INV/2026/003', 'Term 1 Tuition & Lab Fee', 42500.00, 20000.00, '2026-05-15', 'PARTIAL')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv3_id;
    IF v_inv3_id IS NULL THEN SELECT id INTO v_inv3_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/003'; END IF;

    -- Student 4 Invoice: Pending
    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student4_id, 'INV/2026/004', 'Term 1 Tuition & Lab Fee', 42500.00, 0.00, '2026-05-15', 'PENDING')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv4_id;
    IF v_inv4_id IS NULL THEN SELECT id INTO v_inv4_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/004'; END IF;

    -- Student 5 Invoice: Paid
    INSERT INTO invoices (tenant_id, student_id, invoice_no, title, amount, paid_amount, due_date, status)
    VALUES (v_tenant_id, v_student5_id, 'INV/2026/005', 'Term 1 Tuition & Lab Fee', 42500.00, 42500.00, '2026-05-15', 'PAID')
    ON CONFLICT (tenant_id, invoice_no) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, status = EXCLUDED.status
    RETURNING id INTO v_inv5_id;
    IF v_inv5_id IS NULL THEN SELECT id INTO v_inv5_id FROM invoices WHERE tenant_id = v_tenant_id AND invoice_no = 'INV/2026/005'; END IF;

    -- 11. Fee Receipts
    INSERT INTO receipts (tenant_id, invoice_id, student_id, receipt_no, amount, payment_method, transaction_ref, notes)
    VALUES
        (v_tenant_id, v_inv1_id, v_student1_id, 'RCP/2026/0081', 42500.00, 'UPI_QR', 'UPI/2026/98218172', 'Online payment via UPI QR'),
        (v_tenant_id, v_inv2_id, v_student2_id, 'RCP/2026/0082', 42500.00, 'BANK_TRANSFER', 'NEFT/HDFC/881239', 'Bank transfer settlement'),
        (v_tenant_id, v_inv3_id, v_student3_id, 'RCP/2026/0083', 20000.00, 'CASH', 'CASH/COUNTER/019', 'Partial cash counter payment')
    ON CONFLICT (tenant_id, receipt_no) DO NOTHING;

    RAISE NOTICE 'PostgreSQL master seed executed successfully for tenant: % (ID: %)', 'apexacademy', v_tenant_id;
END $$;
