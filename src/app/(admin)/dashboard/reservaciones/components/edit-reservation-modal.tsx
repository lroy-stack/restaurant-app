'use client'

import { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { useBusinessHours } from '@/hooks/useBusinessHours'
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
  Loader2,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Search,
  Utensils,
  Wine,
  Coffee
} from 'lucide-react'
import { useTables } from '@/hooks/useTables'
import { useTableAvailability } from '@/hooks/useTableAvailability'
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
  // 🔧 MULTI-TABLE SUPPORT: Support both legacy and new formats
  tableId?: string           // Legacy single table (backward compatibility)
  tableIds?: string[]        // Modern multiple tables array
  tables: {                  // Legacy single table info
    id: string
    number: string
    capacity: number
    location: 'TERRACE_CAMPANARI' | 'SALA_VIP' | 'TERRACE_JUSTICIA' | 'SALA_PRINCIPAL'
  } | null
  allTables?: any[]          // Modern multiple tables info
  reservation_items: ReservationItem[]
  createdAt: string
  updatedAt: string
}

interface EditReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation | null
  onSave: (id: string, data: any) => Promise<boolean>
}

interface EditFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  date: string
  time: string
  // 🔧 MULTI-TABLE SUPPORT: Switch to multiple tables
  tableIds: string[]        // Modern multiple tables array
  status: string
  specialRequests: string
  preOrderItems: PreOrderItem[]
  preferredZone?: string    // NEW: Zone preference
}

// 🚀 CRITICAL FIX: Timezone-consistent helper functions

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

// 🚀 UI/UX IMPROVEMENT: Group time slots by hour for better navigation
function groupTimeSlotsByHour(timeSlots: string[]) {
  const grouped = timeSlots.reduce((acc, slot) => {
    const hour = slot.split(':')[0]
    if (!acc[hour]) acc[hour] = []
    acc[hour].push(slot)
    return acc
  }, {} as Record<string, string[]>)

  return Object.keys(grouped)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(hour => ({
      hour,
      slots: grouped[hour].sort()
    }))
}

// Componente para editar pre-orden
interface PreOrderEditorProps {
  menuItems: MenuItem[]
  currentReservationItems: ReservationItem[]
  onItemsChange: (items: PreOrderItem[]) => void
  loadingMenuItems: boolean
}

interface PreOrderEditorRef {
  syncWithParent: () => void
  getCurrentItems: () => PreOrderItem[]
}

