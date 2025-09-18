'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Star,
  Edit,
  X
} from 'lucide-react'

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
  hasPreOrder: boolean
  tableId: string
  tables: {
    id: string
    number: string
    capacity: number
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  } | null
  createdAt: string
  updatedAt: string
}

interface ReservationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onEdit?: () => void
}

const statusStyles = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: '🟢' },
  SEATED: { label: 'En Mesa', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
  COMPLETED: { label: 'Completada', color: 'bg-gray-100 text-gray-800', icon: '⚪' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: '🔴' },
  NO_SHOW: { label: 'No Show', color: 'bg-orange-100 text-orange-800', icon: '🟠' }
}

const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

function formatDateTime(date: string, time: string) {
  const reservationDate = new Date(date)
  const reservationTime = new Date(`${date}T${time}`)

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  let dateLabel = reservationDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (reservationDate.toDateString() === today.toDateString()) {
    dateLabel = 'Hoy'
  } else if (reservationDate.toDateString() === tomorrow.toDateString()) {
    dateLabel = 'Mañana'
  }

  const timeLabel = reservationTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return { dateLabel, timeLabel }
}

export function ReservationDetailModal({ isOpen, onClose, reservation, onEdit }: ReservationDetailModalProps) {
  if (!reservation) return null

  const { dateLabel, timeLabel } = formatDateTime(reservation.date, reservation.time)
  const statusInfo = statusStyles[reservation.status]
  const isVipCustomer = reservation.customerEmail.includes('vip')

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles de Reservación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Status */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {reservation.customerName}
                </h2>
                {isVipCustomer && (
                  <Star className="w-4 h-4 text-yellow-500" title="Cliente VIP" />
                )}
              </div>
              <p className="text-sm text-gray-500">ID: {reservation.id}</p>
            </div>
            <Badge className={`${statusInfo.color} flex items-center gap-2`}>
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="border-t" />

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-foreground">{dateLabel}</p>
                <p className="text-xs text-gray-500">
                  {new Date(reservation.date).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-foreground">{timeLabel}</p>
                <p className="text-xs text-gray-500">Duración: 2.5 horas</p>
              </div>
            </div>
          </div>

          {/* Party Size & Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {reservation.partySize} persona{reservation.partySize !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500">Tamaño del grupo</p>
              </div>
            </div>

            {reservation.tables && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Mesa {reservation.tables.number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {locationLabels[reservation.tables.location]}
                  </p>
                  <p className="text-xs text-gray-500">
                    Capacidad: {reservation.tables.capacity} personas
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t" />

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">Información de Contacto</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{reservation.customerEmail}</p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
                <Button size="sm" variant="outline">
                  Enviar Email
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{reservation.customerPhone}</p>
                  <p className="text-xs text-gray-500">Teléfono</p>
                </div>
                <Button size="sm" variant="outline">
                  Llamar
                </Button>
              </div>
            </div>
          </div>

          {/* Special Requests & Pre-order */}
          {(reservation.specialRequests || reservation.hasPreOrder) && (
            <>
              <div className="border-t" />
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-foreground">Información Adicional</h3>

                {reservation.specialRequests && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Solicitudes Especiales</p>
                      <p className="text-sm text-gray-700">{reservation.specialRequests}</p>
                    </div>
                  </div>
                )}

                {reservation.hasPreOrder && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Pre-orden Realizada</p>
                      <p className="text-xs text-gray-500">El cliente ha realizado una pre-orden</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="border-t" />
          <div className="space-y-2 text-xs text-gray-500">
            <p>
              <strong>Creado:</strong>{' '}
              {new Date(reservation.createdAt).toLocaleString('es-ES')}
            </p>
            <p>
              <strong>Actualizado:</strong>{' '}
              {new Date(reservation.updatedAt).toLocaleString('es-ES')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
            {onEdit && (
              <Button onClick={onEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit className="w-4 h-4 mr-2" />
                Editar Reservación
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}