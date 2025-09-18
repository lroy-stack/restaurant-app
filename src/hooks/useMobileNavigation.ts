'use client'

import { useEffect, useRef } from 'react'
import { useUIStore, useResponsiveLayout } from './useResponsiveLayout'

export const useMobileNavigation = () => {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore()
  const { isMobile, isTablet } = useResponsiveLayout()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  
  // Auto-close sidebar on outside click for mobile/tablet
  useEffect(() => {
    if ((isMobile || isTablet) && sidebarOpen) {
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
  }, [isMobile, isTablet, sidebarOpen, closeSidebar])
  
  // Touch gesture support for mobile
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return
    
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
  }, [isMobile, sidebarOpen, closeSidebar])
  
  // Disable body scroll when mobile sidebar is open WITHOUT position fixed
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, sidebarOpen])
  
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
    isMobile,
    isTablet
  }
}