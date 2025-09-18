import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableId, sessionId, utmSource, utmMedium, utmCampaign } = body

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: 'tableId is required' },
        { status: 400 }
      )
    }

    // Obtener IP y User-Agent del request
    const forwardedFor = request.headers.get('x-forwarded-for')
    const customerIp = forwardedFor ? forwardedFor.split(',')[0] : 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Verificar que la mesa existe
    const tableCheckResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?select=id,number,totalscans&id=eq.${tableId}`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (!tableCheckResponse.ok) {
      throw new Error('Failed to verify table existence')
    }

    const tableData = await tableCheckResponse.json()
    
    if (tableData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }

    const table = tableData[0]

    // Registrar el escaneo en qr_scans
    const scanData = {
      table_id: tableId,
      customer_ip: customerIp,
      user_agent: userAgent,
      utm_source: utmSource || 'qr',
      utm_medium: utmMedium || 'table',
      utm_campaign: utmCampaign || 'restaurante',
      session_id: sessionId || null,
      converted_to_reservation: false
    }

    const scanResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/qr_scans`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(scanData)
      }
    )

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text()
      console.error('❌ QR scan registration failed:', scanResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: 'Failed to register QR scan' },
        { status: 500 }
      )
    }

    const scanRecord = await scanResponse.json()

    // Actualizar contador totalScans y lastScannedAt en la tabla
    const updateTableResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({
          totalscans: (table.totalscans || 0) + 1,
          lastscannedat: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    )

    if (!updateTableResponse.ok) {
      console.error('⚠️ Warning: Failed to update table scan count')
      // No fallar si no se puede actualizar el contador, el escaneo ya se registró
    }

    return NextResponse.json({
      success: true,
      scan: scanRecord[0],
      message: 'QR scan registered successfully',
      scanId: scanRecord[0]?.id
    })

  } catch (error) {
    console.error('Error registering QR scan:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint para obtener escaneos recientes de una mesa específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: 'tableId is required' },
        { status: 400 }
      )
    }

    // Obtener escaneos recientes de la mesa
    const scansQuery = `${SUPABASE_URL}/rest/v1/qr_scans?table_id=eq.${tableId}&order=scanned_at.desc&limit=${limit}`
    
    const scansResponse = await fetch(scansQuery, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (!scansResponse.ok) {
      throw new Error(`Failed to fetch scans: ${scansResponse.status}`)
    }

    const scans = await scansResponse.json()

    return NextResponse.json({
      success: true,
      scans,
      count: scans.length,
      tableId
    })

  } catch (error) {
    console.error('Error fetching QR scans:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR scans' },
      { status: 500 }
    )
  }
}

// PATCH endpoint para marcar conversión a reserva
export async function PATCH(request: NextRequest) {
  try {
    const { scanId, reservationId } = await request.json()

    if (!scanId) {
      return NextResponse.json(
        { success: false, error: 'scanId is required' },
        { status: 400 }
      )
    }

    // Marcar el escaneo como convertido a reserva
    const updateData: any = {
      converted_to_reservation: true,
      updatedAt: new Date().toISOString()
    }

    if (reservationId) {
      updateData.reservation_id = reservationId
    }

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/qr_scans?id=eq.${scanId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to update scan conversion')
    }

    const updatedScan = await updateResponse.json()

    return NextResponse.json({
      success: true,
      scan: updatedScan[0],
      message: 'Scan conversion registered successfully'
    })

  } catch (error) {
    console.error('Error updating scan conversion:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}