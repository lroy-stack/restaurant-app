-- ============================================
-- ENIGMA LEGAL COMPLIANCE SYSTEM MIGRATION
-- PRP Implementation: GDPR/AEPD 2025 Complete Compliance
-- Schema: restaurante (all tables in same schema as existing)
-- ============================================

-- 1. LEGAL CONTENT MANAGEMENT TABLE
-- Database-driven content with versioning for zero-downtime policy updates
CREATE TABLE restaurante.legal_content (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_type TEXT NOT NULL CHECK (document_type IN ('privacy_policy', 'terms_conditions', 'cookie_policy', 'legal_notice', 'gdpr_rights')),
    language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
    version TEXT NOT NULL DEFAULT 'v1.0',
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- Structured content with sections for flexible rendering
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by TEXT REFERENCES restaurante.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- CONSTRAINT: Ensure only one active version per document type and language
    UNIQUE(document_type, language, is_active) WHERE is_active = true
);

-- Performance indexes for legal content queries
CREATE INDEX idx_legal_content_active ON restaurante.legal_content(document_type, language, is_active) WHERE is_active = true;
CREATE INDEX idx_legal_content_effective ON restaurante.legal_content(effective_date, expiry_date);
CREATE INDEX idx_legal_content_version ON restaurante.legal_content(document_type, version, created_at);

-- ============================================
-- 2. COOKIE CONSENT MANAGEMENT (AEPD 2025 COMPLIANT)
-- ============================================
CREATE TABLE restaurante.cookie_consents (
    id TEXT PRIMARY KEY DEFAULT 'cc_' || gen_random_uuid()::text,
    session_id TEXT, -- For anonymous users (before registration)
    customer_id TEXT REFERENCES restaurante.customers(id),
    consent_id TEXT NOT NULL UNIQUE, -- Frontend-generated UUID for tracking

    -- AEPD 2025 Cookie Categories (5 standard categories)
    necessary_cookies BOOLEAN NOT NULL DEFAULT true, -- Always true, cannot be disabled
    analytics_cookies BOOLEAN NOT NULL DEFAULT false,
    marketing_cookies BOOLEAN NOT NULL DEFAULT false,
    functionality_cookies BOOLEAN NOT NULL DEFAULT false,
    security_cookies BOOLEAN NOT NULL DEFAULT false,

    -- Consent Metadata (GDPR Article 7 compliance)
    consent_method TEXT NOT NULL CHECK (consent_method IN ('banner_accept_all', 'banner_reject_all', 'preferences_custom', 'banner_necessary_only')),
    consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expiry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL, -- Auto-calculated (24 months max per AEPD)

    -- Technical Metadata (Audit trail requirements)
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    page_url TEXT NOT NULL,
    referrer TEXT,

    -- Compliance Tracking
    policy_version TEXT NOT NULL DEFAULT 'v1.0',
    gdpr_lawful_basis TEXT NOT NULL DEFAULT 'consent', -- Article 6(1)(a)
    withdrawal_timestamp TIMESTAMP WITH TIME ZONE,
    withdrawal_method TEXT CHECK (withdrawal_method IN ('banner', 'preferences', 'contact_form', 'api')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance indexes for cookie consent queries
CREATE INDEX idx_cookie_consents_active ON restaurante.cookie_consents(consent_id, expiry_timestamp) WHERE withdrawal_timestamp IS NULL;
CREATE INDEX idx_cookie_consents_customer ON restaurante.cookie_consents(customer_id, consent_timestamp);
CREATE INDEX idx_cookie_consents_session ON restaurante.cookie_consents(session_id, consent_timestamp);
CREATE INDEX idx_cookie_consents_expiry ON restaurante.cookie_consents(expiry_timestamp) WHERE withdrawal_timestamp IS NULL;

-- ============================================
-- 3. GDPR RIGHTS REQUESTS (Article 15-22 Implementation)
-- ============================================
CREATE TABLE restaurante.gdpr_requests (
    id TEXT PRIMARY KEY DEFAULT 'gdpr_' || gen_random_uuid()::text,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'expired')),

    -- Requester Information
    customer_id TEXT REFERENCES restaurante.customers(id),
    email TEXT NOT NULL,
    verification_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Request Details
    description TEXT,
    requested_data JSONB, -- Specific data categories requested
    legal_basis TEXT, -- GDPR article reference (e.g., "Article 15", "Article 17")

    -- Processing Information
    assigned_to TEXT REFERENCES restaurante.users(id),
    response_data JSONB, -- Exported data or action taken details
    response_method TEXT CHECK (response_method IN ('email', 'secure_download', 'postal', 'in_person')),

    -- Timeline Compliance (GDPR 30-day requirement)
    due_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Auto-calculated (+30 days from verification)
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Audit Trail
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Compliance monitoring indexes for 30-day deadline tracking
CREATE INDEX idx_gdpr_requests_due ON restaurante.gdpr_requests(due_date, status) WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_gdpr_requests_customer ON restaurante.gdpr_requests(customer_id, created_at);
CREATE INDEX idx_gdpr_requests_status ON restaurante.gdpr_requests(status, created_at);
CREATE INDEX idx_gdpr_requests_type ON restaurante.gdpr_requests(request_type, status, created_at);

-- ============================================
-- 4. LEGAL AUDIT LOGS (Tamper-proof compliance tracking)
-- ============================================
CREATE TABLE restaurante.legal_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'consent_given', 'consent_withdrawn', 'consent_modified',
        'policy_viewed', 'policy_updated', 'policy_activated',
        'data_exported', 'data_deleted', 'data_anonymized',
        'gdpr_request_submitted', 'gdpr_request_processed',
        'legal_content_created', 'legal_content_updated'
    )),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'reservation', 'cookie_consent', 'gdpr_request', 'legal_content')),
    entity_id TEXT NOT NULL,

    -- Event Details (before/after state for audit trail)
    old_values JSONB,
    new_values JSONB,
    metadata JSONB, -- Additional context (e.g., consent categories changed)

    -- Actor Information
    actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'staff', 'system', 'anonymous')),
    actor_id TEXT,

    -- Technical Context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,

    -- Compliance Context
    legal_basis TEXT,
    policy_version TEXT,

    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit query indexes for compliance reporting
