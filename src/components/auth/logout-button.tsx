'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/components/providers/supabase-provider'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LogoutButton({ className, variant = "ghost" }: LogoutButtonProps) {
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/almaenigma')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={cn("gap-3", className)}
    >
      <LogOut className="w-4 h-4" />
      Cerrar Sesión
    </Button>
  )
}