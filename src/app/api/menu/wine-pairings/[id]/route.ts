import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { updateWinePairingSchema } from '@/app/(admin)/dashboard/menu/schemas/wine-pairing.schema'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET single wine pairing
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

    const { data: pairing, error } = await supabase
      .from('wine_pairings')
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
      .eq('id', id)
      .single()

    if (error || !pairing) {
      return NextResponse.json(
        { success: false, error: 'Wine pairing not found' },
        { status: 404 }
      )
    }

    // Transform response
    const transformedPairing = {
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
    }

    return NextResponse.json({
      success: true,
      pairing: transformedPairing
    })

  } catch (error) {
    console.error('GET wine pairing API error:', error)
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

// PATCH update wine pairing
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Remove id from body and validate
    const { id: _, ...updateData } = body
    const validatedData = updateWinePairingSchema.omit({ id: true }).parse(updateData)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'public'
        }
      }
    )

    // Check if pairing exists
    const { data: existingPairing, error: existingError } = await supabase
      .from('wine_pairings')
      .select('id, foodItemId, wineItemId')
      .eq('id', id)
      .single()

    if (existingError || !existingPairing) {
      return NextResponse.json(
        { success: false, error: 'Wine pairing not found' },
        { status: 404 }
      )
    }

    // If changing items, verify they exist and have correct types
    if (validatedData.foodItemId || validatedData.wineItemId) {
      const newFoodItemId = validatedData.foodItemId || existingPairing.foodItemId
      const newWineItemId = validatedData.wineItemId || existingPairing.wineItemId

      // Check if new pairing combination would be unique
      if (newFoodItemId !== existingPairing.foodItemId || newWineItemId !== existingPairing.wineItemId) {
        const { data: duplicatePairing } = await supabase
          .from('wine_pairings')
          .select('id')
          .eq('foodItemId', newFoodItemId)
          .eq('wineItemId', newWineItemId)
          .neq('id', id)
          .single()

        if (duplicatePairing) {
          return NextResponse.json(
            { success: false, error: 'This pairing combination already exists' },
            { status: 409 }
          )
        }

        // Verify item types if they're being changed
        const itemsToCheck = []
        if (validatedData.foodItemId) itemsToCheck.push(validatedData.foodItemId)
        if (validatedData.wineItemId) itemsToCheck.push(validatedData.wineItemId)

        if (itemsToCheck.length > 0) {
          const { data: items, error: itemsError } = await supabase
            .from('menu_items')
            .select(`
              id,
              name,
              category:menu_categories!categoryId(type)
            `)
            .in('id', itemsToCheck)

          if (itemsError || !items || items.length !== itemsToCheck.length) {
            return NextResponse.json(
              { success: false, error: 'One or more menu items not found' },
              { status: 400 }
            )
          }

          // Validate types
          for (const item of items) {
            if (validatedData.foodItemId === item.id && item.category?.type !== 'FOOD') {
              return NextResponse.json(
                { success: false, error: `Item "${item.name}" is not a food item` },
                { status: 400 }
              )
            }
            if (validatedData.wineItemId === item.id && item.category?.type !== 'WINE') {
              return NextResponse.json(
                { success: false, error: `Item "${item.name}" is not a wine item` },
                { status: 400 }
              )
            }
          }
        }
      }
    }

    // Update the wine pairing
    const { data: updatedPairing, error: updateError } = await supabase
      .from('wine_pairings')
      .update(validatedData)
      .eq('id', id)
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

    if (updateError) {
      console.error('Error updating wine pairing:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update wine pairing', details: updateError.message },
        { status: 500 }
      )
    }

    // Transform response
    const transformedPairing = {
      id: updatedPairing.id,
      foodItemId: updatedPairing.foodItemId,
      wineItemId: updatedPairing.wineItemId,
      description: updatedPairing.description,
      foodItem: {
        id: updatedPairing.foodItem.id,
        name: updatedPairing.foodItem.name,
        nameEn: updatedPairing.foodItem.nameEn,
        price: parseFloat(updatedPairing.foodItem.price),
        categoryId: updatedPairing.foodItem.categoryId,
        category: updatedPairing.foodItem.category
      },
      wineItem: {
        id: updatedPairing.wineItem.id,
        name: updatedPairing.wineItem.name,
        nameEn: updatedPairing.wineItem.nameEn,
        price: parseFloat(updatedPairing.wineItem.price),
        categoryId: updatedPairing.wineItem.categoryId,
        category: updatedPairing.wineItem.category
      }
    }

    return NextResponse.json({
      success: true,
      pairing: transformedPairing,
      message: 'Wine pairing updated successfully'
    })

  } catch (error) {
    console.error('PATCH wine pairing API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid update data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE wine pairing
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

    // Check if pairing exists and get details for response
    const { data: existingPairing, error: existingError } = await supabase
      .from('wine_pairings')
      .select(`
        id,
        foodItem:menu_items!foodItemId(name),
        wineItem:menu_items!wineItemId(name)
      `)
      .eq('id', id)
      .single()

    if (existingError || !existingPairing) {
      return NextResponse.json(
        { success: false, error: 'Wine pairing not found' },
        { status: 404 }
      )
    }

    // Delete the pairing
    const { error: deleteError } = await supabase
      .from('wine_pairings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting wine pairing:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete wine pairing', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Wine pairing deleted: "${existingPairing.foodItem.name}" with "${existingPairing.wineItem.name}"`
    })

  } catch (error) {
    console.error('DELETE wine pairing API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}