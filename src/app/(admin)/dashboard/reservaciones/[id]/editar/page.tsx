'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react'
import { ReservationForm } from '@/components/forms/reservation/reservation-form'
import { toast } from 'sonner'

interface ReservationData {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: Date
  time: Date
  partySize: number
  tableId?: string
  specialRequests?: string
  dietaryNotes?: string
  occasion?: string
  status: string
  customerId?: string
}

export default function EditarReservacionPage() {
  const router = useRouter()
  const params = useParams()
  const reservationId = params.id as string

  const [reservation, setReservation] = useState<ReservationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch reservation data
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/reservations/${reservationId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error cargando la reserva')
        }

        if (data.success && data.reservation) {
          setReservation(data.reservation)
        } else {
          throw new Error('Reserva no encontrada')
        }
      } catch (err) {
        console.error('Error fetching reservation:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast.error('Error cargando la reserva')
      } finally {
        setLoading(false)
      }
    }

    if (reservationId) {
      fetchReservation()
    }
  }, [reservationId])

  const handleSuccess = () => {
    toast.success('¡Reserva actualizada exitosamente!')
    router.push(`/dashboard/reservaciones/${reservationId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  const handleRetry = () => {
    window.location.reload()
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !reservation) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Error Cargando Reserva
            </h1>
            <p className="text-gray-600">
              No se pudo cargar la información de la reserva
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error al Cargar Reserva
            </h3>
            <p className="text-red-600 mb-4">
              {error || 'Reserva no encontrada o error de conexión'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button onClick={() => router.push('/dashboard/reservaciones')}>
                Ver Todas las Reservas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Editar Reserva
          </h1>
          <p className="text-gray-600">
            Modificar reserva de {reservation.customerName} • {reservationId}
          </p>
        </div>
      </div>

      {/* Reservation Form */}
      <ReservationForm
        mode="edit"
        initialData={reservation}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        className="max-w-4xl mx-auto"
      />
    </div>
  )
}