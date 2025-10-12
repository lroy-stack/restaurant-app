import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import type { CreateAnnouncementInput, AnnouncementFilters } from '@/types/announcements'

const SUPABASE_URL = 'https://supabase.enigmaconalma.com'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NTcxOTYwMDAsImV4cCI6MTkxNDk2MjQwMH0.m0raHGfbQAMISP5sMQ7xade4B30IOk0qTfyiNEt1Mkg'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || 'all'
    const type = searchParams.get('type')
    const displayType = searchParams.get('displayType')
    const isActive = searchParams.get('isActive')
    const isPublished = searchParams.get('isPublished')

    // Build query for active, published announcements
    let query = `is_active=eq.true&is_published=eq.true`

    // Filter by date range
    const now = new Date().toISOString()
    query += `&or=(start_date.is.null,start_date.lte.${now})`
    query += `&or=(end_date.is.null,end_date.gte.${now})`

    // Filter by type if specified
    if (type) {
      query += `&type=eq.${type}`
    }

    // Filter by display type if specified
    if (displayType) {
      query += `&display_type=eq.${displayType}`
    }

    // Filter by page (check if 'all' is in pages array or specific page)
    if (page !== 'all') {
      query += `&or=(pages.cs.{all},pages.cs.{${page}})`
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/announcements?${query}&order=display_order.desc,created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch announcements: ${errorText}`)
    }

    const rawData = await response.json()

    // Transform snake_case to camelCase for frontend
    const data = rawData.map((announcement: any) => ({
      id: announcement.id,
      restaurantId: announcement.restaurant_id,
      title: announcement.title,
      titleEn: announcement.title_en,
      titleDe: announcement.title_de,
      content: announcement.content,
      contentEn: announcement.content_en,
      contentDe: announcement.content_de,
      type: announcement.type,
      displayType: announcement.display_type,
      isActive: announcement.is_active,
      isPublished: announcement.is_published,
      displayOrder: announcement.display_order,
      pages: announcement.pages,
      theme: announcement.theme,
      backgroundColor: announcement.background_color,
      textColor: announcement.text_color,
      borderColor: announcement.border_color,
      imageUrl: announcement.image_url,
      imageAlt: announcement.image_alt,
      videoUrl: announcement.video_url,
      badgeText: announcement.badge_text,
      badgeColor: announcement.badge_color,
      ctaText: announcement.cta_text,
      ctaUrl: announcement.cta_url,
      ctaButtonColor: announcement.cta_button_color,
      startDate: announcement.start_date,
      endDate: announcement.end_date,
      isDismissible: announcement.is_dismissible,
      showOncePerSession: announcement.show_once_per_session,
      showOncePerDay: announcement.show_once_per_day,
      maxDisplaysPerUser: announcement.max_displays_per_user,
      viewsCount: announcement.views_count,
      clicksCount: announcement.clicks_count,
      conversionCount: announcement.conversion_count,
      createdBy: announcement.created_by,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at
    }))

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    })

  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching announcements'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateAnnouncementInput = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.type || !body.displayType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create announcement
    const response = await fetch(`${SUPABASE_URL}/rest/v1/announcements`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: body.title,
        title_en: body.titleEn,
        title_de: body.titleDe,
        content: body.content,
        content_en: body.contentEn,
        content_de: body.contentDe,
        type: body.type,
        display_type: body.displayType,
        pages: body.pages || ['all'],
        theme: body.theme || 'default',
        background_color: body.backgroundColor || '#237584',
        text_color: body.textColor || '#FFFFFF',
        border_color: body.borderColor,
        image_url: body.imageUrl,
        image_alt: body.imageAlt,
        video_url: body.videoUrl,
        badge_text: body.badgeText,
        badge_color: body.badgeColor || '#EF4444',
        cta_text: body.ctaText,
        cta_url: body.ctaUrl,
        cta_button_color: body.ctaButtonColor || '#237584',
        start_date: body.startDate,
        end_date: body.endDate,
        is_dismissible: body.isDismissible ?? true,
        show_once_per_session: body.showOncePerSession ?? false,
        show_once_per_day: body.showOncePerDay ?? true,
        max_displays_per_user: body.maxDisplaysPerUser,
        display_order: body.displayOrder || 0,
        is_active: false,
        is_published: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create announcement: ${errorText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data[0] : data
    })

  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error creating announcement'
      },
      { status: 500 }
    )
  }
}
