// Supabase Realtime Types
// For real-time order updates subscription

import { Order, OrderItem } from './order'

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeOrderPayload {
  eventType: RealtimeEventType
  new: Order
  old: Order | null
  schema: 'restaurante'
  table: 'orders'
  commit_timestamp: string
}

export interface RealtimeOrderItemPayload {
  eventType: RealtimeEventType
  new: OrderItem
  old: OrderItem | null
  schema: 'restaurante'
  table: 'order_items'
  commit_timestamp: string
}

export interface RealtimeConfig {
  channelName: string
  filter?: string
  onInsert?: (payload: RealtimeOrderPayload) => void
  onUpdate?: (payload: RealtimeOrderPayload) => void
  onDelete?: (payload: RealtimeOrderPayload) => void
  onError?: (error: Error) => void
}

export interface RealtimeStatus {
  isConnected: boolean
  isSubscribed: boolean
  lastEvent?: {
    type: RealtimeEventType
    timestamp: string
  }
  error?: Error
}
