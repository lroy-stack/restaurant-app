import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { EmailService } from '@/lib/email/emailService'

export const dynamic = 'force-dynamic'

const emailService = EmailService.getInstance()

/**
 * 🚨 CANCEL RESERVATION WITH TOKEN
 * Endpoint dedicado para cancelar reservas usando token
 */
export async function POST(request: NextRequest) {
  try {
    const { token, reason } = await request.json()

    // Validación básica
    if (!token || typeof token !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Token requerido'
      }, { status: 400 })
    }

    console.log('❌ Starting reservation cancellation', {
      tokenPrefix: token.substring(0, 10) + '...',
      hasReason: !!reason
    })

    const supabase = await createServiceClient()

    // 1. Validar token y obtener reserva
    const { data: tokenData, error: tokenError } = await supabase
      .schema('restaurante')
      .from('reservation_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (tokenError || !tokenData) {
      console.log('⚠️ Token not found or inactive')
      return NextResponse.json({
        success: false,
        error: 'Token inválido'
      }, { status: 404 })
    }

    // 2. Verificar expiración
    const now = new Date()
    const expiryDate = new Date(tokenData.expires)

    if (now > expiryDate) {
      console.log('⚠️ Token expired')
      return NextResponse.json({
        success: false,
        error: 'Token expirado'
      }, { status: 410 })
    }

    // 3. Obtener datos actuales de la reserva
    const { data: reservation, error: reservationError } = await supabase
      .schema('restaurante')
      .from('reservations')
      .select('id, status, "specialRequests"')
      .eq('id', tokenData.reservation_id)
      .single()

    if (reservationError || !reservation) {
      console.error('❌ Reservation not found:', reservationError?.message)
      return NextResponse.json({
        success: false,
        error: 'Reserva no encontrada'
      }, { status: 404 })
    }

    // 4. Verificar que la reserva se puede cancelar
    if (['CANCELLED', 'COMPLETED'].includes(reservation.status)) {
      return NextResponse.json({
        success: false,
        error: 'La reserva ya está finalizada'
      }, { status: 400 })
    }

    // 5. Actualizar reserva a estado CANCELLED
    const cancellationNote = reason ? `Cancelada: ${reason}` : 'Cancelada por el cliente'
    const updatedSpecialRequests = reservation.specialRequests
      ? `${reservation.specialRequests}\n\n${cancellationNote}`
      : cancellationNote

    const { error: updateError } = await supabase
      .schema('restaurante')
      .from('reservations')
      .update({
        status: 'CANCELLED',
        specialRequests: updatedSpecialRequests.trim(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', tokenData.reservation_id)

    if (updateError) {
      console.error('❌ Error updating reservation:', updateError.message)
      return NextResponse.json({
        success: false,
        error: 'Error al cancelar reserva'
      }, { status: 500 })
    }

    // 6. Delete token específico completamente
    const { error: tokenDeleteError } = await supabase
      .schema('restaurante')
      .from('reservation_tokens')
      .delete()
      .eq('token', token)

    if (tokenDeleteError) {
      console.warn('⚠️ Error deleting token:', tokenDeleteError.message)
      // No fallar por esto, la reserva ya está cancelada
    } else {
      console.log('✅ Token deleted successfully')
    }

    // 7. 📧 CRITICAL: Enviar email de cancelación al cliente
    try {
      console.log('📧 Enviando email de cancelación por cliente...')

      const emailData = await emailService.buildEmailDataFromReservation(tokenData.reservation_id)
      if (emailData) {
        // Add cancellation specific data for client cancellation
        const cancellationEmailData = {
          ...emailData,
          cancellationReason: reason || 'Cancelado por el cliente',
          cancellationType: 'client', // Flag para diferenciar de cancelación por restaurante
          restaurantMessage: 'Lamentamos que hayas tenido que cancelar tu reserva. ¡Esperamos verte pronto en otra ocasión!'
        }

        const emailResult = await emailService.sendCancellation(cancellationEmailData)

        if (emailResult === 'ok') {
          console.log('✅ Email de cancelación enviado exitosamente a:', tokenData.customer_email)
        } else {
          console.error('❌ Error enviando email de cancelación:', emailResult)
          // Continue execution - don't block cancellation
        }
      } else {
        console.error('❌ No se pudo obtener datos para email de cancelación')
      }
    } catch (emailError) {
      console.error('❌ Error crítico enviando email de cancelación:', emailError)
      // Continue execution - don't block cancellation
    }

    console.log('✅ Reservation cancelled successfully', {
      reservationId: tokenData.reservation_id,
      reason: reason || 'No reason provided'
    })

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    })

  } catch (error) {
    console.error('🚨 Error cancelling reservation:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}