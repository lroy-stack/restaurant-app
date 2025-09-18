import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { createCategorySchema } from '@/app/(admin)/dashboard/menu/schemas/category.schema'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Category filters schema
const categoryFiltersSchema = z.object({
  type: z.enum(['FOOD', 'WINE', 'BEVERAGE']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional()
})

// GET endpoint for retrieving menu categories with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate filters
    const rawFilters = {
      type: searchParams.get('type') as 'FOOD' | 'WINE' | 'BEVERAGE' || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      search: searchParams.get('search') || undefined
    }

    const filters = categoryFiltersSchema.parse(rawFilters)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'restaurante'
        }
      }
    )

    // Build query with item counts
    let query = supabase
      .from('menu_categories')
      .select(`
        *,
        items:menu_items(count)
      `)
      .order('type', { ascending: true })
      .order('order', { ascending: true })

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.isActive !== undefined) {
      query = query.eq('isActive', filters.isActive)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,nameEn.ilike.%${filters.search}%`)
    }

    const { data: categories, error: categoriesError } = await query

    if (categoriesError) {
      console.error('Categories query error:', categoriesError)
      return NextResponse.json(
        {
          success: false,
          error: 'Error fetching categories',
          details: categoriesError.message
        },
        { status: 500 }
      )
    }

    // Get available item counts for each category
    const { data: availableItemCounts } = await supabase
      .from('menu_items')
      .select('categoryId')
      .eq('isAvailable', true)

    const availableCounts = availableItemCounts?.reduce((acc: Record<string, number>, item) => {
      acc[item.categoryId] = (acc[item.categoryId] || 0) + 1
      return acc
    }, {}) || {}

    // Transform the data to match expected format
    const transformedCategories = (categories || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      nameEn: category.nameEn,
      type: category.type,
      order: category.order,
      isActive: category.isActive,
      itemCount: category.items?.[0]?.count || 0,
      availableItemCount: availableCounts[category.id] || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    // Calculate summary statistics
    const summary = {
      totalCategories: transformedCategories.length,
      activeCategories: transformedCategories.filter(cat => cat.isActive).length,
      inactiveCategories: transformedCategories.filter(cat => !cat.isActive).length,
      categoriesByType: {
        FOOD: transformedCategories.filter(cat => cat.type === 'FOOD').length,
        WINE: transformedCategories.filter(cat => cat.type === 'WINE').length,
        BEVERAGE: transformedCategories.filter(cat => cat.type === 'BEVERAGE').length
      },
      totalItems: transformedCategories.reduce((sum, cat) => sum + cat.itemCount, 0),
      averageItemsPerCategory: transformedCategories.length > 0
        ? transformedCategories.reduce((sum, cat) => sum + cat.itemCount, 0) / transformedCategories.length
        : 0
    }

    return NextResponse.json({
      success: true,
      categories: transformedCategories,
      summary,
      filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GET categories API error:', error)

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

// POST endpoint for creating new menu categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createCategorySchema.parse(body)

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

    // Check if category with same name and type already exists
    const { data: existingCategory } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('name', data.name)
      .eq('type', data.type)
      .eq('restaurantId', restaurantId)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: `Category "${data.name}" already exists for type ${data.type}`
        },
        { status: 409 }
      )
    }

    // If no order provided, get next available order for this type
    let order = data.order
    if (order === 0) {
      const { data: existingCategories } = await supabase
        .from('menu_categories')
        .select('order')
        .eq('type', data.type)
        .eq('restaurantId', restaurantId)
        .order('order', { ascending: false })
        .limit(1)

      order = existingCategories?.[0]?.order ? existingCategories[0].order + 1 : 1
    }

    // Create the category
    const { data: newCategory, error: insertError } = await supabase
      .from('menu_categories')
      .insert({
        name: data.name,
        nameEn: data.nameEn,
        type: data.type,
        order: order,
        isActive: data.isActive,
        restaurantId: restaurantId
      })
      .select(`
        *,
        items:menu_items(count)
      `)
      .single()

    if (insertError) {
      console.error('Error creating category:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create category', details: insertError.message },
        { status: 500 }
      )
    }

    // Transform response
    const transformedCategory = {
      id: newCategory.id,
      name: newCategory.name,
      nameEn: newCategory.nameEn,
      type: newCategory.type,
      order: newCategory.order,
      isActive: newCategory.isActive,
      itemCount: newCategory.items?.[0]?.count || 0,
      availableItemCount: 0, // New category has no items yet
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt
    }

    return NextResponse.json({
      success: true,
      category: transformedCategory,
      message: 'Category created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid category data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}