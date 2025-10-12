'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Languages } from 'lucide-react'
import type { Announcement } from '@/types/announcements'

interface AnnouncementPopupProps {
  announcement: Announcement
  onClose: () => void
  onCTAClick: () => void
}

type Language = 'es' | 'en' | 'de'

export function AnnouncementPopup({ announcement, onClose, onCTAClick }: AnnouncementPopupProps) {
  const [open, setOpen] = useState(true)
  const [language, setLanguage] = useState<Language>('es')

  // Get content based on selected language
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
    setOpen(false)
    onClose()
  }

  const handleCTA = () => {
    onCTAClick()
    if (announcement.ctaUrl) {
      window.location.href = announcement.ctaUrl
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose()
      }
    }}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] p-0 overflow-hidden border-2 flex flex-col"
        onPointerDownOutside={(e) => {
          if (!announcement.isDismissible) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!announcement.isDismissible) {
            e.preventDefault()
          }
        }}
        style={{
          backgroundColor: announcement.backgroundColor,
          borderColor: announcement.borderColor || announcement.backgroundColor
        }}
      >
        {/* Language Toggle */}
        {hasTranslations && (
          <button
            onClick={cycleLanguage}
            className="absolute top-4 left-4 z-50 rounded-full bg-white/80 p-2 hover:bg-white transition-colors flex items-center gap-1"
            aria-label="Change language"
          >
            <Languages className="h-4 w-4 text-foreground" />
            <span className="text-xs font-bold text-foreground">{getLanguageLabel()}</span>
          </button>
        )}

        {/* Close Button */}
        {announcement.isDismissible && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 rounded-full bg-white/80 p-2 hover:bg-white transition-colors"
            aria-label="Close announcement"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        )}

        {/* Image */}
        {announcement.imageUrl && (
          <div className="relative h-48 w-full flex-shrink-0">
            <Image
              src={announcement.imageUrl}
              alt={announcement.imageAlt || announcement.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 95vw, 672px"
            />
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Badge */}
          {announcement.badgeText && (
            <Badge
              className="text-xs font-bold uppercase"
              style={{ backgroundColor: announcement.badgeColor }}
            >
              {announcement.badgeText}
            </Badge>
          )}

          {/* Title */}
          <DialogTitle
            className="text-2xl font-bold leading-tight"
            style={{ color: announcement.textColor }}
          >
            {getTitle()}
          </DialogTitle>

          {/* Content (HTML) */}
          <div
            className="prose prose-sm max-w-none"
            style={{ color: announcement.textColor }}
            dangerouslySetInnerHTML={{ __html: getContent() }}
          />

          {/* CTA Button */}
          {announcement.ctaText && (
            <Button
              onClick={handleCTA}
              size="lg"
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
      </DialogContent>
    </Dialog>
  )
}
