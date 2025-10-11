'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Shield, Timer, Utensils } from 'lucide-react'
import type { Language } from '@/lib/validations/reservation-professional'

interface ReservationHeroProps {
  language: Language
  onLanguageChange: (lang: Language) => void
  isConnected?: boolean
}

const content = {
  es: {
    hero: {
      title: 'Reservar Mesa',
      subtitle: 'Reserva tu experiencia culinaria en el corazón del casco antiguo de Calpe. Cocina mediterránea con productos locales y vistas a las callejuelas históricas.',
      badge: 'Reserva Online'
    },
    trustSignals: {
      confirmation: 'Confirmación inmediata',
      gdpr: 'Cumplimiento GDPR',
      cancellation: 'Cancelación gratuita'
    },
    connection: {
      live: 'En vivo',
      offline: 'Sin conexión'
    }
  },
  en: {
    hero: {
      title: 'Book a Table',
      subtitle: 'Reserve your culinary experience in the heart of Calpe\'s old town. Mediterranean cuisine with local products and views of historic streets.',
      badge: 'Online Booking'
    },
    trustSignals: {
      confirmation: 'Instant confirmation',
      gdpr: 'GDPR compliant',
      cancellation: 'Free cancellation'
    },
    connection: {
      live: 'Live',
      offline: 'Offline'
    }
  },
  de: {
    hero: {
      title: 'Tisch reservieren',
      subtitle: 'Reservieren Sie Ihr kulinarisches Erlebnis im Herzen der Altstadt von Calpe. Mediterrane Küche mit lokalen Produkten und Blick auf historische Gassen.',
      badge: 'Online Reservierung'
    },
    trustSignals: {
      confirmation: 'Sofortige Bestätigung',
      gdpr: 'DSGVO-konform',
      cancellation: 'Kostenlose Stornierung'
    },
    connection: {
      live: 'Live',
      offline: 'Offline'
    }
  }
}

export function ReservationHero({ language, onLanguageChange, isConnected = true }: ReservationHeroProps) {
  const t = content[language]

  return (
    <section className="relative py-12 md:py-20 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://ik.imagekit.io/insomnialz/taboulee.jpg?updatedAt=1754141888431)'
          }}
        />
      </div>

      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Utensils className="h-4 w-4 mr-2" />
            {t.hero.badge}
          </Badge>

          <h1 className="enigma-hero-title">
            {t.hero.title}
          </h1>

          <p className="enigma-hero-subtitle">
            {t.hero.subtitle}
          </p>

          {/* Language Selector */}
          <div className="flex justify-center gap-2 mb-8">
            {(['es', 'en', 'de'] as Language[]).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "default" : "outline"}
                size="sm"
                onClick={() => onLanguageChange(lang)}
                className={language === lang ? 'bg-white text-black' : 'bg-white/20 text-white border-white/30'}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{t.trustSignals.confirmation}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">{t.trustSignals.gdpr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span className="text-sm">{t.trustSignals.cancellation}</span>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {isConnected ? t.connection.live : t.connection.offline}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
