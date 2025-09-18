'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CalendarDays, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  XCircle
} from 'lucide-react'
import { useRealtimeReservations } from '@/hooks/useRealtimeReservations'
import { useTables } from '@/hooks/useTables'
import { ReservationFilters } from './components/reservation-filters'
import { ReservationList } from './components/reservation-list'
import { CompactReservationList } from './components/compact-reservation-list'
import { QuickStats } from './components/quick-stats'
import { ViewToggle, useViewMode } from './components/view-toggle'
import { ReservationCalendar } from './components/reservation-calendar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ReservacionesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { currentView } = useViewMode()
  
  // Extract filters from URL params
  const filters = {
    status: searchParams.get('status') || undefined,
    date: searchParams.get('date') || undefined,
    search: searchParams.get('search') || undefined,
    tableId: searchParams.get('tableId') || undefined
  }

  // Use the real-time hook for reservations
  const {
    reservations,
    summary,
    loading,
    error,
    refetch,
    updateReservationStatus,
    updateReservation,
    sendReminder
  } = useRealtimeReservations(filters)

  // Use the real tables hook - NO MORE MOCK DATA! ✅
  const {
    tables,
    loading: tablesLoading,
    error: tablesError
  } = useTables()

  const handleStatusUpdate = async (id: string, status: string, additionalData?: any) => {
    const success = await updateReservationStatus(id, status, additionalData)
    if (success) {
      toast.success(`Reservación ${status.toLowerCase()} exitosamente`)
    } else {
      toast.error('Error al actualizar la reservación')
    }
  }

  const handleRefresh = async () => {
    await refetch()
    toast.success('Lista de reservaciones actualizada')
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Reservaciones
            </h1>
            <p className="text-gray-600">
              Administrar reservas y disponibilidad del restaurante
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error al cargar reservaciones
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Reservaciones
          </h1>
          <p className="text-gray-600">
            Administrar reservas y disponibilidad del restaurante
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
        reservations={reservations}
        // TODO: Add previousPeriodData for trends
        // previousPeriodData={previousPeriodData}
      />

      {/* View Toggle & Actions - RESPONSIVE EXCELLENCE */}
      <ViewToggle
        currentView={currentView}
        totalCount={reservations.length}
        loading={loading}
        onNewReservation={() => {
          router.push('/dashboard/reservaciones/nueva')
        }}
        onExport={() => {
          // TODO: Implement export functionality  
          console.log('Export reservations')
        }}
      />

      {/* Filters - RESPONSIVE CARD - MANTENER DISEÑO PERFECTO */}
      <Card className="transition-all duration-200">
        <CardContent className="p-4">
          <ReservationFilters 
            tables={tables}
            loading={tablesLoading}
            error={tablesError}
            currentFilters={filters}
          />
        </CardContent>
      </Card>

      {/* CONDITIONAL RENDERING: Calendar vs Compact List - ZERO REDUNDANCY */}
      {currentView === 'calendar' ? (
        <ReservationCalendar
          reservations={reservations}
          loading={loading}
          currentDate={new Date()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <CompactReservationList
            reservations={reservations}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
            onReservationUpdate={updateReservation}
            bulkMode={false}
            // TODO: Add bulk selection state management
            // selectedIds={selectedIds}
            // onSelectionChange={handleSelectionChange}
          />
        </div>
      )}
    </div>
  )
}