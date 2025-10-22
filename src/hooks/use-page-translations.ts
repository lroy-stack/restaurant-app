'use client'

import { useState, useEffect, useCallback } from 'react'

export type Language = 'es' | 'en' | 'de'

interface TranslationData {
  [sectionKey: string]: Record<string, any>
}

interface UsePageTranslationsOptions {
  page: string
  language?: Language
  section?: string
}

interface UsePageTranslationsReturn {
  t: (sectionKey: string, key: string, fallback?: string) => string
  translations: TranslationData
  loading: boolean
  error: string | null
  language: Language
  setLanguage: (lang: Language) => void
  refetch: () => Promise<void>
}

// In-memory cache for translations (shared across all hook instances)
const translationCache = new Map<string, { data: TranslationData; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Hook for fetching and managing page translations from database
 * Pattern inspired by react-i18next but with PostgreSQL backend
 *
 * @example
 * const { t, language, setLanguage } = usePageTranslations({
 *   page: 'reservations',
 *   language: 'es'
 * })
 *
 * // Usage: t(section, key, fallback)
 * <h1>{t('hero', 'title', 'Default Title')}</h1>
 */
export function usePageTranslations({
  page,
  language: initialLanguage = 'es',
  section
}: UsePageTranslationsOptions): UsePageTranslationsReturn {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [translations, setTranslations] = useState<TranslationData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sync internal state with prop changes
  useEffect(() => {
    setLanguage(initialLanguage)
  }, [initialLanguage])

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // ⚡ Check cache first
      const cacheKey = `${page}-${language}-${section || 'all'}`
      const cached = translationCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setTranslations(cached.data)
        setLoading(false)
        return
      }

      const params = new URLSearchParams({
        language,
        ...(section && { section })
      })

      const response = await fetch(`/api/translations/${page}?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch translations: ${response.status}`)
      }

      const data = await response.json()
      const translationsData = data.translations || {}

      setTranslations(translationsData)

      // ⚡ Store in cache
      translationCache.set(cacheKey, {
        data: translationsData,
        timestamp: Date.now()
      })
    } catch (err) {
      console.error('Error fetching translations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load translations')
      setTranslations({})
    } finally {
      setLoading(false)
    }
  }, [page, language, section])

  useEffect(() => {
    fetchTranslations()
  }, [fetchTranslations])

  /**
   * Translation function - t(section, key, fallback)
   * Follows react-i18next pattern for consistency
   */
  const t = useCallback((
    sectionKey: string,
    key: string,
    fallback: string = ''
  ): string => {
    try {
      const sectionData = translations[sectionKey]
      if (!sectionData) return fallback

      const value = sectionData[key]
      return value ?? fallback
    } catch {
      return fallback
    }
  }, [translations])

  return {
    t,
    translations,
    loading,
    error,
    language,
    setLanguage,
    refetch: fetchTranslations
  }
}
