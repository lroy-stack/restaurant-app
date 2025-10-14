'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  MessageSquare,
  Phone,
  Star,
  Utensils,
  Edit,
  Loader2
} from 'lucide-react'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { useReservations } from '@/hooks/useReservations'
import { MultiTableSelector } from './MultiTableSelector'
import { cn } from '@/lib/utils'

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
  childrenCount?: number | null
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  specialRequests?: string
  dietaryNotes?: string
  occasion?: string
  hasPreOrder: boolean
  table_ids: string[]
  tableId?: string
  reservation_items: ReservationItem[]
  tables: {
    id: string
    number: string
    capacity: number
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  }[] | null
}

interface ReservationCardProps {
  reservation: Reservation
  onStatusUpdate?: (id: string, status: string, additionalData?: any) => void
  onEdit: () => void
  onViewDetails: () => void
  onWhatsApp?: () => void
  onQuickEdit?: (reservationId: string, time: string, tableIds: string[]) => void
  bufferMinutes: number
}

// Status styles - using centralized design tokens from globals.css
const statusStyles = {
  PENDING: { emoji: '🟡', className: 'enigma-status-pending' },
  CONFIRMED: { emoji: '🟢', className: 'enigma-status-confirmed' },
  SEATED: { emoji: '🔵', className: 'enigma-status-seated' },
  COMPLETED: { emoji: '⚪', className: 'enigma-status-completed' },
  CANCELLED: { emoji: '🔴', className: 'enigma-status-cancelled' },
  NO_SHOW: { emoji: '🟠', className: 'enigma-status-no-show' }
}

const statusLabels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  SEATED: 'En Mesa',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No Show'
}

const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

function formatReservationDateTime(dateStr: string, timeStr: string) {
  try {
    const date = new Date(dateStr)
    const time = new Date(timeStr)

    if (isNaN(date.getTime()) || isNaN(time.getTime())) {
      return { date: 'Fecha inválida', time: 'Hora inválida' }
    }

    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    let dateFormatted: string
    if (date.toDateString() === today.toDateString()) {
      dateFormatted = 'Hoy'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateFormatted = 'Mañana'
    } else {
      dateFormatted = date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
    }

    const timeFormatted = time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })

    return { date: dateFormatted, time: timeFormatted }
  } catch (error) {
    return { date: 'Error fecha', time: 'Error hora' }
  }
}

function formatTableDisplay(reservation: Reservation): string {
  if (reservation.tables && reservation.tables.length > 0) {
    if (reservation.tables.length === 1) {
      return reservation.tables[0].number
    } else {
      return reservation.tables.map(t => t.number).join('+')
    }
  }
  return 'N/A'
}

function getUrgencyBadge(reservation: Reservation, bufferMinutes: number) {
  try {
    const now = new Date()
    const reservationDateTime = new Date(reservation.time)
    const minutesFromReservation = (now.getTime() - reservationDateTime.getTime()) / (1000 * 60)
    const hoursUntil = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (minutesFromReservation > bufferMinutes) {
      return { text: 'PASADA', variant: 'outline' as const }
    }

    if (minutesFromReservation >= 0 && minutesFromReservation <= bufferMinutes) {
      return { text: 'EN CURSO', variant: 'default' as const }
    }

    if (hoursUntil <= 2 && hoursUntil > 0) {
      return { text: 'URGENTE', variant: 'destructive' as const }
    }

    if (hoursUntil <= 6 && hoursUntil > 2) {
      return { text: 'PRONTO', variant: 'secondary' as const }
    }

    return null
  } catch (error) {
    return null
  }
}

