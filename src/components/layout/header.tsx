'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Menu, Phone, Clock, MapPin, Camera, Utensils, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { useNavigationBreakpoints } from "@/hooks/useResponsiveLayout"

const navigation = [
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

interface HeaderProps {
  variant?: 'default' | 'transparent'
}

export function Header({ variant = 'default' }: HeaderProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { shouldShowDesktopNav, shouldShowMobileNav, currentBreakpoint, isTabletHorizontal } = useNavigationBreakpoints()

  const isTransparent = variant === 'transparent'
  
  return (
    <header className={cn(
      "sticky top-0 z-50 border-b transition-colors",
      isTransparent
        ? "bg-black/40 backdrop-blur-sm border-transparent"
        : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <EnigmaLogo
            className="h-8 w-8"
            variant={isTransparent ? "white" : "primary"}
          />
          <span className={cn(
            "enigma-brand-main text-xl font-bold hidden sm:block",
            isTransparent ? "text-white" : "text-primary"
          )}>
            Enigma Cocina Con Alma
          </span>
          <span className={cn(
            "enigma-brand-main text-xl font-bold sm:hidden",
            isTransparent ? "text-white" : "text-primary"
          )}>
            Enigma
          </span>
        </Link>

        {/* Desktop Navigation - 🚨 NOW: Uses intelligent breakpoint detection */}
        <nav className={cn(
          "items-center gap-6",
          shouldShowDesktopNav ? "flex" : "hidden"
        )}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : isTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-foreground/70 hover:text-primary dark:text-foreground/80 dark:hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
          
          {/* CTA Button */}
          <Link href="/reservas">
            <Button
              size="sm"
              className={cn(
                "ml-2",
                isTransparent
                  ? "bg-white/90 text-primary hover:bg-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Utensils className="h-4 w-4 mr-2" />
              Reservar
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation - 🚨 NOW: Shows on mobile AND tablet horizontal */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                shouldShowMobileNav ? "flex" : "hidden",
                isTransparent
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-border hover:bg-accent"
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-80">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="flex items-center gap-2 enigma-brand-main">
                <EnigmaLogo className="h-6 w-6" variant="primary" />
                Enigma Cocina Con Alma
              </SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent",
                      isActive && "bg-accent text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                )
              })}
              
              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-foreground/70">
                  <Phone className="h-4 w-4" />
                  <span>+34 672 79 60 06</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/70">
                  <Clock className="h-4 w-4" />
                  <span>Mar-Dom: 18:00 - 23:00</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/70">
                  <MapPin className="h-4 w-4" />
                  <span>Carrer Justicia 6A, Calpe</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-4">
                <Link href="/reservas">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsOpen(false)}
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    Reservar Mesa
                  </Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}