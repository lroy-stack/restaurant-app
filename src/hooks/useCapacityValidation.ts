/**
 * useCapacityValidation Hook
 *
 * Centraliza la lógica de validación de capacidad de mesas
 * Feature flag: NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION (default: false)
 */

import { useMemo, useCallback } from 'react'

interface Table {
  id: string
  capacity: number
  [key: string]: any
}

interface CapacityValidationConfig {
  enabled: boolean
  minCapacityBuffer: number  // 1.0 = exacto o mayor
  maxCapacityBuffer: number  // 1.5 = máximo 50% extra
  enableContiguity: boolean  // Validar que mesas estén en la misma zona
}

interface ValidationResult {
  canSelect: boolean
  reason?: string
  severity?: 'error' | 'warning' | 'info'
}

interface ContiguityValidation {
  valid: boolean
  reason?: string
  suggestedTables?: string[]
}

export function useCapacityValidation() {
  // Feature flags - Defaults para backward compatibility
  const config: CapacityValidationConfig = useMemo(() => ({
    enabled: process.env.NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION !== 'false',
    minCapacityBuffer: 1.0,
    maxCapacityBuffer: 1.5,
    enableContiguity: process.env.NEXT_PUBLIC_ENABLE_CONTIGUITY_CHECK === 'true'  // OFF por defecto
  }), [])

  /**
   * Valida si una mesa puede ser seleccionada según reglas de capacidad
   */
  const validateTableSelection = (
    table: Table,
    partySize: number,
    selectedTables: Table[],
    isAlreadySelected: boolean
  ): ValidationResult => {
    // Si feature flag OFF, permitir todo (backward compatible)
    if (!config.enabled) {
      return { canSelect: true }
    }

    const currentCapacity = selectedTables.reduce((sum, t) => sum + t.capacity, 0)
    const newCapacity = currentCapacity + table.capacity

    // ✅ FIX: Buffer más estricto - máximo +2 personas extra
    // Ejemplos: 2 PAX → max 4 asientos | 4 PAX → max 6 asientos | 6 PAX → max 8 asientos
    const maxAllowed = partySize + 2

    // Permitir deseleccionar siempre
    if (isAlreadySelected) {
      return { canSelect: true }
    }

    // Regla 1: Si ya tiene capacidad suficiente, no permitir agregar más
    if (currentCapacity >= partySize) {
      return {
        canSelect: false,
        reason: `Ya tienes ${currentCapacity} asientos para ${partySize} personas`,
        severity: 'info'
      }
    }

    // Regla 2: No permitir exceder capacidad máxima permitida (buffer 1.5x)
    if (newCapacity > maxAllowed) {
      return {
        canSelect: false,
        reason: `Excede capacidad máxima (${maxAllowed} asientos para grupo de ${partySize})`,
        severity: 'error'
      }
    }

    // Regla 3: Mesa individual demasiado grande para grupo pequeño
    if (selectedTables.length === 0 && table.capacity > maxAllowed) {
      return {
        canSelect: false,
        reason: `Mesa demasiado grande para tu grupo de ${partySize} personas (capacidad: ${table.capacity})`,
        severity: 'error'
      }
    }

    // Regla 4: Warning si la mesa es grande pero aún dentro del buffer
    if (selectedTables.length === 0 && table.capacity > partySize && table.capacity <= maxAllowed) {
      return {
        canSelect: true,
        reason: `Mesa con capacidad extra (${table.capacity} personas)`,
        severity: 'warning'
      }
    }

    return { canSelect: true }
  }

  /**
   * Detecta sub-zona de una mesa en Terrace Campanari
   * T1-T6 → Zona 1 | T7-T10 → Zona 2 | T11-T14 → Zona 3
   */
  const getTableSubZone = useCallback((tableNumber: string, location: string): string => {
    // Solo aplica a Terrace Campanari
    if (location !== 'TERRACE_CAMPANARI') {
      return location
    }

    // Extraer número de mesa (T1 → 1, T10 → 10)
    const num = parseInt(tableNumber.replace(/\D/g, ''))

    if (num >= 1 && num <= 6) return 'TERRACE_CAMPANARI_ZONA_1'
    if (num >= 7 && num <= 10) return 'TERRACE_CAMPANARI_ZONA_2'
    if (num >= 11 && num <= 14) return 'TERRACE_CAMPANARI_ZONA_3'

    // Fallback a location general si no coincide
    return location
  }, [])

  /**
   * Valida que las mesas seleccionadas estén en la misma zona (contigüidad)
   * IMPORTANTE: Para Terrace Campanari valida sub-zonas (T1-T6, T7-T10, T11-T14)
   */
  const validateContiguity = useCallback((
    tables: Table[]
  ): ContiguityValidation => {
    // Si solo una mesa, permitir siempre
    if (tables.length <= 1) {
      return { valid: true }
    }

    // Obtener sub-zonas de todas las mesas
    const subZones = tables.map(t => getTableSubZone(t.number, t.location))
    const uniqueZones = new Set(subZones)

    // Todas las mesas deben estar en la misma sub-zona
    if (uniqueZones.size > 1) {
      return {
        valid: false,
        reason: 'Las mesas deben estar en la misma zona del restaurante'
      }
    }

    return { valid: true }
  }, [getTableSubZone])

  /**
   * Valida la selección final antes de continuar
   */
  const validateFinalSelection = (
    selectedTables: Table[],
    partySize: number
  ): ValidationResult => {
    // Si feature flag OFF, solo validar mínimo
    if (!config.enabled) {
      const totalCapacity = selectedTables.reduce((sum, t) => sum + t.capacity, 0)
      if (totalCapacity < partySize) {
        return {
          canSelect: false,
          reason: `Capacidad insuficiente. Necesitas ${partySize} personas, tienes ${totalCapacity}`,
          severity: 'error'
        }
      }
      return { canSelect: true }
    }

    const totalCapacity = selectedTables.reduce((sum, t) => sum + t.capacity, 0)

    // ✅ FIX: Mismo buffer que validateTableSelection (+2 máximo)
    const maxAllowed = partySize + 2

    // Validar capacidad mínima
    if (totalCapacity < partySize) {
      return {
        canSelect: false,
        reason: `Capacidad insuficiente. Necesitas ${partySize} personas, tienes ${totalCapacity}`,
        severity: 'error'
      }
    }

    // Validar capacidad máxima
    if (totalCapacity > maxAllowed) {
      return {
        canSelect: false,
        reason: `Capacidad excesiva. Máximo permitido: ${maxAllowed} asientos para tu grupo de ${partySize}`,
        severity: 'error'
      }
    }

    return { canSelect: true }
  }

  /**
   * Obtiene información sobre la capacidad apropiada para un grupo
   */
  const getCapacityInfo = (partySize: number) => {
    const minCapacity = Math.ceil(partySize * config.minCapacityBuffer)
    const maxCapacity = Math.ceil(partySize * config.maxCapacityBuffer)

    return {
      minCapacity,
      maxCapacity,
      perfectCapacity: partySize,
      enabled: config.enabled
    }
  }

  /**
   * Filtra mesas apropiadas según partySize
   */
  const filterAppropriateTables = (tables: Table[], partySize: number): Table[] => {
    if (!config.enabled) {
      return tables // Sin filtros si feature flag OFF
    }

    const maxAllowed = Math.ceil(partySize * config.maxCapacityBuffer)

    return tables.filter(table => {
      // Permitir mesas que puedan acomodar al grupo sin exceder máximo
      return table.capacity >= partySize && table.capacity <= maxAllowed
    })
  }

  return {
    config,
    validateTableSelection,
    validateContiguity,
    validateFinalSelection,
    getCapacityInfo,
    filterAppropriateTables,
    getTableSubZone  // Exportar para usar en otros componentes
  }
}
