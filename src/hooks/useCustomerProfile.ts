'use client'
import { getSupabaseHeaders } from '@/lib/supabase/config'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { CustomEmailData } from '@/lib/email/types/emailTypes'

// Types based on existing customer structure
interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  language: string
  dateOfBirth?: string
  preferredTime?: string
  preferredLocation?: string
  dietaryRestrictions: string[]
  allergies?: string
  favoriteDisheIds: string[]
  totalVisits: number
  totalSpent: number
  averagePartySize: number
  lastVisit?: string
  isVip: boolean
  emailConsent: boolean
  smsConsent: boolean
  marketingConsent: boolean
  dataProcessingConsent: boolean
  consentDate?: string
  consentIpAddress?: string
  consentUserAgent?: string
  gdprPolicyVersion?: string
  consentMethod?: string
  createdAt: string
  updatedAt: string
  // Extended data from API
  reservations?: any[]
  totalReservations?: number
}

interface CustomerMetrics {
  loyaltyScore: number
  customerTier: 'VIP Elite' | 'Oro' | 'Plata' | 'Bronce'
  visitFrequency: number
  avgSpendPerVisit: number
  clv: number
  completionRate: number
  noShowRate: number
  avgPartySize: number
  preferredTimeSlots: string[]
  favoriteItems: any[]
  seasonalityPattern: 'regular' | 'seasonal' | 'special_occasions'
  riskLevel: 'low' | 'medium' | 'high'
}

interface AIRecommendation {
  id: string
  type: 'marketing' | 'service' | 'retention' | 'upselling'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: string
}

