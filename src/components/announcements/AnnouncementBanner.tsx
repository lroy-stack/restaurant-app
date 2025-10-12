'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Languages } from 'lucide-react'
import type { Announcement } from '@/types/announcements'

interface AnnouncementBannerProps {
  announcement: Announcement
  onClose: () => void
  onCTAClick: () => void
}

type Language = 'es' | 'en' | 'de'

export function AnnouncementBanner({ announcement, onClose, onCTAClick }: AnnouncementBannerProps) {
  const [visible, setVisible] = useState(true)
  const [language, setLanguage] = useState<Language>('es')

  const getTitle = () => {
    if (language === 'en' && announcement.titleEn) return announcement.titleEn
    if (language === 'de' && announcement.titleDe) return announcement.titleDe
    return announcement.title
  }

  const getContent = () => {
    if (language === 'en' && announcement.contentEn) return announcement.contentEn
    if (language === 'de' && announcement.contentDe) return announcement.contentDe
    return announcement.content
  }

  const hasTranslations = !!(announcement.titleEn || announcement.titleDe)

  const cycleLanguage = () => {
    if (language === 'es') setLanguage('en')
    else if (language === 'en') setLanguage('de')
    else setLanguage('es')
  }

  const getLanguageLabel = () => {
    if (language === 'es') return 'ES'
    if (language === 'en') return 'EN'
    return 'DE'
  }

  const handleClose = () => {
    setVisible(false)
    onClose()
  }

  const handleCTA = () => {
    onCTAClick()
    if (announcement.ctaUrl) {
      window.location.href = announcement.ctaUrl
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b-2 shadow-lg"
      style={{
        backgroundColor: announcement.backgroundColor,
        borderColor: announcement.borderColor || announcement.backgroundColor
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">
          {/* Image (optional, small) */}
          {announcement.imageUrl && (
            <div className="hidden md:block relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={announcement.imageUrl}
                alt={announcement.imageAlt || announcement.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {announcement.badgeText && (
                <Badge
                  className="text-xs font-bold uppercase"
                  style={{ backgroundColor: announcement.badgeColor }}
                >
                  {announcement.badgeText}
                </Badge>
              )}
              <h3
                className="text-sm md:text-base font-bold truncate"
                style={{ color: announcement.textColor }}
              >
                {getTitle()}
              </h3>
            </div>
            {/* Short content preview */}
            <p
              className="text-xs md:text-sm line-clamp-1"
              style={{ color: announcement.textColor }}
              dangerouslySetInnerHTML={{
                __html: getContent().replace(/<[^>]*>/g, '').substring(0, 100)
              }}
            />
          </div>

          {/* Language Toggle */}
          {hasTranslations && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                cycleLanguage()
              }}
              className="flex-shrink-0 rounded-full bg-white/80 p-1.5 hover:bg-white transition-colors flex items-center gap-1"
              aria-label="Change language"
            >
              <Languages className="h-3 w-3 text-foreground" />
              <span className="text-xs font-bold text-foreground">{getLanguageLabel()}</span>
            </button>
          )}

          {/* CTA Button */}
          {announcement.ctaText && (
            <Button
              onClick={handleCTA}
              size="sm"
              className="flex-shrink-0 font-semibold"
              style={{
                backgroundColor: announcement.ctaButtonColor,
                color: announcement.textColor
              }}
            >
              {announcement.ctaText}
            </Button>
          )}

          {/* Close Button */}
          {announcement.isDismissible && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 rounded-full bg-white/80 p-1.5 hover:bg-white transition-colors"
              aria-label="Close banner"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
