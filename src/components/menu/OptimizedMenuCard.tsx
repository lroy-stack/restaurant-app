'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Eye, ShoppingCart, Leaf, Wine, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AllergenInfo } from '@/app/(admin)/dashboard/menu/components/ui/allergen-badges'

interface OptimizedMenuCardProps {
  item: any
  category: any
  language: 'es' | 'en'
  onQuickView: () => void
  onAddToCart: () => void
  isInCart: boolean
  cartQuantity: number
  getItemDisplayName: (item: any) => string
  getItemDisplayDescription: (item: any) => string
  allergens: any[]
}

export function OptimizedMenuCard({
  item,
  category,
  language,
  onQuickView,
  onAddToCart,
  isInCart,
  cartQuantity,
  getItemDisplayName,
  getItemDisplayDescription,
  allergens
}: OptimizedMenuCardProps) {

  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden",
        "border-border/50 hover:border-primary/30",
        "hover:shadow-lg transition-all duration-200",
        // Fixed height system
        "h-[280px] sm:h-[300px]"
      )}
    >
      {/* Grid Layout with Fixed Areas */}
      <div className="flex flex-col h-full">

        {/* HEADER: Price + Status Badges (Fixed: 48px) */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/30 min-h-[48px]">
          {/* Left: Featured Badge */}
          <div className="flex items-center gap-1.5">
            {item.isRecommended && (
              <div className="w-7 h-7 bg-accent/15 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-3.5 h-3.5 text-accent fill-current" />
              </div>
            )}
            {item.isOrganic && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-secondary/20 border-secondary/30">
                <Leaf className="w-3 h-3" />
              </Badge>
            )}
          </div>

          {/* Right: Price (Primary Focus) */}
          <div className="flex items-baseline gap-1.5">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              €{item.price}
            </div>
            {category.type === 'WINE' && item.glassPrice && (
              <div className="text-xs text-muted-foreground">
                / €{item.glassPrice}
              </div>
            )}
          </div>
        </div>

        {/* BODY: Content Area (Flex-1) */}
        <CardContent className="flex-1 flex flex-col px-3 sm:px-4 py-3 overflow-hidden">

          {/* TITLE: Fixed 2 lines (44px) */}
          <h3 className={cn(
            "font-semibold mb-2 leading-tight",
            "text-sm sm:text-base",
            "line-clamp-2",
            "min-h-[44px]",
            "group-hover:text-primary transition-colors"
          )}>
            {getItemDisplayName(item)}
          </h3>

          {/* DESCRIPTION: Fixed 3 lines (60px) */}
          <p className={cn(
            "text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3",
            "line-clamp-3",
            "min-h-[60px]"
          )}>
            {getItemDisplayDescription(item)}
          </p>

          {/* PAIRINGS: Collapsible Area (32px or 0) */}
          {category.type === 'FOOD' && item.winePairings && item.winePairings.length > 0 && (
            <div className="mb-2 px-2 py-1.5 bg-purple-50/50 dark:bg-purple-950/10 rounded-md border border-purple-200/40 dark:border-purple-800/40 min-h-[32px] flex items-center">
              <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 truncate w-full">
                <Wine className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate flex-1">{item.winePairings[0].wineItem.name}</span>
                <span className="text-purple-600 dark:text-purple-400 flex-shrink-0 font-bold">
                  €{item.winePairings[0].wineItem.price}
                </span>
              </div>
            </div>
          )}

          {category.type === 'WINE' && item.foodPairings && item.foodPairings.length > 0 && (
            <div className="mb-2 flex items-center gap-1.5 text-xs min-h-[32px]">
              <ChefHat className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-300 font-medium truncate">
                {item.foodPairings[0].foodItem.name}
              </span>
            </div>
          )}

          {/* TAGS: Fixed Height Area with Horizontal Scroll (36px) */}
          <div className="mb-3 min-h-[36px] max-h-[36px] overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="flex items-center gap-1 h-full">
              <AllergenInfo
                allergens={allergens}
                isVegetarian={item.isVegetarian}
                isVegan={item.isVegan}
                isGlutenFree={item.isGlutenFree}
                variant="default"
                size="sm"
                layout="inline"
                showNames={false}
                maxVisible={99}
                className="flex-shrink-0"
                language={language}
              />
            </div>
          </div>

          {/* FOOTER: Actions (Fixed: 40px at bottom) */}
          <div className="mt-auto pt-2 border-t border-border/20">
            <div className="flex gap-2 justify-end min-h-[40px] items-center">
              {/* Cart Status Indicator */}
              {isInCart && (
                <div className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 mr-auto">
                  <ShoppingCart className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {language === 'en' ? `In cart (${cartQuantity})` : `En carrito (${cartQuantity})`}
                  </span>
                  <span className="sm:hidden">{cartQuantity}</span>
                </div>
              )}

              {/* View Details Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onQuickView}
                className="h-9 w-9 p-0 transition-all duration-200 hover:shadow-md"
                title={language === 'en' ? 'View Details' : 'Ver Detalle'}
              >
                <Eye className="h-4 w-4" />
              </Button>

              {/* Add to Cart Button */}
              {(category.type === 'FOOD' || category.type === 'WINE') && (
                <Button
                  onClick={onAddToCart}
                  size="sm"
                  className={cn(
                    "relative h-9 w-9 p-0 transition-all duration-200 hover:shadow-md",
                    isInCart
                      ? "bg-green-50 border-green-200 hover:bg-green-100 text-green-700 border"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                  title={language === 'en'
                    ? (isInCart ? 'Add More' : 'Add to Cart')
                    : (isInCart ? 'Añadir Más' : 'Al Carrito')
                  }
                >
                  <ShoppingCart className="h-4 w-4" />

                  {/* Quantity Badge */}
                  {isInCart && cartQuantity > 0 && (
                    <Badge
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 text-xs flex items-center justify-center bg-destructive hover:bg-destructive text-destructive-foreground border-0 rounded-full shadow-sm"
                    >
                      {cartQuantity}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>

        {/* Alcohol Badge - Absolute Positioned */}
        {category.type === 'WINE' && item.alcoholContent && (
          <div className="absolute bottom-2 left-2">
            <div className="px-2 py-1 bg-primary/10 rounded-md flex items-center gap-1">
              <Wine className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">
                {item.alcoholContent}% <span className="hidden sm:inline">Vol.</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Skeleton placeholder for lazy loading
export function MenuCardSkeleton() {
  return (
    <Card className="h-[280px] sm:h-[300px] animate-pulse">
      <div className="flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/30 min-h-[48px]">
          <div className="w-7 h-7 bg-muted rounded-full" />
          <div className="w-16 h-7 bg-muted rounded-md" />
        </div>

        {/* Body Skeleton */}
        <CardContent className="flex-1 flex flex-col px-3 sm:px-4 py-3">
          {/* Title */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>

          {/* Description */}
          <div className="space-y-2 mb-3">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-3">
            <div className="w-7 h-7 bg-muted rounded-full" />
            <div className="w-7 h-7 bg-muted rounded-full" />
            <div className="w-7 h-7 bg-muted rounded-full" />
          </div>

          {/* Actions */}
          <div className="mt-auto pt-2 border-t border-border/20">
            <div className="flex gap-2 justify-end">
              <div className="w-9 h-9 bg-muted rounded-md" />
              <div className="w-9 h-9 bg-muted rounded-md" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
