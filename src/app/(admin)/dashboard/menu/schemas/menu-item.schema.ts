import { z } from 'zod'

// EU-14 Allergens based on actual database content
export const EU_14_ALLERGENS = [
  'Gluten',
  'Lácteos',
  'Huevos',
  'Pescado',
  'Crustáceos',
  'Moluscos',
  'Frutos secos',
  'Apio',
  'Mostaza',
  'Sésamo',
  'Sulfitos',
  'Altramuces',
  'Cacahuetes',
  'Frutos de cáscara tipo 2'
] as const

// Menu item schema matching the actual restaurante.menu_items table structure
export const menuItemSchema = z.object({
  // Basic item information (required fields in DB)
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(150, 'El nombre no puede exceder 150 caracteres'),

  nameEn: z.string()
    .max(150, 'El nombre en inglés no puede exceder 150 caracteres')
    .optional()
    .nullable(),

  description: z.string()
    .min(1, 'La descripción es requerida')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),

  descriptionEn: z.string()
    .max(1000, 'La descripción en inglés no puede exceder 1000 caracteres')
    .optional()
    .nullable(),

  // Price validation (numeric with 2 decimal places)
  price: z.number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(999.99, 'El precio no puede exceder 999.99€')
    .multipleOf(0.01, 'El precio debe tener máximo 2 decimales'),

  // Category reference (required in DB)
  categoryId: z.string()
    .min(1, 'La categoría es requerida'),

  // Availability and dietary flags (boolean fields in DB)
  isAvailable: z.boolean()
    .default(true),

  isVegetarian: z.boolean()
    .default(false),

  isVegan: z.boolean()
    .default(false),

  isGlutenFree: z.boolean()
    .default(false),

  isRecommended: z.boolean()
    .default(false),

  // Stock management (integer field in DB)
  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .max(9999, 'El stock no puede exceder 9999')
    .default(0),

  // Image URL (optional in DB)
  imageUrl: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .nullable(),

  // EU-14 Allergen IDs array (for junction table menu_item_allergens)
  allergenIds: z.array(z.string())
    .default([])
    .describe('IDs of allergens from the allergens table'),

  // Wine-specific fields (optional for wines)
  vintage: z.number()
    .int('El año debe ser un número entero')
    .min(1900, 'El año debe ser posterior a 1900')
    .max(2100, 'El año no puede ser futuro')
    .optional()
    .nullable(),

  alcoholContent: z.number()
    .min(0, 'El contenido de alcohol no puede ser negativo')
    .max(100, 'El contenido de alcohol no puede exceder 100%')
    .multipleOf(0.1, 'El contenido de alcohol debe tener máximo 1 decimal')
    .optional()
    .nullable(),

  glassPrice: z.number()
    .min(0.01, 'El precio por copa debe ser mayor a 0')
    .max(99.99, 'El precio por copa no puede exceder 99.99€')
    .multipleOf(0.01, 'El precio por copa debe tener máximo 2 decimales')
    .optional()
    .nullable(),

  isOrganic: z.boolean()
    .default(false),

  // Restaurant ID (required in DB, will be set automatically)
  restaurantId: z.string()
    .optional() // Will be set by backend
})

// Schema for creating new menu items (excludes auto-generated fields)
export const createMenuItemSchema = menuItemSchema.omit({
  restaurantId: true
}).extend({
  // Ensure required form fields are properly typed
  isAvailable: z.boolean(),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  isGlutenFree: z.boolean(),
  isRecommended: z.boolean(),
  stock: z.number(),
  allergenIds: z.array(z.string())
})

// Schema for updating menu items (all fields optional except ID)
export const updateMenuItemSchema = menuItemSchema.partial().extend({
  id: z.string().min(1, 'ID es requerido para actualización')
})

// Allergen display schema (for UI components)
export const allergenSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
})

// Menu item with allergens populated (for display)
export const menuItemWithAllergensSchema = menuItemSchema.extend({
  id: z.string(),
  allergens: z.array(allergenSchema).default([]),
  category: z.object({
    id: z.string(),
    name: z.string(),
    nameEn: z.string().nullable().optional(),
    type: z.enum(['FOOD', 'WINE', 'BEVERAGE'])
  }).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
})

// Form data type for React Hook Form
export type MenuItemFormData = z.infer<typeof createMenuItemSchema>
export type MenuItemWithAllergens = z.infer<typeof menuItemWithAllergensSchema>
export type AllergenData = z.infer<typeof allergenSchema>

// Validation helpers
export const validatePrice = (price: string): number | null => {
  const parsed = parseFloat(price)
  if (isNaN(parsed) || parsed < 0.01 || parsed > 999.99) {
    return null
  }
  return Math.round(parsed * 100) / 100 // Round to 2 decimal places
}

export const validateAllergens = (allergenIds: string[]): boolean => {
  return allergenIds.every(id => typeof id === 'string' && id.length > 0)
}

// Default values for forms
export const defaultMenuItemValues: MenuItemFormData = {
  name: '',
  nameEn: null,
  description: '',
  descriptionEn: null,
  price: 0,
  categoryId: '',
  isAvailable: true,
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isRecommended: false,
  stock: 0,
  imageUrl: null,
  allergenIds: [],
  vintage: null,
  alcoholContent: null,
  glassPrice: null,
  isOrganic: false
}