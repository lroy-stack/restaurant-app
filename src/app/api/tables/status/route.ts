import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { getSpainDate } from '@/lib/utils/timestamps'

interface StatusUpdateData {
  tableId: string
  status: 'available' | 'reserved' | 'occupied' | 'maintenance'
  notes?: string | null
  estimatedFreeTime?: string | null
}

export async function GET(request: NextRequest) {
  try {
    // Get all table statuses with current reservation info using service client
    const supabase = await createServiceClient()
    const { data: tablesData, error: tablesError } = await supabase
      .schema('restaurante')
      .from('tables')
      .select(`
        *,
        reservations(id,customerName,partySize,time,date,status,tableId,table_ids)
      `)
      .order('number')

    if (tablesError) {
      console.error('❌ Tables Status API Error:', tablesError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch table statuses from database',
          details: tablesError.message
        },
        { status: 500 }
      )
    }
    
    // Calculate dynamic status based on reservations and time
    const tablesWithStatus = tablesData.map((table: any) => {
      let calculatedStatus = table.currentstatus || 'available'
      let currentReservation = null

      // PRIORITY: If table is inactive, force status to temporarily closed
      if (!table.isActive) {
        calculatedStatus = 'temporally_closed'
        return {
          ...table,
          currentStatus: calculatedStatus,
          currentReservation: null
        }
      }

      // If table has active reservations, determine status
      if (table.reservations && table.reservations.length > 0) {
        const now = new Date()
        
        // CRITICAL: Find active reservation using ONLY table_ids[] (NOT legacy tableId)
        const activeReservation = table.reservations.find((res: any) => {
          // 🚀 CRITICAL FIX: Use Spain timezone helper for accurate comparison
          const nowMadrid = getSpainDate()
          const resDateTime = new Date(res.time) // res.time already stored in Spain local time

          // Compare dates in Madrid timezone
          const todayMadrid = nowMadrid.toDateString()
          const resDateMadrid = resDateTime.toDateString()
          const isToday = resDateMadrid === todayMadrid

          // ✅ CRITICAL: Check ONLY table_ids[] array - NO FALLBACK to tableId
          const isTableAssigned = res.table_ids?.includes(table.id)

          if (!isTableAssigned) return false

          // 🚀 FIXED: SEATED = OCUPADA (SOLO para HOY en timezone Madrid)
          if (res.status === 'SEATED' && isToday) {
            return true
          }

          // CONFIRMED = RESERVADA (solo para HOY y dentro de 2.5h)
          if (res.status === 'CONFIRMED' && isToday) {
            const timeDiff = resDateTime.getTime() - nowMadrid.getTime()
            // Solo si es en las próximas 2.5 horas
            return timeDiff > 0 && timeDiff <= (150 * 60000)
          }

          // PENDING no se incluye en el plano
          return false
        })
        
        if (activeReservation) {
          // Determinar estado basado en status de reserva
          if (activeReservation.status === 'SEATED') {
            calculatedStatus = 'occupied'
          } else if (activeReservation.status === 'CONFIRMED') {
            calculatedStatus = 'reserved'
          }

          currentReservation = {
            id: activeReservation.id,
            customerName: activeReservation.customerName,
            partySize: activeReservation.partySize,
            time: `${activeReservation.date} ${activeReservation.time}`,
            status: activeReservation.status
          }
        }
      }
      
      return {
        ...table,
        currentStatus: calculatedStatus,
        currentReservation
      }
    })
    
    console.log('📊 Table statuses refreshed:', tablesWithStatus.length, 'tables processed')
    
    return NextResponse.json({
      success: true,
      tables: tablesWithStatus,
      count: tablesWithStatus.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching table statuses:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { tableId, status, notes, estimatedFreeTime }: StatusUpdateData = await request.json()
    
    // Validate required fields
    if (!tableId || !status) {
      return NextResponse.json(
        { success: false, error: 'tableId and status are required' },
        { status: 400 }
      )
    }

    // Validate status (including temporally_closed for inactive tables)
    const validStatuses = ['available', 'reserved', 'occupied', 'maintenance', 'temporally_closed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // FIXED: Use direct fetch to avoid Supabase client headers issues
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Get table info first to check if it's active
    const tableInfoResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?select=isActive,number&id=eq.${tableId}`,
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

    if (!tableInfoResponse.ok) {
      const errorText = await tableInfoResponse.text()
      console.error('❌ Get table info failed:', tableInfoResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch table info' },
        { status: 500 }
      )
    }

    const tableInfos = await tableInfoResponse.json()
    const tableInfo = tableInfos?.[0]

    // Prevent status changes on inactive tables (except by reactivating in config)
    if (tableInfo && !tableInfo.isActive && status !== 'temporally_closed') {
      return NextResponse.json(
        {
          success: false,
          error: `Mesa ${tableInfo.number} está temporalmente cerrada. Actívala primero en Configuración.`
        },
        { status: 400 }
      )
    }

    // Update table status using direct fetch
    const updateData = {
      currentstatus: status,
      statusnotes: notes || null,
      estimatedfreetime: estimatedFreeTime || null,
      updatedAt: new Date().toISOString()
    }

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}`,
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
      console.error('❌ Update table failed:', updateResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: 'Failed to update table status' },
        { status: 500 }
      )
    }

    const updatedTables = await updateResponse.json()
    const updatedTable = updatedTables?.[0]

    if (!updatedTable) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }

    console.log('✅ Table status updated:', updatedTable.number, 'to', status)
    
    return NextResponse.json({
      success: true,
      table: updatedTable,
      message: 'Table status updated successfully'
    })
  } catch (error) {
    console.error('Error updating table status:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to update table status' },
      { status: 500 }
    )
  }
}