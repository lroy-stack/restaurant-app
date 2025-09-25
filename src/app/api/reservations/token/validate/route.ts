import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * 🔐 SECURE TOKEN VALIDATION API
 * Endpoint dedicado para validación de tokens de reserva
 * Soluciona problemas de RLS usando service client
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Validación básica del token
    if (!token || typeof token !== 'string' || token.length < 10) {
      return NextResponse.json({
        valid: false,
        error: 'Token inválido',
        errorType: 'invalid'
      }, { status: 400 })
    }

    console.log('🔍 Token validation started', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10) + '...'
    })

    const supabase = await createServiceClient()

    // 1. Buscar token en la base de datos usando service client
    const { data: tokenData, error: tokenError } = await supabase
      .schema('restaurante')
      .from('reservation_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (tokenError || !tokenData) {
      console.log('⚠️ Token not found or inactive', { error: tokenError?.message })
      return NextResponse.json({
        valid: false,
        error: 'Token no encontrado',
        errorType: 'not_found'
      }, { status: 404 })
    }

    // 2. Verificar expiración
    const now = new Date()
    const expiryDate = new Date(tokenData.expires)

    if (now > expiryDate) {
      console.log('⚠️ Token expired', {
        now: now.toISOString(),
        expires: expiryDate.toISOString()
      })

      return NextResponse.json({
        valid: false,
        error: 'El enlace ha expirado',
        errorType: 'expired'
      }, { status: 410 })
    }

    // 3. Obtener datos de la reserva
    const { data: reservationData, error: reservationError } = await supabase
      .schema('restaurante')
      .from('reservations')
      .select(`
        id,
        "customerName",
        "customerEmail",
        "customerPhone",
        "partySize",
        date,
        time,
        status,
        "specialRequests",
        "hasPreOrder",
        table_ids,
        "createdAt",
        "updatedAt",
        reservation_items (
          id,
          quantity,
          notes,
          menu_items (
            id,
            name,
            price
          )
        )
      `)
      .eq('id', tokenData.reservation_id)
      .single()

    if (reservationError || !reservationData) {
      console.error('❌ Error fetching reservation:', reservationError?.message)
      return NextResponse.json({
        valid: false,
        error: 'Reserva no encontrada',
        errorType: 'not_found'
      }, { status: 404 })
    }

    // 3.5. Obtener información de las mesas (soporte para múltiples mesas)
    let tablesData = []
    if (reservationData.table_ids && reservationData.table_ids.length > 0) {
      const { data: tableResults, error: tableError } = await supabase
        .schema('restaurante')
        .from('tables')
        .select('id, number, capacity, location')
        .in('id', reservationData.table_ids)

      if (tableError) {
        console.error('❌ Error fetching tables:', tableError?.message)
      } else {
        tablesData = tableResults || []
        // Sort tables by number for consistent display
        tablesData.sort((a, b) => {
          const aNum = parseInt(a.number.replace(/[^0-9]/g, ''))
          const bNum = parseInt(b.number.replace(/[^0-9]/g, ''))
          return aNum - bNum
        })
      }
    }

    // 4. Verificar estado de la reserva
    if (['CANCELLED', 'COMPLETED'].includes(reservationData.status)) {
      console.log('⚠️ Reservation is finalized', { status: reservationData.status })
      return NextResponse.json({
        valid: false,
        error: 'Reserva finalizada',
        errorType: 'invalid'
      }, { status: 400 })
    }

    // 5. Verificar tiempo hasta la reserva (2 horas mínimo)
    const reservationDateTime = new Date(reservationData.time)
    const timeDiff = reservationDateTime.getTime() - now.getTime()
    const hoursUntilReservation = timeDiff / (1000 * 60 * 60)

    if (hoursUntilReservation < 2 && hoursUntilReservation > 0) {
      console.log('⚠️ Too close to reservation time', { hoursUntil: hoursUntilReservation })
      return NextResponse.json({
        valid: false,
        error: `No se pueden realizar cambios ${hoursUntilReservation.toFixed(1)} horas antes de la reserva`,
        errorType: 'too_close'
      }, { status: 400 })
    }

    // 6. Extraer información del cliente
    const customer = {
      firstName: reservationData.customerName?.split(' ')[0] || '',
      lastName: reservationData.customerName?.split(' ').slice(1).join(' ') || '',
      email: reservationData.customerEmail,
      phone: reservationData.customerPhone
    }

    // 7. Calcular total de pre-orden si existe
    let preOrderTotal = 0
    const preOrderItems = reservationData.reservation_items?.map((item: any) => {
      const itemTotal = item.menu_items.price * item.quantity
      preOrderTotal += itemTotal
      return {
        id: item.id,
        name: item.menu_items.name,
        price: item.menu_items.price,
        quantity: item.quantity,
        notes: item.notes
      }
    }) || []

    // 8. Formatear respuesta
    const formattedReservation = {
      ...reservationData,
      date: new Date(reservationData.date).toISOString().split('T')[0],
      time: new Date(reservationData.time).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      preOrderItems,
      preOrderTotal,
      // 🔧 FIXED: Provide multiple tables data + backward compatibility
      tables: tablesData.length > 0 ? tablesData[0] : null, // First table for backward compatibility
      allTables: tablesData, // Complete array of tables
      tableIds: reservationData.table_ids || [], // Array of table IDs
      // Keep legacy tableId for compatibility
      tableId: reservationData.table_ids?.[0] || null
    }

    console.log('✅ Token validated successfully', {
      reservationId: reservationData.id,
      customerEmail: customer.email,
      date: formattedReservation.date,
      time: formattedReservation.time
    })

    return NextResponse.json({
      valid: true,
      reservation: formattedReservation,
      customer: customer
    })

  } catch (error) {
    console.error('🚨 Token validation failed:', error)
    return NextResponse.json({
      valid: false,
      error: 'Error de conexión',
      errorType: 'network'
    }, { status: 500 })
  }
}