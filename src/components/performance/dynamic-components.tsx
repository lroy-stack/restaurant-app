'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Loading components for better UX
const ChartSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
)

const CalendarSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-24" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-8" />
      ))}
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="space-y-2">
    <div className="flex space-x-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
)

// Dynamic imports with optimized loading
// Heavy analytics components with Recharts
export const DynamicAnalyticsChart = dynamic(
  () => import('@/app/(admin)/dashboard/analytics/components/ui/analytics-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Chart components typically don't need SSR
  }
)

// Floor plan components removed - functionality moved to table status panel

// Map components with Leaflet
export const DynamicRestaurantMap = dynamic(
  () => import('@/components/maps/RestaurantMap'),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
    ssr: false, // Maps are client-side only
  }
)

export const DynamicBigCalendar = dynamic(
  () => import('react-big-calendar').then(mod => ({ default: mod.Calendar })),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
)

export const DynamicReactCalendar = dynamic(
  () => import('react-calendar'),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
)

export const DynamicDataTable = dynamic(
  () => import('@/components/ui/data-table').then(mod => ({ default: mod.DataTable })),
  {
    loading: () => <TableSkeleton />,
    ssr: true, // Tables might need SSR for SEO
  }
)

export const DynamicReservationForm = dynamic(
  () => import('@/components/reservations/reservation-form'),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-24" />
      </div>
    ),
    ssr: true, // Forms should be SSR for accessibility
  }
)

export const DynamicPDFViewer = dynamic(
  () => import('@/components/ui/pdf-viewer'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false, // PDF viewers don't need SSR
  }
)

export const DynamicQRGenerator = dynamic(
  () => import('@/components/ui/qr-generator'),
  {
    loading: () => <Skeleton className="h-32 w-32 mx-auto" />,
    ssr: false, // QR codes are client-side only
  }
)

// HOC for wrapping components with Suspense
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <Skeleton className="h-32 w-full" />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Route-based code splitting helpers
export const DynamicAdminDashboard = dynamic(
  () => import('@/app/(admin)/dashboard/page'),
  {
    loading: () => (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: true,
  }
)

export const DynamicMenuPage = dynamic(
  () => import('@/app/(public)/menu/page'),
  {
    loading: () => (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-48 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: true, // Menu should be SSR for SEO
  }
)