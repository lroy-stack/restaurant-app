'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import {
  Menu,
  X,
  Phone,
  MapPin,
  Camera,
  Heart,
  Utensils,
  Clock,
  MessageCircle,
  ShoppingCart,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnigmaLogo } from '@/components/ui/enigma-logo'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const navigationItems = [
  {
    name: 'Menú',
    href: '/menu',
    description: 'Nuestras creaciones culinarias',
    icon: Utensils,
  },
  {
    name: 'Historia',
    href: '/historia',
    description: 'Nuestra historia y tradición',
    icon: Heart,
  },
  {
    name: 'Galería',
    href: '/galeria',
    description: 'Impresiones de nuestro restaurante',
    icon: Camera,
  },
  {
    name: 'Contacto',
    href: '/contacto',
    description: 'Encuéntranos en Calpe',
    icon: MapPin,
  },
]

interface FloatingNavbarProps {
  className?: string
}

export function FloatingNavbar({ className }: FloatingNavbarProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Cart integration for Task 5 PRP
  const { getCartCount, toggleCart } = useCart()
  const cartCount = getCartCount()

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

  // Generate WhatsApp URL
  const getWhatsAppUrl = () => {
    const phone = '34672796006'
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre Enigma Cocina Con Alma')
    return `https://wa.me/${phone}?text=${message}`
  }

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

  const mobileGlassStyle = {
    background: isMobileMenuOpen 
      ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)'
      : isScrolled 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.75) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.70) 100%)',
    boxShadow: isMobileMenuOpen
      ? '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
      : liquidGlassStyle.boxShadow
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
            'border',
            isScrolled 
              ? 'bg-white/30 border-white/40 shadow-2xl' 
              : 'bg-white/25 border-white/35 shadow-xl'
          )}
          style={liquidGlassStyle}
        >
          {/* Top shine effect */}
          <div 
            className="absolute top-4 left-2 right-2 h-px opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
            }}
          />

          {/* Logo */}
          <Link href="/">
            <div className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group hover:scale-105">
              <EnigmaLogo className="w-6 h-6" variant="primary" />
              
              {/* Logo tooltip */}
              <div
                className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/40 text-gray-900 text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                style={{ pointerEvents: 'none' }}
              >
                Enigma Cocina Con Alma
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/90 border-r border-b border-white/40 rotate-45" />
              </div>
            </div>
          </Link>

          {/* Navigation Icons */}
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'relative w-10 h-10 rounded-lg flex items-center justify-center',
                    'transition-all duration-300 group',
                    'hover:scale-105 active:scale-95',
                    isActive
                      ? 'bg-primary/25 text-primary shadow-lg border border-primary/20'
                      : 'text-gray-800 hover:text-primary hover:bg-white/30 shadow-sm'
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                  
                  {/* Tooltip */}
                  <div
                    className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/40 text-gray-900 text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    style={{ pointerEvents: 'none' }}
                  >
                    {item.name}
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/90 border-r border-b border-white/40 rotate-45" />
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Separator */}
          <div className="w-6 h-px bg-white/30" />

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
                  className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/40 text-gray-900 text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  style={{ pointerEvents: 'none' }}
                >
                  Carrito ({cartCount})
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/90 border-r border-b border-white/40 rotate-45" />
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
                className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/40 text-gray-900 text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                style={{ pointerEvents: 'none' }}
              >
                Reservar Mesa
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/90 border-r border-b border-white/40 rotate-45" />
              </div>
            </div>
          </Link>

          {/* WhatsApp */}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-[#9FB289]/20 text-[#9FB289] hover:bg-[#9FB289]/30 transition-all duration-300 group hover:scale-105 active:scale-98"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            
            {/* WhatsApp tooltip */}
            <div
              className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/40 text-gray-900 text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              style={{ pointerEvents: 'none' }}
            >
              WhatsApp
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/90 border-r border-b border-white/40 rotate-45" />
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
            'w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center',
            'backdrop-blur-2xl border',
            'transition-all duration-300',
            'hover:scale-105 active:scale-95',
            isScrolled 
              ? 'bg-white/85 border-white/60 shadow-2xl' 
              : 'bg-white/80 border-white/55 shadow-xl',
            isMobileMenuOpen && 'bg-primary text-white shadow-2xl'
          )}
          style={mobileGlassStyle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="transition-all duration-200">
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            ) : (
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            )}
          </div>
        </button>
      </div>

      {/* Adaptive Mobile Menu - Sheet Implementation */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] md:w-[450px] p-0 border-l border-border bg-card/95"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b border-border bg-muted/10">
              <div className="flex items-center gap-3">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <EnigmaLogo className="w-8 h-8" variant="primary" />
                </Link>
                <div className="flex-1 text-center">
                  <SheetTitle className="enigma-brand-main text-base font-bold text-primary">
                    Enigma Cocina Con Alma
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Auténtico casco antiguo de Calpe
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Navigation Items */}
              <div className="space-y-2 mb-6">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
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
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href="tel:+34672796006" className="hover:text-primary transition-colors">
                      +34 672 79 60 06
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Mar-Dom: 18:00 - 24:00</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Carrer Justicia 6A, Calpe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-4 sm:p-6 border-t border-border bg-card/50">
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
                  <Button variant="outline" className="w-full border-secondary text-secondary-foreground hover:bg-secondary/20">
                    <MessageCircle className="w-4 h-4 mr-2" />
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