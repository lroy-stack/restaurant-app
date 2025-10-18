'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function useReservationCountByDate(month: Date) {
  const [countByDate, setCountByDate] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true)
      try {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

        const response = await fetch(
          `/api/reservations/stats/by-date?startDate=${format(startOfMonth, 'yyyy-MM-dd')}&endDate=${format(endOfMonth, 'yyyy-MM-dd')}`
        )
        const data = await response.json()
        setCountByDate(data.countByDate || {})
      } catch (error) {
        console.error('Error fetching reservation counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [month])

  return { countByDate, loading }
}
