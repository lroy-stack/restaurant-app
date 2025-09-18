'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ReservationTokenService } from '@/lib/services/reservationTokenService'
import type { TokenValidationResult } from '@/lib/services/reservationTokenService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'

function MiReservaContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [validation, setValidation] = useState<TokenValidationResult | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Mi Reserva - {customer?.firstName} {customer?.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="enigma-subsection-title">Detalles de la Reserva</h3>
              <p><strong>Fecha:</strong> {reservation.date}</p>
              <p><strong>Hora:</strong> {reservation.time}</p>
              <p><strong>Comensales:</strong> {reservation.partySize}</p>
              <p><strong>Mesa:</strong> {reservation.tables?.number}</p>
            </div>
            <div>
              <h3 className="enigma-subsection-title">Información de Contacto</h3>
              <p><strong>Email:</strong> {customer?.email}</p>
              <p><strong>Teléfono:</strong> {customer?.phone}</p>
            </div>
          </div>

          {reservation.preOrderItems?.length > 0 && (
            <div>
              <h3 className="enigma-subsection-title">Pre-pedido</h3>
              <div className="space-y-2">
                {reservation.preOrderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 enigma-brand-body font-semibold">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>€{reservation.preOrderTotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button variant="outline">
              Modificar Reserva
            </Button>
            <Button variant="destructive">
              Cancelar Reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MiReservaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MiReservaContent />
    </Suspense>
  )
}