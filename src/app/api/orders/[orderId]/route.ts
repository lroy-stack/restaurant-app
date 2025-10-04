import { createServiceClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders/[orderId] - Get single order with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const supabase = await createServiceClient()

    const { data: order, error } = await supabase
      .schema('restaurante')
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          status,
          unitPrice,
          totalPrice,
          notes,
          menu_items (
            id,
            name,
            nameEn,
            nameDe,
            category,
            imageUrl
          )
        ),
        tables (
          id,
          number,
          location,
          capacity
        ),
        users:customerId (
          id,
          email,
          firstName,
          lastName
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('❌ GET /api/orders/[orderId] error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[orderId] - Update order (notes, status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const updates = await request.json()

    const supabase = await createServiceClient()

    // Add updated timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const { data: order, error } = await supabase
      .schema('restaurante')
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('❌ PATCH /api/orders/[orderId] error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[orderId] - Soft delete (set status to CANCELLED)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const supabase = await createServiceClient()

    // Soft delete by setting status to CANCELLED
    const { data: order, error } = await supabase
      .schema('restaurante')
      .from('orders')
      .update({
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Return stock for cancelled order
    const { data: orderItems } = await supabase
      .schema('restaurante')
      .from('order_items')
      .select('menuItemId, quantity')
      .eq('orderId', orderId)

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        await supabase.schema('restaurante').rpc('increase_menu_item_stock', {
          item_id: item.menuItemId,
          increase_amount: item.quantity,
        })
      }
      console.log('✅ Stock returned for cancelled order:', orderId)
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('❌ DELETE /api/orders/[orderId] error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
