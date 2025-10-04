// Order Validation Functions
// Status transitions, business rules validation

import { Order, OrderStatus, VALID_STATUS_TRANSITIONS, ACTIVE_ORDER_STATUSES } from '@/types/order'
import { CreateOrderDTO } from '@/types/pos'

/**
 * Validate if status transition is allowed
 */
export function validateStatusTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
): { valid: boolean; error?: string } {
  // Allow staying in same status (no-op)
  if (fromStatus === toStatus) {
    return { valid: true }
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[fromStatus]

  if (!allowedTransitions.includes(toStatus)) {
    return {
      valid: false,
      error: `No se puede cambiar de ${fromStatus} a ${toStatus}`,
    }
  }

  return { valid: true }
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: Order): { canCancel: boolean; reason?: string } {
  if (order.status === 'SERVED') {
    return { canCancel: false, reason: 'No se puede cancelar un pedido ya servido' }
  }

  if (order.status === 'CANCELLED') {
    return { canCancel: false, reason: 'El pedido ya está cancelado' }
  }

  return { canCancel: true }
}

/**
 * Validate order items for stock availability
 */
export function validateOrderItems(
  items: CreateOrderDTO['items']
): { valid: boolean; errors?: string[] } {
  const errors: string[] = []

  // Check for empty items
  if (!items || items.length === 0) {
    errors.push('El pedido debe tener al menos un item')
  }

  // Check for invalid quantities
  items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push(`El item ${index + 1} tiene cantidad inválida: ${item.quantity}`)
    }
    if (!item.menuItemId) {
      errors.push(`El item ${index + 1} no tiene menuItemId`)
    }
  })

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Validate order creation data
 */
export function validateCreateOrder(
  data: CreateOrderDTO
): { valid: boolean; errors?: string[] } {
  const errors: string[] = []

  if (!data.tableId) {
    errors.push('Debe seleccionar una mesa')
  }

  if (!data.restaurantId) {
    errors.push('Falta el ID del restaurante')
  }

  if (!data.order_source) {
    errors.push('Falta la fuente del pedido')
  }

  // Validate items
  const itemValidation = validateOrderItems(data.items)
  if (!itemValidation.valid && itemValidation.errors) {
    errors.push(...itemValidation.errors)
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Check if order is editable
 */
export function isOrderEditable(order: Order): boolean {
  return ACTIVE_ORDER_STATUSES.includes(order.status)
}

/**
 * Get next possible statuses for an order
 */
export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] || []
}

/**
 * Validate order notes
 */
export function validateOrderNotes(notes: string): { valid: boolean; error?: string } {
  if (notes.length > 500) {
    return {
      valid: false,
      error: 'Las notas no pueden exceder 500 caracteres',
    }
  }

  return { valid: true }
}
