'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'

// Types for scroll lock management
interface ScrollLockState {
  isLocked: boolean
  lockedBy: Set<string>
  scrollPosition: number
}

interface ScrollContextType {
  // State
  isScrollLocked: boolean

  // Actions
  enableScrollLock: (lockId: string) => void
  disableScrollLock: (lockId: string) => void

  // Utils
  hasActiveLocks: () => boolean
  getActiveLocks: () => string[]
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined)

// Hook to use scroll context
export const useScrollContext = () => {
  const context = useContext(ScrollContext)
  if (context === undefined) {
    throw new Error('useScrollContext must be used within a ScrollProvider')
  }
  return context
}

// Scroll Provider Component
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollState, setScrollState] = useState<ScrollLockState>({
    isLocked: false,
    lockedBy: new Set(),
    scrollPosition: 0
  })

  const scrollRestoreRef = useRef<number>(0)
  const bodyStyleRef = useRef<string>('')

  // Enable scroll lock with unique ID - MEMOIZED to prevent infinite loops
  const enableScrollLock = useCallback((lockId: string) => {
    setScrollState(prev => {
      const newLockedBy = new Set(prev.lockedBy)
      newLockedBy.add(lockId)

      // Only apply DOM changes if this is the first lock
      if (!prev.isLocked) {
        // Save current scroll position and body style
        scrollRestoreRef.current = window.scrollY
        bodyStyleRef.current = document.body.style.overflow || ''

        // Apply scroll lock
        document.body.style.overflow = 'hidden'

        return {
          isLocked: true,
          lockedBy: newLockedBy,
          scrollPosition: scrollRestoreRef.current
        }
      }

      // Just add to the set if already locked
      return {
        ...prev,
        lockedBy: newLockedBy
      }
    })
  }, [])

  // Disable scroll lock for specific ID - MEMOIZED to prevent infinite loops
  const disableScrollLock = useCallback((lockId: string) => {
    setScrollState(prev => {
      const newLockedBy = new Set(prev.lockedBy)
      newLockedBy.delete(lockId)

      // Only restore if no more active locks
      if (newLockedBy.size === 0 && prev.isLocked) {
        // Restore scroll and body style
        document.body.style.overflow = bodyStyleRef.current

        // DON'T restore scroll position - let the page stay where it is
        // or let ScrollToTop component handle it
        // This prevents unwanted scroll restoration

        return {
          isLocked: false,
          lockedBy: newLockedBy,
          scrollPosition: 0
        }
      }

      // Keep locked if there are still active locks
      return {
        ...prev,
        lockedBy: newLockedBy
      }
    })
  }, [])

  // Utility functions - MEMOIZED to prevent infinite loops
  const hasActiveLocks = useCallback(() => scrollState.lockedBy.size > 0, [scrollState.lockedBy])
  const getActiveLocks = useCallback(() => Array.from(scrollState.lockedBy), [scrollState.lockedBy])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Restore scroll on cleanup
      if (scrollState.isLocked) {
        document.body.style.overflow = bodyStyleRef.current
      }
    }
  }, [])

  // MEMOIZE contextValue to prevent infinite loops
  // Only recreate when isLocked actually changes, not on every render
  const contextValue: ScrollContextType = useMemo(() => ({
    isScrollLocked: scrollState.isLocked,
    enableScrollLock,
    disableScrollLock,
    hasActiveLocks,
    getActiveLocks
  }), [scrollState.isLocked, enableScrollLock, disableScrollLock, hasActiveLocks, getActiveLocks])

  return (
    <ScrollContext.Provider value={contextValue}>
      {children}
    </ScrollContext.Provider>
  )
}