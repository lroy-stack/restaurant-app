'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Eye, ShoppingCart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AllergenInfo } from '@/app/(admin)/dashboard/menu/components/ui/allergen-badges'

interface EnhancedProductCardProps {
  item: any
  onQuickView: () => void
  onAddToCart: () => void
  isInCart: boolean
  cartQuantity: number
}

export function EnhancedProductCard({
  item,
  onQuickView,
  onAddToCart,
  isInCart,
  cartQuantity
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Detectar si es vino para aplicar aspect ratio vertical
  const isWine = item.category?.type === 'WINE' || item.wineType || item.vintage

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group h-full flex flex-col overflow-hidden rounded-2xl border-border/50 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 p-0 gap-0">
        {/* Image Container - aspect-ratio dinámico: 4:5 vinos, 4:3 comida */}
        <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: isWine ? '4/5' : '4/3' }}>
          <motion.img
            src={item.imageUrl || '/placeholder-dish.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4 }}
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Quick Actions Overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="sm"
              variant="secondary"
              className="backdrop-blur-md bg-white/95 hover:bg-white h-9 px-4 rounded-xl shadow-lg"
              onClick={onQuickView}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Vista Rápida</span>
            </Button>
          </motion.div>

          {/* Badge Recomendado - Flotante sobre imagen */}
          {item.isRecommended && (
            <div className="absolute top-3 left-3 z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white backdrop-blur-sm text-xs px-2 sm:px-2.5 py-1 rounded-full shadow-lg border-0">
                  <Heart className="h-3 w-3 sm:mr-1 fill-current" />
                  <span className="hidden sm:inline">Recomendado</span>
                </Badge>
              </motion.div>
            </div>
          )}

          {/* Badge Ecológico */}
          {item.isOrganic && (
            <div className="absolute top-3 left-3 z-10" style={{ marginTop: item.isRecommended ? '2.5rem' : '0' }}>
              <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full shadow-md border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Eco
              </Badge>
            </div>
          )}

          {/* Price Badge - Flotante sobre imagen */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              className="bg-primary/95 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-xl font-bold text-base shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              €{item.price}
            </motion.div>
          </div>
        </div>

      {/* Card Content - Padding optimizado sin hueco excesivo */}
      <CardContent className="flex-1 flex flex-col gap-3 p-4">
          {/* Título y descripción */}
          <div>
            <h3 className="text-base font-bold mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Allergens & Dietary Info */}
          {(item.allergens?.length > 0 || item.isVegetarian || item.isVegan || item.isGlutenFree) && (
            <div className="mt-auto">
              <AllergenInfo
                allergens={item.allergens || []}
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
          )}

          {/* Actions Button */}
          <motion.div whileTap={{ scale: 0.97 }} className="mt-auto">
            <Button
              onClick={onAddToCart}
              size="sm"
              className={cn(
                "w-full h-10 text-sm font-semibold rounded-xl shadow-md transition-all duration-200",
                isInCart
                  ? "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                  : "bg-primary hover:bg-primary/90 hover:shadow-lg"
              )}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isInCart ? `En carrito (${cartQuantity})` : 'Añadir al carrito'}

              {/* Quantity badge - solo visible si está en carrito */}
              {isInCart && cartQuantity > 0 && (
                <motion.span
                  className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {cartQuantity}
                </motion.span>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
