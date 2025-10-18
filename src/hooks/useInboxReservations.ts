'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  createdAt: string
  tables?: any
}

interface InboxState {
  unseenIds: Set<string>
  lastCheck: string
}

const STORAGE_KEY = 'inbox-reservations'
const MAX_AGE_DAYS = 7

export function useInboxReservations() {
  const [unseenReservations, setUnseenReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Load unseen IDs from localStorage
  const loadInboxState = useCallback((): InboxState => {
    if (typeof window === 'undefined') {
      return { unseenIds: new Set(), lastCheck: new Date().toISOString() }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          unseenIds: new Set(parsed.unseenIds || []),
          lastCheck: parsed.lastCheck || new Date().toISOString()
        }
      }
    } catch (err) {
      console.error('Error loading inbox state:', err)
    }

    return { unseenIds: new Set(), lastCheck: new Date().toISOString() }
  }, [])

  // Save unseen IDs to localStorage
  const saveInboxState = useCallback((state: InboxState) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        unseenIds: Array.from(state.unseenIds),
        lastCheck: state.lastCheck
      }))
    } catch (err) {
      console.error('Error saving inbox state:', err)
    }
  }, [])

  // Fetch unseen reservations
  const fetchUnseenReservations = useCallback(async () => {
    const state = loadInboxState()

    if (state.unseenIds.size === 0) {
      setUnseenReservations([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .schema('restaurante')
        .from('reservations')
        .select('*')
        .in('id', Array.from(state.unseenIds))
        .eq('status', 'PENDING')
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Filter out old reservations (>7 days)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS)

      const validReservations = (data || []).filter(r =>
        new Date(r.createdAt) > cutoffDate
      )

      // Update state to remove stale IDs
      const validIds = new Set(validReservations.map(r => r.id))
      if (validIds.size !== state.unseenIds.size) {
        saveInboxState({ ...state, unseenIds: validIds })
      }

      setUnseenReservations(validReservations)
    } catch (err) {
      console.error('Error fetching unseen reservations:', err)
      setUnseenReservations([])
    } finally {
      setLoading(false)
    }
  }, [loadInboxState, saveInboxState])

  // Mark reservation as seen
  const markAsSeen = useCallback((id: string) => {
    const state = loadInboxState()
    state.unseenIds.delete(id)
    saveInboxState(state)

    // Update UI immediately
    setUnseenReservations(prev => prev.filter(r => r.id !== id))
  }, [loadInboxState, saveInboxState])

  // Mark all as seen
  const markAllAsSeen = useCallback(() => {
    const state = loadInboxState()
    state.unseenIds.clear()
    saveInboxState(state)
    setUnseenReservations([])
  }, [loadInboxState, saveInboxState])

  // Add new reservation to inbox
  const addToInbox = useCallback((reservationId: string) => {
    const state = loadInboxState()
    state.unseenIds.add(reservationId)
    state.lastCheck = new Date().toISOString()
    saveInboxState(state)

    // Refetch to update UI
    fetchUnseenReservations()
  }, [loadInboxState, saveInboxState, fetchUnseenReservations])

  // Setup Realtime subscription
  useEffect(() => {
    // Initial fetch
    fetchUnseenReservations()

    // Cleanup old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Subscribe to new PENDING reservations
    const channel = supabase
      .channel('inbox_reservations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'restaurante',
          table: 'reservations',
          filter: 'status=eq.PENDING'
        },
        (payload) => {
          console.log('📬 New PENDING reservation for inbox:', payload.new.id)
          addToInbox(payload.new.id)
        }
      )
      .subscribe((status) => {
        console.log('📬 Inbox subscription status:', status)
      })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [fetchUnseenReservations, addToInbox])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnseenReservations()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchUnseenReservations])

  return {
    unseenReservations,
    unseenCount: unseenReservations.length,
    markAsSeen,
    markAllAsSeen,
    loading,
    refresh: fetchUnseenReservations
  }
}
