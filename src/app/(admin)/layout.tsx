import { ReactNode } from 'react'
import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { RealtimeNotificationsProvider } from '@/components/providers/realtime-notifications-provider'
import { getRestaurant } from '@/lib/data/restaurant'

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant()

  if (!restaurant) {
    throw new Error('⚠️ Configure restaurants table in database')
  }

  return {
    title: {
      template: `%s | Admin - ${restaurant.name}`,
      default: `Admin - ${restaurant.name}`
    },
    description: `Panel de administración del restaurante ${restaurant.name}`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

interface AdminRouteLayoutProps {
  children: ReactNode
}

/**
 * Admin Route Group Layout
 *
 * Este layout se aplica a todas las páginas administrativas dentro del Route Group (admin)
 * Incluye protección Supabase y estructura básica de administración
 *
 * Protección: Solo usuarios autenticados en Supabase pueden acceder
 *
 * Páginas afectadas:
 * - /dashboard/*
 * - Cualquier nueva ruta admin que se añada
 *
 * Features:
 * - RealtimeNotificationsProvider: Notificaciones globales en todas las páginas admin
 */
export default async function AdminRouteLayout({ children }: AdminRouteLayoutProps) {
  // Server-side Supabase auth protection at layout level
  const cookieStore = await cookies()
  const supabase = createServerClient(
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
        },
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/acceso')
  }

  return (
    <RealtimeNotificationsProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Admin-specific header/navigation can be added here */}
        <main>
          {children}
        </main>
      </div>
    </RealtimeNotificationsProvider>
  )
}