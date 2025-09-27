/**
 * ENIGMA SMART TABLE ASSIGNMENT ALGORITHMS
 * Performance Target: O(n log n) complexity, <200ms response time
 * Revenue Target: +15% utilization during peak hours (19:00-22:00)
 */

export interface TableData {
  id: string
  number: string
  capacity: number
  zone: string
  position: { x: number; y: number }
  currentStatus: string
  estimatedFreeTime?: string
}

export interface UtilizationMetrics {
  zoneUtilization: Record<string, number> // zone -> utilization_rate (0.0-1.0)
  tableMetrics: Record<string, {
    utilizationRate: number
    revenueGenerated: number
    averagePartySize: number
    turnCount: number
  }>
  peakHourMetrics: {
    targetUtilization: number
    currentUtilization: number
    capacityRemaining: number
  }
}

export interface AssignmentContext {
  partySize: number
  requestedDateTime: Date
  duration: number
  preferredZone?: string
  isVip: boolean
  occasion?: string
  customerHistory?: {
    previousReservations: number
    averageSpend: number
    preferredTables: string[]
  }
}

export interface AssignmentResult {
  tableIds: string[]
  confidence: number
  algorithm: 'optimal' | 'balanced' | 'historical'
  utilizationImpact: number
  revenueProjection: number
  reasoning: string
  alternativeOptions?: AssignmentResult[]
  warnings?: string[]
}

/**
 * ALGORITHM 1: OPTIMAL ASSIGNMENT (Revenue Maximization)
 *
 * OBJECTIVE: Maximize revenue per table while minimizing waste
 * COMPLEXITY: O(n log n) for sorting + O(k²) for combinations where k ≤ 4
 * TARGET: 15% revenue increase during peak hours
 */
export class OptimalAssignmentAlgorithm {

  static execute(
    availableTables: TableData[],
    context: AssignmentContext,
    metrics: UtilizationMetrics
  ): AssignmentResult {

    const startTime = performance.now()
    const { partySize, isVip, requestedDateTime } = context

    // STEP 1: Score individual tables for efficiency
    // Time Complexity: O(n)
    const tableScores = availableTables.map(table => {

      // Core efficiency metrics
      const capacityEfficiency = partySize / table.capacity // 0.5-1.0 range
      const wasteScore = 1 - Math.max(0, (table.capacity - partySize) / table.capacity)

      // Zone utilization bonus (spread load to underutilized zones)
      const zoneUtil = metrics.zoneUtilization[table.zone] || 0
      const utilizationBonus = (1 - zoneUtil) * 0.3 // Max 30% bonus

      // VIP preference bonus
      const vipBonus = isVip && table.zone === 'WINDOW' ? 0.2 : 0

      // Peak hour optimization
      const hour = requestedDateTime.getHours()
      const isPeakHour = hour >= 19 && hour <= 21
      const peakOptimization = isPeakHour ? wasteScore * 0.25 : 0

      // Revenue potential based on zone
      const zoneRevenue = this.getZoneRevenueMultiplier(table.zone)

      const totalScore = (
        capacityEfficiency * 0.4 +
        wasteScore * 0.3 +
        utilizationBonus * 0.15 +
        vipBonus * 0.1 +
        peakOptimization * 0.05
      ) * zoneRevenue

      return {
        table,
        score: totalScore,
        efficiency: capacityEfficiency,
        waste: 1 - wasteScore,
        reasoning: `Efficiency: ${(capacityEfficiency * 100).toFixed(0)}%, Waste: ${((1-wasteScore) * 100).toFixed(0)}%`
      }
    })

    // STEP 2: Sort by score (O(n log n))
    tableScores.sort((a, b) => b.score - a.score)

    // STEP 3: Handle large parties with table combinations
    // Time Complexity: O(k²) where k = min(n, 6) for performance
    if (partySize > Math.max(...availableTables.map(t => t.capacity))) {
      const combinations = this.findOptimalCombinations(tableScores, partySize)

      if (combinations.length > 0) {
        const bestCombo = combinations[0]
        const processingTime = performance.now() - startTime

        return {
          tableIds: bestCombo.tableIds,
          confidence: Math.min(0.95, bestCombo.score),
          algorithm: 'optimal',
          utilizationImpact: this.calculateUtilizationImpact(bestCombo.tableIds, metrics),
          revenueProjection: this.estimateRevenue(partySize, bestCombo.tableIds, metrics),
          reasoning: `Multi-table optimization: ${bestCombo.reasoning}`,
          alternativeOptions: combinations.slice(1, 3).map(combo => ({
            tableIds: combo.tableIds,
            confidence: combo.score,
            algorithm: 'optimal' as const,
            utilizationImpact: this.calculateUtilizationImpact(combo.tableIds, metrics),
            revenueProjection: this.estimateRevenue(partySize, combo.tableIds, metrics),
            reasoning: combo.reasoning
          }))
        }
      }
    }

    // STEP 4: Single table assignment
    const bestTable = tableScores[0]
    const processingTime = performance.now() - startTime

    // Performance warning if too slow
    const warnings = processingTime > 150 ? ['Processing time exceeded 150ms target'] : undefined

    return {
      tableIds: [bestTable.table.id],
      confidence: Math.min(0.98, bestTable.score),
      algorithm: 'optimal',
      utilizationImpact: this.calculateUtilizationImpact([bestTable.table.id], metrics),
      revenueProjection: this.estimateRevenue(partySize, [bestTable.table.id], metrics),
      reasoning: `Optimal revenue selection: ${bestTable.reasoning}`,
      warnings
    }
  }

