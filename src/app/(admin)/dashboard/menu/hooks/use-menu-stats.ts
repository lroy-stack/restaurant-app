'use client'

import { useMemo } from 'react'
import { useMenuItems } from './use-menu-items'
import { useCategories } from './use-categories'
import { useWinePairings } from './use-wine-pairings'
import { useAllergens } from './use-allergens'

interface MenuStatistics {
  // Item statistics
  totalItems: number
  availableItems: number
  unavailableItems: number
  availabilityRate: number

  // Category breakdown
  foodItems: number
  wineItems: number
  beverageItems: number
  categoryDistribution: Array<{
    category: string
    count: number
    percentage: number
  }>

  // Price analysis
  priceStats: {
    min: number
    max: number
    average: number
    median: number
    range: number
  } | null

  // Dietary compliance
  dietaryStats: {
    vegetarianItems: number
    veganItems: number
    glutenFreeItems: number
    vegetarianRate: number
    veganRate: number
    glutenFreeRate: number
  }

  // Allergen analysis
  allergenStats: {
    totalAllergens: number
    itemsWithAllergens: number
    allergenFreeItems: number
    mostCommonAllergens: Array<{
      id: string
      name: string
      count: number
    }>
  }

  // Wine pairing analysis
  pairingStats: {
    totalPairings: number
    pairedFoodItems: number
    pairedWineItems: number
    foodPairingRate: number
    winePairingRate: number
    averagePairingsPerFood: number
  }

  // Business insights
  insights: {
    topPriceCategory: string | null
    bestPairedCategory: string | null
    allergenCoverage: 'low' | 'medium' | 'high'
    menuDiversity: 'low' | 'medium' | 'high'
    pairingCoverage: 'low' | 'medium' | 'high'
  }
}

interface UseMenuStatsReturn {
  stats: MenuStatistics | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

// Custom hook for comprehensive menu statistics
export function useMenuStats(): UseMenuStatsReturn {
  // Data from other hooks
  const { menuItems, loading: itemsLoading, error: itemsError, refetch: refetchItems } = useMenuItems({})
  const { categories, loading: categoriesLoading } = useCategories()
  const { pairings, loading: pairingsLoading, refetch: refetchPairings } = useWinePairings()
  const { allergens, loading: allergensLoading } = useAllergens()

  // Combined loading state
  const loading = itemsLoading || categoriesLoading || pairingsLoading || allergensLoading

  // Combined error state (prioritize items error as it's most critical)
  const error = itemsError

  // Calculate comprehensive statistics
  const stats = useMemo((): MenuStatistics | null => {
    if (loading || !menuItems.length) {
      return null
    }

    const availableItems = menuItems.filter(item => item.isAvailable)
    const totalItems = menuItems.length

    // Category breakdown
    const foodItems = menuItems.filter(item => item.category?.type === 'FOOD')
    const wineItems = menuItems.filter(item => item.category?.type === 'WINE')
    const beverageItems = menuItems.filter(item => item.category?.type === 'BEVERAGE')

    // Category distribution
    const categoryMap = new Map<string, number>()
    menuItems.forEach(item => {
      const categoryName = item.category?.name || 'Sin categoría'
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
    })

    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalItems) * 100)
    })).sort((a, b) => b.count - a.count)

    // Price analysis
    const availablePrices = availableItems.map(item => item.price).sort((a, b) => a - b)
    const priceStats = availablePrices.length > 0 ? {
      min: availablePrices[0],
      max: availablePrices[availablePrices.length - 1],
      average: availablePrices.reduce((sum, price) => sum + price, 0) / availablePrices.length,
      median: availablePrices[Math.floor(availablePrices.length / 2)],
      range: availablePrices[availablePrices.length - 1] - availablePrices[0]
    } : null

    // Dietary compliance
    const vegetarianItems = menuItems.filter(item => item.isVegetarian)
    const veganItems = menuItems.filter(item => item.isVegan)
    const glutenFreeItems = menuItems.filter(item => item.isGlutenFree)

    const dietaryStats = {
      vegetarianItems: vegetarianItems.length,
      veganItems: veganItems.length,
      glutenFreeItems: glutenFreeItems.length,
      vegetarianRate: Math.round((vegetarianItems.length / totalItems) * 100),
      veganRate: Math.round((veganItems.length / totalItems) * 100),
      glutenFreeRate: Math.round((glutenFreeItems.length / totalItems) * 100)
    }

    // Allergen analysis
    const allergenMap = new Map<string, number>()
    let itemsWithAllergens = 0

    menuItems.forEach(item => {
      if (item.allergens && item.allergens.length > 0) {
        itemsWithAllergens++
        item.allergens.forEach(allergen => {
          const key = `${allergen.id}:${allergen.name}`
          allergenMap.set(key, (allergenMap.get(key) || 0) + 1)
        })
      }
    })

    const mostCommonAllergens = Array.from(allergenMap.entries())
      .map(([key, count]) => {
        const [id, name] = key.split(':')
        return { id, name, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const allergenStats = {
      totalAllergens: allergens.length,
      itemsWithAllergens,
      allergenFreeItems: totalItems - itemsWithAllergens,
      mostCommonAllergens
    }

    // Wine pairing analysis
    const pairedFoodIds = new Set(pairings.map(p => p.foodItemId))
    const pairedWineIds = new Set(pairings.map(p => p.wineItemId))
    const pairedFoodItems = foodItems.filter(item => pairedFoodIds.has(item.id))
    const pairedWineItems = wineItems.filter(item => pairedWineIds.has(item.id))

    const pairingStats = {
      totalPairings: pairings.length,
      pairedFoodItems: pairedFoodItems.length,
      pairedWineItems: pairedWineItems.length,
      foodPairingRate: foodItems.length > 0 ? Math.round((pairedFoodItems.length / foodItems.length) * 100) : 0,
      winePairingRate: wineItems.length > 0 ? Math.round((pairedWineItems.length / wineItems.length) * 100) : 0,
      averagePairingsPerFood: pairedFoodItems.length > 0 ? pairings.length / pairedFoodItems.length : 0
    }

    // Business insights
    const topPriceCategory = categoryDistribution.length > 0 ? categoryDistribution[0].category : null
    const bestPairedCategory = pairedFoodItems.length > 0 ? 'Platos' : null

    const allergenCoverage: 'low' | 'medium' | 'high' =
      allergenStats.itemsWithAllergens / totalItems > 0.7 ? 'high' :
      allergenStats.itemsWithAllergens / totalItems > 0.3 ? 'medium' : 'low'

    const menuDiversity: 'low' | 'medium' | 'high' =
      categoryDistribution.length > 6 ? 'high' :
      categoryDistribution.length > 3 ? 'medium' : 'low'

    const pairingCoverage: 'low' | 'medium' | 'high' =
      pairingStats.foodPairingRate > 50 ? 'high' :
      pairingStats.foodPairingRate > 20 ? 'medium' : 'low'

    const insights = {
      topPriceCategory,
      bestPairedCategory,
      allergenCoverage,
      menuDiversity,
      pairingCoverage
    }

    return {
      totalItems,
      availableItems: availableItems.length,
      unavailableItems: totalItems - availableItems.length,
      availabilityRate: Math.round((availableItems.length / totalItems) * 100),
      foodItems: foodItems.length,
      wineItems: wineItems.length,
      beverageItems: beverageItems.length,
      categoryDistribution,
      priceStats,
      dietaryStats,
      allergenStats,
      pairingStats,
      insights
    }
  }, [menuItems, categories, pairings, allergens, loading])

  // Refresh all stats
  const refreshStats = async () => {
    await Promise.all([
      refetchItems(),
      refetchPairings()
    ])
  }

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}

