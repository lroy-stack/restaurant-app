/**
 * REDISTRIBUTE TABLES WITH UNIFORM SPACING
 * Redistributes tables in each row with consistent gaps between them
 */

import { createServiceClient } from '@/utils/supabase/server'

interface TablePosition {
  id: string
  number: string
  location: string
  position_x: number
  position_y: number
  width: number
  height: number
}

export async function redistributeTablesWithSpacing(spacingPx: number = 60) {
  const supabase = await createServiceClient()

  // Get all active tables
  const { data: tables, error: fetchError } = await supabase
    .from('tables')
    .select('id, number, location, position_x, position_y, width, height, isActive')
    .eq('isActive', true)

  if (fetchError) {
    throw new Error(`Failed to fetch tables: ${fetchError.message}`)
  }

  if (!tables || tables.length === 0) {
    return { success: true, message: 'No tables found', redistributed: 0 }
  }

  const updates: Array<{ id: string; number: string; oldX: number; newX: number }> = []

  // Group by location
  const byLocation = tables.reduce((acc, table) => {
    if (!acc[table.location]) acc[table.location] = []
    acc[table.location].push(table)
    return acc
  }, {} as Record<string, typeof tables>)

  // Process each location
  for (const [location, locationTables] of Object.entries(byLocation)) {
    // Group tables by row (same Y position)
    const rows: Array<typeof locationTables> = []

    locationTables.forEach(table => {
      const existingRow = rows.find(row => {
        const avgY = row.reduce((sum, t) => sum + Number(t.position_y || 0), 0) / row.length
        return Math.abs(Number(table.position_y || 0) - avgY) <= 20
      })

      if (existingRow) {
        existingRow.push(table)
      } else {
        rows.push([table])
      }
    })

    // Redistribute each row with uniform spacing
    for (const row of rows) {
      // Sort tables by current X position
      row.sort((a, b) => Number(a.position_x || 0) - Number(b.position_x || 0))

      // Calculate new positions with uniform spacing
      let currentX = row[0].position_x // Start from first table's position

      for (let i = 0; i < row.length; i++) {
        const table = row[i]
        const oldX = Number(table.position_x || 0)
        const newX = Math.round(currentX / 10) * 10 // Align to 10px grid

        if (Math.abs(oldX - newX) > 5) {
          updates.push({
            id: table.id,
            number: table.number,
            oldX,
            newX
          })

          // Update in database
          const { error: updateError } = await supabase
            .from('tables')
            .update({
              position_x: newX
            })
            .eq('id', table.id)

          if (updateError) {
            console.error(`Failed to update table ${table.number}:`, updateError)
          }
        }

        // Move to next position: current position + table width + spacing
        currentX = newX + Number(table.width || 80) + spacingPx
      }
    }
  }

  return {
    success: true,
    message: `Redistributed ${updates.length} tables with ${spacingPx}px spacing`,
    redistributed: updates.length,
    spacing: spacingPx,
    details: updates
  }
}

/**
 * Calculate optimal spacing for a location based on available width
 */
export async function calculateOptimalSpacing(location: string, maxWidth: number = 1500) {
  const supabase = await createServiceClient()

  const { data: tables } = await supabase
    .from('tables')
    .select('width, position_y, isActive')
    .eq('isActive', true)
    .eq('location', location)

  if (!tables || tables.length === 0) return 60

  // Group by row
  const rows: Array<typeof tables> = []
  tables.forEach(table => {
    const existingRow = rows.find(row => {
      const avgY = row.reduce((sum, t) => sum + Number(t.position_y || 0), 0) / row.length
      return Math.abs(Number(table.position_y || 0) - avgY) <= 20
    })

    if (existingRow) {
      existingRow.push(table)
    } else {
      rows.push([table])
    }
  })

  // Find the row with most tables
  const longestRow = rows.reduce((max, row) => row.length > max.length ? row : max, rows[0])

  // Calculate total width needed for tables
  const totalTableWidth = longestRow.reduce((sum, t) => sum + Number(t.width || 80), 0)

  // Calculate available space for gaps
  const availableSpace = maxWidth - totalTableWidth
  const numberOfGaps = longestRow.length - 1

  // Return spacing (minimum 30px, maximum 100px)
  const optimalSpacing = numberOfGaps > 0 ? availableSpace / numberOfGaps : 60
  return Math.max(30, Math.min(100, Math.round(optimalSpacing)))
}