  private static findOptimalCombinations(
    tableScores: Array<{table: TableData, score: number}>,
    partySize: number
  ) {
    const combinations = []
    const maxTables = Math.min(tableScores.length, 6) // Limit for performance

    // Two-table combinations (most common)
    for (let i = 0; i < maxTables; i++) {
      for (let j = i + 1; j < maxTables; j++) {
        const tables = [tableScores[i].table, tableScores[j].table]
        const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)

        if (totalCapacity >= partySize && totalCapacity <= partySize + 6) {
          const efficiency = partySize / totalCapacity
          const combinedScore = (tableScores[i].score + tableScores[j].score) / 2 * efficiency

          combinations.push({
            tableIds: tables.map(t => t.id),
            score: combinedScore,
            capacity: totalCapacity,
            reasoning: `${tables.map(t => t.number).join('+')} (${totalCapacity} seats, ${(efficiency * 100).toFixed(0)}% efficient)`
          })
        }
      }
    }

    // Three-table combinations (for very large parties)
    if (partySize >= 16) {
      for (let i = 0; i < Math.min(maxTables, 4); i++) {
        for (let j = i + 1; j < Math.min(maxTables, 4); j++) {
          for (let k = j + 1; k < Math.min(maxTables, 4); k++) {
            const tables = [tableScores[i].table, tableScores[j].table, tableScores[k].table]
            const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)

            if (totalCapacity >= partySize && totalCapacity <= partySize + 8) {
              const efficiency = partySize / totalCapacity
              const combinedScore = (tableScores[i].score + tableScores[j].score + tableScores[k].score) / 3 * efficiency

              combinations.push({
                tableIds: tables.map(t => t.id),
                score: combinedScore,
                capacity: totalCapacity,
                reasoning: `${tables.map(t => t.number).join('+')} (${totalCapacity} seats, ${(efficiency * 100).toFixed(0)}% efficient)`
              })
            }
          }
        }
      }
    }

    return combinations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 combinations
  }

  private static getZoneRevenueMultiplier(zone: string): number {
    const multipliers = {
      'WINDOW': 1.25,
      'CENTER': 1.0,
      'BAR': 1.15,
      'TERRACE': 1.1,
      'PRIVATE': 1.3
    }
    return multipliers[zone as keyof typeof multipliers] || 1.0
  }

  private static calculateUtilizationImpact(tableIds: string[], metrics: UtilizationMetrics): number {
    // Calculate the utilization increase this assignment would cause
    let totalImpact = 0

    tableIds.forEach(tableId => {
      const tableMetric = metrics.tableMetrics[tableId]
      if (tableMetric) {
        totalImpact += 0.1 // Each table adds ~10% to local utilization
      }
    })

    return Math.min(totalImpact, 1.0)
  }

  private static estimateRevenue(partySize: number, tableIds: string[], metrics: UtilizationMetrics): number {
    const baseRevenue = partySize * 45 // €45 average per person
    const peakMultiplier = 1.15 // 15% boost during optimal assignment

    // Zone-based revenue adjustment
    let zoneMultiplier = 1.0
    tableIds.forEach(tableId => {
      const tableMetric = metrics.tableMetrics[tableId]
      if (tableMetric) {
        zoneMultiplier = Math.max(zoneMultiplier, 1.1) // Premium tables
      }
    })

    return baseRevenue * peakMultiplier * zoneMultiplier
  }
}

