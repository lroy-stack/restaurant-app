'use client'

import { Order } from '@/types/order'
import { MetricCard } from '@/components/dashboard/stats/metric-card'
import { calculateOrderStats, getActiveOrders } from '@/lib/orders/order-utils'
import { UtensilsCrossed, Clock, ChefHat, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react'

interface OrdersStatsCardsProps {
  orders: Order[]
}

export function OrdersStatsCards({ orders }: OrdersStatsCardsProps) {
  const stats = calculateOrderStats(orders)
  const activeOrders = getActiveOrders(orders)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Pedidos Activos"
        value={stats.active}
        description="Pedidos en proceso"
        icon={UtensilsCrossed}
        trend={stats.active > 0 ? 'up' : 'neutral'}
        trendValue={`${stats.pending} pendientes`}
      />

      <MetricCard
        title="En Cocina"
        value={stats.preparing}
        description="Preparando ahora"
        icon={ChefHat}
        trend={stats.preparing > 5 ? 'up' : 'neutral'}
        trendValue={stats.preparing > 5 ? 'Alta carga' : 'Normal'}
      />

      <MetricCard
        title="Listos"
        value={stats.ready}
        description="Esperando servir"
        icon={CheckCircle}
        trend={stats.ready > 3 ? 'up' : 'neutral'}
        trendValue={stats.ready > 3 ? '¡Servir ya!' : 'OK'}
      />

      <MetricCard
        title="Tiempo Prep."
        value={`${stats.averagePrepTime}m`}
        description="Promedio hoy"
        icon={Clock}
        trend={stats.averagePrepTime < 20 ? 'down' : stats.averagePrepTime > 30 ? 'up' : 'neutral'}
        trendValue={stats.completedToday > 0 ? `${stats.completedToday} servidos` : 'Sin datos'}
      />

      {stats.longestWait > 30 && (
        <div className="col-span-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">¡Atención!</h4>
              <p className="text-sm text-red-700">
                Hay pedidos esperando más de {stats.longestWait} minutos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
