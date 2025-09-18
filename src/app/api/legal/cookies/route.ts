// app/api/legal/cookies/route.ts
// Cookie Consent API - AEPD 2025 Compliant Consent Management
// PRP Implementation: Cookie consent tracking with audit trails

import { NextRequest, NextResponse } from 'next/server'
import { cookieConsentService } from '@/lib/services/legal/cookieConsentService'
import { ConsentMethod, CreateCookieConsentSchema } from '@/types/legal'
import { z } from 'zod'

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

    // Get consents by filters
    const filters: any = {}
    if (ipAddress) filters.ipAddress = ipAddress
    if (userId) filters.userId = userId
    if (sessionId) filters.sessionId = sessionId
    if (!includeExpired) filters.includeExpired = false

    const consents = await cookieConsentService.getConsentsByFilters(filters)

    return NextResponse.json({
      success: true,
      consents,
      count: consents.length
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

    // Validate request data
    const validationResult = CreateCookieConsentSchema.safeParse(body)
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

    const {
      userId,
      sessionId,
      consentMethod,
      analyticsConsent,
      marketingConsent,
      functionalConsent,
      userAgent,
      language
    } = validationResult.data

    // Get IP address from request headers
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1'

    // AEPD 2025 compliance: 24-month maximum duration
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 24)

    // Record consent with audit trail
    const consent = await cookieConsentService.recordConsent({
      userId,
      sessionId,
      ipAddress,
      consentMethod,
      analyticsConsent,
      marketingConsent,
      functionalConsent,
      userAgent: userAgent || request.headers.get('user-agent') || 'Unknown',
      language: language || 'es',
      expiresAt
    })

    return NextResponse.json({
      success: true,
      consent,
      message: 'Consent recorded successfully',
      expiresAt: consent.expiresAt
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
    const existingConsent = await cookieConsentService.getConsentById(consentId)
    if (!existingConsent) {
      return NextResponse.json(
        { success: false, error: 'Consent record not found' },
        { status: 404 }
      )
    }

    // Update consent with new timestamp
    const updatedConsent = await cookieConsentService.updateConsent(consentId, {
      ...updateData,
      updatedAt: new Date()
    })

    // Log audit event for consent modification
    await cookieConsentService.logConsentChange({
      consentId,
      action: 'update',
      ipAddress: request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      changes: updateData,
      previousState: {
        analyticsConsent: existingConsent.analyticsConsent,
        marketingConsent: existingConsent.marketingConsent,
        functionalConsent: existingConsent.functionalConsent
      }
    })

    return NextResponse.json({
      success: true,
      consent: updatedConsent,
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

    let withdrawnConsents: any[] = []

    if (consentId) {
      // Withdraw specific consent
      const consent = await cookieConsentService.withdrawConsent(consentId)
      if (consent) {
        withdrawnConsents.push(consent)
      }
    } else {
      // Withdraw all consents for user/session
      const filters = userId ? { userId } : { sessionId }
      withdrawnConsents = await cookieConsentService.withdrawAllConsents(filters)
    }

    if (withdrawnConsents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No consent records found to withdraw' },
        { status: 404 }
      )
    }

    // Log audit events for consent withdrawal
    for (const consent of withdrawnConsents) {
      await cookieConsentService.logConsentChange({
        consentId: consent.id,
        action: 'withdraw',
        ipAddress: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
        changes: { isActive: false },
        previousState: {
          analyticsConsent: consent.analyticsConsent,
          marketingConsent: consent.marketingConsent,
          functionalConsent: consent.functionalConsent
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `${withdrawnConsents.length} consent record(s) withdrawn successfully`,
      withdrawnConsents: withdrawnConsents.length
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