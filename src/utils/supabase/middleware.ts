import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      }
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // no user accessing protected /dashboard routes, redirect to acceso
    console.log('🚨 REDIRECT: Unauthenticated user accessing', request.nextUrl.pathname, '-> redirecting to /acceso')
    const url = request.nextUrl.clone()
    url.pathname = '/acceso'
    url.search = ''
    return NextResponse.redirect(url, 307)
  }

  // Add Supabase schema headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    supabaseResponse.headers.set('Accept-Profile', 'public')
    supabaseResponse.headers.set('Content-Profile', 'public')
    
    // CORS headers for API routes
    supabaseResponse.headers.set('Access-Control-Allow-Origin', '*')
    supabaseResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    supabaseResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept-Profile, Content-Profile, apikey')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: supabaseResponse.headers })
    }
    
    // Log API requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${request.method} ${request.nextUrl.pathname} - Schema: public`)
    }
  }

  // Security headers for all routes
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}