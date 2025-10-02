import { z } from 'zod'

export const createMenuCategorySchema = z.object({
  name: z.string().min(1, 'Nombre de categoría es requerido').max(100),
  nameEn: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  icon: z.string().max(50).optional(),
})

export const updateMenuCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  icon: z.string().max(50).optional(),
})

export const createMenuItemSchema = z.object({
  categoryId: z.string().min(1, 'Categoría es requerida'),
  name: z.string().min(1, 'Nombre del plato es requerido').max(150),
  nameEn: z.string().max(150).optional(),
  description: z.string().min(1, 'Descripción es requerida').max(1000),
  descriptionEn: z.string().max(1000).optional(),
  price: z.number().min(0.01, 'Precio debe ser mayor que 0').max(999.99, 'Precio demasiado alto'),
  
  // Availability
  isAvailable: z.boolean().default(true),
  isSignature: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isSeasonalSpecial: z.boolean().default(false),
  availableFrom: z.coerce.date().optional(),
  availableTo: z.coerce.date().optional(),
  
  // EU 14 Allergens (mandatory for Spanish restaurants following EU regulation)
  containsGluten: z.boolean().default(false),
  containsMilk: z.boolean().default(false),
  containsEggs: z.boolean().default(false),
  containsNuts: z.boolean().default(false),
  containsFish: z.boolean().default(false),
  containsShellfish: z.boolean().default(false),
  containsSoy: z.boolean().default(false),
  containsCelery: z.boolean().default(false),
  containsMustard: z.boolean().default(false),
  containsSesame: z.boolean().default(false),
  containsSulfites: z.boolean().default(false),
  containsLupin: z.boolean().default(false),
  containsMollusks: z.boolean().default(false),
  containsPeanuts: z.boolean().default(false),
  
  // Dietary labels
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isLactoseFree: z.boolean().default(false),
  
  // Display
  displayOrder: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).max(5, 'Máximo 5 imágenes').default([]),
})

export const updateMenuItemSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1).optional(),
  name: z.string().min(1).max(150).optional(),
  nameEn: z.string().max(150).optional(),
  description: z.string().min(1).max(1000).optional(),
  descriptionEn: z.string().max(1000).optional(),
  price: z.number().min(0.01).max(999.99).optional(),
  
  // Availability
  isAvailable: z.boolean().optional(),
  isSignature: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isSeasonalSpecial: z.boolean().optional(),
  availableFrom: z.coerce.date().optional(),
  availableTo: z.coerce.date().optional(),
  
  // EU 14 Allergens
  containsGluten: z.boolean().optional(),
  containsMilk: z.boolean().optional(),
  containsEggs: z.boolean().optional(),
  containsNuts: z.boolean().optional(),
  containsFish: z.boolean().optional(),
  containsShellfish: z.boolean().optional(),
  containsSoy: z.boolean().optional(),
  containsCelery: z.boolean().optional(),
  containsMustard: z.boolean().optional(),
  containsSesame: z.boolean().optional(),
  containsSulfites: z.boolean().optional(),
  containsLupin: z.boolean().optional(),
  containsMollusks: z.boolean().optional(),
  containsPeanuts: z.boolean().optional(),
  
  // Dietary labels
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isLactoseFree: z.boolean().optional(),
  
  // Display
  displayOrder: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).max(5).optional(),
})

export const menuFilterSchema = z.object({
  categoryId: z.string().min(1).optional(),
  search: z.string().max(100).optional(),
  isAvailable: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  isOrganic: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  
  // Allergen exclusions
  excludeGluten: z.boolean().optional(),
  excludeMilk: z.boolean().optional(),
  excludeEggs: z.boolean().optional(),
  excludeNuts: z.boolean().optional(),
  excludeFish: z.boolean().optional(),
  excludeShellfish: z.boolean().optional(),
  excludeSoy: z.boolean().optional(),
  excludeCelery: z.boolean().optional(),
  excludeMustard: z.boolean().optional(),
  excludeSesame: z.boolean().optional(),
  excludeSulfites: z.boolean().optional(),
  excludeLupin: z.boolean().optional(),
  excludeMollusks: z.boolean().optional(),
  excludePeanuts: z.boolean().optional(),
})

export const bulkMenuUpdateSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1, 'Seleccionar al menos un plato'),
  updates: z.object({
    isAvailable: z.boolean().optional(),
    categoryId: z.string().min(1).optional(),
    price: z.number().min(0.01).max(999.99).optional(),
    displayOrder: z.number().int().min(0).optional(),
  }),
})

export const menuImportSchema = z.object({
  items: z.array(createMenuItemSchema).min(1, 'Al menos un plato requerido'),
  createCategories: z.boolean().default(false),
  updateExisting: z.boolean().default(false),
})

export type CreateMenuCategoryData = z.infer<typeof createMenuCategorySchema>
export type UpdateMenuCategoryData = z.infer<typeof updateMenuCategorySchema>
export type CreateMenuItemData = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemData = z.infer<typeof updateMenuItemSchema>
export type MenuFilterData = z.infer<typeof menuFilterSchema>
export type BulkMenuUpdateData = z.infer<typeof bulkMenuUpdateSchema>
export type MenuImportData = z.infer<typeof menuImportSchema>