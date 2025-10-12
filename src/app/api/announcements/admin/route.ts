import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://supabase.enigmaconalma.com'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NTcxOTYwMDAsImV4cCI6MTkxNDk2MjQwMH0.m0raHGfbQAMISP5sMQ7xade4B30IOk0qTfyiNEt1Mkg'

/**
 * ADMIN ENDPOINT - Get ALL announcements regardless of status
 * Uses service role key to bypass RLS
 */
export async function GET(request: Request) {
  try {
    // TODO: Add admin authentication check here
    // For now, using service role to fetch all announcements

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/announcements?select=*&order=created_at.desc`,
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
    console.error('Error fetching admin announcements:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching announcements'
      },
      { status: 500 }
    )
  }
}
