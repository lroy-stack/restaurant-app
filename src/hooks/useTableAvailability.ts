import { useState, useEffect } from 'react'
import { supabase, checkTableAvailability } from '@/lib/supabase/client'

interface Table {
  id: string
  number: string
  capacity: number
  location: string
  qr_code?: string
  is_active: boolean
  status: 'available' | 'reserved' | 'unavailable'
  type?: 'individual' | 'combination' // 🆕 Support table combinations
}

interface UseTableAvailabilityResult {
  tables: Table[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTableAvailability(
  date: string,
  time: string,
  partySize: number,
  zone?: string // 🆕 Add zone parameter for filtering
): UseTableAvailabilityResult {
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = async () => {
    if (!date || !time || !partySize) {
      setTables([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 🚀 USE CENTRALIZED API: Clean API that returns individual available tables
      console.log('🎯 [HOOK] Using centralized availability API for:', { date, time, partySize, zone })
      const response = await fetch('/api/tables/availability', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          date,
          time,
          partySize,
          ...(zone && { tableZone: zone }) // 🆕 Include zone if provided
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.data?.tables)) {
        // 🚀 Transform API response to component format
        const transformedTables = data.data.tables.map((table: any) => ({
          id: table.tableId || table.id,
          number: table.tableNumber?.toString() || table.number,
          capacity: table.capacity,
          location: table.zone || table.location,
          qr_code: table.qr_code,
          is_active: table.is_active ?? true,
          status: table.available ? 'available' : (table.status || 'unavailable'),
          type: table.type || 'individual' // 🆕 Support combination vs individual
        }))
        
        setTables(transformedTables)
      } else {
        throw new Error(data.error || 'Invalid response format')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ Table availability fetch failed:', err)
      
      // NO FALLBACK DATA - Force real database connection
      // Enterprise systems must not use mock data in production
      setTables([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [date, time, partySize, zone]) // 🚀 CRITICAL FIX: Include zone in dependencies

  return { 
    tables, 
    isLoading, 
    error, 
    refetch: fetchAvailability 
  }
}