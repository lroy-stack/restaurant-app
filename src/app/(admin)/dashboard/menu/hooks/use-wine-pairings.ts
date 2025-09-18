'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { WinePairingWithItems, WinePairingFormData } from '../schemas/wine-pairing.schema'

interface WinePairingSummary {
  totalPairings: number
  uniqueFoodItems: number
  uniqueWineItems: number
  averagePairingsPerFood: number
  averagePairingsPerWine: number
  mostPairedFood: string | null
  mostPairedWine: string | null
}

interface WinePairingFilters {
  foodItemId?: string
  wineItemId?: string
  search?: string
}

interface UseWinePairingsReturn {
  pairings: WinePairingWithItems[]
  summary: WinePairingSummary | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createPairing: (data: WinePairingFormData) => Promise<boolean>
  updatePairing: (id: string, data: Partial<WinePairingFormData>) => Promise<boolean>
  deletePairing: (id: string) => Promise<boolean>
  clearError: () => void
}

// Custom hook for wine pairings management following established patterns
export function useWinePairings(filters: WinePairingFilters = {}): UseWinePairingsReturn {
  const [pairings, setPairings] = useState<WinePairingWithItems[]>([])
  const [summary, setSummary] = useState<WinePairingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Build query parameters from filters
  const buildQueryParams = (filters: WinePairingFilters): string => {
    const params = new URLSearchParams()
    if (filters.foodItemId) params.set('foodItemId', filters.foodItemId)
    if (filters.wineItemId) params.set('wineItemId', filters.wineItemId)
    if (filters.search) params.set('search', filters.search)
    return params.toString()
  }

  const fetchPairings = async () => {
    try {
      setError(null)
      const queryParams = buildQueryParams(filters)
      const url = `/api/menu/wine-pairings${queryParams ? `?${queryParams}` : ''}`

      const response = await fetch(url, {
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

      if (data.success) {
        setPairings(data.pairings || [])
        setSummary(data.summary || null)
      } else {
        setError(data.error || 'Error fetching wine pairings')
      }
    } catch (err) {
      console.error('Error fetching wine pairings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch wine pairings')
    } finally {
      setLoading(false)
    }
  }

  // Create new wine pairing
  const createPairing = async (data: WinePairingFormData): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch('/api/menu/wine-pairings', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchPairings() // Refresh the list
        toast.success(result.message || 'Maridaje creado exitosamente')
        return true
      } else {
        setError(result.error || 'Error creating wine pairing')
        toast.error(result.error || 'Error al crear el maridaje')
        return false
      }
    } catch (err) {
      console.error('Error creating wine pairing:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to create wine pairing'
      setError(errorMsg)
      toast.error('Error al crear el maridaje')
      return false
    }
  }

  // Update existing wine pairing
  const updatePairing = async (id: string, data: Partial<WinePairingFormData>): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch(`/api/menu/wine-pairings/${id}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchPairings() // Refresh the list
        toast.success('Maridaje actualizado exitosamente')
        return true
      } else {
        setError(result.error || 'Error updating wine pairing')
        toast.error(result.error || 'Error al actualizar el maridaje')
        return false
      }
    } catch (err) {
      console.error('Error updating wine pairing:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to update wine pairing'
      setError(errorMsg)
      toast.error('Error al actualizar el maridaje')
      return false
    }
  }

  // Delete wine pairing
  const deletePairing = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch(`/api/menu/wine-pairings/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        await fetchPairings() // Refresh the list
        toast.success('Maridaje eliminado exitosamente')
        return true
      } else {
        setError(result.error || 'Error deleting wine pairing')
        toast.error(result.error || 'Error al eliminar el maridaje')
        return false
      }
    } catch (err) {
      console.error('Error deleting wine pairing:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete wine pairing'
      setError(errorMsg)
      toast.error('Error al eliminar el maridaje')
      return false
    }
  }

  // Clear error state
  const clearError = () => {
    setError(null)
  }

  // Effect for initial data load and filter changes
  useEffect(() => {
    setLoading(true)
    fetchPairings()
  }, [filters.foodItemId, filters.wineItemId, filters.search])

  return {
    pairings,
    summary,
    loading,
    error,
    refetch: fetchPairings,
    createPairing,
    updatePairing,
    deletePairing,
    clearError
  }
}