/**
 * ALGORITHM 2: BALANCED ASSIGNMENT (Zone Distribution)
 *
 * OBJECTIVE: Maintain 75% target utilization across all zones
 * COMPLEXITY: O(n) for zone grouping + O(n log n) for sorting
 * TARGET: Even distribution to prevent overcrowding and service delays
 */
export class BalancedAssignmentAlgorithm {

  static execute(
    availableTables: TableData[],
    context: AssignmentContext,
    metrics: UtilizationMetrics
  ): AssignmentResult {

    const { partySize, requestedDateTime } = context
    const targetUtilization = 0.75 // 75% target

    // STEP 1: Group tables by zone and calculate current loads
    // Time Complexity: O(n)
    const zoneGroups = this.groupTablesByZone(availableTables, metrics)

    // STEP 2: Calculate zone balance scores
    // Time Complexity: O(z) where z = number of zones
    const zoneScores = Object.entries(zoneGroups).map(([zone, data]) => {
      const currentUtilization = metrics.zoneUtilization[zone] || 0
      const afterUtilization = currentUtilization + (partySize / data.totalCapacity)

      // Score based on distance from target utilization
      const balanceScore = 1 - Math.abs(targetUtilization - afterUtilization)

      // Penalty for exceeding maximum utilization (95%)
      const overloadPenalty = afterUtilization > 0.95 ? -0.5 : 0

      // Bonus for zones under target
      const underutilizedBonus = currentUtilization < targetUtilization ? 0.2 : 0

      return {
        zone,
        tables: data.tables,
        currentUtilization,
        projectedUtilization: afterUtilization,
        score: balanceScore + overloadPenalty + underutilizedBonus,
        reasoning: `${zone}: ${(currentUtilization * 100).toFixed(0)}% → ${(afterUtilization * 100).toFixed(0)}%`
      }
    })

    // STEP 3: Sort zones by balance score
    // Time Complexity: O(z log z)
    zoneScores.sort((a, b) => b.score - a.score)

    // STEP 4: Find best table in best zone
    // Time Complexity: O(n log n) for sorting tables within zone
    const bestZone = zoneScores[0]

    const suitableTables = bestZone.tables
      .filter(table => table.capacity >= partySize)
      .map(table => ({
        table,
        wasteScore: 1 - Math.max(0, (table.capacity - partySize) / table.capacity),
        capacityMatch: partySize / table.capacity
      }))
      .sort((a, b) => {
        // Prioritize by capacity match first, then waste minimization
        const matchDiff = Math.abs(a.capacityMatch - 1) - Math.abs(b.capacityMatch - 1)
        return matchDiff !== 0 ? matchDiff : b.wasteScore - a.wasteScore
      })

    if (suitableTables.length === 0) {
      // Fallback to next best zone or optimal algorithm
      const fallbackZone = zoneScores.find(z => z.tables.some(t => t.capacity >= partySize))
      if (!fallbackZone) {
        return OptimalAssignmentAlgorithm.execute(availableTables, context, metrics)
      }

      const fallbackTable = fallbackZone.tables
        .filter(t => t.capacity >= partySize)
        .sort((a, b) => Math.abs(a.capacity - partySize) - Math.abs(b.capacity - partySize))[0]

      return {
        tableIds: [fallbackTable.id],
        confidence: 0.7, // Lower confidence for fallback
        algorithm: 'balanced',
        utilizationImpact: this.calculateBalanceImpact(fallbackTable.id, fallbackZone.zone, metrics),
        revenueProjection: this.estimateBalancedRevenue(partySize),
        reasoning: `Fallback to ${fallbackZone.zone}: ${fallbackZone.reasoning}`,
        warnings: ['Primary zone unavailable, used fallback']
      }
    }

    const selectedTable = suitableTables[0].table
    const confidence = Math.min(0.92, bestZone.score * suitableTables[0].wasteScore)

    return {
      tableIds: [selectedTable.id],
      confidence,
      algorithm: 'balanced',
      utilizationImpact: this.calculateBalanceImpact(selectedTable.id, bestZone.zone, metrics),
      revenueProjection: this.estimateBalancedRevenue(partySize),
      reasoning: `Zone balancing: ${bestZone.reasoning}`,
      alternativeOptions: zoneScores.slice(1, 3).map(zone => {
        const altTable = zone.tables.find(t => t.capacity >= partySize)
        return altTable ? {
          tableIds: [altTable.id],
          confidence: zone.score * 0.8,
          algorithm: 'balanced' as const,
          utilizationImpact: this.calculateBalanceImpact(altTable.id, zone.zone, metrics),
          revenueProjection: this.estimateBalancedRevenue(partySize),
          reasoning: `Alternative: ${zone.reasoning}`
        } : null
      }).filter(Boolean) as AssignmentResult[]
    }
  }

