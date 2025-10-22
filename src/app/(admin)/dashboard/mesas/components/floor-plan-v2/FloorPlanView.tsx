'use client'
import { getSupabaseHeaders } from '@/lib/supabase/config'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Map } from 'lucide-react'

import Plano from './Plano'
import { Modal } from './Modal'
import { Toolbar } from './Toolbar'
import { AlignmentToolbar } from './AlignmentToolbar'
import { useFloorPlan } from './hooks/useFloorPlan'
import { useKonvaSetup } from './hooks/useKonvaSetup'
import { VisualMesa } from './types/mesa.types'
import { PlanoMethods } from './Plano'
import { useTableStore } from '@/stores/useTableStore'

interface FloorPlanViewProps {
  tables?: any[] // Tables from existing useTableStore format
}

const FloorPlanView: React.FC<FloorPlanViewProps> = ({ tables: propTables = [] }) => {
  // Performance optimization setup
  const { config, isMobile, isLowPerformance } = useKonvaSetup()

  // Floor plan state management with database integration
  const {
    visualTables,
    visibleTables,
    selectedZone,
    setSelectedZone,
    zoneStats,
    loading,
    selectedTable,
    setSelectedTable,
    refreshTables
  } = useFloorPlan()

  // Modal and interaction state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDragMode, setIsDragMode] = useState(false)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set())

  // ✅ CRITICAL FIX: Enhanced table click with proper modal integration
  const handleTableClick = (mesa: VisualMesa) => {
    console.log('🔍 Table clicked:', mesa.number, 'Multi-select:', isMultiSelectMode)

    if (isMultiSelectMode) {
      // Multi-select mode: toggle selection
      setSelectedTableIds(prev => {
        const newSelection = new Set(prev)
        if (newSelection.has(mesa.id)) {
          newSelection.delete(mesa.id)
        } else {
          newSelection.add(mesa.id)
        }
        console.log('✅ Multi-select updated:', Array.from(newSelection))
        return newSelection
      })
    } else {
      // ✅ CRITICAL: Normal mode - ensure modal opens
      console.log('🎯 Opening modal for table:', mesa.number)
      setSelectedTable(mesa)
      setIsModalOpen(true)
    }
  }

  // ✅ ENHANCED: Modal close with debug logging
  const handleModalClose = () => {
    console.log('🚪 Closing modal for table:', selectedTable?.number)
    setIsModalOpen(false)
    setSelectedTable(null)
  }

  // Plano component ref for zoom control integration
  const planoRef = useRef<PlanoMethods>(null)

  // Zoom control functions connected to Plano methods
  const handleZoomIn = () => {
    planoRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    planoRef.current?.zoomOut()
  }

  const handleZoomFit = () => {
    planoRef.current?.fitToScreen()
  }

  // Table store integration
  const { updateTablePosition } = useTableStore()

  // ✅ OPTIMIZED: Drag end with optimistic updates and error handling
  const handleTableDragEnd = async (mesa: VisualMesa, position: { x: number; y: number }) => {
    try {
      // Validate position bounds before sending to API
      const validatedPosition = {
        x: Math.max(0, Math.min(position.x, 2000)), // Max stage bounds
        y: Math.max(0, Math.min(position.y, 1500))
      }

      // ✅ CRITICAL: Update position via store - NO immediate refresh
      // Let the store handle optimistic updates and avoid object recreation
      await updateTablePosition(mesa.id, validatedPosition.x, validatedPosition.y)

    } catch (error) {
      console.error('Error updating table position:', error)
      // Only refresh on error to revert to DB state
      await refreshTables()
    }
  }

  // Multi-select operations
  const handleSelectAll = () => {
    const allActiveTableIds = visibleTables
      .filter(table => table.isActive)
      .map(table => table.id)
    setSelectedTableIds(new Set(allActiveTableIds))
  }

  const handleClearSelection = () => {
    setSelectedTableIds(new Set())
  }

  const handleBulkStatusUpdate = async (status: string) => {
    const selectedTables = Array.from(selectedTableIds)
    if (selectedTables.length === 0) return

    try {
      // Process bulk updates in parallel
      const updatePromises = selectedTables.map(tableId =>
        fetch(`/api/tables/${tableId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // Schema handled by getSupabaseHeaders()
            // Schema handled by getSupabaseHeaders()
          },
          body: JSON.stringify({ currentStatus: status })
        })
      )

      await Promise.all(updatePromises)

      // Refresh tables and clear selection
      await refreshTables()
      setSelectedTableIds(new Set())

      console.log(`Updated ${selectedTables.length} tables to ${status}`)
    } catch (error) {
      console.error('Error updating tables:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Planta Visual del Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Cargando datos de las mesas...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Performance warning for low-end devices
  const showPerformanceWarning = isLowPerformance && visualTables.length > 20

  return (
    <div className="space-y-4">
      {/* Performance warning */}
      {showPerformanceWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Dispositivo con recursos limitados detectado. Se han aplicado optimizaciones de rendimiento.
            {isMobile && " Usa zoom para mejor rendimiento en dispositivos móviles."}
          </AlertDescription>
        </Alert>
      )}

      {/* Floor Plan Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Planta Visual del Restaurante
            <span className="text-sm font-normal text-muted-foreground">
              ({visualTables.length} mesas en total)
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Toolbar with filters and controls */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <Toolbar
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
          onZoomFit={handleZoomFit}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoneStats={zoneStats}
          isDragMode={isDragMode}
          onDragModeToggle={setIsDragMode}
          isMultiSelectMode={isMultiSelectMode}
          onMultiSelectModeToggle={setIsMultiSelectMode}
          selectedCount={selectedTableIds.size}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkStatusUpdate={handleBulkStatusUpdate}
        />
        <AlignmentToolbar onRefresh={refreshTables} />
      </div>

      {/* Main floor plan visualization */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="min-h-[500px] h-[calc(100vh-320px)] max-h-[900px]">
            <Plano
              ref={planoRef}
              tables={visibleTables}
              onTableClick={handleTableClick}
              selectedZone={selectedZone}
              className="w-full h-full"
              onTableDragEnd={handleTableDragEnd}
              isDragMode={isDragMode}
              isMultiSelectMode={isMultiSelectMode}
              selectedTableIds={selectedTableIds}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table interaction modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        table={selectedTable}
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Debug Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Device</p>
                <p>{isMobile ? 'Mobile' : 'Desktop'}</p>
                <p>{isLowPerformance ? 'Low Performance' : 'High Performance'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Konva Config</p>
                <p>Layers: {config.maxLayers}</p>
                <p>Caching: {config.enableCaching ? 'On' : 'Off'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tables</p>
                <p>Total: {visualTables.length}</p>
                <p>Visible: {visibleTables.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Zone</p>
                <p>Selected: {selectedZone}</p>
                <p>Active: {zoneStats[selectedZone]?.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FloorPlanView