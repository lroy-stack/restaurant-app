import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { createMenuItemSchema, updateMenuItemSchema } from '@/app/(admin)/dashboard/menu/schemas/menu-item.schema'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Menu item filters schema
const menuItemFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['FOOD', 'WINE', 'BEVERAGE']).optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  allergenId: z.string().optional()
})

// GET endpoint for retrieving menu items with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate filters
    const rawFilters = {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      type: searchParams.get('type') as 'FOOD' | 'WINE' | 'BEVERAGE' || undefined,
      isAvailable: searchParams.get('isAvailable') ? searchParams.get('isAvailable') === 'true' : undefined,
      isVegetarian: searchParams.get('isVegetarian') ? searchParams.get('isVegetarian') === 'true' : undefined,
      isVegan: searchParams.get('isVegan') ? searchParams.get('isVegan') === 'true' : undefined,
      isGlutenFree: searchParams.get('isGlutenFree') ? searchParams.get('isGlutenFree') === 'true' : undefined,
      isRecommended: searchParams.get('isRecommended') ? searchParams.get('isRecommended') === 'true' : undefined,
      priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
      allergenId: searchParams.get('allergenId') || undefined
    }

    const filters = menuItemFiltersSchema.parse(rawFilters)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'restaurante'
        }
      }
    )

    // Build query with joins to get category and allergen information
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories!categoryId(
          id,
          name,
          nameEn,
          type
        ),
        allergens:menu_item_allergens(
          allergen:allergens!allergenId(
            id,
            name,
            nameEn
          )
        )
      `)
      .order('name', { ascending: true })

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,nameEn.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.categoryId) {
      query = query.eq('categoryId', filters.categoryId)
    }

    if (filters.isAvailable !== undefined) {
      query = query.eq('isAvailable', filters.isAvailable)
    }

    if (filters.isVegetarian !== undefined) {
      query = query.eq('isVegetarian', filters.isVegetarian)
    }

    if (filters.isVegan !== undefined) {
      query = query.eq('isVegan', filters.isVegan)
    }

    if (filters.isGlutenFree !== undefined) {
      query = query.eq('isGlutenFree', filters.isGlutenFree)
    }

    if (filters.isRecommended !== undefined) {
      query = query.eq('isRecommended', filters.isRecommended)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax)
    }

    const { data: menuItems, error: menuItemsError } = await query

    if (menuItemsError) {
      console.error('Menu items query error:', menuItemsError)
      return NextResponse.json(
        {
          success: false,
          error: 'Error fetching menu items',
          details: menuItemsError.message
        },
        { status: 500 }
      )
    }

    // If filtering by category type, need to join with categories
    let filteredItems = menuItems || []

    if (filters.type) {
      filteredItems = filteredItems.filter(item =>
        item.category && item.category.type === filters.type
      )
    }

    // If filtering by specific allergen, need additional filtering
    if (filters.allergenId) {
      filteredItems = filteredItems.filter(item =>
        item.allergens && item.allergens.some((ia: any) =>
          ia.allergen && ia.allergen.id === filters.allergenId
        )
      )
    }

    // Transform the data to match expected format
    const transformedItems = filteredItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      nameEn: item.nameEn,
      description: item.description,
      descriptionEn: item.descriptionEn,
      price: parseFloat(item.price),
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isRecommended: item.isRecommended,
      stock: item.stock || 0,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
      category: item.category,
      allergens: item.allergens?.map((ia: any) => ia.allergen).filter(Boolean) || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))

    // Calculate summary statistics
    const summary = {
      totalItems: transformedItems.length,
      availableItems: transformedItems.filter(item => item.isAvailable).length,
      unavailableItems: transformedItems.filter(item => !item.isAvailable).length,
      vegetarianItems: transformedItems.filter(item => item.isVegetarian).length,
      veganItems: transformedItems.filter(item => item.isVegan).length,
      glutenFreeItems: transformedItems.filter(item => item.isGlutenFree).length,
      priceRange: transformedItems.length > 0 ? {
        min: Math.min(...transformedItems.map(item => item.price)),
        max: Math.max(...transformedItems.map(item => item.price)),
        average: transformedItems.reduce((sum, item) => sum + item.price, 0) / transformedItems.length
      } : null
    }

    return NextResponse.json({
      success: true,
      items: transformedItems,
      summary,
      filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GET menu items API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filter parameters',
          details: error.issues
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

// POST endpoint for creating new menu items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createMenuItemSchema.parse(body)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'restaurante'
        }
      }
    )

    // Get default restaurant ID (assuming single restaurant setup)
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1)

    const restaurantId = restaurants?.[0]?.id
    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'No restaurant found in system' },
        { status: 400 }
      )
    }

    // Verify category exists and get its type
    const { data: category, error: categoryError } = await supabase
      .from('menu_categories')
      .select('id, type')
      .eq('id', data.categoryId)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    // Create the menu item
    const { data: newItem, error: insertError } = await supabase
      .from('menu_items')
      .insert({
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        price: data.price,
        categoryId: data.categoryId,
        restaurantId: restaurantId,
        isAvailable: data.isAvailable,
        isVegetarian: data.isVegetarian,
        isVegan: data.isVegan,
        isGlutenFree: data.isGlutenFree,
        imageUrl: data.imageUrl
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating menu item:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create menu item', details: insertError.message },
        { status: 500 }
      )
    }

    // Handle allergen associations if provided
    if (data.allergenIds && data.allergenIds.length > 0) {
      const allergenAssociations = data.allergenIds.map(allergenId => ({
        menuItemId: newItem.id,
        allergenId: allergenId
      }))

      const { error: allergenError } = await supabase
        .from('menu_item_allergens')
        .insert(allergenAssociations)

      if (allergenError) {
        console.error('Error creating allergen associations:', allergenError)
        // Don't fail the whole operation, but log the error
      }
    }

    // Fetch the complete item with relationships
    const { data: completeItem } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories!categoryId(id, name, nameEn, type),
        allergens:menu_item_allergens(
          allergen:allergens!allergenId(id, name, nameEn)
        )
      `)
      .eq('id', newItem.id)
      .single()

    return NextResponse.json({
      success: true,
      item: completeItem,
      message: 'Menu item created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating menu item:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid menu item data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}