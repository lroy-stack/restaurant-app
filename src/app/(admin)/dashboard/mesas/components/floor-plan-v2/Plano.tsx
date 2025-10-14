'use client'

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'
import Mesa from './Mesa'
import { PlanoProps, VisualMesa, FloorPlanState } from './types/mesa.types'

export interface PlanoMethods {
  zoomIn: () => void
  zoomOut: () => void
  fitToScreen: () => void
}

const Plano = forwardRef<PlanoMethods, PlanoProps>(({
  tables,
  onTableClick,
  selectedZone,
  className,
  onTableDragEnd,
  isDragMode = false,
  isMultiSelectMode = false,
  selectedTableIds = new Set()
}, ref) => {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Floor plan state management
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [konvaError, setKonvaError] = useState<string | null>(null)
  const [isBraveBlocked, setIsBraveBlocked] = useState<boolean>(false)
  const [floorPlanState, setFloorPlanState] = useState<FloorPlanState>({
    scale: 1,
    position: { x: 0, y: 0 },
    selectedTable: null,
    isModalOpen: false,
    isDragging: false
  })

  // ✅ PROFESSIONAL GRID SYSTEM - Fixed virtual dimensions
  const VIRTUAL_WIDTH = 1600
  const VIRTUAL_HEIGHT = 1000
  const PADDING = 50

  // Calculate stage boundaries based on virtual grid
  const stageBounds = React.useMemo(() => {
    return {
      minX: 0,
      minY: 0,
      maxX: VIRTUAL_WIDTH,
      maxY: VIRTUAL_HEIGHT
    }
  }, [])

  const contentWidth = VIRTUAL_WIDTH
  const contentHeight = VIRTUAL_HEIGHT

  // Brave Shield detection - MUST run before any Konva rendering
  useEffect(() => {
    const checkBraveShield = () => {
      try {
        // Multi-layer Brave Shield detection
        const hasGlobalBrave = typeof (globalThis as any)?.navigator?.brave?.isBrave === 'function'
        const hasNavigatorBrave = typeof (navigator as any)?.brave?.isBrave === 'function'

        if (hasGlobalBrave || hasNavigatorBrave) {
          // Test canvas API access immediately
          const testCanvas = document.createElement('canvas')
          testCanvas.width = 1
          testCanvas.height = 1

          const ctx = testCanvas.getContext('2d')
          if (!ctx) {
            setIsBraveBlocked(true)
            setKonvaError('Brave Shield está bloqueando el canvas')
            return true
          }

          // Test critical canvas methods
          try {
            ctx.createImageData(1, 1)
            ctx.getImageData(0, 0, 1, 1)
            ctx.fillRect(0, 0, 1, 1)
          } catch {
            setIsBraveBlocked(true)
            setKonvaError('Brave Shield está bloqueando APIs de canvas')
            return true
          }
        }
        return false
      } catch {
        setIsBraveBlocked(true)
        setKonvaError('Error de compatibilidad del navegador')
        return true
      }
    }

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: Math.max(width, 400),
          height: Math.max(height, 300)
        })
      }
    }

    // Check Brave Shield FIRST
    if (!checkBraveShield()) {
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
    }

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Handle table click with selection state
  const handleTableClick = useCallback((mesa: VisualMesa) => {
    setFloorPlanState(prev => ({
      ...prev,
      selectedTable: mesa
    }))
    onTableClick(mesa)
  }, [onTableClick])

  // Handle table drag end - update position
  const handleTableDragEnd = useCallback((mesa: VisualMesa, position: { x: number; y: number }) => {
    if (onTableDragEnd) {
      onTableDragEnd(mesa, position)
    }
  }, [onTableDragEnd])

  // ✅ PROFESSIONAL ZOOM: Calculate optimal scale to fit entire grid
  const fitToScreen = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    const containerWidth = dimensions.width
    const containerHeight = dimensions.height

    // Calculate scale to fit the virtual grid maintaining aspect ratio
    const scaleX = containerWidth / VIRTUAL_WIDTH
    const scaleY = containerHeight / VIRTUAL_HEIGHT

    // Use smaller scale to ensure everything fits, with 95% factor for padding
    const scale = Math.min(scaleX, scaleY) * 0.95

    // Center the content
    const centerX = (containerWidth - VIRTUAL_WIDTH * scale) / 2
    const centerY = (containerHeight - VIRTUAL_HEIGHT * scale) / 2

    stage.scale({ x: scale, y: scale })
    stage.position({ x: centerX, y: centerY })
    stage.batchDraw()

    setFloorPlanState(prev => ({
      ...prev,
      scale,
      position: { x: centerX, y: centerY }
    }))
  }, [dimensions])

  const zoomIn = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    const oldScale = stage.scaleX()
    const newScale = Math.min(oldScale * 1.2, 3)

    const pointer = stage.getPointerPosition() || { x: dimensions.width / 2, y: dimensions.height / 2 }
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }

    stage.scale({ x: newScale, y: newScale })
    stage.position(newPos)
    stage.batchDraw()

    setFloorPlanState(prev => ({
      ...prev,
      scale: newScale,
      position: newPos
    }))
  }, [dimensions])

  const zoomOut = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    const oldScale = stage.scaleX()
    const newScale = Math.max(oldScale / 1.2, 0.1)

    const pointer = stage.getPointerPosition() || { x: dimensions.width / 2, y: dimensions.height / 2 }
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }

    stage.scale({ x: newScale, y: newScale })
    stage.position(newPos)
    stage.batchDraw()

    setFloorPlanState(prev => ({
      ...prev,
      scale: newScale,
      position: newPos
    }))
  }, [dimensions])

  // Handle wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    let direction = e.evt.deltaY > 0 ? -1 : 1
    if (e.evt.ctrlKey) {
      direction = -direction
    }

    const newScale = Math.max(0.1, Math.min(3, oldScale * (1 + direction * 0.1)))

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }

    stage.scale({ x: newScale, y: newScale })
    stage.position(newPos)
    stage.batchDraw()

    setFloorPlanState(prev => ({
      ...prev,
      scale: newScale,
      position: newPos
    }))
  }, [])

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    fitToScreen
  }), [zoomIn, zoomOut, fitToScreen])

  // Initial fit to screen when tables change
  useEffect(() => {
    if (tables.length > 0) {
      const timer = setTimeout(fitToScreen, 100)
      return () => clearTimeout(timer)
    }
  }, [tables.length, fitToScreen])

  if (tables.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/50 ${className}`}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        <div className="text-center space-y-2">
          <div className="text-2xl text-muted-foreground">🏪</div>
          <p className="text-muted-foreground">No hay mesas para mostrar</p>
          <p className="text-sm text-muted-foreground/70">
            {selectedZone === 'all' ? 'Verifica la conexión con la base de datos' : 'Selecciona una zona con mesas activas'}
          </p>
        </div>
      </div>
    )
  }

  // Early return for Brave Shield blocking
  if (isBraveBlocked || konvaError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <div className="text-red-500 text-lg font-medium">
            Error del navegador detectado
          </div>
          <div className="text-sm text-muted-foreground max-w-md">
            {konvaError && konvaError.includes('Brave shield') ? (
              <>
                <p className="mb-2">Brave Shield está bloqueando la visualización.</p>
                <p className="mb-2">Para solucionarlo:</p>
                <ol className="text-left list-decimal list-inside space-y-1">
                  <li>Haz clic en el icono del escudo de Brave (🛡️)</li>
                  <li>Desactiva "Shields" para este sitio</li>
                  <li>Recarga la página</li>
                </ol>
              </>
            ) : (
              <p>Error de renderizado del canvas. Intenta recargar la página.</p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Recargar página
          </button>
        </div>
      </div>
    )
  }

  // Render with error boundary
  const renderStage = () => {
    try {
      return (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          draggable
          // Context7 Performance optimizations
          perfectDrawEnabled={false}
          hitGraphEnabled={true}
          listening={true}
          // Mobile touch support
          onTouchStart={() => setFloorPlanState(prev => ({ ...prev, isDragging: true }))}
          onTouchEnd={() => setFloorPlanState(prev => ({ ...prev, isDragging: false }))}
          onMouseDown={() => setFloorPlanState(prev => ({ ...prev, isDragging: true }))}
          onMouseUp={() => setFloorPlanState(prev => ({ ...prev, isDragging: false }))}
        >
        {/* Background layer - non-interactive with Context7 optimizations */}
        <Layer listening={false} perfectDrawEnabled={false}>
          {/* Stage background */}
          <React.Fragment key="background">
            {/* Grid pattern for visual reference */}
            {Array.from({ length: Math.ceil((stageBounds.maxX - stageBounds.minX) / 100) }, (_, i) =>
              Array.from({ length: Math.ceil((stageBounds.maxY - stageBounds.minY) / 100) }, (_, j) => (
                <React.Fragment key={`grid-${i}-${j}`}>
                  {/* Subtle grid dots */}
                  {/* We'll add grid if needed for visual reference */}
                </React.Fragment>
              ))
            )}
          </React.Fragment>
        </Layer>

        {/* Tables layer - interactive */}
        <Layer>
          {tables.map((mesa) => (
            <Mesa
              key={mesa.id}
              mesa={mesa}
              onClick={handleTableClick}
              scale={floorPlanState.scale}
              isSelected={
                isMultiSelectMode
                  ? selectedTableIds.has(mesa.id)
                  : floorPlanState.selectedTable?.id === mesa.id
              }
              onDragEnd={handleTableDragEnd}
              isDragEnabled={isDragMode}
            />
          ))}
        </Layer>
        </Stage>
      )
    } catch (error: unknown) {
      console.error('Konva render error:', error)
      if (error instanceof Error && (error.message.includes('Brave shield') || error.message.includes('blocked'))) {
        setKonvaError('Brave shield detected')
      } else {
        setKonvaError('Error de renderizado del canvas')
      }
      return null
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-background border rounded-lg overflow-hidden ${className}`}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    >
      {renderStage()}

      {/* Zoom controls overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-background border rounded-md shadow-sm hover:bg-muted flex items-center justify-center"
          title="Zoom In"
        >
          <span className="text-lg font-medium">+</span>
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-background border rounded-md shadow-sm hover:bg-muted flex items-center justify-center"
          title="Zoom Out"
        >
          <span className="text-lg font-medium">−</span>
        </button>
        <button
          onClick={fitToScreen}
          className="w-10 h-10 bg-background border rounded-md shadow-sm hover:bg-muted flex items-center justify-center"
          title="Fit to Screen"
        >
          <span className="text-xs">⌂</span>
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur border rounded px-2 py-1 text-xs text-muted-foreground">
        {Math.round(floorPlanState.scale * 100)}%
      </div>

      {/* Table count indicator */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur border rounded px-2 py-1 text-xs text-muted-foreground">
        {tables.length} mesa{tables.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
})

Plano.displayName = 'Plano'

export default Plano