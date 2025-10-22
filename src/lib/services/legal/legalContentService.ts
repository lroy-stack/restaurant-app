// lib/services/legal/legalContentService.ts
// Legal Content Management Service - Database-driven with Type Safety
// PRP Implementation: GDPR/AEPD 2025 Complete Compliance

import { createClient, createServerSupabaseClient, createServerSupabaseRestauranteClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import {
  LegalContent,
  CreateLegalContent,
  UpdateLegalContent,
  LegalDocumentType,
  Language,
  LegalContentSchema,
  CreateLegalContentSchema,
  UpdateLegalContentSchema,
  LEGAL_CONSTANTS,
  LegalAPIResponse
} from '@/types/legal'

export class LegalContentService {
  private supabase: any

  constructor(supabaseClient: any) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required')
    }
    this.supabase = supabaseClient
  }

  // ============================================
  // PUBLIC CONTENT RETRIEVAL (No Auth Required)
  // ============================================

  /**
   * Get active legal content by type and language
   * Used by public legal pages - cached for performance
   */
  async getActiveContent(
    documentType: LegalDocumentType,
    language: Language = 'es'
  ): Promise<LegalContent | null> {
    try {
      const { data, error } = await this.supabase
        .from('legal_content')
        .select('*')
        .eq('document_type', documentType)
        .eq('language', language)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching legal content:', error)
        return null
      }

      return LegalContentSchema.parse(data)
    } catch (error) {
      console.error('Legal content service error:', error)
      return null
    }
  }

  /**
   * Get all active legal documents for a language
   * Used for sitemap generation and navigation
   */
  async getAllActiveContent(language: Language = 'es'): Promise<LegalContent[]> {
    try {
      const { data, error } = await this.supabase
        .from('legal_content')
        .select('*')
        .eq('language', language)
        .eq('is_active', true)
        .order('document_type')

      if (error) throw error

      return data.map(item => LegalContentSchema.parse(item))
    } catch (error) {
      console.error('Error fetching all legal content:', error)
      return []
    }
  }

  /**
   * Get current policy version for consent tracking
   * Critical for GDPR compliance logging
   */
  async getCurrentPolicyVersion(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('legal_content')
        .select('version')
        .eq('document_type', 'privacy_policy')
        .eq('language', 'es')
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION
      }

      return data.version
    } catch (error) {
      console.error('Error getting policy version:', error)
      return LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION
    }
  }

  // ============================================
  // ADMIN CONTENT MANAGEMENT (Auth Required)
  // ============================================

  /**
   * Create new legal content version
   * Triggers audit logging automatically
   */
  async createContent(
    contentData: CreateLegalContent,
    createdBy?: string
  ): Promise<LegalAPIResponse<LegalContent>> {
    try {
      // Validate input
      const validatedData = CreateLegalContentSchema.parse(contentData)

      // Deactivate existing active version if creating new active content
      if (validatedData.effective_date) {
        await this.deactivateExistingContent(
          validatedData.document_type,
          validatedData.language
        )
      }

      const { data, error } = await this.supabase
        .from('legal_content')
        .insert({
          ...validatedData,
          created_by: createdBy,
          effective_date: validatedData.effective_date || new Date().toISOString(),
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      const content = LegalContentSchema.parse(data)

      // Log content creation for audit
      await this.logContentActivity('legal_content_created', content.id, null, content, createdBy)

      return {
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
        version: await this.getCurrentPolicyVersion()
      }
    } catch (error) {
      console.error('Error creating legal content:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create content',
        timestamp: new Date().toISOString(),
        version: await this.getCurrentPolicyVersion()
      }
    }
  }

  /**
   * Update existing legal content
   * Maintains audit trail of changes
   */
  async updateContent(
    contentId: string,
    updateData: UpdateLegalContent,
    updatedBy?: string
  ): Promise<LegalAPIResponse<LegalContent>> {
    try {
      // Get existing content for audit trail
      const { data: existingData } = await this.supabase
        .from('legal_content')
        .select('*')
        .eq('id', contentId)
        .single()

      if (!existingData) {
        return {
          success: false,
          error: 'Content not found',
          timestamp: new Date().toISOString(),
          version: await this.getCurrentPolicyVersion()
        }
      }

      // Validate update data
      const validatedData = UpdateLegalContentSchema.parse(updateData)

      const { data, error } = await this.supabase
        .from('legal_content')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .select()
        .single()

      if (error) throw error

      const updatedContent = LegalContentSchema.parse(data)

      // Log content update for audit
      await this.logContentActivity(
        'legal_content_updated',
        contentId,
        existingData,
        updatedContent,
        updatedBy
      )

      return {
        success: true,
        data: updatedContent,
        timestamp: new Date().toISOString(),
        version: await this.getCurrentPolicyVersion()
      }
    } catch (error) {
      console.error('Error updating legal content:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update content',
        timestamp: new Date().toISOString(),
        version: await this.getCurrentPolicyVersion()
      }
    }
  }

  /**
   * Activate a specific content version
   * Ensures only one active version per document type/language
   */
  async activateVersion(
    contentId: string,
    activatedBy?: string
  ): Promise<LegalAPIResponse<LegalContent>> {
    try {
      // Get the content to activate
      const { data: contentToActivate } = await this.supabase
        .from('legal_content')
        .select('*')
        .eq('id', contentId)
        .single()

      if (!contentToActivate) {
        return {
          success: false,
          error: 'Content not found',
          timestamp: new Date().toISOString(),
          version: await this.getCurrentPolicyVersion()
        }
      }

      // Deactivate existing active version
      await this.deactivateExistingContent(
        contentToActivate.document_type,
        contentToActivate.language
      )

      // Activate the new version
      const { data, error } = await this.supabase
        .from('legal_content')
        .update({
          is_active: true,
          effective_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .select()
        .single()

      if (error) throw error

      const activatedContent = LegalContentSchema.parse(data)

      // Log activation for audit
      await this.logContentActivity(
        'policy_activated',
        contentId,
        contentToActivate,
        activatedContent,
        activatedBy
      )

      return {
        success: true,
        data: activatedContent,
        timestamp: new Date().toISOString(),
        version: await this.getCurrentPolicyVersion()
      }
    } catch (error) {
      console.error('Error activating content version:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate version',
        timestamp: new Date().toISOString(),
        version: await this.getCurrentPolicyVersion()
      }
    }
  }

  /**
   * Get version history for a document type and language
   * Used by admin interface for content management
   */
  async getVersionHistory(
    documentType: LegalDocumentType,
    language: Language = 'es'
  ): Promise<LegalContent[]> {
    try {
      const { data, error } = await this.supabase
        .from('legal_content')
        .select('*')
        .eq('document_type', documentType)
        .eq('language', language)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => LegalContentSchema.parse(item))
    } catch (error) {
      console.error('Error fetching version history:', error)
      return []
    }
  }

  // ============================================
  // COMPLIANCE & AUDIT UTILITIES
  // ============================================

  /**
   * Track legal content view for audit purposes
   * Called when users view legal pages
   */
  async trackContentView(
    documentType: LegalDocumentType,
    language: Language,
    ipAddress: string,
    userAgent: string,
    sessionId?: string
  ): Promise<void> {
    try {
      const activeContent = await this.getActiveContent(documentType, language)
      if (!activeContent) return

      await this.logContentActivity(
        'policy_viewed',
        activeContent.id,
        null,
        { document_type: documentType, language, ip_address: ipAddress },
        null,
        {
          ip_address: ipAddress,
          user_agent: userAgent,
          session_id: sessionId,
          policy_version: activeContent.version
        }
      )
    } catch (error) {
      console.error('Error tracking content view:', error)
    }
  }

  /**
   * Get legal content structured for SEO
   * Returns optimized metadata for legal pages
   */
  async getContentForSEO(
    documentType: LegalDocumentType,
    language: Language = 'es'
  ): Promise<{
    title: string
    description: string
    effectiveDate: string
    version: string
    url: string
  } | null> {
    try {
      const content = await this.getActiveContent(documentType, language)
      if (!content) return null

      const routes = LEGAL_CONSTANTS.LEGAL_ROUTES[language]
      const url = routes[documentType] || '#'

      // Extract description from content sections
      const sections = content.content.sections || []
      const firstSection = sections[0]
      const description = firstSection?.content?.substring(0, 160) || content.title

      return {
        title: content.title,
        description,
        effectiveDate: content.effective_date,
        version: content.version,
        url
      }
    } catch (error) {
      console.error('Error getting content for SEO:', error)
      return null
    }
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Deactivate existing active content for document type/language
   * Ensures only one active version exists
   */
  private async deactivateExistingContent(
    documentType: LegalDocumentType,
    language: Language
  ): Promise<void> {
    try {
      await this.supabase
        .from('legal_content')
        .update({ is_active: false })
        .eq('document_type', documentType)
        .eq('language', language)
        .eq('is_active', true)
    } catch (error) {
      console.error('Error deactivating existing content:', error)
    }
  }

  /**
   * Log content activity for audit trail
   * Maintains compliance audit log
   */
  private async logContentActivity(
    eventType: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    actorId?: string | null,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('legal_audit_logs')
        .insert({
          event_type: eventType,
          entity_type: 'legal_content',
          entity_id: entityId,
          old_values: oldValues,
          new_values: newValues,
          metadata: metadata,
          actor_type: actorId ? 'staff' : 'system',
          actor_id: actorId,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging content activity:', error)
    }
  }
}

// ============================================
// SERVICE FACTORY FUNCTIONS
// ============================================

export async function createLegalContentService() {
  const cookieStore = await cookies()
  const supabaseClient = createServerSupabaseClient(cookieStore)
  return new LegalContentService(supabaseClient)
}

export function createLegalContentServiceWithClient(supabaseClient: any) {
  return new LegalContentService(supabaseClient)
}

export default LegalContentService