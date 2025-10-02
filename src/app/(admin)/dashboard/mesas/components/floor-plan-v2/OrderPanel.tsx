'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, ChefHat, Clock, CheckCircle, XCircle, AlertCircle, Package, ArrowRight, Flame, MessageSquare } from 'lucide-react'
import { formatDistanceToNow, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { OrderTimeline } from './OrderTimeline'

interface OrderItem {
  id: string
  quantity: number
  status: string
  unitPrice: number
  totalPrice: number
  notes: string | null
  menu_items: {
    id: string
    name: string
    nameEn: string | null
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  notes: string | null
  orderedAt: string
  order_items: OrderItem[]
}

interface OrderPanelProps {
  tableId: string
  tableNumber: string
  isOpen: boolean
  onClose: () => void
}

const STATUS_CONFIG: any = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, next: 'CONFIRMED' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle, next: 'PREPARING' },
  PREPARING: { label: 'Preparando', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: ChefHat, next: 'READY' },
  READY: { label: 'Listo', color: 'bg-green-50 text-green-700 border-green-200', icon: Package, next: 'SERVED' },
  SERVED: { label: 'Servido', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: CheckCircle, next: null },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, next: null }
}

export function OrderPanel({ tableId, tableNumber, isOpen, onClose }: OrderPanelProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInitialLoad = useRef(true)

  const fetchOrders = useCallback(async () => {
    try {
      // Solo mostrar loading en carga inicial, no en refreshes
      if (isInitialLoad.current) {
        setLoading(true)
      }

      const res = await fetch(`/api/orders/by-table/${tableId}`)
      const data = await res.json()

      if (data.success) {
        // Solo actualizar si hay cambios reales
        setOrders(prevOrders => {
          const newOrdersStr = JSON.stringify(data.orders)
          const prevOrdersStr = JSON.stringify(prevOrders)
          return newOrdersStr !== prevOrdersStr ? data.orders : prevOrders
        })
      }
    } catch (error) {
      if (isInitialLoad.current) {
        toast.error('Error al cargar pedidos')
      }
    } finally {
      if (isInitialLoad.current) {
        setLoading(false)
        isInitialLoad.current = false
      }
    }
  }, [tableId])

  const updateStatus = async (orderId: string, status: string, itemId?: string) => {
    setUpdating(itemId || orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, itemId })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Estado actualizado')
        fetchOrders()
      } else {
        toast.error('Error al actualizar')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    if (isOpen) {
      isInitialLoad.current = true
      fetchOrders()

      // Refresh cada 15 segundos (no 5) - menos agresivo
      const interval = setInterval(fetchOrders, 15000)

      return () => {
        clearInterval(interval)
        isInitialLoad.current = true // Reset para próxima apertura
      }
    }
  }, [isOpen, fetchOrders])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Comandas Mesa {tableNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {orders.map((order) => {
                const config = STATUS_CONFIG[order.status]
                const StatusIcon = config.icon

                const minutesAgo = differenceInMinutes(new Date(), new Date(order.orderedAt + 'Z'))
                const isUrgent = minutesAgo > 20
                const isWarning = minutesAgo > 10 && minutesAgo <= 20

                return (
                  <Card key={order.id} className={isUrgent ? "border-red-500 border-2" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div>
                            <CardTitle className="text-base sm:text-lg font-mono">{order.orderNumber}</CardTitle>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(order.orderedAt + 'Z'), { addSuffix: true, locale: es })}
                            </p>
                          </div>
                          {isUrgent && (
                            <Badge className="bg-red-500 text-white flex items-center gap-1 animate-pulse">
                              <Flame className="h-3 w-3" />
                              URGENTE
                            </Badge>
                          )}
                          {isWarning && !isUrgent && (
                            <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {minutesAgo}min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Timeline Stepper */}
                      <OrderTimeline
                        currentStatus={order.status}
                        onStatusClick={(status) => updateStatus(order.id, status)}
                        isUpdating={updating === order.id}
                      />

                      <Separator />

                      {/* Items List */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Items del pedido:</h4>
                        {order.order_items.map((item) => (
                          <div key={item.id} className="p-3 rounded-lg bg-muted/30 space-y-1">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-2 flex-1">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">
                                    {item.quantity}x {item.menu_items.name}
                                  </span>
                                  {item.notes && (
                                    <div className="mt-1 flex items-start gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      <span className="italic">{item.notes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm font-medium ml-2">€{item.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order General Notes */}
                      {order.notes && (
                        <>
                          <Separator />
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              Notas generales del pedido:
                            </h4>
                            <p className="text-sm text-blue-800">{order.notes}</p>
                          </div>
                        </>
                      )}

                      <Separator />

                      {/* Total and Cancel */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="font-bold text-xl">Total: €{order.totalAmount.toFixed(2)}</p>
                        {order.status !== 'CANCELLED' && order.status !== 'SERVED' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(order.id, 'CANCELLED')}
                            disabled={!!updating}
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar Pedido
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
