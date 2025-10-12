'use client'

import { AnnouncementPopup } from '@/components/announcements/AnnouncementPopup'
import { AnnouncementBanner } from '@/components/announcements/AnnouncementBanner'
import { AnnouncementToast } from '@/components/announcements/AnnouncementToast'
import type { Announcement } from '@/types/announcements'

interface AnnouncementPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Announcement | null
}

export function AnnouncementPreview({ open, onOpenChange, announcement }: AnnouncementPreviewProps) {
  if (!open || !announcement) return null

  const handleDismiss = () => {
    onOpenChange(false)
  }

  const handleCTAClick = () => {
    console.log('CTA clicked in preview mode')
  }

  // Render announcement component directly based on display type
  switch (announcement.displayType) {
    case 'popup':
      return (
        <AnnouncementPopup
          announcement={announcement}
          onClose={handleDismiss}
          onCTAClick={handleCTAClick}
        />
      )

    case 'banner':
      return (
        <AnnouncementBanner
          announcement={announcement}
          onClose={handleDismiss}
          onCTAClick={handleCTAClick}
        />
      )

    case 'toast':
      return (
        <AnnouncementToast
          announcement={announcement}
          onClose={handleDismiss}
          onCTAClick={handleCTAClick}
        />
      )

    default:
      return null
  }
}
