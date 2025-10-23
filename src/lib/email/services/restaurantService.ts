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
  tripadvisorUrl?: string
  instagramUrl?: string // ✅ NEW
  facebookUrl?: string // ✅ NEW
  whatsappNumber?: string // ✅ NEW
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
export async function getRestaurantData(restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'): Promise<any | null> {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .schema('public') // ✅ FIXED: Changed from 'restaurante' to 'public'
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (error) {
      console.error('❌ Error fetching restaurant data:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('❌ Failed to fetch restaurant data:', error)
    return null
  }
}

/**
 * Get formatted restaurant info for email templates
 * DYNAMIC: All data from DB, following React Email + Postmark patterns
 * ✅ UPDATED: No fallback - throws error if DB fails (forces proper configuration)
 */
export async function getEmailRestaurantInfo(restaurantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001'): Promise<EmailRestaurantInfo> {
  try {
    const restaurantData = await getRestaurantData(restaurantId)

    if (!restaurantData) {
      throw new Error(`Restaurant not found: ${restaurantId}. Cannot send emails without restaurant data from DB.`)
    }

    return {
      name: restaurantData.name,
      email: restaurantData.email,
      phone: restaurantData.phone,
      address: restaurantData.address,
      description: restaurantData.description,
      website: 'https://enigmaconalma.com', // TODO: Add field to DB
      googleMaps: 'https://maps.google.com/?q=enigma+cocina+con+alma+calpe+alicante', // TODO: Add field to DB
      tripadvisorUrl: restaurantData.footer_tripadvisor_url, // ✅ From DB
      instagramUrl: restaurantData.instagram_url, // ✅ From DB
      facebookUrl: restaurantData.facebook_url, // ✅ From DB
      whatsappNumber: restaurantData.whatsapp_number, // ✅ From DB
      branding: {
        logo: '/logo512.png',
        primaryColor: 'oklch(0.45 0.15 200)', // --primary from globals.css
        accentColor: 'oklch(0.6 0.18 40)' // --accent from globals.css
      }
    }
  } catch (error) {
    console.error('❌ CRITICAL: Failed to fetch restaurant data for emails:', error)
    throw error // ✅ Propagate error instead of using fallback
  }
}