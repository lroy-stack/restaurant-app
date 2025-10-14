import { z } from 'zod'

// Language type
export type Language = 'es' | 'en' | 'de'

// Dynamic multilingual error messages (expanded for professional use)
const createErrorMessages = (maxPartySize: number = 10) => ({
  es: {
    // Step 1: DateTime & Party Size
    dateRequired: "Fecha requerida",
    timeRequired: "Hora requerida",
    partySizeMin: "Mínimo 1 persona",
    partySizeMax: `Máximo ${maxPartySize} personas`, // DYNAMIC
    
    // Step 2: Table Selection
    tableRequired: "Al menos una mesa requerida",
    
    // Step 3: Contact Information
    firstNameRequired: "Nombre requerido",
    firstNameMinLength: "Nombre debe tener al menos 2 caracteres",
    lastNameRequired: "Apellidos requeridos",
    lastNameMinLength: "Apellidos debe tener al menos 2 caracteres",
    emailRequired: "Email requerido",
    emailInvalid: "Email válido requerido",
    phoneRequired: "Teléfono requerido",
    phoneInvalid: "Formato: +código_país seguido de 8-14 dígitos (ej: +34 600 123 456)",
    
    // Special Requirements
    occasionMax: "Máximo 100 caracteres",
    dietaryNotesMax: "Máximo 300 caracteres",
    specialRequestsMax: "Máximo 500 caracteres",
    
    // GDPR & Legal
    dataProcessingRequired: "Debe aceptar el procesamiento de datos",
    privacyRequired: "Debe aceptar la política de privacidad",
    termsRequired: "Debe aceptar los términos y condiciones"
  },
  en: {
    // Step 1: DateTime & Party Size
    dateRequired: "Date required",
    timeRequired: "Time required",
    partySizeMin: "Minimum 1 person",
    partySizeMax: `Maximum ${maxPartySize} people`, // DYNAMIC
    
    // Step 2: Table Selection
    tableRequired: "Table required",
    
    // Step 3: Contact Information
    firstNameRequired: "First name required",
    firstNameMinLength: "First name must be at least 2 characters",
    lastNameRequired: "Last name required",
    lastNameMinLength: "Last name must be at least 2 characters",
    emailRequired: "Email required",
    emailInvalid: "Valid email required",
    phoneRequired: "Phone number required",
    phoneInvalid: "Format: +country_code followed by 8-14 digits (e.g: +34 600 123 456)",
    
    // Special Requirements
    occasionMax: "Maximum 100 characters",
    dietaryNotesMax: "Maximum 300 characters",
    specialRequestsMax: "Maximum 500 characters",
    
    // GDPR & Legal
    dataProcessingRequired: "Must accept data processing",
    privacyRequired: "Must accept privacy policy", 
    termsRequired: "Must accept terms and conditions"
  },
  de: {
    // Step 1: DateTime & Party Size
    dateRequired: "Datum erforderlich",
    timeRequired: "Uhrzeit erforderlich",
    partySizeMin: "Mindestens 1 Person",
    partySizeMax: `Maximal ${maxPartySize} Personen`, // DYNAMIC
    
    // Step 2: Table Selection
    tableRequired: "Tisch erforderlich",
    
    // Step 3: Contact Information
    firstNameRequired: "Vorname erforderlich",
    firstNameMinLength: "Vorname muss mindestens 2 Zeichen haben",
    lastNameRequired: "Nachname erforderlich",
    lastNameMinLength: "Nachname muss mindestens 2 Zeichen haben",
    emailRequired: "E-Mail erforderlich",
    emailInvalid: "Gültige E-Mail erforderlich",
    phoneRequired: "Telefonnummer erforderlich",
    phoneInvalid: "Format: +Ländercode gefolgt von 8-14 Ziffern (z.B: +34 600 123 456)",
    
    // Special Requirements
    occasionMax: "Maximal 100 Zeichen",
    dietaryNotesMax: "Maximal 300 Zeichen", 
    specialRequestsMax: "Maximal 500 Zeichen",
    
    // GDPR & Legal
    dataProcessingRequired: "Datenverarbeitung muss akzeptiert werden",
    privacyRequired: "Datenschutzerklärung muss akzeptiert werden",
    termsRequired: "AGBs müssen akzeptiert werden"
  }
})

// Individual step schemas following React Hook Form best practices (DYNAMIC)
export const createStepOneSchema = (maxPartySize: number = 10) => z.object({
  // Date & Time Selection
  date: z.string().min(1),
  time: z.string().min(1),
  partySize: z.number().int().min(1).max(maxPartySize), // DYNAMIC
  preferredLocation: z.string().optional(),
})

// Backward compatibility - uses default maxPartySize
export const stepOneSchema = createStepOneSchema(10)

