'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Check, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Utensils,
  Wine,
  ShoppingCart,
  Plus,
  Minus,
  Users,
  Square,
  TreePine,
  Building,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/validations/reservation-professional'
import type { AvailabilityData } from '@/hooks/useReservations'
import { useCart } from '@/hooks/useCart'

interface ReservationStepTwoProps {
  language: Language
  onNext: () => void
  onPrevious: () => void
  availability: AvailabilityData | null
  selectedDate: string
  selectedTime: string
  partySize: number
  menuItems: any[]
  isLoadingMenu: boolean
}

// Modern location icons using Lucide - 2025 best practices
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
    title: 'Seleccionar Mesa y Menú',
    subtitle: 'Elige tu mesa y añade platos opcionales',
    tablesAvailable: 'mesas disponibles para tu solicitud',
    recommendedTables: 'Mesas Recomendadas',
    tableNumber: 'Mesa',
    upTo: 'hasta',
    people: 'personas',
    preOrderTitle: 'Pre-pedido (Opcional)',
    preOrderSubtitle: 'Selecciona platos y vinos para agilizar tu experiencia',
    dishes: 'Platos',
    wines: 'Vinos',
    preOrderSummary: 'Resumen del Pre-pedido',
    total: 'Total:',
    previous: 'Anterior',
    next: 'Siguiente',
    noTables: 'Sin mesas disponibles',
    noTablesText: 'No hay mesas disponibles para la fecha y hora seleccionadas.',
    changeTime: 'Cambiar horario'
  },
  en: {
    title: 'Select Table and Menu', 
    subtitle: 'Choose your table and add optional dishes',
    tablesAvailable: 'tables available for your request',
    recommendedTables: 'Recommended Tables',
    tableNumber: 'Table',
    upTo: 'up to',
    people: 'people',
    preOrderTitle: 'Pre-order (Optional)',
    preOrderSubtitle: 'Select dishes and wines to streamline your experience',
    dishes: 'Dishes',
    wines: 'Wines', 
    preOrderSummary: 'Pre-order Summary',
    total: 'Total:',
    previous: 'Previous',
    next: 'Next',
    noTables: 'No tables available',
    noTablesText: 'No tables available for selected date and time.',
    changeTime: 'Change time'
  },
  de: {
    title: 'Tisch und Menü wählen',
    subtitle: 'Wählen Sie Ihren Tisch und optionale Gerichte',
    tablesAvailable: 'Tische für Ihre Anfrage verfügbar',
    recommendedTables: 'Empfohlene Tische',
    tableNumber: 'Tisch',
    upTo: 'bis zu',
    people: 'Personen',
    preOrderTitle: 'Vorbestellung (Optional)',
    preOrderSubtitle: 'Wählen Sie Gerichte und Weine für ein optimales Erlebnis',
    dishes: 'Gerichte',
    wines: 'Weine',
    preOrderSummary: 'Vorbestellungsübersicht', 
    total: 'Gesamt:',
    previous: 'Zurück',
    next: 'Weiter',
    noTables: 'Keine Tische verfügbar',
    noTablesText: 'Keine Tische für gewähltes Datum und Uhrzeit verfügbar.',
    changeTime: 'Zeit ändern'
  }
}

export default function ReservationStepTwo({
  language,
  onNext,
  onPrevious,
  availability,
  selectedDate,
  selectedTime,
  partySize,
  menuItems,
  isLoadingMenu
}: ReservationStepTwoProps) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useFormContext()

  const { getCartItems, clearCart } = useCart()
  const t = content[language]

  const watchedTableId = watch('stepTwo.tableId')
  const watchedPreOrderItems = watch('stepTwo.preOrderItems') || []

  const [selectedTable, setSelectedTable] = useState<any>(null)

  // Load cart items on component mount
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

      // Use existing functions (VERIFIED: lines 167-168)
      setValue('stepTwo.preOrderItems', preOrderItems)
      updatePreOrderTotals(preOrderItems)
    }
  }, [setValue, getCartItems])

  // Update form when table is selected
  const handleTableSelect = (table: any) => {
    setSelectedTable(table)
    setValue('stepTwo.tableId', table.id)
  }

  // Handle pre-order item addition
  const addToPreOrder = (item: any) => {
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
  }

  // Handle pre-order item removal  
  const removeFromPreOrder = (itemId: string) => {
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
  }

  // Update totals
  const updatePreOrderTotals = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setValue('stepTwo.preOrderTotal', total)
    setValue('stepTwo.hasPreOrder', items.length > 0)
  }

  const handleNext = async () => {
    const isValid = await trigger('stepTwo')
    if (isValid) {
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

  if (!availability) {
    return null
  }

  if (!availability.available) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">{t.noTables}</h3>
          <p className="text-muted-foreground mb-6">{t.noTablesText}</p>
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t.changeTime}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {formatDate(selectedDate)} • {selectedTime} • {partySize} {partySize === 1 ? 'persona' : 'personas'}
          </div>
        </CardHeader>
        <CardContent>
          {/* Availability Summary */}
          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg mb-6">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">
              {availability.totalTables} {t.tablesAvailable}
            </span>
          </div>

          {/* Modern Card Grid - Mobile-first Responsive */}
          {availability.recommendations?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-lg">{t.recommendedTables}</h3>
              
              {/* Responsive Grid: 1 column mobile → 2 tablet → 3 desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availability.recommendations.map((table) => (
                  <div
                    key={table.id}
                    className={cn(
                      "relative p-3 border rounded-lg cursor-pointer transition-all duration-200",
                      "hover:shadow-sm min-h-[70px]", // Más compacta
                      "active:scale-[0.98] touch-manipulation", // Touch feedback
                      selectedTable?.id === table.id
                        ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-primary/30 bg-white"
                    )}
                    onClick={() => handleTableSelect(table)}
                  >
                    {/* Selection Indicator */}
                    <div className="absolute top-3 right-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        selectedTable?.id === table.id
                          ? "bg-primary border-primary"
                          : "border-gray-300"
                      )}>
                        {selectedTable?.id === table.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="pr-8"> {/* Right padding for selection indicator */}
                      {/* Location Icon + Table Number - COMPACTO */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded bg-gray-100">
                          {getLocationIcon(table.location)}
                        </div>
                        <div>
                          <div className="font-bold text-base text-gray-900">
                            {table.number}
                          </div>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {table.capacity}
                          </div>
                        </div>
                      </div>
                      
                      {/* Premium Badge */}
                      {table.priceMultiplier > 1 && (
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
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

      {/* Pre-order Section */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
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
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
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
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Wine className="h-4 w-4" />
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
                <h3 className="font-medium text-green-900 mb-3">{t.preOrderSummary}</h3>
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
      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t.previous}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedTable}
          className="flex-1"
        >
          {t.next}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}