'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useReservationNotifications } from '@/hooks/useReservationNotifications'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeNotificationsContextValue {
  isConnected: boolean
}

const RealtimeNotificationsContext = createContext<RealtimeNotificationsContextValue>({
  isConnected: false
})

export const useRealtimeNotifications = () => useContext(RealtimeNotificationsContext)

interface RealtimeNotificationsProviderProps {
  children: ReactNode
}

/**
 * Global Realtime Notifications Provider
 *
 * Mantiene suscripción activa a eventos de reservations en TODA la app admin
 * - Funciona incluso en otras páginas/tabs
 * - Browser notifications cuando tab inactivo
 * - Audio + toast cuando tab activo
 * - Respeta configuración de usuario (localStorage)
 */
export function RealtimeNotificationsProvider({ children }: RealtimeNotificationsProviderProps) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isConnectedRef = useRef(false)

  const {
    config,
    notifyNewReservation,
    notifyUpdateReservation,
    notifyCancelReservation,
  } = useReservationNotifications()

  useEffect(() => {
    // No suscribirse si notificaciones están deshabilitadas
    if (!config.enabled) {
      console.log('🔕 Notificaciones deshabilitadas por usuario')
      return
    }

    const setupGlobalRealtimeSubscription = () => {
      // Limpiar suscripción existente
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      console.log('🌍 [GlobalNotifications] Configurando suscripción global...')

      const channel = supabase
        .channel('global_reservation_changes', {
          config: {
            broadcast: { self: false },
            presence: { key: '' }
          }
        })
        .on(
          'broadcast',
          { event: 'reservation_changes' },
          (payload) => {
            console.log('🌍 [GlobalNotifications] Evento recibido:', payload)

            const data = payload.payload
            const eventType = data.type

            // Detectar si el tab está activo o en background
            const isTabActive = !document.hidden

            console.log(`📍 Tab ${isTabActive ? 'ACTIVO' : 'INACTIVO'} - Procesando ${eventType}`)

            switch (eventType) {
              case 'INSERT':
                const newReservation = data.new

                // Notificar siempre (respeta config interno de audio/browser)
                notifyNewReservation({
                  id: newReservation.id,
                  customerName: newReservation.customerName,
                  partySize: newReservation.partySize,
                  date: newReservation.date,
                  time: newReservation.time
                })
                break

              case 'UPDATE':
                const updatedReservation = data.new
                const oldReservation = data.old

                // Solo notificar cambios de estado significativos
                if (oldReservation && oldReservation.status !== updatedReservation.status) {
                  if (updatedReservation.status === 'CANCELLED') {
                    notifyCancelReservation({
                      id: updatedReservation.id,
                      customerName: updatedReservation.customerName,
                      partySize: updatedReservation.partySize,
                      date: updatedReservation.date,
                      time: updatedReservation.time
                    })
                  } else {
                    notifyUpdateReservation({
                      id: updatedReservation.id,
                      customerName: updatedReservation.customerName,
                      partySize: updatedReservation.partySize,
                      date: updatedReservation.date,
                      time: updatedReservation.time
                    })
                  }
                }
                break

              case 'DELETE':
                const deletedReservation = data.old
                notifyCancelReservation({
                  id: deletedReservation.id,
                  customerName: deletedReservation.customerName,
                  partySize: deletedReservation.partySize,
                  date: deletedReservation.date,
                  time: deletedReservation.time
                })
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('🌍 [GlobalNotifications] Status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ [GlobalNotifications] Suscripción global activa')
            isConnectedRef.current = true
          } else if (status === 'CLOSED') {
            console.log('❌ [GlobalNotifications] Suscripción cerrada')
            isConnectedRef.current = false
          }
        })

      channelRef.current = channel
    }

    setupGlobalRealtimeSubscription()

    // Cleanup al desmontar
    return () => {
      console.log('🧹 [GlobalNotifications] Limpiando suscripción global')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [config.enabled, notifyNewReservation, notifyUpdateReservation, notifyCancelReservation])

  return (
    <RealtimeNotificationsContext.Provider value={{ isConnected: isConnectedRef.current }}>
      {children}
    </RealtimeNotificationsContext.Provider>
  )
}
