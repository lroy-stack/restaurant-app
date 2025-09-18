'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Wine,
  UtensilsCrossed,
  Star,
  Sparkles,
  ChefHat,
  Euro,
  Save,
  X,
  Search,
  FilterX
} from 'lucide-react'
import { toast } from 'sonner'
import { useMenuItems } from '../../hooks/use-menu-items'
import { useWinePairings } from '../../hooks/use-wine-pairings'
import {
  createWinePairingSchema,
  type WinePairingFormData,
  type WinePairingWithItems,
  SOMMELIER_TEMPLATES,
  PAIRING_STRENGTH_INDICATORS,
  defaultWinePairingValues
} from '../../schemas/wine-pairing.schema'
import { cn } from '@/lib/utils'

interface WinePairingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: WinePairingWithItems
  initialFoodItemId?: string
  initialWineItemId?: string
  mode?: 'create' | 'edit'
}

export function WinePairingForm({
  onSuccess,
  onCancel,
  initialData,
  initialFoodItemId,
  initialWineItemId,
  mode = 'create'
}: WinePairingFormProps) {
  // Get menu items filtered by type
  const {
    menuItems: allItems,
    loading: itemsLoading
  } = useMenuItems({})

  const { createPairing, updatePairing, loading: creatingPairing, pairings } = useWinePairings()

  // Filter items by category type
  const foodItems = allItems.filter(item => item.category?.type === 'FOOD' && item.isAvailable)
  const wineItems = allItems.filter(item => item.category?.type === 'WINE' && item.isAvailable)

  // React Hook Form setup following Context7 patterns
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm<WinePairingFormData>({
    resolver: zodResolver(createWinePairingSchema),
    defaultValues: {
      ...defaultWinePairingValues,
      foodItemId: initialData?.foodItemId || initialFoodItemId || '',
      wineItemId: initialData?.wineItemId || initialWineItemId || '',
      description: initialData?.description || ''
    }
  })

  const selectedFoodItemId = watch('foodItemId')
  const selectedWineItemId = watch('wineItemId')

  // Get selected items for display
  const selectedFood = foodItems.find(item => item.id === selectedFoodItemId)
  const selectedWine = wineItems.find(item => item.id === selectedWineItemId)

  // Check for duplicates
  const isDuplicate = selectedFood && selectedWine && pairings.some(p =>
    p.foodItemId === selectedFoodItemId && p.wineItemId === selectedWineItemId
  )

  // Generate description suggestion based on template selection
  const applyTemplate = (templateIndex: number) => {
    if (!selectedFood || !selectedWine) {
      toast.info('Selecciona primero un plato y un vino')
      return
    }

    const template = SOMMELIER_TEMPLATES[templateIndex]
    const suggestion = template
      .replace('{food}', selectedFood.name.toLowerCase())
      .replace('{wine}', selectedWine.name)

    setValue('description', suggestion)
    toast.success('Template aplicado exitosamente')
  }

  // Form submission
  const onSubmit = async (data: WinePairingFormData) => {
    try {
      const success = mode === 'edit' && initialData
        ? await updatePairing(initialData.id, data)
        : await createPairing(data)

      if (success) {
        reset()
        onSuccess?.()
      }
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} pairing:`, error)
      toast.error(`Error inesperado al ${mode === 'edit' ? 'actualizar' : 'crear'} el maridaje`)
    }
  }

  // Form cancellation
  const handleCancel = () => {
    reset()
    onCancel?.()
  }

  return (
    <div className="w-full space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Food Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="foodItemId" className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Plato Principal
            </Label>
            <Controller
              name="foodItemId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plato de la carta" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {itemsLoading ? (
                      <SelectItem value="loading" disabled>Cargando platos...</SelectItem>
                    ) : foodItems.length === 0 ? (
                      <SelectItem value="no-foods" disabled>No hay platos disponibles</SelectItem>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {foodItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.category?.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.foodItemId && (
              <p className="text-sm text-destructive">{errors.foodItemId.message}</p>
            )}
          </div>

          {/* Wine Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="wineItemId" className="flex items-center gap-2">
              <Wine className="w-4 h-4" />
              Vino de Maridaje
            </Label>
            <Controller
              name="wineItemId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vino de la carta" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {itemsLoading ? (
                      <SelectItem value="loading" disabled>Cargando vinos...</SelectItem>
                    ) : wineItems.length === 0 ? (
                      <SelectItem value="no-wines" disabled>No hay vinos disponibles</SelectItem>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {wineItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.category?.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.wineItemId && (
              <p className="text-sm text-destructive">{errors.wineItemId.message}</p>
            )}
          </div>

          {/* Enhanced Pairing Preview */}
          {selectedFood && selectedWine && (
            <div className={`rounded-lg p-4 border ${
              isDuplicate
                ? 'bg-destructive/10 border-destructive/30'
                : 'bg-gradient-to-r from-[#9FB289]/10 to-[#CB5910]/10 border-primary/20'
            }`}>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">Maridaje Seleccionado:</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-[#9FB289]" />
                    <span className="font-medium">{selectedFood.name}</span>
                  </div>
                  <div className="text-muted-foreground">+</div>
                  <div className="flex items-center gap-2">
                    <Wine className="w-4 h-4 text-[#CB5910]" />
                    <span className="font-medium">{selectedWine.name}</span>
                  </div>
                </div>

                {isDuplicate && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>⚠️ Este maridaje ya existe en el sistema</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Descripción del Maridaje</Label>
              {selectedFood && selectedWine && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Templates:</span>
                  <div className="flex gap-1">
                    {SOMMELIER_TEMPLATES.map((template, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(index)}
                        className="text-xs px-2 h-7"
                        title={`Template ${index + 1}: ${template.slice(0, 50)}...`}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Textarea
              {...register('description')}
              placeholder="Describe por qué este vino marida perfectamente con el plato seleccionado. Menciona notas de sabor, textura, y la experiencia gastronómica..."
              rows={4}
              className="resize-none"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}

            {/* Template Preview */}
            {selectedFood && selectedWine && (
              <div className="bg-muted/50 rounded-lg p-3">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">
                  <ChefHat className="w-3 h-3 inline mr-1" />
                  Templates Disponibles:
                </h5>
                <div className="grid gap-2 text-xs">
                  {SOMMELIER_TEMPLATES.map((template, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded border bg-card/50">
                      <span className="font-mono text-primary min-w-[1.5rem]">{index + 1}.</span>
                      <p className="text-muted-foreground leading-relaxed">
                        {template
                          .replace('{food}', selectedFood.name.toLowerCase())
                          .replace('{wine}', selectedWine.name)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Consejo: Una buena descripción incluye notas sobre sabores, texturas, y por qué la combinación funciona.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || creatingPairing}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || creatingPairing || itemsLoading}
            >
              {creatingPairing
                ? (mode === 'edit' ? 'Actualizando Maridaje...' : 'Creando Maridaje...')
                : (mode === 'edit' ? 'Actualizar Maridaje' : 'Crear Maridaje')
              }
            </Button>
          </div>
        </form>
    </div>
  )
}