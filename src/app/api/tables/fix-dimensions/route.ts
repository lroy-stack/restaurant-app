/**
 * API ENDPOINT TO FIX TABLE DIMENSIONS
 * POST /api/tables/fix-dimensions
 *
 * Actions:
 * - resize: Auto-resize tables based on capacity
 * - align: Align tables to grid
 * - both: Do both operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { fixTableDimensions, alignTablePositions } from '@/app/(admin)/dashboard/mesas/utils/fix-table-dimensions'
import { redistributeTablesWithSpacing } from '@/app/(admin)/dashboard/mesas/utils/redistribute-tables'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'both', spacing = 60 } = body

    const results: any = {
      success: true,
      action,
      timestamp: new Date().toISOString()
    }

    if (action === 'resize' || action === 'both') {
      const resizeResult = await fixTableDimensions()
      results.resize = resizeResult
    }

    if (action === 'align' || action === 'both') {
      const alignResult = await alignTablePositions()
      results.align = alignResult
    }

    if (action === 'redistribute' || action === 'both') {
      const redistributeResult = await redistributeTablesWithSpacing(spacing)
      results.redistribute = redistributeResult
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error('Error fixing table dimensions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fix table dimensions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Table dimensions fix endpoint',
    usage: {
      method: 'POST',
      body: {
        action: 'resize | align | redistribute | both',
        spacing: 'number (default: 60px)'
      }
    },
    actions: {
      resize: 'Auto-resize tables based on capacity (2pax=80x80, 4pax=120x80, 6pax+=160x80)',
      align: 'Align tables to 10px grid horizontally and vertically',
      redistribute: 'Redistribute tables in rows with uniform spacing',
      both: 'Perform all operations: resize + align + redistribute'
    }
  })
}
