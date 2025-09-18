'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Comprehensive menu analytics interface
interface MenuAnalytics {
  // Item breakdown
  totalItems: number
  availableItems: number
  unavailableItems: number
  foodItems: number
  wineItems: number
  beverageItems: number

  // Category distribution
  categoryDistribution: Array<{
    id: string
    name: string
    nameEn?: string
    type: 'FOOD' | 'WINE' | 'BEVERAGE'
    count: number
    availableCount: number
  }>

  // Price analysis for business intelligence
  priceAnalysis: {
    min: number
    max: number
    average: number
    median: number
    range: number
  } | null

  // EU-14 allergen compliance
  allergenCompliance: {
    vegetarianItems: number
    veganItems: number
    glutenFreeItems: number
    dietaryCompliantItems: number
    complianceRate: number
  }

  // Wine pairing analytics
  wineAnalytics: {
    totalFoodItems: number
    totalWineItems: number
    totalPairings: number
    pairedFoodItems: number
    pairedWines: number
    foodPairingRate: number
    winePairingRate: number
  }

  // Popular items (could integrate with order history)
  popularItems: Array<{
    id: string
    name: string
    nameEn?: string
    category: string
    price: number
    rank: number
  }>

  lastUpdated: string
}

interface UseMenuAnalyticsReturn {
  analytics: MenuAnalytics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Custom hook for menu analytics following established patterns
export function useMenuAnalytics(): UseMenuAnalyticsReturn {
  const [analytics, setAnalytics] = useState<MenuAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setError(null)
      const response = await fetch('/api/menu/analytics', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.analytics) {
        setAnalytics(data.analytics)
      } else {
        setError(data.error || 'Error fetching analytics')
      }
    } catch (err) {
      console.error('Error fetching menu analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  // Effect for initial data load
  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Real-time subscriptions following established Supabase patterns
  useEffect(() => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      db: { schema: 'restaurante' }
    })

    // Subscribe to menu_items changes for real-time updates
    const menuItemsChannel = supabase
      .channel('menu_analytics_items')
      .on('postgres_changes', {
        event: '*',
        schema: 'restaurante',
        table: 'menu_items'
      }, (payload) => {
        console.log('Menu items updated, refetching analytics:', payload)
        fetchAnalytics()
      })
      .subscribe()

    // Subscribe to wine_pairings changes
    const pairingsChannel = supabase
      .channel('menu_analytics_pairings')
      .on('postgres_changes', {
        event: '*',
        schema: 'restaurante',
        table: 'wine_pairings'
      }, (payload) => {
        console.log('Wine pairings updated, refetching analytics:', payload)
        fetchAnalytics()
      })
      .subscribe()

    // Subscribe to categories changes
    const categoriesChannel = supabase
      .channel('menu_analytics_categories')
      .on('postgres_changes', {
        event: '*',
        schema: 'restaurante',
        table: 'menu_categories'
      }, (payload) => {
        console.log('Categories updated, refetching analytics:', payload)
        fetchAnalytics()
      })
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(menuItemsChannel)
      supabase.removeChannel(pairingsChannel)
      supabase.removeChannel(categoriesChannel)
    }
  }, [])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  }
}