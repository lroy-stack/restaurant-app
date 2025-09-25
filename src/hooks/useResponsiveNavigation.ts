'use client'

import { useBreakpointName } from './useBreakpoint'

/**
 * useResponsiveNavigation Hook - Dashboard Navigation Logic
 *
 * Business logic for dashboard sidebar vs floating navigation
 * Following separation of concerns principle:
 * - Foundation: useBreakpointName (what device?)
 * - Business: useResponsiveNavigation (what behavior?)
 *
 * BEHAVIOR MATRIX:
 * - Desktop (1024px+): Fixed sidebar, no hamburger
 * - Tablet (768-1023px): Floating nav, hamburger button
 * - Mobile (0-767px): Floating nav, hamburger button
 *
 * @returns NavigationState - Complete navigation behavior state
 */
export interface NavigationState {
  /** Show fixed sidebar (desktop only) */
  shouldShowSidebar: boolean
  /** Show floating navigation with hamburger (mobile + tablet) */
  shouldShowFloatingNav: boolean
  /** Current breakpoint for debugging */
  currentBreakpoint: ReturnType<typeof useBreakpointName>
  /** Whether this is a mobile device */
  isMobile: boolean
  /** Whether this is a tablet device */
  isTablet: boolean
  /** Whether this is a desktop device */
  isDesktop: boolean
}

export function useResponsiveNavigation(): NavigationState {
  const currentBreakpoint = useBreakpointName()

  // TABLET-AWARE LOGIC: Only REAL desktop shows sidebar
  // Tablet horizontal (1024x768) should show hamburger, not sidebar
  const shouldShowSidebar = currentBreakpoint === 'desktop' &&
    typeof window !== 'undefined' &&
    window.innerWidth >= 1280 // Only screens 1280px+ get sidebar

  const shouldShowFloatingNav = !shouldShowSidebar // Inverse relationship

  // Device type helpers
  const isMobile = currentBreakpoint === 'mobile'
  const isTablet = currentBreakpoint === 'tablet' ||
    (currentBreakpoint === 'desktop' && typeof window !== 'undefined' && window.innerWidth < 1280)
  const isDesktop = currentBreakpoint === 'desktop' &&
    typeof window !== 'undefined' &&
    window.innerWidth >= 1280

  return {
    shouldShowSidebar,
    shouldShowFloatingNav,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop
  }
}

