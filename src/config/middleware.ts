// src/config/middleware.ts - Middleware configuration
import { UserRole } from '@prisma/client'

/**
 * ENTERPRISE MIDDLEWARE CONFIGURATION
 * 
 * Centralized configuration for route protection, rate limiting,
 * and security policies for Enigma Restaurant Platform
 */

// Route Protection Configuration
export const ROUTE_PROTECTION = {
  // Routes that require ADMIN role only
  ADMIN_ONLY_ROUTES: [
    '/dashboard/configuracion',
    '/dashboard/configuracion/usuarios',
    '/dashboard/configuracion/sistema',
    '/dashboard/configuracion/integraciones',
    '/dashboard/configuracion/backup',
    '/dashboard/configuracion/logs',
  ],
  
  // Routes that require MANAGER role or above
  MANAGER_ROUTES: [
    '/dashboard/analytics',
    '/dashboard/analytics/ventas',
    '/dashboard/analytics/clientes',
    '/dashboard/analytics/reportes',
    '/dashboard/menu',
    '/dashboard/menu/items',
    '/dashboard/menu/categorias',
    '/dashboard/menu/precios',
    '/dashboard/clientes',
    '/dashboard/clientes/historial',
    '/dashboard/clientes/segmentacion',
  ],
  
  // Routes that require STAFF role or above (basic access)
  STAFF_ROUTES: [
    '/dashboard',
    '/dashboard/reservaciones',
    '/dashboard/reservaciones/hoy',
    '/dashboard/reservaciones/calendario',
    '/dashboard/reservaciones/lista',
    '/dashboard/mesas',
    '/dashboard/mesas/estado',
    '/dashboard/mesas/layout',
  ],
  
  // Public routes (no authentication required)
  PUBLIC_ROUTES: [
    '/',
    '/menu',
    '/historia',
    '/galeria',
    '/contacto',
    '/reservas',
    '/auth',
    '/unauthorized',
    '/api/public',
    '/api/auth',
    '/api/webhooks',
  ],
  
  // API routes with specific protection
  API_ROUTES: {
    PUBLIC: ['/api/public', '/api/auth', '/api/webhooks'],
    ADMIN: ['/api/admin', '/api/system'],
    STAFF: ['/api/dashboard', '/api/reservations', '/api/tables'],
    MANAGER: ['/api/analytics', '/api/menu', '/api/customers'],
  },
} as const

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  // Admin routes - more restrictive
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50, // 50 requests per minute
    message: 'Admin rate limit exceeded'
  },
  
  // Dashboard routes - moderate limiting
  DASHBOARD: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 120, // 120 requests per minute
    message: 'Dashboard rate limit exceeded'
  },
  
  // API routes - more restrictive for writes
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'API rate limit exceeded'
  },
  
  // Authentication routes - very restrictive
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Authentication rate limit exceeded'
  },
  
  // Public routes - basic protection
  PUBLIC: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
    message: 'Public API rate limit exceeded'
  },
} as const

// Security Headers Configuration
export const SECURITY_HEADERS = {
  // Common security headers
  COMMON: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Robots-Tag': 'noindex, nofollow',
  },
  
  // Admin-specific headers
  ADMIN: {
    'X-Admin-Area': 'true',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  
  // Dashboard-specific headers  
  DASHBOARD: {
    'X-Dashboard-Area': 'true',
    'X-Schema-Context': 'restaurante', // Supabase schema indicator
  },
  
  // API-specific headers
  API: {
    'X-API-Version': '1.0',
    'X-Content-Security': 'restricted',
  },
} as const

// Role Hierarchy Configuration
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 0,
  STAFF: 1, 
  MANAGER: 2,
  ADMIN: 3,
} as const

/**
 * Check if user has sufficient role level
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Get minimum required role for a path
 */
export function getMinimumRole(pathname: string): UserRole | null {
  // Check admin routes first (highest priority)
  if (ROUTE_PROTECTION.ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    return 'ADMIN'
  }
  
  // Check manager routes
  if (ROUTE_PROTECTION.MANAGER_ROUTES.some(route => pathname.startsWith(route))) {
    return 'MANAGER'
  }
  
  // Check staff routes
  if (ROUTE_PROTECTION.STAFF_ROUTES.some(route => pathname.startsWith(route))) {
    return 'STAFF'
  }
  
  // Public route or no specific requirement
  return null
}

/**
 * Check if route is completely public
 */
export function isPublicRoute(pathname: string): boolean {
  return ROUTE_PROTECTION.PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

/**
 * Get appropriate rate limit config for path
 */
export function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/auth') || pathname.includes('signin') || pathname.includes('login')) {
    return RATE_LIMIT_CONFIG.AUTH
  }
  
  if (pathname.startsWith('/api/admin')) {
    return RATE_LIMIT_CONFIG.ADMIN
  }
  
  if (pathname.startsWith('/api')) {
    return RATE_LIMIT_CONFIG.API
  }
  
  if (pathname.startsWith('/dashboard')) {
    return RATE_LIMIT_CONFIG.DASHBOARD
  }
  
  return RATE_LIMIT_CONFIG.PUBLIC
}

// Environment-specific configuration
export const ENVIRONMENT_CONFIG = {
  development: {
    enableRateLimit: true,
    enableSecurityHeaders: true,
    logUnauthorizedAccess: true,
    allowTestRoutes: true,
  },
  production: {
    enableRateLimit: true,
    enableSecurityHeaders: true,
    logUnauthorizedAccess: true,
    allowTestRoutes: false,
  },
  test: {
    enableRateLimit: false,
    enableSecurityHeaders: false,
    logUnauthorizedAccess: false,
    allowTestRoutes: true,
  },
} as const

export const currentEnvironment = (process.env.NODE_ENV as keyof typeof ENVIRONMENT_CONFIG) || 'development'
export const envConfig = ENVIRONMENT_CONFIG[currentEnvironment]