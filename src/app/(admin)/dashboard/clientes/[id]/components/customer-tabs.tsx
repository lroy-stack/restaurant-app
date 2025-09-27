'use client'

import { lazy, Suspense } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Calendar,
  Heart,
  Shield
} from 'lucide-react'
import type { Customer, CustomerMetrics } from '@/lib/validations/customer'

// Lazy load tab content components for better performance
const CustomerStats = lazy(() => import('./customer-stats').then(module => ({ default: module.CustomerStats })))
const CustomerReservations = lazy(() => import('./customer-reservations').then(module => ({ default: module.CustomerReservations })))
const CustomerPreferences = lazy(() => import('./customer-preferences').then(module => ({ default: module.CustomerPreferences })))
const CustomerGdpr = lazy(() => import('./customer-gdpr').then(module => ({ default: module.CustomerGdpr })))

interface ReservationStats {
  totalReservations: number
  completedReservations: number
  cancelledReservations: number
  noShows: number
  recentReservations: number
  upcomingReservations: number
  averagePartySize: number
  favoriteTimeSlots: [string, number][]
  completionRate: number
  cancellationRate: number
}

interface CustomerTabsProps {
  customerId: string
  customer: Customer
  metrics: CustomerMetrics
  reservationStats: ReservationStats
  onUpdateCustomerField: (field: string, value: unknown) => Promise<boolean>
  onUpdateGdprConsent: (consentType: string, granted: boolean) => Promise<void>
  onExportData: () => Promise<void>
  onDeleteData: () => Promise<void>
  canEdit?: boolean
}

// Loading skeleton component for better UX
const LoadingSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-1/4 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export function CustomerTabs({
  customerId,
  customer,
  metrics,
  reservationStats,
  onUpdateCustomerField,
  onUpdateGdprConsent,
  onExportData,
  onDeleteData,
  canEdit = true
}: CustomerTabsProps) {
  return (
    <Tabs defaultValue="stats" className="space-y-4">
      {/* Mobile-first responsive tabs that stack/scroll on small screens */}
      <TabsList
        className={cn(
          "grid h-10 w-full items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          "grid-cols-2 sm:grid-cols-4", // 2 columns on mobile, 4 on tablet+
          "gap-1 overflow-x-auto scrollbar-hide" // Horizontal scroll on mobile if needed
        )}
      >
        <TabsTrigger
          value="stats"
          className="flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm min-w-0"
        >
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Estadísticas</span>
        </TabsTrigger>

        <TabsTrigger
          value="reservations"
          className="flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm min-w-0"
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Reservas</span>
        </TabsTrigger>

        <TabsTrigger
          value="preferences"
          className="flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm min-w-0"
        >
          <Heart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Preferencias</span>
        </TabsTrigger>

        <TabsTrigger
          value="gdpr"
          className="flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm min-w-0"
        >
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">GDPR</span>
        </TabsTrigger>
      </TabsList>

      {/* Tab Content with Suspense for lazy loading */}
      <TabsContent value="stats" className="space-y-4 mt-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <CustomerStats
            customer={customer}
            metrics={metrics}
            reservationStats={reservationStats}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="reservations" className="space-y-4 mt-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <CustomerReservations
            customerId={customerId}
            reservations={[]}
            onViewReservation={(id) => console.log('View reservation', id)}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-4 mt-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <CustomerPreferences
            customer={customer}
            onUpdate={onUpdateCustomerField}
            canEdit={canEdit}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="gdpr" className="space-y-4 mt-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <CustomerGdpr
            customer={customer}
            onConsentUpdate={onUpdateGdprConsent}
            onExportData={onExportData}
            onDeleteData={onDeleteData}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}