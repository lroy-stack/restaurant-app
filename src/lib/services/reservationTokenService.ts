import { supabase } from '@/lib/supabase/client'
import { buildProductionUrl } from '../email/config/emailConfig'

export interface TokenValidationResult {
  valid: boolean
  reservation?: any
  customer?: any
  error?: string
  errorType?: 'invalid' | 'expired' | 'not_found' | 'network' | 'too_close'
}

/**
 * CLIENT-SIDE Token Service
 * Para operaciones que se ejecutan en el cliente (páginas, hooks)
 */
export class ReservationTokenService {

  static async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      // 🔒 SECURITY: Validate token format first
      if (!token || token.length < 10) {
        return {
          valid: false,
          error: 'Token inválido',
          errorType: 'invalid'
        }
      }

      console.log('🔍 Token validation started', { tokenLength: token.length, token: token.substring(0, 10) + '...' })

      // 🚀 SECURE SOLUTION: Use dedicated API endpoint to avoid RLS issues
      const response = await fetch('/api/reservations/token/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      console.log('🔍 API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()

        // 404 = token eliminado/no existe = comportamiento esperado
        if (response.status === 404) {
          console.log('ℹ️ Token not found (expected if token was used/deleted)')
        } else {
          // Otros errores sí son críticos
          console.error('🚨 Token validation failed:', { status: response.status, error: errorData })
        }

        return {
          valid: false,
          error: errorData.error || 'Token no encontrado',
          errorType: errorData.errorType || 'not_found'
        }
      }

      const result = await response.json()

      if (!result.valid) {
        console.log('⚠️ Token validation returned invalid', result)
        return result
      }

      console.log('✅ Token validated successfully', {
        reservationId: result.reservation?.id,
        customerEmail: result.customer?.email,
        date: result.reservation?.date,
        time: result.reservation?.time
      })

      return result
    } catch (error) {
      console.error('🚨 Token validation failed:', error)
      return {
        valid: false,
        error: 'Error de conexión',
        errorType: 'network'
      }
    }
  }


  /**
   * ❌ CANCEL RESERVATION WITH TOKEN INVALIDATION
   * Usar endpoint dedicado para evitar problemas de RLS
   */
  static async cancelReservationWithToken(
    reservationId: string,
    token: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('❌ Cancelling reservation with token:', reservationId);

      // 🚀 SECURE SOLUTION: Use dedicated API endpoint
      const response = await fetch('/api/reservations/token/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, reason })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Error cancelling reservation:', result);
        return { success: false, error: result.error || 'Error al cancelar reserva' };
      }

      console.log('✅ Reservation cancelled successfully');
      return { success: true };

    } catch (error) {
      console.error('🚨 Error cancelling reservation:', error);
      return { success: false, error: 'Error interno' };
    }
  }

  /**
   * 🔧 GET MANAGEMENT URL FOR RESERVATION
   * Genera URL completa con detección de entorno
   */
  static getManagementUrl(token: string): string {
    // 🚨 CRITICAL: Always use production URL for email links
    return buildProductionUrl('/mi-reserva', { token });
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

      // Mark token as used with direct fetch
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      await fetch(
        `${supabaseUrl}/rest/v1/reservation_tokens?token=eq.${token}`,
        {
          method: 'PATCH',
          headers: {
            'Accept-Profile': 'restaurante',
            'Content-Profile': 'restaurante',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({ used_at: new Date().toISOString() })
        }
      )

      // Update reservation with direct fetch
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/reservations?id=eq.${reservationId}`,
        {
          method: 'PATCH',
          headers: {
            'Accept-Profile': 'restaurante',
            'Content-Profile': 'restaurante',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            ...updates,
            updatedAt: new Date().toISOString()
          })
        }
      )

      if (!updateResponse.ok) {
        console.error('Update reservation error:', updateResponse.status)
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

      // Update reservation status to cancelled with direct fetch
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      const cancelResponse = await fetch(
        `${supabaseUrl}/rest/v1/reservations?id=eq.${reservationId}`,
        {
          method: 'PATCH',
          headers: {
            'Accept-Profile': 'restaurante',
            'Content-Profile': 'restaurante',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            status: 'CANCELLED',
            specialRequests: reason ? `${validation.reservation.specialRequests || ''}\n\nCancelada: ${reason}`.trim() : validation.reservation.specialRequests,
            updatedAt: new Date().toISOString()
          })
        }
      )

      if (!cancelResponse.ok) {
        console.error('Cancel reservation error:', cancelResponse.status)
        return { success: false, error: 'Error al cancelar reserva' }
      }

      return { success: true }
    } catch (error) {
      console.error('Cancel reservation error:', error)
      return { success: false, error: 'Error interno' }
    }
  }

  /**
   * INVALIDATE TOKEN
   * Elimina completamente el token de la base de datos
   */
  static async invalidateToken(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔒 Deleting token via secure API:', token.substring(0, 8) + '...')

      // 🔐 SECURITY FIX: Use server-side API endpoint instead of direct client call
      const response = await fetch('/api/reservations/token/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        console.error('❌ Error deleting token:', response.status)
        return { success: false, error: 'Error al eliminar token' }
      }

      console.log('✅ Token deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting token:', error)
      return { success: false, error: 'Error interno' }
    }
  }
}