SET search_path TO restaurante;

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

ALTER TABLE qr_scans 
ADD CONSTRAINT IF NOT EXISTS qr_scans_table_id_fkey 
FOREIGN KEY (table_id) REFERENCES tables(id);

ALTER TABLE qr_scans 
ADD CONSTRAINT IF NOT EXISTS qr_scans_reservation_id_fkey 
FOREIGN KEY (reservation_id) REFERENCES reservations(id);

ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS totalScans INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lastScannedAt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qrVersion INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS securityHash VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_qr_scans_table_id ON qr_scans(table_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_converted ON qr_scans(converted_to_reservation);

ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;