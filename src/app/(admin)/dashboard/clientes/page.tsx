'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Crown,
  XCircle
} from 'lucide-react'
import { useRealtimeCustomers } from '@/hooks/useRealtimeCustomers'
import { CustomerFilters } from './components/customer-filters'
import { QuickStats } from './components/quick-stats'
import { CustomerCard } from './components/customer-card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ClientesPage() {
  const searchParams = useSearchParams()
  
  // Extract filters from URL params
  const filters = {
    ...(searchParams.get('status') && { status: searchParams.get('status') || undefined }),
    ...(searchParams.get('vipStatus') && { vipStatus: searchParams.get('vipStatus') || undefined }),
    ...(searchParams.get('search') && { search: searchParams.get('search') || undefined }),
    ...(searchParams.get('dateRange') && { dateRange: searchParams.get('dateRange') || undefined })
  }

  // Use the real-time hook for customers
  const { 
    customers, 
    summary, 
    loading, 
    error,
    refetch, 
    updateCustomerStatus,
    updateVipStatus,
    exportCustomerData,
    deleteCustomerData 
  } = useRealtimeCustomers(filters)

  const handleStatusUpdate = async (id: string, status: string, additionalData?: any) => {
    const success = await updateCustomerStatus(id, status, additionalData)
    if (success) {
      toast.success(`Cliente ${status.toLowerCase()} exitosamente`)
    } else {
      toast.error('Error al actualizar el cliente')
    }
  }

  const handleFieldUpdate = async (id: string, field: string, value: any) => {
    let success = false
    if (field === 'isVip') {
      success = await updateVipStatus(id, value)
    } else {
      success = await updateCustomerStatus(id, field, { [field]: value })
    }
    
    if (success) {
      toast.success('Cliente actualizado exitosamente')
    } else {
      toast.error('Error al actualizar cliente')
    }
  }

  const handleRefresh = async () => {
    await refetch()
    toast.success('Lista de clientes actualizada')
  }

  const handleGdprExport = async (customerId: string) => {
    const success = await exportCustomerData(customerId)
    if (success) {
      toast.success('Datos del cliente exportados exitosamente')
    } else {
      toast.error('Error al exportar datos del cliente')
    }
  }

  const handleGdprDelete = async (customerId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos de este cliente? Esta acción no se puede deshacer.')) {
      const success = await deleteCustomerData(customerId)
      if (success) {
        toast.success('Datos del cliente eliminados exitosamente')
      } else {
        toast.error('Error al eliminar datos del cliente')
      }
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Clientes CRM
            </h1>
            <p className="text-gray-600">
              Administrar base de datos de clientes y relaciones
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error al cargar clientes
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Clientes CRM
          </h1>
          <p className="text-gray-600">
            Administrar base de datos de clientes y relaciones
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* QuickStats Dashboard Widgets */}
      <QuickStats 
        customers={customers}
        summary={summary}
        // TODO: Add previousPeriodData for trends
        // previousPeriodData={previousPeriodData}
      />

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{customers.length} cliente{customers.length !== 1 ? 's' : ''} encontrado{customers.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => console.log('Export customers')}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => console.log('GDPR report')}>
            <Crown className="w-4 h-4 mr-2" />
            GDPR Report
          </Button>
        </div>
      </div>

      {/* Filters - RESPONSIVE CARD - MANTENER DISEÑO PERFECTO */}
      <Card className="transition-all duration-200">
        <CardContent className="p-4">
          <CustomerFilters 
            loading={loading}
            currentFilters={filters}
          />
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onStatusUpdate={handleFieldUpdate}
              onGdprExport={handleGdprExport}
              onGdprDelete={handleGdprDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-muted-foreground mb-4">
              {filters.search
                ? 'No hay clientes que coincidan con los criterios de búsqueda.'
                : 'Aún no hay clientes registrados en el sistema.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Los clientes se crean automáticamente al hacer reservas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}