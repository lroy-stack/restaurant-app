'use client'

import { useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface NotificationOptions {
  enableSound?: boolean
  enableToast?: boolean
}

export function useOrderNotifications(options: NotificationOptions = {}) {
  const { enableSound = true, enableToast = true } = options
  const audioContextRef = useRef<AudioContext | null>(null)
  const isAudioEnabledRef = useRef(false)

  // Initialize AudioContext on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        isAudioEnabledRef.current = true
        console.log('[Audio] Initialized AudioContext')
      }
    }

    // Initialize on first click anywhere
    document.addEventListener('click', initAudio, { once: true })

    return () => {
      document.removeEventListener('click', initAudio)
      audioContextRef.current?.close()
    }
  }, [])

  // Web Audio API - Generate beep sounds
  const playBeep = useCallback((frequency: number, duration: number, volume: number) => {
    if (!audioContextRef.current || !isAudioEnabledRef.current) {
      console.warn('[Audio] AudioContext not initialized - awaiting user interaction')
      return
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'
    gainNode.gain.value = volume

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)
  }, [])

  const playNewOrderNotification = useCallback((orderNumber?: string) => {
    if (enableSound) {
      // High-pitch attention-grabbing beep (800Hz, 300ms)
      playBeep(800, 300, 0.3)
    }

    if (enableToast) {
      toast.success(
        orderNumber
          ? `🔔 Nuevo pedido: ${orderNumber}`
          : '🔔 Nuevo pedido recibido',
        {
          duration: 5000,
          className: 'bg-green-50 border-green-200',
        }
      )
    }
  }, [enableSound, enableToast, playBeep])

  const playStatusUpdateNotification = useCallback((status?: string, orderNumber?: string) => {
    if (enableSound) {
      // Subtle confirmation tone (600Hz, 150ms)
      playBeep(600, 150, 0.2)
    }

    if (enableToast) {
      const statusLabels: Record<string, string> = {
        CONFIRMED: '✅ Confirmado',
        PREPARING: '👨‍🍳 En preparación',
        READY: '🔔 Listo para servir',
        SERVED: '✨ Servido',
        CANCELLED: '❌ Cancelado'
      }

      const label = status ? statusLabels[status] || status : 'Estado actualizado'
      const message = orderNumber ? `${label}: ${orderNumber}` : label

      toast.info(message, {
        duration: 3000,
      })
    }
  }, [enableSound, enableToast, playBeep])

  const playErrorNotification = useCallback((message: string) => {
    if (enableToast) {
      toast.error(message, {
        duration: 4000,
      })
    }
  }, [enableToast])

  return {
    playNewOrderNotification,
    playStatusUpdateNotification,
    playErrorNotification,
  }
}
