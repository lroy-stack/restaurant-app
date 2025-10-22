import { create } from 'zustand'
import { getSupabaseHeaders } from '@/lib/supabase/config'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'

interface TableData {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_1' | 'MAIN_ROOM' | 'VIP_ROOM' | 'TERRACE_2'
  qrCode: string
  isActive: boolean
  restaurantId: string
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'
  statusNotes?: string
  estimatedFreeTime?: string
  // Position fields from database
  position_x?: number
  position_y?: number
  width?: number
  height?: number
  rotation?: number
  // 🔥 NUEVO: Añadir campo para mostrar información de reserva
  currentReservation?: {
    customerName: string
    partySize: number
    time: string
    status: string
  } | null
}

interface TableStore {
  // State
  tables: TableData[]
  loading: boolean

  // Actions
  loadTables: () => Promise<void>
  toggleTable: (tableId: string, isActive: boolean) => Promise<void>
  toggleZone: (location: string, activate: boolean) => Promise<void>
  updateTableStatus: (tableId: string, status: string, notes?: string, estimatedFreeTime?: string) => Promise<void>
  updateTablePosition: (tableId: string, position_x: number, position_y: number) => Promise<void>
  updateTableRotation: (tableId: string, rotation: number) => Promise<void>
}

export const useTableStore = create<TableStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      tables: [],
      loading: false,

      // Load tables from API - SINGLE SOURCE OF TRUTH
      loadTables: async () => {
        try {
          set({ loading: true })

          const response = await fetch('/api/tables/status', {
            headers: {
              // Schema handled by getSupabaseHeaders()
              // Schema handled by getSupabaseHeaders()
            }
          })

          if (!response.ok) {
            throw new Error('Failed to load tables')
          }

          const { tables } = await response.json()
          set({ tables, loading: false })

        } catch (error) {
          console.error('Error loading tables:', error)
          toast.error('Error al cargar las mesas')
          set({ loading: false })
        }
      },

      // Toggle single table - SIMPLE & DIRECT
      toggleTable: async (tableId: string, isActive: boolean) => {
        try {
          // API call
          const response = await fetch(`/api/tables/${tableId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              // Schema handled by getSupabaseHeaders()
              // Schema handled by getSupabaseHeaders()
            },
            body: JSON.stringify({ isActive })
          })

          if (!response.ok) {
            throw new Error('Failed to update table')
          }

          // Update store - IMMEDIATE
          set((state) => ({
            tables: state.tables.map(table =>
              table.id === tableId
                ? { ...table, isActive }
                : table
            )
          }))

          const table = get().tables.find(t => t.id === tableId)
          toast.success(`Mesa ${table?.number} ${isActive ? 'activada' : 'desactivada'}`)

        } catch (error) {
          console.error('Error toggling table:', error)
          toast.error('Error al cambiar el estado de la mesa')
        }
      },

      // Bulk zone toggle - PARALLEL & SIMPLE
      toggleZone: async (location: string, activate: boolean) => {
        try {
          const { tables } = get()
          const zoneTables = tables.filter(table => table.location === location)
          const affectedTables = zoneTables.filter(table => table.isActive !== activate)

          if (affectedTables.length === 0) {
            const locationLabels = {
              'TERRACE_1': 'Terraza 1',
              'MAIN_ROOM': 'Sala Principal',
              'VIP_ROOM': 'Sala VIP',
              'TERRACE_2': 'Terraza 2'
            }
            const locationLabel = locationLabels[location as keyof typeof locationLabels]
            toast.info(`Todas las mesas de ${locationLabel} ya están ${activate ? 'activas' : 'inactivas'}`)
            return
          }

          toast.loading(`Actualizando ${affectedTables.length} mesas...`, { id: `zone-${location}` })

          // API calls in parallel
          const promises = affectedTables.map(table =>
            fetch(`/api/tables/${table.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                // Schema handled by getSupabaseHeaders()
                // Schema handled by getSupabaseHeaders()
              },
              body: JSON.stringify({ isActive: activate })
            })
          )

          const responses = await Promise.all(promises)
          const failures = responses.filter(r => !r.ok)

          if (failures.length > 0) {
            throw new Error(`Failed to update ${failures.length} tables`)
          }

          // Update store - ALL AT ONCE
          set((state) => ({
            tables: state.tables.map(table =>
              table.location === location
                ? { ...table, isActive: activate }
                : table
            )
          }))

          const locationLabels = {
            'TERRACE_1': 'Terraza 1',
            'MAIN_ROOM': 'Sala Principal',
            'VIP_ROOM': 'Sala VIP',
            'TERRACE_2': 'Terraza 2'
          }
          const locationLabel = locationLabels[location as keyof typeof locationLabels]

          toast.success(
            `${affectedTables.length} mesas de ${locationLabel} ${activate ? 'activadas' : 'desactivadas'}`,
            { id: `zone-${location}` }
          )

        } catch (error) {
          console.error('Error toggling zone:', error)
          toast.error('Error al cambiar el estado de las mesas de la zona')
        }
      },

      // Update table status - NEW FUNCTION FOR STATUS UPDATES
      updateTableStatus: async (tableId: string, status: string, notes?: string, estimatedFreeTime?: string) => {
        try {
          // API call
          const response = await fetch('/api/tables/status', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              // Schema handled by getSupabaseHeaders()
              // Schema handled by getSupabaseHeaders()
            },
            body: JSON.stringify({
              tableId,
              status,
              notes: notes || null,
              estimatedFreeTime: estimatedFreeTime === 'none' ? null : estimatedFreeTime || null
            })
          })

          if (!response.ok) {
            throw new Error(`Error updating status: ${response.status}`)
          }

          // Update store - IMMEDIATE
          set((state) => ({
            ...state,
            tables: state.tables.map(table =>
              table.id === tableId
                ? {
                    ...table,
                    currentStatus: status as TableData['currentStatus'],
                    statusNotes: notes || table.statusNotes,
                    estimatedFreeTime: estimatedFreeTime === 'none' ? undefined : (estimatedFreeTime || table.estimatedFreeTime)
                  } as TableData
                : table
            )
          }))

          const table = get().tables.find(t => t.id === tableId)
          const statusLabels = {
            available: 'Disponible',
            reserved: 'Reservada',
            occupied: 'Ocupada',
            maintenance: 'Mantenimiento',
            temporally_closed: 'Temporalmente Cerrada'
          }
          const statusLabel = statusLabels[status as keyof typeof statusLabels] || status
          toast.success(`Mesa ${table?.number} actualizada a "${statusLabel}"`)

        } catch (error) {
          console.error('Error updating table status:', error)
          toast.error('Error al actualizar el estado de la mesa')
          throw error
        }
      },

      // ✅ ENHANCED: Position update with validation and precision handling
      updateTablePosition: async (tableId: string, position_x: number, position_y: number) => {
        try {
          // Sanitize precision to avoid DB numeric issues
          const sanitizedX = Math.round(position_x * 100) / 100
          const sanitizedY = Math.round(position_y * 100) / 100

          // Validate bounds
          const validatedX = Math.max(0, Math.min(sanitizedX, 2000))
          const validatedY = Math.max(0, Math.min(sanitizedY, 1500))

          const response = await fetch(`/api/tables/${tableId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              // Schema handled by getSupabaseHeaders()
              // Schema handled by getSupabaseHeaders()
            },
            body: JSON.stringify({
              position_x: validatedX,
              position_y: validatedY
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update table position')
          }

          // Update store immediately with validated values
          set((state) => ({
            tables: state.tables.map(table =>
              table.id === tableId
                ? { ...table, position_x: validatedX, position_y: validatedY }
                : table
            )
          }))

          const table = get().tables.find(t => t.id === tableId)
          toast.success(`Mesa ${table?.number} reposicionada`)

        } catch (error) {
          console.error('Error updating table position:', error)
          toast.error('Error al mover la mesa')
          throw error
        }
      },

      // ✅ NEW: Rotation update with snapping to 90° increments
      updateTableRotation: async (tableId: string, rotation: number) => {
        try {
          // Snap to 90° increments and normalize to 0-360
          const snappedRotation = (Math.round(rotation / 90) * 90) % 360

          const response = await fetch(`/api/tables/${tableId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              // Schema handled by getSupabaseHeaders()
              // Schema handled by getSupabaseHeaders()
            },
            body: JSON.stringify({
              rotation: snappedRotation
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update table rotation')
          }

          // Update store immediately
          set((state) => ({
            tables: state.tables.map(table =>
              table.id === tableId
                ? { ...table, rotation: snappedRotation }
                : table
            )
          }))

          const table = get().tables.find(t => t.id === tableId)
          toast.success(`Mesa ${table?.number} rotada a ${snappedRotation}°`)

        } catch (error) {
          console.error('Error updating table rotation:', error)
          toast.error('Error al rotar la mesa')
          throw error
        }
      }
    }),
    {
      name: 'table-store'
    }
  )
)