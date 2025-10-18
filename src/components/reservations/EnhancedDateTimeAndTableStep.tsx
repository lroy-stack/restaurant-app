'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  ArrowRight,
  Loader2,
  Plus,
  Minus,
  Baby,
  Info,
  MessageCircle,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import type { Language } from '@/lib/validations/reservation-professional'
import { useWeatherForecast } from '@/hooks/useWeatherForecast'
import { useBusinessHours } from '@/hooks/useBusinessHours'

// Importar los nuevos componentes modulares
import WeatherPanel from './WeatherPanel'
import CalendarWithWeather from './CalendarWithWeather'
import CompactWeatherWidget from './CompactWeatherWidget'
import { LargeGroupSection } from './LargeGroupSection'
import { TwoTurnTimeSlotSelector } from './TwoTurnTimeSlotSelector'

// DateTime Helper - Prevents timezone shift bugs
function createSafeDateTime(date: Date, time: string): string {
  const [hours = '0', minutes = '0'] = time.split(':')
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  // Use Date.UTC to prevent timezone conversion
  return new Date(Date.UTC(
    year,
    month,
    day,
    parseInt(hours, 10),
    parseInt(minutes, 10),
    0,
    0
  )).toISOString()
}

// Helper: Format date without timezone conversion (for API calls)
function formatDateForDB(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface Slot {
  time: string
  available: boolean
  currentPersons: number
  maxPersons: number
  remainingCapacity: number
  utilizationPercent: number
}

interface Turn {
  name: { es: string; en: string; de: string }
  period: string
  start: string
  end: string
  maxPerSlot: number
  totalSlots: number
  slots: Slot[]
  availableCount: number
  totalCapacity: number
}

interface Service {
  type: 'lunch' | 'dinner'
  name: { es: string; en: string; de: string }
  period: string
  turns: Turn[]
}

interface AvailabilityData {
  date: string
  partySize: number
  capacity: {
    total: number
    target: number
    targetOccupancy: string
  }
  services: Service[]
}

interface EnhancedDateTimeAndTableStepProps {
  language: Language
  onNext: () => void
  onAvailabilityChange?: (availability: AvailabilityData | null) => void
}

const content = {
  es: {
    title: 'Fecha, Hora y Mesa',
    subtitle: 'Elige el momento perfecto para tu experiencia gastronómica',
    partySizeLabel: 'Número de personas',
    person: 'persona',
    people: 'personas',
    next: 'Continuar',
    weatherTitle: 'Pronóstico del Tiempo',
    calendarTitle: 'Selecciona una Fecha',
    timeTitle: 'Elige tu Horario',
    noDateSelected: 'Por favor selecciona una fecha',
    noTimeSelected: 'Por favor selecciona una hora',
    completeAllFields: 'Por favor completa todos los campos requeridos'
  },
  en: {
    title: 'Date, Time & Table',
    subtitle: 'Choose the perfect moment for your dining experience',
    partySizeLabel: 'Party size',
    person: 'person',
    people: 'people',
    next: 'Continue',
    weatherTitle: 'Weather Forecast',
    calendarTitle: 'Select a Date',
    timeTitle: 'Choose Your Time',
    noDateSelected: 'Please select a date',
    noTimeSelected: 'Please select a time',
    completeAllFields: 'Please complete all required fields'
  },
  de: {
    title: 'Datum, Zeit & Tisch',
    subtitle: 'Wählen Sie den perfekten Moment für Ihr kulinarisches Erlebnis',
    partySizeLabel: 'Personenanzahl',
    person: 'Person',
    people: 'Personen',
    next: 'Weiter',
    weatherTitle: 'Wettervorhersage',
    calendarTitle: 'Datum wählen',
    timeTitle: 'Zeit wählen',
    noDateSelected: 'Bitte wählen Sie ein Datum',
    noTimeSelected: 'Bitte wählen Sie eine Zeit',
    completeAllFields: 'Bitte füllen Sie alle erforderlichen Felder aus'
  }
}

export default function EnhancedDateTimeAndTableStep({
  language,
  onNext,
  onAvailabilityChange
}: EnhancedDateTimeAndTableStepProps) {
  const t = content[language]
  const form = useFormContext()

  // Estados locales
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [partySize, setPartySize] = useState<number>(2)
  const [childrenCount, setChildrenCount] = useState<number>(0)
  const [hasChildren, setHasChildren] = useState<boolean>(false)
  const [availabilityResults, setAvailabilityResults] = useState<AvailabilityData | null>(null)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [preferredZone, setPreferredZone] = useState<string>('')

  // Hooks
  const { isGoodWeather } = useWeatherForecast({ lang: language })
  const { maxPartySize } = useBusinessHours()

  // Refs para scroll inteligente
  const partySizeRef = useRef<HTMLDivElement>(null)
  const timeSlotsRef = useRef<HTMLDivElement>(null)
  const zonePreferenceRef = useRef<HTMLDivElement>(null)
  const continueButtonRef = useRef<HTMLDivElement>(null)

  // Manejar selección de fecha desde el panel del tiempo
  const handleDateSelectFromWeather = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setAvailabilityResults(null)
  }, [])

  // Manejar selección de fecha desde el calendario
  const handleDateSelectFromCalendar = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setAvailabilityResults(null)
  }, [])

  // Verificar disponibilidad (auto-trigger cuando hay fecha y partySize)
  const handleCheckAvailability = useCallback(async () => {
    if (!selectedDate || !partySize) return

    setIsCheckingAvailability(true)

    try {
      const dateStr = formatDateForDB(selectedDate)

      const response = await fetch('/api/tables/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          partySize
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        setAvailabilityResults(data.data)
        onAvailabilityChange?.(data.data)
        // Clear selected time when new availability loads
        setSelectedTime(null)
      } else {
        toast.error(language === 'es' ?
          'Error al verificar disponibilidad' :
          'Error checking availability'
        )
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error(language === 'es' ?
        'Error al verificar disponibilidad' :
        'Error checking availability'
      )
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [selectedDate, partySize, language, onAvailabilityChange])

  // Auto-trigger availability check cuando cambia fecha o partySize
  useEffect(() => {
    if (selectedDate && partySize && partySize <= 8) {
      handleCheckAvailability()
    }
  }, [selectedDate, partySize, handleCheckAvailability])

  // Scroll inteligente: cuando se selecciona fecha, scroll a party size
  useEffect(() => {
    if (selectedDate && partySizeRef.current) {
      setTimeout(() => {
        partySizeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 300)
    }
  }, [selectedDate])

  // Scroll inteligente: cuando se selecciona hora, scroll a zone preference o continuar
  useEffect(() => {
    if (selectedTime) {
      setTimeout(() => {
        if (partySize <= 8 && zonePreferenceRef.current) {
          zonePreferenceRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        } else if (continueButtonRef.current) {
          continueButtonRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          })
        }
      }, 300)
    }
  }, [selectedTime, partySize])

  // Manejar cambio de tamaño del grupo
  const handlePartySizeChange = (increment: number) => {
    const newSize = Math.max(1, Math.min(maxPartySize || 10, partySize + increment))
    setPartySize(newSize)

    // Reset children count if it exceeds new party size
    if (childrenCount >= newSize) {
      setChildrenCount(Math.max(0, newSize - 1))
    }

    // Clear availability when party size changes
    setAvailabilityResults(null)
    setSelectedTime(null)
  }

  // Manejar cambio de niños
  const handleChildrenCountChange = (increment: number) => {
    const newCount = Math.max(0, Math.min(partySize - 1, childrenCount + increment))
    setChildrenCount(newCount)
  }

  // Continuar al siguiente paso
  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !partySize) {
      toast.error(t.completeAllFields)
      return
    }

    const dateTime = createSafeDateTime(selectedDate, selectedTime)

    form.setValue('dateTime', dateTime)
    form.setValue('tableIds', []) // ✅ Sin mesas - staff asigna después
    form.setValue('partySize', partySize)
    form.setValue('childrenCount', childrenCount > 0 ? childrenCount : undefined)
    form.setValue('location', preferredZone || '') // ✅ Zona preferida opcional

    onNext()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Panel del tiempo - Columna izquierda (solo desktop) */}
      <div className="hidden lg:block lg:col-span-1">
        <WeatherPanel
          language={language}
          onDateSelect={handleDateSelectFromWeather}
          selectedDate={selectedDate}
          className="h-full"
        />
      </div>

      {/* Contenido principal - Columna central y derecha */}
      <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="px-1">
          <h2 className="text-xl md:text-2xl font-bold">{t.title}</h2>
          <p className="text-sm md:text-base text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Compact Weather Widget (solo móvil) */}
        <CompactWeatherWidget
          language={language}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelectFromWeather}
          className="px-1"
        />

        {/* Calendario con clima */}
        <CalendarWithWeather
          language={language}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelectFromCalendar}
          compact={true}
        />

        {/* Selector de personas y niños - COMPACTO Y NATURAL */}
        <Card ref={partySizeRef}>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Número total de personas */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  {t.partySizeLabel}
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePartySizeChange(-1)}
                    disabled={partySize <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex-1 text-center bg-muted rounded-md py-1.5 px-3">
                    <span className="text-base font-semibold">{partySize}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">
                      {partySize === 1 ? t.person : t.people}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePartySizeChange(1)}
                    disabled={partySize >= (maxPartySize || 10)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Mensaje OBLIGATORIO para grupos mayores de 8 */}
                {partySize >= 9 && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-600">
                    <div className="flex items-start gap-2.5">
                      <MessageCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                          {language === 'es' && 'Reserva para más de 8 personas'}
                          {language === 'en' && 'Reservation for more than 8 people'}
                          {language === 'de' && 'Reservierung für mehr als 8 Personen'}
                        </p>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                          {language === 'es' && '1. Elige tu fecha y hora abajo'}
                          {language === 'en' && '1. Choose your date and time below'}
                          {language === 'de' && '1. Wählen Sie Datum und Uhrzeit unten'}
                        </p>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                          {language === 'es' && '2. Confirma tu reserva por WhatsApp'}
                          {language === 'en' && '2. Confirm your reservation via WhatsApp'}
                          {language === 'de' && '2. Bestätigen Sie Ihre Reservierung über WhatsApp'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkbox para indicar si hay niños */}
              {partySize > 1 && partySize <= 8 && (
                <div className="pt-2.5 border-t space-y-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="hasChildren"
                      checked={hasChildren}
                      onCheckedChange={(checked) => {
                        setHasChildren(!!checked)
                        if (!checked) setChildrenCount(0)
                      }}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="hasChildren"
                        className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                      >
                        <Baby className="h-3.5 w-3.5 text-accent" />
                        {language === 'es' ? '¿Hay niños en la mesa?' :
                         language === 'en' ? 'Are there children at the table?' :
                         'Gibt es Kinder am Tisch?'}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {language === 'es' ? 'Hasta 8 años' :
                         language === 'en' ? 'Up to 8 years old' :
                         'Bis 8 Jahre'}
                      </p>
                    </div>
                  </div>

                  {/* Selector de cantidad de niños */}
                  {hasChildren && (
                    <div className="pl-6 space-y-2">
                      <Label className="text-sm font-medium">
                        {language === 'es' ? '¿Cuántos niños?' :
                         language === 'en' ? 'How many children?' :
                         'Wie viele Kinder?'}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleChildrenCountChange(-1)}
                          disabled={childrenCount === 0}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <div className="flex-1 text-center bg-accent/5 border border-accent/20 rounded-md py-1.5 px-3">
                          <span className="text-base font-semibold text-accent">{childrenCount}</span>
                          <span className="text-xs text-muted-foreground ml-1.5">
                            {language === 'es' ? (childrenCount === 1 ? 'niño' : 'niños') :
                             language === 'en' ? (childrenCount === 1 ? 'child' : 'children') :
                             (childrenCount === 1 ? 'Kind' : 'Kinder')}
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleChildrenCountChange(1)}
                          disabled={childrenCount >= partySize - 1}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Nota inline compacta */}
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <Info className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>
                          <span className="font-medium">
                            {language === 'es' ? 'Nota:' :
                             language === 'en' ? 'Note:' :
                             'Hinweis:'}
                          </span>{' '}
                          {language === 'es' ? 'Los niños se cuentan dentro del total de personas.' :
                           language === 'en' ? 'Children are counted within the total number of people.' :
                           'Kinder werden zur Gesamtzahl der Personen gezählt.'}
                        </span>
                      </p>

                      {/* Desglose inline */}
                      {childrenCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {language === 'es' ? `${partySize - childrenCount} adulto${partySize - childrenCount !== 1 ? 's' : ''} + ${childrenCount} niño${childrenCount !== 1 ? 's' : ''} = ${partySize} total` :
                           language === 'en' ? `${partySize - childrenCount} adult${partySize - childrenCount !== 1 ? 's' : ''} + ${childrenCount} child${childrenCount !== 1 ? 'ren' : ''} = ${partySize} total` :
                           `${partySize - childrenCount} Erwachsene + ${childrenCount} Kind${childrenCount !== 1 ? 'er' : ''} = ${partySize} gesamt`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Two-Turn Time Slot Selector */}
        {partySize <= 8 && selectedDate && isCheckingAvailability && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {language === 'es' ? 'Cargando horarios disponibles...' :
               language === 'en' ? 'Loading available times...' :
               'Verfügbare Zeiten werden geladen...'}
            </span>
          </div>
        )}

        {partySize <= 8 && availabilityResults && !isCheckingAvailability && (
          <TwoTurnTimeSlotSelector
            services={availabilityResults.services}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            language={language}
          />
        )}

        {/* Selector de hora simple para grupos grandes */}
        {partySize >= 9 && selectedDate && !selectedTime && (
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 block">
                {language === 'es' ? 'Selecciona una hora aproximada' :
                 language === 'en' ? 'Select an approximate time' :
                 'Wählen Sie eine ungefähre Zeit'}
              </Label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {['13:00', '13:30', '14:00', '14:30', '15:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map(time => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="h-10"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sección de Grupos Grandes (9+ personas) */}
        {partySize >= 9 && selectedDate && selectedTime && (
          <LargeGroupSection
            dateTime={createSafeDateTime(selectedDate, selectedTime)}
            partySize={partySize}
            language={language}
          />
        )}

        {/* Selector de Zona Preferida */}
        {partySize <= 8 && selectedDate && selectedTime && (
          <Card ref={zonePreferenceRef}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Label className="text-base font-medium">
                    {language === 'es' ? 'Zona Preferida (Opcional)' :
                     language === 'en' ? 'Preferred Zone (Optional)' :
                     'Bevorzugter Bereich (Optional)'}
                  </Label>
                </div>

                <p className="text-sm text-muted-foreground">
                  {language === 'es' ? 'Indica tu preferencia de zona. El restaurante intentará asignarte mesas en esta área.' :
                   language === 'en' ? 'Indicate your zone preference. The restaurant will try to assign you tables in this area.' :
                   'Geben Sie Ihre Zonenvorliebe an. Das Restaurant wird versuchen, Ihnen Tische in diesem Bereich zuzuweisen.'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={preferredZone === 'TERRACE_CAMPANARI' ? 'default' : 'outline'}
                    onClick={() => setPreferredZone('TERRACE_CAMPANARI')}
                    className="h-auto flex-col items-start p-4 text-left"
                  >
                    <span className="font-medium">
                      {language === 'es' ? 'Terraza Campanari' :
                       language === 'en' ? 'Campanari Terrace' :
                       'Campanari Terrasse'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {language === 'es' ? 'Ambiente al aire libre' :
                       language === 'en' ? 'Outdoor atmosphere' :
                       'Außenbereich'}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={preferredZone === 'SALA_PRINCIPAL' ? 'default' : 'outline'}
                    onClick={() => setPreferredZone('SALA_PRINCIPAL')}
                    className="h-auto flex-col items-start p-4 text-left"
                  >
                    <span className="font-medium">
                      {language === 'es' ? 'Sala Principal' :
                       language === 'en' ? 'Main Dining Room' :
                       'Hauptsaal'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {language === 'es' ? 'Interior acogedor' :
                       language === 'en' ? 'Cozy interior' :
                       'Gemütlicher Innenbereich'}
                    </span>
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreferredZone('')}
                  className={cn("text-xs", !preferredZone && "hidden")}
                >
                  {language === 'es' ? 'Sin preferencia' :
                   language === 'en' ? 'No preference' :
                   'Keine Präferenz'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botón continuar - Solo después de seleccionar time */}
        {partySize <= 8 && selectedDate && selectedTime && (
          <div ref={continueButtonRef} className="flex justify-end">
            <Button
              onClick={handleContinue}
              className="w-full sm:w-auto h-10 md:h-11"
              size="default"
            >
              <span className="text-sm md:text-base">{t.next}</span>
              <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
