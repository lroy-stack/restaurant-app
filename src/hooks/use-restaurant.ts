'use client'

import { useState, useEffect } from 'react'

export interface RestaurantInfo {
  id: string
  name: string
  description: string
  ambiente: string
  address: string
  phone: string
  email: string
  google_rating: number
  monthly_customers: number
  hours_operation: string
  location_type: string
  awards: string
  hero_title: string
}

export interface RestaurantData {
  restaurant: RestaurantInfo | null
  loading: boolean
  error: string | null
}

export function useRestaurant() {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurant = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to fetch from API, fallback to static data if it fails
      try {
        const response = await fetch('/api/restaurant')
        
        if (!response.ok) {
          throw new Error('API not available, using fallback data')
        }

        const data = await response.json()
        setRestaurant(data)
      } catch (apiError) {
        console.warn('API failed, using fallback data:', apiError)
        
        // Fallback to static data - REAL restaurant information
        const fallbackData: RestaurantInfo = {
          id: 'rest_enigma_001',
          name: 'Enigma Cocina Con Alma',
          description: 'Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe.',
          ambiente: 'Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor.',
          address: 'Carrer Justicia 6A, 03710 Calpe, Alicante',
          phone: '+34 672 79 60 06',
          email: 'reservas@enigmaconalma.com',
          google_rating: 4.8,
          monthly_customers: 230,
          hours_operation: 'Mar-Dom: 18:00 - 23:00',
          location_type: 'casco_antiguo',
          awards: 'Restaurante Recomendado',
          hero_title: 'Enigma Cocina Con Alma'
        }
        setRestaurant(fallbackData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateRestaurant = async (updates: Partial<RestaurantInfo>) => {
    try {
      const response = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update restaurant info')
      }

      // Refresh restaurant data after update
      await fetchRestaurant()
    } catch (err) {
      throw err
    }
  }

  // Helper functions for specific data
  const getFormattedRating = (): string => {
    if (!restaurant) return '0.0'
    return restaurant.google_rating.toFixed(1)
  }

  const getFormattedCustomers = (): string => {
    if (!restaurant) return '0'
    return `${restaurant.monthly_customers}+ clientes satisfechos/mes`
  }

  const getLocationDescription = (): string => {
    if (!restaurant) return ''
    return restaurant.location_type === 'casco_antiguo' 
      ? 'En el auténtico casco antiguo de Calpe'
      : restaurant.ambiente
  }

  const isOpenNow = (): boolean => {
    // Simple implementation - could be expanded with proper time checking
    const now = new Date()
    const hour = now.getHours()
    return hour >= 18 && hour <= 24
  }

  useEffect(() => {
    fetchRestaurant()
  }, [])

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant,
    updateRestaurant,
    getFormattedRating,
    getFormattedCustomers,
    getLocationDescription,
    isOpenNow,
  }
}