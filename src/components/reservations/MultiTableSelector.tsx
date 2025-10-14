'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Users, MapPin, Check, AlertCircle, Info } from 'lucide-react'
import { useCapacityValidation } from '@/hooks/useCapacityValidation'
import { toast } from 'sonner'

interface Table {
  id: string
  number: string
  capacity: number
  location: string
  status: string
  available?: boolean
}

interface MultiTableSelectorProps {
  tables: Table[]
  selectedTableIds: string[]
  onSelectionChange: (tableIds: string[]) => void
  partySize: number
  maxSelections?: number
  className?: string
  currentTableIds?: string[] // NEW: IDs of tables in the original reservation
}

export function MultiTableSelector({
  tables,
  selectedTableIds,
  onSelectionChange,
  partySize,
  maxSelections = 5,
  className,
  currentTableIds = []
}: MultiTableSelectorProps) {
  // Hook de validación de capacidad
  const { validateTableSelection, getCapacityInfo, config } = useCapacityValidation()

  // Group tables by location for better organization
  const tablesByLocation = useMemo(() => {
    const grouped = tables.reduce((acc, table) => {
      if (!acc[table.location]) {
        acc[table.location] = []
      }
      acc[table.location].push(table)
      return acc
    }, {} as Record<string, Table[]>)

    // Sort tables within each location naturally (T1, T2, T10, T11)
    Object.values(grouped).forEach(locationTables => {
      locationTables.sort((a, b) => {
        const aNum = parseInt(a.number.replace(/[^0-9]/g, ''))
        const bNum = parseInt(b.number.replace(/[^0-9]/g, ''))
        return aNum - bNum
      })
    })

    return grouped
  }, [tables])

  // Get selected tables objects
  const selectedTables = useMemo(() => {
    return tables.filter(t => selectedTableIds.includes(t.id))
  }, [tables, selectedTableIds])

  // Calculate total capacity of selected tables
  const totalSelectedCapacity = useMemo(() => {
    return selectedTables.reduce((total, table) => total + table.capacity, 0)
  }, [selectedTables])

  // Get capacity info for display
  const capacityInfo = useMemo(() => getCapacityInfo(partySize), [partySize, getCapacityInfo])

  const isTableSelected = useCallback((tableId: string) => {
    return selectedTableIds.includes(tableId)
  }, [selectedTableIds])

  // Nueva lógica: validación con el hook
  const getTableValidation = useCallback((table: Table) => {
    const isSelected = isTableSelected(table.id)

    // Validación básica de máximo de selecciones
    if (!isSelected && selectedTableIds.length >= maxSelections) {
      return {
        canSelect: false,
        reason: `Máximo ${maxSelections} mesas por reserva`,
        severity: 'info' as const
      }
    }

    // Validación de capacidad usando el hook
    return validateTableSelection(table, partySize, selectedTables, isSelected)
  }, [partySize, selectedTables, selectedTableIds.length, maxSelections, isTableSelected, validateTableSelection])

  const handleTableToggle = useCallback((table: Table) => {
    if (selectedTableIds.includes(table.id)) {
      // Deselect table - siempre permitido
      onSelectionChange(selectedTableIds.filter(id => id !== table.id))
    } else {
      // Attempt to select - validar primero
      const validation = getTableValidation(table)

      if (!validation.canSelect) {
        // Mostrar razón con toast
        if (validation.severity === 'error') {
          toast.error(validation.reason || 'No se puede seleccionar esta mesa')
        } else if (validation.severity === 'warning') {
          toast.warning(validation.reason || 'Advertencia al seleccionar mesa')
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
  }, [selectedTableIds, onSelectionChange, getTableValidation])

  const clearSelection = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  // Display location names from API data, fallback to location ID
  const getLocationDisplayName = (location: string) => {
    return location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Selection Summary */}
      {selectedTableIds.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {selectedTableIds.length} mesa{selectedTableIds.length !== 1 ? 's' : ''} seleccionada{selectedTableIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Capacidad total: {totalSelectedCapacity} personas</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="text-sm"
              >
                Limpiar
              </Button>
            </div>

            {/* Selected tables display */}
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedTableIds.map(id => {
                const table = tables.find(t => t.id === id)
                if (!table) return null
                return (
                  <Badge key={id} variant="default" className="text-xs">
                    Mesa {table.number} ({table.capacity} pax)
                  </Badge>
                )
              })}
            </div>

            {/* Capacity validation */}
            {totalSelectedCapacity < partySize && (
              <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Capacidad insuficiente: necesitas {partySize} personas, tienes {totalSelectedCapacity}
                  </p>
                </div>
              </div>
            )}

            {/* Capacity info when feature flag enabled */}
            {config.enabled && totalSelectedCapacity >= partySize && (
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <p className="font-medium">Capacidad apropiada para tu grupo</p>
                    <p className="text-xs mt-0.5 opacity-80">
                      Grupo: {partySize} personas • Capacidad: {totalSelectedCapacity} • Rango permitido: {capacityInfo.minCapacity}-{capacityInfo.maxCapacity}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tables by Location */}
      {Object.entries(tablesByLocation).map(([location, locationTables]) => (
        <Card key={location}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {getLocationDisplayName(location)}
              <Badge variant="secondary" className="ml-auto">
                {locationTables.length} mesa{locationTables.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {locationTables.map(table => {
                const selected = isTableSelected(table.id)
                const validation = getTableValidation(table)
                const canSelect = validation.canSelect

                return (
                  <button
                    key={table.id}
                    type="button"
                    className={cn(
                      'relative aspect-square rounded-xl border-2 transition-all touch-manipulation',
                      'flex flex-col items-center justify-center gap-1.5',
                      'active:scale-95',
                      selected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : canSelect
                        ? 'border-border hover:border-primary/50 hover:shadow-sm'
                        : 'border-border bg-muted/50 opacity-50 cursor-not-allowed',
                      // Indicador visual de warning
                      !selected && validation.severity === 'warning' && canSelect &&
                        'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/30'
                    )}
                    onClick={() => handleTableToggle(table)}
                    disabled={!canSelect && !selected}
                    title={!canSelect && validation.reason ? validation.reason : undefined}
                  >
                    {/* Checkmark */}
                    {selected && (
                      <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}

                    {/* Table number - Large and centered */}
                    <div className="text-2xl font-bold text-foreground">
                      {table.number}
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{table.capacity}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* No tables message */}
      {tables.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay mesas disponibles para la fecha y hora seleccionadas.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection limit warning */}
      {selectedTableIds.length >= maxSelections && (
        <div className="text-center text-sm text-muted-foreground">
          Máximo {maxSelections} mesas por reserva
        </div>
      )}
    </div>
  )
}