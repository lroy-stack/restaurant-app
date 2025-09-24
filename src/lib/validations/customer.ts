import { z } from 'zod'

// Base customer schema (for database operations)
export const customerSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, 'Nombre es requerido').max(50),
  lastName: z.string().min(1, 'Apellido es requerido').max(50),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^(\+34|0034|34)?[6|7|8|9][0-9]{8}$/, 'Teléfono español inválido').optional(),
  language: z.string().default('ES'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').optional(),
  preferredTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora debe ser HH:MM').optional(),
  preferredLocation: z.enum(['TERRACE_CAMPANARI', 'SALA_VIP', 'TERRACE_JUSTICIA', 'SALA_PRINCIPAL']).optional(),
  dietaryRestrictions: z.array(z.enum(['vegetarian', 'vegan', 'gluten_free', 'lactose_free', 'halal', 'kosher'])).default([]),
  allergies: z.string().max(500, 'Alergias demasiado largas').optional(),
  favoriteDisheIds: z.array(z.string().uuid()).default([]),
  totalVisits: z.number().int().min(0).default(0),
  totalSpent: z.number().min(0).default(0),
  averagePartySize: z.number().min(1).max(20).default(2),
  lastVisit: z.string().datetime().optional(),
  isVip: z.boolean().default(false),
  emailConsent: z.boolean().default(false),
  smsConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
  dataProcessingConsent: z.boolean().default(false),
  consentDate: z.string().datetime().optional(),
  consentIpAddress: z.string().optional(),
  consentUserAgent: z.string().max(500).optional(),
  gdprPolicyVersion: z.string().max(20).optional(),
  consentMethod: z.enum(['web', 'email', 'phone', 'in_person']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Schema for customer creation (excludes computed fields)
export const createCustomerSchema = customerSchema.omit({
  id: true,
  totalVisits: true,
  totalSpent: true,
  averagePartySize: true,
  lastVisit: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Make required fields explicit for creation
  firstName: z.string().min(1, 'Nombre es requerido').max(50),
  lastName: z.string().min(1, 'Apellido es requerido').max(50),
  email: z.string().email('Email inválido'),
  dataProcessingConsent: z.boolean().refine(val => val === true, {
    message: 'Consentimiento de procesamiento de datos es obligatorio'
  })
})

// Schema for customer updates (all fields optional except ID)
export const updateCustomerSchema = z.object({
  firstName: z.string().min(1, 'Nombre es requerido').max(50).optional(),
  lastName: z.string().min(1, 'Apellido es requerido').max(50).optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(/^(\+34|0034|34)?[6|7|8|9][0-9]{8}$/, 'Teléfono español inválido').nullable().optional(),
  language: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').nullable().optional(),
  preferredTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora debe ser HH:MM').nullable().optional(),
  preferredLocation: z.enum(['TERRACE_CAMPANARI', 'SALA_VIP', 'TERRACE_JUSTICIA', 'SALA_PRINCIPAL']).nullable().optional(),
  dietaryRestrictions: z.array(z.enum(['vegetarian', 'vegan', 'gluten_free', 'lactose_free', 'halal', 'kosher'])).optional(),
  allergies: z.string().max(500, 'Alergias demasiado largas').nullable().optional(),
  favoriteDisheIds: z.array(z.string().uuid()).optional(),
  isVip: z.boolean().optional(),
  emailConsent: z.boolean().optional(),
  smsConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  dataProcessingConsent: z.boolean().optional()
})

// Schema for GDPR consent updates
export const gdprConsentUpdateSchema = z.object({
  consentType: z.enum(['email', 'sms', 'marketing', 'dataProcessing']),
  granted: z.boolean(),
  ipAddress: z.string().optional(),
  userAgent: z.string().max(500).optional(),
  policyVersion: z.string().max(20).optional(),
  method: z.enum(['web', 'email', 'phone', 'in_person']).default('web')
})

// Schema for VIP status toggle
export const vipStatusSchema = z.object({
  isVip: z.boolean(),
  reason: z.string().max(200, 'Razón muy larga').optional(),
  grantedBy: z.string().uuid().optional() // Staff member ID
})

// Schema for customer metrics (read-only, for validation)
export const customerMetricsSchema = z.object({
  loyaltyScore: z.number().min(0).max(100),
  customerTier: z.enum(['VIP Elite', 'Oro', 'Plata', 'Bronce']),
  visitFrequency: z.number().min(0),
  avgSpendPerVisit: z.number().min(0),
  clv: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  noShowRate: z.number().min(0).max(100),
  avgPartySize: z.number().min(1).max(20),
  preferredTimeSlots: z.array(z.string()),
  favoriteItems: z.array(z.any()),
  seasonalityPattern: z.enum(['regular', 'seasonal', 'special_occasions']),
  riskLevel: z.enum(['low', 'medium', 'high'])
})

// Schema for AI recommendations
export const aiRecommendationSchema = z.object({
  id: z.string(),
  type: z.enum(['marketing', 'service', 'retention', 'upselling']),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  action: z.string().max(100).optional()
})

// Schema for customer export data
export const customerExportSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeReservations: z.boolean().default(true),
  includeOrders: z.boolean().default(true),
  includeNotes: z.boolean().default(false), // Staff notes are sensitive
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  }).optional()
})

