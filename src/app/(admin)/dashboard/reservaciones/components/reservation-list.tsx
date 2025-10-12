'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReservationActions } from './reservation-actions'
import { 
  CalendarDays, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface Table {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
}

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  specialRequests?: string
  dietaryNotes?: string
  hasPreOrder: boolean
  table_ids: string[] // ✅ NEW: Array of table IDs
  tableId?: string // Legacy compatibility
  tables: Table[] | null // ✅ NEW: Array of tables
  createdAt: string
  updatedAt: string
}

interface ReservationListProps {
  reservations: Reservation[]
  loading: boolean
  userRole?: string
  onStatusUpdate?: (id: string, status: string, additionalData?: any) => void
}

const statusConfig = {
  PENDING: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: AlertCircle, 
    label: 'Pendiente' 
  },
  CONFIRMED: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle, 
    label: 'Confirmada' 
  },
  SEATED: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Users, 
    label: 'En Mesa' 
  },
  COMPLETED: { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: CheckCircle, 
    label: 'Completada' 
  },
  CANCELLED: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle, 
    label: 'Cancelada' 
  },
  NO_SHOW: { 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: AlertCircle, 
    label: 'No Show' 
  }
}

const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

export function ReservationList({ 
  reservations, 
  loading, 
  userRole = 'STAFF',
  onStatusUpdate 
}: ReservationListProps) {
  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr)
    const time = new Date(timeStr)
    return {
      date: date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }),
      time: time.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay reservas
          </h3>
          <p className="text-gray-500">
            No se encontraron reservas con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => {
        const { date, time } = formatDateTime(reservation.date, reservation.time)
        const statusInfo = statusConfig[reservation.status]
        const StatusIcon = statusInfo.icon

        return (
          <div key={reservation.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Reservation Card */}
            <Card className="hover:shadow-md transition-shadow lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {reservation.customerName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {reservation.customerEmail}
                      </div>
                      {reservation.customerPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {reservation.customerPhone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{reservation.partySize} personas</span>
                  </div>
                  {reservation.tables && reservation.tables.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>
                        {reservation.tables.length === 1
                          ? `Mesa ${reservation.tables[0].number} - ${locationLabels[reservation.tables[0].location]}`
                          : `${reservation.tables.length} mesas - ${reservation.tables.map(t => t.number).join(', ')}`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {reservation.specialRequests && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Solicitudes especiales:</strong> {reservation.specialRequests}
                    </p>
                  </div>
                )}

                {reservation.dietaryNotes && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
                    <p className="text-sm text-red-700">
                      <strong>Peticiones dietéticas:</strong> {reservation.dietaryNotes}
                    </p>
                  </div>
                )}

                {reservation.hasPreOrder && (
                  <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-3 h-3" />
                    <span>Pre-orden confirmada</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Creada: {new Date(reservation.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {reservation.id.slice(0, 8)}...
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <div className="lg:col-span-1">
              <ReservationActions 
                reservation={reservation}
                userRole={userRole}
                onStatusUpdate={onStatusUpdate}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}