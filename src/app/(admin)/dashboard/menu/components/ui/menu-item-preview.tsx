'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  UtensilsCrossed,
  Wine,
  Coffee,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Euro,
  Globe,
  Tag
} from 'lucide-react'
import { AllergenInfo } from './allergen-badges'
import { MenuItemWithAllergens } from '../../schemas/menu-item.schema'

interface MenuItemPreviewProps {
  item: MenuItemWithAllergens
  showImage?: boolean
  showDescription?: boolean
  showPricing?: boolean
  showAllergens?: boolean
  showActions?: boolean
  variant?: 'card' | 'compact' | 'detailed'
  onEdit?: (item: MenuItemWithAllergens) => void
  onDelete?: (item: MenuItemWithAllergens) => void
  onToggleAvailability?: (id: string, isAvailable: boolean) => void
  className?: string
}

// Get category icon based on type
const getCategoryIcon = (type?: string) => {
  switch (type) {
    case 'FOOD':
      return UtensilsCrossed
    case 'WINE':
      return Wine
    case 'BEVERAGE':
      return Coffee
    default:
      return UtensilsCrossed
  }
}

// Get category color based on type
const getCategoryColor = (type?: string) => {
  switch (type) {
    case 'FOOD':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'WINE':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'BEVERAGE':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function MenuItemPreview({
  item,
  showImage = true,
  showDescription = true,
  showPricing = true,
  showAllergens = true,
  showActions = false,
  variant = 'card',
  onEdit,
  onDelete,
  onToggleAvailability,
  className = ''
}: MenuItemPreviewProps) {
  const CategoryIcon = getCategoryIcon(item.category?.type)
  const categoryColorClass = getCategoryColor(item.category?.type)

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${className}`}>
        {/* Category Icon */}
        <div className={`p-2 rounded-md ${categoryColorClass}`}>
          <CategoryIcon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{item.name}</h4>
            {!item.isAvailable && (
              <Badge variant="secondary" className="text-xs">
                No disponible
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground truncate">
              {item.category?.name}
            </span>
            {showPricing && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium text-sm">€{item.price.toFixed(2)}</span>
              </>
            )}
          </div>

          {showAllergens && (
            <div className="mt-2">
              <AllergenInfo
                allergens={item.allergens}
                isVegetarian={item.isVegetarian}
                isVegan={item.isVegan}
                isGlutenFree={item.isGlutenFree}
                size="sm"
                maxVisible={3}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1">
            {onToggleAvailability && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                className="h-8 w-8 p-0"
              >
                {item.isAvailable ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Detailed variant for full information display
  if (variant === 'detailed') {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CategoryIcon className={`w-5 h-5 ${categoryColorClass.split(' ')[0]}`} />
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.nameEn && (
                  <Badge variant="outline" className="text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    {item.nameEn}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={categoryColorClass}>
                  <Tag className="w-3 h-3 mr-1" />
                  {item.category?.name || 'Sin categoría'}
                </Badge>
                <Badge variant={item.isAvailable ? 'default' : 'destructive'}>
                  {item.isAvailable ? 'Disponible' : 'No disponible'}
                </Badge>
              </div>
            </div>

            {showPricing && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold">
                  <Euro className="w-5 h-5" />
                  {item.price.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Precio de carta
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {showDescription && (item.description || item.descriptionEn) && (
            <div className="space-y-2">
              {item.description && (
                <div>
                  <h5 className="text-sm font-medium mb-1">Descripción</h5>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              )}
              {item.descriptionEn && item.descriptionEn !== item.description && (
                <div>
                  <h5 className="text-sm font-medium mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Description (EN)
                  </h5>
                  <p className="text-sm text-muted-foreground">{item.descriptionEn}</p>
                </div>
              )}
            </div>
          )}

          {/* Image */}
          {showImage && item.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Allergen Information */}
          {showAllergens && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium">Información Nutricional y Alérgenos</h5>
              <AllergenInfo
                allergens={item.allergens}
                isVegetarian={item.isVegetarian}
                isVegan={item.isVegan}
                isGlutenFree={item.isGlutenFree}
                layout="stacked"
                size="default"
                maxVisible={8}
              />
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {onToggleAvailability && (
                <Button
                  variant={item.isAvailable ? "outline" : "default"}
                  size="sm"
                  onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                  className="flex items-center gap-2"
                >
                  {item.isAvailable ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Mostrar
                    </>
                  )}
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(item)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default card variant
  return (
    <Card className={`w-full hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CategoryIcon className={`w-4 h-4 ${categoryColorClass.split(' ')[0]}`} />
              {item.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {item.category?.name || 'Sin categoría'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {showPricing && (
              <Badge variant="outline" className="font-mono">
                €{item.price.toFixed(2)}
              </Badge>
            )}
            <Badge variant={item.isAvailable ? 'default' : 'secondary'} className="text-xs">
              {item.isAvailable ? 'Disponible' : 'No disponible'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {showDescription && item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Allergen Info */}
        {showAllergens && (
          <AllergenInfo
            allergens={item.allergens}
            isVegetarian={item.isVegetarian}
            isVegan={item.isVegan}
            isGlutenFree={item.isGlutenFree}
            maxVisible={4}
          />
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex gap-1">
              {onToggleAvailability && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                  className="h-8 px-2"
                >
                  {item.isAvailable ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="h-8 px-2"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item)}
                className="h-8 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}