// Schema for customer search/filter
export const customerFilterSchema = z.object({
  search: z.string().max(100).optional(),
  vipStatus: z.enum(['all', 'vip', 'regular']).default('all'),
  tier: z.enum(['all', 'VIP Elite', 'Oro', 'Plata', 'Bronce']).default('all'),
  location: z.enum(['all', 'TERRACE_CAMPANARI', 'SALA_VIP', 'TERRACE_JUSTICIA', 'SALA_PRINCIPAL']).default('all'),
  language: z.enum(['all', 'ES', 'EN', 'DE']).default('all'),
  hasConsent: z.enum(['all', 'email', 'sms', 'marketing']).default('all'),
  visitRange: z.object({
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(0).optional()
  }).optional(),
  spendingRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  lastVisitDays: z.number().int().min(0).max(365).optional(), // Days since last visit
  sortBy: z.enum(['lastName', 'totalVisits', 'totalSpent', 'lastVisit', 'loyaltyScore']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

// Type exports for TypeScript usage
export type Customer = z.infer<typeof customerSchema>
export type CreateCustomer = z.infer<typeof createCustomerSchema>
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>
export type GdprConsentUpdate = z.infer<typeof gdprConsentUpdateSchema>
export type VipStatus = z.infer<typeof vipStatusSchema>
export type CustomerMetrics = z.infer<typeof customerMetricsSchema>
export type AIRecommendation = z.infer<typeof aiRecommendationSchema>
export type CustomerExport = z.infer<typeof customerExportSchema>
export type CustomerFilter = z.infer<typeof customerFilterSchema>

// Validation helpers
export const validateCustomerId = (id: string) => {
  return z.string().uuid().safeParse(id)
}

export const validateEmail = (email: string) => {
  return z.string().email().safeParse(email)
}

export const validateSpanishPhone = (phone: string) => {
  return z.string().regex(/^(\+34|0034|34)?[6|7|8|9][0-9]{8}$/).safeParse(phone)
}

// Spanish-specific validation patterns
export const SPANISH_PHONE_REGEX = /^(\+34|0034|34)?[6|7|8|9][0-9]{8}$/
export const DNI_NIE_REGEX = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/

// Business rule validations
export const businessRules = {
  minAgeForVip: 18,
  maxAllergiesLength: 500,
  maxPartySize: 20,
  minLoyaltyForAutoVip: 85,
  maxRecentReservationsToShow: 5,
  gdprDataRetentionYears: 3
} as const