'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWeatherForecast } from '@/hooks/useWeatherForecast'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import type { Language } from '@/lib/validations/reservation-professional'
import { toast } from 'sonner'

interface CompactWeatherWidgetProps {
  language: Language
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  className?: string
}

const content = {
  es: {
    today: 'Hoy',
    tomorrow: 'Mañ',
    closed: 'Cerrado',
    perfect: 'Ideal',
    good: 'Bueno',
    check: 'Ver'
  },
  en: {
    today: 'Today',
    tomorrow: 'Tom',
    closed: 'Closed',
    perfect: 'Perfect',
    good: 'Good',
    check: 'Check'
  },
  de: {
    today: 'Heute',
    tomorrow: 'Morg',
    closed: 'Geschl',
    perfect: 'Perfekt',
    good: 'Gut',
    check: 'Prüfen'
  }
}

function getWeatherIcon(description: string, size: 'sm' | 'md' = 'md') {
  const desc = description.toLowerCase()
  const className = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'

  if (desc.includes('sol') || desc.includes('sun') || desc.includes('clear')) {
    return <Sun className={cn(className, 'text-amber-500 dark:text-amber-400')} />
  }
  if (desc.includes('lluv') || desc.includes('rain')) {
    return <CloudRain className={cn(className, 'text-blue-500 dark:text-blue-400')} />
  }
  if (desc.includes('nub') || desc.includes('cloud')) {
    return <Cloud className={cn(className, 'text-muted-foreground')} />
  }
  return <Sun className={cn(className, 'text-amber-500 dark:text-amber-400')} />
}

function formatCompactDate(date: Date, language: Language, isToday: boolean, isTomorrow: boolean): string {
  const t = content[language]

  if (isToday) return t.today
  if (isTomorrow) return t.tomorrow

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric'
  }

  const locale = language === 'es' ? 'es-ES' :
                 language === 'de' ? 'de-DE' : 'en-US'

  return new Intl.DateTimeFormat(locale, options).format(date)
}

export default function CompactWeatherWidget({
  language,
  selectedDate,
  onDateSelect,
  className
}: CompactWeatherWidgetProps) {
  const t = content[language]

  const {
    weather,
    isLoading,
    formatTemp,
    isGoodWeather
  } = useWeatherForecast({
    city: 'Calpe',
    lang: language
  })

  const { isRestaurantOpen } = useBusinessHours()

  const handleDateSelect = (date: Date) => {
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

    onDateSelect(date)
  }

  if (isLoading || !weather) {
    return (
      <div className={cn('flex gap-2 overflow-x-auto pb-2 lg:hidden', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-16 h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn(
      'flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:hidden',
      className
    )}>
      {weather.forecast.slice(0, 5).map((day, index) => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date
        const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString()
        const isToday = index === 0
        const isTomorrow = index === 1
        const goodWeather = isGoodWeather(dayDate)

        // Check if restaurant is open
        const dateString = dayDate.toISOString().split('T')[0]
        const isOpen = isRestaurantOpen ? isRestaurantOpen(dateString) : null
        const isClosed = isOpen === false

        return (
          <button
            key={typeof day.date === 'string' ? day.date : day.date.toISOString()}
            onClick={() => handleDateSelect(dayDate)}
            disabled={isClosed}
            className={cn(
              'flex-shrink-0 w-16 rounded-lg p-2 border-2 transition-all',
              'flex flex-col items-center justify-center gap-1',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground shadow-md'
                : 'border-border bg-white dark:bg-gray-800 hover:border-primary/50',
              isClosed && 'opacity-40 cursor-not-allowed',
              goodWeather && !isSelected && 'border-green-500/30 bg-green-50 dark:bg-green-900/20'
            )}
          >
            {/* Day label */}
            <span className={cn(
              'text-[10px] font-medium uppercase truncate w-full text-center',
              isSelected ? 'text-primary' : 'text-muted-foreground'
            )}>
              {formatCompactDate(dayDate, language, isToday, isTomorrow)}
            </span>

            {/* Weather icon */}
            <div className="my-0.5">
              {getWeatherIcon(day.description, 'sm')}
            </div>

            {/* Temperature */}
            <span className={cn(
              'text-xs font-semibold',
              isSelected ? 'text-foreground' : 'text-foreground'
            )}>
              {formatTemp(day.tempMax)}
            </span>

            {/* Quality indicator dot */}
            {!isClosed && (
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                goodWeather ? 'bg-green-500 dark:bg-green-400' :
                day.precipProbability > 60 ? 'bg-blue-500 dark:bg-blue-400' :
                'bg-amber-500 dark:bg-amber-400'
              )} />
            )}

            {/* Closed indicator */}
            {isClosed && (
              <span className="text-[8px] text-destructive font-medium">
                {t.closed}
              </span>
            )}
          </button>
        )
      })}

      {/* Scroll hint */}
      <div className="flex-shrink-0 w-1" />
    </div>
  )
}
