import { z } from 'zod'
import { getCachedConfigValue } from '@/app/api/restaurant/config/route'

// Language type
export type Language = 'es' | 'en'

// Configuration-based validation limits
export interface ValidationLimits {
  maxPartySize: number
  maxDuration: number
  minDuration: number
  slotDuration: number
}

// Default fallback values (used if config fetch fails)
const DEFAULT_LIMITS: ValidationLimits = {
  maxPartySize: 10,
  maxDuration: 300,
  minDuration: 60,
  slotDuration: 15
}

/**
 * Get validation limits from restaurant configuration
 */
export async function getValidationLimits(): Promise<ValidationLimits> {
  try {
    const [maxPartySize, maxDuration, slotDuration] = await Promise.all([
      getCachedConfigValue('reservation_max_party_size'),
      getCachedConfigValue('reservation_default_duration'),
      getCachedConfigValue('reservation_slot_duration')
    ])

    return {
      maxPartySize: maxPartySize || DEFAULT_LIMITS.maxPartySize,
      maxDuration: maxDuration || DEFAULT_LIMITS.maxDuration,
      minDuration: DEFAULT_LIMITS.minDuration,
      slotDuration: slotDuration || DEFAULT_LIMITS.slotDuration
    }
  } catch (error) {
    console.error('Error fetching validation limits, using defaults:', error)
    return DEFAULT_LIMITS
  }
}

/**
 * Generate dynamic error messages based on configuration
 */
export function getDynamicErrorMessages(limits: ValidationLimits) {
  return {
    es: {
      // Customer info
      nameRequired: "El nombre es requerido",
      nameMinLength: "El nombre debe tener al menos 2 caracteres",
      emailRequired: "Email requerido",
      emailInvalid: "Email válido requerido",
      phoneRequired: "Teléfono requerido",
      phoneInvalid: "Teléfono válido requerido",

      // Reservation details - DYNAMIC
      partySizeMin: "Mínimo 1 persona",
      partySizeMax: `Máximo ${limits.maxPartySize} personas`,
      dateRequired: "Fecha requerida",
      timeRequired: "Hora requerida",
      tableRequired: "Mesa requerida",

      // Special requirements
      specialRequestsMax: "Máximo 500 caracteres",
      dietaryNotesMax: "Máximo 300 caracteres",
      occasionMax: "Máximo 100 caracteres",

      // GDPR
      privacyRequired: "Debe aceptar la política de privacidad",
      termsRequired: "Debe aceptar los términos y condiciones"
    },
    en: {
      // Customer info
      nameRequired: "Name is required",
      nameMinLength: "Name must be at least 2 characters",
      emailRequired: "Email required",
      emailInvalid: "Valid email required",
      phoneRequired: "Phone required",
      phoneInvalid: "Valid phone required",

      // Reservation details - DYNAMIC
      partySizeMin: "Minimum 1 person",
      partySizeMax: `Maximum ${limits.maxPartySize} people`,
      dateRequired: "Date required",
      timeRequired: "Time required",
      tableRequired: "Table required",

      // Special requirements
      specialRequestsMax: "Maximum 500 characters",
      dietaryNotesMax: "Maximum 300 characters",
      occasionMax: "Maximum 100 characters",

      // GDPR
      privacyRequired: "Must accept privacy policy",
      termsRequired: "Must accept terms and conditions"
    }
  }
}

/**
 * Create dynamic reservation schema based on restaurant configuration
 */
export async function createDynamicReservationSchema(language: Language = 'es') {
  const limits = await getValidationLimits()
  const messages = getDynamicErrorMessages(limits)
  const msg = messages[language]

  return z.object({
    // Customer Information
    firstName: z.string()
      .min(2, msg.nameMinLength)
      .max(50, "Máximo 50 caracteres"),
    lastName: z.string()
      .min(2, msg.nameMinLength)
      .max(50, "Máximo 50 caracteres"),
    email: z.string()
      .email(msg.emailInvalid),
    phone: z.string()
      .min(9, msg.phoneInvalid)
      .max(15, msg.phoneInvalid),

    // Reservation Details - DYNAMIC VALIDATION
    partySize: z.number()
      .int()
      .min(1, msg.partySizeMin)
      .max(limits.maxPartySize, msg.partySizeMax), // DYNAMIC!
    date: z.string()
      .min(1, msg.dateRequired),
    time: z.string()
      .min(1, msg.timeRequired),
    tableId: z.string()
      .min(1, msg.tableRequired),

    // Optional Fields
    occasion: z.string()
      .max(100, msg.occasionMax)
      .optional(),
    dietaryNotes: z.string()
      .max(300, msg.dietaryNotesMax)
      .optional(),
    specialRequests: z.string()
      .max(500, msg.specialRequestsMax)
      .optional(),

    // Pre-order (optional)
    preOrderItems: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      notes: z.string().optional()
    })).optional(),
    preOrderTotal: z.number().optional(),

    // GDPR Compliance
    dataProcessingConsent: z.boolean()
      .refine(val => val === true, { message: msg.privacyRequired }),
    emailConsent: z.boolean().default(false),
    marketingConsent: z.boolean().default(false),
    preferredLanguage: z.enum(['ES', 'EN', 'DE']).default('ES'),

    // ✅ REMOVED: verification_token (we use reservation_token system instead)
  })
}

/**
 * Table availability schema with dynamic limits
 */
export async function createDynamicAvailabilitySchema() {
  const limits = await getValidationLimits()

  return z.object({
    date: z.string(),
    time: z.string(),
    partySize: z.number()
      .int()
      .min(1)
      .max(limits.maxPartySize), // DYNAMIC!
    duration: z.number()
      .int()
      .min(limits.minDuration)
      .max(limits.maxDuration)
      .default(limits.maxDuration), // DYNAMIC!
    tableZone: z.enum([
      'TERRACE', 'INTERIOR', 'BAR',
      'TERRACE_CAMPANARI', 'SALA_VIP',
      'SALA_PRINCIPAL', 'TERRACE_JUSTICIA'
    ]).optional(),
    preferredTables: z.array(z.string()).optional()
  })
}

/**
 * API reservation schema for server-side validation (dynamic)
 */
export async function createDynamicApiReservationSchema() {
  const limits = await getValidationLimits()

  return z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    date: z.string(),
    time: z.string(),
    partySize: z.number()
      .int()
      .min(1)
      .max(limits.maxPartySize), // DYNAMIC!
    tableId: z.string(),
    occasion: z.string().nullable().optional(),
    dietaryNotes: z.string().nullable().optional(),
    specialRequests: z.string().nullable().optional(),
    preOrderItems: z.array(z.any()).optional(),
    preOrderTotal: z.number().optional(),
    dataProcessingConsent: z.boolean(),
    emailConsent: z.boolean().default(false),
    marketingConsent: z.boolean().default(false),
    preferredLanguage: z.enum(['ES', 'EN', 'DE']).default('ES')
    // ✅ REMOVED: verification_token (we use reservation_token system instead)
  })
}

// Export dynamic types
export type DynamicReservationSchema = ReturnType<typeof createDynamicReservationSchema>
export type DynamicAvailabilitySchema = ReturnType<typeof createDynamicAvailabilitySchema>
export type DynamicApiReservationSchema = ReturnType<typeof createDynamicApiReservationSchema>

// Utility: Get current max party size for client-side components
export async function getMaxPartySize(): Promise<number> {
  const limits = await getValidationLimits()
  return limits.maxPartySize
}