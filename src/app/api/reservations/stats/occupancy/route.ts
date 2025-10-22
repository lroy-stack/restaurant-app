import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseHeaders } from '@/lib/supabase/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 })
    }

    // 1. Get total capacity per day (from business_hours)
    const businessHoursResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/business_hours?select=day_of_week,max_capacity`,
      {
        headers: {
          'Accept': 'application/json',
          // Schema handled by getSupabaseHeaders()
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    const businessHours = await businessHoursResponse.json()
    const capacityByDayOfWeek: Record<number, number> = businessHours.reduce((acc: Record<number, number>, bh: any) => {
      acc[bh.day_of_week] = bh.max_capacity || 100
      return acc
    }, {})

    // 2. Get reservation counts by date
    const query = `${SUPABASE_URL}/rest/v1/rpc/get_occupancy_by_date`
    const response = await fetch(query, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Schema handled by getSupabaseHeaders()
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ start_date: startDate, end_date: endDate })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // 3. Calculate occupancy rate
    const occupancyData = data.map((row: any) => {
      const date = new Date(row.date)
      const dayOfWeek = date.getDay()
      const maxCapacity = capacityByDayOfWeek[dayOfWeek] || 100
      const occupancyRate = Math.round((row.total_party_size / maxCapacity) * 100)

      return {
        date: row.date,
        count: row.reservation_count,
        totalPartySize: row.total_party_size,
        maxCapacity,
        occupancyRate: Math.min(occupancyRate, 100)
      }
    })

    return NextResponse.json({ success: true, occupancyData })
  } catch (error) {
    console.error('Error fetching occupancy stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
