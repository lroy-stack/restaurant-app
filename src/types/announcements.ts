/**
 * ANNOUNCEMENT SYSTEM TYPES
 * TypeScript definitions for announcement popup system
 */

export type AnnouncementType = 'event' | 'daily_dish' | 'promotion' | 'news' | 'menu_update'
export type DisplayType = 'popup' | 'banner' | 'toast' | 'sidebar'
export type ThemeType = 'default' | 'valentine' | 'christmas' | 'summer' | 'custom'
export type InteractionType = 'view' | 'click' | 'dismiss' | 'conversion'

export interface Announcement {
  id: string
  restaurantId: string

  // Content - Multilingual
  title: string
  titleEn?: string
  titleDe?: string
  content: string
  contentEn?: string
  contentDe?: string

  // Type & Display
  type: AnnouncementType
  displayType: DisplayType

  // Status
  isActive: boolean
  isPublished: boolean
  displayOrder: number

  // Targeting
  pages: string[]

  // Design
  theme: ThemeType
  backgroundColor: string
  textColor: string
  borderColor?: string

  // Media
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string

  // Badge
  badgeText?: string
  badgeColor: string

  // Call to Action
  ctaText?: string
  ctaUrl?: string
  ctaButtonColor: string

  // Scheduling
  startDate?: string
  endDate?: string

  // Interaction
  isDismissible: boolean
  showOncePerSession: boolean
  showOncePerDay: boolean
  maxDisplaysPerUser?: number

  // Analytics
  viewsCount: number
  clicksCount: number
  conversionCount: number

  // Metadata
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface AnnouncementInteraction {
  id: string
  announcementId: string
  interactionType: InteractionType
  pageUrl?: string
  userAgent?: string
  ipAddress?: string
  createdAt: string
}

export interface CreateAnnouncementInput {
  title: string
  titleEn?: string
  titleDe?: string
  content: string
  contentEn?: string
  contentDe?: string
  type: AnnouncementType
  displayType: DisplayType
  pages?: string[]
  theme?: ThemeType
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  badgeText?: string
  badgeColor?: string
  ctaText?: string
  ctaUrl?: string
  ctaButtonColor?: string
  startDate?: string
  endDate?: string
  isDismissible?: boolean
  showOncePerSession?: boolean
  showOncePerDay?: boolean
  maxDisplaysPerUser?: number
  displayOrder?: number
}

export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {
  isActive?: boolean
  isPublished?: boolean
}

export interface AnnouncementFilters {
  type?: AnnouncementType
  displayType?: DisplayType
  isActive?: boolean
  isPublished?: boolean
  page?: string
}

export interface AnnouncementAnalytics {
  id: string
  title: string
  type: AnnouncementType
  viewsCount: number
  clicksCount: number
  conversionCount: number
  ctr: number // Click-through rate
  conversionRate: number
  startDate?: string
  endDate?: string
}
