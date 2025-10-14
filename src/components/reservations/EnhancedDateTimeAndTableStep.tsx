'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MapPin,
  ArrowRight,
  Loader2,
  Plus,
  Minus,
  Baby,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import type { Language } from '@/lib/validations/reservation-professional'
import type { AvailabilityData } from '@/hooks/useReservations'
import { useReservations } from '@/hooks/useReservations'
import { useWeatherForecast } from '@/hooks/useWeatherForecast'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { useCapacityValidation } from '@/hooks/useCapacityValidation'

// Importar los nuevos componentes modulares
import WeatherPanel from './WeatherPanel'
import CalendarWithWeather from './CalendarWithWeather'
import TimeSlotSelector from './TimeSlotSelector'
import { MultiTableSelector } from './MultiTableSelector'
import CompactWeatherWidget from './CompactWeatherWidget'

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

// Multi-table selection algorithm
interface Table {
  id: string
  number: string
  capacity: number
  location?: string
}

function selectOptimalTables(
  recommendations: Table[],
  partySize: number
): Table[] {
  if (recommendations.length === 0) return []

  // Try single table first - find one that fits the party size
  const singleTable = recommendations.find(t => t.capacity >= partySize)
  if (singleTable) return [singleTable]

  // Sort by capacity descending for optimal combination
  const sorted = [...recommendations].sort((a, b) => b.capacity - a.capacity)

  const selected: Table[] = []
  let remainingCapacity = partySize

  for (const table of sorted) {
    if (remainingCapacity <= 0) break
    selected.push(table)
    remainingCapacity -= table.capacity
  }

  return selected
}

interface EnhancedDateTimeAndTableStepProps {
  language: Language
  onNext: () => void
  onAvailabilityChange?: (availability: AvailabilityData | null) => void
}

interface Zone {
  id: string
  isActive: boolean
  name: { es: string; en: string; de: string }
  type: 'terrace' | 'indoor'
  description: { es: string; en: string; de: string }
}

const content = {
  es: {
    title: 'Fecha, Hora y Mesa',
    subtitle: 'Elige el momento perfecto para tu experiencia gastronómica',
    partySizeLabel: 'Número de personas',
    locationLabel: 'Zona preferida (opcional)',
    checkAvailability: 'Verificar Disponibilidad',
    checking: 'Verificando...',
    person: 'persona',
    people: 'personas',
    next: 'Siguiente',
    back: 'Atrás',
    weatherTitle: 'Pronóstico del Tiempo',
    calendarTitle: 'Selecciona una Fecha',
    timeTitle: 'Elige tu Horario',
    zoneTitle: 'Zona Preferida',
    terrace: 'Terraza',
    indoor: 'Interior',
    vip: 'Sala VIP',
    noDateSelected: 'Por favor selecciona una fecha',
    noTimeSelected: 'Por favor selecciona una hora',
    loadingZones: 'Cargando zonas disponibles...'
  },
  en: {
    title: 'Date, Time & Table',
    subtitle: 'Choose the perfect moment for your dining experience',
    partySizeLabel: 'Party size',
    locationLabel: 'Preferred area (optional)',
    checkAvailability: 'Check Availability',
    checking: 'Checking...',
    person: 'person',
    people: 'people',
    next: 'Next',
    back: 'Back',
    weatherTitle: 'Weather Forecast',
    calendarTitle: 'Select a Date',
    timeTitle: 'Choose Your Time',
    zoneTitle: 'Preferred Zone',
    terrace: 'Terrace',
    indoor: 'Indoor',
    vip: 'VIP Room',
    noDateSelected: 'Please select a date',
    noTimeSelected: 'Please select a time',
    loadingZones: 'Loading available zones...'
  },
  de: {
    title: 'Datum, Zeit & Tisch',
    subtitle: 'Wählen Sie den perfekten Moment für Ihr kulinarisches Erlebnis',
    partySizeLabel: 'Personenanzahl',
    locationLabel: 'Bevorzugter Bereich (optional)',
    checkAvailability: 'Verfügbarkeit prüfen',
    checking: 'Wird geprüft...',
    person: 'Person',
    people: 'Personen',
    next: 'Weiter',
    back: 'Zurück',
    weatherTitle: 'Wettervorhersage',
    calendarTitle: 'Datum wählen',
    timeTitle: 'Zeit wählen',
    zoneTitle: 'Bevorzugter Bereich',
    terrace: 'Terrasse',
    indoor: 'Innenbereich',
    vip: 'VIP-Raum',
    noDateSelected: 'Bitte wählen Sie ein Datum',
    noTimeSelected: 'Bitte wählen Sie eine Zeit',
    loadingZones: 'Verfügbare Bereiche werden geladen...'
  }
}

