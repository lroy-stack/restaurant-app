// types/legal.ts - Complete TypeScript definitions for Legal Compliance System
// PRP Implementation: GDPR/AEPD 2025 Type Safety

import { z } from 'zod'

// ============================================
// LEGAL DOCUMENT TYPES & ENUMS
// ============================================

export const LegalDocumentType = z.enum([
  'privacy_policy',
  'terms_conditions',
  'cookie_policy',
  'legal_notice',
  'gdpr_rights'
])

export const Language = z.enum(['es', 'en'])

export const ConsentMethod = z.enum([
  'banner_accept_all',
  'banner_reject_all',
  'preferences_custom',
  'banner_necessary_only'
])

export const WithdrawalMethod = z.enum([
  'banner',
  'preferences',
  'contact_form',
  'api'
])

export const GDPRRequestType = z.enum([
  'access',        // Article 15 - Right of access
  'rectification', // Article 16 - Right to rectification
  'erasure',       // Article 17 - Right to erasure
  'portability',   // Article 20 - Right to data portability
  'restriction',   // Article 18 - Right to restriction of processing
  'objection'      // Article 21 - Right to object
])

export const GDPRRequestStatus = z.enum([
  'pending',
  'in_progress',
  'completed',
  'rejected',
  'expired'
])

export const ResponseMethod = z.enum([
  'email',
  'secure_download',
  'postal',
  'in_person'
])

// ============================================
// LEGAL CONTENT SCHEMAS
// ============================================

