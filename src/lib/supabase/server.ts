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

// 🔧 CORRECCIÓN: Cliente con schema 'public' explícito
export function createServerSupabaseClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{name: string, value: string, options?: Record<string, unknown>}>) {
        try {
          cookiesToSet.forEach(({ name, value, options }: {name: string, value: string, options?: Record<string, unknown>}) =>
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
      schema: 'public'
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// Cliente específico para esquema restaurante
export function createServerSupabaseRestauranteClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{name: string, value: string, options?: Record<string, unknown>}>) {
        try {
          cookiesToSet.forEach(({ name, value, options }: {name: string, value: string, options?: Record<string, unknown>}) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
    db: {
      schema: 'restaurante'
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
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{name: string, value: string, options?: Record<string, unknown>}>) {
          try {
            cookiesToSet.forEach(({ name, value, options }: {name: string, value: string, options?: Record<string, unknown>}) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in server components
          }
        },
      },
      db: {
        schema: 'public'
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}

// Cliente administrativo específico para esquema restaurante
export function createAdminSupabaseRestauranteClient(cookieStore: ReadonlyRequestCookies) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient(
    supabaseUrl!,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{name: string, value: string, options?: Record<string, unknown>}>) {
          try {
            cookiesToSet.forEach(({ name, value, options }: {name: string, value: string, options?: Record<string, unknown>}) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
      db: {
        schema: 'restaurante'
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}

// 🔧 CORRECCIÓN: Función utilitaria para admin client (con cookies)
export async function createAdminClient() {
  const cookieStore = await cookies()
  return createAdminSupabaseClient(cookieStore)
}

// 🚀 NEW: Cliente admin directo para API routes (sin cookies)
export function createDirectAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient(
    supabaseUrl!,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() { /* no-op */ },
      },
      db: {
        schema: 'public'
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}

// Cliente admin directo específico para esquema restaurante
export function createDirectAdminRestauranteClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient(
    supabaseUrl!,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() { /* no-op */ },
      },
      db: {
        schema: 'restaurante'
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}