'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Award, Users, Utensils, MapPin, Phone, Mail, Clock } from "lucide-react"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { FeaturedDishes } from "@/components/homepage/featured-dishes"
import { FeaturedWines } from "@/components/homepage/featured-wines"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { useMediaLibrary } from "@/hooks/use-media-library"
import { useRestaurant } from "@/hooks/use-restaurant"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { Suspense, memo } from "react"

export default function HomePage() {
  const { getHeroImage, buildImageUrl, loading: mediaLoading } = useMediaLibrary({ type: 'hero' })
  const { restaurant } = useRestaurant()
  const heroImage = getHeroImage('home')

  return (
    <>
      {/* Hero Section - 100% Responsive */}
      <section className="relative h-[109vh] flex items-center justify-center overflow-hidden -mt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/20 z-10" />
          {/* Optimized hero image with proper loading */}
          <div
            className="w-full h-full bg-cover bg-no-repeat"
            style={{
              backgroundImage: 'url(https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421)',
              backgroundPosition: 'center center'
            }}
          />
        </div>
        
        <div className="relative z-20 text-center text-white mx-auto px-4 sm:px-6 lg:px-8 pt-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {/* Trust Signals - Fully Responsive */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-6 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="enigma-brand-body font-semibold text-white">4.8/5</span>
              <span className="text-white/80">Google</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="enigma-brand-body text-white/90 font-medium">Restaurante Recomendado</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-white/90" />
              <span className="enigma-brand-body text-white/90 font-medium">230+ clientes satisfechos/mes</span>
            </div>
          </div>

          
          {/* Responsive Typography */}
          <h1 className="enigma-hero-title">
            Enigma Cocina Con Alma
          </h1>

          <p className="enigma-hero-subtitle">
            Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe
          </p>


          {/* Responsive CTA Buttons */}
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

      {/* Featured Dishes Section - REUTILIZANDO componentes del /menu */}
      <ScrollReveal direction="up" delay={0.1}>
        <Suspense fallback={
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-48 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        }>
          <FeaturedDishes maxItems={4} showViewMore={true} />
        </Suspense>
      </ScrollReveal>

      {/* Featured Wines Section - Nuestra Cava */}
      <ScrollReveal direction="up" delay={0.2}>
        <Suspense fallback={
          <section className="py-12 sm:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-64 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        }>
          <FeaturedWines maxItems={2} showViewMore={true} />
        </Suspense>
      </ScrollReveal>

      {/* Features Section - 100% Responsive Grid */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="enigma-section-title">Una Experiencia Gastronómica Única</h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                En Enigma Cocina Con Alma, cada plato cuenta una historia de tradición, innovación y pasión culinaria.
              </p>
            </div>
          </ScrollReveal>

          {/* Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ScrollReveal delay={0.1} direction="up">
              <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <EnigmaLogo className="h-6 w-6 sm:h-8 sm:w-8" variant="primary" />
                  </div>
                  <h4 className="enigma-subsection-title">Cocina de Autor</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Platos únicos que fusionan tradición atlántica y mediterránea con técnicas modernas.
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
                  <h4 className="enigma-subsection-title">Ingredientes Premium</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Seleccionamos los mejores productos locales y de temporada para garantizar máxima calidad.
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
                  <h4 className="enigma-subsection-title">Experiencia Completa</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Desde el servicio hasta el ambiente, cada detalle está pensado para crear momentos inolvidables.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Location & Contact Section - Responsive Layout */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="enigma-section-title-large">Visítanos en Calpe</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base">Carrer Justicia 6A, 03710 Calpe, Alicante</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <a href={`tel:${restaurant?.phone?.replace(/\s/g, '') || "+34672796006"}`} className="text-sm sm:text-base hover:text-primary">
                    {restaurant?.phone || "+34 672 79 60 06"}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <a href={`mailto:${restaurant?.email || "reservas@enigmaconalma.com"}`} className="text-sm sm:text-base hover:text-primary">
                    {restaurant?.email || "reservas@enigmaconalma.com"}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  </div>
                  <div className="text-sm sm:text-base space-y-0.5">
                    {restaurant?.hours_operation ? (
                      restaurant.hours_operation.split('|').map((schedule, idx) => (
                        <div key={idx}>{schedule.trim()}</div>
                      ))
                    ) : (
                      <span>Lun-Sáb: 18:30 - 23:00</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-4 sm:p-6 order-1 lg:order-2">
              <CardContent className="p-4 sm:p-6 pt-0">
                <h4 className="enigma-card-title">Reserva tu Mesa</h4>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Asegura tu lugar en nuestra mesa para una experiencia gastronómica única. 
                  Te recomendamos reservar con antelación.
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
    </>
  )
}
