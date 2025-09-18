/**
 * BUSINESS HOURS MANAGEMENT - CLIENT SIDE
 * 
 * Client-side wrapper for business hours functionality
 * Makes API calls instead of direct database access
 */

export interface TimeSlot {
  time: string
  available: boolean
  reason?: string // Why unavailable
}

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

/**
 * Fetches business hours from API (CLIENT SIDE)
 */
export async function getBusinessHours(): Promise<BusinessHours[]> {
  try {
    const response = await fetch('/api/business-hours?action=hours', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Always get fresh data
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch business hours')
    }

    return result.data
  } catch (error) {
    console.error('❌ [CLIENT] Error fetching business hours:', error)
    // Return conservative fallback
    return getDefaultBusinessHours()
  }
}

/**
 * Generates available time slots for a specific date (CLIENT SIDE)
 */
export async function getAvailableTimeSlots(
  date: string,
  currentDateTime: Date = new Date()
): Promise<TimeSlot[]> {
  
  try {
    const params = new URLSearchParams({
      action: 'slots',
      date,
      currentDateTime: currentDateTime.toISOString()
    })

    const response = await fetch(`/api/business-hours?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Always get fresh availability
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch time slots')
    }

    console.log(`🕐 [CLIENT] Available slots for ${date}:`, {
      totalSlots: result.data.totalSlots,
      availableSlots: result.data.availableSlots,
      slots: result.data.slots.map((s: TimeSlot) => s.time).filter((s: string) => s)
    })

    return result.data.slots
    
  } catch (error) {
    console.error('❌ [CLIENT] Error fetching time slots:', error)
    
    // Enterprise fallback: Same logic as server but client-side
    const selectedDate = new Date(date + 'T00:00:00')
    const dayOfWeek = selectedDate.getDay()
    const isToday = date === currentDateTime.toISOString().split('T')[0]
    
    // Conservative fallback: Restaurant industry standard
    if (dayOfWeek === 0) { // Sunday closed
      return [{
        time: '',
        available: false,
        reason: 'Restaurant closed on Sundays'
      }]
    }
    
    // Generate emergency slots with current time validation
    const emergencySlots = ['18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', 
                           '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', 
                           '22:00', '22:15', '22:30', '22:45']
    
    if (isToday) {
      const currentHour = currentDateTime.getHours()
      const currentMinute = currentDateTime.getMinutes()
      const currentTotalMinutes = currentHour * 60 + currentMinute + 30 // 30min buffer
      
      return emergencySlots.map(slot => {
        const [hour, minute] = slot.split(':').map(Number)
        const slotTotalMinutes = hour * 60 + minute
        
        return {
          time: slot,
          available: slotTotalMinutes > currentTotalMinutes,
          reason: slotTotalMinutes <= currentTotalMinutes ? 'Requires 30 minutes advance booking' : undefined
        }
      })
    }
    
    // Future dates: All slots available
    return emergencySlots.map(slot => ({
      time: slot,
      available: true
    }))
  }
}

/**
 * Validates if a specific time slot is bookable (CLIENT SIDE)
 */
export async function validateTimeSlot(
  date: string,
  time: string,
  currentDateTime: Date = new Date()
): Promise<{ valid: boolean; reason?: string }> {
  
  try {
    const params = new URLSearchParams({
      action: 'validate',
      date,
      time,
      currentDateTime: currentDateTime.toISOString()
    })

    const response = await fetch(`/api/business-hours?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to validate time slot')
    }

    return {
      valid: result.data.valid,
      reason: result.data.reason
    }
    
  } catch (error) {
    console.error('❌ [CLIENT] Error validating time slot:', error)
    
    // Conservative fallback: Basic validation
    const selectedDate = new Date(date + 'T00:00:00')
    const dayOfWeek = selectedDate.getDay()
    
    if (dayOfWeek === 0) {
      return {
        valid: false,
        reason: 'Restaurant closed on Sundays'
      }
    }
    
    return { valid: true }
  }
}

/**
 * Helper: Check if restaurant is open on specific date (CLIENT SIDE)
 */
export async function isRestaurantOpenOnDate(date: string): Promise<boolean> {
  try {
    const businessHours = await getBusinessHours()
    const selectedDate = new Date(date + 'T00:00:00')
    const dayOfWeek = selectedDate.getDay()
    
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)
    return dayHours ? !dayHours.is_closed : false
  } catch (error) {
    console.error('❌ [CLIENT] Error checking if open:', error)
    // Conservative: Assume closed on Sunday
    const selectedDate = new Date(date + 'T00:00:00')
    return selectedDate.getDay() !== 0
  }
}

/**
 * Default business hours fallback (CLIENT SIDE)
 */
function getDefaultBusinessHours(): BusinessHours[] {
  console.log('⚠️ [CLIENT] Using default business hours fallback')
  
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