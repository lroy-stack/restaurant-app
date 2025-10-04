'use client'

import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Order, OrderStatus } from '@/types/order'
import { OrderCard } from './order-card'
import { OrderStatusBadge } from './order-status-badge'
import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'

interface KanbanColumnProps {
  status: OrderStatus
  orders: Order[]
  onViewDetails?: (order: Order) => void
}

export function KanbanColumn({ status, orders, onViewDetails }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border-2 bg-muted/30 p-4 transition-colors',
        isOver && 'border-primary bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      {/* Column header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <OrderStatusBadge status={status} size="lg" />
          <span className="text-sm font-medium text-muted-foreground">
            {orders.length}
          </span>
        </div>
        <div className="h-1 rounded-full bg-muted" />
      </div>

      {/* Orders list */}
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay pedidos {status.toLowerCase()}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <SortableOrderCard
              key={order.id}
              order={order}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Sortable wrapper for OrderCard
function SortableOrderCard({
  order,
  onViewDetails,
}: {
  order: Order
  onViewDetails?: (order: Order) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <OrderCard
        order={order}
        isDragging={isDragging}
        onViewDetails={onViewDetails}
      />
    </div>
  )
}
