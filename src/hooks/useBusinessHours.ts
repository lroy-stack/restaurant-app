'use client'

import { useEffect, useState, useMemo } from 'react'

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
  shiftType?: 'lunch' | 'dinner' // Which service shift
}

interface BusinessHours {
  id: string
  day_of_week: number // 0=Sunday, 1=Monday, etc.
  open_time: string   // HH:MM format (DINNER service)
  close_time: string  // HH:MM format (DINNER service)
  is_open: boolean    // FIXED: Changed from is_closed to is_open (matches DB)
  last_reservation_time: string // DINNER service
  advance_booking_minutes: number
  slot_duration_minutes: number
  max_party_size: number // NEW: Dynamic max party size
  buffer_minutes: number // NEW: Dynamic buffer between reservations
  // NEW LUNCH FIELDS
  lunch_enabled?: boolean
  lunch_open_time?: string
  lunch_close_time?: string
  lunch_last_reservation_time?: string
  lunch_advance_booking_minutes?: number
  lunch_max_party_size?: number
  lunch_buffer_minutes?: number
  // API ENHANCEMENT FIELDS
  hasLunchService?: boolean
  hasDinnerService?: boolean
  scheduleDisplay?: string
}

interface UseBusinessHoursReturn {
  // Existing properties preserved
  timeSlots: TimeSlot[]
  businessHours: BusinessHours[]
  loading: boolean
  error: string | null
  refetch: (date: string) => Promise<void>
  isRestaurantOpen: (date: string) => boolean
  // New calendar-specific properties
  closedDays: number[]
  minAdvanceMinutes: number
  isDateDisabled: (date: Date) => boolean
  getDisabledReason: (date: Date) => string
  // NEW: Dynamic reservation settings
  maxPartySize: number
  bufferMinutes: number
  // NEW: Dual shift specific properties
  lunchSlots: TimeSlot[]
  dinnerSlots: TimeSlot[]
  hasLunchService: (date: string) => boolean
  hasDinnerService: (date: string) => boolean
  isInGapPeriod: (time: string) => boolean
  getDualScheduleDisplay: (dayOfWeek: number) => string
}

