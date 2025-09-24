import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()

    // 1. CRITICAL: WAL Files Management
    const { data: walData } = await supabase
      .rpc('sql', {
        query: 'SELECT COUNT(*) as count FROM pg_ls_waldir()'
      })

    // 2. CRITICAL: Connection Pool Status
    const { data: connectionStats } = await supabase
      .rpc('sql', {
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

    // 3. CRITICAL: VACUUM & ANALYZE Status
    const { data: vacuumStats } = await supabase
      .rpc('sql', {
        query: `
          SELECT
            schemaname,
            relname,
            last_vacuum,
            last_autovacuum,
            last_analyze,
            last_autoanalyze,
            n_tup_ins + n_tup_upd + n_tup_del as total_activity
          FROM pg_stat_user_tables
          WHERE schemaname = 'restaurante'
          ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC
          LIMIT 10
        `
      })

    const walFiles = walData?.[0]?.count || 0
    const connections = connectionStats?.[0] || {}

    // Calculate tables needing maintenance (no vacuum in 24h OR high activity)
    const tablesNeedingMaintenance = vacuumStats?.filter(t => {
      const lastVacuum = t.last_vacuum || t.last_autovacuum
      const lastAnalyze = t.last_analyze || t.last_autoanalyze
      const vacuumOld = !lastVacuum || new Date(lastVacuum) < new Date(Date.now() - 24*60*60*1000)
      const analyzeOld = !lastAnalyze || new Date(lastAnalyze) < new Date(Date.now() - 24*60*60*1000)
      const highActivity = t.total_activity > 1000

      return vacuumOld || analyzeOld || highActivity
    }) || []

    // Status determination
    const walStatus = walFiles > 50 ? 'warning' : walFiles > 100 ? 'critical' : 'healthy'
    const connectionStatus = connections.total_connections > 40 ? 'warning' :
                           connections.idle_in_transaction > 5 ? 'warning' : 'healthy'
    const maintenanceStatus = tablesNeedingMaintenance.length > 5 ? 'warning' :
                            tablesNeedingMaintenance.length > 0 ? 'info' : 'healthy'

    const criticalSystemStatus = {
      // 1. WAL Management
      walFiles: {
        status: walStatus,
        count: walFiles,
        action: walFiles > 50 ? 'cleanup_recommended' : 'normal',
        details: `${walFiles} archivos WAL${walFiles > 50 ? ' - Limpieza recomendada' : ''}`
      },

      // 2. Connection Pool
      connections: {
        status: connectionStatus,
        total: connections.total_connections || 0,
        active: connections.active_connections || 0,
        idle: connections.idle_connections || 0,
        idle_in_transaction: connections.idle_in_transaction || 0,
        action: connections.idle_in_transaction > 5 ? 'kill_idle_recommended' : 'normal',
        details: `${connections.active_connections || 0} activas, ${connections.idle_in_transaction || 0} bloqueadas`
      },

      // 3. VACUUM & ANALYZE
      maintenance: {
        status: maintenanceStatus,
        tables_needing_attention: tablesNeedingMaintenance.length,
        action: tablesNeedingMaintenance.length > 0 ? 'vacuum_recommended' : 'normal',
        details: `${tablesNeedingMaintenance.length} tablas necesitan mantenimiento`,
        high_activity_tables: vacuumStats?.slice(0, 3).map(t => ({
          name: t.relname,
          activity: t.total_activity,
          last_vacuum: t.last_vacuum || t.last_autovacuum
        })) || []
      }
    }

    return NextResponse.json({
      success: true,
      status: criticalSystemStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching critical system status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}