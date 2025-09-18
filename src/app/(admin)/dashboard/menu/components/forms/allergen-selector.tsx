'use client'

import { useState, useEffect, useMemo } from 'react'
import { Control, useWatch } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Search,
  Wheat,
  Milk,
  Egg,
  Fish,
  Shell,
  Nut,
  Leaf,
  Apple,
  Grape
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MenuItemFormData } from '../../schemas/menu-item.schema'
import { useAllergens } from '../../hooks/use-allergens'

interface AllergenSelectorProps {
  control: Control<MenuItemFormData>
}

// Modern allergen mapping with clean icons
const ALLERGEN_ICONS = {
  'Gluten': Wheat,
  'Lácteos': Milk,
  'Huevos': Egg,
  'Pescado': Fish,
  'Crustáceos': Shell,
  'Moluscos': Shell,
  'Frutos secos': Nut,
  'Cacahuetes': Nut,
  'Apio': Leaf,
  'Mostaza': Leaf,
  'Sésamo': Apple,
  'Sulfitos': Grape,
  'Altramuces': Leaf,
  'Frutos de cáscara tipo 2': Nut
}

export function AllergenSelector({ control }: AllergenSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Use allergens hook
  const { allergens, loading } = useAllergens()

  // Watch the selected allergen IDs
  const watchedAllergenIds = useWatch({ control, name: 'allergenIds' })
  const selectedAllergenIds = useMemo(() => watchedAllergenIds || [], [watchedAllergenIds])

  // Filter allergens based on search term
  const filteredAllergens = useMemo(() =>
    allergens.filter(allergen =>
      allergen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergen.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allergens, searchTerm]
  )

  const getAllergenIcon = (allergenName: string) => {
    return ALLERGEN_ICONS[allergenName as keyof typeof ALLERGEN_ICONS] || AlertTriangle
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Alérgenos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Alérgenos</CardTitle>
          {watchedAllergenIds && watchedAllergenIds.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {watchedAllergenIds.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Search - Solo en mobile si hay muchos */}
        {allergens.length > 8 && (
          <div className="relative md:hidden">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        )}

        {/* Compact Allergen Grid */}
        <FormField
          control={control}
          name="allergenIds"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {filteredAllergens.map((allergen) => {
                  const IconComponent = getAllergenIcon(allergen.name)
                  const isChecked = (field.value || []).includes(allergen.id)

                  return (
                    <div
                      key={allergen.id}
                      className={cn(
                        "relative border rounded-md p-2 transition-all duration-200 cursor-pointer",
                        "hover:shadow-md hover:scale-[1.02]",
                        isChecked
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-primary/30"
                      )}
                      onClick={() => {
                        const currentValue = field.value || []
                        const updatedValue = isChecked
                          ? currentValue.filter((value) => value !== allergen.id)
                          : [...currentValue, allergen.id]
                        field.onChange(updatedValue)
                      }}
                    >
                      <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center justify-center">
                          <IconComponent
                            className={cn(
                              "h-4 w-4",
                              isChecked ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <FormLabel className={cn(
                          "text-xs leading-tight cursor-pointer",
                          isChecked ? "text-primary font-semibold" : "text-foreground"
                        )}>
                          {allergen.name}
                        </FormLabel>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredAllergens.length === 0 && searchTerm && (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Sin resultados</p>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}