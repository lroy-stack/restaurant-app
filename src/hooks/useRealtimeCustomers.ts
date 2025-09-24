'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

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
  // Computed fields for UI
  name: string // computed: firstName + lastName
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  averageSpending: number
  visitFrequency: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface CustomerSummary {
  total: number
  active: number
  vip: number
  inactive: number
  newThisMonth: number
  totalRevenue: number
  averageOrderValue: number
}

interface UseRealtimeCustomersReturn {
  customers: Customer[]
  summary: CustomerSummary
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateCustomerStatus: (id: string, status: string, additionalData?: any) => Promise<boolean>
  updateVipStatus: (id: string, isVip: boolean) => Promise<boolean>
  exportCustomerData: (id: string) => Promise<boolean>
  deleteCustomerData: (id: string) => Promise<boolean>
}

interface RealtimeFilters {
  status?: string
  vipStatus?: string
  search?: string
  dateRange?: string
}

export function useRealtimeCustomers(filters: RealtimeFilters = {}): UseRealtimeCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState<CustomerSummary>({
    total: 0,
    active: 0,
    vip: 0,
    inactive: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // supabase client imported from lib
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastFetchRef = useRef<number>(0)

  // Throttle API calls to prevent excessive requests
  const throttledFetch = async () => {
    const now = Date.now()
    if (now - lastFetchRef.current < 1000) return // 1 second throttle
    lastFetchRef.current = now
    await fetchCustomers()
  }

  const fetchCustomers = async () => {
    try {
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.vipStatus && filters.vipStatus !== 'all') {
        params.append('vipStatus', filters.vipStatus)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.dateRange) {
        params.append('dateRange', filters.dateRange)
      }

      const response = await fetch(`/api/customers?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setCustomers(data.customers)
        setSummary(data.summary)
      } else {
        setError(data.error || 'Error fetching customers')
      }
    } catch (err) {
      setError('Network error fetching customers')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateCustomerStatus = async (
    id: string, 
    status: string, 
    additionalData?: any
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      })

      if (response.ok) {
        // Optimistic update
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === id 
              ? { ...customer, ...additionalData }
              : customer
          )
        )
        
        // Update summary
        updateSummaryAfterStatusChange(status)
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error updating customer')
        return false
      }
    } catch (err) {
      setError('Network error updating customer')
      console.error('Error updating customer:', err)
      return false
    }
  }

  const updateVipStatus = async (id: string, isVip: boolean): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}/vip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVip })
      })

      if (response.ok) {
        // Optimistic update
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === id 
              ? { ...customer, isVip }
              : customer
          )
        )
        
        // Update VIP count in summary
        setSummary(prev => ({
          ...prev,
          vip: isVip ? prev.vip + 1 : prev.vip - 1
        }))
        
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error updating VIP status')
        return false
      }
    } catch (err) {
      setError('Network error updating VIP status')
      console.error('Error updating VIP status:', err)
      return false
    }
  }

  const exportCustomerData = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}/export`, {
        method: 'GET'
      })

      if (response.ok) {
        // Download the exported data
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customer-data-${id}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        return true
      } else {
        setError('Error exporting customer data')
        return false
      }
    } catch (err) {
      setError('Network error exporting customer data')
      console.error('Error exporting customer data:', err)
      return false
    }
  }

  const deleteCustomerData = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove customer from local state
        setCustomers(prev => prev.filter(customer => customer.id !== id))
        
        // Update summary
        setSummary(prev => ({
          ...prev,
          total: prev.total - 1
        }))
        
        return true
      } else {
        setError('Error deleting customer data')
        return false
      }
    } catch (err) {
      setError('Network error deleting customer data')
      console.error('Error deleting customer data:', err)
      return false
    }
  }

  const updateSummaryAfterStatusChange = (newStatus: string) => {
    setSummary(prev => {
      const updated = { ...prev }
      
      // This is a simplified update - in a real app you'd track the old status too
      switch (newStatus) {
        case 'ACTIVE':
          updated.active += 1
          break
        case 'INACTIVE':
          updated.inactive += 1
          break
      }
      
      return updated
    })
  }

  // Set up real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      const channel = supabase
        .channel('customers')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'restaurante',
            table: 'customers'
          },
          (payload) => {
            console.log('Realtime customer change:', payload)
            
            switch (payload.eventType) {
              case 'INSERT':
                const newCustomer = {
                  ...payload.new,
                  name: `${payload.new.firstName} ${payload.new.lastName}`,
                  loyaltyTier: 'BRONZE' as const,
                  averageSpending: 0,
                  visitFrequency: 'LOW' as const
                } as Customer
                setCustomers(prev => [newCustomer, ...prev])
                setSummary(prev => ({
                  ...prev,
                  total: prev.total + 1,
                  active: prev.active + 1, // All customers in customers table are active
                  vip: prev.vip + (newCustomer.isVip ? 1 : 0)
                }))
                break
                
              case 'UPDATE':
                setCustomers(prev => 
                  prev.map(customer => 
                    customer.id === payload.new.id 
                      ? { 
                          ...customer, 
                          ...payload.new,
                          name: `${payload.new.firstName} ${payload.new.lastName}`
                        } as Customer
                      : customer
                  )
                )
                break
                
              case 'DELETE':
                setCustomers(prev => 
                  prev.filter(customer => customer.id !== payload.old.id)
                )
                setSummary(prev => ({
                  ...prev,
                  total: prev.total - 1
                }))
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to customers')
          }
        })

      channelRef.current = channel
    }

    setupRealtimeSubscription()

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, []) // Empty dependency array - we don't want to re-subscribe on filter changes

  // 🚨 EMERGENCY FIX: Consolidate dual effects to prevent infinite database calls
  // Fetch data when filters change OR on initial load
  useEffect(() => {
    throttledFetch()
  }, [filters.status, filters.vipStatus, filters.search, filters.dateRange]) // Removed duplicate initial fetch

  return {
    customers,
    summary,
    loading,
    error,
    refetch: fetchCustomers,
    updateCustomerStatus,
    updateVipStatus,
    exportCustomerData,
    deleteCustomerData
  }
}