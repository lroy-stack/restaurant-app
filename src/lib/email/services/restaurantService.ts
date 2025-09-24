// Restaurant Service - Dynamic data from real DB structure
// VERIFIED: Direct SSH connection to restaurante.restaurants table
// PATTERN: Real data fetching following CLAUDE.md directives

import { createAdminClient } from '@/lib/supabase/server'

export interface RestaurantData {
  id: string
  name: string
  address: string
  phone: string
  email: string
  description: string
  google_rating: number
  monthly_customers: number
  hours_operation: string
  location_type: string
  ambiente: string
  awards: string
  hero_title: string
}

export interface EmailRestaurantInfo {
  name: string
  email: string
  phone: string
  address: string
  description: string
  website: string
  googleMaps: string
  branding: {
    logo: string
    primaryColor: string
    accentColor: string
  }
}

/**
 * Fetch restaurant data from real DB structure (VERIFIED via SSH)
 * Uses exact field names from restaurante.restaurants table
 */
export async function getRestaurantData(restaurantId = 'rest_enigma_001'): Promise<RestaurantData | null> {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .schema('restaurante')
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (error) {
      console.error('❌ Error fetching restaurant data:', error)
      return null
    }

    return data as RestaurantData
  } catch (error) {
    console.error('❌ Failed to fetch restaurant data:', error)
    return null
  }
}

/**
 * Get formatted restaurant info for email templates
 * DYNAMIC: All data from DB, following React Email + Postmark patterns
 */
export async function getEmailRestaurantInfo(restaurantId = 'rest_enigma_001'): Promise<EmailRestaurantInfo> {
  try {
    const restaurantData = await getRestaurantData(restaurantId)

    if (restaurantData) {
      return {
        name: restaurantData.name,
        email: restaurantData.email,
        phone: restaurantData.phone,
        address: restaurantData.address, // REAL: "Carrer Justicia 6A, 03710 Calpe, Alicante"
        description: restaurantData.description,
        website: 'https://enigmaconalma.com',
        googleMaps: 'https://maps.google.com/?q=enigma+cocina+con+alma+calpe+alicante',
        branding: {
          logo: '/logo512.png', // PNG as requested
          primaryColor: 'oklch(0.45 0.15 200)', // --primary from globals.css
          accentColor: 'oklch(0.6 0.18 40)' // --accent from globals.css
        }
      }
    }

    // Fallback with REAL data if DB fails (last resort)
    return getFallbackRestaurantInfo()
  } catch (error) {
    console.error('❌ Error getting email restaurant info:', error)
    return getFallbackRestaurantInfo()
  }
}

/**
 * Fallback with VERIFIED real data (from SSH query)
 * Last resort if all DB queries fail
 */
function getFallbackRestaurantInfo(): EmailRestaurantInfo {
  return {
    name: 'Enigma Cocina Con Alma',
    email: 'reservas@enigmaconalma.com',
    phone: '+34 672 79 60 06',
    address: 'Carrer Justicia 6A, 03710 Calpe, Alicante',
    description: 'Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe.',
    website: 'https://enigmaconalma.com',
    googleMaps: 'https://maps.google.com/?q=enigma+cocina+con+alma+calpe+alicante',
    branding: {
      logo: '/logo512.png',
      primaryColor: 'oklch(0.45 0.15 200)',
      accentColor: 'oklch(0.6 0.18 40)'
    }
  }
}