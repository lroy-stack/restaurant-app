import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for QR settings API - uses service role
  if (request.nextUrl.pathname === '/api/admin/qr-settings') {
    console.log('🔓 SKIPPING MIDDLEWARE for QR settings API')
    return NextResponse.next()
  }

  console.log('🔒 MIDDLEWARE processing:', request.nextUrl.pathname)
  // Use proper Supabase middleware for session management
  // This handles concurrent users and proper session updates
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match only specific protected routes:
     * - /dashboard/* (protected admin area)
     * - /api/* EXCEPT public endpoints
     */
    "/dashboard/:path*",
    "/api/((?!admin/qr-settings|reservations|tables/availability).*)"
  ],
}