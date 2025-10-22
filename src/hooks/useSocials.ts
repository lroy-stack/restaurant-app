'use client'

import { useState, useEffect } from 'react'

export interface SocialData {
  id: string
  restaurant_id: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok' | string
  username: string | null
  profile_url: string
  display_title: string | null
  description: string | null
  is_active: boolean
  display_order: number
  featured_posts: string[] | null
  created_at: string
  updated_at: string
}

interface UseSocialsOptions {
  platform?: string
}

export function useSocials(options: UseSocialsOptions = {}) {
  const [socials, setSocials] = useState<SocialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options.platform) {
          params.set('platform', options.platform)
        }

        const url = `/api/socials${params.toString() ? `?${params}` : ''}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch socials')
        }

        setSocials(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching socials:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSocials()
  }, [options.platform])

  // Helper: Get specific platform data
  const getPlatform = (platform: string): SocialData | null => {
    return socials.find(s => s.platform === platform) || null
  }

  // Helper: Get Instagram data
  const getInstagram = (): SocialData | null => {
    return getPlatform('instagram')
  }

  return {
    socials,
    loading,
    error,
    getPlatform,
    getInstagram
  }
}
