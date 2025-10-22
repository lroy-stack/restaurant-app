import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseHeaders } from '@/lib/supabase/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build query
    let query = `${SUPABASE_URL}/rest/v1/media_library?`
    const params = ['restaurant_id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}']

    if (type) params.push(`type=eq.${type}`)
    if (category) params.push(`category=eq.${category}`)
    if (!includeInactive) params.push('is_active=eq.true')

    // Order by display_order, then by created_at
    params.push('order=display_order.asc,created_at.asc')

    query += params.join('&')

    const response = await fetch(query, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        // Schema handled by getSupabaseHeaders()
        // Schema handled by getSupabaseHeaders()
        'apikey': SUPABASE_SERVICE_KEY,
      },
    })

    if (!response.ok) {
      console.error('Supabase response error:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const items = await response.json()

    // Calculate summary data
    const activeItems = items.filter((item: any) => item.is_active)
    const byType = activeItems.reduce((acc: Record<string, number>, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})

    // Calculate categories for gallery items
    const galleryItems = activeItems.filter((item: any) => item.type === 'gallery')
    const categories = galleryItems.reduce((acc: any[], item: any) => {
      const categoryKey = item.category.replace('gallery_', '')
      const existingCategory = acc.find(cat => cat.id === categoryKey)

      if (existingCategory) {
        existingCategory.count++
      } else {
        const categoryNames: Record<string, string> = {
          ambiente: 'Ambiente',
          platos: 'Nuestros Platos',
          ubicacion: 'Ubicación',
          cocina: 'En la Cocina'
        }

        acc.push({
          id: categoryKey,
          name: categoryNames[categoryKey] || categoryKey,
          count: 1
        })
      }

      return acc
    }, [])

    const mediaLibraryData = {
      items,
      categories,
      summary: {
        total: items.length,
        active: activeItems.length,
        byType
      }
    }

    return NextResponse.json(mediaLibraryData)

  } catch (error) {
    console.error('Error fetching media library:', error)
    return NextResponse.json(
      { error: 'Error al obtener la biblioteca de medios' },
      { status: 500 }
    )
  }
}