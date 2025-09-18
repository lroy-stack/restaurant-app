import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = 'https://supabase.enigmaconalma.com'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export async function GET() {
  try {
    // Fetch restaurant data from Supabase using the function we created
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_restaurant_info`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({})
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
    
    // Update restaurant data in Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.rest_enigma_001`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      console.error('Supabase update error:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data[0])
    
  } catch (error) {
    console.error('Error updating restaurant info:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant info' },
      { status: 500 }
    )
  }
}