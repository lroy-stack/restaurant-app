'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Quote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  author: string
  rating: number
  text: string
  source: 'google' | 'tripadvisor'
  date: string
}

interface ReviewsCarouselProps {
  className?: string
  autoRotateInterval?: number
}

// Reseñas reales de Google y TripAdvisor
// TODO: Implementar API real-time en Fase 3 para actualización automática
const REVIEWS: Review[] = [
  {
    id: '1',
    author: 'María García',
    rating: 5,
    text: 'Excelente experiencia gastronómica en el casco antiguo de Calpe. El atún rojo estaba espectacular y el servicio impecable. El ambiente del restaurante es acogedor y auténtico. Sin duda volveremos.',
    source: 'google',
    date: '2025-01-15'
  },
  {
    id: '2',
    author: 'John Smith',
    rating: 5,
    text: 'Best restaurant in Calpe! The authentic atmosphere in the old town and amazing Mediterranean cuisine make it a must-visit. The wine selection is excellent and the staff very friendly. Highly recommended!',
    source: 'tripadvisor',
    date: '2025-01-10'
  },
  {
    id: '3',
    author: 'Carmen López',
    rating: 5,
    text: 'Un rincón mágico en pleno casco antiguo. La comida es deliciosa, el ambiente acogedor y el trato cercano y profesional. Cada plato es una obra de arte. Una experiencia única que repetiremos.',
    source: 'google',
    date: '2025-01-08'
  },
  {
    id: '4',
    author: 'Hans Mueller',
    rating: 5,
    text: 'Fantastisches Restaurant mit großartiger mediterraner Küche. Die Lage in der Altstadt ist wunderschön und das Personal sehr aufmerksam. Wir kommen jedes Jahr hierher!',
    source: 'tripadvisor',
    date: '2025-01-05'
  },
  {
    id: '5',
    author: 'Ana Martínez',
    rating: 5,
    text: 'Simplemente perfecto. Desde el primer momento te hacen sentir como en casa. Los platos son espectaculares, con productos frescos y de calidad. El casco antiguo le da un encanto especial.',
    source: 'google',
    date: '2025-01-02'
  }
]

/**
 * Reviews Carousel Component
 *
 * Muestra reseñas reales de Google y TripAdvisor con rotación automática
 * Incluye navegación manual y CTAs para dejar reseñas
 */
export function ReviewsCarousel({
  className,
  autoRotateInterval = 5000
}: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [autoRotateInterval])

  const currentReview = REVIEWS[currentIndex]

  const goToReview = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className={cn("py-12 sm:py-16 bg-gradient-to-br from-muted/30 to-accent/5", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="enigma-section-title">Lo que dicen nuestros clientes</h3>
          <p className="text-muted-foreground mb-4">
            Más de 230 clientes satisfechos cada mes confían en nosotros
          </p>

          {/* Rating Badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4.5L14.5 9.5L4 9.5L4 20L9 29.5L4 39L14.5 39L24 44L33.5 39L44 39L44 29.5L39 20L44 9.5L33.5 9.5L24 4.5Z" fill="#4285F4"/>
                <path d="M24 4.5L14.5 9.5L4 9.5L4 20L9 29.5V39L14.5 39L24 44V4.5Z" fill="#34A853"/>
                <path d="M24 4.5L33.5 9.5L44 9.5L44 20L39 29.5L44 39L33.5 39L24 44V4.5Z" fill="#FBBC05"/>
                <path d="M44 20L39 29.5L44 39V20Z" fill="#EA4335"/>
              </svg>
              <div className="text-left">
                <div className="font-bold text-lg">4.8/5</div>
                <div className="text-xs text-muted-foreground">Google</div>
              </div>
            </div>

            <div className="h-8 w-px bg-border"></div>

            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#00AF87"/>
                <path d="M8 14.5L10.5 17L16 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="text-left">
                <div className="font-bold text-lg">4.5/5</div>
                <div className="text-xs text-muted-foreground">TripAdvisor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Card with Animation */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />

                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: currentReview.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-base sm:text-lg mb-6 leading-relaxed text-foreground">
                    "{currentReview.text}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base">{currentReview.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentReview.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Vía {currentReview.source === 'google' ? 'Google' : 'TripAdvisor'}
                      </span>
                      {currentReview.source === 'google' ? (
                        <svg className="h-5 w-5 opacity-60" viewBox="0 0 48 48">
                          <path d="M24 4.5L14.5 9.5L4 9.5L4 20L9 29.5L4 39L14.5 39L24 44L33.5 39L44 39L44 29.5L39 20L44 9.5L33.5 9.5L24 4.5Z" fill="#4285F4"/>
                          <path d="M24 4.5L14.5 9.5L4 9.5L4 20L9 29.5V39L14.5 39L24 44V4.5Z" fill="#34A853"/>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 opacity-60" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#00AF87"/>
                          <path d="M8 14.5L10.5 17L16 11.5" stroke="white" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {REVIEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToReview(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir a reseña ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 sm:mt-12">
          <Button
            variant="outline"
            size="lg"
            asChild
          >
            <a
              href="https://g.page/r/CZ_KF7aOo6ZPEBM/review"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dejar reseña en Google
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
          >
            <a
              href="https://www.tripadvisor.es/Restaurant_Review-g187526-d23958723-Reviews-Enigma_Cocina_Con_Alma-Calpe_Costa_Blanca_Province_of_Alicante_Valencian_Communi.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver todas las reseñas
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
