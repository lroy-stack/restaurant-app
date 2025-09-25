import { useState, useEffect, useCallback } from 'react'

export interface RecommendedWineItem {
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
  glassPrice?: number
  alcoholContent?: number
  createdAt: string
  updatedAt: string
}

export interface UseRecommendedWinesResult {
  recommendedWines: RecommendedWineItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener vinos recomendados de la carta
 * Reutiliza la API existente con filtros específicos para vinos destacados
 */
export function useRecommendedWines(): UseRecommendedWinesResult {
  const [recommendedWines, setRecommendedWines] = useState<RecommendedWineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendedWines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar la API existente con filtros para vinos recomendados disponibles
      const queryParams = new URLSearchParams({
        isRecommended: 'true',
        isAvailable: 'true',
        type: 'WINE'
      })

      const response = await fetch(`/api/menu/items?${queryParams}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Error fetching recommended wines`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'API returned unsuccessful response')
      }

      // Transformar los datos (ya filtrados por la API)
      const validatedWines = (data.items || []).map((item: any): RecommendedWineItem => ({
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
        glassPrice: item.glassprice ? parseFloat(item.glassprice) : undefined,
        alcoholContent: item.alcoholcontent ? parseFloat(item.alcoholcontent) : undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))

      setRecommendedWines(validatedWines)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar vinos recomendados'
      setError(errorMessage)
      setRecommendedWines([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecommendedWines()
  }, [])

  return {
    recommendedWines,
    loading,
    error,
    refetch: fetchRecommendedWines
  }
}

/**
 * Hook simplificado para obtener solo los primeros N vinos recomendados
 * Útil para mostrar en homepage sin cargar todos los vinos
 */
export function useTopRecommendedWines(limit: number = 2) {
  const { recommendedWines, loading, error, refetch } = useRecommendedWines()

  return {
    topItems: recommendedWines.slice(0, limit),
    loading,
    error,
    refetch,
    totalCount: recommendedWines.length
  }
}