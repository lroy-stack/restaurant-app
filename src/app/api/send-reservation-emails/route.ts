import { NextRequest, NextResponse } from 'next/server'
import { sendReservationEmails } from '@/lib/email/sendReservationEmails'

/**
 * WEBHOOK ENDPOINT: Send reservation emails in background
 * Protected by internal auth token
 * NOTE: Currently unused - emails sent directly via Promise in /api/reservations
 * Kept for backward compatibility and future use
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Validate internal auth token
    const authHeader = request.headers.get('x-internal-secret')
    const expectedSecret = process.env.AUTH_SECRET

    if (!authHeader || authHeader !== expectedSecret) {
      console.error('❌ Unauthorized webhook call - invalid secret')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Delegate to shared email sending function
    await sendReservationEmails(body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Email webhook error:', error)
    return NextResponse.json({ success: false, error: 'Email sending failed' }, { status: 500 })
  }
}
