'use client'

import { useForm } from 'react-hook-form'
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
import { Tag, UtensilsCrossed, Wine, Coffee } from 'lucide-react'
import { toast } from 'sonner'
import { useCategories } from '../../hooks/use-categories'
import {
  createCategorySchema,
  type CategoryFormData,
  defaultCategoryValues,
  CATEGORY_TYPE_LABELS,
  CATEGORY_TYPES
} from '../../schemas/category.schema'

interface CategoryFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: Partial<CategoryFormData>
}

// Get icon for category type
const getCategoryIcon = (type: string) => {
  switch (type) {
    case 'FOOD':
      return UtensilsCrossed
    case 'WINE':
      return Wine
    case 'BEVERAGE':
      return Coffee
    default:
      return Tag
  }
}

export function CategoryForm({
  onSuccess,
  onCancel,
  initialData
}: CategoryFormProps) {
  const { createCategory, loading: creatingCategory } = useCategories()

  // React Hook Form setup
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      ...defaultCategoryValues,
      ...initialData
    }
  })

  const watchedType = form.watch('type')
  const CategoryIcon = getCategoryIcon(watchedType)

  // Form submission
  const onSubmit = async (data: CategoryFormData) => {
    try {
      const success = await createCategory(data)
      if (success) {
        form.reset()
        onSuccess?.()
        toast.success(`Categoría "${data.name}" creada exitosamente`)
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Error inesperado al crear la categoría')
    }
  }

  // Form cancellation
  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#237584]" />
          Nueva Categoría del Menú
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Crea una nueva categoría para organizar los elementos del menú
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Category Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4" />
                    Tipo de Categoría
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_TYPES.map((type) => {
                        const Icon = getCategoryIcon(type)
                        return (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {CATEGORY_TYPE_LABELS[type]}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Categoría *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Entrantes, Vinos Tintos, Cócteles..."
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
                  <FormLabel>Nombre en Inglés (Opcional)</FormLabel>
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

            {/* Display Order */}
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden de Visualización</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Número para ordenar las categorías (0 = primera posición)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado Activo</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Las categorías inactivas no se muestran en el menú público
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

            {/* Category Preview */}
            <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Vista Previa:</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-5 h-5 text-[#237584]" />
                  <span className="font-medium">
                    {form.watch('name') || 'Nombre de la categoría'}
                  </span>
                  {form.watch('nameEn') && (
                    <span className="text-sm text-muted-foreground">
                      ({form.watch('nameEn')})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs bg-[#237584]/10 text-[#237584] px-2 py-1 rounded">
                    {CATEGORY_TYPE_LABELS[watchedType]}
                  </span>
                  {!form.watch('isActive') && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      Inactiva
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={form.formState.isSubmitting || creatingCategory}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || creatingCategory}
              >
                {creatingCategory ? 'Creando Categoría...' : 'Crear Categoría'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}