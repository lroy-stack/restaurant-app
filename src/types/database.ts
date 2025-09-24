// src/types/database.ts
// REAL DATABASE TYPES - Generated from live restaurante schema
// 🚨 CRITICAL: These types reflect the ACTUAL database structure

// ====================================================
// ENUMS - Matching real database exactly
// ====================================================

export type CategoryType = 'FOOD' | 'WINE' | 'BEVERAGE'

export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export type TableLocation = 'TERRACE' | 'INTERIOR' | 'BAR' | 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'SALA_PRINCIPAL' | 'TERRACE_JUSTICIA'

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'

// ====================================================
// REAL DATABASE TABLE INTERFACES
// ====================================================

export interface DatabaseReservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: Date
  time: Date
  status: ReservationStatus
  specialRequests?: string | null
  hasPreOrder: boolean
  tableId?: string | null
  restaurantId: string
  createdAt: Date
  updatedAt: Date
  occasion?: string | null
  dietaryNotes?: string | null
  marketingConsent?: boolean | null
  preferredLanguage?: string | null
  consentDataProcessing: boolean
  consentDataProcessingTimestamp?: Date | null
  consentEmail?: boolean | null
  consentEmailTimestamp?: Date | null
  consentMarketing?: boolean | null
  consentMarketingTimestamp?: Date | null
  consentIpAddress?: string | null
  consentUserAgent?: string | null
  consentWithdrawnAt?: Date | null
  consentWithdrawalReason?: string | null
  gdprPolicyVersion?: string | null
  consentMethod?: string | null
  customerId?: string | null
  table_ids?: string[] | null // ARRAY support for multiple tables
}

export interface DatabaseCustomer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  language: string
  dateOfBirth?: Date | null
  preferredTime?: string | null
  preferredLocation?: string | null
  dietaryRestrictions?: string[] | null
  allergies?: string | null
  favoriteDisheIds?: string[] | null
  totalVisits: number
  totalSpent: number // numeric type
  averagePartySize: number
  lastVisit?: Date | null
  isVip: boolean
  emailConsent: boolean
  smsConsent: boolean
  marketingConsent: boolean
  dataProcessingConsent: boolean
  consentDate?: Date | null
  consentIpAddress?: string | null
  consentUserAgent?: string | null
  gdprPolicyVersion?: string | null
  consentMethod?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseTable {
  id: string
  number: string
  capacity: number
  location: TableLocation
  qrCode: string
  isActive: boolean
  restaurantId: string
  createdAt: Date
  updatedAt: Date
  totalscans?: number | null
  lastscannedat?: Date | null
  qrversion?: number | null
  securityhash?: string | null
  currentstatus?: string | null
  statusnotes?: string | null
  estimatedfreetime?: string | null
  position_x?: number | null
  position_y?: number | null
  rotation?: number | null
  width?: number | null
  height?: number | null
}

export interface DatabaseUser {
  id: string
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseMenuItem {
  id: string
  name: string
  nameEn?: string | null
  description: string
  descriptionEn?: string | null
  price: number // numeric(8,2)
  isAvailable: boolean
  imageUrl?: string | null
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  categoryId: string
  restaurantId: string
  createdAt: Date
  updatedAt: Date
  isRecommended: boolean
  stock: number
  glassprice?: number | null
  alcoholcontent?: number | null
  richDescription?: string | null
  richDescriptionEn?: string | null
}

// ====================================================
// ADDITIONAL REAL TABLES (Missing from Prisma)
// ====================================================

export interface DatabaseCookieConsent {
  id: string
  session_id?: string | null
  customer_id?: string | null
  consent_id: string
  necessary_cookies: boolean
  analytics_cookies: boolean
  marketing_cookies: boolean
  functionality_cookies: boolean
  security_cookies: boolean
  consent_method: string
  consent_timestamp: Date
  expiry_timestamp: Date
  ip_address: string // inet type
  user_agent: string
  page_url: string
  referrer?: string | null
  policy_version: string
  gdpr_lawful_basis: string
  withdrawal_timestamp?: Date | null
  withdrawal_method?: string | null
  created_at?: Date | null
  updated_at?: Date | null
}

export interface DatabaseGdprRequest {
  id: string
  request_type: string
  status: string
  customer_id?: string | null
  email: string
  verification_token?: string | null
  verified_at?: Date | null
  description?: string | null
  requested_data?: Record<string, any> | null // jsonb
  legal_basis?: string | null
  assigned_to?: string | null
  response_data?: Record<string, any> | null // jsonb
  response_method?: string | null
  due_date: Date
  completed_at?: Date | null
  ip_address: string // inet
  user_agent: string
  created_at?: Date | null
  updated_at?: Date | null
}

export interface DatabaseEmailLog {
  id: string
  reservation_id: string
  template_id?: string | null
  recipient_email: string
  subject: string
  email_type: string
  sent_at?: Date | null
  delivered_at?: Date | null
  opened_at?: Date | null
  clicked_at?: Date | null
  bounced_at?: Date | null
  message_id?: string | null
  status?: string | null
  error_message?: string | null
  created_at?: Date | null
}

// ====================================================
// COMPONENT-FRIENDLY INTERFACES
// ====================================================

// Unified interface for reservation components
export interface Reservation extends Omit<DatabaseReservation, 'date' | 'time' | 'createdAt' | 'updatedAt'> {
  date: string // ISO string for components
  time: string // ISO string for components
  createdAt: string
  updatedAt: string
  // Add computed properties that components expect
  tables?: {
    id: string
    number: string
    capacity: number
    location: TableLocation
  } | null
}

// Unified interface for customer components
export interface Customer extends Omit<DatabaseCustomer, 'createdAt' | 'updatedAt' | 'dateOfBirth' | 'lastVisit' | 'consentDate'> {
  dateOfBirth?: string | null
  lastVisit?: string | null
  consentDate?: string | null
  createdAt: string
  updatedAt: string
}

// Calendar event interface for react-big-calendar
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    reservation: Reservation
    status: ReservationStatus
    partySize: number
    customerName: string
  }
}

// ====================================================
// FORM DATA INTERFACES
// ====================================================

export interface ReservationFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  tableId?: string
  specialRequests?: string
  dietaryNotes?: string
  occasion?: string
  consentDataProcessing: boolean
  consentEmail: boolean
  consentMarketing: boolean
  preferredLanguage?: string
}

export interface CustomerFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  language?: string
  dietaryRestrictions?: string[]
  allergies?: string
  emailConsent?: boolean
  smsConsent?: boolean
  marketingConsent?: boolean
  dataProcessingConsent: boolean
}

// ====================================================
// API RESPONSE INTERFACES
// ====================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ====================================================
// HOOK RETURN TYPES
// ====================================================

export interface UseReservationsReturn {
  reservations: Reservation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateReservation: (id: string, data: Partial<Reservation>) => Promise<boolean>
}

export interface UseCustomersReturn {
  customers: Customer[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<boolean>
}

// ====================================================
// EXPORTS FOR BACKWARDS COMPATIBILITY
// ====================================================

// Export main interfaces with original names for compatibility
export type { Reservation as ReservationData }
export type { Customer as CustomerData }
export type { DatabaseTable as TableData }
export type { DatabaseMenuItem as MenuItem }
export type { DatabaseUser as User }

// Export enums for easy use
export {
  type CategoryType as MenuCategoryType,
  type ReservationStatus as Status,
  type TableLocation as Location,
  type UserRole as Role
}