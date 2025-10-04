// POS/Comandero Types
// For in-person order creation system

import { OrderSource } from './order'

export interface POSCartItem {
  menuItemId: string
  name: string
  nameEn?: string
  nameDe?: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  stock: number
  imageUrl?: string
}

export interface POSCart {
  items: POSCartItem[]
  totalItems: number
  totalAmount: number
  tableId?: string
  notes?: string
}

export interface CreateOrderDTO {
  tableId: string
  restaurantId: string
  items: Array<{
    menuItemId: string
    quantity: number
    specialRequests?: string
  }>
  notes?: string
  order_source: OrderSource
  sessionId?: string // For QR orders from menu.enigmaconalma.com
  customer_email?: string
}

export interface CreateOrderResponse {
  success: boolean
  order?: {
    id: string
    orderNumber: string
    totalAmount: number
    status: string
  }
  error?: string
  stockErrors?: Array<{
    menuItemId: string
    name: string
    requested: number
    available: number
  }>
}

// Menu item for POS display
export interface POSMenuItem {
  id: string
  name: string
  nameEn?: string
  nameDe?: string
  description?: string
  richDescription?: string
  category: string
  subcategory?: string
  price: number
  imageUrl?: string
  stock: number
  isAvailable: boolean
  allergens?: string[]
}

// Table for POS selection
export interface POSTable {
  id: string
  number: string
  location: string
  capacity: number
  isAvailable: boolean
  currentOrderId?: string
  hasActiveSessions?: boolean
}
