'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LargeGroupContactForm } from '@/components/forms/LargeGroupContactForm'
import { useLargeGroupContact } from '@/hooks/useLargeGroupContact'
import type { Language } from '@/lib/validations/reservation-professional'
import type { LargeGroupContactFormData } from '@/types/large-group-request'
import { toast } from 'sonner'
import { MessageCircle, CheckCircle } from 'lucide-react'

interface LargeGroupContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateTime: string
  partySize: number
  language: Language
}

const content = {
  es: {
    title: 'Solicitud de Reserva para Grupo Grande',
    description: 'Completa tus datos y te contactaremos directamente por WhatsApp para confirmar tu reserva.',
    successTitle: '¡Perfecto! Ahora ve a WhatsApp',
    successDescription: 'Hemos abierto WhatsApp con tu mensaje preparado. Por favor, envía el mensaje para completar tu solicitud de reserva.',
    successButton: 'Entendido',
    whatsappInstruction: '📱 Abre WhatsApp y envía el mensaje para confirmar',
    errorTitle: 'Error',
    errorMessage: 'Hubo un problema al enviar la solicitud. Por favor, intenta de nuevo.'
  },
  en: {
    title: 'Large Group Reservation Request',
    description: 'Fill in your details and we will contact you directly via WhatsApp to confirm your reservation.',
    successTitle: 'Perfect! Now go to WhatsApp',
    successDescription: 'We have opened WhatsApp with your message ready. Please send the message to complete your reservation request.',
    successButton: 'Got it',
    whatsappInstruction: '📱 Open WhatsApp and send the message to confirm',
    errorTitle: 'Error',
    errorMessage: 'There was a problem sending the request. Please try again.'
  },
  de: {
    title: 'Anfrage für Gruppenreservierung',
    description: 'Füllen Sie Ihre Daten aus und wir kontaktieren Sie direkt über WhatsApp, um Ihre Reservierung zu bestätigen.',
    successTitle: 'Perfekt! Gehen Sie jetzt zu WhatsApp',
    successDescription: 'Wir haben WhatsApp mit Ihrer vorbereiteten Nachricht geöffnet. Bitte senden Sie die Nachricht, um Ihre Reservierungsanfrage abzuschließen.',
    successButton: 'Verstanden',
    whatsappInstruction: '📱 Öffnen Sie WhatsApp und senden Sie die Nachricht zur Bestätigung',
    errorTitle: 'Fehler',
    errorMessage: 'Beim Senden der Anfrage ist ein Problem aufgetreten. Bitte versuchen Sie es erneut.'
  }
}

/**
 * Modal wrapper para formulario de contacto de grupos grandes
 * Maneja el estado del modal y la integración con el hook
 */
export function LargeGroupContactModal({
  open,
  onOpenChange,
  dateTime,
  partySize,
  language
}: LargeGroupContactModalProps) {
  const t = content[language]
  const { sendRequest, loading } = useLargeGroupContact()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (formData: LargeGroupContactFormData) => {
    try {
      await sendRequest({
        ...formData,
        dateTime,
        partySize,
        preferredLanguage: language.toUpperCase() as 'ES' | 'EN' | 'DE'
      })

      // Mostrar pantalla de éxito en lugar de cerrar
      setShowSuccess(true)
    } catch (error) {
      toast.error(t.errorTitle, {
        description: t.errorMessage
      })
    }
  }

  const handleCancel = () => {
    setShowSuccess(false)
    onOpenChange(false)
  }

  const handleClose = () => {
    setShowSuccess(false)
    onOpenChange(false)
    // Recargar la página para limpiar el formulario
    window.location.reload()
  }

  // Si cierran el modal después del éxito (sin usar botón), también recargar
  useEffect(() => {
    if (!open && showSuccess) {
      window.location.reload()
    }
  }, [open, showSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{t.title}</DialogTitle>
              <DialogDescription className="text-base">
                {t.description}
              </DialogDescription>
            </DialogHeader>
            <LargeGroupContactForm
              dateTime={dateTime}
              partySize={partySize}
              language={language}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </>
        ) : (
          <div className="py-6 text-center space-y-6">
            <div className="mx-auto w-fit p-4 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-3">
              <DialogTitle className="text-2xl font-bold">
                {t.successTitle}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t.successDescription}
              </DialogDescription>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800 dark:text-green-400 flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t.whatsappInstruction}
              </p>
            </div>

            <Button
              onClick={handleClose}
              size="lg"
              className="w-full"
            >
              {t.successButton}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
