import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// PATCH endpoint for updating reservation status by ID (admin dashboard)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params
    const body = await request.json()
    const { status, notes, ...additionalData } = body

    console.log('🔄 Updating reservation:', reservationId, 'to status:', status)

    // Validate required fields
    if (!reservationId || !status) {
      return NextResponse.json(
        { success: false, error: 'reservationId and status are required' },
        { status: 400 }
      )
    }

    // Validate status values
    const validStatuses = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update reservation using direct fetch to avoid Supabase client headers issues
    const updateData = {
      status: status,
      updatedAt: new Date().toISOString(),
      ...(notes && { specialRequests: notes }),
      ...additionalData
    }

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservationId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    )

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error('❌ Update reservation failed:', updateResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: 'Failed to update reservation status' },
        { status: 500 }
      )
    }

    const updatedReservations = await updateResponse.json()
    const updatedReservation = updatedReservations?.[0]

    if (!updatedReservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      )
    }

    console.log('✅ Reservation status updated:', reservationId, 'to', status)

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      message: 'Reservation status updated successfully'
    })

  } catch (error) {
    console.error('❌ Error updating reservation status:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to update reservation status' },
      { status: 500 }
    )
  }
}

// GET endpoint for fetching single reservation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params

    if (!reservationId) {
      return NextResponse.json(
        { success: false, error: 'Reservation ID is required' },
        { status: 400 }
      )
    }

    // Get reservation using direct fetch
    const getResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?select=id,customerName,customerEmail,customerPhone,partySize,date,time,status,specialRequests,hasPreOrder,tableId,createdAt,updatedAt&id=eq.${reservationId}`,
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

    if (!getResponse.ok) {
      const errorText = await getResponse.text()
      console.error('❌ Get reservation failed:', getResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reservation' },
        { status: 500 }
      )
    }

    const reservations = await getResponse.json()
    const reservation = reservations?.[0]

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Get reservation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}