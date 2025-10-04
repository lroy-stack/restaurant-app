'use client'

// Order Mutations Hook
// Handles order CRUD operations with optimistic updates

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Order, OrderStatus } from '@/types/order'
import { CreateOrderDTO, CreateOrderResponse } from '@/types/pos'
import { validateStatusTransition } from '@/lib/orders/order-validators'

interface UpdateOrderStatusInput {
  orderId: string
  newStatus: OrderStatus
  currentStatus: OrderStatus
}

interface CancelOrderInput {
  orderId: string
  reason?: string
}

interface UpdateOrderNotesInput {
  orderId: string
  notes: string
}

export function useOrderMutations() {
  const queryClient = useQueryClient()

  // Update order status
  const updateStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: UpdateOrderStatusInput) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update order status')
      }

      return response.json()
    },
    onMutate: async ({ orderId, newStatus, currentStatus }) => {
      // Validate transition before attempting
      const validation = validateStatusTransition(currentStatus, newStatus)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['orders'] })

      // Get current orders
      const previousOrders = queryClient.getQueryData<Order[]>(['orders'])

      // Optimistic update
      if (previousOrders) {
        queryClient.setQueryData<Order[]>(
          ['orders'],
          previousOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  // Update timestamp fields based on new status
                  ...(newStatus === 'CONFIRMED' && { confirmedAt: new Date().toISOString() }),
                  ...(newStatus === 'READY' && { readyAt: new Date().toISOString() }),
                  ...(newStatus === 'SERVED' && { servedAt: new Date().toISOString() }),
                }
              : order
          )
        )
      }

      return { previousOrders }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders)
      }
      console.error('Failed to update order status:', err)
    },
    onSuccess: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  // Cancel order
  const cancelOrder = useMutation({
    mutationFn: async ({ orderId, reason }: CancelOrderInput) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          notes: reason ? `Cancelado: ${reason}` : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel order')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  // Update order notes
  const updateNotes = useMutation({
    mutationFn: async ({ orderId, notes }: UpdateOrderNotesInput) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update notes')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  // Create presencial order (POS)
  const createOrder = useMutation({
    mutationFn: async (orderData: CreateOrderDTO): Promise<CreateOrderResponse> => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create order',
          stockErrors: data.stockErrors,
        }
      }

      return {
        success: true,
        order: data.order,
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      }
    },
  })

  return {
    updateStatus: {
      mutate: updateStatus.mutate,
      mutateAsync: updateStatus.mutateAsync,
      isLoading: updateStatus.isPending,
      error: updateStatus.error,
    },
    cancelOrder: {
      mutate: cancelOrder.mutate,
      mutateAsync: cancelOrder.mutateAsync,
      isLoading: cancelOrder.isPending,
      error: cancelOrder.error,
    },
    updateNotes: {
      mutate: updateNotes.mutate,
      mutateAsync: updateNotes.mutateAsync,
      isLoading: updateNotes.isPending,
      error: updateNotes.error,
    },
    createOrder: {
      mutate: createOrder.mutate,
      mutateAsync: createOrder.mutateAsync,
      isLoading: createOrder.isPending,
      error: createOrder.error,
    },
  }
}
