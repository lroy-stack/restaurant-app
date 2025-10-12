/**
 * CONFIGURATION TYPES
 * TypeScript interfaces para sistema de configuración
 */

// Restaurant Configuration
export interface RestaurantConfig {
  id: string
  name: string
  description: string
  ambiente: string
  address: string
  phone: string
  email: string
  google_rating: number
  monthly_customers: number
  hours_operation: string
  location_type: string
  awards: string
  hero_title: string

  // Historia sections
  historia_hero_title: string
  historia_hero_subtitle: string
  historia_pasion_title: string
  historia_pasion_paragraph1: string
  historia_pasion_paragraph2: string
  historia_valor_tradicion_content: string
  historia_valor_pasion_content: string
  historia_valor_comunidad_content: string
  historia_location_title: string
  historia_location_content: string
  historia_quote: string
  vive_historia_title: string
  vive_historia_content: string

  // Galería sections
  galeria_experiencia_title: string
  galeria_ambiente_title: string
  galeria_ambiente_content: string
  galeria_cocina_title: string
  galeria_cocina_content: string

  // Contacto sections
  contacto_final_title: string
  contacto_final_content: string

  // Social Media
  instagram_url: string
  facebook_url: string
  whatsapp_number: string

  // Footer
  footer_newsletter_title: string
  footer_newsletter_description: string
  footer_newsletter_image_url: string
  footer_tripadvisor_url: string
  footer_copyright_text: string
}

// Business Hours Configuration
export interface BusinessHoursConfig {
  id: string
  restaurant_id: string
  day_of_week: number // 0-6 (Dom-Sáb)
  is_open: boolean

  // Dinner service (principal)
  open_time: string // HH:MM
  close_time: string
  last_reservation_time: string
  advance_booking_minutes: number
  max_party_size: number
  buffer_minutes: number

  // Lunch service (opcional)
  lunch_enabled: boolean
  lunch_open_time?: string
  lunch_close_time?: string
  lunch_last_reservation_time?: string
  lunch_advance_booking_minutes?: number
  lunch_max_party_size?: number
  lunch_buffer_minutes?: number

  // QR ordering
  qr_ordering_enabled: boolean
  qr_only_menu: boolean

  // System
  slot_duration_minutes: number

  // Holiday override
  is_holiday?: boolean
  holiday_name?: string
  date?: string
}

// Media Library Configuration
export interface MediaConfig {
  id: string
  name: string
  description: string
  url: string
  alt_text: string
  category: MediaCategory
  type: MediaType
  is_active: boolean
  display_order: number
  image_kit_transforms?: string
  restaurant_id: string
}

export type MediaCategory =
  | 'hero_home'
  | 'hero_historia'
  | 'hero_menu'
  | 'hero_galeria'
  | 'hero_contacto'
  | 'hero_reservas'
  | 'gallery_ambiente'
  | 'gallery_platos'
  | 'gallery_ubicacion'
  | 'gallery_cocina'
  | 'footer'

export type MediaType = 'hero' | 'gallery' | 'footer' | 'general'

// Email Configuration
export interface EmailConfig {
  id: string
  email_type: string
  enabled: boolean
  send_timing_hours: number
  subject_template: string
  body_template: string
  restaurant_id: string
}

// Configuration Sections
export type ConfigSection =
  | 'info'
  | 'horarios'
  | 'vacaciones'
  | 'medios'
  | 'emails'
  | 'social'
  | 'qr'
  | 'legal'
  | 'publicidad'

// Form states
export interface FormState {
  loading: boolean
  error: string | null
  success: boolean
}

// Validation errors
export interface ValidationError {
  field: string
  message: string
}
