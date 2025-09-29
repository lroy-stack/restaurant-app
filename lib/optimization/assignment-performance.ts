/**
 * PERFORMANCE OPTIMIZATION STRATEGIES FOR SMART TABLE ASSIGNMENT
 * Target: <200ms API response time with +15% utilization improvement
 */

import { Redis } from 'ioredis'

export interface PerformanceMetrics {
  apiResponseTime: number
  algorithmExecutionTime: number
  databaseQueryTime: number
  cacheHitRate: number
  utilizationImprovement: number
  revenueImpact: number
}

export interface CacheStrategy {
  key: string
  ttl: number // Time to live in seconds
  data: any
  version: string
}

/**
 * OPTIMIZATION STRATEGY 1: INTELLIGENT CACHING SYSTEM
 * Target: 80% cache hit rate for table availability queries
 */
export class AssignmentCacheManager {
  private redis: Redis
  private readonly CACHE_VERSION = 'v1.2'

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379')
  }

  // Cache table availability with smart invalidation
  async cacheTableAvailability(
    date: string,
    timeSlot: string,
    tableData: any[],
    utilizationMetrics: Record<string, number>
  ): Promise<void> {
    const cacheKey = this.generateAvailabilityKey(date, timeSlot)
    const cacheData = {
      tables: tableData,
      utilization: utilizationMetrics,
      cachedAt: new Date().toISOString(),
      version: this.CACHE_VERSION
    }

    // Cache for 2 minutes during peak hours, 5 minutes during off-peak
    const timeSlotFirstPart = timeSlot.split(':')[0]
    if (!timeSlotFirstPart) throw new Error('Invalid timeSlot format')
    const hour = parseInt(timeSlotFirstPart)
    const isPeakHour = hour >= 18 && hour <= 22
    const ttl = isPeakHour ? 120 : 300

    await this.redis.setex(cacheKey, ttl, JSON.stringify(cacheData))

    // Set cache metadata for monitoring
    await this.redis.hincrby('cache_stats', 'availability_writes', 1)
  }

  async getCachedAvailability(date: string, timeSlot: string): Promise<any | null> {
    const cacheKey = this.generateAvailabilityKey(date, timeSlot)

    try {
      const cached = await this.redis.get(cacheKey)
      if (!cached) {
        await this.redis.hincrby('cache_stats', 'availability_misses', 1)
        return null
      }

      const data = JSON.parse(cached)

      // Version check
      if (data.version !== this.CACHE_VERSION) {
        await this.redis.del(cacheKey)
        await this.redis.hincrby('cache_stats', 'availability_version_misses', 1)
        return null
      }

      await this.redis.hincrby('cache_stats', 'availability_hits', 1)
      return data

    } catch (error) {
      console.warn('Cache retrieval error:', error)
      return null
    }
  }

  // Cache utilization metrics with zone-level granularity
  async cacheUtilizationMetrics(
    date: string,
    hour: number,
    zoneMetrics: Record<string, number>
  ): Promise<void> {
    const cacheKey = `utilization:${date}:${hour}`
    const cacheData = {
      zones: zoneMetrics,
      updatedAt: new Date().toISOString(),
      version: this.CACHE_VERSION
    }

    // Cache utilization for 10 minutes
    await this.redis.setex(cacheKey, 600, JSON.stringify(cacheData))
  }

  async getCachedUtilization(date: string, hour: number): Promise<Record<string, number> | null> {
    const cacheKey = `utilization:${date}:${hour}`

    try {
      const cached = await this.redis.get(cacheKey)
      if (!cached) return null

      const data = JSON.parse(cached)
      return data.zones

    } catch (error) {
      console.warn('Utilization cache error:', error)
      return null
    }
  }

  // Cache assignment results for identical requests
  async cacheAssignmentResult(
    requestHash: string,
    result: any
  ): Promise<void> {
    const cacheKey = `assignment:${requestHash}`

    // Cache successful assignments for 1 minute
    await this.redis.setex(cacheKey, 60, JSON.stringify({
      result,
      cachedAt: new Date().toISOString()
    }))
  }

  async getCachedAssignment(requestHash: string): Promise<any | null> {
    const cacheKey = `assignment:${requestHash}`

    try {
      const cached = await this.redis.get(cacheKey)
      if (!cached) return null

      const data = JSON.parse(cached)
      return data.result

    } catch (error) {
      return null
    }
  }

  // Smart cache invalidation on reservation changes
  async invalidateRelatedCaches(
    tableIds: string[],
    date: string,
    timeRange: { start: string, end: string }
  ): Promise<void> {
    const patterns = [
      `availability:${date}:*`,
      `utilization:${date}:*`,
      'assignment:*'
    ]

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    }

    console.log(`Cache invalidated for tables: ${tableIds.join(', ')} on ${date}`)
  }

  private generateAvailabilityKey(date: string, timeSlot: string): string {
    return `availability:${date}:${timeSlot}`
  }

  async getCacheStats(): Promise<Record<string, number>> {
    const result = await this.redis.hgetall('cache_stats')
    // Convert string values to numbers for proper typing
    const numberResult: Record<string, number> = {}
    for (const [key, value] of Object.entries(result)) {
      numberResult[key] = parseInt(value) || 0
    }
    return numberResult
  }
}

