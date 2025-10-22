/**
 * BUSINESS HOURS MANAGEMENT - SERVER SIDE ONLY
 * 
 * Manages restaurant operating hours with real-time validation
 * SERVER COMPONENTS ONLY - Uses next/headers
 */

import { createServiceClient } from '@/utils/supabase/server'

export interface BusinessHours {
  id: string
  day_of_week: number // 0=Sunday, 1=Monday, etc.
  open_time: string   // HH:MM format (DINNER service)
  close_time: string  // HH:MM format (DINNER service)
  is_open: boolean    // FIXED: Changed from is_closed to is_open (matches DB)
  last_reservation_time: string // Last accepted reservation time (DINNER)
  advance_booking_minutes: number // Minimum advance booking time
  slot_duration_minutes: number   // Duration of each time slot (15min)
  // NEW LUNCH FIELDS
  lunch_enabled?: boolean
  lunch_open_time?: string
  lunch_close_time?: string
  lunch_last_reservation_time?: string
  lunch_advance_booking_minutes?: number
  lunch_max_party_size?: number
  lunch_buffer_minutes?: number
}

export interface TimeSlot {
  time: string
  available: boolean
  reason?: string // Why unavailable
  shiftType?: 'lunch' | 'dinner' // Which service shift
}

/**
 * Fetches business hours from database (SERVER ONLY)
 * Centralized source of truth for operating hours
 */
export async function getBusinessHours(): Promise<BusinessHours[]> {
  try {
    const supabase = await createServiceClient()

    // First try to get from business_hours table
    const { data: businessHours, error } = await supabase
      .from('business_hours')
      .select('*')
      .order('day_of_week')

    if (!error && businessHours && businessHours.length > 0) {
      console.log('✅ Business hours loaded from DB:', businessHours.length, 'days')
      return businessHours
    }

    // Fallback: Parse from restaurants.hours_operation
    console.log('⚠️ No business_hours table found, parsing from restaurants')
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('hours_operation')
      .limit(1)
      .single()

    if (restaurantError || !restaurant?.hours_operation) {
      console.error('❌ No business hours configuration found in DB')
      throw new Error('No business hours configuration found')
    }

    // Parse "Mar-Dom: 18:00 - 23:00" format
    return parseHoursOperation(restaurant.hours_operation)

  } catch (error) {
    console.error('❌ Error fetching business hours:', error)
    console.warn('⚠️ Using fallback business hours - CONNECT TO DATABASE')
    // Conservative fallback
    return getDefaultBusinessHours()
  }
}

/**
 * Parses hours_operation string into BusinessHours array
 * Handles formats like "Mar-Dom: 18:00 - 23:00"
 *
 * ⚠️ PLACEHOLDER: Este método genera horarios desde string, no es dinámico
 */
function parseHoursOperation(hoursOperation: string): BusinessHours[] {
  const businessHours: BusinessHours[] = []

  console.warn('⚠️ Parsing hours_operation string - NOT using business_hours table')

  // Default parsing for "Mar-Dom: 18:00 - 23:00"
  const [dayRange, timeRange] = hoursOperation.split(': ')
  const [openTime, closeTime] = timeRange.split(' - ')

  // Convert to 24h format and calculate last reservation (30min before close)
  const closeHour = parseInt(closeTime.split(':')[0])
  const lastReservationTime = `${(closeHour - 1).toString().padStart(2, '0')}:30`

  // Create entries for all days (0-6) - ALL OPEN by default from string
  for (let day = 0; day <= 6; day++) {
    businessHours.push({
      id: `parsed_${day}`,
      day_of_week: day,
      open_time: openTime,
      close_time: closeTime,
      is_open: true, // All days open when parsing from string
      last_reservation_time: lastReservationTime,
      advance_booking_minutes: 30,
      slot_duration_minutes: 15
    })
  }

  return businessHours
}

/**
 * Default business hours fallback
 * Used when database is unavailable
 *
 * ⚠️ PLACEHOLDER: Shows generic hours - CONNECT TO DATABASE for real schedule
 */
