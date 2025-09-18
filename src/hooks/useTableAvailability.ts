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
  partySize: number
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
      // Primero intentar conexión directa con Supabase usando esquema restaurante
      const { data: availableTables, error: dbError } = await supabase.rpc('check_table_availability', {
        p_date: date,
        p_time: time,
        p_party_size: partySize
      })

      if (!dbError && availableTables) {
        console.log('✅ Direct Supabase connection successful')
        // Transform database response to expected format
        const transformedTables = availableTables
          .filter((table: any) => table.is_active !== false) // CRITICAL: Only active tables
          .map((table: any) => ({
            id: table.table_id || table.id,
            number: table.table_number?.toString() || table.number,
            capacity: table.capacity,
            location: table.zone || table.location,
            qr_code: table.qr_code,
            is_active: table.is_active ?? true,
            status: table.available ? 'available' : (table.status || 'unavailable')
          }))
        
        setTables(transformedTables)
        return
      }

      // Fallback to API route if direct connection fails
      console.log('⚠️ Direct Supabase failed, trying API route')
      const response = await fetch('/api/tables/availability', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          date, 
          time, 
          partySize 
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.data?.tables)) {
        // Transform API response to expected format
        const transformedTables = data.data.tables.map((table: any) => ({
          id: table.tableId || table.id,
          number: table.tableNumber?.toString() || table.number,
          capacity: table.capacity,
          location: table.zone || table.location,
          qr_code: table.qr_code,
          is_active: table.is_active ?? true,
          status: table.available ? 'available' : (table.status || 'unavailable')
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
  }, [date, time, partySize])

  return { 
    tables, 
    isLoading, 
    error, 
    refetch: fetchAvailability 
  }
}