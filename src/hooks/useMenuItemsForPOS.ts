'use client'

// Menu Items for POS Hook
// Fetches available menu items with stock info for POS system

import { useQuery } from '@tanstack/react-query'
import { POSMenuItem } from '@/types/pos'

interface UseMenuItemsForPOSOptions {
  restaurantId?: string
  category?: string
  searchQuery?: string
  availableOnly?: boolean
}

interface GroupedMenuItems {
  [category: string]: POSMenuItem[]
}

export function useMenuItemsForPOS(options: UseMenuItemsForPOSOptions = {}) {
  const {
    restaurantId = 'rest_enigma_001',
    category,
    searchQuery,
    availableOnly = true,
  } = options

  // Fetch menu items
  const query = useQuery({
    queryKey: ['menu-items-pos', restaurantId, category, availableOnly],
    queryFn: async (): Promise<POSMenuItem[]> => {
      const params = new URLSearchParams()
      if (availableOnly) params.append('isAvailable', 'true')
      if (category) params.append('categoryId', category)

      const response = await fetch(`/api/menu/items?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch menu items')
      }

      const data = await response.json()

      // Transform items from /api/menu/items format
      const allItems: POSMenuItem[] = []

      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any) => {
          allItems.push({
            id: item.id,
            name: item.name,
            nameEn: item.nameEn,
            nameDe: item.nameDe,
            description: item.description,
            richDescription: item.richDescription,
            category: item.category?.name || 'Otros',
            subcategory: item.subcategory,
            price: item.price,
            imageUrl: item.imageUrl,
            stock: item.stock || 0,
            isAvailable: item.isAvailable !== false,
            allergens: item.allergens?.map((a: any) => a.name) || [],
          })
        })
      }

      return allItems
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  // Filter by search query (client-side)
  const filteredItems = query.data
    ? query.data.filter((item) => {
        if (!searchQuery) return true

        const search = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(search) ||
          item.nameEn?.toLowerCase().includes(search) ||
          item.nameDe?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search)
        )
      })
    : []

  // Group items by category
  const groupedItems: GroupedMenuItems = filteredItems.reduce((acc, item) => {
    const cat = item.category || 'Otros'
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(item)
    return acc
  }, {} as GroupedMenuItems)

  // Get unique categories
  const categories = Array.from(
    new Set((query.data || []).map((item) => item.category))
  ).sort()

  // Get items by specific category
  const getItemsByCategory = (cat: string): POSMenuItem[] => {
    return groupedItems[cat] || []
  }

  // Search items (fuzzy match)
  const searchItems = (query: string): POSMenuItem[] => {
    if (!query) return filteredItems

    const searchLower = query.toLowerCase()
    return filteredItems.filter((item) => {
      const score =
        (item.name.toLowerCase().includes(searchLower) ? 3 : 0) +
        (item.nameEn?.toLowerCase().includes(searchLower) ? 2 : 0) +
        (item.description?.toLowerCase().includes(searchLower) ? 1 : 0)

      return score > 0
    })
  }

  return {
    items: filteredItems,
    groupedItems,
    categories,
    getItemsByCategory,
    searchItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