// Hook for specific business insights
export function useMenuInsights() {
  const { stats } = useMenuStats()

  const getMenuHealthScore = (): number => {
    if (!stats) return 0

    let score = 0

    // Availability factor (30%)
    score += (stats.availabilityRate / 100) * 30

    // Dietary diversity factor (25%)
    const dietaryScore = (
      Math.min(stats.dietaryStats.vegetarianRate, 30) +
      Math.min(stats.dietaryStats.glutenFreeRate, 20) +
      Math.min(stats.dietaryStats.veganRate, 10)
    ) / 60
    score += dietaryScore * 25

    // Wine pairing coverage (25%)
    score += (stats.pairingStats.foodPairingRate / 100) * 25

    // Menu diversity (20%)
    const diversityScore = stats.insights.menuDiversity === 'high' ? 1 :
                          stats.insights.menuDiversity === 'medium' ? 0.7 : 0.3
    score += diversityScore * 20

    return Math.round(score)
  }

  const getRecommendations = (): string[] => {
    if (!stats) return []

    const recommendations: string[] = []

    if (stats.availabilityRate < 80) {
      recommendations.push('Revisar disponibilidad de elementos del menú')
    }

    if (stats.dietaryStats.vegetarianRate < 20) {
      recommendations.push('Aumentar opciones vegetarianas')
    }

    if (stats.pairingStats.foodPairingRate < 30) {
      recommendations.push('Crear más maridajes de vinos')
    }

    if (stats.insights.menuDiversity === 'low') {
      recommendations.push('Diversificar categorías del menú')
    }

    if (stats.allergenStats.itemsWithAllergens / stats.totalItems < 0.5) {
      recommendations.push('Mejorar información de alérgenos')
    }

    return recommendations
  }

  return {
    getMenuHealthScore,
    getRecommendations
  }
}