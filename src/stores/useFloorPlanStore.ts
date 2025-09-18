import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'
import { Node, Edge, Viewport } from '@xyflow/react'
import {
  FloorPlanNode,
  ElementType,
  FloorPlanLayout
} from '@/app/(admin)/dashboard/mesas/components/floor-plan/utils/elementTypes'
import {
  createTableNode,
  createElementNode
} from '@/app/(admin)/dashboard/mesas/components/floor-plan/utils/nodeFactory'
import {
  layoutManager,
  AutoSaver
} from '@/app/(admin)/dashboard/mesas/components/floor-plan/utils/persistence'
import {
  floorPlanElementsService,
  DatabaseFloorPlanElement
} from '@/lib/services/floor-plan-elements'
import { useTableStore } from './useTableStore'

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

interface FloorPlanStore {
  // State
  nodes: FloorPlanNode[]
  edges: Edge[]
  viewport: Viewport
  selectedNodes: string[]
  isLoading: boolean
  hasChanges: boolean

  // UI State
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number

  // Actions - Node Management
  setNodes: (nodes: FloorPlanNode[]) => void
  setEdges: (edges: Edge[]) => void
  setViewport: (viewport: Viewport) => void
  addNode: (node: FloorPlanNode) => void
  updateNode: (nodeId: string, updates: Partial<FloorPlanNode>) => void
  deleteNode: (nodeId: string) => Promise<void>
  deleteNodes: (nodeIds: string[]) => Promise<void>

  // Actions - Element Creation
  addElement: (type: ElementType, position: { x: number, y: number }) => Promise<void>
  addTableFromData: (tableData: any, position: { x: number, y: number }) => void

  // Actions - Layout Management
  loadLayout: () => Promise<void>
  loadRestaurantTables: () => Promise<void>
  loadFloorPlanElements: () => Promise<void>
  saveLayout: () => Promise<void>
  resetLayout: () => void
  importLayout: (layout: FloorPlanLayout) => void
  exportLayout: () => FloorPlanLayout

  // Actions - Selection
  setSelectedNodes: (nodeIds: string[]) => void
  selectAll: () => void
  deselectAll: () => void

  // Actions - UI
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void

  // Actions - Bulk Operations
  duplicateNodes: (nodeIds: string[]) => void
  groupNodes: (nodeIds: string[]) => void

  // Actions - Migration
  migrateFromGridLayout: (gridLayouts: any) => void

  // Helper Actions
  autoSave: () => void
}

// Auto-saver instance
let autoSaver: AutoSaver | null = null

