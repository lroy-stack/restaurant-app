// src/lib/rate-limit.ts - Rate limiting for admin routes
import { NextRequest } from 'next/server'

// Simple in-memory rate limiting (replace with Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

// Rate limit configurations for different route types
export const RATE_LIMITS = {
  ADMIN: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute for admin
  DASHBOARD: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 requests per minute for dashboard
  API: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute for API
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 auth attempts per 15 minutes
} as const

/**
 * Rate limiting middleware for enterprise protection
 * 
 * Prevents abuse of admin routes and API endpoints
 * In production, replace with Redis-based solution
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  
  // Use custom identifier or fallback to IP
  const key = identifier || getClientIdentifier(request)
  
  // Clean up expired entries
  cleanExpiredEntries(now)
  
  const currentData = rateLimitMap.get(key)
  const resetTime = now + config.windowMs
  
  if (!currentData) {
    // First request for this identifier
    rateLimitMap.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }
  
  // Check if window has expired
  if (now > currentData.resetTime) {
    // Reset window
    rateLimitMap.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }
  
  // Increment counter
  currentData.count += 1
  
  if (currentData.count > config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: currentData.resetTime,
    }
  }
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - currentData.count,
    resetTime: currentData.resetTime,
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP through headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || request.ip || 'unknown'
  
  // Include user agent for better uniqueness (but hash for privacy)
  const userAgent = request.headers.get('user-agent') || ''
  const hashedUA = simpleHash(userAgent)
  
  return `${ip}-${hashedUA}`
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Clean expired entries to prevent memory leaks
 */
function cleanExpiredEntries(now: number): void {
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * Get rate limit status for a specific identifier
 */
export function getRateLimitStatus(identifier: string): {
  count: number
  resetTime: number
} | null {
  return rateLimitMap.get(identifier) || null
}

/**
 * Clear rate limit for specific identifier (admin override)
 */
export function clearRateLimit(identifier: string): boolean {
  return rateLimitMap.delete(identifier)
}

/**
 * Get current rate limit stats (admin monitoring)
 */
export function getRateLimitStats(): {
  totalEntries: number
  entries: Array<{ key: string; count: number; resetTime: number }>
} {
  const entries = Array.from(rateLimitMap.entries()).map(([key, data]) => ({
    key: key.substring(0, 20) + '...', // Truncate for privacy
    count: data.count,
    resetTime: data.resetTime,
  }))
  
  return {
    totalEntries: rateLimitMap.size,
    entries,
  }
}