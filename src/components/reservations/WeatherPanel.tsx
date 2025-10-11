'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  MapPin,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWeatherForecast, type WeatherData } from '@/hooks/useWeatherForecast'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import type { Language } from '@/lib/validations/reservation-professional'
import { toast } from 'sonner'

interface WeatherPanelProps {
  language: Language
  onDateSelect?: (date: Date) => void
  selectedDate?: Date | null
  className?: string
}

const content = {
  es: {
    title: 'Pronóstico del Tiempo',
    subtitle: 'Planifica tu reserva con el mejor clima',
    current: 'Ahora',
    feelsLike: 'Sensación',
    humidity: 'Humedad',
    wind: 'Viento',
    forecast: 'Próximos días',
    today: 'Hoy',
    tomorrow: 'Mañana',
    refresh: 'Actualizar',
    loading: 'Cargando pronóstico...',
    error: 'No se pudo cargar el pronóstico',
    retry: 'Reintentar',
    selectDay: 'Seleccionar este día',
    perfect: 'Perfecto para terraza',
    good: 'Buen día',
    caution: 'Revisar pronóstico'
  },
  en: {
    title: 'Weather Forecast',
    subtitle: 'Plan your reservation with the best weather',
    current: 'Now',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    wind: 'Wind',
    forecast: 'Next days',
    today: 'Today',
    tomorrow: 'Tomorrow',
    refresh: 'Refresh',
    loading: 'Loading forecast...',
    error: 'Could not load forecast',
    retry: 'Retry',
    selectDay: 'Select this day',
    perfect: 'Perfect for terrace',
    good: 'Good day',
    caution: 'Check forecast'
  },
  de: {
    title: 'Wettervorhersage',
    subtitle: 'Planen Sie Ihre Reservierung mit bestem Wetter',
    current: 'Jetzt',
    feelsLike: 'Gefühlt',
    humidity: 'Feuchtigkeit',
    wind: 'Wind',
    forecast: 'Nächste Tage',
    today: 'Heute',
    tomorrow: 'Morgen',
    refresh: 'Aktualisieren',
    loading: 'Vorhersage wird geladen...',
    error: 'Vorhersage konnte nicht geladen werden',
    retry: 'Wiederholen',
    selectDay: 'Diesen Tag wählen',
    perfect: 'Perfekt für Terrasse',
    good: 'Guter Tag',
    caution: 'Vorhersage prüfen'
  }
}

// Mapeo de descripciones a iconos
function getWeatherIcon(description: string) {
  const desc = description.toLowerCase()
  if (desc.includes('sol') || desc.includes('sun') || desc.includes('clear')) {
    return <Sun className="h-5 w-5" />
  }
  if (desc.includes('lluv') || desc.includes('rain')) {
    return <CloudRain className="h-5 w-5" />
  }
  if (desc.includes('nub') || desc.includes('cloud')) {
    return <Cloud className="h-5 w-5" />
  }
  return <Sun className="h-5 w-5" />
}

// Función para obtener el color del badge según el clima
function getWeatherBadgeVariant(forecast: any): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (forecast.precipProbability < 20 && forecast.tempMax < 30) return 'default'
  if (forecast.precipProbability < 40) return 'secondary'
  if (forecast.precipProbability > 60) return 'destructive'
  return 'outline'
}

// Función para formatear fecha
function formatDate(date: Date, language: Language): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }

  const locale = language === 'es' ? 'es-ES' :
                 language === 'de' ? 'de-DE' : 'en-US'

  return new Intl.DateTimeFormat(locale, options).format(date)
}

export default function WeatherPanel({
  language,
  onDateSelect,
  selectedDate,
  className
}: WeatherPanelProps) {
  const t = content[language]
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    weather,
    isLoading,
    error,
    refresh,
    getWeatherRecommendation,
    formatTemp,
    formatWind,
    isGoodWeather
  } = useWeatherForecast({
    city: 'Calpe',
    lang: language
  })

  const { isRestaurantOpen, loading: isLoadingHours } = useBusinessHours()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleDateSelect = (date: Date) => {
    // Check if restaurant is open on this day
    const dateString = date.toISOString().split('T')[0]
    const isOpen = isRestaurantOpen ? isRestaurantOpen(dateString) : null

    if (isOpen === false) {
      toast.error(language === 'es' ?
        'El restaurante está cerrado este día' :
        language === 'de' ?
        'Das Restaurant ist an diesem Tag geschlossen' :
        'Restaurant is closed on this day'
      )
      return
    }

    if (isOpen === null) {
      toast.info(language === 'es' ?
        'Verificando disponibilidad...' :
        language === 'de' ?
        'Verfügbarkeit wird geprüft...' :
        'Checking availability...'
      )
      return
    }

    // Restaurant is open, proceed with date selection
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  if (isLoading && !weather) {
    return (
      <Card className={cn(
        "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
        className
      )}>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className={cn(
        "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20",
        className
      )}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">{t.error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
          >
            {t.retry}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden",
      className
    )}>
      {/* Header con gradiente */}
      <CardHeader className="bg-gradient-to-br from-primary to-primary/80 text-white p-4 md:p-6 pb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{weather.location.name}</span>
            </CardTitle>
            <p className="text-sm opacity-90 mt-1">{t.subtitle}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isRefreshing && "animate-spin"
            )} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Tiempo actual */}
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t.current}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold">
                  {formatTemp(weather.current.temp)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t.feelsLike} {formatTemp(weather.current.feelsLike)}
                </span>
              </div>
            </div>
            <div className="text-3xl">
              {getWeatherIcon(weather.current.description)}
            </div>
          </div>

          <p className="text-sm font-medium mb-3">{weather.current.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span>{formatWind(weather.current.windSpeed)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span>{weather.current.humidity}%</span>
            </div>
          </div>
        </div>

        {/* Pronóstico */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t.forecast}
          </h4>

          <div className="space-y-2">
            {weather.forecast.slice(0, 4).map((day, index) => {
              // Convertir day.date a Date si es string
              const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date

              const isSelected = selectedDate &&
                dayDate.toDateString() === selectedDate.toDateString()
              const isToday = index === 0
              const isTomorrow = index === 1
              const recommendation = getWeatherRecommendation(dayDate)
              const goodWeather = isGoodWeather(dayDate)

              // Check if restaurant is open on this day
              const dateString = dayDate.toISOString().split('T')[0]
              const isOpen = isRestaurantOpen ? isRestaurantOpen(dateString) : null
              const isClosed = isOpen === false

              return (
                <div
                  key={typeof day.date === 'string' ? day.date : day.date.toISOString()}
                  className={cn(
                    "group bg-card rounded-lg p-3 border transition-all",
                    !isClosed && "cursor-pointer hover:border-primary hover:shadow-md",
                    isClosed && "opacity-50 cursor-not-allowed",
                    isSelected && "border-primary bg-primary/5 shadow-md"
                  )}
                  onClick={() => handleDateSelect(dayDate)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getWeatherIcon(day.description)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {isToday ? t.today :
                           isTomorrow ? t.tomorrow :
                           formatDate(dayDate, language)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {day.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatTemp(day.tempMax)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTemp(day.tempMin)}
                      </p>
                    </div>
                  </div>

                  {/* Recomendación */}
                  {recommendation && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {recommendation}
                      </p>
                    </div>
                  )}

                  {/* Indicador de calidad del día */}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={getWeatherBadgeVariant(day)}>
                      {goodWeather ? t.perfect :
                       day.precipProbability < 40 ? t.good :
                       t.caution}
                    </Badge>

                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      "group-hover:translate-x-1 group-hover:text-primary"
                    )} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}