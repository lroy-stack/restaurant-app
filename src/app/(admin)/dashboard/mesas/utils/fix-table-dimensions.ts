/**
 * SCRIPT TO FIX TABLE DIMENSIONS IN DATABASE
 * Run this via API endpoint to auto-fix all table sizes based on capacity
 */

import { createServiceClient } from '@/utils/supabase/server'
import { getStandardDimensions } from './table-dimensions'

export async function fixTableDimensions() {
  const supabase = await createServiceClient()

  // Get all tables
  const { data: tables, error: fetchError } = await supabase
    .from('tables')
    .select('id, number, capacity, width, height')

  if (fetchError) {
    throw new Error(`Failed to fetch tables: ${fetchError.message}`)
  }

  if (!tables || tables.length === 0) {
    return { success: true, message: 'No tables found', updated: 0 }
  }

  const updates: Array<{ id: string; number: string; oldDims: any; newDims: any }> = []

  // Check each table and prepare updates
  for (const table of tables) {
    const standard = getStandardDimensions(table.capacity)
    const currentWidth = Number(table.width || 0)
    const currentHeight = Number(table.height || 0)

    if (currentWidth !== standard.width || currentHeight !== standard.height) {
      updates.push({
        id: table.id,
        number: table.number,
        oldDims: { width: currentWidth, height: currentHeight },
        newDims: standard
      })

      // Update in database
      const { error: updateError } = await supabase
        .from('tables')
        .update({
          width: standard.width,
          height: standard.height
        })
        .eq('id', table.id)

      if (updateError) {
        console.error(`Failed to update table ${table.number}:`, updateError)
      }
    }
  }

  return {
    success: true,
    message: `Updated ${updates.length} tables`,
    updated: updates.length,
    details: updates
  }
}

export async function alignTablePositions() {
  const supabase = await createServiceClient()

  // Get all active tables
  const { data: tables, error: fetchError } = await supabase
    .from('tables')
    .select('id, number, location, position_x, position_y, width, isActive')
    .eq('isActive', true)

  if (fetchError) {
    throw new Error(`Failed to fetch tables: ${fetchError.message}`)
  }

  if (!tables || tables.length === 0) {
    return { success: true, message: 'No tables found', aligned: 0 }
  }

  // Group by location
  const byLocation = tables.reduce((acc, table) => {
    if (!acc[table.location]) acc[table.location] = []
    acc[table.location].push(table)
    return acc
  }, {} as Record<string, typeof tables>)

  const updates: Array<{ id: string; number: string; oldPos: any; newPos: any }> = []

  // Align each location separately
  for (const [location, locationTables] of Object.entries(byLocation)) {
    // ✅ HORIZONTAL ALIGNMENT: Group tables by row (similar Y positions within 20px)
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

    // Align each row horizontally
    for (const row of rows) {
      const avgY = row.reduce((sum, t) => sum + Number(t.position_y || 0), 0) / row.length
      const alignedY = Math.round(avgY / 10) * 10 // Align to 10px grid

      // Sort row by X position for proper spacing
      row.sort((a, b) => Number(a.position_x || 0) - Number(b.position_x || 0))

      for (const table of row) {
        const currentX = Number(table.position_x || 0)
        const currentY = Number(table.position_y || 0)
        const alignedX = Math.round(currentX / 10) * 10

        if (currentX !== alignedX || currentY !== alignedY) {
          updates.push({
            id: table.id,
            number: table.number,
            oldPos: { x: currentX, y: currentY },
            newPos: { x: alignedX, y: alignedY }
          })

          // Update in database
          const { error: updateError } = await supabase
            .from('tables')
            .update({
              position_x: alignedX,
              position_y: alignedY
            })
            .eq('id', table.id)

          if (updateError) {
            console.error(`Failed to update table ${table.number}:`, updateError)
          }
        }
      }
    }

    // ✅ VERTICAL ALIGNMENT: Group tables by column (similar X positions within 30px)
    const columns: Array<typeof locationTables> = []

    locationTables.forEach(table => {
      const existingColumn = columns.find(col => {
        const avgX = col.reduce((sum, t) => sum + Number(t.position_x || 0), 0) / col.length
        return Math.abs(Number(table.position_x || 0) - avgX) <= 30
      })

      if (existingColumn) {
        existingColumn.push(table)
      } else {
        columns.push([table])
      }
    })

    // Align each column vertically
    for (const column of columns) {
      if (column.length < 2) continue // Skip single-table columns

      const avgX = column.reduce((sum, t) => sum + Number(t.position_x || 0), 0) / column.length
      const alignedX = Math.round(avgX / 10) * 10

      for (const table of column) {
        const currentX = Number(table.position_x || 0)
        const currentY = Number(table.position_y || 0)

        if (Math.abs(currentX - alignedX) > 5) {
          const alreadyUpdated = updates.find(u => u.id === table.id)

          if (alreadyUpdated) {
            // Update existing update record
            alreadyUpdated.newPos.x = alignedX
          } else {
            updates.push({
              id: table.id,
              number: table.number,
              oldPos: { x: currentX, y: currentY },
              newPos: { x: alignedX, y: currentY }
            })
          }

          // Update in database
          const { error: updateError } = await supabase
            .from('tables')
            .update({
              position_x: alignedX
            })
            .eq('id', table.id)

          if (updateError) {
            console.error(`Failed to update table ${table.number}:`, updateError)
          }
        }
      }
    }
  }

  return {
    success: true,
    message: `Aligned ${updates.length} tables (horizontal + vertical)`,
    aligned: updates.length,
    details: updates
  }
}
