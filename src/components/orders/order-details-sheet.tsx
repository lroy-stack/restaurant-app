'use client'

import { Order } from '@/types/order'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  formatOrderNumber,
  calculateTimeSince,
  getTotalItems,
  getOrderTimeline
} from '@/lib/orders/order-utils'
import { getNextStatuses } from '@/lib/orders/order-validators'
import { useOrderMutations } from '@/hooks/useOrderMutations'
import {
  Clock,
  MapPin,
  UtensilsCrossed,
  Euro,
  User,
  Phone,
  Mail,
  StickyNote,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bell
} from 'lucide-react'
import { OrderStatusBadge } from './order-status-badge'

interface OrderDetailsSheetProps {
  order: Order | null
  open: boolean
  onClose: () => void
}

export function OrderDetailsSheet({ order, open, onClose }: OrderDetailsSheetProps) {
  const { updateStatus } = useOrderMutations()

  if (!order) return null

  const totalItems = getTotalItems(order)
  const nextStatuses = getNextStatuses(order.status)
  const timeline = getOrderTimeline(order)

  const handleStatusChange = async (newStatus: typeof order.status) => {
    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        newStatus,
        currentStatus: order.status,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const statusIcons = {
    CONFIRMED: CheckCircle2,
    PREPARING: ChefHat,
    READY: Bell,
    SERVED: CheckCircle2,
    CANCELLED: XCircle,
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xl">{formatOrderNumber(order.orderNumber)}</span>
              {order.table && (
                <Badge className="bg-primary text-primary-foreground font-bold text-base px-3 py-1">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Mesa {order.table.number}
                </Badge>
              )}
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {calculateTimeSince(order.orderedAt)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Mesa y monto */}
          <div className="grid grid-cols-2 gap-4">
            {order.table && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Mesa</span>
                </div>
                <div className="text-lg font-semibold">
                  {order.table.number}
                  {order.table.location && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {order.table.location}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Euro className="h-4 w-4" />
                <span>Total</span>
              </div>
              <div className="text-2xl font-bold">
                {order.totalAmount.toFixed(2)}€
              </div>
            </div>
          </div>

          <Separator />

          {/* Items del pedido */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Productos ({totalItems} items)</h3>
            </div>

            <div className="space-y-2">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">
                        {item.quantity}x
                      </span>
                      <span className="font-medium">
                        {item.menuItem?.name || item.menu_items?.name || `Item ${item.menuItemId}`}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {item.totalPrice.toFixed(2)}€
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.unitPrice.toFixed(2)}€/u
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas del pedido */}
          {order.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Notas del pedido</h3>
                </div>
                <p className="text-sm p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900">
                  {order.notes}
                </p>
              </div>
            </>
          )}

          {/* Timeline */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </h3>
            <div className="space-y-2">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <span className="font-medium">{event.label}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          {nextStatuses.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Acciones rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {nextStatuses.map((status) => {
                    const Icon = statusIcons[status as keyof typeof statusIcons]
                    return (
                      <Button
                        key={status}
                        size="lg"
                        variant={status === 'CANCELLED' ? 'destructive' : 'default'}
                        onClick={() => handleStatusChange(status)}
                        disabled={updateStatus.isLoading}
                        className="h-12"
                      >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {status === 'CONFIRMED' && 'Confirmar'}
                        {status === 'PREPARING' && 'Preparar'}
                        {status === 'READY' && 'Marcar Listo'}
                        {status === 'SERVED' && 'Servir'}
                        {status === 'CANCELLED' && 'Cancelar'}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Info adicional */}
          <Separator />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Fuente:</span>
              <span className="font-medium">{order.order_source}</span>
            </div>
            <div className="flex justify-between">
              <span>ID Pedido:</span>
              <span className="font-mono">{order.id}</span>
            </div>
            {order.customer_email && (
              <div className="flex justify-between">
                <span>Email cliente:</span>
                <span className="font-medium">{order.customer_email}</span>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
