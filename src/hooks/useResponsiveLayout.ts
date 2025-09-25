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

        const breakpoint = width < 768
          ? 'mobile'
          : isTabletSize && (height < 900 || isLandscape)
            ? 'tablet'
            : 'desktop'

        set({ breakpoint })
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

// 🚨 NEW: Specific hooks for navigation behavior
export const useNavigationBreakpoints = () => {
  const { breakpoint } = useResponsiveLayout()
  const isTabletHorizontal = useMediaQuery(breakpointQueries.isTabletHorizontal)

  return {
    // For public header: Should show desktop nav only on real desktop
    shouldShowDesktopNav: breakpoint === 'desktop' && !isTabletHorizontal,
    // For mobile menu: Show hamburger on mobile AND tablet (including horizontal)
    shouldShowMobileNav: breakpoint === 'mobile' || breakpoint === 'tablet',
    // For dashboard sidebar: Show full sidebar only on real desktop
    shouldShowSidebar: breakpoint === 'desktop' && !isTabletHorizontal,
    // For floating nav: Show on mobile and tablet
    shouldShowFloatingNav: breakpoint === 'mobile' || breakpoint === 'tablet',
    // Current breakpoint for debugging
    currentBreakpoint: breakpoint,
    isTabletHorizontal
  }
}