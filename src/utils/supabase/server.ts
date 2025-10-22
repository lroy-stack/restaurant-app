import { createServerClient } from '@supabase/ssr'
import { getSupabaseHeaders } from '@/lib/supabase/config'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  )
}

// For QR validation and analytics operations that need service role (bypass RLS)
export async function createServiceClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'public' }, // CRITICAL: Force schema routing
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore for Server Components
          }
        }
      },
      global: {
        headers: {
          // Schema handled by getSupabaseHeaders()      // CRITICAL: Schema routing
          // Schema handled by getSupabaseHeaders()     // CRITICAL: Required for writes
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`, // CRITICAL: Required by Kong Gateway
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!  // CRITICAL: Required by Kong Gateway
        }
      }
    }
  )
}