/**
 * OPTIMIZATION STRATEGY 2: DATABASE QUERY OPTIMIZATION
 * Target: <50ms database response time with proper indexing
 */
export class DatabaseQueryOptimizer {

  // Optimized availability query with batched operations
  static generateOptimizedAvailabilityQuery(
    date: string,
    timeStart: string,
    timeEnd: string,
    zoneFilter?: string
  ): { query: string; params: any[] } {

    const baseQuery = `
      WITH table_availability AS (
        SELECT DISTINCT
          t.id,
          t.number,
          t.capacity,
          t.location as zone,
          t.position_x,
          t.position_y,
          t.currentstatus
        FROM restaurante.tables t
        WHERE t."isActive" = true
          ${zoneFilter ? 'AND t.location = $3' : ''}
      ),
      conflicting_reservations AS (
        SELECT DISTINCT
          unnest(COALESCE(r.table_ids, ARRAY[]::text[])) as table_id
        FROM restaurante.reservations r
        WHERE r.date = $1::date
          AND r.time BETWEEN $2::timestamp AND $3::timestamp
          AND r.status IN ('PENDING', 'CONFIRMED', 'SEATED')
        UNION
        SELECT DISTINCT r."tableId" as table_id
        FROM restaurante.reservations r
        WHERE r.date = $1::date
          AND r.time BETWEEN $2::timestamp AND $3::timestamp
          AND r.status IN ('PENDING', 'CONFIRMED', 'SEATED')
          AND r."tableId" IS NOT NULL
      )
      SELECT ta.*
      FROM table_availability ta
      LEFT JOIN conflicting_reservations cr ON ta.id = cr.table_id
      WHERE cr.table_id IS NULL
      ORDER BY ta.location, ta.number::int;
    `

    const params = zoneFilter
      ? [date, `${date}T${timeStart}`, `${date}T${timeEnd}`, zoneFilter]
      : [date, `${date}T${timeStart}`, `${date}T${timeEnd}`]

    return { query: baseQuery, params }
  }

  // Batch utilization metrics query
  static generateUtilizationMetricsQuery(
    date: string,
    hourRange: number[]
  ): { query: string; params: any[] } {

    const query = `
      SELECT
        t.location as zone,
        um.hour_slot,
        AVG(um.utilization_rate) as avg_utilization,
        SUM(um.total_covers) as total_covers,
        SUM(um.revenue_generated) as total_revenue
      FROM restaurante.table_utilization_metrics um
      JOIN restaurante.tables t ON um.table_id = t.id
      WHERE um.date = $1::date
        AND um.hour_slot = ANY($2::int[])
      GROUP BY t.location, um.hour_slot
      ORDER BY t.location, um.hour_slot;
    `

    return { query, params: [date, hourRange] }
  }

