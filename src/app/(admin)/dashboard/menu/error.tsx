'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface MenuErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MenuError({ error, reset }: MenuErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Menu page error:', error)
  }, [error])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Menú
          </h1>
          <p className="text-gray-600">
            Administrar carta, categorías, alérgenos y maridajes
          </p>
        </div>
      </div>

      {/* Error Card */}
      <Card>
        <CardContent className="p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />

          <h2 className="text-xl font-semibold text-red-900 mb-4">
            Error al cargar la gestión de menú
          </h2>

          <div className="text-red-700 mb-6 space-y-2">
            <p className="font-medium">
              Ha ocurrido un problema inesperado
            </p>
            <p className="text-sm text-red-600">
              {error.message || 'Error desconocido al cargar los datos del menú'}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al Dashboard
            </Button>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              Si el problema persiste, contacta al administrador del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}