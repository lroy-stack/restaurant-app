'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Award, Users, Utensils, MapPin, Phone, Mail, Clock, Navigation } from "lucide-react"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { FeaturedDishes } from "@/components/homepage/featured-dishes"
import { FeaturedWines } from "@/components/homepage/featured-wines"
import { InstagramFeed } from "@/components/homepage/instagram-feed"
import { ReviewsCarousel } from "@/components/homepage/reviews-carousel"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { Suspense, memo } from "react"
import { cn } from "@/lib/utils"
import CountUp from "react-countup"
import type { RestaurantData } from "@/lib/services/restaurant-service"

interface HomePageClientProps {
  restaurant: RestaurantData | null
  isOpen: boolean
  heroImageUrl?: string
}

export function HomePageClient({ restaurant, isOpen, heroImageUrl }: HomePageClientProps) {
  return (
    <>
      {/* Hero Section - Server-Rendered Data (NO flash, NO latency) */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img
            src={heroImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&auto=format&fit=crop'}
            alt={restaurant?.name || 'Restaurant'}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 55%' }}
          />
        </div>

        <div className="relative z-20 text-center text-white mx-auto px-4 sm:px-6 lg:px-8 pt-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {/* Trust Signals - NO loading state, data pre-rendered */}
          {restaurant && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-6 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="enigma-brand-body font-semibold text-white">{restaurant.google_rating}/5</span>
                <span className="text-white/80">Google</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="enigma-brand-body text-white/90 font-medium">{restaurant.awards}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-white/90" />
                <span className="enigma-brand-body text-white/90 font-medium">
                  <CountUp end={restaurant.monthly_customers} duration={2.5} separator="," suffix="+" /> clientes satisfechos/mes
                </span>
              </div>
            </div>
          )}

          {/* Title & Description - Instantly available */}
          <h1 className="enigma-hero-title">
            {restaurant?.hero_title || restaurant?.name || 'Restaurant'}
          </h1>

          <p className="enigma-hero-subtitle">
            {restaurant?.description || 'Bienvenidos a nuestro restaurante'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link href="/reservas">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4">
                <Utensils className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Reservar Mesa
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4">
                Ver Nuestro Menú
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rest of the sections with client-side components */}
      <ScrollReveal direction="up" delay={0.1}>
        <Suspense fallback={
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
              </div>
            </div>
          </section>
        }>
          <FeaturedDishes />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.15}>
        <Suspense fallback={
          <section className="py-12 sm:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
              </div>
            </div>
          </section>
        }>
          <FeaturedWines />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.2}>
        <ReviewsCarousel />
      </ScrollReveal>

      {/* Features Section - Server-rendered data */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="enigma-section-title">{restaurant?.homepage_experience_title || 'Nuestra Experiencia'}</h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {restaurant?.homepage_experience_content || 'Cargando...'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ScrollReveal delay={0.1} direction="up">
              <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <EnigmaLogo className="h-6 w-6 sm:h-8 sm:w-8" variant="primary" />
                  </div>
                  <h4 className="enigma-subsection-title">{restaurant?.homepage_feature_1_title || 'Nuestra Cocina'}</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {restaurant?.homepage_feature_1_content || 'Cargando...'}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="up">
              <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                  </div>
                  <h4 className="enigma-subsection-title">{restaurant?.homepage_feature_2_title || 'Ingredientes'}</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {restaurant?.homepage_feature_2_content || 'Cargando...'}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.3} direction="up">
              <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
                <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                    <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                  </div>
                  <h4 className="enigma-subsection-title">{restaurant?.homepage_feature_3_title || 'Experiencia'}</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {restaurant?.homepage_feature_3_content || 'Cargando...'}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="enigma-section-title-large">{restaurant?.contacto_hero_title || 'Visítanos'}</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base">{restaurant?.address || 'Cargando...'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <a href={`tel:${restaurant?.phone?.replace(/\s/g, '') || ""}`} className="text-sm sm:text-base hover:text-primary">
                    {restaurant?.phone || "Teléfono"}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <a href={`mailto:${restaurant?.email || ""}`} className="text-sm sm:text-base hover:text-primary">
                    {restaurant?.email || "Email"}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-sm sm:text-base">{restaurant?.hours_operation || "Horarios"}</span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/contacto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Cómo Llegar
                  </Button>
                </Link>
                <a href={`https://wa.me/${restaurant?.whatsapp_number?.replace(/[^0-9]/g, '') || ""}`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                    <WhatsAppIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            <Card className="p-4 sm:p-6 order-1 lg:order-2">
              <CardContent className="p-4 sm:p-6 pt-0">
                <h4 className="enigma-card-title">{restaurant?.homepage_cta_reservation_title || 'Reserva tu Mesa'}</h4>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  {restaurant?.homepage_cta_reservation_content || 'Cargando...'}
                </p>
                <Link href="/reservas">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3">
                    Hacer Reserva
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ScrollReveal direction="up" delay={0.25}>
        <Suspense fallback={
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
              </div>
            </div>
          </section>
        }>
          <InstagramFeed />
        </Suspense>
      </ScrollReveal>
    </>
  )
}
