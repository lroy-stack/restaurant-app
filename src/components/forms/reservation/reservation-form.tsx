'use client'

import { useState, useMemo, FormEvent, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { CalendarIcon, Loader2, MapPin, Users, CheckCircle, Clock, TreePine, Crown, Building, Check, Utensils } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Hooks
import { useRealtimeCustomers } from '@/hooks/useRealtimeCustomers'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { useTables } from '@/hooks/useTables'
import { useReservations, type ReservationData, type AvailabilityData } from '@/hooks/useReservations'

// Components
import { CustomerSearchInput } from './customer-search-input'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isVip: boolean
  language: string
}

interface Table {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  isActive: boolean
  restaurantId: string
}

interface FormState {
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  partySize: number
  customerId?: string
  tableIds: string[] // ✅ FIXED: Soporte para múltiples mesas
  preferredLocation?: string // ✅ ADDED: Zona preferida para filtrar mesas
  specialRequests?: string
}

interface ReservationFormProps {
  mode?: 'create' | 'edit' // ✅ ADDED: Support mode prop from page.tsx
  preselectedCustomerId?: string
  onSuccess: () => void
  onCancel: () => void
  className?: string
}

const initialState: FormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  date: '',
  time: '',
  partySize: 2,
  customerId: undefined,
  tableIds: [], // ✅ FIXED: Array vacío para múltiples mesas
  preferredLocation: '', // ✅ ADDED: Sin zona preferida por defecto
  specialRequests: ''
}

// ✅ ADDED: Funciones utilitarias para mejorar UX
const getMaxTablesForPartySize = (partySize: number): number => {
  if (partySize <= 4) return 1 // Grupos pequeños: 1 mesa
  if (partySize <= 8) return 2 // Grupos medianos: máximo 2 mesas
  return 3 // Grupos grandes: máximo 3 mesas
}

const getLocationIcon = (locationKey: string) => {
  switch (locationKey) {
    case 'TERRACE_CAMPANARI':
      return <TreePine className="h-4 w-4 text-green-600" />
    case 'SALA_VIP':
      return <Crown className="h-4 w-4 text-yellow-600" />
    case 'SALA_PRINCIPAL':
      return <Building className="h-4 w-4 text-blue-600" />
    case 'TERRACE_JUSTICIA':
      return <TreePine className="h-4 w-4 text-green-600" />
    default:
      return <MapPin className="h-4 w-4 text-gray-600" />
  }
}

// ✅ DINÁMICO: Extraer zonas de las mesas disponibles desde la API
const getAvailableZones = (recommendations: any[]) => {
  if (!recommendations?.length) return []

  const uniqueZones = [...new Set(recommendations.map(table => table.location))]
  return uniqueZones.map(location => ({
    id: location,
    name: location.replace(/_/g, ' ').replace('TERRACE', 'Terraza').replace('SALA', 'Sala').replace('CAMPANARI', 'Campanari').replace('VIP', 'VIP').replace('PRINCIPAL', 'Principal').replace('JUSTICIA', 'Justicia'),
    icon: getLocationIcon(location)
  }))
}