  private static groupTablesByZone(tables: TableData[], metrics: UtilizationMetrics) {
    return tables.reduce((acc, table) => {
      if (!acc[table.zone]) {
        acc[table.zone] = {
          tables: [],
          totalCapacity: 0,
          currentUtilization: metrics.zoneUtilization[table.zone] || 0
        }
      }

      acc[table.zone].tables.push(table)
      acc[table.zone].totalCapacity += table.capacity

      return acc
    }, {} as Record<string, {
      tables: TableData[]
      totalCapacity: number
      currentUtilization: number
    }>)
  }

  private static calculateBalanceImpact(tableId: string, zone: string, metrics: UtilizationMetrics): number {
    const currentZoneUtil = metrics.zoneUtilization[zone] || 0
    const targetUtil = 0.75

    // Impact is how much closer we get to target utilization
    return Math.abs(targetUtil - currentZoneUtil) * 0.1
  }

  private static estimateBalancedRevenue(partySize: number): number {
    return partySize * 45 * 1.08 // 8% boost for balanced distribution
  }
}

/**
 * ALGORITHM 3: HISTORICAL PATTERN MATCHING
 *
 * OBJECTIVE: Learn from past successful reservations (80%+ success rate)
 * COMPLEXITY: O(log p) for pattern query + O(n) for table matching
 * TARGET: Maximize satisfaction based on proven configurations
 */
export class HistoricalPatternAlgorithm {

