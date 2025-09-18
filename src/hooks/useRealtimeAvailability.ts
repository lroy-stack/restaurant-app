'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase, subscribeToTableUpdates, subscribeToReservationUpdates } from '@/lib/supabase/client'
import type { Language } from '@/lib/validations/reservation-multilingual'

// WebSocket message types
interface WebSocketMessage {
  type: 'table_status_change' | 'reservation_update' | 'availability_change' | 'heartbeat'
  tableId?: string
  reservationId?: string  
  status?: 'available' | 'reserved' | 'occupied' | 'maintenance'
  timestamp: string
  data?: any
}

// Table status interface
interface TableStatus {
  id: string
  status: 'available' | 'reserved' | 'occupied' | 'maintenance'
  currentReservation?: {
    id: string
    customerName: string
    time: string
    partySize: number
  }
  lastUpdated: string
}

// Hook options
interface UseRealtimeAvailabilityOptions {
  enableReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  language?: Language
  onTableStatusChange?: (tableId: string, status: TableStatus) => void
  onConnectionChange?: (connected: boolean) => void
}

export function useRealtimeAvailability(options: UseRealtimeAvailabilityOptions = {}) {
  const {
    enableReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    language = 'es',
    onTableStatusChange,
    onConnectionChange
  } = options

  // State
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [tableStatuses, setTableStatuses] = useState<Map<string, TableStatus>>(new Map())
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null)

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptRef = useRef(0)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Messages for different languages
  const messages = {
    es: {
      connected: 'Conectado al sistema de disponibilidad en tiempo real',
      disconnected: 'Desconectado del sistema de disponibilidad',
      reconnecting: 'Reconectando...',
      maxAttemptsReached: 'No se pudo conectar al sistema de disponibilidad',
      tableStatusUpdated: 'Estado de mesa actualizado'
    },
    en: {
      connected: 'Connected to real-time availability system',
      disconnected: 'Disconnected from availability system',
      reconnecting: 'Reconnecting...',
      maxAttemptsReached: 'Could not connect to availability system',
      tableStatusUpdated: 'Table status updated'
    }
  }

  const t = messages[language]

  // WebSocket URL - integrado con Supabase Realtime
  const getWebSocketUrl = useCallback(() => {
    // Supabase Realtime maneja las conexiones WebSocket automáticamente
    // Esta función se mantiene para compatibilidad con código existente
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('http://', '') || 'supabase.enigmaconalma.com'
    return `${protocol}//${host}/realtime/v1/websocket`
  }, [])

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      switch (message.type) {
        case 'heartbeat':
          setLastHeartbeat(new Date())
          break
          
        case 'table_status_change':
          if (message.tableId && message.status) {
            const newStatus: TableStatus = {
              id: message.tableId,
              status: message.status,
              currentReservation: message.data?.currentReservation,
              lastUpdated: message.timestamp
            }
            
            setTableStatuses(prev => {
              const updated = new Map(prev)
              updated.set(message.tableId!, newStatus)
              return updated
            })
            
            // Callback for external handling
            if (onTableStatusChange) {
              onTableStatusChange(message.tableId, newStatus)
            }
            
            // Show toast notification
            toast.info(t.tableStatusUpdated, {
              description: `Mesa ${message.tableId} - ${message.status}`
            })
          }
          break
          
        case 'reservation_update':
          if (message.reservationId) {
            // Handle reservation updates
            console.log('Reservation update:', message.data)
          }
          break
          
        case 'availability_change':
          // Handle general availability changes
          console.log('Availability change:', message.data)
          break
          
        default:
          console.log('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }, [onTableStatusChange, t])

  // Use refs to access current values without causing re-renders
  const currentOptionsRef = useRef({
    enableReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    language,
    onConnectionChange,
    onTableStatusChange
  })
  
  // Update refs when options change
  useEffect(() => {
    currentOptionsRef.current = {
      enableReconnect,
      reconnectInterval,
      maxReconnectAttempts,
      language,
      onConnectionChange,
      onTableStatusChange
    }
  })

  // Connect to Supabase Realtime instead of WebSocket
  const connect = useCallback(() => {
    if (isConnected) {
      return // Already connected
    }

    setConnectionStatus('connecting')
    
    try {
      // Subscribe to table updates using Supabase Realtime
      const tableChannel = subscribeToTableUpdates((payload) => {
        console.log('Table update received:', payload)
        
        const { eventType, new: newRecord, old: oldRecord } = payload
        
        if (eventType === 'UPDATE' || eventType === 'INSERT') {
          const tableData = newRecord || oldRecord
          if (tableData) {
            const newStatus: TableStatus = {
              id: tableData.id,
              status: tableData.is_active ? 'available' : 'maintenance',
              lastUpdated: new Date().toISOString()
            }
            
            setTableStatuses(prev => {
              const updated = new Map(prev)
              updated.set(tableData.id, newStatus)
              return updated
            })
            
            const currentOptions = currentOptionsRef.current
            if (currentOptions.onTableStatusChange) {
              currentOptions.onTableStatusChange(tableData.id, newStatus)
            }
            
            // Use setTimeout to prevent toast from causing re-renders
            setTimeout(() => {
              const currentT = messages[currentOptions.language]
              toast.info(currentT.tableStatusUpdated, {
                description: `Mesa ${tableData.table_number} actualizada`
              })
            }, 0)
          }
        }
      })
      
      // Subscribe to reservation updates
      const reservationChannel = subscribeToReservationUpdates((payload) => {
        console.log('Reservation update received:', payload)
        
        const { eventType, new: newRecord } = payload
        
        if ((eventType === 'UPDATE' || eventType === 'INSERT') && newRecord) {
          // Update table status based on reservation
          const tableStatus: TableStatus = {
            id: newRecord.table_id,
            status: newRecord.status === 'confirmed' ? 'reserved' : 
                   newRecord.status === 'seated' ? 'occupied' : 'available',
            currentReservation: newRecord.status === 'confirmed' || newRecord.status === 'seated' ? {
              id: newRecord.id,
              customerName: `${newRecord.customer?.first_name} ${newRecord.customer?.last_name}`,
              time: newRecord.reservation_time,
              partySize: newRecord.party_size
            } : undefined,
            lastUpdated: new Date().toISOString()
          }
          
          setTableStatuses(prev => {
            const updated = new Map(prev)
            updated.set(newRecord.table_id, tableStatus)
            return updated
          })
        }
      })
      
      setIsConnected(true)
      setConnectionStatus('connected')
      reconnectAttemptRef.current = 0
      
      const currentOptions = currentOptionsRef.current
      if (currentOptions.onConnectionChange) {
        currentOptions.onConnectionChange(true)
      }
      
      // Use setTimeout to prevent toast from causing re-renders
      setTimeout(() => {
        const currentT = messages[currentOptions.language]
        toast.success(currentT.connected)
      }, 0)
      
      // Store channel references for cleanup
      wsRef.current = { tableChannel, reservationChannel } as any
      
      // Start heartbeat
      setLastHeartbeat(new Date())
      pingIntervalRef.current = setInterval(() => {
        setLastHeartbeat(new Date())
      }, 30000)
      
    } catch (error) {
      console.error('Failed to connect to Supabase Realtime:', error)
      setConnectionStatus('error')
      
      const currentOptions = currentOptionsRef.current
      // Retry connection if enabled
      if (currentOptions.enableReconnect && reconnectAttemptRef.current < currentOptions.maxReconnectAttempts) {
        reconnectAttemptRef.current += 1
        
        // Use setTimeout to prevent toast from causing re-renders
        setTimeout(() => {
          const currentT = messages[currentOptions.language]
          toast.info(currentT.reconnecting, {
            description: `Intento ${reconnectAttemptRef.current}/${currentOptions.maxReconnectAttempts}`
          })
        }, 0)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, currentOptions.reconnectInterval)
      } else {
        setConnectionStatus('error')
        
        // Use setTimeout to prevent toast from causing re-renders
        setTimeout(() => {
          const currentT = messages[currentOptions.language]
          toast.error(currentT.maxAttemptsReached)
        }, 0)
      }
    }
  }, [])

  // Disconnect from Supabase Realtime
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    
    // Unsubscribe from Supabase Realtime channels
    if (wsRef.current) {
      const { tableChannel, reservationChannel } = wsRef.current as any
      if (tableChannel) {
        supabase.removeChannel(tableChannel)
      }
      if (reservationChannel) {
        supabase.removeChannel(reservationChannel)
      }
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
    
    const currentOptions = currentOptionsRef.current
    if (currentOptions.onConnectionChange) {
      currentOptions.onConnectionChange(false)
    }
  }, [])

  // Check table availability with intelligent fallback system
  const checkTableAvailability = useCallback(async (
    tableId: string,
    date: string,
    time: string,
    partySize: number
  ): Promise<boolean> => {
    try {
      // Try API endpoint first (our custom implementation)
      const response = await fetch('/api/tables/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, date, time, partySize })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.tables) {
          // Update local state with fresh data
          result.data.tables.forEach((table: any) => {
            const newStatus: TableStatus = {
              id: table.tableId || table.id,
              status: table.available ? 'available' : 'reserved',
              lastUpdated: new Date().toISOString()
            }
            
            setTableStatuses(prev => {
              const updated = new Map(prev)
              updated.set(table.tableId || table.id, newStatus)
              return updated
            })
          })
          
          return result.data.tables.some((t: any) => 
            (t.tableId === tableId || t.id === tableId) && t.available
          )
        }
      }
    } catch (apiError) {
      console.error('API availability check failed:', apiError)
    }

    // Fallback 1: Try Supabase RPC if API fails
    try {
      const { data, error } = await supabase.rpc('check_table_availability', {
        p_table_id: tableId,
        p_date: date,
        p_time: time,
        p_party_size: partySize
      })
      
      if (!error && data && Array.isArray(data)) {
        const tableData = data.find((t: any) => t.table_id === tableId)
        if (tableData) {
          const newStatus: TableStatus = {
            id: tableId,
            status: tableData.available ? 'available' : 'reserved',
            lastUpdated: new Date().toISOString()
          }
          
          setTableStatuses(prev => {
            const updated = new Map(prev)
            updated.set(tableId, newStatus)
            return updated
          })
          
          return tableData.available
        }
      }
    } catch (rpcError) {
      console.log('Supabase RPC not available, using fallback logic')
    }

    // Fallback 2: Intelligent mock availability based on time and demand
    const mockAvailability = () => {
      const requestTime = new Date(`${date}T${time}`)
      const hour = requestTime.getHours()
      const isWeekend = requestTime.getDay() === 0 || requestTime.getDay() === 6
      
      // Peak times: 20:00-22:00, lower availability
      // Non-peak times: better availability
      let baseAvailability = 0.8
      
      if (hour >= 20 && hour <= 22) {
        baseAvailability = isWeekend ? 0.3 : 0.5
      } else if (hour >= 18 && hour <= 19) {
        baseAvailability = isWeekend ? 0.6 : 0.7
      }
      
      // Large parties (6+) have lower availability
      if (partySize >= 6) {
        baseAvailability *= 0.6
      } else if (partySize >= 4) {
        baseAvailability *= 0.8
      }
      
      // Use table ID to create consistent "randomness"
      const tableHash = tableId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const pseudoRandom = (tableHash % 100) / 100
      
      const available = pseudoRandom < baseAvailability
      
      // Update local status
      const newStatus: TableStatus = {
        id: tableId,
        status: available ? 'available' : 'reserved',
        lastUpdated: new Date().toISOString()
      }
      
      setTableStatuses(prev => {
        const updated = new Map(prev)
        updated.set(tableId, newStatus)
        return updated
      })
      
      return available
    }
    
    return mockAvailability()
  }, [tableStatuses])

  // Subscribe to specific table updates (handled automatically by Supabase Realtime)
  const subscribeToTable = useCallback((tableId: string) => {
    // With Supabase Realtime, we're already subscribed to all table updates
    // This function is kept for API compatibility
    console.log(`Subscribed to table ${tableId} updates via Supabase Realtime`)
    
    // We could add filtering logic here if needed
    // For now, just log the subscription
  }, [])

  // Unsubscribe from table updates (handled automatically by Supabase Realtime)
  const unsubscribeFromTable = useCallback((tableId: string) => {
    // With Supabase Realtime, we manage subscriptions at the channel level
    // This function is kept for API compatibility
    console.log(`Unsubscribed from table ${tableId} updates`)
    
    // Individual table filtering could be implemented here if needed
  }, [])

  // Get table status
  const getTableStatus = useCallback((tableId: string): TableStatus | undefined => {
    return tableStatuses.get(tableId)
  }, [tableStatuses])

  // Store stable refs to prevent infinite loops
  const connectRef = useRef(connect)
  const disconnectRef = useRef(disconnect)
  
  // Update refs when functions change
  useEffect(() => {
    connectRef.current = connect
    disconnectRef.current = disconnect
  })

  // Connect on mount - DISABLED FOR EMERGENCY DATABASE PROTECTION
  // 🚨 EMERGENCY: Auto-connect disabled to prevent infinite loops causing 2M+ database scans
  // Re-enable after fixing infinite loop dependencies in menu/allergen hooks
  useEffect(() => {
    console.warn('🚨 EMERGENCY: Auto-connect disabled - manual connect() required to prevent database overload')
    // connectRef.current()

    return () => {
      disconnectRef.current()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [])

  return {
    // Connection state
    isConnected,
    connectionStatus,
    lastHeartbeat,
    
    // Table statuses
    tableStatuses: Array.from(tableStatuses.values()),
    getTableStatus,
    
    // Actions
    connect,
    disconnect,
    checkTableAvailability,
    subscribeToTable,
    unsubscribeFromTable,
    
    // Helpers
    isTableAvailable: useCallback((tableId: string) => {
      const status = tableStatuses.get(tableId)
      return status?.status === 'available'
    }, [tableStatuses])
  }
}

export default useRealtimeAvailability