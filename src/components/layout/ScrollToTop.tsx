'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page when:
 * 1. Route changes (navigation between pages)
 * 2. Page reloads
 *
 * This ensures users always start at the header, not mid-page or footer
 */
export function ScrollToTop() {
  const pathname = usePathname()

  // Disable browser scroll restoration globally
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Force scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Force scroll to top on initial load with multiple attempts
  useEffect(() => {
    // Immediate scroll
    window.scrollTo(0, 0)

    // Also try after a short delay to override any other scroll logic
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)

    // And after DOM is fully loaded
    const timeoutId2 = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(timeoutId2)
    }
  }, [])

  return null
}
