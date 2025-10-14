/**
 * PROFESSIONAL GRID SYSTEM FOR ENIGMA RESTAURANT
 *
 * Virtual Grid: 1600 x 1200 units
 * This grid represents the physical restaurant layout
 * All coordinates are in virtual units that scale to any viewport
 */

export interface TableCoordinate {
  number: string
  location: 'TERRACE_CAMPANARI' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL' | 'SALA_VIP'
  x: number
  y: number
  width: number
  height: number
}

/**
 * FIXED RESTAURANT LAYOUT - Based on actual floor plan
 * These coordinates reflect the real physical positions
 */
export const RESTAURANT_GRID: TableCoordinate[] = [
  // TERRACE_CAMPANARI (Top section - formerly labeled as "Justicia")
  // Row 1: T1-T8 (8 tables horizontal)
  { number: 'T1', location: 'TERRACE_CAMPANARI', x: 50, y: 50, width: 80, height: 80 },
  { number: 'T2', location: 'TERRACE_CAMPANARI', x: 180, y: 50, width: 80, height: 80 },
  { number: 'T3', location: 'TERRACE_CAMPANARI', x: 310, y: 50, width: 80, height: 80 },
  { number: 'T4', location: 'TERRACE_CAMPANARI', x: 440, y: 50, width: 80, height: 80 },
  { number: 'T5', location: 'TERRACE_CAMPANARI', x: 570, y: 50, width: 80, height: 80 },
  { number: 'T6', location: 'TERRACE_CAMPANARI', x: 700, y: 50, width: 80, height: 80 },
  { number: 'T7', location: 'TERRACE_CAMPANARI', x: 830, y: 50, width: 80, height: 80 },
  { number: 'T8', location: 'TERRACE_CAMPANARI', x: 960, y: 50, width: 80, height: 80 },

  // Row 2: T9-T14 (6 tables horizontal)
  { number: 'T9', location: 'TERRACE_CAMPANARI', x: 115, y: 180, width: 120, height: 80 },
  { number: 'T10', location: 'TERRACE_CAMPANARI', x: 285, y: 180, width: 80, height: 80 },
  { number: 'T11', location: 'TERRACE_CAMPANARI', x: 415, y: 180, width: 120, height: 80 },
  { number: 'T12', location: 'TERRACE_CAMPANARI', x: 585, y: 180, width: 120, height: 80 },
  { number: 'T13', location: 'TERRACE_CAMPANARI', x: 755, y: 180, width: 80, height: 80 },
  { number: 'T14', location: 'TERRACE_CAMPANARI', x: 885, y: 180, width: 120, height: 80 },

  // SALA_VIP (Left middle section)
  { number: 'S10', location: 'SALA_VIP', x: 50, y: 380, width: 120, height: 80 },
  { number: 'S11', location: 'SALA_VIP', x: 220, y: 380, width: 120, height: 80 },
  { number: 'S12', location: 'SALA_VIP', x: 220, y: 510, width: 120, height: 80 },

  // SALA_PRINCIPAL (Right middle section)
  // Column layout based on image
  { number: 'S8', location: 'SALA_PRINCIPAL', x: 560, y: 380, width: 80, height: 100 },
  { number: 'S5', location: 'SALA_PRINCIPAL', x: 690, y: 380, width: 80, height: 80 },
  { number: 'S3', location: 'SALA_PRINCIPAL', x: 820, y: 380, width: 120, height: 80 },

  { number: 'S7', location: 'SALA_PRINCIPAL', x: 690, y: 510, width: 80, height: 80 },
  { number: 'S4', location: 'SALA_PRINCIPAL', x: 820, y: 510, width: 120, height: 80 },
  { number: 'S2', location: 'SALA_PRINCIPAL', x: 990, y: 510, width: 120, height: 80 },

  { number: 'S6', location: 'SALA_PRINCIPAL', x: 560, y: 640, width: 80, height: 80 },
  { number: 'S1', location: 'SALA_PRINCIPAL', x: 820, y: 640, width: 120, height: 80 },

  // TERRACE_JUSTICIA (Bottom section - formerly labeled as "Campanari")
  // Left group: T20-T23
  { number: 'T20', location: 'TERRACE_JUSTICIA', x: 50, y: 880, width: 80, height: 80 },
  { number: 'T21', location: 'TERRACE_JUSTICIA', x: 180, y: 880, width: 80, height: 80 },
  { number: 'T22', location: 'TERRACE_JUSTICIA', x: 310, y: 880, width: 80, height: 80 },
  { number: 'T23', location: 'TERRACE_JUSTICIA', x: 440, y: 880, width: 80, height: 80 },

  // Right group: T24-T28
  { number: 'T24', location: 'TERRACE_JUSTICIA', x: 660, y: 880, width: 120, height: 80 },
  { number: 'T25', location: 'TERRACE_JUSTICIA', x: 830, y: 880, width: 120, height: 80 },
  { number: 'T26', location: 'TERRACE_JUSTICIA', x: 1000, y: 880, width: 120, height: 80 },
  { number: 'T27', location: 'TERRACE_JUSTICIA', x: 1170, y: 880, width: 120, height: 80 },
  { number: 'T28', location: 'TERRACE_JUSTICIA', x: 1340, y: 880, width: 120, height: 80 },
]

/**
 * Grid configuration
 */
export const GRID_CONFIG = {
  virtualWidth: 1600,
  virtualHeight: 1000,
  minScale: 0.3,
  maxScale: 2,
  // Breakpoints for responsive behavior
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440
  }
}

/**
 * Calculate scale to fit all tables in viewport
 */
export function calculateFitScale(viewportWidth: number, viewportHeight: number): number {
  const scaleX = viewportWidth / GRID_CONFIG.virtualWidth
  const scaleY = viewportHeight / GRID_CONFIG.virtualHeight

  // Use the smaller scale to ensure everything fits
  const fitScale = Math.min(scaleX, scaleY) * 0.95 // 95% to add padding

  // Clamp between min and max
  return Math.max(GRID_CONFIG.minScale, Math.min(GRID_CONFIG.maxScale, fitScale))
}

/**
 * Get table coordinate by number
 */
export function getTableCoordinate(tableNumber: string): TableCoordinate | undefined {
  return RESTAURANT_GRID.find(t => t.number === tableNumber)
}

/**
 * Get all tables for a specific location
 */
export function getTablesByLocation(location: string): TableCoordinate[] {
  return RESTAURANT_GRID.filter(t => t.location === location)
}
