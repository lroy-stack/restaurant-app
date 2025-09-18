'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { MenuItemWithAllergens, MenuItemFormData } from '../schemas/menu-item.schema'

interface MenuFilters {
  search?: string
  categoryId?: string
  type?: 'FOOD' | 'WINE' | 'BEVERAGE'
  isAvailable?: string
  isVegetarian?: string
  isVegan?: string
  isGlutenFree?: string
  allergenId?: string
}

interface MenuSummary {
  totalItems: number
  availableItems: number
  unavailableItems: number
  vegetarianItems: number
  veganItems: number
  glutenFreeItems: number
  priceRange: {
    min: number
    max: number
    average: number
  } | null
}

interface UseMenuItemsReturn {
  menuItems: MenuItemWithAllergens[]
  summary: MenuSummary | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createItem: (data: MenuItemFormData) => Promise<boolean>
  updateItem: (id: string, data: Partial<MenuItemFormData>) => Promise<boolean>
  deleteItem: (id: string) => Promise<boolean>
  toggleAvailability: (id: string, isAvailable: boolean) => Promise<boolean>
  updateStock: (id: string, newStock: number) => Promise<boolean>
  quickStockAction: (id: string, action: 'add5' | 'add10' | 'subtract5' | 'zero') => Promise<boolean>
}

export function useMenuItems(filters: MenuFilters = {}): UseMenuItemsReturn {
  const [menuItems, setMenuItems] = useState<MenuItemWithAllergens[]>([])
  const [summary, setSummary] = useState<MenuSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable filters reference to prevent infinite loops
  const stableFilters = useMemo(() => filters, [
    filters.search,
    filters.categoryId,
    filters.type,
    filters.isAvailable,
    filters.isVegetarian,
    filters.isVegan,
    filters.isGlutenFree,
    filters.allergenId
  ])

  const buildQueryString = useCallback((filters: MenuFilters) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return params.toString()
  }, [])

  const fetchMenuItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryString = buildQueryString(stableFilters)
      const url = `/api/menu/items${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch menu items')
      }

      setMenuItems(data.items || [])
      setSummary(data.summary || null)

    } catch (err) {
      console.error('Error fetching menu items:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setMenuItems([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [stableFilters, buildQueryString])

  const createItem = useCallback(async (data: MenuItemFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/menu/items', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create menu item')
      }

      // Refresh the data
      await fetchMenuItems()
      return true

    } catch (err) {
      console.error('Error creating menu item:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al crear elemento: ${errorMessage}`)
      return false
    }
  }, [fetchMenuItems])

  const updateItem = useCallback(async (id: string, data: Partial<MenuItemFormData>): Promise<boolean> => {
    try {
      // Optimistic update: update local state immediately
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, ...data } : item
        )
      )

      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update menu item')
      }

      // Update with server response to ensure data consistency
      if (result.item) {
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, ...result.item } : item
          )
        )
      }

      return true

    } catch (err) {
      console.error('Error updating menu item:', err)

      // Revert optimistic update on error by refetching
      await fetchMenuItems()

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al actualizar elemento: ${errorMessage}`)
      return false
    }
  }, [fetchMenuItems])

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    // Store the item for potential revert
    const itemToDelete = menuItems.find(item => item.id === id)
    if (!itemToDelete) {
      toast.error('Elemento no encontrado')
      return false
    }

    // Optimistic removal: remove from UI immediately
    setMenuItems(prevItems => prevItems.filter(item => item.id !== id))

    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Revert: add the item back
        setMenuItems(prevItems => [...prevItems, itemToDelete])
        throw new Error(result.error || 'Failed to delete menu item')
      }

      return true

    } catch (err) {
      console.error('Error deleting menu item:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al eliminar elemento: ${errorMessage}`)
      return false
    }
  }, [menuItems])

  const toggleAvailability = useCallback(async (id: string, isAvailable: boolean): Promise<boolean> => {
    // Immediate UI feedback
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, isAvailable } : item
      )
    )

    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Revert on error
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, isAvailable: !isAvailable } : item
          )
        )
        throw new Error(result.error || 'Failed to toggle availability')
      }

      return true

    } catch (err) {
      console.error('Error toggling availability:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al cambiar disponibilidad: ${errorMessage}`)
      return false
    }
  }, [])

  const updateStock = useCallback(async (id: string, newStock: number): Promise<boolean> => {
    // Immediate UI feedback
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, stock: newStock } : item
      )
    )

    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Revert on error by fetching fresh data
        await fetchMenuItems()
        throw new Error(result.error || 'Failed to update stock')
      }

      return true

    } catch (err) {
      console.error('Error updating stock:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al actualizar stock: ${errorMessage}`)
      return false
    }
  }, [fetchMenuItems])

  const quickStockAction = useCallback(async (id: string, action: 'add5' | 'add10' | 'subtract5' | 'zero'): Promise<boolean> => {
    const currentItem = menuItems.find(item => item.id === id)
    if (!currentItem) {
      toast.error('Elemento no encontrado')
      return false
    }

    let newStock: number
    switch (action) {
      case 'add5':
        newStock = currentItem.stock + 5
        break
      case 'add10':
        newStock = currentItem.stock + 10
        break
      case 'subtract5':
        newStock = Math.max(0, currentItem.stock - 5)
        break
      case 'zero':
        newStock = 0
        break
      default:
        return false
    }

    // Update UI immediately
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, stock: newStock } : item
      )
    )

    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Revert on error
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, stock: currentItem.stock } : item
          )
        )
        throw new Error(result.error || 'Failed to update stock')
      }

      const actionNames = {
        add5: 'Añadidas 5 unidades',
        add10: 'Añadidas 10 unidades',
        subtract5: 'Reducidas 5 unidades',
        zero: 'Stock puesto a cero'
      }
      toast.success(`${actionNames[action]} - ${currentItem.name}`)
      return true

    } catch (err) {
      console.error('Error updating stock:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al actualizar stock: ${errorMessage}`)
      return false
    }
  }, [menuItems])

  const refetch = useCallback(async () => {
    await fetchMenuItems()
  }, [fetchMenuItems])

  // Initial fetch
  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  return {
    menuItems,
    summary,
    loading,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    updateStock,
    quickStockAction
  }
}