import { NextResponse } from 'next/server'
import { SUPABASE_CONFIG, getSupabaseHeaders, getSupabaseApiUrl, testDatabaseConnection } from '@/lib/supabase/config'

/**
 * Health check endpoint for database connectivity
 * GET /api/health/db
 *
 * Returns database connection status and configuration info
 */
export async function GET() {
  try {
    // Test database connection
    const isConnected = await testDatabaseConnection()

    // Get table count
    let tableCount = 0
    try {
      const response = await fetch(
        getSupabaseApiUrl('restaurants?select=id&limit=1'),
        { headers: getSupabaseHeaders() }
      )
      if (response.ok) {
        tableCount = 1
      }
    } catch (error) {
      console.error('Failed to query tables:', error)
    }

    return NextResponse.json({
      status: isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      config: {
        url: SUPABASE_CONFIG.url,
        schema: SUPABASE_CONFIG.schema,
        hasAnonKey: !!SUPABASE_CONFIG.anonKey,
        hasServiceKey: !!SUPABASE_CONFIG.serviceRoleKey,
      },
      database: {
        connected: isConnected,
        schema: SUPABASE_CONFIG.schema,
        canQueryTables: tableCount > 0,
      },
      message: isConnected
        ? 'Database connection successful'
        : 'Database connection failed'
    }, {
      status: isConnected ? 200 : 503
    })

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Health check failed'
    }, {
      status: 500
    })
  }
}
