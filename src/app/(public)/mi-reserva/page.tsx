'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ReservationTokenService } from '@/lib/services/reservationTokenService'
import type { TokenValidationResult } from '@/lib/services/reservationTokenService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  ShoppingCart
} from 'lucide-react'
import { CustomerEditReservationModal } from './components/customer-edit-reservation-modal'
import { CustomerCancelReservationModal } from './components/customer-cancel-reservation-modal'
import { toast } from 'sonner'

function MiReservaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [validation, setValidation] = useState<TokenValidationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    if (!token) {
      setValidation({ valid: false, error: 'Token no proporcionado' })
      setLoading(false)
      return
    }

    ReservationTokenService.validateToken(token)
      .then(setValidation)
      .finally(() => setLoading(false))
  }, [token])

  // Format reservation data for modals
  const formatReservationForModals = (reservation: any) => {
    if (!reservation) return null

    return {
      id: reservation.id,
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail,
      customerPhone: reservation.customerPhone,
      partySize: reservation.partySize,
      date: reservation.date,
      time: reservation.time,
      status: reservation.status,
      specialRequests: reservation.specialRequests,
      hasPreOrder: reservation.hasPreOrder,
      // 🔧 FIXED: Support multiple tables in modal
      tableId: reservation.tableId, // Keep for backward compatibility
      tableIds: reservation.tableIds || [], // Array of table IDs
      tables: reservation.tables, // Single table for backward compatibility
      allTables: reservation.allTables || [], // All tables data
      reservation_items: reservation.reservation_items || [],
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt
    }
  }

  // Format data for cancel modal (simplified)
  const formatReservationForCancel = (reservation: any, customer: any) => {
    if (!reservation || !customer) return null

    // Format date and time for display
    const reservationDate = new Date(reservation.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const reservationTime = new Date(reservation.time).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    return {
      id: reservation.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      reservationDate,
      reservationTime,
      partySize: reservation.partySize
    }
  }

  // Handle reservation modification
  const handleModifyReservation = async (updateData: any) => {
    if (!token || !validation?.reservation) return false

    try {
      // Step 1: Update reservation with PENDING status and send modification email
      console.log('🔄 Updating reservation...')
      const response = await fetch(`/api/reservations/${validation.reservation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          // CRITICAL: Customer modifications always go to PENDING for restaurant confirmation
          status: 'PENDING',
          sendModificationEmail: true // Flag to trigger modification email
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update reservation')
      }

      console.log('✅ Reservation updated successfully')

      // Step 2: NOW invalidate current token (after successful update)
      console.log('🔄 Invalidating current token after successful update...')
      try {
        await ReservationTokenService.invalidateToken(token)
        console.log('✅ Token invalidated successfully')
      } catch (tokenError) {
        console.warn('⚠️ Could not invalidate token, continuing...', tokenError)
        // Don't fail the whole operation if token invalidation fails
      }

      // Redirect to success page or show success message
      toast.success('Modificación enviada exitosamente. Recibirás confirmación por email.')

      // Optional: Redirect to a thank you page
      setTimeout(() => {
        router.push('/reservas/modificacion-enviada')
      }, 2000)

      return true
    } catch (error) {
      console.error('❌ Error modifying reservation:', error)
      toast.error('Error al modificar la reservación')
      return false
    }
  }

  // Handle reservation cancellation
  const handleCancelReservation = async (reason?: string) => {
    if (!token || !validation?.reservation) return false

    try {
      // Use token-based cancellation API
      console.log('🔄 Cancelling reservation via token...')
      const response = await fetch('/api/reservations/token/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          cancellationReason: reason || 'Cancelado por el cliente'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel reservation')
      }

      console.log('✅ Reservation cancelled successfully')

      // Redirect to success page or show success message
      toast.success('Reserva cancelada exitosamente. Recibirás confirmación por email.')

      // Optional: Redirect to a thank you page
      setTimeout(() => {
        router.push('/reservas/cancelacion-confirmada')
      }, 2000)

      return true
    } catch (error) {
      console.error('❌ Error cancelling reservation:', error)
      toast.error('Error al cancelar la reservación')
      return false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Validando reserva...</span>
      </div>
    )
  }

  if (!validation?.valid) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {validation?.error || 'Token inválido'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { reservation, customer } = validation

  // Format date and time for display
  const reservationDate = new Date(reservation.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Fix: Properly handle time formatting - if time is already in HH:MM format, use directly
  // Otherwise, combine date and time to create proper Date object
  const reservationTime = (() => {
    if (typeof reservation.time === 'string' && reservation.time.match(/^\d{2}:\d{2}$/)) {
      // Time is already in HH:MM format, use directly
      return reservation.time
    } else {
      // Try to create proper datetime by combining date and time
      try {
        const dateStr = reservation.date
        const timeStr = reservation.time
        const combinedDateTime = new Date(`${dateStr}T${timeStr}:00`)

        if (isNaN(combinedDateTime.getTime())) {
          // If still invalid, return time string as fallback
          return typeof timeStr === 'string' ? timeStr : '00:00'
        }

        return combinedDateTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      } catch (error) {
        // Fallback to time string or default
        return typeof reservation.time === 'string' ? reservation.time : '00:00'
      }
    }
  })()

  // Status configuration
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

  // Check if modifications are allowed
  const canModify = ['PENDING', 'CONFIRMED'].includes(reservation.status)
  const reservationDateTime = new Date(reservation.date)
  const isPastReservation = reservationDateTime < new Date()
  const canCancel = ['PENDING', 'CONFIRMED'].includes(reservation.status) && !isPastReservation

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Mi Reserva</h1>
          <p className="text-muted-foreground">
            Gestiona tu reserva en Enigma Cocina Con Alma
          </p>
        </div>

        {/* Main Reservation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Reserva #{reservation.id.slice(-8)}
              </div>
              <Badge className={statusConfig[reservation.status as keyof typeof statusConfig].color}>
                {statusConfig[reservation.status as keyof typeof statusConfig].label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <strong>Nombre:</strong> {customer?.firstName} {customer?.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <strong>Email:</strong> {customer?.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <strong>Teléfono:</strong> {customer?.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <strong>Comensales:</strong> {reservation.partySize} persona{reservation.partySize > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reservation Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles de la Reserva
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <strong>Fecha:</strong> {reservationDate}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <strong>Hora:</strong> {reservationTime}
                  </div>
                </div>
                <div className="space-y-2">
                  {/* 🔧 FIXED: Support multiple tables display */}
                  {reservation.allTables && reservation.allTables.length > 0 ? (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <strong>Mesa{reservation.allTables.length > 1 ? 's' : ''}:</strong>
                        <div className="mt-1 space-y-1">
                          {reservation.allTables.map((table: any, index: number) => (
                            <div key={table.id} className="flex items-center gap-2">
                              <span className="font-medium">Mesa {table.number}</span>
                              <span className="text-xs text-muted-foreground">
                                ({table.capacity} personas)
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-muted rounded">
                                {locationLabels[table.location as keyof typeof locationLabels]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : reservation.tables ? (
                    // Fallback for backward compatibility with single table
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <strong>Mesa:</strong> Mesa {reservation.tables.number} - {locationLabels[reservation.tables.location as keyof typeof locationLabels]}
                    </div>
                  ) : null}
                  {reservation.specialRequests && (
                    <div className="text-sm">
                      <strong>Solicitudes especiales:</strong> {reservation.specialRequests}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pre-order Items */}
            {reservation.preOrderItems?.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Pre-pedido
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    {reservation.preOrderItems.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}x</span>
                          <span>{item.name}</span>
                          {item.notes && <span className="text-xs text-muted-foreground">({item.notes})</span>}
                        </div>
                        <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total:</span>
                      <span>€{reservation.preOrderTotal?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Acciones</h3>

              {/* Status-based information */}
              {reservation.status === 'PENDING' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Tu reserva está pendiente de confirmación. Recibirás un email cuando sea confirmada.
                  </AlertDescription>
                </Alert>
              )}

              {reservation.status === 'CONFIRMED' && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Tu reserva está confirmada. ¡Te esperamos!
                  </AlertDescription>
                </Alert>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowEditModal(true)}
                  disabled={!canModify || isPastReservation}
                >
                  <Edit className="h-4 w-4" />
                  Modificar Reserva
                </Button>

                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => setShowCancelModal(true)}
                  disabled={!canCancel}
                >
                  <Trash2 className="h-4 w-4" />
                  Cancelar Reserva
                </Button>
              </div>

              {/* Restrictions info */}
              {(!canModify || !canCancel) && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {isPastReservation && (
                    <p>• No se pueden modificar reservas pasadas</p>
                  )}
                  {!['PENDING', 'CONFIRMED'].includes(reservation.status) && (
                    <p>• Solo se pueden modificar reservas pendientes o confirmadas</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CustomerEditReservationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        reservation={formatReservationForModals(reservation)}
        onSave={handleModifyReservation}
      />

      <CustomerCancelReservationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        reservation={formatReservationForCancel(reservation, customer)}
        onCancel={handleCancelReservation}
      />
    </>
  )
}

export default function MiReservaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MiReservaContent />
    </Suspense>
  )
}