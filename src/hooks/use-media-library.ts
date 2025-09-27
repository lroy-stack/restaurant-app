'use client'

import { useState, useEffect } from 'react'

export interface MediaItem {
  id: string
  name: string
  description?: string
  url: string
  alt_text?: string
  category:
    | 'hero_home' | 'hero_historia' | 'hero_menu' | 'hero_galeria'
    | 'hero_contacto' | 'hero_reservas' | 'footer' | 'gallery_ambiente'
    | 'gallery_platos' | 'gallery_ubicacion' | 'gallery_cocina'
  type: 'hero' | 'gallery' | 'footer' | 'general'
  is_active: boolean
  display_order: number
  restaurant_id: string
  image_kit_transforms?: string
  created_at: string
  updated_at: string
}

export interface MediaLibraryData {
  items: MediaItem[]
  categories: {
    id: string
    name: string
    count: number
  }[]
  summary: {
    total: number
    active: number
    byType: Record<string, number>
  }
}

interface UseMediaLibraryOptions {
  type?: 'hero' | 'gallery' | 'footer' | 'general'
  category?: string
  includeInactive?: boolean
}

export function useMediaLibrary(options: UseMediaLibraryOptions = {}) {
  const [mediaData, setMediaData] = useState<MediaLibraryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMediaLibrary = async () => {
    // This function is now handled in useEffect with timeout
    return Promise.resolve()
  }

  // Helper functions
  const getImagesByCategory = (category: string): MediaItem[] => {
    if (!mediaData) return []
    return mediaData.items.filter(item => item.category === category && item.is_active)
  }

  const getImagesByType = (type: string): MediaItem[] => {
    if (!mediaData) return []
    return mediaData.items.filter(item => item.type === type && item.is_active)
  }

  const getHeroImage = (page: string): MediaItem | null => {
    if (!mediaData) return null
    const category = `hero_${page}` as MediaItem['category']
    const images = mediaData.items
      .filter(item => item.category === category && item.is_active)
      .sort((a, b) => a.display_order - b.display_order)

    return images[0] || null
  }

  const buildImageUrl = (item: MediaItem): string => {
    if (!item.image_kit_transforms) return item.url

    // Parse existing URL and transforms to avoid duplicate parameters
    const urlObj = new URL(item.url)
    const transformParams = new URLSearchParams(item.image_kit_transforms)

    // Add transform parameters, preserving existing ones
    transformParams.forEach((value, key) => {
      if (!urlObj.searchParams.has(key)) {
        urlObj.searchParams.set(key, value)
      }
    })

    return urlObj.toString()
  }

  const getGalleryCategories = () => {
    if (!mediaData) return []

    const galleryItems = mediaData.items.filter(item => item.type === 'gallery' && item.is_active)
    const categoryCounts = galleryItems.reduce((acc, item) => {
      const categoryKey = item.category.replace('gallery_', '')
      acc[categoryKey] = (acc[categoryKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoryNames = {
      ambiente: 'Ambiente',
      platos: 'Nuestros Platos',
      ubicacion: 'Ubicación',
      cocina: 'En la Cocina'
    }

    return Object.entries(categoryCounts).map(([id, count]) => ({
      id,
      name: categoryNames[id as keyof typeof categoryNames] || id,
      count
    }))
  }

  useEffect(() => {
    const controller = new AbortController()

    const fetchWithTimeout = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (options.type) queryParams.set('type', options.type)
        if (options.category) queryParams.set('category', options.category)
        if (options.includeInactive) queryParams.set('includeInactive', 'true')

        const url = `/api/media-library?${queryParams}`
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setMediaData(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Error loading media')
          console.error('Media library error:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    // Disable timeout for debugging
    // const timeoutId = setTimeout(() => {
    //   controller.abort()
    //   setLoading(false)
    //   setError('Request timeout')
    // }, 5000)

    fetchWithTimeout()

    return () => {
      controller.abort()
    }
  }, [options.type, options.category, options.includeInactive])

  return {
    mediaData,
    loading,
    error,
    refetch: fetchMediaLibrary,
    // Helper functions
    getImagesByCategory,
    getImagesByType,
    getHeroImage,
    buildImageUrl,
    getGalleryCategories,
  }
}