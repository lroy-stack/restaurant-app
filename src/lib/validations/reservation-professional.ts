import { z } from 'zod'

// Language type
export type Language = 'es' | 'en' | 'de'

// Multilingual error messages (expanded for professional use)
const errorMessages = {
  es: {
    // Step 1: DateTime & Party Size
    dateRequired: "Fecha requerida",
    timeRequired: "Hora requerida", 
    partySizeMin: "Mínimo 1 persona",
    partySizeMax: "Máximo 20 personas",
    
    // Step 2: Table Selection 
    tableRequired: "Mesa requerida",
    
    // Step 3: Contact Information
    firstNameRequired: "Nombre requerido",
    firstNameMinLength: "Nombre debe tener al menos 2 caracteres",
    lastNameRequired: "Apellidos requeridos",
    lastNameMinLength: "Apellidos debe tener al menos 2 caracteres",
    emailRequired: "Email requerido",
    emailInvalid: "Email válido requerido",
    phoneInvalid: "Teléfono válido requerido",
    
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
    partySizeMax: "Maximum 20 people",
    
    // Step 2: Table Selection
    tableRequired: "Table required",
    
    // Step 3: Contact Information  
    firstNameRequired: "First name required",
    firstNameMinLength: "First name must be at least 2 characters",
    lastNameRequired: "Last name required",
    lastNameMinLength: "Last name must be at least 2 characters",
    emailRequired: "Email required",
    emailInvalid: "Valid email required", 
    phoneInvalid: "Valid phone required",
    
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
    partySizeMax: "Maximal 20 Personen",
    
    // Step 2: Table Selection
    tableRequired: "Tisch erforderlich",
    
    // Step 3: Contact Information
    firstNameRequired: "Vorname erforderlich", 
    firstNameMinLength: "Vorname muss mindestens 2 Zeichen haben",
    lastNameRequired: "Nachname erforderlich",
    lastNameMinLength: "Nachname muss mindestens 2 Zeichen haben",
    emailRequired: "E-Mail erforderlich",
    emailInvalid: "Gültige E-Mail erforderlich",
    phoneInvalid: "Gültige Telefonnummer erforderlich",
    
    // Special Requirements
    occasionMax: "Maximal 100 Zeichen",
    dietaryNotesMax: "Maximal 300 Zeichen", 
    specialRequestsMax: "Maximal 500 Zeichen",
    
    // GDPR & Legal
    dataProcessingRequired: "Datenverarbeitung muss akzeptiert werden",
    privacyRequired: "Datenschutzerklärung muss akzeptiert werden",
    termsRequired: "AGBs müssen akzeptiert werden"
  }
}

// Individual step schemas following React Hook Form best practices
export const stepOneSchema = z.object({
  // Date & Time Selection
  date: z.string().min(1),
  time: z.string().min(1),
  partySize: z.number().int().min(1).max(20),
  preferredLocation: z.string().optional(),
})

export const stepTwoSchema = z.object({
  // Table Selection & Pre-order
  tableId: z.string().min(1),
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
  email: z.string().email(),
  phone: z.string().min(1).regex(/^[\+]?[0-9\s\-\(\)]{8,15}$/),
  
  // Special Requirements
  occasion: z.string().max(100).optional(),
  dietaryNotes: z.string().max(300).optional(),
  specialRequests: z.string().max(500).optional(),
})

export const stepFourSchema = z.object({
  // GDPR & Legal Consents 
  dataProcessingConsent: z.boolean().refine(val => val === true),
  emailConsent: z.boolean().default(true),
  marketingConsent: z.boolean().default(false),
})

// Combined schema for the complete form following best practices
export const professionalReservationSchema = z.object({
  stepOne: stepOneSchema,
  stepTwo: stepTwoSchema, 
  stepThree: stepThreeSchema,
  stepFour: stepFourSchema,
})

// Factory function for dynamic language-based validation
export const createProfessionalReservationSchema = (lang: Language = 'es') => {
  const messages = errorMessages[lang]
  
  return z.object({
    stepOne: z.object({
      date: z.string().min(1, messages.dateRequired),
      time: z.string().min(1, messages.timeRequired), 
      partySize: z.number()
        .int()
        .min(1, messages.partySizeMin)
        .max(20, messages.partySizeMax),
      preferredLocation: z.string().optional(),
    }),
    
    stepTwo: z.object({
      tableId: z.string().min(1, messages.tableRequired),
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
        .min(1, messages.emailRequired)
        .email(messages.emailInvalid),
      phone: z.string()
        .regex(/^[\+]?[0-9\s\-\(\)]{8,15}$/, messages.phoneInvalid)
        .optional().or(z.literal("")),
      
      occasion: z.string().max(100, messages.occasionMax).optional(),
      dietaryNotes: z.string().max(300, messages.dietaryNotesMax).optional(),
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

// Type exports for TypeScript integration
export type ProfessionalReservationFormData = z.infer<typeof professionalReservationSchema>
export type StepOneData = z.infer<typeof stepOneSchema>
export type StepTwoData = z.infer<typeof stepTwoSchema>  
export type StepThreeData = z.infer<typeof stepThreeSchema>
export type StepFourData = z.infer<typeof stepFourSchema>

// Export error messages for UI components
export { errorMessages }