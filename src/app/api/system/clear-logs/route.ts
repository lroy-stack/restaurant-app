import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient()

    // Clear logs older than 7 days (critical for self-hosted maintenance)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // 1. Clear old postgres logs
    const { data: deletedPgLogs, error: pgError } = await supabase
      .from('postgres_logs')
      .delete()
      .lt('timestamp', sevenDaysAgo)

    // 2. Clear old storage logs
    const { data: deletedStorageLogs, error: storageError } = await supabase
      .from('storage_logs')
      .delete()
      .lt('timestamp', sevenDaysAgo)

    // 3. Clear old auth logs
    const { data: deletedAuthLogs, error: authError } = await supabase
      .from('auth_logs')
      .delete()
      .lt('timestamp', sevenDaysAgo)

    const errors = [pgError, storageError, authError].filter(Boolean)

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Partial cleanup completed',
        details: errors.map(e => e?.message).join(', '),
        cleaned: {
          postgres: !pgError,
          storage: !storageError,
          auth: !authError
        }
      }, { status: 207 }) // Multi-status
    }

    return NextResponse.json({
      success: true,
      message: 'Logs cleaned successfully',
      cleaned: {
        postgres: true,
        storage: true,
        auth: true
      },
      cutoffDate: sevenDaysAgo
    })

  } catch (error) {
    console.error('Error cleaning logs:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clean logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}