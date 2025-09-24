import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST endpoint for generating new reservation tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservationId, customerEmail } = body

    console.log('🔐 Generating new token for reservation:', reservationId, 'customer:', customerEmail)

    // Validate required fields
    if (!reservationId || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'reservationId and customerEmail are required' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = `rt_${uuidv4().replace(/-/g, '')}`

    // Set expiration to 2 hours before reservation time
    // First, get the reservation to know the time
    const reservationResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?select=date,time&id=eq.${reservationId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (!reservationResponse.ok) {
      throw new Error('Failed to get reservation details')
    }

    const reservations = await reservationResponse.json()
    const reservation = reservations?.[0]

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Calculate expiration (2 hours before reservation time)
    const reservationDateTime = new Date(reservation.time)
    const expirationDateTime = new Date(reservationDateTime.getTime() - (2 * 60 * 60 * 1000)) // 2 hours before

    // Create new token in database
    const tokenData = {
      id: `rt_${uuidv4()}`,
      reservation_id: reservationId,
      token: token,
      customer_email: customerEmail,
      expires: expirationDateTime.toISOString(),
      created_at: new Date().toISOString(),
      is_active: true,
      purpose: 'reservation_management'
    }

    const createResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservation_tokens`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(tokenData)
      }
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('❌ Create token failed:', createResponse.status, errorText)
      throw new Error(`Failed to create token: ${createResponse.status}`)
    }

    const createdToken = await createResponse.json()

    console.log('✅ Token generated successfully:', token.substring(0, 8) + '...', 'expires:', expirationDateTime.toISOString())

    return NextResponse.json({
      success: true,
      token: token,
      tokenId: createdToken[0]?.id,
      expires: expirationDateTime.toISOString(),
      reservationId: reservationId,
      customerEmail: customerEmail
    })

  } catch (error) {
    console.error('❌ Error generating token:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}