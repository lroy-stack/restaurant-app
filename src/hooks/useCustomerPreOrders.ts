'use client'

import { useState, useEffect } from 'react'

interface PreOrderItem {
  id: string
  quantity: number
  notes?: string
  menu_items: {
    id: string
    name: string
    price: number
  }
}

interface PreOrderSummary {
  totalAmount: number
  totalItems: number
  itemCount: number
  items: PreOrderItem[]
  loading: boolean
  error: string | null
}

export function useCustomerPreOrders(customerId?: string): PreOrderSummary {
  const [preOrders, setPreOrders] = useState<PreOrderSummary>({
    totalAmount: 0,
    totalItems: 0,
    itemCount: 0,
    items: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!customerId) {
      setPreOrders({
        totalAmount: 0,
        totalItems: 0,
        itemCount: 0,
        items: [],
        loading: false,
        error: null
      })
      return
    }

    const fetchPreOrders = async () => {
      try {
        setPreOrders(prev => ({ ...prev, loading: true, error: null }))

        const response = await fetch(`/api/customers/${customerId}/reservations`)
        const data = await response.json()

        if (response.ok && data.success && data.reservations) {
          let totalAmount = 0
          let totalItems = 0
          let itemCount = 0
          const allItems: PreOrderItem[] = []

          // Process all reservations to find pre-orders
          data.reservations.forEach((reservation: any) => {
            if (reservation.reservation_items && reservation.reservation_items.length > 0) {
              reservation.reservation_items.forEach((item: PreOrderItem) => {
                const itemTotal = item.menu_items.price * item.quantity
                totalAmount += itemTotal
                totalItems += item.quantity
                itemCount += 1
                allItems.push(item)
              })
            }
          })

          setPreOrders({
            totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimals
            totalItems,
            itemCount,
            items: allItems,
            loading: false,
            error: null
          })
        } else {
          setPreOrders({
            totalAmount: 0,
            totalItems: 0,
            itemCount: 0,
            items: [],
            loading: false,
            error: data.error || 'Failed to fetch pre-orders'
          })
        }
      } catch (error) {
        console.error('Pre-orders fetch error:', error)
        setPreOrders({
          totalAmount: 0,
          totalItems: 0,
          itemCount: 0,
          items: [],
          loading: false,
          error: 'Network error'
        })
      }
    }

    fetchPreOrders()
  }, [customerId])

  return preOrders
}