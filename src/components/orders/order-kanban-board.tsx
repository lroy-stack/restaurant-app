'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Order, OrderStatus, ACTIVE_ORDER_STATUSES } from '@/types/order'
import { OrderCard } from './order-card'
import { KanbanColumn } from './kanban-column'
import { getOrdersByStatus } from '@/lib/orders/order-utils'
import { validateStatusTransition } from '@/lib/orders/order-validators'
import { useOrderMutations } from '@/hooks/useOrderMutations'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface OrderKanbanBoardProps {
  orders: Order[]
  onViewDetails?: (order: Order) => void
}

const KANBAN_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY']

export function OrderKanbanBoard({ orders, onViewDetails }: OrderKanbanBoardProps) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { updateStatus } = useOrderMutations()

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts
      },
    })
  )

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      PENDING: [],
      CONFIRMED: [],
      PREPARING: [],
      READY: [],
      SERVED: [],
      CANCELLED: [],
    }

    orders.forEach((order) => {
      if (ACTIVE_ORDER_STATUSES.includes(order.status)) {
        grouped[order.status].push(order)
      }
    })

    // Sort each column by priority/time
    KANBAN_STATUSES.forEach((status) => {
      grouped[status] = getOrdersByStatus(orders, status)
    })

    return grouped
  }, [orders])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const orderId = event.active.id as string
    const order = orders.find((o) => o.id === orderId)
    setActiveOrder(order || null)
    setError(null)
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveOrder(null)

    if (!over) return

    const orderId = active.id as string
    const newStatus = over.id as OrderStatus

    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    // Same status - no change
    if (order.status === newStatus) return

    // Validate transition
    const validation = validateStatusTransition(order.status, newStatus)
    if (!validation.valid) {
      setError(validation.error || 'Transición de estado no válida')
      setTimeout(() => setError(null), 5000)
      return
    }

    // Update status
    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        newStatus,
        currentStatus: order.status,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[600px]">
          {KANBAN_STATUSES.map((status) => {
            const columnOrders = ordersByStatus[status] || []

            return (
              <SortableContext
                key={status}
                id={status}
                items={columnOrders.map((o) => o.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  status={status}
                  orders={columnOrders}
                  onViewDetails={onViewDetails}
                />
              </SortableContext>
            )
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeOrder && (
            <OrderCard
              order={activeOrder}
              isDragging
              onViewDetails={onViewDetails}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
