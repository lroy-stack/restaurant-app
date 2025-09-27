'use client'

import { useEffect, useRef } from 'react'

interface PerformanceEntry {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
}

export function usePerformanceMonitor() {
  const metrics = useRef<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  })

  useEffect(() => {
    // Only run on client side and in production
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
      return
    }

    let observer: PerformanceObserver

    try {
      // Import web-vitals dynamically to avoid SSR issues
      import('web-vitals').then(({ getCLS, getFCP, getFID, getLCP, getTTFB }) => {

        const reportMetric = (metric: PerformanceEntry) => {
          const { name, value, rating } = metric

          // Store metrics
          switch (name) {
            case 'LCP':
              metrics.current.lcp = value
              break
            case 'FID':
              metrics.current.fid = value
              break
            case 'CLS':
              metrics.current.cls = value
              break
            case 'FCP':
              metrics.current.fcp = value
              break
            case 'TTFB':
              metrics.current.ttfb = value
              break
          }

          // Send to analytics (replace with your analytics service)
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', name, {
              value: Math.round(name === 'CLS' ? value * 1000 : value),
              custom_parameter_1: rating,
              custom_parameter_2: window.location.pathname,
            })
          }

          // Console log in development for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${name}: ${value} (${rating})`)
          }

          // Performance budget alerts
          const budgets = {
            LCP: 2500,
            FID: 100,
            CLS: 0.1,
            FCP: 1800,
            TTFB: 800
          }

          if (name in budgets && value > budgets[name as keyof typeof budgets]) {
            console.warn(`🚨 Performance Budget Exceeded: ${name} (${value}ms > ${budgets[name as keyof typeof budgets]}ms)`)
          }
        }

        // Register all core web vitals
        getCLS(reportMetric)
        getFCP(reportMetric)
        getFID(reportMetric)
        getLCP(reportMetric)
        getTTFB(reportMetric)

        // Resource timing observer for additional insights
        observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Track large resources
            if (entry.transferSize > 100000) { // >100KB
              console.warn(`🔍 Large Resource: ${entry.name} (${Math.round(entry.transferSize / 1024)}KB)`)
            }
          })
        })

        observer.observe({ entryTypes: ['resource', 'navigation'] })
      })
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  return {
    getMetrics: () => metrics.current,
    getPerformanceScore: () => {
      const { lcp, fid, cls } = metrics.current
      if (!lcp || !fid || cls === null) return null

      let score = 100
      if (lcp > 4000) score -= 40
      else if (lcp > 2500) score -= 20

      if (fid > 300) score -= 30
      else if (fid > 100) score -= 15

      if (cls > 0.25) score -= 30
      else if (cls > 0.1) score -= 15

      return Math.max(score, 0)
    }
  }
}