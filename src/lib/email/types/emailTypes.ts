// Email service types - VALIDATED against restaurante schema database
// CRITICAL: Field names match EXACTLY the database schema

export enum EmailResult {
  Ok = 'ok',
  SmtpError = 'smtp_error',
  TemplateNotFound = 'template_not_found',
  ReservationNotFound = 'reservation_not_found',
  RateLimitExceeded = 'rate_limit_exceeded',
  InvalidEmail = 'invalid_email'
}

export enum EmailType {
  ReservationCreated = 'reservation_created',
  ReservationConfirmed = 'reservation_confirmed',
  ReservationReminder = 'reservation_reminder',
  ReservationReview = 'reservation_review',
  ReservationCancelled = 'reservation_cancelled',
  ReservationModified = 'reservation_modified',
  CustomMessage = 'custom_message'
}

// VALIDATED: Database schema interface matches real structure from SSH validation
export interface ReservationToken {
  id: string
  reservation_id: string
  token: string
  customer_email: string        // EXACT field name from DB - NOT email
  expires: string              // EXACT field name from DB - NOT expires_at
  created_at: string
  used_at: string | null
  is_active: boolean           // EXACT field name from DB - NOT isActive
  purpose: string              // EXACT field name from DB - text field
}

// Import centralized config types
import { EmailUrls } from '../config/emailConfig'

// Validated against existing reservation structure + CENTRALIZED CONFIG
export interface EmailTemplateData {
  customerName: string
  customerEmail: string
  reservationId: string
  reservationDate: string
  reservationTime: string
  partySize: number
  tableLocation: string
  tableNumber: string
  specialRequests?: string
  tokenUrl?: string
  preOrderItems?: PreOrderItem[]
  preOrderTotal?: number
  restaurantName: string
  restaurantEmail: string
  restaurantPhone: string
  address: string
  tripadvisorUrl?: string
  instagramUrl?: string // ✅ NEW
  facebookUrl?: string // ✅ NEW
  whatsappNumber?: string // ✅ NEW
  reservationStatus: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

  // CENTRALIZED CONFIG
  urls?: EmailUrls
  branding?: {
    logo: string
    fonts: {
      googleFontsUrl: string
      primary: string
      secondary: string
      body: string
      elegant: string
    }
  }
}

export interface PreOrderItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
  category: string
  type: string
}

// New tables per PRP specification
export interface EmailLog {
  id: string
  reservation_id: string
  template_id?: string
  recipient_email: string
  subject: string
  email_type: string
  sent_at: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  bounced_at?: string
  message_id: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  error_message?: string
}

export interface EmailTemplate {
  id: string
  name: string
  type: EmailType
  subject: string
  html_content: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface EmailSchedule {
  id: string
  reservation_id: string
  email_type: EmailType
  scheduled_at: string
  sent_at?: string
  status: 'pending' | 'sent' | 'failed'
  retry_count: number
  created_at: string
}

// SMTP Configuration interface based on Titan.email requirements
export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  tls: {
    rejectUnauthorized: boolean
    minVersion: string
  }
}

// Custom Email Data - extends EmailTemplateData for personalized messages
export interface CustomEmailData extends EmailTemplateData {
  // Custom message specific fields
  customSubject: string
  customMessage: string // HTML content
  messageType: 'offer' | 'promotion' | 'followup' | 'custom'
  ctaText?: string
  ctaUrl?: string
  previewMode?: boolean

  // Client context for intelligent personalization
  clientContext?: {
    totalVisits?: number
    lastVisit?: string
    favoriteItems?: string[]
    averageSpending?: number
    isVip?: boolean
    upcomingReservations?: number
    cancelledReservations?: number
    language?: string
    loyaltyTier?: string
    preferredTimeSlots?: string[]
    hasEmailConsent?: boolean
    hasMarketingConsent?: boolean
  }

  // Template metadata
  templateSource?: 'predefined' | 'custom' | 'ai-generated'
  scheduledAt?: string // For future: scheduled sends
  priority?: 'low' | 'normal' | 'high'
}