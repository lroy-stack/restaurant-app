// src/hooks/use-auth-hybrid.ts - Hybrid authentication hook (NextAuth + Supabase)
"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { getCurrentSession, onAuthStateChange, getUserRole } from '@/lib/supabase/auth'
import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'

interface HybridUser {
  id: string
  email: string
  name: string
  role: UserRole
  provider: 'nextauth' | 'supabase'
  image?: string
}

interface UseAuthHybridOptions {
  requiredRoles?: UserRole[]
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * Hybrid authentication hook that supports both NextAuth and Supabase
 * 
 * Priority:
 * 1. Supabase session (for admin login via email/password)
 * 2. NextAuth session (for Google OAuth)
 */
export function useAuthHybrid(options: UseAuthHybridOptions = {}) {
  const { 
    requiredRoles = [], 
    redirectTo = '/unauthorized', 
    requireAuth = true 
  } = options
  
  const { data: nextAuthSession, status: nextAuthStatus } = useSession()
  const router = useRouter()
  
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hybridUser, setHybridUser] = useState<HybridUser | null>(null)

  // Initialize Supabase auth listener
  useEffect(() => {
    let mounted = true

    const initSupabaseAuth = async () => {
      try {
        // Get current Supabase session
        const session = await getCurrentSession()
        
        if (mounted) {
          setSupabaseSession(session)
          setSupabaseUser(session?.user || null)
          
          // Get user role from our custom table if Supabase user exists
          if (session?.user) {
            const role = await getUserRole(session.user.id)
            setUserRole(role as UserRole || 'CUSTOMER')
          }
        }
      } catch (error) {
        console.error('Error initializing Supabase auth:', error)
      }
    }

    initSupabaseAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (session) => {
      if (mounted) {
        setSupabaseSession(session)
        setSupabaseUser(session?.user || null)
        
        if (session?.user) {
          const role = await getUserRole(session.user.id)
          setUserRole(role as UserRole || 'CUSTOMER')
        } else {
          setUserRole(null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Determine the current user based on priority (Supabase first, then NextAuth)
  useEffect(() => {
    let finalUser: HybridUser | null = null

    if (supabaseUser && userRole) {
      // Priority 1: Supabase user (admin login)
      finalUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
        role: userRole,
        provider: 'supabase'
      }
    } else if (nextAuthSession?.user) {
      // Priority 2: NextAuth user (Google OAuth)
      finalUser = {
        id: nextAuthSession.user.id,
        email: nextAuthSession.user.email,
        name: nextAuthSession.user.name,
        role: nextAuthSession.user.role,
        provider: 'nextauth',
        image: nextAuthSession.user.image
      }
    }

    setHybridUser(finalUser)
    
    // Set loading false when both auth systems have been checked
    const nextAuthLoaded = nextAuthStatus !== 'loading'
    const supabaseLoaded = supabaseSession !== undefined
    
    if (nextAuthLoaded && (supabaseLoaded || supabaseUser === null)) {
      setIsLoading(false)
    }
  }, [supabaseUser, userRole, nextAuthSession, nextAuthStatus, supabaseSession])

  // Handle redirects and role checks
  useEffect(() => {
    if (isLoading) return
    
    // Require authentication
    if (requireAuth && !hybridUser) {
      router.push('/auth/signin')
      return
    }
    
    // Check role requirements
    if (requiredRoles.length > 0 && hybridUser) {
      const hasRequiredRole = requiredRoles.includes(hybridUser.role)
      
      if (!hasRequiredRole) {
        router.push(redirectTo)
        return
      }
    }
  }, [hybridUser, isLoading, requiredRoles, redirectTo, requireAuth, router])
  
  return {
    user: hybridUser,
    isLoading,
    isAuthenticated: !!hybridUser,
    provider: hybridUser?.provider || null,
    
    // Role checking utilities
    hasRole: (role: UserRole) => hybridUser?.role === role,
    hasAnyRole: (roles: UserRole[]) => hybridUser ? roles.includes(hybridUser.role) : false,
    isAdmin: hybridUser?.role === 'ADMIN',
    isManager: hybridUser?.role === 'MANAGER',
    isStaff: hybridUser?.role === 'STAFF',
    canAccessDashboard: hybridUser ? ['ADMIN', 'MANAGER', 'STAFF'].includes(hybridUser.role) : false,
    
    // Raw session data for debugging
    nextAuthSession,
    supabaseSession,
    supabaseUser,
  }
}