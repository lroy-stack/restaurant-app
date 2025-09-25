'use client'

import { useEffect, useRef } from 'react'
import { useUIStore } from './useResponsiveLayout'
import { useResponsiveNavigation } from './useResponsiveNavigation'

/**
 * useMobileNavigation Hook
 *
 * SINGLE RESPONSIBILITY: Mobile navigation UI state and interactions
 * - Sidebar open/close state management
 * - Touch gesture handling for navigation
 * - Keyboard shortcuts (ESC)
 * - Outside click detection
 *
 * DOES NOT HANDLE: Scroll locking (use useScrollLock separately)
 */

export const useMobileNavigation = () => {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore()
  const { shouldShowFloatingNav, shouldShowSidebar } = useResponsiveNavigation()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Auto-close sidebar on outside click for mobile/tablet
  useEffect(() => {
    if (shouldShowFloatingNav && sidebarOpen) {
      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as Node

        // Don't close if clicking inside sidebar
        if (sidebarRef.current?.contains(target)) {
          return
        }

        // Don't close if clicking on hamburger button
        const hamburgerButton = document.querySelector('[data-mobile-nav-toggle]')
        if (hamburgerButton?.contains(target)) {
          return
        }

        closeSidebar()
      }

      // Small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleOutsideClick)
      }
    }
  }, [shouldShowFloatingNav, sidebarOpen, closeSidebar])

  // Touch gesture support for floating nav
  useEffect(() => {
    if (!shouldShowFloatingNav || !sidebarOpen) return

    let startX: number
    let startY: number

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return

      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY

      const diffX = startX - currentX
      const diffY = startY - currentY

      // Horizontal swipe left to close sidebar
      if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
        closeSidebar()
      }
    }

    const handleTouchEnd = () => {
      startX = 0
      startY = 0
    }

    if (sidebarRef.current) {
      sidebarRef.current.addEventListener('touchstart', handleTouchStart, { passive: true })
      sidebarRef.current.addEventListener('touchmove', handleTouchMove, { passive: true })
      sidebarRef.current.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      if (sidebarRef.current) {
        sidebarRef.current.removeEventListener('touchstart', handleTouchStart)
        sidebarRef.current.removeEventListener('touchmove', handleTouchMove)
        sidebarRef.current.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [shouldShowFloatingNav, sidebarOpen, closeSidebar])

  // Keyboard support (ESC to close)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  return {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    sidebarRef,
    overlayRef,
    shouldShowFloatingNav,
    shouldShowSidebar
  }
}