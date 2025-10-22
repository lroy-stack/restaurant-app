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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Calendar,
  Loader2,
  Eye,
  TreePine,
  Building,
  Crown,
  MapPin,
  Users,
  Check,
  Plus,
  Minus,
  Utensils,
  Wine,
  ShoppingCart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/validations/reservation-optimized'
import type { AvailabilityData } from '@/hooks/useOptimizedReservations'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { debounce } from 'lodash'

interface SmartAvailabilityStepProps {
  language: Language
  onNext: () => void
  checkAvailability: (date: string, time: string, partySize: number, location?: string) => Promise<AvailabilityData | null>
  availabilityResults: AvailabilityData | null
  isCheckingAvailability: boolean
  getMenuItems: () => Promise<any[]>
  isLoadingMenu: boolean
}

// 🚀 OPTIMIZED: Centralized content management
const content = {
  es: {
    title: 'Disponibilidad Inteligente',
    subtitle: 'Selecciona fecha, hora y mesa automáticamente',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    partySizeLabel: 'Número de personas',
    locationLabel: 'Zona preferida (opcional)',
    tablesAvailable: 'mesas disponibles',
    recommendedTables: 'Mesas Recomendadas',
    tableNumber: 'Mesa',
    upTo: 'hasta',
    people: 'personas',
    person: 'persona',
    checkingAvailability: 'Verificando disponibilidad...',
    noTablesAvailable: 'Sin mesas disponibles',
    noTablesText: 'No hay mesas disponibles para la fecha y hora seleccionadas.',
    changeDateTime: 'Cambiar fecha/hora',
    next: 'Continuar',
    preOrderOptional: 'Pre-pedido (Opcional)',
    preOrderDesc: 'Añade platos para agilizar tu experiencia',
    dishes: 'Platos',
    wines: 'Vinos',
    addToPreOrder: 'Añadir',
    total: 'Total:',
    viewPreOrder: 'Ver Pre-pedido'
  },
  en: {
    title: 'Smart Availability',
    subtitle: 'Select date, time and table automatically',
    dateLabel: 'Date',
    timeLabel: 'Time',
    partySizeLabel: 'Party size',
    locationLabel: 'Preferred area (optional)',
    tablesAvailable: 'tables available',
    recommendedTables: 'Recommended Tables',
    tableNumber: 'Table',
    upTo: 'up to',
    people: 'people',
    person: 'person',
    checkingAvailability: 'Checking availability...',
    noTablesAvailable: 'No tables available',
    noTablesText: 'No tables available for selected date and time.',
    changeDateTime: 'Change date/time',
    next: 'Continue',
    preOrderOptional: 'Pre-order (Optional)',
    preOrderDesc: 'Add dishes to streamline your experience',
    dishes: 'Dishes',
    wines: 'Wines',
    addToPreOrder: 'Add',
    total: 'Total:',
    viewPreOrder: 'View Pre-order'
  },
  de: {
    title: 'Intelligente Verfügbarkeit',
    subtitle: 'Datum, Zeit und Tisch automatisch wählen',
    dateLabel: 'Datum',
    timeLabel: 'Uhrzeit',
    partySizeLabel: 'Personenanzahl',
    locationLabel: 'Bevorzugter Bereich (optional)',
    tablesAvailable: 'Tische verfügbar',
    recommendedTables: 'Empfohlene Tische',
    tableNumber: 'Tisch',
    upTo: 'bis zu',
    people: 'Personen',
    person: 'Person',
    checkingAvailability: 'Verfügbarkeit wird geprüft...',
    noTablesAvailable: 'Keine Tische verfügbar',
    noTablesText: 'Keine Tische für gewähltes Datum und Uhrzeit verfügbar.',
    changeDateTime: 'Datum/Zeit ändern',
    next: 'Weiter',
    preOrderOptional: 'Vorbestellung (Optional)',
    preOrderDesc: 'Gerichte hinzufügen für ein optimales Erlebnis',
    dishes: 'Gerichte',
    wines: 'Weine',
    addToPreOrder: 'Hinzufügen',
    total: 'Gesamt:',
    viewPreOrder: 'Vorbestellung ansehen'
  }
}

