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
  X,
  Utensils,
  Wine,
  Coffee,
  AlertTriangle
} from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  price: number
  menu_categories: {
    name: string
    type: string
  }
}

interface ReservationItem {
  id: string
  quantity: number
  notes?: string
  menu_items: MenuItem
}

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  childrenCount?: number | null // NEW: Niños hasta 8 años
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  specialRequests?: string
  dietaryNotes?: string
  hasPreOrder: boolean
  table_ids: string[] // ✅ NEW: Array of table IDs
  tableId?: string // Legacy compatibility
  reservation_items: ReservationItem[]
  tables: {
    id: string
    number: string
    capacity: number
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  }[] | null // ✅ NEW: Array of tables
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
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', icon: '🟡' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-500/10 text-green-700 dark:text-green-400', icon: '🟢' },
  SEATED: { label: 'En Mesa', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', icon: '🔵' },
  COMPLETED: { label: 'Completada', color: 'bg-muted text-muted-foreground', icon: '⚪' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500/10 text-red-700 dark:text-red-400', icon: '🔴' },
  NO_SHOW: { label: 'No Show', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400', icon: '🟠' }
}

const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

// 🆕 CLEAN MULTI-TABLE DISPLAY: Show multiple tables cleanly
function formatTableDisplay(reservation: Reservation): string {
  if (reservation.tables && reservation.tables.length > 0) {
    if (reservation.tables.length === 1) {
      return reservation.tables[0].number
    } else {
      // Multiple tables: "Mesa T1 + T2 + T3"
      return reservation.tables.map(t => t.number).join(' + ')
    }
  }

  // Fallback
  return 'N/A'
}

// 🆕 CLEAN CAPACITY CALCULATION: Sum capacities from table array
function calculateTotalCapacity(reservation: Reservation): number {
  if (reservation.tables && reservation.tables.length > 0) {
    return reservation.tables.reduce((total, table) => total + table.capacity, 0)
  }

  // Fallback
  return 0
}

// 🚀 CRITICAL FIX: Handle full timestamp format from backend
function createMadridDate(): Date {
  const nowUtc = new Date()
  // Add 2 hours to get Madrid time
  return new Date(nowUtc.getTime() + (2 * 60 * 60 * 1000))
}

function createReservationMadridDate(timestampStr: string): Date {
  try {
    // Backend sends timestamps like "2025-09-19 17:30:00" (without timezone)
    // These represent Madrid local time already stored correctly
    const cleanTimestamp = timestampStr.replace(' ', 'T')
    const date = new Date(cleanTimestamp)

    // If the date is valid, return it (it's already in Madrid local time)
    if (!isNaN(date.getTime())) {
      return date
    }

    // Fallback: try direct parsing
    return new Date(timestampStr)
  } catch (error) {
    console.error('Error creating Madrid date:', error, { timestampStr })
    return new Date() // Fallback
  }
}

function isSameDateMadrid(date1: Date, date2: Date): boolean {
  try {
    return date1.toDateString() === date2.toDateString()
  } catch (error) {
    console.error('Error comparing dates:', error)
    return false
  }
}

// 🚀 FIXED: formatDateTime working with backend timestamp format
function formatDateTime(date: string, time: string) {
  try {
    // Both date and time are full timestamps from backend: "2025-09-19 17:30:00"
    // Use the time timestamp as it's the actual reservation datetime
    const reservationDateTime = createReservationMadridDate(time)

    const todayMadrid = createMadridDate()
    const tomorrowMadrid = createMadridDate()
    tomorrowMadrid.setDate(tomorrowMadrid.getDate() + 1)

    let dateLabel = reservationDateTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    if (isSameDateMadrid(reservationDateTime, todayMadrid)) {
      dateLabel = 'Hoy'
    } else if (isSameDateMadrid(reservationDateTime, tomorrowMadrid)) {
      dateLabel = 'Mañana'
    }

    const timeLabel = reservationDateTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    return { dateLabel, timeLabel }
  } catch (error) {
    console.error('Error formatting datetime:', error, { date, time })
    return { dateLabel: 'Fecha inválida', timeLabel: 'Hora inválida' }
  }
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
              <p className="text-sm text-muted-foreground">ID: {reservation.id}</p>
            </div>
            <Badge className={`${statusInfo.color} flex items-center gap-2`}>
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="border-t" />

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{dateLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {createReservationMadridDate(reservation.date).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{timeLabel}</p>
                <p className="text-xs text-muted-foreground">Duración: 2.5 horas</p>
              </div>
            </div>
          </div>

          {/* Party Size & Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {reservation.partySize} persona{reservation.partySize !== 1 ? 's' : ''}
                </p>
                {reservation.childrenCount && reservation.childrenCount > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                    {reservation.partySize - reservation.childrenCount} adulto(s) + {reservation.childrenCount} niño(s)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Tamaño del grupo</p>
              </div>
            </div>

            {reservation.tables && reservation.tables.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {reservation.tables.length === 1 ? 'Mesa' : 'Mesas'} {formatTableDisplay(reservation)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reservation.tables.length === 1
                      ? locationLabels[reservation.tables[0].location]
                      : `${reservation.tables.length} mesas en ${[...new Set(reservation.tables.map(t => locationLabels[t.location]))].join(', ')}`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Capacidad total: {calculateTotalCapacity(reservation)} personas
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
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{reservation.customerEmail}</p>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
                <Button size="sm" variant="outline">
                  Enviar Email
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{reservation.customerPhone}</p>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                </div>
                <Button size="sm" variant="outline">
                  Llamar
                </Button>
              </div>
            </div>
          </div>

          {/* Special Requests, Dietary Notes & Pre-order */}
          {(reservation.specialRequests || reservation.dietaryNotes || reservation.hasPreOrder) && (
            <>
              <div className="border-t" />
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Información Adicional</h3>

                {reservation.specialRequests && (
                  <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Solicitudes Especiales</p>
                      <p className="text-sm text-foreground/80">{reservation.specialRequests}</p>
                    </div>
                  </div>
                )}

                {reservation.dietaryNotes && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Peticiones Dietéticas</p>
                      <p className="text-sm text-foreground/80">{reservation.dietaryNotes}</p>
                    </div>
                  </div>
                )}

                {reservation.hasPreOrder && reservation.reservation_items && reservation.reservation_items.length > 0 && (
                  <div className="bg-green-500/10 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Pre-orden Realizada</p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.reservation_items.length} producto{reservation.reservation_items.length !== 1 ? 's' : ''} seleccionado{reservation.reservation_items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Pre-order Items List */}
                    <div className="space-y-2 mt-3">
                      <h4 className="text-sm font-medium text-foreground mb-2">Productos Pre-ordenados:</h4>
                      <div className="space-y-2">
                        {reservation.reservation_items.map((item) => {
                          const total = item.quantity * item.menu_items.price
                          const categoryType = item.menu_items?.menu_categories?.type || 'DISH'

                          return (
                            <div key={item.id} className="flex items-start gap-3 p-3 bg-card rounded-md border border-border">
                              {/* Category Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                {categoryType === 'WINE' ? (
                                  <Wine className="w-4 h-4 text-red-600 dark:text-red-400" />
                                ) : categoryType === 'BEVERAGE' ? (
                                  <Coffee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <Utensils className="w-4 h-4 text-green-600 dark:text-green-400" />
                                )}
                              </div>

                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium text-foreground line-clamp-2">
                                      {item.menu_items.name}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {item.menu_items.menu_categories.name} • {categoryType.toLowerCase()}
                                    </p>
                                    {item.notes && (
                                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 italic">
                                        📝 {item.notes}
                                      </p>
                                    )}
                                  </div>

                                  {/* Quantity & Price */}
                                  <div className="text-right ml-3 flex-shrink-0">
                                    <div className="text-sm font-medium text-foreground">
                                      {item.quantity}x €{item.menu_items.price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Total: €{total.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Pre-order Summary */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-foreground">
                            Total Pre-orden:
                          </span>
                          <span className="font-bold text-green-700 dark:text-green-400">
                            €{reservation.reservation_items.reduce((sum, item) =>
                              sum + (item.quantity * item.menu_items.price), 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                          <span>
                            {reservation.reservation_items.reduce((sum, item) => sum + item.quantity, 0)} productos totales
                          </span>
                          <span>
                            Promedio: €{(
                              reservation.reservation_items.reduce((sum, item) =>
                                sum + (item.quantity * item.menu_items.price), 0
                              ) / reservation.reservation_items.reduce((sum, item) => sum + item.quantity, 0)
                            ).toFixed(2)} por producto
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {reservation.hasPreOrder && (!reservation.reservation_items || reservation.reservation_items.length === 0) && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Pre-orden Detectada</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">No se pudieron cargar los detalles de la pre-orden</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="border-t" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>Creado:</strong>{' '}
              {createReservationMadridDate(reservation.createdAt).toLocaleString('es-ES')}
            </p>
            <p>
              <strong>Actualizado:</strong>{' '}
              {createReservationMadridDate(reservation.updatedAt).toLocaleString('es-ES')}
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