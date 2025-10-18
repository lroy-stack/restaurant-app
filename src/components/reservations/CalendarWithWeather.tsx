'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWeatherForecast } from '@/hooks/useWeatherForecast'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import type { Language } from '@/lib/validations/reservation-professional'

interface CalendarWithWeatherProps {
  language: Language
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  className?: string
  compact?: boolean
}

const content = {
  es: {
    title: 'Selecciona una fecha',
    subtitle: 'El pronóstico te ayudará a elegir el mejor día',
    months: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    weekDays: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
    today: 'Hoy',
    tomorrow: 'Mañana',
    closed: 'Cerrado',
    perfectDay: 'Día perfecto',
    goodDay: 'Buen día',
    checkWeather: 'Revisar clima',
    unavailable: 'No disponible',
    selectDate: 'Seleccionar fecha',
    weatherInfo: 'Información del clima',
    terraceDay: 'Ideal para terraza',
    indoorRecommended: 'Se recomienda interior',
    limitedAvailability: 'Disponibilidad limitada',
    fullAvailability: 'Amplia disponibilidad'
  },
  en: {
    title: 'Select a date',
    subtitle: 'The forecast will help you choose the best day',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    weekDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    today: 'Today',
    tomorrow: 'Tomorrow',
    closed: 'Closed',
    perfectDay: 'Perfect day',
    goodDay: 'Good day',
    checkWeather: 'Check weather',
    unavailable: 'Unavailable',
    selectDate: 'Select date',
    weatherInfo: 'Weather info',
    terraceDay: 'Perfect for terrace',
    indoorRecommended: 'Indoor recommended',
    limitedAvailability: 'Limited availability',
    fullAvailability: 'Wide availability'
  },
  de: {
    title: 'Datum wählen',
    subtitle: 'Die Vorhersage hilft Ihnen, den besten Tag zu wählen',
    months: [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ],
    weekDays: ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'],
    today: 'Heute',
    tomorrow: 'Morgen',
    closed: 'Geschlossen',
    perfectDay: 'Perfekter Tag',
    goodDay: 'Guter Tag',
    checkWeather: 'Wetter prüfen',
    unavailable: 'Nicht verfügbar',
    selectDate: 'Datum wählen',
    weatherInfo: 'Wetterinfo',
    terraceDay: 'Ideal für Terrasse',
    indoorRecommended: 'Innenbereich empfohlen',
    limitedAvailability: 'Begrenzte Verfügbarkeit',
    fullAvailability: 'Große Verfügbarkeit'
  }
}

// Función para obtener el icono del clima
function getWeatherIcon(weather: any) {
  if (!weather) return null

  const icon = weather.icon || weather.description?.toLowerCase() || ''

  if (icon.includes('☀') || icon.includes('sun') || icon.includes('clear')) {
    return <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
  }
  if (icon.includes('🌧') || icon.includes('rain')) {
    return <CloudRain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  }
  if (icon.includes('☁') || icon.includes('cloud')) {
    return <Cloud className="h-4 w-4 text-muted-foreground" />
  }
  if (icon.includes('💨') || weather.windSpeed > 25) {
    return <Wind className="h-4 w-4 text-muted-foreground" />
  }

  return <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
}

// Función para obtener el color de la celda según el clima - COLORES ENIGMA
function getWeatherCellClass(weather: any, isGoodWeather: boolean) {
  if (!weather) return ''

  // ✅ Buen tiempo (☀️) → Naranja cálido Enigma (terraza perfecta)
  if (isGoodWeather) {
    return 'bg-gradient-to-br from-accent/20 to-accent/30 dark:from-accent/25 dark:to-accent/35 border-accent/40 dark:border-accent/50 hover:border-accent/60 dark:hover:border-accent/70'
  }

  // ✅ Lluvia (🌧️) → Atlantic Blue Enigma (interior recomendado)
  if (weather.precipProbability > 60) {
    return 'bg-gradient-to-br from-primary/15 to-primary/25 dark:from-primary/25 dark:to-primary/35 border-primary/40 dark:border-primary/50 hover:border-primary/60 dark:hover:border-primary/70'
  }

  // ✅ Viento fuerte (💨) → Sage Green neutro
  if (weather.windSpeed > 25) {
    return 'bg-gradient-to-br from-secondary/30 to-secondary/40 dark:from-secondary/30 dark:to-secondary/40 border-secondary/40 dark:border-secondary/50 hover:border-secondary/50 dark:hover:border-secondary/60'
  }

  // ✅ Nublado/Neutro (☁️) → Sage Green suave
  return 'bg-gradient-to-br from-secondary/25 to-secondary/35 dark:from-secondary/25 dark:to-secondary/35 border-secondary/35 dark:border-secondary/45 hover:border-secondary/45 dark:hover:border-secondary/55'
}

