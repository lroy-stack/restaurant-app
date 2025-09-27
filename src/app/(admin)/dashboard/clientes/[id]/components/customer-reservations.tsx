'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Plus,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ReservationDetailModal } from '../../../reservaciones/components/reservation-detail-modal'

// Based on actual database schema
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

interface ReservationItem {
  id: string
  quantity: number
  notes?: string
  menuItemId: string
  reservationId: string
  menu_items?: {
    id: string
    name: string
    price: number
    categoryId: string
    menu_categories?: {
      name: string
      type: string
    }
  }
}

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  status: ReservationStatus
  specialRequests?: string
  occasion?: string
  dietaryNotes?: string
  preferredLanguage?: string
  hasPreOrder: boolean
  tableId?: string
  restaurantId?: string
  createdAt: string
  updatedAt: string
  marketingConsent?: boolean
  consentDataProcessing?: boolean
  consentEmail?: boolean
  consentMarketing?: boolean
  consentDataProcessingTimestamp?: string
  consentEmailTimestamp?: string
  consentMarketingTimestamp?: string
  consentIpAddress?: string
  consentUserAgent?: string
  gdprPolicyVersion?: string
  consentMethod?: string
  customerId?: string
  reservation_items?: ReservationItem[]
}

interface CustomerReservationsProps {
  customerId: string
  reservations: Reservation[]
  onViewReservation: (reservationId: string) => void
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏳'
  },
  CONFIRMED: {
    label: 'Confirmada',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '✅'
  },
  SEATED: {
    label: 'Sentados',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🪑'
  },
  COMPLETED: {
    label: 'Completada',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✨'
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '❌'
  },
  NO_SHOW: {
    label: 'No-Show',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '👻'
  }
}

// Default source since the field doesn't exist in DB yet
const DEFAULT_SOURCE = { label: 'Web', icon: Globe }

