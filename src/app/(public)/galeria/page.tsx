'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Users, ChefHat, Utensils, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMediaLibrary, MediaItem } from "@/hooks/use-media-library";
import { useRestaurant } from "@/hooks/use-restaurant";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";

export default function GaleriaPage() {
  const { restaurant, loading: restaurantLoading } = useRestaurant()
  const { mediaData, loading: mediaLoading, getHeroImage, buildImageUrl, getGalleryCategories, getImagesByCategory } = useMediaLibrary({ type: 'gallery' })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  // Lightbox handlers
  const handleImageClick = (item: MediaItem) => {
    const index = filteredImages.findIndex(img => img.id === item.id)
    setCurrentImageIndex(index >= 0 ? index : 0)
    setLightboxOpen(true)
  }

  const handleShare = async (item: MediaItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: item.description || 'Imagen de Enigma Cocina Con Alma',
          url: item.url
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(item.url)
        // Could show toast notification here
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

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
            className="w-full h-full bg-cover bg-no-repeat"
            style={{
              backgroundImage: heroImage
                ? `url(${buildImageUrl(heroImage)})`
                : 'url(https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&h=1080&fit=crop)',
              backgroundPosition: 'center center'
            }}
          />
        </div>

        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-12" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          <h1 className="enigma-hero-title">
            {restaurant?.galeria_experiencia_title}
          </h1>

          <p className="enigma-hero-subtitle">
            {restaurant?.ambiente}
          </p>

          {restaurant?.address && (
            <div className="flex justify-center items-center text-sm sm:text-base text-white/90 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white" />
                <span>{restaurant.address}</span>
              </div>
            </div>
          )}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5"
                  onClick={() => handleImageClick(image)}
                  style={{
                    animationDelay: `${Math.min(index * 50, 500)}ms`
                  }}
                >
                  <img
                    src={buildImageUrl(image)}
                    alt={image.alt_text || image.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Info Overlay Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-white text-sm font-medium truncate mb-1">
                      {image.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(cat => cat.id === image.category.replace('gallery_', ''))?.name || "General"}
                    </Badge>
                  </div>
                </div>
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
              <Card className="p-6 sm:p-8 bg-card/80 backdrop-blur-sm border border-border/40 shadow-lg">
                <CardContent className="p-6 sm:p-8 pt-0">
                  <h3 className="enigma-card-title">
                    {restaurant?.galeria_ambiente_title || "Ambiente Histórico"}
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {restaurant?.galeria_ambiente_content}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 sm:p-8 bg-card/80 backdrop-blur-sm border border-border/40 shadow-lg">
                <CardContent className="p-6 sm:p-8 pt-0">
                  <h3 className="enigma-card-title">
                    {restaurant?.galeria_cocina_title || "Cocina Con Alma"}
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {restaurant?.galeria_cocina_content}
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
              {restaurant?.ambiente && (
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                  Las imágenes solo pueden capturar una parte de la magia. Te invitamos a experimentar
                  personalmente {restaurant.ambiente}.
                </p>
              )}
              
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
              {restaurant?.galeria_encuentranos_title || restaurant?.contacto_hero_title}
            </h2>

            {restaurant && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 p-4 bg-card/80 backdrop-blur-sm border border-border/40 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground break-words">
                      {restaurant.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card/80 backdrop-blur-sm border border-border/40 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <span className="text-2xl flex-shrink-0">📞</span>
                    <a
                      href={`tel:${restaurant.phone.replace(/\s/g, '')}`}
                      className="text-sm sm:text-base text-foreground hover:text-primary transition-colors break-words"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card/80 backdrop-blur-sm border border-border/40 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <span className="text-2xl flex-shrink-0">✉️</span>
                    <a
                      href={`mailto:${restaurant.email}`}
                      className="text-sm sm:text-base text-foreground hover:text-primary transition-colors break-words"
                    >
                      {restaurant.email}
                    </a>
                  </div>
                </div>

                {restaurant.ambiente && (
                  <p className="text-sm sm:text-base text-muted-foreground mt-6 italic">
                    &quot;{restaurant.ambiente}&quot;
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Lightbox */}
      <GalleryLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={filteredImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
        onShare={handleShare}
      />
    </>
  );
}