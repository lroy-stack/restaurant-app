'use client'

import { useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTopRecommendedItems } from "@/hooks/use-recommended-menu-items"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductDetailModal } from "@/components/menu/ProductDetailModal"
import { useCart } from '@/hooks/useCart'
import { EnhancedProductCard } from '@/components/menu/EnhancedProductCard'

interface FeaturedDishesProps {
  maxItems?: number
  showViewMore?: boolean
  className?: string
}

/**
 * Componente que reutiliza EXACTAMENTE las tarjetas del /menu
 * Para mostrar platos destacados usando componentes centralizados
 */
export function FeaturedDishes({
  maxItems = 4,
  showViewMore = true,
  className
}: FeaturedDishesProps) {
  const { topItems, loading, error } = useTopRecommendedItems(maxItems)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedItemCategory, setSelectedItemCategory] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const { addToCart, isInCart, getCartItem } = useCart()

  // Mapear item para carrito
  const mapMenuItemToCartItem = (item: any) => {
    return {
      id: item.id,
      type: 'dish' as const,
      name: item.name,
      nameEn: item.nameEn,
      description: item.description,
      descriptionEn: item.descriptionEn,
      price: item.price,
      image_url: item.imageUrl,
      category: item.category?.name || 'Platos',
      categoryEn: item.category?.nameEn || 'Dishes'
    }
  }

  const handleAddToCart = (item: any) => {
    const cartItem = mapMenuItemToCartItem(item)
    addToCart(cartItem)
  }

  const openDetailModal = (item: any) => {
    setSelectedItem(item)
    setSelectedItemCategory(item.category || { name: 'Platos', nameEn: 'Dishes', type: 'FOOD' })
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
            <h3 className="enigma-section-title text-destructive">Error al cargar platos destacados</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/menu">
              <Button variant="outline">Ver Menú Completo</Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // No hay platos
  if (!topItems.length) {
    return (
      <section className={cn("py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-accent/5", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="enigma-section-title">Platos de la Casa</h3>
            <p className="text-muted-foreground mb-8">
              Próximamente destacaremos nuestros platos más especiales
            </p>
            <Link href="/menu">
              <Button>
                Ver Menú Completo
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
            <h3 className="enigma-section-title">Platos de la Casa</h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Nuestros platos más especiales, elaborados con ingredientes premium y técnicas de autor
            </p>
          </div>

          {/* Grid de platos - responsive mobile-first */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {topItems.map((item) => (
              <EnhancedProductCard
                key={item.id}
                item={item}
                onQuickView={() => openDetailModal(item)}
                onAddToCart={() => handleAddToCart(item)}
                isInCart={isInCart(item.id)}
                cartQuantity={getCartItem(item.id)?.quantity || 0}
              />
            ))}
          </div>

          {/* Link al menú completo */}
          {showViewMore && (
            <div className="text-center mt-8">
              <Link href="/menu">
                <Button size="lg" variant="outline">
                  Ver Menú Completo
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