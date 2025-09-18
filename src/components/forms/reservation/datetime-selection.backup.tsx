'use client'

import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Clock, Users, RefreshCw, AlertTriangle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useBusinessHours } from '@/hooks/useBusinessHours'

interface DateTimeSelectionProps {
  dateTime: string
  partySize: number
  onDateTimeChange: (value: string) => void
  onPartySizeChange: (value: number) => void
  onAvailabilityCheck: () => Promise<void>
}

export function DateTimeSelection({
  dateTime,
  partySize,
  onDateTimeChange,
  onPartySizeChange,
  onAvailabilityCheck
}: DateTimeSelectionProps) {
  // Parse current datetime for display
  const currentDate = dateTime ? dateTime.split('T')[0] : ''
  const currentTime = dateTime ? dateTime.split('T')[1]?.slice(0, 5) : ''

  // Use dynamic business hours instead of hardcoded
  const { timeSlots, isLoading } = useBusinessHours(currentDate)

  // Generate date options (today + next 30 days)
  const dateOptions = []
  for (let i = 0; i <= 30; i++) {
    const date = addDays(new Date(), i)
    dateOptions.push({
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEEE, dd MMMM yyyy', { locale: es }),
      disabled: i === 0 // Disable today by default for restaurant policy
    })
  }

  // Party size options
  const partySizeOptions = Array.from({ length: 20 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'persona' : 'personas'}`
  }))

  const handleDateTimeChange = async () => {
    if (dateTime && partySize) {
      try {
        await onAvailabilityCheck()
        toast.success('Disponibilidad verificada')
      } catch (error) {
        toast.error('Error verificando disponibilidad')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Fecha y Hora de la Reserva
          </h3>
          <p className="text-sm text-muted-foreground">
            Selecciona cuándo y para cuántas personas
          </p>
        </div>

        {dateTime && partySize && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAvailabilityCheck}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar Disponibilidad
          </Button>
        )}
      </div>

      {/* Date and Time Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Date Selection */}
        <div>
          <Label htmlFor="date">Fecha *</Label>
          <Select
            value={currentDate}
            onValueChange={(date) => {
              const time = currentTime || '19:00'
              onDateTimeChange(`${date}T${time}`)
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecciona una fecha" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="max-h-48 overflow-y-auto">
                {dateOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Las reservas se pueden hacer con 24h de antelación
          </p>
        </div>

        {/* Time Selection */}
        <div>
          <Label htmlFor="time">Hora *</Label>
          <Select
            value={currentTime}
            onValueChange={(time) => {
              const date = currentDate || format(new Date(), 'yyyy-MM-dd')
              onDateTimeChange(`${date}T${time}`)
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecciona una hora" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="max-h-48 overflow-y-auto">
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Cargando horarios...
                  </SelectItem>
                ) : (
                  timeSlots.map((slot) => (
                    <SelectItem
                      key={slot.value}
                      value={slot.value}
                      disabled={slot.disabled}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {slot.label}
                      </div>
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Horario de servicio: 12:00 - 23:30
          </p>
        </div>

        {/* Party Size Selection */}
        <div>
          <Label htmlFor="partySize">Número de Personas *</Label>
          <Select
            value={partySize.toString()}
            onValueChange={(value) => onPartySizeChange(parseInt(value))}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="¿Cuántos sois?" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="max-h-48 overflow-y-auto">
                {partySizeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Máximo 20 personas por reserva
          </p>
        </div>
      </div>

      {/* Current Selection Summary */}
      {dateTime && partySize && (
        <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Resumen de la Reserva:
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(dateTime), 'EEEE, dd MMMM', { locale: es })}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(dateTime), 'HH:mm')}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {partySize} {partySize === 1 ? 'persona' : 'personas'}
                  </Badge>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDateTimeChange}
                className="text-primary hover:text-primary/80"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Hours Notice */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">
                Información Importante
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Horario de servicio: 12:00 - 23:30 todos los días</li>
                <li>• Reservas con mínimo 24 horas de antelación</li>
                <li>• Grupos de más de 8 personas requieren confirmación telefónica</li>
                <li>• Mesa reservada por 2.5 horas aproximadamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}