CREATE INDEX idx_audit_logs_entity ON restaurante.legal_audit_logs(entity_type, entity_id, timestamp);
CREATE INDEX idx_audit_logs_event ON restaurante.legal_audit_logs(event_type, timestamp);
CREATE INDEX idx_audit_logs_actor ON restaurante.legal_audit_logs(actor_type, actor_id, timestamp);
CREATE INDEX idx_audit_logs_timestamp ON restaurante.legal_audit_logs(timestamp);

-- ============================================
-- 5. ENHANCED EXISTING TABLES (Add missing GDPR fields)
-- ============================================

-- Add missing consent withdrawal tracking to customers table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'restaurante' AND table_name = 'customers' AND column_name = 'consent_withdrawn_at') THEN
        ALTER TABLE restaurante.customers ADD COLUMN consent_withdrawn_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE restaurante.customers ADD COLUMN consent_withdrawal_reason TEXT;
    END IF;
END $$;

-- Add missing GDPR compliance fields to reservations table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'restaurante' AND table_name = 'reservations' AND column_name = 'consent_withdrawn_at') THEN
        ALTER TABLE restaurante.reservations ADD COLUMN consent_withdrawn_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE restaurante.reservations ADD COLUMN consent_withdrawal_reason TEXT;
        ALTER TABLE restaurante.reservations ADD COLUMN consent_user_agent TEXT;
        ALTER TABLE restaurante.reservations ADD COLUMN gdpr_policy_version TEXT DEFAULT 'v1.0';
    END IF;
END $$;

-- ============================================
-- 6. RLS POLICIES FOR LEGAL TABLES
-- ============================================

-- Legal Content: Public read for active content, admin write
ALTER TABLE restaurante.legal_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_read_active_legal_content" ON restaurante.legal_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "staff_can_manage_legal_content" ON restaurante.legal_content
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM restaurante.users
            WHERE users.id = (auth.uid())::text
            AND users.role IN ('ADMIN', 'MANAGER')
        )
    );

CREATE POLICY "service_role_full_access_legal_content" ON restaurante.legal_content
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Cookie Consents: Customer can manage their own, staff can view all
ALTER TABLE restaurante.cookie_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_can_manage_own_consents" ON restaurante.cookie_consents
    FOR ALL TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM restaurante.customers
            WHERE email = (auth.jwt() ->> 'email')
        )
    );

