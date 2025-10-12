'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import type { Announcement, AnnouncementFilters, InteractionType } from '@/types/announcements'
import { hasBeenDismissed, markAsDismissed, wasShownInSession } from '@/lib/cookies-announcements'

export function useAnnouncements(filters?: AnnouncementFilters) {
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['announcements', filters, pathname],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (filters?.type) queryParams.set('type', filters.type)
      if (filters?.displayType) queryParams.set('displayType', filters.displayType)
      if (filters?.isActive !== undefined) queryParams.set('isActive', filters.isActive.toString())
      if (filters?.isPublished !== undefined) queryParams.set('isPublished', filters.isPublished.toString())

      // Determine current page context
      const page = filters?.page || getCurrentPageContext(pathname)
      if (page) queryParams.set('page', page)

      const url = `/api/announcements?${queryParams}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Error loading announcements')
      }

      const result = await response.json()
      return result.data as Announcement[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Track interaction mutation
  const trackMutation = useMutation({
    mutationFn: async ({
      announcementId,
      interactionType,
      pageUrl
    }: {
      announcementId: string
      interactionType: InteractionType
      pageUrl?: string
    }) => {
      const response = await fetch('/api/announcements/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId,
          interactionType,
          pageUrl: pageUrl || window.location.href
        })
      })

      if (!response.ok) {
        throw new Error('Failed to track interaction')
      }

      return response.json()
    }
  })

  const trackView = (announcementId: string) => {
    trackMutation.mutate({
      announcementId,
      interactionType: 'view',
      pageUrl: window.location.href
    })
  }

  const trackClick = (announcementId: string) => {
    trackMutation.mutate({
      announcementId,
      interactionType: 'click',
      pageUrl: window.location.href
    })
  }

  const trackDismiss = (announcementId: string) => {
    trackMutation.mutate({
      announcementId,
      interactionType: 'dismiss',
      pageUrl: window.location.href
    })
  }

  const trackConversion = (announcementId: string) => {
    trackMutation.mutate({
      announcementId,
      interactionType: 'conversion',
      pageUrl: window.location.href
    })
  }

  // Get active announcements that haven't been dismissed
  const activeAnnouncements = (query.data || []).filter(announcement => {
    // Only filter by session if flag is active
    if (announcement.showOncePerSession && wasShownInSession(announcement.id)) {
      return false
    }

    // Only filter by cookie if flag is active
    if (announcement.showOncePerDay && hasBeenDismissed(announcement.id)) {
      return false
    }

    // If both flags are false, announcement shows every visit
    return true
  })

  // Get the highest priority announcement for current page
  const currentAnnouncement = activeAnnouncements[0] || null

  return {
    announcements: query.data ?? [],
    activeAnnouncements,
    currentAnnouncement,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    trackView,
    trackClick,
    trackDismiss,
    trackConversion,
    markAsDismissed: (announcement: Announcement) => {
      markAsDismissed(
        announcement.id,
        announcement.showOncePerDay,
        announcement.showOncePerSession
      )
      // DO NOT invalidate queries - causes infinite loop
      // queryClient.invalidateQueries({ queryKey: ['announcements'] })
    }
  }
}

// Helper to map pathname to page context
function getCurrentPageContext(pathname: string): string {
  if (pathname === '/' || pathname === '/inicio') return 'inicio'
  if (pathname.startsWith('/menu')) return 'menu'
  if (pathname.startsWith('/reservas')) return 'reservas'
  if (pathname.startsWith('/about')) return 'about'
  if (pathname.startsWith('/contact')) return 'contact'
  return 'all'
}
