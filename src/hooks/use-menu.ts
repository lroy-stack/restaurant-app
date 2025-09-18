import { useState, useEffect } from 'react'
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
  displayOrder: number
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
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenu = async () => {
    try {
      console.log('fetchMenu called with filters:', filters)
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, value.toString())
          }
        })
      }

      const url = `/api/menu?${queryParams}`
      console.log('Fetching URL:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText)
        throw new Error('Error al cargar el menú')
      }

      const data = await response.json()
      console.log('Menu data received:', data)
      setMenu(data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  const filterByAllergens = (excludeAllergens: string[]) => {
    if (!menu) return

    const allergenMapping: Record<string, keyof MenuItem> = {
      gluten: 'containsGluten',
      milk: 'containsMilk',
      eggs: 'containsEggs',
      nuts: 'containsNuts',
      fish: 'containsFish',
      shellfish: 'containsShellfish',
      soy: 'containsSoy',
      celery: 'containsCelery',
      mustard: 'containsMustard',
      sesame: 'containsSesame',
      sulfites: 'containsSulfites',
      lupin: 'containsLupin',
      mollusks: 'containsMollusks',
      peanuts: 'containsPeanuts',
    }

    const newFilters: MenuFilterData = { ...filters }
    
    excludeAllergens.forEach(allergen => {
      const filterKey = `exclude${allergen.charAt(0).toUpperCase() + allergen.slice(1)}` as keyof MenuFilterData
      ;(newFilters as any)[filterKey] = true
    })

    return fetchMenu()
  }

  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    if (!menu) return []
    const category = menu.categories.find(cat => cat.id === categoryId)
    return category?.menuItems || []
  }

  const searchItems = (query: string): MenuItem[] => {
    if (!menu || !query.trim()) return []
    
    const searchTerm = query.toLowerCase()
    const allItems = menu.categories.flatMap(cat => cat.menuItems)
    
    return allItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.nameEn?.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.descriptionEn?.toLowerCase().includes(searchTerm)
    )
  }

  const getRecommendedItems = (): MenuItem[] => {
    if (!menu) return []
    return menu.categories.flatMap(cat => cat.menuItems.filter(item => item.isRecommended))
  }

  const getVegetarianItems = (): MenuItem[] => {
    if (!menu) return []
    return menu.categories.flatMap(cat => cat.menuItems.filter(item => item.isVegetarian))
  }

  const getVeganItems = (): MenuItem[] => {
    if (!menu) return []
    return menu.categories.flatMap(cat => cat.menuItems.filter(item => item.isVegan))
  }

  // 🚨 EMERGENCY FIX: Add filters dependency to prevent stale closures causing infinite loops
  useEffect(() => {
    fetchMenu()
  }, [filters]) // Include filters dependency to prevent stale data loops

  return {
    menu,
    loading,
    error,
    refetch: fetchMenu,
    filterByAllergens,
    getItemsByCategory,
    searchItems,
    getRecommendedItems,
    getVegetarianItems,
    getVeganItems,
  }
}