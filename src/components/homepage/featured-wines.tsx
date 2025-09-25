'use client'

import { useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTopRecommendedWines } from "@/hooks/use-recommended-wines"
import {
  Star,
  ArrowRight,
  Eye,
  ShoppingCart,
  Heart,
  Wine
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductDetailModal } from "@/components/menu/ProductDetailModal"
import { AllergenInfo } from '@/app/(admin)/dashboard/menu/components/ui/allergen-badges'
import { useCart } from '@/hooks/useCart'

interface FeaturedWinesProps {
  maxItems?: number
  showViewMore?: boolean
  className?: string
}

/**
 * Componente que reutiliza EXACTAMENTE las tarjetas del /menu
 * Para mostrar vinos recomendados usando componentes centralizados
 */
export function FeaturedWines({
  maxItems = 2,
  showViewMore = true,
  className
}: FeaturedWinesProps) {
  const { topItems, loading, error } = useTopRecommendedWines(maxItems)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedItemCategory, setSelectedItemCategory] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const { addToCart, isInCart, getCartItem } = useCart()

  // Mapear vino para carrito
  const mapWineItemToCartItem = (item: any) => {
    return {
      id: item.id,
      type: 'wine' as const,
      name: item.name,
      nameEn: item.nameEn,
      description: item.description,
      descriptionEn: item.descriptionEn,
      price: item.price,
      image_url: item.imageUrl,
      category: item.category?.name || 'Vinos',
      categoryEn: item.category?.nameEn || 'Wines',
      winery: item.winery,
      wine_type: item.wineType,
    }
  }

  const handleAddToCart = (item: any) => {
    const cartItem = mapWineItemToCartItem(item)
    addToCart(cartItem)
  }

  const openDetailModal = (item: any) => {
    setSelectedItem(item)
    setSelectedItemCategory(item.category || { name: 'Vinos', nameEn: 'Wines', type: 'WINE' })
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedItem(null)
    setSelectedItemCategory(null)
  }

  // Loading state
  if (loading) {
    return (
      <section className={cn("py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-accent/5", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="h-8 w-64 mx-auto mb-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 mx-auto bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: maxItems }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-2 sm:p-4">
                  <div className="h-4 w-3/4 mb-2 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full mb-2 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-2/3 mb-3 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className={cn("py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-accent/5", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="enigma-section-title text-destructive">Error al cargar vinos recomendados</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/menu">
              <Button variant="outline">Ver Menú Completo</Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // No hay vinos
  if (!topItems.length) {
    return (
      <section className={cn("py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-accent/5", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="enigma-section-title">Nuestra Cava</h3>
            <p className="text-muted-foreground mb-8">
              Próximamente destacaremos nuestros vinos más especiales
            </p>
            <Link href="/menu">
              <Button>
                Ver Nuestra Carta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className={cn("py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-accent/5", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="enigma-section-title">Nuestra Cava</h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Selección especial de vinos recomendados por nuestro sumiller, perfectos para acompañar una experiencia gastronómica única
            </p>
          </div>

          {/* Grid de vinos - USANDO EXACTAMENTE LAS TARJETAS DEL /MENU */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:grid-cols-4">
            {topItems.map((item) => {
              const allergens = item.allergens || []

              return (
                <Card key={item.id} className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20">
                  {/* CARD HEADER - Status Badges & Price - Enhanced */}
                  <div className="flex items-start justify-between p-3 sm:p-4 md:p-5 pb-3 sm:pb-3 border-b border-border/50">
                    <div className="flex gap-2 flex-wrap">
                      {item.isRecommended && (
                        <div className="w-7 h-7 sm:w-6 sm:h-6 bg-accent/20 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 sm:w-3 sm:h-3 text-accent fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-baseline gap-2 justify-end">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">€{item.price}</div>
                        {item.glassPrice && (
                          <div className="text-sm sm:text-xs text-muted-foreground">
                            / €{item.glassPrice} copa
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY - Content - Enhanced Padding */}
                  <CardContent className="flex-1 flex flex-col p-3 sm:p-4 md:p-5 pt-3 sm:pt-3">
                    {/* Item Name & Description - Enhanced Legibility */}
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm sm:text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Alcohol content for wines */}
                    {item.alcoholContent && (
                      <div className="mb-3 p-2.5 bg-primary/10 rounded-md border border-primary/20">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                          <Wine className="h-3.5 w-3.5" />
                          <span>{item.alcoholContent}% Vol.</span>
                        </div>
                      </div>
                    )}

                    {/* Allergen & Dietary Info - COMPONENTE REUTILIZADO */}
                    <div className="mb-3 sm:mb-4">
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
                        className="justify-start"
                        language="es"
                      />
                    </div>

                    {/* CARD FOOTER - Action Buttons EXACTOS DEL /MENU */}
                    <div className="mt-auto pt-2 sm:pt-3 border-t border-border/30">
                      {/* Cart Status */}
                      {isInCart(item.id) && getCartItem(item.id) && (
                        <div className="mb-1 sm:mb-2 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          <span className="truncate">
                            En carrito ({getCartItem(item.id)?.quantity})
                          </span>
                        </div>
                      )}

                      {/* Action Buttons - Progressive Mobile-Friendly */}
                      <div className="flex gap-2 sm:gap-3 justify-end">
                        {/* View Details - Better Touch Targets */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(item)}
                          className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-0 hover:shadow-md transition-all duration-200"
                          title="Ver Detalle"
                        >
                          <Eye className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </Button>

                        {/* Add to Cart - Enhanced Touch Experience */}
                        <Button
                          onClick={() => handleAddToCart(item)}
                          size="sm"
                          className={cn(
                            "relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-0 transition-all duration-200 hover:shadow-md",
                            isInCart(item.id)
                              ? "bg-green-50 border-green-200 hover:bg-green-100 text-green-700 border"
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          )}
                          title={isInCart(item.id) ? 'Añadir Más' : 'Al Carrito'}
                        >
                          <ShoppingCart className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />

                          {/* Enhanced quantity badge */}
                          {isInCart(item.id) && getCartItem(item.id) && getCartItem(item.id)!.quantity > 0 && (
                            <Badge
                              className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs flex items-center justify-center bg-red-500 hover:bg-red-500 text-white border-0 rounded-full shadow-sm"
                            >
                              {getCartItem(item.id)?.quantity}
                            </Badge>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Link al menú completo */}
          {showViewMore && (
            <div className="text-center mt-8">
              <Link href="/menu">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  Ver Nuestra Carta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* MODAL REUTILIZADO DEL /MENU */}
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        item={selectedItem}
        category={selectedItemCategory}
        language="es"
        onAddToCart={handleAddToCart}
        isInCart={isInCart}
        getCartItem={getCartItem}
      />
    </>
  )
}