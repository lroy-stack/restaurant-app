'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useCapacityValidation } from '@/hooks/useCapacityValidation'
import type { TableWithPosition } from '@/hooks/useReservations'

interface FloorPlanSelectorProps {
  tables: TableWithPosition[]
  selectedTableIds: string[]
  onSelectionChange: (tableIds: string[]) => void
  partySize: number
  language: 'es' | 'en' | 'de'
  maxSelections?: number
}

const translations = {
  es: {
    available: 'Disponible',
    unavailable: 'No disponible',
    selected: 'Seleccionada',
    capacity: 'capacidad',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    fitScreen: 'Ajustar',
    clickToSelect: 'Click para seleccionar',
    clickToDeselect: 'Click para deseleccionar',
    notAvailable: 'No disponible en este horario'
  },
  en: {
    available: 'Available',
    unavailable: 'Unavailable',
    selected: 'Selected',
    capacity: 'capacity',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    fitScreen: 'Fit Screen',
    clickToSelect: 'Click to select',
    clickToDeselect: 'Click to deselect',
    notAvailable: 'Not available at this time'
  },
  de: {
    available: 'Verfügbar',
    unavailable: 'Nicht verfügbar',
    selected: 'Ausgewählt',
    capacity: 'Kapazität',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    fitScreen: 'Anpassen',
    clickToSelect: 'Klicken zum Auswählen',
    clickToDeselect: 'Klicken zum Abwählen',
    notAvailable: 'Zu dieser Zeit nicht verfügbar'
  }
}

// Emotional descriptions for each table
const emotionalDescriptions: Record<string, { es: string; en: string; de: string }> = {
  'S1': {
    es: 'Para amigos o familia',
    en: 'For friends or family',
    de: 'Für Freunde oder Familie'
  },
  'S2': {
    es: 'Perfecta para cena romántica',
    en: 'Perfect for romantic dinner',
    de: 'Perfekt für romantisches Abendessen'
  },
  'S3': {
    es: 'Mesa de ventana',
    en: 'Window table',
    de: 'Fenstertisch'
  },
  'S4': {
    es: 'Mesa de ventana',
    en: 'Window table',
    de: 'Fenstertisch'
  },
  'S5': {
    es: 'Perfecta para cenas en grupo',
    en: 'Perfect for group dinners',
    de: 'Perfekt für Gruppenessen'
  },
  'S6': {
    es: 'Está en la barra',
    en: 'At the bar',
    de: 'An der Bar'
  },
  'S7': {
    es: 'Experiencia gastronómica',
    en: 'Gastronomic experience',
    de: 'Gastronomisches Erlebnis'
  },
  'S8': {
    es: 'Mesa para amigos',
    en: 'Table for friends',
    de: 'Tisch für Freunde'
  },
  'VIP1': {
    es: 'VIP - Delante de la cocina',
    en: 'VIP - In front of the kitchen',
    de: 'VIP - Vor der Küche'
  },
  'VIP2': {
    es: 'VIP - Delante de la cocina',
    en: 'VIP - In front of the kitchen',
    de: 'VIP - Vor der Küche'
  }
}

