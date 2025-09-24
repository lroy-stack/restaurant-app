'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays,
  Users,
  UtensilsCrossed,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useRealtimeReservations } from '@/hooks/useRealtimeReservations'
import { QuickStats } from '../reservaciones/components/quick-stats'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { metrics, loading, error, refetch } = useDashboardMetrics()
  const {
    reservations,
    loading: reservationsLoading,
    error: reservationsError,
    refetch: refetchReservations
  } = useRealtimeReservations({})

  // Removed useSystemStatus - widget eliminated

  const handleRefresh = async () => {
    await Promise.all([
      refetch(),
      refetchReservations()
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Hoy
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                metrics?.todayReservations || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.confirmedReservations || 0} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupación Mesas
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                `${metrics?.occupiedTables || 0}/${metrics?.totalTables || 0}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.occupancyPercentage || 0}% ocupación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                metrics?.totalUsers || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Items Menú
            </CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                metrics?.totalMenuItems || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              platos disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity - REAL DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Próximas Reservas</CardTitle>
              <p className="text-sm text-muted-foreground">
                {reservations?.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length || 0} reservas activas
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = '/dashboard/reservaciones'}
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                // Loading skeleton
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
              ) : reservations && reservations.length > 0 ? (
                reservations
                  .filter(reservation => reservation.status === 'CONFIRMED' || reservation.status === 'PENDING')
                  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                  .slice(0, 4)
                  .map((reservation) => {
                    try {
                      const reservationDateTime = new Date(reservation.time) // time ya contiene fecha+hora completa
                      const now = new Date()

                      if (isNaN(reservationDateTime.getTime())) {
                        throw new Error('Invalid date')
                      }

                      const timeUntil = reservationDateTime.getTime() - now.getTime()
                      const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60))
                      const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))

                      const isToday = reservationDateTime.toDateString() === now.toDateString()
                      const isSoon = timeUntil <= 2 * 60 * 60 * 1000 && timeUntil > 0
                      const isPast = timeUntil < 0

                      let timeDisplay = ''
                      if (isPast) {
                        timeDisplay = 'AHORA'
                      } else if (isSoon) {
                        timeDisplay = `${hoursUntil}h ${minutesUntil}m`
                      } else if (isToday) {
                        timeDisplay = reservationDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
                      } else {
                        timeDisplay = reservationDateTime.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
                      }

                      return (
                        <div key={reservation.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          isPast ? 'bg-destructive/10 border-destructive/20' :
                          isSoon ? 'bg-accent/10 border-accent/20' : 'bg-card'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`p-1.5 rounded-full ${
                              reservation.status === 'CONFIRMED' ? 'bg-primary/10' : 'bg-accent/10'
                            }`}>
                              <Clock className={`h-3 w-3 ${
                                reservation.status === 'CONFIRMED' ? 'text-primary' : 'text-accent'
                              }`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium truncate">
                                  {reservation.customerName}
                                </p>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  reservation.status === 'CONFIRMED'
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'bg-accent/10 text-accent border border-accent/20'
                                }`}>
                                  {reservation.status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  Mesa {reservation.tables?.number || reservation.tableId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {reservation.partySize}p
                                </p>
                                {reservation.tables?.location && (
                                  <p className="text-xs text-muted-foreground">
                                    {reservation.tables.location.replace('_', ' ').toLowerCase()}
                                  </p>
                                )}
                              </div>
                              {reservation.specialRequests && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  📝 {reservation.specialRequests}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              isPast ? 'text-destructive' :
                              isSoon ? 'text-accent' : 'text-foreground'
                            }`}>
                              {timeDisplay}
                            </p>
                            {reservation.hasPreOrder && (
                              <p className="text-xs text-muted-foreground mt-1">
                                🍽️ Pre-orden
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    } catch (error) {
                      return null
                    }
                  })
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay reservas próximas
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => window.location.href = '/dashboard/reservaciones/nueva'}
                  >
                    Nueva Reserva
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {reservations && reservations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Hoy</p>
                    <p className="text-sm font-medium">
                      {reservations.filter(r =>
                        new Date(r.date).toDateString() === new Date().toDateString() &&
                        (r.status === 'CONFIRMED' || r.status === 'PENDING')
                      ).length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                    <p className="text-sm font-medium text-accent">
                      {reservations.filter(r => r.status === 'PENDING').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Comensales</p>
                    <p className="text-sm font-medium">
                      {reservations
                        .filter(r =>
                          new Date(r.date).toDateString() === new Date().toDateString() &&
                          (r.status === 'CONFIRMED' || r.status === 'PENDING')
                        )
                        .reduce((sum, r) => sum + r.partySize, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget de Sistema eliminado - era inútil */}
      </div>

      {/* Restaurant Operations - Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestión operativa del restaurante
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Reservaciones */}
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
              onClick={() => window.location.href = '/dashboard/reservaciones'}
            >
              <CalendarDays className="h-8 w-8 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Reservaciones</h3>
                <p className="text-xs text-muted-foreground">
                  Gestionar reservas y disponibilidad
                </p>
              </div>
            </Button>

            {/* Mesas */}
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-accent/5 hover:border-accent/20 transition-all duration-200"
              onClick={() => window.location.href = '/dashboard/mesas'}
            >
              <MapPin className="h-8 w-8 text-accent" />
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Mesas</h3>
                <p className="text-xs text-muted-foreground">
                  Estado y disposición de mesas
                </p>
              </div>
            </Button>

            {/* Menú */}
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all duration-200"
              onClick={() => window.location.href = '/dashboard/menu'}
            >
              <UtensilsCrossed className="h-8 w-8 text-orange-500" />
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Menú</h3>
                <p className="text-xs text-muted-foreground">
                  Gestión de platos y categorías
                </p>
              </div>
            </Button>
          </div>

          {/* Secondary Actions Row */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start space-x-2 hover:bg-muted/50"
                onClick={() => window.location.href = '/dashboard/clientes'}
              >
                <Users className="h-4 w-4" />
                <span>Clientes</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start space-x-2 hover:bg-muted/50"
                onClick={() => window.location.href = '/dashboard/analytics'}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Analytics</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start space-x-2 hover:bg-muted/50 col-span-2 md:col-span-1"
                onClick={() => window.location.href = '/dashboard/configuracion'}
              >
                <Clock className="h-4 w-4" />
                <span>Configuración</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}