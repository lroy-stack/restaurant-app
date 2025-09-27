import { createServiceClient } from '@/utils/supabase/server'
import { buildTokenUrl } from '../email/config/emailConfig'

/**
 * SERVER-ONLY Token Service
 * Para operaciones que requieren service client (API routes)
 */
export class ServerReservationTokenService {

  /**
   * 🔐 SECURE TOKEN GENERATION - BASADO EN ENIGMA-RESERVAS
   * Genera tokens criptográficamente seguros de 26 caracteres
   * Formato: vt_[24 chars hex] = 12 bytes de entropía
   */
  private static generateSecureToken(): string {
    const array = new Uint8Array(12); // 12 bytes = 24 caracteres hex
    crypto.getRandomValues(array);
    const hexString = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `vt_${hexString}`;
  }

  /**
   * 📅 DYNAMIC EXPIRATION - BASADO EN ENIGMA-RESERVAS
   * Calcula expiración exacta: 2 horas antes de la reserva
   */
  private static calculateTokenExpiry(reservationDateTime: string): Date {
    const reservationDate = new Date(reservationDateTime);
    const expirationDate = new Date(reservationDate);
    expirationDate.setHours(expirationDate.getHours() - 2);
    return expirationDate;
  }

  /**
   * 🆕 GENERATE TOKEN FOR RESERVATION
   * Genera token inicial o regenera tras modificación
   */
  static async generateTokenForReservation(reservationId: string): Promise<string> {
    try {
      console.log('🔧 Generating secure token for reservation:', reservationId);

      const supabase = await createServiceClient();

      // 1. Obtener datos de la reserva con email del cliente
      const { data: reservation, error: reservationError } = await supabase
        .schema('restaurante')
        .from('reservations')
        .select('time, "customerEmail"')
        .eq('id', reservationId)
        .single();

      if (reservationError || !reservation) {
        console.error('❌ Error obteniendo reserva:', reservationError);
        throw new Error(`Error obteniendo reserva: ${reservationError?.message}`);
      }

      // 2. Generar token seguro
      const token = this.generateSecureToken();
      console.log('🔧 Token seguro generado:', token.substring(0, 8) + '...');

      // 3. Calcular expiración dinámica
      const expiryDate = this.calculateTokenExpiry(reservation.time);
      console.log('🔧 Token expira el:', expiryDate.toISOString());

      // 4. Guardar token con upsert
      const { error: tokenError } = await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .upsert({
          reservation_id: reservationId,
          token: token,
          customer_email: reservation.customerEmail,
          expires: expiryDate.toISOString(),
          is_active: true,
          purpose: 'reservation_management'
        });

      if (tokenError) {
        console.error('❌ Error guardando token:', tokenError);
        throw new Error(`Error guardando token: ${tokenError.message}`);
      }

      console.log('✅ Token guardado exitosamente');
      return token;

    } catch (error) {
      console.error('🚨 Error generating token:', error);
      throw error;
    }
  }

  /**
   * 🔄 UPDATE RESERVATION WITH CYCLE REGENERATION
   * Basado en enigma-web-moderna: modifica → PENDING → nuevo token
   */
  static async updateReservationWithNewToken(
    reservationId: string,
    updates: any,
    currentToken: string
  ): Promise<{ success: boolean; newToken?: string; error?: string }> {
    try {
      console.log('🔄 Starting reservation update cycle for:', reservationId);

      const supabase = await createServiceClient();

      // 1. Validar token actual (usando client service para validar)
      const { data: tokenData, error: validationError } = await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .select('*')
        .eq('token', currentToken)
        .eq('is_active', true)
        .single();

      if (validationError || !tokenData) {
        return { success: false, error: 'Token inválido' };
      }

      // 2. Actualizar reserva a estado PENDING
      const { error: updateError } = await supabase
        .schema('restaurante')
        .from('reservations')
        .update({
          ...updates,
          status: 'PENDING', // 🔄 CICLO: Requiere re-confirmación
          updatedAt: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (updateError) {
        console.error('❌ Error updating reservation:', updateError);
        return { success: false, error: 'Error al actualizar reserva' };
      }

      // 3. 🔒 INVALIDAR token actual por seguridad
      await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .update({ is_active: false })
        .eq('reservation_id', reservationId);

      // 4. 🆕 GENERAR nuevo token
      const newToken = await this.generateTokenForReservation(reservationId);

      console.log('✅ Reservation updated successfully with new token cycle');
      return {
        success: true,
        newToken: newToken
      };

    } catch (error) {
      console.error('🚨 Error in update cycle:', error);
      return { success: false, error: 'Error interno en ciclo de actualización' };
    }
  }

  /**
   * ❌ CANCEL RESERVATION WITH TOKEN INVALIDATION
   * Basado en enigma-web-moderna: cancelar + invalidar token
   */
  static async cancelReservationWithToken(
    reservationId: string,
    token: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('❌ Cancelling reservation with token:', reservationId);

      const supabase = await createServiceClient();

      // 1. Validar token
      const { data: tokenData, error: validationError } = await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (validationError || !tokenData) {
        return { success: false, error: 'Token inválido' };
      }

      // 2. Actualizar estado a CANCELLED
      const { error: cancelError } = await supabase
        .schema('restaurante')
        .from('reservations')
        .update({
          status: 'CANCELLED',
          specialRequests: reason ?
            `Cancelada: ${reason}` :
            'Cancelada por el cliente',
          updatedAt: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (cancelError) {
        console.error('❌ Error cancelling reservation:', cancelError);
        return { success: false, error: 'Error al cancelar reserva' };
      }

      // 3. 🔒 INVALIDAR token
      await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .update({ is_active: false })
        .eq('reservation_id', reservationId);

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
    return buildTokenUrl(token);
  }
}