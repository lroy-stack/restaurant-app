'use client'

import { useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery'

/**
 * Breakpoint Type Definition
 */
export type BreakpointName = 'mobile' | 'tablet' | 'desktop'

/**
 * useBreakpointName Hook - Clean Breakpoint Detection
 *
 * Simple, testable breakpoint name detection following:
 * - Dripsy: useBreakpointIndex pattern
 * - React Grid Layout: Clean breakpoint identification
 * - Industry standard: Single responsibility principle
 *
 * @returns BreakpointName - Current active breakpoint name
 */
export function useBreakpointName(): BreakpointName {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()

  // Priority order: mobile -> tablet -> desktop (fallback)
  // This ensures clean logic without complex conditions
  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop' // Desktop is fallback for any screen >= 1024px
}

/**
 * useBreakpointValue Hook - Responsive Value Selection
 *
 * Following Dripsy pattern of responsive arrays:
 * fontSize: [14, 16, 20] // mobile, tablet, desktop
 *
 * @param values - Array of values [mobile, tablet, desktop]
 * @returns T - Value for current breakpoint
 */
export function useBreakpointValue<T>(values: [T, T, T]): T {
  const breakpoint = useBreakpointName()
  const [mobile, tablet, desktop] = values

  switch (breakpoint) {
    case 'mobile':
      return mobile
    case 'tablet':
      return tablet
    case 'desktop':
      return desktop
    default:
      return desktop // Fallback
  }
}

/**
 * useBreakpointIndex Hook - Index-based Detection
 *
 * Following Dripsy useBreakpointIndex pattern
 * Useful for array-based responsive values
 *
 * @returns number - 0: mobile, 1: tablet, 2: desktop
 */
export function useBreakpointIndex(): number {
  const breakpoint = useBreakpointName()

  switch (breakpoint) {
    case 'mobile':
      return 0
    case 'tablet':
      return 1
    case 'desktop':
      return 2
    default:
      return 2 // Desktop fallback
  }
}

/**
 * Breakpoint Utilities - Static Helpers
 */
export const breakpointNames: readonly BreakpointName[] = ['mobile', 'tablet', 'desktop']
export const breakpointPx = { mobile: 0, tablet: 768, desktop: 1024 } as const