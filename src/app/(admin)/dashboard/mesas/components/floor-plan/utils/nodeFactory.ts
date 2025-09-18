/**
 * Node Factory
 * Factory functions for creating React Flow nodes from floor plan elements
 */

import {
  ElementType,
  FloorPlanNode,
  ElementData,
  ElementStyle,
  DEFAULT_ELEMENT_SIZES,
  DEFAULT_ELEMENT_STYLES
} from './elementTypes'

// Generate unique IDs for elements
export function generateElementId(type: ElementType): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${type}_${timestamp}_${random}`
}

// Create a new floor plan element node
export function createElementNode(
  type: ElementType,
  position: { x: number, y: number },
  customData?: Partial<ElementData>,
  customStyle?: Partial<ElementStyle>
): FloorPlanNode {
  const id = generateElementId(type)
  const defaultSize = DEFAULT_ELEMENT_SIZES[type]
  const defaultStyle = DEFAULT_ELEMENT_STYLES[type]

  return {
    id,
    type: type,
    position,
    data: {
      elementType: type,
      size: defaultSize,
      rotation: 0,
      style: { ...defaultStyle, ...customStyle },
      label: customData?.label || getDefaultLabel(type),
      ...customData
    },
    draggable: true,
    selectable: true,
    deletable: true
  }
}

// Create a table node from existing table data
export function createTableNode(
  tableData: {
    id: string
    number: string
    capacity: number
    location: string
  },
  position: { x: number, y: number }
): FloorPlanNode {
  // Dynamic sizing based on table capacity (matching existing logic)
  const size = getTableSize(tableData.capacity)

  return {
    id: `table_${tableData.id}`,
    type: ElementType.TABLE,
    position,
    data: {
      elementType: ElementType.TABLE,
      size,
      rotation: 0,
      style: getTableStyle(tableData.capacity),
      label: `Mesa ${tableData.number}`,
      table_id: tableData.id,
      number: tableData.number,
      capacity: tableData.capacity,
      location: tableData.location
    },
    draggable: true,
    selectable: true,
    deletable: false // Tables can't be deleted from floor plan
  }
}

// Get default label for element type
function getDefaultLabel(type: ElementType): string {
  const labels: Record<ElementType, string> = {
    [ElementType.TABLE]: 'Mesa',
    [ElementType.DOOR]: 'Puerta',
    [ElementType.WINDOW]: 'Ventana',
    [ElementType.WALL]: 'Pared',
    [ElementType.STAIRS]: 'Escaleras',
    [ElementType.COLUMN]: 'Columna',
    [ElementType.BAR]: 'Barra',
    [ElementType.KITCHEN]: 'Cocina',
    [ElementType.HOST_STATION]: 'Recepción',
    [ElementType.SERVICE_STATION]: 'Estación de Servicio',
    [ElementType.STORAGE]: 'Almacén',
    [ElementType.BATHROOM]: 'Baño',
    [ElementType.CHAIR]: 'Silla',
    [ElementType.SOFA]: 'Sofá',
    [ElementType.BENCH]: 'Banco',
    [ElementType.BOOTH]: 'Booth',
    [ElementType.BAR_STOOL]: 'Taburete',
    [ElementType.COUNTER]: 'Mostrador',
    [ElementType.SHELF]: 'Estante',
    [ElementType.CABINET]: 'Gabinete',
    [ElementType.PLANT]: 'Planta',
    [ElementType.ARTWORK]: 'Arte',
    [ElementType.FOUNTAIN]: 'Fuente',
    [ElementType.LIGHTING]: 'Iluminación',
    [ElementType.MIRROR]: 'Espejo',
    [ElementType.KITCHEN_AREA]: 'Área Cocina',
    [ElementType.WAITING_AREA]: 'Área Espera',
    [ElementType.ENTRANCE]: 'Entrada',
    [ElementType.EXIT]: 'Salida'
  }
  return labels[type]
}

// Get table size based on capacity (matching existing logic)
function getTableSize(capacity: number): { width: number, height: number } {
  if (capacity <= 2) {
    return { width: 80, height: 80 } // Square for 2 pax
  } else if (capacity <= 4) {
    return { width: 120, height: 80 } // Rectangle for 4 pax
  } else if (capacity <= 6) {
    return { width: 160, height: 80 } // Oval for 6 pax
  } else {
    return { width: 100, height: 100 } // Large round for 8+ pax
  }
}

// Get table style based on capacity (matching existing logic)
function getTableStyle(capacity: number): ElementStyle {
  const baseStyle = DEFAULT_ELEMENT_STYLES[ElementType.TABLE]

  if (capacity <= 2) {
    return { ...baseStyle, borderRadius: 8 } // Square tables
  } else if (capacity <= 4) {
    return { ...baseStyle, borderRadius: 6 } // Rectangular tables
  } else if (capacity <= 6) {
    return { ...baseStyle, borderRadius: 40 } // Oval tables
  } else {
    return { ...baseStyle, borderRadius: 50 } // Round tables
  }
}

// Convert a FloorPlanNode back to database format
export function nodeToFloorPlanElement(node: FloorPlanNode) {
  return {
    id: node.id,
    type: node.data.elementType,
    position: node.position,
    size: node.data.size,
    rotation: node.data.rotation || 0,
    style: node.data.style,
    data: {
      ...node.data,
      // Remove React Flow specific fields
      elementType: undefined,
      size: undefined,
      rotation: undefined,
      style: undefined
    },
    zIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Batch create nodes from multiple elements
export function createNodesFromElements(elements: any[]): FloorPlanNode[] {
  return elements.map(element => {
    if (element.elementType === ElementType.TABLE) {
      return createTableNode(element, element.position || { x: 0, y: 0 })
    } else {
      return createElementNode(
        element.elementType,
        element.position || { x: 0, y: 0 },
        element.data,
        element.style
      )
    }
  })
}

// Element templates for sidebar drag & drop
export const ELEMENT_TEMPLATES: Record<ElementType, Omit<FloorPlanNode, 'id' | 'position'>> = {
  [ElementType.TABLE]: {
    type: ElementType.TABLE,
    data: {
      elementType: ElementType.TABLE,
      size: DEFAULT_ELEMENT_SIZES[ElementType.TABLE],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.TABLE],
      label: 'Nueva Mesa',
      capacity: 4
    },
    draggable: true,
    selectable: true,
    deletable: false
  },
  [ElementType.DOOR]: {
    type: ElementType.DOOR,
    data: {
      elementType: ElementType.DOOR,
      size: DEFAULT_ELEMENT_SIZES[ElementType.DOOR],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.DOOR],
      label: 'Puerta'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.WINDOW]: {
    type: ElementType.WINDOW,
    data: {
      elementType: ElementType.WINDOW,
      size: DEFAULT_ELEMENT_SIZES[ElementType.WINDOW],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.WINDOW],
      label: 'Ventana'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.WALL]: {
    type: ElementType.WALL,
    data: {
      elementType: ElementType.WALL,
      size: DEFAULT_ELEMENT_SIZES[ElementType.WALL],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.WALL],
      label: 'Pared'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.STAIRS]: {
    type: ElementType.STAIRS,
    data: {
      elementType: ElementType.STAIRS,
      size: DEFAULT_ELEMENT_SIZES[ElementType.STAIRS],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.STAIRS],
      label: 'Escaleras'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.COLUMN]: {
    type: ElementType.COLUMN,
    data: {
      elementType: ElementType.COLUMN,
      size: DEFAULT_ELEMENT_SIZES[ElementType.COLUMN],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.COLUMN],
      label: 'Columna'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.BAR]: {
    type: ElementType.BAR,
    data: {
      elementType: ElementType.BAR,
      size: DEFAULT_ELEMENT_SIZES[ElementType.BAR],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.BAR],
      label: 'Barra'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.KITCHEN]: {
    type: ElementType.KITCHEN,
    data: {
      elementType: ElementType.KITCHEN,
      size: DEFAULT_ELEMENT_SIZES[ElementType.KITCHEN],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.KITCHEN],
      label: 'Cocina'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.HOST_STATION]: {
    type: ElementType.HOST_STATION,
    data: {
      elementType: ElementType.HOST_STATION,
      size: DEFAULT_ELEMENT_SIZES[ElementType.HOST_STATION],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.HOST_STATION],
      label: 'Recepción'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.SERVICE_STATION]: {
    type: ElementType.SERVICE_STATION,
    data: {
      elementType: ElementType.SERVICE_STATION,
      size: DEFAULT_ELEMENT_SIZES[ElementType.SERVICE_STATION],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.SERVICE_STATION],
      label: 'Estación de Servicio'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.STORAGE]: {
    type: ElementType.STORAGE,
    data: {
      elementType: ElementType.STORAGE,
      size: DEFAULT_ELEMENT_SIZES[ElementType.STORAGE],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.STORAGE],
      label: 'Almacén'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.BATHROOM]: {
    type: ElementType.BATHROOM,
    data: {
      elementType: ElementType.BATHROOM,
      size: DEFAULT_ELEMENT_SIZES[ElementType.BATHROOM],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.BATHROOM],
      label: 'Baño'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.CHAIR]: {
    type: ElementType.CHAIR,
    data: {
      elementType: ElementType.CHAIR,
      size: DEFAULT_ELEMENT_SIZES[ElementType.CHAIR],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.CHAIR],
      label: 'Silla'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.SOFA]: {
    type: ElementType.SOFA,
    data: {
      elementType: ElementType.SOFA,
      size: DEFAULT_ELEMENT_SIZES[ElementType.SOFA],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.SOFA],
      label: 'Sofá'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.BENCH]: {
    type: ElementType.BENCH,
    data: {
      elementType: ElementType.BENCH,
      size: DEFAULT_ELEMENT_SIZES[ElementType.BENCH],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.BENCH],
      label: 'Banco'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.PLANT]: {
    type: ElementType.PLANT,
    data: {
      elementType: ElementType.PLANT,
      size: DEFAULT_ELEMENT_SIZES[ElementType.PLANT],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.PLANT],
      label: 'Planta'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.ARTWORK]: {
    type: ElementType.ARTWORK,
    data: {
      elementType: ElementType.ARTWORK,
      size: DEFAULT_ELEMENT_SIZES[ElementType.ARTWORK],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.ARTWORK],
      label: 'Arte'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.FOUNTAIN]: {
    type: ElementType.FOUNTAIN,
    data: {
      elementType: ElementType.FOUNTAIN,
      size: DEFAULT_ELEMENT_SIZES[ElementType.FOUNTAIN],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.FOUNTAIN],
      label: 'Fuente'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.LIGHTING]: {
    type: ElementType.LIGHTING,
    data: {
      elementType: ElementType.LIGHTING,
      size: DEFAULT_ELEMENT_SIZES[ElementType.LIGHTING],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.LIGHTING],
      label: 'Iluminación'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.BOOTH]: {
    type: ElementType.BOOTH,
    data: {
      elementType: ElementType.BOOTH,
      size: DEFAULT_ELEMENT_SIZES[ElementType.BOOTH],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.BOOTH],
      label: 'Booth'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.BAR_STOOL]: {
    type: ElementType.BAR_STOOL,
    data: {
      elementType: ElementType.BAR_STOOL,
      size: DEFAULT_ELEMENT_SIZES[ElementType.BAR_STOOL],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.BAR_STOOL],
      label: 'Taburete'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.COUNTER]: {
    type: ElementType.COUNTER,
    data: {
      elementType: ElementType.COUNTER,
      size: DEFAULT_ELEMENT_SIZES[ElementType.COUNTER],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.COUNTER],
      label: 'Mostrador'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.SHELF]: {
    type: ElementType.SHELF,
    data: {
      elementType: ElementType.SHELF,
      size: DEFAULT_ELEMENT_SIZES[ElementType.SHELF],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.SHELF],
      label: 'Estante'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.CABINET]: {
    type: ElementType.CABINET,
    data: {
      elementType: ElementType.CABINET,
      size: DEFAULT_ELEMENT_SIZES[ElementType.CABINET],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.CABINET],
      label: 'Gabinete'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.MIRROR]: {
    type: ElementType.MIRROR,
    data: {
      elementType: ElementType.MIRROR,
      size: DEFAULT_ELEMENT_SIZES[ElementType.MIRROR],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.MIRROR],
      label: 'Espejo'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.KITCHEN_AREA]: {
    type: ElementType.KITCHEN_AREA,
    data: {
      elementType: ElementType.KITCHEN_AREA,
      size: DEFAULT_ELEMENT_SIZES[ElementType.KITCHEN_AREA],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.KITCHEN_AREA],
      label: 'Área Cocina'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.WAITING_AREA]: {
    type: ElementType.WAITING_AREA,
    data: {
      elementType: ElementType.WAITING_AREA,
      size: DEFAULT_ELEMENT_SIZES[ElementType.WAITING_AREA],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.WAITING_AREA],
      label: 'Área Espera'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.ENTRANCE]: {
    type: ElementType.ENTRANCE,
    data: {
      elementType: ElementType.ENTRANCE,
      size: DEFAULT_ELEMENT_SIZES[ElementType.ENTRANCE],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.ENTRANCE],
      label: 'Entrada'
    },
    draggable: true,
    selectable: true,
    deletable: true
  },
  [ElementType.EXIT]: {
    type: ElementType.EXIT,
    data: {
      elementType: ElementType.EXIT,
      size: DEFAULT_ELEMENT_SIZES[ElementType.EXIT],
      rotation: 0,
      style: DEFAULT_ELEMENT_STYLES[ElementType.EXIT],
      label: 'Salida'
    },
    draggable: true,
    selectable: true,
    deletable: true
  }
}