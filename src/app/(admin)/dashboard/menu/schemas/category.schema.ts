import { z } from 'zod'

// Category types from the actual database enum
export const CATEGORY_TYPES = ['FOOD', 'WINE', 'BEVERAGE'] as const

// Category schema matching the actual restaurante.menu_categories table structure
export const categorySchema = z.object({
  // Basic category information (required fields in DB)
  name: z.string()
    .min(1, 'El nombre de la categoría es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  nameEn: z.string()
    .max(100, 'El nombre en inglés no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  // Category type (enum in DB)
  type: z.enum(CATEGORY_TYPES, {
    required_error: 'El tipo de categoría es requerido',
    invalid_type_error: 'Tipo de categoría inválido'
  }),

  // Display order (integer in DB, default 0)
  order: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .default(0),

  // Active status (boolean in DB, default true)
  isActive: z.boolean()
    .default(true),

  // Restaurant ID (required in DB, will be set automatically)
  restaurantId: z.string()
    .optional() // Will be set by backend
})

// Schema for creating new categories (excludes auto-generated fields)
export const createCategorySchema = categorySchema.omit({
  restaurantId: true
})

// Schema for updating categories (all fields optional except ID)
export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().min(1, 'ID es requerido para actualización')
})

// Schema for reordering categories (drag and drop)
export const reorderCategoriesSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0)
  })).min(1, 'Debe haber al menos una categoría para reordenar')
})

// Category with menu items count (for display)
export const categoryWithStatsSchema = categorySchema.extend({
  id: z.string(),
  itemCount: z.number().int().min(0).default(0),
  availableItemCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
})

// Form data types for React Hook Form
export type CategoryFormData = z.infer<typeof createCategorySchema>
export type CategoryWithStats = z.infer<typeof categoryWithStatsSchema>
export type ReorderCategoriesData = z.infer<typeof reorderCategoriesSchema>

// Category type labels for UI
export const CATEGORY_TYPE_LABELS = {
  FOOD: 'Comida',
  WINE: 'Vino',
  BEVERAGE: 'Bebida'
} as const

export const CATEGORY_TYPE_COLORS = {
  FOOD: 'bg-green-100 text-green-800',
  WINE: 'bg-purple-100 text-purple-800',
  BEVERAGE: 'bg-blue-100 text-blue-800'
} as const

// Validation helpers
export const validateCategoryOrder = (categories: CategoryWithStats[]): boolean => {
  const orders = categories.map(c => c.order)
  const uniqueOrders = new Set(orders)
  return orders.length === uniqueOrders.size // No duplicate orders
}

export const getNextCategoryOrder = (categories: CategoryWithStats[], type: typeof CATEGORY_TYPES[number]): number => {
  const categoriesOfType = categories.filter(c => c.type === type)
  if (categoriesOfType.length === 0) return 1

  const maxOrder = Math.max(...categoriesOfType.map(c => c.order))
  return maxOrder + 1
}

// Default values for forms
export const defaultCategoryValues: Partial<CategoryFormData> = {
  name: '',
  nameEn: '',
  type: 'FOOD',
  order: 0,
  isActive: true
}

// Category filters for UI
export const CATEGORY_FILTERS = [
  { value: 'all', label: 'Todas las Categorías' },
  { value: 'FOOD', label: 'Comida' },
  { value: 'WINE', label: 'Vinos' },
  { value: 'BEVERAGE', label: 'Bebidas' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' }
] as const