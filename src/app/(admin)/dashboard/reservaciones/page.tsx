'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  CalendarDays,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  XCircle,
  List,
  Calendar,
  BarChart3
} from 'lucide-react'
import { useRealtimeReservations } from '@/hooks/useRealtimeReservations'
import { useTables } from '@/hooks/useTables'
import { ReservationFilters } from './components/reservation-filters'
import { CompactReservationList } from './components/compact-reservation-list'
import { InfiniteReservationList } from './components/infinite-reservation-list'
import { QuickStats } from './components/quick-stats'
import { ReservationCalendar } from './components/reservation-calendar'
import { OccupancyHeatmap } from './components/occupancy-heatmap'
import { QuickCreateModal } from './components/quick-create-modal'
import { ReservationDetailModal } from './components/reservation-detail-modal'
import { ExportModal } from '@/components/reservations/export-modal'
import { NotificationSettings } from '@/components/dashboard/notification-settings'
import { InboxButton } from '@/components/dashboard/inbox-button'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ReservacionesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showExportModal, setShowExportModal] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalData, setCreateModalData] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailReservationId, setDetailReservationId] = useState<string | null>(null)

  // View mode from URL
  const currentView = searchParams.get('view') || 'list'

  // Extract filters from URL params
  const filters: {
    status?: string
    date?: string
    search?: string
    tableId?: string
  } = {
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

  const handleStatusUpdate = async (id: string, status: string, additionalData?: any): Promise<void> => {
    const success = await updateReservationStatus(id, status, additionalData)
    if (success) {
      toast.success(`Reservación ${status.toLowerCase()} exitosamente`)
    } else {
      toast.error('Error al actualizar la reservación')
    }
  }

  const handleRefresh = async () => {
    await refetch()
    toast.success('Lista de reservas actualizada')
  }

  const handleReservationDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Delete failed:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to delete reservation')
      }

      await refetch()
      toast.success('Reserva eliminada correctamente')
    } catch (error) {
      console.error('Error deleting reservation:', error)
      toast.error('Error al eliminar la reserva')
      throw error
    }
  }

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`/dashboard/reservaciones?${params.toString()}`)
  }

  const handleEventClick = (reservationId: string) => {
    setDetailReservationId(reservationId)
    setDetailModalOpen(true)
  }

  const handleCalendarSlotClick = (slotInfo: any) => {
    // Si es vista de día/semana, slotInfo.start ya tiene la hora del slot
    // Si es vista de mes, slotInfo.start es medianoche (00:00)
    const selectedDate = slotInfo.start
    const isTimeSlot = selectedDate.getHours() !== 0 || selectedDate.getMinutes() !== 0

    setCreateModalData({
      dateTime: selectedDate,
      partySize: 2,
      // El modal manejará el default de 20:00 si es 00:00
    })
    setCreateModalOpen(true)
  }

  const handleHeatmapDateClick = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(date, 'yyyy-MM-dd'))
    params.set('view', 'calendar')
    router.push(`/dashboard/reservaciones?${params.toString()}`)
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              Gestión de Reservas
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
              Administrar reservas y disponibilidad del restaurante
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error al cargar reservas
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Gestión de Reservas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
            Administrar reservas y disponibilidad del restaurante
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
          {/* Mobile: Inbox destacado (flex-1), Notificaciones compacto, Refresh icono solo */}
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <InboxButton onReservationClick={handleEventClick} />
          </div>
          <NotificationSettings />
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={loading}
            className="w-9 p-0 sm:w-auto sm:px-3 text-muted-foreground hover:text-foreground"
            title="Actualizar reservas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* QuickStats Dashboard Widgets - Hidden on mobile */}
      <div className="hidden lg:block">
        <QuickStats reservations={reservations} />
      </div>

      {/* Tabs Navigation */}
      <Tabs value={currentView} onValueChange={handleViewChange} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="list" className="text-xs sm:text-sm">
              <List className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Heatmap
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => setCreateModalOpen(true)} size="sm">
            Nueva Reserva
          </Button>
        </div>

        {/* Filters - Common for all views */}
        <Card>
          <CardContent className="p-4">
            <ReservationFilters
              tables={tables}
              loading={tablesLoading}
              error={tablesError}
              currentFilters={filters}
            />
          </CardContent>
        </Card>

        {/* List View */}
        <TabsContent value="list" className="mt-0">
          <CompactReservationList
            reservations={reservations}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
            onReservationUpdate={updateReservation}
            onReservationDelete={handleReservationDelete}
            bulkMode={false}
          />
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-0">
          <ReservationCalendar
            reservations={reservations}
            loading={loading}
            currentDate={new Date()}
            onReservationClick={handleEventClick}
            onSlotClick={handleCalendarSlotClick}
          />
        </TabsContent>

        {/* Heatmap View */}
        <TabsContent value="heatmap" className="mt-0">
          <OccupancyHeatmap
            startDate={new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)}
            endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            onDateClick={handleHeatmapDateClick}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <QuickCreateModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          setCreateModalData(null)
        }}
        initialData={createModalData}
        onSuccess={() => {
          refetch()
          toast.success('Reserva creada exitosamente')
        }}
      />

      {detailReservationId && (
        <ReservationDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false)
            setDetailReservationId(null)
          }}
          reservation={reservations.find(r => r.id === detailReservationId)!}
          onUpdate={updateReservation}
        />
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        reservations={reservations}
        totalCount={reservations.length}
      />
    </div>
  )
}