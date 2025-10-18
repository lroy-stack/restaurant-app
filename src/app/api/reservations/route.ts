import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createDirectAdminClient } from '@/lib/supabase/server'
import { buildTokenUrl } from '@/lib/email/config/emailConfig'
import { v4 as uuidv4 } from 'uuid'

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

        // DUAL SHIFT VALIDATION: Check both lunch and dinner services
        let isValidTime = false
        const availableHours = []

        // Check lunch service (if enabled)
        if (dayHours.lunch_enabled && dayHours.lunch_open_time && dayHours.lunch_close_time) {
          if (time >= dayHours.lunch_open_time && time <= dayHours.lunch_last_reservation_time) {
            isValidTime = true
          }
          availableHours.push(`${dayHours.lunch_open_time}-${dayHours.lunch_close_time}`)
        }

        // Check dinner service (if restaurant is open)
        if (dayHours.is_open && dayHours.open_time && dayHours.close_time) {
          if (time >= dayHours.open_time && time <= dayHours.last_reservation_time) {
            isValidTime = true
          }
          availableHours.push(`${dayHours.open_time}-${dayHours.close_time}`)
        }

        if (!isValidTime) {
          const hoursDisplay = availableHours.length > 0
            ? availableHours.join(' y ')
            : 'Restaurante cerrado'
          return { valid: false, reason: `Horario disponible: ${hoursDisplay}` }
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
    email: z.string().optional().refine(val => !val || val.length === 0 || z.string().email().safeParse(val).success, "Email inválido si se proporciona"),
    phone: z.string().min(1),
    date: z.string(),
    time: z.string(),
    partySize: z.number().int().min(1).max(maxPartySize),
    childrenCount: z.number().int().min(0).optional().nullable(), // ✅ FIX: Validate children count
    tableIds: z.array(z.string()).default([]), // ✅ UPDATED: Opcional - staff asigna mesas
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

    // Date filtering logic: by default show from today + next 30 days
    if (date) {
      // Explicit date filter - show only that specific date
      query += `&date=gte.${date}T00:00:00&date=lte.${date}T23:59:59`
    } else {
      // ✅ FIX: Default filter shows next 30 days (not just until Sunday)
      const today = new Date()
      const next30Days = new Date(today)
      next30Days.setDate(today.getDate() + 30)

      const todayStr = today.toISOString().split('T')[0]
      const next30DaysStr = next30Days.toISOString().split('T')[0]

      query += `&date=gte.${todayStr}T00:00:00&date=lte.${next30DaysStr}T23:59:59`
    }

    query += '&order=date.asc,time.asc'

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

        // ✅ FIX: Map children_count (snake_case DB) → childrenCount (camelCase frontend)
        if (reservation.children_count !== undefined && reservation.children_count !== null) {
          reservation.childrenCount = reservation.children_count
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

    // Create proper Spain timezone datetime (sin suma adicional - DB ya maneja timezone)
    const spainTimeString = `${data.date}T${data.time}:00`
    const reservationDateTime = new Date(spainTimeString)

    console.log('🕐 User input:', `${data.date}T${data.time}:00 (Spain time)`)
    console.log('🇪🇸 Spain local stored:', reservationDateTime.toISOString())

    const supabase = createDirectAdminClient()

    // ✅ DYNAMIC VALIDATION: Only validate tables if they are provided
    let tables: any[] = []
    let validatedTableNames = 'Staff will assign'

    if (data.tableIds && data.tableIds.length > 0) {
      console.log('🔍 Validating provided table IDs:', data.tableIds)

      const { data: fetchedTables, error: tablesError } = await supabase
        .schema('restaurante')
        .from('tables')
        .select('id,number,location,capacity,restaurantId')
        .in('id', data.tableIds)
        .eq('isActive', true)

      if (tablesError || !fetchedTables || fetchedTables.length !== data.tableIds.length) {
        console.error('❌ Invalid or inactive tables:', data.tableIds)
        return NextResponse.json({
          success: false,
          error: 'One or more selected tables are not available'
        }, { status: 400 })
      }

      tables = fetchedTables
      validatedTableNames = tables.map(t => `${t.number}(${t.id})`).join(', ')
      console.log('✅ Validated tables:', validatedTableNames)

      // ✅ Validate total capacity vs party size
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
    } else {
      console.log('ℹ️  No tables provided - staff will assign later')
    }

    // Check for table conflicts (only if tables are provided)
    if (data.tableIds && data.tableIds.length > 0) {
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
    } else {
      console.log('ℹ️  Skipping table conflict check - no tables assigned yet')
    }

    // Create/update customer with SMART IDENTIFICATION
    console.log('🔄 Starting customer upsert process...')

    // ✅ Generate placeholder email if not provided (for admin manual reservations)
    const hasRealEmail = data.email && data.email.trim().length > 0
    const finalEmail = hasRealEmail
      ? data.email
      : `${data.phone.replace(/[^0-9]/g, '')}@local` // Unique email based on phone

    console.log('📧 Email handling:', hasRealEmail ? 'Real email provided' : `Generated placeholder: ${finalEmail}`)

    // 🎯 SMART LOOKUP: Find existing customer by phone first, then email
    console.log('🔍 Smart lookup: Searching by phone first...')
    const { data: existingByPhone } = await supabase
      .schema('restaurante')
      .from('customers')
      .select('*')
      .eq('phone', data.phone)
      .maybeSingle()

    let customer = null

    if (existingByPhone) {
      console.log(`✅ Found existing customer by phone: ${existingByPhone.id}`)

      // Update existing customer (merge data)
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        language: data.preferredLanguage,
        dataProcessingConsent: data.dataProcessingConsent,
        emailConsent: data.emailConsent,
        marketingConsent: data.marketingConsent,
      }

      // 🎯 CRITICAL: Only update email if we have a REAL email (not placeholder)
      if (hasRealEmail) {
        console.log('📧 Upgrading placeholder email to real email:', finalEmail)
        updateData.email = finalEmail
      }

      const { data: updated, error: updateError } = await supabase
        .schema('restaurante')
        .from('customers')
        .update(updateData)
        .eq('id', existingByPhone.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Customer update failed:', updateError)
        return NextResponse.json({
          success: false,
          error: 'Failed to update customer record'
        }, { status: 500 })
      }

      customer = updated
      console.log('✅ Customer updated successfully')
    } else {
      console.log('🆕 No existing customer found, creating new...')

      const customerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: finalEmail,
        phone: data.phone,
        language: data.preferredLanguage,
        dataProcessingConsent: data.dataProcessingConsent,
        emailConsent: data.emailConsent,
        marketingConsent: data.marketingConsent,
        consentIpAddress: '::1',
        consentUserAgent: request.headers.get('user-agent') || 'unknown',
        gdprPolicyVersion: 'v1.0',
        consentMethod: 'web_form'
      }

      const { data: created, error: createError } = await supabase
        .schema('restaurante')
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (createError) {
        console.error('❌ Customer creation failed:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create customer record'
        }, { status: 500 })
      }

      customer = created
      console.log('✅ New customer created:', customer.id)
    }

    if (!customer) {
      console.error('❌ Customer operation returned null')
      return NextResponse.json({
        success: false,
        error: 'Failed to create customer record'
      }, { status: 500 })
    }

    console.log('✅ Customer process completed:', customer.id)

    // Create reservation with table_ids array
    console.log('🆕 Creating reservation...')

    // 🎯 AUTO-CONFIRM if source is admin
    const reservationStatus = body.source === 'admin' ? 'CONFIRMED' : 'PENDING'
    console.log(`📝 Reservation status: ${reservationStatus} (source: ${body.source})`)

    const reservationData = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // ✅ Generate ID
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: finalEmail,
      customerPhone: data.phone,
      partySize: data.partySize,
      children_count: data.childrenCount || null, // ✅ FIX: Include children_count (snake_case for DB)
      date: reservationDateTime,
      time: reservationDateTime,
      status: reservationStatus, // 🎯 AUTO-CONFIRM for admin requests
      source: body.source || 'web', // ✅ NEW: Track reservation source (admin, web, phone, walk-in)
      specialRequests: data.specialRequests || null,
      hasPreOrder: (data.preOrderItems?.length || 0) > 0,
      table_ids: data.tableIds, // ✅ NEW: Use array
      tableId: data.tableIds.length > 0 ? data.tableIds[0] : null, // ✅ Legacy compatibility (use first table if available)
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
      // 🎯 AUDIT FIELDS REMOVED: Not in DB yet (migration optional)
      // Will be tracked via email logs and status changes instead
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

    // ✅ GENERATE TOKEN INLINE (no fetch, más rápido y confiable)
    const token = `rt_${uuidv4().replace(/-/g, '')}`
    const expirationDateTime = new Date(new Date(reservationDateTime).getTime() - (2 * 60 * 60 * 1000))

    let reservationToken = null
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .schema('restaurante')
        .from('reservation_tokens')
        .insert({
          id: `rt_${uuidv4()}`,
          reservation_id: reservation.id,
          token: token,
          customer_email: data.email,
          expires: expirationDateTime.toISOString(),
          is_active: true,
          purpose: 'reservation_management'
        })
        .select()
        .single()

      if (!tokenError) {
        reservationToken = token
        console.log('✅ Token generated inline:', token.substring(0, 8) + '...')
      } else {
        console.error('⚠️ Token generation error:', tokenError)
      }
    } catch (tokenError) {
      console.error('⚠️ Token generation error:', tokenError)
    }

    // 📧 SEND EMAILS BEFORE RETURN (same pattern as PATCH confirmation - WORKS)
    const emailData = {
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
      childrenCount: data.childrenCount,
      tableNumber: tables.length > 0 ? tables.map(t => t.number).join(', ') : 'Por asignar',
      tableLocation: tables.length > 0 ? (tables[0]?.location || 'Por asignar') : 'Por asignar',
      specialRequests: data.specialRequests || '',
      preOrderItems: data.preOrderItems || [],
      preOrderTotal: data.preOrderTotal || 0,
      tokenUrl: reservationToken ? buildTokenUrl(reservationToken) : undefined,
      phone: data.phone,
      source: body.source || 'web'
    }

    // 📧 SEND EMAILS (non-blocking but BEFORE return - Vercel serverless compatible)
    try {
      console.log('📧 Enviando emails de creación para reserva:', reservation.id)
      const { sendReservationEmails } = await import('@/lib/email/sendReservationEmails')
      await sendReservationEmails(emailData)
      console.log('✅ Emails de creación enviados exitosamente')
    } catch (emailError) {
      console.error('❌ Error enviando emails de creación (non-blocking):', emailError)
      // Continue - don't block reservation creation
    }

    // ⚡ RESPUESTA (emails ya enviados)
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