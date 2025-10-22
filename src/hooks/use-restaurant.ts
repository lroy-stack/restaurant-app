'use client'

import { useState, useEffect } from 'react'
import { isRestaurantOpenNow as checkIsOpenNow } from '@/lib/business-hours-client'

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
  // Dynamic Historia sections
  historia_hero_title: string
  historia_hero_subtitle: string
  historia_pasion_title: string
  historia_pasion_paragraph1: string
  historia_pasion_paragraph2: string
  historia_valor_tradicion_content: string
  historia_valor_pasion_content: string
  historia_valor_comunidad_content: string
  historia_location_title: string
  historia_location_content: string
  historia_quote: string
  vive_historia_title: string
  vive_historia_content: string
  // Dynamic Galería sections
  galeria_experiencia_title: string
  galeria_ambiente_title: string
  galeria_ambiente_content: string
  galeria_cocina_title: string
  galeria_cocina_content: string
  // Dynamic Contacto sections
  contacto_final_title: string
  contacto_final_content: string
  contacto_hero_title: string
  contacto_hero_subtitle: string
  contacto_map_section_title: string

  // Homepage dynamic sections
  homepage_experience_title: string
  homepage_experience_content: string
  homepage_feature_1_title: string
  homepage_feature_1_content: string
  homepage_feature_2_title: string
  homepage_feature_2_content: string
  homepage_feature_3_title: string
  homepage_feature_3_content: string
  homepage_cta_reservation_title: string
  homepage_cta_reservation_content: string

  // Social Media URLs
  instagram_url: string
  facebook_url: string
  whatsapp_number: string

  // Footer
  footer_newsletter_title: string
  footer_newsletter_description: string
  footer_newsletter_image_url: string
  footer_tripadvisor_url: string
  footer_copyright_text: string

  // Mailing
  mailing: string

  // Contacto - Cómo Llegar
  contacto_transport_car_title: string
  contacto_transport_car_content: string
  contacto_transport_walk_title: string
  contacto_transport_walk_content: string
  contacto_transport_bus_title: string
  contacto_transport_bus_content: string
  contacto_quote: string
  contacto_location_badge: string

  // Galeria
  galeria_encuentranos_title: string

  // QR Configuration
  qr_primary_color: string
  qr_background_color: string
  zone_terrace_1_label: string
  zone_main_room_label: string
  zone_vip_room_label: string
  zone_terrace_2_label: string
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
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const fetchRestaurant = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/restaurant')

      if (!response.ok) {
        throw new Error(`Failed to fetch restaurant data: ${response.status}`)
      }

      const data = await response.json()
      setRestaurant(data)
    } catch (err) {
      console.error('Error fetching restaurant:', err)
      setError(err instanceof Error ? err.message : 'Failed to load restaurant data')
      setRestaurant(null)
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
    return isOpen
  }

  // Check if restaurant is open now (synced with DB)
  useEffect(() => {
    const checkOpenStatus = async () => {
      try {
        const openStatus = await checkIsOpenNow()
        setIsOpen(openStatus)
      } catch (error) {
        console.error('Error checking open status:', error)
        // Fallback to false
        setIsOpen(false)
      }
    }

    checkOpenStatus()

    // Refresh status every minute
    const interval = setInterval(checkOpenStatus, 60000)

    return () => clearInterval(interval)
  }, [])

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