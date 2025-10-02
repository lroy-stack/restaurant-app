'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Utensils, Clock, MapPin, Euro } from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  menu_items: {
    id: string
    name: string
    nameEn?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
  notes?: string
  orderedAt: string
  confirmedAt?: string
  readyAt?: string
  servedAt?: string
  order_source: string
  customer_email: string
  tables: {
    id: string
    number: string
    location: string
  }
  order_items: OrderItem[]
}

interface OrderStats {
  total: number
  totalAmount: number
  served: number
  pending: number
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  PREPARING: { label: 'Preparando', color: 'bg-purple-100 text-purple-800', icon: '👨‍🍳' },
  READY: { label: 'Listo', color: 'bg-green-100 text-green-800', icon: '🔔' },
  SERVED: { label: 'Servido', color: 'bg-gray-100 text-gray-800', icon: '✨' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' }
}

export function CustomerOrders({ customerId }: { customerId: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({ total: 0, totalAmount: 0, served: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [customerId])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/customers/${customerId}/orders`)
      const data = await res.json()

      if (data.success) {
        setOrders(data.orders)
        setStats(data.stats)
      } else {
        toast.error('Error al cargar pedidos')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-orange-600" />
          Pedidos en Restaurante
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Pedidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">€{stats.totalAmount.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Gastado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.served}</div>
            <div className="text-sm text-muted-foreground">Servidos</div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status]
              const { date, time } = formatDateTime(order.orderedAt)

              return (
                <div key={order.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {date} • {time}
                      </div>
                    </div>
                    <Badge variant="outline" className={statusConfig.color}>
                      {statusConfig.icon} {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Table & Amount */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Mesa {order.tables.number}
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Euro className="h-3 w-3" />
                      {order.totalAmount.toFixed(2)}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Items:</div>
                    <div className="space-y-1 pl-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="text-muted-foreground">
                          • {item.quantity}x {item.menu_items.name}
                          {item.notes && (
                            <span className="text-orange-600 italic ml-2">({item.notes})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Notes */}
                  {order.notes && (
                    <div className="text-sm bg-blue-50 p-2 rounded">
                      <span className="font-medium">Nota:</span> {order.notes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Sin pedidos</h3>
            <p className="text-sm">
              Este cliente no ha realizado pedidos QR en el restaurante.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
