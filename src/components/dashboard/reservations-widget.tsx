'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  tableId?: string
  tableNumber?: string
  specialRequests?: string
}

interface ReservationsWidgetProps {
  reservations: Reservation[]
  isLoading?: boolean
  onViewAll: () => void
  onRefresh: () => void
  className?: string
}

const statusConfig = {
  CONFIRMED: {
    label: 'Confirmada',
    variant: 'default' as const,
    icon: CheckCircle2,
    color: 'text-green-600'
  },
  PENDING: {
    label: 'Pendiente',
    variant: 'warning' as const,
    icon: AlertCircle,
    color: 'text-yellow-600'
  },
  CANCELLED: {
    label: 'Cancelada',
    variant: 'destructive' as const,
    icon: X,
    color: 'text-red-600'
  }
}

export function ReservationsWidget({
  reservations,
  isLoading = false,
  onViewAll,
  onRefresh,
  className
}: ReservationsWidgetProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return timeString
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Hoy'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Mañana'
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })
      }
    } catch {
      return dateString
    }
  }

  const handleQuickAction = (action: string, reservation: Reservation) => {
    console.log(`Quick action: ${action} for reservation ${reservation.id}`)
    // Aquí se implementarían las acciones rápidas
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Próximas Reservas</span>
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-36 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Próximas Reservas</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <Clock className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onViewAll}>
              Ver todas
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay reservas próximas
            </p>
            <Link href="/dashboard/reservaciones">
              <Button variant="outline" size="sm" className="mt-3">
                Crear nueva reserva
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.slice(0, 5).map((reservation) => {
              const statusInfo = statusConfig[reservation.status]
              const StatusIcon = statusInfo.icon
              const isExpanded = expandedId === reservation.id

              return (
                <div
                  key={reservation.id}
                  className={cn(
                    "p-4 border rounded-lg transition-all duration-200",
                    "hover:shadow-sm hover:border-border",
                    reservation.status === 'CONFIRMED' && "border-green-200 bg-green-50/50",
                    reservation.status === 'PENDING' && "border-yellow-200 bg-yellow-50/50",
                    reservation.status === 'CANCELLED' && "border-red-200 bg-red-50/50"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
                        <span className="font-medium text-foreground">
                          {reservation.customerName}
                        </span>
                      </div>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleQuickAction('view', reservation)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleQuickAction('edit', reservation)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setExpandedId(isExpanded ? null : reservation.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {isExpanded ? 'Contraer' : 'Expandir'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Basic Info */}
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(reservation.date)} · {formatTime(reservation.time)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{reservation.partySize} {reservation.partySize === 1 ? 'persona' : 'personas'}</span>
                    </div>
                  </div>

                  {reservation.tableNumber && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Mesa {reservation.tableNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{reservation.customerEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{reservation.customerPhone}</span>
                        </div>
                        {reservation.specialRequests && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-md">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Solicitudes especiales:
                            </p>
                            <p className="text-sm text-foreground">
                              {reservation.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {reservations.length > 5 && (
              <div className="text-center pt-3">
                <Button variant="ghost" size="sm" onClick={onViewAll}>
                  Ver {reservations.length - 5} reservas más
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}