  // Historical patterns query with optimized indexes
  static generateHistoricalPatternsQuery(
    partySize: number,
    dayOfWeek: number,
    timeSlotHour: number,
    season: string
  ): { query: string; params: any[] } {

    const query = `
      SELECT
        rsp.table_configuration,
        rsp.success_rate,
        rsp.avg_revenue_per_cover,
        rsp.sample_size,
        rsp.last_updated
      FROM restaurante.reservation_success_patterns rsp
      WHERE rsp.party_size = $1
        AND rsp.day_of_week = $2
        AND rsp.time_slot LIKE '%' || $3::text || '%'
        AND rsp.season = $4
        AND rsp.success_rate >= 0.8
        AND rsp.sample_size >= 5
      ORDER BY rsp.success_rate DESC, rsp.sample_size DESC
      LIMIT 10;
    `

    return {
      query,
      params: [partySize, dayOfWeek, timeSlotHour.toString().padStart(2, '0'), season]
    }
  }
}

/**
 * OPTIMIZATION STRATEGY 3: ALGORITHM PERFORMANCE TUNING
 * Target: Maintain O(n log n) complexity with early termination
 */
export class AlgorithmPerformanceOptimizer {

  // Early termination for table scoring when confidence threshold reached
  static optimizeTableScoring<T>(
    tables: T[],
    scoringFunction: (table: T) => { score: number; table: T },
    confidenceThreshold: number = 0.95,
    maxIterations: number = 20
  ): Array<{ score: number; table: T }> {

    const scored: Array<{ score: number; table: T }> = []
    let bestScore = 0

    for (let i = 0; i < Math.min(tables.length, maxIterations); i++) {
      const table = tables[i]
      if (!table) continue
      const result = scoringFunction(table)
      scored.push(result)

      if (result.score > bestScore) {
        bestScore = result.score
      }

      // Early termination if we found a highly confident result
      if (bestScore >= confidenceThreshold && scored.length >= 3) {
        console.log(`Early termination at iteration ${i + 1} with confidence ${bestScore}`)
        break
      }
    }

    return scored.sort((a, b) => b.score - a.score)
  }

  // Optimized table combination finder with pruning
  static findOptimalCombinations(
    tables: any[],
    partySize: number,
    maxCombinations: number = 10,
    maxTableCount: number = 3
  ): Array<{ tableIds: string[]; score: number; reasoning: string }> {

    const combinations = []
    const tableCount = Math.min(tables.length, 8) // Limit for performance

    // Two-table combinations (most common case)
    for (let i = 0; i < tableCount && combinations.length < maxCombinations; i++) {
      for (let j = i + 1; j < tableCount && combinations.length < maxCombinations; j++) {
        const combo = [tables[i], tables[j]]
        const totalCapacity = combo.reduce((sum, t) => sum + t.capacity, 0)

        // Pruning: skip if obviously inefficient
        if (totalCapacity < partySize || totalCapacity > partySize + 8) continue

        const efficiency = partySize / totalCapacity
        if (efficiency < 0.6) continue // Skip inefficient combinations

        combinations.push({
          tableIds: combo.map(t => t.id),
          score: efficiency,
          reasoning: `${combo.map(t => t.number).join('+')} (${totalCapacity} seats)`
        })
      }
    }

    // Three-table combinations only for large parties
    if (partySize >= 16 && maxTableCount >= 3) {
      for (let i = 0; i < Math.min(tableCount, 4) && combinations.length < maxCombinations; i++) {
        for (let j = i + 1; j < Math.min(tableCount, 4) && combinations.length < maxCombinations; j++) {
          for (let k = j + 1; k < Math.min(tableCount, 4) && combinations.length < maxCombinations; k++) {
            const combo = [tables[i], tables[j], tables[k]]
            const totalCapacity = combo.reduce((sum, t) => sum + t.capacity, 0)

            if (totalCapacity >= partySize && totalCapacity <= partySize + 10) {
              const efficiency = partySize / totalCapacity
              if (efficiency >= 0.7) { // Higher threshold for 3-table combos
                combinations.push({
                  tableIds: combo.map(t => t.id),
                  score: efficiency * 0.9, // Slight penalty for complexity
                  reasoning: `${combo.map(t => t.number).join('+')} (${totalCapacity} seats)`
                })
              }
            }
          }
        }
      }
    }

    return combinations.sort((a, b) => b.score - a.score)
  }

