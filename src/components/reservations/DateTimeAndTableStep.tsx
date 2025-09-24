'use client'

import { useState, useEffect, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Loader2,
  Eye,
  Building,
  TreePine,
  MapPin,
  Check,
  CheckCircle,
  Utensils,
  Wine,
  Plus,
  Minus,
  Users,
  Crown,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Language } from '@/lib/validations/reservation-professional'
import type { AvailabilityData } from '@/hooks/useReservations'
import { useReservations } from '@/hooks/useReservations'
import { useCart } from '@/hooks/useCart'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { CustomCalendar } from '@/components/ui/custom-calendar'

interface DateTimeAndTableStepProps {
  language: Language
  onNext: () => void
}

// Zone interface for dynamic data from API (from Step One)
interface Zone {
  id: string
  isActive: boolean
  name: { es: string; en: string; de: string }
  type: 'terrace' | 'indoor'
  description: { es: string; en: string; de: string }
}

// Modern location icons using Lucide (from Step Two)
const getLocationIcon = (locationKey: string) => {
  switch (locationKey) {
    case 'TERRACE_CAMPANARI':
      return <TreePine className="h-5 w-5 text-green-600" />
    case 'SALA_VIP':
      return <Crown className="h-5 w-5 text-yellow-600" />
    case 'SALA_PRINCIPAL':
      return <Building className="h-5 w-5 text-blue-600" />
    default:
      return <MapPin className="h-5 w-5 text-gray-600" />
  }
}

const content = {
  es: {
    title: 'Fecha, Hora y Mesa',
    subtitle: '¿Cuándo quieres visitarnos y qué mesa prefieres?',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    partySizeLabel: 'Número de personas',
    locationLabel: 'Zona preferida (opcional)',
    checkAvailability: 'Verificar Disponibilidad',
    checking: 'Verificando...',
    person: 'persona',
    people: 'personas',
    tablesAvailable: 'mesas disponibles para tu solicitud',
    recommendedTables: 'Mesas Recomendadas',
    tableNumber: 'Mesa',
    preOrderTitle: 'Pre-pedido (Opcional)',
    preOrderSubtitle: 'Selecciona platos y vinos para agilizar tu experiencia',
    dishes: 'Platos',
    wines: 'Vinos',
    preOrderSummary: 'Resumen del Pre-pedido',
    total: 'Total:',
    next: 'Siguiente'
  },
  en: {
    title: 'Date, Time & Table',
    subtitle: 'When would you like to visit us and which table do you prefer?',
    dateLabel: 'Date',
    timeLabel: 'Time',
    partySizeLabel: 'Party size',
    locationLabel: 'Preferred area (optional)',
    checkAvailability: 'Check Availability',
    checking: 'Checking...',
    person: 'person',
    people: 'people',
    tablesAvailable: 'tables available for your request',
    recommendedTables: 'Recommended Tables',
    tableNumber: 'Table',
    preOrderTitle: 'Pre-order (Optional)',
    preOrderSubtitle: 'Select dishes and wines to streamline your experience',
    dishes: 'Dishes',
    wines: 'Wines',
    preOrderSummary: 'Pre-order Summary',
    total: 'Total:',
    next: 'Next'
  },
  de: {
    title: 'Datum, Zeit & Tisch',
    subtitle: 'Wann möchten Sie uns besuchen und welchen Tisch bevorzugen Sie?',
    dateLabel: 'Datum',
    timeLabel: 'Uhrzeit',
    partySizeLabel: 'Personenanzahl',
    locationLabel: 'Bevorzugter Bereich (optional)',
    checkAvailability: 'Verfügbarkeit prüfen',
    checking: 'Wird geprüft...',
    person: 'Person',
    people: 'Personen',
    tablesAvailable: 'Tische für Ihre Anfrage verfügbar',
    recommendedTables: 'Empfohlene Tische',
    tableNumber: 'Tisch',
    preOrderTitle: 'Vorbestellung (Optional)',
    preOrderSubtitle: 'Wählen Sie Gerichte und Weine für ein optimales Erlebnis',
    dishes: 'Gerichte',
    wines: 'Weine',
    preOrderSummary: 'Vorbestellungsübersicht',
    total: 'Gesamt:',
    next: 'Weiter'
  }
}

