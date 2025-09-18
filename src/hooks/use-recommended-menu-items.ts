import { useState, useEffect, useCallback } from 'react'

export interface RecommendedMenuItem {
  id: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  price: number
  isAvailable: boolean
  isRecommended: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  imageUrl?: string
  categoryId: string
  category?: {
    id: string
    name: string
    nameEn?: string
    type: 'FOOD' | 'WINE' | 'BEVERAGE'
  }
  allergens?: Array<{
    id: string
    name: string
    nameEn?: string
  }>
  createdAt: string
  updatedAt: string
}

export interface UseRecommendedMenuItemsResult {
  recommendedItems: RecommendedMenuItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener elementos del menú marcados como recomendados
 * Utiliza la API existente con filtros específicos para elementos destacados
 */
export function useRecommendedMenuItems(): UseRecommendedMenuItemsResult {
  const [recommendedItems, setRecommendedItems] = useState<RecommendedMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🚨 EMERGENCY FIX: Added state dependencies to prevent infinite loops
  const fetchRecommendedItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar la API existente con filtros para elementos recomendados disponibles
      // Solo COMIDA (FOOD) - no bebidas ni vinos
      const queryParams = new URLSearchParams({
        isRecommended: 'true',
        isAvailable: 'true',
        type: 'FOOD'
      })

      const response = await fetch(`/api/menu/items?${queryParams}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Error fetching recommended items`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'API returned unsuccessful response')
      }

      // Transformar los datos (ya filtrados por la API)
      const validatedItems = (data.items || []).map((item: any): RecommendedMenuItem => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        description: item.description,
        descriptionEn: item.descriptionEn,
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
        isAvailable: Boolean(item.isAvailable),
        isRecommended: Boolean(item.isRecommended),
        isVegetarian: Boolean(item.isVegetarian),
        isVegan: Boolean(item.isVegan),
        isGlutenFree: Boolean(item.isGlutenFree),
        imageUrl: item.imageUrl,
        categoryId: item.categoryId,
        category: item.category,
        allergens: item.allergens || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))

      setRecommendedItems(validatedItems)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar platos recomendados'
      setError(errorMessage)
      setRecommendedItems([])
    } finally {
      setLoading(false)
    }
  }, []) // EMERGENCY: Keep empty dependencies but prevent hook recreation

  // 🚨 EMERGENCY FIX: Remove fetchRecommendedItems dependency to stop infinite loop
  useEffect(() => {
    fetchRecommendedItems()
  }, []) // Only run on mount - prevents infinite database scans

  return {
    recommendedItems,
    loading,
    error,
    refetch: fetchRecommendedItems
  }
}

/**
 * Hook simplificado para obtener solo los primeros N elementos recomendados
 * Útil para mostrar en homepage sin cargar todos los elementos
 */
export function useTopRecommendedItems(limit: number = 4) {
  const { recommendedItems, loading, error, refetch } = useRecommendedMenuItems()

  return {
    topItems: recommendedItems.slice(0, limit),
    loading,
    error,
    refetch,
    totalCount: recommendedItems.length
  }
}