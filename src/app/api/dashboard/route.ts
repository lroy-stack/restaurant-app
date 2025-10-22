import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

// Mock data for fallback when database is not accessible
const MOCK_DASHBOARD_DATA = {
  totalReservations: 7,
  totalCustomers: 8,
  totalMenuItems: 196,
  totalTables: 4,
  todayReservations: 3,
  confirmedReservations: 2,
  occupiedTables: 2,
  occupancyPercentage: 50,
  recentReservations: [
    {
      id: '1',
      customerName: 'María García',
      partySize: 4,
      time: new Date('2024-01-10T20:00:00'),
      tableNumber: '1'
    },
    {
      id: '2', 
      customerName: 'John Smith',
      partySize: 2,
      time: new Date('2024-01-10T21:30:00'),
      tableNumber: '3'
    },
    {
      id: '3',
      customerName: 'Hans Mueller',
      partySize: 6,
      time: new Date('2024-01-10T19:00:00'),
      tableNumber: '4'
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()
    
    // Test connection with a simple query using a table we know exists
    const { error: connectionError } = await supabase
      .schema('public')
      .from('tables')
      .select('id')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError)
      return NextResponse.json({
        success: true,
        metrics: MOCK_DASHBOARD_DATA,
        dataSource: 'mock',
        warning: 'Using mock data - database connection failed',
        connectionError: connectionError.message
      })
    }
    
    // Fetch real dashboard metrics from Supabase
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString()
    
    // Parallel queries for efficiency
    const [
      { count: totalReservations },
      { count: totalCustomers },
      { count: totalMenuItems },
      { count: todayReservations },
      { count: confirmedReservations },
      { count: totalTables },
      { data: recentReservationsData, error: recentError }
    ] = await Promise.all([
      // Total reservations
      supabase
        .schema('public')
        .from('reservations')
        .select('*', { count: 'exact', head: true }),
      
      // Total customers
      supabase
        .schema('public')
        .from('customers')
        .select('*', { count: 'exact', head: true }),
      
      // Total menu items (real count from menu_items table)
      supabase
        .schema('public')
        .from('menu_items')
        .select('*', { count: 'exact', head: true }),
      
      // Today's reservations
      supabase
        .schema('public')
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('date', todayStart)
        .lte('date', todayEnd),
      
      // Confirmed reservations today
      supabase
        .schema('public')
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CONFIRMED')
        .gte('date', todayStart)
        .lte('date', todayEnd),
      
      // Total tables
      supabase
        .schema('public')
        .from('tables')
        .select('*', { count: 'exact', head: true }),
      
      // Recent reservations for display
      supabase
        .schema('public')
        .from('reservations')
        .select(`
          id,
          "customerName",
          "partySize", 
          date,
          time,
          status,
          "tableId"
        `)
        .gte('date', new Date().toISOString())
        .in('status', ['CONFIRMED', 'PENDING'])
        .order('date', { ascending: true })
        .limit(3)
    ])

    // Calculate occupancy percentage
    const occupiedTables = confirmedReservations || 0
    const occupancyPercentage = totalTables && totalTables > 0 
      ? Math.round((occupiedTables / totalTables) * 100) 
      : 0

    // Process recent reservations
    const recentReservations = recentError ? [] : (recentReservationsData || []).map(reservation => ({
      id: reservation.id,
      customerName: reservation.customerName,
      partySize: reservation.partySize,
      time: reservation.time,
      tableNumber: reservation.tableId || 'TBD'
    }))

    const metrics = {
      totalReservations: totalReservations || 0,
      totalUsers: totalCustomers || 0,
      totalMenuItems: totalMenuItems || 0, // Real count from menu_items table
      todayReservations: todayReservations || 0,
      confirmedReservations: confirmedReservations || 0,
      totalTables: totalTables || 0,
      occupiedTables,
      occupancyPercentage,
      recentReservations
    }

    return NextResponse.json({
      success: true,
      metrics,
      dataSource: 'database'
    })

  } catch (error) {
    console.error('❌ Dashboard metrics query failed:', error)
    return NextResponse.json({
      success: true,
      metrics: MOCK_DASHBOARD_DATA,
      dataSource: 'mock',
      warning: 'Using mock data - database error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}