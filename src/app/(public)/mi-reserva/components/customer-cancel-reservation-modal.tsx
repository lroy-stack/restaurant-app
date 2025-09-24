'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  reservationDate: string
  reservationTime: string
  partySize: number
}

interface CustomerCancelReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onCancel: (reason?: string) => Promise<boolean>
}

export function CustomerCancelReservationModal({
  isOpen,
  onClose,
  reservation,
  onCancel
}: CustomerCancelReservationModalProps) {
  const [cancellationReason, setCancellationReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    if (!reservation) return

    setIsLoading(true)
    try {
      const success = await onCancel(cancellationReason || undefined)
      if (success) {
        toast.success('Reserva cancelada exitosamente. Recibirás confirmación por email.')
        setCancellationReason('')
        onClose()
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast.error('Error al cancelar la reservación')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      setCancellationReason('')
      onClose()
    }
  }

  if (!reservation) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancelar Reserva
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                ¿Estás seguro de que quieres cancelar tu reserva?
              </p>

              {/* Reservation Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Cliente:</span>
                    <p className="font-medium">{reservation.customerName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Comensales:</span>
                    <p className="font-medium">{reservation.partySize} persona{reservation.partySize > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Fecha:</span>
                    <p className="font-medium">{reservation.reservationDate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Hora:</span>
                    <p className="font-medium">{reservation.reservationTime}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. Recibirás un email de confirmación de la cancelación.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Optional Cancellation Reason */}
        <div className="space-y-2">
          <Label htmlFor="cancellationReason" className="text-sm font-medium">
            Motivo de cancelación (opcional)
          </Label>
          <Textarea
            id="cancellationReason"
            placeholder="Ej: Cambio de planes, emergencia familiar, etc."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows={3}
            disabled={isLoading}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Esto nos ayuda a mejorar nuestro servicio. Tu feedback es valioso para nosotros.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Mantener Reserva
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Sí, Cancelar Reserva
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}