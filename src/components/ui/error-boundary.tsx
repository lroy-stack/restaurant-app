'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Algo salió mal
            </h3>
            <p className="text-red-700 mb-4 text-sm">
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </p>
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Modal specific error fallback
export function ModalErrorFallback({ error, retry }: { error?: Error; retry?: () => void }) {
  return (
    <div className="p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Error en el formulario
      </h3>
      <p className="text-red-700 mb-4 text-sm">
        {error?.message || 'No se pudo cargar el formulario'}
      </p>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      )}
    </div>
  )
}