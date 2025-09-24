'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Award, Users, Utensils } from "lucide-react"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { useMediaLibrary } from "@/hooks/use-media-library"
import { useRestaurant } from "@/hooks/use-restaurant"

interface TrustSignal {
  icon: React.ElementType
  value: string
  label: string
}

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const { restaurant, loading: restaurantLoading } = useRestaurant()
  const { getHeroImage, buildImageUrl, loading: mediaLoading } = useMediaLibrary({ type: 'hero' })

  // Get dynamic hero image
  const heroImage = getHeroImage('home')

  // Dynamic trust signals based on restaurant data
  const trustSignals: TrustSignal[] = [
    {
      icon: Star,
      value: restaurant?.google_rating ? `${restaurant.google_rating}/5` : "4.8/5",
      label: "Google"
    },
    {
      icon: Award,
      value: restaurant?.awards || "Restaurante Recomendado",
      label: "Costa Blanca"
    },
    {
      icon: Users,
      value: restaurant?.monthly_customers ? `${restaurant.monthly_customers}+` : "230+",
      label: "clientes satisfechos/mes"
    }
  ]

  // Show loading state
  if (restaurantLoading || mediaLoading) {
    return (
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16 ${className}`}>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        <div className="relative z-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16 ${className}`}>
      {/* Background with dynamic image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: heroImage
              ? `url(${buildImageUrl(heroImage)})`
              : 'url(https://ik.imagekit.io/insomnialz/compressed/enigma_night.png?updatedAt=1754141731421)'
          }}
        />
      </div>
      
      <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        {/* Trust Signals - Enhanced Responsive Design */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-6 text-sm">
          {trustSignals.map((signal, index) => {
            const Icon = signal.icon
            return (
              <div key={index} className="flex items-center gap-1">
                <Icon className={`h-4 w-4 ${index === 0 ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`} />
                <span className="enigma-brand-body font-semibold">{signal.value}</span>
                <span className="text-muted-foreground">{signal.label}</span>
              </div>
            )
          })}
        </div>

        <Badge variant="outline" className="mb-6 text-white border-white/50 bg-black/60 backdrop-blur-sm">
          🏛️ Restaurante en el Auténtico Casco Antiguo de Calpe
        </Badge>

        {/* Dynamic content from restaurant data */}
        <h1 className="enigma-hero-title">
          {restaurant?.hero_title || restaurant?.name || "Enigma Cocina Con Alma"}
        </h1>

        <p className="enigma-hero-subtitle opacity-90">
          {restaurant?.description || "Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe"}
        </p>

        <div className="enigma-hero-description mb-6 sm:mb-8 opacity-80">
          <p>{restaurant?.ambiente || "Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor donde cada plato cuenta una historia."}</p>
        </div>

        {/* Enhanced CTA Buttons with Urgency Messaging */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Link href="/reservas">
            <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
              <Utensils className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Reservar Mesa Ahora
            </Button>
          </Link>
          <Link href="/menu">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
              <EnigmaLogo className="mr-2 h-4 w-4 sm:h-5 sm:w-5" variant="white" />
              Descubrir Nuestro Menú
            </Button>
          </Link>
        </div>

        {/* Urgency/Scarcity Messaging */}
        <p className="text-sm opacity-70 mt-4">
          ⏰ Reserva con 6 horas de antelación • Plazas limitadas
        </p>
      </div>
    </section>
  )
}