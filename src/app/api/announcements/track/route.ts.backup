import { NextResponse } from 'next/server'
import type { InteractionType } from '@/types/announcements'

const SUPABASE_URL = 'https://supabase.enigmaconalma.com'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NTcxOTYwMDAsImV4cCI6MTkxNDk2MjQwMH0.m0raHGfbQAMISP5sMQ7xade4B30IOk0qTfyiNEt1Mkg'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { announcementId, interactionType, pageUrl } = body

    if (!announcementId || !interactionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user agent and IP from headers
    const userAgent = request.headers.get('user-agent') || undefined
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : undefined

    // Create interaction record
    const interactionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/announcement_interactions`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({
          announcement_id: announcementId,
          interaction_type: interactionType,
          page_url: pageUrl,
          user_agent: userAgent,
          ip_address: ipAddress
        })
      }
    )

    if (!interactionResponse.ok) {
      const errorText = await interactionResponse.text()
      console.error('Failed to create interaction:', errorText)
    }

    // Update counters on announcement
    let counterField = ''
    if (interactionType === 'view') counterField = 'views_count'
    else if (interactionType === 'click') counterField = 'clicks_count'
    else if (interactionType === 'conversion') counterField = 'conversion_count'

    if (counterField) {
      // First get current value
      const getResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/announcements?id=eq.${announcementId}&select=${counterField}`,
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

      if (getResponse.ok) {
        const data = await getResponse.json()
        const currentCount = data[0]?.[counterField] || 0

        // Increment counter
        await fetch(
          `${SUPABASE_URL}/rest/v1/announcements?id=eq.${announcementId}`,
          {
            method: 'PATCH',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante',
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'apikey': SUPABASE_KEY,
            },
            body: JSON.stringify({
              [counterField]: currentCount + 1
            })
          }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully'
    })

  } catch (error) {
    console.error('Error tracking interaction:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error tracking interaction'
      },
      { status: 500 }
    )
  }
}
