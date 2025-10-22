'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Shield, Timer, Utensils } from 'lucide-react'
import type { Language } from '@/lib/validations/reservation-professional'
import { usePageTranslations } from '@/hooks/use-page-translations'

interface ReservationHeroProps {
  language: Language
  onLanguageChange: (lang: Language) => void
  isConnected?: boolean
}

export function ReservationHero({ language, onLanguageChange, isConnected = true }: ReservationHeroProps) {
  const { t, loading } = usePageTranslations({
    page: 'reservations',
    language: language as 'es' | 'en' | 'de',
    section: 'hero'
  })

  return (
    <section className="relative py-12 md:py-20 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div
          className="w-full h-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1920&h=1080&fit=crop)',
            backgroundPosition: 'center 60%'
          }}
        />
      </div>

      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center pt-4 sm:pt-6">
          <h1 className="enigma-hero-title">
            {loading ? 'Cargando...' : t('hero', 'title', 'Reservar Mesa')}
          </h1>

          <p className="enigma-hero-subtitle">
            {loading ? '' : t('hero', 'subtitle', 'Reserva tu experiencia culinaria')}
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

          {/* Trust Signals - DYNAMIC */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{loading ? 'Confirmación' : t('hero', 'trustSignals_confirmation', 'Confirmación inmediata')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">{loading ? 'GDPR' : t('hero', 'trustSignals_gdpr', 'Cumplimiento GDPR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span className="text-sm">{loading ? 'Cancelación' : t('hero', 'trustSignals_cancellation', 'Cancelación gratuita')}</span>
            </div>
          </div>

          {/* Connection Status - DYNAMIC */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {loading
                  ? (isConnected ? 'En vivo' : 'Sin conexión')
                  : (isConnected
                      ? t('hero', 'connection_live', 'En vivo')
                      : t('hero', 'connection_offline', 'Sin conexión')
                    )
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
