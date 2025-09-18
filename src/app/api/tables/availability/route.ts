import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SUPABASE_URL = 'https://supabase.enigmaconalma.com'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const availabilityRequestSchema = z.object({
  date: z.string(),
  time: z.string(),
  partySize: z.number().int().min(1).max(20),
  duration: z.number().int().min(60).max(300).optional().default(150),
  tableZone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, time, partySize, duration, tableZone } = availabilityRequestSchema.parse(body)

    console.log(`🔍 [TABLES_AVAILABILITY] Request:`, { date, time, partySize, duration, tableZone })

    // 1. Get ONLY active tables from database (bypass broken RPC)
    let tablesQuery = `${SUPABASE_URL}/rest/v1/tables?select=*&isActive=eq.true`
    
    // Apply zone filter if specified
    if (tableZone) {
      tablesQuery += `&location=eq.${tableZone}`
    }

    const tablesResponse = await fetch(tablesQuery, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (!tablesResponse.ok) {
      console.error('❌ Tables query failed:', tablesResponse.status)
      throw new Error(`Tables query failed: ${tablesResponse.status}`)
    }

    const activeTables = await tablesResponse.json()
    console.log(`✅ Active tables from DB: ${activeTables.length}`)

    // 2. Check existing reservations for time slot conflicts
    const startDateTime = `${date}T${time}:00`
    const endDateTime = new Date(new Date(startDateTime).getTime() + duration * 60000).toISOString()
    
    console.log(`🕐 Checking availability for: ${startDateTime} - ${endDateTime}`)

    const reservationsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?select=tableId,time&date=gte.${date}T00:00:00&date=lte.${date}T23:59:59&status=in.(PENDING,CONFIRMED,SEATED)`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    const existingReservations = reservationsResponse.ok ? await reservationsResponse.json() : []
    console.log(`📋 Existing reservations: ${existingReservations.length}`)

    // 3. Calculate availability with 150-minute buffer anti-overbooking
    const reservedTableIds = new Set()
    const requestDateTime = new Date(startDateTime)

    existingReservations.forEach((reservation: any) => {
      const resDateTime = new Date(reservation.time)
      const timeDiff = Math.abs(requestDateTime.getTime() - resDateTime.getTime())
      
      // 150 minute buffer (2.5 hours) to prevent overbooking
      if (timeDiff < (150 * 60000)) {
        reservedTableIds.add(reservation.tableId)
      }
    })

    // 4. Transform to expected API format (maintain compatibility)
    const transformedTables = activeTables
      .filter((table: any) => table.capacity >= partySize) // Filter by party size
      .map((table: any) => {
        const isAvailable = !reservedTableIds.has(table.id)
        
        return {
          tableId: table.id,
          tableNumber: table.number,
          zone: table.location,
          capacity: table.capacity,
          available: isAvailable,
          status: isAvailable ? 'available' : 'reserved'
        }
      })

    const availableCount = transformedTables.filter(t => t.available).length
    
    console.log(`📊 Results: ${availableCount}/${transformedTables.length} tables available`)
    
    return NextResponse.json({
      success: true,
      data: {
        tables: transformedTables,
        summary: {
          totalTables: transformedTables.length,
          availableTables: availableCount,
          availabilityRate: transformedTables.length > 0 ? availableCount / transformedTables.length : 0,
          requestedDate: date,
          requestedTime: time,
          requestedPartySize: partySize,
          searchDuration: duration
        },
        message: availableCount > 0 
          ? `${availableCount} mesa${availableCount !== 1 ? 's' : ''} disponible${availableCount !== 1 ? 's' : ''}` 
          : 'No hay mesas disponibles en el horario solicitado'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}