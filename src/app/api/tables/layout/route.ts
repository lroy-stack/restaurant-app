import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// CURRENT SYSTEM: React Grid Layout format
interface GridLayoutItem {
  i: string    // table id
  x: number    // grid x position  
  y: number    // grid y position
  w: number    // grid width
  h: number    // grid height
}

interface LayoutData {
  layouts: {
    lg?: GridLayoutItem[]
    md?: GridLayoutItem[]
    sm?: GridLayoutItem[]
    xs?: GridLayoutItem[]
    xxs?: GridLayoutItem[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LayoutData = await request.json()
    const { layouts } = body

    if (!layouts || typeof layouts !== 'object') {
      return NextResponse.json(
        { success: false, error: 'layouts object is required' },
        { status: 400 }
      )
    }

    // For now, just store in a simple way since DB doesn't have position fields yet
    console.log(`💾 Storing layout data for React Grid Layout...`)
    
    // We could store this in localStorage or a future layouts table
    // For now, just return success since the component already saves to localStorage
    
    const lgLayout = layouts.lg || []
    console.log(`📋 Layout received for ${lgLayout.length} tables`)
    lgLayout.forEach(item => {
      console.log(`📍 Table ${item.i}: grid(${item.x},${item.y}) size(${item.w}x${item.h})`)
    })

    // TODO: Future enhancement - store in database table_layouts table
    // For now, rely on localStorage which already works
    
    return NextResponse.json({
      success: true,
      message: `Layout format validated for ${lgLayout.length} tables`,
      stored: 'localStorage', // Currently using localStorage
      timestamp: new Date().toISOString(),
      note: 'Grid layout stored locally - future enhancement will persist to database'
    })

  } catch (error) {
    console.error('❌ Error processing table layout:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process table layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve current layout (optional, for debugging)
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?select=id,number,location,xPosition,yPosition&order=number`,
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

    if (!response.ok) {
      throw new Error(`Failed to fetch layout: ${response.status}`)
    }

    const tables = await response.json()
    
    return NextResponse.json({
      success: true,
      layout: tables.map((table: any) => ({
        id: table.id,
        number: table.number,
        location: table.location,
        x: table.xPosition || 0,
        y: table.yPosition || 0
      }))
    })

  } catch (error) {
    console.error('❌ Error fetching table layout:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch table layout' },
      { status: 500 }
    )
  }
}