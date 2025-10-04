import { createServiceClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CreateOrderDTO } from '@/types/pos'
import { validateCreateOrder } from '@/lib/orders/order-validators'

// GET /api/orders - List orders with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const restaurantId = searchParams.get('restaurantId') || 'rest_enigma_001'
    const statuses = searchParams.get('statuses')?.split(',')
    const tableId = searchParams.get('tableId')
    const source = searchParams.get('source')
    const orderId = searchParams.get('orderId')
    const limit = parseInt(searchParams.get('limit') || '100')

    const supabase = await createServiceClient()

    let query = supabase
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
          menuItemId,
          menu_items (
            id,
            name,
            nameEn,
            imageUrl
          )
        ),
        tables (
          id,
          number,
          location,
          capacity
        )
      `)
      .eq('restaurantId', restaurantId)
      .order('orderedAt', { ascending: false })
      .limit(limit)

    if (orderId) {
      query = query.eq('id', orderId)
    }

    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses)
    }

    if (tableId) {
      query = query.eq('tableId', tableId)
    }

    if (source) {
      query = query.eq('order_source', source)
    }

    const { data: orders, error } = await query

    if (error) throw error

    // Transform: menu_items (snake_case) → menuItem (camelCase) for frontend compatibility
    // Transform: tables (object from Supabase join) → table (singular)
    const transformedOrders = orders?.map(order => ({
      ...order,
      order_items: order.order_items?.map(item => ({
        ...item,
        menuItem: item.menu_items, // Map snake_case to camelCase
      })),
      table: (order as any).tables || null, // Supabase returns object, not array
    })) || []

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      count: transformedOrders.length,
    })
  } catch (error: any) {
    console.error('❌ GET /api/orders error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order (presencial/POS)
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderDTO = await request.json()

    // Validate order data
    const validation = validateCreateOrder(body)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de pedido inválidos',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    // Generate order number: ENI-YYMMDD-XXXXXX
    const now = new Date()
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '')
    const randomNum = Math.floor(100000 + Math.random() * 900000)
    const orderNumber = `ENI-${dateStr}-${randomNum}`

    // Calculate total amount
    const totalAmount = body.items.reduce((sum, item) => {
      return sum + (item.quantity * 0) // Will be calculated after fetching prices
    }, 0)

    // Start transaction: Create order + items + decrease stock
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .schema('restaurante')
      .from('orders')
      .insert({
        id: orderId,
        orderNumber,
        restaurantId: body.restaurantId,
        tableId: body.tableId,
        status: 'PENDING',
        order_source: body.order_source,
        notes: body.notes,
        totalAmount: 0, // Will update after creating items
        orderedAt: new Date().toISOString(),
        customer_email: body.customer_email,
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Order creation failed:', orderError)
      throw new Error('Failed to create order')
    }

    // 2. Fetch menu item prices and validate stock
    const menuItemIds = body.items.map((i) => i.menuItemId)
    const { data: menuItems, error: menuError } = await supabase
      .schema('restaurante')
      .from('menu_items')
      .select('id, price, stock, name')
      .in('id', menuItemIds)

    if (menuError) {
      // Rollback: delete order
      await supabase.schema('restaurante').from('orders').delete().eq('id', orderId)
      throw new Error('Failed to fetch menu items')
    }

    const menuItemsMap = new Map(menuItems.map((item) => [item.id, item]))

    // Check stock availability
    const stockErrors: Array<{
      menuItemId: string
      name: string
      requested: number
      available: number
    }> = []

    for (const item of body.items) {
      const menuItem = menuItemsMap.get(item.menuItemId)
      if (!menuItem) {
        stockErrors.push({
          menuItemId: item.menuItemId,
          name: 'Unknown item',
          requested: item.quantity,
          available: 0,
        })
        continue
      }

      if (menuItem.stock < item.quantity) {
        stockErrors.push({
          menuItemId: item.menuItemId,
          name: menuItem.name,
          requested: item.quantity,
          available: menuItem.stock,
        })
      }
    }

    if (stockErrors.length > 0) {
      // Rollback: delete order
      await supabase.schema('restaurante').from('orders').delete().eq('id', orderId)

      return NextResponse.json(
        {
          success: false,
          error: 'Stock insuficiente',
          stockErrors,
        },
        { status: 400 }
      )
    }

    // 3. Create order items and decrease stock
    let calculatedTotal = 0

    for (const item of body.items) {
      const menuItem = menuItemsMap.get(item.menuItemId)!
      const itemTotal = menuItem.price * item.quantity
      calculatedTotal += itemTotal

      // Create order item
      const { error: itemError } = await supabase
        .schema('restaurante')
        .from('order_items')
        .insert({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          orderId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemTotal,
          status: 'PENDING',
          notes: item.specialRequests,
        })

      if (itemError) {
        console.error('❌ Order item creation failed:', itemError)
        // Rollback: delete order and items
        await supabase.schema('restaurante').from('orders').delete().eq('id', orderId)
        throw new Error('Failed to create order items')
      }

      // Decrease stock
      const { error: stockError } = await supabase
        .schema('restaurante')
        .rpc('decrease_menu_item_stock', {
          item_id: item.menuItemId,
          decrease_amount: item.quantity,
        })

      if (stockError) {
        console.error('❌ Stock decrease failed:', stockError)
        // Rollback: delete order and items
        await supabase.schema('restaurante').from('orders').delete().eq('id', orderId)
        throw new Error('Failed to reserve stock')
      }
    }

    // 4. Update order total
    const { error: updateError } = await supabase
      .schema('restaurante')
      .from('orders')
      .update({ totalAmount: calculatedTotal })
      .eq('id', orderId)

    if (updateError) {
      console.error('❌ Order total update failed:', updateError)
    }

    console.log(`✅ Order created: ${orderNumber} (${calculatedTotal}€)`)

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        totalAmount: calculatedTotal,
        status: 'PENDING',
      },
    })
  } catch (error: any) {
    console.error('❌ POST /api/orders error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
