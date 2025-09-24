import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient()

    // 1. Check current WAL files count before cleanup
    const { data: beforeStats } = await supabase.rpc('sql', {
      query: 'SELECT COUNT(*) as count FROM pg_ls_waldir()'
    })

    const walFilesBefore = beforeStats?.[0]?.count || 0

    if (walFilesBefore < 10) {
      return NextResponse.json({
        success: true,
        message: 'No hay necesidad de limpiar archivos WAL (menos de 10 archivos)',
        wal_files_before: walFilesBefore,
        wal_files_after: walFilesBefore,
        cleaned: 0
      })
    }

    // 2. Force a checkpoint to ensure WAL files can be recycled safely
    const { error: checkpointError } = await supabase.rpc('sql', {
      query: 'CHECKPOINT'
    })

    if (checkpointError) {
      console.error('CHECKPOINT failed:', checkpointError)
      return NextResponse.json({
        success: false,
        error: 'Failed to execute CHECKPOINT',
        details: checkpointError.message
      }, { status: 500 })
    }

    // 3. Switch to a new WAL segment to allow recycling of old ones
    const { error: switchError } = await supabase.rpc('sql', {
      query: 'SELECT pg_switch_wal()'
    })

    if (switchError) {
      console.error('WAL switch failed:', switchError)
      return NextResponse.json({
        success: false,
        error: 'Failed to switch WAL',
        details: switchError.message
      }, { status: 500 })
    }

    // 4. Wait a moment for the system to process
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 5. Check WAL files count after cleanup
    const { data: afterStats } = await supabase.rpc('sql', {
      query: 'SELECT COUNT(*) as count FROM pg_ls_waldir()'
    })

    const walFilesAfter = afterStats?.[0]?.count || 0
    const cleaned = Math.max(0, walFilesBefore - walFilesAfter)

    // 6. Get WAL archiving status for additional info
    const { data: archiveStats } = await supabase.rpc('sql', {
      query: `
        SELECT
          name,
          setting
        FROM pg_settings
        WHERE name IN ('archive_mode', 'archive_command', 'wal_level')
      `
    })

    return NextResponse.json({
      success: true,
      message: `Limpieza de archivos WAL completada. ${cleaned} archivos procesados.`,
      wal_files_before: walFilesBefore,
      wal_files_after: walFilesAfter,
      cleaned: cleaned,
      timestamp: new Date().toISOString(),
      archive_settings: archiveStats || []
    })

  } catch (error) {
    console.error('Error in WAL cleanup operation:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during WAL cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}