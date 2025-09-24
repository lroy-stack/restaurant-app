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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface CancellationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservationId: string
  customerName: string
  onConfirm: (data: { notes: string; restaurantMessage?: string }) => void
}

export function CancellationModal({
  open,
  onOpenChange,
  reservationId,
  customerName,
  onConfirm
}: CancellationModalProps) {
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) return

    setLoading(true)
    try {
      await onConfirm({
        notes: reason.trim(),
        restaurantMessage: message.trim() || undefined
      })

      // Reset form
      setReason('')
      setMessage('')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const isValid = reason.trim().length > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <AlertDialogTitle>Cancelar Reservación</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            ¿Estás seguro de cancelar la reserva de <strong>{customerName}</strong>?
            Esta acción enviará un email de cancelación al cliente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo de cancelación *
            </Label>
            <Input
              id="reason"
              placeholder="Ej: Problemas de reserva, cambio de horario..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Mensaje personal (opcional)
            </Label>
            <Textarea
              id="message"
              placeholder="Mensaje adicional para el cliente..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full resize-none"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setReason('')
              setMessage('')
            }}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}