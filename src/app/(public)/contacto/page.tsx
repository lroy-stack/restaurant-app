'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Users,
  Car,
  Bus,
  User,
  Award
} from "lucide-react";
import Link from "next/link";
import { EnigmaLogo } from "@/components/ui/enigma-logo";
import dynamic from 'next/dynamic'
import { useRestaurant } from '@/hooks/use-restaurant'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { useMediaLibrary } from "@/hooks/use-media-library"
import { sortDaysSpanishWeek, DAY_NAMES_ES, DAY_NAMES_SHORT_ES } from '@/lib/business-hours-utils'

// Dynamic import for browser-only map component
const RestaurantMap = dynamic(() => import('@/components/maps/RestaurantMap').then(mod => ({ default: mod.RestaurantMap })), {
  loading: () => (
    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
  ssr: false,
})

export default function ContactoPage() {
  const { getHeroImage, buildImageUrl, loading: mediaLoading } = useMediaLibrary({ type: 'hero' })
  const heroImage = getHeroImage('contacto')
  const { restaurant, loading, error } = useRestaurant()
  const { businessHours, loading: hoursLoading, getDualScheduleDisplay } = useBusinessHours()

  // ENHANCED: Dual shift business hours formatting with current status
  const getBusinessHoursData = () => {
    if (!businessHours || businessHours.length === 0) {
      return {
        schedule: restaurant?.hours_operation || "Consultar horarios",
        isCurrentlyOpen: false,
        scheduleDetails: [],
        dualShiftInfo: 'Almuerzo y cena disponibles',
        gapInfo: 'Cerrado 16:00-18:30 (preparación)'
      }
    }

    // Filter valid days only (0-6) and sort Spanish week (Monday first)
    const validHours = businessHours.filter(h => h.day_of_week >= 0 && h.day_of_week <= 6)
    const openDays = sortDaysSpanishWeek(validHours.filter(h => h.is_open || h.lunch_enabled))
    const closedDays = validHours.filter(h => !h.is_open && !h.lunch_enabled).map(h => DAY_NAMES_ES[h.day_of_week as keyof typeof DAY_NAMES_ES]).filter(Boolean)

    // Check current status (dual shift aware)
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const todayHours = validHours.find(h => h.day_of_week === currentDay)
    let isCurrentlyOpen = false
    if (todayHours) {
      // Check if in lunch service
      const inLunchService = todayHours.lunch_enabled &&
        currentTime >= (todayHours.lunch_open_time || '00:00') &&
        currentTime <= (todayHours.lunch_close_time || '23:59')

      // Check if in dinner service
      const inDinnerService = todayHours.is_open &&
        currentTime >= (todayHours.open_time || '00:00') &&
        currentTime <= (todayHours.close_time || '23:59')

      isCurrentlyOpen = inLunchService || inDinnerService
    }

    // Create detailed schedule with dual shift support (Spanish week order)
    const scheduleDetails = sortDaysSpanishWeek(validHours).map(h => {
      const dayName = DAY_NAMES_ES[h.day_of_week as keyof typeof DAY_NAMES_ES]
      let hours = ''

      if (!h.is_open && !h.lunch_enabled) {
        hours = 'Cerrado'
      } else {
        // Use getDualScheduleDisplay for consistent formatting
        hours = getDualScheduleDisplay(h.day_of_week)
      }

      return {
        day: dayName,
        isOpen: h.is_open || h.lunch_enabled,
        hours,
        isToday: h.day_of_week === currentDay,
        hasLunchService: h.lunch_enabled || false,
        hasDinnerService: h.is_open
      }
    })

    // Group days with same dual schedule for main display
    const scheduleGroups = groupBySchedule(openDays)
    const schedule = scheduleGroups.map(group =>
      `${group.days}: ${group.schedule}`
    ).join(' • ')

    return {
      schedule: schedule || 'Consultar horarios',
      isCurrentlyOpen,
      scheduleDetails,
      dualShiftInfo: 'Almuerzo y cena disponibles',
      gapInfo: 'Cerrado 16:00-18:30 (preparación)'
    }
  }

  // NEW: Group days with same lunch+dinner schedule
  const groupBySchedule = (businessHours: any[]) => {
    return businessHours.reduce((groups: any[], hours) => {
      const schedule = getDualScheduleDisplay(hours.day_of_week)
      const existing = groups.find(g => g.schedule === schedule)
      const dayName = DAY_NAMES_SHORT_ES[hours.day_of_week as keyof typeof DAY_NAMES_SHORT_ES]

      if (existing) {
        existing.days.push(dayName)
      } else {
        groups.push({
          schedule,
          days: [dayName]
        })
      }
      return groups
    }, [])
  }

  const businessHoursData = getBusinessHoursData()

  if (loading || mediaLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {/* Hero Section with Real Restaurant Photo */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: heroImage
                ? `url(${buildImageUrl(heroImage)})`
                : 'url(https://ik.imagekit.io/insomnialz/_DSC1121.jpg?updatedAt=1754863669504&tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)'
            }}
          />
        </div>
        
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          <h1 className="enigma-hero-title">
            Encuéntranos en Calpe
          </h1>
          
          <p className="enigma-hero-subtitle">
            En el auténtico casco antiguo, donde cada callejón cuenta una historia
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm sm:text-base text-white/90">
            <div className="flex items-center gap-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="enigma-brand-body font-medium">Restaurante Recomendado</span>
            </div>
            <div className="flex items-center gap-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
              <MapPin className="h-4 w-4 text-white" />
              <span>Casco Antiguo de Calpe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="enigma-section-title-large">
                  Información de Contacto
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="mt-1">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="enigma-brand-body font-semibold mb-1">Dirección</h3>
                          <p className="text-muted-foreground">
                            {restaurant?.address}<br />
                            España
                          </p>
                          <p className="text-sm text-primary mt-2 italic">
                            {restaurant?.ambiente}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="mt-1">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="enigma-brand-body font-semibold mb-1">Teléfono</h3>
                          <a
                            href={`tel:${restaurant?.phone?.replace(/\s/g, '')}`}
                            className="enigma-brand-body text-muted-foreground hover:text-primary transition-colors text-lg font-medium"
                          >
                            {restaurant?.phone}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            Para reservas y consultas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="mt-1">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="enigma-brand-body font-semibold mb-1">Email</h3>
                          <a
                            href={`mailto:${restaurant?.email}`}
                            className="enigma-brand-body text-muted-foreground hover:text-primary transition-colors font-medium"
                          >
                            {restaurant?.email}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            Respuesta en 24 horas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="mt-1 flex-shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h3 className="enigma-brand-body font-semibold text-base sm:text-lg">Horarios</h3>
                            {!hoursLoading && (
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                businessHoursData.isCurrentlyOpen
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  businessHoursData.isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                {businessHoursData.isCurrentlyOpen ? 'Abierto' : 'Cerrado'}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm sm:text-base font-medium text-foreground">
                              {hoursLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-pulse h-4 bg-muted rounded w-32"></div>
                                </div>
                              ) : (
                                businessHoursData.schedule
                              )}
                            </div>

                            {!hoursLoading && businessHoursData.scheduleDetails.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs sm:text-sm text-muted-foreground">
                                {businessHoursData.scheduleDetails.map((detail, index) => (
                                  <div key={index} className={`flex justify-between py-1 px-2 rounded ${
                                    detail.isToday ? 'bg-primary/10 text-primary font-medium' : ''
                                  }`}>
                                    <span className="min-w-0 truncate">{detail.day}</span>
                                    <span className="ml-2 flex-shrink-0 font-mono text-xs">
                                      {detail.hours}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* ✅ NEW: Dual shift info and gap period */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600 font-medium">
                              <span>🍽️</span>
                              <span>{businessHoursData.dualShiftInfo}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-600">
                              <span>⏰</span>
                              <span>{businessHoursData.gapInfo}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-primary font-medium">
                              💡 Recomendamos reservar con antelación
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Actions */}
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-lg">
                <CardContent className="p-4 sm:p-6 pt-0">
                  <h3 className="enigma-card-title">
                    Acciones Rápidas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href="/reservas">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Users className="mr-2 h-4 w-4" />
                        Reservar Mesa
                      </Button>
                    </Link>
                    <Link href="/menu">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                        <EnigmaLogo className="mr-2 h-4 w-4" variant="primary" />
                        Ver Menú
                      </Button>
                    </Link>
                    <a href="tel:+34672796006">
                      <Button variant="outline" className="w-full">
                        <Phone className="mr-2 h-4 w-4" />
                        Llamar Ahora
                      </Button>
                    </a>
                    <a href="mailto:reservas@enigmaconalma.com">
                      <Button variant="outline" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Email
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="p-4 sm:p-6 shadow-lg">
                <CardHeader className="p-4 sm:p-6 pb-4">
                  <CardTitle className="enigma-card-title">
                    Envíanos un Mensaje
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <form className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input 
                          id="nombre" 
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input 
                          id="telefono" 
                          type="tel"
                          placeholder="+34 XXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="asunto">Asunto *</Label>
                      <Input 
                        id="asunto" 
                        placeholder="¿En qué podemos ayudarte?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Mensaje *</Label>
                      <Textarea 
                        id="mensaje"
                        placeholder="Cuéntanos más detalles..."
                        className="min-h-[120px] resize-none"
                        required
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      * Campos obligatorios
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Here Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="enigma-section-title-center">
            Cómo Llegar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Car className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="enigma-subsection-title">En Coche</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Parking público disponible cerca del casco antiguo. 
                  El restaurante está en zona peatonal.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                </div>
                <h3 className="enigma-subsection-title">A Pie</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Fácil acceso desde el centro de Calpe. 
                  Paseo de 5-10 minutos desde la playa principal.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <Bus className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h3 className="enigma-subsection-title">Transporte Público</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Paradas de autobús cercanas con conexiones 
                  desde Benidorm y Altea.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-lg">
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-center">
                <RestaurantMap />
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant?.address || 'Carrer Justicia 6A, 03710 Calpe, Alicante')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      <Navigation className="mr-2 h-4 w-4" />
                      Abrir en Google Maps
                    </Button>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant?.address || 'Carrer Justicia 6A, 03710 Calpe, Alicante')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                      <MapPin className="mr-2 h-4 w-4" />
                      Ver Direcciones
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="enigma-section-title-large">
              {restaurant?.contacto_final_title || 'Te Esperamos en Enigma'}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              {restaurant?.contacto_final_content}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/reservas">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4">
                  <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Reservar Mesa
                </Button>
              </Link>
              <a href="tel:+34672796006">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4">
                  <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Llamar Ahora
                </Button>
              </a>
            </div>

            {/* Quote */}
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-muted/30 rounded-lg border-l-4 border-primary">
              <p className="enigma-body-text italic text-primary font-medium">
                &quot;Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}