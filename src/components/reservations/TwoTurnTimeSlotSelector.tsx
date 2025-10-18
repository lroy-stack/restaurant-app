'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
}

export function TwoTurnTimeSlotSelector({
  services,
  selectedTime,
  onSelectTime,
  language = 'es'
}: TwoTurnTimeSlotSelectorProps) {

  const t = {
    es: {
      available: 'disponibles',
      full: 'completo'
    },
    en: {
      available: 'available',
      full: 'full'
    },
    de: {
      available: 'verfügbar',
      full: 'voll'
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {services.map((service, serviceIdx) => (
        <div key={service.type} className="space-y-4 md:space-y-6">
          {/* Service Header */}
          <div className="px-1">
            <h3 className="text-lg md:text-xl font-bold text-foreground">
              {service.name[language]}
            </h3>
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
                            !slot.available && 'bg-muted/60 opacity-50 cursor-not-allowed line-through decoration-2'
                          )}
                        >
                          <span className={cn('text-sm md:text-base font-medium whitespace-nowrap', !slot.available && 'text-muted-foreground')}>{slot.time}</span>
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
                        !slot.available && 'bg-muted/60 opacity-50 cursor-not-allowed line-through decoration-2'
                      )}
                    >
                      <span className={cn('text-sm md:text-base font-medium whitespace-nowrap', !slot.available && 'text-muted-foreground')}>{slot.time}</span>
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
      ))}
    </div>
  )
}