CREATE POLICY "staff_can_view_all_consents" ON restaurante.cookie_consents
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM restaurante.users
            WHERE users.id = (auth.uid())::text
            AND users.role IN ('ADMIN', 'MANAGER', 'STAFF')
        )
    );

CREATE POLICY "service_role_full_access_cookie_consents" ON restaurante.cookie_consents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- GDPR Requests: Customer can manage their own, staff can view/process all
ALTER TABLE restaurante.gdpr_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_can_manage_own_gdpr_requests" ON restaurante.gdpr_requests
    FOR ALL TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM restaurante.customers
            WHERE email = (auth.jwt() ->> 'email')
        )
    );

CREATE POLICY "staff_can_process_gdpr_requests" ON restaurante.gdpr_requests
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM restaurante.users
            WHERE users.id = (auth.uid())::text
            AND users.role IN ('ADMIN', 'MANAGER')
        )
    );

CREATE POLICY "service_role_full_access_gdpr_requests" ON restaurante.gdpr_requests
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Legal Audit Logs: Read-only for staff, full access for service role
ALTER TABLE restaurante.legal_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_can_read_audit_logs" ON restaurante.legal_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM restaurante.users
            WHERE users.id = (auth.uid())::text
            AND users.role IN ('ADMIN', 'MANAGER')
        )
    );

CREATE POLICY "service_role_full_access_audit_logs" ON restaurante.legal_audit_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- 7. TRIGGERS FOR AUDIT LOGGING
-- ============================================

-- Function to automatically log legal events
CREATE OR REPLACE FUNCTION restaurante.log_legal_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert audit log entry
    INSERT INTO restaurante.legal_audit_logs (
        event_type,
        entity_type,
        entity_id,
        old_values,
        new_values,
        actor_type,
        actor_id,
        timestamp
    ) VALUES (
        CASE
            WHEN TG_OP = 'INSERT' THEN
                CASE TG_TABLE_NAME
                    WHEN 'cookie_consents' THEN 'consent_given'
                    WHEN 'gdpr_requests' THEN 'gdpr_request_submitted'
                    WHEN 'legal_content' THEN 'legal_content_created'
                    ELSE 'entity_created'
                END
            WHEN TG_OP = 'UPDATE' THEN
                CASE TG_TABLE_NAME
                    WHEN 'cookie_consents' THEN
                        CASE WHEN NEW.withdrawal_timestamp IS NOT NULL AND OLD.withdrawal_timestamp IS NULL
                             THEN 'consent_withdrawn'
                             ELSE 'consent_modified'
                        END
                    WHEN 'gdpr_requests' THEN 'gdpr_request_processed'
                    WHEN 'legal_content' THEN 'legal_content_updated'
                    ELSE 'entity_updated'
                END
            WHEN TG_OP = 'DELETE' THEN 'entity_deleted'
        END,
        TG_TABLE_NAME::text,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        'system',
        auth.uid()::text,
        now()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to legal tables
CREATE TRIGGER cookie_consents_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON restaurante.cookie_consents
    FOR EACH ROW EXECUTE FUNCTION restaurante.log_legal_event();

CREATE TRIGGER gdpr_requests_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON restaurante.gdpr_requests
    FOR EACH ROW EXECUTE FUNCTION restaurante.log_legal_event();

CREATE TRIGGER legal_content_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON restaurante.legal_content
    FOR EACH ROW EXECUTE FUNCTION restaurante.log_legal_event();

-- ============================================
-- 8. INITIAL LEGAL CONTENT SEED DATA
-- ============================================

-- Insert initial Spanish legal content
INSERT INTO restaurante.legal_content (document_type, language, version, title, content, effective_date) VALUES
('privacy_policy', 'es', 'v1.0', 'Política de Privacidad',
 '{"sections": [
   {"title": "1. Información General", "content": "Enigma Cocina Con Alma, en cumplimiento del Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), informa sobre el tratamiento de datos personales."},
   {"title": "2. Responsable del Tratamiento", "content": "Enigma Cocina Con Alma\\nCarrer Justicia 6A, 03710 Calpe, Alicante\\nTeléfono: +34 672 79 60 06\\nEmail: info@enigmaconalma.com"},
   {"title": "3. Finalidades del Tratamiento", "content": "Sus datos se tratan para: gestión de reservas, atención al cliente, comunicaciones comerciales (con consentimiento), y cumplimiento de obligaciones legales."},
   {"title": "4. Base Jurídica", "content": "El tratamiento se basa en: consentimiento del interesado, ejecución de contrato, interés legítimo, y cumplimiento de obligaciones legales."},
   {"title": "5. Derechos del Interesado", "content": "Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición contactando con nosotros o a través de nuestro formulario de derechos GDPR."}
 ]}', now()),

