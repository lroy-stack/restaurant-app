import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

interface PhysicalMenuInsert {
  code: string
  type: 'CARTA_FISICA' | 'CARTELERIA'
  location?: string
  description?: string
  qr_code: string
  qr_url: string
  is_active: boolean
  total_scans: number
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createAdminSupabaseClient(cookieStore)
    const { menus } = await request.json() as { menus: PhysicalMenuInsert[] }

    if (!menus || menus.length === 0) {
      return NextResponse.json(
        { error: 'No menus provided' },
        { status: 400 }
      )
    }

    // Insert batch into physical_menus table
    const { data, error } = await supabase
      .schema('restaurante')
      .from('physical_menus')
      .insert(menus)
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Physical menus API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createAdminSupabaseClient(cookieStore)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = supabase
      .schema('restaurante')
      .from('physical_menus')
      .select('*')
      .order('code', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Physical menus GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
