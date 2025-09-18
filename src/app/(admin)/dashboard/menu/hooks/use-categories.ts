'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { CategoryWithStats, CategoryFormData } from '../schemas/category.schema'

interface CategoryFilters {
  type?: 'FOOD' | 'WINE' | 'BEVERAGE'
  isActive?: string
  search?: string
}

interface CategorySummary {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  categoriesByType: {
    FOOD: number
    WINE: number
    BEVERAGE: number
  }
  totalItems: number
  averageItemsPerCategory: number
}

interface UseCategoriesReturn {
  categories: CategoryWithStats[]
  summary: CategorySummary | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCategory: (data: CategoryFormData) => Promise<boolean>
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<boolean>
  deleteCategory: (id: string) => Promise<boolean>
  reorderCategories: (reorderedCategories: { id: string; order: number }[]) => Promise<boolean>
}

export function useCategories(filters: CategoryFilters = {}): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [summary, setSummary] = useState<CategorySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable filters reference to prevent infinite loops
  const stableFilters = useMemo(() => filters, [
    filters.type,
    filters.isActive,
    filters.search
  ])

  const buildQueryString = useCallback((filters: CategoryFilters) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return params.toString()
  }, [])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryString = buildQueryString(stableFilters)
      const url = `/api/menu/categories${queryString ? `?${queryString}` : ''}`

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
        throw new Error(data.error || 'Failed to fetch categories')
      }

      setCategories(data.categories || [])
      setSummary(data.summary || null)

    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setCategories([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [stableFilters, buildQueryString])

  const createCategory = useCallback(async (data: CategoryFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create category')
      }

      // Refresh the data
      await fetchCategories()
      return true

    } catch (err) {
      console.error('Error creating category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al crear categoría: ${errorMessage}`)
      return false
    }
  }, [fetchCategories])

  const updateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/menu/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update category')
      }

      // Refresh the data
      await fetchCategories()
      return true

    } catch (err) {
      console.error('Error updating category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al actualizar categoría: ${errorMessage}`)
      return false
    }
  }, [fetchCategories])

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/menu/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete category')
      }

      // Refresh the data
      await fetchCategories()
      return true

    } catch (err) {
      console.error('Error deleting category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al eliminar categoría: ${errorMessage}`)
      return false
    }
  }, [fetchCategories])

  const reorderCategories = useCallback(async (reorderedCategories: { id: string; order: number }[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/menu/categories/reorder', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: reorderedCategories }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to reorder categories')
      }

      // Refresh the data
      await fetchCategories()
      return true

    } catch (err) {
      console.error('Error reordering categories:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Error al reordenar categorías: ${errorMessage}`)
      return false
    }
  }, [fetchCategories])

  const refetch = useCallback(async () => {
    await fetchCategories()
  }, [fetchCategories])

  // Initial fetch
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    summary,
    loading,
    error,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  }
}