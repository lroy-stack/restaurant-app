import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { totalCapacity, targetOccupancy } = await request.json()

    // Actualizar todos los días
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/business_hours`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          total_seating_capacity: totalCapacity,
          target_occupancy_rate: targetOccupancy
        })
      }
    )

    if (response.ok) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 500 })

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
