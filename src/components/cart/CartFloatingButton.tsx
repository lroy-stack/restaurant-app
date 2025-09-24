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

  // Glassmorphism style matching navbar pattern
  const liquidGlassStyle = {
    background: isScrolled
      ? 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.75) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.70) 100%)',
    boxShadow: `
      0 12px 40px rgba(0,0,0,0.25),
      0 6px 20px rgba(0,0,0,0.20),
      0 3px 12px rgba(0,0,0,0.15),
      inset 0 1px 0 rgba(255,255,255,0.8),
      inset 0 -1px 0 rgba(0,0,0,0.05)
    `
  }

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
          'w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center',
          'backdrop-blur-2xl border',
          'transition-all duration-300 group',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary/50',
          isScrolled
            ? 'bg-white/30 border-white/40 shadow-2xl'
            : 'bg-white/25 border-white/35 shadow-xl'
        )}
        style={liquidGlassStyle}
        aria-label={state.language === 'es' ? 'Abrir carrito' : 'Open cart'}
      >
        {/* Top shine effect */}
        <div
          className="absolute top-2 left-2 right-2 h-px opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
          }}
        />

        <div className="relative">
          <ShoppingCart
            className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary/80 transition-colors duration-200"
            strokeWidth={2}
          />

          {/* Cart count badge with improved styling */}
          <Badge
            className={cn(
              'absolute -top-2 -right-2 h-5 w-5 p-0 text-xs',
              'flex items-center justify-center',
              'bg-destructive hover:bg-destructive text-destructive-foreground border-0',
              'min-w-[1.25rem] rounded-full',
              'shadow-lg transition-all duration-200',
              'group-hover:scale-110'
            )}
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        </div>

        {/* TOOLTIP CORREGIDO: aparece a la DERECHA */}
        <div
          className={cn(
            'absolute left-full ml-3 top-1/2 transform -translate-y-1/2',
            'px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/40',
            'text-gray-900 text-sm rounded-lg whitespace-nowrap',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'shadow-lg pointer-events-none'
          )}
        >
          {state.language === 'es'
            ? `Carrito (${cartCount})`
            : `Cart (${cartCount})`
          }
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/90 border-l border-b border-white/40 rotate-45" />
        </div>
      </button>
    </div>
  )
}

export default CartFloatingButton