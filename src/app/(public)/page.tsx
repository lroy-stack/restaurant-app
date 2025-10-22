import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Award, Users, Utensils, MapPin, Phone, Mail, Clock, Navigation } from "lucide-react"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { FeaturedDishes } from "@/components/homepage/featured-dishes"
import { FeaturedWines } from "@/components/homepage/featured-wines"
import { InstagramFeed } from "@/components/homepage/instagram-feed"
import { ReviewsCarousel } from "@/components/homepage/reviews-carousel"
import { HeroTrustSignals } from "@/components/homepage/hero-trust-signals"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { getRestaurant } from "@/lib/data/restaurant"
import { getHeroImage } from "@/lib/data/media"
import { isRestaurantOpenNow } from "@/lib/business-hours-server"

/**
 * Homepage - Server Component con parallel data fetching
 *
 * Pattern: Context7 /vercel/next.js - Implement Parallel Data Fetching
 *
 * Before: 3.57s sequential fetches
 * After: <1s parallel (slowest query wins)
 */
export default async function HomePage() {
  // PARALLEL FETCH con React.cache() memoization
  // Si FloatingNavbar también llama getRestaurant(),
  // React.cache() asegura que solo se ejecuta 1 vez
  const [restaurant, heroImage] = await Promise.all([
    getRestaurant(),
    getHeroImage('home')
  ])

  // Check if restaurant is open (server-side)
  const isOpen = await isRestaurantOpenNow()

  return (
    <>
      {/* Hero Section - 100% Responsive */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/20 z-10" />
          {/* Dynamic hero image from media library */}
          <img
            src={heroImage?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&auto=format&fit=crop'}
            alt={restaurant.name || 'Restaurant'}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 55%' }}
          />
        </div>

        <div className="relative z-20 text-center text-white mx-auto px-4 sm:px-6 lg:px-8 pt-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {/* Trust Signals - Client Component for CountUp animation */}
          <HeroTrustSignals
            googleRating={restaurant.google_rating}
            awards={restaurant.awards}
            monthlyCustomers={restaurant.monthly_customers}
          />

          {/* Responsive Typography - DYNAMIC FROM DB */}
          <h1 className="enigma-hero-title">
            {restaurant.hero_title || restaurant.name}
          </h1>

          <p className="enigma-hero-subtitle">
            {restaurant.description}
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

      {/* Instagram Feed Section */}
      <ScrollReveal direction="up" delay={0.1}>
        <InstagramFeed />
      </ScrollReveal>

      {/* Reviews Carousel Section */}
      <ScrollReveal direction="up" delay={0.2}>
        <ReviewsCarousel />
      </ScrollReveal>

      {/* Features Section - 100% Responsive Grid */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="enigma-section-title">{restaurant.homepage_experience_title || 'Nuestra Experiencia'}</h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {restaurant.homepage_experience_content}
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
                  <h4 className="enigma-subsection-title">{restaurant.homepage_feature_1_title || 'Nuestra Cocina'}</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {restaurant.homepage_feature_1_content}
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
                  <h4 className="enigma-subsection-title">{restaurant.homepage_feature_2_title || 'Ingredientes'}</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {restaurant.homepage_feature_2_content}
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
                  <h4 className="enigma-subsection-title">{restaurant.homepage_feature_3_title || 'Experiencia'}</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {restaurant.homepage_feature_3_content}
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
              <h3 className="enigma-section-title-large">{restaurant.contacto_hero_title || 'Visítanos'}</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <a href={`tel:${restaurant.phone.replace(/\s/g, '')}`} className="text-sm sm:text-base hover:text-primary">
                    {restaurant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <a href={`mailto:${restaurant.email}`} className="text-sm sm:text-base hover:text-primary">
                    {restaurant.email}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  </div>
                  <div className="text-sm sm:text-base space-y-2">
                    <div className="space-y-0.5">
                      {restaurant.hours_operation.split('|').map((schedule, idx) => (
                        <div key={idx}>{schedule.trim()}</div>
                      ))}
                    </div>
                    <Badge
                      variant={isOpen ? 'default' : 'secondary'}
                      className={cn(
                        "text-xs",
                        isOpen ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                      )}
                    >
                      {isOpen ? '🟢 Abierto ahora' : '🔴 Cerrado'}
                    </Badge>
                  </div>
                </div>

                {/* Quick Contact Buttons */}
                <div className="flex flex-wrap gap-2 mt-6">
                  <Link href={`tel:${restaurant.phone.replace(/\s/g, '')}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Llamar
                    </Button>
                  </Link>

                  <Link href={`https://wa.me/${restaurant.whatsapp_number.replace(/[^\d]/g, '')}`} target="_blank">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                    >
                      <WhatsAppIcon className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </Link>

                  <Link href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} target="_blank">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Cómo llegar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <Card className="p-4 sm:p-6 order-1 lg:order-2">
              <CardContent className="p-4 sm:p-6 pt-0">
                <h4 className="enigma-card-title">{restaurant.homepage_cta_reservation_title || 'Reserva tu Mesa'}</h4>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  {restaurant.homepage_cta_reservation_content}
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
