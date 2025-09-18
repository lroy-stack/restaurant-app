'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  children: React.ReactNode
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}

export function AdminOnly({ children }: RoleGuardProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/almaenigma')
    }
  }, [user, loading, router])
  
  if (loading) return <LoadingSpinner />
  if (!user) return null
  
  return <>{children}</>
}

export function ManagerOrAbove({ children }: RoleGuardProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/almaenigma')
    }
  }, [user, loading, router])
  
  if (loading) return <LoadingSpinner />
  if (!user) return null
  
  return <>{children}</>
}

export function StaffOrAbove({ children }: RoleGuardProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/almaenigma')
    }
  }, [user, loading, router])
  
  if (loading) return <LoadingSpinner />
  if (!user) return null
  
  return <>{children}</>
}