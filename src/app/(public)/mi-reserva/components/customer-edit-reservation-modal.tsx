'use client'

import { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { useTableAvailability } from '@/hooks/useTableAvailability'
import {
  Save,
  X,
  Users,
  Calendar,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Search,
  Utensils,
  Wine,
  Coffee,
  Edit,
  MapPin
} from 'lucide-react'
import { getAvailableTimeSlots } from '@/lib/business-hours-client'

interface MenuItem {
  id: string
  name: string
  price: number
  isAvailable: boolean
  categoryId: string
  menu_categories: {
    name: string
    type: 'FOOD' | 'WINE' | 'BEVERAGE'
  }
}

interface ReservationItem {
  id: string
  quantity: number
  notes?: string
  menu_items: MenuItem
}

interface PreOrderItem {
  menuItemId: string
  quantity: number
  notes?: string
}

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
  reservation_items: ReservationItem[]
  createdAt: string
  updatedAt: string
}

interface CustomerEditReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onSave: (data: any) => Promise<boolean>
}

interface EditFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  tableIds: string[] // 🔧 FIXED: Support multiple table selection
  preferredZone: string // 🔧 NEW: Zone selection for filtering tables
  specialRequests: string
  preOrderItems: PreOrderItem[]
}

// 🚀 CRITICAL FIX: Timezone-consistent helper functions (reusing from admin modal)

function createReservationMadridDate(dateStr: string, timeStr?: string): Date {
  try {
    if (timeStr) {
      // 🚀 CRITICAL FIX: Use same Date.UTC pattern as API
      // Parse date/time components and create as UTC timestamp
      const [year, month, day] = dateStr.split('-')
      const [hour, minute] = timeStr.split(':')
      return new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1, // JavaScript months are 0-indexed
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      ))
    } else {
      // Just date - create at midnight UTC
      const [year, month, day] = dateStr.split('-')
      return new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        0, 0, 0
      ))
    }
  } catch (error) {
    console.error('Error creating Madrid date:', error, { dateStr, timeStr })
    return new Date() // Fallback
  }
}

function formatTimeForInput(dateTimeString: string): string {
  try {
    // 🚀 SIMPLIFIED: Direct UTC parsing since DB stores UTC timestamps
    const date = new Date(dateTimeString)
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } catch (error) {
    console.error('Error formatting time for input:', error, dateTimeString)
    return '19:00' // Fallback
  }
}

function formatDateForInput(dateTimeString: string): string {
  try {
    // 🚀 SIMPLIFIED: Direct UTC parsing since DB stores UTC timestamps
    const date = new Date(dateTimeString)
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.error('Error formatting date for input:', error, dateTimeString)
    return new Date().toISOString().split('T')[0] // Fallback
  }
}

const locationLabels = {
  TERRACE_CAMPANARI: 'Terraza Campanari',
  SALA_VIP: 'Sala VIP',
  TERRACE_JUSTICIA: 'Terraza Justicia',
  SALA_PRINCIPAL: 'Sala Principal'
}

// Componente para editar pre-orden (versión customer simplificada)
interface CustomerPreOrderEditorProps {
  menuItems: MenuItem[]
  currentReservationItems: ReservationItem[]
  onItemsChange: (items: PreOrderItem[]) => void
  loadingMenuItems: boolean
}

interface CustomerPreOrderEditorRef {
  syncWithParent: () => void
  getCurrentItems: () => PreOrderItem[]
}

