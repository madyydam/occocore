-- ============================================================================
-- Migration 002: Super Admin Platform Tables, 8-Digit Keys & Custom Build Inquiries
-- ============================================================================

-- 1. Super Admin Platform Master Table
CREATE TABLE IF NOT EXISTS super_admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL DEFAULT 'Platform Super Administrator',
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ
);

-- Seed default Super Admin account if not exists
INSERT INTO super_admin_users (email, password_hash, pin_hash, full_name, phone)
VALUES (
    'superadmin@occo.in',
    'SuperAdmin@2026',
    '9999',
    'OCCO Platform Owner',
    '+91 9876543210'
)
ON CONFLICT (email) DO NOTHING;

-- 2. Tenant 8-Digit Activation Keys Table
CREATE TABLE IF NOT EXISTS tenant_activation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    activation_key VARCHAR(16) NOT NULL UNIQUE,
    amount_charged NUMERIC(12,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    plan_tier VARCHAR(50) DEFAULT 'ENTERPRISE',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    generated_by UUID REFERENCES super_admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_activation_keys_slug ON tenant_activation_keys(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_activation_keys_status ON tenant_activation_keys(status);

-- Seed sample initial keys in DB so valid keys exist
INSERT INTO tenant_activation_keys (tenant_slug, tenant_name, activation_key, amount_charged, status, notes)
VALUES 
('apexacademy', 'Apex International Global Academy', '89247163', 125000.00, 'ACTIVATED', 'Annual Enterprise License 2026-27'),
('st-xaviers', 'St. Xavier Collegiate School', '45819032', 85000.00, 'PENDING', 'K12 School Starter Edition pending onboarding fee settlement'),
('pinnacle-iit', 'Pinnacle IIT & Medical Academy', '71293845', 150000.00, 'PENDING', 'Coaching Academy 4-Branch Pack')
ON CONFLICT (activation_key) DO NOTHING;

-- 3. Custom Build Requests & Inquiries Table
CREATE TABLE IF NOT EXISTS custom_build_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    institution_name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(50) NOT NULL DEFAULT 'K12_SCHOOL',
    contact_person VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    estimated_students INT DEFAULT 1000,
    hosting_preference VARCHAR(50) DEFAULT 'ON_PREMISE_DEDICATED',
    custom_modules JSONB DEFAULT '[]'::jsonb,
    special_requirements TEXT,
    budget_range VARCHAR(100),
    quoted_price NUMERIC(12,2),
    status VARCHAR(30) DEFAULT 'NEW',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_custom_build_status ON custom_build_requests(status);

INSERT INTO custom_build_requests 
(institution_name, institution_type, contact_person, email, phone, estimated_students, hosting_preference, special_requirements, budget_range, quoted_price, status, notes)
VALUES 
('National Institute of Advanced Studies', 'UNIVERSITY', 'Dr. Ramesh Narayan', 'director@nias.ac.in', '+91 9448102938', 4500, 'ON_PREMISE_DEDICATED', 'Dedicated on-premise installation on campus server racks. Need integration with legacy biometric punch clocks and RFID turnstiles.', '₹15L - ₹25L', 1850000.00, 'PROPOSAL_SENT', 'Client requested server sizing specs and data migration team briefing.'),
('Bright Future International Academy', 'K12_SCHOOL', 'Mrs. Sunita Verma', 'principal@brightfuture.org', '+91 9820192837', 1800, 'CLOUD_SAAS', 'Custom bus route live tracking with parent mobile app notifications and CBSE 2026 report card format.', '₹5L - ₹10L', 750000.00, 'NEW', 'Inbound lead from website onboarding inquiry.')
ON CONFLICT DO NOTHING;

