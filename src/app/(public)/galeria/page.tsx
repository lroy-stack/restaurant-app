import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Users, ChefHat, Utensils, Award } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Galería - Enigma Cocina Con Alma",
  description: "Descubre el ambiente auténtico y acogedor de Enigma Cocina Con Alma en el casco antiguo de Calpe. Platos únicos, ambiente histórico y experiencias gastronómicas memorables.",
  keywords: ["galería restaurante Calpe", "fotos Enigma Cocina Con Alma", "ambiente restaurante", "casco antiguo Calpe", "cocina mediterránea"],
  openGraph: {
    title: "Galería - Enigma Cocina Con Alma",
    description: "Ambiente auténtico y acogedor en el casco antiguo de Calpe",
    url: "https://enigmaconalma.com/galeria",
  },
};

// Placeholder images for the gallery - in production these would be real restaurant photos
const galleryImages = [
  {
    id: 1,
    src: "/images/gallery/restaurante-noche.jpg",
    alt: "Enigma Cocina Con Alma por la noche",
    title: "Ambiente Nocturno",
    description: "Nuestro restaurante iluminado en las calles históricas de Calpe",
    category: "ambiente"
  },
  {
    id: 2,
    src: "/images/gallery/casco-antiguo.jpg",
    alt: "Casco antiguo de Calpe",
    title: "Ubicación Histórica",
    description: "Carrer Justicia en el auténtico casco antiguo",
    category: "ubicacion"
  },
  {
    id: 3,
    src: "/images/gallery/plato-especial-1.jpg",
    alt: "Plato especial atlántico-mediterráneo",
    title: "Cocina de Autor",
    description: "Fusión de tradición atlántica y mediterránea",
    category: "platos"
  },
  {
    id: 4,
    src: "/images/gallery/interior-plantas.jpg",
    alt: "Interior del restaurante con plantas",
    title: "Ambiente Natural",
    description: "Rodeados de plantas en un ambiente acogedor",
    category: "ambiente"
  },
  {
    id: 5,
    src: "/images/gallery/chef-cocinando.jpg",
    alt: "Chef preparando platos",
    title: "Pasión Culinaria",
    description: "Cada plato elaborado con dedicación absoluta",
    category: "cocina"
  },
  {
    id: 6,
    src: "/images/gallery/terraza-calles.jpg",
    alt: "Vista de las calles históricas",
    title: "Callejones Históricos",
    description: "Entre piedras centenarias y tradición",
    category: "ubicacion"
  }
];

const categories = [
  { id: "all", name: "Todas", icon: Camera },
  { id: "ambiente", name: "Ambiente", icon: Users },
  { id: "platos", name: "Nuestros Platos", icon: ChefHat },
  { id: "ubicacion", name: "Ubicación", icon: MapPin },
  { id: "cocina", name: "En la Cocina", icon: Utensils }
];

export default function GaleriaPage() {
  return (
    <>
      {/* Hero Section with Real Restaurant Photo */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/45 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat" 
            style={{
              backgroundImage: 'url(https://ik.imagekit.io/insomnialz/IMG_0686.heic?updatedAt=1757368334667&tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)'
            }}
          />
        </div>
        
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          <Badge variant="outline" className="mb-6 text-white border-white/50 bg-black/60 backdrop-blur-sm">
            <Camera className="h-3 w-3 mr-1 text-white" />
            📸 Galería Visual
          </Badge>
          
          <h1 className="enigma-hero-title">
            Descubre Nuestro Mundo
          </h1>
          
          <p className="enigma-hero-subtitle">
            Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm sm:text-base text-white/90 mb-8">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">Restaurante Recomendado</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white" />
              <span>Carrer Justicia 6A, Calpe</span>
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
                  variant={category.id === "all" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {galleryImages.map((image) => (
              <Card 
                key={image.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              >
                <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  {/* Placeholder for image */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    <Camera className="h-12 w-12 text-primary/40 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(cat => cat.id === image.category)?.name || "General"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-primary group-hover:text-primary/80 transition-colors">
                    {image.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {image.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Showcase */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="enigma-section-title-center">
              Una Experiencia Visual Única
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <Card className="p-6 sm:p-8 bg-white/50 backdrop-blur-sm border-none shadow-lg">
                <CardContent className="p-6 sm:p-8 pt-0">
                  <h3 className="enigma-card-title">
                    Ambiente Histórico
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                      Nuestro restaurante se encuentra en el corazón del auténtico casco antiguo de Calpe, 
                      donde cada piedra cuenta una historia y cada rincón respira tradición mediterránea.
                    </p>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      Los callejones históricos rodeados de plantas crean el escenario perfecto para 
                      una experiencia gastronómica que conecta el pasado con el presente.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-lg">
                <CardContent className="p-6 sm:p-8 pt-0">
                  <h3 className="enigma-card-title">
                    Cocina Con Alma
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                      Cada plato es una obra de arte culinaria que fusiona tradiciones atlánticas 
                      y mediterráneas con técnicas modernas y presentación innovadora.
                    </p>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      Nuestros ingredientes seleccionados y la pasión de nuestro equipo se reflejan 
                      en cada creación que sale de nuestra cocina.
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
                <span>Carrer Justicia 6A, 03710 Calpe, Alicante</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-white/50 rounded-lg">
                <span className="h-4 w-4 text-primary flex-shrink-0">📞</span>
                <a href="tel:+34672796006" className="hover:text-primary transition-colors">+34 672 79 60 06</a>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-white/50 rounded-lg">
                <span className="h-4 w-4 text-primary flex-shrink-0">✉️</span>
                <a href="mailto:reservas@enigmaconalma.com" className="hover:text-primary transition-colors">reservas@enigmaconalma.com</a>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground mt-6 italic">
              &quot;Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor&quot;
            </p>
          </div>
        </div>
      </section>
    </>
  );
}