'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  AlertTriangle,
  MessageCircle,
  User,
  MapPin,
  ChefHat
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  hasPreOrder: boolean
  tableId: string
  tables: Table | null
  createdAt: string
  updatedAt: string
}

interface ReservationActionsProps {
  reservation: Reservation
  userRole?: string
  onStatusUpdate?: (id: string, status: string, additionalData?: any) => void
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200', label: 'Pendiente' },
  CONFIRMED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', label: 'Confirmada' },
  SEATED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200', label: 'En Mesa' },
  COMPLETED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-200', label: 'Completada' },
  CANCELLED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200', label: 'Cancelada' },
  NO_SHOW: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200', label: 'No Show' }
}

const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

export function ReservationActions({ 
  reservation, 
  userRole = 'STAFF',
  onStatusUpdate 
}: ReservationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const canModify = ['ADMIN', 'MANAGER'].includes(userRole)
  const canConfirm = ['ADMIN', 'MANAGER', 'STAFF'].includes(userRole)
  const reservationDateTime = new Date(reservation.date)
  const isPastReservation = reservationDateTime < new Date()
  
  const updateReservationStatus = async (status: string, additionalData?: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      })
      
      if (response.ok) {
        toast.success(`Reservación ${statusConfig[status as keyof typeof statusConfig]?.label.toLowerCase()} exitosamente`)
        onStatusUpdate?.(reservation.id, status, additionalData)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar reservación')
      }
    } catch (error) {
      toast.error('Error de conexión al actualizar')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConfirm = () => {
    updateReservationStatus('CONFIRMED', { 
      confirmedAt: new Date().toISOString(),
      confirmedBy: userRole
    })
  }
  
  const handleSeatGuests = () => {
    updateReservationStatus('SEATED', { 
      seatedAt: new Date().toISOString(),
      seatedBy: userRole
    })
  }
  
  const handleComplete = () => {
    updateReservationStatus('COMPLETED', { 
      completedAt: new Date().toISOString(),
      completedBy: userRole
    })
  }
  
  const handleCancel = () => {
    const reason = prompt('Motivo de cancelación (opcional):')
    updateReservationStatus('CANCELLED', { 
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || 'Cancelado por staff',
      cancelledBy: userRole
    })
  }
  
  const handleNoShow = () => {
    updateReservationStatus('NO_SHOW', { 
      cancelledAt: new Date().toISOString(),
      cancellationReason: 'Cliente no se presentó',
      cancelledBy: userRole
    })
  }
  
  const handleSendReminder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/reminder`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Recordatorio enviado exitosamente')
        router.refresh()
      } else {
        toast.error('Error al enviar recordatorio')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Acciones de Reserva
          <Badge className={statusConfig[reservation.status].color}>
            {statusConfig[reservation.status].label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reservation Info */}
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{reservation.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.partySize} personas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(reservation.time).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
          {reservation.tables && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Mesa {reservation.tables.number} - {locationLabels[reservation.tables.location]}</span>
            </div>
          )}
          {reservation.specialRequests && (
            <div className="flex items-start gap-2 text-sm">
              <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">{reservation.specialRequests}</span>
            </div>
          )}
        </div>

        {/* Status-specific actions */}
        <div className="space-y-2">
          {reservation.status === 'PENDING' && canConfirm && (
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Reserva
            </Button>
          )}
          
          {reservation.status === 'CONFIRMED' && canConfirm && !isPastReservation && (
            <Button 
              onClick={handleSeatGuests} 
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Marcar como Sentados
            </Button>
          )}
          
          {reservation.status === 'SEATED' && canConfirm && (
            <Button 
              onClick={handleComplete} 
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Completar Servicio
            </Button>
          )}
        </div>
        
        {/* Communication actions */}
        {['PENDING', 'CONFIRMED'].includes(reservation.status) && (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleSendReminder}
              disabled={isLoading || isPastReservation}
              className="w-full"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Recordatorio
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              {reservation.customerPhone && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`tel:${reservation.customerPhone}`)}
                  size="sm"
                  className="text-xs"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Llamar
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.open(`mailto:${reservation.customerEmail}`)}
                size="sm"
                className="text-xs"
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
            </div>
          </div>
        )}
        
        {/* Modification actions */}
        {canModify && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(reservation.status) && (
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/reservaciones/${reservation.id}/editar`)}
            className="w-full"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Reserva
          </Button>
        )}
        
        {/* Cancellation actions */}
        {['PENDING', 'CONFIRMED', 'SEATED'].includes(reservation.status) && (
          <div className="pt-2 border-t space-y-2">
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar Reserva
            </Button>
            
            {(isPastReservation || reservation.status === 'CONFIRMED') && (
              <Button 
                variant="destructive" 
                onClick={handleNoShow}
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Marcar No-Show
              </Button>
            )}
          </div>
        )}
        
        {/* Delete action for admins only */}
        {userRole === 'ADMIN' && ['CANCELLED', 'NO_SHOW'].includes(reservation.status) && (
          <div className="pt-2 border-t">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar permanentemente esta reserva?')) {
                  // TODO: Implement delete functionality
                  console.log('Delete reservation', reservation.id)
                  toast.success('Funcionalidad de eliminar será implementada')
                }
              }}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Permanentemente
            </Button>
          </div>
        )}

        {/* Reservation metadata */}
        <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
          <div>Creada: {new Date(reservation.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
          {reservation.hasPreOrder && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <ChefHat className="h-3 w-3" />
              Pre-orden confirmada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}