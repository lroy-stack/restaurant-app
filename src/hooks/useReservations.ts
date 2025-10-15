'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export interface ReservationData {
  dateTime: string // ISO string format from ProfessionalForm
  tableIds: string[] // ✅ NEW: Array of table IDs
  partySize: number
  childrenCount?: number // ✅ FIX: Children count (up to 8 years old)
  firstName: string
  lastName: string
  email: string
  phone: string // REQUIRED field for restaurant reservations
  occasion?: string
  dietaryNotes?: string
  specialRequests?: string
  preOrderItems?: Array<{
    id: string
    name: string
    price: number
    quantity: number
    type: 'dish' | 'wine'
  }>
  preOrderTotal?: number
  hasPreOrder?: boolean
  dataProcessingConsent: boolean // REQUIRED by GDPR Article 6 - Legal basis for processing
  emailConsent: boolean // Confirmation emails consent
  marketingConsent: boolean // Newsletter and promotional emails
  preferredLanguage?: 'ES' | 'EN' | 'DE'
  source?: 'admin' | 'web' // Source of reservation
}

export interface TableWithPosition {
  id: string
  number: string
  capacity: number
  location: string
  available: boolean
  status: string
  position_x: number
  position_y: number
  rotation: number
  width: number
  height: number
  priceMultiplier: number
}

export interface AvailabilityData {
  available: boolean
  totalTables: number
  requestedDateTime: string
  partySize: number
  duration: number
  preferredLocation?: string
  tablesByLocation: Record<string, any[]>
  recommendations: TableWithPosition[] // ✅ Updated with position data
  allTables: TableWithPosition[] // ✅ NEW: All tables including unavailable
  availableTables: TableWithPosition[] // ✅ NEW: Only available tables
}

export const useReservations = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityResults, setAvailabilityResults] = useState<AvailabilityData | null>(null)

  const checkAvailability = async (
    dateTime: string,
    partySize: number,
    preferredLocation?: string,
    includePrivate: boolean = false // Admin can see private/wildcard tables (S9, S10)
  ): Promise<AvailabilityData | null> => {
    setIsCheckingAvailability(true)

    try {
      const [date, time] = dateTime.split('T')
      const timeOnly = time?.slice(0, 5) || '19:00'

      // Build query params
      const params = new URLSearchParams({
        includePrivate: includePrivate.toString()
      })

      const response = await fetch(`/api/tables/availability?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time: timeOnly,
          partySize,
          // duration removed - let API use DB buffer_minutes dynamically
          tableZone: preferredLocation,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('🔍 API RESPONSE RAW:', JSON.stringify(data, null, 2))

      if (data.success && data.data) {
        console.log('✅ API Success, transforming tables...')
        console.log('📋 All tables count:', data.data.tables?.length)
        console.log('📋 Available tables count:', data.data.availableTables?.length)

        // ✅ Transform ALL tables (including unavailable) with position data
        const allTables: TableWithPosition[] = data.data.tables
          .map((table: any) => ({
            id: table.tableId,
            number: table.tableNumber,
            capacity: table.capacity,
            location: table.zone,
            available: table.available,
            status: table.status || 'unknown',
            position_x: table.position_x || 0,
            position_y: table.position_y || 0,
            rotation: table.rotation || 0,
            width: table.width || 120,
            height: table.height || 80,
            priceMultiplier: 1.0
          }))
          .sort((a: any, b: any) => {
            // Natural sorting: T1, T2, ..., T10, T11
            const aNum = parseInt(a.number.replace(/[^0-9]/g, ''))
            const bNum = parseInt(b.number.replace(/[^0-9]/g, ''))
            return aNum - bNum
          })

        // ✅ Separate available tables for backwards compatibility
        const availableTables = allTables.filter(table => table.available)

        const result = {
          available: availableTables.length > 0,
          totalTables: allTables.length,
          requestedDateTime: `${data.data.summary.requestedDate}T${data.data.summary.requestedTime}:00`,
          partySize: data.data.summary.requestedPartySize,
          duration: data.data.summary.searchDuration,
          preferredLocation: preferredLocation,
          tablesByLocation: {},
          recommendations: availableTables, // For MultiTableSelector
          allTables: allTables, // ✅ NEW: For FloorPlanSelector
          availableTables: availableTables // ✅ NEW: Explicit available list
        }
        setAvailabilityResults(result)
        return result
      }

      setAvailabilityResults(null)
      return null
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Error al verificar disponibilidad. Inténtalo de nuevo.')
      setAvailabilityResults(null)
      return null
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const createReservation = async (data: ReservationData) => {
    setIsLoading(true)

    try {
      // GDPR Compliance Validation (REQUIRED by law)
      if (!data.dataProcessingConsent) {
        throw new Error('El consentimiento para procesamiento de datos es obligatorio para realizar una reserva (GDPR Art. 6)')
      }

      // Transform data to match API expectations
      const [date, time] = data.dateTime.split('T')
      const timeOnly = time?.slice(0, 5) || '19:00'

      const apiData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone, // Required field
        date: date,
        time: timeOnly,
        partySize: data.partySize,
        childrenCount: data.childrenCount, // ✅ FIX: Include children count
        tableIds: data.tableIds ? data.tableIds : (data.tableId ? [data.tableId] : []), // ✅ FIXED: Support both tableIds array AND tableId fallback
        specialRequests: data.specialRequests || null,
        preOrderItems: data.preOrderItems || [],
        preOrderTotal: data.preOrderTotal || 0,
        // Professional reservation fields
        occasion: data.occasion || null,
        dietaryNotes: data.dietaryNotes || null, // FIXED: Now string from form processing
        // GDPR Consent Fields (validated above)
        dataProcessingConsent: data.dataProcessingConsent, // Always true at this point
        emailConsent: data.emailConsent,
        marketingConsent: data.marketingConsent,
        preferredLanguage: data.preferredLanguage || 'ES', // FIXED: Use form language preference
        source: data.source || 'web' // Source of reservation
      }

      // 🔧 DEBUG: Log exact payload being sent
      console.log('🚀 FRONTEND->API PAYLOAD:', JSON.stringify(apiData, null, 2))
      console.log('🔍 tableIds type:', typeof apiData.tableIds, 'value:', apiData.tableIds)
      console.log('🔍 Original data.tableIds:', data.tableIds, 'data.tableId:', data.tableId)

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.log('❌ Error response:', result)
        toast.error(`Error: ${result.error || 'Error del servidor'}`)
        throw new Error(`Server error: ${result.error || 'Failed to create reservation'}`)
      }

      console.log('✅ Success response data:', result)
      toast.success('¡Reserva confirmada exitosamente!')
      return result
    } catch (error) {
      console.error('💥 CAUGHT ERROR in useReservations:', error)
      console.error('💥 Error type:', typeof error)
      console.error('💥 Error message:', error instanceof Error ? error.message : error)
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack')
      // Don't show additional toast - specific error handling above already showed appropriate message
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (data.success && data.categories) {
        return data.categories
      }
      
      return []
    } catch (error) {
      console.error('Error fetching menu items:', error)
      return []
    }
  }

  const getTables = async () => {
    try {
      const response = await fetch('/api/tables')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching tables:', error)
      return []
    }
  }

  return {
    checkAvailability,
    createReservation,
    getMenuItems,
    getTables,
    isLoading,
    isCheckingAvailability,
    availabilityResults,
  }
}