'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Loader2, Eye, Building, TreePine } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/validations/reservation-professional'
import { useBusinessHours } from '@/hooks/useBusinessHours'

interface ReservationStepOneProps {
  language: Language
  onNext: () => void
  onCheckAvailability: (date: string, time: string, partySize: number, preferredLocation?: string) => Promise<boolean>
  isCheckingAvailability: boolean
}

// Zone interface for dynamic data from API
interface Zone {
  id: string
  isActive: boolean
  name: { es: string; en: string; de: string }
  type: 'terrace' | 'indoor'
  description: { es: string; en: string; de: string }
}

const content = {
  es: {
    title: 'Fecha, Hora y Personas',
    subtitle: '¿Cuándo quieres visitarnos?',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    partySizeLabel: 'Número de personas',
    locationLabel: 'Zona preferida (opcional)',
    checkAvailability: 'Verificar Disponibilidad',
    checking: 'Verificando...',
    person: 'persona',
    people: 'personas'
  },
  en: {
    title: 'Date, Time and Party Size',
    subtitle: 'When would you like to visit us?',
    dateLabel: 'Date',
    timeLabel: 'Time', 
    partySizeLabel: 'Party size',
    locationLabel: 'Preferred area (optional)',
    checkAvailability: 'Check Availability',
    checking: 'Checking...',
    person: 'person',
    people: 'people'
  },
  de: {
    title: 'Datum, Zeit und Personenanzahl',
    subtitle: 'Wann möchten Sie uns besuchen?',
    dateLabel: 'Datum',
    timeLabel: 'Uhrzeit',
    partySizeLabel: 'Personenanzahl',
    locationLabel: 'Bevorzugter Bereich (optional)',
    checkAvailability: 'Verfügbarkeit prüfen', 
    checking: 'Wird geprüft...',
    person: 'Person',
    people: 'Personen'
  }
}

