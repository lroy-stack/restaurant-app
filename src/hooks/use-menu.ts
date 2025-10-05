'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MenuFilterData } from '@/lib/validations/menu'

export interface MenuItem {
  id: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  price: number
  isRecommended: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isLactoseFree: boolean
  // Allergen information
  containsGluten: boolean
  containsMilk: boolean
  containsEggs: boolean
  containsNuts: boolean
  containsFish: boolean
  containsShellfish: boolean
  containsSoy: boolean
  containsCelery: boolean
  containsMustard: boolean
  containsSesame: boolean
  containsSulfites: boolean
  containsLupin: boolean
  containsMollusks: boolean
  containsPeanuts: boolean
  images: string[]
  imageUrl?: string
  displayOrder: number
  glassPrice?: number
  alcoholContent?: number
  vintage?: number
  isOrganic: boolean
  allergens?: Array<{
    id: string
    name: string
    nameEn?: string
  }>
  winePairings?: Array<any>
  foodPairings?: Array<any>
}

export interface MenuCategory {
  id: string
  name: string
  nameEn?: string
  description?: string
  descriptionEn?: string
  type: 'FOOD' | 'WINE' | 'BEVERAGE'
  displayOrder: number
  icon?: string
  menuItems: MenuItem[]
}

export interface MenuData {
  categories: MenuCategory[]
  summary: {
    totalItems: number
    recommendedItems: number
    wineItems?: number
    vegetarianItems: number
    veganItems: number
    priceRange: {
      min: number
      max: number
      average: number
    } | null
  }
  filters: MenuFilterData
}

export function useMenu(filters?: MenuFilterData) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['menu', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, value.toString())
          }
        })
      }

      const url = `/api/menu?${queryParams}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Error al cargar el menú')
      }

      return response.json() as Promise<MenuData>
    },
    staleTime: 5 * 60 * 1000, // Menu rarely changes
  })

  // Helper functions (keep existing logic)
  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    if (!query.data) return []
    const category = query.data.categories.find(cat => cat.id === categoryId)
    return category?.menuItems || []
  }

  const searchItems = (searchQuery: string): MenuItem[] => {
    if (!query.data || !searchQuery.trim()) return []

    const searchTerm = searchQuery.toLowerCase()
    const allItems = query.data.categories.flatMap(cat => cat.menuItems)

    return allItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.nameEn?.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.descriptionEn?.toLowerCase().includes(searchTerm)
    )
  }

  const getRecommendedItems = (): MenuItem[] => {
    if (!query.data) return []
    return query.data.categories.flatMap(cat =>
      cat.menuItems.filter(item => item.isRecommended)
    )
  }

  const getVegetarianItems = (): MenuItem[] => {
    if (!query.data) return []
    return query.data.categories.flatMap(cat =>
      cat.menuItems.filter(item => item.isVegetarian)
    )
  }

  const getVeganItems = (): MenuItem[] => {
    if (!query.data) return []
    return query.data.categories.flatMap(cat =>
      cat.menuItems.filter(item => item.isVegan)
    )
  }

  const filterByAllergens = (excludeAllergens: string[]) => {
    const newFilters: MenuFilterData = { ...filters }

    excludeAllergens.forEach(allergen => {
      const filterKey = `exclude${allergen.charAt(0).toUpperCase() + allergen.slice(1)}` as keyof MenuFilterData
      ;(newFilters as any)[filterKey] = true
    })

    // Invalidate and refetch with new filters
    queryClient.invalidateQueries({ queryKey: ['menu', newFilters] })
  }

  return {
    menu: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    filterByAllergens,
    getItemsByCategory,
    searchItems,
    getRecommendedItems,
    getVegetarianItems,
    getVeganItems,
    // React Query extras
    isFetching: query.isFetching,
    isStale: query.isStale,
  }
}

// Prefetch hook for SSR/RSC
export function usePrefetchMenu(filters?: MenuFilterData) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['menu', filters],
      queryFn: async () => {
        const queryParams = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.set(key, value.toString())
            }
          })
        }
        const response = await fetch(`/api/menu?${queryParams}`)
        return response.json()
      }
    })
  }
}