export default function CalendarWithWeather({
  language,
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
  disabledDates = [],
  className,
  compact = false
}: CalendarWithWeatherProps) {
  const t = content[language]
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate || new Date()
  })

  const {
    businessHours,
    isRestaurantOpen,
    isDateDisabled,
    getDisabledReason,
    loading: isLoadingHours
  } = useBusinessHours()

  const {
    weather,
    getWeatherForDate,
    isGoodWeather,
    formatTemp,
    getWeatherRecommendation
  } = useWeatherForecast({ lang: language })

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Día de la semana del primer día (0 = domingo)
    let startingDayOfWeek = firstDay.getDay()
    // Convertir a lunes = 0
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)

      // Format date in local timezone (NOT UTC) to avoid day shift bugs
      const dateYear = date.getFullYear()
      const dateMonth = String(date.getMonth() + 1).padStart(2, '0')
      const dateDay = String(date.getDate()).padStart(2, '0')
      const dateString = `${dateYear}-${dateMonth}-${dateDay}`
      const isOpen = isRestaurantOpen ? isRestaurantOpen(dateString) : null
      // null = loading, true = open, false = closed

      const isPast = date < today
      const isToday = date.getTime() === today.getTime()
      const isTomorrow = date.getTime() === today.getTime() + 86400000

      // Usar isDateDisabled del hook si está disponible
      const isDisabledByHours = isDateDisabled ? isDateDisabled(date) : false
      const isDisabled = isOpen === false || isDisabledByHours || disabledDates.some(d =>
        d.toDateString() === date.toDateString()
      )
      const isTooFar = maxDate && date > maxDate

      const weatherData = getWeatherForDate(date)
      const weatherQuality = isGoodWeather(date)
      const recommendation = weatherData ? getWeatherRecommendation(date) : null

      days.push({
        date,
        day,
        isOpen,
        isPast,
        isToday,
        isTomorrow,
        isDisabled,
        isTooFar,
        isSelectable: isOpen === true && !isPast && !isTooFar && !isDisabledByHours,
        weather: weatherData,
        weatherQuality,
        recommendation
      })
    }

    return days
  }, [currentMonth, isRestaurantOpen, isDateDisabled, disabledDates, maxDate, getWeatherForDate, isGoodWeather, getWeatherRecommendation, businessHours])

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() - 1)
      return newMonth
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + 1)
      return newMonth
    })
  }

  const handleDateSelect = (day: any) => {
    if (day.isSelectable) {
      onDateSelect(day.date)
    }
  }

  // Show loading skeleton while business hours are loading
  if (isLoadingHours) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn(
        "bg-gradient-to-r from-primary/5 to-primary/10",
        compact ? "p-3 md:p-4" : ""
      )}>
        <div className="flex items-center justify-between">
          <div className={cn(compact && "flex-1")}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              compact && "text-base md:text-lg"
            )}>
              <CalendarIcon className={cn(
                compact ? "h-4 w-4" : "h-5 w-5"
              )} />
              {compact ? (
                <span className="hidden md:inline">{t.title}</span>
              ) : (
                t.title
              )}
            </CardTitle>
            {!compact && (
              <p className="text-sm text-muted-foreground mt-1">
                {t.subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevMonth}
              className={cn(compact ? "h-7 w-7" : "h-8 w-8")}
            >
              <ChevronLeft className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
            <div className={cn(
              "text-center font-medium",
              compact ? "min-w-[100px] text-sm" : "min-w-[140px]"
            )}>
              {compact ? (
                <span className="hidden sm:inline">
                  {t.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
              ) : (
                <>
                  {t.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </>
              )}
              {compact && (
                <span className="sm:hidden">
                  {t.months[currentMonth.getMonth()].slice(0, 3)} {currentMonth.getFullYear()}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNextMonth}
              className={cn(compact ? "h-7 w-7" : "h-8 w-8")}
            >
              <ChevronRight className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(compact ? "p-2 md:p-4" : "p-4")}>
        {/* Días de la semana */}
        <div className={cn(
          "grid grid-cols-7 mb-2",
          compact ? "gap-0.5" : "gap-1"
        )}>
          {t.weekDays.map((day) => (
            <div
              key={day}
              className={cn(
                "text-xs font-medium text-center text-muted-foreground",
                compact ? "py-1" : "py-2"
              )}
            >
              {compact ? day.slice(0, 2) : day}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className={cn(
          "grid grid-cols-7",
          compact ? "gap-0.5 md:gap-1" : "gap-1"
        )}>
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} />
            }

            const isSelected = selectedDate &&
              day.date.toDateString() === selectedDate.toDateString()

            return (
              <button
                key={day.date.toISOString()}
                onClick={() => handleDateSelect(day)}
                disabled={!day.isSelectable}
                className={cn(
                  "relative aspect-square rounded-lg border-2 transition-all overflow-hidden",
                  compact ? "p-0.5" : "p-1",
                  day.isSelectable && "hover:shadow-md hover:-translate-y-0.5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  // Estado base
                  day.isSelectable ? "cursor-pointer" : "cursor-not-allowed",
                  // Clima
                  day.weather && day.isSelectable ?
                    getWeatherCellClass(day.weather, day.weatherQuality) :
                    "bg-card border-border",
                  // Estados especiales
                  day.isPast && "opacity-40",
                  !day.isOpen && "bg-muted border-destructive/40 text-muted-foreground",
                  day.isToday && "ring-2 ring-primary ring-offset-1",
                  isSelected && "bg-primary text-primary-foreground border-primary"
                )}
              >
                {/* Patrón diagonal para días cerrados */}
                {!day.isOpen && !day.isPast && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgb(239 68 68 / 0.1) 5px, rgb(239 68 68 / 0.1) 6px)',
                    }}
                  />
                )}
                {/* Badges especiales - hidden on compact or small mobile */}
                {!compact && (
                  <div className="absolute top-0.5 right-0.5 hidden sm:flex gap-0.5">
                    {day.isToday && (
                      <Badge variant="default" className="text-[10px] px-1 h-4">
                        {t.today}
                      </Badge>
                    )}
                    {day.isTomorrow && (
                      <Badge variant="secondary" className="text-[10px] px-1 h-4">
                        {t.tomorrow}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Número del día */}
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={cn(
                    "font-semibold",
                    compact ? "text-xs md:text-sm" : "text-sm",
                    isSelected && "text-primary-foreground"
                  )}>
                    {day.day}
                  </span>

                  {/* Icono del clima - SIEMPRE visible en todos los dispositivos */}
                  {day.weather && day.isSelectable && (
                    <div className="mt-0.5">
                      {getWeatherIcon(day.weather)}
                    </div>
                  )}

                  {/* Temperatura - oculta en compact mobile */}
                  {day.weather && day.isSelectable && (
                    <span className={cn(
                      "text-[10px]",
                      compact && "hidden sm:inline",
                      isSelected ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {formatTemp(day.weather.tempMax)}
                    </span>
                  )}

                  {/* Indicador de cerrado - siempre visible */}
                  {day.isOpen === false && !day.isPast && (
                    <>
                      <div className="mt-1">
                        <XCircle className="h-4 w-4 text-destructive" />
                      </div>
                      <Badge variant="destructive" className={cn(
                        "text-[10px] px-1 py-0 mt-0.5",
                        compact && "hidden sm:inline-flex"
                      )}>
                        {t.closed}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Tooltip con información del clima */}
                {day.weather && day.isSelectable && day.recommendation && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover text-popover-foreground rounded-lg shadow-lg border text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    <p className="font-medium mb-1">{t.weatherInfo}</p>
                    <p>{day.recommendation}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Leyenda del clima - colores Enigma */}
        {!compact && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Recomendaciones según el clima:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-accent/20 to-accent/30 dark:from-accent/25 dark:to-accent/35 border border-accent/40 dark:border-accent/50" />
                <span>{t.perfectDay} - {t.terraceDay}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-secondary/25 to-secondary/35 dark:from-secondary/25 dark:to-secondary/35 border border-secondary/35 dark:border-secondary/45" />
                <span>{t.goodDay}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-primary/15 to-primary/25 dark:from-primary/25 dark:to-primary/35 border border-primary/40 dark:border-primary/50" />
                <span>{t.checkWeather} - {t.indoorRecommended}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded bg-muted/50 border border-border/50" />
                <span>{t.closed}</span>
              </div>
            </div>
          </div>
        )}
        {compact && (
          <div className="mt-2 pt-2 border-t hidden md:block">
            <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-accent/20 to-accent/30 dark:from-accent/25 dark:to-accent/35 border border-accent/40 dark:border-accent/50" />
                <span>{t.perfectDay}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-primary/15 to-primary/25 dark:from-primary/25 dark:to-primary/35 border border-primary/40 dark:border-primary/50" />
                <span>{t.checkWeather}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}