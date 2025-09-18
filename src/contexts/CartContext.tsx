'use client'

import React, { createContext, useContext, useEffect, useState, useReducer } from 'react'

// Tipos para el carrito - EXACT REFERENCE PATTERN + MULTILINGUAL
export interface CartItem {
  id: string
  type: 'wine' | 'dish' // MAPPED from menu_categories.type: WINE → 'wine', FOOD → 'dish'
  name: string // Español (campo base)
  nameEn?: string // Inglés (patrón DB)
  description?: string // Español (campo base)
  descriptionEn?: string // Inglés (patrón DB)
  price: number
  quantity: number
  image_url?: string
  category?: string // Español
  categoryEn?: string // Inglés (patrón DB)
  winery?: string // Para vinos
  wine_type?: string // Para vinos
  addedAt: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  language: 'es' | 'en' // Patrón multiidioma DB
  lastUpdated: string
}

// Acciones del reducer - EXACT REFERENCE PATTERN + MULTILINGUAL
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity' | 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: 'es' | 'en' }
  | { type: 'LOAD_FROM_STORAGE'; payload: CartState }

// Context type
interface CartContextType {
  state: CartState
  addToCart: (item: Omit<CartItem, 'quantity' | 'addedAt'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  setLanguage: (language: 'es' | 'en') => void
  getCartTotal: () => number
  getCartCount: () => number
  isInCart: (id: string) => boolean
  getCartItem: (id: string) => CartItem | undefined
  getCartItems: () => CartItem[]
  // Utilidades multiidioma siguiendo patrón DB
  getItemName: (item: CartItem) => string
  getItemDescription: (item: CartItem) => string
  getItemCategory: (item: CartItem) => string
}

// Reducer para manejar el estado del carrito - EXACT REFERENCE PATTERN
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)

      if (existingItem) {
        // Si ya existe, incrementar cantidad
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          lastUpdated: new Date().toISOString()
        }
      } else {
        // Si no existe, agregar nuevo item
        const newItem: CartItem = {
          ...action.payload,
          quantity: 1,
          addedAt: new Date().toISOString()
        }

        return {
          ...state,
          items: [...state.items, newItem],
          lastUpdated: new Date().toISOString()
        }
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        lastUpdated: new Date().toISOString()
      }

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        // Si cantidad es 0 o menor, remover item
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
          lastUpdated: new Date().toISOString()
        }
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        lastUpdated: new Date().toISOString()
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        lastUpdated: new Date().toISOString()
      }

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload
      }

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
        lastUpdated: new Date().toISOString()
      }

    case 'LOAD_FROM_STORAGE':
      return action.payload

    default:
      return state
  }
}

// Estado inicial
const initialState: CartState = {
  items: [],
  isOpen: false,
  language: 'es', // Español por defecto (aplicación castellano)
  lastUpdated: new Date().toISOString()
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Hook para usar el context
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Provider component
interface CartProviderProps {
  children: React.ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const STORAGE_KEY = 'enigma-cart'
  const CART_EXPIRY_HOURS = 24

  // Cargar carrito desde localStorage al inicializar - EXACT REFERENCE PATTERN
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const storedCart = localStorage.getItem(STORAGE_KEY)
        if (storedCart) {
          const parsedCart: CartState & { expiresAt?: string } = JSON.parse(storedCart)

          // Verificar si el carrito ha expirado
          if (parsedCart.expiresAt) {
            const expiryDate = new Date(parsedCart.expiresAt)
            if (new Date() > expiryDate) {
              // Carrito expirado, limpiar storage
              localStorage.removeItem(STORAGE_KEY)
              return
            }
          }

          // Carrito válido, cargar estado
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedCart })
        }
      } catch (error) {
        console.warn('Error loading cart from localStorage', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    loadCartFromStorage()
  }, [])

  // Guardar carrito en localStorage cuando cambie el estado - EXACT REFERENCE PATTERN
  useEffect(() => {
    try {
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + CART_EXPIRY_HOURS)

      const cartToSave = {
        ...state,
        expiresAt: expiryDate.toISOString()
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartToSave))
    } catch (error) {
      console.warn('Error saving cart to localStorage', error)
    }
  }, [state])

  // Funciones del carrito
  const addToCart = (item: Omit<CartItem, 'quantity' | 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'SET_CART_OPEN', payload: !state.isOpen })
  }

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open })
  }

  const setLanguage = (language: 'es' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: language })
  }

  const getCartTotal = (): number => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = (): number => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const isInCart = (id: string): boolean => {
    return state.items.some(item => item.id === id)
  }

  const getCartItem = (id: string): CartItem | undefined => {
    return state.items.find(item => item.id === id)
  }

  const getCartItems = (): CartItem[] => {
    return state.items
  }

  // Utilidades multiidioma siguiendo patrón DB exacto
  const getItemName = (item: CartItem): string => {
    return state.language === 'en' && item.nameEn ? item.nameEn : item.name
  }

  const getItemDescription = (item: CartItem): string => {
    return state.language === 'en' && item.descriptionEn ? item.descriptionEn : (item.description || '')
  }

  const getItemCategory = (item: CartItem): string => {
    return state.language === 'en' && item.categoryEn ? item.categoryEn : (item.category || '')
  }

  // Limpiar carrito automáticamente cuando se expira - EXACT REFERENCE PATTERN
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const storedCart = localStorage.getItem(STORAGE_KEY)
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart)
          if (parsedCart.expiresAt) {
            const expiryDate = new Date(parsedCart.expiresAt)
            if (new Date() > expiryDate) {
              clearCart()
              localStorage.removeItem(STORAGE_KEY)
            }
          }
        }
      } catch (error) {
        console.warn('Error checking cart expiry', error)
      }
    }, 60000) // Verificar cada minuto

    return () => clearInterval(interval)
  }, [])

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
    setLanguage,
    getCartTotal,
    getCartCount,
    isInCart,
    getCartItem,
    getCartItems,
    getItemName,
    getItemDescription,
    getItemCategory
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider

// Export types for external use
export type { CartItem as CartItemType, CartState as CartStateType }