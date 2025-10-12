'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Utensils,
  Wine,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Language } from '@/lib/validations/reservation-professional'

interface TimeSlot {
  time: string
  period: 'morning' | 'afternoon' | 'evening' | 'night'
  label: string
  available: boolean
  capacity: number
  demand: 'low' | 'medium' | 'high'
  recommended?: boolean
  discount?: number
}

interface TimeSlotSelectorProps {
  language: Language
  selectedDate: Date | null
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  partySize?: number
  isLoading?: boolean
  className?: string
}

const content = {
  es: {
    title: 'Selecciona tu horario',
    subtitle: 'Elige el momento perfecto para tu experiencia',
    morning: 'Mañana',
    afternoon: 'Almuerzo',
    evening: 'Atardecer',
    night: 'Cena',
    available: 'Disponible',
    lastTables: 'Últimas mesas',
    full: 'Completo',
    recommended: 'Recomendado',
    discount: 'descuento',
    highDemand: 'Alta demanda',
    mediumDemand: 'Demanda media',
    lowDemand: 'Disponibilidad amplia',
    selectTime: 'Seleccionar hora',
    noDate: 'Selecciona primero una fecha',
    loading: 'Cargando horarios disponibles...',
    earlyBird: 'Early Bird',
    happyHour: 'Happy Hour',
    primeTime: 'Prime Time',
    lateDining: 'Cena tardía',
    perfectFor: 'Perfecto para',
    business: 'Comida de negocios',
    romantic: 'Cena romántica',
    family: 'Comida familiar',
    friends: 'Con amigos'
  },
  en: {
    title: 'Select your time',
    subtitle: 'Choose the perfect moment for your experience',
    morning: 'Morning',
    afternoon: 'Lunch',
    evening: 'Sunset',
    night: 'Dinner',
    available: 'Available',
    lastTables: 'Last tables',
    full: 'Full',
    recommended: 'Recommended',
    discount: 'discount',
    highDemand: 'High demand',
    mediumDemand: 'Medium demand',
    lowDemand: 'Wide availability',
    selectTime: 'Select time',
    noDate: 'Please select a date first',
    loading: 'Loading available times...',
    earlyBird: 'Early Bird',
    happyHour: 'Happy Hour',
    primeTime: 'Prime Time',
    lateDining: 'Late dining',
    perfectFor: 'Perfect for',
    business: 'Business lunch',
    romantic: 'Romantic dinner',
    family: 'Family meal',
    friends: 'With friends'
  },
  de: {
    title: 'Wählen Sie Ihre Zeit',
    subtitle: 'Wählen Sie den perfekten Moment für Ihr Erlebnis',
    morning: 'Morgen',
    afternoon: 'Mittagessen',
    evening: 'Sonnenuntergang',
    night: 'Abendessen',
    available: 'Verfügbar',
    lastTables: 'Letzte Tische',
    full: 'Voll',
    recommended: 'Empfohlen',
    discount: 'Rabatt',
    highDemand: 'Hohe Nachfrage',
    mediumDemand: 'Mittlere Nachfrage',
    lowDemand: 'Große Verfügbarkeit',
    selectTime: 'Zeit wählen',
    noDate: 'Bitte wählen Sie zuerst ein Datum',
    loading: 'Verfügbare Zeiten werden geladen...',
    earlyBird: 'Frühbucher',
    happyHour: 'Happy Hour',
    primeTime: 'Hauptzeit',
    lateDining: 'Spätes Abendessen',
    perfectFor: 'Perfekt für',
    business: 'Geschäftsessen',
    romantic: 'Romantisches Abendessen',
    family: 'Familienessen',
    friends: 'Mit Freunden'
  }
}

