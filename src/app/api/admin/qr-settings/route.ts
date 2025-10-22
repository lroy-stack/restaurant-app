import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseHeaders } from '@/lib/supabase/config'

// GET QR Settings - Admin endpoint to retrieve current QR system configuration
export async function GET() {
  try {
    console.log('🔍 QR Settings GET - Direct API call without Supabase client')

    // Use direct fetch to bypass any Supabase SSR issues
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/business_hours?restaurant_id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}&day_of_week=eq.7&select=qr_ordering_enabled,qr_only_menu,updated_at`,
      {
        method: 'GET',
        headers: {
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('Direct fetch failed:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch QR settings' },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('Direct fetch success:', data)

    if (!data || data.length === 0) {
      console.error('No QR settings found')
      return NextResponse.json(
        { error: 'QR settings not found' },
        { status: 404 }
      )
    }

    const settings = data[0]  // Get first result from array

    return NextResponse.json({
      success: true,
      settings: {
        qr_ordering_enabled: settings.qr_ordering_enabled,
        qr_only_menu: settings.qr_only_menu,
        last_updated: settings.updated_at
      }
    })

  } catch (error) {
    console.error('QR Settings API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST QR Settings - Admin endpoint to update QR system configuration
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 QR Settings POST - Direct API call without Supabase client')

    const body = await request.json()
    const { qr_ordering_enabled, qr_only_menu } = body

    // Validate input
    if (typeof qr_ordering_enabled !== 'boolean' || typeof qr_only_menu !== 'boolean') {
      return NextResponse.json(
        { error: 'qr_ordering_enabled and qr_only_menu must be boolean values' },
        { status: 400 }
      )
    }

    // Use direct fetch to bypass any Supabase SSR issues
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/business_hours?restaurant_id=eq.${process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'}&day_of_week=eq.7`,
      {
        method: 'PATCH',
        headers: {
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          qr_ordering_enabled,
          qr_only_menu,
          updated_at: new Date().toISOString()
        })
      }
    )

    if (!response.ok) {
      console.error('Direct patch failed:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to update QR settings' },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('Direct patch success:', data)

    const settings = data[0]  // Get first result from array

    return NextResponse.json({
      success: true,
      message: 'QR settings updated successfully',
      settings: {
        qr_ordering_enabled: settings.qr_ordering_enabled,
        qr_only_menu: settings.qr_only_menu,
        last_updated: settings.updated_at
      }
    })

  } catch (error) {
    console.error('QR Settings Update API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}