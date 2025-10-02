import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { MenuFilterData } from '@/lib/validations/menu'

const SUPABASE_URL = 'https://supabase.enigmaconalma.com'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NTcxOTYwMDAsImV4cCI6MTkxNDk2MjQwMH0.m0raHGfbQAMISP5sMQ7xade4B30IOk0qTfyiNEt1Mkg'

export async function GET(request: Request) {
  try {
    // Parse URL parameters for filters
    const { searchParams } = new URL(request.url)
    const filters: MenuFilterData = {
      categoryId: searchParams.get('categoryId') || undefined,
      search: searchParams.get('search') || undefined,
      isAvailable: searchParams.get('isAvailable') ? searchParams.get('isAvailable') === 'true' : undefined,
      isRecommended: searchParams.get('isRecommended') ? searchParams.get('isRecommended') === 'true' : undefined,
      isOrganic: searchParams.get('isOrganic') ? searchParams.get('isOrganic') === 'true' : undefined,
      isVegetarian: searchParams.get('isVegetarian') ? searchParams.get('isVegetarian') === 'true' : undefined,
      isVegan: searchParams.get('isVegan') ? searchParams.get('isVegan') === 'true' : undefined,
      isGlutenFree: searchParams.get('isGlutenFree') ? searchParams.get('isGlutenFree') === 'true' : undefined,
      priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
    }

    console.log('Fetching complete menu with filters:', filters)

    // Get menu items from database using working function
    const menuResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_complete_menu`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({})
    })

    if (!menuResponse.ok) {
      const errorText = await menuResponse.text()
      console.error('Menu fetch failed:', menuResponse.status, errorText)
      throw new Error(`Database connection failed: ${menuResponse.status} ${errorText}`)
    }

    const menuData = await menuResponse.json()
    
    if (!menuData || !Array.isArray(menuData)) {
      console.error('Invalid menu data structure:', menuData)
      throw new Error('Invalid menu data received from database')
    }

    console.log('Raw menu data from get_complete_menu:', menuData.length, 'categories')

    // Fetch wine pairings data
    const pairingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/wine_pairings?select=*,foodItem:menu_items!foodItemId(id,name,nameEn),wineItem:menu_items!wineItemId(id,name,nameEn,price)`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      }
    })

    let winePairings = []
    if (pairingsResponse.ok) {
      winePairings = await pairingsResponse.json()
      console.log('Wine pairings fetched:', winePairings.length)
    } else {
      console.warn('Failed to fetch wine pairings:', pairingsResponse.status)
    }

    // get_complete_menu returns categories with items already structured
    // Fetch allergens for all items
    const allergensResponse = await fetch(`${SUPABASE_URL}/rest/v1/menu_item_allergens?select=menuItemId,allergen:allergens(id,name,nameEn)`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      }
    })

    let itemAllergens = []
    if (allergensResponse.ok) {
      itemAllergens = await allergensResponse.json()
      console.log('Allergens fetched:', itemAllergens.length)
    } else {
      console.warn('Failed to fetch allergens:', allergensResponse.status)
    }

    const categories = menuData.map((category: any) => ({
      id: category.id,
      name: category.name,
      nameEn: category.nameEn || undefined,
      description: category.description || undefined,
      descriptionEn: category.descriptionEn || undefined,
      displayOrder: category.order || 0,
      type: category.type,
      menuItems: (category.items || []).map((item: any) => {
        // Find wine pairings for this item
        const itemWinePairings = winePairings.filter((p: any) => p.foodItemId === item.id)
        const itemFoodPairings = winePairings.filter((p: any) => p.wineItemId === item.id)

        // Find allergens for this item
        const itemSpecificAllergens = itemAllergens.filter((ia: any) => ia.menuItemId === item.id)

        return {
          id: item.id,
          name: item.name,
          nameEn: item.nameEn || undefined,
          description: item.description || '',
          descriptionEn: item.descriptionEn || undefined,
          richDescription: item.richDescription || undefined,
          richDescriptionEn: item.richDescriptionEn || undefined,
          price: parseFloat(item.price) || 0,
          glassPrice: item.glassPrice ? parseFloat(item.glassPrice) : undefined,
          alcoholContent: item.alcoholContent ? parseFloat(item.alcoholContent) : undefined,
          vintage: item.vintage || undefined,
          isOrganic: item.isOrganic || false,
          isVegetarian: item.isVegetarian || false,
          isVegan: item.isVegan || false,
          isGlutenFree: item.isGlutenFree || false,
          isRecommended: item.isRecommended || false,
          // Map allergens from DB dinamically
          containsGluten: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Gluten'),
          containsMilk: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Lácteos'),
          containsEggs: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Huevos'),
          containsNuts: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Frutos secos'),
          containsFish: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Pescado'),
          containsShellfish: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Crustáceos'),
          containsSoy: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Soja'),
          containsCelery: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Apio'),
          containsMustard: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Mostaza'),
          containsSesame: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Sésamo'),
          containsSulfites: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Sulfitos'),
          containsLupin: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Altramuces'),
          containsMollusks: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Moluscos'),
          containsPeanuts: itemSpecificAllergens.some((ia: any) => ia.allergen.name === 'Cacahuetes'),
          // Store full allergen data for component
          allergens: itemSpecificAllergens.map((ia: any) => ({
            id: ia.allergen.id,
            name: ia.allergen.name,
            nameEn: ia.allergen.nameEn
          })),
          images: item.imageUrl ? [item.imageUrl] : [],
          imageUrl: item.imageUrl,
          displayOrder: 0,
          // Wine pairing information
          winePairings: itemWinePairings.map((p: any) => ({
            id: p.id,
            description: p.description,
            wineItem: {
              id: p.wineItem.id,
              name: p.wineItem.name,
              nameEn: p.wineItem.nameEn,
              price: parseFloat(p.wineItem.price) || 0
            }
          })),
          foodPairings: itemFoodPairings.map((p: any) => ({
            id: p.id,
            description: p.description,
            foodItem: {
              id: p.foodItem.id,
              name: p.foodItem.name,
              nameEn: p.foodItem.nameEn
            }
          }))
        }
      }).filter((item: any) => {
        // Apply filters here
        let includeItem = true
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          const searchMatch = (
            item.name.toLowerCase().includes(searchTerm) ||
            item.nameEn?.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.descriptionEn?.toLowerCase().includes(searchTerm)
          )
          if (!searchMatch) includeItem = false
        }
        
        if (filters.isRecommended !== undefined && item.isRecommended !== filters.isRecommended) {
          includeItem = false
        }

        if (filters.isOrganic !== undefined && item.isOrganic !== filters.isOrganic) {
          includeItem = false
        }

        if (filters.isVegetarian !== undefined && item.isVegetarian !== filters.isVegetarian) {
          includeItem = false
        }

        if (filters.isVegan !== undefined && item.isVegan !== filters.isVegan) {
          includeItem = false
        }

        if (filters.isGlutenFree !== undefined && item.isGlutenFree !== filters.isGlutenFree) {
          includeItem = false
        }
        
        if (filters.priceMin !== undefined && item.price < filters.priceMin) {
          includeItem = false
        }
        
        if (filters.priceMax !== undefined && item.price > filters.priceMax) {
          includeItem = false
        }

        return includeItem
      })
    })).filter((category: any) =>
      category.menuItems.length > 0  // MOSTRAR TODAS LAS CATEGORÍAS: FOOD, WINE, BEVERAGE
    )

    // Calculate dynamic summary statistics from real data - ALL ITEM TYPES
    const allItems = categories.flatMap(cat => cat.menuItems)
    const foodItems = categories.filter(cat => cat.type === 'FOOD').flatMap(cat => cat.menuItems)
    const wineItems = categories.filter(cat => cat.type === 'WINE').flatMap(cat => cat.menuItems).length
    const beverageItems = categories.filter(cat => cat.type === 'BEVERAGE').flatMap(cat => cat.menuItems).length
    
    const totalItems = foodItems.length  // 46 platos, NO todos los productos
    const recommendedItems = allItems.filter(item => item.isRecommended).length
    const vegetarianItems = foodItems.filter(item => item.isVegetarian).length
    const veganItems = foodItems.filter(item => item.isVegan).length
    
    // Calculate price ranges for food items only
    const foodPrices = foodItems.map(item => item.price).filter(price => !isNaN(price))
    const priceRange = foodPrices.length > 0 ? {
      min: Math.min(...foodPrices),
      max: Math.max(...foodPrices),
      average: Math.round((foodPrices.reduce((sum, price) => sum + price, 0) / foodPrices.length) * 100) / 100
    } : null

    console.log('Menu summary:', {
      totalItems,
      recommendedItems,
      vegetarianItems,
      veganItems,
      priceRange,
      categories: categories.length
    })

    return NextResponse.json({
      success: true,
      categories,
      summary: {
        totalItems,  // 46 platos
        recommendedItems,
        wineItems,
        vegetarianItems,
        veganItems,
        priceRange
      },
      filters,
      note: `Real database menu loaded: ${totalItems} items from ${categories.length} categories`
    })

  } catch (error) {
    console.error('Error fetching menu:', error)
    
    // Fallback to connection test and basic error info
    try {
      const restaurantResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_restaurant_info`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({})
      })
      
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json()
        console.log('Database connection OK, restaurant:', restaurantData[0]?.name)
      }
    } catch (connectionError) {
      console.error('Database connection also failed:', connectionError)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error fetching menu',
        details: 'Check server logs for database connection details'
      },
      { status: 500 }
    )
  }
}