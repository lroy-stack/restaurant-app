-- ENIGMA QR SYSTEM - SECURE MIGRATION
-- Following Graphile Migrate and OWASP best practices
-- Idempotent, transaction-safe, production-ready

\echo '🔧 Starting QR System Migration following best practices...'

BEGIN;

-- Set local search path (best practice: don't pollute global settings)
SET LOCAL search_path TO restaurante, public;

\echo '📊 Creating qr_scans table with idempotent checks...'

-- 1. CREATE qr_scans TABLE (idempotent with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_ip INET,
  user_agent TEXT,
  utm_source VARCHAR DEFAULT 'qr',
  utm_medium VARCHAR DEFAULT 'table',
  utm_campaign VARCHAR DEFAULT 'restaurante',
  session_id VARCHAR,
  converted_to_reservation BOOLEAN DEFAULT FALSE,
  reservation_id UUID
);

\echo '🔗 Adding foreign key constraints safely...'

-- Add foreign key constraints separately (safer approach)
DO $$
BEGIN
    -- Check if FK constraint exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'qr_scans_table_id_fkey'
        AND table_name = 'qr_scans'
        AND table_schema = 'restaurante'
    ) THEN
        ALTER TABLE qr_scans 
        ADD CONSTRAINT qr_scans_table_id_fkey 
        FOREIGN KEY (table_id) REFERENCES tables(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'qr_scans_reservation_id_fkey'
        AND table_name = 'qr_scans' 
        AND table_schema = 'restaurante'
    ) THEN
        ALTER TABLE qr_scans 
        ADD CONSTRAINT qr_scans_reservation_id_fkey 
        FOREIGN KEY (reservation_id) REFERENCES reservations(id);
    END IF;
END$$;

\echo '📈 Adding analytics fields to tables...'

-- 2. ADD ANALYTICS FIELDS TO tables (idempotent)
DO $$
BEGIN
    -- Add totalScans column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tables' 
        AND column_name = 'totalScans'
        AND table_schema = 'restaurante'
    ) THEN
        ALTER TABLE tables ADD COLUMN totalScans INTEGER DEFAULT 0;
    END IF;

    -- Add lastScannedAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tables' 
        AND column_name = 'lastScannedAt'
        AND table_schema = 'restaurante'
    ) THEN
        ALTER TABLE tables ADD COLUMN lastScannedAt TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add qrVersion column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tables' 
        AND column_name = 'qrVersion'
        AND table_schema = 'restaurante'
    ) THEN
        ALTER TABLE tables ADD COLUMN qrVersion INTEGER DEFAULT 1;
    END IF;

    -- Add securityHash column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tables' 
        AND column_name = 'securityHash'
        AND table_schema = 'restaurante'
    ) THEN
        ALTER TABLE tables ADD COLUMN securityHash VARCHAR(64);
    END IF;
END$$;

\echo '⚡ Creating performance indexes...'

-- 3. CREATE INDEXES (idempotent)
CREATE INDEX IF NOT EXISTS idx_qr_scans_table_id ON qr_scans(table_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_converted ON qr_scans(converted_to_reservation);
CREATE INDEX IF NOT EXISTS idx_qr_scans_session ON qr_scans(session_id);
CREATE INDEX IF NOT EXISTS idx_tables_totalScans ON tables(totalScans);
CREATE INDEX IF NOT EXISTS idx_tables_lastScanned ON tables(lastScannedAt);
CREATE INDEX IF NOT EXISTS idx_tables_security_hash ON tables(securityHash);

\echo '🔐 Enabling Row Level Security...'

-- 4. ENABLE RLS
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

\echo '🛡️ Creating OWASP-compliant security policies...'

-- 5. CREATE RLS POLICIES (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Service role full access" ON qr_scans;
DROP POLICY IF EXISTS "Authenticated users can insert" ON qr_scans;
DROP POLICY IF EXISTS "Service role can read all" ON qr_scans;

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access" 
ON qr_scans FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Authenticated users can only insert (for QR scanning)
CREATE POLICY "Authenticated users can insert" 
ON qr_scans FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Only service role can read (for analytics/admin)
CREATE POLICY "Service role can read all" 
ON qr_scans FOR SELECT 
TO service_role 
USING (true);

\echo '🔒 Generating security hashes...'

-- 6. GENERATE SECURITY HASHES for existing tables
UPDATE tables 
SET securityHash = encode(
    digest(
        id || qrCode || EXTRACT(EPOCH FROM NOW())::text, 
        'sha256'
    ), 
    'hex'
)
WHERE securityHash IS NULL;

\echo '✅ Verifying migration results...'

-- 7. VERIFICATION QUERIES
SELECT 
    'qr_scans' as table_name,
    COUNT(*) as initial_records
FROM qr_scans;

SELECT 
    'tables' as table_name,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN securityHash IS NOT NULL THEN 1 END) as tables_with_hash,
    COUNT(CASE WHEN totalScans >= 0 THEN 1 END) as tables_with_analytics
FROM tables;

-- Commit the transaction
COMMIT;

\echo '🎉 QR System Migration completed successfully!'
\echo '📋 Summary:'
\echo '  ✓ qr_scans table created with proper constraints'
\echo '  ✓ Analytics fields added to tables'
\echo '  ✓ Performance indexes created'
\echo '  ✓ RLS policies configured (OWASP-compliant)'
\echo '  ✓ Security hashes generated'