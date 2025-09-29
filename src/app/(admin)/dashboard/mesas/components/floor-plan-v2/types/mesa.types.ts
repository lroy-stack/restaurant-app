// Floor Plan Visual Types for Enigma Restaurant Platform
// Core visual table interface based on database schema

export interface VisualMesa {
  id: string
  number: string  // "T1", "S10", etc.
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  position: { x: number, y: number }  // From DB position_x, position_y
  dimensions: { width: number, height: number }  // From DB width, height
  rotation: number  // From DB rotation field
  currentStatus: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'
  isActive: boolean
  currentReservation?: {
    customerName: string
    time: string
    partySize: number
    status: string
  } | null
}

// Visual shape configuration
export interface MesaShapeConfig {
  type: 'circle' | 'rectangle'  // circle for capacity ≤4, rectangle for >4
  fill: string                  // Status color from Enigma design tokens
  stroke: string               // Border color
  strokeWidth: number          // Touch-friendly borders
  x: number
  y: number
  width: number
  height: number
  radius?: number              // For circle shapes
}

// Zone filter state
export interface ZoneFilter {
  selectedZone: string | 'all'
  visibleTables: VisualMesa[]
  zoneStats: Record<string, { available: number, total: number, active: number }>
}

// Floor plan view state
export interface FloorPlanState {
  scale: number
  position: { x: number, y: number }
  selectedTable: VisualMesa | null
  isModalOpen: boolean
  isDragging: boolean
}

// Konva performance configuration
export interface KonvaConfig {
  maxLayers: number
  enableCaching: boolean
  listeningLayers: boolean
  pixelRatio: number
  hitGraphEnabled: boolean
}

// Component props interfaces
export interface MesaProps {
  mesa: VisualMesa
  onClick: (mesa: VisualMesa) => void
  scale: number
  isSelected?: boolean
  onDragEnd?: (mesa: VisualMesa, position: { x: number; y: number }) => void
  isDragEnabled?: boolean
}

export interface PlanoProps {
  tables: VisualMesa[]
  onTableClick: (mesa: VisualMesa) => void
  selectedZone: string
  className?: string
  onTableDragEnd?: (mesa: VisualMesa, position: { x: number; y: number }) => void
  isDragMode?: boolean
  isMultiSelectMode?: boolean
  selectedTableIds?: Set<string>
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  table: VisualMesa | null
}

export interface ToolbarProps {
  selectedZone: string
  onZoneChange: (zone: string) => void
  onZoomFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  zoneStats: Record<string, { available: number, total: number, active: number }>
  isDragMode?: boolean
  onDragModeToggle?: (enabled: boolean) => void
  isMultiSelectMode?: boolean
  onMultiSelectModeToggle?: (enabled: boolean) => void
  selectedCount?: number
  onSelectAll?: () => void
  onClearSelection?: () => void
  onBulkStatusUpdate?: (status: string) => void
}

// Enigma status colors using official design tokens
export const STATUS_COLORS = {
  available: 'oklch(0.65 0.12 125)',      // Professional sage green (available)
  reserved: 'oklch(0.6 0.18 40)',        // Refined burnt orange (reserved)
  occupied: 'oklch(0.55 0.22 25)',       // Professional red (occupied)
  maintenance: 'oklch(0.45 0.025 200)',  // Atlantic blue-gray (maintenance)
  temporally_closed: 'oklch(0.40 0.02 220)' // Neutral gray (closed)
} as const

// Zone definitions from existing codebase
export const ENIGMA_ZONES = {
  'TERRACE_CAMPANARI': 'Terraza Campanari',
  'SALA_PRINCIPAL': 'Sala Principal',
  'SALA_VIP': 'Sala VIP',
  'TERRACE_JUSTICIA': 'Terraza Justicia'
} as const

export type EnigmaZone = keyof typeof ENIGMA_ZONES
export type TableStatus = keyof typeof STATUS_COLORS