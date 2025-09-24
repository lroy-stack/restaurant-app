// lib/utils/timestamps.ts
// 🚀 CRITICAL FIX: Universal timestamp helper for Spain timezone (CEST)
// Solves the 2-hour offset problem across all APIs and services

/**
 * Returns current timestamp in Spain timezone (CEST = UTC+2)
 * Use this instead of new Date().toISOString() everywhere
 */
export function getSpainTimestamp(): string {
  const now = new Date()
  // CRITICAL FIX: Get Spain time string but maintain UTC base for ISO conversion
  const spainTimeString = now.toLocaleString("sv-SE", {timeZone: "Europe/Madrid"})
  // Return with proper timezone offset without double conversion
  return spainTimeString.replace(' ', 'T') + '+02:00'
}

/**
 * Returns current Date object in Spain timezone (CEST = UTC+2)
 * Use this instead of new Date() for date operations
 */
export function getSpainDate(): Date {
  const now = new Date()
  // CRITICAL FIX: Add 2 hours to UTC to get Spain time
  return new Date(now.getTime() + (2 * 60 * 60 * 1000))
}

/**
 * Creates expiry date in Spain timezone with specified days offset
 * Use for token expiration, cookie expiry, etc.
 */
export function getSpainExpiryDate(daysFromNow: number): Date {
  const spainDate = getSpainDate()
  spainDate.setDate(spainDate.getDate() + daysFromNow)
  return spainDate
}

/**
 * Converts any date to Spain timezone ISO string
 * Use for consistent database storage
 */
export function toSpainTimestamp(date: Date): string {
  return new Date(date.toLocaleString("sv-SE", {timeZone: "Europe/Madrid"})).toISOString().replace('Z', '+02:00')
}

// Export default for common usage
export default {
  getSpainTimestamp,
  getSpainDate,
  getSpainExpiryDate,
  toSpainTimestamp
}