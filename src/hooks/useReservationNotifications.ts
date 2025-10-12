'use client'

import { useEffect, useState } from 'react'
import useSound from 'use-sound'
import { toast } from 'sonner'

interface NotificationConfig {
  enabled: boolean
  soundEnabled: boolean
  volume: number
}

interface ReservationData {
  id: string
  customerName: string
  customerEmail?: string
  partySize: number
  date: string
  time: string
  status?: string
  tableId?: string
}

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  soundEnabled: true,
  volume: 0.7
}

export function useReservationNotifications() {
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG)

  // Cargar configuración de localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification-settings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setConfig({ ...DEFAULT_CONFIG, ...parsed })
        } catch (err) {
          console.error('Error parsing notification settings:', err)
        }
      }
    }
  }, [])

  // Cargar sonidos (lazy loaded)
  const [playNew] = useSound('/sounds/new-reservation.mp3', {
    volume: config.volume,
    soundEnabled: config.soundEnabled && config.enabled
  })

  const [playUpdate] = useSound('/sounds/update-reservation.mp3', {
    volume: config.volume,
    soundEnabled: config.soundEnabled && config.enabled
  })

  const [playCancel] = useSound('/sounds/cancel-reservation.mp3', {
    volume: config.volume,
    soundEnabled: config.soundEnabled && config.enabled
  })

  const notifyNewReservation = (data: ReservationData) => {
    if (!config.enabled) return

    // Reproducir sonido
    if (config.soundEnabled) {
      try {
        playNew()
      } catch (err) {
        console.error('Error playing sound:', err)
      }
    }

    // Mostrar toast visual
    toast.success(`🎉 Nueva Reserva`, {
      description: `${data.customerName} - ${data.partySize} ${data.partySize === 1 ? 'persona' : 'personas'} - ${data.time}`,
      duration: 6000,
      action: {
        label: 'Ver',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = `/dashboard/reservaciones?highlight=${data.id}`
          }
        }
      }
    })

    // Browser notification (si están habilitadas)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Nueva Reserva - Enigma', {
          body: `${data.customerName} - ${data.partySize} personas - ${data.time}`,
          icon: '/favicon.ico',
          tag: `reservation-${data.id}`,
          requireInteraction: true
        })
      } catch (err) {
        console.error('Error showing browser notification:', err)
      }
    }
  }

  const notifyUpdateReservation = (data: ReservationData) => {
    if (!config.enabled) return

    // Reproducir sonido
    if (config.soundEnabled) {
      try {
        playUpdate()
      } catch (err) {
        console.error('Error playing sound:', err)
      }
    }

    // Mostrar toast visual
    toast.info(`✏️ Reserva Modificada`, {
      description: `${data.customerName} - Cambios en la reserva`,
      duration: 4000
    })
  }

  const notifyCancelReservation = (data: ReservationData) => {
    if (!config.enabled) return

    // Reproducir sonido
    if (config.soundEnabled) {
      try {
        playCancel()
      } catch (err) {
        console.error('Error playing sound:', err)
      }
    }

    // Mostrar toast visual
    toast.error(`❌ Reserva Cancelada`, {
      description: `${data.customerName} - ${data.partySize} ${data.partySize === 1 ? 'persona' : 'personas'}`,
      duration: 5000
    })
  }

  // Actualizar configuración
  const updateConfig = (newConfig: Partial<NotificationConfig>) => {
    const updated = { ...config, ...newConfig }
    setConfig(updated)

    if (typeof window !== 'undefined') {
      localStorage.setItem('notification-settings', JSON.stringify(updated))
    }
  }

  // Solicitar permisos de notificación del navegador
  const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return Notification.permission === 'granted'
  }

  return {
    config,
    updateConfig,
    notifyNewReservation,
    notifyUpdateReservation,
    notifyCancelReservation,
    requestBrowserPermission
  }
}