export function CustomerReservations({
  customerId,
  reservations: initialReservations,
  onViewReservation
}: CustomerReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [loading, setLoading] = useState(false)
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'ALL'>('ALL')
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null)

  // Fetch reservations from API with prepedido items
  const fetchReservations = async () => {
    try {
      setLoading(true)
      // Include reservation items for prepedido details
      const response = await fetch(`/api/customers/${customerId}/reservations?includeItems=true`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReservations(data.reservations)
        } else {
          toast.error(data.error || 'Error al cargar reservas')
        }
      } else {
        toast.error('Error al cargar reservas')
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
      toast.error('Error de conexión al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialReservations.length === 0) {
      fetchReservations()
    }
  }, [customerId])

  const formatDateTime = (date: string, time: string) => {
    // FIXED: Both date and time are full timestamps, use time field as primary
    const reservationDate = new Date(time)

    // Validate the date
    if (isNaN(reservationDate.getTime())) {
      // Fallback to date field if time is invalid
      const fallbackDate = new Date(date)
      if (isNaN(fallbackDate.getTime())) {
        return {
          date: 'Fecha inválida',
          time: 'Hora inválida'
        }
      }
      return {
        date: fallbackDate.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        time: fallbackDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }

    return {
      date: reservationDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: reservationDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getDaysFromNow = (date: string) => {
    const reservationDate = new Date(date)
    const now = new Date()
    const diffTime = reservationDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays === -1) return 'Ayer'
    if (diffDays > 0) return `En ${diffDays} días`
    return `Hace ${Math.abs(diffDays)} días`
  }

  const filteredReservations = statusFilter === 'ALL'
    ? reservations
    : reservations.filter(r => r.status === statusFilter)

  const sortedReservations = [...filteredReservations].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const upcomingReservations = reservations.filter(r =>
    new Date(r.date) > new Date() && ['PENDING', 'CONFIRMED'].includes(r.status)
  )

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const isExpanded = expandedReservation === reservation.id
    const statusConfig = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.PENDING
    const sourceConfig = DEFAULT_SOURCE // Use default since source field doesn't exist
    const SourceIcon = sourceConfig.icon
    const { date, time } = formatDateTime(reservation.date, reservation.time)

    return (
      <div className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusConfig.color}>
                {statusConfig.icon} {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <SourceIcon className="h-3 w-3 mr-1" />
                {sourceConfig.label}
              </Badge>
              {reservation.hasPreOrder && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  📋 Pre-order
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {getDaysFromNow(reservation.date)}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedReservation(isExpanded ? null : reservation.id)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="font-medium">{time}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{reservation.partySize} personas</span>
          </div>
        </div>

        {/* Occasion */}
        {reservation.occasion && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-pink-600" />
            <span className="text-muted-foreground">Ocasión:</span>
            <span className="font-medium">{reservation.occasion}</span>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t">
            {/* Special Requests */}
            {reservation.specialRequests && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Solicitudes Especiales</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6 bg-blue-50 p-2 rounded">
                  {reservation.specialRequests}
                </p>
              </div>
            )}

            {/* Dietary Notes */}
            {reservation.dietaryNotes && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Notas Dietéticas</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6 bg-green-50 p-2 rounded">
                  {reservation.dietaryNotes}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <div className="text-sm font-medium mb-2">Cronología</div>
              <div className="space-y-1 text-xs text-muted-foreground pl-4 border-l-2 border-gray-200">
                <div>📅 Creada: {new Date(reservation.createdAt).toLocaleString('es-ES')}</div>

                {reservation.confirmationSentAt && (
                  <div>✅ Confirmación enviada: {new Date(reservation.confirmationSentAt).toLocaleString('es-ES')}</div>
                )}

                {reservation.reminderSentAt && (
                  <div>🔔 Recordatorio enviado: {new Date(reservation.reminderSentAt).toLocaleString('es-ES')}</div>
                )}

                {reservation.checkedInAt && (
                  <div>🏁 Check-in: {new Date(reservation.checkedInAt).toLocaleString('es-ES')}</div>
                )}

                {reservation.completedAt && (
                  <div>🎉 Completada: {new Date(reservation.completedAt).toLocaleString('es-ES')}</div>
                )}

                {reservation.cancelledAt && (
                  <div>❌ Cancelada: {new Date(reservation.cancelledAt).toLocaleString('es-ES')}</div>
                )}
              </div>
            </div>

            {/* Cancellation Reason */}
            {reservation.cancellationReason && (
              <div>
                <div className="text-sm font-medium mb-2 text-red-600">Motivo de Cancelación</div>
                <p className="text-sm text-muted-foreground bg-red-50 p-2 rounded">
                  {reservation.cancellationReason}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingReservation(reservation)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver Detalles
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Historial de Reservas
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'ALL')}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="ALL">Todas</option>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/reservaciones/nueva">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Reserva
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reservations.length}</div>
            <div className="text-sm text-muted-foreground">Total Reservas</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reservations.filter(r => r.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{upcomingReservations.length}</div>
            <div className="text-sm text-muted-foreground">Próximas</div>
          </div>
        </div>

        <Separator />

        {/* Reservations List */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : sortedReservations.length > 0 ? (
          <div className="space-y-3">
            {sortedReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Sin reservas</h3>
            <p className="text-sm">
              {statusFilter === 'ALL'
                ? 'Este cliente no tiene reservas registradas.'
                : `No hay reservas con estado "${STATUS_CONFIG[statusFilter as ReservationStatus]?.label}".`
              }
            </p>
          </div>
        )}
      </CardContent>

      {/* Modal de Detalles - USANDO EL MODAL QUE YA EXISTE */}
      <ReservationDetailModal
        isOpen={!!viewingReservation}
        onClose={() => setViewingReservation(null)}
        reservation={viewingReservation}
        onEdit={() => {
          // Opcional: funcionalidad de edición
          setViewingReservation(null)
        }}
      />
    </Card>
  )
}