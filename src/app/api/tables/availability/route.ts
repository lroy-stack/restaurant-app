import { NextRequest, NextResponse } from 'next/server'

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
 * Generate time slots between start and end
 */
function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  let currentMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  while (currentMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
    currentMinutes += intervalMinutes
  }

  return slots
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
    const { date, partySize } = body

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

    // ============ SERVICIO ALMUERZO ============
    // Almuerzo dividido en 2 turnos pero mostrados juntos
    if (config.lunchEnabled && config.lunchOpenTime && config.lunchLastReservationTime) {
      const allLunchSlots = generateTimeSlots(
        config.lunchOpenTime,
        config.lunchLastReservationTime,
        config.slotDuration
      )

      // Para almuerzo: Turno 1 hasta 14:00, Turno 2 de 14:15 en adelante (sin gap)
      const turn1Count = 5 // 13:00, 13:15, 13:30, 13:45, 14:00

      const turn1Slots = allLunchSlots.slice(0, turn1Count)
      const turn2Slots = allLunchSlots.slice(turn1Count) // El resto: 14:15, 14:30, 14:45, 15:00

      const turn1MaxPerSlot = turn1Slots.length > 0 ? Math.ceil(targetCapacity / turn1Slots.length) : 0
      const turn2MaxPerSlot = turn2Slots.length > 0 ? Math.ceil(targetCapacity / turn2Slots.length) : 0

      const turn1Availability = await Promise.all(
        turn1Slots.map(time => checkSlotAvailability(date, time, partySize, turn1MaxPerSlot))
      )

      const turn2Availability = await Promise.all(
        turn2Slots.map(time => checkSlotAvailability(date, time, partySize, turn2MaxPerSlot))
      )

      const lunchTurns: Turn[] = []

      if (turn1Slots.length > 0) {
        lunchTurns.push({
          name: {
            es: 'Servicio Temprano',
            en: 'Early Service',
            de: 'Früher Service'
          },
          period: `${turn1Slots[0]} - ${turn1Slots[turn1Slots.length - 1]}`,
          start: turn1Slots[0],
          end: turn1Slots[turn1Slots.length - 1],
          maxPerSlot: turn1MaxPerSlot,
          totalSlots: turn1Slots.length,
          slots: turn1Availability,
          availableCount: turn1Availability.filter(s => s.available).length,
          totalCapacity: turn1MaxPerSlot * turn1Slots.length
        })
      }

      if (turn2Slots.length > 0) {
        lunchTurns.push({
          name: {
            es: 'Servicio Tardío',
            en: 'Late Service',
            de: 'Später Service'
          },
          period: `${turn2Slots[0]} - ${turn2Slots[turn2Slots.length - 1]}`,
          start: turn2Slots[0],
          end: turn2Slots[turn2Slots.length - 1],
          maxPerSlot: turn2MaxPerSlot,
          totalSlots: turn2Slots.length,
          slots: turn2Availability,
          availableCount: turn2Availability.filter(s => s.available).length,
          totalCapacity: turn2MaxPerSlot * turn2Slots.length
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
    // Generar TODOS los slots de la cena
    const allDinnerSlots = generateTimeSlots(
      config.dinnerOpenTime,
      config.dinnerLastReservationTime,
      config.slotDuration
    )

    // Dividir en 2 turnos
    const { turn1Slots: dinnerTurn1Slots, turn2Slots: dinnerTurn2Slots } = divideSlotsIntoTurns(allDinnerSlots)

    // Calcular capacidad por slot para cada turno
    const dinnerTurn1MaxPerSlot = dinnerTurn1Slots.length > 0 ? Math.ceil(targetCapacity / dinnerTurn1Slots.length) : 0
    const dinnerTurn2MaxPerSlot = dinnerTurn2Slots.length > 0 ? Math.ceil(targetCapacity / dinnerTurn2Slots.length) : 0

    // Verificar disponibilidad
    const dinnerTurn1Availability = await Promise.all(
      dinnerTurn1Slots.map(time => checkSlotAvailability(date, time, partySize, dinnerTurn1MaxPerSlot))
    )

    const dinnerTurn2Availability = await Promise.all(
      dinnerTurn2Slots.map(time => checkSlotAvailability(date, time, partySize, dinnerTurn2MaxPerSlot))
    )

    const dinnerTurns: Turn[] = []

    if (dinnerTurn1Slots.length > 0) {
      dinnerTurns.push({
        name: {
          es: 'Servicio Temprano',
          en: 'Early Service',
          de: 'Früher Service'
        },
        period: `${dinnerTurn1Slots[0]} - ${dinnerTurn1Slots[dinnerTurn1Slots.length - 1]}`,
        start: dinnerTurn1Slots[0],
        end: dinnerTurn1Slots[dinnerTurn1Slots.length - 1],
        maxPerSlot: dinnerTurn1MaxPerSlot,
        totalSlots: dinnerTurn1Slots.length,
        slots: dinnerTurn1Availability,
        availableCount: dinnerTurn1Availability.filter(s => s.available).length,
        totalCapacity: dinnerTurn1MaxPerSlot * dinnerTurn1Slots.length
      })
    }

    if (dinnerTurn2Slots.length > 0) {
      dinnerTurns.push({
        name: {
          es: 'Servicio Tardío',
          en: 'Late Service',
          de: 'Später Service'
        },
        period: `${dinnerTurn2Slots[0]} - ${dinnerTurn2Slots[dinnerTurn2Slots.length - 1]}`,
        start: dinnerTurn2Slots[0],
        end: dinnerTurn2Slots[dinnerTurn2Slots.length - 1],
        maxPerSlot: dinnerTurn2MaxPerSlot,
        totalSlots: dinnerTurn2Slots.length,
        slots: dinnerTurn2Availability,
        availableCount: dinnerTurn2Availability.filter(s => s.available).length,
        totalCapacity: dinnerTurn2MaxPerSlot * dinnerTurn2Slots.length
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
        services
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
