'use client'

import { useState, useEffect } from 'react'

export interface NavigationItem {
  id: string
  restaurant_id: string
  name: string
  href: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  is_cta: boolean
  created_at: string
  updated_at: string
}

export function useNavigation() {
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/navigation')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch navigation')
        }

        setNavigation(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching navigation:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNavigation()
  }, [])

  // Helper: Get regular nav items (non-CTA)
  const getNavItems = (): NavigationItem[] => {
    return navigation.filter(item => !item.is_cta)
  }

  // Helper: Get CTA button
  const getCTA = (): NavigationItem | null => {
    return navigation.find(item => item.is_cta) || null
  }

  return {
    navigation,
    loading,
    error,
    getNavItems,
    getCTA
  }
}
