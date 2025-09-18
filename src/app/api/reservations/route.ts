import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { upsertCustomer, extractCustomerDataFromReservation } from '@/lib/customer-upsert'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const reservationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1), // REQUIRED in DB
  date: z.string(),
  time: z.string(),
  partySize: z.number().int().min(1).max(12),
  tableId: z.string(),
  occasion: z.string().nullable().optional(),
  dietaryNotes: z.string().nullable().optional(),
  specialRequests: z.string().nullable().optional(),
  preOrderItems: z.array(z.any()).optional(),
  preOrderTotal: z.number().optional(),
  // GDPR Compliance - Individual Consent Tracking
  dataProcessingConsent: z.boolean(),
  emailConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
  preferredLanguage: z.enum(['ES', 'EN', 'DE']).default('ES'),
  verification_token: z.string().optional() // Token for reservation management
})

// GET endpoint for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    
    const supabase = await createServiceClient()

    let query = supabase
      .schema('restaurante')
      .from('reservations')
      .select(`
        id,
        "customerName",
        "customerEmail",
        "customerPhone",
        "partySize",
        date,
        time,
        status,
        "specialRequests",
        "hasPreOrder",
        "tableId",
        "createdAt",
        "updatedAt"
      `)
      .order('date', { ascending: true })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase())
    }

    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      query = query
        .gte('date', targetDate.toISOString())
        .lt('date', nextDay.toISOString())
    } else if (!status || status === 'all') {
      // SMART FILTERING: Auto-hide old reservations ONLY when no specific status filter is applied
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today
      query = query.gte('date', today.toISOString())
    }
    // If status filter is applied, don't restrict by date to allow viewing completed reservations

    const { data: reservations, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error fetching reservations',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Get tables data separately
    const { data: tablesData, error: tablesError } = await supabase
      .schema('restaurante')
      .from('tables')
      .select('id, number, capacity, location')

    if (tablesError) {
      console.error('Tables error:', tablesError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error fetching tables data',
          details: tablesError.message
        },
        { status: 500 }
      )
    }

    // Create a map of tables for quick lookup
    const tablesMap = new Map()
    tablesData?.forEach(table => {
      tablesMap.set(table.id, table)
    })

    // Combine reservations with table data
    const enrichedReservations = reservations?.map(reservation => ({
      ...reservation,
      tables: tablesMap.get(reservation.tableId) || null
    })) || []

    // Get summary statistics
    const { data: summaryData, error: summaryError } = await supabase
      .schema('restaurante')
      .from('reservations')
      .select('status, "partySize"')

    let summary = {
      total: reservations?.length || 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalGuests: 0
    }

    if (summaryData && !summaryError) {
      summary = summaryData.reduce((acc, reservation) => {
        acc.totalGuests += reservation.partySize
        switch (reservation.status) {
          case 'PENDING':
            acc.pending++
            break
          case 'CONFIRMED':
            acc.confirmed++
            break
          case 'COMPLETED':
            acc.completed++
            break
          case 'CANCELLED':
            acc.cancelled++
            break
        }
        return acc
      }, {
        total: summaryData.length,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalGuests: 0
      })
    }

    return NextResponse.json({
      success: true,
      reservations: enrichedReservations,
      summary,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GET API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 FRONTEND PAYLOAD:', JSON.stringify(body, null, 2))

    const data = reservationSchema.parse(body)
    console.log('✅ Schema validation passed:', JSON.stringify(data, null, 2))

    const reservationDateTime = new Date(`${data.date}T${data.time}:00`)

    // 🚀 FIX: Use Supabase client instead of fetch
    const supabase = await createServiceClient()

    // Query REAL table from database using Supabase client
    console.log('🔍 Querying real table from database:', data.tableId)
    const { data: tables, error: tableError } = await supabase
      .schema('restaurante')
      .from('tables')
      .select('id,number,location,capacity,restaurantId')
      .eq('id', data.tableId)
      .eq('isActive', true)

    if (tableError) {
      console.error('❌ Failed to query table:', tableError)
      return NextResponse.json(
        { success: false, error: 'Failed to validate table' },
        { status: 500 }
      )
    }

    console.log('📊 Real table query result:', JSON.stringify(tables, null, 2))

    if (!tables || tables.length === 0) {
      console.error('❌ Table not found in database:', data.tableId)
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 400 }
      )
    }

    const table = tables[0]
    console.log('✅ Using REAL table:', JSON.stringify(table, null, 2))

    // Check for conflicts
    const conflictsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?select=*&tableId=eq.${data.tableId}&date=gte.${data.date}T00:00:00&date=lte.${data.date}T23:59:59&status=in.(PENDING,CONFIRMED,SEATED)`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (conflictsResponse.ok) {
      const existingReservations = await conflictsResponse.json()
      const hasConflict = existingReservations.some((res: any) => {
        const resTime = new Date(res.time)
        const timeDiff = Math.abs(reservationDateTime.getTime() - resTime.getTime())
        return timeDiff < (150 * 60000) // 2.5 hours buffer
      })

      if (hasConflict) {
        return NextResponse.json(
          { success: false, error: 'Table not available at this time' },
          { status: 409 }
        )
      }
    }

    // Página pública - AUTO-CREAR CLIENTE si no existe (deduplicación por email)
    console.log('🔄 Starting customer upsert process...')
    
    try {
      // Extract customer data from reservation form
      const customerData = extractCustomerDataFromReservation(data, {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      })
      
      // Upsert customer (create if not exists, return existing if found)
      const { customerId, isNewCustomer, customer } = await upsertCustomer(customerData)
      
      console.log(`✅ Customer upsert successful: ${isNewCustomer ? 'NEW' : 'EXISTING'} customer ID ${customerId}`)
      
      // Create reservation with linked customer ID
    // 🚀 FIX: Create reservation using Supabase client
    const reservationPayload = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: data.email,
      customerPhone: data.phone,
      partySize: data.partySize,
      date: reservationDateTime.toISOString(),
      time: reservationDateTime.toISOString(),
      status: 'PENDING',
      specialRequests: data.specialRequests || null,
      hasPreOrder: (data.preOrderItems?.length || 0) > 0,
      tableId: data.tableId,
      restaurantId: tables[0].restaurantId,
      // Basic professional fields
      occasion: data.occasion || null,
      dietaryNotes: data.dietaryNotes || null,
      // Language preference
      preferredLanguage: data.preferredLanguage || 'ES',
      // 🚀 FIX: Required timestamp fields
      updatedAt: new Date().toISOString()
    }

    const { data: reservations, error: reservationError } = await supabase
      .schema('restaurante')
      .from('reservations')
      .insert(reservationPayload)
      .select()

    if (reservationError) {
      console.error('🚨 Supabase reservation creation failed:', reservationError)
      console.error('Request payload was:', JSON.stringify(reservationPayload, null, 2))

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create reservation in database',
          details: reservationError.message
        },
        { status: 400 }
      )
    }

    const reservation = reservations[0]

    // 🚀 CRITICAL FIX: Create reservation_items if preOrderItems exist
    if (data.preOrderItems && data.preOrderItems.length > 0) {
      console.log('🍽️ Creating reservation items:', data.preOrderItems.length, 'items')

      // Create reservation_items for each pre-ordered item
      const reservationItems = data.preOrderItems.map((item: any) => ({
        id: `resitem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        reservationId: reservation.id,
        menuItemId: item.id, // menuItemId from the cart item
        quantity: item.quantity,
        notes: item.notes || null
      }))

      console.log('🔍 DEBUG - reservation items payload:', JSON.stringify(reservationItems, null, 2))

      // 🚀 FIX: Use Supabase client for reservation_items - NO SILENCIAR ERRORES
      const { data: createdItems, error: itemsError } = await supabase
        .schema('restaurante')
        .from('reservation_items')
        .insert(reservationItems)
        .select()

      if (itemsError) {
        console.error('🚨 CRITICAL: Failed to create reservation items:', itemsError)
        console.error('🚨 Items payload was:', JSON.stringify(reservationItems, null, 2))

        // 🚀 CRITICAL: DO NOT CONTINUE - FAIL THE ENTIRE RESERVATION
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create reservation items',
            details: itemsError.message
          },
          { status: 500 }
        )
      } else {
        console.log('✅ Reservation items created successfully:', createdItems.length, 'items')
      }
    }

    // 🚀 CRITICAL SECURITY FIX: Create verification token in proper table
    console.log('🔍 DEBUG - verification_token exists?', !!data.verification_token, 'value:', data.verification_token)
    if (data.verification_token) {
      console.log('🔐 Creating verification token:', data.verification_token)

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7) // 7 days expiry

      const tokenPayload = {
        reservation_id: reservation.id,
        token: data.verification_token,
        customer_email: data.email,
        expires: expiryDate.toISOString(),
        purpose: 'reservation_management'
      }

      console.log('🔍 DEBUG - token payload:', JSON.stringify(tokenPayload, null, 2))

      // 🚀 FIX: Use proper reservation_tokens table - NO SILENCIAR ERRORES
      const { data: createdToken, error: tokenError } = await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .insert(tokenPayload)
        .select()

      if (tokenError) {
        console.error('🚨 CRITICAL: Failed to create verification token:', tokenError)
        console.error('🚨 Token payload was:', JSON.stringify(tokenPayload, null, 2))

        // 🚀 CRITICAL: DO NOT CONTINUE - FAIL THE ENTIRE RESERVATION
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create verification token',
            details: tokenError.message
          },
          { status: 500 }
        )
      } else {
        console.log('✅ Verification token created successfully:', createdToken[0]?.token)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reservation: {
          id: reservation.id,
          customerName: reservation.customerName,
          date: reservation.date,
          time: reservation.time,
          partySize: reservation.partySize,
          status: reservation.status,
          table: {
            number: table.number,
            location: table.location
          }
        },
        customer: {
          id: customerId,
          isNew: isNewCustomer
        },
        message: 'Reserva creada exitosamente. Te contactaremos pronto para confirmar.'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })

    } catch (upsertError) {
      console.error('❌ Customer upsert failed:', upsertError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process customer data', 
          details: upsertError instanceof Error ? upsertError.message : 'Unknown upsert error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('🚨 API ERROR DETAILED:', error)
    console.error('🚨 ERROR STACK:', error instanceof Error ? error.stack : error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid reservation data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH endpoint for updating reservation status (admin dashboard)
export async function PATCH(request: NextRequest) {
  try {
    const { reservationId, status, notes } = await request.json()

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

    const supabase = await createServiceClient()

    // Update reservation status
    const { data: updatedReservation, error } = await supabase
      .schema('restaurante')
      .from('reservations')
      .update({
        status: status,
        updatedAt: new Date().toISOString(),
        ...(notes && { specialRequests: notes })
      })
      .eq('id', reservationId)
      .select()
      .single()

    if (error) {
      console.error('❌ Update reservation status error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update reservation status' },
        { status: 500 }
      )
    }

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
    console.error('Error updating reservation status:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to update reservation status' },
      { status: 500 }
    )
  }
}