// src/hooks/use-auth-guard.ts - Client-side auth guard hook
"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@prisma/client'

interface UseAuthGuardOptions {
  requiredRoles?: UserRole[]
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * Client-side authentication guard hook
 * 
 * Complementa el middleware servidor para validaciones cliente
 * Útil para componentes que necesitan validación en tiempo real
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { 
    requiredRoles = [], 
    redirectTo = '/unauthorized', 
    requireAuth = true 
  } = options
  
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return
    
    // Require authentication
    if (requireAuth && !session?.user) {
      router.push('/auth/signin')
      return
    }
    
    // Check role requirements
    if (requiredRoles.length > 0 && session?.user) {
      const userRole = session.user.role
      const hasRequiredRole = requiredRoles.includes(userRole)
      
      if (!hasRequiredRole) {
        router.push(redirectTo)
        return
      }
    }
  }, [session, status, requiredRoles, redirectTo, requireAuth, router])
  
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    hasRole: (role: UserRole) => session?.user?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(session?.user?.role as UserRole),
    isAdmin: session?.user?.role === 'ADMIN',
    isManager: session?.user?.role === 'MANAGER',
    isStaff: session?.user?.role === 'STAFF',
    canAccessDashboard: ['ADMIN', 'MANAGER', 'STAFF'].includes(session?.user?.role as UserRole),
  }
}