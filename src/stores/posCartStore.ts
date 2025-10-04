import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { POSCartItem, POSCart } from '@/types/pos'

interface POSCartStore extends POSCart {
  // Actions
  addItem: (item: Omit<POSCartItem, 'totalPrice'>) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  updateNotes: (menuItemId: string, notes: string) => void
  setTableId: (tableId: string) => void
  setOrderNotes: (notes: string) => void
  clearCart: () => void

  // Computed helpers
  getItem: (menuItemId: string) => POSCartItem | undefined
  hasItems: () => boolean
}

const initialState: POSCart = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
}

export const usePOSCartStore = create<POSCartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        const existingItem = get().items.find((i) => i.menuItemId === item.menuItemId)

        if (existingItem) {
          // Update quantity if item exists
          get().updateQuantity(item.menuItemId, existingItem.quantity + item.quantity)
        } else {
          // Add new item
          const newItem: POSCartItem = {
            ...item,
            totalPrice: item.unitPrice * item.quantity,
          }

          set((state) => {
            const newItems = [...state.items, newItem]
            return {
              items: newItems,
              totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0),
              totalAmount: newItems.reduce((sum, i) => sum + i.totalPrice, 0),
            }
          })
        }
      },

      removeItem: (menuItemId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.menuItemId !== menuItemId)
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0),
            totalAmount: newItems.reduce((sum, i) => sum + i.totalPrice, 0),
          }
        })
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.menuItemId === menuItemId
              ? {
                  ...item,
                  quantity,
                  totalPrice: item.unitPrice * quantity,
                }
              : item
          )

          return {
            items: newItems,
            totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0),
            totalAmount: newItems.reduce((sum, i) => sum + i.totalPrice, 0),
          }
        })
      },

      updateNotes: (menuItemId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItemId === menuItemId ? { ...item, notes } : item
          ),
        }))
      },

      setTableId: (tableId) => {
        set({ tableId })
      },

      setOrderNotes: (notes) => {
        set({ notes })
      },

      clearCart: () => {
        set(initialState)
      },

      getItem: (menuItemId) => {
        return get().items.find((i) => i.menuItemId === menuItemId)
      },

      hasItems: () => {
        return get().items.length > 0
      },
    }),
    {
      name: 'enigma-pos-cart',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount,
        tableId: state.tableId,
        notes: state.notes,
      }),
    }
  )
)
