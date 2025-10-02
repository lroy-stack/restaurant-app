'use client'

import { useState, useEffect } from 'react'

interface ReservationStats {
  total: number
  completed: number
  upcoming: number
  cancelled: number
  confirmed: number
  pending: number
  noShow: number
  loading: boolean
  error: string | null
}

export function useCustomerReservationStats(customerId?: string): ReservationStats {
  const [stats, setStats] = useState<ReservationStats>({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    confirmed: 0,
    pending: 0,
    noShow: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!customerId) {
      setStats({
        total: 0,
        completed: 0,
        upcoming: 0,
        cancelled: 0,
        confirmed: 0,
        pending: 0,
        noShow: 0,
        loading: false,
        error: null
      })
      return
    }

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }))

        const response = await fetch(`/api/customers/${customerId}/reservations?limit=1`)
        const data = await response.json()

        if (response.ok && data.success && data.stats) {
          setStats({
            ...data.stats,
            loading: false,
            error: null
          })
        } else {
          setStats({
            total: 0,
            completed: 0,
            upcoming: 0,
            cancelled: 0,
            confirmed: 0,
            pending: 0,
            noShow: 0,
            loading: false,
            error: data.error || 'Failed to fetch reservation stats'
          })
        }
      } catch (error) {
        console.error('Reservation stats fetch error:', error)
        setStats({
          total: 0,
          completed: 0,
          upcoming: 0,
          cancelled: 0,
          confirmed: 0,
          pending: 0,
          noShow: 0,
          loading: false,
          error: 'Network error'
        })
      }
    }

    fetchStats()
  }, [customerId])

  return stats
}
