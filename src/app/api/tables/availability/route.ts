import { NextRequest, NextResponse } from 'next/server'
import { getAvailableTimeSlots } from '@/lib/business-hours-server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface BusinessHoursConfig {
  totalCapacity: number
  targetOccupancy: number
  slotDuration: number
  bufferMinutes: number
  // Lunch
  lunchEnabled: boolean
  lunchOpenTime: string | null
  lunchCloseTime: string | null
  lunchLastReservationTime: string | null
  // Dinner
  dinnerOpenTime: string
  dinnerCloseTime: string
  dinnerLastReservationTime: string
}

interface SlotAvailability {
  time: string
  available: boolean
  currentPersons: number
  maxPersons: number
  remainingCapacity: number
  utilizationPercent: number
}

interface Turn {
  name: { es: string; en: string; de: string }
  period: string
  start: string
  end: string
  maxPerSlot: number
  totalSlots: number
  slots: SlotAvailability[]
  availableCount: number
  totalCapacity: number
}

interface Service {
  type: 'lunch' | 'dinner'
  name: { es: string; en: string; de: string }
  period: string
  turns: Turn[]
}

/**
 * Get dynamic capacity config from business_hours table
 */
async function getBusinessHoursConfig(dayOfWeek: number): Promise<BusinessHoursConfig> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/business_hours?` +
      `select=total_seating_capacity,target_occupancy_rate,slot_duration_minutes,buffer_minutes,` +
      `lunch_enabled,lunch_open_time,lunch_close_time,lunch_last_reservation_time,` +
      `open_time,close_time,last_reservation_time&` +
      `day_of_week=eq.${dayOfWeek}&` +
      `is_open=eq.true&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        const row = data[0]
        return {
          totalCapacity: row.total_seating_capacity || 63,
          targetOccupancy: row.target_occupancy_rate || 0.80,
          slotDuration: row.slot_duration_minutes || 15,
          bufferMinutes: row.buffer_minutes || 130,
          lunchEnabled: row.lunch_enabled || false,
          lunchOpenTime: row.lunch_open_time,
          lunchCloseTime: row.lunch_close_time,
          lunchLastReservationTime: row.lunch_last_reservation_time,
          dinnerOpenTime: row.open_time || '18:30',
          dinnerCloseTime: row.close_time || '23:00',
          dinnerLastReservationTime: row.last_reservation_time || '22:00'
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Error fetching business hours config, using defaults:', error)
  }

  // Defaults (solo cena)
  return {
    totalCapacity: 63,
    targetOccupancy: 0.80,
    slotDuration: 15,
    bufferMinutes: 130,
    lunchEnabled: false,
    lunchOpenTime: null,
    lunchCloseTime: null,
    lunchLastReservationTime: null,
    dinnerOpenTime: '18:30',
    dinnerCloseTime: '23:00',
    dinnerLastReservationTime: '22:00'
  }
}

/**
 * Divide slots into 2 turns with buffer gap
 * Ensures turns start/end on valid slot boundaries
 */
function divideSlotsIntoTurns(allSlots: string[]): {
  turn1Slots: string[]
  turn2Slots: string[]
} {
  const totalSlots = allSlots.length

  if (totalSlots <= 2) {
    // Muy pocos slots, todo en turn 1
    return {
      turn1Slots: allSlots,
      turn2Slots: []
    }
  }

  // Dividir aproximadamente 50/50 con gap entre turnos
  const turn1Count = Math.floor(totalSlots * 0.5)
  const gapSlots = 1 // 1 slot de gap entre turnos
  const turn2StartIdx = Math.min(turn1Count + gapSlots, totalSlots - 1)

  return {
    turn1Slots: allSlots.slice(0, turn1Count),
    turn2Slots: allSlots.slice(turn2StartIdx)
  }
}

/**
 * Get buffer minutes from business_hours
 */
async function getBufferMinutes(dayOfWeek: number): Promise<number> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/business_hours?select=buffer_minutes&day_of_week=eq.${dayOfWeek}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        return data[0].buffer_minutes || 130
      }
    }
  } catch (error) {
    console.warn('Error fetching buffer_minutes, using default 130:', error)
  }

  return 130
}

/**
 * Get all tables with availability status for admin
 */
