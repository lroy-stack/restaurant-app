'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
  useReactFlow
} from '@xyflow/react'
import { useTableStore } from '@/stores/useTableStore'
import { useFloorPlanStore } from '@/stores/useFloorPlanStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Loader2,
  Grid3X3,
  Move
} from 'lucide-react'

// Import all element components
import {
  TableElement,
  DoorElement,
  BarElement,
  PlantElement
} from './elements'
import { ElementType } from './utils/elementTypes'

// Import styles
import '@xyflow/react/dist/style.css'

// Real Enigma zones
const ENIGMA_ZONES = {
  'TERRACE_CAMPANARI': 'Terraza Campanari',
  'SALA_PRINCIPAL': 'Sala Principal',
  'SALA_VIP': 'Sala VIP',
  'TERRACE_JUSTICIA': 'Terraza Justicia'
} as const

interface ReactFloorPlanProps {
  tables?: any[]
}

export function ReactFloorPlan({ tables: propTables = [] }: ReactFloorPlanProps) {
  // Store hooks
  const { tables: storeTables, loadTables } = useTableStore()
  const {
    nodes,
    edges,
    viewport,
    isLoading,
    hasChanges,
    showGrid,
    snapToGrid,
    setNodes,
    setEdges,
    setViewport,
    loadLayout,
    saveLayout,
    resetLayout,
    addElement
  } = useFloorPlanStore()

  // Use store tables or prop tables
  const tables = storeTables.length > 0 ? storeTables : propTables

  // Node types mapping - optimized with useMemo
  const nodeTypes = useMemo(() => ({
    table: TableElement,
    door: DoorElement,
    bar: BarElement,
    plant: PlantElement
  }), [])

  // React Flow hooks
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes)
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges)
  const { fitView } = useReactFlow()

  // Local state
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL')
  const [zoom, setZoom] = useState(100)
  const [isSaving, setIsSaving] = useState(false)

  // Load data on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadTables()
      await loadLayout()
    }
    initializeData()
  }, [loadTables, loadLayout])

  // Optimized sync between store and local state
  useEffect(() => {
    setLocalNodes(nodes)
  }, [nodes, setLocalNodes])

  useEffect(() => {
    setLocalEdges(edges)
  }, [edges, setLocalEdges])

  // Optimized debounced update to store (NO AUTO-SAVE)
  const debouncedUpdateNodes = React.useMemo(
    () => {
      let timeoutId: NodeJS.Timeout
      return (nodes: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setNodes(nodes)
        }, 100) // 100ms debounce
      }
    },
    [setNodes]
  )

  const debouncedUpdateEdges = React.useMemo(
    () => {
      let timeoutId: NodeJS.Timeout
      return (edges: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setEdges(edges)
        }, 100) // 100ms debounce
      }
    },
    [setEdges]
  )

  // Update store when local state changes (debounced)
  useEffect(() => {
    debouncedUpdateNodes(localNodes)
  }, [localNodes, debouncedUpdateNodes])

  useEffect(() => {
    debouncedUpdateEdges(localEdges)
  }, [localEdges, debouncedUpdateEdges])

  // Filter nodes by selected location
  const filteredNodes = useMemo(() => {
    if (selectedLocation === 'ALL') return localNodes

    return localNodes.filter(node => {
      if (node.data.elementType === 'table') {
        return node.data.location === selectedLocation
      }
      return true // Show non-table elements in all views
    })
  }, [localNodes, selectedLocation])

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Edge | Connection) => setLocalEdges((eds) => addEdge(params, eds)),
    [setLocalEdges]
  )

  // Handle external drag & drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      // Get the element type from drag data
      const elementType = event.dataTransfer.getData('application/reactflow-element') as ElementType

      if (!elementType) {
        return
      }

      // Calculate position relative to the React Flow canvas with better performance
      const reactFlowBounds = event.currentTarget.getBoundingClientRect()

      // Use viewport-aware positioning
      const position = {
        x: (event.clientX - reactFlowBounds.left - viewport.x) / viewport.zoom,
        y: (event.clientY - reactFlowBounds.top - viewport.y) / viewport.zoom,
      }

      // Add the new element
      addElement(elementType, position)

      toast.success(`Elemento añadido al plano`, { duration: 2000 })
    },
    [addElement, viewport]
  )

  // Handle save
  const handleSave = useCallback(async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      await saveLayout()
    } catch (error) {
      console.error('Error saving layout:', error)
    } finally {
      setIsSaving(false)
    }
  }, [hasChanges, saveLayout])

  // Handle reset
  const handleReset = useCallback(() => {
    resetLayout()
    fitView()
  }, [resetLayout, fitView])

  // Debounced zoom state update to prevent constant re-renders
  const debouncedZoomUpdate = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return (zoom: number) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setZoom(zoom)
      }, 100) // Only update zoom display after 100ms of no movement
    }
  }, [])

  // Handle viewport changes (optimized for performance)
  const onViewportChange = useCallback((newViewport: any) => {
    setViewport(newViewport) // Critical for canvas functionality
    debouncedZoomUpdate(Math.round(newViewport.zoom * 100)) // Debounced for UI display
  }, [setViewport, debouncedZoomUpdate])

  // Optimized zoom controls
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.5, zoom/100 - 0.1)
    setViewport({ ...viewport, zoom: newZoom })
    setZoom(Math.round(newZoom * 100))
  }, [zoom, viewport, setViewport])

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(2, zoom/100 + 0.1)
    setViewport({ ...viewport, zoom: newZoom })
    setZoom(Math.round(newZoom * 100))
  }, [zoom, viewport, setViewport])

  // Memoized grid styles to prevent recalculation on every render
  const gridStyles = useMemo(() => `
    .react-flow__renderer {
      background: ${showGrid
        ? `linear-gradient(45deg, #f8f9fa 25%, transparent 25%),
           linear-gradient(-45deg, #f8f9fa 25%, transparent 25%),
           linear-gradient(45deg, transparent 75%, #f8f9fa 75%),
           linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)`
        : 'transparent'
      };
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
    .dark .react-flow__renderer {
      background: ${showGrid
        ? `linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
           linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
           linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
           linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)`
        : 'transparent'
      };
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
  `, [showGrid])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando vista de planta avanzada...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: gridStyles }} />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Vista de Planta Avanzada - React Flow
                <Badge variant="outline" className="text-xs">
                  Beta
                </Badge>
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
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-foreground min-w-[50px] text-center bg-card border border-border rounded px-2 py-1">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              {/* Layout Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>

              <Button
                onClick={handleSave}
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
                <Move className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Arrastra para mover</span>
              </div>
            </div>

            {/* Main Layout: Canvas Only */}
            <div className="h-[700px] relative">
              {/* React Flow Canvas */}
              <div className="w-full h-full border border-border rounded-lg overflow-hidden">
              <ReactFlow
                nodes={filteredNodes}
                edges={localEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onViewportChange={onViewportChange}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid={snapToGrid}
                snapGrid={[20, 20]}
                defaultViewport={viewport}
                minZoom={0.5}
                maxZoom={2}
                attributionPosition="bottom-left"
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  className={showGrid ? 'opacity-50' : 'opacity-0'}
                />
                <Controls
                  showZoom={true}
                  showFitView={true}
                  showInteractive={true}
                  className="[&_.react-flow__controls-button]:!bg-card [&_.react-flow__controls-button]:!border-border [&_.react-flow__controls-button]:!text-foreground [&_.react-flow__controls-button]:hover:!bg-muted"
                />

                {/* Panels for additional UI */}
                <Panel position="top-left" className="bg-background/95 backdrop-blur-sm p-2 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Grid3X3 className="w-4 h-4" />
                    <span>{filteredNodes.length} elementos</span>
                    {hasChanges && (
                      <Badge variant="secondary" className="text-xs">
                        Sin guardar
                      </Badge>
                    )}
                  </div>
                </Panel>
              </ReactFlow>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}