'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { MediaItem } from "@/hooks/use-media-library"
import { useConditionalScrollLock } from '@/hooks/useScrollLock'

interface GalleryLightboxProps {
  isOpen: boolean
  onClose: () => void
  items: MediaItem[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onShare?: (item: MediaItem) => void
}

export function GalleryLightbox({
  isOpen,
  onClose,
  items,
  currentIndex,
  onIndexChange,
  onShare
}: GalleryLightboxProps) {
  const currentItem = items[currentIndex]

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onIndexChange(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onIndexChange(currentIndex + 1)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, items.length, onIndexChange, onClose])

  // 🎯 PROFESSIONAL SCROLL MANAGEMENT: Use centralized scroll lock system
  useConditionalScrollLock('gallery-lightbox', isOpen)

  if (!isOpen || !currentItem) return null

  const categoryLabels: Record<string, string> = {
    gallery_ambiente: 'Ambiente',
    gallery_platos: 'Nuestros Platos',
    gallery_ubicacion: 'Ubicación',
    gallery_cocina: 'En la Cocina'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-6xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* Desktop Layout: Horizontal */}
        <div className="hidden md:flex min-h-[80vh] max-h-[85vh]">
          {/* Left: Image */}
          <div className="relative flex-1 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center group">
            <img
              src={currentItem.url}
              alt={currentItem.alt_text || currentItem.name}
              className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />

            {/* Navigation Overlays */}
            {currentIndex > 0 && (
              <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center bg-gradient-to-r from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 w-12 rounded-full shadow-xl hover:scale-110 transition-all"
                  onClick={() => onIndexChange(currentIndex - 1)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
            )}

            {currentIndex < items.length - 1 && (
              <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-gradient-to-l from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 w-12 rounded-full shadow-xl hover:scale-110 transition-all"
                  onClick={() => onIndexChange(currentIndex + 1)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>

          {/* Right: Sidebar Info */}
          <div className="w-80 bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentIndex + 1} de {items.length}
                </span>
              </div>
              <div className="flex gap-1">
                {onShare && (
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-primary/10" onClick={() => onShare(currentItem)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-destructive/10" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6">
              {/* Category Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {categoryLabels[currentItem.category] || 'Galería'}
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
                  {currentItem.name}
                </h2>
                {currentItem.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {currentItem.description}
                  </p>
                )}
              </div>

              {/* Navigation Dots */}
              <div className="flex items-center justify-center gap-2 pt-4">
                {items.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, idx) => {
                  const realIndex = Math.max(0, currentIndex - 2) + idx
                  return (
                    <button
                      key={realIndex}
                      className={`h-2 rounded-full transition-all ${
                        realIndex === currentIndex
                          ? 'w-6 bg-primary'
                          : 'w-2 bg-primary/30 hover:bg-primary/50'
                      }`}
                      onClick={() => onIndexChange(realIndex)}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Vertical */}
        <div className="md:hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur border-b">
            <span className="text-sm font-medium text-muted-foreground">
              {currentIndex + 1} de {items.length}
            </span>
            <div className="flex gap-2">
              {onShare && (
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onShare(currentItem)}>
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100">
            <img
              src={currentItem.url}
              alt={currentItem.alt_text || currentItem.name}
              className="w-full h-auto max-h-[60vh] object-contain"
              loading="lazy"
            />

            {/* Mobile Navigation */}
            {currentIndex > 0 && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full shadow-lg"
                onClick={() => onIndexChange(currentIndex - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {currentIndex < items.length - 1 && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full shadow-lg"
                onClick={() => onIndexChange(currentIndex + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-white space-y-3">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {categoryLabels[currentItem.category] || 'Galería'}
            </div>
            <h3 className="font-bold text-lg">
              {currentItem.name}
            </h3>
            {currentItem.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {currentItem.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GalleryLightbox