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

  useEffect(() => {
    // Scroll to top immediately on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instant scroll, no smooth animation
    })
  }, [pathname]) // Triggers on every route change

  // Also handle initial page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return null
}
