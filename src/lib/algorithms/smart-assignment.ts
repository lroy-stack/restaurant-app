/**
 * Smart Table Assignment Algorithms for Enigma Restaurant Platform
 * Implements 3 algorithm types: Optimal, Balanced, Historical
 * Target: <200ms response time, +15% utilization improvement
 */

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface TableInfo {
  id: string
  number: string
  capacity: number
  location: string
  zone_name?: string
  current_utilization?: number
}

export interface AssignmentRequest {
  party_size: number
  reservation_date: string
  reservation_time: string
  preferred_zone?: string
  special_requirements?: string[]
  customer_vip_status?: boolean
}

export interface AssignmentRecommendation {
  algorithm_type: 'optimal' | 'balanced' | 'historical'
  table_ids: string[]
  confidence_score: number
  revenue_impact: number
  utilization_improvement: number
  reasoning: string
}

export interface AssignmentResult {
  recommendations: AssignmentRecommendation[]
  execution_time_ms: number
  success: boolean
  error?: string
}

export class SmartAssignmentEngine {
  private supabase: SupabaseClient

  constructor() {
    // Initialize with service role key for server-side operations
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: { schema: 'restaurante' }
      }
    )
  }

  /**
   * Get Supabase client instance
   */
  private getClient(): SupabaseClient {
    return this.supabase
  }

  /**
   * Main entry point for smart table assignment
   * Returns 3 algorithm recommendations ranked by confidence
   */
  async getSmartAssignments(request: AssignmentRequest): Promise<AssignmentResult> {
    const startTime = Date.now()

    try {
      // Get available tables for the requested time slot
      const availableTables = await this.getAvailableTables(
        request.reservation_date,
        request.reservation_time
      )

      if (availableTables.length === 0) {
        return {
          recommendations: [],
          execution_time_ms: Date.now() - startTime,
          success: false,
          error: 'No tables available for the requested time slot'
        }
      }

      // Run all three algorithms in parallel for best performance
      const [optimal, balanced, historical] = await Promise.all([
        this.optimalAssignmentAlgorithm(request, availableTables),
        this.balancedAssignmentAlgorithm(request, availableTables),
        this.historicalPatternAlgorithm(request, availableTables)
      ])

      // Rank recommendations by confidence score
      const recommendations = [optimal, balanced, historical]
        .filter(rec => rec.confidence_score > 0)
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 3)

      const executionTime = Date.now() - startTime

      // Log performance metrics
      await this.logPerformanceMetrics(recommendations, executionTime, request)

      return {
        recommendations,
        execution_time_ms: executionTime,
        success: true
      }
    } catch (error) {
      return {
        recommendations: [],
        execution_time_ms: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Algorithm 1: Optimal Assignment (Revenue Maximization)
   * Minimizes table waste while maximizing utilization score
   */
  private async optimalAssignmentAlgorithm(
    request: AssignmentRequest,
    availableTables: TableInfo[]
  ): Promise<AssignmentRecommendation> {
    const { party_size, customer_vip_status } = request

    // Score tables based on capacity efficiency and revenue potential
    const tableScores = availableTables.map(table => {
      const capacityEfficiency = party_size / table.capacity
      const wasteScore = capacityEfficiency > 1 ? 0 : (1 - Math.abs(1 - capacityEfficiency))
      const vipBonus = customer_vip_status && table.zone_name === 'private_room' ? 0.2 : 0
      const utilizationBonus = (table.current_utilization || 0) < 70 ? 0.1 : 0

      return {
        table,
        score: wasteScore + vipBonus + utilizationBonus,
        revenue_impact: this.calculateRevenueImpact(table, party_size)
      }
    })

    // Sort by score and select optimal combination
    tableScores.sort((a, b) => b.score - a.score)

    let selectedTables: TableInfo[] = []
    let remainingPartySize = party_size

    // Greedy selection with capacity optimization
    for (const tableScore of tableScores) {
      if (remainingPartySize <= 0) break

      const table = tableScore.table
      if (table.capacity >= remainingPartySize || selectedTables.length === 0) {
        selectedTables.push(table)
        remainingPartySize -= table.capacity
      }
    }

    // Ensure we have enough capacity
    const totalCapacity = selectedTables.reduce((sum, table) => sum + table.capacity, 0)
    if (totalCapacity < party_size) {
      // Fallback: select largest available tables
      selectedTables = availableTables
        .sort((a, b) => b.capacity - a.capacity)
        .slice(0, Math.ceil(party_size / 4)) // Assume avg 4 persons per table
    }

    const confidence = this.calculateConfidenceScore(selectedTables, party_size, 'optimal')
    const revenueImpact = selectedTables.reduce(
      (sum, table) => sum + this.calculateRevenueImpact(table, party_size),
      0
    )

    return {
      algorithm_type: 'optimal',
      table_ids: selectedTables.map(t => t.id),
      confidence_score: confidence,
      revenue_impact: revenueImpact,
      utilization_improvement: this.calculateUtilizationImprovement(selectedTables),
      reasoning: `Optimal capacity utilization with ${Math.round(confidence)}% efficiency. Selected ${selectedTables.length} table(s) with minimal waste.`
    }
  }

  /**
   * Algorithm 2: Balanced Assignment (Zone Distribution)
   * Targets 75% utilization across all zones
   */
  private async balancedAssignmentAlgorithm(
    request: AssignmentRequest,
    availableTables: TableInfo[]
  ): Promise<AssignmentRecommendation> {
    const { party_size, preferred_zone } = request

    // Get current zone utilization
    const zoneUtilization = await this.getCurrentZoneUtilization()

    // Score tables based on zone balancing needs
    const tableScores = availableTables.map(table => {
      const zoneUtil = zoneUtilization.find(z => z.zone_name === table.zone_name)
      const currentUtil = zoneUtil?.current_utilization || 0
      const targetUtil = zoneUtil?.target_utilization || 75

      // Prefer zones that are under-utilized
      const balanceScore = Math.max(0, (targetUtil - currentUtil) / targetUtil)
      const preferenceBonus = preferred_zone === table.zone_name ? 0.3 : 0
      const capacityScore = Math.min(1, party_size / table.capacity)

      return {
        table,
        score: balanceScore + preferenceBonus + capacityScore,
        zone_name: table.zone_name || 'main_dining'
      }
    })

    // Group by zone and select diverse distribution
    const zoneGroups = new Map<string, typeof tableScores>()
    tableScores.forEach(tableScore => {
      const zone = tableScore.zone_name
      if (!zoneGroups.has(zone)) {
        zoneGroups.set(zone, [])
      }
      zoneGroups.get(zone)!.push(tableScore)
    })

    const selectedTables: TableInfo[] = []
    let remainingPartySize = party_size

    // Distribute across zones starting with most under-utilized
    const sortedZones = Array.from(zoneGroups.entries())
      .sort(([, tablesA], [, tablesB]) =>
        Math.max(...tablesB.map(t => t.score)) - Math.max(...tablesA.map(t => t.score))
      )

    for (const [zoneName, zoneTables] of sortedZones) {
      if (remainingPartySize <= 0) break

      // Select best table from this zone
      const bestTable = zoneTables
        .sort((a, b) => b.score - a.score)[0]?.table

      if (bestTable && bestTable.capacity > 0) {
        selectedTables.push(bestTable)
        remainingPartySize -= bestTable.capacity
      }
    }

    const confidence = this.calculateConfidenceScore(selectedTables, party_size, 'balanced')
    const revenueImpact = selectedTables.reduce(
      (sum, table) => sum + this.calculateRevenueImpact(table, party_size),
      0
    )

    return {
      algorithm_type: 'balanced',
      table_ids: selectedTables.map(t => t.id),
      confidence_score: confidence,
      revenue_impact: revenueImpact,
      utilization_improvement: this.calculateUtilizationImprovement(selectedTables),
      reasoning: `Balanced zone distribution optimizing restaurant flow. Selected tables across ${new Set(selectedTables.map(t => t.zone_name)).size} zones.`
    }
  }

  /**
   * Algorithm 3: Historical Pattern Matching
   * Learns from successful past reservations (80%+ success rate)
   */
  private async historicalPatternAlgorithm(
    request: AssignmentRequest,
    availableTables: TableInfo[]
  ): Promise<AssignmentRecommendation> {
    const { party_size, reservation_time } = request
    const hour = new Date(`2000-01-01T${reservation_time}`).getHours()

    // Query historical success patterns
    const patterns = await this.getSuccessfulPatterns(party_size, hour, request.preferred_zone)

    if (patterns.length === 0) {
      // Fallback to simple capacity matching
      const fallbackTables = availableTables
        .filter(table => table.capacity >= party_size)
        .sort((a, b) => a.capacity - b.capacity)
        .slice(0, 1)

      return {
        algorithm_type: 'historical',
        table_ids: fallbackTables.map(t => t.id),
        confidence_score: 30, // Low confidence for fallback
        revenue_impact: fallbackTables.reduce(
          (sum, table) => sum + this.calculateRevenueImpact(table, party_size),
          0
        ),
        utilization_improvement: 5,
        reasoning: 'Limited historical data available. Using basic capacity matching.'
      }
    }

    // Find best matching pattern
    const bestPattern = patterns
      .sort((a, b) => b.success_rate - a.success_rate)[0]

    // Parse table configuration from successful pattern
    let selectedTables: TableInfo[] = []
    try {
      const tableConfig = JSON.parse(bestPattern.table_configuration || '[]')
      selectedTables = availableTables.filter(table =>
        tableConfig.some((configTable: any) =>
          table.capacity === configTable.capacity &&
          table.zone_name === configTable.zone_name
        )
      )
    } catch {
      // Fallback if JSON parsing fails
      selectedTables = availableTables
        .filter(table => table.capacity >= party_size)
        .slice(0, 1)
    }

    const confidence = Math.min(95, bestPattern.success_rate + 10) // Cap at 95%
    const revenueImpact = selectedTables.reduce(
      (sum, table) => sum + this.calculateRevenueImpact(table, party_size),
      0
    )

    return {
      algorithm_type: 'historical',
      table_ids: selectedTables.map(t => t.id),
      confidence_score: confidence,
      revenue_impact: revenueImpact,
      utilization_improvement: this.calculateUtilizationImprovement(selectedTables),
      reasoning: `Based on historical pattern with ${Math.round(bestPattern.success_rate)}% success rate. Similar reservations generated €${Math.round(bestPattern.average_revenue)} average revenue.`
    }
  }

  /**
   * Get available tables for specific date/time
   */
  private async getAvailableTables(date: string, time: string): Promise<TableInfo[]> {
    const supabase = this.getClient()

    const { data: tables, error } = await supabase
      .from('tables')
      .select(`
        id,
        number,
        capacity,
        location,
        zone_name:location
      `)
      .eq('isActive', true)
      .eq('currentstatus', 'available')

    if (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`)
    }

    // TODO: Check for conflicting reservations
    // For now, return all available tables
    return tables || []
  }

  /**
   * Get current zone utilization metrics
   */
  private async getCurrentZoneUtilization() {
    const supabase = this.getClient()

    const { data, error } = await supabase
      .from('zone_utilization_targets')
      .select('zone_name, target_utilization_percentage, current_utilization_percentage')

    if (error) {
      console.warn('Failed to fetch zone utilization:', error.message)
      return []
    }

    return data?.map(row => ({
      zone_name: row.zone_name,
      target_utilization: row.target_utilization_percentage,
      current_utilization: row.current_utilization_percentage
    })) || []
  }

  /**
   * Get successful historical patterns
   */
  private async getSuccessfulPatterns(partySize: number, hour: number, preferredZone?: string) {
    const supabase = this.getClient()

    let query = supabase
      .from('reservation_success_patterns')
      .select('*')
      .eq('party_size', partySize)
      .eq('time_slot', hour)
      .gte('success_rate', 80)
      .order('success_rate', { ascending: false })
      .limit(5)

    if (preferredZone) {
      query = query.eq('preferred_zone', preferredZone)
    }

    const { data, error } = await query

    if (error) {
      console.warn('Failed to fetch success patterns:', error.message)
      return []
    }

    return data || []
  }

  /**
   * Calculate confidence score for assignment
   */
  private calculateConfidenceScore(
    selectedTables: TableInfo[],
    partySize: number,
    algorithmType: string
  ): number {
    const totalCapacity = selectedTables.reduce((sum, table) => sum + table.capacity, 0)
    const capacityScore = Math.min(100, (totalCapacity / partySize) * 50)
    const wasteScore = totalCapacity > partySize
      ? Math.max(0, 100 - ((totalCapacity - partySize) / partySize) * 30)
      : 100

    // Algorithm-specific bonuses
    let algorithmBonus = 0
    if (algorithmType === 'optimal') algorithmBonus = 10
    if (algorithmType === 'balanced') algorithmBonus = 5
    if (algorithmType === 'historical') algorithmBonus = 15

    return Math.min(95, capacityScore + wasteScore + algorithmBonus) / 2
  }

  /**
   * Calculate potential revenue impact
   */
  private calculateRevenueImpact(table: TableInfo, partySize: number): number {
    // Estimated revenue per person based on table location
    const baseRevenuePerPerson = table.zone_name === 'private_room' ? 65
      : table.zone_name === 'window_seats' ? 55
      : table.zone_name === 'terrace' ? 50
      : 45 // main_dining

    return Math.min(partySize, table.capacity) * baseRevenuePerPerson
  }

  /**
   * Calculate utilization improvement percentage
   */
  private calculateUtilizationImprovement(selectedTables: TableInfo[]): number {
    // Simplified calculation - in practice, this would compare with historical utilization
    const avgImprovement = selectedTables.length * 3.5 // ~3.5% per optimally assigned table
    return Math.min(20, avgImprovement)
  }

  /**
   * Log performance metrics for algorithm optimization
   */
  private async logPerformanceMetrics(
    recommendations: AssignmentRecommendation[],
    executionTimeMs: number,
    request: AssignmentRequest
  ) {
    try {
      const supabase = this.getClient()

      const logs = recommendations.map(rec => ({
        algorithm_type: rec.algorithm_type,
        party_size: request.party_size,
        assigned_table_ids: rec.table_ids,
        confidence_score: rec.confidence_score,
        execution_time_ms: executionTimeMs,
        revenue_impact: rec.revenue_impact,
        utilization_improvement: rec.utilization_improvement
      }))

      await supabase
        .from('assignment_performance_logs')
        .insert(logs)
    } catch (error) {
      console.warn('Failed to log performance metrics:', error)
    }
  }
}