export default function ReservationStepOne({ 
  language, 
  onNext, 
  onCheckAvailability, 
  isCheckingAvailability 
}: ReservationStepOneProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [activeZones, setActiveZones] = useState<Zone[]>([])
  const [loadingZones, setLoadingZones] = useState(true)

  // Form context and watched values - MUST be declared before useEffect
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useFormContext()

  // Get dynamic maxPartySize from business hours
  const { maxPartySize } = useBusinessHours()

  const t = content[language]
  
  const watchedDate = watch('stepOne.date')
  const watchedTime = watch('stepOne.time')
  const watchedPartySize = watch('stepOne.partySize')
  const watchedLocation = watch('stepOne.preferredLocation')

  // Load available time slots using enterprise-grade business hours service
  useEffect(() => {
    const loadTimeSlots = async () => {
      setLoadingTimeSlots(true)
      try {
        // Import business hours service dynamically (client-side only)
        const { getAvailableTimeSlots } = await import('@/lib/business-hours-client')
        
        const selectedDate = watchedDate
        if (!selectedDate) {
          setTimeSlots([])
          return
        }
        
        // Get available slots using centralized business logic
        const availableSlots = await getAvailableTimeSlots(selectedDate)
        
        // Filter only available slots and extract time strings
        const timeStrings = availableSlots
          .filter(slot => slot.available && slot.time)
          .map(slot => slot.time)
        
        setTimeSlots(timeStrings)
        
        // Enterprise logging for monitoring
        console.log(`🕐 [${new Date().toISOString()}] Available slots for ${selectedDate}:`, {
          totalSlots: availableSlots.length,
          availableSlots: timeStrings.length,
          unavailableSlots: availableSlots.filter(s => !s.available).length,
          slots: timeStrings
        })
        
        // Log unavailable slots for debugging
        const unavailableSlots = availableSlots.filter(s => !s.available)
        if (unavailableSlots.length > 0) {
          console.log(`⚠️ Unavailable slots:`, unavailableSlots.map(s => ({
            time: s.time,
            reason: s.reason
          })))
        }
        
      } catch (error) {
        console.error('❌ [BUSINESS_HOURS_ERROR] Failed to load time slots:', error)
        
        // Enterprise fallback: Minimal safe slots
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const selectedDateObj = new Date(watchedDate + 'T00:00:00')
        const isToday = watchedDate === now.toISOString().split('T')[0]
        const dayOfWeek = selectedDateObj.getDay()
        
        // Conservative fallback: Restaurant industry standard
        if (dayOfWeek === 0) { // Sunday closed (corrected from Monday)
          setTimeSlots([])
        } else if (isToday) {
          // Only future slots with 30min buffer - 15min intervals
          const emergencySlots = ['18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45']
          const futureSlots = emergencySlots.filter(slot => {
            const [hour, minute] = slot.split(':').map(Number)
            const slotMinutes = hour * 60 + minute
            const currentMinutes = currentHour * 60 + currentMinute + 30
            return slotMinutes > currentMinutes
          })
          setTimeSlots(futureSlots)
        } else {
          // All business hours for future dates - 15min intervals
          setTimeSlots(['18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45'])
        }
        
        console.log(`🆘 [FALLBACK] Using emergency time slots for ${watchedDate}`)
      } finally {
        setLoadingTimeSlots(false)
      }
    }
    
    loadTimeSlots()
  }, [watchedDate]) // Re-run when date changes

  // Load active zones from API (dynamic, respects isActive in database)
  useEffect(() => {
    const loadActiveZones = async () => {
      setLoadingZones(true)
      try {
        const response = await fetch('/api/zones/active', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Always get fresh zone data
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success && result.data?.zones) {
          setActiveZones(result.data.zones)
          console.log(`✅ Loaded ${result.data.zones.length} active zones from API`)
        } else {
          console.error('❌ API returned no zones:', result)
          setActiveZones([])
        }
        
      } catch (error) {
        console.error('❌ Error loading active zones:', error)
        // Fallback: empty zones (fail safe - no zones shown if API fails)
        setActiveZones([])
      } finally {
        setLoadingZones(false)
      }
    }
    
    loadActiveZones()
  }, []) // Load once on component mount

  // Get today's date for minimum date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Get max date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
  }

  const handleCheckAvailability = async () => {
    // Validate step one fields first
    const isValid = await trigger('stepOne')
    if (!isValid) return

    const success = await onCheckAvailability(
      watchedDate,
      watchedTime,
      watchedPartySize,
      watchedLocation
    )

    if (success) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date">{t.dateLabel}</Label>
          <Input
            id="date"
            type="date"
            min={getTodayDate()}
            max={getMaxDate()}
            {...register('stepOne.date')}
            className="mt-2"
          />
          {errors.stepOne?.date && (
            <p className="text-sm text-red-600 mt-1">
              {errors.stepOne.date.message}
            </p>
          )}
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label>{t.timeLabel}</Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={watchedTime === time ? "default" : "outline"}
                size="sm"
                type="button"
                onClick={() => setValue('stepOne.time', time)}
                className="text-xs sm:text-sm h-10 sm:h-12 min-h-[40px] sm:min-h-[48px] font-medium touch-manipulation min-w-0 px-2 sm:px-3"
              >
                {time}
              </Button>
            ))}
          </div>
          {errors.stepOne?.time && (
            <p className="text-sm text-red-600 mt-1">
              {errors.stepOne.time.message}
            </p>
          )}
        </div>

        {/* Party Size */}
        <div className="space-y-2">
          <Label htmlFor="partySize">{t.partySizeLabel}</Label>
          <Select 
            value={watchedPartySize?.toString()} 
            onValueChange={(value) => setValue('stepOne.partySize', parseInt(value))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxPartySize }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? t.person : t.people}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.stepOne?.partySize && (
            <p className="text-sm text-red-600 mt-1">
              {errors.stepOne.partySize.message}
            </p>
          )}
        </div>

        {/* Location Preference */}
        <div className="space-y-3">
          <Label>{t.locationLabel}</Label>
          <RadioGroup 
            value={watchedLocation} 
            onValueChange={(value) => setValue('stepOne.preferredLocation', value)}
          >
            <div className="space-y-3">
              {loadingZones ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Cargando zonas disponibles...</span>
                </div>
              ) : activeZones.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No hay zonas disponibles en este momento.</p>
                </div>
              ) : (
                activeZones.map((zone) => (
                  <div key={zone.id} className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                    "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}>
                    <RadioGroupItem 
                      value={zone.id} 
                      id={zone.id} 
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={zone.id} className={cn(
                        "flex items-center gap-2 font-medium cursor-pointer"
                      )}>
                        {zone.type === 'terrace' ? 
                          <TreePine className="h-4 w-4 text-green-600" /> : 
                          <Building className="h-4 w-4 text-gray-600" />
                        }
                        <span>{zone.name[language]}</span>
                      </Label>
                      <p className="text-sm mt-1 text-gray-600">
                        {zone.description[language]}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </RadioGroup>
        </div>

        {/* Check Availability Button */}
        <Button
          onClick={handleCheckAvailability}
          disabled={!watchedDate || !watchedTime || !watchedPartySize || isCheckingAvailability}
          className="w-full"
          size="lg"
        >
          {isCheckingAvailability ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.checking}
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              {t.checkAvailability}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}