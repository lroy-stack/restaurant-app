'use client'

import { useState, useEffect } from 'react'
import { useTableStore } from '@/stores/useTableStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  RefreshCw, 
  Clock, 
  Users, 
  MapPin, 
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Timer
} from 'lucide-react'

// 🚀 CRITICAL FIX: Format reservation time with Madrid timezone
const formatReservationTime = (timeString: string): string => {
  try {
    const date = new Date(timeString)
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', timeString)
      return 'Hora inválida'
    }
    // Format with Madrid timezone to display correct local time
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    })
  } catch (error) {
    console.error('Error formatting time:', error, timeString)
    return 'Error hora'
  }
}

// REAL Enigma zones with responsive labels
const ENIGMA_ZONES = {
  'TERRACE_1': 'Terraza 1',
  'MAIN_ROOM': 'Sala Principal',
  'VIP_ROOM': 'Sala VIP',
  'TERRACE_2': 'Terraza 2'
} as const

const ZONE_LABELS_RESPONSIVE = {
  'TERRACE_1': {
    full: 'Terraza 1',
    medium: 'T. Campanari',
    compact: 'T.C.'
  },
  'MAIN_ROOM': {
    full: 'Sala Principal',
    medium: 'S. Principal',
    compact: 'S.P.'
  },
  'VIP_ROOM': {
    full: 'Sala VIP',
    medium: 'Sala VIP',
    compact: 'VIP'
  },
  'TERRACE_2': {
    full: 'Terraza 2',
    medium: 'T. Justicia',
    compact: 'T.J.'
  }
}

interface TableData {
  id: string
  number: string
  capacity: number
  location: keyof typeof ENIGMA_ZONES
  qrCode: string
  isActive: boolean
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'
  currentReservation?: any
  statusNotes?: string
  estimatedFreeTime?: string
}

interface TableStatusPanelProps {
  tables: TableData[]
}

type TableStatus = 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'

// Responsive status config with adaptive labels
const STATUS_CONFIG = {
  available: {
    labels: { full: 'Disponible', compact: 'Libre' },
    icon: CheckCircle2,
    color: 'text-[#9FB289] dark:text-[#9FB289]',
    bgColor: 'bg-[#9FB289]/10 dark:bg-[#9FB289]/20',
    borderColor: 'border-[#9FB289]/30 dark:border-[#9FB289]/40',
    badgeVariant: 'default' as const,
    statusDot: 'bg-[#9FB289]'
  },
  reserved: {
    labels: { full: 'Reservada', compact: 'Reserv.' },
    icon: Clock,
    color: 'text-[#237584] dark:text-[#237584]',
    bgColor: 'bg-[#237584]/10 dark:bg-[#237584]/20',
    borderColor: 'border-[#237584]/30 dark:border-[#237584]/40',
    badgeVariant: 'secondary' as const,
    statusDot: 'bg-[#237584]'
  },
  occupied: {
    labels: { full: 'Ocupada', compact: 'Ocup.' },
    icon: Users,
    color: 'text-[#CB5910] dark:text-[#CB5910]',
    bgColor: 'bg-[#CB5910]/10 dark:bg-[#CB5910]/20',
    borderColor: 'border-[#CB5910]/30 dark:border-[#CB5910]/40',
    badgeVariant: 'destructive' as const,
    statusDot: 'bg-[#CB5910]'
  },
  maintenance: {
    labels: { full: 'Mantenimiento', compact: 'Mant.' },
    icon: Wrench,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    badgeVariant: 'outline' as const,
    statusDot: 'bg-muted-foreground'
  },
  temporally_closed: {
    labels: { full: 'Temporalmente Cerrada', compact: 'Cerrada' },
    icon: XCircle,
    color: 'text-destructive dark:text-destructive',
    bgColor: 'bg-destructive/10 dark:bg-destructive/20',
    borderColor: 'border-destructive/30 dark:border-destructive/40',
    badgeVariant: 'destructive' as const,
    statusDot: 'bg-destructive'
  }
}