export default function EnhancedDateTimeAndTableStep({
  language,
  onNext,
  onAvailabilityChange
}: EnhancedDateTimeAndTableStepProps) {
  const t = content[language]
  const form = useFormContext()

  // Refs
  const tableSelectorRef = useRef<HTMLDivElement>(null)

  // Estados locales
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [partySize, setPartySize] = useState<number>(2)
  const [childrenCount, setChildrenCount] = useState<number>(0)
  const [hasChildren, setHasChildren] = useState<boolean>(false)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [activeZones, setActiveZones] = useState<Zone[]>([])
  const [loadingZones, setLoadingZones] = useState(true)
  const [availabilityResults, setAvailabilityResults] = useState<AvailabilityData | null>(null)
  const [selectedTables, setSelectedTables] = useState<any[]>([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // Hooks
  const { checkAvailability, createReservation } = useReservations()
  const { isGoodWeather } = useWeatherForecast({ lang: language })
  const { maxPartySize } = useBusinessHours()
  const { validateFinalSelection } = useCapacityValidation()

  // Cargar zonas activas
  useEffect(() => {
    const fetchActiveZones = async () => {
      try {
        const response = await fetch('/api/zones/active')
        if (!response.ok) throw new Error('Failed to fetch zones')

        const data = await response.json()
        if (data.success && data.data && data.data.zones) {
          setActiveZones(data.data.zones)
        }
      } catch (error) {
        console.error('Error fetching zones:', error)
        toast.error(language === 'es' ?
          'Error al cargar zonas. Intenta recargar la página.' :
          'Error loading zones. Try reloading the page.'
        )
        setActiveZones([])
      } finally {
        setLoadingZones(false)
      }
    }

    fetchActiveZones()
  }, [])

  // Auto-scroll inteligente al selector de mesas cuando hay disponibilidad
  useEffect(() => {
    if (availabilityResults && availabilityResults.recommendations && availabilityResults.recommendations.length > 0) {
      setTimeout(() => {
        tableSelectorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 300)
    }
  }, [availabilityResults])

  // Manejar selección de fecha desde el panel del tiempo
  const handleDateSelectFromWeather = useCallback((date: Date) => {
    setSelectedDate(date)
    // Limpiar selección de hora al cambiar fecha
    setSelectedTime(null)
  }, [])

  // Manejar selección de fecha desde el calendario
  const handleDateSelectFromCalendar = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    // Verificar disponibilidad automáticamente si ya hay hora seleccionada
    if (selectedTime) {
      handleCheckAvailability(date, selectedTime, partySize, selectedZone)
    }
  }, [selectedTime, partySize, selectedZone])

  // Manejar selección de hora
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time)
    // Verificar disponibilidad automáticamente si ya hay fecha seleccionada
    if (selectedDate) {
      handleCheckAvailability(selectedDate, time, partySize, selectedZone)
    }
  }, [selectedDate, partySize, selectedZone])

  // Verificar disponibilidad
  const handleCheckAvailability = useCallback(async (
    date: Date | null = selectedDate,
    time: string | null = selectedTime,
    size: number = partySize,
    zone: string | null = selectedZone
  ) => {
    if (!date || !time) {
      toast.error(language === 'es' ?
        'Por favor selecciona fecha y hora' :
        'Please select date and time'
      )
      return
    }

    setIsCheckingAvailability(true)

    try {
      // Use createSafeDateTime to prevent timezone shift
      const dateTime = createSafeDateTime(date, time)

      const availability = await checkAvailability(
        dateTime,
        size,
        zone || undefined
      )

      if (availability) {
        setAvailabilityResults(availability)
        onAvailabilityChange?.(availability)
        // Usuario selecciona manualmente - NO preseleccionar
        setSelectedTables([])
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
  }, [selectedDate, selectedTime, partySize, selectedZone, checkAvailability, language])

  // Manejar cambio de tamaño del grupo
  const handlePartySizeChange = (increment: number) => {
    const newSize = Math.max(1, Math.min(maxPartySize || 10, partySize + increment))
    setPartySize(newSize)

    // Reset children count if it exceeds new party size
    if (childrenCount >= newSize) {
      setChildrenCount(Math.max(0, newSize - 1))
    }

    // Limpiar disponibilidad al cambiar tamaño
    setAvailabilityResults(null)
  }

  // Manejar cambio de niños
  const handleChildrenCountChange = (increment: number) => {
    const newCount = Math.max(0, Math.min(partySize - 1, childrenCount + increment))
    setChildrenCount(newCount)
  }

  // Manejar selección de zona
  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(selectedZone === zoneId ? null : zoneId)
    // Re-verificar disponibilidad si ya hay fecha y hora
    if (selectedDate && selectedTime) {
      handleCheckAvailability(selectedDate, selectedTime, partySize, zoneId)
    }
  }

  // Continuar al siguiente paso
  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !availabilityResults || selectedTables.length === 0) {
      toast.error(language === 'es' ?
        'Por favor completa todos los campos requeridos' :
        language === 'en' ?
        'Please complete all required fields' :
        'Bitte füllen Sie alle erforderlichen Felder aus'
      )
      return
    }

    // NUEVA VALIDACIÓN: Validar capacidad final con el hook
    const tablesForValidation = selectedTables.map(t => ({
      id: t.id,
      capacity: t.capacity
    }))

    const validation = validateFinalSelection(tablesForValidation, partySize)

    if (!validation.canSelect) {
      toast.error(validation.reason || (
        language === 'es' ? 'Error de validación de capacidad' :
        language === 'en' ? 'Capacity validation error' :
        'Kapazitätsvalidierungsfehler'
      ))
      return
    }

    // Use createSafeDateTime to prevent timezone shift
    const dateTime = createSafeDateTime(selectedDate, selectedTime)

    form.setValue('dateTime', dateTime)
    form.setValue('tableIds', selectedTables.map(t => t.id))
    form.setValue('partySize', partySize)
    form.setValue('childrenCount', childrenCount > 0 ? childrenCount : undefined)
    form.setValue('location', selectedZone || '')

    onNext()
  }

  // Obtener calidad del clima para la fecha seleccionada
  const weatherQuality = selectedDate ? isGoodWeather(selectedDate) : undefined

  // Memorize transformed tables array to prevent infinite re-renders
  const transformedTables = useMemo(() => {
    if (!availabilityResults?.recommendations) return []
    return availabilityResults.recommendations.map(t => ({
      id: t.id,
      number: t.number.toString(),
      capacity: t.capacity,
      location: t.location,
      status: 'available' as const,
      available: true
    }))
  }, [availabilityResults])

  // Memorize selection change handler
  const handleTableSelectionChange = useCallback((newIds: string[]) => {
    if (!availabilityResults?.recommendations) return
    const newSelection = availabilityResults.recommendations.filter(t => newIds.includes(t.id))
    setSelectedTables(newSelection)
  }, [availabilityResults])

  // Memorize selected table IDs array
  const selectedTableIds = useMemo(() => {
    return selectedTables.map(t => t.id)
  }, [selectedTables])

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

        {/* Selector de personas y niños - MEJORADO */}
        <Card>
          <CardContent className="p-4 md:p-5 lg:p-6">
            <div className="space-y-4">
              {/* Número total de personas */}
              <div>
                <Label className="text-sm md:text-base font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  {t.partySizeLabel}
                </Label>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePartySizeChange(-1)}
                    disabled={partySize <= 1}
                    className="h-10 w-10 md:h-12 md:w-12"
                  >
                    <Minus className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <div className="min-w-[100px] md:min-w-[120px] text-center bg-muted rounded-lg p-3">
                    <span className="text-2xl md:text-3xl font-bold">{partySize}</span>
                    <span className="block text-xs md:text-sm text-muted-foreground mt-1">
                      {partySize === 1 ? t.person : t.people}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePartySizeChange(1)}
                    disabled={partySize >= (maxPartySize || 10)}
                    className="h-10 w-10 md:h-12 md:w-12"
                  >
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>

              {/* Checkbox para indicar si hay niños */}
              {partySize > 1 && (
                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      id="hasChildren"
                      checked={hasChildren}
                      onCheckedChange={(checked) => {
                        setHasChildren(!!checked)
                        if (!checked) setChildrenCount(0)
                      }}
                      className="mt-1 h-5 w-5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="hasChildren"
                        className="text-sm md:text-base font-medium cursor-pointer flex items-center gap-2"
                      >
                        <Baby className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                        {language === 'es' ? '¿Hay niños en la mesa?' :
                         language === 'en' ? 'Are there children at the table?' :
                         'Gibt es Kinder am Tisch?'}
                      </Label>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        {language === 'es' ? 'Hasta 8 años' :
                         language === 'en' ? 'Up to 8 years old' :
                         'Bis 8 Jahre'}
                      </p>
                    </div>
                  </div>

                  {/* Selector de cantidad de niños - aparece al marcar checkbox */}
                  {hasChildren && (
                    <div className="mt-4 p-4 bg-accent/5 border-2 border-accent/20 rounded-lg animate-in slide-in-from-top-2">
                      <div className="flex flex-col gap-3">
                        <Label className="text-sm md:text-base font-medium">
                          {language === 'es' ? '¿Cuántos niños?' :
                           language === 'en' ? 'How many children?' :
                           'Wie viele Kinder?'}
                        </Label>
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleChildrenCountChange(-1)}
                            disabled={childrenCount === 0}
                            className="h-10 w-10 md:h-12 md:w-12"
                          >
                            <Minus className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                          <div className="min-w-[100px] md:min-w-[120px] text-center bg-background rounded-lg p-3 border-2 border-accent">
                            <span className="text-2xl md:text-3xl font-bold text-accent">{childrenCount}</span>
                            <span className="block text-xs md:text-sm text-muted-foreground mt-1">
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
                            className="h-10 w-10 md:h-12 md:w-12"
                          >
                            <Plus className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                        </div>

                        {/* Nota IMPORTANTE en negrita */}
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs md:text-sm">
                              <span className="font-bold text-blue-900 dark:text-blue-100">
                                {language === 'es' ? 'Importante:' :
                                 language === 'en' ? 'Important:' :
                                 'Wichtig:'}
                              </span>{' '}
                              <span className="text-blue-800 dark:text-blue-200">
                                {language === 'es' ? 'Los niños se cuentan dentro del total de personas.' :
                                 language === 'en' ? 'Children are counted within the total number of people.' :
                                 'Kinder werden zur Gesamtzahl der Personen gezählt.'}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Desglose visual con mejor contraste */}
                        {childrenCount > 0 && (
                          <div className="mt-2 p-3 bg-background border-2 border-accent/30 rounded-md text-center">
                            <p className="text-sm md:text-base font-semibold text-foreground">
                              {language === 'es' ? `${partySize - childrenCount} adulto${partySize - childrenCount !== 1 ? 's' : ''} + ${childrenCount} niño${childrenCount !== 1 ? 's' : ''}` :
                               language === 'en' ? `${partySize - childrenCount} adult${partySize - childrenCount !== 1 ? 's' : ''} + ${childrenCount} child${childrenCount !== 1 ? 'ren' : ''}` :
                               `${partySize - childrenCount} Erwachsene${partySize - childrenCount !== 1 ? '' : 'r'} + ${childrenCount} Kind${childrenCount !== 1 ? 'er' : ''}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {language === 'es' ? `= ${partySize} personas en total` :
                               language === 'en' ? `= ${partySize} people in total` :
                               `= ${partySize} Personen insgesamt`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selector de hora con diferenciación */}
        {selectedDate && (
          <TimeSlotSelector
            language={language}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
            partySize={partySize}
            isLoading={isCheckingAvailability}
          />
        )}

        {/* Selector de zona (opcional) */}
        {selectedDate && selectedTime && (
          <Card>
            <CardHeader className="p-3 md:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                {t.zoneTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {activeZones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneSelect(zone.id)}
                    className={cn(
                      "p-2 md:p-3 rounded-lg border-2 transition-all",
                      "hover:border-primary hover:shadow-md",
                      selectedZone === zone.id ?
                        "border-primary bg-primary/5" :
                        "border-border bg-card"
                    )}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm md:text-base">{zone.name[language]}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                        {zone.description[language]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selector manual de mesas */}
        {availabilityResults &&
         availabilityResults.recommendations &&
         availabilityResults.recommendations.length > 1 && (
          <Card ref={tableSelectorRef} className="mt-4 md:mt-6">
            <CardHeader className="p-3 md:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                {language === 'es' ? 'Personaliza tu selección de mesas' :
                 language === 'en' ? 'Customize your table selection' :
                 'Passen Sie Ihre Tischauswahl an'}
              </CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">
                {language === 'es' ? 'Selecciona las mesas que prefieras para tu reserva.' :
                 language === 'en' ? 'Select the tables you prefer for your reservation.' :
                 'Wählen Sie die Tische für Ihre Reservierung.'}
              </p>
            </CardHeader>
            <CardContent className="p-3 md:p-4 lg:p-6">
              <MultiTableSelector
                tables={transformedTables}
                selectedTableIds={selectedTableIds}
                onSelectionChange={handleTableSelectionChange}
                partySize={partySize}
                maxSelections={5}
              />
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        {selectedDate && selectedTime && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
            {!availabilityResults ? (
              <Button
                onClick={() => handleCheckAvailability()}
                disabled={isCheckingAvailability}
                className="w-full sm:w-auto h-10 md:h-11"
                size="default"
              >
                {isCheckingAvailability && (
                  <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                )}
                <span className="text-sm md:text-base">
                  {isCheckingAvailability ? t.checking : t.checkAvailability}
                </span>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAvailabilityResults(null)
                    setSelectedTables([])
                  }}
                  className="w-full sm:w-auto h-10 md:h-11"
                  size="default"
                >
                  <span className="text-sm md:text-base">
                    {language === 'es' ? 'Cambiar selección' :
                     language === 'en' ? 'Change selection' :
                     'Auswahl ändern'}
                  </span>
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={selectedTables.length === 0}
                  className="w-full sm:w-auto h-10 md:h-11"
                  size="default"
                >
                  <span className="text-sm md:text-base">
                    {language === 'es' ? 'Continuar' :
                     language === 'en' ? 'Continue' :
                     'Weiter'}
                  </span>
                  <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}