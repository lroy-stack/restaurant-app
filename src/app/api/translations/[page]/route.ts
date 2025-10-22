import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseHeaders } from '@/lib/supabase/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ⚡ OPTIMIZATION: Cache translations for 1 minute
export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'es'
    const sectionKey = searchParams.get('section')

    // Build query filters
    let query = `page_key=eq.${page}&language=eq.${language}`
    if (sectionKey) {
      query += `&section_key=eq.${sectionKey}`
    }

    // Fetch translations from Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/page_translations?${query}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (!response.ok) {
      console.error('Supabase response error:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform array to object keyed by section_key
    const translations = data.reduce((acc: Record<string, any>, item: any) => {
      acc[item.section_key] = item.content
      return acc
    }, {})

    return NextResponse.json({
      page,
      language,
      translations,
      count: data.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
}
