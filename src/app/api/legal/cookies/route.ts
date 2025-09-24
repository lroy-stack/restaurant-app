// app/api/legal/cookies/route.ts
// Cookie Consent API - AEPD 2025 Compliant Consent Management
// PRP Implementation: Cookie consent tracking with audit trails

import { NextRequest, NextResponse } from 'next/server'
import { cookieConsentService } from '@/lib/services/legal/cookieConsentService'
import { ConsentMethod, CreateCookieConsentSchema } from '@/types/legal'
import { z } from 'zod'
import { getSpainTimestamp, getSpainExpiryDate } from '@/lib/utils/timestamps'

// ============================================
// GET - Retrieve consent records
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consentId = searchParams.get('consentId')
    const ipAddress = searchParams.get('ipAddress')
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    // Get specific consent record
    if (consentId) {
      const consent = await cookieConsentService.getConsentById(consentId)

      if (!consent) {
        return NextResponse.json(
          { success: false, error: 'Consent record not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        consent
      })
    }

    // Get consents using available methods - PRIORITY: IP verification first
    let consent: any = null

    if (ipAddress) {
      // CRITICAL: Check by IP first for first-visit detection
      consent = await cookieConsentService.getActiveConsentByIP(request, ipAddress)
    } else if (userId) {
      consent = await cookieConsentService.getActiveConsentByCustomer(request, userId)
    } else if (sessionId) {
      consent = await cookieConsentService.getActiveConsentBySession(request, sessionId)
    }

    return NextResponse.json({
      success: true,
      consent,
      found: !!consent
    })

  } catch (error) {
    console.error('Error retrieving cookie consent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Record new consent
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🔍 Raw body received:', JSON.stringify(body, null, 2))

    // 🚀 CRITICAL FIX: Map frontend fields to backend schema
    const mappedBody = {
      customer_id: body.userId || null,
      session_id: body.sessionId || null,
      consent_method: body.consentMethod,
      necessary_cookies: true, // REQUIRED: Always true per AEPD
      analytics_cookies: body.analyticsConsent || false,
      marketing_cookies: body.marketingConsent || false,
      functionality_cookies: body.functionalConsent || false,
      security_cookies: false, // Default per AEPD
      page_url: body.pageUrl || '/reservas',
      referrer: body.referrer || null,
      policy_version: 'v1.0',
      user_agent: body.userAgent
      // IP and expiry_timestamp will be added below
    }

    console.log('🔍 Mapped body (before completion):', JSON.stringify(mappedBody, null, 2))

    // Validate mapped data
    const validationResult = CreateCookieConsentSchema.safeParse(mappedBody)
    // Get IP address from request headers (GDPR compliance)
    const getClientIP = (request: NextRequest): string => {
      // Standard proxy headers in order of preference
      const xForwardedFor = request.headers.get('x-forwarded-for')
      const xRealIP = request.headers.get('x-real-ip')
      const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
      const xClientIP = request.headers.get('x-client-ip')
      const xForwarded = request.headers.get('x-forwarded')
      const forwardedFor = request.headers.get('forwarded-for')
      const forwarded = request.headers.get('forwarded')

      console.log('🔍 All IP headers:', {
        'x-forwarded-for': xForwardedFor,
        'x-real-ip': xRealIP,
        'cf-connecting-ip': cfConnectingIP,
        'x-client-ip': xClientIP,
        'x-forwarded': xForwarded,
        'forwarded-for': forwardedFor,
        'forwarded': forwarded
      })

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

    const ipAddress = getClientIP(request)
    console.log('🎯 Final IP address:', ipAddress)

    // AEPD 2025 compliance: 24-month maximum duration (Spain timezone)
    const expiresAt = getSpainExpiryDate(24 * 30) // 24 months in days

    // Complete the mapped data with calculated fields
    const completeData = {
      ...mappedBody,
      consent_id: `cookie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ip_address: ipAddress,
      user_agent: mappedBody.user_agent || request.headers.get('user-agent') || 'Unknown',
      expiry_timestamp: expiresAt.toISOString().replace('Z', '+02:00'),
      page_url: mappedBody.page_url || request.headers.get('referer') || '/reservas',
      referrer: mappedBody.referrer || request.headers.get('referer') || ''
    }

    console.log('🔍 DEBUG - Complete data before validation:', JSON.stringify(completeData, null, 2))

    // Validate complete data
    const finalValidation = CreateCookieConsentSchema.safeParse(completeData)
    if (!finalValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: finalValidation.error.issues
        },
        { status: 400 }
      )
    }

    const result = await cookieConsentService.createConsent(
      request,
      completeData,
      completeData.user_agent,
      completeData.ip_address
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      consent: result.data,
      message: 'Consent recorded successfully',
      expiresAt: result.data.expiry_timestamp
    }, { status: 201 })

  } catch (error) {
    console.error('Error recording cookie consent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record consent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// PUT - Update existing consent
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { consentId, ...updateData } = body

    if (!consentId) {
      return NextResponse.json(
        { success: false, error: 'Consent ID is required' },
        { status: 400 }
      )
    }

    // Validate consent method if provided
    if (updateData.consentMethod) {
      const methodValidation = ConsentMethod.safeParse(updateData.consentMethod)
      if (!methodValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid consent method',
            validMethods: ConsentMethod.options
          },
          { status: 400 }
        )
      }
    }

    // Get existing consent for audit trail
    const existingConsent = await cookieConsentService.getConsentById(request, consentId)
    if (!existingConsent) {
      return NextResponse.json(
        { success: false, error: 'Consent record not found' },
        { status: 404 }
      )
    }

    // Get IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Update consent with audit trail
    const result = await cookieConsentService.updateConsent(
      request,
      consentId,
      updateData,
      ipAddress,
      userAgent
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      consent: result.data,
      message: 'Consent updated successfully'
    })

  } catch (error) {
    console.error('Error updating cookie consent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update consent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Withdraw consent (GDPR compliance)
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consentId = searchParams.get('consentId')
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    // Require at least one identifier
    if (!consentId && !sessionId && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one identifier (consentId, sessionId, or userId) is required'
        },
        { status: 400 }
      )
    }

    if (!consentId) {
      return NextResponse.json(
        { success: false, error: 'consentId is required for withdrawal' },
        { status: 400 }
      )
    }

    // Get IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Withdraw specific consent
    const result = await cookieConsentService.withdrawConsent(
      request,
      consentId,
      'api', // withdrawal method
      ipAddress,
      userAgent
    )

    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Consent record not found' ? 404 : 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Consent withdrawn successfully',
      consent: result.data
    })

  } catch (error) {
    console.error('Error withdrawing cookie consent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to withdraw consent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}