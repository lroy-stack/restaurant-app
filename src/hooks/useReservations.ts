'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export interface ReservationData {
  dateTime: string // ISO string format from ProfessionalForm
  tableIds: string[] // ✅ NEW: Array of table IDs
  partySize: number
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
}

export interface AvailabilityData {
  available: boolean
  totalTables: number
  requestedDateTime: string
  partySize: number
  duration: number
  preferredLocation?: string
  tablesByLocation: Record<string, any[]>
  recommendations: Array<{
    id: string
    number: number
    capacity: number
    location: string
    description: string
    priceMultiplier: number
  }>
}

export const useReservations = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  const checkAvailability = async (
    dateTime: string,
    partySize: number,
    preferredLocation?: string
  ): Promise<AvailabilityData | null> => {
    setIsCheckingAvailability(true)
    
    try {
      const [date, time] = dateTime.split('T')
      const timeOnly = time?.slice(0, 5) || '19:00'
      
      const response = await fetch('/api/tables/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time: timeOnly,
          partySize,
          duration: 150, // 2.5 hours default
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
        console.log('📋 Raw tables count:', data.data.tables?.length)

        // Transform API response (API now properly filters by isActive)
        const availableTables = data.data.tables
          .filter((table: any) => table.available) // Only filter by availability - API handles isActive
          .map((table: any) => ({
            id: table.tableId,
            number: table.tableNumber,
            capacity: table.capacity,
            location: table.zone,
            priceMultiplier: 1.0
          }))
          .sort((a: any, b: any) => {
            // Ordenamiento natural: T1, T2, ..., T10, T11 en vez de T1, T10, T11, T2
            const aNum = parseInt(a.number.replace(/[^0-9]/g, ''));
            const bNum = parseInt(b.number.replace(/[^0-9]/g, ''));
            return aNum - bNum;
          })

        return {
          available: availableTables.length > 0,
          totalTables: availableTables.length,
          requestedDateTime: `${data.data.summary.requestedDate}T${data.data.summary.requestedTime}:00`,
          partySize: data.data.summary.requestedPartySize,
          duration: data.data.summary.searchDuration,
          preferredLocation: preferredLocation,
          tablesByLocation: {},
          recommendations: availableTables
        }
      }
      
      return null
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Error al verificar disponibilidad. Inténtalo de nuevo.')
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
        preferredLanguage: data.preferredLanguage || 'ES' // FIXED: Use form language preference
      }

      // 🔧 DEBUG: Log exact payload being sent
      console.log('🚀 FRONTEND->API PAYLOAD:', JSON.stringify(apiData, null, 2))
      console.log('🔍 tableIds type:', typeof apiData.tableIds, 'value:', apiData.tableIds)
      console.log('🔍 Original data.tableIds:', data.tableIds, 'data.tableId:', data.tableId)
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  }
}