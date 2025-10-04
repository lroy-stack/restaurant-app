// Order Management Types
// Based on restaurante.orders and restaurante.order_items schema

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
export type OrderSource = 'presencial' | 'qr' | 'online' | 'telefono'

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: OrderItemStatus
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations (populated via join)
  menuItem?: {
    id: string
    name: string
    nameEn?: string
    nameDe?: string
    category: string
    imageUrl?: string
  }
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  tableId: string
  customerId?: string
  restaurantId: string
  order_source: OrderSource
  notes?: string
  customer_email?: string
  tracking_token?: string
  token_expires_at?: string
  email_sent?: boolean

  // Timestamps
  orderedAt: string
  confirmedAt?: string
  readyAt?: string
  servedAt?: string
  createdAt: string
  updatedAt: string

  // Relations (populated via join)
  order_items?: OrderItem[]
  table?: {
    id: string
    number: string
    location: string
    capacity?: number
  }
  customer?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface OrderFilters {
  statuses?: OrderStatus[]
  sources?: OrderSource[]
  tableId?: string
  restaurantId?: string
  dateFrom?: Date
  dateTo?: Date
  searchQuery?: string
}

// Status transition validation map
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: [], // Terminal state
  CANCELLED: [], // Terminal state
}

// Active statuses (not terminal)
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY']

// Color mapping for status badges
export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  PREPARING: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  READY: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  SERVED: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
}
