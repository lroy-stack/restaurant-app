import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Get dynamic configuration from business_hours table
 */
async function getAvailabilityConfig(): Promise<{ maxPartySize: number; bufferMinutes: number }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/business_hours?select=max_party_size,buffer_minutes&is_open=eq.true&limit=1`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        return {
          maxPartySize: data[0].max_party_size || 10,
          bufferMinutes: data[0].buffer_minutes || 150
        }
      }
    }
  } catch (error) {
    console.warn('Error fetching availability config, using defaults:', error)
  }

  return { maxPartySize: 10, bufferMinutes: 150 }
}

// Create dynamic schema function
function createAvailabilityRequestSchema(maxPartySize: number) {
  return z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    partySize: z.number().int().min(1).max(maxPartySize),
    duration: z.number().int().min(60).max(300).optional().default(150),
    tableZone: z.string().optional(),
  })
}

export async function POST(request: NextRequest) {
  try {
    // Get dynamic configuration
    const config = await getAvailabilityConfig()
    const availabilityRequestSchema = createAvailabilityRequestSchema(config.maxPartySize)

    const body = await request.json()
    const { date, time, partySize, duration, tableZone } = availabilityRequestSchema.parse(body)

    console.log(`🔍 [TABLES_AVAILABILITY] Request:`, { date, time, partySize, duration, tableZone })

    // 1. Get all active tables
    let tablesQuery = `${SUPABASE_URL}/rest/v1/tables?select=*&isActive=eq.true`
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
      throw new Error(`Tables query failed: ${tablesResponse.status}`)
    }

    const activeTables = await tablesResponse.json()
    console.log(`✅ Active tables: ${activeTables.length}`)

    // 2. Check existing reservations for conflicts
    const startDateTime = `${date}T${time}:00`
    const requestDateTime = new Date(startDateTime)

    if (isNaN(requestDateTime.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date or time format'
      }, { status: 400 })
    }

    const reservationsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?select=table_ids,tableId,time&date=gte.${date}T00:00:00&date=lte.${date}T23:59:59&status=in.(PENDING,CONFIRMED,SEATED)`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    const existingReservations = reservationsResponse.ok ? await reservationsResponse.json() : []
    console.log(`📋 Existing reservations: ${existingReservations.length}`)

    // 3. Find conflicting table IDs
    const reservedTableIds = new Set<string>()

    existingReservations.forEach((reservation: any) => {
      const resDateTime = new Date(reservation.time)
      const timeDiff = Math.abs(requestDateTime.getTime() - resDateTime.getTime())

      // Check if reservation conflicts with requested time
      if (timeDiff < (config.bufferMinutes * 60000)) {
        // Add tables from new table_ids array system
        if (reservation.table_ids && Array.isArray(reservation.table_ids)) {
          reservation.table_ids.forEach((tableId: string) => {
            reservedTableIds.add(tableId)
          })
        }

        // Add table from legacy tableId field (backward compatibility)
        if (reservation.tableId) {
          reservedTableIds.add(reservation.tableId)
        }
      }
    })

    console.log(`🛡️ Blocked tables: ${Array.from(reservedTableIds).join(', ')}`)

    // 4. Transform and filter available tables
    const availableTables = activeTables
      .filter((table: any) => !reservedTableIds.has(table.id))
      .map((table: any) => ({
        tableId: table.id,
        tableNumber: table.number,
        zone: table.location,
        capacity: table.capacity,
        available: true,
        status: 'available'
      }))
      .sort((a: any, b: any) => {
        // Natural sorting: T1, T2, ..., T10, T11
        const aNum = parseInt(a.tableNumber.replace(/[^0-9]/g, ''))
        const bNum = parseInt(b.tableNumber.replace(/[^0-9]/g, ''))
        return aNum - bNum
      })

    console.log(`📊 Results: ${availableTables.length} tables available`)

    return NextResponse.json({
      success: true,
      data: {
        tables: availableTables,
        summary: {
          totalTables: availableTables.length,
          availableTables: availableTables.length,
          availabilityRate: availableTables.length > 0 ? 1 : 0,
          requestedDate: date,
          requestedTime: time,
          requestedPartySize: partySize,
          searchDuration: duration
        },
        message: availableTables.length > 0
          ? `${availableTables.length} mesa${availableTables.length !== 1 ? 's' : ''} disponible${availableTables.length !== 1 ? 's' : ''}`
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