  static async execute(
    availableTables: TableData[],
    context: AssignmentContext,
    metrics: UtilizationMetrics
  ): Promise<AssignmentResult> {

    const { partySize, requestedDateTime } = context

    // STEP 1: Build pattern query parameters
    const dayOfWeek = requestedDateTime.getDay()
    const hour = requestedDateTime.getHours()
    const timeSlot = this.getTimeSlot(hour)
    const season = this.getSeason(requestedDateTime)

    // STEP 2: Query historical success patterns
    // Database query with indexes: O(log p) where p = pattern count
    const patterns = await this.queryHistoricalPatterns(
      partySize,
      dayOfWeek,
      timeSlot,
      season
    )

    if (patterns.length === 0) {
      return OptimalAssignmentAlgorithm.execute(availableTables, context, metrics)
    }

    // STEP 3: Match patterns with available tables
    // Time Complexity: O(p * n) where p = patterns, n = available tables
    const matchedPatterns = patterns
      .map(pattern => {
        const availableTableIds = pattern.table_configuration.filter((tableId: string) =>
          availableTables.some(t => t.id === tableId)
        )

        if (availableTableIds.length === 0) return null

        // Calculate pattern confidence based on historical success
        const baseConfidence = pattern.success_rate
        const sampleSizeBonus = Math.min(0.1, pattern.sample_size / 100) // Max 10% bonus
        const recencyBonus = this.calculateRecencyBonus(pattern.last_updated)

        const totalConfidence = Math.min(0.96, baseConfidence + sampleSizeBonus + recencyBonus)

        return {
          tableIds: availableTableIds,
          confidence: totalConfidence,
          pattern,
          reasoning: `Historical success: ${(pattern.success_rate * 100).toFixed(0)}% (${pattern.sample_size} samples)`
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.confidence - a!.confidence)

    if (matchedPatterns.length === 0) {
      return OptimalAssignmentAlgorithm.execute(availableTables, context, metrics)
    }

    const bestMatch = matchedPatterns[0]!

    return {
      tableIds: bestMatch.tableIds,
      confidence: bestMatch.confidence,
      algorithm: 'historical',
      utilizationImpact: this.calculatePatternImpact(bestMatch.tableIds, metrics),
      revenueProjection: bestMatch.pattern.avg_revenue_per_cover * partySize,
      reasoning: bestMatch.reasoning,
      alternativeOptions: matchedPatterns.slice(1, 3).map(match => ({
        tableIds: match!.tableIds,
        confidence: match!.confidence,
        algorithm: 'historical' as const,
        utilizationImpact: this.calculatePatternImpact(match!.tableIds, metrics),
        revenueProjection: match!.pattern.avg_revenue_per_cover * partySize,
        reasoning: match!.reasoning
      }))
    }
  }

  private static async queryHistoricalPatterns(
    partySize: number,
    dayOfWeek: number,
    timeSlot: string,
    season: string
  ) {
    // This would be replaced with actual Supabase query in implementation
    // Using indexed query for O(log p) performance
    const query = `
      SELECT * FROM restaurante.reservation_success_patterns
      WHERE party_size = $1
        AND day_of_week = $2
        AND time_slot LIKE '%${timeSlot}%'
        AND season = $3
        AND success_rate >= 0.8
        AND sample_size >= 5
      ORDER BY success_rate DESC, sample_size DESC
      LIMIT 10
    `

    // Mock data for algorithm demonstration
    return [
      {
        party_size: partySize,
        time_slot: `${timeSlot}-${timeSlot + 2}:30`,
        day_of_week: dayOfWeek,
        season,
        table_configuration: ['table_1', 'table_2'],
        success_rate: 0.92,
        avg_duration_minutes: 120,
        avg_revenue_per_cover: 48.50,
        sample_size: 25,
        last_updated: new Date('2024-12-20')
      }
    ]
  }

  private static getTimeSlot(hour: number): string {
    if (hour >= 12 && hour < 15) return '12:00-15:00'
    if (hour >= 15 && hour < 18) return '15:00-18:00'
    if (hour >= 18 && hour < 21) return '18:00-21:00'
    if (hour >= 21 && hour < 24) return '21:00-24:00'
    return '18:00-21:00' // Default to dinner
  }

  private static getSeason(date: Date): string {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  private static calculateRecencyBonus(lastUpdated: Date): number {
    const daysSince = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince <= 30) return 0.05 // Recent patterns get 5% bonus
    if (daysSince <= 90) return 0.02 // Somewhat recent get 2% bonus
    return 0 // Older patterns get no bonus
  }

  private static calculatePatternImpact(tableIds: string[], metrics: UtilizationMetrics): number {
    // Impact based on proven pattern efficiency
    return tableIds.length * 0.08 // Historical patterns are typically more efficient
  }
}

/**
 * PERFORMANCE MONITORING AND OPTIMIZATION
 */
export class AssignmentPerformanceMonitor {

  static measurePerformance<T>(
    algorithmName: string,
    operation: () => T
  ): { result: T; executionTime: number; memoryUsage?: number } {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize

    const result = operation()

    const executionTime = performance.now() - startTime
    const endMemory = (performance as any).memory?.usedJSHeapSize
    const memoryUsage = startMemory && endMemory ? endMemory - startMemory : undefined

    // Log performance warning if exceeding targets
    if (executionTime > 200) {
      console.warn(`[PERFORMANCE] ${algorithmName} exceeded 200ms target: ${executionTime.toFixed(2)}ms`)
    }

    return { result, executionTime, memoryUsage }
  }

  static async logAssignmentMetrics(
    algorithm: string,
    context: AssignmentContext,
    result: AssignmentResult,
    executionTime: number
  ) {
    // Log to assignment_performance_logs table for continuous improvement
    const logData = {
      algorithm_used: algorithm,
      party_size: context.partySize,
      requested_date: context.requestedDateTime.toISOString().split('T')[0],
      requested_time: context.requestedDateTime.toISOString().split('T')[1].substring(0, 5),
      assigned_table_ids: result.tableIds,
      confidence_score: result.confidence,
      processing_time_ms: Math.round(executionTime),
      revenue_impact: result.revenueProjection,
      utilization_impact: JSON.stringify({ impact: result.utilizationImpact })
    }

    // This would send to the database in actual implementation
    console.log(`[METRICS] ${algorithm} assignment:`, logData)
  }
}

/**
 * USAGE EXAMPLE AND INTEGRATION PATTERNS
 */
export class SmartAssignmentOrchestrator {

  static async executeOptimalStrategy(
    availableTables: TableData[],
    context: AssignmentContext,
    metrics: UtilizationMetrics,
    algorithmPreference: 'optimal' | 'balanced' | 'historical' | 'auto' = 'auto'
  ): Promise<AssignmentResult> {

    // Auto-selection logic based on context
    if (algorithmPreference === 'auto') {
      const hour = context.requestedDateTime.getHours()
      const isPeakHour = hour >= 19 && hour <= 21
      const isLargeParty = context.partySize >= 8
      const isVip = context.isVip

      if (isPeakHour && !isLargeParty && !isVip) {
        algorithmPreference = 'balanced' // Distribute load during peak
      } else if (isLargeParty || isVip) {
        algorithmPreference = 'optimal' // Maximize efficiency for special cases
      } else {
        algorithmPreference = 'historical' // Use learned patterns for regular reservations
      }
    }

    // Execute selected algorithm with performance monitoring
    const { result, executionTime } = AssignmentPerformanceMonitor.measurePerformance(
      algorithmPreference,
      () => {
        switch (algorithmPreference) {
          case 'optimal':
            return OptimalAssignmentAlgorithm.execute(availableTables, context, metrics)
          case 'balanced':
            return BalancedAssignmentAlgorithm.execute(availableTables, context, metrics)
          case 'historical':
            return HistoricalPatternAlgorithm.execute(availableTables, context, metrics)
          default:
            return OptimalAssignmentAlgorithm.execute(availableTables, context, metrics)
        }
      }
    )

    // Log performance metrics for continuous improvement
    await AssignmentPerformanceMonitor.logAssignmentMetrics(
      algorithmPreference,
      context,
      result,
      executionTime
    )

    return result
  }
}