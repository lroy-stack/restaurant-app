'use client'

import { useState } from 'react'
import type { LargeGroupContactData, WhatsAppMessage } from '@/types/large-group-request'

interface UseLargeGroupContactReturn {
  sendRequest: (data: LargeGroupContactData) => Promise<void>
  formatWhatsAppMessage: (data: LargeGroupContactData) => WhatsAppMessage
  loading: boolean
  error: string | null
}

/**
 * Hook reutilizable para manejar solicitudes de grupos grandes
 * - Envía email al restaurante
 * - Formatea y abre WhatsApp
 * - Maneja estados de loading/error
 */
export function useLargeGroupContact(): UseLargeGroupContactReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Formatea mensaje de WhatsApp trilingüe
   */
  const formatWhatsAppMessage = (data: LargeGroupContactData): WhatsAppMessage => {
    const date = new Date(data.dateTime)
    const dateStr = date.toLocaleDateString(
      data.preferredLanguage === 'ES' ? 'es-ES' :
      data.preferredLanguage === 'EN' ? 'en-GB' :
      'de-DE',
      { day: '2-digit', month: '2-digit', year: 'numeric' }
    )
    const timeStr = date.toLocaleTimeString(
      data.preferredLanguage === 'ES' ? 'es-ES' :
      data.preferredLanguage === 'EN' ? 'en-GB' :
      'de-DE',
      { hour: '2-digit', minute: '2-digit' }
    )

    const content = {
      ES: {
        intro: `Hola! Soy ${data.firstName} ${data.lastName} 😊`,
        request: `Me gustaría reservar una mesa para un grupo de *${data.partySize} personas* el *${dateStr}* a las *${timeStr}*.`,
        understand: 'Entiendo que para grupos grandes necesitáis confirmar disponibilidad personalmente.',
        contact: 'Mis datos de contacto son:',
        email: `📧 ${data.email}`,
        phone: `📱 ${data.phone}`,
        closing: '¿Podríais confirmarme si tenéis disponibilidad? Muchas gracias! 🙏'
      },
      EN: {
        intro: `Hi! I'm ${data.firstName} ${data.lastName} 😊`,
        request: `I would like to book a table for a group of *${data.partySize} people* on *${dateStr}* at *${timeStr}*.`,
        understand: 'I understand that for large groups you need to confirm availability personally.',
        contact: 'My contact details are:',
        email: `📧 ${data.email}`,
        phone: `📱 ${data.phone}`,
        closing: 'Could you please confirm if you have availability? Thank you! 🙏'
      },
      DE: {
        intro: `Hallo! Ich bin ${data.firstName} ${data.lastName} 😊`,
        request: `Ich möchte gerne einen Tisch für eine Gruppe von *${data.partySize} Personen* am *${dateStr}* um *${timeStr}* reservieren.`,
        understand: 'Ich verstehe, dass Sie für große Gruppen die Verfügbarkeit persönlich bestätigen müssen.',
        contact: 'Meine Kontaktdaten sind:',
        email: `📧 ${data.email}`,
        phone: `📱 ${data.phone}`,
        closing: 'Könnten Sie mir bitte bestätigen, ob Sie verfügbar sind? Vielen Dank! 🙏'
      }
    }

    const t = content[data.preferredLanguage]

    let message = `${t.intro}\n\n`
    message += `${t.request}\n\n`
    message += `${t.understand}\n\n`
    message += `${t.contact}\n`
    message += `${t.email}\n`
    message += `${t.phone}\n`

    if (data.notes) {
      message += `\n💭 ${data.notes}\n`
    }

    message += `\n${t.closing}`

    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = '+34672796006' // Sin espacios para URL
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    return { text: message, url }
  }

  /**
   * Envía solicitud al servidor y abre WhatsApp
   */
  const sendRequest = async (data: LargeGroupContactData): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // 1. PRIMERO: Abrir WhatsApp (acción directa del usuario, no se bloquea)
      const whatsapp = formatWhatsAppMessage(data)
      window.open(whatsapp.url, '_blank', 'noopener,noreferrer')

      // 2. DESPUÉS: Enviar email al restaurante en background
      const response = await fetch('/api/large-group-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al enviar solicitud')
      }

      const result = await response.json()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    sendRequest,
    formatWhatsAppMessage,
    loading,
    error
  }
}
