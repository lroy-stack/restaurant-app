import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
})

export async function GET() {
  try {
    // Get tables with their current status
    const { data: tables, error } = await supabase
      .from('tables')
      .select('location, currentstatus')
      .eq('isActive', true)

    if (error) throw error

    // Count tables by location and status
    const occupancyMap: Record<string, { available: number; occupied: number; reserved: number }> = {}

    tables?.forEach((table) => {
      const location = table.location
      if (!occupancyMap[location]) {
        occupancyMap[location] = { available: 0, occupied: 0, reserved: 0 }
      }

      const status = table.currentstatus?.toLowerCase() || 'available'
      if (status === 'occupied') {
        occupancyMap[location].occupied++
      } else if (status === 'reserved') {
        occupancyMap[location].reserved++
      } else {
        occupancyMap[location].available++
      }
    })

    // Format for chart
    const data = Object.entries(occupancyMap).map(([location, counts]) => ({
      zone: formatLocation(location),
      ...counts
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching table occupancy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch table occupancy' },
      { status: 500 }
    )
  }
}

function formatLocation(location: string): string {
  const mapping: Record<string, string> = {
    'TERRACE_1': 'Terraza 1',
    'MAIN_ROOM': 'Sala Principal',
    'VIP_ROOM': 'Sala VIP',
    'TERRACE_2': 'Terraza 2'
  }
  return mapping[location] || location
}