export const useFloorPlanStore = create<FloorPlanStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodes: [],
      isLoading: false,
      hasChanges: false,

      // UI State
      showGrid: true,
      snapToGrid: false,
      gridSize: 20,

      // Node Management
      setNodes: (nodes) => {
        set({ nodes, hasChanges: true })
        get().autoSave()
      },

      setEdges: (edges) => {
        set({ edges, hasChanges: true })
        get().autoSave()
      },

      setViewport: (viewport) => {
        set({ viewport })
        // Don't mark as changed for viewport updates
      },

      addNode: (node) => {
        set((state) => ({
          nodes: [...state.nodes, node],
          hasChanges: true
        }))
        get().autoSave()
        toast.success(`${node.data.label || 'Elemento'} añadido`)
      },

      updateNode: (nodeId, updates) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, ...updates } : node
          ),
          hasChanges: true
        }))
        get().autoSave()
      },

      deleteNode: async (nodeId) => {
        const { nodes } = get()
        const nodeToDelete = nodes.find(n => n.id === nodeId)

        try {
          // Only delete from database if it's a floor plan element (not a table)
          if (nodeToDelete?.data?.elementType !== 'table') {
            await floorPlanElementsService.deleteElement(nodeId)
          }

          set((state) => ({
            nodes: state.nodes.filter(node => node.id !== nodeId),
            edges: state.edges.filter(edge =>
              edge.source !== nodeId && edge.target !== nodeId
            ),
            selectedNodes: state.selectedNodes.filter(id => id !== nodeId),
            hasChanges: true
          }))

          get().autoSave()
          toast.success(`${nodeToDelete?.data.label || 'Elemento'} eliminado`)
        } catch (error) {
          console.error('Error deleting element:', error)
          toast.error('Error al eliminar elemento')
        }
      },

      deleteNodes: async (nodeIds) => {
        const { nodes } = get()

        try {
          // Delete floor plan elements from database (not tables)
          const elementsToDelete = nodes
            .filter(node => nodeIds.includes(node.id) && node.data?.elementType !== 'table')
            .map(node => node.id)

          if (elementsToDelete.length > 0) {
            await Promise.all(
              elementsToDelete.map(id => floorPlanElementsService.deleteElement(id))
            )
          }

          set((state) => ({
            nodes: state.nodes.filter(node => !nodeIds.includes(node.id)),
            edges: state.edges.filter(edge =>
              !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
            ),
            selectedNodes: state.selectedNodes.filter(id => !nodeIds.includes(id)),
            hasChanges: true
          }))

          get().autoSave()
          toast.success(`${nodeIds.length} elementos eliminados`)
        } catch (error) {
          console.error('Error deleting elements:', error)
          toast.error('Error al eliminar elementos')
        }
      },

      // Element Creation
      addElement: async (type, position) => {
        try {
          // Create element in database first
          const dbElement = await floorPlanElementsService.createElement({
            element_type: type,
            position_x: position.x,
            position_y: position.y
          })

          // Create node with database ID
          const node = createElementNode(type, position, {
            id: dbElement.id,
            size: { width: Number(dbElement.width), height: Number(dbElement.height) },
            rotation: Number(dbElement.rotation),
            style: dbElement.style_data,
            data: dbElement.element_data,
            zIndex: dbElement.z_index
          })

          get().addNode(node)
        } catch (error) {
          console.error('Error adding element:', error)
          toast.error('Error al añadir elemento')
        }
      },

      addTableFromData: (tableData, position) => {
        const node = createTableNode(tableData, position)
        get().addNode(node)
      },

      // Layout Management
      loadLayout: async () => {
        try {
          set({ isLoading: true })

          // Load both restaurant tables and floor plan elements from database
          await Promise.all([
            get().loadRestaurantTables(),
            get().loadFloorPlanElements()
          ])

          toast.success('Layout cargado correctamente')

        } catch (error) {
          console.error('Error loading layout:', error)
          toast.error('Error al cargar el layout')
        } finally {
          set({ isLoading: false, hasChanges: false })
        }
      },

      // Load restaurant tables and convert to nodes
      loadRestaurantTables: async () => {
        try {
          // Load tables from API
          const response = await fetch('/api/tables/status', {
            headers: {
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante'
            }
          })

          if (!response.ok) {
            throw new Error('Failed to load restaurant tables')
          }

          const { tables } = await response.json()

          // Convert tables to React Flow nodes
          const tableNodes = tables.map((table: any) => {
            // Use saved position if available, otherwise assign default position
            const position = {
              x: table.position_x || (Math.random() * 800 + 100),
              y: table.position_y || (Math.random() * 600 + 100)
            }

            return createTableNode(table, position)
          })

          // Get current nodes and filter out existing table nodes
          const { nodes } = get()
          const nonTableNodes = nodes.filter(node =>
            node.data?.elementType !== 'table'
          )

          // Merge table nodes with existing non-table elements
          const mergedNodes = [...nonTableNodes, ...tableNodes]

          set({ nodes: mergedNodes })
          console.log(`✅ Loaded ${tableNodes.length} restaurant tables`)

        } catch (error) {
          console.error('Error loading restaurant tables:', error)
          toast.error('Error al cargar las mesas del restaurante')
        }
      },

      // Load floor plan elements from database
      loadFloorPlanElements: async () => {
        try {
          // Clear any corrupted localStorage first
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('enigma-floor-plan-layout')
              console.log('🧹 Cleared localStorage floor plan data')
            } catch (e) {
              console.log('localStorage clear failed:', e)
            }
          }

          const elements = await floorPlanElementsService.getElements()

          // Convert database elements to React Flow nodes
          const elementNodes = elements.map((element: DatabaseFloorPlanElement) => {
            const position = { x: Number(element.position_x), y: Number(element.position_y) }

            // Create node based on element type
            if (element.element_type === ElementType.TABLE) {
              // For tables, merge with database element data
              return createTableNode({
                ...element.element_data,
                id: element.id,
                position_x: element.position_x,
                position_y: element.position_y
              }, position)
            } else {
              // For other elements, create node with database ID
              const node = createElementNode(element.element_type, position, {
                size: { width: Number(element.width), height: Number(element.height) },
                rotation: Number(element.rotation),
                style: element.style_data,
                data: element.element_data,
                zIndex: element.z_index
              })
              // Override the generated ID with database ID
              node.id = element.id
              return node
            }
          })

          // Get current nodes and filter out existing floor plan elements (non-table)
          const { nodes } = get()
          const tableNodes = nodes.filter(node => node.data?.elementType === 'table')

          // Merge element nodes with existing table nodes
          const mergedNodes = [...tableNodes, ...elementNodes]

          set({ nodes: mergedNodes })
          console.log(`✅ Loaded ${elementNodes.length} floor plan elements from database`)

        } catch (error) {
          console.error('Error loading floor plan elements:', error)
          toast.error('Error al cargar elementos del plano')
        }
      },

      saveLayout: async () => {
        try {
          const { nodes } = get()

          // Prepare elements for database update (exclude tables - they're managed separately)
          const elementsToSave = nodes
            .filter(node => node.data?.elementType !== 'table')
            .map(node => {
              const element: any = {
                element_type: node.data.elementType,
                position_x: node.position.x,
                position_y: node.position.y,
                width: node.data.size?.width || 100,
                height: node.data.size?.height || 100,
                rotation: node.data.rotation || 0,
                z_index: node.data.zIndex || 0,
                style_data: node.data.style || {},
                element_data: node.data
              }

              // Only include ID if it's not a temp ID and is a valid UUID
              if (!node.id.startsWith('temp_') && isValidUUID(node.id)) {
                element.id = node.id
              }

              return element
            })

          // Save to database
          if (elementsToSave.length > 0) {
            console.log('💾 Saving elements to database:', JSON.stringify(elementsToSave, null, 2))
            await floorPlanElementsService.batchUpdateElements(elementsToSave)
          }

          // Also save to localStorage as backup
          const layout = get().exportLayout()
          await layoutManager.save.local(layout)

          set({ hasChanges: false })
          toast.success('Layout guardado correctamente')

        } catch (error) {
          console.error('Error saving layout:', error)
          toast.error('Error al guardar el layout')
        }
      },

      resetLayout: () => {
        set({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          selectedNodes: [],
          hasChanges: true
        })
        get().autoSave()
        toast.info('Layout restablecido')
      },

      importLayout: (layout) => {
        set({
          nodes: layout.nodes || [],
          edges: [], // We'll add edge support later
          viewport: layout.viewport || { x: 0, y: 0, zoom: 1 },
          selectedNodes: [],
          hasChanges: false
        })
      },

      exportLayout: () => {
        const { nodes, viewport } = get()
        return {
          nodes: nodes as FloorPlanNode[],
          viewport,
          lastSaved: new Date().toISOString(),
          version: '1.0.0'
        }
      },

      // Selection Management
      setSelectedNodes: (nodeIds) => {
        set({ selectedNodes: nodeIds })
      },

      selectAll: () => {
        const { nodes } = get()
        set({ selectedNodes: nodes.map(n => n.id) })
      },

      deselectAll: () => {
        set({ selectedNodes: [] })
      },

      // UI Controls
      toggleGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }))
      },

      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }))
      },

      setGridSize: (size) => {
        set({ gridSize: size })
      },

      // Bulk Operations
      duplicateNodes: (nodeIds) => {
        const { nodes } = get()
        const nodesToDuplicate = nodes.filter(n => nodeIds.includes(n.id))

        const duplicatedNodes = nodesToDuplicate.map(node => ({
          ...node,
          id: `${node.id}_copy_${Date.now()}`,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50
          },
          selected: false
        }))

        set((state) => ({
          nodes: [...state.nodes, ...duplicatedNodes],
          hasChanges: true
        }))

        get().autoSave()
        toast.success(`${duplicatedNodes.length} elementos duplicados`)
      },

      groupNodes: (nodeIds) => {
        // TODO: Implement grouping functionality
        toast.info('Funcionalidad de agrupación próximamente')
      },

      // Migration from react-grid-layout
      migrateFromGridLayout: (gridLayouts) => {
        try {
          const migratedLayout = layoutManager.utils.migrate({ layouts: gridLayouts })
          get().importLayout(migratedLayout)

          // Save the migrated layout
          get().saveLayout()

          toast.success('Layout migrado desde react-grid-layout')
        } catch (error) {
          console.error('Migration failed:', error)
          toast.error('Error en la migración del layout')
        }
      },

      // Auto-save helper
      autoSave: () => {
        if (!autoSaver) {
          autoSaver = new layoutManager.AutoSaver(async (layout) => {
            await layoutManager.save.local(layout)
            // Optionally save to server less frequently
          })
        }

        const layout = get().exportLayout()
        autoSaver.queueSave(layout)
      }

    }),
    {
      name: 'floor-plan-store'
    }
  )
)