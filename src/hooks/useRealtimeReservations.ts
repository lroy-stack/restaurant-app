'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useReservationNotifications } from './useReservationNotifications'

interface MenuItem {
  id: string
  name: string
  price: number
  menu_categories: {
    name: string
    type: string
  }
}

interface ReservationItem {
  id: string
  quantity: number
  notes?: string
  menu_items: MenuItem
}

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
  reservation_items: ReservationItem[]
  tables: {
    id: string
    number: string
    capacity: number
    location: 'TERRACE_1' | 'VIP_ROOM' | 'TERRACE_2' | 'MAIN_ROOM'
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

  // ✅ NUEVO: Hook de notificaciones con audio
  const {
    notifyNewReservation,
    notifyUpdateReservation,
    notifyCancelReservation
  } = useReservationNotifications()

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
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
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
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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

  // Set up real-time subscription using BROADCAST (scalable pattern)
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      const channel = supabase
        .channel('reservation_changes', {
          config: {
            broadcast: { self: false },
            presence: { key: '' }
          }
        })
        .on(
          'broadcast',
          { event: 'reservation_changes' },
          (payload) => {
            console.log('🔔 Realtime broadcast received:', payload)

            const data = payload.payload
            const eventType = data.type // INSERT, UPDATE, DELETE

            switch (eventType) {
              case 'INSERT':
                // Fetch completo con JOINs (reservation_items + tables)
                fetch(`/api/reservations/${data.new.id}`)
                  .then(res => res.json())
                  .then(result => {
                    if (result.success && result.reservation) {
                      const newReservation = result.reservation as Reservation

                      // 🔧 FIX: Deduplicación - evitar añadir si ya existe
                      setReservations(prev => {
                        const exists = prev.some(r => r.id === newReservation.id)
                        if (exists) {
                          console.log('⚠️ Reservation already exists, skipping duplicate INSERT:', newReservation.id)
                          return prev
                        }
                        return [newReservation, ...prev]
                      })

                      setSummary(prev => ({
                        total: (prev?.total || 0) + 1,
                        pending: (prev?.pending || 0) + (newReservation.status === 'PENDING' ? 1 : 0),
                        confirmed: (prev?.confirmed || 0) + (newReservation.status === 'CONFIRMED' ? 1 : 0),
                        completed: prev?.completed || 0,
                        cancelled: prev?.cancelled || 0,
                        totalGuests: (prev?.totalGuests || 0) + (newReservation.partySize || 0)
                      }))

                      // ✅ Notificar nueva reserva con audio
                      notifyNewReservation(newReservation as any)
                    }
                  })
                  .catch(err => console.error('Error fetching new reservation:', err))
                break

              case 'UPDATE':
                // Fetch completo con JOINs (reservation_items + tables)
                fetch(`/api/reservations/${data.new.id}`)
                  .then(res => res.json())
                  .then(result => {
                    if (result.success && result.reservation) {
                      const updatedReservation = result.reservation as Reservation
                      const oldReservation = data.old as Reservation

                      setReservations(prev =>
                        prev.map(reservation =>
                          reservation.id === updatedReservation.id
                            ? updatedReservation
                            : reservation
                        )
                      )

                      // ✅ Notificar cambios importantes
                      if (oldReservation && oldReservation.status !== updatedReservation.status) {
                        if (updatedReservation.status === 'CANCELLED') {
                          notifyCancelReservation(updatedReservation as any)
                        } else {
                          notifyUpdateReservation(updatedReservation as any)
                        }
                      }
                    }
                  })
                  .catch(err => console.error('Error fetching updated reservation:', err))
                break

              case 'DELETE':
                const deletedReservation = data.old as Reservation
                setReservations(prev =>
                  prev.filter(reservation => reservation.id !== deletedReservation.id)
                )
                setSummary(prev => ({
                  total: Math.max(0, (prev?.total || 0) - 1),
                  pending: prev?.pending || 0,
                  confirmed: prev?.confirmed || 0,
                  completed: prev?.completed || 0,
                  cancelled: prev?.cancelled || 0,
                  totalGuests: Math.max(0, (prev?.totalGuests || 0) - (deletedReservation.partySize || 0))
                }))

                // ✅ Notificar eliminación
                notifyCancelReservation(deletedReservation as any)
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('🔔 Broadcast subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to reservation broadcasts')
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
  }, [notifyNewReservation, notifyUpdateReservation, notifyCancelReservation]) // Include notification functions in deps

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