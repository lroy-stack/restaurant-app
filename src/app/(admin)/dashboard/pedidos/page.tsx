'use client'

import { useEffect, useState } from 'react'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { useOrderNotifications } from '@/hooks/useOrderNotifications'
import { OrderKanbanBoard } from '@/components/orders/order-kanban-board'
import { OrdersStatsCards } from '@/components/orders/orders-stats-cards'
import { OrderDetailsSheet } from '@/components/orders/order-details-sheet'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { Order } from '@/types/order'
import { toast } from 'sonner'
import { formatOrderNumber } from '@/lib/orders/order-utils'

export default function PedidosPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { playNewOrderNotification, playStatusUpdateNotification } = useOrderNotifications()

  const {
    orders,
    isConnected,
    isSubscribed,
    error,
    refetch,
  } = useRealtimeOrders({
    restaurantId: 'rest_enigma_001',
    activeOnly: true,
    onNewOrder: (order) => {
      playNewOrderNotification(formatOrderNumber(order.orderNumber))
    },
    onOrderUpdate: (order) => {
      playStatusUpdateNotification(order.status, formatOrderNumber(order.orderNumber))
    },
  })

  // Show toast on connection status change
  useEffect(() => {
    if (isSubscribed) {
      toast.success('Conectado en tiempo real')
    }
  }, [isSubscribed])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.message}`)
    }
  }, [error])

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-muted-foreground">
            Sistema de comandas y cocina en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">En línea</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-red-600 font-medium">Desconectado</span>
              </>
            )}
          </div>

          {/* Refresh button */}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>

          {/* New order button */}
          <Button asChild>
            <Link href="/dashboard/pedidos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <OrdersStatsCards orders={orders} />

      {/* Kanban board */}
      <div className="bg-background rounded-xl border p-6">
        <OrderKanbanBoard orders={orders} onViewDetails={handleViewDetails} />
      </div>

      {/* Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}