function getDefaultBusinessHours(): BusinessHours[] {
  console.error('⚠️⚠️⚠️ USING FALLBACK BUSINESS HOURS - DATABASE NOT CONNECTED ⚠️⚠️⚠️')
  console.warn('👉 All days showing as OPEN with generic hours - this is NOT real data')

  // PLACEHOLDER: All days open with generic schedule
  return Array.from({ length: 7 }, (_, day) => ({
    id: `fallback_${day}`,
    day_of_week: day,
    open_time: '18:00', // Generic placeholder
    close_time: '23:00', // Generic placeholder
    is_open: true, // All days "open" in fallback to show it's placeholder
    last_reservation_time: '22:45',
    advance_booking_minutes: 30,
    slot_duration_minutes: 15,
    // Mark as placeholder
    lunch_enabled: false
  }))
}

/**
 * Generates available time slots for a specific date (SERVER ONLY)
 * Implements enterprise-grade dual shift availability logic
 *
 * 🔧 PRODUCTION TIMEZONE FIX:
 * - Local development uses Europe/Madrid timezone correctly
 * - Production (Vercel) defaults to UTC, causing past time slots to appear available
 * - Fix: Force Europe/Madrid timezone in date comparisons for production consistency
 */
export async function getAvailableTimeSlots(
  date: string,
  currentDateTime: Date = new Date(),
  skipAdvanceCheck: boolean = false // Admin override for immediate reservations
): Promise<TimeSlot[]> {

  const businessHours = await getBusinessHours()

  // Parse date in local timezone to avoid day shift
  const [year, month, day] = date.split('-').map(Number)
  const selectedDate = new Date(year, month - 1, day)
  const dayOfWeek = selectedDate.getDay()

  const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)

  if (!dayHours || (!dayHours.is_open && !dayHours.lunch_enabled)) {
    return []
  }

  const slots: TimeSlot[] = []

  // LUNCH SHIFT GENERATION (13:00-15:45)
  if (dayHours.lunch_enabled) {
    const lunchSlots = generateTimeSlots({
      openTime: dayHours.lunch_open_time!,
      lastReservationTime: dayHours.lunch_last_reservation_time!,
      slotDuration: dayHours.slot_duration_minutes || 15,
      advanceMinutes: skipAdvanceCheck ? 0 : (dayHours.lunch_advance_booking_minutes || 30),
      shiftType: 'lunch',
      date,
      currentDateTime
    })
    slots.push(...lunchSlots)
  }

  // DINNER SHIFT GENERATION (18:30-22:45) - Only if restaurant is open for dinner
  if (dayHours.is_open) {
    const dinnerSlots = generateTimeSlots({
      openTime: dayHours.open_time,
      lastReservationTime: dayHours.last_reservation_time,
      slotDuration: dayHours.slot_duration_minutes || 15,
      advanceMinutes: skipAdvanceCheck ? 0 : (dayHours.advance_booking_minutes || 30),
      shiftType: 'dinner',
      date,
      currentDateTime
    })
    slots.push(...dinnerSlots)
  }

  return slots.sort((a, b) => a.time.localeCompare(b.time))
}

/**
 * NEW: generateTimeSlots helper with shift awareness
 * Implementation with gap period validation (16:00-18:30 blocked)
 */
function generateTimeSlots(config: {
  openTime: string,
  lastReservationTime: string,
  slotDuration: number,
  advanceMinutes: number,
  shiftType: 'lunch' | 'dinner',
  date: string,
  currentDateTime: Date
}): TimeSlot[] {
  const slots: TimeSlot[] = []
  // 🔧 PRODUCTION FIX: Compare dates using Europe/Madrid timezone
  const madridToday = new Date(config.currentDateTime.toLocaleString("en-US", {timeZone: "Europe/Madrid"})).toISOString().split('T')[0]
  const isToday = config.date === madridToday

  // Parse time strings
  const [openHour, openMinute] = config.openTime.split(':').map(Number)
  const [lastResHour, lastResMinute] = config.lastReservationTime.split(':').map(Number)

  let currentSlotHour = openHour
  let currentSlotMinute = openMinute

  while (
    currentSlotHour < lastResHour ||
    (currentSlotHour === lastResHour && currentSlotMinute <= lastResMinute)
  ) {
    const timeString = `${currentSlotHour.toString().padStart(2, '0')}:${currentSlotMinute.toString().padStart(2, '0')}`

    let available = true
    let reason = ''

    // Gap period validation (16:00-18:30)
    try {
      validateGapPeriod(timeString)
    } catch (error) {
      available = false
      reason = error instanceof Error ? error.message : 'Time not available'
    }

    // Check if slot is in the past (for today only)
    if (isToday && available) {
      // 🔧 PRODUCTION FIX: Use Europe/Madrid timezone dynamically (handles DST automatically)
      const madridCurrentTime = new Date(config.currentDateTime.toLocaleString("en-US", {timeZone: "Europe/Madrid"}))

      // Create slot datetime in Madrid timezone
      const [year, month, day] = config.date.split('-').map(Number)
      const [hour, minute] = timeString.split(':').map(Number)
      const slotDateTime = new Date(year, month - 1, day, hour, minute)

      const minimumBookingTime = new Date(madridCurrentTime.getTime() + (config.advanceMinutes * 60 * 1000))

      if (slotDateTime <= minimumBookingTime) {
        available = false
        reason = `Requires ${config.advanceMinutes} minutes advance booking`
      }
    }

    slots.push({
      time: timeString,
      available,
      reason,
      shiftType: config.shiftType
    })

    // Increment by slot duration (15 minutes)
    currentSlotMinute += config.slotDuration
    if (currentSlotMinute >= 60) {
      currentSlotMinute = 0
      currentSlotHour += 1
    }
  }

  return slots
}

