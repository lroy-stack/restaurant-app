'use client'

import { useEffect, useState, useMemo } from 'react'

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

interface BusinessHours {
  id: string
  day_of_week: number // 0=Sunday, 1=Monday, etc.
  open_time: string   // HH:MM format
  close_time: string  // HH:MM format
  is_open: boolean    // FIXED: Changed from is_closed to is_open (matches DB)
  last_reservation_time: string
  advance_booking_minutes: number
  slot_duration_minutes: number
  max_party_size: number // NEW: Dynamic max party size
  buffer_minutes: number // NEW: Dynamic buffer between reservations
}

interface UseBusinessHoursReturn {
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

  // NEW: Check if a specific date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    const dayOfWeek = date.getDay()
    const closedDays = getClosedDays()

    // Check if day is closed
    if (closedDays.includes(dayOfWeek)) {
      return true
    }

    // Check if date is in the past
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfSelectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    // Past dates are always disabled
    if (startOfSelectedDay < startOfToday) {
      return true
    }

    // 🚀 CRITICAL FIX: For today, check if restaurant still has available hours
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      // Get business hours for today
      const todayHours = businessHours.find(h => h.day_of_week === dayOfWeek && h.is_open)
      if (!todayHours || !todayHours.last_reservation_time) {
        return true // No hours configured or no last reservation time
      }

      // Create today's last reservation time
      const [hours, minutes] = todayHours.last_reservation_time.split(':')
      const lastReservationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes))

      // Check if we still have time to make reservations today
      const minAdvanceMs = getMinAdvanceMinutes() * 60 * 1000
      const minTimeForReservation = new Date(lastReservationTime.getTime() - minAdvanceMs)

      // If current time is past the minimum time needed for the last possible reservation, disable the day
      return now > minTimeForReservation
    }

    return false
  }

  // NEW: Get reason why a date is disabled
  const getDisabledReason = (date: Date): string => {
    const dayOfWeek = date.getDay()
    const closedDays = getClosedDays()

    // Check if day is closed
    if (closedDays.includes(dayOfWeek)) {
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

    // 🚀 CRITICAL FIX: Today-specific reason
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      const todayHours = businessHours.find(h => h.day_of_week === dayOfWeek && h.is_open)
      if (!todayHours || !todayHours.last_reservation_time) {
        return 'Sin horarios disponibles para hoy'
      }

      const [hours, minutes] = todayHours.last_reservation_time.split(':')
      const lastReservationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes))
      const minAdvanceMs = getMinAdvanceMinutes() * 60 * 1000
      const minTimeForReservation = new Date(lastReservationTime.getTime() - minAdvanceMs)

      if (now > minTimeForReservation) {
        return `Ya no hay tiempo suficiente para reservar hoy. Última reserva: ${todayHours.last_reservation_time}`
      }
    }

    return ''
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
    bufferMinutes
  }
}