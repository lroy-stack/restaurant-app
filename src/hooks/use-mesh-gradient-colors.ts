'use client'

import { useState, useEffect, useCallback } from 'react'

interface MeshGradientColors {
  color1: string
  color2: string
  isLoaded: boolean
}

/**
 * useMeshGradientColors Hook
 *
 * Dynamically reads mesh gradient colors from CSS variables based on the current theme.
 * Automatically updates when theme changes through MutationObserver.
 *
 * Features:
 * - Reads --mesh-gradient-color-1 and --mesh-gradient-color-2 CSS variables
 * - Observes theme class changes on document.documentElement
 * - Provides fallback colors for SSR compatibility
 * - Optimized with memoization and cleanup
 *
 * @returns {MeshGradientColors} Object with color1, color2, and isLoaded status
 */
export function useMeshGradientColors(): MeshGradientColors {
  const [colors, setColors] = useState<MeshGradientColors>({
    color1: '#e0eaff', // Atlantic Blue fallback
    color2: '#237685', // Atlantic Blue fallback
    isLoaded: false
  })

  const updateColors = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const style = getComputedStyle(document.documentElement)

      const color1 = style.getPropertyValue('--mesh-gradient-color-1').trim()
      const color2 = style.getPropertyValue('--mesh-gradient-color-2').trim()

      // Only update if we got valid color values
      if (color1 && color2) {
        setColors({
          color1,
          color2,
          isLoaded: true
        })
      }
    } catch (error) {
      console.warn('Failed to read mesh gradient colors from CSS variables:', error)
      // Keep fallback colors
    }
  }, [])

  useEffect(() => {
    // Initial color update
    updateColors()

    // Create MutationObserver to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          // Small delay to ensure CSS variables are updated
          setTimeout(updateColors, 50)
        }
      })
    })

    // Start observing theme class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Also listen for manual theme toggle events if any
    const handleThemeChange = () => {
      setTimeout(updateColors, 50)
    }

    window.addEventListener('themechange', handleThemeChange)

    // Cleanup
    return () => {
      observer.disconnect()
      window.removeEventListener('themechange', handleThemeChange)
    }
  }, [updateColors])

  return colors
}

/**
 * getMeshGradientColorsSync
 *
 * Synchronous utility function to get current mesh gradient colors
 * Useful for one-time reads without subscribing to changes
 *
 * @returns {[string, string]} Tuple of [color1, color2]
 */
export function getMeshGradientColorsSync(): [string, string] {
  if (typeof window === 'undefined') {
    return ['#e0eaff', '#237685'] // SSR fallback
  }

  try {
    const style = getComputedStyle(document.documentElement)
    const color1 = style.getPropertyValue('--mesh-gradient-color-1').trim() || '#e0eaff'
    const color2 = style.getPropertyValue('--mesh-gradient-color-2').trim() || '#237685'
    return [color1, color2]
  } catch {
    return ['#e0eaff', '#237685'] // Error fallback
  }
}