-- =============================================
-- ENIGMA RLS SECURITY HARDENING
-- Migration: 002_rls_security_hardening.sql
-- Description: Row-level security for unprotected tables
-- =============================================

-- Enable RLS on unprotected tables
ALTER TABLE restaurante.legal_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.floor_plan_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.legal_audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- LEGAL CONTENT RLS POLICIES
-- =============================================

-- Public read access to active legal content
CREATE POLICY "legal_content_public_read" ON restaurante.legal_content
FOR SELECT USING (
    is_active = true
    AND effective_date <= NOW()
    AND (expiry_date IS NULL OR expiry_date > NOW())
);

-- Admin/Manager full access to legal content
CREATE POLICY "legal_content_admin_all" ON restaurante.legal_content
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users u
        JOIN restaurante.users ru ON u.id::text = ru.id
        WHERE u.id = auth.uid()
        AND ru.role IN ('ADMIN', 'MANAGER')
    )
);

-- =============================================
-- FLOOR PLAN ELEMENTS RLS POLICIES
-- =============================================

-- Restaurant-scoped access for authenticated users
CREATE POLICY "floor_plan_restaurant_scoped" ON restaurante.floor_plan_elements
FOR ALL USING (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND
    -- User must belong to the same restaurant context
    EXISTS (
        SELECT 1 FROM auth.users u
        JOIN restaurante.users ru ON u.id::text = ru.id
        WHERE u.id = auth.uid()
        AND (
            ru.role IN ('ADMIN', 'MANAGER', 'STAFF')
            OR restaurant_id = (
                SELECT restaurant_id FROM restaurante.users
                WHERE id = u.id::text LIMIT 1
            )
        )
    )
);

-- =============================================
-- GDPR REQUESTS RLS POLICIES
-- =============================================

-- Customers can read their own GDPR requests
CREATE POLICY "gdpr_requests_customer_read" ON restaurante.gdpr_requests
FOR SELECT USING (
    customer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);

-- Customers can insert their own GDPR requests
CREATE POLICY "gdpr_requests_customer_insert" ON restaurante.gdpr_requests
FOR INSERT WITH CHECK (
    customer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);

-- Admin/Manager full access to GDPR requests
CREATE POLICY "gdpr_requests_admin_all" ON restaurante.gdpr_requests
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users u
        JOIN restaurante.users ru ON u.id::text = ru.id
        WHERE u.id = auth.uid()
        AND ru.role IN ('ADMIN', 'MANAGER')
    )
);

-- =============================================
-- LEGAL AUDIT LOGS RLS POLICIES
-- =============================================

-- Audit logs are admin-only for compliance
CREATE POLICY "legal_audit_logs_admin_only" ON restaurante.legal_audit_logs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users u
        JOIN restaurante.users ru ON u.id::text = ru.id
        WHERE u.id = auth.uid()
        AND ru.role = 'ADMIN'
    )
);

-- System can always insert audit logs (for triggers)
CREATE POLICY "legal_audit_logs_system_insert" ON restaurante.legal_audit_logs
FOR INSERT WITH CHECK (true);

-- =============================================
-- ENHANCED RESERVATION POLICIES
-- =============================================

-- Enhance existing reservation policies with GDPR compliance
DROP POLICY IF EXISTS "reservations_customer_read" ON restaurante.reservations;
CREATE POLICY "reservations_customer_read" ON restaurante.reservations
FOR SELECT USING (
    -- Customer can read their own reservations
    customer_id = (
        SELECT id FROM restaurante.customers
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        LIMIT 1
    )
    -- Only if they have valid data processing consent
    AND EXISTS (
        SELECT 1 FROM restaurante.customers c
        WHERE c.id = customer_id
        AND c.consent_data_processing = true
        AND c.consent_date IS NOT NULL
    )
);

-- =============================================
-- PERFORMANCE OPTIMIZATION FOR RLS
-- =============================================

-- Create indexes to optimize RLS policy performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_lookup
ON restaurante.users (role, id) WHERE role IN ('ADMIN', 'MANAGER', 'STAFF');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email_consent
ON restaurante.customers (email, consent_data_processing)
WHERE consent_data_processing = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_legal_content_active
ON restaurante.legal_content (is_active, effective_date, expiry_date)
WHERE is_active = true;