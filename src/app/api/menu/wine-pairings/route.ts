import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { createWinePairingSchema } from '@/app/(admin)/dashboard/menu/schemas/wine-pairing.schema'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Wine pairing filters schema
const winePairingFiltersSchema = z.object({
  foodItemId: z.string().optional(),
  wineItemId: z.string().optional(),
  search: z.string().optional()
})

// GET endpoint for retrieving wine pairings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate filters
    const rawFilters = {
      foodItemId: searchParams.get('foodItemId') || undefined,
      wineItemId: searchParams.get('wineItemId') || undefined,
      search: searchParams.get('search') || undefined
    }

    const filters = winePairingFiltersSchema.parse(rawFilters)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'public'
        }
      }
    )

    // Build query with food and wine item details
    let query = supabase
      .from('wine_pairings')
      .select(`
        *,
        foodItem:menu_items!foodItemId(
          id,
          name,
          nameEn,
          price,
          categoryId,
          category:menu_categories!categoryId(
            name,
            nameEn,
            type
          )
        ),
        wineItem:menu_items!wineItemId(
          id,
          name,
          nameEn,
          price,
          categoryId,
          category:menu_categories!categoryId(
            name,
            nameEn,
            type
          )
        )
      `)
      .order('id', { ascending: false })

    // Apply filters
    if (filters.foodItemId) {
      query = query.eq('foodItemId', filters.foodItemId)
    }

    if (filters.wineItemId) {
      query = query.eq('wineItemId', filters.wineItemId)
    }

    const { data: pairings, error: pairingsError } = await query

    if (pairingsError) {
      console.error('Wine pairings query error:', pairingsError)
      return NextResponse.json(
        {
          success: false,
          error: 'Error fetching wine pairings',
          details: pairingsError.message
        },
        { status: 500 }
      )
    }

    // Filter by search term if provided
    let filteredPairings = pairings || []
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredPairings = filteredPairings.filter((pairing: any) =>
        pairing.description?.toLowerCase().includes(searchTerm) ||
        pairing.foodItem?.name.toLowerCase().includes(searchTerm) ||
        pairing.foodItem?.nameEn?.toLowerCase().includes(searchTerm) ||
        pairing.wineItem?.name.toLowerCase().includes(searchTerm) ||
        pairing.wineItem?.nameEn?.toLowerCase().includes(searchTerm)
      )
    }

    // Transform the data to match expected format
    const transformedPairings = filteredPairings.map((pairing: any) => ({
      id: pairing.id,
      foodItemId: pairing.foodItemId,
      wineItemId: pairing.wineItemId,
      description: pairing.description,
      foodItem: {
        id: pairing.foodItem.id,
        name: pairing.foodItem.name,
        nameEn: pairing.foodItem.nameEn,
        price: parseFloat(pairing.foodItem.price),
        categoryId: pairing.foodItem.categoryId,
        category: pairing.foodItem.category
      },
      wineItem: {
        id: pairing.wineItem.id,
        name: pairing.wineItem.name,
        nameEn: pairing.wineItem.nameEn,
        price: parseFloat(pairing.wineItem.price),
        categoryId: pairing.wineItem.categoryId,
        category: pairing.wineItem.category
      }
    }))

    // Calculate summary statistics
    const uniqueFoodItems = new Set(transformedPairings.map(p => p.foodItemId)).size
    const uniqueWineItems = new Set(transformedPairings.map(p => p.wineItemId)).size

    const summary = {
      totalPairings: transformedPairings.length,
      uniqueFoodItems,
      uniqueWineItems,
      averagePairingsPerFood: uniqueFoodItems > 0 ? transformedPairings.length / uniqueFoodItems : 0,
      averagePairingsPerWine: uniqueWineItems > 0 ? transformedPairings.length / uniqueWineItems : 0,
      mostPairedFood: null, // Could be calculated if needed
      mostPairedWine: null   // Could be calculated if needed
    }

    return NextResponse.json({
      success: true,
      pairings: transformedPairings,
      summary,
      filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GET wine pairings API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filter parameters',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST endpoint for creating new wine pairings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createWinePairingSchema.parse(body)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'public'
        }
      }
    )

    // Verify both food and wine items exist and have correct types
    const [foodItemResult, wineItemResult] = await Promise.all([
      supabase
        .from('menu_items')
        .select(`
          id,
          name,
          categoryId,
          category:menu_categories!categoryId(type)
        `)
        .eq('id', data.foodItemId)
        .single(),
      supabase
        .from('menu_items')
        .select(`
          id,
          name,
          categoryId,
          category:menu_categories!categoryId(type)
        `)
        .eq('id', data.wineItemId)
        .single()
    ])

    if (foodItemResult.error || !foodItemResult.data) {
      return NextResponse.json(
        { success: false, error: 'Food item not found' },
        { status: 404 }
      )
    }

    if (wineItemResult.error || !wineItemResult.data) {
      return NextResponse.json(
        { success: false, error: 'Wine item not found' },
        { status: 404 }
      )
    }

    const foodItem = foodItemResult.data
    const wineItem = wineItemResult.data

    // Verify that food item is actually a food category and wine item is wine category
    if (foodItem.category?.type !== 'FOOD') {
      return NextResponse.json(
        {
          success: false,
          error: `Item "${foodItem.name}" is not a food item (type: ${foodItem.category?.type})`
        },
        { status: 400 }
      )
    }

    if (wineItem.category?.type !== 'WINE') {
      return NextResponse.json(
        {
          success: false,
          error: `Item "${wineItem.name}" is not a wine item (type: ${wineItem.category?.type})`
        },
        { status: 400 }
      )
    }

    // Check if pairing already exists
    const { data: existingPairing } = await supabase
      .from('wine_pairings')
      .select('id')
      .eq('foodItemId', data.foodItemId)
      .eq('wineItemId', data.wineItemId)
      .single()

    if (existingPairing) {
      return NextResponse.json(
        {
          success: false,
          error: `Pairing between "${foodItem.name}" and "${wineItem.name}" already exists`
        },
        { status: 409 }
      )
    }

    // Generate unique ID
    const pairingId = `wp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create the wine pairing
    const { data: newPairing, error: insertError } = await supabase
      .from('wine_pairings')
      .insert({
        id: pairingId,
        foodItemId: data.foodItemId,
        wineItemId: data.wineItemId,
        description: data.description
      })
      .select(`
        *,
        foodItem:menu_items!foodItemId(
          id,
          name,
          nameEn,
          price,
          categoryId,
          category:menu_categories!categoryId(name, nameEn, type)
        ),
        wineItem:menu_items!wineItemId(
          id,
          name,
          nameEn,
          price,
          categoryId,
          category:menu_categories!categoryId(name, nameEn, type)
        )
      `)
      .single()

    if (insertError) {
      console.error('Error creating wine pairing:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create wine pairing', details: insertError.message },
        { status: 500 }
      )
    }

    // Transform response
    const transformedPairing = {
      id: newPairing.id,
      foodItemId: newPairing.foodItemId,
      wineItemId: newPairing.wineItemId,
      description: newPairing.description,
      foodItem: {
        id: newPairing.foodItem.id,
        name: newPairing.foodItem.name,
        nameEn: newPairing.foodItem.nameEn,
        price: parseFloat(newPairing.foodItem.price),
        categoryId: newPairing.foodItem.categoryId,
        category: newPairing.foodItem.category
      },
      wineItem: {
        id: newPairing.wineItem.id,
        name: newPairing.wineItem.name,
        nameEn: newPairing.wineItem.nameEn,
        price: parseFloat(newPairing.wineItem.price),
        categoryId: newPairing.wineItem.categoryId,
        category: newPairing.wineItem.category
      }
    }

    return NextResponse.json({
      success: true,
      pairing: transformedPairing,
      message: `Wine pairing created: "${foodItem.name}" with "${wineItem.name}"`
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating wine pairing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid wine pairing data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}