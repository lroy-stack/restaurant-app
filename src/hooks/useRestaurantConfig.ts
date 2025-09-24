'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface RestaurantConfig {
  key: string
  value: any
  type: string
  description?: string
  category: string
}

interface UseRestaurantConfigReturn {
  config: Record<string, any>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateConfig: (key: string, value: string, description?: string) => Promise<boolean>
  getConfigValue: (key: string, defaultValue?: any) => any
}

// Configuration keys enum for type safety
export const CONFIG_KEYS = {
  // Reservation settings
  MAX_PARTY_SIZE: 'reservation_max_party_size',
  BUFFER_MINUTES: 'reservation_buffer_minutes',
  ADVANCE_MINUTES: 'reservation_advance_minutes',
  DEFAULT_DURATION: 'reservation_default_duration',
  SLOT_DURATION: 'reservation_slot_duration',
} as const

export function useRestaurantConfig(category?: string): UseRestaurantConfigReturn {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (category) {
        params.append('category', category)
      }
      params.append('typed', 'true')

      const response = await fetch(`/api/restaurant/config?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      if (result.success) {
        // Convert array to key-value object
        const configObject: Record<string, any> = {}

        if (Array.isArray(result.data)) {
          result.data.forEach((item: RestaurantConfig) => {
            configObject[item.key] = item.value
          })
        } else if (result.key && result.value !== undefined) {
          // Single value response
          configObject[result.key] = result.value
        }

        setConfig(configObject)
      } else {
        throw new Error(result.error || 'Failed to fetch configuration')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching restaurant config:', err)
    } finally {
      setLoading(false)
    }
  }, [category])

  const updateConfig = useCallback(async (
    key: string,
    value: string,
    description?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/restaurant/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      if (result.success) {
        // Update local state
        setConfig(prev => ({
          ...prev,
          [key]: result.data.value
        }))

        toast.success(`Configuración '${key}' actualizada correctamente`)
        return true
      } else {
        throw new Error(result.error || 'Failed to update configuration')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error(`Error actualizando configuración: ${errorMessage}`)
      console.error('Error updating restaurant config:', err)
      return false
    }
  }, [])

  const getConfigValue = useCallback((key: string, defaultValue?: any): any => {
    return config[key] !== undefined ? config[key] : defaultValue
  }, [config])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig,
    getConfigValue
  }
}

// Specialized hook for reservation configuration only
export function useReservationConfig() {
  const { config, loading, error, refetch, updateConfig, getConfigValue } =
    useRestaurantConfig('reservations')

  return {
    // Reservation-specific getters with type safety and defaults
    maxPartySize: getConfigValue(CONFIG_KEYS.MAX_PARTY_SIZE, 10),
    bufferMinutes: getConfigValue(CONFIG_KEYS.BUFFER_MINUTES, 150),
    advanceMinutes: getConfigValue(CONFIG_KEYS.ADVANCE_MINUTES, 30),
    defaultDuration: getConfigValue(CONFIG_KEYS.DEFAULT_DURATION, 150),
    slotDuration: getConfigValue(CONFIG_KEYS.SLOT_DURATION, 15),

    // General properties
    config,
    loading,
    error,
    refetch,
    updateConfig,
    getConfigValue
  }
}

// Utility function to get a single config value (for use in APIs)
export async function getServerConfigValue(key: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/restaurant/config?key=${key}`)
    const result = await response.json()

    if (result.success) {
      return result.value
    }
  } catch (error) {
    console.error(`Error fetching server config '${key}':`, error)
  }

  return null
}