'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface DashboardMetrics {
  totalReservations: number
  totalUsers: number
  totalMenuItems: number
  todayReservations: number
  confirmedReservations: number
  totalTables: number
  occupiedTables: number
  occupancyPercentage: number
  recentReservations: {
    id: string
    customerName: string
    partySize: number
    time: string
    tableNumber: string
  }[]
}

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // supabase client imported from lib
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastFetchRef = useRef<number>(0)

  // Throttle API calls to prevent excessive requests
  const throttledFetch = async () => {
    const now = Date.now()
    if (now - lastFetchRef.current < 5000) return // 5 second throttle for dashboard
    lastFetchRef.current = now
    await fetchMetrics()
  }

  const fetchMetrics = async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/dashboard')
      const data = await response.json()

      if (data.success) {
        setMetrics(data.metrics)
      } else {
        setError(data.error || 'Error fetching dashboard metrics')
      }
    } catch (err) {
      setError('Network error fetching dashboard metrics')
      console.error('Error fetching dashboard metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription for dashboard updates
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      // Subscribe to changes in reservations table (main driver of dashboard metrics)
      const channel = supabase
        .channel('dashboard_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'restaurante',
            table: 'reservations'
          },
          (payload) => {
            console.log('Dashboard realtime update:', payload)
            // Refetch metrics when reservations change
            throttledFetch()
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'restaurante',
            table: 'users'
          },
          (payload) => {
            console.log('Users update:', payload)
            throttledFetch()
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'restaurante',
            table: 'menu_items'
          },
          (payload) => {
            console.log('Menu items update:', payload)
            throttledFetch()
          }
        )
        .subscribe((status) => {
          console.log('Dashboard realtime subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to dashboard updates')
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
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  }
}