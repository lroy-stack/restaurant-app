'use client'

// Real-time Orders Subscription Hook
// Subscribes to restaurante.orders table changes via Supabase Realtime
// Integrates with TanStack Query for optimistic updates

import { useEffect, useCallback, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Order, ACTIVE_ORDER_STATUSES } from '@/types/order'
import { subscribeToOrders, unsubscribeChannel, getRealtimeStatus } from '@/lib/supabase/realtime-config'
import { RealtimeOrderPayload } from '@/types/realtime'

interface UseRealtimeOrdersOptions {
  restaurantId?: string
  activeOnly?: boolean // Only subscribe to active orders (not SERVED/CANCELLED)
  onNewOrder?: (order: Order) => void
  onOrderUpdate?: (order: Order) => void
  onOrderDelete?: (order: Order) => void
}

interface UseRealtimeOrdersReturn {
  orders: Order[]
  isConnected: boolean
  isSubscribed: boolean
  error: Error | null
  refetch: () => Promise<void>
  isLoading: boolean
}

export function useRealtimeOrders(
  options: UseRealtimeOrdersOptions = {}
): UseRealtimeOrdersReturn {
  const {
    restaurantId,
    activeOnly = true,
    onNewOrder,
    onOrderUpdate,
    onOrderDelete,
  } = options

  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Fetch orders with TanStack Query
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    if (restaurantId) params.append('restaurantId', restaurantId)
    if (activeOnly) {
      params.append('statuses', ACTIVE_ORDER_STATUSES.join(','))
    }
    return params.toString()
  }, [restaurantId, activeOnly])

  const { data: ordersData, error: queryError, isLoading, refetch } = useQuery({
    queryKey: ['orders', restaurantId, activeOnly],
    queryFn: async () => {
      const response = await fetch(`/api/orders?${buildQueryParams()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      return data.orders || []
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Consider fresh for 30s
  })

  // Handle INSERT events - invalidate query to refetch with relations
  const handleInsert = useCallback(
    async (payload: RealtimeOrderPayload) => {
      // Filter by restaurant and active status if needed
      if (restaurantId && payload.new.restaurantId !== restaurantId) return
      if (activeOnly && !ACTIVE_ORDER_STATUSES.includes(payload.new.status)) return

      console.log('[useRealtimeOrders] New order:', payload.new.id)

      // Invalidate query to trigger refetch (includes all relations)
      await queryClient.invalidateQueries({ queryKey: ['orders'] })

      // Fetch enriched order for callback
      try {
        const response = await fetch(`/api/orders?orderId=${payload.new.id}`)
        const data = await response.json()
        if (data.success && data.orders?.[0]) {
          onNewOrder?.(data.orders[0])
        }
      } catch (error) {
        console.error('[useRealtimeOrders] Failed to fetch order for callback:', error)
      }
    },
    [restaurantId, activeOnly, onNewOrder, queryClient]
  )

  // Handle UPDATE events - invalidate query to refetch
  const handleUpdate = useCallback(
    async (payload: RealtimeOrderPayload) => {
      console.log('[useRealtimeOrders] Order updated:', payload.new.id)

      // Invalidate query to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ['orders'] })

      // Fetch enriched order for callback
      try {
        const response = await fetch(`/api/orders?orderId=${payload.new.id}`)
        const data = await response.json()
        if (data.success && data.orders?.[0]) {
          onOrderUpdate?.(data.orders[0])
        }
      } catch (error) {
        console.error('[useRealtimeOrders] Failed to fetch order for callback:', error)
      }
    },
    [onOrderUpdate, queryClient]
  )

  // Handle DELETE events - invalidate query
  const handleDelete = useCallback(
    async (payload: RealtimeOrderPayload) => {
      const deletedOrder = payload.old || payload.new
      console.log('[useRealtimeOrders] Order deleted:', deletedOrder.id)

      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      onOrderDelete?.(deletedOrder)
    },
    [onOrderDelete, queryClient]
  )

  // Subscribe to Realtime changes
  useEffect(() => {
    const filter = restaurantId ? `restaurantId=eq.${restaurantId}` : undefined

    const channel = subscribeToOrders({
      channelName: `orders-${restaurantId || 'all'}-${Date.now()}`,
      filter,
      onInsert: handleInsert,
      onUpdate: handleUpdate,
      onDelete: handleDelete,
      onError: (err) => {
        console.error('[useRealtimeOrders] Realtime error:', err)
      },
    })

    channelRef.current = channel

    // Monitor connection status reactively
    const statusInterval = setInterval(() => {
      const status = getRealtimeStatus(channel)
      setIsConnected(status.isConnected)
      setIsSubscribed(status.isSubscribed)
    }, 1000)

    return () => {
      clearInterval(statusInterval)
      if (channelRef.current) {
        unsubscribeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [restaurantId, activeOnly, handleInsert, handleUpdate, handleDelete])

  return {
    orders: ordersData || [],
    isConnected,
    isSubscribed,
    error: queryError,
    refetch: async () => {
      await refetch()
    },
    isLoading,
  }
}
