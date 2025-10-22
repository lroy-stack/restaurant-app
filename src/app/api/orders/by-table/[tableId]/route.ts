import { createServiceClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params
    const supabase = await createServiceClient()

    const { data: orders, error } = await supabase
      .schema('public')
      .from('orders')
      .select(`
        id,
        orderNumber,
        status,
        totalAmount,
        notes,
        orderedAt,
        confirmedAt,
        readyAt,
        servedAt,
        order_items!inner (
          id,
          quantity,
          status,
          unitPrice,
          totalPrice,
          notes,
          menu_items!inner (
            id,
            name,
            nameEn
          )
        )
      `)
      .eq('tableId', tableId)
      .not('status', 'in', '("SERVED","CANCELLED")')
      .order('orderedAt', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Orders API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
