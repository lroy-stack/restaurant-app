'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

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

interface CustomerListProps {
  customers: Customer[]
  loading: boolean
  onStatusUpdate?: (id: string, status: string) => void
}

// TODO: Implement full customer list view (similar to reservation-list.tsx)
// For now, redirect to compact list as it's the primary view
export function CustomerList({ customers, loading, onStatusUpdate }: CustomerListProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando clientes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Vista de Lista Detallada
        </h3>
        <p className="text-gray-500">
          Funcionalidad en desarrollo. Use la vista compacta por ahora.
        </p>
      </CardContent>
    </Card>
  )
}