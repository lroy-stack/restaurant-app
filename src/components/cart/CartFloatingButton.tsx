'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartFloatingButtonProps {
  className?: string
}

export const CartFloatingButton: React.FC<CartFloatingButtonProps> = ({
  className
}) => {
  const { state, toggleCart, getCartCount } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)

  const cartCount = getCartCount()

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't show if cart is empty
  if (cartCount === 0) {
    return null
  }

  // Removed hardcoded glassmorphism - using CSS variables for theme support

  return (
    <div className={cn(
      'fixed z-40', // z-40 para estar debajo del navbar (z-50)
      // POSICIÓN CORRECTA: top-left como especificaste originalmente
      'top-6 left-6 md:top-8 md:left-8',
      'transition-all duration-500',
      className
    )}>
      <button
        onClick={toggleCart}
        className={cn(
          // CUADRADO con esquinas redondeadas (siguiendo patrón de cards) - Más compacto
          'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center',
          'backdrop-blur-2xl border border-border/40',
          'transition-all duration-300 group',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          'bg-card/80 hover:bg-card/90',
          isScrolled ? 'shadow-2xl' : 'shadow-xl'
        )}
        aria-label={state.language === 'es' ? 'Abrir carrito' : 'Open cart'}
      >
        {/* Top shine effect */}
        <div className="absolute top-2 left-2 right-2 h-px opacity-20 bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />

        <div className="relative">
          <ShoppingCart
            className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary/80 transition-colors duration-200"
            strokeWidth={2}
          />

          {/* Cart count badge - Más compacto */}
          <Badge
            className={cn(
              'absolute -top-1.5 -right-1.5 h-4 w-4 p-0 text-[10px] sm:text-xs',
              'flex items-center justify-center',
              'bg-destructive hover:bg-destructive text-destructive-foreground border-0',
              'min-w-[1rem] sm:min-w-[1.25rem] rounded-full',
              'shadow-md transition-all duration-200',
              'group-hover:scale-105'
            )}
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        </div>

        {/* TOOLTIP CORREGIDO: aparece a la DERECHA */}
        <div
          className={cn(
            'absolute left-full ml-3 top-1/2 transform -translate-y-1/2',
            'px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border',
            'text-popover-foreground text-sm rounded-lg whitespace-nowrap',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'shadow-lg pointer-events-none'
          )}
        >
          {state.language === 'es'
            ? `Carrito (${cartCount})`
            : `Cart (${cartCount})`
          }
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-popover/95 border-l border-b border-border rotate-45" />
        </div>
      </button>
    </div>
  )
}

export default CartFloatingButton