const CustomerPreOrderEditor = forwardRef<CustomerPreOrderEditorRef, CustomerPreOrderEditorProps>(
  ({ menuItems, currentReservationItems, onItemsChange, loadingMenuItems }, ref) => {
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Convert ReservationItem[] to working format for editing
  const [workingItems, setWorkingItems] = useState<PreOrderItem[]>([])

  // Initialize working items from current reservation items
  useEffect(() => {
    const convertedItems: PreOrderItem[] = currentReservationItems.map(item => ({
      menuItemId: item.menu_items.id,
      quantity: item.quantity,
      notes: item.notes
    }))
    setWorkingItems(convertedItems)
  }, [currentReservationItems])

  // Update working items (internal state only - NO AUTO-SYNC)
  const updateWorkingItems = (newItems: PreOrderItem[]) => {
    setWorkingItems(newItems)
    // NO onItemsChange call here - prevents autoguardado
  }

  // Expose sync function and direct access to parent via ref
  useImperativeHandle(ref, () => ({
    syncWithParent: () => onItemsChange(workingItems),
    getCurrentItems: () => workingItems // Direct access to current state
  }), [workingItems, onItemsChange])

  // Agregar nuevo item
  const addPreOrderItem = (menuItem: MenuItem) => {
    const existingItem = workingItems.find(item => item.menuItemId === menuItem.id)

    if (existingItem) {
      // Incrementar cantidad si ya existe
      updateQuantity(menuItem.id, existingItem.quantity + 1)
    } else {
      // Agregar nuevo item
      const newItem: PreOrderItem = {
        menuItemId: menuItem.id,
        quantity: 1,
        notes: undefined
      }
      const newItems = [...workingItems, newItem]
      updateWorkingItems(newItems)
    }
    setIsAddingItem(false)
    setSearchTerm('')
  }

  // Actualizar cantidad
  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(menuItemId)
      return
    }

    const updatedItems = workingItems.map(item =>
      item.menuItemId === menuItemId ? { ...item, quantity: newQuantity } : item
    )
    updateWorkingItems(updatedItems)
  }

  // Remover item
  const removeItem = (menuItemId: string) => {
    const filteredItems = workingItems.filter(item => item.menuItemId !== menuItemId)
    updateWorkingItems(filteredItems)
  }

  // Actualizar notas
  const updateNotes = (menuItemId: string, notes: string) => {
    const updatedItems = workingItems.map(item =>
      item.menuItemId === menuItemId ? { ...item, notes: notes || undefined } : item
    )
    updateWorkingItems(updatedItems)
  }

  // Obtener información del menu item
  const getMenuItemInfo = (menuItemId: string) => {
    return menuItems.find(item => item.id === menuItemId)
  }

  // Calcular total
  const calculateTotal = () => {
    return workingItems.reduce((total, item) => {
      const menuItem = getMenuItemInfo(item.menuItemId)
      return total + (menuItem?.price || 0) * item.quantity
    }, 0)
  }

  // Filtrar y agrupar items por categoría para el selector
  const groupedMenuItems = useMemo(() => {
    const filteredItems = menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      item.menu_categories.type !== 'BEVERAGE' // Excluir bebidas de pre-orden
    )

    return filteredItems.reduce((groups, item) => {
      const type = item.menu_categories.type
      if (!groups[type]) groups[type] = []
      groups[type].push(item)
      return groups
    }, {} as Record<string, MenuItem[]>)
  }, [menuItems, searchTerm])

  return (
    <div className="space-y-4">
      {/* Header con total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Pre-Orden ({workingItems.length} productos)</span>
        </div>
        {workingItems.length > 0 && (
          <div className="text-lg font-semibold">
            Total: €{calculateTotal().toFixed(2)}
          </div>
        )}
      </div>

      {/* Items actuales */}
      {workingItems.length > 0 && (
        <div className="space-y-2">
          {workingItems.map((item) => {
            const menuItem = getMenuItemInfo(item.menuItemId)
            if (!menuItem) return null

            const IconComponent = menuItem.menu_categories.type === 'WINE' ? Wine :
                               menuItem.menu_categories.type === 'BEVERAGE' ? Coffee : Utensils

            return (
              <Card key={`preorder-${item.menuItemId}-${workingItems.findIndex(i => i.menuItemId === item.menuItemId)}`} className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {menuItem.menu_categories.name}
                      </Badge>
                      <span className="font-medium">{menuItem.name}</span>
                      <span className="text-sm text-muted-foreground">
                        €{menuItem.price.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.menuItemId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <Input
                        placeholder="Notas especiales..."
                        value={item.notes || ''}
                        onChange={(e) => updateNotes(item.menuItemId, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Botón agregar producto */}
      <Popover open={isAddingItem} onOpenChange={(open) => {
        setIsAddingItem(open)
        if (!open) setSearchTerm('')
      }}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full" disabled={loadingMenuItems}>
            <Plus className="h-4 w-4 mr-2" />
            {loadingMenuItems ? 'Cargando menú...' : `Agregar Producto (${menuItems.length} disponibles)`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl p-0" side="bottom">
          <Command className="max-h-[50vh] sm:max-h-[60vh]">
            <CommandInput
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="overflow-y-auto">
              <CommandEmpty>
                {loadingMenuItems ? 'Cargando productos...' : 'No se encontraron productos.'}
              </CommandEmpty>

              {loadingMenuItems ? (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando menú...
                  </div>
                </div>
              ) : !loadingMenuItems && Object.keys(groupedMenuItems).length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay productos disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  {Object.entries(groupedMenuItems).map(([type, items]) => {
                    const typeLabel = type === 'FOOD' ? 'Platos' : 'Vinos'
                    const IconComponent = type === 'WINE' ? Wine : Utensils

                    return (
                      <div key={type} className="border-r border-border last:border-r-0">
                        <div className="sticky top-0 bg-background border-b px-3 py-2">
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <IconComponent className="h-4 w-4 text-primary" />
                            {typeLabel} ({items.length})
                          </div>
                        </div>
                        <div className="p-1">
                          {items.map((menuItem) => (
                            <div
                              key={menuItem.id}
                              onClick={() => addPreOrderItem(menuItem)}
                              className="p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md transition-colors border-b border-border/50 last:border-b-0"
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium text-sm leading-tight">{menuItem.name}</span>
                                  <span className="text-sm font-semibold text-primary ml-2 flex-shrink-0">
                                    €{menuItem.price.toFixed(2)}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs w-fit">
                                  {menuItem.menu_categories.name}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {workingItems.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No hay productos en la pre-orden</p>
          <p className="text-sm">Usa el botón de arriba para agregar productos</p>
        </div>
      )}
    </div>
  )
})

CustomerPreOrderEditor.displayName = 'CustomerPreOrderEditor'

export function CustomerEditReservationModal({ isOpen, onClose, reservation, onSave }: CustomerEditReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loadingMenuItems, setLoadingMenuItems] = useState(false)
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([])
  const preOrderEditorRef = useRef<CustomerPreOrderEditorRef>(null)
  const { maxPartySize } = useBusinessHours()

  // 🔧 NEW: Active zones state
  const [activeZones, setActiveZones] = useState<any[]>([])
  const [loadingZones, setLoadingZones] = useState(false)

  // 🔧 NEW: Table selection logic - exact same as other forms
  const getMaxTablesForPartySize = (partySize: number): number => {
    if (partySize <= 4) return 1    // 1-4 personas: 1 mesa suficiente
    if (partySize <= 8) return 2    // 5-8 personas: máximo 2 mesas
    return 3                        // 9-12 personas: máximo 3 mesas
  }

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EditFormData>()

  // Table availability checking
  const availabilityDate = watch('date')
  const availabilityTime = watch('time')
  const availabilityPartySize = watch('partySize')

  // 🔧 NEW: Calculate max tables allowed based on party size
  const maxTablesAllowed = getMaxTablesForPartySize(availabilityPartySize || 1)

  // 🚀 CRITICAL FIX: Only call useTableAvailability with valid data
  const hasValidFormData = availabilityDate &&
                          availabilityTime &&
                          availabilityPartySize &&
                          availabilityDate.match(/^\d{4}-\d{2}-\d{2}$/) &&
                          availabilityTime.match(/^\d{2}:\d{2}$/)

  const {
    tables: availableTables,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability
  } = useTableAvailability(
    hasValidFormData ? availabilityDate : '',
    hasValidFormData ? availabilityTime : '',
    hasValidFormData ? availabilityPartySize : 1
    // 🚀 NO ZONE PARAMETER: Show ALL available tables regardless of previous zone
  )

  // Use table availability from API instead of basic capacity filtering
  const tableOptions = hasValidFormData && availableTables?.length > 0 ?
    availableTables
      .filter(table => table.status === 'available')
      .sort((a, b) => {
        const aNum = parseInt((a.number || a.tableNumber).replace(/[^0-9]/g, ''))
        const bNum = parseInt((b.number || b.tableNumber).replace(/[^0-9]/g, ''))
        return aNum - bNum
      }) : []

  // Load menu items function
  const loadMenuItems = async () => {
    try {
      setLoadingMenuItems(true)
      const response = await fetch('/api/menu/items?isAvailable=true')

      if (!response.ok) {
        throw new Error(`Failed to load menu items: ${response.status}`)
      }

      const data = await response.json()
      const items = Array.isArray(data) ? data : (data.items || [])

      const transformedItems: MenuItem[] = items
        .filter((item: any) => item.isAvailable && item.category && item.category.name && item.category.type)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          isAvailable: item.isAvailable,
          categoryId: item.categoryId,
          menu_categories: {
            name: item.category.name,
            type: item.category.type
          }
        }))

      setMenuItems(transformedItems)
    } catch (error) {
      console.error('Error loading menu items:', error)
      toast.error('Error al cargar el menú')
    } finally {
      setLoadingMenuItems(false)
    }
  }

  // Load menu items and active zones when modal opens (ONLY if not already loaded)
  useEffect(() => {
    if (isOpen) {
      // 🔧 OPTIMIZACIÓN: Solo cargar si no hay datos cargados
      if (menuItems.length === 0 && !loadingMenuItems) {
        loadMenuItems()
      }
      if (activeZones.length === 0 && !loadingZones) {
        loadActiveZones()
      }
    }
  }, [isOpen, menuItems.length, activeZones.length, loadingMenuItems, loadingZones])

  // 🔧 NEW: Load active zones from API (same logic as other forms)
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

  // Initialize form when reservation changes
  useEffect(() => {
    if (reservation) {
      const reservationDate = formatDateForInput(reservation.date)
      const reservationTime = formatTimeForInput(reservation.time)

      // Initialize preOrderItems from existing reservation items
      const initialPreOrderItems: PreOrderItem[] = reservation.reservation_items.map(item => ({
        menuItemId: item.menu_items.id,
        quantity: item.quantity,
        notes: item.notes
      }))
      setPreOrderItems(initialPreOrderItems)

      // 🔧 FIXED: Initialize with multiple tables support

      // 🐛 DEBUG: Log reservation data to verify field availability (Customer Modal)
      console.log('🔍 DEBUG - Customer Modal - Reservation tableIds fields:', {
        hasTableIds: !!reservation.tableIds,
        tableIds: reservation.tableIds,
        tableIdsLength: reservation.tableIds?.length,
        hasTableId: !!reservation.tableId,
        tableId: reservation.tableId,
        reservationKeys: Object.keys(reservation)
      })

      const tableIds = reservation.tableIds?.length > 0 ? reservation.tableIds :
                      reservation.tableId ? [reservation.tableId] : []

      console.log('🔍 DEBUG - Customer Modal - Final tableIds:', tableIds)

      // Determine preferred zone from current tables
      const preferredZone = reservation.allTables?.[0]?.location ||
                           reservation.tables?.location ||
                           'SALA_PRINCIPAL'

      reset({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        partySize: reservation.partySize,
        date: reservationDate,
        time: reservationTime,
        tableIds: tableIds,
        preferredZone: preferredZone,
        specialRequests: reservation.specialRequests || '',
        preOrderItems: initialPreOrderItems
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

  const onSubmit = async (data: EditFormData) => {
    if (!reservation) return

    setIsLoading(true)
    try {
      // 🚀 FIXED: Create datetime with Madrid timezone
      const madridDateTime = createReservationMadridDate(data.date, data.time)
      const dateTime = madridDateTime.toISOString()

      // Get current items directly from PreOrderEditor (bypasses async setState)
      const currentPreOrderItems = preOrderEditorRef.current?.getCurrentItems() || []

      // 🔧 FIXED: Validate table selection with business rules
      if (!data.tableIds || data.tableIds.length === 0) {
        toast.error('Debe seleccionar al menos una mesa')
        return
      }

      // 🔧 NEW: Validate table limit based on party size
      const maxAllowed = getMaxTablesForPartySize(data.partySize)
      if (data.tableIds.length > maxAllowed) {
        const reason = data.partySize <= 4
          ? 'Para grupos pequeños (1-4 personas) solo necesitas 1 mesa'
          : data.partySize <= 8
            ? 'Para grupos medianos (5-8 personas) máximo 2 mesas'
            : 'Máximo 3 mesas por reserva (grupos grandes)'
        toast.error(reason)
        return
      }

      const updateData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        partySize: data.partySize,
        date: dateTime,
        time: dateTime,
        tableIds: data.tableIds, // 🔧 FIXED: Send multiple table IDs
        specialRequests: data.specialRequests || null,
        preOrderItems: currentPreOrderItems,
        // Customer modifications always set status to PENDING for restaurant confirmation
        status: 'PENDING'
      }

      const success = await onSave(updateData)
      if (success) {
        toast.success('Modificación enviada exitosamente. Recibirás confirmación por email.')
        onClose()
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      toast.error('Error al modificar la reservación')
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
            <Edit className="h-5 w-5" />
            Modificar tu Reserva
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Important Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Importante: Pendiente de confirmación
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Cualquier modificación requerirá confirmación del restaurante.
                  Recibirás un nuevo email con los detalles actualizados.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Información Personal</h3>

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
                  max={maxPartySize.toString()}
                  {...register('partySize', {
                    required: 'El número de personas es requerido',
                    min: { value: 1, message: 'Mínimo 1 persona' },
                    max: { value: maxPartySize, message: `Máximo ${maxPartySize} personas` },
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
            <h3 className="text-lg font-medium text-foreground">Detalles de la Reserva</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'La fecha es requerida' })}
                  className={errors.date ? 'border-red-300' : ''}
                  min={new Date().toISOString().split('T')[0]} // No past dates
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
                  <span className="text-sm text-red-600">La hora es requerida</span>
                )}
                {!loadingTimeSlots && timeSlots.length === 0 && (
                  <p className="text-sm text-orange-600">No hay horarios disponibles para esta fecha</p>
                )}
              </div>
            </div>

            {/* Zone Selection - Only Active Zones */}
            <div className="space-y-2">
              <Label htmlFor="preferredZone">Zona Preferida</Label>
              <Select
                value={watch('preferredZone')}
                onValueChange={(value) => setValue('preferredZone', value)}
                disabled={loadingZones}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingZones ? "Cargando zonas..." : "Seleccionar zona"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingZones ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando zonas disponibles...
                      </div>
                    </SelectItem>
                  ) : activeZones.length === 0 ? (
                    <SelectItem value="no-zones" disabled>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        No hay zonas disponibles
                      </div>
                    </SelectItem>
                  ) : (
                    activeZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{zone.name?.es || zone.id}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!loadingZones && activeZones.length === 0 && (
                <p className="text-sm text-orange-600">No hay zonas activas disponibles</p>
              )}
            </div>

            {/* Table Selection - Multiple Tables Support */}
            <div className="space-y-3">
              <Label>
                Mesas *
                {watch('tableIds')?.length > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({watch('tableIds').length}/{maxTablesAllowed} mesa{watch('tableIds').length > 1 ? 's' : ''} seleccionada{watch('tableIds').length > 1 ? 's' : ''})
                  </span>
                )}
              </Label>

              {/* 🔧 NEW: Table limit info */}
              <div className="text-sm text-muted-foreground">
                {availabilityPartySize <= 4 && (
                  <p>👥 Grupos pequeños (1-4 personas): máximo 1 mesa</p>
                )}
                {availabilityPartySize > 4 && availabilityPartySize <= 8 && (
                  <p>👥 Grupos medianos (5-8 personas): máximo 2 mesas</p>
                )}
                {availabilityPartySize > 8 && (
                  <p>👥 Grupos grandes (9+ personas): máximo 3 mesas</p>
                )}
              </div>

              {isLoadingAvailability ? (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Verificando disponibilidad...</span>
                </div>
              ) : hasValidFormData && tableOptions.length === 0 ? (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                  <span className="text-sm text-muted-foreground">Sin mesas disponibles para esta fecha/hora</span>
                </div>
              ) : !hasValidFormData ? (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-lg">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Complete fecha, hora y comensales para ver mesas disponibles</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
                  {tableOptions
                    .filter(table => {
                      const tableLocation = table.location || table.zone
                      const selectedZone = watch('preferredZone')
                      return !selectedZone || tableLocation === selectedZone
                    })
                    .map((table) => {
                      const tableId = table.id || table.tableId
                      const tableNumber = table.number || table.tableNumber
                      const tableCapacity = table.capacity
                      const tableLocation = table.location || table.zone
                      // 🔧 CRITICAL FIX: Normalize IDs for proper comparison
                      const currentTableIds = watch('tableIds') || []
                      const isSelected = currentTableIds.includes(tableId) || currentTableIds.includes(String(tableId))
                      const currentTableCount = watch('tableIds')?.length || 0

                      // 🔧 NEW: Apply table limit logic (same as other forms)
                      const canSelectMore = currentTableCount < maxTablesAllowed
                      const isDisabled = !isSelected && !canSelectMore

                      return (
                        <Card
                          key={tableId}
                          className={`p-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-primary bg-primary/5'
                              : isDisabled
                                ? 'opacity-50 cursor-not-allowed bg-muted/20'
                                : 'hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            const currentTables = watch('tableIds') || []
                            if (isSelected) {
                              // Remove table
                              setValue('tableIds', currentTables.filter(id => id !== tableId))
                            } else if (canSelectMore) {
                              // Add table (only if under limit)
                              setValue('tableIds', [...currentTables, tableId])
                            } else {
                              // Show limit message (same as other forms)
                              const reason = availabilityPartySize <= 4
                                ? 'Para grupos pequeños (1-4 personas) solo necesitas 1 mesa'
                                : availabilityPartySize <= 8
                                  ? 'Para grupos medianos (5-8 personas) máximo 2 mesas'
                                  : 'Máximo 3 mesas por reserva (grupos grandes)'
                              toast.error(reason)
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Mesa {tableNumber}</span>
                              <span className="text-xs text-muted-foreground">
                                ({tableCapacity} pers.)
                              </span>
                            </div>
                            {isSelected ? (
                              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              </div>
                            ) : isDisabled ? (
                              <div className="w-4 h-4 rounded-full bg-muted border-2 border-muted-foreground/30 flex items-center justify-center">
                                <X className="w-2 h-2 text-muted-foreground/50" />
                              </div>
                            ) : null}
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {locationLabels[tableLocation as keyof typeof locationLabels]}
                            </Badge>
                          </div>
                        </Card>
                      )
                    })}
                </div>
              )}

              {hasValidFormData && !isLoadingAvailability && (
                <p className="text-sm text-muted-foreground">
                  {tableOptions.filter(table => {
                    const tableLocation = table.location || table.zone
                    const selectedZone = watch('preferredZone')
                    return !selectedZone || tableLocation === selectedZone
                  }).length > 0 ?
                    `${tableOptions.filter(table => {
                      const tableLocation = table.location || table.zone
                      const selectedZone = watch('preferredZone')
                      return !selectedZone || tableLocation === selectedZone
                    }).length} mesa${tableOptions.filter(table => {
                      const tableLocation = table.location || table.zone
                      const selectedZone = watch('preferredZone')
                      return !selectedZone || tableLocation === selectedZone
                    }).length > 1 ? 's' : ''} disponible${tableOptions.filter(table => {
                      const tableLocation = table.location || table.zone
                      const selectedZone = watch('preferredZone')
                      return !selectedZone || tableLocation === selectedZone
                    }).length > 1 ? 's' : ''}` :
                    'No hay mesas disponibles en la zona seleccionada'
                  }
                </p>
              )}

              {!watch('tableIds')?.length && (
                <span className="text-sm text-red-600">Debe seleccionar al menos una mesa</span>
              )}

              {availabilityError && (
                <p className="text-sm text-red-600">Error verificando disponibilidad: {availabilityError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
              <Textarea
                id="specialRequests"
                placeholder="Ej: Mesa junto a la ventana, celebración especial, alergias..."
                rows={3}
                {...register('specialRequests')}
              />
            </div>
          </div>

          {/* Pre-Orden Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Pre-Orden (Opcional)</h3>
            <CustomerPreOrderEditor
              ref={preOrderEditorRef}
              menuItems={menuItems}
              currentReservationItems={reservation?.reservation_items || []}
              onItemsChange={setPreOrderItems}
              loadingMenuItems={loadingMenuItems}
            />
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
              {isLoading ? 'Enviando...' : 'Enviar Modificación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}