import { cache } from 'react'
import 'server-only'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const getNavigation = cache(async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/navigation?is_active=eq.true&order=display_order.asc`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      next: {
        revalidate: 300,
        tags: ['navigation']
      }
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch navigation: ${res.status}`)
  }

  return res.json()
})

export type NavigationData = Awaited<ReturnType<typeof getNavigation>>
