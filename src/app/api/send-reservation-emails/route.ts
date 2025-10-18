import { NextRequest, NextResponse } from 'next/server'
import { createDirectAdminClient } from '@/lib/supabase/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * WEBHOOK ENDPOINT: Send reservation emails in background
 * Called by POST /api/reservations after responding to client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createDirectAdminClient()

    console.log('📧 Email webhook triggered for reservation:', body.reservationId)

    // ✅ Customer email
    try {
      const { emailService } = await import('@/lib/email/emailService')
      const emailMethod = body.source === 'admin'
        ? emailService.sendReservationConfirmed.bind(emailService)
        : emailService.sendReservationConfirmation.bind(emailService)

      await emailMethod({
        reservationId: body.reservationId,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        reservationDate: body.reservationDate,
        reservationTime: body.reservationTime,
        partySize: body.partySize,
        tableNumber: body.tableNumber,
        tableLocation: body.tableLocation,
        specialRequests: body.specialRequests,
        preOrderItems: body.preOrderItems,
        preOrderTotal: body.preOrderTotal,
        tokenUrl: body.tokenUrl
      })
      console.log('✅ Customer email sent to:', body.customerEmail)
    } catch (emailError) {
      console.error('❌ Customer email FAILED:', emailError)
    }

    // ✅ Restaurant notification (only for web reservations)
    if (body.source === 'web' || !body.source) {
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
          reservationId: body.reservationId,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.phone,
          reservationDate: body.reservationDate,
          reservationTime: body.reservationTime,
          partySize: body.partySize,
          childrenCount: body.childrenCount,
          tableNumbers: body.tableNumber,
          tableLocation: body.tableLocation,
          specialRequests: body.specialRequests,
          preOrderItems: body.preOrderItems,
          restaurantEmail: restaurantEmail
        })
        console.log('✅ Restaurant notification sent to:', restaurantEmail)

        // ✅ Copy to admin if different
        if (restaurantEmail !== 'adminenigmaconalma@gmail.com') {
          await emailService.sendRestaurantNotification({
            reservationId: body.reservationId,
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerPhone: body.phone,
            reservationDate: body.reservationDate,
            reservationTime: body.reservationTime,
            partySize: body.partySize,
            childrenCount: body.childrenCount,
            tableNumbers: body.tableNumber,
            tableLocation: body.tableLocation,
            specialRequests: body.specialRequests,
            preOrderItems: body.preOrderItems,
            restaurantEmail: 'adminenigmaconalma@gmail.com'
          })
          console.log('✅ Copy sent to: adminenigmaconalma@gmail.com')
        }
      } catch (notificationError) {
        console.error('❌ Restaurant notification FAILED:', notificationError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Email webhook error:', error)
    return NextResponse.json({ success: false, error: 'Email sending failed' }, { status: 500 })
  }
}
