import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'sonner'

interface TableData {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  qrCode: string
  isActive: boolean
  restaurantId: string
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'
  statusNotes?: string
  estimatedFreeTime?: string
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
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante'
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
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante'
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
              'TERRACE_CAMPANARI': 'Terraza Campanari',
              'SALA_PRINCIPAL': 'Sala Principal',
              'SALA_VIP': 'Sala VIP',
              'TERRACE_JUSTICIA': 'Terraza Justicia'
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
                'Accept-Profile': 'restaurante',
                'Content-Profile': 'restaurante'
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
            'TERRACE_CAMPANARI': 'Terraza Campanari',
            'SALA_PRINCIPAL': 'Sala Principal',
            'SALA_VIP': 'Sala VIP',
            'TERRACE_JUSTICIA': 'Terraza Justicia'
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
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante'
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
                    ...(notes && { statusNotes: notes }),
                    ...(estimatedFreeTime !== 'none' && estimatedFreeTime && { estimatedFreeTime })
                  }
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
      }
    }),
    {
      name: 'table-store'
    }
  )
)