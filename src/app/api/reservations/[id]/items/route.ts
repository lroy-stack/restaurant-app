// app/api/reservations/[id]/items/route.ts - Get Reservation Pre-order Items
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const reservationId = params.id

    // Fetch reservation items with menu_items joined
    const { data: items, error } = await supabase
      .from('reservation_items')
      .select(`
        id,
        quantity,
        notes,
        menuItemId,
        menu_items!reservation_items_menuItemId_fkey (
          id,
          name,
          nameEn,
          price,
          type
        )
      `)
      .eq('reservationId', reservationId)

    if (error) {
      console.error('Error fetching reservation items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reservation items' },
        { status: 500 }
      )
    }

    // Transform data to match expected interface
    const transformedItems = items?.map(item => ({
      id: item.id,
      quantity: item.quantity,
      notes: item.notes,
      menuItemId: item.menuItemId,
      menuItem: {
        name: (item.menu_items as any)?.name || '',
        nameEn: (item.menu_items as any)?.nameEn,
        price: (item.menu_items as any)?.price || 0,
        type: (item.menu_items as any)?.type || 'FOOD'
      }
    })) || []

    return NextResponse.json({ items: transformedItems })
  } catch (error) {
    console.error('Error in reservation items API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
