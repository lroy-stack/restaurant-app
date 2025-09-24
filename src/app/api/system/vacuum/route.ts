import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { table, operation = 'vacuum_analyze' } = await request.json()
    const supabase = await createServiceClient()

    let query = ''
    let description = ''

    if (table && table !== 'all') {
      // VACUUM specific table
      switch (operation) {
        case 'vacuum_only':
          query = `VACUUM restaurante.${table}`
          description = `VACUUM en tabla ${table}`
          break
        case 'analyze_only':
          query = `ANALYZE restaurante.${table}`
          description = `ANALYZE en tabla ${table}`
          break
        case 'vacuum_analyze':
        default:
          query = `VACUUM ANALYZE restaurante.${table}`
          description = `VACUUM ANALYZE en tabla ${table}`
          break
      }
    } else {
      // VACUUM all tables in restaurante schema
      switch (operation) {
        case 'vacuum_only':
          query = `VACUUM SCHEMA restaurante`
          description = 'VACUUM en esquema restaurante'
          break
        case 'analyze_only':
          query = `ANALYZE SCHEMA restaurante`
          description = 'ANALYZE en esquema restaurante'
          break
        case 'vacuum_analyze':
        default:
          query = `VACUUM ANALYZE SCHEMA restaurante`
          description = 'VACUUM ANALYZE en esquema restaurante'
          break
      }
    }

    console.log(`Executing: ${query}`)

    const { data, error } = await supabase.rpc('sql', { query })

    if (error) {
      console.error('VACUUM operation failed:', error)
      return NextResponse.json({
        success: false,
        error: 'VACUUM operation failed',
        details: error.message
      }, { status: 500 })
    }

    // Get updated stats after vacuum
    const { data: updatedStats } = await supabase.rpc('sql', {
      query: `
        SELECT
          schemaname,
          relname,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE schemaname = 'restaurante'
        ORDER BY GREATEST(
          COALESCE(last_vacuum, '1970-01-01'::timestamp),
          COALESCE(last_autovacuum, '1970-01-01'::timestamp)
        ) DESC
        LIMIT 5
      `
    })

    return NextResponse.json({
      success: true,
      message: `${description} completado exitosamente`,
      operation: operation,
      target: table || 'all_tables',
      timestamp: new Date().toISOString(),
      updated_tables: updatedStats || []
    })

  } catch (error) {
    console.error('Error in VACUUM operation:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during VACUUM operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}