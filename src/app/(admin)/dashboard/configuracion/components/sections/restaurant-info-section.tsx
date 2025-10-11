/**
 * RESTAURANT INFO SECTION
 * Sección para gestión de información general del restaurante
 */

'use client'

import { useState } from 'react'
import { useRestaurant } from '@/hooks/use-restaurant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { RestaurantInfoForm } from '../forms/restaurant-info-form'
import type { RestaurantConfig } from '../../types/config.types'

export function RestaurantInfoSection() {
  const { restaurant, loading, updateRestaurant } = useRestaurant()
  const [formState, setFormState] = useState<{
    loading: boolean
    error: string | null
    success: boolean
  }>({
    loading: false,
    error: null,
    success: false
  })

  const handleSubmit = async (data: Partial<RestaurantConfig>) => {
    try {
      setFormState({ loading: true, error: null, success: false })
      await updateRestaurant(data)
      setFormState({ loading: false, error: null, success: true })

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: false }))
      }, 3000)
    } catch (error) {
      setFormState({
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar información',
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
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="enigma-config-card">
      <CardHeader>
        <CardTitle className="text-2xl">Información General</CardTitle>
        <CardDescription>
          Gestiona la información básica del restaurante visible en la web pública
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Alert */}
        {formState.success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Información actualizada correctamente
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
        <RestaurantInfoForm
          data={restaurant}
          onSubmit={handleSubmit}
          loading={formState.loading}
        />
      </CardContent>
    </Card>
  )
}
