-- PLANAZO.md - CREAR: Tracking de escaneos QR
-- Ejecutar en esquema restaurante

SET search_path TO restaurante;

CREATE TABLE qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id VARCHAR NOT NULL REFERENCES tables(id),
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

-- ÍNDICES para performance
CREATE INDEX idx_qr_scans_table_id ON qr_scans(table_id);
CREATE INDEX idx_qr_scans_date ON qr_scans(scanned_at);
CREATE INDEX idx_qr_scans_converted ON qr_scans(converted_to_reservation);

-- RLS siguiendo patrón del proyecto
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- Service role acceso completo
CREATE POLICY "Service role full access" ON qr_scans FOR ALL USING (true);

-- Usuarios autenticados pueden insertar scans
CREATE POLICY "Authenticated users can insert" ON qr_scans FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Solo service role puede leer (analytics admin)
CREATE POLICY "Service role can read all" ON qr_scans FOR SELECT USING (auth.role() = 'service_role');