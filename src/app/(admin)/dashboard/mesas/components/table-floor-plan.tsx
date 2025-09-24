'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useTableStore } from '@/stores/useTableStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Save, Loader2 } from 'lucide-react'

// 🚀 Helper function to safely format reservation time
const formatReservationTime = (timeString: string): string => {
  try {
    const date = new Date(timeString)
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', timeString)
      return 'Hora inválida'
    }
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    console.error('Error formatting time:', error, timeString)
    return 'Error hora'
  }
}

// CRITICAL: Dynamic import to prevent SSR issues with react-grid-layout
const ResponsiveGridLayout = dynamic(
  () => import('react-grid-layout').then(mod => mod.WidthProvider(mod.Responsive)),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 bg-muted animate-pulse rounded flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando vista de planta...</span>
      </div>
    )
  }
)

// Import CSS for react-grid-layout
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// REAL Enigma zones
const ENIGMA_ZONES = {
  'TERRACE_CAMPANARI': 'Terraza Campanari',
  'SALA_PRINCIPAL': 'Sala Principal', 
  'SALA_VIP': 'Sala VIP',
  'TERRACE_JUSTICIA': 'Terraza Justicia'
} as const

interface TableData {
  id: string
  number: string
  capacity: number
  location: keyof typeof ENIGMA_ZONES
  qrCode: string
  isActive: boolean
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'
  // 🔥 ACTUALIZADO: Tipo específico para currentReservation
  currentReservation?: {
    customerName: string
    partySize: number
    time: string
    status: string
  } | null
}

interface TableFloorPlanProps {
  tables: TableData[]
}

interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
}

// Status colors with dark mode support
const STATUS_COLORS = {
  available: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200',
  reserved: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200',
  occupied: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200',
  maintenance: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/20 dark:border-gray-600 dark:text-gray-200'
}

// DYNAMIC TABLE SHAPES - Modern 2025 Design Patterns
function getTableShape(capacity: number): { 
  shape: 'square' | 'rectangle' | 'circle' | 'oval',
  aspectRatio: string,
  dimensions: string,
  iconShape: string
} {
  if (capacity <= 2) {
    return {
      shape: 'square',
      aspectRatio: 'aspect-square',
      dimensions: 'min-h-[80px] min-w-[80px]',
      iconShape: 'rounded-lg' // Square tables for 2 pax
    }
  } else if (capacity <= 4) {
    return {
      shape: 'rectangle', 
      aspectRatio: 'aspect-[3/2]',
      dimensions: 'min-h-[80px] min-w-[120px]',
      iconShape: 'rounded-md' // Rectangular tables for 4 pax
    }
  } else if (capacity <= 6) {
    return {
      shape: 'oval',
      aspectRatio: 'aspect-[2/1]', 
      dimensions: 'min-h-[80px] min-w-[160px]',
      iconShape: 'rounded-full' // Oval for 6+ pax
    }
  } else {
    return {
      shape: 'circle',
      aspectRatio: 'aspect-square',
      dimensions: 'min-h-[100px] min-w-[100px]',
      iconShape: 'rounded-full' // Large round for 8+ pax
    }
  }
}

// Modern Table Item with Dynamic Shapes - Following Tabler Design Principles
function TableItem({ table }: { table: TableData }) {
  const statusColor = STATUS_COLORS[table.currentStatus || 'available']
  const tableShape = getTableShape(table.capacity)
  
  // Special styling for inactive tables (seasonal tables like TERRACE_JUSTICIA)
  const inactiveStyles = !table.isActive 
    ? 'opacity-60 border-dashed bg-gray-50 border-gray-400 text-gray-600 cursor-not-allowed dark:bg-gray-800/20 dark:border-gray-600 dark:text-gray-400' 
    : ''
  
  // Zone-based accent colors for modern visual hierarchy
  const zoneAccents = {
    'TERRACE_CAMPANARI': 'border-l-4 border-l-orange-400 dark:border-l-orange-300',
    'SALA_PRINCIPAL': 'border-l-4 border-l-blue-400 dark:border-l-blue-300',
    'SALA_VIP': 'border-l-4 border-l-purple-400 dark:border-l-purple-300',
    'TERRACE_JUSTICIA': 'border-l-4 border-l-amber-400 dark:border-l-amber-300'
  }
  
  return (
    <div 
      className={`
        ${table.isActive ? statusColor : inactiveStyles}
        ${tableShape.iconShape} ${tableShape.aspectRatio} ${tableShape.dimensions}
        ${zoneAccents[table.location]}
        border-2 p-3 h-full w-full 
        ${table.isActive ? 'cursor-move' : 'cursor-not-allowed'}
        flex flex-col items-center justify-center
        shadow-sm hover:shadow-lg hover:scale-105 
        transition-all duration-300 ease-in-out
        text-sm font-medium relative overflow-hidden
        backdrop-blur-sm
      `}
      title={`Mesa ${table.number} - ${table.capacity} personas - ${table.location}`}
    >
      {/* Modern gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      {/* Table number with modern typography */}
      <div className="text-xl font-bold tracking-wider relative z-10">
        {table.number}
      </div>
      
      {/* Capacity with shape indicator */}
      <div className="text-xs opacity-75 relative z-10 flex items-center gap-1">
        <div className={`w-2 h-2 ${tableShape.iconShape} bg-current opacity-50`} />
        {table.capacity}p
      </div>
      
      {/* Status badge with modern styling */}
      <Badge
        variant={table.isActive ? "secondary" : "outline"}
        className="text-xs mt-1 relative z-10 backdrop-blur-sm"
      >
        {!table.isActive ? 'Cerrada' :
         table.currentStatus === 'available' ? 'Libre' :
         table.currentStatus === 'reserved' ? 'Reservada' :
         table.currentStatus === 'occupied' ? 'Ocupada' :
         'Mantenimiento'}
      </Badge>

      {/* 🔥 NUEVO: Mostrar información de reserva si existe */}
      {table.isActive && table.currentReservation && (
        <div className="text-xs mt-1 relative z-10 text-center space-y-0.5">
          <div className="font-semibold text-primary truncate">
            {table.currentReservation.customerName}
          </div>
          <div className="opacity-75">
            {table.currentReservation.partySize}p • {formatReservationTime(table.currentReservation.time)}
          </div>
        </div>
      )}
      
      {/* Subtle zone indicator */}
      <div className="absolute bottom-1 right-1 text-xs opacity-30 font-mono">
        {table.location.split('_')[1]?.[0] || 'E'}
      </div>
    </div>
  )
}

