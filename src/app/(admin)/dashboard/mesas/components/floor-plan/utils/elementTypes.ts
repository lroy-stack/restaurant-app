/**
 * Floor Plan Element Types
 * Core type definitions for the React Flow floor plan system
 */

export enum ElementType {
  // EXISTING
  TABLE = 'table',

  // STRUCTURAL
  DOOR = 'door',
  WINDOW = 'window',
  WALL = 'wall',
  STAIRS = 'stairs',
  COLUMN = 'column',

  // OPERATIONAL
  BAR = 'bar',
  KITCHEN = 'kitchen',
  HOST_STATION = 'host_station',
  SERVICE_STATION = 'service_station',
  STORAGE = 'storage',
  BATHROOM = 'bathroom',

  // FURNITURE
  CHAIR = 'chair',
  SOFA = 'sofa',
  BENCH = 'bench',
  BOOTH = 'booth',
  BAR_STOOL = 'bar_stool',
  COUNTER = 'counter',
  SHELF = 'shelf',
  CABINET = 'cabinet',

  // DECORATION
  PLANT = 'plant',
  ARTWORK = 'artwork',
  FOUNTAIN = 'fountain',
  LIGHTING = 'lighting',
  MIRROR = 'mirror',

  // ZONES
  KITCHEN_AREA = 'kitchen_area',
  WAITING_AREA = 'waiting_area',
  ENTRANCE = 'entrance',
  EXIT = 'exit'
}

export interface FloorPlanElement {
  id: string
  type: ElementType
  position: { x: number, y: number }
  size: { width: number, height: number }
  rotation: number
  style: ElementStyle
  data: ElementData
  zIndex: number
  createdAt: Date
  updatedAt: Date
}

