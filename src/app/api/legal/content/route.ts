// app/api/legal/content/route.ts
// Legal Content API - Database-driven content management
// PRP Implementation: CRUD API for legal content with audit trails

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLegalContentServiceWithClient } from '@/lib/services/legal/legalContentService'
import { LegalDocumentType, CreateLegalContentSchema } from '@/types/legal'
import { z } from 'zod'

// ============================================
// GET - Retrieve legal content
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentType = searchParams.get('type')
    const language = searchParams.get('language') || 'es'
    const version = searchParams.get('version')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Validate document type if provided
    if (documentType && !LegalDocumentType.safeParse(documentType).success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid document type',
          validTypes: LegalDocumentType.options
        },
        { status: 400 }
      )
    }

    // Get all content or specific document
    if (documentType) {
      const content = version
        ? await legalContentService.getContentByVersion(documentType, language, parseInt(version))
        : await legalContentService.getActiveContent(documentType, language)

      if (!content) {
        return NextResponse.json(
          { success: false, error: 'Content not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        content
      })
    } else {
      // Get all content with optional filters
      const contents = await legalContentService.getAllContent({
        language,
        includeInactive
      })

      return NextResponse.json({
        success: true,
        contents,
        count: contents.length
      })
    }
  } catch (error) {
    console.error('Error retrieving legal content:', error)
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
// POST - Create new legal content
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request data
    const validationResult = CreateLegalContentSchema.safeParse(body)
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
      documentType,
      language,
      title,
      content,
      metaDescription,
      isActive = true,
      effectiveDate,
      expirationDate
    } = validationResult.data

    // Create new content
    const newContent = await legalContentService.createContent({
      documentType,
      language,
      title,
      content,
      metaDescription,
      isActive,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      createdBy: 'api-user' // In real implementation, get from auth
    })

    // Log the creation for audit trail
    await legalContentService.logAuditEvent({
      contentId: newContent.id,
      action: 'create',
      performedBy: 'api-user',
      ipAddress: request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      details: {
        documentType,
        language,
        title,
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      content: newContent,
      message: 'Legal content created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating legal content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// PUT - Update existing legal content
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Get existing content for audit trail
    const existingContent = await legalContentService.getContentById(id)
    if (!existingContent) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      )
    }

    // Update content
    const updatedContent = await legalContentService.updateContent(id, {
      ...updateData,
      updatedAt: new Date()
    })

    // Log the update for audit trail
    await legalContentService.logAuditEvent({
      contentId: id,
      action: 'update',
      performedBy: 'api-user',
      ipAddress: request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      details: {
        changes: updateData,
        previousVersion: existingContent.version
      }
    })

    return NextResponse.json({
      success: true,
      content: updatedContent,
      message: 'Legal content updated successfully'
    })

  } catch (error) {
    console.error('Error updating legal content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Soft delete legal content
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Get existing content for audit trail
    const existingContent = await legalContentService.getContentById(id)
    if (!existingContent) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      )
    }

    // Soft delete (deactivate) content
    const deactivatedContent = await legalContentService.updateContent(id, {
      isActive: false,
      updatedAt: new Date()
    })

    // Log the deletion for audit trail
    await legalContentService.logAuditEvent({
      contentId: id,
      action: 'delete',
      performedBy: 'api-user',
      ipAddress: request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      details: {
        documentType: existingContent.documentType,
        language: existingContent.language,
        title: existingContent.title
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Legal content deactivated successfully'
    })

  } catch (error) {
    console.error('Error deleting legal content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}