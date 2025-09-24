'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Users, ChefHat, Utensils, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMediaLibrary } from "@/hooks/use-media-library";
import { useRestaurant } from "@/hooks/use-restaurant";

export default function GaleriaPage() {
  const { restaurant, loading: restaurantLoading } = useRestaurant()
  const { mediaData, loading: mediaLoading, getHeroImage, buildImageUrl, getGalleryCategories, getImagesByCategory } = useMediaLibrary({ type: 'gallery' })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get dynamic hero image
  const heroImage = getHeroImage('galeria')

  // Dynamic categories with icons
  const categoryIcons: Record<string, any> = {
    all: Camera,
    ambiente: Users,
    platos: ChefHat,
    ubicacion: MapPin,
    cocina: Utensils
  }

  const categories = [
    { id: "all", name: "Todas", icon: Camera, count: mediaData?.items.length || 0 },
    ...(getGalleryCategories().map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: categoryIcons[cat.id] || Camera,
      count: cat.count
    })))
  ]

  // Filter images by selected category
  const getFilteredImages = () => {
    if (!mediaData) return []
    if (selectedCategory === 'all') return mediaData.items
    return getImagesByCategory(`gallery_${selectedCategory}`)
  }

  const filteredImages = getFilteredImages()

  if (restaurantLoading || mediaLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando galería...</div>
  }
  return (
    <>
      {/* Hero Section with Dynamic Restaurant Photo */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/45 z-10" />
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: heroImage
                ? `url(${buildImageUrl(heroImage)})`
                : 'url(https://ik.imagekit.io/insomnialz/IMG_0686.heic?updatedAt=1757368334667&tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)'
            }}
          />
        </div>

        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          <Badge variant="outline" className="mb-6 text-white border-white/50 bg-black/60 backdrop-blur-sm">
            <Camera className="h-3 w-3 mr-1 text-white" />
            📸 Galería Visual
          </Badge>

          <h1 className="enigma-hero-title">
            {restaurant?.galeria_experiencia_title || "Descubre Nuestro Mundo"}
          </h1>

          <p className="enigma-hero-subtitle">
            {restaurant?.ambiente || "Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor"}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm sm:text-base text-white/90 mb-8">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">{restaurant?.awards || "Restaurante Recomendado"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white" />
              <span>{restaurant?.address || "Carrer Justicia 6A, Calpe"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No hay imágenes disponibles
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedCategory === 'all'
                  ? 'La galería está siendo actualizada con nuevas imágenes.'
                  : `No hay imágenes en la categoría "${categories.find(c => c.id === selectedCategory)?.name}".`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredImages.map((image) => (
                <Card
                  key={image.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                >
                  <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                    <img
                      src={buildImageUrl(image)}
                      alt={image.alt_text || image.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(cat => cat.id === image.category.replace('gallery_', ''))?.name || "General"}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-primary group-hover:text-primary/80 transition-colors">
                      {image.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {image.description || "Imagen de nuestra galería"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Experience Showcase */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="enigma-section-title-center">
              {restaurant?.galeria_experiencia_title || "Una Experiencia Visual Única"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <Card className="p-6 sm:p-8 bg-white/50 backdrop-blur-sm border-none shadow-lg">
                <CardContent className="p-6 sm:p-8 pt-0">
                  <h3 className="enigma-card-title">
                    {restaurant?.galeria_ambiente_title || "Ambiente Histórico"}
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {restaurant?.galeria_ambiente_content ||
                        "Nuestro restaurante se encuentra en el corazón del auténtico casco antiguo de Calpe, donde cada piedra cuenta una historia y cada rincón respira tradición mediterránea. Los callejones históricos rodeados de plantas crean el escenario perfecto para una experiencia gastronómica que conecta el pasado con el presente."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-lg">
                <CardContent className="p-6 sm:p-8 pt-0">
                  <h3 className="enigma-card-title">
                    {restaurant?.galeria_cocina_title || "Cocina Con Alma"}
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {restaurant?.galeria_cocina_content ||
                        "Cada plato es una obra de arte culinaria que fusiona tradiciones atlánticas y mediterráneas con técnicas modernas y presentación innovadora. Nuestros ingredientes seleccionados y la pasión de nuestro equipo se reflejan en cada creación que sale de nuestra cocina."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Tour CTA */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-none shadow-xl">
            <CardContent className="p-6 sm:p-8 pt-0 text-center">
              <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4" />
              <h2 className="enigma-section-title">
                Visita Nuestro Restaurante
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Las imágenes solo pueden capturar una parte de la magia. Te invitamos a experimentar 
                personalmente nuestro ambiente auténtico y acogedor en el casco antiguo de Calpe.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg mx-auto">
                <Link href="/reservas">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4">
                    <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Reservar Mesa
                  </Button>
                </Link>
                <Link href="/contacto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4">
                    <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Cómo Llegar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Location Info */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="enigma-section-title-large">
              Encuéntranos en Calpe
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base">
              <div className="flex items-center justify-center gap-2 p-3 bg-white/50 rounded-lg">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{restaurant?.address || "Carrer Justicia 6A, 03710 Calpe, Alicante"}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-white/50 rounded-lg">
                <span className="h-4 w-4 text-primary flex-shrink-0">📞</span>
                <a
                  href={`tel:${restaurant?.phone?.replace(/\s/g, '') || "+34672796006"}`}
                  className="hover:text-primary transition-colors"
                >
                  {restaurant?.phone || "+34 672 79 60 06"}
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-white/50 rounded-lg">
                <span className="h-4 w-4 text-primary flex-shrink-0">✉️</span>
                <a
                  href={`mailto:${restaurant?.email || "reservas@enigmaconalma.com"}`}
                  className="hover:text-primary transition-colors"
                >
                  {restaurant?.email || "reservas@enigmaconalma.com"}
                </a>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground mt-6 italic">
              &quot;{restaurant?.ambiente || "Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor"}&quot;
            </p>
          </div>
        </div>
      </section>
    </>
  );
}