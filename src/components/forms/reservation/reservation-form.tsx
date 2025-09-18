'use client'

import { useState, useMemo, FormEvent, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar-es'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Hooks
import { useRealtimeCustomers } from '@/hooks/useRealtimeCustomers'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { useTables } from '@/hooks/useTables'
import { useReservations, type ReservationData } from '@/hooks/useReservations'

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
  tableId?: string
  specialRequests?: string
}

interface ReservationFormProps {
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
  tableId: undefined,
  specialRequests: ''
}

export function ReservationForm({
  preselectedCustomerId,
  onSuccess,
  onCancel,
  className
}: ReservationFormProps) {
  const [formData, setFormData] = useState<FormState>(initialState)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  // Hooks de datos
  const { customers } = useRealtimeCustomers()
  const { timeSlots } = useBusinessHours(formData.date)
  const { tables } = useTables()
  const { createReservation, isLoading } = useReservations()

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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd')
      setFormData(prev => ({
        ...prev,
        date: dateString
      }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      return
    }

    if (!formData.date || !formData.time || !formData.partySize) {
      return
    }

    try {
      const reservationData: ReservationData = {
        dateTime: `${formData.date}T${formData.time}:00`,
        tableId: formData.tableId || '',
        partySize: formData.partySize,
        firstName: formData.customerName.split(' ')[0] || '',
        lastName: formData.customerName.split(' ').slice(1).join(' ') || '',
        email: formData.customerEmail,
        phone: formData.customerPhone,
        specialRequests: formData.specialRequests || undefined,
        dataProcessingConsent: true, // Admin assumes consent
        emailConsent: true,
        marketingConsent: false,
        preferredLanguage: 'ES'
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
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({...prev, customerEmail: e.target.value}))}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({...prev, customerPhone: e.target.value}))}
                required
                className="h-9"
              />
            </div>
          </div>

          {/* Date/Time/Party - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={false}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hora</label>
              <Select
                value={formData.time}
                onValueChange={(time) => setFormData(prev => ({...prev, time}))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="max-h-48 overflow-y-auto">
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.time} value={slot.time} disabled={!slot.available}>
                        {slot.time} {!slot.available && `(${slot.reason})`}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Personas</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.partySize}
                onChange={(e) => setFormData(prev => ({...prev, partySize: parseInt(e.target.value) || 1}))}
                required
                className="h-9"
              />
            </div>
          </div>

          {/* Optional Table */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mesa (opcional)</label>
            <Select
              value={formData.tableId || 'none'}
              onValueChange={(tableId) => setFormData(prev => ({...prev, tableId: tableId === 'none' ? undefined : tableId}))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Sin mesa asignada" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="none">Sin mesa asignada</SelectItem>
                <div className="max-h-48 overflow-y-auto">
                  {tables.filter(table => table.isActive).map(table => {
                    const locationLabel = {
                      'TERRACE_CAMPANARI': 'T. Campanari',
                      'TERRACE_JUSTICIA': 'T. Justicia',
                      'SALA_PRINCIPAL': 'Sala Principal',
                      'SALA_VIP': 'Sala VIP'
                    }[table.location] || table.location

                    return (
                      <SelectItem key={table.id} value={table.id}>
                        Mesa {table.number} • {table.capacity}P • {locationLabel}
                      </SelectItem>
                    )
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>

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