export default function DateTimeAndTableStep({
  language,
  onNext
}: DateTimeAndTableStepProps) {
  // REUTILIZAR lógica de ReservationStepOne:
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [activeZones, setActiveZones] = useState<Zone[]>([])
  const [loadingZones, setLoadingZones] = useState(true)

  // REUTILIZAR lógica de ReservationStepTwo:
  const [availabilityResults, setAvailabilityResults] = useState<AvailabilityData | null>(null)

  // 🚀 NUEVA LÓGICA: Estado para selección múltiple inteligente
  const [selectedTables, setSelectedTables] = useState<any[]>([])
  const [totalCapacity, setTotalCapacity] = useState<number>(0)

  // 🚀 CONSTANTES ANTI-ABUSE
  // 🚀 LÓGICA INTELIGENTE: Máximo de mesas basado en tamaño del grupo
  const getMaxTablesForPartySize = (partySize: number): number => {
    if (partySize <= 4) return 1    // 1-4 personas: 1 mesa suficiente
    if (partySize <= 8) return 2    // 5-8 personas: máximo 2 mesas
    return 3                        // 9-12 personas: máximo 3 mesas
  }

  // USAR hook existente sin modificaciones
  const { checkAvailability, getMenuItems, isCheckingAvailability } = useReservations()
  const { getCartItems } = useCart()
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)

  // Business hours hook for dynamic calendar validation AND max party size
  const {
    closedDays,
    minAdvanceMinutes,
    isDateDisabled,
    getDisabledReason,
    maxPartySize // GET DYNAMIC MAX PARTY SIZE FROM DB
  } = useBusinessHours()


  // Form context and watched values - MUST be declared before useEffect
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useFormContext()

  const t = content[language]

  const watchedDate = watch('stepOne.date')
  const watchedTime = watch('stepOne.time')
  const watchedPartySize = watch('stepOne.partySize')
  const maxTablesAllowed = getMaxTablesForPartySize(watchedPartySize)
  const watchedLocation = watch('stepOne.preferredLocation')
  const watchedTableId = watch('stepTwo.tableId')
  const watchedPreOrderItems = watch('stepTwo.preOrderItems') || []

  // Update totals (from Step Two) - DECLARED FIRST to avoid hoisting issues
  const updatePreOrderTotals = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setValue('stepTwo.preOrderTotal', total)
    setValue('stepTwo.hasPreOrder', items.length > 0)
  }

  // COPIAR EXACTO de ReservationStepOne.tsx líneas 99-175 - Load available time slots
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

        // Set first available slot as default if no time is selected
        if (!watchedTime && timeStrings.length > 0) {
          setValue('stepOne.time', timeStrings[0])
        }

        // Enterprise logging for monitoring
        console.log(`🕐 [${new Date().toISOString()}] Available slots for ${selectedDate}:`, {
          totalSlots: availableSlots.length,
          availableSlots: timeStrings.length,
          unavailableSlots: availableSlots.filter(s => !s.available).length,
          slots: timeStrings,
          defaultSet: !watchedTime && timeStrings.length > 0 ? timeStrings[0] : 'none'
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

        // API failed - no hardcoded fallbacks, show empty slots
        console.error(`🆘 [API_FAILURE] Cannot load time slots for ${watchedDate}, showing no available times`)
        setTimeSlots([])
      } finally {
        setLoadingTimeSlots(false)
      }
    }

    loadTimeSlots()
  }, [watchedDate]) // Re-run when date changes

  // COPIAR EXACTO de ReservationStepOne.tsx líneas 178-214 - Load active zones from API
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

  // Load cart items on component mount (from Step Two)
  useEffect(() => {
    const cartItems = getCartItems()

    if (cartItems.length > 0) {
      // Transform cart items to preOrder format
      const preOrderItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type
      }))

      // Use existing functions
      setValue('stepTwo.preOrderItems', preOrderItems)
      updatePreOrderTotals(preOrderItems)
    }
  }, [setValue, getCartItems])

  // 🚀 FIXED: Load menu items when tables are selected - NO getMenuItems dependency to prevent loop
  useEffect(() => {
    if (selectedTables.length > 0) {
      const loadMenu = async () => {
        setIsLoadingMenu(true)
        try {
          // 🚀 DIRECT API CALL instead of hook dependency to prevent infinite loop
          const response = await fetch('/api/menu')
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          const items = data.success && data.categories ? data.categories : []
          setMenuItems(items)
        } catch (error) {
          console.error('Error loading menu items:', error)
          setMenuItems([])
        } finally {
          setIsLoadingMenu(false)
        }
      }
      loadMenu()
    }
  }, [selectedTables]) // 🚀 UPDATED: selectedTables dependency

  // Get today's date for minimum date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Get tomorrow's date as smart default
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Get max date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
  }

  // Smart defaults on component mount - only date, time will be set dynamically
  useEffect(() => {
    if (!watchedDate) {
      setValue('stepOne.date', getTomorrowDate())
    }
  }, [])

  // 🚀 FIXED: Auto-verification when all required fields are filled - NO handleCheckAvailability dependency
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (watchedDate && watchedTime && watchedPartySize && !isCheckingAvailability) {
        // Inline the availability check to prevent dependency loop
        const isValid = await trigger('stepOne')
        if (!isValid) return

        const result = await checkAvailability(
          `${watchedDate}T${watchedTime}:00`,
          watchedPartySize,
          watchedLocation
        )

        if (result) {
          setAvailabilityResults(result)
        }
      }
    }, 800) // Debounce 800ms

    return () => clearTimeout(timer)
  }, [watchedDate, watchedTime, watchedPartySize, watchedLocation]) // 🚀 REMOVED: isCheckingAvailability, handleCheckAvailability

  // 🚀 NUEVA LÓGICA: Selección múltiple inteligente con validación anti-abuse
  const handleTableToggle = useCallback((table: any) => {
    setSelectedTables(prev => {
      const isSelected = prev.find(t => t.id === table.id)
      let newSelection: any[]

      if (isSelected) {
        // Deseleccionar mesa
        newSelection = prev.filter(t => t.id !== table.id)
      } else {
        // Seleccionar mesa con límites anti-abuse
        if (prev.length >= maxTablesAllowed) {
          const reason = watchedPartySize <= 4
            ? 'Para grupos pequeños (1-4 personas) solo necesitas 1 mesa'
            : watchedPartySize <= 8
              ? 'Para grupos medianos (5-8 personas) máximo 2 mesas'
              : 'Máximo 3 mesas por reserva (grupos grandes)'
          toast.error(reason)
          return prev
        }
        newSelection = [...prev, table]
      }

      // Calcular capacidad total en tiempo real
      const capacity = newSelection.reduce((sum, t) => sum + t.capacity, 0)
      setTotalCapacity(capacity)

      // Actualizar form con array de IDs
      setValue('stepTwo.tableIds', newSelection.map(t => t.id))

      // 🚀 FEEDBACK AUTOMÁTICO: Mostrar estado de capacidad
      if (newSelection.length > 0) {
        if (capacity >= watchedPartySize) {
          toast.success(`✅ Capacidad suficiente: ${capacity} asientos para ${watchedPartySize} personas`)
        } else {
          toast.warning(`⚠️ Capacidad insuficiente: ${capacity} asientos, necesitas ${watchedPartySize} personas`)
        }
      }

      return newSelection
    })
  }, [setValue, watchedPartySize, maxTablesAllowed, toast])

  // Handle pre-order item addition (from Step Two) - memoized to prevent unnecessary re-renders
  const addToPreOrder = useCallback((item: any) => {
    const existingItems = watchedPreOrderItems
    const existingIndex = existingItems.findIndex((existingItem: any) => existingItem.id === item.id)

    let newItems
    if (existingIndex >= 0) {
      // Update quantity
      newItems = existingItems.map((existingItem: any, index: number) =>
        index === existingIndex
          ? { ...existingItem, quantity: existingItem.quantity + 1 }
          : existingItem
      )
    } else {
      // Add new item
      newItems = [...existingItems, { ...item, quantity: 1 }]
    }

    setValue('stepTwo.preOrderItems', newItems)
    updatePreOrderTotals(newItems)
  }, [watchedPreOrderItems, setValue, updatePreOrderTotals])

  // Handle pre-order item removal (from Step Two) - memoized to prevent unnecessary re-renders
  const removeFromPreOrder = useCallback((itemId: string) => {
    const existingItems = watchedPreOrderItems
    const existingIndex = existingItems.findIndex((item: any) => item.id === itemId)

    if (existingIndex >= 0) {
      const existingItem = existingItems[existingIndex]
      let newItems

      if (existingItem.quantity > 1) {
        // Reduce quantity
        newItems = existingItems.map((item: any, index: number) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      } else {
        // Remove item completely
        newItems = existingItems.filter((item: any) => item.id !== itemId)
      }

      setValue('stepTwo.preOrderItems', newItems)
      updatePreOrderTotals(newItems)
    }
  }, [watchedPreOrderItems, setValue, updatePreOrderTotals])


  const handleNext = async () => {
    const stepOneValid = await trigger('stepOne')
    const stepTwoValid = await trigger('stepTwo')

    if (stepOneValid && stepTwoValid) {
      onNext()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getItemQuantity = (itemId: string) => {
    const item = watchedPreOrderItems.find((item: any) => item.id === itemId)
    return item?.quantity || 0
  }

  // Filter menu items
  const dishes = menuItems.filter(item => item.type === 'dish')
  const wines = menuItems.filter(item => item.type === 'wine')

  return (
    <div className="space-y-4 md:space-y-6">
      {/* SECCIÓN 1: Fecha/Hora/Personas (copiar de ReservationStepOne) */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calendar className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <p className="text-sm md:text-base text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">{t.dateLabel}</Label>
            <CustomCalendar
              value={watchedDate}
              onChange={(date) => setValue('stepOne.date', date)}
              placeholder={language === 'es' ? 'Seleccionar fecha' : language === 'en' ? 'Select date' : 'Datum auswählen'}
              closedDays={closedDays}
              minAdvanceMinutes={minAdvanceMinutes}
              isDateDisabled={isDateDisabled}
              getDisabledReason={getDisabledReason}
              error={errors.stepOne?.date?.message}
              className="mt-2"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t.timeLabel}
            </Label>
            {loadingTimeSlots ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Cargando horarios...</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={watchedTime === time ? "default" : "outline"}
                    size="sm"
                    type="button"
                    onClick={() => setValue('stepOne.time', time)}
                    className="text-xs sm:text-sm h-10 sm:h-11 font-medium touch-manipulation min-w-0 px-2 sm:px-3"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
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
              <div>
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
                  <div className="flex gap-3 overflow-x-auto">
                    {activeZones.map((zone) => (
                      <div key={zone.id} className="flex-1 min-w-0">
                        <RadioGroupItem
                          value={zone.id}
                          id={zone.id}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={zone.id}
                          className={cn(
                            "relative p-3 rounded-lg border cursor-pointer transition-all block",
                            "hover:border-primary/30 hover:bg-gray-50 text-center",
                            watchedLocation === zone.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200"
                          )}
                        >
                          {/* Zone Content */}
                          <div>
                            <div className="mb-2">
                              {zone.type === 'terrace' ?
                                <TreePine className={cn(
                                  "h-5 w-5 mx-auto",
                                  watchedLocation === zone.id ? "text-primary" : "text-green-600"
                                )} /> :
                                <Building className={cn(
                                  "h-5 w-5 mx-auto",
                                  watchedLocation === zone.id ? "text-primary" : "text-gray-600"
                                )} />
                              }
                            </div>
                            <span className={cn(
                              "text-sm font-medium block",
                              watchedLocation === zone.id ? "text-primary" : "text-gray-900"
                            )}>
                              {zone.name[language]}
                            </span>
                          </div>

                          {/* Selection indicator */}
                          {watchedLocation === zone.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-4 h-4 rounded-full bg-primary border-primary flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            </div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>

          {/* Auto-verification Status */}
          {isCheckingAvailability && (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando disponibilidad automáticamente...
            </div>
          )}

          {watchedDate && watchedTime && watchedPartySize && !isCheckingAvailability && !availabilityResults && (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              <Eye className="mr-2 h-4 w-4" />
              Verificación automática en progreso
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECCIÓN 2: Disponibilidad y Mesas (copiar de ReservationStepTwo) */}
      {availabilityResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              {t.recommendedTables}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {formatDate(watchedDate)} • {watchedTime} • {watchedPartySize} {watchedPartySize === 1 ? 'persona' : 'personas'}
            </div>
          </CardHeader>
          <CardContent>
            {/* Availability Summary */}
            <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg mb-6">
              <CheckCircle className="h-5 w-5 text-secondary-foreground" />
              <span className="text-secondary-foreground font-medium">
                {availabilityResults.totalTables} {t.tablesAvailable}
              </span>
            </div>

            {/* Table Recommendations */}
            {availabilityResults.recommendations?.length > 0 && (
              <div className="mb-6">
                {/* Zone Filter Info */}
                {watchedLocation && (
                  <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4" />
                      Mostrando mesas de: <strong>{activeZones.find(z => z.id === watchedLocation)?.name[language]}</strong>
                    </p>
                  </div>
                )}

                <div className="grid gap-2 grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
                  {availabilityResults.recommendations
                    .filter(table => !watchedLocation || table.location === watchedLocation)
                    .map((table) => (
                    <div
                      key={table.id}
                      className={cn(
                        "relative p-2 sm:p-3 rounded-lg border cursor-pointer transition-all touch-manipulation",
                        "hover:border-primary/50 active:scale-95 min-h-[60px] sm:min-h-[70px]",
                        selectedTables.find(t => t.id === table.id)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200",
                        selectedTables.length >= maxTablesAllowed && !selectedTables.find(t => t.id === table.id)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      )}
                      onClick={() => {
                        if (selectedTables.length >= maxTablesAllowed && !selectedTables.find(t => t.id === table.id)) {
                          return; // No permitir más selecciones
                        }
                        handleTableToggle(table)
                      }}
                    >
                      {/* Multiple Selection Checkbox */}
                      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                        <div className={cn(
                          "w-3 h-3 sm:w-4 sm:h-4 rounded border flex items-center justify-center",
                          selectedTables.find(t => t.id === table.id)
                            ? "bg-primary border-primary"
                            : "border-gray-300",
                          selectedTables.length >= maxTablesAllowed && !selectedTables.find(t => t.id === table.id)
                            ? "opacity-50"
                            : ""
                        )}>
                          {selectedTables.find(t => t.id === table.id) && (
                            <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="pr-5 sm:pr-6">
                        <div className="text-center">
                          <div className={cn(
                            "text-sm sm:text-lg font-bold mb-0.5 sm:mb-1 truncate",
                            selectedTables.find(t => t.id === table.id) ? "text-primary" : "text-gray-900"
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
                  ))}
                </div>

                {/* 🚀 INDICADORES DE CAPACIDAD EN TIEMPO REAL (Plan líneas 143-151) */}
                {selectedTables.length > 0 && (
                  <div className="mt-4">
                    {totalCapacity >= watchedPartySize ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <strong>✅ Capacidad suficiente:</strong> {totalCapacity} asientos para {watchedPartySize} personas.
                          <span className="text-xs">({selectedTables.length} mesa{selectedTables.length !== 1 ? 's' : ''} seleccionada{selectedTables.length !== 1 ? 's' : ''})</span>
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <strong>⚠️ Capacidad insuficiente:</strong> {totalCapacity} asientos, necesitas {watchedPartySize} personas.
                          {totalCapacity < watchedPartySize && " Selecciona más mesas."}
                          <span className="text-xs">({selectedTables.length}/{maxTablesAllowed} mesas)</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Combinaciones Inteligentes */}
            {availabilityResults.recommendations?.filter(r => r.type === 'combination').length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Combinaciones de Mesas Consecutivas
                </h3>

                <div className="space-y-3">
                  {availabilityResults.recommendations
                    .filter(r => r.type === 'combination')
                    .map((combo) => (
                    <div
                      key={combo.tableId}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all",
                        selectedTables.find(t => t.id === combo.tableId)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/30"
                      )}
                      onClick={() => handleTableToggle(combo)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base sm:text-lg text-primary mb-1 break-words">
                            Mesas {combo.tableNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Capacidad: {combo.capacity} personas
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Zona: {combo.zone?.replace('_', ' ').replace('TERRACE', 'Terraza').replace('SALA', 'Sala').replace('CAMPANARI', 'Campanari').replace('VIP', 'VIP').replace('PRINCIPAL', 'Principal').replace('JUSTICIA', 'Justicia')}
                          </div>
                        </div>

                        <div className={cn(
                          "w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0",
                          selectedTables.find(t => t.id === combo.tableId)
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        )}>
                          {selectedTables.find(t => t.id === combo.tableId) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    💡 <strong>Mesas Consecutivas:</strong> Combinación automática para tu grupo de {watchedPartySize} personas.
                  </div>
                </div>
              </div>
            )}

            {errors.stepTwo?.tableId && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {errors.stepTwo.tableId.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN 3: Pre-pedido (copiar de ReservationStepTwo) */}
      {selectedTables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
              {t.preOrderTitle}
            </CardTitle>
            <p className="text-muted-foreground">{t.preOrderSubtitle}</p>
          </CardHeader>
          <CardContent>
            {isLoadingMenu ? (
              <p>Cargando menú...</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dishes */}
                {dishes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Utensils className="h-3 w-3 sm:h-4 sm:w-4" />
                      {t.dishes}
                    </h3>
                    <div className="space-y-3">
                      {dishes.map((dish) => {
                        const quantity = getItemQuantity(dish.id)
                        return (
                          <div key={dish.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{dish.name}</h4>
                              <p className="text-sm text-muted-foreground">{dish.category}</p>
                              <p className="text-sm font-medium text-primary">€{dish.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {quantity > 0 && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromPreOrder(dish.id)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="mx-2 font-medium">{quantity}</span>
                                </>
                              )}
                              <Button
                                variant={quantity > 0 ? "default" : "outline"}
                                size="sm"
                                onClick={() => addToPreOrder(dish)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Wines */}
                {wines.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Wine className="h-3 w-3 sm:h-4 sm:w-4" />
                      {t.wines}
                    </h3>
                    <div className="space-y-3">
                      {wines.map((wine) => {
                        const quantity = getItemQuantity(wine.id)
                        return (
                          <div key={wine.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{wine.name}</h4>
                              <p className="text-sm text-muted-foreground">{wine.category}</p>
                              <p className="text-sm font-medium text-primary">€{wine.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {quantity > 0 && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromPreOrder(wine.id)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="mx-2 font-medium">{quantity}</span>
                                </>
                              )}
                              <Button
                                variant={quantity > 0 ? "default" : "outline"}
                                size="sm"
                                onClick={() => addToPreOrder(wine)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pre-order Summary */}
            {watchedPreOrderItems.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-sm sm:text-base text-green-900 mb-3">{t.preOrderSummary}</h3>
                <div className="space-y-2">
                  {watchedPreOrderItems.map((item: any) => (
                    <div key={`${item.id}-summary`} className="flex items-center justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center justify-between font-medium">
                      <span>{t.total}</span>
                      <span>€{watch('stepTwo.preOrderTotal')?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={selectedTables.length === 0 || totalCapacity < watchedPartySize}
          size="lg"
        >
          {t.next}
        </Button>
      </div>
    </div>
  )
}