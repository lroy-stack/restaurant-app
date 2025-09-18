import { supabase } from '@/lib/supabase/client'

export interface TokenValidationResult {
  valid: boolean
  reservation?: any
  customer?: any
  error?: string
}

export class ReservationTokenService {
  static async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      // 🚀 SECURITY FIX: Query reservation_tokens table with join to reservations
      const { data: tokenData, error } = await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .select(`
          *,
          reservations!reservation_id(
            *,
            customers!customerId(*),
            tables!tableId(*)
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .single()

      if (error || !tokenData) {
        return { valid: false, error: 'Token no encontrado' }
      }

      // Validate token expiry and active status
      const now = new Date()
      const expiryDate = new Date(tokenData.expires)

      if (!tokenData.is_active) {
        return { valid: false, error: 'Token inactivo' }
      }

      if (now > expiryDate) {
        return { valid: false, error: 'Token expirado' }
      }

      const reservation = tokenData.reservations

      // Check if reservation is cancelled or completed
      if (['CANCELLED', 'COMPLETED'].includes(reservation.status)) {
        return { valid: false, error: 'Reserva finalizada' }
      }

      // Validate reservation is not too close to start time (2h buffer)
      const reservationDateTime = new Date(reservation.time)
      const timeDiff = reservationDateTime.getTime() - now.getTime()
      const hoursUntilReservation = timeDiff / (1000 * 60 * 60)

      if (hoursUntilReservation < 2 && hoursUntilReservation > 0) {
        return {
          valid: false,
          error: 'No se pueden realizar cambios 2 horas antes de la reserva'
        }
      }

      // Token is valid - extract customer info from reservation
      const customer = {
        firstName: reservation.customerName?.split(' ')[0] || '',
        lastName: reservation.customerName?.split(' ').slice(1).join(' ') || '',
        email: reservation.customerEmail,
        phone: reservation.customerPhone
      }

      return {
        valid: true,
        reservation: {
          ...reservation,
          date: new Date(reservation.date).toISOString().split('T')[0],
          time: new Date(reservation.time).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          preOrderItems: [], // TODO: Load from reservation_items table if needed
          preOrderTotal: 0 // TODO: Calculate from reservation_items
        },
        customer
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return { valid: false, error: 'Error de validación' }
    }
  }

  static async updateReservation(
    reservationId: string,
    updates: any,
    token: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First validate token
      const validation = await this.validateToken(token)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Verify the token belongs to this reservation
      if (validation.reservation?.id !== reservationId) {
        return { success: false, error: 'Token no válido para esta reserva' }
      }

      // Mark token as used
      await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token)

      // Update reservation
      const { error } = await supabase
        .schema('restaurante')
        .from('reservations')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', reservationId)
        // 🚀 SECURITY: Token validation handled separately via reservation_tokens table

      if (error) {
        console.error('Update reservation error:', error)
        return { success: false, error: 'Error al actualizar reserva' }
      }

      return { success: true }
    } catch (error) {
      console.error('Update reservation error:', error)
      return { success: false, error: 'Error interno' }
    }
  }

  static async cancelReservation(
    reservationId: string,
    token: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate token first
      const validation = await this.validateToken(token)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Update reservation status to cancelled
      const { error } = await supabase
        .schema('restaurante')
        .from('reservations')
        .update({
          status: 'CANCELLED',
          specialRequests: reason ? `${validation.reservation.specialRequests || ''}\n\nCancelada: ${reason}`.trim() : validation.reservation.specialRequests,
          updatedAt: new Date().toISOString()
        })
        .eq('id', reservationId)
        // 🚀 SECURITY: Token validation handled separately via reservation_tokens table

      if (error) {
        console.error('Cancel reservation error:', error)
        return { success: false, error: 'Error al cancelar reserva' }
      }

      return { success: true }
    } catch (error) {
      console.error('Cancel reservation error:', error)
      return { success: false, error: 'Error interno' }
    }
  }
}