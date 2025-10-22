import { NextRequest, NextResponse } from 'next/server'
import { createDirectAdminClient } from '@/lib/supabase/server'
import { sendReservationEmails } from '@/lib/email/sendReservationEmails'

/**
 * CRON JOB: Process pending emails from queue
 * Runs every 1 minute via vercel.json configuration
 *
 * Authorization: Vercel Cron Secret (CRON_SECRET env var)
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 Verify cron secret (Vercel adds this header automatically)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.AUTH_SECRET

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron job access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createDirectAdminClient()
    console.log('🔄 [CRON] Starting email queue processor...')

    // Get pending emails (older than 10 seconds to avoid race conditions)
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString()

    const { data: pendingEmails, error: fetchError } = await supabase
      .schema('public')
      .from('email_logs')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', tenSecondsAgo)
      .order('created_at', { ascending: true })
      .limit(50) // Process max 50 emails per run

    if (fetchError) {
      console.error('❌ [CRON] Error fetching pending emails:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        processed: 0
      }, { status: 500 })
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ [CRON] No pending emails to process')
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'Queue is empty'
      })
    }

    console.log(`📧 [CRON] Found ${pendingEmails.length} pending emails`)

    let successCount = 0
    let failCount = 0

    // Process each email
    for (const emailLog of pendingEmails) {
      try {
        // Parse email data from error_message field
        const emailData = JSON.parse(emailLog.error_message || '{}')

        // Mark as processing
        await supabase
          .schema('public')
          .from('email_logs')
          .update({ status: 'processing' })
          .eq('id', emailLog.id)

        // Send email based on type
        await sendReservationEmails(emailData, emailLog.id)

        successCount++
        console.log(`✅ [CRON] Email sent successfully: ${emailLog.recipient_email}`)

      } catch (sendError: any) {
        failCount++
        console.error(`❌ [CRON] Failed to send email ${emailLog.id}:`, sendError)

        // Mark as failed with error message
        await supabase
          .schema('public')
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: sendError?.message || String(sendError)
          })
          .eq('id', emailLog.id)
      }
    }

    console.log(`✅ [CRON] Batch complete: ${successCount} sent, ${failCount} failed`)

    return NextResponse.json({
      success: true,
      processed: pendingEmails.length,
      successful: successCount,
      failed: failCount,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ [CRON] Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      processed: 0
    }, { status: 500 })
  }
}

// POST method for manual trigger (testing)
export async function POST(request: NextRequest) {
  return GET(request)
}
