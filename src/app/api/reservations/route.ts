import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createDirectAdminClient } from '@/lib/supabase/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Get dynamic configuration from business_hours table
 */
async function getReservationConfig(): Promise<{ maxPartySize: number; bufferMinutes: number }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/business_hours?select=max_party_size,buffer_minutes&is_open=eq.true&limit=1`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        return {
          maxPartySize: data[0].max_party_size || 10,
          bufferMinutes: data[0].buffer_minutes || 150
        }
      }
    }
  } catch (error) {
    console.warn('Error fetching reservation config, using defaults:', error)
  }

  return { maxPartySize: 10, bufferMinutes: 150 }
}

/**
 * Validate time slot against business hours
 */
async function validateTimeSlot(date: string, time: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/business_hours?select=*&is_open=eq.true`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (response.ok) {
      const businessHours = await response.json()
      if (businessHours && businessHours.length > 0) {
        const dayOfWeek = new Date(date).getDay()

        const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek)
        if (!dayHours) {
          return { valid: false, reason: 'Restaurante cerrado este día' }
        }

        if (time < dayHours.open_time || time > dayHours.close_time) {
          return { valid: false, reason: `Horario disponible: ${dayHours.open_time} - ${dayHours.close_time}` }
        }
      }
    }
  } catch (error) {
    console.warn('Error validating time slot:', error)
  }

  return { valid: true }
}

function createReservationSchema(maxPartySize: number) {
  return z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    date: z.string(),
    time: z.string(),
    partySize: z.number().int().min(1).max(maxPartySize),
    tableIds: z.array(z.string()).min(1), // ✅ NEW: Array of table IDs
    occasion: z.string().nullable().optional(),
    dietaryNotes: z.string().nullable().optional(),
    specialRequests: z.string().nullable().optional(),
    preOrderItems: z.array(z.any()).optional(),
    preOrderTotal: z.number().optional(),
    // GDPR Compliance
    dataProcessingConsent: z.boolean(),
    emailConsent: z.boolean().default(false),
    marketingConsent: z.boolean().default(false),
    preferredLanguage: z.enum(['ES', 'EN', 'DE']).default('ES')
  })
}