export function useCustomerProfile(customerId: string) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch customer data with reservations
  const fetchCustomer = async () => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch(`/api/customers/${customerId}`)

      if (!response.ok) {
        throw new Error('Customer not found')
      }

      const data = await response.json()
      if (data.success) {
        setCustomer(data.customer)
      } else {
        throw new Error(data.error || 'Failed to fetch customer')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching customer')
    } finally {
      setLoading(false)
    }
  }

  // Calculate loyalty score (badezeit-inspired formula adapted for Spanish market)
  const loyaltyScore = useMemo(() => {
    if (!customer) return 0

    const monthsAsCustomer = Math.max(1, Math.floor(
      (new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    ))

    const hasSpecialOccasions = customer.reservations?.some(r => r.occasion) || false
    const completionRate = customer.totalVisits > 0 ? 85 : 0 // Mock completion rate

    return Math.min(100, Math.round(
      (customer.totalVisits * 12) +           // Base: visitas (peso alto para España)
      (customer.totalSpent / 30) +            // Gasto (ajustado a precios españoles)
      (completionRate * 0.8) +                // Fiabilidad del cliente
      (customer.isVip ? 25 : 0) +             // Bonus VIP
      (monthsAsCustomer * 2) +                // Antigüedad
      (customer.averagePartySize > 4 ? 10 : 0) + // Grupos grandes (+ revenue)
      (hasSpecialOccasions ? 5 : 0)           // Celebraciones (engagement)
    ))
  }, [customer])

  // Calculate customer tier
  const customerTier = useMemo((): 'VIP Elite' | 'Oro' | 'Plata' | 'Bronce' => {
    if (loyaltyScore >= 85) return 'VIP Elite'
    if (loyaltyScore >= 60) return 'Oro'
    if (loyaltyScore >= 35) return 'Plata'
    return 'Bronce'
  }, [loyaltyScore])

  // Calculate visit frequency (visits per month)
  const visitFrequency = useMemo(() => {
    if (!customer) return 0

    const monthsAsCustomer = Math.max(1, Math.floor(
      (new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    ))

    return customer.totalVisits / monthsAsCustomer
  }, [customer])

  // Calculate average spend per visit
  const avgSpendPerVisit = useMemo(() => {
    if (!customer || customer.totalVisits === 0) return 0
    return customer.totalSpent / customer.totalVisits
  }, [customer])

  // Calculate Customer Lifetime Value (CLV)
  const clv = useMemo(() => {
    if (!customer) return 0

    // Simple CLV calculation: avgSpendPerVisit * visitFrequency * 24 (months)
    return avgSpendPerVisit * visitFrequency * 24
  }, [avgSpendPerVisit, visitFrequency])

  // CRUD Operations
  const updateCustomerField = async (field: string, value: any) => {
    if (!customer) return false

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
        },
        body: JSON.stringify({ [field]: value })
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(prev => prev ? { ...prev, [field]: value } : null)
        toast.success('Cliente actualizado correctamente')
        return true
      } else {
        throw new Error('Failed to update customer')
      }
    } catch (err) {
      toast.error('Error al actualizar cliente')
      return false
    }
  }

  const toggleVipStatus = async () => {
    if (!customer) return false

    try {
      const response = await fetch(`/api/customers/${customerId}/vip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
        },
        body: JSON.stringify({ isVip: !customer.isVip })
      })

      if (response.ok) {
        setCustomer(prev => prev ? { ...prev, isVip: !prev.isVip } : null)
        toast.success(customer.isVip ? 'VIP status removed' : 'VIP status granted')
        return true
      } else {
        throw new Error('Failed to toggle VIP status')
      }
    } catch (err) {
      toast.error('Error al cambiar estado VIP')
      return false
    }
  }

  const exportCustomerData = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/export`, {
        method: 'GET',
        headers: {
          // Schema handled by getSupabaseHeaders()
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customer-${customer?.firstName}-${customer?.lastName}-data.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast.success('Datos exportados correctamente')
        return true
      } else {
        throw new Error('Failed to export data')
      }
    } catch (err) {
      toast.error('Error al exportar datos')
      return false
    }
  }

  const updateGdprConsent = async (consentType: string, granted: boolean) => {
    if (!customer) return false

    try {
      const response = await fetch(`/api/customers/${customerId}/gdpr`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
        },
        body: JSON.stringify({
          consentType,
          granted,
          ipAddress: '127.0.0.1', // In real app, get actual IP
          userAgent: navigator.userAgent
        })
      })

      if (response.ok) {
        // Update local state
        const consentField = `${consentType}Consent`
        setCustomer(prev => prev ? {
          ...prev,
          [consentField]: granted,
          consentDate: new Date().toISOString()
        } : null)

        toast.success('Consentimiento actualizado')
        return true
      } else {
        throw new Error('Failed to update consent')
      }
    } catch (err) {
      toast.error('Error al actualizar consentimiento')
      return false
    }
  }

  const sendCustomEmail = async (emailData: Partial<CustomEmailData>) => {
    if (!customer) {
      toast.error('Cliente no encontrado')
      return false
    }

    // Check email consent
    if (!customer.emailConsent) {
      toast.error('Cliente no ha dado consentimiento para recibir emails')
      return false
    }

    try {
      // Build complete email data with customer context
      const customEmailData: CustomEmailData = {
        // Required fields
        customerName: customer.firstName + ' ' + customer.lastName,
        customerEmail: customer.email,
        customSubject: emailData.customSubject || '',
        customMessage: emailData.customMessage || '',
        messageType: emailData.messageType || 'custom',

        // Restaurant defaults
        restaurantName: 'Enigma Cocina Con Alma',
        restaurantEmail: 'info@enigmaconalma.com',
        restaurantPhone: '+34 971 123 456',

        // Reservation defaults (required for EmailTemplateData)
        reservationId: `custom-${Date.now()}`,
        reservationDate: new Date().toLocaleDateString('es-ES'),
        reservationTime: '',
        partySize: 0,
        tableLocation: '',
        tableNumber: '',
        reservationStatus: 'COMPLETED',

        // Optional CTA
        ctaText: emailData.ctaText,
        ctaUrl: emailData.ctaUrl,

        // Rich client context from customer data
        clientContext: {
          totalVisits: customer.totalVisits,
          lastVisit: customer.lastVisit,
          favoriteItems: getFavoriteItems().map(item => item.name || ''),
          averageSpending: avgSpendPerVisit,
          isVip: customer.isVip,
          upcomingReservations: 0, // Would need to count from reservations
          cancelledReservations: 0, // Would need to calculate from history
          language: customer.language || 'ES',
          loyaltyTier: customerTier,
          preferredTimeSlots: getPreferredTimeSlots(),
          hasEmailConsent: customer.emailConsent,
          hasMarketingConsent: customer.marketingConsent
        },

        // Template metadata
        templateSource: emailData.templateSource || 'custom',
        priority: emailData.priority || 'normal',
        previewMode: emailData.previewMode || false
      }

      const response = await fetch('/api/emails/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
        },
        body: JSON.stringify(customEmailData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (emailData.previewMode) {
          toast.success('Vista previa generada correctamente')
          return result // Return preview data
        } else {
          toast.success(`Email ${emailData.messageType} enviado correctamente a ${customer.email}`)
          return true
        }
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (err) {
      console.error('❌ Error sending custom email:', err)
      toast.error('Error al enviar email personalizado')
      return false
    }
  }

  // Analytics functions
  const getReservationPatterns = () => {
    // Mock implementation - in real app, analyze reservation data
    return {
      preferredDays: ['Friday', 'Saturday'],
      preferredTimes: ['19:00', '20:30'],
      averagePartySize: customer?.averagePartySize || 2,
      seasonality: 'regular' as const
    }
  }

  const getFavoriteItems = () => {
    // Mock implementation - in real app, analyze order history
    return []
  }

  const getPreferredTimeSlots = () => {
    // Mock implementation - in real app, analyze reservation times
    return ['19:00', '20:30', '21:00']
  }

  const getRecommendations = (): AIRecommendation[] => {
    if (!customer) return []

    const recommendations: AIRecommendation[] = []

    // VIP upgrade recommendation
    if (!customer.isVip && loyaltyScore > 70) {
      recommendations.push({
        id: 'vip-upgrade',
        type: 'retention',
        priority: 'high',
        title: 'Candidato a VIP',
        description: 'Este cliente tiene un alto score de lealtad. Considera ofrecerle status VIP.',
        action: 'Ofrecer VIP'
      })
    }

    // Marketing email recommendation
    if (customer.emailConsent && visitFrequency < 0.5) {
      recommendations.push({
        id: 'email-reactivation',
        type: 'marketing',
        priority: 'medium',
        title: 'Reactivación por email',
        description: 'Cliente inactivo con consentimiento de email. Enviar oferta especial.',
        action: 'Enviar email'
      })
    }

    // Special occasion reminder
    if (customer.dateOfBirth) {
      const birthday = new Date(customer.dateOfBirth)
      const nextBirthday = new Date()
      nextBirthday.setMonth(birthday.getMonth())
      nextBirthday.setDate(birthday.getDate())

      const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilBirthday <= 30 && daysUntilBirthday >= 0) {
        recommendations.push({
          id: 'birthday-reminder',
          type: 'service',
          priority: 'high',
          title: 'Cumpleaños próximo',
          description: `Cumpleaños en ${daysUntilBirthday} días. Preparar celebración especial.`,
          action: 'Preparar sorpresa'
        })
      }
    }

    return recommendations
  }

  // Load customer data on mount
  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  return {
    // Data
    customer,
    loading,
    error,
    refetch: fetchCustomer,

    // Metrics
    loyaltyScore,
    customerTier,
    visitFrequency,
    avgSpendPerVisit,
    clv,

    // Operations
    updateCustomerField,
    toggleVipStatus,
    exportCustomerData,
    updateGdprConsent,
    sendCustomEmail,

    // Analytics
    getReservationPatterns,
    getFavoriteItems,
    getPreferredTimeSlots,
    getRecommendations
  }
}