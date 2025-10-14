/**
 * TABLE DIMENSIONS UTILITY
 * Auto-resize tables based on capacity and provide grid alignment
 */

export interface TableDimensions {
  width: number
  height: number
}

export interface GridAlignment {
  x: number
  y: number
}

/**
 * Get standard dimensions based on table capacity
 * Enigma standard: 2pax = 80x80, 4pax = 120x80, 6pax+ = 160x80
 */
export function getStandardDimensions(capacity: number): TableDimensions {
  if (capacity <= 2) {
    return { width: 80, height: 80 }
  } else if (capacity <= 4) {
    return { width: 120, height: 80 }
  } else {
    return { width: 160, height: 80 }
  }
}

/**
 * Align position to grid (multiples of gridSize)
 */
export function alignToGrid(position: number, gridSize: number = 10): number {
  return Math.round(position / gridSize) * gridSize
}

/**
 * Align multiple tables to horizontal grid
 * Groups tables by Y position (same row) and aligns them
 */
export function alignTablesHorizontally(
  tables: Array<{ id: string; position: { x: number; y: number } }>,
  tolerance: number = 20
): Array<{ id: string; position: { x: number; y: number } }> {
  // Group tables by approximate Y position (within tolerance)
  const rows: Array<Array<typeof tables[0]>> = []

  tables.forEach(table => {
    const existingRow = rows.find(row => {
      const avgY = row.reduce((sum, t) => sum + t.position.y, 0) / row.length
      return Math.abs(table.position.y - avgY) <= tolerance
    })

    if (existingRow) {
      existingRow.push(table)
    } else {
      rows.push([table])
    }
  })

  // Align each row to the same Y
  const aligned = rows.flatMap(row => {
    const avgY = row.reduce((sum, t) => sum + t.position.y, 0) / row.length
    const alignedY = alignToGrid(avgY, 10)

    return row.map(table => ({
      ...table,
      position: {
        x: alignToGrid(table.position.x, 10),
        y: alignedY
      }
    }))
  })

  return aligned
}

/**
 * Calculate grid spacing between tables
 */
export function calculateGridSpacing(
  tables: Array<{ dimensions: { width: number } }>,
  containerWidth: number,
  margin: number = 20
): number {
  if (tables.length === 0) return 0

  const totalWidth = tables.reduce((sum, t) => sum + t.dimensions.width, 0)
  const availableSpace = containerWidth - totalWidth - (margin * 2)
  const gaps = tables.length - 1

  return gaps > 0 ? availableSpace / gaps : 0
}

/**
 * Generate SQL UPDATE statements to fix dimensions
 */
export function generateDimensionUpdateSQL(
  tables: Array<{ id: string; number: string; capacity: number; currentWidth: number; currentHeight: number }>
): string[] {
  const updates: string[] = []

  tables.forEach(table => {
    const standard = getStandardDimensions(table.capacity)

    if (table.currentWidth !== standard.width || table.currentHeight !== standard.height) {
      updates.push(
        `UPDATE restaurante.tables SET width = ${standard.width}, height = ${standard.height} WHERE id = '${table.id}'; -- ${table.number} (${table.capacity}pax)`
      )
    }
  })

  return updates
}

/**
 * Generate SQL UPDATE statements for grid alignment
 */
export function generateAlignmentUpdateSQL(
  alignedTables: Array<{ id: string; number: string; position: { x: number; y: number } }>
): string[] {
  return alignedTables.map(table =>
    `UPDATE restaurante.tables SET position_x = ${table.position.x}, position_y = ${table.position.y} WHERE id = '${table.id}'; -- ${table.number}`
  )
}
