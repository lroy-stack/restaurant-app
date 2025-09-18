import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// PATCH endpoint to update QR codes in database
export async function PATCH(request: NextRequest) {
  try {
    const { tableId, qrCode } = await request.json()
    
    if (!tableId || !qrCode) {
      return NextResponse.json(
        { success: false, error: 'tableId and qrCode are required' },
        { status: 400 }
      )
    }

    // Update QR code in database using REAL Supabase connection
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          qrCode,
          updatedAt: new Date().toISOString()
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ QR update error:', response.status, errorText)
      return NextResponse.json(
        { success: false, error: 'Failed to update QR code in database' },
        { status: 500 }
      )
    }

    const updatedTable = await response.json()
    console.log('✅ QR code updated for table:', tableId)
    
    return NextResponse.json({
      success: true,
      table: updatedTable[0],
      message: 'QR code updated successfully'
    })

  } catch (error) {
    console.error('Error updating QR code:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve QR codes by table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')
    
    let query = `${SUPABASE_URL}/rest/v1/tables?select=id,number,qrCode,isActive`
    
    if (tableId) {
      query += `&id=eq.${tableId}`
    }
    
    const response = await fetch(query, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch QR codes: ${response.status}`)
    }

    const tables = await response.json()
    
    return NextResponse.json({
      success: true,
      tables,
      count: tables.length
    })

  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR codes' },
      { status: 500 }
    )
  }
}