export function useBusinessHours(selectedDate?: string): UseBusinessHoursReturn {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBusinessHours = async () => {
    try {
      setError(null)
      setLoading(true)

      // Get business hours configuration
      const hoursResponse = await fetch('/api/business-hours?action=hours')
      const hoursData = await hoursResponse.json()

      if (hoursData.success && hoursData.data) {
        setBusinessHours(hoursData.data)
      } else {
        setError('Error fetching business hours configuration')
      }
    } catch (err) {
      setError('Network error fetching business hours')
      console.error('Error fetching business hours:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeSlots = async (date: string) => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch(`/api/business-hours?action=slots&date=${date}`)
      const data = await response.json()

      if (data.success && data.data) {
        setTimeSlots(data.data.slots)
      } else {
        setError(data.error || 'Error fetching time slots')
        setTimeSlots([])
      }
    } catch (err) {
      setError('Network error fetching time slots')
      console.error('Error fetching time slots:', err)
      setTimeSlots([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = async (date: string) => {
    await fetchTimeSlots(date)
  }

  const isRestaurantOpen = (date: string): boolean => {
    if (businessHours.length === 0) return false

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)

    return dayHours ? dayHours.is_open : false
  }

  // NEW: Get array of closed days (0=Sunday, 1=Monday, etc.)
  const getClosedDays = (): number[] => {
    if (businessHours.length === 0) return []

    return businessHours
      .filter(h => !h.is_open)  // FIXED: Days where is_open = false are closed
      .map(h => h.day_of_week)
  }

  // NEW: Get minimum advance booking time in minutes
  const getMinAdvanceMinutes = (): number => {
    if (businessHours.length === 0) return 30 // Default fallback

    // Use the advance_booking_minutes from any day (should be consistent)
    const firstValidDay = businessHours.find(h => h.is_open)
    return firstValidDay?.advance_booking_minutes || 30
  }

  // NEW: Get maximum party size (dynamic from business_hours)
  const getMaxPartySize = (): number => {
    if (businessHours.length === 0) return 10 // Default fallback

    // Use the max_party_size from any day (should be consistent across all days)
    const firstValidDay = businessHours.find(h => h.is_open)
    return firstValidDay?.max_party_size || 10
  }

  // NEW: Get buffer minutes between reservations (dynamic from business_hours)
  const getBufferMinutes = (): number => {
    if (businessHours.length === 0) return 150 // Default fallback

    // Use the buffer_minutes from any day (should be consistent across all days)
    const firstValidDay = businessHours.find(h => h.is_open)
    return firstValidDay?.buffer_minutes || 150
  }

  // ENHANCED: Check if a specific date should be disabled (dual shift support)
  const isDateDisabled = (date: Date): boolean => {
    const dayOfWeek = date.getDay()
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)

    if (!dayHours) return true

    // Neither lunch nor dinner service available
    if (!dayHours.lunch_enabled && !dayHours.is_open) return true

    // Check if date is in the past
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfSelectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    // Past dates are always disabled
    if (startOfSelectedDay < startOfToday) {
      return true
    }

    // Same day validation: Check if ANY service still has available time
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      const hasLunchTime = dayHours.lunch_enabled && isTimeAvailable(now, dayHours.lunch_last_reservation_time, dayHours.lunch_advance_booking_minutes)
      const hasDinnerTime = dayHours.is_open && isTimeAvailable(now, dayHours.last_reservation_time, dayHours.advance_booking_minutes)

      return !hasLunchTime && !hasDinnerTime
    }

    return false
  }

  // NEW: Helper function to check if time is still available for booking today
  const isTimeAvailable = (now: Date, lastReservationTime?: string, advanceMinutes = 30): boolean => {
    if (!lastReservationTime) return false

    const [hours, minutes] = lastReservationTime.split(':')
    const lastResTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes))
    const minAdvanceMs = advanceMinutes * 60 * 1000
    const minTimeForReservation = new Date(lastResTime.getTime() - minAdvanceMs)

    return now <= minTimeForReservation
  }

  // ENHANCED: Get reason why a date is disabled (dual shift support)
  const getDisabledReason = (date: Date): string => {
    const dayOfWeek = date.getDay()
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)

    // Check if day has no services
    if (!dayHours || (!dayHours.lunch_enabled && !dayHours.is_open)) {
      const dayNames = {
        0: 'domingos',
        1: 'lunes',
        2: 'martes',
        3: 'miércoles',
        4: 'jueves',
        5: 'viernes',
        6: 'sábados'
      }

      const dayName = dayNames[dayOfWeek as keyof typeof dayNames]
      return `Los ${dayName} permanecemos cerrados. Te invitamos a visitarnos otros días.`
    }

    // Past date check
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfSelectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (startOfSelectedDay < startOfToday) {
      return 'No se pueden seleccionar fechas pasadas'
    }

    // Today-specific reason (dual shift aware)
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      const hasLunchTime = dayHours.lunch_enabled && isTimeAvailable(now, dayHours.lunch_last_reservation_time, dayHours.lunch_advance_booking_minutes)
      const hasDinnerTime = dayHours.is_open && isTimeAvailable(now, dayHours.last_reservation_time, dayHours.advance_booking_minutes)

      if (!hasLunchTime && !hasDinnerTime) {
        const services = []
        if (dayHours.lunch_enabled) services.push(`almuerzo hasta ${dayHours.lunch_last_reservation_time}`)
        if (dayHours.is_open) services.push(`cena hasta ${dayHours.last_reservation_time}`)
        return `Ya no hay tiempo suficiente para reservar hoy. Servicios: ${services.join(', ')}`
      }
    }

    return ''
  }

  // NEW: Get lunch slots from current timeSlots
  const getLunchSlots = (): TimeSlot[] => {
    return timeSlots.filter(slot => slot.shiftType === 'lunch')
  }

  // NEW: Get dinner slots from current timeSlots
  const getDinnerSlots = (): TimeSlot[] => {
    return timeSlots.filter(slot => slot.shiftType === 'dinner')
  }

  // NEW: Check if restaurant has lunch service on specific date
  const hasLunchService = (date: string): boolean => {
    if (businessHours.length === 0) return false

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)

    return dayHours ? (dayHours.lunch_enabled || false) : false
  }

  // NEW: Check if restaurant has dinner service on specific date
  const hasDinnerService = (date: string): boolean => {
    if (businessHours.length === 0) return false

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)

    return dayHours ? dayHours.is_open : false
  }

  // NEW: Check if time is in gap period (16:00-18:30)
  const isInGapPeriod = (time: string): boolean => {
    const timeMinutes = timeToMinutes(time)
    const gapStart = timeToMinutes('16:00')
    const gapEnd = timeToMinutes('18:30')

    return timeMinutes > gapStart && timeMinutes < gapEnd
  }

  // NEW: Helper function to convert HH:MM to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // NEW: Get dual schedule display for specific day
  const getDualScheduleDisplay = (dayOfWeek: number): string => {
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)
    if (!dayHours) return 'Cerrado'

    // Use API-provided scheduleDisplay if available
    if (dayHours.scheduleDisplay) {
      return dayHours.scheduleDisplay
    }

    // Fallback: format locally
    const parts = []
    if (dayHours.lunch_enabled && dayHours.lunch_open_time && dayHours.lunch_close_time) {
      parts.push(`${dayHours.lunch_open_time}-${dayHours.lunch_close_time}`)
    }
    if (dayHours.is_open && dayHours.open_time && dayHours.close_time) {
      parts.push(`${dayHours.open_time}-${dayHours.close_time}`)
    }

    return parts.join(' y ') || 'Cerrado'
  }

  // Fetch business hours configuration on mount
  useEffect(() => {
    fetchBusinessHours()
  }, [])

  // Fetch time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate)
    }
  }, [selectedDate])

  // Memoize dynamic values to prevent infinite re-renders
  const maxPartySize = useMemo(() => getMaxPartySize(), [businessHours])
  const bufferMinutes = useMemo(() => getBufferMinutes(), [businessHours])

  return {
    // Existing properties preserved
    timeSlots,
    businessHours,
    loading,
    error,
    refetch,
    isRestaurantOpen,
    // New calendar-specific properties
    closedDays: getClosedDays(),
    minAdvanceMinutes: getMinAdvanceMinutes(),
    isDateDisabled,
    getDisabledReason,
    // NEW: Dynamic reservation settings from business_hours - MEMOIZED
    maxPartySize,
    bufferMinutes,
    // NEW: Dual shift specific properties
    lunchSlots: getLunchSlots(),
    dinnerSlots: getDinnerSlots(),
    hasLunchService,
    hasDinnerService,
    isInGapPeriod,
    getDualScheduleDisplay
  }
}