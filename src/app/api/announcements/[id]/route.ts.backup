import { NextResponse } from 'next/server'
import type { UpdateAnnouncementInput } from '@/types/announcements'

const SUPABASE_URL = 'https://supabase.enigmaconalma.com'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NTcxOTYwMDAsImV4cCI6MTkxNDk2MjQwMH0.m0raHGfbQAMISP5sMQ7xade4B30IOk0qTfyiNEt1Mkg'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/announcements?id=eq.${id}`,
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
      throw new Error(`Failed to fetch announcement: ${errorText}`)
    }

    const rawData = await response.json()

    if (!rawData || rawData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      )
    }

    // Transform snake_case to camelCase for frontend
    const announcement = rawData[0]
    const data = {
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
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching announcement:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching announcement'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateAnnouncementInput = await request.json()

    // Build update object with snake_case keys
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.titleEn !== undefined) updateData.title_en = body.titleEn
    if (body.titleDe !== undefined) updateData.title_de = body.titleDe
    if (body.content !== undefined) updateData.content = body.content
    if (body.contentEn !== undefined) updateData.content_en = body.contentEn
    if (body.contentDe !== undefined) updateData.content_de = body.contentDe
    if (body.type !== undefined) updateData.type = body.type
    if (body.displayType !== undefined) updateData.display_type = body.displayType
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.isPublished !== undefined) updateData.is_published = body.isPublished
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder
    if (body.pages !== undefined) updateData.pages = body.pages
    if (body.theme !== undefined) updateData.theme = body.theme
    if (body.backgroundColor !== undefined) updateData.background_color = body.backgroundColor
    if (body.textColor !== undefined) updateData.text_color = body.textColor
    if (body.borderColor !== undefined) updateData.border_color = body.borderColor
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl
    if (body.imageAlt !== undefined) updateData.image_alt = body.imageAlt
    if (body.videoUrl !== undefined) updateData.video_url = body.videoUrl
    if (body.badgeText !== undefined) updateData.badge_text = body.badgeText
    if (body.badgeColor !== undefined) updateData.badge_color = body.badgeColor
    if (body.ctaText !== undefined) updateData.cta_text = body.ctaText
    if (body.ctaUrl !== undefined) updateData.cta_url = body.ctaUrl
    if (body.ctaButtonColor !== undefined) updateData.cta_button_color = body.ctaButtonColor
    if (body.startDate !== undefined) updateData.start_date = body.startDate
    if (body.endDate !== undefined) updateData.end_date = body.endDate
    if (body.isDismissible !== undefined) updateData.is_dismissible = body.isDismissible
    if (body.showOncePerSession !== undefined) updateData.show_once_per_session = body.showOncePerSession
    if (body.showOncePerDay !== undefined) updateData.show_once_per_day = body.showOncePerDay
    if (body.maxDisplaysPerUser !== undefined) updateData.max_displays_per_user = body.maxDisplaysPerUser

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/announcements?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update announcement: ${errorText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data[0] : data
    })

  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error updating announcement'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/announcements?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete announcement: ${errorText}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error deleting announcement'
      },
      { status: 500 }
    )
  }
}