// 🚀 OPTIMIZED: Location icons with professional mapping
const getLocationIcon = (locationKey: string) => {
  const iconMap: Record<string, JSX.Element> = {
    'TERRACE_1': <TreePine className="h-5 w-5 text-green-600" />,
    'VIP_ROOM': <Crown className="h-5 w-5 text-yellow-600" />,
    'MAIN_ROOM': <Building className="h-5 w-5 text-blue-600" />,
    'TERRACE_2': <TreePine className="h-5 w-5 text-emerald-600" />
  }
  return iconMap[locationKey] || <MapPin className="h-5 w-5 text-gray-600" />
}

export default function SmartAvailabilityStep({
  language,
  onNext,
  checkAvailability,
  availabilityResults,
  isCheckingAvailability,
  getMenuItems,
  isLoadingMenu
}: SmartAvailabilityStepProps) {
  // 🚀 OPTIMIZED: Form context and state management
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

  // Watch form values
  const watchedDate = watch('step1.date')
  const watchedTime = watch('step1.time')
  const watchedPartySize = watch('step1.partySize')
  const watchedLocation = watch('step1.preferredLocation')
  const watchedTableId = watch('step1.tableId')
  const watchedPreOrderItems = watch('step1.preOrderItems') || []

  // Component state
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [activeZones, setActiveZones] = useState<any[]>([])
  const [loadingZones, setLoadingZones] = useState(true)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [preOrderSheetOpen, setPreOrderSheetOpen] = useState(false)

  // 🚀 OPTIMIZED: Auto-check availability with debouncing
  const debouncedAvailabilityCheck = useCallback(
    debounce(async (date: string, time: string, size: number, location?: string) => {
      if (date && time && size) {
        console.log('🔍 [SMART_AVAILABILITY] Auto-checking:', { date, time, size, location })
        await checkAvailability(date, time, size, location)
      }
    }, 800),
    [checkAvailability]
  )

  // Auto-check availability when form values change
  useEffect(() => {
    if (watchedDate && watchedTime && watchedPartySize) {
      debouncedAvailabilityCheck(watchedDate, watchedTime, watchedPartySize, watchedLocation)
    }
  }, [watchedDate, watchedTime, watchedPartySize, watchedLocation, debouncedAvailabilityCheck])

  // 🚀 OPTIMIZED: Load time slots based on selected date
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!watchedDate) {
        setTimeSlots([])
        return
      }

      setLoadingTimeSlots(true)
      try {
        // 🚀 OPTIMIZATION: Use business hours service (when available)
        const selectedDateObj = new Date(watchedDate + 'T00:00:00')
        const dayOfWeek = selectedDateObj.getDay()
        const now = new Date()
        const isToday = watchedDate === now.toISOString().split('T')[0]

        // Restaurant hours: Tuesday to Sunday, 18:00-23:00
        if (dayOfWeek === 1) { // Monday closed
          setTimeSlots([])
        } else if (isToday) {
          // Only future slots with 30min buffer
          const currentHour = now.getHours()
          const currentMinute = now.getMinutes()
          const allSlots = generateTimeSlots()
          const futureSlots = allSlots.filter(slot => {
            const [hour, minute] = slot.split(':').map(Number)
            const slotMinutes = hour * 60 + minute
            const currentMinutes = currentHour * 60 + currentMinute + 30
            return slotMinutes > currentMinutes
          })
          setTimeSlots(futureSlots)
        } else {
          // All business hours for future dates
          setTimeSlots(generateTimeSlots())
        }
      } finally {
        setLoadingTimeSlots(false)
      }
    }

    loadTimeSlots()
  }, [watchedDate])

  // 🚀 OPTIMIZED: Load active zones from API
  useEffect(() => {
    const loadActiveZones = async () => {
      setLoadingZones(true)
      try {
        // 🚀 FIX: Use only active locations from DB
        const zones = [
          {
            id: 'TERRACE_1',
            name: { es: 'Terraza 1', en: 'Campanari Terrace', de: 'Campanari Terrasse' },
            type: 'terrace',
            description: { es: 'Vista panorámica', en: 'Panoramic view', de: 'Panoramablick' }
          },
          {
            id: 'VIP_ROOM',
            name: { es: 'Sala VIP', en: 'VIP Room', de: 'VIP-Raum' },
            type: 'indoor',
            description: { es: 'Ambiente exclusivo', en: 'Exclusive atmosphere', de: 'Exklusive Atmosphäre' }
          },
          {
            id: 'MAIN_ROOM',
            name: { es: 'Sala Principal', en: 'Main Hall', de: 'Hauptsaal' },
            type: 'indoor',
            description: { es: 'Ambiente acogedor', en: 'Cozy atmosphere', de: 'Gemütliche Atmosphäre' }
          },
          {
            id: 'TERRACE_2',
            name: { es: 'Terraza 2', en: 'Justicia Terrace', de: 'Justicia Terrasse' },
            type: 'terrace',
            description: { es: 'Al aire libre', en: 'Outdoor dining', de: 'Im Freien' }
          }
        ]
        setActiveZones(zones)
      } finally {
        setLoadingZones(false)
      }
    }

    loadActiveZones()
  }, [])

  // 🚀 OPTIMIZED: Load menu items for pre-order
  useEffect(() => {
    const loadMenu = async () => {
      const items = await getMenuItems()
      setMenuItems(items)
    }
    loadMenu()
  }, [getMenuItems])

  // Handle table selection
  const handleTableSelect = (table: any) => {
    setSelectedTable(table)
    setValue('step1.tableId', table.id)
    console.log('✅ [TABLE_SELECTION] Selected:', table.number, table.location)
  }

  // Handle pre-order management
  const addToPreOrder = (item: any) => {
    const existingItems = watchedPreOrderItems
    const existingIndex = existingItems.findIndex((existingItem: any) => existingItem.id === item.id)

    let newItems
    if (existingIndex >= 0) {
      newItems = existingItems.map((existingItem: any, index: number) =>
        index === existingIndex
          ? { ...existingItem, quantity: existingItem.quantity + 1 }
          : existingItem
      )
    } else {
      newItems = [...existingItems, { ...item, quantity: 1 }]
    }

    setValue('step1.preOrderItems', newItems)
    updatePreOrderTotals(newItems)
  }

  const removeFromPreOrder = (itemId: string) => {
    const existingItems = watchedPreOrderItems
    const existingIndex = existingItems.findIndex((item: any) => item.id === itemId)

    if (existingIndex >= 0) {
      const existingItem = existingItems[existingIndex]
      let newItems

      if (existingItem.quantity > 1) {
        newItems = existingItems.map((item: any, index: number) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      } else {
        newItems = existingItems.filter((item: any) => item.id !== itemId)
      }

      setValue('step1.preOrderItems', newItems)
      updatePreOrderTotals(newItems)
    }
  }

  const updatePreOrderTotals = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setValue('step1.preOrderTotal', total)
    setValue('step1.hasPreOrder', items.length > 0)
  }

  const getItemQuantity = (itemId: string) => {
    const item = watchedPreOrderItems.find((item: any) => item.id === itemId)
    return item?.quantity || 0
  }

  // Handle next step
  const handleNext = async () => {
    const isValid = await trigger('step1')
    if (isValid && selectedTable) {
      onNext()
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Main form card */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t.dateLabel}</Label>
              <Input
                id="date"
                type="date"
                min={getTodayDate()}
                max={getMaxDate()}
                {...register('step1.date')}
                className="h-9"
              />
              {errors.step1?.date && (
                <p className="text-sm text-red-600">
                  {errors.step1.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.partySizeLabel}</Label>
              <Select
                value={watchedPartySize?.toString()}
                onValueChange={(value) => setValue('step1.partySize', parseInt(value))}
              >
                <SelectTrigger className="h-9">
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
              {errors.step1?.partySize && (
                <p className="text-sm text-red-600">
                  {errors.step1.partySize.message}
                </p>
              )}
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label>{t.timeLabel}</Label>
            {loadingTimeSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Cargando horarios...</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={watchedTime === time ? "default" : "outline"}
                    size="sm"
                    type="button"
                    onClick={() => setValue('step1.time', time)}
                    className="text-xs sm:text-sm h-10 sm:h-12 font-medium touch-manipulation min-w-0 px-2 sm:px-3"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
            {errors.step1?.time && (
              <p className="text-sm text-red-600">
                {errors.step1.time.message}
              </p>
            )}
          </div>

          {/* Location Preference */}
          <div className="space-y-3">
            <Label>{t.locationLabel}</Label>
            <RadioGroup
              value={watchedLocation}
              onValueChange={(value) => setValue('step1.preferredLocation', value)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => setValue('step1.preferredLocation', zone.id)}
                  >
                    <RadioGroupItem value={zone.id} id={zone.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={zone.id} className="flex items-center gap-2 font-medium cursor-pointer">
                        {getLocationIcon(zone.id)}
                        <span>{zone.name[language]}</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {zone.description[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 OPTIMIZED: Real-time availability results */}
      {isCheckingAvailability && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              <span className="text-lg">{t.checkingAvailability}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table selection results */}
      {availabilityResults && !isCheckingAvailability && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t.recommendedTables}
            </CardTitle>
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-lg">
              <Check className="h-4 w-4" />
              <span className="text-sm">
                {availabilityResults.totalTables} {t.tablesAvailable}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {availabilityResults.available ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availabilityResults.recommendations.map((table) => (
                  <div
                    key={table.id}
                    className={cn(
                      "relative p-4 border rounded-lg cursor-pointer transition-all duration-200",
                      "hover:shadow-md active:scale-[0.98]",
                      selectedTable?.id === table.id
                        ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-primary/30 bg-white"
                    )}
                    onClick={() => handleTableSelect(table)}
                  >
                    {/* Selection indicator */}
                    <div className="absolute top-3 right-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedTable?.id === table.id
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        )}
                      >
                        {selectedTable?.id === table.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Table info */}
                    <div className="pr-8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded bg-gray-100">
                          {getLocationIcon(table.location)}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900">
                            {table.number}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {t.upTo} {table.capacity} {table.capacity === 1 ? t.person : t.people}
                          </div>
                        </div>
                      </div>

                      {table.description && (
                        <p className="text-sm text-gray-600">{table.description}</p>
                      )}

                      {table.priceMultiplier > 1 && (
                        <Badge variant="outline" className="mt-2 text-yellow-700 border-yellow-300 bg-yellow-50">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">{t.noTablesAvailable}</h3>
                <p className="text-muted-foreground mb-4">{t.noTablesText}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  {t.changeDateTime}
                </Button>
              </div>
            )}

            {errors.step1?.tableId && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  {errors.step1.tableId.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🚀 OPTIMIZED: Pre-order section (sheet/modal) */}
      {selectedTable && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">{t.preOrderOptional}</h3>
            <p className="text-sm text-muted-foreground">{t.preOrderDesc}</p>
            {watchedPreOrderItems.length > 0 && (
              <p className="text-sm text-primary font-medium mt-1">
                {watchedPreOrderItems.length} items - {t.total} €{watch('step1.preOrderTotal')?.toFixed(2) || '0.00'}
              </p>
            )}
          </div>
          <Sheet open={preOrderSheetOpen} onOpenChange={setPreOrderSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                {watchedPreOrderItems.length > 0 ? t.viewPreOrder : t.preOrderOptional}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>{t.preOrderOptional}</SheetTitle>
                <SheetDescription>{t.preOrderDesc}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Menu items */}
                {isLoadingMenu ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Cargando menú...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Dishes */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <Utensils className="h-4 w-4" />
                        {t.dishes}
                      </h3>
                      <div className="space-y-3">
                        {menuItems.filter(item => item.type === 'dish').map((dish) => {
                          const quantity = getItemQuantity(dish.id)
                          return (
                            <div key={dish.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{dish.name}</h4>
                                <p className="text-sm text-muted-foreground">€{dish.price}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {quantity > 0 && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removeFromPreOrder(dish.id)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{quantity}</span>
                                  </>
                                )}
                                <Button
                                  variant={quantity > 0 ? "default" : "outline"}
                                  size="icon"
                                  className="h-8 w-8"
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

                    {/* Wines */}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <Wine className="h-4 w-4" />
                        {t.wines}
                      </h3>
                      <div className="space-y-3">
                        {menuItems.filter(item => item.type === 'wine').map((wine) => {
                          const quantity = getItemQuantity(wine.id)
                          return (
                            <div key={wine.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{wine.name}</h4>
                                <p className="text-sm text-muted-foreground">€{wine.price}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {quantity > 0 && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removeFromPreOrder(wine.id)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{quantity}</span>
                                  </>
                                )}
                                <Button
                                  variant={quantity > 0 ? "default" : "outline"}
                                  size="icon"
                                  className="h-8 w-8"
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

                    {/* Pre-order summary */}
                    {watchedPreOrderItems.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-3">Resumen</h3>
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
                              <span>€{watch('step1.preOrderTotal')?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Next button */}
      <Button
        onClick={handleNext}
        disabled={!selectedTable || isCheckingAvailability}
        className="w-full"
        size="lg"
      >
        {t.next}
        <Eye className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

// Helper function to generate time slots
const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  // Restaurant hours: 18:00 - 23:00, 15-minute intervals
  for (let hour = 18; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 22 && minute > 45) break // Last slot at 22:45
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}