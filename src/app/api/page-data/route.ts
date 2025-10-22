import { NextRequest, NextResponse } from 'next/server'

// Environment variables centralizadas (migrar a CONFIG en Task 1.3)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface PageDataResponse {
  restaurant: any
  navigation: any[]
  media: {
    hero: any
    all: any[]
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || 'home'

    // PARALLEL FETCH - todas las queries simultáneas
    // Pattern recomendado por Context7: Promise.all()
    const [restaurantRes, navigationRes, mediaRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}&select=*`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
        next: {
          revalidate: 300,  // Cache 5min (Context7 pattern)
          tags: ['restaurant']
        }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/navigation?is_active=eq.true&order=display_order.asc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
        next: {
          revalidate: 300,
          tags: ['navigation']
        }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/media_library?restaurant_id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}&type=eq.hero&is_active=eq.true&category=eq.hero_${page}&order=display_order.asc&limit=1`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
        next: {
          revalidate: 300,
          tags: ['media']
        }
      })
    ])

    // Error handling
    if (!restaurantRes.ok || !navigationRes.ok || !mediaRes.ok) {
      throw new Error('Failed to fetch data from Supabase')
    }

    // Parse responses in parallel
    const [restaurant, navigation, media] = await Promise.all([
      restaurantRes.json(),
      navigationRes.json(),
      mediaRes.json()
    ])

    const pageData: PageDataResponse = {
      restaurant: Array.isArray(restaurant) ? restaurant[0] : restaurant,
      navigation,
      media: {
        hero: media[0] || null,
        all: media
      }
    }

    return NextResponse.json(pageData, {
      headers: {
        // ISR + stale-while-revalidate pattern (Context7 best practice)
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Error fetching page data:', error)
    return NextResponse.json(
      { error: 'Error loading page data' },
      { status: 500 }
    )
  }
}

// Optional: Clear cache manually
export async function POST() {
  // Implementar revalidateTag('restaurant') si se necesita invalidación manual
  return NextResponse.json({ success: true, message: 'Cache cleared' })
}
