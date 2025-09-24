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
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()

      if (options.type) queryParams.set('type', options.type)
      if (options.category) queryParams.set('category', options.category)
      if (options.includeInactive) queryParams.set('includeInactive', 'true')

      const url = `/api/media-library?${queryParams}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Error al cargar la biblioteca de medios')
      }

      const data = await response.json()
      setMediaData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
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

    const separator = item.url.includes('?') ? '&' : '?'
    return `${item.url}${separator}${item.image_kit_transforms}`
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
    fetchMediaLibrary()
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