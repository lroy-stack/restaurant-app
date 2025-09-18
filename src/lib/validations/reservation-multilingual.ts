import { z } from 'zod'

// Language type
export type Language = 'es' | 'en'

// Multilingual error messages
const errorMessages = {
  es: {
    // Customer info
    nameRequired: "El nombre es requerido",
    nameMinLength: "El nombre debe tener al menos 2 caracteres",
    emailRequired: "Email requerido", 
    emailInvalid: "Email válido requerido",
    phoneRequired: "Teléfono requerido",
    phoneInvalid: "Teléfono válido requerido",
    
    // Reservation details
    partySizeMin: "Mínimo 1 persona",
    partySizeMax: "Máximo 12 personas",
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
    
    // Reservation details
    partySizeMin: "Minimum 1 person",
    partySizeMax: "Maximum 12 people",
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

// Dynamic schema factory based on language
export const createReservationSchema = (lang: Language = 'es') => {
  const messages = errorMessages[lang]
  
  return z.object({
    // Customer Information
    firstName: z.string()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMinLength)
      .max(50),
    lastName: z.string()
      .min(1, messages.nameRequired) 
      .min(2, messages.nameMinLength)
      .max(50),
    email: z.string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    phone: z.string()
      .min(1, messages.phoneRequired)
      .regex(/^[\+]?[0-9\s\-\(\)]{8,15}$/, messages.phoneInvalid),
    preferredLanguage: z.enum(['es', 'en']).default(lang),
    
    // Reservation Details  
    partySize: z.number()
      .int()
      .min(1, messages.partySizeMin)
      .max(12, messages.partySizeMax),
    date: z.string().min(1, messages.dateRequired),
    time: z.string().min(1, messages.timeRequired),
    
    // Table Selection (required for dynamic table selection)
    tableId: z.string().min(1, messages.tableRequired),
    tableZone: z.enum(['TERRACE', 'INTERIOR', 'BAR', 'TERRACE_CAMPANARI', 'SALA_VIP', 'SALA_PRINCIPAL', 'TERRACE_JUSTICIA']),
    
    // Special Requirements
    occasion: z.string().max(100, messages.occasionMax).optional(),
    specialRequests: z.string().max(500, messages.specialRequestsMax).optional(),
    dietaryNotes: z.string().max(300, messages.dietaryNotesMax).optional(),
    
    // Pre-ordering Integration
    hasPreOrder: z.boolean().default(false),
    preOrderItems: z.array(z.object({
      itemId: z.string(),
      name: z.string(),
      quantity: z.number().int().min(1),
      price: z.number(),
      type: z.enum(['dish', 'wine']),
      category: z.string().optional(),
      notes: z.string().optional()
    })).default([]),
    preOrderTotal: z.number().default(0),
    
    // Analytics & Preferences
    isVipCustomer: z.boolean().default(false),
    customerNotes: z.string().optional(), // Internal staff notes
    marketingSource: z.string().optional(), // How they found us
    
    // GDPR Compliance
    privacyPolicyAccepted: z.boolean()
      .refine(val => val === true, messages.privacyRequired),
    termsAccepted: z.boolean()
      .refine(val => val === true, messages.termsRequired),
    marketingConsent: z.boolean().default(false),
    emailNotifications: z.boolean().default(true),
    
    // Real-time Features
    estimatedArrival: z.string().optional(), // For real-time tracking
    tablePreference: z.string().optional(), // Specific table requests
    urgentRequest: z.boolean().default(false), // For immediate availability check
  })
}

// Table availability schema for real-time checks
export const tableAvailabilitySchema = z.object({
  date: z.string(),
  time: z.string(), 
  partySize: z.number().int().min(1).max(12),
  duration: z.number().int().min(60).max(300).default(150), // minutes
  tableZone: z.enum(['TERRACE', 'INTERIOR', 'BAR', 'TERRACE_CAMPANARI', 'SALA_VIP', 'SALA_PRINCIPAL', 'TERRACE_JUSTICIA']).optional(),
  preferredTables: z.array(z.string()).optional()
})

// WebSocket real-time update schema
export const realtimeUpdateSchema = z.object({
  type: z.enum(['table_status_change', 'reservation_update', 'availability_change']),
  tableId: z.string().optional(),
  reservationId: z.string().optional(),
  status: z.enum(['available', 'reserved', 'occupied', 'maintenance']).optional(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional()
})

// Pre-order integration schema
export const preOrderIntegrationSchema = z.object({
  cartItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    type: z.enum(['dish', 'wine']),
    image_url: z.string().optional(),
    category_name: z.string().optional(),
    winery: z.string().optional(),
    wine_type: z.string().optional(),
    allergens: z.array(z.string()).optional(),
    dietary_info: z.record(z.boolean()).optional()
  })),
  subtotal: z.number(),
  estimatedPrepTime: z.number().optional(), // minutes
  kitchenNotes: z.string().optional()
})

// Export types
export type ReservationFormData = z.infer<ReturnType<typeof createReservationSchema>>
export type TableAvailabilityData = z.infer<typeof tableAvailabilitySchema>
export type RealtimeUpdateData = z.infer<typeof realtimeUpdateSchema>
export type PreOrderIntegrationData = z.infer<typeof preOrderIntegrationSchema>

// Export error messages for UI
export { errorMessages }