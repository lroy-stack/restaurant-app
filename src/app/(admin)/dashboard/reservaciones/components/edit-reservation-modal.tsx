'use client'

import { useState, useEffect } from 'react'
import type { Reservation } from '@/types/database'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Save,
  X,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useTables } from '@/hooks/useTables'
import { getAvailableTimeSlots } from '@/lib/business-hours-client'

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  specialRequests?: string
  hasPreOrder: boolean
  tableId: string
  tables: {
    id: string
    number: string
    capacity: number
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  } | null
  createdAt: string
  updatedAt: string
}

interface EditReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onSave: (id: string, data: Partial<Reservation>) => Promise<boolean>
}

interface EditFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  tableId: string
  status: string
  specialRequests: string
}

const statusOptions = [
  { value: 'PENDING', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  { value: 'SEATED', label: 'En Mesa', color: 'bg-blue-100 text-blue-800' },
  { value: 'COMPLETED', label: 'Completada', color: 'bg-gray-100 text-gray-800' },
  { value: 'CANCELLED', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  { value: 'NO_SHOW', label: 'No Show', color: 'bg-orange-100 text-orange-800' }
]

const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

export function EditReservationModal({ isOpen, onClose, reservation, onSave }: EditReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const { tables } = useTables()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EditFormData>()

  // Initialize form when reservation changes
  useEffect(() => {
    if (reservation) {
      // FIXED: Properly extract time from timestamp
      const reservationDateTime = new Date(reservation.time)
      const reservationDate = new Date(reservation.date)

      reset({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        partySize: reservation.partySize,
        date: reservationDate.toISOString().split('T')[0],
        time: reservationDateTime.toTimeString().slice(0, 5), // FIXED: Use time field directly
        tableId: reservation.tableId,
        status: reservation.status,
        specialRequests: reservation.specialRequests || ''
      })
    }
  }, [reservation, reset])

  // Load available time slots when date changes
  const watchedDate = watch('date')
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!watchedDate) {
        setTimeSlots([])
        return
      }

      setLoadingTimeSlots(true)
      try {
        const availableSlots = await getAvailableTimeSlots(watchedDate)
        const timeStrings = availableSlots
          .filter(slot => slot.available && slot.time)
          .map(slot => slot.time)

        setTimeSlots(timeStrings)
        console.log(`🕐 Available time slots for ${watchedDate}:`, timeStrings)
      } catch (error) {
        console.error('❌ Error loading time slots:', error)
        // Fallback to standard evening slots
        const fallbackSlots = ['18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45',
                              '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45',
                              '22:00', '22:15', '22:30', '22:45']
        setTimeSlots(fallbackSlots)
      } finally {
        setLoadingTimeSlots(false)
      }
    }

    loadTimeSlots()
  }, [watchedDate])

  const watchedStatus = watch('status')
  const currentStatus = statusOptions.find(s => s.value === watchedStatus)

  // Filter available tables by party size
  const availableTables = tables.filter(table =>
    table.isActive && table.capacity >= (watch('partySize') || 1)
  ).sort((a, b) => {
    const aNum = parseInt(a.number.replace(/[^0-9]/g, ''))
    const bNum = parseInt(b.number.replace(/[^0-9]/g, ''))
    return aNum - bNum
  })

  const onSubmit = async (data: EditFormData) => {
    if (!reservation) return

    setIsLoading(true)
    try {
      // Create the datetime string
      const dateTime = new Date(`${data.date}T${data.time}:00`).toISOString()

      const updateData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        partySize: data.partySize,
        date: dateTime,
        time: dateTime,
        tableId: data.tableId,
        status: data.status,
        specialRequests: data.specialRequests || null
      }

      const success = await onSave(reservation.id, updateData)
      if (success) {
        toast.success('Reservación actualizada exitosamente')
        onClose()
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      toast.error('Error al actualizar la reservación')
    } finally {
      setIsLoading(false)
    }
  }

  if (!reservation) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Editar Reservación #{reservation.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Estado Actual:</span>
            {currentStatus && (
              <Badge className={currentStatus.color}>
                {currentStatus.label}
              </Badge>
            )}
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Información del Cliente</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre Completo *</Label>
                <Input
                  id="customerName"
                  {...register('customerName', { required: 'El nombre es requerido' })}
                  className={errors.customerName ? 'border-red-300' : ''}
                />
                {errors.customerName && (
                  <span className="text-sm text-red-600">{errors.customerName.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register('customerEmail', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email inválido'
                    }
                  })}
                  className={errors.customerEmail ? 'border-red-300' : ''}
                />
                {errors.customerEmail && (
                  <span className="text-sm text-red-600">{errors.customerEmail.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Teléfono *</Label>
                <Input
                  id="customerPhone"
                  {...register('customerPhone', { required: 'El teléfono es requerido' })}
                  className={errors.customerPhone ? 'border-red-300' : ''}
                />
                {errors.customerPhone && (
                  <span className="text-sm text-red-600">{errors.customerPhone.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="partySize">Número de Personas *</Label>
                <Input
                  id="partySize"
                  type="number"
                  min="1"
                  max="12"
                  {...register('partySize', {
                    required: 'El número de personas es requerido',
                    min: { value: 1, message: 'Mínimo 1 persona' },
                    max: { value: 12, message: 'Máximo 12 personas' },
                    valueAsNumber: true
                  })}
                  className={errors.partySize ? 'border-red-300' : ''}
                />
                {errors.partySize && (
                  <span className="text-sm text-red-600">{errors.partySize.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Detalles de la Reservación</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'La fecha es requerida' })}
                  className={errors.date ? 'border-red-300' : ''}
                />
                {errors.date && (
                  <span className="text-sm text-red-600">{errors.date.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <Select
                  value={watch('time')}
                  onValueChange={(value) => setValue('time', value)}
                  disabled={loadingTimeSlots || timeSlots.length === 0}
                >
                  <SelectTrigger className={errors.time ? 'border-red-300' : ''}>
                    <SelectValue placeholder={loadingTimeSlots ? 'Cargando horarios...' : 'Seleccionar hora'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {loadingTimeSlots ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando horarios disponibles...
                        </div>
                      </SelectItem>
                    ) : timeSlots.length === 0 ? (
                      <SelectItem value="no-slots" disabled>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          No hay horarios disponibles
                        </div>
                      </SelectItem>
                    ) : (
                      timeSlots.map((timeSlot) => (
                        <SelectItem key={timeSlot} value={timeSlot}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {timeSlot}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.time && (
                  <span className="text-sm text-red-600">{errors.time.message}</span>
                )}
                {!loadingTimeSlots && timeSlots.length === 0 && (
                  <p className="text-sm text-orange-600">No hay horarios disponibles para esta fecha</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableId">Mesa *</Label>
                <Select
                  value={watch('tableId')}
                  onValueChange={(value) => setValue('tableId', value)}
                >
                  <SelectTrigger className={errors.tableId ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {availableTables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Mesa {table.number}</span>
                          <span className="text-sm text-gray-500">
                            ({table.capacity} personas)
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {locationLabels[table.location]}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tableId && (
                  <span className="text-sm text-red-600">La mesa es requerida</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.color}`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
              <Textarea
                id="specialRequests"
                placeholder="Ej: Mesa junto a la ventana, celebración especial..."
                rows={3}
                {...register('specialRequests')}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}