export interface FloorPlanLayout {
  nodes: FloorPlanNode[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
  lastSaved: string
  version: string
}

export interface ElementStyle {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  opacity?: number
  shadow?: boolean
}

export interface ElementData {
  label?: string
  // Table-specific data
  table_id?: string
  number?: string
  capacity?: number
  location?: string
  // Generic element data
  [key: string]: any
}

// React Flow Node type based on FloorPlanElement
export interface FloorPlanNode {
  id: string
  type: string
  position: { x: number, y: number }
  data: ElementData & {
    elementType: ElementType
    size: { width: number, height: number }
    rotation: number
    style: ElementStyle
  }
  draggable?: boolean
  selectable?: boolean
  deletable?: boolean
}

// Enigma-specific zones
export const ENIGMA_ZONES = {
  'TERRACE_CAMPANARI': 'Terraza Campanari',
  'SALA_PRINCIPAL': 'Sala Principal',
  'SALA_VIP': 'Sala VIP',
  'TERRACE_JUSTICIA': 'Terraza Justicia'
} as const

export type EnigmaZone = keyof typeof ENIGMA_ZONES

// Element categories for sidebar organization
export const ELEMENT_CATEGORIES = {
  TABLES: 'Mesas',
  STRUCTURAL: 'Estructura',
  OPERATIONAL: 'Operacional',
  FURNITURE: 'Mobiliario',
  DECORATION: 'Decoración'
} as const

export const ELEMENT_CATEGORY_MAP: Record<ElementType, keyof typeof ELEMENT_CATEGORIES> = {
  [ElementType.TABLE]: 'TABLES',
  [ElementType.DOOR]: 'STRUCTURAL',
  [ElementType.WINDOW]: 'STRUCTURAL',
  [ElementType.WALL]: 'STRUCTURAL',
  [ElementType.STAIRS]: 'STRUCTURAL',
  [ElementType.COLUMN]: 'STRUCTURAL',
  [ElementType.BAR]: 'OPERATIONAL',
  [ElementType.KITCHEN]: 'OPERATIONAL',
  [ElementType.HOST_STATION]: 'OPERATIONAL',
  [ElementType.SERVICE_STATION]: 'OPERATIONAL',
  [ElementType.STORAGE]: 'OPERATIONAL',
  [ElementType.BATHROOM]: 'OPERATIONAL',
  [ElementType.CHAIR]: 'FURNITURE',
  [ElementType.SOFA]: 'FURNITURE',
  [ElementType.BENCH]: 'FURNITURE',
  [ElementType.PLANT]: 'DECORATION',
  [ElementType.ARTWORK]: 'DECORATION',
  [ElementType.FOUNTAIN]: 'DECORATION',
  [ElementType.LIGHTING]: 'DECORATION'
}

// Default sizes for elements (in pixels)
export const DEFAULT_ELEMENT_SIZES: Record<ElementType, { width: number, height: number }> = {
  [ElementType.TABLE]: { width: 120, height: 80 },
  [ElementType.DOOR]: { width: 80, height: 20 },
  [ElementType.WINDOW]: { width: 100, height: 20 },
  [ElementType.WALL]: { width: 200, height: 20 },
  [ElementType.STAIRS]: { width: 100, height: 60 },
  [ElementType.COLUMN]: { width: 40, height: 40 },
  [ElementType.BAR]: { width: 200, height: 60 },
  [ElementType.KITCHEN]: { width: 150, height: 100 },
  [ElementType.HOST_STATION]: { width: 80, height: 60 },
  [ElementType.SERVICE_STATION]: { width: 100, height: 80 },
  [ElementType.STORAGE]: { width: 120, height: 100 },
  [ElementType.BATHROOM]: { width: 100, height: 100 },
  [ElementType.CHAIR]: { width: 40, height: 40 },
  [ElementType.SOFA]: { width: 120, height: 60 },
  [ElementType.BENCH]: { width: 100, height: 40 },
  [ElementType.BOOTH]: { width: 150, height: 80 },
  [ElementType.BAR_STOOL]: { width: 35, height: 35 },
  [ElementType.COUNTER]: { width: 180, height: 50 },
  [ElementType.SHELF]: { width: 120, height: 30 },
  [ElementType.CABINET]: { width: 100, height: 60 },
  [ElementType.PLANT]: { width: 50, height: 50 },
  [ElementType.ARTWORK]: { width: 80, height: 100 },
  [ElementType.FOUNTAIN]: { width: 80, height: 80 },
  [ElementType.LIGHTING]: { width: 30, height: 30 },
  [ElementType.MIRROR]: { width: 60, height: 80 },
  [ElementType.KITCHEN_AREA]: { width: 200, height: 150 },
  [ElementType.WAITING_AREA]: { width: 150, height: 100 },
  [ElementType.ENTRANCE]: { width: 120, height: 50 },
  [ElementType.EXIT]: { width: 120, height: 50 }
}

// Default styles for elements
export const DEFAULT_ELEMENT_STYLES: Record<ElementType, ElementStyle> = {
  [ElementType.TABLE]: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    borderWidth: 2,
    borderRadius: 8,
    shadow: true
  },
  [ElementType.DOOR]: {
    backgroundColor: '#8B4513',
    borderColor: '#654321',
    borderWidth: 1,
    borderRadius: 4
  },
  [ElementType.WINDOW]: {
    backgroundColor: '#87CEEB',
    borderColor: '#4682B4',
    borderWidth: 1,
    borderRadius: 2,
    opacity: 0.8
  },
  [ElementType.WALL]: {
    backgroundColor: '#D3D3D3',
    borderColor: '#A9A9A9',
    borderWidth: 1,
    borderRadius: 2
  },
  [ElementType.STAIRS]: {
    backgroundColor: '#F5F5DC',
    borderColor: '#D2B48C',
    borderWidth: 1,
    borderRadius: 4
  },
  [ElementType.COLUMN]: {
    backgroundColor: '#696969',
    borderColor: '#2F4F4F',
    borderWidth: 1,
    borderRadius: 20
  },
  [ElementType.BAR]: {
    backgroundColor: '#8B4513',
    borderColor: '#654321',
    borderWidth: 2,
    borderRadius: 6,
    shadow: true
  },
  [ElementType.KITCHEN]: {
    backgroundColor: '#F0F8FF',
    borderColor: '#4682B4',
    borderWidth: 2,
    borderRadius: 8
  },
  [ElementType.HOST_STATION]: {
    backgroundColor: '#FFE4E1',
    borderColor: '#CD5C5C',
    borderWidth: 2,
    borderRadius: 6
  },
  [ElementType.SERVICE_STATION]: {
    backgroundColor: '#E6E6FA',
    borderColor: '#9370DB',
    borderWidth: 2,
    borderRadius: 6
  },
  [ElementType.STORAGE]: {
    backgroundColor: '#F5F5DC',
    borderColor: '#D2B48C',
    borderWidth: 1,
    borderRadius: 4
  },
  [ElementType.BATHROOM]: {
    backgroundColor: '#F0FFFF',
    borderColor: '#B0E0E6',
    borderWidth: 1,
    borderRadius: 6
  },
  [ElementType.CHAIR]: {
    backgroundColor: '#DEB887',
    borderColor: '#D2B48C',
    borderWidth: 1,
    borderRadius: 4
  },
  [ElementType.SOFA]: {
    backgroundColor: '#DEB887',
    borderColor: '#D2B48C',
    borderWidth: 2,
    borderRadius: 8
  },
  [ElementType.BENCH]: {
    backgroundColor: '#DEB887',
    borderColor: '#D2B48C',
    borderWidth: 1,
    borderRadius: 6
  },
  [ElementType.PLANT]: {
    backgroundColor: '#90EE90',
    borderColor: '#228B22',
    borderWidth: 1,
    borderRadius: 25,
    opacity: 0.9
  },
  [ElementType.ARTWORK]: {
    backgroundColor: '#FFD700',
    borderColor: '#B8860B',
    borderWidth: 2,
    borderRadius: 4,
    shadow: true
  },
  [ElementType.FOUNTAIN]: {
    backgroundColor: '#87CEEB',
    borderColor: '#4682B4',
    borderWidth: 2,
    borderRadius: 50,
    opacity: 0.9
  },
  [ElementType.LIGHTING]: {
    backgroundColor: '#FFFFE0',
    borderColor: '#DAA520',
    borderWidth: 1,
    borderRadius: 15,
    opacity: 0.8
  },
  [ElementType.BOOTH]: {
    backgroundColor: '#8B4513',
    borderColor: '#654321',
    borderWidth: 2,
    borderRadius: 8
  },
  [ElementType.BAR_STOOL]: {
    backgroundColor: '#DEB887',
    borderColor: '#D2B48C',
    borderWidth: 1,
    borderRadius: 20
  },
  [ElementType.COUNTER]: {
    backgroundColor: '#F5F5DC',
    borderColor: '#D2B48C',
    borderWidth: 2,
    borderRadius: 6
  },
  [ElementType.SHELF]: {
    backgroundColor: '#8B4513',
    borderColor: '#654321',
    borderWidth: 1,
    borderRadius: 4
  },
  [ElementType.CABINET]: {
    backgroundColor: '#8B4513',
    borderColor: '#654321',
    borderWidth: 2,
    borderRadius: 6
  },
  [ElementType.MIRROR]: {
    backgroundColor: '#E6E6FA',
    borderColor: '#C0C0C0',
    borderWidth: 2,
    borderRadius: 4,
    opacity: 0.9
  },
  [ElementType.KITCHEN_AREA]: {
    backgroundColor: '#FFE4E1',
    borderColor: '#CD5C5C',
    borderWidth: 2,
    borderRadius: 8,
    opacity: 0.7
  },
  [ElementType.WAITING_AREA]: {
    backgroundColor: '#E0FFFF',
    borderColor: '#4682B4',
    borderWidth: 2,
    borderRadius: 8,
    opacity: 0.7
  },
  [ElementType.ENTRANCE]: {
    backgroundColor: '#98FB98',
    borderColor: '#228B22',
    borderWidth: 2,
    borderRadius: 6
  },
  [ElementType.EXIT]: {
    backgroundColor: '#FFB6C1',
    borderColor: '#DC143C',
    borderWidth: 2,
    borderRadius: 6
  }
}