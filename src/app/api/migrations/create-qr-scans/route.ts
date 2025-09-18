import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) {
      throw new Error('Missing credentials')
    }

    const createSql = `
      SET search_path TO restaurante;
      
      CREATE TABLE IF NOT EXISTS qr_scans (
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
      
      CREATE INDEX IF NOT EXISTS idx_qr_scans_table_id ON qr_scans(table_id);
      CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_scans(scanned_at);
      CREATE INDEX IF NOT EXISTS idx_qr_scans_converted ON qr_scans(converted_to_reservation);
      
      ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;
      
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'restaurante' AND tablename = 'qr_scans' AND policyname = 'Service role full access') THEN
          CREATE POLICY "Service role full access" ON qr_scans FOR ALL USING (true);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'restaurante' AND tablename = 'qr_scans' AND policyname = 'Authenticated users can insert') THEN
          CREATE POLICY "Authenticated users can insert" ON qr_scans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'restaurante' AND tablename = 'qr_scans' AND policyname = 'Service role can read all') THEN
          CREATE POLICY "Service role can read all" ON qr_scans FOR SELECT USING (auth.role() = 'service_role');
        END IF;
      END
      $$;
    `

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ sql: createSql })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SQL execution failed: ${errorText}`)
    }

    return NextResponse.json({
      success: true,
      message: 'qr_scans table created successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check if migration is needed
export async function GET(request: NextRequest) {
  try {
    // Check if qr_scans table already exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/qr_scans?limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    const tableExists = checkResponse.ok
    
    return NextResponse.json({
      success: true,
      tableExists,
      migrationNeeded: !tableExists,
      message: tableExists 
        ? 'qr_scans table already exists' 
        : 'qr_scans table needs to be created'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}