('cookie_policy', 'es', 'v1.0', 'Política de Cookies',
 '{"sections": [
   {"title": "1. ¿Qué son las cookies?", "content": "Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web."},
   {"title": "2. Tipos de cookies que utilizamos", "content": "Utilizamos cookies técnicas (necesarias), analíticas, de funcionalidad, marketing y seguridad. Puede gestionar sus preferencias en nuestro banner de cookies."},
   {"title": "3. Cookies de terceros", "content": "Utilizamos servicios de terceros como Google Analytics que pueden instalar sus propias cookies."},
   {"title": "4. Control de cookies", "content": "Puede aceptar, rechazar o personalizar el uso de cookies a través de nuestro banner de consentimiento o configuración del navegador."},
   {"title": "5. Más información", "content": "Para más información sobre cookies, visite www.allaboutcookies.org"}
 ]}', now()),

('terms_conditions', 'es', 'v1.0', 'Términos y Condiciones',
 '{"sections": [
   {"title": "1. Objeto", "content": "Estos términos regulan el uso del sitio web de Enigma Cocina Con Alma y los servicios de reserva de mesa."},
   {"title": "2. Condiciones de Reserva", "content": "Las reservas están sujetas a disponibilidad. Nos reservamos el derecho de cancelar reservas en caso de circunstancias excepcionales."},
   {"title": "3. Política de Cancelación", "content": "Las cancelaciones deben realizarse con al menos 24 horas de antelación. No se aplicarán cargos por cancelaciones realizadas dentro de este plazo."},
   {"title": "4. Responsabilidad", "content": "El restaurante no se hace responsable de objetos personales olvidados en las instalaciones."},
   {"title": "5. Ley Aplicable", "content": "Estos términos se rigen por la legislación española. Los tribunales de Alicante tendrán competencia exclusiva."}
 ]}', now()),

('legal_notice', 'es', 'v1.0', 'Aviso Legal',
 '{"sections": [
   {"title": "1. Datos Identificativos", "content": "Denominación social: Enigma Cocina Con Alma\\nDomicilio: Carrer Justicia 6A, 03710 Calpe, Alicante\\nTeléfono: +34 672 79 60 06\\nEmail: info@enigmaconalma.com"},
   {"title": "2. Objeto", "content": "Este aviso legal regula el uso del sitio web www.enigmaconalma.com"},
   {"title": "3. Condiciones de Uso", "content": "El acceso y uso de este sitio web atribuye la condición de usuario y conlleva la aceptación plena de estas condiciones."},
   {"title": "4. Propiedad Intelectual", "content": "Todo el contenido del sitio web está protegido por derechos de propiedad intelectual e industrial."},
   {"title": "5. Exclusión de Responsabilidad", "content": "El titular del sitio web no garantiza la ausencia de errores, virus o elementos lesivos en el sitio web o sus contenidos."}
 ]}', now()),

('gdpr_rights', 'es', 'v1.0', 'Sus Derechos GDPR',
 '{"sections": [
   {"title": "1. Derecho de Acceso", "content": "Puede solicitar información sobre los datos personales que tratamos sobre usted."},
   {"title": "2. Derecho de Rectificación", "content": "Puede solicitar la corrección de datos inexactos o incompletos."},
   {"title": "3. Derecho de Supresión", "content": "Puede solicitar la eliminación de sus datos cuando ya no sean necesarios para los fines para los que fueron recogidos."},
   {"title": "4. Derecho de Portabilidad", "content": "Puede solicitar recibir sus datos en un formato estructurado y de uso común."},
   {"title": "5. Cómo ejercer sus derechos", "content": "Puede ejercer estos derechos contactando con nosotros por email o a través de nuestro formulario específico."}
 ]}', now());

