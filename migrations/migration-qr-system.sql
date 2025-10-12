-- ENIGMA QR SYSTEM MIGRATION
-- Siguiendo mejores prácticas OWASP y análisis completo de estructura
-- Ejecutar en esquema restaurante

SET search_path TO restaurante;

-- 1. CREAR TABLA qr_scans (CRÍTICA - NO EXISTE)
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL REFERENCES tables(id),
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_ip INET,
  user_agent TEXT,
  utm_source VARCHAR DEFAULT 'qr',
  utm_medium VARCHAR DEFAULT 'table',
  utm_campaign VARCHAR DEFAULT 'restaurante',
  session_id VARCHAR,
  converted_to_reservation BOOLEAN DEFAULT FALSE,
  reservation_id UUID REFERENCES reservations(id)
);

-- 2. AGREGAR CAMPOS ANALYTICS Y SEGURIDAD A tables
ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS totalScans INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lastScannedAt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qrVersion INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS securityHash VARCHAR(64);

-- 3. CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_qr_scans_table_id ON qr_scans(table_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_converted ON qr_scans(converted_to_reservation);
CREATE INDEX IF NOT EXISTS idx_tables_totalScans ON tables(totalScans);
CREATE INDEX IF NOT EXISTS idx_tables_lastScanned ON tables(lastScannedAt);

-- 4. HABILITAR RLS
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS DE SEGURIDAD OWASP-COMPLIANT
CREATE POLICY "Service role full access" ON qr_scans FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated users can insert" ON qr_scans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service role can read all" ON qr_scans FOR SELECT TO service_role USING (true);

-- 6. GENERAR SECURITY HASHES PARA TABLAS EXISTENTES
UPDATE tables 
SET securityHash = encode(digest(id || qrCode || EXTRACT(EPOCH FROM NOW())::text, 'sha256'), 'hex')
WHERE securityHash IS NULL;

-- 7. VERIFICACIÓN
SELECT 'qr_scans table created' as status;
SELECT COUNT(*) as existing_tables FROM tables;
SELECT COUNT(*) as tables_with_hash FROM tables WHERE securityHash IS NOT NULL;