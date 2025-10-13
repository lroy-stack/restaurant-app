'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Instagram, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface InstagramFeedProps {
  className?: string
}

interface InstagramPost {
  url: string
  thumbnail?: string
  loading: boolean
  error?: boolean
}

/**
 * Instagram Feed Component
 *
 * Muestra los últimos posts de @enigmaconalma usando custom cards
 * Sin headers de Instagram, control total del diseño
 */
export function InstagramFeed({ className }: InstagramFeedProps) {
  const postUrls = [
    'https://www.instagram.com/reel/DMYPOovoXA5/',
    'https://www.instagram.com/p/DNoG84kIUWm/',
    'https://www.instagram.com/p/DOIyaaoiLlR/',
    'https://www.instagram.com/p/DLNh-Uaooir/',
    'https://www.instagram.com/reel/DHNwxWeIag9/',
    'https://www.instagram.com/p/DOD5dGzCN2P/'
  ]

  const [posts, setPosts] = useState<InstagramPost[]>(
    postUrls.map(url => ({ url, loading: true }))
  )

  useEffect(() => {
    const fetchThumbnails = async () => {
      const results = await Promise.all(
        postUrls.map(async (url) => {
          try {
            const res = await fetch(`/api/instagram/thumbnail?url=${encodeURIComponent(url)}`)
            const data = await res.json()
            return {
              url,
              thumbnail: data.thumbnail,
              loading: false,
              error: !data.thumbnail
            }
          } catch {
            return { url, loading: false, error: true }
          }
        })
      )
      setPosts(results)
    }

    fetchThumbnails()
  }, [])

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
          {posts.map((post, idx) => (
            <Card
              key={post.url}
              className="group relative aspect-[4/5] overflow-hidden border-0 bg-muted animate-in fade-in cursor-pointer transition-transform hover:scale-[1.02]"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full w-full"
              >
                {post.loading && (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                )}

                {post.error && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
                    <Instagram className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Ver en Instagram</p>
                  </div>
                )}

                {post.thumbnail && (
                  <>
                    <img
                      src={post.thumbnail}
                      alt="Instagram post"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* Overlay con hover - Responsive */}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40 md:group-hover:bg-black/50">
                      <div className="flex h-full items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium text-card-foreground shadow-xl ring-1 ring-border/50 backdrop-blur-sm md:gap-2 md:px-4 md:py-2 md:text-sm">
                          <Instagram className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                          <span className="hidden xs:inline">Ver en</span>
                          <span>Instagram</span>
                          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 md:h-3 md:w-3" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </a>
            </Card>
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
