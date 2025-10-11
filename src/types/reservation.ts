// types/reservation.ts - Complete Reservation Type Definitions
export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type TableLocation =
  | 'TERRACE_CAMPANARI'
  | 'TERRACE_JUSTICIA'
  | 'SALA_VIP'
  | 'SALA_PRINCIPAL'
  | 'TERRACE'
  | 'INTERIOR'
  | 'BAR'

export type Language = 'ES' | 'EN' | 'DE'

export interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  childrenCount?: number | null // NEW: Niños hasta 8 años (opcional)
  date: string | Date
  time: string | Date
  status: ReservationStatus
  specialRequests?: string | null

  // Table assignments - support both legacy and new format
  tableId?: string | null // Legacy single table
  table_ids?: string[] | null // New multiple tables array

  // Enhanced features
  occasion?: string | null
  dietaryNotes?: string | null
  preferredLanguage: Language
  hasPreOrder: boolean

  // Timestamps
  createdAt: string | Date
  updatedAt: string | Date

  // GDPR and consent
  marketingConsent?: boolean
  consentDataProcessing: boolean
  consentDataProcessingTimestamp?: string | Date | null
  consentEmail?: boolean
  consentEmailTimestamp?: string | Date | null
  consentMarketing?: boolean
  consentMarketingTimestamp?: string | Date | null
  consentIpAddress?: string | null
  consentUserAgent?: string | null
  consentWithdrawnAt?: string | Date | null
  consentWithdrawalReason?: string | null
  gdprPolicyVersion?: string
  consentMethod?: string

  // Relations
  customerId?: string | null
  restaurantId: string
}

export interface Table {
  id: string
  number: string
  capacity: number
  location: TableLocation
  qrCode: string
  isActive: boolean
  restaurantId: string
  createdAt: string | Date
  updatedAt: string | Date

  // Enhanced table features
  totalscans?: number
  lastscannedat?: string | Date | null
  qrversion?: number
  securityhash?: string | null
  currentstatus?: string
  statusnotes?: string | null
  estimatedfreetime?: string | null

  // Floor plan positioning
  position_x?: number
  position_y?: number
  rotation?: number
  width?: number
  height?: number
}

export interface ReservationWithTable extends Reservation {
  table?: Table | null
  tables?: Table[] // For multiple table reservations
}

// Export form data types
export interface ReservationFormData {
  // Step 1: Basic Info
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number

  // Step 2: Date/Time/Table
  date: Date | string
  time: Date | string
  tableId?: string
  tableIds?: string[] // Multiple table support

  // Step 3: Additional Info
  specialRequests?: string
  occasion?: string
  dietaryNotes?: string
  preferredLanguage: Language

  // GDPR Consents
  marketingConsent: boolean
  consentDataProcessing: boolean
  consentEmail: boolean
}

// API response types
export interface ReservationListResponse {
  reservations: Reservation[]
  total: number
  page: number
  limit: number
}

export interface ReservationSummary {
  total: number
  byStatus: Record<ReservationStatus, number>
  totalPax: number
  upcomingToday: number
  pendingConfirmation: number
}

// Filter types
export interface ReservationFilters {
  status?: ReservationStatus | string
  date?: string
  search?: string
  tableId?: string
  startDate?: string
  endDate?: string
}

// Real-time update types
export interface ReservationUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  reservation: Reservation
  old?: Reservation
}