/**
 * useCapacityValidation Hook
 *
 * Centraliza la lógica de validación de capacidad de mesas
 * Feature flag: NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION (default: false)
 */

import { useMemo } from 'react'

interface Table {
  id: string
  capacity: number
  [key: string]: any
}

interface CapacityValidationConfig {
  enabled: boolean
  minCapacityBuffer: number  // 1.0 = exacto o mayor
  maxCapacityBuffer: number  // 1.5 = máximo 50% extra
}

interface ValidationResult {
  canSelect: boolean
  reason?: string
  severity?: 'error' | 'warning' | 'info'
}

export function useCapacityValidation() {
  // Feature flag - OFF por defecto para no afectar producción
  const config: CapacityValidationConfig = useMemo(() => ({
    enabled: process.env.NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION === 'true',
    minCapacityBuffer: 1.0,
    maxCapacityBuffer: 1.5
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
    const maxAllowed = Math.ceil(partySize * config.maxCapacityBuffer)

    // Permitir deseleccionar siempre
    if (isAlreadySelected) {
      return { canSelect: true }
    }

    // Regla 1: Si ya tiene capacidad suficiente, no permitir agregar más
    if (currentCapacity >= partySize) {
      return {
        canSelect: false,
        reason: 'Ya tienes capacidad suficiente para tu grupo',
        severity: 'info'
      }
    }

    // Regla 2: No permitir exceder capacidad máxima permitida
    if (newCapacity > maxAllowed) {
      return {
        canSelect: false,
        reason: `Excede capacidad máxima (${maxAllowed} personas para grupo de ${partySize})`,
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
    const maxAllowed = Math.ceil(partySize * config.maxCapacityBuffer)

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
        reason: `Capacidad excesiva. Máximo permitido: ${maxAllowed} personas para tu grupo de ${partySize}`,
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
    validateFinalSelection,
    getCapacityInfo,
    filterAppropriateTables
  }
}
