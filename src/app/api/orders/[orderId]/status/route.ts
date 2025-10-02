import { createServiceClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { status, itemId } = await request.json()

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status required' },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    if (itemId) {
      const { error } = await supabase
        .schema('restaurante')
        .from('order_items')
        .update({
          status,
          updatedAt: new Date().toISOString()
        })
        .eq('id', itemId)

      if (error) throw error
    } else {
      const timestamps: any = { updatedAt: new Date().toISOString() }

      if (status === 'CONFIRMED') timestamps.confirmedAt = new Date().toISOString()
      if (status === 'READY') timestamps.readyAt = new Date().toISOString()
      if (status === 'SERVED') timestamps.servedAt = new Date().toISOString()

      const { error } = await supabase
        .schema('restaurante')
        .from('orders')
        .update({ status, ...timestamps })
        .eq('id', orderId)

      if (error) throw error

      // ✅ RETURN STOCK: If order is cancelled, return reserved stock
      if (status === 'CANCELLED') {
        console.log('📦 Order cancelled, returning stock...')

        // Fetch order items to return stock
        const { data: orderItems, error: fetchError } = await supabase
          .schema('restaurante')
          .from('order_items')
          .select('menuItemId, quantity')
          .eq('orderId', orderId)

        if (fetchError) {
          console.error('❌ Error fetching order items for stock return:', fetchError)
          // Don't fail the status update, just log the error
        } else if (orderItems && orderItems.length > 0) {
          // Return stock for each item
          for (const item of orderItems) {
            const { error: stockError } = await supabase
              .schema('restaurante')
              .rpc('increase_menu_item_stock', {
                item_id: item.menuItemId,
                increase_amount: item.quantity
              })

            if (stockError) {
              console.error('❌ Stock return failed for item:', item.menuItemId, stockError)
              // Continue with other items even if one fails
            } else {
              console.log(`✅ Stock returned: ${item.quantity}x ${item.menuItemId}`)
            }
          }
          console.log('✅ All stock returned successfully')
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Status update error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
