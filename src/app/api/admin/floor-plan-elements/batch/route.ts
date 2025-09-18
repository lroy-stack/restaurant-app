import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const RESTAURANT_ID = 'rest_enigma_001'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const body = await request.json()
    const { elements } = body

    console.log('🔍 Batch update received:', JSON.stringify(elements, null, 2))

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json({ error: 'Elements array is required' }, { status: 400 })
    }

    const results = []

    // Process each element separately to handle creates vs updates
    for (const element of elements) {
      if (element.id && !element.id.startsWith('temp_')) {
        // Update existing element
        const { id, ...updates } = element
        const { data: updatedElement, error } = await supabase
          .from('floor_plan_elements')
          .update({
            ...updates,
            restaurant_id: RESTAURANT_ID,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('restaurant_id', RESTAURANT_ID)
          .select()
          .single()

        if (error) {
          console.error('Error updating floor plan element:', error)
          return NextResponse.json({ error: `Failed to update element ${id}` }, { status: 500 })
        }

        results.push(updatedElement)
      } else {
        // Create new element (no ID or temp ID)
        const { id, ...newElement } = element
        const { data: createdElement, error } = await supabase
          .from('floor_plan_elements')
          .insert([{
            ...newElement,
            restaurant_id: RESTAURANT_ID
          }])
          .select()
          .single()

        if (error) {
          console.error('Error creating floor plan element:', error)
          return NextResponse.json({ error: 'Failed to create new element' }, { status: 500 })
        }

        results.push(createdElement)
      }
    }

    return NextResponse.json({ elements: results })
  } catch (error) {
    console.error('Error in PUT /api/admin/floor-plan-elements/batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}