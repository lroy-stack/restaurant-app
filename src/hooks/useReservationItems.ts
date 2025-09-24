'use client'

import { useState, useCallback } from 'react'

// Types matching database structure
export interface ReservationItem {
  id: string
  quantity: number
  notes?: string
  menu_items: {
    id: string
    name: string
    price: number
    menu_categories: {
      name: string
      type: 'FOOD' | 'WINE' | 'BEVERAGE'
    }
  }
}

// Type for new items being added (before they have reservation_item id)
export interface NewReservationItem {
  menuItemId: string
  quantity: number
  notes?: string
  menu_items: {
    id: string
    name: string
    price: number
    menu_categories: {
      name: string
      type: 'FOOD' | 'WINE' | 'BEVERAGE'
    }
  }
}

export interface ReservationItemsState {
  originalItems: ReservationItem[]  // Items from database
  currentItems: (ReservationItem | NewReservationItem)[]  // Current working set
  hasChanges: boolean
}

export function useReservationItems(initialItems: ReservationItem[] = []) {
  const [state, setState] = useState<ReservationItemsState>({
    originalItems: initialItems,
    currentItems: [...initialItems],
    hasChanges: false
  })

  // Add new item from menu
  const addMenuItem = useCallback((menuItem: NewReservationItem['menu_items'], quantity: number = 1, notes?: string) => {
    setState(prev => {
      // Check if item already exists
      const existingIndex = prev.currentItems.findIndex(item =>
        item.menu_items.id === menuItem.id
      )

      let newCurrentItems: (ReservationItem | NewReservationItem)[]

      if (existingIndex >= 0) {
        // Update quantity of existing item
        newCurrentItems = prev.currentItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        )
      } else {
        // Add new item
        const newItem: NewReservationItem = {
          menuItemId: menuItem.id,
          quantity,
          notes,
          menu_items: menuItem
        }
        newCurrentItems = [...prev.currentItems, newItem]
      }

      return {
        ...prev,
        currentItems: newCurrentItems,
        hasChanges: true
      }
    })
  }, [])

  // Update quantity of existing item
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) {
        // Remove item if quantity is 0
        return {
          ...prev,
          currentItems: prev.currentItems.filter(item =>
            'id' in item ? item.id !== itemId : item.menuItemId !== itemId
          ),
          hasChanges: true
        }
      }

      const newCurrentItems = prev.currentItems.map(item => {
        const isTarget = 'id' in item ? item.id === itemId : item.menuItemId === itemId
        return isTarget ? { ...item, quantity } : item
      })

      return {
        ...prev,
        currentItems: newCurrentItems,
        hasChanges: true
      }
    })
  }, [])

  // Update notes of existing item
  const updateNotes = useCallback((itemId: string, notes: string) => {
    setState(prev => {
      const newCurrentItems = prev.currentItems.map(item => {
        const isTarget = 'id' in item ? item.id === itemId : item.menuItemId === itemId
        return isTarget ? { ...item, notes } : item
      })

      return {
        ...prev,
        currentItems: newCurrentItems,
        hasChanges: true
      }
    })
  }, [])

  // Remove item
  const removeItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      currentItems: prev.currentItems.filter(item =>
        'id' in item ? item.id !== itemId : item.menuItemId !== itemId
      ),
      hasChanges: true
    }))
  }, [])

  // Reset to original state
  const resetChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentItems: [...prev.originalItems],
      hasChanges: false
    }))
  }, [])

  // Get total price of current items
  const getTotalPrice = useCallback(() => {
    return state.currentItems.reduce((total, item) =>
      total + (item.quantity * item.menu_items.price), 0
    )
  }, [state.currentItems])

  // Get total quantity of current items
  const getTotalQuantity = useCallback(() => {
    return state.currentItems.reduce((total, item) =>
      total + item.quantity, 0
    )
  }, [state.currentItems])

  // Check if an item exists in current selection
  const hasMenuItem = useCallback((menuItemId: string) => {
    return state.currentItems.some(item =>
      item.menu_items.id === menuItemId
    )
  }, [state.currentItems])

  // Get item by menu item ID
  const getItemByMenuItemId = useCallback((menuItemId: string) => {
    return state.currentItems.find(item =>
      item.menu_items.id === menuItemId
    )
  }, [state.currentItems])

  // Prepare data for API submission
  const getItemsForSubmission = useCallback(() => {
    return {
      // Items to create (new items)
      itemsToCreate: state.currentItems.filter(item => !('id' in item)) as NewReservationItem[],
      // Items to update (existing items that changed)
      itemsToUpdate: state.currentItems.filter(item => {
        if (!('id' in item)) return false
        const original = state.originalItems.find(orig => orig.id === item.id)
        return original && (
          original.quantity !== item.quantity ||
          original.notes !== item.notes
        )
      }) as ReservationItem[],
      // Items to delete (original items not in current)
      itemsToDelete: state.originalItems.filter(original =>
        !state.currentItems.some(current =>
          'id' in current && current.id === original.id
        )
      )
    }
  }, [state.currentItems, state.originalItems])

  return {
    items: state.currentItems,
    originalItems: state.originalItems,
    hasChanges: state.hasChanges,
    addMenuItem,
    updateQuantity,
    updateNotes,
    removeItem,
    resetChanges,
    getTotalPrice,
    getTotalQuantity,
    hasMenuItem,
    getItemByMenuItemId,
    getItemsForSubmission
  }
}