'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

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

interface TwoTurnTimeSlotSelectorProps {
  services: Service[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
  language?: 'es' | 'en' | 'de'
  selectedDate: Date | null
}

export function TwoTurnTimeSlotSelector({
  services,
  selectedTime,
  onSelectTime,
  language = 'es',
  selectedDate
}: TwoTurnTimeSlotSelectorProps) {

  const t = {
    es: {
      available: 'disponibles',
      full: 'completo',
      lastHours: 'Últimas horas disponibles',
      hurry: 'Reserva pronto'
    },
    en: {
      available: 'available',
      full: 'full',
      lastHours: 'Last hours available',
      hurry: 'Book soon'
    },
    de: {
      available: 'verfügbar',
      full: 'voll',
      lastHours: 'Letzte Stunden verfügbar',
      hurry: 'Bald buchen'
    }
  }

  // Filter out past services or services with no available slots
  const isServicePassed = (service: Service): boolean => {
    // Check if service has ANY available slot
    const hasAvailableSlots = service.turns.some(turn =>
      turn.slots.some(slot => slot.available)
    )

    // If no available slots, hide service
    if (!hasAvailableSlots) return true

    // Si no hay fecha seleccionada, no filtrar por tiempo
    if (!selectedDate) return false

    const now = new Date()
    const isToday = selectedDate.toDateString() === now.toDateString()

    // Si es fecha futura, NUNCA ocultar el servicio
    if (!isToday) return false

    // Solo para HOY: verificar si el servicio ya pasó
    const lastTurn = service.turns[service.turns.length - 1]
    if (!lastTurn || !lastTurn.slots || lastTurn.slots.length === 0) return false

    const lastSlot = lastTurn.slots[lastTurn.slots.length - 1]
    if (!lastSlot) return false

    // Parse last slot time usando fecha seleccionada
    const [hours, minutes] = lastSlot.time.split(':').map(Number)
    const lastSlotTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    )

    return now > lastSlotTime
  }

  // Check if service is ending soon (within 2 hours)
  const isServiceEndingSoon = (service: Service): boolean => {
    // Solo aplica para HOY
    if (!selectedDate) return false

    const now = new Date()
    const isToday = selectedDate.toDateString() === now.toDateString()

    // Si no es hoy, no mostrar advertencia
    if (!isToday) return false

    const lastTurn = service.turns[service.turns.length - 1]
    if (!lastTurn || !lastTurn.slots || lastTurn.slots.length === 0) return false

    const lastSlot = lastTurn.slots[lastTurn.slots.length - 1]
    if (!lastSlot) return false

    const [hours, minutes] = lastSlot.time.split(':').map(Number)
    const lastSlotTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    )

    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000))

    return lastSlotTime <= twoHoursFromNow && lastSlotTime > now
  }

  const activeServices = services.filter(service => !isServicePassed(service))

  return (
    <div className="space-y-6 md:space-y-8">
      {activeServices.map((service, serviceIdx) => {
        const endingSoon = service.type === 'dinner' && isServiceEndingSoon(service)

        return (
        <div key={service.type} className="space-y-4 md:space-y-6">
          {/* Service Header */}
          <div className="px-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                {service.name[language]}
              </h3>
              {endingSoon && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-700 bg-amber-50">
                  ⏰ {t[language].lastHours}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{service.period}</p>
          </div>

          {/* Lunch: Single card with turns together */}
          {service.type === 'lunch' && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader className="p-4 md:p-5">
                <CardTitle className="text-base md:text-lg">{service.name[language]}</CardTitle>
                <CardDescription className="text-xs md:text-sm">{service.period}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-5 space-y-4">
                {service.turns.map((turn, turnIdx) => (
                  <div key={turnIdx}>
                    {/* Light separator and label */}
                    {turnIdx > 0 && <div className="border-t border-border/50 mb-3" />}
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">{turn.period}</p>
                      <Badge
                        variant={turn.availableCount > 0 ? 'outline' : 'destructive'}
                        className="text-xs"
                      >
                        {turn.availableCount} {t[language].available}
                      </Badge>
                    </div>

                    {/* Slots */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {turn.slots.map(slot => (
                        <Button
                          key={slot.time}
                          disabled={!slot.available}
                          variant={selectedTime === slot.time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => slot.available && onSelectTime(slot.time)}
                          className={cn(
                            'relative h-10 md:h-11 min-w-[70px] px-2',
                            !slot.available && 'bg-muted/60 opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span className={cn('text-sm md:text-base font-medium whitespace-nowrap', !slot.available && 'text-muted-foreground line-through decoration-2')}>{slot.time}</span>
                          {!slot.available && (
                            <Badge
                              variant="outline"
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-3.5 px-1 text-[8px] md:text-[9px] border-muted-foreground/30 bg-muted/80"
                            >
                              {t[language].full}
                            </Badge>
                          )}
                          {slot.available && slot.utilizationPercent > 60 && (
                            <Badge
                              variant={slot.utilizationPercent > 80 ? 'destructive' : 'secondary'}
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]"
                            >
                              {slot.utilizationPercent}%
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Dinner: Separate cards for each turn */}
          {service.type === 'dinner' && service.turns.map((turn, turnIdx) => (
            <Card
              key={turnIdx}
              className={cn(
                'border-2',
                turnIdx === 0 ? 'border-primary/30 bg-primary/5' : 'border-border'
              )}
            >
              <CardHeader className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base md:text-lg">{turn.name[language]}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">{turn.period}</CardDescription>
                  </div>
                  <Badge
                    variant={turn.availableCount > 0 ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {turn.availableCount} {t[language].available}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-5">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {turn.slots.map(slot => (
                    <Button
                      key={slot.time}
                      disabled={!slot.available}
                      variant={selectedTime === slot.time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => slot.available && onSelectTime(slot.time)}
                      className={cn(
                        'relative h-10 md:h-11 min-w-[70px] px-2',
                        !slot.available && 'bg-muted/60 opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span className={cn('text-sm md:text-base font-medium whitespace-nowrap', !slot.available && 'text-muted-foreground line-through decoration-2')}>{slot.time}</span>
                      {!slot.available && (
                        <Badge
                          variant="outline"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-3.5 px-1 text-[8px] md:text-[9px] border-muted-foreground/30 bg-muted/80"
                        >
                          {t[language].full}
                        </Badge>
                      )}
                      {slot.available && slot.utilizationPercent > 60 && (
                        <Badge
                          variant={slot.utilizationPercent > 80 ? 'destructive' : 'secondary'}
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]"
                        >
                          {slot.utilizationPercent}%
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )
      })}
    </div>
  )
}