// GET endpoint for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    let query = `${SUPABASE_URL}/rest/v1/reservations?select=*,customers(*),reservation_items(*,menu_items(*,menu_categories(*)))`

    if (status && status !== 'all') {
      query += `&status=eq.${status}`
    }

    if (date) {
      query += `&date=gte.${date}T00:00:00&date=lte.${date}T23:59:59`
    }

    query += '&order=date.desc,time.desc'

    const response = await fetch(query, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reservations = await response.json()

    // 🚀 LOOKUP DE MESAS: Resolver table_ids[] → información completa de mesas
    if (reservations && reservations.length > 0) {
      // 1. Extraer todos los table_ids únicos
      const allTableIds = new Set<string>()
      reservations.forEach((reservation: any) => {
        if (reservation.table_ids && Array.isArray(reservation.table_ids)) {
          reservation.table_ids.forEach((id: string) => allTableIds.add(id))
        }
        // Legacy compatibility
        if (reservation.tableId) {
          allTableIds.add(reservation.tableId)
        }
      })

      // 2. Obtener información completa de todas las mesas necesarias
      let tablesData: any[] = []
      if (allTableIds.size > 0) {
        const tablesQuery = `${SUPABASE_URL}/rest/v1/tables?select=id,number,location,capacity&id=in.(${Array.from(allTableIds).join(',')})`
        const tablesResponse = await fetch(tablesQuery, {
          headers: {
            'Accept': 'application/json',
            'Accept-Profile': 'restaurante',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
          }
        })

        if (tablesResponse.ok) {
          tablesData = await tablesResponse.json()
        }
      }

      // 3. Crear un mapa de ID → mesa para lookup rápido
      const tablesMap = new Map(tablesData.map(table => [table.id, table]))

      // 4. Agregar campo 'tables' a cada reserva
      reservations.forEach((reservation: any) => {
        const reservationTables: any[] = []

        // Priorizar table_ids array, fallback a tableId legacy (NO DUPLICAR)
        if (reservation.table_ids && Array.isArray(reservation.table_ids) && reservation.table_ids.length > 0) {
          // Nuevas reservas con múltiples mesas
          reservation.table_ids.forEach((tableId: string) => {
            const table = tablesMap.get(tableId)
            if (table) reservationTables.push(table)
          })
        } else if (reservation.tableId) {
          // Legacy compatibility - reservas con tableId singular SOLO si NO hay table_ids
          const table = tablesMap.get(reservation.tableId)
          if (table) reservationTables.push(table)
        }

        reservation.tables = reservationTables

        // 🔧 FRONTEND COMPATIBILITY: Add tableIds array for form initialization
        if (reservation.table_ids && Array.isArray(reservation.table_ids) && reservation.table_ids.length > 0) {
          reservation.tableIds = reservation.table_ids  // Modern: use table_ids from DB
        } else if (reservation.tableId) {
          reservation.tableIds = [reservation.tableId]  // Legacy: convert single tableId to array
        } else {
          reservation.tableIds = []                     // Fallback: empty array
        }
      })
    }

    return NextResponse.json({
      success: true,
      reservations: reservations || []
    })

  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get dynamic configuration
    const { maxPartySize, bufferMinutes } = await getReservationConfig()
    console.log(`🔧 Dynamic Config: maxPartySize=${maxPartySize}, bufferMinutes=${bufferMinutes}`)

    const body = await request.json()
    console.log('🔍 FRONTEND PAYLOAD:', JSON.stringify(body, null, 2))

    // Validate request
    const reservationSchema = createReservationSchema(maxPartySize)
    let data;
    try {
      data = reservationSchema.parse(body)
      console.log('✅ Schema validation passed:', JSON.stringify(data, null, 2))
    } catch (zodError) {
      console.error('💥 ZOD VALIDATION ERROR:', zodError.errors || zodError)
      console.error('💥 Failed payload:', JSON.stringify(body, null, 2))
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: zodError.errors || zodError.message
      }, { status: 400 })
    }

    // Validate time slot
    const timeSlotValidation = await validateTimeSlot(data.date, data.time)
    if (!timeSlotValidation.valid) {
      console.error('❌ Invalid time slot:', timeSlotValidation.reason)
      return NextResponse.json({
        success: false,
        error: 'Horario no disponible',
        details: timeSlotValidation.reason
      }, { status: 400 })
    }
    console.log('✅ Time slot validation passed:', `${data.date} ${data.time}`)

    // Create proper Spain timezone datetime
    const spainTimeString = `${data.date}T${data.time}:00+02:00`
    const utcDate = new Date(spainTimeString)
    const reservationDateTime = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000))

    console.log('🕐 User input:', `${data.date}T${data.time}:00 (Spain time)`)
    console.log('🚀 UTC converted:', utcDate.toISOString())
    console.log('🇪🇸 Spain local stored:', reservationDateTime.toISOString())

    const supabase = createDirectAdminClient()

    // ✅ NEW: Validate all table IDs exist and are active
    console.log('🔍 Validating table IDs:', data.tableIds)

    const { data: tables, error: tablesError } = await supabase
      .schema('restaurante')
      .from('tables')
      .select('id,number,location,capacity,restaurantId')
      .in('id', data.tableIds)
      .eq('isActive', true)

    if (tablesError || !tables || tables.length !== data.tableIds.length) {
      console.error('❌ Invalid or inactive tables:', data.tableIds)
      return NextResponse.json({
        success: false,
        error: 'One or more selected tables are not available'
      }, { status: 400 })
    }

    const validatedTableNames = tables.map(t => `${t.number}(${t.id})`).join(', ')
    console.log('✅ Validated tables:', validatedTableNames)

    // ✅ NEW: Validate total capacity vs party size
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0)
    console.log(`🔍 Capacity validation: ${data.partySize} people vs ${totalCapacity} total capacity`)

    if (totalCapacity < data.partySize) {
      console.error(`❌ Insufficient capacity: need ${data.partySize}, have ${totalCapacity}`)
      return NextResponse.json({
        success: false,
        error: `Selected tables have capacity for ${totalCapacity} people, but you need ${data.partySize} seats. Please select additional tables.`
      }, { status: 400 })
    }

    console.log('✅ Capacity validation passed')

    // Check for table conflicts
    console.log('🔍 Checking conflicts for validated tables...')

    const { data: existingReservations, error: conflictError } = await supabase
      .schema('restaurante')
      .from('reservations')
      .select('id,table_ids,tableId,time,status')
      .gte('date', `${data.date}T00:00:00`)
      .lte('date', `${data.date}T23:59:59`)
      .in('status', ['PENDING', 'CONFIRMED', 'SEATED'])

    if (conflictError) {
      console.error('❌ Error checking conflicts:', conflictError)
      return NextResponse.json({
        success: false,
        error: 'Error checking table availability'
      }, { status: 500 })
    }

    // Check for time conflicts
    for (const reservation of existingReservations || []) {
      const resDateTime = new Date(reservation.time)
      const timeDiff = Math.abs(reservationDateTime.getTime() - resDateTime.getTime())

      if (timeDiff < (bufferMinutes * 60000)) {
        // Check if any of our tables conflict
        const reservedTables = new Set<string>()

        if (reservation.table_ids && Array.isArray(reservation.table_ids)) {
          reservation.table_ids.forEach((id: string) => reservedTables.add(id))
        }
        if (reservation.tableId) {
          reservedTables.add(reservation.tableId)
        }

        const hasConflict = data.tableIds.some(id => reservedTables.has(id))
        if (hasConflict) {
          console.error('❌ Table conflict detected:', { conflictingTables: Array.from(reservedTables) })
          return NextResponse.json({
            success: false,
            error: 'One or more selected tables are already reserved for this time slot'
          }, { status: 400 })
        }
      }
    }

    console.log('✅ All tables available - no conflicts detected')

    // Create/update customer
    console.log('🔄 Starting customer upsert process...')

    const customerData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      language: data.preferredLanguage,
      dataProcessingConsent: data.dataProcessingConsent,
      emailConsent: data.emailConsent,
      marketingConsent: data.marketingConsent,
      consentIpAddress: '::1', // Get from request headers in production
      consentUserAgent: request.headers.get('user-agent') || 'unknown',
      gdprPolicyVersion: 'v1.0',
      consentMethod: 'web_form'
    }

    console.log('✅ EXTRACTED CUSTOMER DATA:', customerData)

    const { data: customer, error: customerError } = await supabase
      .schema('restaurante')
      .from('customers')
      .upsert(customerData, { onConflict: 'email' })
      .select()
      .single()

    if (customerError || !customer) {
      console.error('❌ Customer upsert failed:', customerError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create customer record'
      }, { status: 500 })
    }

    console.log('✅ Customer upsert successful:', customer.id)

    // Create reservation with table_ids array
    console.log('🆕 Creating reservation...')

    const reservationData = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // ✅ Generate ID
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: data.email,
      customerPhone: data.phone,
      partySize: data.partySize,
      date: reservationDateTime,
      time: reservationDateTime,
      status: 'PENDING',
      specialRequests: data.specialRequests || null,
      hasPreOrder: (data.preOrderItems?.length || 0) > 0,
      table_ids: data.tableIds, // ✅ NEW: Use array
      tableId: data.tableIds[0], // Legacy compatibility (use first table)
      restaurantId: 'rest_enigma_001',
      occasion: data.occasion || null,
      dietaryNotes: data.dietaryNotes || null,
      marketingConsent: data.marketingConsent,
      preferredLanguage: data.preferredLanguage,
      consentDataProcessing: data.dataProcessingConsent,
      consentDataProcessingTimestamp: new Date(),
      consentEmail: data.emailConsent,
      consentEmailTimestamp: data.emailConsent ? new Date() : null,
      consentMarketing: data.marketingConsent,
      consentMarketingTimestamp: data.marketingConsent ? new Date() : null,
      consentIpAddress: '::1',
      consentUserAgent: request.headers.get('user-agent') || 'unknown',
      gdprPolicyVersion: 'v1.0',
      consentMethod: 'web_form',
      customerId: customer.id,
      updatedAt: new Date() // ✅ Add missing updatedAt
    }

    const { data: reservation, error: reservationError } = await supabase
      .schema('restaurante')
      .from('reservations')
      .insert(reservationData)
      .select()
      .single()

    if (reservationError || !reservation) {
      console.error('❌ Reservation creation failed:', reservationError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create reservation'
      }, { status: 500 })
    }

    console.log('✅ Reservation created:', reservation.id)

    // ✅ FIXED: Save preOrderItems to reservation_items table
    if (data.preOrderItems && data.preOrderItems.length > 0) {
      console.log(`🛒 Saving ${data.preOrderItems.length} pre-order items...`)

      const reservationItems = data.preOrderItems.map((item: any) => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reservationId: reservation.id,
        menuItemId: item.id,
        quantity: item.quantity,
        notes: item.notes || null
      }))

      const { data: savedItems, error: itemsError } = await supabase
        .schema('restaurante')
        .from('reservation_items')
        .insert(reservationItems)
        .select()

      if (itemsError) {
        console.error('❌ Error saving pre-order items:', itemsError)
        // Non-critical - reservation already created, continue
      } else {
        console.log(`✅ Saved ${savedItems?.length || 0} pre-order items`)
      }
    }

    // ✅ CRITICAL: Generate reservation token using real system API
    let reservationToken = null
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host') || 'localhost:3000'}`
      const tokenResponse = await fetch(`${baseUrl}/api/reservations/token/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          customerEmail: data.email
        })
      })

      if (tokenResponse.ok) {
        const tokenResult = await tokenResponse.json()
        reservationToken = tokenResult.token
        console.log('✅ Token generated via real API:', tokenResult.token?.substring(0, 8) + '...')
      } else {
        console.error('⚠️ Token generation failed (non-critical):', await tokenResponse.text())
      }
    } catch (tokenError) {
      console.error('⚠️ Token generation error (non-critical):', tokenError)
    }

    // ✅ FIXED: Send confirmation email using implemented email service
    try {
      const { emailService } = await import('@/lib/email/emailService')
      const emailResult = await emailService.sendReservationConfirmation({
        reservationId: reservation.id,
        customerEmail: data.email,
        customerName: `${data.firstName} ${data.lastName}`,
        reservationDate: new Date(reservationDateTime).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        reservationTime: new Date(reservationDateTime).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        partySize: data.partySize,
        tableNumber: tables.map(t => t.number).join(', '),
        tableLocation: tables[0]?.location || 'Por asignar',
        specialRequests: data.specialRequests || '',
        preOrderItems: data.preOrderItems || [],
        preOrderTotal: data.preOrderTotal || 0,
        tokenUrl: reservationToken ? `${process.env.NEXT_PUBLIC_APP_URL}/mi-reserva?token=${reservationToken}` : undefined
      })
      console.log('📧 Email confirmation result:', emailResult)
    } catch (emailError) {
      console.error('⚠️ Email sending failed (non-critical):', emailError)
    }

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        customerName: reservation.customerName,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        tables: validatedTableNames,
        status: reservation.status
      },
      token: reservationToken, // ✅ CRITICAL: Token for client modifications
      message: 'Reserva creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating reservation:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}