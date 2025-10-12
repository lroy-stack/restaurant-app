'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Announcement } from '@/types/announcements'

interface AnnouncementToastProps {
  announcement: Announcement
  onClose: () => void
  onCTAClick: () => void
}

export function AnnouncementToast({ announcement, onClose, onCTAClick }: AnnouncementToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slide in animation
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  const handleCTA = () => {
    onCTAClick()
    if (announcement.ctaUrl) {
      window.location.href = announcement.ctaUrl
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-full max-w-sm md:max-w-md shadow-2xl rounded-xl border-2 overflow-hidden transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{
        backgroundColor: announcement.backgroundColor,
        borderColor: announcement.borderColor || announcement.backgroundColor
      }}
    >
      {/* Close Button */}
      {announcement.isDismissible && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 hover:bg-white transition-colors"
          aria-label="Close notification"
        >
          <X className="h-3 w-3 text-foreground" />
        </button>
      )}

      {/* Image */}
      {announcement.imageUrl && (
        <div className="relative h-32 w-full">
          <Image
            src={announcement.imageUrl}
            alt={announcement.imageAlt || announcement.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Badge & Title */}
        <div className="space-y-2">
          {announcement.badgeText && (
            <Badge
              className="text-xs font-bold uppercase"
              style={{ backgroundColor: announcement.badgeColor }}
            >
              {announcement.badgeText}
            </Badge>
          )}
          <h3
            className="text-lg font-bold leading-tight"
            style={{ color: announcement.textColor }}
          >
            {announcement.title}
          </h3>
        </div>

        {/* Content preview */}
        <p
          className="text-sm line-clamp-2"
          style={{ color: announcement.textColor }}
          dangerouslySetInnerHTML={{
            __html: announcement.content.replace(/<[^>]*>/g, '').substring(0, 120)
          }}
        />

        {/* CTA Button */}
        {announcement.ctaText && (
          <Button
            onClick={handleCTA}
            size="sm"
            className="w-full font-semibold"
            style={{
              backgroundColor: announcement.ctaButtonColor,
              color: announcement.textColor
            }}
          >
            {announcement.ctaText}
          </Button>
        )}
      </div>
    </div>
  )
}
