import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Configuración de Supabase Server para operaciones del servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// 🔧 CORRECCIÓN: Función que recibe cookieStore como parámetro
export function createServerSupabaseClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
      },
    },
    db: {
      schema: 'restaurante'  // 🚨 CRÍTICO: ÚNICAMENTE esquema restaurante
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// 🔧 CORRECCIÓN: Función utilitaria para páginas que necesitan client
export async function createClient() {
  const cookieStore = await cookies()
  return createServerSupabaseClient(cookieStore)
}

// Cliente administrativo para operaciones del servidor con service role
export function createAdminSupabaseClient(cookieStore: ReadonlyRequestCookies) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient(
    supabaseUrl!,
    serviceRoleKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{name: string; value: string; options?: any}>) {
          try {
            cookiesToSet.forEach(({ name, value, options }: {name: string; value: string; options?: any}) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in server components
          }
        },
      },
      db: {
        schema: 'restaurante'  // 🚨 CRÍTICO: ÚNICAMENTE esquema restaurante
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}

// 🔧 CORRECCIÓN: Función utilitaria para admin client
export async function createAdminClient() {
  const cookieStore = await cookies()
  return createAdminSupabaseClient(cookieStore)
}