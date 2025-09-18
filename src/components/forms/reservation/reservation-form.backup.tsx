'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Calendar,
  Users,
  Table,
  Clock,
  AlertCircle,
  Check,
  X,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Hooks
import { useReservations, type ReservationData } from '@/hooks/useReservations'
import { useRealtimeCustomers } from '@/hooks/useRealtimeCustomers'
import { useTables } from '@/hooks/useTables'
import { useBusinessHours } from '@/hooks/useBusinessHours'

// Components - Simplified
import { CustomerSelection } from './customer-selection'
import { DateTimeSelection } from './datetime-selection'
import { TableSelection } from './table-selection'
import { AdditionalInfo } from './additional-info'

interface Table {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  isActive: boolean
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isVip: boolean
  language: string
}

interface ReservationFormProps {
  mode: 'create' | 'edit'
  preselectedCustomerId?: string
  selectedDate?: Date
  selectedTime?: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

// Party sizes - dynamic from business logic (could be from API later)
const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// Table location labels - dynamic from DB
const TABLE_LOCATIONS = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
} as const

export function ReservationForm({
  mode = 'create',
  preselectedCustomerId,
  selectedDate = new Date(),
  selectedTime = '19:00',
  onSuccess,
  onCancel,
  className
}: ReservationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Get dynamic data from hooks
  const { customers, loading: customersLoading } = useRealtimeCustomers()
  const { tables, loading: tablesLoading } = useTables()
  const { createReservation, checkAvailability, isLoading } = useReservations()

  // Form state - useState simple like badezeit-sylt
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(!preselectedCustomerId)

  // Customer fields (for new customer)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState<'ES' | 'EN' | 'DE'>('ES')

  // Reservation fields
  const [dateTime, setDateTime] = useState(() => {
    const initialDate = format(selectedDate, 'yyyy-MM-dd')
    return `${initialDate}T${selectedTime}:00`
  })
  const [partySize, setPartySize] = useState(2)
  const [tableId, setTableId] = useState('')
  const [occasion, setOccasion] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [dietaryNotes, setDietaryNotes] = useState('')

  // GDPR consent
  const [dataProcessingConsent, setDataProcessingConsent] = useState(true)
  const [emailConsent, setEmailConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  // Available tables based on selection
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // Get business hours for selected date
  const currentDate = dateTime ? dateTime.split('T')[0] : format(selectedDate, 'yyyy-MM-dd')
  const { timeSlots, loading: timeSlotsLoading } = useBusinessHours(currentDate)

  // Pre-select customer if provided
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === preselectedCustomerId)
      if (customer) {
        setSelectedCustomer(customer)
        setShowNewCustomerForm(false)
        // Populate fields from existing customer
        setFirstName(customer.firstName)
        setLastName(customer.lastName)
        setEmail(customer.email)
        setPhone(customer.phone || '')
        setLanguage(customer.language as 'ES' | 'EN' | 'DE')
        toast.success(`Cliente ${customer.firstName} ${customer.lastName} preseleccionado`)
      }
    }
  }, [preselectedCustomerId, customers])

  // Check table availability when datetime/partysize changes
  const checkTableAvailability = async () => {
    if (!dateTime || !partySize) return

    setIsCheckingAvailability(true)
    try {
      const availability = await checkAvailability(dateTime, partySize)
      if (availability?.recommendations) {
        // Filter to only active tables that exist in our tables list
        const validTables = tables.filter(table =>
          table.isActive &&
          availability.recommendations.some((rec: any) => rec.id === table.id) &&
          table.capacity >= partySize
        )
        setAvailableTables(validTables)
      } else {
        setAvailableTables([])
        toast.warning('No hay mesas disponibles para la fecha/hora seleccionada')
      }
    } catch (error) {
      console.error('Availability check failed:', error)
      toast.error('Error verificando disponibilidad')
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  // Check availability when relevant fields change
  useEffect(() => {
    if (dateTime && partySize && tables.length > 0) {
      checkTableAvailability()
    }
  }, [dateTime, partySize, tables])

  // Submit reservation - simple validation like badezeit-sylt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!dataProcessingConsent) {
      toast.error('Debe aceptar el procesamiento de datos personales')
      return
    }

    // Check if customer data is complete
    const customerData = selectedCustomer ? {
      customerId: selectedCustomer.id
    } : {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim()
    }

    if (!selectedCustomer) {
      if (!customerData.firstName || !customerData.lastName || !customerData.email || !customerData.phone) {
        toast.error('Por favor complete todos los datos del cliente')
        return
      }
    }

    if (!dateTime || !partySize) {
      toast.error('Por favor seleccione fecha, hora y número de personas')
      return
    }

    startTransition(async () => {
      try {
        const reservationData: ReservationData = {
          ...customerData,
          dateTime,
          partySize,
          tableId: tableId || undefined,
          occasion: occasion || undefined,
          specialRequests: specialRequests || undefined,
          dietaryNotes: dietaryNotes || undefined,
          dataProcessingConsent,
          emailConsent,
          marketingConsent,
          preferredLanguage: language
        }

        await createReservation(reservationData)
        toast.success('¡Reserva creada exitosamente!')

        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/dashboard/reservaciones')
        }
      } catch (error) {
        console.error('Reservation creation failed:', error)
        toast.error('Error al crear la reserva')
      }
    })
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Main Form - Left Side */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
                {(selectedCustomer || (firstName && lastName && email && phone)) && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSelection
                customers={customers}
                selectedCustomer={selectedCustomer}
                showNewCustomerForm={showNewCustomerForm}
                firstName={firstName}
                lastName={lastName}
                email={email}
                phone={phone}
                language={language}
                onSelectedCustomerChange={setSelectedCustomer}
                onShowNewCustomerFormChange={setShowNewCustomerForm}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onEmailChange={setEmail}
                onPhoneChange={setPhone}
                onLanguageChange={setLanguage}
              />
            </CardContent>
          </Card>

          {/* Step 2: Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fecha y Hora
                {dateTime && partySize && <Check className="h-4 w-4 text-green-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DateTimeSelection
                dateTime={dateTime}
                partySize={partySize}
                timeSlots={timeSlots}
                partySizes={PARTY_SIZES}
                loading={timeSlotsLoading}
                onDateTimeChange={setDateTime}
                onPartySizeChange={setPartySize}
                onAvailabilityCheck={checkTableAvailability}
              />
            </CardContent>
          </Card>

          {/* Step 3: Table Selection (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Mesa (Opcional)
                {tableId && <Check className="h-4 w-4 text-green-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TableSelection
                tableId={tableId}
                availableTables={availableTables}
                tableLocations={TABLE_LOCATIONS}
                isLoading={isCheckingAvailability}
                partySize={partySize}
                onTableSelect={setTableId}
              />
            </CardContent>
          </Card>

          {/* Step 4: Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Detalles Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdditionalInfo
                occasion={occasion}
                specialRequests={specialRequests}
                dietaryNotes={dietaryNotes}
                onOccasionChange={setOccasion}
                onSpecialRequestsChange={setSpecialRequests}
                onDietaryNotesChange={setDietaryNotes}
              />
            </CardContent>
          </Card>

          {/* Step 5: GDPR Consent */}
          <Card>
            <CardHeader>
              <CardTitle>Consentimiento GDPR</CardTitle>
            </CardHeader>
            <CardContent>
              <GdprConsent
                mode="create"
                reservationData={{
                  firstName,
                  lastName,
                  email,
                  phone,
                  dateTime,
                  partySize,
                  occasion,
                  dietaryNotes,
                  specialRequests
                }}
                dataProcessingConsent={dataProcessingConsent}
                emailConsent={emailConsent}
                marketingConsent={marketingConsent}
                preferredLanguage={language}
                onDataProcessingConsentChange={setDataProcessingConsent}
                onEmailConsentChange={setEmailConsent}
                onMarketingConsentChange={setMarketingConsent}
                onLanguageChange={setLanguage}
              />
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Summary Sidebar - Right Side */}
      <div className="space-y-6">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Resumen de la Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Summary */}
            <div>
              <p className="text-sm font-medium">Cliente</p>
              <p className="text-sm text-muted-foreground">
                {selectedCustomer
                  ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                  : firstName && lastName
                    ? `${firstName} ${lastName} (nuevo)`
                    : 'No seleccionado'
                }
              </p>
            </div>

            <Separator />

            {/* DateTime Summary */}
            <div>
              <p className="text-sm font-medium">Fecha y Hora</p>
              <p className="text-sm text-muted-foreground">
                {dateTime
                  ? format(new Date(dateTime), 'dd.MM.yyyy HH:mm', { locale: es }) + ' h'
                  : 'No seleccionado'
                }
              </p>
            </div>

            {/* Party Size */}
            <div>
              <p className="text-sm font-medium">Personas</p>
              <p className="text-sm text-muted-foreground">
                {partySize} {partySize === 1 ? 'persona' : 'personas'}
              </p>
            </div>

            {/* Table */}
            <div>
              <p className="text-sm font-medium">Mesa</p>
              <p className="text-sm text-muted-foreground">
                {tableId
                  ? `Mesa ${tables.find(t => t.id === tableId)?.number || tableId}`
                  : 'Asignación automática'
                }
              </p>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={isPending || !dateTime || !partySize || (!selectedCustomer && (!firstName || !lastName || !email || !phone))}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando reserva...
                  </>
                ) : (
                  `${mode === 'create' ? 'Crear' : 'Actualizar'} Reserva`
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}