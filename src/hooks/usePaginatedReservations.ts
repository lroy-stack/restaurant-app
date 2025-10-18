'use client'

import { useState, useCallback } from 'react'

interface ReservationFilters {
  status?: string
  date?: string
  search?: string
  tableId?: string
  startDate?: string
  endDate?: string
}

interface PaginationState {
  cursor: string | null
  hasMore: boolean
  loading: boolean
}

export function usePaginatedReservations(filters: ReservationFilters) {
  const [reservations, setReservations] = useState<any[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    cursor: null,
    hasMore: true,
    loading: false
  })

  const fetchPage = useCallback(async (direction: 'forward' | 'backward' = 'forward') => {
    if (pagination.loading) return
    if (direction === 'forward' && !pagination.hasMore) return

    setPagination(prev => ({ ...prev, loading: true }))

    try {
      const params = new URLSearchParams({
        ...filters,
        cursor: pagination.cursor || '',
        direction,
        limit: '50'
      } as Record<string, string>)

      const response = await fetch(`/api/reservations?${params}`)
      const data = await response.json()

      setReservations(prev =>
        direction === 'forward'
          ? [...prev, ...(data.reservations || [])]
          : [...(data.reservations || []), ...prev]
      )

      setPagination({
        cursor: data.pagination?.cursor || null,
        hasMore: data.pagination?.hasMore || false,
        loading: false
      })
    } catch (error) {
      console.error('Pagination error:', error)
      setPagination(prev => ({ ...prev, loading: false }))
    }
  }, [filters, pagination.cursor, pagination.hasMore, pagination.loading])

  const loadMore = () => fetchPage('forward')

  const reset = () => {
    setReservations([])
    setPagination({ cursor: null, hasMore: true, loading: false })
  }

  return {
    reservations,
    loadMore,
    reset,
    hasMore: pagination.hasMore,
    loading: pagination.loading
  }
}
