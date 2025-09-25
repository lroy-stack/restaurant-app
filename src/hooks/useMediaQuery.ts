'use client'

import { useState, useEffect } from 'react'

/**
 * useMediaQuery Hook - Industry Standard
 *
 * CSS media query detection hook following industry patterns:
 * - Dripsy: Pure CSS media query approach
 * - react-use-measure: Performance optimized listeners
 * - React Grid Layout: Reliable breakpoint detection
 *
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean - Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Event handler for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      // Legacy browser support
      mediaQuery.addListener(handler)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else {
        mediaQuery.removeListener(handler)
      }
    }
  }, [query])

  return matches
}

/**
 * Standard Breakpoint Queries - Tailwind Compatible
 *
 * Industry standard breakpoints following:
 * - Tailwind CSS: sm:768px, md:1024px+
 * - Bootstrap: Similar breakpoint philosophy
 * - React Grid Layout: Fixed, predictable breakpoints
 */
export const breakpointQueries = {
  // Mobile: 0-767px
  mobile: '(max-width: 767px)',

  // Tablet: 768-1023px (iPad vertical = tablet ✅)
  tablet: '(min-width: 768px) and (max-width: 1023px)',

  // Desktop: 1024px+ (iPad horizontal = desktop ✅)
  desktop: '(min-width: 1024px)',

  // Orientation specific (optional usage)
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  // Specific device queries (advanced usage)
  tabletVertical: '(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)',
  tabletHorizontal: '(min-width: 768px) and (max-width: 1023px) and (orientation: landscape)'
} as const

/**
 * Breakpoint Hook Factory
 *
 * Provides individual hooks for each breakpoint
 * Following Dripsy pattern of specialized hooks
 */
export const useIsMobile = () => useMediaQuery(breakpointQueries.mobile)
export const useIsTablet = () => useMediaQuery(breakpointQueries.tablet)
export const useIsDesktop = () => useMediaQuery(breakpointQueries.desktop)
export const useIsPortrait = () => useMediaQuery(breakpointQueries.portrait)
export const useIsLandscape = () => useMediaQuery(breakpointQueries.landscape)