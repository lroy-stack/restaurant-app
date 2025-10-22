import { createServiceClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params
    const supabase = await createServiceClient()

    // Get customer email
    const { data: customer, error: customerError } = await supabase
      .schema('public')
      .from('customers')
      .select('email')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Fetch orders by email matching
    const { data: orders, error: ordersError } = await supabase
      .schema('public')
      .from('orders')
      .select(`
        id,
        orderNumber,
        totalAmount,
        status,
        notes,
        orderedAt,
        confirmedAt,
        readyAt,
        servedAt,
        order_source,
        customer_email,
        tables!orders_tableId_fkey (
          id,
          number,
          location
        ),
        order_items!inner (
          id,
          quantity,
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
      .ilike('customer_email', customer.email)
      .order('orderedAt', { ascending: false })

    if (ordersError) {
      console.error('❌ Orders fetch error:', ordersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Calculate stats
    const stats = {
      total: orders?.length || 0,
      totalAmount: orders?.reduce((sum, o) => sum + Number(o.totalAmount), 0) || 0,
      served: orders?.filter(o => o.status === 'SERVED').length || 0,
      pending: orders?.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)).length || 0
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      stats
    })

  } catch (error: any) {
    console.error('❌ Customer orders API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
