// app/api/newsletter/subscribe/route.ts
// Newsletter Subscription API with IP/Customer Connection
// Integrated with cookie consent and customer identification

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const NewsletterSubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional().default('footer'),
  doubleOptIn: z.boolean().optional().default(false)
})

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getClientIP(request: NextRequest): string {
  // Standard proxy headers in order of preference
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  const xClientIP = request.headers.get('x-client-ip')

  // x-forwarded-for can contain multiple IPs, take the first (original client)
  if (xForwardedFor) {
    const firstIP = xForwardedFor.split(',')[0].trim()
    if (firstIP && firstIP !== '127.0.0.1' && firstIP !== '::1') {
      return firstIP
    }
  }

  // Check other headers
  if (cfConnectingIP && cfConnectingIP !== '127.0.0.1') return cfConnectingIP
  if (xRealIP && xRealIP !== '127.0.0.1') return xRealIP
  if (xClientIP && xClientIP !== '127.0.0.1') return xClientIP

  // Fallback for development
  return '127.0.0.1'
}

async function identifyCustomerByIPAndEmail(
  supabase: any,
  email: string,
  ipAddress: string
): Promise<string | null> {
  try {
    // 1. First try to find customer by email
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single()

    if (existingCustomer) {
      console.log('✅ Found existing customer by email:', existingCustomer.id)
      return existingCustomer.id
    }

    // 2. If not found by email, try to find via IP in cookie_consents
    const { data: consentWithCustomer } = await supabase
      .from('cookie_consents')
      .select('customer_id')
      .eq('ip_address', ipAddress)
      .not('customer_id', 'is', null)
      .order('consent_timestamp', { ascending: false })
      .limit(1)
      .single()

    if (consentWithCustomer?.customer_id) {
      console.log('✅ Found customer via IP/consent:', consentWithCustomer.customer_id)

      // Update customer email if different
      await supabase
        .from('customers')
        .update({
          email: email,
          updatedAt: new Date().toISOString()
        })
        .eq('id', consentWithCustomer.customer_id)

      return consentWithCustomer.customer_id
    }

    // 3. Create new customer with minimal data
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        firstName: 'Suscriptor', // More neutral, will be updated with real data on reservation
        lastName: 'Newsletter',   // Will be updated with real data later
        email: email,
        consentIpAddress: ipAddress,
        consentUserAgent: 'Newsletter Subscription',
        emailConsent: true,
        marketingConsent: true,
        dataProcessingConsent: true,
        consentDate: new Date().toISOString(),
        consentMethod: 'newsletter_signup'
      })
      .select('id')
      .single()

    if (newCustomer) {
      console.log('✅ Created new customer for newsletter:', newCustomer.id)
      return newCustomer.id
    }

    return null
  } catch (error) {
    console.error('❌ Error identifying customer:', error)
    return null
  }
}

// ============================================
// POST - Subscribe to Newsletter
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📧 Newsletter subscription request:', body)

    // Validate request data
    const validationResult = NewsletterSubscribeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { email, source, doubleOptIn } = validationResult.data

    // Get client info
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    console.log('🔍 Client info - IP:', ipAddress, 'UA:', userAgent)

    // Create Supabase client
    const supabase = await createServiceClient()

    // Check if already subscribed
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscriptions')
      .select('id, unsubscribed_at')
      .eq('email', email)
      .single()

    if (existingSubscription && !existingSubscription.unsubscribed_at) {
      return NextResponse.json({
        success: true,
        message: 'Already subscribed to newsletter',
        subscription: existingSubscription,
        alreadySubscribed: true
      })
    }

    // Identify or create customer
    const customerId = await identifyCustomerByIPAndEmail(supabase, email, ipAddress)

    // Create newsletter subscription
    const subscriptionData = {
      email,
      customer_id: customerId,
      subscription_source: source,
      ip_address: ipAddress,
      user_agent: userAgent,
      subscription_date: new Date().toISOString()
    }

    console.log('📝 Creating subscription:', subscriptionData)

    const { data: subscription, error: subscriptionError } = await supabase
      .from('newsletter_subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (subscriptionError) {
      console.error('❌ Subscription error:', subscriptionError)
      throw subscriptionError
    }

    // Update customer marketing consent if customer exists
    if (customerId) {
      await supabase
        .from('customers')
        .update({
          marketingConsent: true,
          emailConsent: true,
          consentDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('id', customerId)

      console.log('✅ Updated customer marketing consent')
    }

    // Connect with existing cookie consent if exists
    const { data: existingConsent } = await supabase
      .from('cookie_consents')
      .select('id')
      .eq('ip_address', ipAddress)
      .is('customer_id', null)
      .order('consent_timestamp', { ascending: false })
      .limit(1)
      .single()

    if (existingConsent && customerId) {
      await supabase
        .from('cookie_consents')
        .update({ customer_id: customerId })
        .eq('id', existingConsent.id)

      console.log('✅ Connected cookie consent with customer')
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscription: subscription,
      customerId: customerId,
      connectedToCookieConsent: !!existingConsent
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Newsletter subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to subscribe to newsletter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// GET - Get Newsletter Subscription Status
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    const { data: subscription, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .order('subscription_date', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error
    }

    const isSubscribed = subscription && !subscription.unsubscribed_at

    return NextResponse.json({
      success: true,
      isSubscribed,
      subscription: subscription || null
    })

  } catch (error) {
    console.error('❌ Error checking subscription status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check subscription status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Unsubscribe from Newsletter
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    const { data: updatedSubscription, error } = await supabase
      .from('newsletter_subscriptions')
      .update({
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email)
      .is('unsubscribed_at', null)
      .select()
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      subscription: updatedSubscription
    })

  } catch (error) {
    console.error('❌ Error unsubscribing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unsubscribe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}