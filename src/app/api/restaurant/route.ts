import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseHeaders } from '@/lib/supabase/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Fetch ALL restaurant data including dynamic fields
    const response = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Schema handled by getSupabaseHeaders()
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (!response.ok) {
      console.error('Supabase response error:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Restaurant data from Supabase:', data)

    // Return the first restaurant (should be only one)
    const restaurant = Array.isArray(data) ? data[0] : data

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json(restaurant)
    
  } catch (error) {
    console.error('Error fetching restaurant info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()
    console.log('Received updates:', JSON.stringify(updates, null, 2))

    // Update restaurant data in Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Schema handled by getSupabaseHeaders()
        // Schema handled by getSupabaseHeaders()
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Supabase update error:', response.status, response.statusText)
      console.error('Error body:', errorBody)
      return NextResponse.json(
        { error: `Supabase error: ${response.status} - ${errorBody}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Update successful:', data)
    return NextResponse.json(data[0])

  } catch (error) {
    console.error('Error updating restaurant info:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to update restaurant info: ${errorMessage}` },
      { status: 500 }
    )
  }
}