export const stepTwoSchema = z.object({
  // Table Selection & Pre-order (UPDATED: Multiple tables support)
  tableIds: z.array(z.string()).min(1, "Al menos una mesa requerida"),
  tableId: z.string().optional(), // Legacy compatibility
  preOrderItems: z.array(z.object({
    id: z.string(),
    name: z.string(), 
    price: z.number(),
    quantity: z.number().int().min(1),
    type: z.enum(['dish', 'wine']),
    category: z.string().optional(),
    notes: z.string().optional()
  })).default([]),
  preOrderTotal: z.number().default(0),
  hasPreOrder: z.boolean().default(false),
})

export const stepThreeSchema = z.object({
  // Contact Information
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().optional().refine(val => !val || val.length === 0 || z.string().email().safeParse(val).success, "Email inválido"),
  phone: z.string().min(1).regex(/^[+][1-9]\d{1,14}$/, "Formato: +código_país seguido de 8-14 dígitos"),

  // Special Requirements - Checkbox controlled
  hasOccasion: z.boolean().default(false),
  occasion: z.string().max(100).optional(),
  hasDietaryNotes: z.boolean().default(false),
  dietaryNotes: z.string().max(300).optional(),
  hasSpecialRequests: z.boolean().default(false),
  specialRequests: z.string().max(500).optional(),
})

export const stepFourSchema = z.object({
  // GDPR & Legal Consents 
  dataProcessingConsent: z.boolean().refine(val => val === true),
  emailConsent: z.boolean().default(true),
  marketingConsent: z.boolean().default(false),
})

// Combined schema for the complete form following best practices (DYNAMIC)
export const createProfessionalReservationSchema = (lang: Language = 'es', maxPartySize: number = 10) => {
  const errorMessages = createErrorMessages(maxPartySize)
  const messages = errorMessages[lang]
  
  return z.object({
    stepOne: z.object({
      date: z.string().min(1, messages.dateRequired),
      time: z.string().min(1, messages.timeRequired), 
      partySize: z.number()
        .int()
        .min(1, messages.partySizeMin)
        .max(maxPartySize, messages.partySizeMax), // DYNAMIC
      preferredLocation: z.string().optional(),
    }),
    
    stepTwo: z.object({
      tableIds: z.array(z.string()).min(1, messages.tableRequired),
      tableId: z.string().optional(), // Legacy compatibility
      preOrderItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(), 
        quantity: z.number().int().min(1),
        type: z.enum(['dish', 'wine']),
        category: z.string().optional(),
        notes: z.string().optional()
      })).default([]),
      preOrderTotal: z.number().default(0),
      hasPreOrder: z.boolean().default(false),
    }),
    
    stepThree: z.object({
      firstName: z.string()
        .min(1, messages.firstNameRequired)
        .min(2, messages.firstNameMinLength),
      lastName: z.string()
        .min(1, messages.lastNameRequired)
        .min(2, messages.lastNameMinLength),
      email: z.string()
        .optional()
        .refine(val => !val || val.length === 0 || z.string().email().safeParse(val).success, messages.emailInvalid)
        .refine(val => !val || !val.includes('..'), messages.emailInvalid),
      phone: z.string()
        .min(1, messages.phoneRequired)
        .regex(/^[+][1-9]\d{1,14}$/, messages.phoneInvalid),

      // Special Requirements - Checkbox controlled
      hasOccasion: z.boolean().default(false),
      occasion: z.string().max(100, messages.occasionMax).optional(),
      hasDietaryNotes: z.boolean().default(false),
      dietaryNotes: z.string().max(300, messages.dietaryNotesMax).optional(),
      hasSpecialRequests: z.boolean().default(false),
      specialRequests: z.string().max(500, messages.specialRequestsMax).optional(),
    }),
    
    stepFour: z.object({
      dataProcessingConsent: z.boolean()
        .refine(val => val === true, messages.dataProcessingRequired),
      emailConsent: z.boolean().default(true),
      marketingConsent: z.boolean().default(false),
    }),
  })
}

// Backward compatibility - uses default maxPartySize
export const professionalReservationSchema = createProfessionalReservationSchema('es', 10)

// Type exports for TypeScript integration (DYNAMIC)
export type ProfessionalReservationFormData = z.infer<ReturnType<typeof createProfessionalReservationSchema>>
export type StepOneData = z.infer<ReturnType<typeof createStepOneSchema>>
export type StepTwoData = z.infer<typeof stepTwoSchema>
export type StepThreeData = z.infer<typeof stepThreeSchema>
export type StepFourData = z.infer<typeof stepFourSchema>

// Export error messages factory for UI components
export { createErrorMessages }