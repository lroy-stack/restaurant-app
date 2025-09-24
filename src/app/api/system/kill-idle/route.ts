import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { mode = 'idle_in_transaction' } = await request.json()
    const supabase = await createServiceClient()

    // 1. Get current problematic connections
    let targetQuery = ''
    let description = ''

    switch (mode) {
      case 'idle_in_transaction':
        targetQuery = `
          SELECT pid, state, query_start, state_change, usename, application_name
          FROM pg_stat_activity
          WHERE state = 'idle in transaction'
          AND pid != pg_backend_pid()
          AND state_change < NOW() - INTERVAL '5 minutes'
        `
        description = 'conexiones "idle in transaction" por más de 5 minutos'
        break

      case 'long_idle':
        targetQuery = `
          SELECT pid, state, query_start, state_change, usename, application_name
          FROM pg_stat_activity
          WHERE state = 'idle'
          AND pid != pg_backend_pid()
          AND state_change < NOW() - INTERVAL '30 minutes'
        `
        description = 'conexiones idle por más de 30 minutos'
        break

      case 'long_running':
        targetQuery = `
          SELECT pid, state, query_start, state_change, usename, application_name
          FROM pg_stat_activity
          WHERE state = 'active'
          AND pid != pg_backend_pid()
          AND query_start < NOW() - INTERVAL '10 minutes'
          AND usename != 'postgres'
        `
        description = 'consultas ejecutándose por más de 10 minutos'
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid mode. Use: idle_in_transaction, long_idle, or long_running'
        }, { status: 400 })
    }

    // 2. Find target connections
    const { data: targetConnections, error: queryError } = await supabase.rpc('sql', {
      query: targetQuery
    })

    if (queryError) {
      console.error('Error finding target connections:', queryError)
      return NextResponse.json({
        success: false,
        error: 'Failed to find target connections',
        details: queryError.message
      }, { status: 500 })
    }

    if (!targetConnections || targetConnections.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No se encontraron ${description} para terminar`,
        killed_connections: 0,
        connections: []
      })
    }

    // 3. Kill the problematic connections (SAFELY - exclude system connections)
    const killedConnections = []
    const errors = []

    for (const conn of targetConnections) {
      // Safety check: don't kill system processes or our own connection
      if (conn.usename === 'postgres' || conn.application_name?.includes('supabase')) {
        continue
      }

      try {
        const { error: killError } = await supabase.rpc('sql', {
          query: `SELECT pg_terminate_backend(${conn.pid})`
        })

        if (killError) {
          errors.push(`Failed to kill PID ${conn.pid}: ${killError.message}`)
        } else {
          killedConnections.push({
            pid: conn.pid,
            state: conn.state,
            user: conn.usename,
            duration: conn.state_change
          })
        }
      } catch (err) {
        errors.push(`Error killing PID ${conn.pid}: ${err}`)
      }
    }

    // 4. Get updated connection stats
    const { data: afterStats } = await supabase.rpc('sql', {
      query: `
        SELECT
          COUNT(*) as total_connections,
          COUNT(*) FILTER (WHERE state = 'active') as active_connections,
          COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
          COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
        FROM pg_stat_activity
        WHERE pid != pg_backend_pid()
      `
    })

    return NextResponse.json({
      success: true,
      message: `Terminadas ${killedConnections.length} ${description}`,
      mode: mode,
      killed_connections: killedConnections.length,
      connections: killedConnections,
      errors: errors,
      current_stats: afterStats?.[0] || {},
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in kill idle connections operation:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during connection cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}