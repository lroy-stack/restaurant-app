// Supabase Realtime Configuration
// Manages real-time subscriptions to orders and order_items tables

import { createBrowserClient } from '@supabase/ssr'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Order } from '@/types/order'
import { RealtimeConfig, RealtimeEventType } from '@/types/realtime'

export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Subscribe to order changes in real-time
 */
export function subscribeToOrders(config: RealtimeConfig): RealtimeChannel {
  const supabase = getSupabaseClient()

  const channel = supabase.channel(config.channelName, {
    config: {
      broadcast: { self: false },
      presence: { key: '' },
    },
  })

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'restaurante',
        table: 'orders',
        filter: config.filter,
      },
      (payload: RealtimePostgresChangesPayload<Order>) => {
        const eventType = payload.eventType as RealtimeEventType

        console.log('[Realtime] Order change:', eventType, payload)

        switch (eventType) {
          case 'INSERT':
            config.onInsert?.({
              eventType,
              new: payload.new as Order,
              old: null,
              schema: 'restaurante',
              table: 'orders',
              commit_timestamp: payload.commit_timestamp,
            })
            break

          case 'UPDATE':
            config.onUpdate?.({
              eventType,
              new: payload.new as Order,
              old: payload.old as Order,
              schema: 'restaurante',
              table: 'orders',
              commit_timestamp: payload.commit_timestamp,
            })
            break

          case 'DELETE':
            config.onDelete?.({
              eventType,
              new: payload.new as Order,
              old: payload.old as Order,
              schema: 'restaurante',
              table: 'orders',
              commit_timestamp: payload.commit_timestamp,
            })
            break
        }
      }
    )
    .on('system', {}, (payload) => {
      console.log('[Realtime] System event:', payload)

      if (payload.status === 'SUBSCRIBED') {
        console.log('[Realtime] Successfully subscribed to', config.channelName)
      }

      if (payload.status === 'CHANNEL_ERROR') {
        const error = new Error('Realtime channel error')
        console.error('[Realtime] Channel error:', error)
        config.onError?.(error)
      }
    })
    .subscribe((status, error) => {
      console.log('[Realtime] Subscription status:', status)

      if (error) {
        console.error('[Realtime] Subscription error:', error)
        config.onError?.(error)
      }
    })

  return channel
}

/**
 * Unsubscribe from a Realtime channel
 */
export async function unsubscribeChannel(channel: RealtimeChannel): Promise<void> {
  const supabase = getSupabaseClient()

  try {
    await channel.unsubscribe()
    await supabase.removeChannel(channel)
    console.log('[Realtime] Unsubscribed from channel')
  } catch (error) {
    console.error('[Realtime] Error unsubscribing:', error)
  }
}

/**
 * Get connection status for monitoring
 */
export function getRealtimeStatus(channel: RealtimeChannel | null): {
  isConnected: boolean
  isSubscribed: boolean
} {
  if (!channel) {
    return { isConnected: false, isSubscribed: false }
  }

  const state = channel.state

  // Valid connection states: joining, joined, leaving, closed
  const isConnected = ['joining', 'joined'].includes(state)
  const isSubscribed = state === 'joined'

  return {
    isConnected,
    isSubscribed,
  }
}
