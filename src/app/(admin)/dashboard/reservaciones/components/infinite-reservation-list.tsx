'use client'

import { useEffect, useRef } from 'react'
import { usePaginatedReservations } from '@/hooks/usePaginatedReservations'
import { CompactReservationList } from './compact-reservation-list'
import { Button } from '@/components/ui/button'

interface ReservationFilters {
  status?: string
  date?: string
  search?: string
  tableId?: string
}

interface InfiniteReservationListProps {
  filters: ReservationFilters
  onStatusUpdate?: (id: string, status: string, additionalData?: any) => Promise<void>
  onReservationUpdate?: (id: string, data: any) => Promise<boolean>
  onReservationDelete?: (id: string) => Promise<void>
}

export function InfiniteReservationList({
  filters,
  onStatusUpdate,
  onReservationUpdate,
  onReservationDelete
}: InfiniteReservationListProps) {
  const { reservations, loadMore, hasMore, loading } = usePaginatedReservations(filters)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.5 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  return (
    <div className="space-y-4">
      <CompactReservationList
        reservations={reservations}
        loading={loading && reservations.length === 0}
        onStatusUpdate={onStatusUpdate || undefined}
        onReservationUpdate={onReservationUpdate || undefined}
        onReservationDelete={onReservationDelete || undefined}
        bulkMode={false}
      />

      {hasMore && (
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          ) : (
            <Button onClick={loadMore} variant="outline" size="sm">
              Cargar más reservas
            </Button>
          )}
        </div>
      )}

      {!hasMore && reservations.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          No hay más reservas para mostrar
        </p>
      )}
    </div>
  )
}
