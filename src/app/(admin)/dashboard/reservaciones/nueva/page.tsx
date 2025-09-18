'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ReservationForm } from '@/components/forms/reservation/reservation-form'
import { toast } from 'sonner'

export default function NuevaReservacionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get preselected customer ID from URL params (when coming from customer profile)
  const preselectedCustomerId = searchParams.get('customerId')

  const handleSuccess = () => {
    toast.success('¡Reserva creada exitosamente!')
    router.push('/dashboard/reservaciones')
  }

  const handleCancel = () => {
    router.back()
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
            Nueva Reserva
          </h1>
          <p className="text-gray-600">
            {preselectedCustomerId
              ? 'Crear reserva para cliente seleccionado'
              : 'Crear una nueva reserva en el sistema'
            }
          </p>
        </div>
      </div>

      {/* Reservation Form */}
      <ReservationForm
        mode="create"
        preselectedCustomerId={preselectedCustomerId || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        className="max-w-4xl mx-auto"
      />
    </div>
  )
}