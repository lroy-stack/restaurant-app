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

  // Simple, clear business logic
  const shouldShowSidebar = currentBreakpoint === 'desktop'
  const shouldShowFloatingNav = !shouldShowSidebar // Inverse relationship

  // Device type helpers
  const isMobile = currentBreakpoint === 'mobile'
  const isTablet = currentBreakpoint === 'tablet'
  const isDesktop = currentBreakpoint === 'desktop'

  return {
    shouldShowSidebar,
    shouldShowFloatingNav,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop
  }
}

