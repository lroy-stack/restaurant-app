'use client'

import { useEffect, useState } from 'react'

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
  is_closed: boolean
  last_reservation_time: string
  advance_booking_minutes: number
  slot_duration_minutes: number
}

interface UseBusinessHoursReturn {
  timeSlots: TimeSlot[]
  businessHours: BusinessHours[]
  loading: boolean
  error: string | null
  refetch: (date: string) => Promise<void>
  isRestaurantOpen: (date: string) => boolean
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

    return dayHours ? !dayHours.is_closed : false
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

  return {
    timeSlots,
    businessHours,
    loading,
    error,
    refetch,
    isRestaurantOpen
  }
}