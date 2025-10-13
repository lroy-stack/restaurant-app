'use client'

import { Button } from '@/components/ui/button'
import { Instagram } from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Importar InstagramEmbed sin SSR para evitar hydration errors
const InstagramEmbed = dynamic(
  () => import('react-social-media-embed').then((mod) => mod.InstagramEmbed),
  { ssr: false }
)

interface InstagramFeedProps {
  className?: string
}

/**
 * Instagram Feed Component
 *
 * Muestra los últimos posts/reels de @enigmaconalma usando embeds nativos de Instagram
 * Sin SSR para evitar errores de hydration
 * Los thumbnails se cargan automáticamente desde Instagram
 */
export function InstagramFeed({ className }: InstagramFeedProps) {
  // URLs de Instagram - los thumbnails/portadas se cargan automáticamente
  const recentPosts = [
    'https://www.instagram.com/reel/DOqLP0_CHbt/',
    'https://www.instagram.com/reel/DN2rX1Aogr-/',
    'https://www.instagram.com/reel/DM-vKuRIi39/',
    'https://www.instagram.com/reel/DOqLP0_CHbt/',
    'https://www.instagram.com/reel/DN2rX1Aogr-/',
    'https://www.instagram.com/reel/DM-vKuRIi39/',
  ]

  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="enigma-section-title">Síguenos en Instagram</h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre el día a día de Enigma: platos especiales, ambiente auténtico y experiencias reales de nuestros clientes
          </p>
          <a
            href="https://www.instagram.com/enigmaconalma/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline mt-2 inline-flex items-center gap-1 text-sm sm:text-base font-medium"
          >
            <Instagram className="h-4 w-4" />
            @enigmaconalma
          </a>
        </div>

        {/* Instagram Posts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
          {recentPosts.map((url, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-lg overflow-hidden bg-muted",
                "animate-in fade-in"
              )}
              style={{
                animationDelay: `${idx * 100}ms`,
                minHeight: '400px'
              }}
            >
              <InstagramEmbed
                url={url}
                width="100%"
              />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            <a
              href="https://www.instagram.com/enigmaconalma/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Seguir en Instagram
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
