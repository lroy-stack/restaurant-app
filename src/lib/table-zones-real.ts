/**
 * ZONAS DE MESAS - ÚNICA FUENTE DE VERDAD DESDE BASE DE DATOS
 * 
 * Este archivo contiene las zonas REALES extraídas de la base de datos.
 * NO usar valores hardcodeados. La base de datos es la única fuente de verdad.
 */

export const REAL_TABLE_ZONES = {
  TERRACE: 'TERRACE',
  INTERIOR: 'INTERIOR', 
  BAR: 'BAR',
  TERRACE_1: 'TERRACE_1',
  VIP_ROOM: 'VIP_ROOM',
  MAIN_ROOM: 'MAIN_ROOM', 
  TERRACE_2: 'TERRACE_2'
} as const

export type RealTableZone = typeof REAL_TABLE_ZONES[keyof typeof REAL_TABLE_ZONES]

// Información real desde base de datos (verificada 2025-09-11)
export const ZONE_SUMMARY = {
  TERRACE_1: {
    totalTables: 14,
    totalCapacity: 44, // T1-T8: 8×4=32 + T9-T14: 6×2=12
    description: 'Terraza 1 - Principal',
    isActive: true
  },
  VIP_ROOM: {
    totalTables: 3,
    totalCapacity: 12, // S10-S12: 3×4=12
    description: 'Sala VIP - Privada',
    isActive: true
  },
  MAIN_ROOM: {
    totalTables: 8,
    totalCapacity: 28, // S1,S6: 2×2=4 + S2-S5,S7-S8: 6×4=24
    description: 'Sala Principal Interior',
    isActive: true
  },
  TERRACE_2: {
    totalTables: 9,
    totalCapacity: 36, // T20-T28: 9×4=36
    description: 'Terraza 2 - Solo verano',
    isActive: false // Inactiva fuera temporada
  },
  // Zonas legacy (mantenidas por compatibilidad)
  TERRACE: {
    totalTables: 0,
    totalCapacity: 0,
    description: 'Legacy - usar TERRACE_1',
    isActive: false
  },
  INTERIOR: {
    totalTables: 0,
    totalCapacity: 0,
    description: 'Legacy - usar MAIN_ROOM',
    isActive: false
  },
  BAR: {
    totalTables: 0,
    totalCapacity: 0,
    description: 'Legacy - integrar en MAIN_ROOM',
    isActive: false
  }
} as const

// NO hay conceptos de:
// - TERRACE_SEA_VIEW (FALSO)
// - TERRACE_STANDARD (FALSO)
// - INTERIOR_WINDOW (FALSO)
// - INTERIOR_STANDARD (FALSO)
// - BAR_AREA (FALSO)
// - Premium zones (FALSO)
// - Price multipliers (FALSO)

/**
 * Helper para validar que una zona existe realmente
 */
export function isValidTableZone(zone: string): zone is RealTableZone {
  return Object.values(REAL_TABLE_ZONES).includes(zone as RealTableZone)
}

/**
 * Obtener todas las zonas válidas
 */
export function getAllValidZones(): RealTableZone[] {
  return Object.values(REAL_TABLE_ZONES)
}