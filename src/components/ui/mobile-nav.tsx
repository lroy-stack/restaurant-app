'use client'

import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useMobileNavigation } from '@/hooks/useMobileNavigation'
import { Button } from './button'

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const { sidebarOpen, toggleSidebar, shouldShowFloatingNav } = useMobileNavigation()

  // Only show when floating nav should be visible (mobile/tablet)
  if (!shouldShowFloatingNav) return null
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleSidebar}
      data-mobile-nav-toggle
      className={cn(
        // Floating position - z-index below sidebar
        "fixed z-30 transition-all duration-300",
        // FAB position - bottom-right (no interfiere con headers ni botones)
        "bottom-6 right-6",
        // Styling siguiendo shadcn patterns
        "h-10 w-10 rounded-md",
        "bg-card/95 backdrop-blur-md border border-border/50",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "hover:scale-105 active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Enhanced open state styling
        sidebarOpen && [
          "bg-card/90 shadow-2xl ring-2 ring-primary/20",
          "hover:bg-card/95"
        ],
        className
      )}
      aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={sidebarOpen}
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        <Menu 
          className={cn(
            "absolute inset-0 transition-all duration-300 transform",
            sidebarOpen ? "rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )} 
          size={16} 
        />
        <X 
          className={cn(
            "absolute inset-0 transition-all duration-300 transform",
            sidebarOpen ? "rotate-0 scale-100 opacity-100" : "rotate-180 scale-0 opacity-0"
          )} 
          size={16} 
        />
      </div>
    </Button>
  )
}

// Optional minimal header - can be used when needed, but not required
export function MobileHeader({
  title = "Enigma Admin",
  showOnMobile = false
}: {
  title?: string
  showOnMobile?: boolean
}) {
  const { shouldShowFloatingNav } = useMobileNavigation()

  // Only show if explicitly requested
  if (!showOnMobile || !shouldShowFloatingNav) return null
  
  return (
    <header className="bg-transparent px-4 py-2">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-sm" />
          </div>
          <div>
            <h1 className="text-sm font-medium text-foreground/80">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  )
}

// Standalone floating navigation button - main component to use
export function FloatingNav() {
  return <MobileNav />
}