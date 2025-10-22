import { cache } from 'react'
import 'server-only'

// Environment config (temporal - migrar a CONFIG en Task 1.3)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Get restaurant configuration with React.cache() memoization
 *
 * Pattern: Context7 /vercel/next.js - Memoize Data Requests
 *
 * Ensures single DB call per render, even if called multiple times
 * across different components in same request.
 */
export const getRestaurant = cache(async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/restaurants?id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}&select=*`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      next: {
        revalidate: 300,  // ISR 5min
        tags: ['restaurant']
      }
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch restaurant: ${res.status}`)
  }

  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
})

/**
 * Type-safe restaurant data
 */
export type RestaurantData = Awaited<ReturnType<typeof getRestaurant>>
