'use client'

import { Button } from '@/components/ui/button'
import { Instagram, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface InstagramFeedProps {
  className?: string
}

interface InstagramPost {
  url: string
  imageUrl: string
  type: 'reel' | 'post'
}

/**
 * Instagram Feed Component
 *
 * Muestra los últimos posts de @enigmaconalma con thumbnails que enlazan a Instagram
 * Evita problemas de hydration y da control total sobre diseño
 */
export function InstagramFeed({ className }: InstagramFeedProps) {
  // Posts de Instagram con sus thumbnails
  // TODO: Agregar URLs reales de más posts + sus imágenes
  const recentPosts: InstagramPost[] = [
    {
      url: 'https://www.instagram.com/reel/DOqLP0_CHbt/',
      imageUrl: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421', // Placeholder temporal
      type: 'reel'
    },
    {
      url: 'https://www.instagram.com/reel/DN2rX1Aogr-/',
      imageUrl: 'https://ik.imagekit.io/insomnialz/IMG_9755.HEIC?updatedAt=1754141888431', // Placeholder temporal
      type: 'reel'
    },
    {
      url: 'https://www.instagram.com/reel/DOqLP0_CHbt/',
      imageUrl: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
      type: 'reel'
    },
    {
      url: 'https://www.instagram.com/reel/DN2rX1Aogr-/',
      imageUrl: 'https://ik.imagekit.io/insomnialz/IMG_9755.HEIC?updatedAt=1754141888431',
      type: 'reel'
    },
    {
      url: 'https://www.instagram.com/reel/DOqLP0_CHbt/',
      imageUrl: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
      type: 'reel'
    },
    {
      url: 'https://www.instagram.com/reel/DN2rX1Aogr-/',
      imageUrl: 'https://ik.imagekit.io/insomnialz/IMG_9755.HEIC?updatedAt=1754141888431',
      type: 'reel'
    }
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
          {recentPosts.map((post, idx) => (
            <a
              key={idx}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden bg-muted",
                "hover:scale-105 hover:shadow-xl transition-all duration-300",
                "animate-in fade-in"
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
              aria-label={`Ver ${post.type === 'reel' ? 'reel' : 'post'} en Instagram`}
            >
              {/* Image */}
              <Image
                src={post.imageUrl}
                alt={`Instagram ${post.type}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                  <Instagram className="h-10 w-10 text-white" />
                  {post.type === 'reel' && (
                    <Play className="h-8 w-8 text-white fill-white" />
                  )}
                </div>
              </div>

              {/* Type badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="text-white text-xs font-medium flex items-center gap-1">
                  {post.type === 'reel' ? (
                    <>
                      <Play className="h-3 w-3" />
                      Reel
                    </>
                  ) : (
                    <>
                      <Instagram className="h-3 w-3" />
                      Post
                    </>
                  )}
                </span>
              </div>
            </a>
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
