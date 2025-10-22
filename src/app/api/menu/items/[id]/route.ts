import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { updateMenuItemSchema } from '@/app/(admin)/dashboard/menu/schemas/menu-item.schema'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET endpoint for retrieving a specific menu item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'public'
        }
      }
    )

    // Fetch menu item with category and allergen relationships
    const { data: menuItem, error: menuItemError } = await supabase
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
      .eq('id', id)
      .single()

    if (menuItemError) {
      if (menuItemError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Menu item not found' },
          { status: 404 }
        )
      }

      console.error('Menu item query error:', menuItemError)
      return NextResponse.json(
        {
          success: false,
          error: 'Error fetching menu item',
          details: menuItemError.message
        },
        { status: 500 }
      )
    }

    // Transform the data to match expected format (including wine fields)
    const transformedItem = {
      id: menuItem.id,
      name: menuItem.name,
      nameEn: menuItem.nameEn,
      description: menuItem.description,
      descriptionEn: menuItem.descriptionEn,
      price: parseFloat(menuItem.price),
      isAvailable: menuItem.isAvailable,
      isVegetarian: menuItem.isVegetarian,
      isVegan: menuItem.isVegan,
      isGlutenFree: menuItem.isGlutenFree,
      isRecommended: menuItem.isRecommended,
      stock: menuItem.stock,
      imageUrl: menuItem.imageUrl,
      categoryId: menuItem.categoryId,
      category: menuItem.category,
      allergens: menuItem.allergens?.map((ia: any) => ia.allergen).filter(Boolean) || [],
      allergenIds: menuItem.allergens?.map((ia: any) => ia.allergen?.id).filter(Boolean) || [],
      // Wine-specific fields - transform from lowercase to camelCase
      glassPrice: menuItem.glassprice ? parseFloat(menuItem.glassprice) : null,
      alcoholContent: menuItem.alcoholcontent ? parseFloat(menuItem.alcoholcontent) : null,
      vintage: menuItem.vintage,
      isOrganic: menuItem.isOrganic,
      richDescription: menuItem.richDescription,
      richDescriptionEn: menuItem.richDescriptionEn,
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt
    }

    return NextResponse.json({
      success: true,
      item: transformedItem
    })

  } catch (error) {
    console.error('GET menu item API error:', error)
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

// PUT endpoint for updating a specific menu item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateMenuItemSchema.parse({ ...body, id })

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'public'
        }
      }
    )

    // Verify menu item exists
    const { data: existingItem, error: checkError } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // If categoryId is being updated, verify the new category exists
    if (data.categoryId) {
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
    }

    // Prepare update data (exclude id and allergenIds from direct update)
    const { id: _, allergenIds, ...updateData } = data
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    )

    // Transform camelCase to lowercase for wine-specific fields
    const dbUpdateData: Record<string, any> = {}
    for (const [key, value] of Object.entries(cleanUpdateData)) {
      if (key === 'glassPrice') {
        dbUpdateData['glassprice'] = value
      } else if (key === 'alcoholContent') {
        dbUpdateData['alcoholcontent'] = value
      } else {
        dbUpdateData[key] = value
      }
    }

    // Update the menu item
    const { data: updatedItem, error: updateError } = await supabase
      .from('menu_items')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating menu item:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update menu item', details: updateError.message },
        { status: 500 }
      )
    }

    // Handle allergen associations if provided
    if (allergenIds !== undefined) {
      // Remove existing allergen associations
      await supabase
        .from('menu_item_allergens')
        .delete()
        .eq('menuItemId', id)

      // Add new allergen associations
      if (allergenIds.length > 0) {
        const allergenAssociations = allergenIds.map(allergenId => ({
          menuItemId: id,
          allergenId: allergenId
        }))

        const { error: allergenError } = await supabase
          .from('menu_item_allergens')
          .insert(allergenAssociations)

        if (allergenError) {
          console.error('Error updating allergen associations:', allergenError)
          // Don't fail the whole operation, but log the error
        }
      }
    }

    // Fetch the complete updated item with relationships
    const { data: completeItem } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories!categoryId(id, name, nameEn, type),
        allergens:menu_item_allergens(
          allergen:allergens!allergenId(id, name, nameEn)
        )
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({
      success: true,
      item: completeItem,
      message: 'Menu item updated successfully'
    })

  } catch (error) {
    console.error('Error updating menu item:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid menu item data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE endpoint for removing a specific menu item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'public'
        }
      }
    )

    // Verify menu item exists
    const { data: existingItem, error: checkError } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('id', id)
      .single()

    if (checkError || !existingItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Check for dependencies (orders, reservations, wine pairings)
    const [ordersCheck, reservationsCheck, pairingsCheck] = await Promise.all([
      supabase.from('order_items').select('id').eq('menuItemId', id).limit(1),
      supabase.from('reservation_items').select('id').eq('menuItemId', id).limit(1),
      supabase.from('wine_pairings').select('id').or(`foodItemId.eq.${id},wineItemId.eq.${id}`).limit(1)
    ])

    const hasDependencies = (
      (ordersCheck.data && ordersCheck.data.length > 0) ||
      (reservationsCheck.data && reservationsCheck.data.length > 0) ||
      (pairingsCheck.data && pairingsCheck.data.length > 0)
    )

    if (hasDependencies) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete menu item',
          details: 'This item is referenced in orders, reservations, or wine pairings. Consider marking it as unavailable instead.'
        },
        { status: 409 }
      )
    }

    // Delete allergen associations first (due to foreign key constraint)
    await supabase
      .from('menu_item_allergens')
      .delete()
      .eq('menuItemId', id)

    // Delete the menu item
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting menu item:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete menu item', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Menu item "${existingItem.name}" deleted successfully`
    })

  } catch (error) {
    console.error('DELETE menu item API error:', error)
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