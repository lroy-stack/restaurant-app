// app/api/legal/gdpr/route.ts
// GDPR Rights Request API - Complete GDPR Compliance System
// PRP Implementation: GDPR rights processing with audit trails

import { NextRequest, NextResponse } from 'next/server'
import { GDPRRequestType, GDPRRequestStatus, CreateGDPRRequestSchema } from '@/types/legal'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

// ============================================
// GET - Retrieve GDPR requests
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const requestType = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get specific GDPR request
    if (requestId) {
      const { data: gdprRequest, error } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (error || !gdprRequest) {
        return NextResponse.json(
          { success: false, error: 'GDPR request not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        request: gdprRequest
      })
    }

    // Build query with filters
    let query = supabase
      .from('gdpr_requests')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })

    if (email) {
      query = query.eq('email', email)
    }

    if (status && GDPRRequestStatus.safeParse(status).success) {
      query = query.eq('status', status)
    }

    if (requestType && GDPRRequestType.safeParse(requestType).success) {
      query = query.eq('requestType', requestType)
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: requests, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      requests: requests || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error retrieving GDPR requests:', error)
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
// POST - Create new GDPR request
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request data
    const validationResult = CreateGDPRRequestSchema.safeParse(body)
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
      requestType,
      email,
      fullName,
      phoneNumber,
      description,
      preferredLanguage = 'es',
      identityVerificationData
    } = validationResult.data

    // Get IP address and user agent from request headers
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Generate reference number for tracking
    const referenceNumber = `GDPR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Calculate deadline (30 days from request, or 60 for complex cases)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 30)

    // Create GDPR request
    const { data: gdprRequest, error } = await supabase
      .from('gdpr_requests')
      .insert({
        referenceNumber,
        requestType,
        email,
        fullName,
        phoneNumber,
        description,
        status: 'pending',
        ipAddress,
        userAgent,
        preferredLanguage,
        identityVerificationData,
        deadline,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log audit event
    await supabase
      .from('legal_audit_logs')
      .insert({
        entityType: 'gdpr_request',
        entityId: gdprRequest.id,
        action: 'create',
        performedBy: 'user-request',
        ipAddress,
        userAgent,
        details: {
          requestType,
          email,
          referenceNumber,
          requestSubmitted: true
        },
        createdAt: new Date().toISOString()
      })

    // Send confirmation email (placeholder - implement with actual email service)
    await sendGdprRequestConfirmation({
      email,
      fullName,
      referenceNumber,
      requestType,
      language: preferredLanguage
    })

    return NextResponse.json({
      success: true,
      request: gdprRequest,
      referenceNumber,
      message: 'GDPR request submitted successfully. You will receive a confirmation email shortly.',
      deadline: deadline.toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating GDPR request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create GDPR request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// PUT - Update GDPR request status
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, response, performedBy, notes } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Validate status
    if (!GDPRRequestStatus.safeParse(status).success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          validStatuses: GDPRRequestStatus.options
        },
        { status: 400 }
      )
    }

    // Get existing request
    const { data: existingRequest, error: fetchError } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        { success: false, error: 'GDPR request not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    }

    if (response) {
      updateData.response = response
    }

    if (notes) {
      updateData.internalNotes = notes
    }

    // Set completion date if status is completed or rejected
    if (status === 'completed' || status === 'rejected') {
      updateData.completedAt = new Date().toISOString()
    }

    // Update request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('gdpr_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log audit event
    await supabase
      .from('legal_audit_logs')
      .insert({
        entityType: 'gdpr_request',
        entityId: requestId,
        action: 'status_update',
        performedBy: performedBy || 'admin',
        ipAddress: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
        details: {
          previousStatus: existingRequest.status,
          newStatus: status,
          response: response || null,
          notes: notes || null
        },
        createdAt: new Date().toISOString()
      })

    // Send notification email to user if status changed
    if (status !== existingRequest.status) {
      await sendGdprStatusUpdateNotification({
        email: existingRequest.email,
        fullName: existingRequest.fullName,
        referenceNumber: existingRequest.referenceNumber,
        status,
        response,
        language: existingRequest.preferredLanguage
      })
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: 'GDPR request updated successfully'
    })

  } catch (error) {
    console.error('Error updating GDPR request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update GDPR request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function sendGdprRequestConfirmation({
  email,
  fullName,
  referenceNumber,
  requestType,
  language
}: {
  email: string
  fullName: string
  referenceNumber: string
  requestType: string
  language: string
}) {
  // Placeholder for email service integration
  console.log('Sending GDPR request confirmation email:', {
    to: email,
    fullName,
    referenceNumber,
    requestType,
    language
  })

  // TODO: Implement with actual email service (Resend, SendGrid, etc.)
  // Example template based on language and request type
}

async function sendGdprStatusUpdateNotification({
  email,
  fullName,
  referenceNumber,
  status,
  response,
  language
}: {
  email: string
  fullName: string
  referenceNumber: string
  status: string
  response?: string
  language: string
}) {
  // Placeholder for email service integration
  console.log('Sending GDPR status update notification:', {
    to: email,
    fullName,
    referenceNumber,
    status,
    response,
    language
  })

  // TODO: Implement with actual email service
  // Include appropriate messaging based on status and language
}