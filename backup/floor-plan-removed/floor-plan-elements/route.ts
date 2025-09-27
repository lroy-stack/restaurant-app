import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Simplified element types and defaults
const VALID_ELEMENT_TYPES = ['table', 'bar', 'door', 'plant', 'wall'] as const
const DEFAULT_SIZE = { width: 100, height: 100 }
const DEFAULT_STYLE = { backgroundColor: '#f8f9fa', borderColor: '#dee2e6' }

const RESTAURANT_ID = 'rest_enigma_001' // From database

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()

    const { data: elements, error } = await supabase
      .from('floor_plan_elements')
      .select('*')
      .eq('restaurant_id', RESTAURANT_ID)
      .order('z_index', { ascending: true })

    if (error) {
      console.error('Error fetching floor plan elements:', error)
      return NextResponse.json({ error: 'Failed to fetch elements' }, { status: 500 })
    }

    return NextResponse.json({ elements })
  } catch (error) {
    console.error('Error in GET /api/admin/floor-plan-elements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const body = await request.json()

    const {
      element_type,
      position_x,
      position_y,
      width,
      height,
      rotation = 0,
      z_index = 0,
      style_data = {},
      element_data = {}
    } = body

    // Validate element type
    if (!VALID_ELEMENT_TYPES.includes(element_type)) {
      return NextResponse.json({ error: 'Invalid element type' }, { status: 400 })
    }

    // Use defaults if not provided
    const defaultSize = DEFAULT_SIZE
    const defaultStyle = DEFAULT_STYLE

    const { data: element, error } = await supabase
      .from('floor_plan_elements')
      .insert([{
        restaurant_id: RESTAURANT_ID,
        element_type,
        position_x: position_x || 100,
        position_y: position_y || 100,
        width: width || defaultSize.width,
        height: height || defaultSize.height,
        rotation,
        z_index,
        style_data: { ...defaultStyle, ...style_data },
        element_data
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating floor plan element:', error)
      return NextResponse.json({ error: 'Failed to create element' }, { status: 500 })
    }

    return NextResponse.json({ element })
  } catch (error) {
    console.error('Error in POST /api/admin/floor-plan-elements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Element ID is required' }, { status: 400 })
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString()

    const { data: element, error } = await supabase
      .from('floor_plan_elements')
      .update(updates)
      .eq('id', id)
      .eq('restaurant_id', RESTAURANT_ID)
      .select()
      .single()

    if (error) {
      console.error('Error updating floor plan element:', error)
      return NextResponse.json({ error: 'Failed to update element' }, { status: 500 })
    }

    return NextResponse.json({ element })
  } catch (error) {
    console.error('Error in PUT /api/admin/floor-plan-elements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Element ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('floor_plan_elements')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', RESTAURANT_ID)

    if (error) {
      console.error('Error deleting floor plan element:', error)
      return NextResponse.json({ error: 'Failed to delete element' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/floor-plan-elements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}