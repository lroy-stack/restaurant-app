/**
 * BUSINESS HOURS SECTION
 * Gestión de horarios de operación del restaurante
 */

'use client'

import { useState } from 'react'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { BusinessHoursForm } from '../forms/business-hours-form'
import type { BusinessHoursConfig } from '../../types/config.types'

export function BusinessHoursSection() {
  const { businessHours, loading, error: fetchError } = useBusinessHours()
  const [formState, setFormState] = useState<{
    loading: boolean
    error: string | null
    success: boolean
  }>({
    loading: false,
    error: null,
    success: false
  })

  const handleUpdate = async (dayOfWeek: number, updates: Partial<BusinessHoursConfig>) => {
    try {
      setFormState({ loading: true, error: null, success: false })

      const response = await fetch('/api/business-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_of_week: dayOfWeek, updates })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al actualizar horarios')
      }

      setFormState({ loading: false, error: null, success: true })

      // Auto-hide success after 3s
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: false }))
      }, 3000)

      // Reload page to refresh data
      window.location.reload()
    } catch (error) {
      setFormState({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar horarios',
        success: false
      })
    }
  }

  if (loading) {
    return (
      <Card className="enigma-config-card">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (fetchError) {
    return (
      <Card className="enigma-config-card">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="enigma-config-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Horarios de Operación</CardTitle>
            <CardDescription>
              Configura los horarios de apertura y cierre para cada día de la semana
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Alert */}
        {formState.success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Horarios actualizados correctamente
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {formState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <BusinessHoursForm
          businessHours={businessHours}
          onUpdate={handleUpdate}
          loading={formState.loading}
        />
      </CardContent>
    </Card>
  )
}
