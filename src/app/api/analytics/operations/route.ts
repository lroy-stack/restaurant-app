import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const to = searchParams.get('to') || new Date().toISOString()

    const supabase = await createServiceClient()

    // Complex operational analytics query
    const operationsQuery = `
      WITH date_range AS (
        SELECT
          $1::timestamp as start_date,
          $2::timestamp as end_date
      ),
      table_analytics AS (
        SELECT
          t.id,
          t.number,
          t.capacity,
          t.location,
          COUNT(r.id) as total_reservations,
          COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED') as confirmed_reservations,
          AVG(
            CASE
              WHEN r.status = 'CONFIRMED' AND r.date IS NOT NULL
              THEN EXTRACT(EPOCH FROM (r.time::time + INTERVAL '2 hours' - r.time::time)) / 3600
              ELSE NULL
            END
          ) as avg_dining_duration,
          ROUND(
            COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED')::decimal /
            NULLIF(COUNT(r.id), 0) * 100, 2
          ) as confirmation_rate
        FROM restaurante.tables t
        LEFT JOIN restaurante.reservations r ON t.id = r.table_id
          AND r.date >= (SELECT start_date FROM date_range)::date
          AND r.date <= (SELECT end_date FROM date_range)::date
        GROUP BY t.id, t.number, t.capacity, t.location
      ),
      location_summary AS (
        SELECT
          location,
          COUNT(*) as total_tables,
          SUM(capacity) as total_capacity,
          SUM(total_reservations) as location_reservations,
          SUM(confirmed_reservations) as location_confirmed,
          ROUND(
            SUM(confirmed_reservations)::decimal /
            NULLIF(SUM(total_reservations), 0) * 100, 2
          ) as location_occupancy,
          AVG(avg_dining_duration) as avg_location_duration
        FROM table_analytics
        GROUP BY location
      ),
      hourly_patterns AS (
        SELECT
          EXTRACT(HOUR FROM r.time) as hour,
          COUNT(*) as reservations_count,
          COUNT(*) FILTER (WHERE r.status = 'CONFIRMED') as confirmed_count,
          ROUND(
            COUNT(*) FILTER (WHERE r.status = 'CONFIRMED')::decimal /
            NULLIF(COUNT(*), 0) * 100, 2
          ) as hourly_occupancy
        FROM restaurante.reservations r
        CROSS JOIN date_range dr
        WHERE r.date >= dr.start_date::date
          AND r.date <= dr.end_date::date
        GROUP BY EXTRACT(HOUR FROM r.time)
        ORDER BY hour
      ),
      operational_kpis AS (
        SELECT
          COUNT(DISTINCT t.id) as total_tables,
          SUM(t.capacity) as total_capacity,
          COUNT(DISTINCT r.id) as total_reservations,
          COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED') as confirmed_reservations,
          ROUND(
            COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED')::decimal /
            NULLIF(COUNT(DISTINCT t.id), 0), 2
          ) as table_efficiency,
          ROUND(
            COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED')::decimal /
            NULLIF(COUNT(DISTINCT r.id), 0) * 100, 2
          ) as occupancy_rate,
          AVG(
            CASE
              WHEN r.status = 'CONFIRMED'
              THEN 120 -- Default 2 hours dining time in minutes
              ELSE NULL
            END
          ) as average_dining_duration
        FROM restaurante.tables t
        LEFT JOIN restaurante.reservations r ON t.id = r.table_id
        CROSS JOIN date_range dr
        WHERE r.date IS NULL OR (
          r.date >= dr.start_date::date AND r.date <= dr.end_date::date
        )
      )
      SELECT
        ok.table_efficiency,
        ok.occupancy_rate,
        ok.average_dining_duration,
        json_agg(DISTINCT
          json_build_object(
            'hour', hp.hour,
            'occupancy', hp.hourly_occupancy,
            'reservations', hp.reservations_count
          ) ORDER BY hp.hour
        ) FILTER (WHERE hp.hour IS NOT NULL) as peak_hours,
        json_agg(DISTINCT
          json_build_object(
            'location', ls.location,
            'occupancy', ls.location_occupancy,
            'reservations', ls.location_reservations,
            'tables', ls.total_tables,
            'capacity', ls.total_capacity
          )
        ) FILTER (WHERE ls.location IS NOT NULL) as location_summary
      FROM operational_kpis ok
      LEFT JOIN hourly_patterns hp ON true
      LEFT JOIN location_summary ls ON true
      GROUP BY ok.table_efficiency, ok.occupancy_rate, ok.average_dining_duration
    `

    // Execute the complex query using raw SQL
    const { data: operationsData, error } = await supabase.rpc('exec_sql', {
      sql: operationsQuery,
      params: [from, to]
    })

    // If RPC doesn't work, fall back to individual queries
    if (error) {
      console.log('RPC not available, using individual queries for operations')

      const [
        { data: tablesData },
        { data: reservationsData },
        { count: totalTables },
        { count: totalReservations },
        { count: confirmedReservations }
      ] = await Promise.all([
        // All tables with their details
        supabase
          .schema('restaurante')
          .from('tables')
          .select('id, number, capacity, location'),

        // Reservations in date range
        supabase
          .schema('restaurante')
          .from('reservations')
          .select('table_id, status, date, time, location')
          .gte('date', from.split('T')[0])
          .lte('date', to.split('T')[0]),

        // Total tables count
        supabase
          .schema('restaurante')
          .from('tables')
          .select('*', { count: 'exact', head: true }),

        // Total reservations in period
        supabase
          .schema('restaurante')
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .gte('date', from.split('T')[0])
          .lte('date', to.split('T')[0]),

        // Confirmed reservations in period
        supabase
          .schema('restaurante')
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'CONFIRMED')
          .gte('date', from.split('T')[0])
          .lte('date', to.split('T')[0])
      ])

      // Calculate metrics manually
      const occupancyRate = totalTables > 0 ? (confirmedReservations / totalTables) * 100 : 0
      const tableEfficiency = totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0
      const averageDiningDuration = 120 // Default 2 hours in minutes

      // Build peak hours analysis from reservations
      const hourlyStats = new Map()
      reservationsData?.forEach(reservation => {
        if (reservation.time) {
          const hour = new Date(`2000-01-01T${reservation.time}`).getHours()
          const current = hourlyStats.get(hour) || { total: 0, confirmed: 0 }
          current.total++
          if (reservation.status === 'CONFIRMED') {
            current.confirmed++
          }
          hourlyStats.set(hour, current)
        }
      })

      const peakHours = Array.from(hourlyStats.entries()).map(([hour, stats]) => ({
        hour: parseInt(hour),
        occupancy: stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0,
        reservations: stats.total
      })).sort((a, b) => a.hour - b.hour)

      // Build location performance analysis
      const locationStats = new Map()
      tablesData?.forEach(table => {
        const location = table.location || 'UNKNOWN'
        const current = locationStats.get(location) || {
          tables: 0,
          capacity: 0,
          reservations: 0,
          confirmed: 0
        }
        current.tables++
        current.capacity += table.capacity || 4
        locationStats.set(location, current)
      })

      reservationsData?.forEach(reservation => {
        const location = reservation.location || 'UNKNOWN'
        const current = locationStats.get(location) || {
          tables: 0,
          capacity: 0,
          reservations: 0,
          confirmed: 0
        }
        current.reservations++
        if (reservation.status === 'CONFIRMED') {
          current.confirmed++
        }
        locationStats.set(location, current)
      })

      const locationSummary = Array.from(locationStats.entries()).map(([location, stats]) => ({
        location,
        occupancy: stats.reservations > 0 ? (stats.confirmed / stats.reservations) * 100 : 0,
        reservations: stats.reservations,
        tables: stats.tables,
        capacity: stats.capacity
      }))

      const analytics = {
        tableEfficiency: Math.round(tableEfficiency * 100) / 100,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averageDiningDuration,
        peakHours,
        locationSummary,
        metrics: {
          totalTables: totalTables || 0,
          totalCapacity: tablesData?.reduce((sum, table) => sum + (table.capacity || 4), 0) || 0,
          utilizationRate: occupancyRate,
          turnoverRate: tableEfficiency > 0 ? (24 * 60) / averageDiningDuration : 0 // Tables per day
        }
      }

      return NextResponse.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString(),
        dataSource: 'fallback_queries'
      })
    }

    // Process RPC results if available
    const result = operationsData?.[0]
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'No operational data returned from query'
      }, { status: 500 })
    }

    const analytics = {
      tableEfficiency: result.table_efficiency || 0,
      occupancyRate: result.occupancy_rate || 0,
      averageDiningDuration: result.average_dining_duration || 120,
      peakHours: result.peak_hours || [],
      locationSummary: result.location_summary || [],
      metrics: {
        totalTables: result.total_tables || 0,
        totalCapacity: result.total_capacity || 0,
        utilizationRate: result.occupancy_rate || 0,
        turnoverRate: result.table_efficiency > 0 ? (24 * 60) / (result.average_dining_duration || 120) : 0
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
      dataSource: 'sql_query'
    })

  } catch (error) {
    console.error('Operations analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}