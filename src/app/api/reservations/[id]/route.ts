import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/emailService'
import { buildTokenUrl } from '@/lib/email/config/emailConfig'

const emailService = EmailService.getInstance()
import { getSpainTimestamp } from '@/lib/utils/timestamps'

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
    const { status, notes, restaurantMessage, preOrderItems, sendModificationEmail, sendReviewEmail, ...additionalData } = body

    console.log('🔄 Updating reservation:', reservationId, 'to status:', status)
    console.log('🍽️ Pre-order items to update:', preOrderItems?.length || 0)
    console.log('📧 Send modification email:', sendModificationEmail)
    console.log('📧 Send review email:', sendReviewEmail)

    // 🆕 MODERN MULTI-TABLE SUPPORT: Handle tableIds array from customer modifications
    let processedTableData = {}

    // 🔧 CRITICAL FIX: Support both tableIds (array) and tableId (single) for customer modifications
    if (additionalData.tableIds && Array.isArray(additionalData.tableIds)) {
      // Modern approach: multiple tables via tableIds array
      console.log('🔧 Processing tableIds array:', additionalData.tableIds)
      processedTableData = {
        table_ids: additionalData.tableIds, // Use correct DB column name
        specialRequests: additionalData.specialRequests || notes
      }
      // 🚨 CRITICAL: Remove tableIds from additionalData to prevent database error
      delete additionalData.tableIds
      delete additionalData.specialRequests
      console.log('✅ Converted tableIds to table_ids for database:', processedTableData.table_ids)
    } else if (additionalData.tableId) {
      const isCombination = additionalData.tableId.includes('+')

      if (isCombination) {
        console.log('🔗 Detected table combination modification:', additionalData.tableId)

        // Parse individual table numbers from combination
        const tableNumbers = additionalData.tableId.split('+').map(t => t.trim())
        console.log('📊 Parsing combination tables:', tableNumbers)

        const validatedTables = []

        // Find real database IDs for each table number
        for (const tableNumber of tableNumbers) {
          const tablesResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/tables?select=id,number,location,capacity&number=eq.${tableNumber}&isActive=eq.true`,
            {
              headers: {
                'Accept': 'application/json',
                'Accept-Profile': 'restaurante',
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY,
              }
            }
          )

          if (tablesResponse.ok) {
            const foundTables = await tablesResponse.json()
            if (foundTables && foundTables.length > 0) {
              validatedTables.push(foundTables[0])
              console.log(`✅ Found table ${tableNumber}:`, foundTables[0].id)
            } else {
              console.error('❌ Table not found in combination:', tableNumber)
              return NextResponse.json(
                { success: false, error: `Table ${tableNumber} not found in combination` },
                { status: 400 }
              )
            }
          }
        }

        // Set processed table data using same pattern as creation
        processedTableData = {
          tableId: validatedTables[0].id, // FK constraint: use first table's real ID
          specialRequests: `COMBO:${validatedTables.map(t => t.id).join(',')}\n${additionalData.specialRequests || notes || ''}`.trim()
        }

        console.log('🔗 Combination processed:', {
          originalTableId: additionalData.tableId,
          newTableId: processedTableData.tableId,
          specialRequests: processedTableData.specialRequests
        })
      } else {
        // Individual table - keep original logic
        processedTableData = {
          tableId: additionalData.tableId,
          specialRequests: additionalData.specialRequests || notes
        }
      }

      // Remove tableId from additionalData to avoid duplication
      delete additionalData.tableId
      delete additionalData.specialRequests
    }

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

    // 📧 CRITICAL: Send confirmation email FIRST if confirming
    if (status === 'CONFIRMED') {
      try {
        console.log('📧 Enviando email de confirmación para reserva:', reservationId)

        const emailData = await emailService.buildEmailDataFromReservation(reservationId)
        if (!emailData) {
          return NextResponse.json(
            { success: false, error: 'Reservation not found' },
            { status: 404 }
          )
        }

        const emailResult = await emailService.sendReservationConfirmed(emailData)

        if (emailResult === 'ok') {
          console.log('✅ Email de confirmación enviado exitosamente a:', emailData.customerEmail)
        } else {
          console.error('❌ Error enviando email de confirmación:', emailResult)
          // Continue execution - don't block reservation confirmation
        }
      } catch (emailError) {
        console.error('❌ Error crítico enviando email de confirmación:', emailError)
        // Continue execution - don't block reservation confirmation
      }
    }

    // 📧 CRITICAL: Send cancellation email if cancelling
    if (status === 'CANCELLED') {
      try {
        console.log('📧 Enviando email de cancelación para reserva:', reservationId)

        const emailData = await emailService.buildEmailDataFromReservation(reservationId)
        if (!emailData) {
          console.error('❌ Reservation not found for cancellation email')
        } else {
          // Add cancellation specific data
          const cancellationEmailData = {
            ...emailData,
            cancellationReason: notes || 'Sin especificar',
            restaurantMessage: restaurantMessage || undefined
          }

          const emailResult = await emailService.sendCancellation(cancellationEmailData)

          if (emailResult === 'ok') {
            console.log('✅ Email de cancelación enviado exitosamente a:', emailData.customerEmail)
          } else {
            console.error('❌ Error enviando email de cancelación:', emailResult)
            // Continue execution - don't block reservation cancellation
          }
        }
      } catch (emailError) {
        console.error('❌ Error crítico enviando email de cancelación:', emailError)
        // Continue execution - don't block reservation cancellation
      }
    }

    // 📧 CONDITIONAL: Send review request email if completing AND user opted in
    if (status === 'COMPLETED' && sendReviewEmail === true) {
      try {
        console.log('📧 Enviando solicitud de reseña para reserva:', reservationId)

        const emailData = await emailService.buildEmailDataFromReservation(reservationId)
        if (!emailData) {
          console.error('❌ Reservation not found for review email')
        } else {
          const emailResult = await emailService.sendReviewRequest(emailData)

          if (emailResult === 'ok') {
            console.log('✅ Email de solicitud de reseña enviado exitosamente a:', emailData.customerEmail)
          } else {
            console.error('❌ Error enviando email de reseña:', emailResult)
            // Continue execution - don't block reservation completion
          }
        }
      } catch (emailError) {
        console.error('❌ Error crítico enviando email de reseña:', emailError)
        // Continue execution - don't block reservation completion
      }
    } else if (status === 'COMPLETED' && sendReviewEmail === false) {
      console.log('⏭️ Completando reserva SIN enviar email de reseña (opción del usuario)')
    }

    // 📧 NOTE: Modification email will be sent after token generation (below) to include new token URL

    // 🚨 CRITICAL SAFEGUARD: Ensure tableIds is never sent to database
    delete additionalData.tableIds

    // ✅ FIX: Map childrenCount (camelCase frontend) → children_count (snake_case DB) for updates
    if (additionalData.childrenCount !== undefined) {
      additionalData.children_count = additionalData.childrenCount
      delete additionalData.childrenCount
    }

    console.log('🔧 Final additionalData after tableIds removal:', Object.keys(additionalData))
    console.log('🔧 processedTableData contains:', Object.keys(processedTableData))

    // Update reservation (non-blocking pattern - continue regardless of email status)
    const updateData = {
      status: status,
      updatedAt: getSpainTimestamp(), // 🚀 CRITICAL FIX: Use Spain timezone
      ...(notes && !processedTableData.specialRequests && { specialRequests: notes }),
      ...additionalData,
      ...processedTableData // 🆕 Include processed table data (handles combinations correctly)
    }

    console.log('🚀 Final updateData being sent to DB:', Object.keys(updateData))

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

    // 🔐 Generate new token if modification email was sent (customer modification)
    if (sendModificationEmail && status === 'PENDING' && updatedReservation) {
      try {
        console.log('🔐 Generating new token for modified reservation:', reservationId)

        // 🗑️ FIRST: DELETE all old tokens for this reservation (SECURITY BEST PRACTICE)
        console.log('🗑️ Deleting old tokens for reservation:', reservationId)
        const deleteOldTokensResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/reservation_tokens?reservation_id=eq.${reservationId}`,
          {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante',
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'apikey': SUPABASE_SERVICE_KEY,
            }
          }
        )

        if (deleteOldTokensResponse.ok) {
          console.log('✅ Old tokens DELETED - PUFF, NO EXISTEN')
        } else {
          console.warn('⚠️ Could not delete old tokens, continuing...')
        }

        // Generate unique NEW token
        const crypto = require('crypto')
        const token = `rt_${crypto.randomUUID().replace(/-/g, '')}`

        // Calculate expiration (2 hours before reservation time)
        const reservationDateTime = new Date(updatedReservation.time)
        const expirationDateTime = new Date(reservationDateTime.getTime() - (2 * 60 * 60 * 1000)) // 2 hours before

        // Create new token in database
        const tokenData = {
          id: `rt_${crypto.randomUUID()}`,
          reservation_id: reservationId,
          token: token,
          customer_email: updatedReservation.customerEmail,
          expires: expirationDateTime.toISOString(),
          created_at: new Date().toISOString(),
          is_active: true,
          purpose: 'reservation_management'
        }

        const createTokenResponse = await fetch(
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
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(tokenData)
          }
        )

        if (createTokenResponse.ok) {
          console.log('✅ New token generated for modified reservation:', token.substring(0, 8) + '...', 'expires:', expirationDateTime.toISOString())

          // Update the email with the new token URL
          try {
            console.log('📧 Re-sending modification email with new token...')
            const emailData = await emailService.buildEmailDataFromReservation(reservationId)
            if (emailData) {
              // Add the new token URL
              const updatedEmailData = {
                ...emailData,
                tokenUrl: buildTokenUrl(token)
              }

              const emailResult = await emailService.sendReservationModified(updatedEmailData)
              if (emailResult === 'ok') {
                console.log('✅ Email de modificación con nuevo token enviado exitosamente')
              }
            }
          } catch (emailError) {
            console.error('❌ Error sending email with new token:', emailError)
          }
        } else {
          console.error('❌ Failed to create new token for modified reservation')
          // Continue execution - this is not critical for the modification to succeed
        }
      } catch (tokenError) {
        console.error('❌ Error generating new token for modified reservation:', tokenError)
        // Continue execution - this is not critical for the modification to succeed
      }
    }

    // 🍽️ Handle pre-order items updates if provided
    if (preOrderItems && Array.isArray(preOrderItems)) {
      try {
        console.log('🔄 Processing pre-order items update...')

        // First, delete existing reservation_items
        const deleteResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/reservation_items?reservationId=eq.${reservationId}`,
          {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante',
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'apikey': SUPABASE_SERVICE_KEY,
            }
          }
        )

        if (!deleteResponse.ok) {
          console.warn('⚠️ Failed to delete existing reservation items, continuing...')
        }

        // Then, create new reservation_items
        if (preOrderItems.length > 0) {
          const newReservationItems = preOrderItems.map((item: any) => ({
            id: `resitem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            reservationId: reservationId,
            menuItemId: item.menuItemId || item.id, // Support both formats
            quantity: item.quantity,
            notes: item.notes || null
          }))

          const createResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/reservation_items`,
            {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Accept-Profile': 'restaurante',
                'Content-Profile': 'restaurante',
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(newReservationItems)
            }
          )

          if (!createResponse.ok) {
            const errorText = await createResponse.text()
            console.error('❌ Failed to create reservation items:', errorText)
          } else {
            console.log('✅ Pre-order items updated:', newReservationItems.length, 'items')

            // Update hasPreOrder flag
            await fetch(
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
                },
                body: JSON.stringify({ hasPreOrder: newReservationItems.length > 0 })
              }
            )
          }
        } else {
          // If no items, set hasPreOrder to false
          await fetch(
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
              },
              body: JSON.stringify({ hasPreOrder: false })
            }
          )
        }
      } catch (itemsError) {
        console.error('❌ Error updating pre-order items:', itemsError)
        // Don't fail the whole operation, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      message: preOrderItems ? 'Reservation and pre-order items updated successfully' : 'Reservation status updated successfully'
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
      `${SUPABASE_URL}/rest/v1/reservations?select=id,customerName,customerEmail,customerPhone,partySize,children_count,date,time,status,specialRequests,hasPreOrder,tableId,table_ids,createdAt,updatedAt&id=eq.${reservationId}`,
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

    // 🔧 FRONTEND COMPATIBILITY: Add tableIds array and allTables for form initialization

    // 1. Get table IDs array
    let tableIds: string[] = []
    if (reservation.table_ids && Array.isArray(reservation.table_ids) && reservation.table_ids.length > 0) {
      tableIds = reservation.table_ids  // Modern: use table_ids from DB
    } else if (reservation.tableId) {
      tableIds = [reservation.tableId]  // Legacy: convert single tableId to array
    }
    reservation.tableIds = tableIds

    // ✅ FIX: Map children_count (snake_case DB) → childrenCount (camelCase frontend)
    if (reservation.children_count !== undefined && reservation.children_count !== null) {
      reservation.childrenCount = reservation.children_count
    }

    // 2. Fetch table details for allTables field (needed by customer modal)
    if (tableIds.length > 0) {
      try {
        const tablesQuery = `${SUPABASE_URL}/rest/v1/tables?select=id,number,location,capacity&id=in.(${tableIds.join(',')})`
        const tablesResponse = await fetch(tablesQuery, {
          headers: {
            'Accept': 'application/json',
            'Accept-Profile': 'restaurante',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
          }
        })

        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json()
          reservation.allTables = tablesData
          reservation.tables = tablesData[0] || null // Single table for backward compatibility
        } else {
          reservation.allTables = []
          reservation.tables = null
        }
      } catch (error) {
        console.error('Error fetching table details:', error)
        reservation.allTables = []
        reservation.tables = null
      }
    } else {
      reservation.allTables = []
      reservation.tables = null
    }

    return NextResponse.json({
      success: true,
      reservation,
      timestamp: getSpainTimestamp()
    })

  } catch (error) {
    console.error('❌ Get reservation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE endpoint for permanently deleting a reservation
export async function DELETE(
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

    console.log('🗑️ Deleting reservation:', reservationId)

    // Delete reservation - SERVICE_KEY bypasses RLS
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservationId}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=minimal'
        }
      }
    )

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      console.error('❌ Delete reservation failed:', deleteResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: `Failed to delete reservation: ${errorText}` },
        { status: 500 }
      )
    }

    console.log('✅ Reservation deleted:', reservationId)

    return NextResponse.json({
      success: true,
      message: 'Reservation deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete reservation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}