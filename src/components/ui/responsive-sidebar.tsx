'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useMobileNavigation } from '@/hooks/useMobileNavigation'
import { useConditionalScrollLock } from '@/hooks/useScrollLock'
import { Button } from './button'
import { Separator } from './separator'
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  MapPin,
  UtensilsCrossed,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { EnigmaLogo } from './enigma-logo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/auth'
import { ThemeSelector } from '@/components/theme/theme-selector'

interface ResponsiveSidebarProps {
  children?: ReactNode
  className?: string
}

// Navigation items with professional iconography
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Reservaciones',
    href: '/dashboard/reservaciones',
    icon: Calendar,
    roles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Mesas',
    href: '/dashboard/mesas',
    icon: MapPin,
    roles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Menú',
    href: '/dashboard/menu',
    icon: UtensilsCrossed,
    roles: ['ADMIN', 'MANAGER']
  },
  {
    name: 'Clientes',
    href: '/dashboard/clientes',
    icon: Users,
    roles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'MANAGER']
  },
  {
    name: 'Configuración',
    href: '/dashboard/configuracion',
    icon: Settings,
    roles: ['ADMIN']
  }
]

export function ResponsiveSidebar({ children, className }: ResponsiveSidebarProps) {
  const {
    sidebarOpen,
    closeSidebar,
    sidebarRef,
    overlayRef,
    shouldShowFloatingNav,
    shouldShowSidebar
  } = useMobileNavigation()
  const router = useRouter()

  // 🎯 MODULAR COMPOSITION: Separate scroll lock responsibility
  useConditionalScrollLock('sidebar', shouldShowFloatingNav && sidebarOpen)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/almaenigma')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  // CRITICAL: Only render on desktop (prevents tablet/mobile conflicts)
  if (!shouldShowSidebar) return null

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {shouldShowFloatingNav && sidebarOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          // Base styles
          "bg-card border-r border-border shadow-sm",
          "flex flex-col transition-transform duration-300 ease-in-out",

          // When shouldShowSidebar: Always visible sidebar (desktop)
          shouldShowSidebar ? [
            "relative translate-x-0 z-auto"
          ] : [
            // When shouldShowFloatingNav: Fixed overlay sidebar (mobile/tablet)
            "fixed left-0 top-0 h-full w-64 z-50",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          ],

          className
        )}
        aria-label="Navegación principal"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <EnigmaLogo size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Enigma</h2>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => {
                    // Auto-close sidebar when using floating nav
                    if (shouldShowFloatingNav) {
                      closeSidebar()
                    }
                  }}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10 font-normal text-left px-3"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <Separator />

        {/* Theme Selector Section */}
        <div className="p-4">
          <ThemeSelector />
        </div>

        <Separator />

        {/* User Section */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Admin Usuario
              </p>
              <p className="text-xs text-muted-foreground">ADMIN</p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 font-normal text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        {/* Custom children content */}
        {children}
      </aside>
    </>
  )
}

// Utility component for sidebar content
export function SidebarSection({ 
  title, 
  children,
  className 
}: { 
  title?: string
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={cn("p-4", className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}