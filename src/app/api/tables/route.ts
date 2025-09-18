import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Get all tables from the database (including status and metadata)
    const tablesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?select=*&order=number`, 
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (tablesResponse.ok) {
      const tablesData = await tablesResponse.json()
      console.log('📊 Real tables from DB:', tablesData.length, 'total tables (active + inactive)')
      
      return NextResponse.json({
        success: true,
        tables: tablesData,
        count: tablesData.length,
        timestamp: new Date().toISOString()
      })
    } else {
      const errorText = await tablesResponse.text()
      console.error('❌ Tables API Error:', tablesResponse.status, tablesResponse.statusText, errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch tables from database',
          details: errorText
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error fetching tables:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tableData = await request.json()
    
    // Validate required fields
    if (!tableData.number || !tableData.capacity || !tableData.location) {
      return NextResponse.json(
        { success: false, error: 'number, capacity, and location are required' },
        { status: 400 }
      )
    }

    // Validate location
    const validLocations = ['TERRACE_CAMPANARI', 'SALA_PRINCIPAL', 'SALA_VIP', 'TERRACE_JUSTICIA']
    if (!validLocations.includes(tableData.location)) {
      return NextResponse.json(
        { success: false, error: 'Invalid location' },
        { status: 400 }
      )
    }
    
    // CRITICAL: Include required fields for Enigma schema
    const createData = {
      ...tableData,
      restaurantId: 'rest_enigma_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStatus: 'available',
      isActive: tableData.isActive ?? true
    }
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tables`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(createData)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Create table error:', response.status, errorText)
      throw new Error(`Failed to create table: ${response.status}`)
    }

    const newTable = await response.json()
    console.log('✅ Table created:', newTable[0]?.number || 'Unknown')
    
    return NextResponse.json({
      success: true,
      table: newTable[0],
      message: 'Table created successfully'
    })
  } catch (error) {
    console.error('Error creating table:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to create table' },
      { status: 500 }
    )
  }
}