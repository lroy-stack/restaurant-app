/**
 * RESPONSIVE LAYOUT SYSTEM
 * Maintains real restaurant layout, only adjusts viewport and scale
 */

import { useMemo } from 'react'
import { VisualMesa } from '../types/mesa.types'

interface ViewportSize {
  width: number
  height: number
}

interface LayoutBounds {
  width: number
  height: number
  scale: number
}

interface ZoneBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

/**
 * Calculate bounds for a group of tables
 */
function calculateZoneBounds(zoneTables: VisualMesa[]): ZoneBounds {
  if (zoneTables.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  const minX = Math.min(...zoneTables.map(t => t.position.x))
  const minY = Math.min(...zoneTables.map(t => t.position.y))
  const maxX = Math.max(...zoneTables.map(t => t.position.x + t.dimensions.width))
  const maxY = Math.max(...zoneTables.map(t => t.position.y + t.dimensions.height))

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * Responsive layout that RESPECTS restaurant zones
 * Desktop: Horizontal layout as designed
 * Mobile: Stack zones vertically but KEEP internal distributions
 */
export function useResponsiveLayout(
  tables: VisualMesa[],
  viewport: ViewportSize
): { tables: VisualMesa[]; bounds: LayoutBounds } {

  const isMobile = viewport.width < 768

  return useMemo(() => {
    if (tables.length === 0) {
      return {
        tables: [],
        bounds: { width: 800, height: 600, scale: 1 }
      }
    }

    // DESKTOP & TABLET: Use original coordinates from DB
    if (!isMobile) {
      const maxX = Math.max(...tables.map(t => t.position.x + t.dimensions.width))
      const maxY = Math.max(...tables.map(t => t.position.y + t.dimensions.height))

      return {
        tables,
        bounds: {
          width: maxX + 100,
          height: maxY + 100,
          scale: 1
        }
      }
    }

    // MOBILE: Stack zones vertically, maintain internal layout
    const byLocation = tables.reduce((acc, table) => {
      if (!acc[table.location]) acc[table.location] = []
      acc[table.location].push(table)
      return acc
    }, {} as Record<string, VisualMesa[]>)

    const zoneOrder = ['TERRACE_CAMPANARI', 'SALA_PRINCIPAL', 'SALA_VIP']
    const zonePadding = 40  // Reducido de 80 a 40
    const sidePadding = 20  // Reducido de 40 a 20
    let currentY = zonePadding

    const transformedTables: VisualMesa[] = []
    let maxWidth = 0

    // Process each zone, stack vertically
    zoneOrder.forEach(location => {
      const zoneTables = byLocation[location]
      if (!zoneTables || zoneTables.length === 0) return

      const zoneBounds = calculateZoneBounds(zoneTables)

      // Transform tables: normalize to start at sidePadding, then offset by currentY
      zoneTables.forEach(table => {
        const relativeX = table.position.x - zoneBounds.minX
        const relativeY = table.position.y - zoneBounds.minY

        transformedTables.push({
          ...table,
          position: {
            x: sidePadding + relativeX,
            y: currentY + relativeY
          }
        })
      })

      maxWidth = Math.max(maxWidth, zoneBounds.width + (sidePadding * 2))
      currentY += zoneBounds.height + zonePadding
    })

    return {
      tables: transformedTables,
      bounds: {
        width: maxWidth,
        height: currentY + zonePadding,
        scale: 1
      }
    }
  }, [tables, isMobile, viewport.width])
}
