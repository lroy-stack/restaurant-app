'use client'

import * as React from "react"
import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Reservation {
  id: string
  customerName: string
  time: string
  date: string
  tableId: string
  partySize: number
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  specialRequests?: string
  hasPreOrder?: boolean
  tables?: {
    number: string
    location: string
  }
}

interface UpcomingReservationsWidgetProps {
  reservations: Reservation[]
  loading?: boolean
  onViewAll?: () => void
  className?: string
}

export function UpcomingReservationsWidget({
  reservations,
  loading = false,
  onViewAll,
  className
}: UpcomingReservationsWidgetProps) {
  const activeReservations = reservations
    ?.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING')
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(0, 4) || []

  const todayReservations = reservations?.filter(r =>
    new Date(r.date).toDateString() === new Date().toDateString() &&
    (r.status === 'CONFIRMED' || r.status === 'PENDING')
  ) || []

  const pendingCount = reservations?.filter(r => r.status === 'PENDING').length || 0
  const totalGuests = todayReservations.reduce((sum, r) => sum + r.partySize, 0)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>Próximas Reservas</CardTitle>
          <p className="text-sm text-muted-foreground">
            {activeReservations.length || 0} reservas activas
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onViewAll}
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
                  <Skeleton className="h-6 w-6 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : activeReservations.length > 0 ? (
            activeReservations.map((reservation) => {
              try {
                const reservationDateTime = new Date(reservation.time)
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
                  <div key={reservation.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-md ${
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
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
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
        {activeReservations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Hoy</p>
                <p className="text-sm font-medium">
                  {todayReservations.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Pendientes</p>
                <p className="text-sm font-medium text-accent">
                  {pendingCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Comensales</p>
                <p className="text-sm font-medium">
                  {totalGuests}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
