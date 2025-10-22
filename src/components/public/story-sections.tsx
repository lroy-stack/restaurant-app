'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Waves, Mountain, MapPin, Award, Heart } from "lucide-react"
import { EnigmaLogo } from "@/components/ui/enigma-logo"

const culinaryStory = {
  title: "Fusión Atlántico-Mediterránea",
  description: "Nuestra cocina nace del encuentro entre dos mares, donde los sabores frescos del Atlántico se fusionan con la tradición mediterránea en cada plato.",
  features: [
    {
      icon: Waves,
      title: "Sabores del Atlántico",
      description: "Pescados y mariscos frescos que llegan directamente desde las costas atlánticas, preparados con técnicas tradicionales."
    },
    {
      icon: Mountain,
      title: "Esencia Mediterránea", 
      description: "Aceites de oliva premium, hierbas aromáticas y productos locales que capturan la esencia de la costa mediterránea."
    }
  ]
}

const chefStory = {
  title: "Pasión Culinaria con Historia",
  chef: "Chef Fundador",
  description: "Más de 15 años de experiencia culinaria fusionando tradiciones familiares con técnicas modernas. Cada receta lleva consigo historias de generaciones y el amor por la cocina auténtica.",
  philosophy: "Creemos que cocinar es un acto de amor. Cada ingrediente es seleccionado con cuidado, cada técnica aplicada con respeto a la tradición, y cada plato servido con el alma."
}

const locationStory = {
  title: restaurant?.historia_location_title || "En el Corazón Histórico",
  description: restaurant?.historia_location_content || "Ubicado en el auténtico casco antiguo, nuestro restaurante forma parte de la rica historia. Entre callejones empedrados y arquitectura tradicional, ofrecemos una experiencia gastronómica única.",
  highlights: [
    {
      icon: MapPin,
      title: "Casco Antiguo Auténtico",
      description: "Entre calles históricas que cuentan siglos de historia mediterránea."
    },
    {
      icon: Heart,
      title: "Ambiente Acogedor",
      description: "Terrazas rodeadas de plantas y rincones íntimos para momentos especiales."
    },
    {
      icon: Award,
      title: "Reconocimiento Local",
      description: "Recomendado por residentes y visitantes de la Costa Blanca."
    }
  ]
}

export function StorytellingFlow() {
  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Culinary Vision Section */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary">
              Nuestra Filosofía Culinaria
            </Badge>
            <h2 className="enigma-section-title-center">
              {culinaryStory.title}
            </h2>
            <p className="enigma-body-text-center leading-relaxed">
              {culinaryStory.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {culinaryStory.features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="enigma-subsection-title">{feature.title}</h3>
                        <p className="enigma-body-text leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Chef Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge variant="outline" className="mb-4 text-secondary">
                {chefStory.chef}
              </Badge>
              <h2 className="enigma-section-title-large">
                {chefStory.title}
              </h2>
              <p className="enigma-body-text mb-6 leading-relaxed">
                {chefStory.description}
              </p>
              <Card className="p-6 bg-muted/30 border-l-4 border-l-primary">
                <CardContent className="p-0">
                  <p className="italic enigma-body-text leading-relaxed">
                    "{chefStory.philosophy}"
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="p-6 order-1 lg:order-2">
              <CardContent className="p-0 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <EnigmaLogo className="h-10 w-10" variant="primary" />
                </div>
                <h3 className="enigma-card-title">Experiencia Culinaria</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Experiencia</span>
                    <span className="font-medium">15+ años</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Especialidad</span>
                    <span className="font-medium">Fusión Atlántico-Mediterránea</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filosofía</span>
                    <span className="font-medium">Cocina con Alma</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location Experience Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-accent">
              Ubicación Única
            </Badge>
            <h2 className="enigma-section-title-center">
              {locationStory.title}
            </h2>
            <p className="enigma-body-text-center leading-relaxed">
              {locationStory.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locationStory.highlights.map((highlight, index) => {
              const Icon = highlight.icon
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="enigma-card-title mb-3">{highlight.title}</h3>
                    <p className="enigma-body-text leading-relaxed">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Address and Contact Info - Real Data */}
          <div className="mt-12 text-center">
            <Card className="inline-block p-6 bg-primary/5">
              <CardContent className="p-0">
                <h4 className="font-semibold mb-2 text-primary">Visítanos</h4>
                <p className="text-muted-foreground">
                  {restaurant?.address || 'Dirección del restaurante'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  En el corazón del casco antiguo
                </p>
                <p className="text-sm text-primary mt-2">
                  {restaurant?.phone && `📞 ${restaurant.phone}`} {restaurant?.email && `| ✉️ ${restaurant.email}`}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}