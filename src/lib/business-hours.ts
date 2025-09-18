/**
 * BUSINESS HOURS MANAGEMENT - ENTERPRISE GRADE
 * 
 * Manages restaurant operating hours with real-time validation
 * Follows industry best practices for reservation systems
 */

import { createServiceClient } from '@/utils/supabase/server'

export interface BusinessHours {
  id: string
  day_of_week: number // 0=Sunday, 1=Monday, etc.
  open_time: string   // HH:MM format
  close_time: string  // HH:MM format
  is_closed: boolean
  last_reservation_time: string // Last accepted reservation time
  advance_booking_minutes: number // Minimum advance booking time
  slot_duration_minutes: number   // Duration of each time slot (15min)
}

export interface TimeSlot {
  time: string
  available: boolean
  reason?: string // Why unavailable
}

/**
 * Fetches business hours from database
 * Centralized source of truth for operating hours
 */
export async function getBusinessHours(): Promise<BusinessHours[]> {
  try {
    const supabase = await createServiceClient()
    
    // First try to get from business_hours table
    const { data: businessHours, error } = await supabase
      .schema('restaurante')
      .from('business_hours')
      .select('*')
      .order('day_of_week')
    
    if (!error && businessHours && businessHours.length > 0) {
      return businessHours
    }
    
    // Fallback: Parse from restaurants.hours_operation
    console.log('📊 No business_hours table found, parsing from restaurants')
    const { data: restaurant, error: restaurantError } = await supabase
      .schema('restaurante')
      .from('restaurants')
      .select('hours_operation')
      .limit(1)
      .single()
    
    if (restaurantError || !restaurant?.hours_operation) {
      throw new Error('No business hours configuration found')
    }
    
    // Parse "Mar-Dom: 18:00 - 23:00" format
    return parseHoursOperation(restaurant.hours_operation)
    
  } catch (error) {
    console.error('❌ Error fetching business hours:', error)
    // Conservative fallback
    return getDefaultBusinessHours()
  }
}

/**
 * Parses hours_operation string into BusinessHours array
 * Handles formats like "Mar-Dom: 18:00 - 23:00"
 */
function parseHoursOperation(hoursOperation: string): BusinessHours[] {
  const businessHours: BusinessHours[] = []
  
  // Default parsing for "Mar-Dom: 18:00 - 23:00"
  const [dayRange, timeRange] = hoursOperation.split(': ')
  const [openTime, closeTime] = timeRange.split(' - ')
  
  // Convert to 24h format and calculate last reservation (30min before close)
  const closeHour = parseInt(closeTime.split(':')[0])
  const lastReservationTime = `${(closeHour - 1).toString().padStart(2, '0')}:30`
  
  // Create entries for Monday(1) through Saturday(6)
  // Sunday(0) is closed based on "Lun-Sáb" (Mon-Sat)
  for (let day = 0; day <= 6; day++) {
    businessHours.push({
      id: `default_${day}`,
      day_of_week: day,
      open_time: day === 0 ? '00:00' : openTime, // Sunday closed
      close_time: day === 0 ? '00:00' : closeTime,
      is_closed: day === 0, // Sunday closed
      last_reservation_time: day === 0 ? '00:00' : lastReservationTime,
      advance_booking_minutes: 30,
      slot_duration_minutes: 15
    })
  }
  
  return businessHours
}

/**
 * Default business hours fallback
 * Used when database is unavailable
 */
function getDefaultBusinessHours(): BusinessHours[] {
  console.log('⚠️ Using default business hours fallback')
  
  return Array.from({ length: 7 }, (_, day) => ({
    id: `fallback_${day}`,
    day_of_week: day,
    open_time: day === 0 ? '00:00' : '18:00', // Sunday closed
    close_time: day === 0 ? '00:00' : '23:00',
    is_closed: day === 0,
    last_reservation_time: day === 0 ? '00:00' : '22:45', // 15min slots: last at 22:45
    advance_booking_minutes: 30,
    slot_duration_minutes: 15
  }))
}

/**
 * Generates available time slots for a specific date
 * Implements enterprise-grade availability logic
 */
export async function getAvailableTimeSlots(
  date: string,
  currentDateTime: Date = new Date()
): Promise<TimeSlot[]> {
  
  const businessHours = await getBusinessHours()
  const selectedDate = new Date(date + 'T00:00:00')
  const dayOfWeek = selectedDate.getDay()
  
  // Get business hours for selected day
  const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)
  
  if (!dayHours || dayHours.is_closed) {
    return [{
      time: '',
      available: false,
      reason: 'Restaurant closed on this day'
    }]
  }
  
  const slots: TimeSlot[] = []
  const isToday = date === currentDateTime.toISOString().split('T')[0]
  
  // Parse business hours
  const [openHour, openMinute] = dayHours.open_time.split(':').map(Number)
  const [lastResHour, lastResMinute] = dayHours.last_reservation_time.split(':').map(Number)
  
  // Generate 15-minute slots (from database configuration)
  const slotDuration = dayHours.slot_duration_minutes || 15
  let currentSlotHour = openHour
  let currentSlotMinute = openMinute
  
  while (
    currentSlotHour < lastResHour || 
    (currentSlotHour === lastResHour && currentSlotMinute <= lastResMinute)
  ) {
    const timeString = `${currentSlotHour.toString().padStart(2, '0')}:${currentSlotMinute.toString().padStart(2, '0')}`
    
    let available = true
    let reason = ''
    
    // Check if slot is in the past (for today only)
    if (isToday) {
      const slotDateTime = new Date(date + `T${timeString}:00`)
      const minimumBookingTime = new Date(currentDateTime.getTime() + (dayHours.advance_booking_minutes * 60 * 1000))
      
      if (slotDateTime <= minimumBookingTime) {
        available = false
        reason = `Requires ${dayHours.advance_booking_minutes} minutes advance booking`
      }
    }
    
    slots.push({
      time: timeString,
      available,
      reason
    })
    
    // Increment by slot duration (15 minutes)
    currentSlotMinute += slotDuration
    if (currentSlotMinute >= 60) {
      currentSlotMinute = 0
      currentSlotHour += 1
    }
  }
  
  return slots
}

/**
 * Validates if a specific time slot is bookable
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
 * Helper: Check if restaurant is open on specific date
 */
export async function isRestaurantOpenOnDate(date: string): Promise<boolean> {
  const businessHours = await getBusinessHours()
  const selectedDate = new Date(date + 'T00:00:00')
  const dayOfWeek = selectedDate.getDay()
  
  const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)
  return dayHours ? !dayHours.is_closed : false
}