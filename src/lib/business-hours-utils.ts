/**
 * BUSINESS HOURS UTILITIES
 * Helpers reutilizables para formatear horarios con semana española (Lunes primero)
 */

export interface BusinessHoursDay {
  day_of_week: number
  [key: string]: any
}

/**
 * Ordena días para mostrar Lunes primero (estilo español)
 * @param days Array de días con day_of_week (0=Domingo, 1=Lunes, etc.)
 * @returns Array ordenado: [Lunes(1), Martes(2),...Sábado(6), Domingo(0)]
 */
export function sortDaysSpanishWeek<T extends BusinessHoursDay>(days: T[]): T[] {
  return [...days].sort((a, b) => {
    // Convertir 0 (Domingo) a 7 para que quede al final
    const orderA = a.day_of_week === 0 ? 7 : a.day_of_week
    const orderB = b.day_of_week === 0 ? 7 : b.day_of_week
    return orderA - orderB
  })
}

/**
 * Nombres de días en español
 */
export const DAY_NAMES_ES = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
} as const

/**
 * Nombres cortos de días en español
 */
export const DAY_NAMES_SHORT_ES = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb'
} as const

/**
 * Obtiene el nombre del día en español
 */
export function getDayName(dayOfWeek: number, short = false): string {
  const names = short ? DAY_NAMES_SHORT_ES : DAY_NAMES_ES
  return names[dayOfWeek as keyof typeof names] || ''
}
