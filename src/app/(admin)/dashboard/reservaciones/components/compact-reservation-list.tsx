'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ReservationCard } from '@/components/reservations/ReservationCard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Star,
  MessageSquare,
  Edit,
  Eye,
  Timer,
  Wine,
  Utensils
} from 'lucide-react'
import { EditReservationModal } from './edit-reservation-modal'
import { ReservationDetailModal } from './reservation-detail-modal'
import { CancellationModal } from './cancellation-modal'
import { CustomEmailComposer } from '@/components/email/custom-email-composer'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useBusinessHours } from '@/hooks/useBusinessHours'
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
import { Trash2 } from 'lucide-react'

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
}

interface CompactReservationListProps {
  reservations: Reservation[]
  loading: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onStatusUpdate?: (id: string, status: string, additionalData?: any) => void
  onReservationUpdate?: (id: string, data: any) => Promise<boolean>
  onReservationDelete?: (id: string) => Promise<void>
  bulkMode?: boolean
}

// Status indicators with proper Enigma brand colors
const statusStyles = {
  PENDING: { emoji: '🟡', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CONFIRMED: { emoji: '🟢', color: 'bg-green-50 text-green-700 border-green-200' },
  SEATED: { emoji: '🔵', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { emoji: '⚪', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  CANCELLED: { emoji: '🔴', color: 'bg-red-50 text-red-700 border-red-200' },
  NO_SHOW: { emoji: '🟠', color: 'bg-orange-50 text-orange-700 border-orange-200' }
}

const statusLabels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  SEATED: 'En Mesa',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No Show'
}

// Location mapping for display
const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

const locationShort = {
  TERRACE_CAMPANARI: 'T.Camp',
  SALA_VIP: 'VIP',
  TERRACE_JUSTICIA: 'T.Just',
  SALA_PRINCIPAL: 'S.Prin'
}

// 🚀 ESTABLISHED PROJECT PATTERNS: Following existing formatDateTime pattern
function formatReservationDateTime(dateStr: string, timeStr: string) {
  try {
    const date = new Date(dateStr)
    const time = new Date(timeStr)

    if (isNaN(date.getTime()) || isNaN(time.getTime())) {
      return {
        date: 'Fecha inválida',
        time: 'Hora inválida'
      }
    }

    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    // Format date with today/tomorrow logic
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

    // Format time using established pattern
    const timeFormatted = time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })

    return {
      date: dateFormatted,
      time: timeFormatted
    }
  } catch (error) {
    return {
      date: 'Error fecha',
      time: 'Error hora'
    }
  }
}

// Enhanced temporal badge logic with DYNAMIC buffer from DB
function getUrgencyBadge(reservation: Reservation, bufferMinutes: number) {
  try {
    const now = new Date()
    const reservationDateTime = new Date(reservation.time)
    const minutesFromReservation = (now.getTime() - reservationDateTime.getTime()) / (1000 * 60)
    const hoursUntil = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    // 🚀 DYNAMIC: Use buffer from business_hours table (changeable 150→120 etc.)
    // No more hardcoded values - fully flexible with DB configuration

    // 🔴 PASADA: More than [bufferMinutes] after reservation time
    if (minutesFromReservation > bufferMinutes) {
      return { text: 'PASADA', variant: 'outline' as const, icon: XCircle }
    }

    // 🟢 EN CURSO: From reservation time until +[bufferMinutes] after
    if (minutesFromReservation >= 0 && minutesFromReservation <= bufferMinutes) {
      return { text: 'EN CURSO', variant: 'default' as const, icon: CheckCircle }
    }

    // ⚡ URGENTE: ≤2h before reservation (existing logic)
    if (hoursUntil <= 2 && hoursUntil > 0) {
      return { text: 'URGENTE', variant: 'destructive' as const, icon: Timer }
    }

    // 🟡 PRONTO: ≤6h before reservation (existing logic)
    if (hoursUntil <= 6 && hoursUntil > 2) {
      return { text: 'PRONTO', variant: 'secondary' as const, icon: Clock }
    }

    return null
  } catch (error) {
    return null
  }
}

