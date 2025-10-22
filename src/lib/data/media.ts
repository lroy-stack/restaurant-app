import { cache } from 'react'
import 'server-only'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const getHeroImage = cache(async (page: string) => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/media_library?restaurant_id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}&type=eq.hero&category=eq.hero_${page}&is_active=eq.true&order=display_order.asc&limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      next: {
        revalidate: 300,
        tags: ['media']
      }
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch hero image: ${res.status}`)
  }

  const data = await res.json()
  return data[0] || null
})

export type MediaItem = Awaited<ReturnType<typeof getHeroImage>>