export function ReservationForm({
  mode = 'create', // ✅ ADDED: Default mode
  preselectedCustomerId,
  onSuccess,
  onCancel,
  className
}: ReservationFormProps) {
  const [formData, setFormData] = useState<FormState>(initialState)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null) // ✅ ADDED: Estado para disponibilidad
  const [selectedTables, setSelectedTables] = useState<any[]>([]) // ✅ ADDED: Mesas seleccionadas con detalles
  const [totalCapacity, setTotalCapacity] = useState(0) // ✅ ADDED: Capacidad total en tiempo real

  // Hooks de datos
  const { customers } = useRealtimeCustomers()
  const {
    timeSlots,
    lunchSlots,
    dinnerSlots,
    closedDays,
    minAdvanceMinutes,
    maxPartySize,
    isDateDisabled,
    getDisabledReason,
    hasLunchService,
    hasDinnerService,
    isInGapPeriod
  } = useBusinessHours(formData.date, true) // ✅ Admin: Skip advance check for immediate reservations
  const { tables } = useTables()
  const { createReservation, checkAvailability, isLoading } = useReservations() // ✅ ADDED: checkAvailability

  // Pre-select customer si se proporciona (UC2)
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === preselectedCustomerId)
      if (customer) {
        handleCustomerSelect(customer)
        setSearchTerm(`${customer.firstName} ${customer.lastName}`)
      }
    }
  }, [preselectedCustomerId, customers])

  // Autocompletado de clientes
  const customerMatches = useMemo(() =>
    customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [customers, searchTerm]
  )

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.phone || ''
    }))
  }

  const handleCustomerNameChange = (value: string) => {
    setSearchTerm(value)
    setFormData(prev => ({
      ...prev,
      customerName: value
    }))

    if (selectedCustomer && value !== `${selectedCustomer.firstName} ${selectedCustomer.lastName}`) {
      setSelectedCustomer(null)
      setFormData(prev => ({
        ...prev,
        customerId: undefined,
        customerEmail: '',
        customerPhone: ''
      }))
    }
  }

  // ✅ ADDED: Función para verificar disponibilidad (patrón del ProfessionalForm)
  const handleCheckAvailability = async (
    date: string,
    time: string,
    partySize: number
  ): Promise<boolean> => {
    try {
      // Prevenir conversión automática de zona horaria - mismo patrón que la API
      const [year, month, day] = date.split('-')
      const [hour, minute] = time.split(':')
      const dateTime = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )).toISOString()

      const result = await checkAvailability(dateTime, partySize, formData.preferredLocation)

      if (result) {
        setAvailability(result)
        // ✅ RESET: Limpiar selección previa cuando cambia disponibilidad
        setSelectedTables([])
        setTotalCapacity(0)
        setFormData(prev => ({ ...prev, tableIds: [] }))
        return result.available
      }
      return false
    } catch (error) {
      console.error('Error checking availability:', error)
      return false
    }
  }

  // ✅ ADDED: Función para manejar selección de mesas con feedback inteligente
  const handleTableToggle = (table: any) => {
    const maxTablesAllowed = getMaxTablesForPartySize(formData.partySize)
    const isSelected = selectedTables.find(t => t.id === table.id)

    let newSelection: any[]
    if (isSelected) {
      // Deseleccionar mesa
      newSelection = selectedTables.filter(t => t.id !== table.id)
    } else {
      // Validar límites antes de seleccionar
      if (selectedTables.length >= maxTablesAllowed) {
        const reason = formData.partySize <= 4
          ? 'Para grupos pequeños (1-4 personas) solo necesitas 1 mesa'
          : formData.partySize <= 8
            ? 'Para grupos medianos (5-8 personas) máximo 2 mesas'
            : 'Máximo 3 mesas por reserva (grupos grandes)'
        toast.error(reason)
        return
      }
      newSelection = [...selectedTables, table]
    }

    // Calcular capacidad total en tiempo real
    const capacity = newSelection.reduce((sum, t) => sum + t.capacity, 0)

    // Actualizar estados
    setSelectedTables(newSelection)
    setTotalCapacity(capacity)
    setFormData(prev => ({ ...prev, tableIds: newSelection.map(t => t.id) }))

    // ✅ FEEDBACK AUTOMÁTICO: Mostrar estado de capacidad
    if (newSelection.length > 0) {
      if (capacity >= formData.partySize) {
        toast.success(`✅ Capacidad suficiente: ${capacity} asientos para ${formData.partySize} personas`)
      } else {
        toast.warning(`⚠️ Capacidad insuficiente: ${capacity} asientos, necesitas ${formData.partySize} personas`)
      }
    }
  }


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // ✅ Email ahora opcional - solo validar nombre y teléfono
    if (!formData.customerName || !formData.customerPhone) {
      toast.error('Nombre y teléfono son obligatorios')
      return
    }

    if (!formData.date || !formData.time || !formData.partySize) {
      toast.error('Fecha, hora y número de personas son obligatorios')
      return
    }

    // ✅ FIXED: Validar que se haya seleccionado al menos una mesa
    if (!formData.tableIds.length) {
      toast.error('Debes seleccionar al menos una mesa')
      console.error('No se ha seleccionado ninguna mesa')
      return
    }

    try {
      const reservationData: ReservationData = {
        dateTime: `${formData.date}T${formData.time}:00`,
        tableIds: formData.tableIds?.length ? formData.tableIds : [], // 🔥 CRITICAL FIX: SIEMPRE array
        partySize: formData.partySize,
        firstName: formData.customerName.split(' ')[0] || '',
        lastName: formData.customerName.split(' ').slice(1).join(' ') || '',
        email: formData.customerEmail,
        phone: formData.customerPhone,
        specialRequests: formData.specialRequests || undefined,
        dataProcessingConsent: true, // Admin assumes consent
        emailConsent: true,
        marketingConsent: false,
        preferredLanguage: 'ES',
        source: 'admin'
      }

      await createReservation(reservationData)
      onSuccess()
    } catch (error) {
      console.error('Reservation creation failed:', error)
    }
  }

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle>Nueva Reserva</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <CustomerSearchInput
              value={searchTerm}
              matches={customerMatches}
              onSelect={handleCustomerSelect}
              onChange={handleCustomerNameChange}
            />
          </div>

          {/* Contact Fields - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({...prev, customerEmail: e.target.value}))}
                placeholder="email@ejemplo.com"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({...prev, customerPhone: e.target.value}))}
                placeholder="+34 600 123 456"
                required
                className="h-9"
              />
            </div>
          </div>

          {/* Date/Time/Party - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <CustomCalendar
                value={formData.date}
                onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                placeholder="Seleccionar fecha"
                closedDays={closedDays}
                minAdvanceMinutes={minAdvanceMinutes}
                isDateDisabled={isDateDisabled}
                getDisabledReason={getDisabledReason}
                className="h-9"
              />
            </div>

            {/* ✅ ENHANCED: Dual Shift Time Slot Picker */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Hora del Servicio</label>

              {/* Lunch Shift Section */}
              {lunchSlots.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-orange-600" />
                    <h4 className="font-semibold text-sm text-orange-800">🍽️ Servicio de Almuerzo (13:00-16:00)</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
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
                          formData.time === slot.time && "bg-orange-600 hover:bg-orange-700",
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

              {/* Gap Period Info */}
              <div className="bg-muted/30 p-3 rounded-lg text-center border border-amber-200">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>⏰ Cerrado de 16:00 a 18:30 (preparación entre servicios)</span>
                </div>
              </div>

              {/* Dinner Shift Section */}
              {dinnerSlots.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-blue-800">🌙 Servicio de Cena (18:30-23:00)</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
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

              {/* No slots available message */}
              {lunchSlots.length === 0 && dinnerSlots.length === 0 && formData.date && (
                <div className="text-center py-4 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay horarios disponibles para esta fecha</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Personas</label>
              <Select
                value={formData.partySize.toString()}
                onValueChange={(value) => setFormData(prev => ({...prev, partySize: parseInt(value)}))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar personas" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="max-h-48 overflow-y-auto">
                    {Array.from({ length: maxPartySize }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'persona' : 'personas'}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ✅ NUEVA UI: Selección de Mesa con Zona y Grid Responsivo */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Utensils className="h-5 w-5" />
                Selección de Mesa <span className="text-red-500">*</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Elige la zona y las mesas para tu grupo
              </p>
            </CardHeader>
            <CardContent className="space-y-6">

              {availability && availability.available && availability.recommendations?.length ? (
                <>
                  {/* ✅ MEJORADO: Selector de Zona Ergonómico */}
                  {(() => {
                    const availableZones = getAvailableZones(availability.recommendations)
                    if (availableZones.length <= 1) return null

                    return (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Filtrar por zona
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {/* Botón "Todas las zonas" */}
                          <Button
                            type="button"
                            variant={!formData.preferredLocation ? "default" : "outline"}
                            size="sm"
                            className="h-9 px-3"
                            onClick={() => setFormData(prev => ({ ...prev, preferredLocation: '' }))}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Todas
                          </Button>

                          {/* Botones de zona dinámicos */}
                          {availableZones.map((zone) => (
                            <Button
                              key={zone.id}
                              type="button"
                              variant={formData.preferredLocation === zone.id ? "default" : "outline"}
                              size="sm"
                              className="h-9 px-3"
                              onClick={() => setFormData(prev => ({ ...prev, preferredLocation: zone.id }))}
                            >
                              {zone.icon}
                              <span className="ml-2 hidden sm:inline">{zone.name}</span>
                              <span className="ml-2 sm:hidden">{zone.name.split(' ')[0]}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Disponibilidad Summary */}
                  <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-secondary-foreground" />
                    <span className="text-secondary-foreground font-medium">
                      {availability.recommendations.filter(table => !formData.preferredLocation || table.location === formData.preferredLocation).length} mesas disponibles para tu solicitud
                    </span>
                  </div>

                  {/* Grid de Mesas - Mobile Friendly */}
                  <div className="grid gap-2 grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
                    {availability.recommendations
                      .filter(table => !formData.preferredLocation || table.location === formData.preferredLocation)
                      .map((table) => {
                        const isSelected = selectedTables.find(t => t.id === table.id)
                        const maxTablesAllowed = getMaxTablesForPartySize(formData.partySize)

                        return (
                          <div
                            key={table.id}
                            className={cn(
                              "relative p-2 sm:p-3 rounded-lg border cursor-pointer transition-all touch-manipulation",
                              "hover:border-primary/50 active:scale-95 min-h-[60px] sm:min-h-[70px]",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-gray-200",
                              selectedTables.length >= maxTablesAllowed && !isSelected
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            )}
                            onClick={() => {
                              if (selectedTables.length >= maxTablesAllowed && !isSelected) {
                                return // No permitir más selecciones
                              }
                              handleTableToggle(table)
                            }}
                          >
                            {/* Checkbox Visual */}
                            <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                              <div className={cn(
                                "w-3 h-3 sm:w-4 sm:h-4 rounded border flex items-center justify-center",
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-gray-300",
                                selectedTables.length >= maxTablesAllowed && !isSelected
                                  ? "opacity-50"
                                  : ""
                              )}>
                                {isSelected && (
                                  <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
                                )}
                              </div>
                            </div>

                            {/* Contenido de la Mesa */}
                            <div className="pr-5 sm:pr-6">
                              <div className="text-center">
                                <div className={cn(
                                  "text-sm sm:text-lg font-bold mb-0.5 sm:mb-1 truncate",
                                  isSelected ? "text-primary" : "text-gray-900"
                                )}>
                                  {table.number}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-600">
                                  {table.capacity} pers.
                                </div>
                                {table.priceMultiplier > 1 && (
                                  <div className="mt-1">
                                    <span className="text-xs text-yellow-600">⭐</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  {/* Feedback de Capacidad en Tiempo Real */}
                  {selectedTables.length > 0 && (
                    <div className="mt-4">
                      {totalCapacity >= formData.partySize ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <strong>✅ Capacidad suficiente:</strong> {totalCapacity} asientos para {formData.partySize} personas.
                            <span className="text-xs">({selectedTables.length} mesa{selectedTables.length !== 1 ? 's' : ''} seleccionada{selectedTables.length !== 1 ? 's' : ''})</span>
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <strong>⚠️ Capacidad insuficiente:</strong> {totalCapacity} asientos, necesitas {formData.partySize} personas.
                            {totalCapacity < formData.partySize && " Selecciona más mesas."}
                            <span className="text-xs">({selectedTables.length}/{getMaxTablesForPartySize(formData.partySize)} mesas)</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 border rounded-md bg-muted/50 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona fecha, hora y número de personas para ver mesas disponibles
                  </p>
                  {formData.date && formData.time && formData.partySize && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckAvailability(formData.date, formData.time, formData.partySize)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Verificar Disponibilidad
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas especiales (opcional)</label>
            <Textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({...prev, specialRequests: e.target.value}))}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions - Responsive */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Reserva'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}