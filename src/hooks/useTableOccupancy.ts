'use client'

import { useEffect, useState } from 'react'

interface OccupancyData {
  zone: string
  available: number
  occupied: number
  reserved: number
}

interface UseTableOccupancyReturn {
  data: OccupancyData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTableOccupancy(): UseTableOccupancyReturn {
  const [data, setData] = useState<OccupancyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOccupancy = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/table-occupancy')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Error fetching table occupancy')
      }
    } catch (err) {
      setError('Network error fetching table occupancy')
      console.error('Error fetching table occupancy:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOccupancy()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchOccupancy
  }
}
