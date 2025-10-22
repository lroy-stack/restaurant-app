/**
 * Smart Table Assignment API Endpoint
 * Provides intelligent table recommendations using 3 algorithms
 * Target: <200ms response time, +15% utilization improvement
 */

import { NextRequest, NextResponse } from 'next/server'
import { SmartAssignmentEngine } from '@/lib/algorithms/smart-assignment'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Request validation schema
const SmartAssignmentRequestSchema = z.object({
  party_size: z.number().min(1).max(20),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservation_time: z.string().regex(/^\d{2}:\d{2}$/),
  preferred_zone: z.string().optional(),
  special_requirements: z.array(z.string()).optional(),
  customer_vip_status: z.boolean().optional().default(false)
})

// Response interface
interface SmartAssignmentResponse {
  success: boolean
  recommendations: Array<{
    algorithm_type: 'optimal' | 'balanced' | 'historical'
    table_ids: string[]
    table_numbers: string[]
    confidence_score: number
    revenue_impact: number
    utilization_improvement: number
    reasoning: string
    estimated_capacity: number
  }>
  execution_time_ms: number
  metadata: {
    total_available_tables: number
    peak_hour_indicator: boolean
    zone_availability: Record<string, number>
  }
  error?: string
}

/**
 * POST /api/tables/smart-assignment
 * Returns intelligent table assignment recommendations
 */
export async function POST(request: NextRequest): Promise<NextResponse<SmartAssignmentResponse>> {
  const startTime = Date.now()

  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedRequest = SmartAssignmentRequestSchema.parse(body)

    // Initialize smart assignment engine
    const assignmentEngine = new SmartAssignmentEngine()

    // Get smart recommendations
    const assignmentResult = await assignmentEngine.getSmartAssignments(validatedRequest)

    if (!assignmentResult.success) {
      return NextResponse.json({
        success: false,
        recommendations: [],
        execution_time_ms: Date.now() - startTime,
        metadata: {
          total_available_tables: 0,
          peak_hour_indicator: false,
          zone_availability: {}
        },
        error: assignmentResult.error
      }, { status: 400 })
    }

    // Enrich recommendations with additional table information
    const enrichedRecommendations = await enrichRecommendations(
      assignmentResult.recommendations
    )

    // Get availability metadata
    const metadata = await getAvailabilityMetadata(
      validatedRequest.reservation_date,
      validatedRequest.reservation_time
    )

    const response: SmartAssignmentResponse = {
      success: true,
      recommendations: enrichedRecommendations,
      execution_time_ms: assignmentResult.execution_time_ms,
      metadata
    }

    // Add performance headers
    const responseHeaders = {
      'X-Assignment-Time': assignmentResult.execution_time_ms.toString(),
      'X-Recommendations-Count': enrichedRecommendations.length.toString(),
      'Cache-Control': 'private, max-age=300' // 5-minute cache for similar requests
    }

    return NextResponse.json(response, {
      status: 200,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('Smart assignment error:', error)

    const errorResponse: SmartAssignmentResponse = {
      success: false,
      recommendations: [],
      execution_time_ms: Date.now() - startTime,
      metadata: {
        total_available_tables: 0,
        peak_hour_indicator: false,
        zone_availability: {}
      },
      error: error instanceof z.ZodError
        ? `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        : 'Internal server error'
    }

    return NextResponse.json(errorResponse, {
      status: error instanceof z.ZodError ? 400 : 500
    })
  }
}

/**
 * GET /api/tables/smart-assignment/metrics
 * Returns performance metrics and algorithm statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: { schema: 'public' }
      }
    )

    // Get recent performance metrics
    const { data: performanceData, error: perfError } = await supabase
      .from('assignment_performance_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(100)

    if (perfError) {
      throw new Error(`Failed to fetch performance data: ${perfError.message}`)
    }

    // Calculate metrics by algorithm type
    const algorithmMetrics = performanceData?.reduce((acc, log) => {
      const algo = log.algorithm_type
      if (!acc[algo]) {
        acc[algo] = {
          total_requests: 0,
          avg_execution_time: 0,
          avg_confidence: 0,
          avg_revenue_impact: 0,
          success_rate: 0
        }
      }

      acc[algo].total_requests += 1
      acc[algo].avg_execution_time += log.execution_time_ms
      acc[algo].avg_confidence += log.confidence_score
      acc[algo].avg_revenue_impact += log.revenue_impact || 0

      return acc
    }, {} as Record<string, any>) || {}

    // Calculate averages
    Object.values(algorithmMetrics).forEach((metrics: any) => {
      const total = metrics.total_requests
      metrics.avg_execution_time = Math.round(metrics.avg_execution_time / total)
      metrics.avg_confidence = Math.round(metrics.avg_confidence / total)
      metrics.avg_revenue_impact = Math.round(metrics.avg_revenue_impact / total)
      metrics.success_rate = 100 // Simplified - would need actual success tracking
    })

    // Get current zone utilization
    const { data: zoneData, error: zoneError } = await supabase
      .from('zone_utilization_targets')
      .select('zone_name, current_utilization_percentage, target_utilization_percentage')

    if (zoneError) {
      console.warn('Failed to fetch zone data:', zoneError.message)
    }

    return NextResponse.json({
      success: true,
      algorithm_performance: algorithmMetrics,
      zone_utilization: zoneData || [],
      total_requests_24h: performanceData?.length || 0,
      avg_response_time: Object.values(algorithmMetrics)
        .reduce((sum: number, metrics: any) => sum + metrics.avg_execution_time, 0) /
        Object.keys(algorithmMetrics).length || 0
    })

  } catch (error) {
    console.error('Metrics fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Enrich recommendations with detailed table information
 */
async function enrichRecommendations(
  recommendations: Array<{
    algorithm_type: 'optimal' | 'balanced' | 'historical'
    table_ids: string[]
    confidence_score: number
    revenue_impact: number
    utilization_improvement: number
    reasoning: string
  }>
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'public' }
    }
  )

  const enrichedRecommendations = await Promise.all(
    recommendations.map(async (rec) => {
      // Get table details
      const { data: tables, error } = await supabase
        .from('tables')
        .select('id, number, capacity, location')
        .in('id', rec.table_ids)

      if (error) {
        console.warn('Failed to fetch table details:', error.message)
      }

      const tableNumbers = tables?.map(t => t.number) || []
      const estimatedCapacity = tables?.reduce((sum, t) => sum + (t.capacity || 0), 0) || 0

      return {
        ...rec,
        table_numbers: tableNumbers,
        estimated_capacity: estimatedCapacity
      }
    })
  )

  return enrichedRecommendations
}

/**
 * Get availability metadata for the requested time slot
 */
async function getAvailabilityMetadata(date: string, time: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'public' }
    }
  )

  // Get total available tables
  const { data: allTables, error } = await supabase
    .from('tables')
    .select('id, location, capacity')
    .eq('isActive', true)
    .eq('currentstatus', 'available')

  if (error) {
    console.warn('Failed to fetch table metadata:', error.message)
  }

  // Determine if it's peak hour (19:00-22:00)
  const hour = new Date(`2000-01-01T${time}`).getHours()
  const isPeakHour = hour >= 19 && hour <= 22

  // Group by zone/location
  const zoneAvailability = allTables?.reduce((acc, table) => {
    const zone = table.location || 'main_dining'
    acc[zone] = (acc[zone] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    total_available_tables: allTables?.length || 0,
    peak_hour_indicator: isPeakHour,
    zone_availability: zoneAvailability
  }
}