export const LegalContentSchema = z.object({
  id: z.string(),
  document_type: LegalDocumentType,
  language: Language,
  version: z.string(),
  title: z.string(),
  content: z.record(z.string(), z.any()), // JSONB content with flexible structure
  effective_date: z.string(),
  expiry_date: z.string().nullable(),
  is_active: z.boolean(),
  created_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreateLegalContentSchema = z.object({
  document_type: LegalDocumentType,
  language: Language,
  version: z.string().default('v1.0'),
  title: z.string().min(1, 'Title is required'),
  content: z.record(z.string(), z.any()).refine(
    (content) => content.sections && Array.isArray(content.sections),
    'Content must have sections array'
  ),
  effective_date: z.string().optional(),
  expiry_date: z.string().optional(),
  created_by: z.string().optional()
})

export const UpdateLegalContentSchema = CreateLegalContentSchema.partial()

// ============================================
// COOKIE CONSENT SCHEMAS (AEPD 2025 COMPLIANT)
// ============================================

export const CookieConsentSchema = z.object({
  id: z.string(),
  session_id: z.string().nullable(),
  customer_id: z.string().nullable(),
  consent_id: z.string(),
  // AEPD 2025 Cookie Categories
  necessary_cookies: z.boolean().default(true),
  analytics_cookies: z.boolean().default(false),
  marketing_cookies: z.boolean().default(false),
  functionality_cookies: z.boolean().default(false),
  security_cookies: z.boolean().default(false),
  // Consent metadata
  consent_method: ConsentMethod,
  consent_timestamp: z.string(),
  expiry_timestamp: z.string(),
  // Technical metadata
  ip_address: z.string(),
  user_agent: z.string(),
  page_url: z.string(),
  referrer: z.string().nullable(),
  // Compliance tracking
  policy_version: z.string().default('v1.0'),
  gdpr_lawful_basis: z.string().default('consent'),
  withdrawal_timestamp: z.string().nullable(),
  withdrawal_method: WithdrawalMethod.nullable(),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreateCookieConsentSchema = z.object({
  session_id: z.string().nullable(),
  customer_id: z.string().nullable(),
  consent_id: z.string(),
  // Cookie preferences (AEPD 2025 categories)
  necessary_cookies: z.boolean().default(true), // Cannot be false
  analytics_cookies: z.boolean(),
  marketing_cookies: z.boolean(),
  functionality_cookies: z.boolean(),
  security_cookies: z.boolean(),
  // Consent context
  consent_method: ConsentMethod,
  expiry_timestamp: z.string(), // Must be calculated (24 months max AEPD)
  // Technical context
  ip_address: z.string(),
  user_agent: z.string(),
  page_url: z.string(),
  referrer: z.string().optional(),
  policy_version: z.string().default('v1.0')
})

export const UpdateCookieConsentSchema = z.object({
  analytics_cookies: z.boolean().optional(),
  marketing_cookies: z.boolean().optional(),
  functionality_cookies: z.boolean().optional(),
  security_cookies: z.boolean().optional(),
  withdrawal_timestamp: z.string().optional(),
  withdrawal_method: WithdrawalMethod.optional()
})

// ============================================
// GDPR RIGHTS REQUEST SCHEMAS
// ============================================

export const GDPRRequestSchema = z.object({
  id: z.string(),
  request_type: GDPRRequestType,
  status: GDPRRequestStatus,
  customer_id: z.string().nullable(),
  email: z.string().email(),
  verification_token: z.string(),
  verified_at: z.string().nullable(),
  description: z.string().nullable(),
  requested_data: z.record(z.string(), z.any()).nullable(),
  legal_basis: z.string().nullable(),
  assigned_to: z.string().nullable(),
  response_data: z.record(z.string(), z.any()).nullable(),
  response_method: ResponseMethod.nullable(),
  due_date: z.string(),
  completed_at: z.string().nullable(),
  ip_address: z.string(),
  user_agent: z.string(),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreateGDPRRequestSchema = z.object({
  request_type: GDPRRequestType,
  customer_id: z.string().optional(),
  email: z.string().email(),
  description: z.string().optional(),
  requested_data: z.record(z.string(), z.any()).optional(),
  legal_basis: z.string().optional(),
  ip_address: z.string(),
  user_agent: z.string()
})

export const UpdateGDPRRequestSchema = z.object({
  status: GDPRRequestStatus.optional(),
  assigned_to: z.string().optional(),
  response_data: z.record(z.string(), z.any()).optional(),
  response_method: ResponseMethod.optional(),
  completed_at: z.string().optional()
})

// ============================================
// AUDIT LOG SCHEMAS
// ============================================

export const AuditEventType = z.enum([
  'consent_given',
  'consent_withdrawn',
  'consent_modified',
  'policy_viewed',
  'policy_updated',
  'policy_activated',
  'data_exported',
  'data_deleted',
  'data_anonymized',
  'gdpr_request_submitted',
  'gdpr_request_processed',
  'legal_content_created',
  'legal_content_updated'
])

export const ActorType = z.enum([
  'customer',
  'staff',
  'system',
  'anonymous'
])

export const EntityType = z.enum([
  'customer',
  'reservation',
  'cookie_consent',
  'gdpr_request',
  'legal_content'
])

export const AuditLogSchema = z.object({
  id: z.string(),
  event_type: AuditEventType,
  entity_type: EntityType,
  entity_id: z.string(),
  old_values: z.record(z.string(), z.any()).nullable(),
  new_values: z.record(z.string(), z.any()).nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  actor_type: ActorType,
  actor_id: z.string().nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  session_id: z.string().nullable(),
  legal_basis: z.string().nullable(),
  policy_version: z.string().nullable(),
  timestamp: z.string()
})

export const CreateAuditLogSchema = z.object({
  event_type: AuditEventType,
  entity_type: EntityType,
  entity_id: z.string(),
  old_values: z.record(z.string(), z.any()).optional(),
  new_values: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  actor_type: ActorType,
  actor_id: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  legal_basis: z.string().optional(),
  policy_version: z.string().optional()
})

// ============================================
// DERIVED TYPES FOR TYPESCRIPT
// ============================================

export type LegalDocumentType = z.infer<typeof LegalDocumentType>
export type Language = z.infer<typeof Language>
export type ConsentMethod = z.infer<typeof ConsentMethod>
export type WithdrawalMethod = z.infer<typeof WithdrawalMethod>
export type GDPRRequestType = z.infer<typeof GDPRRequestType>
export type GDPRRequestStatus = z.infer<typeof GDPRRequestStatus>
export type ResponseMethod = z.infer<typeof ResponseMethod>

export type LegalContent = z.infer<typeof LegalContentSchema>
export type CreateLegalContent = z.infer<typeof CreateLegalContentSchema>
export type UpdateLegalContent = z.infer<typeof UpdateLegalContentSchema>

export type CookieConsent = z.infer<typeof CookieConsentSchema>
export type CreateCookieConsent = z.infer<typeof CreateCookieConsentSchema>
export type UpdateCookieConsent = z.infer<typeof UpdateCookieConsentSchema>

export type GDPRRequest = z.infer<typeof GDPRRequestSchema>
export type CreateGDPRRequest = z.infer<typeof CreateGDPRRequestSchema>
export type UpdateGDPRRequest = z.infer<typeof UpdateGDPRRequestSchema>

export type AuditEventType = z.infer<typeof AuditEventType>
export type ActorType = z.infer<typeof ActorType>
export type EntityType = z.infer<typeof EntityType>
export type AuditLog = z.infer<typeof AuditLogSchema>
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>

// ============================================
// FRONTEND UTILITY TYPES
// ============================================

export interface CookiePreferences {
  necessary: boolean        // Always true (AEPD requirement)
  analytics: boolean
  marketing: boolean
  functionality: boolean
  security: boolean
}

export interface ConsentMetadata {
  consentId: string
  method: ConsentMethod
  timestamp: Date
  expiryDate: Date
  policyVersion: string
  ipAddress: string
  userAgent: string
}

export interface LegalPageProps {
  documentType: LegalDocumentType
  language: Language
  version?: string
}

export interface GDPRFormData {
  requestType: GDPRRequestType
  email: string
  description?: string
  requestedDataCategories?: string[]
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface LegalAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
  version: string
}

export interface ComplianceStatus {
  hasValidConsent: boolean
  consentExpiry: Date | null
  policyVersion: string
  lastConsentUpdate: Date | null
  pendingGDPRRequests: number
}

// ============================================
// CONSTANTS FOR LEGAL COMPLIANCE
// ============================================

export const LEGAL_CONSTANTS = {
  // AEPD 2025 Requirements
  MAX_CONSENT_DURATION_MONTHS: 24,
  GDPR_RESPONSE_DEADLINE_DAYS: 30,
  COOKIE_CONSENT_STORAGE_KEY: 'enigma_cookie_consent',
  DEFAULT_POLICY_VERSION: 'v1.0',

  // Supported Languages
  SUPPORTED_LANGUAGES: ['es', 'en'] as const,
  DEFAULT_LANGUAGE: 'es' as const,

  // Legal Document URLs
  LEGAL_ROUTES: {
    es: {
      privacy_policy: '/legal/politica-privacidad',
      terms_conditions: '/legal/terminos-condiciones',
      cookie_policy: '/legal/politica-cookies',
      legal_notice: '/legal/aviso-legal',
      gdpr_rights: '/legal/derechos-gdpr'
    },
    en: {
      privacy_policy: '/en/legal/privacy-policy',
      terms_conditions: '/en/legal/terms-conditions',
      cookie_policy: '/en/legal/cookie-policy',
      legal_notice: '/en/legal/legal-notice',
      gdpr_rights: '/en/legal/gdpr-rights'
    }
  }
} as const

export default {
  LegalDocumentType,
  Language,
  ConsentMethod,
  WithdrawalMethod,
  GDPRRequestType,
  GDPRRequestStatus,
  ResponseMethod,
  LegalContentSchema,
  CreateLegalContentSchema,
  UpdateLegalContentSchema,
  CookieConsentSchema,
  CreateCookieConsentSchema,
  UpdateCookieConsentSchema,
  GDPRRequestSchema,
  CreateGDPRRequestSchema,
  UpdateGDPRRequestSchema,
  AuditLogSchema,
  CreateAuditLogSchema,
  LEGAL_CONSTANTS
}