export function ReservationCard({
  reservation,
  onStatusUpdate,
  onEdit,
  onViewDetails,
  onWhatsApp,
  onQuickEdit,
  bufferMinutes
}: ReservationCardProps) {
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [editedTime, setEditedTime] = useState('')
  const [editedTableIds, setEditedTableIds] = useState<string[]>([])
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const statusStyle = statusStyles[reservation.status]
  const urgencyBadge = getUrgencyBadge(reservation, bufferMinutes)
  const { date, time } = formatReservationDateTime(reservation.date, reservation.time)

  // Get business hours for time slots
  const reservationDate = new Date(reservation.date).toISOString().split('T')[0]
  const { timeSlots } = useBusinessHours(reservationDate)

  // Use existing hook for availability
  const {
    checkAvailability,
    availabilityResults,
    loading: loadingAvailability
  } = useReservations()

  const handleOpenQuickEdit = async () => {
    // Initialize with current values
    const currentTime = new Date(reservation.time)
    const timeString = currentTime.toISOString()
    setEditedTime(timeString)
    setEditedTableIds(reservation.table_ids || [reservation.tableId].filter(Boolean))
    setIsQuickEditOpen(true)

    // Load availability for current time
    await checkAvailability(timeString, reservation.partySize)
  }

  const handleTimeSlotSelect = async (timeHHMM: string) => {
    // Combine date + time in ISO format for checkAvailability
    const dateTimeISO = `${reservationDate}T${timeHHMM}:00`
    setEditedTime(dateTimeISO)

    // Check availability for this time
    await checkAvailability(dateTimeISO, reservation.partySize)
  }

  const handleSaveQuickEdit = () => {
    if (onQuickEdit && editedTime && editedTableIds.length > 0) {
      onQuickEdit(reservation.id, editedTime, editedTableIds)
      setIsQuickEditOpen(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-3 space-y-2">
        {/* Header: Status + Name */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-xs px-2 py-0.5 ${statusStyle.className}`}>
                {statusStyle.emoji} {statusLabels[reservation.status]}
              </Badge>
              {urgencyBadge && (
                <Badge variant={urgencyBadge.variant} className="text-xs px-1.5 py-0.5">
                  {urgencyBadge.text}
                </Badge>
              )}
            </div>
            <h3 className="text-base font-semibold truncate flex items-center gap-1">
              {reservation.customerName}
              {reservation.customerEmail.includes('vip') && (
                <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              )}
            </h3>
          </div>
        </div>

        {/* Info Row: Date/Time/People/Table */}
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono font-medium">{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{reservation.partySize}p</span>
            {reservation.childrenCount && reservation.childrenCount > 0 && (
              <span className="text-xs text-blue-600">({reservation.childrenCount}👶)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{formatTableDisplay(reservation)}</span>
          </div>
        </div>

        {/* Special Info */}
        {(reservation.hasPreOrder || reservation.specialRequests || reservation.dietaryNotes || reservation.occasion) && (
          <div className="flex flex-wrap gap-1.5">
            {reservation.hasPreOrder && reservation.reservation_items?.length > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                <Utensils className="h-3 w-3 mr-1" />
                Pre-pedido ({reservation.reservation_items.length})
              </Badge>
            )}
            {reservation.specialRequests && (
              <div className="w-full flex items-start gap-1.5 text-xs bg-accent/20 rounded p-1.5">
                <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{reservation.specialRequests}</span>
              </div>
            )}
            {reservation.dietaryNotes && (
              <div className="w-full flex items-start gap-1.5 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-1.5">
                <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5 text-amber-600" />
                <span className="font-medium text-amber-700 dark:text-amber-400">{reservation.dietaryNotes}</span>
              </div>
            )}
            {reservation.occasion && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary/10 border-primary/20">
                <Star className="h-3 w-3 mr-1" />
                {reservation.occasion}
              </Badge>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-1">
          {reservation.status === 'PENDING' && (
            <>
              <Sheet open={isQuickEditOpen} onOpenChange={setIsQuickEditOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenQuickEdit}
                    className="h-9 w-9 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-screen md:h-[700px] flex flex-col p-0">
                  <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-3 border-b">
                    <SheetTitle>Editar Reserva</SheetTitle>
                    <SheetDescription className="sr-only">
                      Modifica la hora y mesas de esta reserva
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-6">
                      {/* Time Slots - Using existing component */}
                      <div className="space-y-3">
                        <label className="text-base font-semibold">Selecciona Hora</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
                        {timeSlots.map((slot) => {
                          // slot.time is "HH:MM" format, editedTime is ISO format
                          const slotISO = `${reservationDate}T${slot.time}:00`
                          const isSelected = editedTime === slotISO

                          // Check if this is the current reservation time
                          const currentTime = new Date(reservation.time)
                          const currentTimeHHMM = currentTime.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })
                          const isCurrentTime = slot.time === currentTimeHHMM

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => handleTimeSlotSelect(slot.time)}
                              disabled={!slot.available}
                              className={cn(
                                'relative rounded-lg border p-3 text-base font-medium transition-all enigma-touch-target-sm',
                                isSelected && 'border-primary bg-primary text-primary-foreground font-bold shadow-md',
                                isCurrentTime && !isSelected && 'border-blue-400 bg-blue-50 text-blue-900 ring-2 ring-blue-200 dark:bg-blue-950 dark:text-blue-100',
                                !isSelected && !isCurrentTime && slot.available && 'border-border hover:border-primary/50 hover:bg-accent',
                                !slot.available && 'border-border bg-muted/30 opacity-40 cursor-not-allowed'
                              )}
                            >
                              {slot.time}
                              {isCurrentTime && !isSelected && (
                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                  ACTUAL
                                </span>
                              )}
                            </button>
                          )
                        })}
                        </div>
                      </div>

                      {/* Table Selector - Using existing component */}
                      {editedTime && availabilityResults && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-base font-semibold">Selecciona Mesas</label>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-blue-100 border-2 border-blue-400" />
                                <span>Actual</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-100 border border-green-400" />
                                <span>Disponible</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <MultiTableSelector
                              tables={availabilityResults.allTables}
                              selectedTableIds={editedTableIds}
                              onSelectionChange={setEditedTableIds}
                              partySize={reservation.partySize}
                              maxSelections={5}
                            />
                          </div>
                        </div>
                      )}

                      {loadingAvailability && (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">Cargando disponibilidad...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions - Fixed at bottom */}
                  <div className="flex-shrink-0 border-t bg-background px-6 py-4">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsQuickEditOpen(false)}
                        className="flex-1 h-12 text-base"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveQuickEdit}
                        disabled={!editedTime || editedTableIds.length === 0}
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-semibold text-base"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Guardar y Confirmar
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                size="sm"
                onClick={() => onStatusUpdate?.(reservation.id, 'CONFIRMED')}
                className="flex-1 h-9 text-sm bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Confirmar
              </Button>
              <Button
                size="sm"
                onClick={() => onStatusUpdate?.(reservation.id, 'CANCELLED')}
                variant="outline"
                className="h-9 w-9 p-0 border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
              </Button>
              {reservation.customerPhone && (
                <Button
                  size="sm"
                  onClick={onWhatsApp}
                  className="h-9 w-9 p-0 bg-[#25D366] hover:bg-[#20BA5A]"
                >
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </Button>
              )}
            </>
          )}

          {reservation.status === 'CONFIRMED' && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusUpdate?.(reservation.id, 'SEATED')}
                className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700"
              >
                <Users className="h-4 w-4 mr-1.5" />
                Sentar
              </Button>
              <Button
                size="sm"
                onClick={() => onStatusUpdate?.(reservation.id, 'NO_SHOW')}
                variant="outline"
                className="h-9 w-9 p-0 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
              {reservation.customerPhone && (
                <Button
                  size="sm"
                  onClick={onWhatsApp}
                  className="h-9 w-9 p-0 bg-[#25D366] hover:bg-[#20BA5A]"
                >
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </Button>
              )}
            </>
          )}

          {reservation.status === 'SEATED' && (
            <>
              <Button
                size="sm"
                onClick={() => setShowCompleteDialog(true)}
                className="flex-1 h-9 text-sm bg-gray-600 hover:bg-gray-700"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Completar
              </Button>
              {reservation.customerPhone && (
                <Button
                  size="sm"
                  onClick={onWhatsApp}
                  className="h-9 w-9 p-0 bg-[#25D366] hover:bg-[#20BA5A]"
                >
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </Button>
              )}
            </>
          )}

          {(reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED' || reservation.status === 'NO_SHOW') && (
            <Button
              size="sm"
              onClick={onViewDetails}
              variant="outline"
              className="flex-1 h-9 text-sm"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Ver Detalles
            </Button>
          )}
        </div>
      </CardContent>

      {/* Complete Reservation Dialog - Pregunta email de reseña */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Completar Reserva</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="text-sm">
                  ¿Deseas enviar un email solicitando una reseña al cliente?
                </div>
                <div className="text-xs text-muted-foreground">
                  Cliente: {reservation.customerName} ({reservation.customerEmail})
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={() => setShowCompleteDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onStatusUpdate?.(reservation.id, 'COMPLETED', { sendReviewEmail: false })
                setShowCompleteDialog(false)
              }}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Completar sin Email
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                onStatusUpdate?.(reservation.id, 'COMPLETED', { sendReviewEmail: true })
                setShowCompleteDialog(false)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Completar y Enviar Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
