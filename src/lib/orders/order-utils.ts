// Order Utility Functions
// Time calculations, formatting, grouping helpers

import { Order, OrderStatus, ACTIVE_ORDER_STATUSES } from '@/types/order'
import { formatDistanceToNow, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Calculate human-readable time since order was placed
 */
export function calculateTimeSince(timestamp: string): string {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: es,
  })
}

/**
 * Calculate priority score based on waiting time and status
 * Returns 1-10 (10 = most urgent)
 */
export function calculatePriority(order: Order): number {
  const minutesWaiting = differenceInMinutes(new Date(), new Date(order.orderedAt))

  // Base priority by status
  const statusPriority: Record<OrderStatus, number> = {
    READY: 8, // Should be served soon
    PREPARING: 6,
    CONFIRMED: 4,
    PENDING: 3,
    SERVED: 0,
    CANCELLED: 0,
  }

  let priority = statusPriority[order.status]

  // Increase priority based on waiting time
  if (minutesWaiting > 45) priority = Math.min(10, priority + 4)
  else if (minutesWaiting > 30) priority = Math.min(10, priority + 2)
  else if (minutesWaiting > 20) priority = Math.min(10, priority + 1)

  return priority
}

/**
 * Format order number for display
 */
export function formatOrderNumber(orderNumber: string): string {
  // ENI-251002-404784 → ENI-404784
  const parts = orderNumber.split('-')
  return parts.length === 3 ? `${parts[0]}-${parts[2]}` : orderNumber
}

/**
 * Group orders by status
 */
export function getOrdersByStatus(orders: Order[], status: OrderStatus): Order[] {
  return orders
    .filter((order) => order.status === status)
    .sort((a, b) => {
      // Sort by priority (high to low), then by orderedAt (old to new)
      const priorityDiff = calculatePriority(b) - calculatePriority(a)
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()
    })
}

/**
 * Get only active orders (exclude SERVED and CANCELLED)
 */
export function getActiveOrders(orders: Order[]): Order[] {
  return orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
}

/**
 * Calculate total items in an order
 */
export function getTotalItems(order: Order): number {
  if (!order.order_items || order.order_items.length === 0) return 0
  return order.order_items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Check if order is urgent (>30 min waiting)
 */
export function isOrderUrgent(order: Order): boolean {
  const minutesWaiting = differenceInMinutes(new Date(), new Date(order.orderedAt))
  return minutesWaiting > 30 && ACTIVE_ORDER_STATUSES.includes(order.status)
}

/**
 * Get waiting time in minutes
 */
export function getWaitingTimeMinutes(order: Order): number {
  return differenceInMinutes(new Date(), new Date(order.orderedAt))
}

/**
 * Get preparation time (confirmedAt → readyAt)
 */
export function getPreparationTimeMinutes(order: Order): number | null {
  if (!order.confirmedAt || !order.readyAt) return null
  return differenceInMinutes(new Date(order.readyAt), new Date(order.confirmedAt))
}

/**
 * Get average preparation time from array of orders
 */
export function getAveragePreparationTime(orders: Order[]): number {
  const prepTimes = orders
    .map(getPreparationTimeMinutes)
    .filter((time): time is number => time !== null)

  if (prepTimes.length === 0) return 0
  return Math.round(prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length)
}

/**
 * Get order timeline events
 */
export function getOrderTimeline(order: Order) {
  const events = [
    { label: 'Pedido creado', timestamp: order.orderedAt, status: 'PENDING' },
  ]

  if (order.confirmedAt) {
    events.push({ label: 'Confirmado', timestamp: order.confirmedAt, status: 'CONFIRMED' })
  }

  if (order.readyAt) {
    events.push({ label: 'Listo', timestamp: order.readyAt, status: 'READY' })
  }

  if (order.servedAt) {
    events.push({ label: 'Servido', timestamp: order.servedAt, status: 'SERVED' })
  }

  return events
}

/**
 * Calculate order statistics for a set of orders
 */
export function calculateOrderStats(orders: Order[]) {
  const activeOrders = getActiveOrders(orders)
  const completedToday = orders.filter(
    (o) =>
      o.status === 'SERVED' &&
      new Date(o.servedAt!).toDateString() === new Date().toDateString()
  )

  return {
    total: orders.length,
    active: activeOrders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    preparing: orders.filter((o) => o.status === 'PREPARING').length,
    ready: orders.filter((o) => o.status === 'READY').length,
    served: orders.filter((o) => o.status === 'SERVED').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
    completedToday: completedToday.length,
    averagePrepTime: getAveragePreparationTime(completedToday),
    longestWait: activeOrders.length > 0
      ? Math.max(...activeOrders.map(getWaitingTimeMinutes))
      : 0,
  }
}