export function FloorPlanSelector({
  tables,
  selectedTableIds,
  onSelectionChange,
  partySize,
  language,
  maxSelections = 5
}: FloorPlanSelectorProps) {
  const [scale, setScale] = useState(1)
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null)

  const t = translations[language]

  // Hook de validación de capacidad (mismo que MultiTableSelector)
  const { validateTableSelection } = useCapacityValidation()

  // Get selected tables objects
  const selectedTables = useMemo(() => {
    return tables.filter(t => selectedTableIds.includes(t.id))
  }, [tables, selectedTableIds])

  // Validación de capacidad para cada mesa
  const getTableValidation = useCallback((table: TableWithPosition) => {
    const isSelected = selectedTableIds.includes(table.id)

    // Validación básica de máximo de selecciones
    if (!isSelected && selectedTableIds.length >= maxSelections) {
      return {
        canSelect: false,
        reason: language === 'es' ? `Máximo ${maxSelections} mesas por reserva` :
                 language === 'en' ? `Maximum ${maxSelections} tables per reservation` :
                 `Maximal ${maxSelections} Tische pro Reservierung`,
        severity: 'info' as const
      }
    }

    // Validación de capacidad usando el hook
    return validateTableSelection(table, partySize, selectedTables, isSelected)
  }, [partySize, selectedTables, selectedTableIds, maxSelections, language, validateTableSelection])

  // Calculate SVG viewBox boundaries
  const bounds = useMemo(() => {
    if (tables.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 }
    }

    const minX = Math.min(...tables.map(t => t.position_x)) - 50
    const minY = Math.min(...tables.map(t => t.position_y)) - 50
    const maxX = Math.max(...tables.map(t => t.position_x + t.width)) + 50
    const maxY = Math.max(...tables.map(t => t.position_y + t.height)) + 50

    return { minX, minY, maxX, maxY }
  }, [tables])

  const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`

  const handleTableClick = useCallback((table: TableWithPosition) => {
    if (!table.available) return

    const isSelected = selectedTableIds.includes(table.id)

    if (isSelected) {
      // Deselect - siempre permitido
      onSelectionChange(selectedTableIds.filter(id => id !== table.id))
    } else {
      // Attempt to select - validar primero
      const validation = getTableValidation(table)

      if (!validation.canSelect) {
        // Mostrar razón con toast
        if (validation.severity === 'error') {
          toast.error(validation.reason || (language === 'es' ? 'No se puede seleccionar esta mesa' :
                                           language === 'en' ? 'Cannot select this table' :
                                           'Diese Tisch kann nicht ausgewählt werden'))
        } else if (validation.severity === 'warning') {
          toast.warning(validation.reason || (language === 'es' ? 'Advertencia al seleccionar mesa' :
                                              language === 'en' ? 'Warning when selecting table' :
                                              'Warnung bei der Auswahl des Tisches'))
        } else {
          toast.info(validation.reason || 'Información')
        }
        return
      }

      // Seleccionar mesa
      onSelectionChange([...selectedTableIds, table.id])

      // Si hay warning, mostrar toast informativo
      if (validation.reason && validation.severity === 'warning') {
        toast.info(validation.reason)
      }
    }
  }, [selectedTableIds, onSelectionChange, getTableValidation, language])

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3))
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.5))
  const handleFitScreen = () => setScale(1)

  const getTableFillColor = (table: TableWithPosition): string => {
    const isSelected = selectedTableIds.includes(table.id)
    const validation = getTableValidation(table)

    if (isSelected) return 'oklch(0.55 0.15 220)' // Blue - selected

    // Si la mesa NO se puede seleccionar por capacidad, mostrar en gris
    if (table.available && !validation.canSelect && !isSelected) {
      return 'oklch(0.75 0.02 220)' // Gray - inappropriate capacity
    }

    if (table.available) return 'oklch(0.75 0.12 145)' // Green - available

    // Unavailable states
    if (table.status === 'reserved') return 'oklch(0.65 0.12 30)' // Orange - reserved
    if (table.status === 'occupied' || table.status === 'maintenance') return 'oklch(0.65 0.12 0)' // Red - occupied

    return 'oklch(0.70 0.02 220)' // Gray - unknown unavailable
  }

  const getTableStrokeColor = (table: TableWithPosition): string => {
    const isSelected = selectedTableIds.includes(table.id)

    if (isSelected) return 'oklch(0.45 0.15 220)' // Dark blue
    if (table.available) return 'oklch(0.50 0.15 145)' // Dark green

    if (table.status === 'reserved') return 'oklch(0.45 0.15 30)' // Dark orange
    if (table.status === 'occupied' || table.status === 'maintenance') return 'oklch(0.45 0.15 0)' // Dark red

    return 'oklch(0.50 0.02 220)' // Dark gray
  }

  const getTableOpacity = (table: TableWithPosition): number => {
    const isSelected = selectedTableIds.includes(table.id)
    const validation = getTableValidation(table)

    // Si está seleccionada, opacidad completa
    if (isSelected) return 1

    // Si NO está disponible, opacidad reducida
    if (!table.available) return 0.4

    // Si está disponible pero NO se puede seleccionar por capacidad, opacidad media
    if (!validation.canSelect) return 0.6

    // Disponible y seleccionable
    return 1
  }

  const getTableCursor = (table: TableWithPosition): string => {
    const isSelected = selectedTableIds.includes(table.id)
    const validation = getTableValidation(table)

    // Si está seleccionada, siempre pointer (para deseleccionar)
    if (isSelected) return 'pointer'

    // Si está disponible y se puede seleccionar
    if (table.available && validation.canSelect) return 'pointer'

    // No disponible o no seleccionable
    return 'not-allowed'
  }

  const getTableLabel = (table: TableWithPosition): string => {
    const isSelected = selectedTableIds.includes(table.id)
    if (isSelected) return `${table.number} ✓`
    return table.number
  }

  const getEmotionalDescription = (tableNumber: string): string | null => {
    const description = emotionalDescriptions[tableNumber]
    return description ? description[language] : null
  }

  return (
    <div className="relative w-full">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          onClick={handleZoomIn}
          title={t.zoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          onClick={handleZoomOut}
          title={t.zoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          onClick={handleFitScreen}
          title={t.fitScreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Floor Plan SVG */}
      <div
        className="w-full flex items-center justify-center overflow-auto touch-pan-y border border-border rounded-lg bg-muted/30 p-4"
        style={{ maxHeight: '500px', minHeight: '350px' }}
      >
        <div
          className="flex items-center justify-center w-full h-full"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <svg
            viewBox={viewBox}
            className="max-w-full max-h-full"
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '800px',
              maxHeight: '450px'
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect
              x={bounds.minX}
              y={bounds.minY}
              width={bounds.maxX - bounds.minX}
              height={bounds.maxY - bounds.minY}
              fill="oklch(0.98 0.01 220)"
              opacity={0.5}
            />

            {/* Tables */}
            {tables.map((table) => {
              const isHovered = hoveredTableId === table.id
              const isSelected = selectedTableIds.includes(table.id)

              return (
                <g
                  key={table.id}
                  transform={`translate(${table.position_x}, ${table.position_y}) rotate(${table.rotation}, ${table.width / 2}, ${table.height / 2})`}
                  style={{ cursor: getTableCursor(table) }}
                  onClick={() => handleTableClick(table)}
                  onMouseEnter={() => setHoveredTableId(table.id)}
                  onMouseLeave={() => setHoveredTableId(null)}
                >
                  {/* Table rectangle */}
                  <rect
                    width={table.width}
                    height={table.height}
                    rx={6}
                    fill={getTableFillColor(table)}
                    stroke={getTableStrokeColor(table)}
                    strokeWidth={isHovered || isSelected ? 3 : 2}
                    opacity={getTableOpacity(table)}
                    className="transition-all duration-200"
                  />

                  {/* Table label */}
                  <text
                    x={table.width / 2}
                    y={table.height / 2 - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold pointer-events-none select-none"
                    fill={isSelected ? 'white' : 'oklch(0.20 0.02 220)'}
                    style={{ fontSize: '14px', fontWeight: 'bold' }}
                  >
                    {getTableLabel(table)}
                  </text>

                  {/* Capacity label */}
                  <text
                    x={table.width / 2}
                    y={table.height / 2 + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs pointer-events-none select-none"
                    fill={isSelected ? 'white' : 'oklch(0.40 0.02 220)'}
                    style={{ fontSize: '11px' }}
                  >
                    {table.capacity}p
                  </text>

                  {/* Emotional description label - HIDDEN on mobile, only in tooltip */}

                  {/* Hover tooltip (visual indicator) */}
                  {isHovered && (
                    <title>
                      {table.number} - {table.capacity} {t.capacity}
                      {getEmotionalDescription(table.number) && (
                        `\n${getEmotionalDescription(table.number)}`
                      )}
                      {'\n'}
                      {(() => {
                        const validation = getTableValidation(table)
                        if (!table.available) return t.notAvailable
                        if (!validation.canSelect) return validation.reason || t.notAvailable
                        return t.clickToSelect
                      })()}
                    </title>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
