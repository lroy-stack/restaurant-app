'use client'

import { useEffect, useState } from 'react'

interface Table {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  isActive: boolean
  restaurantId: string
}

interface UseTablesReturn {
  tables: Table[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTables(): UseTablesReturn {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTables = async () => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch('/api/tables')
      const data = await response.json()

      if (data.success) {
        // Transform DB data to match component interface
        const transformedTables = data.tables.map((table: any) => ({
          id: table.id,
          number: table.number,
          capacity: table.capacity,
          location: table.location,
          isActive: table.isActive,
          restaurantId: table.restaurantId
        }))
        
        setTables(transformedTables)
      } else {
        setError(data.error || 'Error fetching tables')
      }
    } catch (err) {
      setError('Network error fetching tables')
      console.error('Error fetching tables:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  return {
    tables,
    loading,
    error,
    refetch: fetchTables
  }
}