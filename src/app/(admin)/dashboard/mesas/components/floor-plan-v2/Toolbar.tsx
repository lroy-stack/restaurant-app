'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  RotateCcw,
  Map,
  Users,
  CheckCircle,
  Move,
  MousePointer,
  CheckSquare,
  Square,
  Trash2,
  Settings
} from 'lucide-react'
import { ToolbarProps, ENIGMA_ZONES } from './types/mesa.types'

export function Toolbar({
  selectedZone,
  onZoneChange,
  onZoomFit,
  onZoomIn,
  onZoomOut,
  zoneStats,
  isDragMode = false,
  onDragModeToggle,
  isMultiSelectMode = false,
  onMultiSelectModeToggle,
  selectedCount = 0,
  onSelectAll,
  onClearSelection,
  onBulkStatusUpdate
}: ToolbarProps) {
  // Zone options with stats
  const zoneOptions = [
    {
      value: 'all',
      label: 'Todas las Zonas',
      stats: zoneStats['all']
    },
    ...Object.entries(ENIGMA_ZONES).map(([value, label]) => ({
      value,
      label,
      stats: zoneStats[value] || { available: 0, total: 0, active: 0 }
    }))
  ]

  const currentZoneStats = zoneStats[selectedZone] || { available: 0, total: 0, active: 0 }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Primary Row - Zone Filter and Core Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Zone Filter Section */}
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por Zona</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedZone} onValueChange={onZoneChange}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Seleccionar zona">
                    <div className="flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      {zoneOptions.find(z => z.value === selectedZone)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {zoneOptions.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      <div className="flex items-center justify-between w-full min-w-[180px]">
                        <span>{zone.label}</span>
                        <div className="flex items-center gap-1 ml-2">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {zone.stats.active}/{zone.stats.total}
                          </Badge>
                          {zone.stats.available > 0 && (
                            <Badge variant="default" className="text-xs px-1 py-0 bg-green-100 text-green-800">
                              {zone.stats.available}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Current Zone Stats - Compact */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{currentZoneStats.active} activas</span>
                </div>
                {currentZoneStats.available > 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>{currentZoneStats.available} libres</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomOut}
                className="h-8 w-8 p-0"
                title="Alejar"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomFit}
                className="h-8 px-2"
                title="Ajustar"
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomIn}
                className="h-8 w-8 p-0"
                title="Acercar"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Mode Controls */}
            {onDragModeToggle && (
              <Button
                variant={isDragMode ? "default" : "outline"}
                size="sm"
                className="h-8 px-2"
                title={isDragMode ? "Desactivar arrastrar" : "Activar arrastrar"}
                onClick={() => onDragModeToggle(!isDragMode)}
                disabled={isMultiSelectMode}
              >
                {isDragMode ? <Move className="h-4 w-4" /> : <MousePointer className="h-4 w-4" />}
              </Button>
            )}

            {onMultiSelectModeToggle && (
              <Button
                variant={isMultiSelectMode ? "default" : "outline"}
                size="sm"
                className="h-8 px-2"
                title={isMultiSelectMode ? "Desactivar múltiple" : "Activar múltiple"}
                onClick={() => onMultiSelectModeToggle(!isMultiSelectMode)}
                disabled={isDragMode}
              >
                {isMultiSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {isMultiSelectMode && selectedCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {selectedCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Reset Control */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Restablecer"
              onClick={() => {
                onZoneChange('all')
                onZoomFit()
                if (onDragModeToggle) onDragModeToggle(false)
                if (onMultiSelectModeToggle) onMultiSelectModeToggle(false)
                if (onClearSelection) onClearSelection()
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Operations Row - Only when multi-select is active */}
        {isMultiSelectMode && (
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
            <span className="text-sm text-muted-foreground shrink-0">Acciones en lote:</span>

            <div className="flex flex-wrap gap-2">
              {onSelectAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                  onClick={onSelectAll}
                >
                  Seleccionar Todas
                </Button>
              )}

              {onClearSelection && selectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                  onClick={onClearSelection}
                >
                  Limpiar ({selectedCount})
                </Button>
              )}

              {onBulkStatusUpdate && selectedCount > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-green-600 hover:text-green-700"
                    onClick={() => onBulkStatusUpdate('available')}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponible
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-amber-600 hover:text-amber-700"
                    onClick={() => onBulkStatusUpdate('maintenance')}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Mantenimiento
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile-friendly stats bar */}
        <div className="flex lg:hidden mt-3 pt-3 border-t justify-between items-center text-xs text-muted-foreground">
          <span>
            Mostrando {currentZoneStats.active} de {currentZoneStats.total} mesas
          </span>
          {currentZoneStats.available > 0 && (
            <span className="text-green-600 font-medium">
              {currentZoneStats.available} disponible{currentZoneStats.available !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}