// Función para obtener el icono del periodo
function getPeriodIcon(period: string) {
  switch (period) {
    case 'morning':
      return <Sunrise className="h-4 w-4" />
    case 'afternoon':
      return <Sun className="h-4 w-4" />
    case 'evening':
      return <Sunset className="h-4 w-4" />
    case 'night':
      return <Moon className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

// Función para obtener el color del periodo (theme-aware)
function getPeriodColors(period: string) {
  switch (period) {
    case 'morning':
      return 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30 hover:border-amber-500/40'
    case 'afternoon':
      return 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/40'
    case 'evening':
      return 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 dark:border-purple-500/30 hover:border-purple-500/40'
    case 'night':
      return 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20 dark:border-indigo-500/30 hover:border-indigo-500/40'
    default:
      return 'bg-card border-border'
  }
}

// Función para obtener el indicador superior del slot (theme-aware)
function getSlotIndicator(period: string) {
  const colors = {
    morning: 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400',
    afternoon: 'bg-gradient-to-r from-blue-500 to-sky-500 dark:from-blue-400 dark:to-sky-400',
    evening: 'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400',
    night: 'bg-gradient-to-r from-indigo-500 to-slate-600 dark:from-indigo-400 dark:to-slate-500'
  }
  return colors[period as keyof typeof colors] || 'bg-primary'
}

// Transform API slot to component TimeSlot format
function transformApiSlotToTimeSlot(
  apiSlot: { time: string; available: boolean; shiftType: 'lunch' | 'dinner' },
  partySize: number,
  isWeekend: boolean
): TimeSlot {
  const hour = parseInt(apiSlot.time.split(':')[0])

  // Map shiftType and hour to period
  let period: TimeSlot['period']
  if (apiSlot.shiftType === 'lunch') {
    period = 'afternoon'
  } else if (hour < 20) {
    period = 'evening'
  } else {
    period = 'night'
  }

  // Determine characteristics based on time and shift
  const isEarlyLunch = apiSlot.shiftType === 'lunch' && hour === 13
  const isLateLunch = apiSlot.shiftType === 'lunch' && hour >= 15
  const isEarlyDinner = apiSlot.shiftType === 'dinner' && (hour === 18 || hour === 19)
  const isPrimeTime = hour === 20 || hour === 21
  const isLateDinner = hour >= 22

  // Generate label based on characteristics
  let label: string
  if (apiSlot.shiftType === 'lunch') {
    label = isEarlyLunch ? 'Almuerzo' : isLateLunch ? 'Almuerzo tardío' : 'Almuerzo'
  } else {
    label = isEarlyDinner ? 'Cena temprana' :
            isPrimeTime ? 'Prime Time' :
            isLateDinner ? 'Cena tardía' : 'Cena'
  }

  // Estimate capacity (would come from availability check in real scenario)
  const capacity = partySize + Math.floor(Math.random() * 4) + 2

  // Determine demand level
  let demand: TimeSlot['demand']
  if (isPrimeTime && isWeekend) {
    demand = 'high'
  } else if (isLateDinner || isEarlyLunch) {
    demand = 'low'
  } else {
    demand = 'medium'
  }

  // Recommend early slots for smaller parties
  const recommended = (isEarlyLunch || isEarlyDinner) && partySize <= 2 && !isWeekend

  return {
    time: apiSlot.time,
    period,
    label,
    available: apiSlot.available,
    capacity,
    demand,
    recommended
  }
}

export default function TimeSlotSelector({
  language,
  selectedDate,
  selectedTime,
  onTimeSelect,
  partySize = 2,
  isLoading = false,
  className
}: TimeSlotSelectorProps) {
  const t = content[language]
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isFetchingSlots, setIsFetchingSlots] = useState(false)
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({
    afternoon: true,
    evening: false,
    night: false
  })

  // Fetch time slots from API when date changes
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([])
      return
    }

    const fetchTimeSlots = async () => {
      setIsFetchingSlots(true)
      try {
        // Format date in local timezone to avoid day shift
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`

        const response = await fetch(`/api/business-hours?action=slots&date=${dateString}`)
        const data = await response.json()

        if (data.success && data.data?.slots) {
          const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6

          // Transform API slots to component format
          const transformedSlots = data.data.slots.map((apiSlot: { time: string; available: boolean; shiftType: 'lunch' | 'dinner' }) =>
            transformApiSlotToTimeSlot(apiSlot, partySize, isWeekend)
          )

          setTimeSlots(transformedSlots)
        } else {
          console.error('Failed to fetch time slots:', data.error)
          setTimeSlots([])
        }
      } catch (error) {
        console.error('Error fetching time slots:', error)
        setTimeSlots([])
      } finally {
        setIsFetchingSlots(false)
      }
    }

    fetchTimeSlots()
  }, [selectedDate, partySize])

  // Agrupar slots por periodo - SOLO mostrar disponibles
  const slotsByPeriod = useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {}
    timeSlots
      .filter(slot => slot.available) // Filtrar solo horarios disponibles
      .forEach(slot => {
        if (!grouped[slot.period]) {
          grouped[slot.period] = []
        }
        grouped[slot.period].push(slot)
      })
    return grouped
  }, [timeSlots])

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.available) {
      toast.error(language === 'es' ?
        'Este horario no está disponible' :
        'This time is not available'
      )
      return
    }

    if (slot.capacity < partySize) {
      toast.warning(language === 'es' ?
        `Solo quedan ${slot.capacity} plazas disponibles` :
        `Only ${slot.capacity} seats available`
      )
      return
    }

    onTimeSelect(slot.time)
  }

  if (!selectedDate) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">{t.noDate}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || isFetchingSlots) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const periodOrder = ['afternoon', 'evening', 'night']

  const togglePeriod = (period: string) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [period]: !prev[period]
    }))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {periodOrder.map(period => {
          const slots = slotsByPeriod[period]
          if (!slots || slots.length === 0) return null

          const periodLabel = t[period as keyof typeof t] as string
          const isExpanded = expandedPeriods[period]
          const MOBILE_PREVIEW_COUNT = 4
          const hasMore = slots.length > MOBILE_PREVIEW_COUNT

          return (
            <Collapsible
              key={period}
              open={isExpanded}
              onOpenChange={() => togglePeriod(period)}
              className="space-y-3"
            >
              {/* Header del periodo con toggle */}
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors group">
                    {getPeriodIcon(period)}
                    <span>{periodLabel}</span>
                    <Badge variant="secondary" className="ml-1">
                      {slots.length}
                    </Badge>
                    {hasMore && (
                      <span className="md:hidden">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 transition-transform" />
                        ) : (
                          <ChevronDown className="h-4 w-4 transition-transform" />
                        )}
                      </span>
                    )}
                  </button>
                </CollapsibleTrigger>
                <div className={cn(
                  "h-0.5 flex-1 rounded-full",
                  getSlotIndicator(period)
                )} />
              </div>

              {/* Grid de slots - primeros 4 siempre visibles en mobile */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 md:grid-cols-4">
                {slots.slice(0, MOBILE_PREVIEW_COUNT).map((slot) => {
                  const isSelected = selectedTime === slot.time
                  const isHovered = hoveredSlot === slot.time

                  return (
                    <button
                      key={slot.time}
                      className={cn(
                        "relative group rounded-lg border-2 p-2 md:p-3 transition-all",
                        "hover:shadow-lg hover:-translate-y-0.5",
                        getPeriodColors(slot.period),
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        !slot.available && "opacity-50 cursor-not-allowed",
                        slot.available && "cursor-pointer"
                      )}
                      onClick={() => handleTimeSelect(slot)}
                      onMouseEnter={() => setHoveredSlot(slot.time)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      disabled={!slot.available}
                    >
                      {/* Indicador superior */}
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-1 rounded-t-md",
                        getSlotIndicator(slot.period),
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                      )} />

                      {/* Badges */}
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {slot.recommended && (
                          <Badge className="h-6 w-6 p-0 flex items-center justify-center rounded-full" variant="default" title={t.recommended}>
                            <span className="text-sm">★</span>
                          </Badge>
                        )}
                      </div>

                      {/* Contenido del slot */}
                      <div className="space-y-1">
                        <p className="text-base md:text-lg font-semibold">
                          {slot.time}
                        </p>
                        <p className="text-xs text-muted-foreground hidden md:block">
                          {slot.label}
                        </p>
                      </div>

                      {/* Estado de disponibilidad - Solo iconos en móvil */}
                      <div className="mt-2 flex items-center justify-center gap-1 md:space-y-1 md:block">
                        {slot.available ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-500" title={slot.capacity > 4 ? t.available : t.lastTables} />
                            <span className="hidden md:inline text-xs text-green-600 dark:text-green-500 md:ml-1">
                              {slot.capacity > 4 ? t.available : t.lastTables}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-500" title={t.full} />
                            <span className="hidden md:inline text-xs text-red-600 dark:text-red-500 md:ml-1">{t.full}</span>
                          </>
                        )}

                        {/* Indicador de demanda - Solo icono en móvil */}
                        {slot.available && (
                          <>
                            {slot.demand === 'high' && (
                              <>
                                <TrendingUp className="h-3.5 w-3.5 text-orange-600 dark:text-orange-500" title={t.highDemand} />
                                <span className="hidden md:inline text-xs text-orange-600 dark:text-orange-500 md:ml-1">
                                  {t.highDemand}
                                </span>
                              </>
                            )}
                            {slot.demand === 'low' && (
                              <span className="hidden md:block text-xs text-green-600 dark:text-green-500">
                                {t.lowDemand}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Tooltip con información adicional */}
                      {isHovered && slot.available && (
                        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover text-popover-foreground rounded-lg shadow-lg border text-xs whitespace-nowrap">
                          <p className="font-medium mb-1">{t.perfectFor}:</p>
                          <p>
                            {slot.period === 'afternoon' ? t.business :
                             slot.period === 'evening' ? t.romantic :
                             slot.period === 'night' && slot.time > '21:00' ? t.friends :
                             t.family}
                          </p>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Slots adicionales colapsables (solo mobile) */}
              {hasMore && (
                <CollapsibleContent className="md:hidden">
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {slots.slice(MOBILE_PREVIEW_COUNT).map((slot) => {
                      const isSelected = selectedTime === slot.time
                      const isHovered = hoveredSlot === slot.time

                      return (
                        <button
                          key={slot.time}
                          className={cn(
                            "relative group rounded-lg border-2 p-2 transition-all",
                            "hover:shadow-lg hover:-translate-y-0.5",
                            getPeriodColors(slot.period),
                            isSelected && "ring-2 ring-primary ring-offset-2",
                            !slot.available && "opacity-50 cursor-not-allowed",
                            slot.available && "cursor-pointer"
                          )}
                          onClick={() => handleTimeSelect(slot)}
                          onMouseEnter={() => setHoveredSlot(slot.time)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          disabled={!slot.available}
                        >
                          {/* Indicador superior */}
                          <div className={cn(
                            "absolute top-0 left-0 right-0 h-1 rounded-t-md",
                            getSlotIndicator(slot.period),
                            "opacity-0 group-hover:opacity-100 transition-opacity"
                          )} />

                          {/* Badges */}
                          <div className="absolute -top-2 -right-2 flex gap-1">
                            {slot.recommended && (
                              <Badge className="h-6 w-6 p-0 flex items-center justify-center rounded-full" variant="default" title={t.recommended}>
                                <span className="text-sm">★</span>
                              </Badge>
                            )}
                          </div>

                          {/* Contenido del slot */}
                          <div className="space-y-1">
                            <p className="text-base font-semibold">
                              {slot.time}
                            </p>
                          </div>

                          {/* Estado de disponibilidad - Solo iconos */}
                          <div className="mt-2 flex items-center justify-center gap-1">
                            {slot.available ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" title={slot.capacity > 4 ? t.available : t.lastTables} />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-red-600" title={t.full} />
                            )}
                            {slot.available && slot.demand === 'high' && (
                              <TrendingUp className="h-3.5 w-3.5 text-orange-600" title={t.highDemand} />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              )}

              {/* En desktop mostrar todos sin colapsar */}
              <div className="hidden md:grid md:grid-cols-4 md:gap-3">
                {slots.slice(MOBILE_PREVIEW_COUNT).map((slot) => {
                  const isSelected = selectedTime === slot.time
                  const isHovered = hoveredSlot === slot.time

                  return (
                    <button
                      key={slot.time}
                      className={cn(
                        "relative group rounded-lg border-2 p-3 transition-all",
                        "hover:shadow-lg hover:-translate-y-0.5",
                        getPeriodColors(slot.period),
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        !slot.available && "opacity-50 cursor-not-allowed",
                        slot.available && "cursor-pointer"
                      )}
                      onClick={() => handleTimeSelect(slot)}
                      onMouseEnter={() => setHoveredSlot(slot.time)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      disabled={!slot.available}
                    >
                      {/* Indicador superior */}
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-1 rounded-t-md",
                        getSlotIndicator(slot.period),
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                      )} />

                      {/* Badges */}
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {slot.recommended && (
                          <Badge className="h-6 w-6 p-0 flex items-center justify-center rounded-full" variant="default" title={t.recommended}>
                            <span className="text-sm">★</span>
                          </Badge>
                        )}
                      </div>

                      {/* Contenido del slot */}
                      <div className="space-y-1">
                        <p className="text-base md:text-lg font-semibold">
                          {slot.time}
                        </p>
                        <p className="text-xs text-muted-foreground hidden md:block">
                          {slot.label}
                        </p>
                      </div>

                      {/* Estado de disponibilidad - Solo iconos en móvil */}
                      <div className="mt-2 flex items-center justify-center gap-1 md:space-y-1 md:block">
                        {slot.available ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-500" title={slot.capacity > 4 ? t.available : t.lastTables} />
                            <span className="hidden md:inline text-xs text-green-600 dark:text-green-500 md:ml-1">
                              {slot.capacity > 4 ? t.available : t.lastTables}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-500" title={t.full} />
                            <span className="hidden md:inline text-xs text-red-600 dark:text-red-500 md:ml-1">{t.full}</span>
                          </>
                        )}

                        {/* Indicador de demanda - Solo icono en móvil */}
                        {slot.available && (
                          <>
                            {slot.demand === 'high' && (
                              <>
                                <TrendingUp className="h-3.5 w-3.5 text-orange-600 dark:text-orange-500" title={t.highDemand} />
                                <span className="hidden md:inline text-xs text-orange-600 dark:text-orange-500 md:ml-1">
                                  {t.highDemand}
                                </span>
                              </>
                            )}
                            {slot.demand === 'low' && (
                              <span className="hidden md:block text-xs text-green-600 dark:text-green-500">
                                {t.lowDemand}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Tooltip con información adicional */}
                      {isHovered && slot.available && (
                        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover text-popover-foreground rounded-lg shadow-lg border text-xs whitespace-nowrap">
                          <p className="font-medium mb-1">{t.perfectFor}:</p>
                          <p>
                            {slot.period === 'afternoon' ? t.business :
                             slot.period === 'evening' ? t.romantic :
                             slot.period === 'night' && slot.time > '21:00' ? t.friends :
                             t.family}
                          </p>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </Collapsible>
          )
        })}

        {/* Leyenda de iconos */}
        <div className="flex flex-wrap gap-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Badge variant="default" className="h-4 px-1">★</Badge>
            <span>{t.recommended}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-500" />
            <span>{t.highDemand}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}