import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const gdprConsentSchema = z.object({
  consentType: z.enum(['EMAIL_MARKETING', 'SMS_MARKETING', 'DATA_PROCESSING', 'ANALYTICS', 'COOKIES']),
  granted: z.boolean(),
  ipAddress: z.string().optional(),
  userAgent: z.string().max(500).optional()
})

// GET GDPR consents for customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient()
    const customerId = (await params).id

    // Get customer's cookie consents from real table
    const { data: consents, error } = await supabase
      .from('cookie_consents')
      .select('*')
      .eq('customer_id', customerId)
      .order('consent_timestamp', { ascending: false })

    if (error) {
      console.error('GDPR consents query error:', error)
      return NextResponse.json(
        { success: false, error: 'Error fetching GDPR consents' },
        { status: 500 }
      )
    }

    // Get current customer consent status from customers table
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('emailConsent, smsConsent, marketingConsent, dataProcessingConsent, consentDate')
      .eq('id', customerId)
      .single()

    if (customerError) {
      console.error('Customer query error:', customerError)
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      consents: consents || [],
      currentStatus: {
        emailConsent: customer.emailConsent,
        smsConsent: customer.smsConsent,
        marketingConsent: customer.marketingConsent,
        dataProcessingConsent: customer.dataProcessingConsent,
        lastUpdate: customer.consentDate
      }
    })

  } catch (error) {
    console.error('GET GDPR consents error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update GDPR consent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { consentType, granted, ipAddress, userAgent } = gdprConsentSchema.parse(body)

    const supabase = await createServiceClient()
    const customerId = (await params).id

    // Check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, email')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Record GDPR consent in cookie_consents table
    const { error: consentError } = await supabase
      .from('cookie_consents')
      .insert({
        customer_id: customerId,
        consent_id: `${customerId}-${consentType}-${Date.now()}`,
        necessary_cookies: consentType === 'DATA_PROCESSING' ? granted : true,
        analytics_cookies: consentType === 'ANALYTICS' ? granted : false,
        marketing_cookies: consentType === 'EMAIL_MARKETING' || consentType === 'SMS_MARKETING' ? granted : false,
        functionality_cookies: true,
        security_cookies: true,
        consent_method: 'admin_panel',
        consent_timestamp: new Date().toISOString(),
        expiry_timestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        ip_address: ipAddress || request.ip || '127.0.0.1',
        user_agent: userAgent || request.headers.get('user-agent') || 'admin-panel',
        page_url: `/dashboard/clientes/${customerId}`,
        policy_version: '1.0',
        gdpr_lawful_basis: consentType === 'DATA_PROCESSING' ? 'contract' : 'consent'
      })

    if (consentError) {
      console.error('Error recording GDPR consent:', consentError)
      return NextResponse.json(
        { success: false, error: 'Failed to record consent' },
        { status: 500 }
      )
    }

    // Update customer table with current consent status
    const updateData: Record<string, any> = {
      consentDate: new Date().toISOString()
    }

    switch (consentType) {
      case 'EMAIL_MARKETING':
        updateData.emailConsent = granted
        break
      case 'SMS_MARKETING':
        updateData.smsConsent = granted
        break
      case 'DATA_PROCESSING':
        updateData.dataProcessingConsent = granted
        // If data processing is revoked, revoke all other consents
        if (!granted) {
          updateData.emailConsent = false
          updateData.smsConsent = false
          updateData.marketingConsent = false
        }
        break
      case 'ANALYTICS':
      case 'COOKIES':
        // These are handled at application level, not stored in customer table
        break
    }

    const { error: updateError } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', customerId)

    if (updateError) {
      console.error('Error updating customer consent:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update customer consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${consentType} consent ${granted ? 'granted' : 'revoked'} successfully`,
      consentType,
      granted
    })

  } catch (error) {
    console.error('PATCH GDPR consent error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid consent data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}