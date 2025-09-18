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
        const breakpoint = width >= 1024 ? 'desktop' 
          : width >= 768 ? 'tablet' 
          : 'mobile'
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

// Responsive breakpoint utilities
export const breakpoints = {
  mobile: 'max-width: 767px',
  tablet: 'min-width: 768px and max-width: 1023px', 
  desktop: 'min-width: 1024px'
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