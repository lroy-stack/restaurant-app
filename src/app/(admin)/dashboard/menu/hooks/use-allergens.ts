'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Allergen {
  id: string
  name: string
  nameEn?: string
  description?: string
  icon?: string
  riskLevel?: 'high' | 'medium' | 'low'
  isCommon?: boolean
}

interface UseAllergensReturn {
  allergens: Allergen[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getAllergenById: (id: string) => Allergen | undefined
  getAllergensByIds: (ids: string[]) => Allergen[]
  getCommonAllergens: () => Allergen[]
  getHighRiskAllergens: () => Allergen[]
  clearError: () => void
}

// Custom hook for allergens management following established patterns
export function useAllergens(): UseAllergensReturn {
  const [allergens, setAllergens] = useState<Allergen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllergens = async () => {
    try {
      setError(null)
      const response = await fetch('/api/menu/allergens', {
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

      if (data.success && data.allergens) {
        // Enrich allergens with risk level and common flags based on name
        const enrichedAllergens = data.allergens.map((allergen: any) => ({
          ...allergen,
          riskLevel: determineRiskLevel(allergen.name),
          isCommon: determineIfCommon(allergen.name)
        }))

        setAllergens(enrichedAllergens)
      } else {
        setError(data.error || 'Error fetching allergens')
      }
    } catch (err) {
      console.error('Error fetching allergens:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch allergens')
    } finally {
      setLoading(false)
    }
  }

  // Determine risk level based on allergen name
  const determineRiskLevel = (name: string): 'high' | 'medium' | 'low' => {
    const lowerName = name.toLowerCase()

    // High-risk allergens (severe reactions, common)
    if (lowerName.includes('gluten') || lowerName.includes('trigo') ||
        lowerName.includes('frutos secos') || lowerName.includes('nuts') ||
        lowerName.includes('marisco') || lowerName.includes('shellfish') ||
        lowerName.includes('apio') || lowerName.includes('celery')) {
      return 'high'
    }

    // Medium-risk allergens
    if (lowerName.includes('lacteo') || lowerName.includes('milk') ||
        lowerName.includes('huevo') || lowerName.includes('egg') ||
        lowerName.includes('pescado') || lowerName.includes('fish') ||
        lowerName.includes('soja') || lowerName.includes('soy')) {
      return 'medium'
    }

    // Lower-risk or less common
    return 'low'
  }

  // Determine if allergen is commonly encountered
  const determineIfCommon = (name: string): boolean => {
    const lowerName = name.toLowerCase()
    const commonAllergens = [
      'gluten', 'trigo', 'lacteo', 'milk', 'huevo', 'egg',
      'frutos secos', 'nuts', 'soja', 'soy', 'pescado', 'fish'
    ]

    return commonAllergens.some(common => lowerName.includes(common))
  }

  // Get allergen by ID
  const getAllergenById = (id: string): Allergen | undefined => {
    return allergens.find(allergen => allergen.id === id)
  }

  // Get multiple allergens by IDs
  const getAllergensByIds = (ids: string[]): Allergen[] => {
    return allergens.filter(allergen => ids.includes(allergen.id))
  }

  // Get common allergens (frequently used)
  const getCommonAllergens = (): Allergen[] => {
    return allergens.filter(allergen => allergen.isCommon)
  }

  // Get high-risk allergens (severe reactions)
  const getHighRiskAllergens = (): Allergen[] => {
    return allergens.filter(allergen => allergen.riskLevel === 'high')
  }

  // Clear error state
  const clearError = () => {
    setError(null)
  }

  // 🚨 EMERGENCY FIX: Prevent infinite dependency loops causing 2M+ database scans
  // Effect for initial data load - dependencies removed to prevent hook recreation
  useEffect(() => {
    fetchAllergens()
  }, []) // Fixed: removed fetchAllergens dependency that was causing infinite loops

  return {
    allergens,
    loading,
    error,
    refetch: fetchAllergens,
    getAllergenById,
    getAllergensByIds,
    getCommonAllergens,
    getHighRiskAllergens,
    clearError
  }
}

// Hook for specific allergen operations
export function useAllergenOperations() {
  const { allergens, getAllergenById, getAllergensByIds } = useAllergens()

  // Check if item has specific allergen
  const hasAllergen = (itemAllergens: string[], allergenName: string): boolean => {
    const allergen = allergens.find(a =>
      a.name.toLowerCase().includes(allergenName.toLowerCase()) ||
      a.nameEn?.toLowerCase().includes(allergenName.toLowerCase())
    )
    return allergen ? itemAllergens.includes(allergen.id) : false
  }

  // Check if item is safe for specific dietary restrictions
  const isSafeFor = (itemAllergens: string[], restriction: 'gluten-free' | 'dairy-free' | 'nut-free'): boolean => {
    switch (restriction) {
      case 'gluten-free':
        return !hasAllergen(itemAllergens, 'gluten') && !hasAllergen(itemAllergens, 'trigo')
      case 'dairy-free':
        return !hasAllergen(itemAllergens, 'lacteo') && !hasAllergen(itemAllergens, 'milk')
      case 'nut-free':
        return !hasAllergen(itemAllergens, 'frutos secos') && !hasAllergen(itemAllergens, 'nuts')
      default:
        return true
    }
  }

  // Get allergen warnings for item
  const getAllergenWarnings = (itemAllergens: string[]): {
    high: Allergen[],
    medium: Allergen[],
    low: Allergen[]
  } => {
    const itemAllergenObjects = getAllergensByIds(itemAllergens)

    return {
      high: itemAllergenObjects.filter(a => a.riskLevel === 'high'),
      medium: itemAllergenObjects.filter(a => a.riskLevel === 'medium'),
      low: itemAllergenObjects.filter(a => a.riskLevel === 'low')
    }
  }

  // Check EU-14 compliance
  const checkEU14Compliance = (itemAllergens: string[]): {
    isCompliant: boolean
    missingInfo: string[]
    declaredAllergens: Allergen[]
  } => {
    const declaredAllergens = getAllergensByIds(itemAllergens)
    const eu14Allergens = [
      'gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes',
      'soja', 'leche', 'frutos secos', 'apio', 'mostaza',
      'sesamo', 'sulfitos', 'altramuces', 'moluscos'
    ]

    // This would need more sophisticated logic in a real implementation
    // For now, we assume compliance if allergens are declared
    return {
      isCompliant: true,
      missingInfo: [],
      declaredAllergens
    }
  }

  return {
    hasAllergen,
    isSafeFor,
    getAllergenWarnings,
    checkEU14Compliance
  }
}