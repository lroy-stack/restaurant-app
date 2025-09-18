import { z } from 'zod'

// Wine pairing schema matching the actual restaurante.wine_pairings table structure
export const winePairingSchema = z.object({
  // Food item reference (required in DB)
  foodItemId: z.string()
    .min(1, 'El elemento de comida es requerido'),

  // Wine item reference (required in DB)
  wineItemId: z.string()
    .min(1, 'El vino es requerido'),

  // Sommelier description (optional in DB)
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable()
})

// Schema for creating new wine pairings
export const createWinePairingSchema = winePairingSchema.extend({
  description: z.string()
    .min(1, 'La descripción del maridaje es requerida')
    .max(500, 'La descripción no puede exceder 500 caracteres')
})

// Schema for updating wine pairings (all fields optional except ID)
export const updateWinePairingSchema = winePairingSchema.partial().extend({
  id: z.string().min(1, 'ID es requerido para actualización')
})

// Wine pairing with populated items (for display)
export const winePairingWithItemsSchema = winePairingSchema.extend({
  id: z.string(),
  foodItem: z.object({
    id: z.string(),
    name: z.string(),
    nameEn: z.string().nullable().optional(),
    price: z.number(),
    categoryId: z.string(),
    category: z.object({
      name: z.string(),
      type: z.literal('FOOD')
    }).optional()
  }),
  wineItem: z.object({
    id: z.string(),
    name: z.string(),
    nameEn: z.string().nullable().optional(),
    price: z.number(),
    categoryId: z.string(),
    category: z.object({
      name: z.string(),
      type: z.literal('WINE')
    }).optional()
  })
})

// Bulk pairing operations schema
export const bulkWinePairingSchema = z.object({
  foodItemId: z.string().min(1, 'El elemento de comida es requerido'),
  winePairings: z.array(z.object({
    wineItemId: z.string().min(1, 'El vino es requerido'),
    description: z.string().min(1, 'La descripción es requerida').max(500)
  })).min(1, 'Debe haber al menos un maridaje').max(10, 'Máximo 10 maridajes por elemento')
})

// Wine pairing statistics schema
export const winePairingStatsSchema = z.object({
  totalPairings: z.number().int().min(0),
  pairingsPerFoodItem: z.number().min(0),
  pairingsPerWineItem: z.number().min(0),
  mostPairedFood: z.string().optional(),
  mostPairedWine: z.string().optional(),
  averagePairingsPerFood: z.number().min(0),
  foodItemsWithPairings: z.number().int().min(0),
  wineItemsWithPairings: z.number().int().min(0)
})

// Form data types for React Hook Form
export type WinePairingFormData = z.infer<typeof createWinePairingSchema>
export type WinePairingWithItems = z.infer<typeof winePairingWithItemsSchema>
export type BulkWinePairingData = z.infer<typeof bulkWinePairingSchema>
export type WinePairingStats = z.infer<typeof winePairingStatsSchema>

// Validation helpers
export const validatePairingUniqueness = (
  foodItemId: string,
  wineItemId: string,
  existingPairings: WinePairingWithItems[]
): boolean => {
  return !existingPairings.some(
    pairing => pairing.foodItemId === foodItemId && pairing.wineItemId === wineItemId
  )
}

export const validateSommelierDescription = (description: string): boolean => {
  if (!description || description.trim().length === 0) return false

  // Check for basic sommelier terminology
  const sommelierTerms = [
    'maridaje', 'acompaña', 'combina', 'realza', 'equilibra',
    'complementa', 'contrasta', 'armoniza', 'notas', 'sabores',
    'taninos', 'acidez', 'cuerpo', 'bouquet', 'aroma'
  ]

  const lowerDescription = description.toLowerCase()
  return sommelierTerms.some(term => lowerDescription.includes(term))
}

// Default values for forms
export const defaultWinePairingValues: Partial<WinePairingFormData> = {
  foodItemId: '',
  wineItemId: '',
  description: ''
}

// Pairing strength indicators for UI
export const PAIRING_STRENGTH_INDICATORS = {
  EXCELLENT: { label: 'Excelente', color: 'text-green-600', icon: '★★★' },
  GOOD: { label: 'Bueno', color: 'text-blue-600', icon: '★★☆' },
  FAIR: { label: 'Aceptable', color: 'text-yellow-600', icon: '★☆☆' }
} as const

// Common sommelier description templates
export const SOMMELIER_TEMPLATES = [
  'Este vino {wine} acompaña perfectamente el {food}, creando un maridaje equilibrado que realza los sabores de ambos.',
  'La acidez del {wine} complementa las notas del {food}, proporcionando un contraste armonioso.',
  'Los taninos suaves del {wine} equilibran la textura del {food}, generando una experiencia gastronómica excepcional.',
  'El cuerpo del {wine} y los sabores del {food} se combinan para crear un maridaje clásico y elegante.'
] as const