import { ReactNode } from 'react'
import { FloatingNavbar } from '@/components/navigation/floating-navbar'
import { CartFloatingButton } from '@/components/cart/CartFloatingButton'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { CookieConsentBanner } from '@/components/legal/CookieConsentBanner'
import { ThemeAwareMeshGradient } from '@/components/background/mesh-gradient-background'
import { Footer } from './footer'
import { cn } from '@/lib/utils'

interface PublicLayoutProps {
  children: ReactNode
  className?: string
  showFooter?: boolean
  showNavbar?: boolean
}

export function PublicLayout({ 
  children, 
  className,
  showFooter = true,
  showNavbar = true
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated Mesh Gradient Background */}
      <ThemeAwareMeshGradient />

      {/* Floating Navigation */}
      {showNavbar && <FloatingNavbar />}

      {/* Cart Components - Global across all public pages */}
      <CartFloatingButton />
      <CartSidebar />

      {/* Cookie Consent Banner - Shows on first visit */}
      <CookieConsentBanner />

      <main className={cn("flex-1", className)}>
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  )
}