'use client'

import { Order } from '@/types/order'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from './order-status-badge'
import { Button } from '@/components/ui/button'
import {
  formatOrderNumber,
  calculateTimeSince,
  getTotalItems,
  isOrderUrgent,
} from '@/lib/orders/order-utils'
import { cn } from '@/lib/utils'
import { Clock, MapPin, UtensilsCrossed, Euro, AlertCircle } from 'lucide-react'
import { getNextStatuses } from '@/lib/orders/order-validators'
import { useOrderMutations } from '@/hooks/useOrderMutations'

interface OrderCardProps {
  order: Order
  isDragging?: boolean
  onViewDetails?: (order: Order) => void
}

export function OrderCard({ order, isDragging, onViewDetails }: OrderCardProps) {
  const { updateStatus } = useOrderMutations()
  const isUrgent = isOrderUrgent(order)
  const totalItems = getTotalItems(order)
  const nextStatuses = getNextStatuses(order.status)

  const handleStatusChange = async (newStatus: typeof order.status) => {
    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        newStatus,
        currentStatus: order.status,
      })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return (
    <Card
      className={cn(
        '@container cursor-grab active:cursor-grabbing transition-all',
        'rounded-xl border-2',
        isDragging && 'opacity-50 rotate-2 scale-105',
        isUrgent && 'border-l-4 border-l-red-500'
      )}
    >
      {/* Urgent indicator bar */}
      {isUrgent && (
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 border-b border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            ¡Orden urgente! - {calculateTimeSince(order.orderedAt)}
          </span>
        </div>
      )}

      <CardHeader className="border-b px-3 py-3">
        <CardTitle className="font-mono text-sm">
          {formatOrderNumber(order.orderNumber)}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 flex-wrap">
          {order.table && (
            <Badge className="bg-primary text-primary-foreground font-semibold text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Mesa {order.table.number}
            </Badge>
          )}
          <span className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {calculateTimeSince(order.orderedAt)}
          </span>
        </CardDescription>
        <CardAction>
          <OrderStatusBadge status={order.status} size="sm" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-3 pb-2 space-y-1.5">
        {/* Total */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 font-bold text-base">
            <Euro className="h-4 w-4" />
            {order.totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Items count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <UtensilsCrossed className="h-3 w-3" />
          <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>

        {/* Order notes - compact */}
        {order.notes && (
          <div className="text-xs bg-muted/50 rounded px-2 py-1 mt-1">
            {order.notes}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 px-3 pb-3 flex-col gap-2">
        {/* Quick action buttons - compact */}
        {nextStatuses.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 w-full">
            {nextStatuses.slice(0, 2).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === 'CANCELLED' ? 'destructive' : 'default'}
                className="h-8 text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusChange(status)
                }}
                disabled={updateStatus.isLoading}
              >
                {status === 'CONFIRMED' && '✓ Confirmar'}
                {status === 'PREPARING' && '👨‍🍳 Preparar'}
                {status === 'READY' && '🔔 Listo'}
                {status === 'SERVED' && '✨ Servir'}
                {status === 'CANCELLED' && '✕'}
              </Button>
            ))}
          </div>
        )}

        {/* Details button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails?.(order)
          }}
        >
          Ver detalles completos
        </Button>
      </CardFooter>
    </Card>
  )
}
