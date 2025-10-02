import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

// Query parameters validation - simplified
const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

const parseQueryParams = (searchParams: URLSearchParams) => {
  const status = searchParams.get('status')
  const limitStr = searchParams.get('limit')
  const offsetStr = searchParams.get('offset')
  const includeItemsStr = searchParams.get('includeItems')

  // Validate status
  const validStatus = status && VALID_STATUSES.includes(status) ? status : undefined

  // Parse numbers with validation
  const limit = limitStr ? Math.max(1, Math.min(100, parseInt(limitStr, 10) || 20)) : 20
  const offset = offsetStr ? Math.max(0, parseInt(offsetStr, 10) || 0) : 0
  const includeItems = includeItemsStr === 'true'

  return { status: validStatus, limit, offset, includeItems }
}

// GET customer reservations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { status, limit, offset, includeItems } = parseQueryParams(searchParams)

    const supabase = await createServiceClient()
    const customerId = (await params).id

    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, email')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      console.error('Customer not found:', customerError)
      return NextResponse.json(
        { success: false, error: 'Customer not found', details: customerError?.message },
        { status: 404 }
      )
    }

    // Build reservations query using customerId relation
    let reservationsQuery = supabase
      .from('reservations')
      .select(`
        id,
        customerName,
        customerEmail,
        customerPhone,
        partySize,
        date,
        time,
        status,
        specialRequests,
        occasion,
        dietaryNotes,
        preferredLanguage,
        hasPreOrder,
        tableId,
        restaurantId,
        marketingConsent,
        consentDataProcessing,
        consentEmail,
        consentMarketing,
        consentDataProcessingTimestamp,
        consentEmailTimestamp,
        consentMarketingTimestamp,
        consentIpAddress,
        consentUserAgent,
        gdprPolicyVersion,
        consentMethod,
        customerId,
        createdAt,
        updatedAt
        ${includeItems ? `, reservation_items(
          id,
          quantity,
          notes,
          menuItemId,
          menu_items(
            id,
            name,
            price,
            categoryId,
            menu_categories(
              name,
              type
            )
          )
        )` : ''}
      `)
      .eq('customerId', customerId)
      .order('date', { ascending: false })

    // Apply status filter if provided
    if (status) {
      reservationsQuery = reservationsQuery.eq('status', status)
    }

    // Apply pagination
    reservationsQuery = reservationsQuery.range(offset, offset + limit - 1)

    const { data: reservations, error: reservationsError } = await reservationsQuery

    if (reservationsError) {
      console.error('Reservations query error:', reservationsError)
      return NextResponse.json(
        {
          success: false,
          error: 'Error fetching reservations',
          details: reservationsError.message
        },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('reservations')
      .select('id', { count: 'exact' })
      .eq('customerId', customerId)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.warn('Count query error:', countError)
    }

    // Calculate stats from ALL reservations (not just paginated results)
    const { data: allReservations } = await supabase
      .from('reservations')
      .select('status, date, time')
      .eq('customerId', customerId)

    const stats = {
      total: count || 0,
      completed: allReservations?.filter(r => r.status === 'COMPLETED').length || 0,
      upcoming: allReservations?.filter(r =>
        new Date(r.time) > new Date() && ['PENDING', 'CONFIRMED'].includes(r.status)
      ).length || 0,
      cancelled: allReservations?.filter(r => ['CANCELLED', 'NO_SHOW'].includes(r.status)).length || 0,
      confirmed: allReservations?.filter(r => r.status === 'CONFIRMED').length || 0,
      pending: allReservations?.filter(r => r.status === 'PENDING').length || 0,
      noShow: allReservations?.filter(r => r.status === 'NO_SHOW').length || 0
    }

    return NextResponse.json({
      success: true,
      reservations: reservations || [],
      stats,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('GET reservations error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new reservation for customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const supabase = await createServiceClient()
    const customerId = (await params).id

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('email, firstName, lastName, phone')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    const {
      date,
      time,
      partySize,
      specialRequests,
      occasion,
      tableId
    } = body

    if (!date || !time || !partySize) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date, time, partySize' },
        { status: 400 }
      )
    }

    // Create reservation
    const { data: newReservation, error: insertError } = await supabase
      .from('reservations')
      .insert({
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customerPhone: customer.phone || '',
        partySize: parseInt(partySize),
        date,
        time,
        status: 'PENDING',
        specialRequests,
        occasion,
        preferredLanguage: 'ES',
        hasPreOrder: false,
        isConfirmed: false,
        source: 'WEBSITE',
        tableId,
        restaurantId: 'default' // TODO: Get from config
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating reservation:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create reservation',
          details: insertError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation: newReservation,
      message: 'Reservation created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST reservation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}