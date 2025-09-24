// app/api/newsletter/identify/route.ts
// Customer Identification API for Cookie Consent Integration

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const IdentifyCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  ip_address: z.string().optional()
})

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (xForwardedFor) {
    const firstIP = xForwardedFor.split(',')[0].trim()
    if (firstIP && firstIP !== '127.0.0.1' && firstIP !== '::1') {
      return firstIP
    }
  }

  if (cfConnectingIP && cfConnectingIP !== '127.0.0.1') return cfConnectingIP
  if (xRealIP && xRealIP !== '127.0.0.1') return xRealIP

  return '127.0.0.1'
}

// ============================================
// POST - Identify Customer by Email/IP
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Customer identification request:', body)

    // Validate request data
    const validationResult = IdentifyCustomerSchema.safeParse(body)
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

    const { email, ip_address } = validationResult.data
    const ipAddress = ip_address || getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const supabase = await createServiceClient()

    // 1. Try to find customer by email
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, email, firstName, lastName')
      .eq('email', email)
      .single()

    if (existingCustomer) {
      console.log('✅ Found existing customer by email:', existingCustomer.id)

      // Update IP/user agent if different
      await supabase
        .from('customers')
        .update({
          consentIpAddress: ipAddress,
          consentUserAgent: userAgent,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingCustomer.id)

      return NextResponse.json({
        success: true,
        customer_id: existingCustomer.id,
        customer: existingCustomer,
        method: 'email_match'
      })
    }

    // 2. Try to find via IP in cookie_consents
    const { data: consentWithCustomer } = await supabase
      .from('cookie_consents')
      .select('customer_id, customers(id, email, firstName, lastName)')
      .eq('ip_address', ipAddress)
      .not('customer_id', 'is', null)
      .order('consent_timestamp', { ascending: false })
      .limit(1)
      .single()

    if (consentWithCustomer?.customer_id) {
      console.log('✅ Found customer via IP/consent:', consentWithCustomer.customer_id)

      // Update customer email
      await supabase
        .from('customers')
        .update({
          email: email,
          updatedAt: new Date().toISOString()
        })
        .eq('id', consentWithCustomer.customer_id)

      return NextResponse.json({
        success: true,
        customer_id: consentWithCustomer.customer_id,
        customer: {
          id: consentWithCustomer.customer_id,
          email: email,
          firstName: consentWithCustomer.customers?.firstName,
          lastName: consentWithCustomer.customers?.lastName
        },
        method: 'ip_match'
      })
    }

    // 3. Create new customer
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        firstName: 'Usuario',
        lastName: 'Web',
        email: email,
        consentIpAddress: ipAddress,
        consentUserAgent: userAgent,
        emailConsent: true,
        dataProcessingConsent: true,
        consentDate: new Date().toISOString(),
        consentMethod: 'web_identification'
      })
      .select('id, email, firstName, lastName')
      .single()

    if (newCustomer) {
      console.log('✅ Created new customer:', newCustomer.id)

      return NextResponse.json({
        success: true,
        customer_id: newCustomer.id,
        customer: newCustomer,
        method: 'new_customer'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to identify or create customer' },
      { status: 500 }
    )

  } catch (error) {
    console.error('❌ Customer identification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to identify customer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}