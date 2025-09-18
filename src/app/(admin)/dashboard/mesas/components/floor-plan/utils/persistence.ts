/**
 * Persistence Utilities
 * Handle saving and loading floor plan layouts to/from localStorage and API
 */

import { FloorPlanNode } from './elementTypes'

const STORAGE_KEY = 'enigma-floor-plan-layouts'

export interface FloorPlanLayout {
  nodes: FloorPlanNode[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
  lastSaved: string
  version: string
}

// Save layout to localStorage
export function saveLayoutToLocalStorage(layout: FloorPlanLayout): void {
  try {
    const serialized = JSON.stringify(layout)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save layout to localStorage:', error)
    throw new Error('Failed to save layout locally')
  }
}

// Load layout from localStorage
export function loadLayoutFromLocalStorage(): FloorPlanLayout | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const layout = JSON.parse(stored) as FloorPlanLayout

    // Validate layout structure
    if (!layout.nodes || !Array.isArray(layout.nodes)) {
      console.warn('Invalid layout structure in localStorage')
      return null
    }

    return layout
  } catch (error) {
    console.error('Failed to load layout from localStorage:', error)
    return null
  }
}

// Clear localStorage layout
export function clearLocalStorageLayout(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear layout from localStorage:', error)
  }
}

// Save layout to server API
export async function saveLayoutToServer(layout: FloorPlanLayout): Promise<void> {
  try {
    const response = await fetch('/api/floor-plan/layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante'
      },
      body: JSON.stringify({
        layout,
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to save layout')
    }

  } catch (error) {
    console.error('Failed to save layout to server:', error)
    throw new Error('Failed to save layout to server')
  }
}

// Load layout from server API
export async function loadLayoutFromServer(): Promise<FloorPlanLayout | null> {
  try {
    const response = await fetch('/api/floor-plan/layout', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No layout saved yet
        return null
      }
      throw new Error(`Server responded with ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to load layout')
    }

    return result.layout as FloorPlanLayout

  } catch (error) {
    console.error('Failed to load layout from server:', error)
    return null
  }
}

// Auto-save with debouncing
export class AutoSaver {
  private saveTimeout: NodeJS.Timeout | null = null
  private readonly debounceMs: number = 2000 // 2 seconds

  constructor(
    private saveFunction: (layout: FloorPlanLayout) => Promise<void>
  ) {}

  // Queue a save operation (debounced)
  queueSave(layout: FloorPlanLayout): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        await this.saveFunction(layout)
        console.log('✅ Auto-saved floor plan layout')
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
      }
    }, this.debounceMs)
  }

  // Force immediate save
  async forceSave(layout: FloorPlanLayout): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }

    await this.saveFunction(layout)
  }

  // Cancel pending save
  cancelPendingSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  }
}

// Create default layout
export function createDefaultLayout(): FloorPlanLayout {
  return {
    nodes: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 1
    },
    lastSaved: new Date().toISOString(),
    version: '1.0.0'
  }
}

// Migrate old layouts to new format
export function migrateLayout(oldLayout: any): FloorPlanLayout {
  // Handle migration from react-grid-layout format
  if (oldLayout.layouts) {
    console.log('Migrating from react-grid-layout format...')

    // Extract lg layout as primary
    const gridItems = oldLayout.layouts.lg || []

    // Convert grid items to floor plan nodes (simplified migration)
    const nodes: FloorPlanNode[] = gridItems.map((item: any) => ({
      id: item.i,
      type: 'table', // Assume all are tables in old format
      position: { x: item.x * 100, y: item.y * 100 }, // Scale up grid positions
      data: {
        elementType: 'table',
        size: { width: item.w * 80, height: item.h * 80 }, // Scale grid sizes
        rotation: 0,
        style: {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
          borderWidth: 2,
          borderRadius: 8,
          shadow: true
        },
        label: `Mesa ${item.i}`
      },
      draggable: true,
      selectable: true,
      deletable: false
    }))

    return {
      nodes,
      viewport: { x: 0, y: 0, zoom: 1 },
      lastSaved: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  // If already in new format, just validate and return
  if (oldLayout.nodes && oldLayout.viewport) {
    return {
      ...oldLayout,
      version: oldLayout.version || '1.0.0'
    }
  }

  // Fallback to default layout
  return createDefaultLayout()
}

// Export utilities for layout management
export const layoutManager = {
  save: {
    local: saveLayoutToLocalStorage,
    server: saveLayoutToServer
  },
  load: {
    local: loadLayoutFromLocalStorage,
    server: loadLayoutFromServer
  },
  clear: {
    local: clearLocalStorageLayout
  },
  utils: {
    createDefault: createDefaultLayout,
    migrate: migrateLayout
  },
  AutoSaver
}