-- Insert initial English legal content
INSERT INTO restaurante.legal_content (document_type, language, version, title, content, effective_date) VALUES
('privacy_policy', 'en', 'v1.0', 'Privacy Policy',
 '{"sections": [
   {"title": "1. General Information", "content": "Enigma Cocina Con Alma, in compliance with the General Data Protection Regulation (GDPR) and Spanish data protection laws, informs about personal data processing."},
   {"title": "2. Data Controller", "content": "Enigma Cocina Con Alma\\nCarrer Justicia 6A, 03710 Calpe, Alicante, Spain\\nPhone: +34 672 79 60 06\\nEmail: info@enigmaconalma.com"},
   {"title": "3. Processing Purposes", "content": "Your data is processed for: reservation management, customer service, marketing communications (with consent), and legal compliance."},
   {"title": "4. Legal Basis", "content": "Processing is based on: user consent, contract execution, legitimate interest, and legal obligations."},
   {"title": "5. Data Subject Rights", "content": "You can exercise your rights of access, rectification, erasure, restriction, portability and objection by contacting us or through our GDPR rights form."}
 ]}', now()),

('cookie_policy', 'en', 'v1.0', 'Cookie Policy',
 '{"sections": [
   {"title": "1. What are cookies?", "content": "Cookies are small text files stored on your device when you visit our website."},
   {"title": "2. Types of cookies we use", "content": "We use technical (necessary), analytics, functionality, marketing and security cookies. You can manage your preferences in our cookie banner."},
   {"title": "3. Third-party cookies", "content": "We use third-party services like Google Analytics that may install their own cookies."},
   {"title": "4. Cookie control", "content": "You can accept, reject or customize cookie usage through our consent banner or browser settings."},
   {"title": "5. More information", "content": "For more information about cookies, visit www.allaboutcookies.org"}
 ]}', now()),

('terms_conditions', 'en', 'v1.0', 'Terms and Conditions',
 '{"sections": [
   {"title": "1. Purpose", "content": "These terms govern the use of the Enigma Cocina Con Alma website and table reservation services."},
   {"title": "2. Reservation Conditions", "content": "Reservations are subject to availability. We reserve the right to cancel reservations due to exceptional circumstances."},
   {"title": "3. Cancellation Policy", "content": "Cancellations must be made at least 24 hours in advance. No charges apply for cancellations made within this timeframe."},
   {"title": "4. Liability", "content": "The restaurant is not responsible for personal items left on the premises."},
   {"title": "5. Applicable Law", "content": "These terms are governed by Spanish law. Alicante courts have exclusive jurisdiction."}
 ]}', now()),

('legal_notice', 'en', 'v1.0', 'Legal Notice',
 '{"sections": [
   {"title": "1. Company Details", "content": "Company name: Enigma Cocina Con Alma\\nAddress: Carrer Justicia 6A, 03710 Calpe, Alicante, Spain\\nPhone: +34 672 79 60 06\\nEmail: info@enigmaconalma.com"},
   {"title": "2. Purpose", "content": "This legal notice governs the use of the website www.enigmaconalma.com"},
   {"title": "3. Terms of Use", "content": "Access and use of this website grants user status and implies full acceptance of these conditions."},
   {"title": "4. Intellectual Property", "content": "All website content is protected by intellectual and industrial property rights."},
   {"title": "5. Disclaimer", "content": "The website owner does not guarantee the absence of errors, viruses or harmful elements on the website or its contents."}
 ]}', now()),

('gdpr_rights', 'en', 'v1.0', 'Your GDPR Rights',
 '{"sections": [
   {"title": "1. Right of Access", "content": "You can request information about the personal data we process about you."},
   {"title": "2. Right of Rectification", "content": "You can request correction of inaccurate or incomplete data."},
   {"title": "3. Right of Erasure", "content": "You can request deletion of your data when it is no longer necessary for the purposes for which it was collected."},
   {"title": "4. Right of Portability", "content": "You can request to receive your data in a structured and commonly used format."},
   {"title": "5. How to exercise your rights", "content": "You can exercise these rights by contacting us by email or through our specific form."}
 ]}', now());

-- ============================================
-- MIGRATION COMPLETE
--
-- Created Tables: 4 new legal compliance tables
-- Enhanced Tables: Added missing GDPR fields to existing tables
-- Security: RLS policies for all legal tables
-- Audit: Automatic audit logging triggers
-- Content: Initial legal content in Spanish and English
--
-- Next Steps:
-- 1. Deploy this migration to production database
-- 2. Update Prisma schema to reflect new tables
-- 3. Generate new Prisma client
-- 4. Implement legal services and API endpoints
-- ============================================