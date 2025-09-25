'use client'

import { useEffect, useRef } from 'react'
import { useScrollContext } from '@/contexts/ScrollContext'

/**
 * useScrollLock Hook
 *
 * Professional scroll lock management with automatic cleanup
 * Follows project patterns for modular, scalable architecture
 *
 * Features:
 * - Unique lock IDs for coordination between components
 * - Automatic cleanup on unmount
 * - Conditional locking based on component state
 * - Clean API without direct DOM manipulation
 *
 * @param lockId - Unique identifier for this scroll lock
 * @param condition - When true, scroll is locked
 */

interface UseScrollLockOptions {
  lockId: string
  condition: boolean
  autoCleanup?: boolean
}

interface UseScrollLockReturn {
  isLocked: boolean
  enable: () => void
  disable: () => void
  toggle: () => void
  hasActiveLocks: () => boolean
  getActiveLocks: () => string[]
}

export function useScrollLock({
  lockId,
  condition,
  autoCleanup = true
}: UseScrollLockOptions): UseScrollLockReturn {
  const scrollContext = useScrollContext()
  const isActiveRef = useRef(false)
  const lockIdRef = useRef(lockId)

  // Update lockId ref if it changes
  useEffect(() => {
    lockIdRef.current = lockId
  }, [lockId])

  // Handle conditional scroll lock
  useEffect(() => {
    if (condition && !isActiveRef.current) {
      scrollContext.enableScrollLock(lockIdRef.current)
      isActiveRef.current = true
    } else if (!condition && isActiveRef.current) {
      scrollContext.disableScrollLock(lockIdRef.current)
      isActiveRef.current = false
    }
  }, [condition, scrollContext])

  // Cleanup on unmount if autoCleanup is enabled
  useEffect(() => {
    return () => {
      if (autoCleanup && isActiveRef.current) {
        scrollContext.disableScrollLock(lockIdRef.current)
        isActiveRef.current = false
      }
    }
  }, [autoCleanup, scrollContext])

  // Manual control functions
  const enable = () => {
    if (!isActiveRef.current) {
      scrollContext.enableScrollLock(lockIdRef.current)
      isActiveRef.current = true
    }
  }

  const disable = () => {
    if (isActiveRef.current) {
      scrollContext.disableScrollLock(lockIdRef.current)
      isActiveRef.current = false
    }
  }

  const toggle = () => {
    if (isActiveRef.current) {
      disable()
    } else {
      enable()
    }
  }

  return {
    isLocked: scrollContext.isScrollLocked,
    enable,
    disable,
    toggle,
    hasActiveLocks: scrollContext.hasActiveLocks,
    getActiveLocks: scrollContext.getActiveLocks
  }
}

/**
 * Convenience hook for simple boolean-based scroll locking
 * Most common use case in the application
 */
export function useConditionalScrollLock(lockId: string, condition: boolean) {
  return useScrollLock({
    lockId,
    condition,
    autoCleanup: true
  })
}