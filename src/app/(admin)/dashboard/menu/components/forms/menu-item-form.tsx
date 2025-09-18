'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  UtensilsCrossed,
  Euro,
  Globe,
  Eye,
  Leaf,
  Heart,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { useMenuItems } from '../../hooks/use-menu-items'
import { useCategories } from '../../hooks/use-categories'
import { useAllergens } from '../../hooks/use-allergens'
import { AllergenSelector } from './allergen-selector'
import {
  createMenuItemSchema,
  type MenuItemFormData,
  defaultMenuItemValues
} from '../../schemas/menu-item.schema'

interface MenuItemFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: Partial<MenuItemFormData>
  preselectedCategoryId?: string
}

export function MenuItemForm({
  onSuccess,
  onCancel,
  initialData,
  preselectedCategoryId
}: MenuItemFormProps) {
  // Data and operations
  const { createItem, loading: creatingItem } = useMenuItems({})
  const { categories, loading: categoriesLoading } = useCategories()
  const { allergens, loading: allergensLoading } = useAllergens()

  // React Hook Form setup
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(createMenuItemSchema),
    defaultValues: {
      ...defaultMenuItemValues,
      ...initialData,
      categoryId: preselectedCategoryId || initialData?.categoryId || ''
    }
  })

  const watchedValues = {
    name: form.watch('name'),
    price: form.watch('price'),
    categoryId: form.watch('categoryId'),
    isVegetarian: form.watch('isVegetarian'),
    isVegan: form.watch('isVegan'),
    isGlutenFree: form.watch('isGlutenFree'),
    isAvailable: form.watch('isAvailable')
  }

  // Get selected category
  const selectedCategory = categories.find(cat => cat.id === watchedValues.categoryId)

  // Form submission
  const onSubmit = async (data: MenuItemFormData) => {
    try {
      const success = await createItem(data)
      if (success) {
        form.reset()
        onSuccess?.()
        toast.success(`Elemento "${data.name}" creado exitosamente`)
      }
    } catch (error) {
      console.error('Error creating menu item:', error)
      toast.error('Error inesperado al crear el elemento del menú')
    }
  }

  // Form cancellation
  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-green-600" />
          Nuevo Elemento del Menú
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Agrega un nuevo plato, vino o bebida al menú del restaurante
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Información Básica</h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Selection */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={categoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>Cargando categorías...</SelectItem>
                          ) : categories.length === 0 ? (
                            <SelectItem value="no-categories" disabled>No hay categorías disponibles</SelectItem>
                          ) : (
                            categories
                              .filter(cat => cat.isActive)
                              .map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{category.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {category.type}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        Precio *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999.99"
                            placeholder="0.00"
                            className="pr-8"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            €
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Item Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Elemento *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Paella Valenciana, Rioja Reserva, Sangría..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* English Name */}
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Nombre en Inglés (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="English name for international menu"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe los ingredientes, preparación, origen, notas de cata..."
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* English Description */}
              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Descripción en Inglés (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="English description for international guests"
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dietary & Allergen Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Información Dietética y Alérgenos</h3>
                <Separator className="flex-1" />
              </div>

              {/* Dietary Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="isVegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-600" />
                          Vegetariano
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Sin carne ni pescado
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
                  name="isVegan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-green-700" />
                          Vegano
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Sin ingredientes de origen animal
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          Sin Gluten
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Apto para celíacos
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

              {/* Allergen Selection */}
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                  Alérgenos (EU-14)
                </label>
                <AllergenSelector
                  control={form.control}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Selecciona todos los alérgenos presentes en este elemento
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Configuración</h3>
                <Separator className="flex-1" />
              </div>

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        Elemento Disponible
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Los elementos no disponibles se ocultan del menú público pero permanecen en el sistema
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

            {/* Preview */}
            {watchedValues.name && (
              <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Vista Previa:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{watchedValues.name}</h5>
                      {selectedCategory && (
                        <p className="text-sm text-muted-foreground">
                          {selectedCategory.name} • {selectedCategory.type}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">€{(watchedValues.price || 0).toFixed(2)}</div>
                      {!watchedValues.isAvailable && (
                        <Badge variant="secondary" className="text-xs">No disponible</Badge>
                      )}
                    </div>
                  </div>

                  {(watchedValues.isVegetarian || watchedValues.isVegan || watchedValues.isGlutenFree) && (
                    <div className="flex gap-1 flex-wrap">
                      {watchedValues.isVegan && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Heart className="w-3 h-3 mr-1" />
                          Vegano
                        </Badge>
                      )}
                      {watchedValues.isVegetarian && !watchedValues.isVegan && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Leaf className="w-3 h-3 mr-1" />
                          Vegetariano
                        </Badge>
                      )}
                      {watchedValues.isGlutenFree && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Sin Gluten
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={form.formState.isSubmitting || creatingItem}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || creatingItem || categoriesLoading}
              >
                {creatingItem ? 'Creando Elemento...' : 'Crear Elemento del Menú'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}