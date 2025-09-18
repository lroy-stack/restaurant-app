import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Menu analytics endpoint for dashboard overview
export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      db: { schema: 'restaurante' }
    })

    // Parallel queries for optimal performance
    const [
      { data: menuItems, error: menuError },
      { data: categories, error: categoriesError },
      { data: winePairings, error: pairingsError },
      { data: allergens, error: allergensError }
    ] = await Promise.all([
      supabase.from('menu_items').select(`
        *,
        category:menu_categories!categoryId(id, name, nameEn, type)
      `),
      supabase.from('menu_categories').select('*'),
      supabase.from('wine_pairings').select('*'),
      supabase.from('allergens').select('*')
    ])

    if (menuError) {
      console.error('Menu items query error:', menuError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch menu items',
        analytics: null
      }, { status: 500 })
    }

    if (categoriesError) {
      console.error('Categories query error:', categoriesError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        analytics: null
      }, { status: 500 })
    }

    const analytics = calculateMenuAnalytics(
      menuItems || [],
      categories || [],
      winePairings || [],
      allergens || []
    )

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Menu analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      analytics: null,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Calculate comprehensive menu analytics following restaurant KPI patterns
function calculateMenuAnalytics(
  menuItems: any[],
  categories: any[],
  winePairings: any[],
  allergens: any[]
) {
  const totalItems = menuItems.length
  const availableItems = menuItems.filter(item => item.isAvailable).length

  // Category distribution with type breakdown
  const categoryDistribution = categories.map(category => ({
    id: category.id,
    name: category.name,
    nameEn: category.nameEn,
    type: category.type,
    count: menuItems.filter(item => item.categoryId === category.id).length,
    availableCount: menuItems.filter(item =>
      item.categoryId === category.id && item.isAvailable
    ).length
  }))

  // Price analysis for business intelligence
  const availablePrices = menuItems
    .filter(item => item.isAvailable && item.price > 0)
    .map(item => parseFloat(item.price))
    .sort((a, b) => a - b)

  const priceAnalysis = availablePrices.length > 0 ? {
    min: availablePrices[0],
    max: availablePrices[availablePrices.length - 1],
    average: availablePrices.reduce((sum, price) => sum + price, 0) / availablePrices.length,
    median: availablePrices[Math.floor(availablePrices.length / 2)],
    range: availablePrices[availablePrices.length - 1] - availablePrices[0]
  } : null

  // EU-14 Allergen compliance analysis - ONLY for FOOD items (platos)
  // Wines and beverages cannot be vegetarian/vegan - these are dietary restrictions for food
  const foodOnlyItems = menuItems.filter(item => item.category?.type === 'FOOD')

  const vegetarianItems = foodOnlyItems.filter(item => item.isVegetarian).length
  const veganItems = foodOnlyItems.filter(item => item.isVegan).length
  const glutenFreeItems = foodOnlyItems.filter(item => item.isGlutenFree).length

  // Compliance rate calculation (items with at least one dietary option) - ONLY FOOD
  const dietaryCompliantItems = new Set([
    ...foodOnlyItems.filter(item => item.isVegetarian).map(item => item.id),
    ...foodOnlyItems.filter(item => item.isVegan).map(item => item.id),
    ...foodOnlyItems.filter(item => item.isGlutenFree).map(item => item.id)
  ]).size

  const allergenCompliance = {
    vegetarianItems,
    veganItems,
    glutenFreeItems,
    dietaryCompliantItems,
    complianceRate: foodOnlyItems.length > 0 ?
      Math.round((dietaryCompliantItems / foodOnlyItems.length) * 100) : 0
  }

  // Wine analytics and pairing insights
  const foodItems = menuItems.filter(item => item.category?.type === 'FOOD')
  const wineItems = menuItems.filter(item => item.category?.type === 'WINE')
  const beverageItems = menuItems.filter(item => item.category?.type === 'BEVERAGE')

  // Wine pairing analysis
  const pairedFoodIds = new Set(winePairings.map(wp => wp.foodItemId))
  const pairedWineIds = new Set(winePairings.map(wp => wp.wineItemId))
  const pairedFoodItems = foodItems.filter(item => pairedFoodIds.has(item.id))
  const pairedWines = wineItems.filter(item => pairedWineIds.has(item.id))

  const wineAnalytics = {
    totalFoodItems: foodItems.length,
    totalWineItems: wineItems.length,
    totalPairings: winePairings.length,
    pairedFoodItems: pairedFoodItems.length,
    pairedWines: pairedWines.length,
    foodPairingRate: foodItems.length > 0 ?
      Math.round((pairedFoodItems.length / foodItems.length) * 100) : 0,
    winePairingRate: wineItems.length > 0 ?
      Math.round((pairedWines.length / wineItems.length) * 100) : 0
  }

  // Featured items analysis - ONLY FOOD and WINE items marked as recommended
  const featuredItems = menuItems
    .filter(item =>
      item.isAvailable &&
      item.isRecommended &&
      (item.category?.type === 'FOOD' || item.category?.type === 'WINE')
    )
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price)) // Sort recommended items by price
    .slice(0, 8) // Top 8 recommended available items
    .map((item, index) => ({
      id: item.id,
      name: item.name,
      nameEn: item.nameEn,
      category: item.category?.name || 'Sin categoría',
      price: parseFloat(item.price),
      rank: index + 1
    }))

  // Item type breakdown for dashboard cards
  const itemBreakdown = {
    totalItems,
    availableItems,
    unavailableItems: totalItems - availableItems,
    foodItems: foodItems.length,
    wineItems: wineItems.length,
    beverageItems: beverageItems.length
  }

  return {
    ...itemBreakdown,
    categoryDistribution,
    priceAnalysis,
    allergenCompliance,
    wineAnalytics,
    popularItems: featuredItems,
    lastUpdated: new Date().toISOString()
  }
}