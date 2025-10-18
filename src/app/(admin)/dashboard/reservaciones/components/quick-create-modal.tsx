'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Clock, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickCreateModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    tableId?: string
    dateTime?: Date
    partySize?: number
  }
  onSuccess?: (reservation: any) => void
}

export function QuickCreateModal({
  isOpen,
  onClose,
  initialData,
  onSuccess
}: QuickCreateModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: initialData?.partySize || 2,
    date: initialData?.dateTime ? format(initialData.dateTime, 'yyyy-MM-dd') : '',
    time: '',
    tableId: initialData?.tableId || '',
    specialRequests: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Get business hours and time slots
  const {
    timeSlots,
    lunchSlots,
    dinnerSlots,
    closedDays,
    minAdvanceMinutes,
    isDateDisabled,
    getDisabledReason,
    hasLunchService,
    hasDinnerService
  } = useBusinessHours(formData.date, true) // Admin: skip advance check

  // Update form when initialData changes
  useEffect(() => {
    if (initialData?.dateTime) {
      const dateTime = initialData.dateTime
      const dateStr = format(dateTime, 'yyyy-MM-dd')
      const timeStr = format(dateTime, 'HH:mm')

      setFormData(prev => ({
        ...prev,
        date: dateStr,
        time: timeStr === '00:00' ? '' : timeStr,
        partySize: initialData.partySize || prev.partySize,
        tableId: initialData.tableId || prev.tableId
      }))
    }
  }, [initialData])

  // Reset time when date changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, time: '' }))
  }, [formData.date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!formData.date) {
      toast.error('Selecciona una fecha')
      return
    }

    if (!formData.time) {
      toast.error('Selecciona un horario')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.customerName.split(' ')[0],
          lastName: formData.customerName.split(' ').slice(1).join(' ') || '',
          phone: formData.customerPhone,
          email: formData.customerEmail || '',
          partySize: formData.partySize,
          date: formData.date,
          time: formData.time,
          tableIds: formData.tableId ? [formData.tableId] : [],
          specialRequests: formData.specialRequests,
          dataProcessingConsent: true,
          emailConsent: true,
          marketingConsent: false,
          preferredLanguage: 'ES',
          source: 'admin'
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Reserva creada exitosamente')
        onSuccess?.(data.reservation)
        onClose()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al crear reserva')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Error de red al crear reserva')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Crear Reserva Rápida</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Completa los datos del cliente y selecciona fecha/hora
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection with CustomCalendar */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Fecha *
            </Label>
            <CustomCalendar
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              closedDays={closedDays}
              minAdvanceMinutes={0}
              isDateDisabled={isDateDisabled}
              getDisabledReason={getDisabledReason}
              allowPastDates={false}
              placeholder="Seleccionar fecha"
            />
          </div>

          {/* Time Selection with Slots */}
          {formData.date && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora *
              </Label>

              {/* Lunch Slots */}
              {lunchSlots.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <h4 className="font-medium text-sm text-amber-800 dark:text-amber-200">☀️ Almuerzo</h4>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {lunchSlots.map(slot => (
                      <Button
                        key={`lunch-${slot.time}`}
                        type="button"
                        variant={formData.time === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setFormData(prev => ({...prev, time: slot.time}))}
                        className={cn(
                          "h-8 text-xs",
                          formData.time === slot.time && "bg-amber-600 hover:bg-amber-700",
                          !slot.available && "opacity-50 cursor-not-allowed"
                        )}
                        title={!slot.available ? slot.reason : undefined}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dinner Slots */}
              {dinnerSlots.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200">🌙 Cena</h4>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {dinnerSlots.map(slot => (
                      <Button
                        key={`dinner-${slot.time}`}
                        type="button"
                        variant={formData.time === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setFormData(prev => ({...prev, time: slot.time}))}
                        className={cn(
                          "h-8 text-xs",
                          formData.time === slot.time && "bg-blue-600 hover:bg-blue-700",
                          !slot.available && "opacity-50 cursor-not-allowed"
                        )}
                        title={!slot.available ? slot.reason : undefined}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* No slots available */}
              {lunchSlots.length === 0 && dinnerSlots.length === 0 && (
                <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay horarios disponibles para esta fecha</p>
                </div>
              )}
            </div>
          )}

          {initialData?.tableId && (
            <div className="text-sm text-muted-foreground flex items-center gap-2 p-3 bg-primary/10 rounded">
              <span>✓ Mesa pre-asignada</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="customerName">Nombre Completo *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                placeholder="Juan Pérez"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Teléfono *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
                placeholder="+34 600 123 456"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="opcional"
                className="h-9"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="partySize">Personas *</Label>
              <Select
                value={formData.partySize.toString()}
                onValueChange={(value) => setFormData({ ...formData, partySize: parseInt(value) })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} persona{num > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
              <Input
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Alergias, preferencias..."
                className="h-9"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
