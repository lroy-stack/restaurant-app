'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Award, Users, MapPin, Star } from "lucide-react";
import { EnigmaLogo } from "@/components/ui/enigma-logo";
import Link from "next/link";
import { useRestaurant } from '@/hooks/use-restaurant';
import { useMediaLibrary } from "@/hooks/use-media-library";

export default function HistoriaPage() {
  const { restaurant, loading, error, getFormattedRating, getLocationDescription } = useRestaurant()
  const { getHeroImage, buildImageUrl, loading: mediaLoading } = useMediaLibrary({ type: 'hero' })
  const heroImage = getHeroImage('historia')

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {/* Hero Section with Real Restaurant Photo */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/45 z-10" />
          <div
            className="w-full h-full bg-cover bg-no-repeat"
            style={{
              backgroundImage: heroImage
                ? `url(${buildImageUrl(heroImage)})`
                : 'url(https://ik.imagekit.io/insomnialz/_DSC0559.jpg?tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)',
              backgroundPosition: 'center center'
            }}
          />
        </div>
        
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          <h1 className="enigma-hero-title">
            {restaurant?.historia_hero_title || 'Tradición y Pasión'}
          </h1>

          <p className="enigma-hero-subtitle">
            {restaurant?.historia_hero_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm sm:text-base text-white/90 mb-8">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">{restaurant?.awards}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white" />
              <span>{getLocationDescription()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16">
            <div className="order-2 lg:order-1">
              <h2 className="enigma-section-title-large">
                {restaurant?.historia_pasion_title || 'Una Pasión Que Nace del Corazón'}
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                  {restaurant?.historia_pasion_paragraph1}
                </p>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {restaurant?.historia_pasion_paragraph2}
                </p>
              </div>
            </div>
            
            <Card className="p-4 sm:p-6 order-1 lg:order-2 bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-lg">
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <EnigmaLogo className="h-8 w-8 sm:h-10 sm:w-10" variant="primary" />
                  </div>
                  <h3 className="enigma-subsection-title">Cocina Con Alma</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    Cada receta es una historia, cada ingrediente una tradición
                  </p>
                  <div className="flex justify-center items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">{getFormattedRating()}/5 Google</span>
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    {restaurant?.awards}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="enigma-subsection-title">Tradición</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {restaurant?.historia_valor_tradicion_content}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                  <EnigmaLogo className="h-6 w-6 sm:h-8 sm:w-8" variant="auto" />
                </div>
                <h3 className="enigma-subsection-title">Pasión</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {restaurant?.historia_valor_pasion_content}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h3 className="enigma-subsection-title">Comunidad</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {restaurant?.historia_valor_comunidad_content}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location Story */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="enigma-section-title-center">
              {restaurant?.historia_location_title || 'Un Lugar Con Historia'}
            </h2>
            
            <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-none shadow-lg">
              <CardContent className="p-6 sm:p-8 pt-0">
                <div className="prose prose-lg max-w-none">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    {restaurant?.historia_location_content}
                  </p>
                  <div className="bg-primary/10 p-4 sm:p-6 rounded-lg border-l-4 border-primary">
                    <p className="text-base sm:text-lg italic text-primary font-medium">
                      &quot;{restaurant?.historia_quote}&quot;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="enigma-section-title-large">
              {restaurant?.vive_historia_title || 'Vive Nuestra Historia'}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              {restaurant?.vive_historia_content}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/reservas">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4">
                  <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Reservar Mesa
                </Button>
              </Link>
              <Link href="/menu">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4">
                  <EnigmaLogo className="mr-2 h-4 w-4 sm:h-5 sm:w-5" variant="primary" />
                  Ver Nuestro Menú
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{restaurant?.address}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 text-primary">📞</span>
                  <a href={`tel:${restaurant?.phone?.replace(/\s/g, '')}`} className="hover:text-primary">{restaurant?.phone}</a>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 text-primary">✉️</span>
                  <a href={`mailto:${restaurant?.email}`} className="hover:text-primary">{restaurant?.email}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}