async function getTablesWithAvailability(
  date: string,
  time: string | null,
  partySize: number,
  includePrivate: boolean = false
): Promise<any[]> {
  try {
    // Fetch all tables from DB
    const tablesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?select=*&isActive=eq.true&order=number`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (!tablesResponse.ok) return []

    const allTables = await tablesResponse.json()

    // Filter private tables if needed
    const filteredTables = includePrivate
      ? allTables
      : allTables.filter((t: any) => t.is_public !== false)

    // If no time provided, return all tables without availability check
    if (!time) {
      return filteredTables.map((table: any) => ({
        tableId: table.id,
        tableNumber: table.number,
        capacity: table.capacity,
        zone: table.location,
        available: true, // Unknown without time
        status: 'unknown',
        position_x: table.position_x,
        position_y: table.position_y,
        rotation: table.rotation,
        width: table.width,
        height: table.height
      }))
    }

    // Get buffer minutes from DB
    const dayOfWeek = new Date(date).getDay()
    const bufferMinutes = await getBufferMinutes(dayOfWeek)

    // Get all reservations for the day
    const reservationsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?` +
      `select=id,table_ids,tableId,time&` +
      `date=gte.${date}T00:00:00&` +
      `date=lt.${date}T23:59:59&` +
      `status=in.(PENDING,CONFIRMED,SEATED)`,
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

    // Build requested datetime
    const requestDateTime = new Date(`${date}T${time}:00`)

    // Find conflicting table IDs using buffer logic
    const reservedTableIds = new Set<string>()

    existingReservations.forEach((reservation: any) => {
      const resDateTime = new Date(reservation.time)
      const timeDiff = Math.abs(requestDateTime.getTime() - resDateTime.getTime())

      // Check if reservation conflicts with requested time (buffer_minutes window)
      if (timeDiff < (bufferMinutes * 60000)) {
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

    // Transform ALL active tables with availability status
    const tablesWithAvailability = filteredTables.map((table: any) => {
      const isReserved = reservedTableIds.has(table.id)
      const isOccupied = table.currentstatus === 'occupied' || table.currentstatus === 'maintenance'
      const isAvailable = !isReserved && !isOccupied

      return {
        tableId: table.id,
        tableNumber: table.number,
        capacity: table.capacity,
        zone: table.location,
        available: isAvailable,
        status: isReserved ? 'reserved' : (isOccupied ? table.currentstatus : 'available'),
        position_x: table.position_x,
        position_y: table.position_y,
        rotation: table.rotation,
        width: table.width,
        height: table.height
      }
    })

    return tablesWithAvailability
  } catch (error) {
    console.error('Error fetching tables:', error)
    return []
  }
}

/**
 * Check availability for a single slot
 */
async function checkSlotAvailability(
  date: string,
  time: string,
  requestedPartySize: number,
  maxPerSlot: number
): Promise<SlotAvailability> {
  // Query usando solo date (sin time en el WHERE) y filtramos por time como hora
  // Los campos date y time en DB son timestamps, necesitamos comparar correctamente
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/check_slot_capacity`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({
        check_date: date,
        check_time: time
      })
    }
  )

  let currentPersons = 0

  if (response.ok) {
    const result = await response.json()
    currentPersons = result || 0
  } else {
    // Fallback: query directa filtrando por fecha exacta
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]

    const fallbackResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?` +
      `select=partySize,time&` +
      `date=gte.${date}T00:00:00&` +
      `date=lt.${nextDayStr}T00:00:00&` +
      `status=in.(PENDING,CONFIRMED,SEATED)`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (fallbackResponse.ok) {
      const reservations = await fallbackResponse.json()
      // Filtrar por hora exacta
      const filteredReservations = reservations.filter((r: any) => {
        const resTime = new Date(r.time).toISOString().split('T')[1].substring(0, 5)
        return resTime === time
      })
      currentPersons = filteredReservations.reduce((sum: number, r: any) => sum + r.partySize, 0)
    }
  }

  const remainingCapacity = maxPerSlot - currentPersons
  const available = remainingCapacity >= requestedPartySize

  return {
    time,
    available,
    currentPersons,
    maxPersons: maxPerSlot,
    remainingCapacity,
    utilizationPercent: Math.round((currentPersons / maxPerSlot) * 100)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, time, partySize } = body

    // Validación
    if (!date || !partySize || partySize < 1 || partySize > 10) {
      return NextResponse.json({
        success: false,
        error: 'Invalid parameters'
      }, { status: 400 })
    }

    const dayOfWeek = new Date(date).getDay()
    const config = await getBusinessHoursConfig(dayOfWeek)

    console.log(`📊 [DYNAMIC CAPACITY] Day ${dayOfWeek}: Aforo ${config.totalCapacity}, Target ${config.targetOccupancy * 100}%`)
    console.log(`🍽️  [SERVICES] Lunch: ${config.lunchEnabled}, Dinner: true, Slot Duration: ${config.slotDuration}min`)

    const targetCapacity = Math.floor(config.totalCapacity * config.targetOccupancy)
    const services: Service[] = []

    // Obtener slots pre-filtrados con advance booking aplicado (centralizado)
    const validSlots = await getAvailableTimeSlots(date, new Date())

    // ============ SERVICIO ALMUERZO ============
    if (config.lunchEnabled && config.lunchOpenTime && config.lunchLastReservationTime) {
      // INCLUIR TODOS los slots de almuerzo (disponibles Y bloqueados)
      const allLunchSlots = validSlots.filter(s => s.shiftType === 'lunch')
      const allLunchSlotTimes = allLunchSlots.map(s => s.time)

      // Para almuerzo: Turno 1 hasta 14:00, Turno 2 de 14:15 en adelante (sin gap)
      const turn1Count = 5 // 13:00, 13:15, 13:30, 13:45, 14:00

      const turn1SlotTimes = allLunchSlotTimes.slice(0, turn1Count)
      const turn2SlotTimes = allLunchSlotTimes.slice(turn1Count) // El resto: 14:15, 14:30, 14:45, 15:00

      const turn1MaxPerSlot = turn1SlotTimes.length > 0 ? Math.ceil(targetCapacity / turn1SlotTimes.length) : 0
      const turn2MaxPerSlot = turn2SlotTimes.length > 0 ? Math.ceil(targetCapacity / turn2SlotTimes.length) : 0

      // Verificar disponibilidad de capacidad Y preservar estado de anticipación mínima
      const turn1Availability = await Promise.all(
        turn1SlotTimes.map(async (time) => {
          const originalSlot = allLunchSlots.find(s => s.time === time)
          const capacityCheck = await checkSlotAvailability(date, time, partySize, turn1MaxPerSlot)
          return {
            ...capacityCheck,
            available: originalSlot?.available && capacityCheck.available
          }
        })
      )

      const turn2Availability = await Promise.all(
        turn2SlotTimes.map(async (time) => {
          const originalSlot = allLunchSlots.find(s => s.time === time)
          const capacityCheck = await checkSlotAvailability(date, time, partySize, turn2MaxPerSlot)
          return {
            ...capacityCheck,
            available: originalSlot?.available && capacityCheck.available
          }
        })
      )

      const lunchTurns: Turn[] = []

      if (turn1SlotTimes.length > 0) {
        lunchTurns.push({
          name: {
            es: 'Servicio Temprano',
            en: 'Early Service',
            de: 'Früher Service'
          },
          period: `${turn1SlotTimes[0]} - ${turn1SlotTimes[turn1SlotTimes.length - 1]}`,
          start: turn1SlotTimes[0],
          end: turn1SlotTimes[turn1SlotTimes.length - 1],
          maxPerSlot: turn1MaxPerSlot,
          totalSlots: turn1SlotTimes.length,
          slots: turn1Availability,
          availableCount: turn1Availability.filter(s => s.available).length,
          totalCapacity: turn1MaxPerSlot * turn1SlotTimes.length
        })
      }

      if (turn2SlotTimes.length > 0) {
        lunchTurns.push({
          name: {
            es: 'Servicio Tardío',
            en: 'Late Service',
            de: 'Später Service'
          },
          period: `${turn2SlotTimes[0]} - ${turn2SlotTimes[turn2SlotTimes.length - 1]}`,
          start: turn2SlotTimes[0],
          end: turn2SlotTimes[turn2SlotTimes.length - 1],
          maxPerSlot: turn2MaxPerSlot,
          totalSlots: turn2SlotTimes.length,
          slots: turn2Availability,
          availableCount: turn2Availability.filter(s => s.available).length,
          totalCapacity: turn2MaxPerSlot * turn2SlotTimes.length
        })
      }

      services.push({
        type: 'lunch',
        name: {
          es: 'Almuerzo',
          en: 'Lunch',
          de: 'Mittagessen'
        },
        period: `${config.lunchOpenTime} - ${config.lunchCloseTime || config.lunchLastReservationTime}`,
        turns: lunchTurns
      })
    }

    // ============ SERVICIO CENA ============
    // INCLUIR TODOS los slots de cena (disponibles Y bloqueados)
    const allDinnerSlots = validSlots.filter(s => s.shiftType === 'dinner')
    const allDinnerSlotTimes = allDinnerSlots.map(s => s.time)

    // Dividir en 2 turnos FIJOS (no dinámico basado en disponibilidad)
    const { turn1Slots: dinnerTurn1SlotTimes, turn2Slots: dinnerTurn2SlotTimes } = divideSlotsIntoTurns(allDinnerSlotTimes)

    // Calcular capacidad por slot para cada turno
    const dinnerTurn1MaxPerSlot = dinnerTurn1SlotTimes.length > 0 ? Math.ceil(targetCapacity / dinnerTurn1SlotTimes.length) : 0
    const dinnerTurn2MaxPerSlot = dinnerTurn2SlotTimes.length > 0 ? Math.ceil(targetCapacity / dinnerTurn2SlotTimes.length) : 0

    // Verificar disponibilidad de capacidad Y preservar estado de anticipación mínima
    const dinnerTurn1Availability = await Promise.all(
      dinnerTurn1SlotTimes.map(async (time) => {
        const originalSlot = allDinnerSlots.find(s => s.time === time)
        const capacityCheck = await checkSlotAvailability(date, time, partySize, dinnerTurn1MaxPerSlot)
        // Combinar: Solo disponible si AMBOS (anticipación Y capacidad) permiten
        return {
          ...capacityCheck,
          available: originalSlot?.available && capacityCheck.available
        }
      })
    )

    const dinnerTurn2Availability = await Promise.all(
      dinnerTurn2SlotTimes.map(async (time) => {
        const originalSlot = allDinnerSlots.find(s => s.time === time)
        const capacityCheck = await checkSlotAvailability(date, time, partySize, dinnerTurn2MaxPerSlot)
        return {
          ...capacityCheck,
          available: originalSlot?.available && capacityCheck.available
        }
      })
    )

    const dinnerTurns: Turn[] = []

    if (dinnerTurn1SlotTimes.length > 0) {
      dinnerTurns.push({
        name: {
          es: 'Servicio Temprano',
          en: 'Early Service',
          de: 'Früher Service'
        },
        period: `${dinnerTurn1SlotTimes[0]} - ${dinnerTurn1SlotTimes[dinnerTurn1SlotTimes.length - 1]}`,
        start: dinnerTurn1SlotTimes[0],
        end: dinnerTurn1SlotTimes[dinnerTurn1SlotTimes.length - 1],
        maxPerSlot: dinnerTurn1MaxPerSlot,
        totalSlots: dinnerTurn1SlotTimes.length,
        slots: dinnerTurn1Availability,
        availableCount: dinnerTurn1Availability.filter(s => s.available).length,
        totalCapacity: dinnerTurn1MaxPerSlot * dinnerTurn1SlotTimes.length
      })
    }

    if (dinnerTurn2SlotTimes.length > 0) {
      dinnerTurns.push({
        name: {
          es: 'Servicio Tardío',
          en: 'Late Service',
          de: 'Später Service'
        },
        period: `${dinnerTurn2SlotTimes[0]} - ${dinnerTurn2SlotTimes[dinnerTurn2SlotTimes.length - 1]}`,
        start: dinnerTurn2SlotTimes[0],
        end: dinnerTurn2SlotTimes[dinnerTurn2SlotTimes.length - 1],
        maxPerSlot: dinnerTurn2MaxPerSlot,
        totalSlots: dinnerTurn2SlotTimes.length,
        slots: dinnerTurn2Availability,
        availableCount: dinnerTurn2Availability.filter(s => s.available).length,
        totalCapacity: dinnerTurn2MaxPerSlot * dinnerTurn2SlotTimes.length
      })
    }

    services.push({
      type: 'dinner',
      name: {
        es: 'Cena',
        en: 'Dinner',
        de: 'Abendessen'
      },
      period: `${config.dinnerOpenTime} - ${config.dinnerCloseTime}`,
      turns: dinnerTurns
    })

    // ✅ ADMIN SUPPORT: Get individual tables with availability
    const includePrivate = request.nextUrl.searchParams.get('includePrivate') === 'true'
    const tables = await getTablesWithAvailability(date, time || null, partySize, includePrivate)

    return NextResponse.json({
      success: true,
      data: {
        date,
        partySize,
        capacity: {
          total: config.totalCapacity,
          target: targetCapacity,
          targetOccupancy: `${config.targetOccupancy * 100}%`
        },
        services,
        tables, // ✅ For admin: individual table availability
        summary: {
          requestedDate: date,
          requestedTime: time || 'all-day',
          requestedPartySize: partySize,
          searchDuration: 'N/A'
        },
        availableTables: tables.filter(t => t.available) // ✅ Backwards compatibility
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ [AVAILABILITY API] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
