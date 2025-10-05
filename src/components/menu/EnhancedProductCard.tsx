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

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        {/* Image Container with Overlay - aspect ratio optimizado para móvil */}
        <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-muted">
          <motion.img
            src={item.imageUrl || '/placeholder-dish.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Quick Actions Overlay - solo icono en móvil */}
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
              className="backdrop-blur-sm bg-white/90 hover:bg-white h-8 sm:h-9"
              onClick={onQuickView}
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Vista Rápida</span>
            </Button>
          </motion.div>

          {/* Badges - más compactos en móvil */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
            {item.isRecommended && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Badge className="bg-accent/90 backdrop-blur-sm text-xs px-2 py-0.5">
                  <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 fill-current" />
                  <span className="hidden sm:inline">Recomendado</span>
                </Badge>
              </motion.div>
            )}
            {item.isOrganic && (
              <Badge variant="secondary" className="bg-secondary/90 backdrop-blur-sm text-xs px-2 py-0.5">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden sm:inline">Ecológico</span>
              </Badge>
            )}
          </div>

          {/* Price Tag - responsive sizing */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <motion.div
              className="bg-primary text-primary-foreground px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              €{item.price}
            </motion.div>
          </div>
        </div>

        {/* Card Content - padding y tamaños responsive */}
        <CardContent className="flex-1 flex flex-col p-2 sm:p-3 md:p-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3">
            {item.description}
          </p>

          {/* Allergens & Dietary Info - compacto en móvil */}
          <div className="mb-2 sm:mb-3">
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

          {/* Actions - botón más compacto en móvil */}
          <div className="mt-auto pt-2 sm:pt-3 md:pt-4 border-t">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onAddToCart}
                size="sm"
                className={cn(
                  "w-full relative h-8 sm:h-9 md:h-10 text-xs sm:text-sm",
                  isInCart && "bg-green-600 hover:bg-green-700"
                )}
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isInCart ? `En carrito (${cartQuantity})` : 'Añadir'}</span>
                <span className="sm:hidden">{isInCart ? cartQuantity : '+'}</span>

                {isInCart && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {cartQuantity}
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