  // Memoization for expensive calculations
  private static memoCache = new Map<string, any>()

  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator: (...args: Parameters<T>) => string
  ): T {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator(...args)

      if (this.memoCache.has(key)) {
        return this.memoCache.get(key)
      }

      const result = fn(...args)
      this.memoCache.set(key, result)

      // Cleanup cache if it gets too large
      if (this.memoCache.size > 1000) {
        const firstKey = this.memoCache.keys().next().value
        if (firstKey !== undefined) {
          this.memoCache.delete(firstKey)
        }
      }

      return result
    }) as T
  }
}

/**
 * OPTIMIZATION STRATEGY 4: REAL-TIME PERFORMANCE MONITORING
 * Target: Continuous optimization with adaptive algorithms
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private readonly MAX_METRICS_HISTORY = 1000

  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push({
      ...metrics,
      timestamp: Date.now()
    } as PerformanceMetrics & { timestamp: number })

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics.shift()
    }

    // Alert on performance degradation
    if (metrics.apiResponseTime > 250) {
      console.warn(`Performance alert: API response time ${metrics.apiResponseTime}ms exceeds 250ms threshold`)
    }

    if (metrics.cacheHitRate < 0.7) {
      console.warn(`Cache performance alert: Hit rate ${metrics.cacheHitRate} below 70% target`)
    }
  }

  getPerformanceReport(): {
    avgResponseTime: number
    p95ResponseTime: number
    avgCacheHitRate: number
    avgUtilizationImprovement: number
    totalRevenueImpact: number
  } {
    if (this.metrics.length === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        avgCacheHitRate: 0,
        avgUtilizationImprovement: 0,
        totalRevenueImpact: 0
      }
    }

    const responseTimes = this.metrics.map(m => m.apiResponseTime).sort((a, b) => a - b)
    const p95Index = Math.floor(responseTimes.length * 0.95)

    return {
      avgResponseTime: this.metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / this.metrics.length,
      p95ResponseTime: responseTimes[p95Index] || 0,
      avgCacheHitRate: this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / this.metrics.length,
      avgUtilizationImprovement: this.metrics.reduce((sum, m) => sum + m.utilizationImprovement, 0) / this.metrics.length,
      totalRevenueImpact: this.metrics.reduce((sum, m) => sum + m.revenueImpact, 0)
    }
  }

  // Adaptive algorithm selection based on performance patterns
  recommendOptimalAlgorithm(context: {
    partySize: number
    hour: number
    isWeekend: boolean
    currentLoad: number
  }): 'optimal' | 'balanced' | 'historical' {

    const recentMetrics = this.metrics.slice(-100) // Last 100 requests

    if (recentMetrics.length < 10) {
      return 'optimal' // Default to optimal if insufficient data
    }

    // Analyze performance by algorithm
    const algorithmPerformance = {
      optimal: { avgTime: 0, avgUtilization: 0, count: 0 },
      balanced: { avgTime: 0, avgUtilization: 0, count: 0 },
      historical: { avgTime: 0, avgUtilization: 0, count: 0 }
    }

    recentMetrics.forEach(metric => {
      const algorithm = (metric as any).algorithm || 'optimal'
      if (algorithmPerformance[algorithm as keyof typeof algorithmPerformance]) {
        const perf = algorithmPerformance[algorithm as keyof typeof algorithmPerformance]
        perf.avgTime += metric.apiResponseTime
        perf.avgUtilization += metric.utilizationImprovement
        perf.count++
      }
    })

    // Calculate averages
    Object.values(algorithmPerformance).forEach(perf => {
      if (perf.count > 0) {
        perf.avgTime /= perf.count
        perf.avgUtilization /= perf.count
      }
    })

    // Contextual algorithm selection
    if (context.currentLoad > 0.8) {
      return 'balanced' // Prefer load balancing when busy
    }

    if (context.partySize >= 8) {
      return 'optimal' // Use optimal for large parties
    }

    // Select algorithm with best utilization improvement and reasonable performance
    const candidates = Object.entries(algorithmPerformance)
      .filter(([, perf]) => perf.count >= 3 && perf.avgTime < 200)
      .sort(([, a], [, b]) => b.avgUtilization - a.avgUtilization)

    const firstCandidate = candidates[0]
    return (firstCandidate?.[0] as 'optimal' | 'balanced' | 'historical') || 'optimal'
  }
}

/**
 * OPTIMIZATION STRATEGY 5: PRECOMPUTED OPTIMIZATION TABLES
 * Target: Sub-50ms lookups for common scenarios
 */