// 🆕 CLEAN MULTI-TABLE DISPLAY: Show multiple tables cleanly
function formatTableDisplay(reservation: Reservation): string {
  if (reservation.tables && reservation.tables.length > 0) {
    if (reservation.tables.length === 1) {
      return reservation.tables[0].number
    } else {
      // Multiple tables: "T1+T2+T3"
      return reservation.tables.map(t => t.number).join('+')
    }
  }

  // Fallback
  return 'N/A'
}

// Group reservations by urgency - Using established patterns
function groupReservationsByUrgency(reservations: Reservation[]) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const groups = {
      PASADAS: [] as Reservation[],
      HOY: [] as Reservation[],
      MAÑANA: [] as Reservation[],
      PRÓXIMOS_DÍAS: [] as Reservation[]
    }

    reservations.forEach(reservation => {
      try {
        const reservationDate = new Date(reservation.date)
        reservationDate.setHours(0, 0, 0, 0)

        if (reservationDate.getTime() < today.getTime()) {
          groups.PASADAS.push(reservation)
        } else if (reservationDate.getTime() === today.getTime()) {
          groups.HOY.push(reservation)
        } else if (reservationDate.getTime() === tomorrow.getTime()) {
          groups.MAÑANA.push(reservation)
        } else {
          groups.PRÓXIMOS_DÍAS.push(reservation)
        }
      } catch (error) {
        groups.PRÓXIMOS_DÍAS.push(reservation)
      }
    })

    // Sort each group by time
    const sortReservations = (a: Reservation, b: Reservation): number => {
      try {
        const aDateTime = new Date(a.time)
        const bDateTime = new Date(b.time)
        return aDateTime.getTime() - bDateTime.getTime()
      } catch (error) {
        return 0
      }
    }

    groups.PASADAS.sort((a, b) => sortReservations(b, a)) // Reverse for past dates
    groups.HOY.sort(sortReservations)
    groups.MAÑANA.sort(sortReservations)
    groups.PRÓXIMOS_DÍAS.sort(sortReservations)

    return groups
  } catch (error) {
    return {
      PASADAS: [],
      HOY: [],
      MAÑANA: [],
      PRÓXIMOS_DÍAS: reservations
    }
  }
}

