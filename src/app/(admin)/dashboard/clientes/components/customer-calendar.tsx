'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  isVip: boolean
  totalReservations: number
  totalSpent: number
  lastVisit?: string
  preferences?: string
  allergies?: string[]
  gdprConsent: boolean
  marketingConsent: boolean
  createdAt: string
  updatedAt: string
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  averageSpending: number
  visitFrequency: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface CustomerCalendarProps {
  customers: Customer[]
  loading: boolean
  currentDate: Date
}

// TODO: Implement customer timeline/calendar view
// Could show customer activity timeline, visit patterns, lifecycle events
export function CustomerCalendar({ customers, loading, currentDate }: CustomerCalendarProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando calendario de clientes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Vista de Calendario de Clientes
        </h3>
        <p className="text-gray-500 mb-4">
          Funcionalidad en desarrollo. Esta vista mostrará:
        </p>
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Cronología de actividad de clientes</p>
          <p>• Patrones de visitas y reservas</p>
          <p>• Eventos del ciclo de vida del cliente</p>
          <p>• Cumpleaños y fechas importantes</p>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          Total de {customers.length} clientes para mostrar
        </div>
      </CardContent>
    </Card>
  )
}