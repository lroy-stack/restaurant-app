import { ReactNode, Suspense } from 'react'
import { Metadata } from 'next'
import { StaffOrAbove } from '@/components/auth/role-guard'
import { ResponsiveSidebar } from '@/components/ui/responsive-sidebar'
import { FloatingNav } from '@/components/ui/mobile-nav'
import { cn } from '@/lib/utils'

// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard - Enigma Cocina Con Alma',
    default: 'Dashboard - Enigma Cocina Con Alma'
  },
  description: 'Panel de administración del restaurante Enigma Cocina Con Alma',
  robots: {
    index: false,
    follow: false,
  },
}

interface DashboardLayoutProps {
  children: ReactNode
}


function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r bg-card hidden lg:block">
        <div className="p-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
        </div>
        <div className="px-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <StaffOrAbove>
      <div className="h-screen bg-background">
        {/* Floating Navigation - appears only on mobile/tablet */}
        <FloatingNav />

        {/* Dashboard Layout - Professional Responsive Grid */}
        <div className={cn(
          "flex h-full" // Clean full height without adjustments
        )}>
          {/* Responsive Sidebar */}
          <ResponsiveSidebar className="w-64" />
          
          {/* Main Content Area - Responsive Grid */}
          <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "bg-background"
          )}>
            <Suspense fallback={<DashboardSkeleton />}>
              <div className={cn(
                "p-4 lg:p-6",
                "max-w-full",
                "space-y-6"
              )}>
                {children}
              </div>
            </Suspense>
          </main>
        </div>
      </div>
    </StaffOrAbove>
  )
}