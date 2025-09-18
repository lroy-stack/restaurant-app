'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, Euro, Globe, Leaf, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useMenuItems } from '../../hooks/use-menu-items'
import { useCategories } from '../../hooks/use-categories'
import { useAllergens } from '../../hooks/use-allergens'
import { AllergenSelector } from './allergen-selector'
import { cn } from '@/lib/utils'
import {
  createMenuItemSchema,
  type MenuItemFormData,
  defaultMenuItemValues
} from '../../schemas/menu-item.schema'

interface WorkingMenuItemFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: any  // Can be MenuItemWithAllergens or MenuItemFormData
  preselectedCategoryId?: string
  mode?: 'create' | 'edit'
}

export function WorkingMenuItemForm({
  onSuccess,
  onCancel,
  initialData,
  preselectedCategoryId,
  mode = 'create'
}: WorkingMenuItemFormProps) {
  // Data and operations
  const { createItem, updateItem, loading: creatingItem } = useMenuItems({})
  const { categories, loading: categoriesLoading } = useCategories()
  const { allergens, loading: allergensLoading } = useAllergens()

  // Transform initialData if it has allergens array instead of allergenIds
  const transformedInitialData = useMemo(() => {
    if (!initialData) return {}

    // If initialData has allergens array (from MenuItemWithAllergens)
    if (initialData.allergens && Array.isArray(initialData.allergens)) {
      const { allergens, ...rest } = initialData
      return {
        ...rest,
        allergenIds: allergens.map((allergen: any) => allergen.id)
      }
    }

    // Otherwise use as-is (already has allergenIds)
    return initialData
  }, [initialData])

  // React Hook Form setup
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(createMenuItemSchema),
    defaultValues: {
      ...defaultMenuItemValues,
      ...transformedInitialData,
      categoryId: preselectedCategoryId || transformedInitialData?.categoryId || ''
    }
  })

  const watchedValues = {
    name: form.watch('name'),
    price: form.watch('price'),
    categoryId: form.watch('categoryId'),
    isVegetarian: form.watch('isVegetarian'),
    isVegan: form.watch('isVegan'),
    isGlutenFree: form.watch('isGlutenFree'),
    isRecommended: form.watch('isRecommended'),
    stock: form.watch('stock'),
    isAvailable: form.watch('isAvailable')
  }

  // Get selected category
  const selectedCategory = categories.find(cat => cat.id === watchedValues.categoryId)

  // Form submission
  const onSubmit = async (data: MenuItemFormData) => {
    try {
      let success = false

      if (mode === 'edit' && initialData?.id) {
        success = await updateItem(initialData.id, data)
        if (success) {
          onSuccess?.()
          toast.success(`Elemento "${data.name}" actualizado exitosamente`)
        }
      } else {
        success = await createItem(data)
        if (success) {
          form.reset()
          onSuccess?.()
          toast.success(`Elemento "${data.name}" creado exitosamente`)
        }
      }
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} menu item:`, error)
      toast.error(`Error inesperado al ${mode === 'edit' ? 'actualizar' : 'crear'} el elemento del menú`)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Elemento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Paella Valenciana" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        Nombre en Inglés
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g: Valencian Paella"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el elemento del menú..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Descripción en Inglés
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the menu item in English..."
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Category and Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categoría y Precio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="loading" disabled>Cargando...</SelectItem>
                            ) : categories.length === 0 ? (
                              <SelectItem value="no-categories" disabled>No hay categorías disponibles</SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name} ({category.type})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio (€) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#237584] rounded-full" />
                        Stock Disponible *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={
                            selectedCategory?.type === 'WINE' ? '20 (default vinos)' :
                            selectedCategory?.type === 'FOOD' ? '30 (default platos)' :
                            selectedCategory?.type === 'BEVERAGE' ? '50 (default bebidas)' : '0'
                          }
                          min="0"
                          max="9999"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            field.onChange(value)
                          }}
                          className={`${
                            watchedValues.stock === 0
                              ? 'border-destructive/50 focus-visible:ring-destructive'
                              : watchedValues.stock < 10
                                ? 'border-[#CB5910]/50 focus-visible:ring-[#CB5910]'
                                : 'border-[#9FB289]/50 focus-visible:ring-[#9FB289]'
                          }`}
                        />
                      </FormControl>
                      {selectedCategory && (
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              watchedValues.stock === 0 ? "bg-destructive" :
                              watchedValues.stock < 10 ? "bg-[#CB5910]" : "bg-[#9FB289]"
                            )} />
                            {watchedValues.stock === 0 ? "Sin stock" :
                             watchedValues.stock < 10 ? "Stock bajo" : "Disponible"}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-xs h-6 px-2"
                            onClick={() => {
                              const defaultStock =
                                selectedCategory.type === 'WINE' ? 20 :
                                selectedCategory.type === 'FOOD' ? 30 :
                                selectedCategory.type === 'BEVERAGE' ? 50 : 0
                              form.setValue('stock', defaultStock)
                            }}
                          >
                            Auto ({
                              selectedCategory.type === 'WINE' ? '20' :
                              selectedCategory.type === 'FOOD' ? '30' :
                              selectedCategory.type === 'BEVERAGE' ? '50' : '0'
                            })
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
          </Card>

          {/* Dietary and Availability Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Opciones y Disponibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Disponible</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            El elemento está disponible para pedidos
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isVegetarian"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Vegetariano</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            No contiene carne ni pescado
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRecommended"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Item Destacado
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Marcar como item recomendado/destacado
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isVegan"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Vegano</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            No contiene productos de origen animal
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isGlutenFree"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Sin Gluten</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            No contiene gluten
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Allergens Section */}
              <AllergenSelector
                control={form.control}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={creatingItem}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={creatingItem || !watchedValues.name || !watchedValues.categoryId}
            >
              {creatingItem
                ? (mode === 'edit' ? 'Actualizando...' : 'Creando...')
                : (mode === 'edit' ? 'Actualizar Elemento' : 'Crear Elemento')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}