const PreOrderEditor = forwardRef<PreOrderEditorRef, PreOrderEditorProps>(
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
        <PopoverContent className="w-[400px] p-0">
          <Command className="max-h-[300px]">
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
                  <p className="text-xs">Verifique la configuración del menú</p>
                </div>
              ) : (
                Object.entries(groupedMenuItems).map(([type, items]) => {
                  const typeLabel = type === 'FOOD' ? 'Comida' :
                                  type === 'WINE' ? 'Vinos' : 'Bebidas'
                  const IconComponent = type === 'WINE' ? Wine :
                                      type === 'BEVERAGE' ? Coffee : Utensils

                  return (
                    <CommandGroup key={type}>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {typeLabel} ({items.length})
                      </div>
                      {items.map((menuItem) => (
                        <CommandItem
                          key={menuItem.id}
                          value={menuItem.name}
                          onSelect={() => addPreOrderItem(menuItem)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{menuItem.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {menuItem.menu_categories.name}
                              </Badge>
                            </div>
                            <span className="text-sm font-medium">
                              €{menuItem.price.toFixed(2)}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                })
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

PreOrderEditor.displayName = 'PreOrderEditor'

export function EditReservationModal({ isOpen, onClose, reservation, onSave }: EditReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loadingMenuItems, setLoadingMenuItems] = useState(false)
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([])
  const preOrderEditorRef = useRef<PreOrderEditorRef>(null)

  // 🔧 NEW: Active zones state
  const [activeZones, setActiveZones] = useState<any[]>([])
  const [loadingZones, setLoadingZones] = useState(false)
  const { tables } = useTables()
  const { maxPartySize } = useBusinessHours()

  // 🔧 NEW: Table selection logic - same as customer modal
  const getMaxTablesForPartySize = (partySize: number): number => {
    if (partySize <= 4) return 1    // 1-4 personas: 1 mesa suficiente
    if (partySize <= 8) return 2    // 5-8 personas: máximo 2 mesas
    return 3                        // 9-12 personas: máximo 3 mesas
  }

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EditFormData>()

  // Table availability checking - moved after useForm initialization
  const watchedDate = watch('date')
  const watchedTime = watch('time')
  const watchedPartySize = watch('partySize')
  const watchedTableIds = watch('tableIds')


  // 🔧 NEW: Calculate max tables allowed based on party size
  const maxTablesAllowed = getMaxTablesForPartySize(watchedPartySize || 1)

  const {
    tables: availableTables,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability
  } = useTableAvailability(
    watchedDate || '',
    watchedTime || '',
    watchedPartySize || 1
    // 🚀 NO ZONE PARAMETER: Show ALL available tables for admin flexibility
  )

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

  // 🔧 NEW: Load active zones from API (same logic as customer modal)
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

  // Initialize form when reservation changes
  useEffect(() => {
    if (reservation) {

      // 🚀 FIXED: Properly extract time from timestamp with Madrid timezone
      const reservationDate = formatDateForInput(reservation.date)
      const reservationTime = formatTimeForInput(reservation.time)

      // Initialize preOrderItems from existing reservation items
      const initialPreOrderItems: PreOrderItem[] = reservation.reservation_items.map(item => ({
        menuItemId: item.menu_items.id,
        quantity: item.quantity,
        notes: item.notes
      }))
      setPreOrderItems(initialPreOrderItems)

      // 🔧 MULTI-TABLE SUPPORT: Initialize with tableIds array (backward compatibility)
      // 🔧 FIXED: Correct initialization order based on DB structure
      const initialTableIds = reservation.table_ids?.length > 0 ?
        reservation.table_ids :                          // ✅ PRIMARY: DB field table_ids array
        reservation.tableIds?.length > 0 ?
        reservation.tableIds :                           // Modern: use tableIds array (if mapped)
        reservation.tableId ? [reservation.tableId] :   // Legacy: convert single tableId to array
        []                                               // Fallback: empty array


      reset({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        partySize: reservation.partySize,
        date: reservationDate,
        time: reservationTime, // 🚀 FIXED: Now shows correct time in placeholder
        tableIds: initialTableIds,  // 🔧 NEW: Use multiple tables array
        status: reservation.status,
        specialRequests: reservation.specialRequests || '',
        preOrderItems: initialPreOrderItems
      })

      // 🐛 DEBUG: Verify form was reset correctly
      setTimeout(() => {
        const formTableIds = watch('tableIds')
        console.log('🔍 DEBUG - Form tableIds after reset:', formTableIds)
        console.log('🔍 DEBUG - Form tableIds type:', typeof formTableIds, Array.isArray(formTableIds))
      }, 100)
    }
  }, [reservation, reset])

  // Load available time slots when date changes
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

  // 🔍 DEBUG: Validation like customer modal + zone filtering
  const hasValidAvailabilityData = watchedDate &&
                                   watchedTime &&
                                   watchedPartySize &&
                                   watchedDate.match(/^\d{4}-\d{2}-\d{2}$/) &&
                                   watchedTime.match(/^\d{2}:\d{2}$/)


  // 🚀 FIXED: Combine available tables + current reservation tables
  const currentReservationTableIds = reservation?.table_ids || []
  const currentReservationTables = tables.filter(table =>
    currentReservationTableIds.includes(table.id)
  ).map(table => ({
    id: table.id,
    tableId: table.id,
    number: table.number,
    tableNumber: table.number,
    capacity: table.capacity,
    location: table.location,
    zone: table.location,
    status: 'available' // Always show current tables as available for editing
  }))

  // Merge available tables from API + current reservation tables (remove duplicates)
  const allAvailableTables = hasValidAvailabilityData && availableTables?.length > 0 ?
    [...availableTables.filter(table => table.status === 'available'), ...currentReservationTables]
      .filter((table, index, self) =>
        self.findIndex(t => (t.id || t.tableId) === (table.id || table.tableId)) === index
      ) : currentReservationTables

  const tableOptions = allAvailableTables
    .filter(table => {
      // Zone filtering if selected
      const tableLocation = table.location || table.zone
      const selectedZone = watch('preferredZone')
      return !selectedZone || tableLocation === selectedZone
    })
    .sort((a, b) => {
      const aNum = parseInt((a.number || a.tableNumber).replace(/[^0-9]/g, ''))
      const bNum = parseInt((b.number || b.tableNumber).replace(/[^0-9]/g, ''))
      return aNum - bNum
    })

  const onSubmit = async (data: EditFormData) => {
    if (!reservation) return

    setIsLoading(true)
    try {
      // 🚀 FIXED: Create datetime with Madrid timezone
      const madridDateTime = createReservationMadridDate(data.date, data.time)
      const dateTime = madridDateTime.toISOString()

      // Get current items directly from PreOrderEditor (bypasses async setState)
      const currentPreOrderItems = preOrderEditorRef.current?.getCurrentItems() || []

      // 🔧 FASE 4: Validate table selection with business rules
      if (!data.tableIds || data.tableIds.length === 0) {
        toast.error('Debe seleccionar al menos una mesa')
        return
      }

      // 🔧 Validate table limit based on party size
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
        status: data.status,
        specialRequests: data.specialRequests || null,
        preOrderItems: currentPreOrderItems
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
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Editar Reservación #{reservation.id.slice(-8)}
          </DialogTitle>
          {currentStatus && (
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre Completo *</Label>
                  <Input
                    id="customerName"
                    {...register('customerName', { required: 'El nombre es requerido' })}
                    className={errors.customerName ? 'border-destructive' : ''}
                  />
                  {errors.customerName && (
                    <span className="text-sm text-destructive">{errors.customerName.message}</span>
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
                    className={errors.customerEmail ? 'border-destructive' : ''}
                  />
                  {errors.customerEmail && (
                    <span className="text-sm text-destructive">{errors.customerEmail.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Teléfono *</Label>
                  <Input
                    id="customerPhone"
                    {...register('customerPhone', { required: 'El teléfono es requerido' })}
                    className={errors.customerPhone ? 'border-destructive' : ''}
                  />
                  {errors.customerPhone && (
                    <span className="text-sm text-destructive">{errors.customerPhone.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partySize">Comensales *</Label>
                  <Input
                    id="partySize"
                    type="number"
                    min="1"
                    max={maxPartySize.toString()}
                    {...register('partySize', {
                      required: 'Número requerido',
                      min: { value: 1, message: 'Mínimo 1' },
                      max: { value: maxPartySize, message: `Máximo ${maxPartySize}` },
                      valueAsNumber: true
                    })}
                    className={errors.partySize ? 'border-destructive' : ''}
                  />
                  {errors.partySize && (
                    <span className="text-sm text-destructive">{errors.partySize.message}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles de la Reservación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date', { required: 'La fecha es requerida' })}
                    className={errors.date ? 'border-destructive' : ''}
                  />
                  {errors.date && (
                    <span className="text-sm text-destructive">{errors.date.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Select
                    value={watch('time')}
                    onValueChange={(value) => setValue('time', value)}
                    disabled={loadingTimeSlots || timeSlots.length === 0}
                  >
                    <SelectTrigger className={errors.time ? 'border-destructive' : ''}>
                      <SelectValue placeholder={loadingTimeSlots ? 'Cargando...' : 'Seleccionar hora'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[240px]">
                      {loadingTimeSlots ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Cargando...
                        </SelectItem>
                      ) : timeSlots.length === 0 ? (
                        <SelectItem value="no-slots" disabled>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Sin horarios
                        </SelectItem>
                      ) : (
                        groupTimeSlotsByHour(timeSlots).map((hourGroup, index) => [
                          // Hour separator
                          <div key={`sep-${hourGroup.hour}`} className={`px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/30 ${index > 0 ? 'mt-1' : ''}`}>
                            {hourGroup.hour}:00h
                          </div>,
                          // Time slots for this hour
                          ...hourGroup.slots.map((timeSlot) => (
                            <SelectItem key={timeSlot} value={timeSlot} className="py-1.5 pl-6">
                              <span className="font-mono text-sm">{timeSlot}</span>
                            </SelectItem>
                          ))
                        ]).flat()
                      )}
                    </SelectContent>
                  </Select>
                  {errors.time && (
                    <span className="text-sm text-destructive">{errors.time.message}</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
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
                  placeholder="Notas adicionales..."
                  rows={2}
                  {...register('specialRequests')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Table Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Label>
                  Mesas *
                  {watch('tableIds')?.length > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({watch('tableIds').length}/{maxTablesAllowed} mesa{watch('tableIds').length > 1 ? 's' : ''} seleccionada{watch('tableIds').length > 1 ? 's' : ''})
                    </span>
                  )}
                </Label>
              </CardTitle>
              <div className="text-sm text-muted-foreground mb-3">
                {watchedPartySize <= 4 && <p>👥 Grupos pequeños (1-4 personas): máximo 1 mesa</p>}
                {watchedPartySize > 4 && watchedPartySize <= 8 && <p>👥 Grupos medianos (5-8 personas): máximo 2 mesas</p>}
                {watchedPartySize > 8 && <p>👥 Grupos grandes (9+ personas): máximo 3 mesas</p>}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Verificando disponibilidad...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">


                  {tableOptions.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {hasValidAvailabilityData ? 'Sin mesas disponibles' : 'Complete fecha y hora'}
                      </span>
                    </div>
                  ) : (
                    tableOptions.map((table) => {
                      const tableId = table.id || table.tableId
                      const tableNumber = table.number || table.tableNumber || 'N/A'
                      const tableCapacity = table.capacity || 0
                      const tableLocation = table.location || table.zone || 'SIN_ZONA'

                      const currentTableIds = watch('tableIds') || []
                      const isSelected = currentTableIds.includes(tableId)
                      const canSelectMore = currentTableIds.length < maxTablesAllowed
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
                              setValue('tableIds', currentTables.filter(id => id !== tableId))
                            } else if (canSelectMore) {
                              setValue('tableIds', [...currentTables, tableId])
                            } else {
                              const watchedPartySize = watch('partySize') || 0
                              const reason = watchedPartySize <= 4
                                ? 'Para grupos pequeños (1-4 personas) solo necesitas 1 mesa'
                                : watchedPartySize <= 8
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
                    })
                  )}
                </div>
              )}
              {!watch('tableIds')?.length && (
                <p className="text-sm text-destructive mt-2">Debe seleccionar al menos una mesa</p>
              )}
              {availabilityError && (
                <p className="text-sm text-destructive mt-2">{availabilityError}</p>
              )}
            </CardContent>
          </Card>

          {/* Pre-Order Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pre-Orden (Opcional)</CardTitle>
            </CardHeader>
            <CardContent>
              <PreOrderEditor
                ref={preOrderEditorRef}
                menuItems={menuItems}
                currentReservationItems={reservation?.reservation_items || []}
                onItemsChange={setPreOrderItems}
                loadingMenuItems={loadingMenuItems}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}