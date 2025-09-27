'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'

interface PerformanceContextValue {
  getMetrics: () => any
  getPerformanceScore: () => number | null
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined)

interface PerformanceProviderProps {
  children: ReactNode
  enableInProduction?: boolean
}

export function PerformanceProvider({
  children,
  enableInProduction = true
}: PerformanceProviderProps) {
  const { getMetrics, getPerformanceScore } = usePerformanceMonitor()

  useEffect(() => {
    // Add performance observer for resource timing
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Log slow resources in development
          if (process.env.NODE_ENV === 'development' && entry.duration > 1000) {
            console.warn(
              `🐌 Slow Resource: ${entry.name} took ${Math.round(entry.duration)}ms`
            )
          }
        })
      })

      observer.observe({
        entryTypes: ['navigation', 'resource', 'measure', 'paint']
      })

      return () => observer.disconnect()
    }
  }, [])

  // Only provide performance monitoring in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !enableInProduction) {
    return <>{children}</>
  }

  return (
    <PerformanceContext.Provider
      value={{
        getMetrics,
        getPerformanceScore,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// Development helper component
export function PerformanceDebugger() {
  const { getMetrics, getPerformanceScore } = usePerformance()

  // HIDDEN: Widget interfering with layout access
  return null
}