// Actions dropdown component
function ReservationActions({
  reservation,
  onEdit,
  onViewDetails,
  onStatusUpdate,
  onDelete
}: {
  reservation: Reservation
  onEdit: () => void
  onViewDetails: () => void
  onStatusUpdate?: (id: string, status: string, additionalData?: any) => void
  onDelete?: (id: string) => void
}) {
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)


  const getPredefinedTemplates = async () => {
    try {
      const response = await fetch('/api/emails/custom?templates=predefined')
      const result = await response.json()

      if (response.ok && result.success) {
        return result.templates
      }
      return []
    } catch (error) {
      console.error('❌ Error fetching templates:', error)
      return []
    }
  }

  const handleStatusChange = (newStatus: string, additionalData?: any) => {
    // Interceptar COMPLETED para mostrar modal de confirmación
    if (newStatus === 'COMPLETED') {
      setShowCompleteDialog(true)
      return
    }
    onStatusUpdate?.(reservation.id, newStatus, additionalData)
  }

  const handleCompleteReservation = (sendReviewEmail: boolean) => {
    onStatusUpdate?.(reservation.id, 'COMPLETED', { sendReviewEmail })
    setShowCompleteDialog(false)
  }

  const handleCancellation = (data: { notes: string; restaurantMessage?: string }) => {
    onStatusUpdate?.(reservation.id, 'CANCELLED', data)
  }

  const handleWhatsApp = () => {
    if (!reservation.customerPhone) return

    const cleanPhone = reservation.customerPhone.replace(/[\s\-\(\)]/g, '')
    const phoneWithCountry = cleanPhone.startsWith('+')
      ? cleanPhone.substring(1)
      : cleanPhone.startsWith('34')
        ? cleanPhone
        : `34${cleanPhone}`

    const { date, time } = formatReservationDateTime(reservation.date, reservation.time)
    const message = encodeURIComponent(
      `Hola ${reservation.customerName}, te contacto sobre tu reserva para ${reservation.partySize} personas el ${date} a las ${time}.`
    )

    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank')
  }

  // Handler for mobile card
  const handleMobileStatusUpdate = (status: string) => {
    handleStatusChange(status)
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(reservation.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting reservation:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {/* 🎯 ACCESO RÁPIDO: PENDING → Confirmar + Cancelar */}
        {reservation.status === 'PENDING' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex h-8 w-8 p-0 text-white bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusChange('CONFIRMED')}
              title="Confirmar reserva"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex h-8 w-8 p-0 text-white bg-red-600 hover:bg-red-700"
              onClick={() => setShowCancellationModal(true)}
              title="Cancelar reserva"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* 🎯 ACCESO RÁPIDO: CONFIRMED → Sentar + No Show */}
        {reservation.status === 'CONFIRMED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex h-8 w-8 p-0 text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => handleStatusChange('SEATED')}
              title="Sentar en mesa"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex h-8 w-8 p-0 text-white bg-orange-600 hover:bg-orange-700"
              onClick={() => handleStatusChange('NO_SHOW')}
              title="Marcar No Show"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* 🎯 ACCESO RÁPIDO: SEATED → Completar */}
        {reservation.status === 'SEATED' && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 w-8 p-0 text-white bg-gray-600 hover:bg-gray-700"
            onClick={() => handleStatusChange('COMPLETED')}
            title="Completar servicio"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}

        {/* ✅ WhatsApp siempre visible (si tiene teléfono) */}
        {reservation.customerPhone && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 w-8 p-0 text-white bg-[#25D366] hover:bg-[#20BA5A]"
            onClick={handleWhatsApp}
            title="Contactar por WhatsApp"
          >
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </Button>
        )}

        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2 text-blue-600" />
              Editar Reserva
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="w-4 h-4 mr-2 text-purple-600" />
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Status Actions - Mobile: incluir acciones rápidas */}
            {reservation.status === 'PENDING' && (
              <>
                <DropdownMenuItem onClick={() => handleStatusChange('CONFIRMED')} className="md:hidden">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Confirmar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCancellationModal(true)} className="text-red-600 md:hidden">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </DropdownMenuItem>
              </>
            )}
            {reservation.status === 'CONFIRMED' && (
              <>
                <DropdownMenuItem onClick={() => handleStatusChange('SEATED')} className="md:hidden">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Sentar en Mesa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('NO_SHOW')} className="text-orange-600 md:hidden">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  No Show
                </DropdownMenuItem>
              </>
            )}
            {reservation.status === 'SEATED' && (
              <DropdownMenuItem onClick={() => handleStatusChange('COMPLETED')}>
                <CheckCircle className="w-4 h-4 mr-2 text-gray-600" />
                Completar
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Contact Actions */}
            {reservation.customerPhone && (
              <DropdownMenuItem onClick={handleWhatsApp} className="md:hidden">
                <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                WhatsApp
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </DropdownMenuItem>
            <CustomEmailComposer
              customerId={reservation.id}
              customerName={reservation.customerName}
              customerEmail={reservation.customerEmail}
              hasEmailConsent={true}
              onGetPredefinedTemplates={getPredefinedTemplates}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </DropdownMenuItem>
              }
            />

            <DropdownMenuSeparator />

            {/* Delete Action */}
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Reserva
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CancellationModal
        open={showCancellationModal}
        onOpenChange={setShowCancellationModal}
        reservationId={reservation.id}
        customerName={reservation.customerName}
        onConfirm={handleCancellation}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la reserva de <strong>{reservation.customerName}</strong> para {reservation.partySize} personas.
              <br /><br />
              Esta acción no se puede deshacer y se eliminarán todos los datos relacionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Reservation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completar Reserva
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="text-sm">
                  ¿Deseas enviar un email de solicitud de reseña a <strong>{reservation.customerName}</strong>?
                </div>
                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-foreground">📧 El email incluye:</div>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Enlaces a Google Reviews</li>
                    <li>Enlaces a TripAdvisor</li>
                    <li>Invitación a seguir en Instagram</li>
                    <li>Opción de hacer nueva reserva</li>
                  </ul>
                </div>
                <div className="text-xs text-muted-foreground">
                  La reserva se completará en ambos casos. Solo cambia si se envía el email.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setShowCompleteDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => handleCompleteReservation(false)}
              className="sm:mr-2"
            >
              Completar sin Email
            </Button>
            <AlertDialogAction
              onClick={() => handleCompleteReservation(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              ✓ Completar y Enviar Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function CompactReservationList({
  reservations,
  loading,
  selectedIds = [],
  onSelectionChange,
  onStatusUpdate,
  onReservationUpdate,
  onReservationDelete,
  bulkMode = false
}: CompactReservationListProps) {
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null)

  // 🚀 DYNAMIC BUFFER: Get buffer minutes from business hours (150→120 configurable)
  const { bufferMinutes } = useBusinessHours()

  const handleItemSelection = (id: string, checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter(sid => sid !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange(reservations.map(r => r.id))
    } else {
      onSelectionChange([])
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Reserva</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Mesa</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(4)].map((_, j) => (
                      <TableRow key={j}>
                        <TableCell><div className="h-4 w-4 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse"></div></TableCell>
                        <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse"></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Sin reservas
          </h3>
          <p className="text-muted-foreground">
            No hay reservas que coincidan con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group reservations by urgency - PRESERVE EXISTING LOGIC
  const groupedReservations = groupReservationsByUrgency(reservations)
  const hasAnyReservations = reservations.length > 0

  return (
    <div className="space-y-4">
      {/* Bulk Selection Header - PRESERVE EXISTING LOGIC */}
      {bulkMode && onSelectionChange && hasAnyReservations && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.length === reservations.length && reservations.length > 0}
                indeterminate={selectedIds.length > 0 && selectedIds.length < reservations.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.length > 0
                  ? `${selectedIds.length} seleccionada${selectedIds.length !== 1 ? 's' : ''}`
                  : 'Seleccionar todas'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile View: Card-based Layout */}
      <div className="lg:hidden space-y-4">
        {Object.entries(groupedReservations).map(([groupName, groupReservations]) => {
          if (groupReservations.length === 0) return null

          const groupTitle = {
            PASADAS: 'Reservas Pasadas',
            HOY: 'Hoy',
            MAÑANA: 'Mañana',
            PRÓXIMOS_DÍAS: 'Próximos Días'
          }[groupName] || groupName

          const groupColor = {
            PASADAS: 'border-l-gray-400',
            HOY: 'border-l-red-400',
            MAÑANA: 'border-l-orange-400',
            PRÓXIMOS_DÍAS: 'border-l-blue-400'
          }[groupName] || 'border-l-gray-400'

          return (
            <div key={groupName} className="space-y-2">
              <div className={`flex items-center justify-between px-3 py-2 bg-muted/30 rounded border-l-4 ${groupColor}`}>
                <h3 className="text-sm font-semibold">{groupTitle}</h3>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {groupReservations.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {groupReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onStatusUpdate={onStatusUpdate}
                    onEdit={() => setEditingReservation(reservation)}
                    onViewDetails={() => setViewingReservation(reservation)}
                    onQuickEdit={async (reservationId, timeISO, tableIds) => {
                      // Update reservation with new time and tables, then confirm
                      if (onReservationUpdate && onStatusUpdate) {
                        // timeISO is already in full ISO format "2025-10-14T19:00:00"
                        const success = await onReservationUpdate(reservationId, {
                          status: 'PENDING', // Required by API validation
                          time: timeISO, // Send full ISO timestamp
                          tableIds
                        })
                        if (success) {
                          // Then confirm the reservation
                          onStatusUpdate(reservationId, 'CONFIRMED')
                        }
                      }
                    }}
                    onWhatsApp={() => {
                      if (!reservation.customerPhone) return
                      const cleanPhone = reservation.customerPhone.replace(/[\s\-\(\)]/g, '')
                      const phoneWithCountry = cleanPhone.startsWith('+')
                        ? cleanPhone.substring(1)
                        : cleanPhone.startsWith('34')
                          ? cleanPhone
                          : `34${cleanPhone}`
                      const { date, time } = formatReservationDateTime(reservation.date, reservation.time)
                      const message = encodeURIComponent(
                        `Hola ${reservation.customerName}, te contacto sobre tu reserva para ${reservation.partySize} personas el ${date} a las ${time}.`
                      )
                      window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank')
                    }}
                    bufferMinutes={bufferMinutes}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View: Table Layout */}
      <div className="hidden lg:block space-y-4">
      {Object.entries(groupedReservations).map(([groupName, groupReservations]) => {
        if (groupReservations.length === 0) return null

        const groupTitle = {
          PASADAS: 'Reservas Pasadas',
          HOY: 'Hoy',
          MAÑANA: 'Mañana',
          PRÓXIMOS_DÍAS: 'Próximos Días'
        }[groupName] || groupName

        const groupColor = {
          PASADAS: 'border-l-gray-400',
          HOY: 'border-l-red-400',
          MAÑANA: 'border-l-orange-400',
          PRÓXIMOS_DÍAS: 'border-l-blue-400'
        }[groupName] || 'border-l-gray-400'

        return (
          <Card key={groupName} className={`${groupColor} border-l-4`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {groupTitle}
                </h3>
                <Badge variant="outline" className="font-medium">
                  {groupReservations.length} reserva{groupReservations.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* FIXED: Proper shadcn/ui Table container pattern */}
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {bulkMode && <TableHead className="w-12"></TableHead>}
                      <TableHead className="w-6"></TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell">Estado</TableHead>
                      <TableHead>Mesa</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead className="hidden md:table-cell">Contacto</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupReservations.map((reservation) => {
                      const urgencyBadge = getUrgencyBadge(reservation, bufferMinutes)
                      const statusStyle = statusStyles[reservation.status]

                      const hasExpandedContent = reservation.hasPreOrder && reservation.reservation_items?.length > 0 || reservation.specialRequests || reservation.dietaryNotes

                      return (
                        <React.Fragment key={reservation.id}>
                          <TableRow className="group">
                            {/* Bulk Selection */}
                            {bulkMode && (
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.includes(reservation.id)}
                                  onCheckedChange={(checked) => handleItemSelection(reservation.id, !!checked)}
                                />
                              </TableCell>
                            )}

                            {/* Status Emoji */}
                            <TableCell>
                              <span className="text-lg" title={statusLabels[reservation.status]}>
                                {statusStyle.emoji}
                              </span>
                            </TableCell>

                            {/* Customer Info */}
                            <TableCell>
                              <div className="space-y-1.5">
                                <div className="font-medium text-foreground flex items-center gap-1">
                                  {reservation.customerName}
                                  {reservation.customerEmail.includes('vip') && (
                                    <Star className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>
                                    {reservation.partySize}p
                                    {reservation.childrenCount && reservation.childrenCount > 0 && (
                                      <span className="text-[10px] text-blue-600 ml-1">
                                        ({reservation.childrenCount}👶)
                                      </span>
                                    )}
                                  </span>
                                  {urgencyBadge && (
                                    <Badge variant={urgencyBadge.variant} className="text-xs px-1">
                                      {urgencyBadge.text}
                                    </Badge>
                                  )}
                                </div>

                                {/* Badges/Detalles - Todos los dispositivos */}
                                <div className="flex flex-col gap-1 mt-2">
                                  {/* Pre-Order Items */}
                                  {reservation.hasPreOrder && reservation.reservation_items?.length > 0 && (
                                    <div className="bg-secondary/30 border border-secondary rounded p-2 space-y-1">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-foreground">
                                        <Utensils className="h-3 w-3" />
                                        Pre-pedido ({reservation.reservation_items.length} items)
                                      </div>
                                      <div className="space-y-0.5 pl-4 text-xs">
                                        {reservation.reservation_items.map((item, idx) => (
                                          <div key={idx} className="flex justify-between gap-2">
                                            <span>{item.quantity}x {item.menu_items.name}</span>
                                            <span className="text-muted-foreground">{item.menu_items.price}€</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Special Requests - Texto completo */}
                                  {reservation.specialRequests && (
                                    <div className="flex items-start gap-1 text-xs text-accent w-full">
                                      <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                      <span className="font-medium">{reservation.specialRequests}</span>
                                    </div>
                                  )}

                                  {/* Dietary Notes Badge */}
                                  {reservation.dietaryNotes && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border-border hover:bg-muted/80"
                                      title={reservation.dietaryNotes}
                                    >
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Dieta
                                    </Badge>
                                  )}

                                  {/* Occasion Badge */}
                                  {reservation.occasion && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                                      title={reservation.occasion}
                                    >
                                      <Star className="h-3 w-3 mr-1" />
                                      {reservation.occasion}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Status Badge */}
                            <TableCell className="hidden sm:table-cell">
                              <Badge className={`${statusStyle.color} border text-xs`}>
                                {statusLabels[reservation.status]}
                              </Badge>
                            </TableCell>

                            {/* Table Info */}
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {formatTableDisplay(reservation)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {reservation.tables && reservation.tables.length > 0 ? locationShort[reservation.tables[0].location] : ''}
                                </div>
                              </div>
                            </TableCell>

                            {/* Date - CLEAN & CLEAR */}
                            <TableCell>
                              <div className="text-sm font-semibold">
                                {formatReservationDateTime(reservation.date, reservation.time).date}
                              </div>
                            </TableCell>

                            {/* Time - CLEAN & CLEAR */}
                            <TableCell>
                              <div className="text-sm font-mono font-semibold">
                                {formatReservationDateTime(reservation.date, reservation.time).time}
                              </div>
                            </TableCell>

                            {/* Contact - Hidden on mobile */}
                            <TableCell className="hidden md:table-cell">
                              <div className="space-y-1 text-xs text-muted-foreground max-w-[120px]">
                                <div className="truncate" title={reservation.customerEmail}>
                                  {reservation.customerEmail}
                                </div>
                                {reservation.customerPhone && (
                                  <div className="truncate">
                                    {reservation.customerPhone}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <ReservationActions
                                reservation={reservation}
                                onEdit={() => setEditingReservation(reservation)}
                                onViewDetails={() => setViewingReservation(reservation)}
                                onStatusUpdate={onStatusUpdate}
                                onDelete={onReservationDelete}
                              />
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>

      {/* Modals - PRESERVE EXISTING FUNCTIONALITY */}
      <EditReservationModal
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        reservation={editingReservation}
        onSave={onReservationUpdate || (async () => false)}
      />

      <ReservationDetailModal
        isOpen={!!viewingReservation}
        onClose={() => setViewingReservation(null)}
        reservation={viewingReservation}
        onEdit={() => {
          if (viewingReservation) {
            setEditingReservation(viewingReservation)
            setViewingReservation(null)
          }
        }}
      />
    </div>
  )
}