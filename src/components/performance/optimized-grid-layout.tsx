'use client'

import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Save, RotateCcw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Static CSS imports to prevent blocking
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// Types
interface TableData {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  qrCode: string
  isActive: boolean
  restaurantId: string
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'
  currentReservation?: {
    customerName: string
    partySize: number
    time: string
    status: string
  } | null
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
  isDraggable?: boolean
  static?: boolean
}

// Status colors
const STATUS_COLORS = {
  available: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200',
  reserved: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200',
  occupied: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200',
  maintenance: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/20 dark:border-gray-600 dark:text-gray-200'
}

// Table shape helper
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
      iconShape: 'rounded-lg'
    }
  } else if (capacity <= 4) {
    return {
      shape: 'rectangle',
      aspectRatio: 'aspect-[3/2]',
      dimensions: 'min-h-[80px] min-w-[120px]',
      iconShape: 'rounded-md'
    }
  } else if (capacity <= 6) {
    return {
      shape: 'oval',
      aspectRatio: 'aspect-[2/1]',
      dimensions: 'min-h-[80px] min-w-[160px]',
      iconShape: 'rounded-full'
    }
  } else {
    return {
      shape: 'circle',
      aspectRatio: 'aspect-square',
      dimensions: 'min-h-[100px] min-w-[100px]',
      iconShape: 'rounded-full'
    }
  }
}

// Performance-optimized dynamic import with proper error handling
const ResponsiveGridLayout = dynamic(
  async () => {
    try {
      const RGL = await import('react-grid-layout')
      const GridLayout = RGL.default || RGL
      const WidthProvider = GridLayout.WidthProvider || RGL.WidthProvider
      const Responsive = GridLayout.Responsive || RGL.Responsive

      if (!WidthProvider || !Responsive) {
        throw new Error('Grid layout components not found')
      }

      return WidthProvider(Responsive)
    } catch (error) {
      console.error('Failed to load grid layout:', error)
      return FallbackGridComponent
    }
  },
  {
    ssr: false,
    loading: () => <GridLoadingSkeleton />,
  }
)

// Optimized table item component with React.memo
const TableItem = memo(({ table }: { table: TableData }) => {
  const statusColor = STATUS_COLORS[table.currentStatus || 'available']
  const tableShape = getTableShape(table.capacity)

  return (
    <div
      className={`
        ${table.isActive ? statusColor : 'opacity-60 border-dashed bg-gray-50'}
        ${tableShape.iconShape} ${tableShape.aspectRatio} ${tableShape.dimensions}
        border-2 p-3 h-full w-full
        flex flex-col items-center justify-center
        shadow-sm transition-all duration-200
        text-sm font-medium relative overflow-hidden
      `}
      title={`Mesa ${table.number} - ${table.capacity} personas`}
    >
      <div className="text-xl font-bold">{table.number}</div>
      <div className="text-xs opacity-75">{table.capacity}p</div>
      <Badge variant={table.isActive ? "secondary" : "outline"} className="text-xs mt-1">
        {!table.isActive ? 'Cerrada' :
         table.currentStatus === 'available' ? 'Libre' :
         table.currentStatus === 'reserved' ? 'Reservada' :
         table.currentStatus === 'occupied' ? 'Ocupada' :
         'Mantenimiento'}
      </Badge>
    </div>
  )
})

// Fallback component for when grid layout fails to load
function FallbackGridComponent({ children, ...props }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {children}
    </div>
  )
}

// Loading skeleton
function GridLoadingSkeleton() {
  return (
    <div className="h-96 bg-muted animate-pulse rounded flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Cargando vista de planta...</span>
    </div>
  )
}

interface OptimizedTableFloorPlanProps {
  tables: TableData[]
}

