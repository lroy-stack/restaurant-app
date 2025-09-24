import { z } from 'zod'

// Enum values from database
const ReservationStatus = z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])

// Dynamic Zod schema generation with configurable maxPartySize
export const createReservationSchema = (maxPartySize: number = 10) => z.object({
  // Customer Information (required for reservations table)
  firstName: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(255, 'Nombre demasiado largo'),

  lastName: z.string()
    .min(1, 'Los apellidos son obligatorios')
    .max(255, 'Apellidos demasiado largos'),

  email: z.string()
    .email('Email inválido')
    .min(1, 'El email es obligatorio'),

  phone: z.string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^(\+34|0034|34)?[6789]\d{8}$/, 'Formato de teléfono español inválido'),

  // Reservation Details
  dateTime: z.string()
    .min(1, 'La fecha y hora son obligatorias')
    .refine((val) => {
      const date = new Date(val)
      return date > new Date()
    }, 'La fecha debe ser futura'),

  partySize: z.number()
    .int('El número de personas debe ser entero')
    .min(1, 'Mínimo 1 persona')
    .max(maxPartySize, `Máximo ${maxPartySize} personas`),

  tableId: z.string().optional(),

  // Additional Information (optional fields from DB)
  occasion: z.string().max(500, 'Ocasión demasiado larga').optional(),
  dietaryNotes: z.string().max(1000, 'Notas dietéticas demasiado largas').optional(),
  specialRequests: z.string().max(1000, 'Peticiones especiales demasiado largas').optional(),

  // Pre-order (optional)
  hasPreOrder: z.boolean().default(false),
  preOrderItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1),
    type: z.enum(['dish', 'wine'])
  })).optional(),
  preOrderTotal: z.number().min(0).optional(),

  // GDPR Compliance (required by law and DB constraints)
  dataProcessingConsent: z.boolean()
    .refine((val) => val === true, 'El consentimiento de procesamiento de datos es obligatorio'),

  emailConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),

  // Language preference
  preferredLanguage: z.enum(['ES', 'EN', 'DE']).default('ES'),

  // Internal fields (will be set by API)
  customerId: z.string().optional(), // FK to customers if exists
  restaurantId: z.string().optional(), // Will be set by API
  status: ReservationStatus.default('PENDING')
})

// Update schema for editing (allows partial updates) - DYNAMIC
export const updateReservationSchema = (maxPartySize: number = 10) => createReservationSchema(maxPartySize).partial().extend({
  id: z.string().min(1, 'ID de reserva requerido')
})

// Types - FIXED: Use ReturnType for function schemas
export type ReservationFormData = z.infer<ReturnType<typeof createReservationSchema>>
export type UpdateReservationData = z.infer<ReturnType<typeof updateReservationSchema>>
export type ReservationStatusType = z.infer<typeof ReservationStatus>

// Default values aligned with database defaults
export const defaultReservationValues: Partial<ReservationFormData> = {
  partySize: 2,
  hasPreOrder: false,
  dataProcessingConsent: true, // Required by law
  emailConsent: false,
  marketingConsent: false,
  preferredLanguage: 'ES',
  status: 'PENDING'
}

// Validation helpers
export const validateReservationDateTime = (dateTime: string): boolean => {
  const date = new Date(dateTime)
  const now = new Date()
  return date > now
}

export const validatePartySize = (size: number, maxPartySize: number = 10): boolean => {
  return Number.isInteger(size) && size >= 1 && size <= maxPartySize
}

// Customer creation schema (for new customers from reservations)
export const createCustomerFromReservationSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellidos requeridos'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  language: z.enum(['ES', 'EN', 'DE']).default('ES'),

  // GDPR fields for customer
  emailConsent: z.boolean().default(false),
  smsConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
  dataProcessingConsent: z.boolean().default(true),

  // Optional customer fields
  dateOfBirth: z.string().optional(),
  preferredTime: z.string().optional(),
  preferredLocation: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.string().optional()
})

export type CustomerFromReservationData = z.infer<typeof createCustomerFromReservationSchema>