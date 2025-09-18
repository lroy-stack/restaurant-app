// lib/services/legal/cookieConsentService.ts
// Cookie Consent Management Service - AEPD 2025 Compliant
// PRP Implementation: Complete GDPR Article 7 & AEPD Cookie Compliance

import { createClient } from '@/lib/supabase/server'
import {
  CookieConsent,
  CreateCookieConsent,
  UpdateCookieConsent,
  CookieConsentSchema,
  CreateCookieConsentSchema,
  UpdateCookieConsentSchema,
  ConsentMethod,
  WithdrawalMethod,
  CookiePreferences,
  ConsentMetadata,
  LegalAPIResponse,
  LEGAL_CONSTANTS
} from '@/types/legal'

export class CookieConsentService {
  private supabase = createClient()

  // ============================================
  // CONSENT CREATION & MANAGEMENT
  // ============================================

  /**
   * Create new cookie consent record
   * AEPD 2025 compliant with 24-month maximum duration
   */
  async createConsent(
    consentData: CreateCookieConsent,
    userAgent: string,
    ipAddress: string
  ): Promise<LegalAPIResponse<CookieConsent>> {
    try {
      // Validate consent data
      const validatedData = CreateCookieConsentSchema.parse(consentData)

      // Calculate expiry timestamp (AEPD max 24 months)
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + LEGAL_CONSTANTS.MAX_CONSENT_DURATION_MONTHS)

      // Ensure necessary cookies are always true (AEPD requirement)
      const consentRecord = {
        ...validatedData,
        necessary_cookies: true, // Cannot be disabled per AEPD
        expiry_timestamp: validatedData.expiry_timestamp || expiryDate.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      }

      const { data, error } = await this.supabase
        .from('cookie_consents')
        .insert(consentRecord)
        .select()
        .single()

      if (error) throw error

      const consent = CookieConsentSchema.parse(data)

      // Log consent creation for audit
      await this.logConsentActivity('consent_given', consent.id, null, consent, ipAddress, userAgent)

      return {
        success: true,
        data: consent,
        timestamp: new Date().toISOString(),
        version: consent.policy_version
      }
    } catch (error) {
      console.error('Error creating cookie consent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create consent',
        timestamp: new Date().toISOString(),
        version: LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION
      }
    }
  }

  /**
   * Update existing consent preferences
   * Maintains audit trail of preference changes
   */
  async updateConsent(
    consentId: string,
    updateData: UpdateCookieConsent,
    ipAddress: string,
    userAgent: string
  ): Promise<LegalAPIResponse<CookieConsent>> {
    try {
      // Get existing consent for audit trail
      const existingConsent = await this.getConsentById(consentId)
      if (!existingConsent) {
        return {
          success: false,
          error: 'Consent record not found',
          timestamp: new Date().toISOString(),
          version: LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION
        }
      }

      // Validate update data
      const validatedData = UpdateCookieConsentSchema.parse(updateData)

      const { data, error } = await this.supabase
        .from('cookie_consents')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('consent_id', consentId)
        .select()
        .single()

      if (error) throw error

      const updatedConsent = CookieConsentSchema.parse(data)

      // Determine event type based on update
      const eventType = updateData.withdrawal_timestamp ? 'consent_withdrawn' : 'consent_modified'

      // Log consent modification for audit
      await this.logConsentActivity(
        eventType,
        updatedConsent.id,
        existingConsent,
        updatedConsent,
        ipAddress,
        userAgent
      )

      return {
        success: true,
        data: updatedConsent,
        timestamp: new Date().toISOString(),
        version: updatedConsent.policy_version
      }
    } catch (error) {
      console.error('Error updating cookie consent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update consent',
        timestamp: new Date().toISOString(),
        version: LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION
      }
    }
  }

  /**
   * Withdraw consent completely
   * GDPR Article 7(3) - Right to withdraw consent
   */
  async withdrawConsent(
    consentId: string,
    withdrawalMethod: WithdrawalMethod,
    ipAddress: string,
    userAgent: string
  ): Promise<LegalAPIResponse<CookieConsent>> {
    try {
      const withdrawalData: UpdateCookieConsent = {
        analytics_cookies: false,
        marketing_cookies: false,
        functionality_cookies: false,
        security_cookies: false,
        withdrawal_timestamp: new Date().toISOString(),
        withdrawal_method: withdrawalMethod
      }

      return await this.updateConsent(consentId, withdrawalData, ipAddress, userAgent)
    } catch (error) {
      console.error('Error withdrawing consent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to withdraw consent',
        timestamp: new Date().toISOString(),
        version: LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION
      }
    }
  }

  // ============================================
  // CONSENT RETRIEVAL & VALIDATION
  // ============================================

  /**
   * Get current consent by consent ID
   * Used for validating cookie usage permissions
   */
  async getConsentById(consentId: string): Promise<CookieConsent | null> {
    try {
      const { data, error } = await this.supabase
        .from('cookie_consents')
        .select('*')
        .eq('consent_id', consentId)
        .single()

      if (error || !data) return null

      return CookieConsentSchema.parse(data)
    } catch (error) {
      console.error('Error fetching consent by ID:', error)
      return null
    }
  }

  /**
   * Get active consent for a customer
   * Returns most recent non-withdrawn consent
   */
  async getActiveConsentByCustomer(customerId: string): Promise<CookieConsent | null> {
    try {
      const { data, error } = await this.supabase
        .from('cookie_consents')
        .select('*')
        .eq('customer_id', customerId)
        .is('withdrawal_timestamp', null)
        .gte('expiry_timestamp', new Date().toISOString())
        .order('consent_timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return null

      return CookieConsentSchema.parse(data)
    } catch (error) {
      console.error('Error fetching active consent by customer:', error)
      return null
    }
  }

  /**
   * Get active consent for a session (anonymous users)
   * Used before customer registration/login
   */
  async getActiveConsentBySession(sessionId: string): Promise<CookieConsent | null> {
    try {
      const { data, error } = await this.supabase
        .from('cookie_consents')
        .select('*')
        .eq('session_id', sessionId)
        .is('withdrawal_timestamp', null)
        .gte('expiry_timestamp', new Date().toISOString())
        .order('consent_timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return null

      return CookieConsentSchema.parse(data)
    } catch (error) {
      console.error('Error fetching active consent by session:', error)
      return null
    }
  }

  /**
   * Check if specific cookie category is allowed
   * Core function for cookie usage validation
   */
  async canUseCookieCategory(
    consentId: string,
    category: 'necessary' | 'analytics' | 'marketing' | 'functionality' | 'security'
  ): Promise<boolean> {
    try {
      const consent = await this.getConsentById(consentId)
      if (!consent) return false

      // Check if consent is still valid (not expired, not withdrawn)
      if (consent.withdrawal_timestamp) return false
      if (new Date(consent.expiry_timestamp) < new Date()) return false

      // Check category permission
      const categoryField = `${category}_cookies` as keyof CookieConsent
      return Boolean(consent[categoryField])
    } catch (error) {
      console.error('Error checking cookie category permission:', error)
      return false
    }
  }

  /**
   * Get cookie preferences in frontend-friendly format
   * Used by cookie consent banner
   */
  async getCookiePreferences(consentId: string): Promise<CookiePreferences | null> {
    try {
      const consent = await this.getConsentById(consentId)
      if (!consent) return null

      return {
        necessary: consent.necessary_cookies,
        analytics: consent.analytics_cookies,
        marketing: consent.marketing_cookies,
        functionality: consent.functionality_cookies,
        security: consent.security_cookies
      }
    } catch (error) {
      console.error('Error getting cookie preferences:', error)
      return null
    }
  }

  /**
   * Get consent metadata for audit and compliance
   * Used for compliance reporting
   */
  async getConsentMetadata(consentId: string): Promise<ConsentMetadata | null> {
    try {
      const consent = await this.getConsentById(consentId)
      if (!consent) return null

      return {
        consentId: consent.consent_id,
        method: consent.consent_method,
        timestamp: new Date(consent.consent_timestamp),
        expiryDate: new Date(consent.expiry_timestamp),
        policyVersion: consent.policy_version,
        ipAddress: consent.ip_address,
        userAgent: consent.user_agent
      }
    } catch (error) {
      console.error('Error getting consent metadata:', error)
      return null
    }
  }

  // ============================================
  // COMPLIANCE & MAINTENANCE
  // ============================================

  /**
   * Get expired consents that need renewal
   * Used for automated consent renewal notifications
   */
  async getExpiredConsents(days: number = 30): Promise<CookieConsent[]> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('cookie_consents')
        .select('*')
        .lt('expiry_timestamp', new Date().toISOString())
        .is('withdrawal_timestamp', null)
        .order('expiry_timestamp', { ascending: true })

      if (error) throw error

      return data.map(item => CookieConsentSchema.parse(item))
    } catch (error) {
      console.error('Error fetching expired consents:', error)
      return []
    }
  }

  /**
   * Get consents expiring soon for proactive renewal
   * AEPD best practice for consent management
   */
  async getConsentsExpiringSoon(days: number = 30): Promise<CookieConsent[]> {
    try {
      const warningDate = new Date()
      warningDate.setDate(warningDate.getDate() + days)

      const { data, error } = await this.supabase
        .from('cookie_consents')
        .select('*')
        .lt('expiry_timestamp', warningDate.toISOString())
        .gte('expiry_timestamp', new Date().toISOString())
        .is('withdrawal_timestamp', null)
        .order('expiry_timestamp', { ascending: true })

      if (error) throw error

      return data.map(item => CookieConsentSchema.parse(item))
    } catch (error) {
      console.error('Error fetching consents expiring soon:', error)
      return []
    }
  }

  /**
   * Get consent statistics for compliance dashboard
   * Used by admin interface for monitoring
   */
  async getConsentStatistics(days: number = 30): Promise<{
    totalConsents: number
    activeConsents: number
    withdrawnConsents: number
    expiredConsents: number
    consentByMethod: Record<ConsentMethod, number>
    acceptanceRates: {
      analytics: number
      marketing: number
      functionality: number
      security: number
    }
  }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('cookie_consents')
        .select('*')
        .gte('created_at', cutoffDate.toISOString())

      if (error) throw error

      const consents = data.map(item => CookieConsentSchema.parse(item))
      const total = consents.length

      // Calculate statistics
      const active = consents.filter(c =>
        !c.withdrawal_timestamp && new Date(c.expiry_timestamp) > new Date()
      ).length

      const withdrawn = consents.filter(c => c.withdrawal_timestamp).length
      const expired = consents.filter(c =>
        !c.withdrawal_timestamp && new Date(c.expiry_timestamp) <= new Date()
      ).length

      // Consent by method
      const consentByMethod = consents.reduce((acc, consent) => {
        acc[consent.consent_method] = (acc[consent.consent_method] || 0) + 1
        return acc
      }, {} as Record<ConsentMethod, number>)

      // Acceptance rates for active consents
      const activeConsents = consents.filter(c =>
        !c.withdrawal_timestamp && new Date(c.expiry_timestamp) > new Date()
      )

      const acceptanceRates = {
        analytics: activeConsents.filter(c => c.analytics_cookies).length / Math.max(activeConsents.length, 1),
        marketing: activeConsents.filter(c => c.marketing_cookies).length / Math.max(activeConsents.length, 1),
        functionality: activeConsents.filter(c => c.functionality_cookies).length / Math.max(activeConsents.length, 1),
        security: activeConsents.filter(c => c.security_cookies).length / Math.max(activeConsents.length, 1)
      }

      return {
        totalConsents: total,
        activeConsents: active,
        withdrawnConsents: withdrawn,
        expiredConsents: expired,
        consentByMethod,
        acceptanceRates
      }
    } catch (error) {
      console.error('Error calculating consent statistics:', error)
      return {
        totalConsents: 0,
        activeConsents: 0,
        withdrawnConsents: 0,
        expiredConsents: 0,
        consentByMethod: {} as Record<ConsentMethod, number>,
        acceptanceRates: { analytics: 0, marketing: 0, functionality: 0, security: 0 }
      }
    }
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Log consent activity for audit trail
   * Maintains GDPR compliance audit log
   */
  private async logConsentActivity(
    eventType: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    ipAddress: string,
    userAgent: string,
    sessionId?: string,
    actorId?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('legal_audit_logs')
        .insert({
          event_type: eventType,
          entity_type: 'cookie_consent',
          entity_id: entityId,
          old_values: oldValues,
          new_values: newValues,
          actor_type: actorId ? 'customer' : 'anonymous',
          actor_id: actorId,
          ip_address: ipAddress,
          user_agent: userAgent,
          session_id: sessionId,
          legal_basis: 'consent',
          policy_version: newValues?.policy_version || LEGAL_CONSTANTS.DEFAULT_POLICY_VERSION,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging consent activity:', error)
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const cookieConsentService = new CookieConsentService()
export default cookieConsentService