export function OptimizedTableFloorPlan({ tables }: OptimizedTableFloorPlanProps) {
  const [layouts, setLayouts] = useState<{ [key: string]: LayoutItem[] }>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  // Refs for performance optimization
  const layoutGenerationRef = useRef<{ [key: string]: LayoutItem[] }>({})
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()

  // Optimized layout generation with memoization
  const generateLayout = useCallback((tables: TableData[], breakpoint: string): LayoutItem[] => {
    const cacheKey = `${breakpoint}-${tables.length}-${tables.map(t => t.id).join('')}`

    if (layoutGenerationRef.current[cacheKey]) {
      return layoutGenerationRef.current[cacheKey]
    }

    const layout = tables.map((table, index) => {
      const tableShape = getTableShape(table.capacity)
      const cols = breakpoint === 'lg' ? 12 : breakpoint === 'md' ? 10 : 6

      let width = Math.max(1, Math.floor(cols / 8))
      let height = 1

      if (table.capacity > 6) {
        width = Math.max(2, Math.floor(cols / 4))
        height = 2
      }

      const row = Math.floor(index / Math.floor(cols / width))
      const col = (index % Math.floor(cols / width)) * width

      return {
        i: table.id,
        x: Math.min(col, cols - width),
        y: row,
        w: width,
        h: height,
        minW: 1,
        maxW: 3,
        minH: 1,
        maxH: 2,
        isDraggable: table.isActive,
        static: !table.isActive
      }
    })

    layoutGenerationRef.current[cacheKey] = layout
    return layout
  }, [])

  // Debounced layout change handler to prevent performance issues
  const handleLayoutChange = useCallback((currentLayout: LayoutItem[], allLayouts: { [key: string]: LayoutItem[] }) => {
    // Don't update during resize operations
    if (isResizing) return

    // Clear any existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }

    // Debounce layout changes
    resizeTimeoutRef.current = setTimeout(() => {
      setLayouts(allLayouts)
      setHasChanges(true)
    }, 300) // Increased debounce time for better performance
  }, [isResizing])

  // Optimized resize detection
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout

    const handleResize = () => {
      setIsResizing(true)
      clearTimeout(resizeTimeout)

      resizeTimeout = setTimeout(() => {
        setIsResizing(false)
      }, 500) // Stop detecting resize after 500ms of no activity
    }

    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  // Initialize layouts with performance optimization
  useEffect(() => {
    const newLayouts = {
      lg: generateLayout(tables, 'lg'),
      md: generateLayout(tables, 'md'),
      sm: generateLayout(tables, 'sm'),
    }
    setLayouts(newLayouts)
  }, [tables, generateLayout])

  // Optimized save function
  const saveLayout = useCallback(async () => {
    if (!hasChanges || isSaving) return

    setIsSaving(true)
    try {
      // Save to localStorage first for immediate feedback
      localStorage.setItem('enigma-table-layouts', JSON.stringify(layouts))

      // Then save to server
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

      toast.success('Layout guardado correctamente')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving layout:', error)
      toast.error('Error al guardar el layout')
    } finally {
      setIsSaving(false)
    }
  }, [layouts, hasChanges, isSaving])

  // Optimized reset function
  const resetLayout = useCallback(() => {
    const newLayouts = {
      lg: generateLayout(tables, 'lg'),
      md: generateLayout(tables, 'md'),
      sm: generateLayout(tables, 'sm'),
    }
    setLayouts(newLayouts)
    setHasChanges(true)
    toast.info('Layout restablecido')
  }, [tables, generateLayout])

  // Memoized responsive grid to prevent unnecessary re-renders
  const ResponsiveGridMemo = useMemo(() => ResponsiveGridLayout, [])

  // Performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 16) { // >16ms = potential jank
            console.warn(`🐌 Slow render detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['measure'] })

      return () => observer.disconnect()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Vista de Planta Optimizada
            {isResizing && (
              <Badge variant="outline" className="text-xs">
                Redimensionando...
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetLayout}
              disabled={isResizing}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            <Button
              onClick={saveLayout}
              disabled={!hasChanges || isSaving || isResizing}
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
        <div className="min-h-[400px] border border-border rounded-lg overflow-hidden">
          <ResponsiveGridMemo
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={80}
            margin={[12, 12]}
            containerPadding={[20, 20]}
            onLayoutChange={handleLayoutChange}
            isDraggable={!isResizing}
            isResizable={false}
            preventCollision={false}
            compactType="vertical"
            useCSSTransforms={false} // Disable for better performance
            measureBeforeMount={true}
            isBounded={true}
            autoSize={true}
          >
            {tables.map((table) => (
              <div key={table.id}>
                <TableItem table={table} />
              </div>
            ))}
          </ResponsiveGridMemo>
        </div>
      </CardContent>
    </Card>
  )
}