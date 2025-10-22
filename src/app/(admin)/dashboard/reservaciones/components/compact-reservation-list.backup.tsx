'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
    location: 'TERRACE_1' | 'VIP_ROOM' | 'TERRACE_2' | 'MAIN_ROOM'
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

// Status indicators - Ultra compact
const statusStyles = {
  PENDING: '🟡',
  CONFIRMED: '🟢', 
  SEATED: '🔵',
  COMPLETED: '⚪',
  CANCELLED: '🔴',
  NO_SHOW: '🟠'
}

const statusLabels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada', 
  SEATED: 'En Mesa',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No Show'
}

function CompactReservationItem({
  reservation,
  isSelected = false,
  onSelectionChange,
  onStatusUpdate,
  onEdit,
  onViewDetails,
  showCheckbox = false,
  urgencyBadge = null
}: {
  reservation: Reservation
  isSelected?: boolean
  onSelectionChange?: (id: string, checked: boolean) => void
  onStatusUpdate?: (id: string, status: string) => void
  onEdit?: () => void
  onViewDetails?: () => void
  showCheckbox?: boolean
  urgencyBadge?: { text: string; variant: 'destructive' | 'secondary'; icon: any } | null
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Format date to compact version
  const formatDate = (dateStr: string, timeStr: string) => {
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

  // Location shorthand
  const locationShort = {
    TERRACE_1: 'T.Camp',
    VIP_ROOM: 'VIP',
    TERRACE_2: 'T.Just',
    MAIN_ROOM: 'S.Prin'
  }

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate?.(reservation.id, newStatus)
  }

  return (
    <div 
      className={`
        group border rounded-lg transition-all duration-200 hover:shadow-md hover:border-blue-300
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
        ${reservation.status === 'PENDING' ? 'bg-yellow-50/30' : ''}
        ${reservation.status === 'CONFIRMED' ? 'bg-green-50/30' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LINE 1: Essential Info - MOBILE FIRST */}
      <div className="flex items-center gap-2 p-3 pb-2 min-w-0 overflow-hidden">
        {/* Checkbox for bulk operations */}
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange?.(reservation.id, !!checked)}
            className="flex-shrink-0"
          />
        )}
        
        {/* Status Emoji */}
        <span className="text-lg flex-shrink-0" title={statusLabels[reservation.status]}>
          {statusStyles[reservation.status]}
        </span>
        
        {/* Customer Name + VIP */}
        <div className="font-medium text-gray-900 truncate min-w-0 flex-1">
          {reservation.customerName}
          {reservation.customerEmail.includes('vip') && (
            <Star className="inline w-3 h-3 text-yellow-500 ml-1" />
          )}
        </div>
        
        {/* Table - Compact */}
        {reservation.tables && (
          <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
            <span className="font-medium">T{reservation.tables.number}</span>
          </div>
        )}
        
        {/* Date + Time - Ultra compact - Hidden on very small screens */}
        <div className="hidden sm:block text-sm text-gray-600 font-mono min-w-0 max-w-[120px] truncate">
          {formatDate(reservation.date, reservation.time)}
        </div>

        {/* Urgency Badge */}
        {urgencyBadge && (
          <Badge variant={urgencyBadge.variant} className="hidden md:flex items-center gap-1 text-xs min-w-0">
            <urgencyBadge.icon className="w-3 h-3" />
            {urgencyBadge.text}
          </Badge>
        )}

        {/* Party Size */}
        <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
          <Users className="w-3 h-3" />
          <span>{reservation.partySize}p</span>
        </div>
        
        {/* Actions Dropdown - Always visible on mobile, hover on desktop */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`
                w-8 h-8 p-0 flex-shrink-0
                ${isHovered ? 'opacity-100' : 'opacity-70 md:opacity-30'}
                transition-opacity duration-200
              `}
            >
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Primary Actions */}
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2 text-blue-600" />
              Editar Reserva
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="w-4 h-4 mr-2 text-purple-600" />
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Status Actions */}
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
      </div>
      
      {/* LINE 2: Secondary Info - COLLAPSIBLE ON MOBILE */}
      <div className="px-3 pb-3 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
        {/* Contact Info - Truncated on mobile */}
        <span className="flex items-center gap-1 truncate min-w-0">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span>{reservation.customerEmail}</span>
        </span>
        
        {reservation.customerPhone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>{reservation.customerPhone}</span>
          </span>
        )}
        
        {/* Location */}
        {reservation.tables && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{locationShort[reservation.tables.location]}</span>
          </span>
        )}
        
        {/* Special Indicators */}
        {reservation.hasPreOrder && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Pre-orden</span>
          </span>
        )}
        
        {reservation.specialRequests && (
          <span className="flex items-center gap-1 text-orange-600" title={reservation.specialRequests}>
            <MessageSquare className="w-3 h-3" />
            <span>{reservation.specialRequests}</span>
          </span>
        )}
      </div>
    </div>
  )
}

// Date grouping utility functions
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

  // Sort each group by time - recent first for past reservations, soonest first for future ones
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
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-6 mt-2 ml-13">
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin reservas
          </h3>
          <p className="text-gray-500">
            No hay reservas que coincidan con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group reservations by urgency
  const groupedReservations = groupReservationsByUrgency(reservations)
  const hasAnyReservations = reservations.length > 0

  return (
    <div className="space-y-4">
      {/* Bulk Selection Header */}
      {bulkMode && onSelectionChange && hasAnyReservations && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.length === reservations.length && reservations.length > 0}
                indeterminate={selectedIds.length > 0 && selectedIds.length < reservations.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                {selectedIds.length > 0
                  ? `${selectedIds.length} seleccionada${selectedIds.length !== 1 ? 's' : ''}`
                  : 'Seleccionar todas'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouped Reservations by Date */}
      {Object.entries(groupedReservations).map(([groupName, groupReservations]) => {
        if (groupReservations.length === 0) return null

        const groupTitle = {
          PASADAS: 'Reservas Pasadas',
          HOY: 'Hoy',
          MAÑANA: 'Mañana',
          PRÓXIMOS_DÍAS: 'Próximos Días'
        }[groupName] || groupName

        const groupColor = {
          PASADAS: 'text-gray-600 border-gray-200 bg-gray-50/50',
          HOY: 'text-red-600 border-red-200 bg-red-50/50',
          MAÑANA: 'text-orange-600 border-orange-200 bg-orange-50/50',
          PRÓXIMOS_DÍAS: 'text-blue-600 border-blue-200 bg-blue-50/50'
        }[groupName] || 'text-gray-600 border-gray-200'

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
            <CardContent className="pt-0 space-y-2">
              {groupReservations.map((reservation) => (
                <CompactReservationItem
                  key={reservation.id}
                  reservation={reservation}
                  isSelected={selectedIds.includes(reservation.id)}
                  onSelectionChange={handleItemSelection}
                  onStatusUpdate={onStatusUpdate}
                  onEdit={() => setEditingReservation(reservation)}
                  onViewDetails={() => setViewingReservation(reservation)}
                  showCheckbox={bulkMode}
                  urgencyBadge={getUrgencyBadge(reservation)}
                />
              ))}
            </CardContent>
          </Card>
        )
      })}

      {/* Empty State */}
      {!hasAnyReservations && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin reservas
            </h3>
            <p className="text-gray-500">
              No hay reservas que coincidan con los filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals - COMMENTED OUT TO TEST SCROLL ISSUE */}
      {/*
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
      */}
    </div>
  )
}