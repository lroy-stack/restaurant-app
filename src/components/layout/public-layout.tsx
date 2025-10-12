'use client'

import { ReactNode } from 'react'
import { FloatingNavbar } from '@/components/navigation/floating-navbar'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { CartFloatingButton } from '@/components/cart/CartFloatingButton'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { CookieConsentBanner } from '@/components/legal/CookieConsentBanner'
import { ThemeAwareMeshGradient } from '@/components/background/mesh-gradient-background'
import { Footer } from './footer'
import { cn } from '@/lib/utils'
import { CssCursorTrail } from '@/components/effects/CssCursorTrail'
import { AnnouncementManager } from '@/components/announcements/AnnouncementManager'

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

      {/* CSS Cursor Trail - Desktop only */}
      <CssCursorTrail />

      {/* Floating Navigation */}
      {showNavbar && <FloatingNavbar />}

      {/* Theme Switcher - Floating left side */}
      <ThemeSwitcher />

      {/* Cart Components - Global across all public pages */}
      <CartFloatingButton />
      <CartSidebar />

      {/* Cookie Consent Banner - Shows on first visit */}
      <CookieConsentBanner />

      {/* Announcement System - Modular by page config */}
      <AnnouncementManager />

      <main className={cn("flex-1", className)}>
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  )
}