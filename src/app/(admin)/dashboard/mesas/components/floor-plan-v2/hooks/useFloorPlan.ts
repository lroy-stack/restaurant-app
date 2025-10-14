'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTableStore } from '@/stores/useTableStore'
import { VisualMesa, ZoneFilter, ENIGMA_ZONES } from '../types/mesa.types'

interface UseFloorPlanReturn {
  visualTables: VisualMesa[]
  visibleTables: VisualMesa[]
  selectedZone: string
  setSelectedZone: (zone: string) => void
  zoneStats: Record<string, { available: number, total: number, active: number }>
  loading: boolean
  selectedTable: VisualMesa | null
  setSelectedTable: (table: VisualMesa | null) => void
  refreshTables: () => Promise<void>
}

export const useFloorPlan = (): UseFloorPlanReturn => {
  const { tables, loading, loadTables } = useTableStore()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedTable, setSelectedTable] = useState<VisualMesa | null>(null)

  // TRANSFORM: Database tables → Visual tables with positions
  const visualTables = useMemo(() => {
    return tables.map((table): VisualMesa => ({
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      location: table.location,
      position: {
        x: Number(table.position_x || 0),
        y: Number(table.position_y || 0)
      },
      dimensions: {
        width: Number(table.width || 120),
        height: Number(table.height || 80)
      },
      rotation: Number(table.rotation || 0),
      currentStatus: table.currentStatus || 'available',
      isActive: table.isActive,
      currentReservation: table.currentReservation || null
    }))
  }, [tables])

  // FILTER: Zone-based visibility with performance optimization + HIDE INACTIVE TABLES
  const visibleTables = useMemo(() => {
    // ✅ CRITICAL FIX: Filter out inactive tables (blocked rooms)
    const activeTables = visualTables.filter(table => table.isActive)

    if (selectedZone === 'all') return activeTables
    return activeTables.filter(table => table.location === selectedZone)
  }, [visualTables, selectedZone])

  // STATS: Calculate zone statistics for toolbar
  const zoneStats = useMemo(() => {
    const stats: Record<string, { available: number, total: number, active: number }> = {}

    // Initialize stats for all zones
    Object.keys(ENIGMA_ZONES).forEach(zone => {
      stats[zone] = { available: 0, total: 0, active: 0 }
    })

    // Add "all" category
    stats['all'] = { available: 0, total: 0, active: 0 }

    // Calculate stats for each zone
    visualTables.forEach(table => {
      const zone = table.location

      // Zone-specific stats
      if (stats[zone]) {
        stats[zone].total += 1
        if (table.isActive) {
          stats[zone].active += 1
          if (table.currentStatus === 'available') {
            stats[zone].available += 1
          }
        }
      }

      // All zones aggregate
      stats['all'].total += 1
      if (table.isActive) {
        stats['all'].active += 1
        if (table.currentStatus === 'available') {
          stats['all'].available += 1
        }
      }
    })

    return stats
  }, [visualTables])

  // REAL-TIME: Sync updates from useTableStore (already handles Supabase)
  useEffect(() => {
    // useTableStore handles real-time updates automatically via Supabase subscriptions
    // No additional subscriptions needed here

    // Load tables if not already loaded
    if (tables.length === 0 && !loading) {
      loadTables()
    }
  }, [tables.length, loading, loadTables])

  // Clear selected table if it's no longer visible
  useEffect(() => {
    if (selectedTable && !visibleTables.find(t => t.id === selectedTable.id)) {
      setSelectedTable(null)
    }
  }, [selectedTable, visibleTables])

  // Helper function to refresh tables
  const refreshTables = async () => {
    try {
      await loadTables()
    } catch (error) {
      console.error('Error refreshing tables:', error)
    }
  }

  return {
    visualTables,
    visibleTables,
    selectedZone,
    setSelectedZone,
    zoneStats,
    loading,
    selectedTable,
    setSelectedTable,
    refreshTables
  }
}