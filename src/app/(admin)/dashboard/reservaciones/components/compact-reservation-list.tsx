'use client'

import { useState } from 'react'
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
  XCircle,
  MoreVertical,
  Star,
  MessageSquare,
  Edit,
  Eye,
  Timer
} from 'lucide-react'
import { EditReservationModal } from './edit-reservation-modal'
import { ReservationDetailModal } from './reservation-detail-modal'

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
    number: string
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  } | null
}

interface CompactReservationListProps {
  reservations: Reservation[]
  loading: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onStatusUpdate?: (id: string, status: string) => void
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

// Format date helper - PRESERVE EXISTING LOGIC
function formatDateCompact(dateStr: string, timeStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  if (isToday) return `Hoy ${timeStr.substring(0, 5)}`
  if (isTomorrow) return `Mañ ${timeStr.substring(0, 5)}`

  return `${date.getDate()}/${date.getMonth() + 1} ${timeStr.substring(0, 5)}`
}

// Urgency badge logic - PRESERVE EXISTING LOGIC
function getUrgencyBadge(reservation: Reservation) {
  const now = new Date()
  const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`)
  const hoursUntil = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntil <= 2 && hoursUntil > 0) {
    return { text: 'URGENTE', variant: 'destructive' as const, icon: Timer }
  } else if (hoursUntil <= 6 && hoursUntil > 2) {
    return { text: 'PRONTO', variant: 'secondary' as const, icon: Clock }
  }

  return null
}

// Group reservations by urgency - PRESERVE EXISTING LOGIC
function groupReservationsByUrgency(reservations: Reservation[]) {
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
  })

  // Sort each group by time - PRESERVE EXISTING LOGIC
  groups.PASADAS.sort((a, b) =>
    new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
  )

  groups.HOY.sort((a, b) =>
    new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  )

  groups.MAÑANA.sort((a, b) =>
    new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  )

  groups.PRÓXIMOS_DÍAS.sort((a, b) =>
    new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  )

  return groups
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
  onStatusUpdate?: (id: string, status: string) => void
}) {
  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate?.(reservation.id, newStatus)
  }

  return (
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
        <DropdownMenuItem>
          <Mail className="w-4 h-4 mr-2" />
          Email
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Danger Actions */}
        <DropdownMenuItem
          onClick={() => handleStatusChange('CANCELLED')}
          className="text-red-600"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancelar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
                      <TableHead className="hidden md:table-cell">Contacto</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupReservations.map((reservation) => {
                      const urgencyBadge = getUrgencyBadge(reservation)
                      const statusStyle = statusStyles[reservation.status]

                      return (
                        <TableRow key={reservation.id} className="group">
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
                            <div className="space-y-1">
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
                                {reservation.tables?.number || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {reservation.tables ? locationShort[reservation.tables.location] : ''}
                              </div>
                            </div>
                          </TableCell>

                          {/* Date/Time */}
                          <TableCell>
                            <div className="text-sm font-mono">
                              {formatDateCompact(reservation.date, reservation.time)}
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
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Additional Info Row for mobile - Special requests, pre-orders */}
              <div className="mt-2 space-y-1 text-xs text-muted-foreground md:hidden">
                {groupReservations.map((reservation) => (
                  <div key={`mobile-${reservation.id}`} className="flex gap-4 flex-wrap">
                    {reservation.hasPreOrder && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Pre-orden
                      </span>
                    )}
                    {reservation.specialRequests && (
                      <span className="flex items-center gap-1 text-orange-600" title={reservation.specialRequests}>
                        <MessageSquare className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">{reservation.specialRequests}</span>
                      </span>
                    )}
                  </div>
                ))}
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