export class PrecomputedOptimizations {
  private static optimizationTable = new Map<string, any>()

  // Precompute optimal assignments for common party sizes and time slots
  static async precomputeCommonScenarios(): Promise<void> {
    const commonPartySizes = [2, 3, 4, 5, 6, 8, 10, 12]
    const peakHours = [19, 20, 21]
    const zones = ['WINDOW', 'CENTER', 'BAR', 'TERRACE']

    console.log('Precomputing optimization scenarios...')

    for (const partySize of commonPartySizes) {
      for (const hour of peakHours) {
        for (const zone of zones) {
          const key = `${partySize}_${hour}_${zone}`

          // This would be replaced with actual optimization calculation
          const optimization = {
            preferredTableTypes: this.getPreferredTableTypes(partySize, zone),
            expectedUtilization: this.calculateExpectedUtilization(partySize, hour),
            revenueMultiplier: this.getRevenueMultiplier(partySize, hour, zone)
          }

          this.optimizationTable.set(key, optimization)
        }
      }
    }

    console.log(`Precomputed ${this.optimizationTable.size} optimization scenarios`)
  }

  static getPrecomputedOptimization(
    partySize: number,
    hour: number,
    zone: string
  ): any | null {
    const key = `${partySize}_${hour}_${zone}`
    return this.optimizationTable.get(key) || null
  }

  private static getPreferredTableTypes(partySize: number, zone: string): string[] {
    // Logic to determine preferred table configurations
    if (partySize <= 2) return ['small']
    if (partySize <= 4) return ['medium']
    if (partySize <= 6) return ['large']
    return ['large', 'combo']
  }

  private static calculateExpectedUtilization(partySize: number, hour: number): number {
    // Historical utilization calculations
    const baseUtilization = 0.75
    const hourMultiplier = hour >= 19 && hour <= 21 ? 1.2 : 1.0
    const partySizeMultiplier = partySize >= 6 ? 1.1 : 1.0

    return Math.min(0.95, baseUtilization * hourMultiplier * partySizeMultiplier)
  }

  private static getRevenueMultiplier(partySize: number, hour: number, zone: string): number {
    let multiplier = 1.0

    if (hour >= 19 && hour <= 21) multiplier *= 1.15 // Peak hour bonus
    if (zone === 'WINDOW') multiplier *= 1.1 // Premium zone
    if (partySize >= 6) multiplier *= 1.08 // Large party bonus

    return multiplier
  }
}

// Export singleton instances for use across the application
export const cacheManager = new AssignmentCacheManager()
export const performanceMonitor = new PerformanceMonitor()

// Initialize precomputed optimizations
PrecomputedOptimizations.precomputeCommonScenarios().catch(console.error)