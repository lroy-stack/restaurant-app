// src/lib/middleware-admin.ts - Admin utilities for middleware management
import { UserRole } from '@prisma/client'
import { getRateLimitStats, clearRateLimit } from './rate-limit'
import { ROLE_HIERARCHY } from '@/config/middleware'

/**
 * ENTERPRISE MIDDLEWARE ADMINISTRATION UTILITIES
 * 
 * Tools for monitoring and managing the middleware system
 * Only available to ADMIN role users
 */

export interface SecurityEvent {
  type: 'unauthorized_access' | 'rate_limit_exceeded' | 'role_violation' | 'suspicious_activity'
  timestamp: Date
  userId?: string
  email?: string
  role?: UserRole
  pathname: string
  ip: string
  userAgent: string
  details?: Record<string, any>
}

export interface MiddlewareStats {
  totalRequests: number
  blockedRequests: number
  rateLimitViolations: number
  unauthorizedAttempts: number
  roleViolations: number
  topBlockedPaths: Array<{ path: string; count: number }>
  topViolatingIPs: Array<{ ip: string; count: number }>
  lastUpdated: Date
}

// In-memory storage for security events (replace with database in production)
const securityEvents: SecurityEvent[] = []
const MAX_EVENTS = 10000 // Keep last 10k events

/**
 * Log security event for admin monitoring
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  }
  
  securityEvents.unshift(securityEvent)
  
  // Maintain maximum events
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.splice(MAX_EVENTS)
  }
  
  // Console log for immediate visibility
  console.warn(`[SECURITY] ${event.type}: ${event.pathname} - ${event.email || 'Anonymous'} (${event.ip})`, event.details)
  
  // In production, also send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // sendToMonitoringService(securityEvent)
  }
}

/**
 * Get security events with filtering options
 */
export function getSecurityEvents(options: {
  type?: SecurityEvent['type']
  userId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
} = {}): SecurityEvent[] {
  const { type, userId, startDate, endDate, limit = 100 } = options
  
  let filtered = securityEvents
  
  if (type) {
    filtered = filtered.filter(event => event.type === type)
  }
  
  if (userId) {
    filtered = filtered.filter(event => event.userId === userId)
  }
  
  if (startDate) {
    filtered = filtered.filter(event => event.timestamp >= startDate)
  }
  
  if (endDate) {
    filtered = filtered.filter(event => event.timestamp <= endDate)
  }
  
  return filtered.slice(0, limit)
}

/**
 * Get comprehensive middleware statistics
 */
