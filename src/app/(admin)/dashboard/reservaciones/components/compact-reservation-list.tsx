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

// Urgency badge logic - Using established patterns
function getUrgencyBadge(reservation: Reservation) {
  try {
    const now = new Date()
    const reservationDateTime = new Date(reservation.time)
    const hoursUntil = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntil <= 2 && hoursUntil > 0) {
      return { text: 'URGENTE', variant: 'destructive' as const, icon: Timer }
    } else if (hoursUntil <= 6 && hoursUntil > 2) {
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
  onStatusUpdate
}: {
  reservation: Reservation
  onEdit: () => void
  onViewDetails: () => void
  onStatusUpdate?: (id: string, status: string, additionalData?: any) => void
}) {
  const [showCancellationModal, setShowCancellationModal] = useState(false)


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
    onStatusUpdate?.(reservation.id, newStatus, additionalData)
  }

  const handleCancellation = (data: { notes: string; restaurantMessage?: string }) => {
    onStatusUpdate?.(reservation.id, 'CANCELLED', data)
  }

  return (
    <>
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

          {/* Status Actions - PRESERVE EXISTING LOGIC */}
          {reservation.status === 'PENDING' && (
            <DropdownMenuItem onClick={() => handleStatusChange('CONFIRMED')}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Confirmar
            </DropdownMenuItem>
          )}
          {reservation.status === 'CONFIRMED' && (
            <DropdownMenuItem onClick={() => handleStatusChange('SEATED')}>
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Sentar en Mesa
            </DropdownMenuItem>
          )}
          {reservation.status === 'SEATED' && (
            <DropdownMenuItem onClick={() => handleStatusChange('COMPLETED')}>
              <CheckCircle className="w-4 h-4 mr-2 text-gray-600" />
              Completar
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Contact Actions */}
          <DropdownMenuItem>
            <Phone className="w-4 h-4 mr-2" />
            Llamar
          </DropdownMenuItem>
          <CustomEmailComposer
            customerId={reservation.id} // Using reservation ID as fallback
            customerName={reservation.customerName}
            customerEmail={reservation.customerEmail}
            hasEmailConsent={true} // Assume consent since they made a reservation
            onGetPredefinedTemplates={getPredefinedTemplates}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </DropdownMenuItem>
            }
          />

          <DropdownMenuSeparator />

          {/* Danger Actions */}
          <DropdownMenuItem
            onClick={() => setShowCancellationModal(true)}
            className="text-red-600"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancelar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange('NO_SHOW')}
            className="text-orange-600"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            No Show
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CancellationModal
        open={showCancellationModal}
        onOpenChange={setShowCancellationModal}
        reservationId={reservation.id}
        customerName={reservation.customerName}
        onConfirm={handleCancellation}
      />
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
  bulkMode = false
}: CompactReservationListProps) {
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null)

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

      {/* Grouped Reservations using shadcn/ui Table - FIXED APPROACH */}
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
                      const urgencyBadge = getUrgencyBadge(reservation)
                      const statusStyle = statusStyles[reservation.status]

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
                                  <span>{reservation.partySize}p</span>
                                  {urgencyBadge && (
                                    <Badge variant={urgencyBadge.variant} className="text-xs px-1">
                                      {urgencyBadge.text}
                                    </Badge>
                                  )}
                                </div>

                                {/* Badges - DESKTOP ONLY */}
                                <div className="hidden md:flex items-center gap-1 flex-wrap">
                                  {/* Pre-Order Badge */}
                                  {reservation.hasPreOrder && reservation.reservation_items?.length > 0 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground border-border hover:bg-secondary/90"
                                      title={`Pre-pedido: ${reservation.reservation_items.length} items`}
                                    >
                                      <Utensils className="h-3 w-3 mr-1" />
                                      Pre-pedido
                                      <span className="ml-1 font-semibold">
                                        {reservation.reservation_items.length}
                                      </span>
                                    </Badge>
                                  )}

                                  {/* Special Requests Badge */}
                                  {reservation.specialRequests && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5 bg-accent/10 text-accent border-accent/20 hover:bg-accent/15"
                                      title={reservation.specialRequests}
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Petición
                                    </Badge>
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
                              />
                            </TableCell>
                          </TableRow>

                          {/* Mobile Expanded Row - DEBAJO DE CADA RESERVA INDIVIDUAL */}
                          {(reservation.hasPreOrder && reservation.reservation_items?.length > 0 || reservation.specialRequests || reservation.dietaryNotes) && (
                            <TableRow className="md:hidden border-none">
                              <TableCell colSpan={bulkMode ? 9 : 8} className="py-2 pl-8">
                                <div className="flex flex-col gap-2 text-xs text-muted-foreground border-l-2 border-muted pl-3">
                                  {/* Pre-order expanded info */}
                                  {reservation.hasPreOrder && reservation.reservation_items?.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                      <span className="flex items-center gap-1 text-secondary-foreground font-medium">
                                        <Utensils className="h-3 w-3" />
                                        Pre-pedido ({reservation.reservation_items.length} items)
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {reservation.reservation_items.slice(0, 3).map((item) => (
                                          <span key={item.id} className="flex items-center gap-0.5 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                                            {item.menu_items?.menu_categories?.type === 'WINE' ? (
                                              <Wine className="h-2.5 w-2.5" />
                                            ) : (
                                              <Utensils className="h-2.5 w-2.5" />
                                            )}
                                            {item.quantity}x {item.menu_items.name}
                                          </span>
                                        ))}
                                        {reservation.reservation_items.length > 3 && (
                                          <span className="text-secondary-foreground font-medium">+{reservation.reservation_items.length - 3} más</span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Special requests expanded */}
                                  {reservation.specialRequests && (
                                    <div className="flex items-start gap-2 text-accent">
                                      <MessageSquare className="h-3 w-3 mt-0.5" />
                                      <span className="text-xs">{reservation.specialRequests}</span>
                                    </div>
                                  )}

                                  {/* Dietary notes expanded */}
                                  {reservation.dietaryNotes && (
                                    <div className="flex items-start gap-2 text-red-600">
                                      <AlertTriangle className="h-3 w-3 mt-0.5" />
                                      <span className="text-xs">{reservation.dietaryNotes}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
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