function TableStatusCard({
  table,
  onUpdateStatus
}: {
  table: TableData
  onUpdateStatus: (tableId: string, status: TableStatus, notes?: string, estimatedFreeTime?: string) => void
}) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<TableStatus>(table.currentStatus || 'available')
  const [notes, setNotes] = useState(table.statusNotes || '')
  const [estimatedFreeTime, setEstimatedFreeTime] = useState(table.estimatedFreeTime || '')
  
  const currentConfig = !table.isActive
    ? STATUS_CONFIG['temporally_closed']
    : STATUS_CONFIG[table.currentStatus || 'available']
  const StatusIcon = currentConfig.icon

  const handleStatusUpdate = async () => {
    if (selectedStatus === table.currentStatus &&
        notes === (table.statusNotes || '') &&
        estimatedFreeTime === (table.estimatedFreeTime || '')) {
      return
    }

    setIsUpdating(true)
    try {
      await onUpdateStatus(table.id, selectedStatus, notes, estimatedFreeTime)
      // Close modal and reset form after successful update
      setIsModalOpen(false)
      resetForm()
    } finally {
      setIsUpdating(false)
    }
  }

  const resetForm = () => {
    setSelectedStatus(table.currentStatus || 'available')
    setNotes(table.statusNotes || '')
    setEstimatedFreeTime(table.estimatedFreeTime || '')
  }

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Card className={`${currentConfig.bgColor} ${currentConfig.borderColor} border-2 flex flex-col min-h-0 transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold flex items-center gap-2 flex-1 min-w-0">
              <div className={`p-1.5 rounded-full ${currentConfig.bgColor} ring-1 ring-white/20`}>
                <StatusIcon className={`w-4 h-4 ${currentConfig.color}`} />
              </div>
              <span className="break-words">Mesa {table.number}</span>
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="break-words font-medium">{ZONE_LABELS_RESPONSIVE[table.location]?.full || ENIGMA_ZONES[table.location]}</span>
            </div>
            <Badge variant={currentConfig.badgeVariant} className="text-xs px-2.5 py-0.5 break-words text-center font-medium shadow-sm">
              {!table.isActive ? 'Cerrada' : currentConfig.labels?.full}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {/* Table Details */}
        <div className="flex justify-between items-center p-2 bg-background/30 rounded-lg border">
          <span className="text-muted-foreground text-sm flex-shrink-0">Capacidad:</span>
          <span className="font-semibold text-sm break-words">{table.capacity} pax</span>
        </div>
        
        {/* Current Reservation Info */}
        {table.currentReservation && (
          <div className="p-2 bg-background/50 rounded-lg border">
            <p className="text-sm font-medium break-words">{table.currentReservation.customerName}</p>
            <p className="text-xs text-muted-foreground">
              {table.currentReservation.partySize} personas • {formatReservationTime(table.currentReservation.time)}
            </p>
          </div>
        )}

        {/* Status Notes */}
        {table.statusNotes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Notas: </span>
            <span className="break-words">{table.statusNotes}</span>
          </div>
        )}

        {/* Estimated Free Time */}
        {table.estimatedFreeTime && table.currentStatus === 'occupied' && (
          <div className="text-sm flex flex-col sm:flex-row sm:items-center gap-1">
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Libre aprox:</span>
            </div>
            <span className="font-medium break-words">{table.estimatedFreeTime}</span>
          </div>
        )}

        {/* Status Update Dialog */}
        <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full mt-auto text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200
                         border-border/80 hover:border-border bg-card/50 hover:bg-card
                         text-foreground/90 hover:text-foreground dark:border-border/60 dark:hover:border-border/80
                         dark:bg-card/30 dark:hover:bg-card/60 dark:text-foreground/80 dark:hover:text-foreground"
              size="sm"
              disabled={!table.isActive}
            >
              <span className="break-words text-center">
                {table.isActive ? 'Cambiar Estado' : 'Activar Mesa'}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Actualizar Mesa {table.number}</DialogTitle>
              <DialogDescription>
                Cambiar el estado y agregar notas para Mesa {table.number} en {ENIGMA_ZONES[table.location]}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Status Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={selectedStatus} onValueChange={(value: TableStatus) => setSelectedStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG)
                      .filter(([status]) => status !== 'temporally_closed') // Only show for active tables
                      .map(([status, config]) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <config.icon className={`w-4 h-4 ${config.color}`} />
                            {config.labels?.full}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas (opcional)</label>
                <Textarea
                  placeholder="Agregar notas sobre el estado de la mesa..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Estimated Free Time (only for occupied tables) */}
              {selectedStatus === 'occupied' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiempo estimado libre (opcional)</label>
                  <Select value={estimatedFreeTime} onValueChange={setEstimatedFreeTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tiempo estimado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin estimación</SelectItem>
                      <SelectItem value="15:30">15:30</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="16:30">16:30</SelectItem>
                      <SelectItem value="17:00">17:00</SelectItem>
                      <SelectItem value="17:30">17:30</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="18:30">18:30</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="19:30">19:30</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                      <SelectItem value="20:30">20:30</SelectItem>
                      <SelectItem value="21:00">21:00</SelectItem>
                      <SelectItem value="21:30">21:30</SelectItem>
                      <SelectItem value="22:00">22:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? 'Actualizando...' : 'Actualizar Estado'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export function TableStatusPanel({ tables: propTables }: TableStatusPanelProps) {
  // Use Zustand store instead of props
  const { tables: storeTables, loadTables, updateTableStatus: updateTableStatusStore } = useTableStore()
  const tables = storeTables.length > 0 ? storeTables : propTables

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [filteredTables, setFilteredTables] = useState(tables)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')

  // Load tables from store on mount
  useEffect(() => {
    loadTables()
  }, [])

  // ENHANCED auto-refresh using store's loadTables function
  useEffect(() => {
    if (!autoRefresh) return

    const refreshStatuses = async () => {
      try {
        await loadTables()
        setLastUpdate(new Date())
        console.log('🔄 Table status refreshed via store')
      } catch (error) {
        console.error('Error refreshing table status:', error)
        // Store already handles error toast
      }
    }

    // Initial refresh
    refreshStatuses()

    const interval = setInterval(refreshStatuses, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, loadTables])

  // Filter tables based on selected filters
  useEffect(() => {
    let filtered = tables

    if (statusFilter !== 'all') {
      filtered = filtered.filter(table => table.currentStatus === statusFilter)
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(table => table.location === locationFilter)
    }

    setFilteredTables(filtered)
  }, [tables, statusFilter, locationFilter])

  const updateTableStatus = async (tableId: string, status: TableStatus, notes?: string, estimatedFreeTime?: string) => {
    try {
      // Use store function - handles API call + immediate state update
      await updateTableStatusStore(tableId, status, notes, estimatedFreeTime)
      // No need for manual state update or toast - store handles it
    } catch (error) {
      console.error('Error updating table status:', error)
      // Store already shows error toast, but re-throw for component error handling
      throw error
    }
  }

  // Status summary
  const statusSummary = {
    available: tables.filter(t => t.isActive && t.currentStatus === 'available').length,
    reserved: tables.filter(t => t.currentStatus === 'reserved').length,
    occupied: tables.filter(t => t.currentStatus === 'occupied').length,
    maintenance: tables.filter(t => t.currentStatus === 'maintenance').length,
    temporally_closed: tables.filter(t => !t.isActive || t.currentStatus === 'temporally_closed').length
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Panel de Estados - Tiempo Real
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Auto-refresh Toggle */}
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </Button>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Estados</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.labels?.full}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Zonas</SelectItem>
                  {Object.entries(ENIGMA_ZONES).map(([location, label]) => (
                    <SelectItem key={location} value={location}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Status Summary - Enhanced Responsive Design */}
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(statusSummary).map(([status, count]) => {
              const config = STATUS_CONFIG[status as TableStatus]
              const StatusIcon = config.icon
              return (
                <div key={status} className={`
                  relative group p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
                  ${config.bgColor} ${config.borderColor} hover:scale-[1.02]
                `}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`
                      p-2 rounded-full ${config.bgColor} ring-2 ring-white/50 shadow-sm
                    `}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${config.color}`}>{count}</div>
                      <div className={`text-xs font-medium ${config.color.replace('700', '600').replace('300', '400')} leading-tight break-words text-center`}>
                        {config.labels?.compact || config.labels?.full || 'Estado'}
                      </div>
                    </div>
                  </div>

                  {/* Subtle animated indicator for active counts */}
                  {count > 0 && (
                    <div className={`
                      absolute -top-1 -right-1 w-3 h-3 rounded-full ${config.statusDot}
                      animate-pulse shadow-sm ring-2 ring-white/80 dark:ring-gray-900/80
                    `} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Quick Status Insights */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#9FB289] rounded-full animate-pulse" />
                  <span>{statusSummary.available} libres</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#CB5910] rounded-full animate-pulse" />
                  <span>{statusSummary.reserved + statusSummary.occupied} ocupadas</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {Math.round((statusSummary.available / Math.max(1, statusSummary.available + statusSummary.reserved + statusSummary.occupied)) * 100)}% disponible
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid - Adaptive height responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-min">
        {filteredTables.map((table) => (
          <TableStatusCard 
            key={table.id} 
            table={table} 
            onUpdateStatus={updateTableStatus}
          />
        ))}
      </div>

      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              No hay mesas con los filtros seleccionados
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Cambia los filtros para ver las mesas disponibles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}