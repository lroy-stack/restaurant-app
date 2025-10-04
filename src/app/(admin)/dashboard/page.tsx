'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays,
  Users,
  UtensilsCrossed,
  MapPin,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useRealtimeReservations } from '@/hooks/useRealtimeReservations'
import { QuickStats } from '../reservaciones/components/quick-stats'
import { toast } from 'sonner'
import { MetricCard } from '@/components/dashboard/stats/metric-card'
import { MetricCardSkeleton } from '@/components/dashboard/stats/metric-card-skeleton'
import { UpcomingReservationsWidget } from '@/components/dashboard/widgets/upcoming-reservations'
import { QuickActionsWidget } from '@/components/dashboard/widgets/quick-actions'
import { TableOccupancyChart } from '@/components/dashboard/charts/table-occupancy-chart'
import { useTableOccupancy } from '@/hooks/useTableOccupancy'

export default function DashboardPage() {
  const { metrics, loading, error, refetch } = useDashboardMetrics()
  const {
    reservations,
    loading: reservationsLoading,
    error: reservationsError,
    refetch: refetchReservations
  } = useRealtimeReservations({})
  const {
    data: occupancyData,
    loading: occupancyLoading,
    refetch: refetchOccupancy
  } = useTableOccupancy()

  // Removed useSystemStatus - widget eliminated

  const handleRefresh = async () => {
    await Promise.all([
      refetch(),
      refetchReservations(),
      refetchOccupancy()
    ])
    toast.success('Dashboard actualizado')
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Principal
            </h1>
            <p className="text-gray-600">
              Panel de control de Enigma Cocina Con Alma
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error al cargar métricas
            </h3>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Principal
          </h1>
          <p className="text-gray-600">
            Panel de control de Enigma Cocina Con Alma
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Key Metrics - REAL DATA FROM VPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Reservas Hoy"
              value={metrics?.todayReservations || 0}
              icon={CalendarDays}
              description={`${metrics?.confirmedReservations || 0} confirmadas`}
              trend={{
                value: 12.5,
                direction: 'up',
                label: 'vs ayer'
              }}
              variant="primary"
            />

            <MetricCard
              title="Ocupación Mesas"
              value={`${metrics?.occupiedTables || 0}/${metrics?.totalTables || 0}`}
              icon={MapPin}
              description={`${metrics?.occupancyPercentage || 0}% ocupación`}
              trend={{
                value: 8,
                direction: 'up'
              }}
            />

            <MetricCard
              title="Total Clientes"
              value={metrics?.totalUsers || 0}
              icon={Users}
              description="clientes registrados"
              trend={{
                value: -5,
                direction: 'down'
              }}
            />

            <MetricCard
              title="Items Menú"
              value={metrics?.totalMenuItems || 0}
              icon={UtensilsCrossed}
              description="platos disponibles"
              trend={{
                value: 3,
                direction: 'up'
              }}
            />
          </>
        )}
      </div>

      {/* Widgets Grid - 7 column system */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Table Occupancy Chart - 4 cols */}
        <Card className="lg:col-span-4 @container/card">
          <CardHeader>
            <CardTitle>Ocupación por Zona</CardTitle>
            <p className="text-sm text-muted-foreground">
              <span className="hidden @[540px]/card:block">
                Estado actual de mesas en tiempo real por zona
              </span>
              <span className="@[540px]/card:hidden">
                Estado de mesas
              </span>
            </p>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <TableOccupancyChart data={occupancyData} loading={occupancyLoading} />
          </CardContent>
        </Card>

        {/* Upcoming Reservations - 3 cols */}
        <div className="lg:col-span-3">
          <UpcomingReservationsWidget
            reservations={reservations || []}
            loading={reservationsLoading}
            onViewAll={() => window.location.href = '/dashboard/reservaciones'}
          />
        </div>
      </div>

      {/* Quick Actions - Full width */}
      <QuickActionsWidget />
    </div>
  )
}