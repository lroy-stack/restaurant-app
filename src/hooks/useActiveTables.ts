'use client'

// Hook to fetch active tables for POS system
import { useQuery } from '@tanstack/react-query'

interface Table {
  id: string
  number: string
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  capacity: number
  isActive: boolean
}

interface GroupedTables {
  [location: string]: Table[]
}

const LOCATION_LABELS: Record<string, string> = {
  TERRACE_CAMPANARI: 'Terraza Campanario',
  SALA_PRINCIPAL: 'Sala Principal',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
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