export function TableFloorPlan({ tables: propTables }: TableFloorPlanProps) {
  // Use Zustand store instead of props
  const { tables: storeTables, loadTables } = useTableStore()
  const tables = storeTables.length > 0 ? storeTables : propTables

  // Load tables from store on mount
  useEffect(() => {
    loadTables()
  }, [])

  const [selectedLocation, setSelectedLocation] = useState<string>('ALL')
  const [hasChanges, setHasChanges] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [isSaving, setIsSaving] = useState(false)
  const [layouts, setLayouts] = useState<{ [key: string]: LayoutItem[] }>({})

  // Grid containment styles - EXACT copy from Badezeit working implementation
  const gridContainmentStyles = `
    .react-grid-layout {
      position: relative !important;
      overflow: hidden !important;
      min-width: 0 !important;
      min-height: 0 !important;
      background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%),
                  linear-gradient(-45deg, #f8f9fa 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #f8f9fa 75%),
                  linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
    .theme-obsidian .react-grid-layout, .dark .react-grid-layout {
      background: linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
                  linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
                  linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
    .react-grid-item {
      min-width: 0 !important;
      min-height: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      touch-action: manipulation !important;
    }
    .react-grid-item.react-grid-placeholder {
      background: rgba(59, 130, 246, 0.15) !important;
      border: 2px dashed #3b82f6 !important;
      opacity: 0.2;
      transition-duration: 100ms;
    }
    .react-resizable-handle {
      display: none !important;
    }
  `

  // Filter tables by selected location
  const filteredTables = useMemo(() => {
    if (selectedLocation === 'ALL') return tables
    return tables.filter(table => table.location === selectedLocation)
  }, [tables, selectedLocation])

  // DYNAMIC LAYOUT GENERATION - Smart positioning based on table shapes and capacity
  const generateLayout = useCallback((tables: TableData[], breakpoint: string): LayoutItem[] => {
    return tables.map((table, index) => {
      // Try to get saved layout from localStorage
      const savedLayouts = localStorage.getItem('enigma-table-layouts')
      if (savedLayouts) {
        try {
          const parsed = JSON.parse(savedLayouts)
          const savedLayout = parsed[breakpoint]?.find((item: LayoutItem) => item.i === table.id)
          if (savedLayout) return savedLayout
        } catch (error) {
          console.warn('Failed to parse saved layouts:', error)
        }
      }

      // DYNAMIC SIZING based on table capacity and shape
      const tableShape = getTableShape(table.capacity)
      const cols = breakpoint === 'lg' ? 12 : breakpoint === 'md' ? 10 : breakpoint === 'sm' ? 6 : 4
      
      let width: number, height: number
      
      // Smart width/height based on table capacity and shape
      if (table.capacity <= 2) {
        // Square tables for 2 pax - compact
        width = Math.max(1, Math.floor(cols / 8)) 
        height = 1
      } else if (table.capacity <= 4) {
        // Rectangular tables for 4 pax - standard
        width = Math.max(2, Math.floor(cols / 6))
        height = 1
      } else if (table.capacity <= 6) {
        // Oval tables for 6 pax - wider
        width = Math.max(3, Math.floor(cols / 4))
        height = 1
      } else {
        // Large round tables for 8+ pax - bigger
        width = Math.max(3, Math.floor(cols / 3))
        height = 2
      }
      
      // Smart positioning: Group similar capacity tables together
      let baseX = 0, baseY = 0
      
      // Zone-based positioning for better visual organization
      if (table.location === 'TERRACE_CAMPANARI') {
        baseX = 0
        baseY = 0
      } else if (table.location === 'SALA_PRINCIPAL') {
        baseX = Math.floor(cols / 2)
        baseY = 0
      } else if (table.location === 'SALA_VIP') {
        baseX = 0
        baseY = 5
      } else if (table.location === 'TERRACE_JUSTICIA') {
        baseX = Math.floor(cols / 2)
        baseY = 5
      }
      
      // Calculate position within zone
      const zoneTableIndex = tables.filter(t => t.location === table.location).indexOf(table)
      const itemsPerZoneRow = Math.floor((cols / 2) / width)
      const zoneRow = Math.floor(zoneTableIndex / itemsPerZoneRow)
      const zoneCol = (zoneTableIndex % itemsPerZoneRow) * width

      return {
        i: table.id,
        x: Math.min(baseX + zoneCol, cols - width),
        y: baseY + zoneRow,
        w: width,
        h: height,
        minW: 1,
        maxW: Math.min(4, cols - 1),
        minH: 1,
        maxH: table.capacity > 6 ? 3 : 2,
        // Only active tables can be dragged
        isDraggable: table.isActive,
        static: !table.isActive
      }
    })
  }, [])

  // Initialize layouts on component mount
  useEffect(() => {
    const newLayouts = {
      lg: generateLayout(filteredTables, 'lg'),
      md: generateLayout(filteredTables, 'md'),
      sm: generateLayout(filteredTables, 'sm'),
      xs: generateLayout(filteredTables, 'xs'),
      xxs: generateLayout(filteredTables, 'xxs')
    }
    setLayouts(newLayouts)
  }, [filteredTables, generateLayout])

  const handleLayoutChange = useCallback((currentLayout: LayoutItem[], allLayouts: { [key: string]: LayoutItem[] }) => {
    setLayouts(allLayouts)
    setHasChanges(true)
  }, [])

  const saveLayout = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      // Save to localStorage first (immediate feedback)
      localStorage.setItem('enigma-table-layouts', JSON.stringify(layouts))
      
      // Save to server
      const response = await fetch('/api/tables/layout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante'
        },
        body: JSON.stringify({ layouts })
      })
      
      if (!response.ok) throw new Error('Error saving layout')
      
      toast.success('Layout de mesas guardado correctamente')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving layout:', error)
      toast.error('Error al guardar el layout')
    } finally {
      setIsSaving(false)
    }
  }

  const resetLayout = () => {
    const newLayouts = {
      lg: generateLayout(filteredTables, 'lg'),
      md: generateLayout(filteredTables, 'md'),
      sm: generateLayout(filteredTables, 'sm'),
      xs: generateLayout(filteredTables, 'xs'),
      xxs: generateLayout(filteredTables, 'xxs')
    }
    setLayouts(newLayouts)
    setHasChanges(true)
    toast.info('Layout restablecido a posiciones predeterminadas')
  }

  // Responsive grid memoization (performance optimization)
  const ResponsiveGridMemo = useMemo(() => ResponsiveGridLayout, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: gridContainmentStyles }} />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Vista de Planta - Enigma
              </CardTitle>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las Zonas ({tables.length} mesas)</SelectItem>
                  {Object.entries(ENIGMA_ZONES).map(([value, label]) => {
                    const count = tables.filter(t => t.location === value).length
                    return (
                      <SelectItem key={value} value={value}>
                        {label} ({count} mesas)
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[50px] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                disabled={zoom >= 150}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              {/* Layout Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={resetLayout}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              
              <Button
                onClick={saveLayout}
                disabled={!hasChanges || isSaving}
                className="min-w-[100px]"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Status Legend */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-300 rounded dark:bg-green-800 dark:border-green-600"></div>
                <span className="text-sm">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-200 border border-amber-300 rounded dark:bg-amber-800 dark:border-amber-600"></div>
                <span className="text-sm">Reservada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border border-red-300 rounded dark:bg-red-800 dark:border-red-600"></div>
                <span className="text-sm">Ocupada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"></div>
                <span className="text-sm">Mantenimiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 border-2 border-dashed border-gray-400 rounded opacity-60 dark:bg-gray-800 dark:border-gray-600"></div>
                <span className="text-sm">Temporalmente Cerrada</span>
              </div>
            </div>

            {filteredTables.length > 0 ? (
              <div 
                className="min-h-[400px] border border-border rounded-lg overflow-hidden"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              >
                <ResponsiveGridMemo
                  className="layout"
                  layouts={layouts}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={80}
                  margin={[12, 12]}
                  containerPadding={[20, 20]}
                  onLayoutChange={handleLayoutChange}
                  isDraggable={true}
                  isResizable={false}
                  preventCollision={false}
                  compactType="vertical"
                  useCSSTransforms={true}
                  isBounded={true}
                  autoSize={true}
                  draggableCancel=".no-drag"
                >
                  {filteredTables.map((table) => (
                    <div key={table.id}>
                      <TableItem table={table} />
                    </div>
                  ))}
                </ResponsiveGridMemo>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay mesas en la zona seleccionada</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}