'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { useRestaurant } from '@/hooks/use-restaurant'
import { useNavigation } from '@/hooks/useNavigation'
import {
  Menu,
  X,
  Phone,
  MapPin,
  Camera,
  Heart,
  Utensils,
  Clock,
  ShoppingCart,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnigmaLogo } from '@/components/ui/enigma-logo'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// Icon mapping
const getIconComponent = (iconName: string | null) => {
  const icons: Record<string, any> = {
    Utensils,
    Heart,
    Camera,
    MapPin,
    Phone,
    Clock,
    Menu
  }
  return icons[iconName || 'Menu'] || Menu
}

interface FloatingNavbarProps {
  className?: string
}

export function FloatingNavbar({ className }: FloatingNavbarProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Cart integration for Task 5 PRP
  const { getCartCount, toggleCart } = useCart()
  const cartCount = getCartCount()

  // Restaurant data & navigation
  const { restaurant } = useRestaurant()
  const { getNavItems } = useNavigation()
  const navigationItems = getNavItems()

  // Prevent hydration mismatch - wait for client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Generate WhatsApp URL - DINÁMICO desde DB
  const getWhatsAppUrl = () => {
    const phone = restaurant?.whatsapp_number?.replace(/[^\d]/g, '') || '34600000000'
    const restaurantName = restaurant?.name || 'el restaurante'
    const message = encodeURIComponent(`Hola, me gustaría obtener más información sobre ${restaurantName}`)
    return `https://wa.me/${phone}?text=${message}`
  }

  // Removed inline hardcoded styles - using CSS variables for dark mode support

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Desktop Navigation - Floating Right Vertical */}
      <div className={cn(
        'fixed right-6 top-1/2 transform -translate-y-1/2 z-50',
        'hidden lg:flex',
        'transition-all duration-500',
        className
      )}>
        <div
          className={cn(
            'flex flex-col items-center space-y-2',
            'backdrop-blur-2xl rounded-2xl',
            'px-3 py-4',
            'transition-all duration-500',
            'border border-border/40',
            'bg-card/80 hover:bg-card/90',
            'shadow-xl hover:shadow-2xl'
          )}
          suppressHydrationWarning
        >
          {/* Top shine effect */}
          <div
            className="absolute top-4 left-2 right-2 h-px opacity-20 bg-gradient-to-r from-transparent via-foreground/30 to-transparent"
          />

          {/* Logo */}
          <Link href="/">
            <div className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group hover:scale-105">
              <EnigmaLogo className="w-6 h-6" variant="primary" />
              
              {/* Logo tooltip */}
              <div
                className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border text-popover-foreground text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                style={{ pointerEvents: 'none' }}
              >
                {restaurant?.name || 'Inicio'}
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-popover/95 border-r border-b border-border rotate-45" />
              </div>
            </div>
          </Link>

          {/* Navigation Icons - DINÁMICO desde DB */}
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = getIconComponent(item.icon)
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'relative w-10 h-10 rounded-lg flex items-center justify-center',
                    'transition-all duration-300 group',
                    'hover:scale-105 active:scale-95',
                    isActive
                      ? 'bg-primary/25 text-primary shadow-lg border border-primary/20'
                      : 'text-foreground/70 hover:text-primary hover:bg-accent shadow-sm'
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}

                  {/* Tooltip */}
                  <div
                    className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border text-popover-foreground text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    style={{ pointerEvents: 'none' }}
                  >
                    {item.name}
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-popover/95 border-r border-b border-border rotate-45" />
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Separator */}
          <div className="w-6 h-px bg-border/40" />

          {/* Cart Button - Task 5 PRP Implementation */}
          {cartCount > 0 && (
            <button onClick={toggleCart}>
              <div className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/30 text-secondary-foreground hover:bg-secondary/50 transition-all duration-300 group hover:scale-105 active:scale-98">
                <ShoppingCart className="w-4 h-4" strokeWidth={2} />

                {/* Cart count badge */}
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-destructive hover:bg-destructive text-destructive-foreground border-0 min-w-[1.25rem]">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>

                {/* Cart tooltip */}
                <div
                  className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border text-popover-foreground text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  style={{ pointerEvents: 'none' }}
                >
                  Carrito ({cartCount})
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-popover/95 border-r border-b border-border rotate-45" />
                </div>
              </div>
            </button>
          )}

          {/* Reserve Button */}
          <Link href="/reservas">
            <div className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-300 group hover:scale-105 active:scale-98">
              <Calendar className="w-4 h-4" strokeWidth={2} />
              
              {/* Reserve tooltip */}
              <div
                className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border text-popover-foreground text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                style={{ pointerEvents: 'none' }}
              >
                Reservar Mesa
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-popover/95 border-r border-b border-border rotate-45" />
              </div>
            </div>
          </Link>

          {/* WhatsApp */}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all duration-300 group hover:scale-105 active:scale-98 border border-[#25D366]/20"
          >
            <WhatsAppIcon className="w-4 h-4" size={16} />

            {/* WhatsApp tooltip */}
            <div
              className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border text-popover-foreground text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              style={{ pointerEvents: 'none' }}
            >
              WhatsApp
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-popover/95 border-r border-b border-border rotate-45" />
            </div>
          </a>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <div className={cn(
        'fixed top-6 right-6 z-50',
        'lg:hidden',
        'transition-all duration-500'
      )}>
        <button
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center',
            'backdrop-blur-2xl border border-border',
            'transition-all duration-300',
            'hover:scale-105 active:scale-95',
            'shadow-xl hover:shadow-2xl',
            isMobileMenuOpen
              ? 'bg-primary text-primary-foreground'
              : 'bg-card/80 hover:bg-card/90 text-foreground'
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="transition-all duration-200">
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </div>
        </button>
      </div>

      {/* Adaptive Mobile Menu - Sheet Implementation */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] md:w-[450px] p-0 border-l border-border bg-card/95 backdrop-blur-2xl"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <EnigmaLogo className="w-8 h-8" variant="primary" />
                </Link>
                <div className="flex-1 text-center">
                  <SheetTitle className="enigma-brand-main text-base font-bold text-primary">
                    {restaurant?.name || 'Nombre Restaurante'}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    {restaurant?.description || 'Restaurante'}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Navigation Items */}
              <div className="space-y-2 mb-6">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = getIconComponent(item.icon)
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200',
                        'min-h-[52px] touch-manipulation',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        isActive
                          ? 'bg-primary/20 text-primary shadow-sm hover:bg-primary/30'
                          : 'text-foreground hover:text-primary hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center',
                        'backdrop-blur-sm transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-primary'
                      )}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="enigma-brand-body font-semibold text-sm sm:text-base">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm mt-1 text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-primary rounded-full ml-auto shadow-sm" />
                      )}
                    </Link>
                  )
                })}

                {/* Cart Item - Task 5 PRP Implementation */}
                {cartCount > 0 && (
                  <button
                    onClick={toggleCart}
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200 min-h-[52px] touch-manipulation hover:scale-[1.02] active:scale-[0.98] text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary/20 w-full"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-secondary/30 text-secondary-foreground hover:bg-secondary/50 transition-all duration-200 relative">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />

                      {/* Cart count badge */}
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-destructive hover:bg-destructive text-destructive-foreground border-0 min-w-[1.25rem]">
                        {cartCount > 99 ? '99+' : cartCount}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="enigma-brand-body font-semibold text-sm sm:text-base">Carrito</h3>
                      <p className="text-xs sm:text-sm mt-1 text-muted-foreground">{cartCount} productos seleccionados</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Contact Info */}
              <div className="border-t border-border pt-4 mb-4">
                <div className="space-y-3 text-sm text-foreground/70">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <a
                      href={`tel:${restaurant?.phone?.replace(/\s/g, '') || "+34672796006"}`}
                      className="hover:text-primary transition-colors"
                    >
                      {restaurant?.phone || "+34 672 79 60 06"}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      {restaurant?.hours_operation ? (
                        restaurant.hours_operation.split('|').map((schedule, idx) => (
                          <div key={idx} className="text-xs leading-relaxed">{schedule.trim()}</div>
                        ))
                      ) : (
                        <span>Mar-Dom: 18:00 - 24:00</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">
                      {restaurant?.address || "Dirección del restaurante"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-4 sm:p-6 border-t border-border bg-muted/30">
              <div className="space-y-2">
                <Link href="/reservas" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar Mesa
                  </Button>
                </Link>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/80"
                  >
                    <WhatsAppIcon className="w-4 h-4 mr-2" size={16} />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}