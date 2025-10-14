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
          description: 'Cocina mediterránea de autor en el corazón del casco antiguo de Calpe. Ingredientes de proximidad, técnicas tradicionales y pasión en cada plato.',
          ambiente: 'Un refugio gastronómico en el auténtico casco antiguo, donde las calles empedradas y la arquitectura centenaria crean el escenario perfecto para tu experiencia culinaria.',
          address: 'Carrer Justicia 6A, 03710 Calpe, Alicante',
          phone: '+34 672 79 60 06',
          email: 'reservas@enigmaconalma.com',
          google_rating: 4.8,
          monthly_customers: 230,
          hours_operation: 'Lun-Sab: 18:30 - 23:00',
          location_type: 'casco_antiguo',
          awards: 'Restaurante Recomendado',
          hero_title: 'Enigma Cocina Con Alma',
          // Dynamic Historia sections
          historia_hero_title: 'Tradición y Pasión',
          historia_hero_subtitle: 'En el corazón del casco antiguo de Calpe, donde la tradición culinaria se encuentra con la pasión mediterránea.',
          historia_pasion_title: 'Una Pasión Que Nace del Corazón',
          historia_pasion_paragraph1: 'Enigma es la historia de una segunda oportunidad, de resurgir con más fuerza, poniendo cariño a todos los detalles, recuperando una cocina de tradición.',
          historia_pasion_paragraph2: 'Pasión y alma nos definen. Es la historia de un sueño y el nuestro es que disfruten la experiencia en la que tanto amor hemos puesto.',
          historia_valor_tradicion_content: 'Respetamos las raíces culinarias atlántico-mediterráneas, honrando cada receta tradicional con técnicas ancestrales.',
          historia_valor_pasion_content: 'Cada plato se elabora con dedicación absoluta, convirtiendo ingredientes selectos en experiencias gastronómicas memorables.',
          historia_valor_comunidad_content: 'Somos parte del corazón de Calpe, creando conexiones auténticas con nuestra comunidad local e internacional.',
          historia_location_title: 'Un Lugar Con Historia',
          historia_location_content: 'El casco antiguo de Calpe es un testimonio vivo de siglos de historia mediterránea. Nuestro restaurante se encuentra en Carrer Justicia 6A, una ubicación que respira autenticidad y tradición en cada rincón. Las calles empedradas y las fachadas centenarias crean el escenario perfecto para nuestra propuesta gastronómica. Aquí, rodeados de historia, ofrecemos una experiencia culinaria que honra el pasado mientras abraza el presente.',
          historia_quote: 'Donde cada rincón respira historia y cada plato cuenta una tradición que honramos con dedicación.',
          vive_historia_title: 'Vive Nuestra Historia',
          vive_historia_content: 'Te invitamos a ser parte de nuestra historia. Reserva tu mesa y descubre por qué somos el restaurante recomendado en el auténtico casco antiguo de Calpe.',
          // Dynamic Galería sections
          galeria_experiencia_title: 'Una Experiencia Visual Única',
          galeria_ambiente_title: 'Ambiente Histórico',
          galeria_ambiente_content: 'Ubicado en Carrer Justicia 6A, nuestro restaurante respira la autenticidad del casco antiguo. Las fachadas centenarias y callejuelas estrechas crean un ambiente íntimo donde la historia se siente en cada detalle.',
          galeria_cocina_title: 'Cocina Con Alma',
          galeria_cocina_content: 'Cada plato es una obra de arte culinaria que fusiona tradiciones atlánticas y mediterráneas con técnicas modernas y presentación innovadora.',
          // Dynamic Contacto sections
          contacto_final_title: 'Te Esperamos en Enigma',
          contacto_final_content: 'Te invitamos a vivir una experiencia gastronómica única en nuestro rincón del casco antiguo. Reserva tu mesa y déjate sorprender por nuestra cocina mediterránea con alma.',
          // Social Media URLs
          instagram_url: 'https://www.instagram.com/enigmaconalma/',
          facebook_url: 'https://www.facebook.com/enigma.restaurante.calpe/',
          whatsapp_number: '+34 672 79 60 06',

          // Footer
          footer_newsletter_title: 'Mantente al día con nuestro newsletter',
          footer_newsletter_description: 'Descubre nuestros platos especiales, eventos exclusivos y ofertas únicas directamente en tu email.',
          footer_newsletter_image_url: 'https://ik.imagekit.io/insomnialz/feeling.jpg?updatedAt=1754141886874',
          footer_tripadvisor_url: 'https://www.tripadvisor.es/Restaurant_Review-g187526-d23958723-Reviews-Enigma_Cocina_Con_Alma-Calpe_Costa_Blanca_Province_of_Alicante_Valencian_Communi.html',
          footer_copyright_text: 'Enigma Cocina Con Alma. Todos los derechos reservados.'
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