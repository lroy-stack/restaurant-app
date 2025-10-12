'use client'

import { useEffect, useState } from 'react'
import { useAnnouncements } from '@/hooks/use-announcements'
import { AnnouncementPopup } from './AnnouncementPopup'
import { AnnouncementBanner } from './AnnouncementBanner'
import { AnnouncementToast } from './AnnouncementToast'
import type { Announcement } from '@/types/announcements'
import { LEGAL_CONSTANTS } from '@/types/legal'

export function AnnouncementManager() {
  const { currentAnnouncement, trackView, trackClick, trackDismiss, markAsDismissed } = useAnnouncements()
  const [visibleAnnouncement, setVisibleAnnouncement] = useState<Announcement | null>(null)
  const [cookieConsentResolved, setCookieConsentResolved] = useState(false)
  const [shownAnnouncementIds, setShownAnnouncementIds] = useState<Set<string>>(new Set())

  // Wait for cookie consent to be resolved before showing announcements
  useEffect(() => {
    // Check if cookie consent already exists
    const hasExistingConsent = localStorage.getItem(LEGAL_CONSTANTS.COOKIE_CONSENT_STORAGE_KEY)
    if (hasExistingConsent) {
      setCookieConsentResolved(true)
      return
    }

    // Listen for cookie consent resolution event
    const handleConsentResolved = () => {
      setCookieConsentResolved(true)
    }

    window.addEventListener('cookieConsentResolved', handleConsentResolved)

    return () => {
      window.removeEventListener('cookieConsentResolved', handleConsentResolved)
    }
  }, [])

  useEffect(() => {
    // Only show announcement if:
    // 1. Cookie consent is resolved
    // 2. There's a current announcement
    // 3. Nothing is currently visible
    // 4. This announcement hasn't been shown in this component session
    if (
      currentAnnouncement &&
      !visibleAnnouncement &&
      cookieConsentResolved &&
      !shownAnnouncementIds.has(currentAnnouncement.id)
    ) {
      setVisibleAnnouncement(currentAnnouncement)
      setShownAnnouncementIds(prev => new Set(prev).add(currentAnnouncement.id))
      // Track view after a short delay
      setTimeout(() => {
        trackView(currentAnnouncement.id)
      }, 1000)
    }
  }, [currentAnnouncement, visibleAnnouncement, trackView, cookieConsentResolved, shownAnnouncementIds])

  const handleClose = () => {
    if (visibleAnnouncement) {
      trackDismiss(visibleAnnouncement.id)
      markAsDismissed(visibleAnnouncement)
      setVisibleAnnouncement(null)
    }
  }

  const handleCTAClick = () => {
    if (visibleAnnouncement) {
      trackClick(visibleAnnouncement.id)
    }
  }

  // Don't render anything until cookie consent is resolved
  if (!cookieConsentResolved) return null

  if (!visibleAnnouncement) return null

  // Render based on display type
  switch (visibleAnnouncement.displayType) {
    case 'popup':
      return (
        <AnnouncementPopup
          announcement={visibleAnnouncement}
          onClose={handleClose}
          onCTAClick={handleCTAClick}
        />
      )
    case 'banner':
      return (
        <AnnouncementBanner
          announcement={visibleAnnouncement}
          onClose={handleClose}
          onCTAClick={handleCTAClick}
        />
      )
    case 'toast':
      return (
        <AnnouncementToast
          announcement={visibleAnnouncement}
          onClose={handleClose}
          onCTAClick={handleCTAClick}
        />
      )
    default:
      return null
  }
}
