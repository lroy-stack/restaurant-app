'use client'

// Hook to fetch active tables for POS system
import { useQuery } from '@tanstack/react-query'

interface Table {
  id: string
  number: string
  location: 'TERRACE_1' | 'MAIN_ROOM' | 'VIP_ROOM' | 'TERRACE_2'
  capacity: number
  isActive: boolean
}

interface GroupedTables {
  [location: string]: Table[]
}

const LOCATION_LABELS: Record<string, string> = {
  TERRACE_1: 'Terraza 1o',
  MAIN_ROOM: 'Sala Principal',
  VIP_ROOM: 'Sala VIP',
  TERRACE_2: 'Terraza 2',
}

export function useActiveTables() {
  const query = useQuery({
    queryKey: ['active-tables'],
    queryFn: async () => {
      const response = await fetch('/api/tables')

      if (!response.ok) {
        throw new Error('Failed to fetch tables')
      }

      const data = await response.json()
      return data.tables as Table[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Filter only active tables
  const activeTables = query.data?.filter(t => t.isActive) || []

  // Group by location
  const grouped: GroupedTables = activeTables.reduce((acc, table) => {
    const location = table.location
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push(table)
    return acc
  }, {} as GroupedTables)

  // Sort tables within each group by number
  Object.keys(grouped).forEach(location => {
    grouped[location].sort((a, b) => {
      // Extract numeric part for sorting (T1, S10, etc)
      const numA = parseInt(a.number.replace(/\D/g, ''))
      const numB = parseInt(b.number.replace(/\D/g, ''))
      return numA - numB
    })
  })

  return {
    tables: activeTables,
    grouped,
    locationLabels: LOCATION_LABELS,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
