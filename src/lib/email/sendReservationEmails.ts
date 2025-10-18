import { createDirectAdminClient } from '@/lib/supabase/server'

interface ReservationEmailData {
  reservationId: string
  customerEmail: string
  customerName: string
  reservationDate: string
  reservationTime: string
  partySize: number
  childrenCount?: number
  tableNumber: string
  tableLocation: string
  specialRequests?: string
  preOrderItems?: any[]
  preOrderTotal?: number
  tokenUrl?: string
  phone?: string
  source?: string
}

/**
 * Send reservation confirmation emails
 * Updates email_logs status in database
 * @param data - Email data
 * @param emailLogId - Optional email_logs record ID to update status
 */
export async function sendReservationEmails(
  data: ReservationEmailData,
  emailLogId?: string
): Promise<void> {
  const supabase = createDirectAdminClient()

  console.log('📧 Sending reservation emails for:', data.reservationId)

  // ✅ Customer email
  try {
    const { emailService } = await import('@/lib/email/emailService')
    const emailMethod = data.source === 'admin'
      ? emailService.sendReservationConfirmed.bind(emailService)
      : emailService.sendReservationConfirmation.bind(emailService)

    await emailMethod({
      reservationId: data.reservationId,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      partySize: data.partySize,
      tableNumber: data.tableNumber,
      tableLocation: data.tableLocation,
      specialRequests: data.specialRequests,
      preOrderItems: data.preOrderItems,
      preOrderTotal: data.preOrderTotal,
      tokenUrl: data.tokenUrl
    })

    // Update email_logs status
    if (emailLogId) {
      await supabase
        .schema('restaurante')
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', emailLogId)
    }

    console.log('✅ Customer email sent to:', data.customerEmail)
  } catch (emailError: any) {
    console.error('❌ Customer email FAILED:', emailError)

    // Update email_logs with error
    if (emailLogId) {
      await supabase
        .schema('restaurante')
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: emailError?.message || String(emailError)
        })
        .eq('id', emailLogId)
    }

    throw emailError // Re-throw to be caught by cron job
  }

  // ✅ Restaurant notification (only for web reservations)
  if (data.source === 'web' || !data.source) {
    try {
      const { emailService } = await import('@/lib/email/emailService')
      const { data: restaurantData } = await supabase
        .schema('restaurante')
        .from('restaurants')
        .select('mailing')
        .eq('id', 'rest_enigma_001')
        .single()

      const restaurantEmail = restaurantData?.mailing || 'adminenigmaconalma@gmail.com'

      await emailService.sendRestaurantNotification({
        reservationId: data.reservationId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.phone,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        partySize: data.partySize,
        childrenCount: data.childrenCount,
        tableNumbers: data.tableNumber,
        tableLocation: data.tableLocation,
        specialRequests: data.specialRequests,
        preOrderItems: data.preOrderItems,
        restaurantEmail: restaurantEmail
      })
      console.log('✅ Restaurant notification sent to:', restaurantEmail)

      // ✅ Copy to admin if different
      if (restaurantEmail !== 'adminenigmaconalma@gmail.com') {
        await emailService.sendRestaurantNotification({
          reservationId: data.reservationId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.phone,
          reservationDate: data.reservationDate,
          reservationTime: data.reservationTime,
          partySize: data.partySize,
          childrenCount: data.childrenCount,
          tableNumbers: data.tableNumber,
          tableLocation: data.tableLocation,
          specialRequests: data.specialRequests,
          preOrderItems: data.preOrderItems,
          restaurantEmail: 'adminenigmaconalma@gmail.com'
        })
        console.log('✅ Copy sent to: adminenigmaconalma@gmail.com')
      }
    } catch (notificationError) {
      console.error('❌ Restaurant notification FAILED:', notificationError)
    }
  }
}
