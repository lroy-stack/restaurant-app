'use client'

import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Zustand store for global UI state persistence
interface UIStore {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  breakpoint: 'mobile' | 'tablet' | 'desktop'
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  closeSidebar: () => void
  updateBreakpoint: (width: number) => void
  shouldShowOverlay: () => boolean
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      breakpoint: 'mobile',
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ 
        sidebarCollapsed: collapsed 
      }),
      
      closeSidebar: () => set({ sidebarOpen: false }),
      
      updateBreakpoint: (width) => {
        // 🚨 TABLET HORIZONTAL FIX: Consider both width AND height for better detection
        const height = window?.innerHeight || 768
        const aspectRatio = width / height
        const isLandscape = aspectRatio > 1.3
        const isTabletSize = width >= 768 && width <= 1366 // Common tablet range

        // Enhanced logic:
        // - Tablet horizontal (1024x768) → Should be 'tablet', not 'desktop'
        // - Real desktop (1920x1080) → 'desktop'
        // - Tablet vertical (768x1024) → 'tablet'
        // - Mobile (375x667) → 'mobile'

        const newBreakpoint = width < 768
          ? 'mobile'
          : isTabletSize && (height < 900 || isLandscape)
            ? 'tablet'
            : 'desktop'

        const currentState = get()
        const previousBreakpoint = currentState.breakpoint

        // 🔧 FIX: Auto-sync sidebar state with breakpoint changes
        // When transitioning TO desktop → auto-expand sidebar
        // When transitioning FROM desktop → close sidebar
        if (newBreakpoint !== previousBreakpoint) {
          if (newBreakpoint === 'desktop') {
            // Desktop: sidebar should be visible (not necessarily open for overlay)
            // Don't force sidebarOpen=true because desktop uses shouldShowSidebar logic
            set({ breakpoint: newBreakpoint })
          } else if (previousBreakpoint === 'desktop') {
            // Leaving desktop: close any floating sidebar
            set({ breakpoint: newBreakpoint, sidebarOpen: false })
          } else {
            // Other transitions: just update breakpoint
            set({ breakpoint: newBreakpoint })
          }
        }
      },
      
      shouldShowOverlay: () => {
        const { sidebarOpen, breakpoint } = get()
        return sidebarOpen && (breakpoint === 'mobile' || breakpoint === 'tablet')
      }
    }),
    {
      name: 'enigma-ui-store',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed 
      })
    }
  )
)

// Main responsive layout hook
export const useResponsiveLayout = () => {
  const { breakpoint, updateBreakpoint } = useUIStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    const handleResize = () => {
      updateBreakpoint(window.innerWidth)
    }
    
    // Initial call
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateBreakpoint])
  
  // Prevent SSR hydration mismatch
  if (!mounted) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true, // Default to desktop for SSR
      breakpoint: 'desktop' as const
    }
  }
  
  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet', 
    isDesktop: breakpoint === 'desktop',
    breakpoint
  }
}

// 🚨 ENHANCED: Responsive breakpoint utilities with aspect ratio awareness
export const breakpoints = {
  mobile: 'max-width: 767px',
  tablet: '(min-width: 768px and max-width: 1366px) and (max-height: 900px), (min-width: 768px and max-width: 1366px) and (orientation: landscape)',
  desktop: 'min-width: 1367px, (min-width: 1024px and min-height: 900px and orientation: portrait)'
} as const

// Helper breakpoint queries for common use cases
export const breakpointQueries = {
  isMobile: '(max-width: 767px)',
  isTablet: '(min-width: 768px) and (max-width: 1366px) and ((max-height: 900px) or (orientation: landscape))',
  isTabletHorizontal: '(min-width: 768px) and (max-width: 1366px) and (orientation: landscape)',
  isTabletVertical: '(min-width: 768px) and (max-width: 1366px) and (orientation: portrait) and (max-height: 900px)',
  isDesktop: '(min-width: 1367px), ((min-width: 1024px) and (min-height: 900px) and (orientation: portrait))'
} as const

// Custom hook for media query matching
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

// 🔧 FIX: Header navigation hook - was missing from exports
// PUBLIC WEBSITE navigation logic (different from dashboard admin)
export const useNavigationBreakpoints = () => {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsiveLayout()

  // PUBLIC SITE: Different thresholds than dashboard
  // Mobile + Tablet = hamburger menu, Desktop = full nav
  const shouldShowDesktopNav = isDesktop
  const shouldShowMobileNav = isMobile || isTablet
  const isTabletHorizontal = isTablet && typeof window !== 'undefined' &&
    window.innerWidth > window.innerHeight

  return {
    shouldShowDesktopNav,
    shouldShowMobileNav,
    currentBreakpoint: breakpoint,
    isTabletHorizontal
  }
}

