'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Users, MapPin, Check } from 'lucide-react'

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
}

export function MultiTableSelector({
  tables,
  selectedTableIds,
  onSelectionChange,
  partySize,
  maxSelections = 5,
  className
}: MultiTableSelectorProps) {
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

  // Calculate total capacity of selected tables
  const totalSelectedCapacity = useMemo(() => {
    return selectedTableIds.reduce((total, id) => {
      const table = tables.find(t => t.id === id)
      return total + (table?.capacity || 0)
    }, 0)
  }, [selectedTableIds, tables])

  const isTableSelected = useCallback((tableId: string) => {
    return selectedTableIds.includes(tableId)
  }, [selectedTableIds])

  const canSelectTable = useCallback((tableId: string) => {
    if (isTableSelected(tableId)) return true // Can always deselect
    return selectedTableIds.length < maxSelections
  }, [selectedTableIds, maxSelections, isTableSelected])

  const handleTableToggle = useCallback((tableId: string) => {
    if (selectedTableIds.includes(tableId)) {
      // Deselect table
      onSelectionChange(selectedTableIds.filter(id => id !== tableId))
    } else if (selectedTableIds.length < maxSelections) {
      // Select table
      onSelectionChange([...selectedTableIds, tableId])
    }
  }, [selectedTableIds, maxSelections, onSelectionChange])

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
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-700">
                  ⚠️ Capacidad insuficiente: necesitas {partySize} personas, tienes {totalSelectedCapacity}
                </p>
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {locationTables.map(table => {
                const selected = isTableSelected(table.id)
                const canSelect = canSelectTable(table.id)

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
                        : 'border-border hover:border-primary/50 hover:shadow-sm',
                      !canSelect && !selected && 'opacity-40 cursor-not-allowed'
                    )}
                    onClick={() => canSelect && handleTableToggle(table.id)}
                    disabled={!canSelect && !selected}
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