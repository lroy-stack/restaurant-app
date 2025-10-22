'use client'

import { useState, useEffect } from 'react'

export interface HeroImage {
  id: string
  name: string
  description: string | null
  url: string
  alt_text: string | null
  category: string
  type: string
  is_active: boolean
  display_order: number
}

interface UseHeroImageOptions {
  category?: string
}

export function useHeroImage(options: UseHeroImageOptions = {}) {
  const [image, setImage] = useState<HeroImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options.category) {
          params.set('category', options.category)
        }

        const url = `/api/media-library/hero${params.toString() ? `?${params}` : ''}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch hero image')
        }

        // Get first image from results
        setImage(result.data?.[0] || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching hero image:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHeroImage()
  }, [options.category])

  return {
    image,
    loading,
    error
  }
}