export function getMiddlewareStats(timeWindowHours = 24): MiddlewareStats {
  const startTime = new Date(Date.now() - (timeWindowHours * 60 * 60 * 1000))
  const eventsInWindow = securityEvents.filter(event => event.timestamp >= startTime)
  
  // Path analysis
  const pathCounts = new Map<string, number>()
  const ipCounts = new Map<string, number>()
  
  let rateLimitViolations = 0
  let unauthorizedAttempts = 0
  let roleViolations = 0
  
  eventsInWindow.forEach(event => {
    // Count by path
    pathCounts.set(event.pathname, (pathCounts.get(event.pathname) || 0) + 1)
    
    // Count by IP
    ipCounts.set(event.ip, (ipCounts.get(event.ip) || 0) + 1)
    
    // Count by type
    switch (event.type) {
      case 'rate_limit_exceeded':
        rateLimitViolations++
        break
      case 'unauthorized_access':
        unauthorizedAttempts++
        break
      case 'role_violation':
        roleViolations++
        break
    }
  })
  
  // Sort and limit results
  const topBlockedPaths = Array.from(pathCounts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    
  const topViolatingIPs = Array.from(ipCounts.entries())
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  return {
    totalRequests: eventsInWindow.length,
    blockedRequests: eventsInWindow.length,
    rateLimitViolations,
    unauthorizedAttempts,
    roleViolations,
    topBlockedPaths,
    topViolatingIPs,
    lastUpdated: new Date(),
  }
}

/**
 * Get user role statistics
 */
export function getRoleStats(): Record<UserRole, { attempts: number; blocked: number }> {
  const stats: Record<UserRole, { attempts: number; blocked: number }> = {
    ADMIN: { attempts: 0, blocked: 0 },
    MANAGER: { attempts: 0, blocked: 0 },
    STAFF: { attempts: 0, blocked: 0 },
    CUSTOMER: { attempts: 0, blocked: 0 },
  }
  
  securityEvents.forEach(event => {
    if (event.role) {
      stats[event.role].attempts++
      if (event.type === 'role_violation' || event.type === 'unauthorized_access') {
        stats[event.role].blocked++
      }
    }
  })
  
  return stats
}

/**
 * Check if IP address should be temporarily blocked
 */
export function shouldBlockIP(ip: string, threshold = 10, windowMinutes = 5): boolean {
  const startTime = new Date(Date.now() - (windowMinutes * 60 * 1000))
  const recentViolations = securityEvents
    .filter(event => event.ip === ip && event.timestamp >= startTime)
    .filter(event => ['rate_limit_exceeded', 'unauthorized_access', 'role_violation'].includes(event.type))
  
  return recentViolations.length >= threshold
}

/**
 * Get suspicious activity patterns
 */
export function getSuspiciousActivity(): Array<{
  ip: string
  violations: number
  lastActivity: Date
  patterns: string[]
}> {
  const ipActivity = new Map<string, SecurityEvent[]>()
  
  // Group events by IP
  securityEvents.forEach(event => {
    if (!ipActivity.has(event.ip)) {
      ipActivity.set(event.ip, [])
    }
    ipActivity.get(event.ip)!.push(event)
  })
  
  return Array.from(ipActivity.entries())
    .map(([ip, events]) => {
      const violations = events.filter(e => 
        ['rate_limit_exceeded', 'unauthorized_access', 'role_violation'].includes(e.type)
      ).length
      
      const patterns: string[] = []
      
      // Detect patterns
      const pathsAttempted = new Set(events.map(e => e.pathname))
      if (pathsAttempted.size > 10) {
        patterns.push('Path scanning')
      }
      
      const roleSwitching = new Set(events.map(e => e.role)).size > 2
      if (roleSwitching) {
        patterns.push('Role switching')
      }
      
      const rapidRequests = events.filter(e => {
        const timeDiff = Date.now() - e.timestamp.getTime()
        return timeDiff < 60 * 1000 // Last minute
      }).length > 20
      if (rapidRequests) {
        patterns.push('Rapid requests')
      }
      
      return {
        ip,
        violations,
        lastActivity: events[0]?.timestamp || new Date(),
        patterns
      }
    })
    .filter(activity => activity.violations > 5 || activity.patterns.length > 0)
    .sort((a, b) => b.violations - a.violations)
}

/**
 * Admin action: Clear rate limit for specific IP
 */
export function adminClearRateLimit(ip: string): boolean {
  return clearRateLimit(ip)
}

/**
 * Admin action: Get detailed rate limit information
 */
export function adminGetRateLimitInfo() {
  return getRateLimitStats()
}

/**
 * Generate security report for admin dashboard
 */
export function generateSecurityReport(hours = 24): {
  summary: MiddlewareStats
  events: SecurityEvent[]
  suspicious: Array<{ ip: string; violations: number; patterns: string[] }>
  recommendations: string[]
} {
  const summary = getMiddlewareStats(hours)
  const events = getSecurityEvents({ limit: 50 })
  const suspicious = getSuspiciousActivity()
  
  const recommendations: string[] = []
  
  // Generate recommendations
  if (summary.rateLimitViolations > 100) {
    recommendations.push('Consider reducing rate limits or implementing IP-based blocking')
  }
  
  if (summary.unauthorizedAttempts > 50) {
    recommendations.push('Review authentication mechanisms and consider 2FA')
  }
  
  if (suspicious.length > 5) {
    recommendations.push('Investigate suspicious IP addresses and consider IP whitelisting')
  }
  
  if (summary.topBlockedPaths.some(p => p.count > 20)) {
    recommendations.push('Review most attacked endpoints for additional security measures')
  }
  
  return {
    summary,
    events,
    suspicious,
    recommendations
  }
}

/**
 * Export security events for external analysis
 */
export function exportSecurityEvents(format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = ['timestamp', 'type', 'email', 'role', 'pathname', 'ip', 'userAgent']
    const csv = [
      headers.join(','),
      ...securityEvents.map(event => [
        event.timestamp.toISOString(),
        event.type,
        event.email || '',
        event.role || '',
        event.pathname,
        event.ip,
        `"${event.userAgent}"` // Quoted for CSV
      ].join(','))
    ].join('\n')
    
    return csv
  }
  
  return JSON.stringify(securityEvents, null, 2)
}