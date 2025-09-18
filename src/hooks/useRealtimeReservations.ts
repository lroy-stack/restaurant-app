'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  specialRequests?: string
  hasPreOrder: boolean
  tableId: string
  tables: {
    id: string
    number: string
    capacity: number
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  } | null
  createdAt: string
  updatedAt: string
}

interface ReservationSummary {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  totalGuests: number
}

interface UseRealtimeReservationsReturn {
  reservations: Reservation[]
  summary: ReservationSummary
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateReservationStatus: (id: string, status: string, additionalData?: any) => Promise<boolean>
  updateReservation: (id: string, data: any) => Promise<boolean>
  sendReminder: (id: string) => Promise<boolean>
}

interface RealtimeFilters {
  status?: string
  date?: string
  search?: string
}

export function useRealtimeReservations(filters: RealtimeFilters = {}): UseRealtimeReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [summary, setSummary] = useState<ReservationSummary>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalGuests: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // supabase client imported from lib
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastFetchRef = useRef<number>(0)

  // Throttle API calls to prevent excessive requests
  const throttledFetch = async () => {
    const now = Date.now()
    if (now - lastFetchRef.current < 1000) return // 1 second throttle
    lastFetchRef.current = now
    await fetchReservations()
  }

  const fetchReservations = async () => {
    try {
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.date) {
        params.append('date', filters.date)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }

      const response = await fetch(`/api/reservations?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setReservations(data.reservations)
        setSummary(data.summary)
      } else {
        setError(data.error || 'Error fetching reservations')
      }
    } catch (err) {
      setError('Network error fetching reservations')
      console.error('Error fetching reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (
    id: string,
    status: string,
    additionalData?: any
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/reservations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: id, status, ...additionalData })
      })

      if (response.ok) {
        // Optimistic update
        setReservations(prev =>
          prev.map(reservation =>
            reservation.id === id
              ? { ...reservation, status: status as any, ...additionalData }
              : reservation
          )
        )

        // Update summary
        updateSummaryAfterStatusChange(status)
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error updating reservation')
        return false
      }
    } catch (err) {
      setError('Network error updating reservation')
      console.error('Error updating reservation:', err)
      return false
    }
  }

  const updateReservation = async (id: string, data: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/reservations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: id, ...data })
      })

      if (response.ok) {
        // Optimistic update
        setReservations(prev =>
          prev.map(reservation =>
            reservation.id === id
              ? { ...reservation, ...data, updatedAt: new Date().toISOString() }
              : reservation
          )
        )

        // Refetch to ensure data consistency
        await fetchReservations()
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error updating reservation')
        return false
      }
    } catch (err) {
      setError('Network error updating reservation')
      console.error('Error updating reservation:', err)
      return false
    }
  }

  const sendReminder = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/reservations/${id}/reminder`, {
        method: 'POST'
      })

      if (response.ok) {
        // Optionally update the reservation with reminder sent timestamp
        setReservations(prev => 
          prev.map(reservation => 
            reservation.id === id 
              ? { ...reservation, reminderSentAt: new Date().toISOString() }
              : reservation
          )
        )
        return true
      } else {
        setError('Error sending reminder')
        return false
      }
    } catch (err) {
      setError('Network error sending reminder')
      console.error('Error sending reminder:', err)
      return false
    }
  }

  const updateSummaryAfterStatusChange = (newStatus: string) => {
    setSummary(prev => {
      const updated = { ...prev }
      
      // This is a simplified update - in a real app you'd track the old status too
      switch (newStatus) {
        case 'PENDING':
          updated.pending += 1
          break
        case 'CONFIRMED':
          updated.confirmed += 1
          break
        case 'COMPLETED':
          updated.completed += 1
          break
        case 'CANCELLED':
          updated.cancelled += 1
          break
      }
      
      return updated
    })
  }

  // Set up real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      const channel = supabase
        .channel('reservations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'restaurante',
            table: 'reservations'
          },
          (payload) => {
            console.log('Realtime reservation change:', payload)
            
            switch (payload.eventType) {
              case 'INSERT':
                setReservations(prev => [payload.new as Reservation, ...prev])
                setSummary(prev => ({
                  ...prev,
                  total: prev.total + 1,
                  pending: prev.pending + (payload.new.status === 'PENDING' ? 1 : 0),
                  confirmed: prev.confirmed + (payload.new.status === 'CONFIRMED' ? 1 : 0),
                  totalGuests: prev.totalGuests + (payload.new.partySize || 0)
                }))
                break
                
              case 'UPDATE':
                setReservations(prev => 
                  prev.map(reservation => 
                    reservation.id === payload.new.id 
                      ? { ...reservation, ...payload.new } as Reservation
                      : reservation
                  )
                )
                break
                
              case 'DELETE':
                setReservations(prev => 
                  prev.filter(reservation => reservation.id !== payload.old.id)
                )
                setSummary(prev => ({
                  ...prev,
                  total: prev.total - 1,
                  totalGuests: prev.totalGuests - (payload.old.partySize || 0)
                }))
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to reservations')
          }
        })

      channelRef.current = channel
    }

    setupRealtimeSubscription()

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, []) // Empty dependency array - we don't want to re-subscribe on filter changes

  // 🚨 EMERGENCY FIX: Consolidate dual effects to prevent infinite database calls
  // Fetch data when filters change OR on initial load
  useEffect(() => {
    throttledFetch()
  }, [filters.status, filters.date, filters.search]) // Removed duplicate initial fetch

  return {
    reservations,
    summary,
    loading,
    error,
    refetch: fetchReservations,
    updateReservationStatus,
    updateReservation,
    sendReminder
  }
}