/**
 * GAP PERIOD VALIDATION (16:00-18:30)
 * Restaurant closed between lunch and dinner service
 */
export function validateGapPeriod(time: string): boolean {
  const timeMinutes = timeToMinutes(time)
  const gapStart = timeToMinutes('16:00')
  const gapEnd = timeToMinutes('18:30')

  if (timeMinutes > gapStart && timeMinutes < gapEnd) {
    throw new Error('Restaurant closed between lunch and dinner service')
  }
  return true
}

/**
 * Helper: Convert HH:MM time to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Validates if a specific time slot is bookable (SERVER ONLY)
 * Used for final validation before creating reservation
 */
export async function validateTimeSlot(
  date: string,
  time: string,
  currentDateTime: Date = new Date()
): Promise<{ valid: boolean; reason?: string }> {
  
  const slots = await getAvailableTimeSlots(date, currentDateTime)
  const requestedSlot = slots.find(slot => slot.time === time)
  
  if (!requestedSlot) {
    return {
      valid: false,
      reason: 'Time slot not found in business hours'
    }
  }
  
  if (!requestedSlot.available) {
    return {
      valid: false,
      reason: requestedSlot.reason || 'Time slot not available'
    }
  }
  
  return { valid: true }
}

/**
 * Helper: Check if restaurant is open on specific date (SERVER ONLY)
 * Updated for dual shift support - checks both lunch and dinner availability
 */
export async function isRestaurantOpenOnDate(date: string): Promise<boolean> {
  const businessHours = await getBusinessHours()
  const selectedDate = new Date(date + 'T00:00:00')
  const dayOfWeek = selectedDate.getDay()

  const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)
  if (!dayHours) return false

  // Restaurant is open if either lunch OR dinner service is available
  const hasLunchService = dayHours.lunch_enabled || false
  const hasDinnerService = dayHours.is_open

  return hasLunchService || hasDinnerService
}

/**
 * Check if restaurant is currently open RIGHT NOW (SERVER ONLY)
 * Checks current time against business hours for today
 */
export async function isRestaurantOpenNow(): Promise<boolean> {
  const businessHours = await getBusinessHours()

  // Use Europe/Madrid timezone for accurate time
  const now = new Date()
  const madridTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Madrid"}))
  const dayOfWeek = madridTime.getDay()
  const currentHour = madridTime.getHours()
  const currentMinute = madridTime.getMinutes()
  const currentTimeMinutes = currentHour * 60 + currentMinute

  const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)
  if (!dayHours) return false

  // Check lunch service
  if (dayHours.lunch_enabled && dayHours.lunch_open_time && dayHours.lunch_close_time) {
    const lunchOpenMinutes = timeToMinutes(dayHours.lunch_open_time)
    const lunchCloseMinutes = timeToMinutes(dayHours.lunch_close_time)
    if (currentTimeMinutes >= lunchOpenMinutes && currentTimeMinutes < lunchCloseMinutes) {
      return true
    }
  }

  // Check dinner service
  if (dayHours.is_open && dayHours.open_time && dayHours.close_time) {
    const dinnerOpenMinutes = timeToMinutes(dayHours.open_time)
    const dinnerCloseMinutes = timeToMinutes(dayHours.close_time)
    if (currentTimeMinutes >= dinnerOpenMinutes && currentTimeMinutes < dinnerCloseMinutes) {
      return true
    }
  }

  return false
}