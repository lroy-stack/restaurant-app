'use client'

import React, { useState } from 'react'
import { ContactCTACard } from '@/components/ui/contact-cta-card'
import { LargeGroupContactModal } from '@/components/modals/LargeGroupContactModal'
import type { Language } from '@/lib/validations/reservation-professional'
import { Users } from 'lucide-react'

interface LargeGroupSectionProps {
  dateTime: string | null
  partySize: number
  language: Language
}

const content = {
  es: {
    title: 'Grupos de Más de 8 Personas',
    description: 'Para garantizar la mejor experiencia para tu grupo, contáctanos directamente. Te ayudaremos a crear una reserva perfecta para tu ocasión especial.',
    buttonText: 'Solicitar Reserva para Grupo',
    noDateTitle: 'Selecciona Fecha y Hora Primero',
    noDateDescription: 'Por favor, selecciona una fecha y hora antes de solicitar una reserva para grupo grande.'
  },
  en: {
    title: 'Groups of More Than 8 People',
    description: 'To ensure the best experience for your group, contact us directly. We will help you create a perfect reservation for your special occasion.',
    buttonText: 'Request Group Reservation',
    noDateTitle: 'Select Date and Time First',
    noDateDescription: 'Please select a date and time before requesting a large group reservation.'
  },
  de: {
    title: 'Gruppen von Mehr als 8 Personen',
    description: 'Um das beste Erlebnis für Ihre Gruppe zu gewährleisten, kontaktieren Sie uns direkt. Wir helfen Ihnen, eine perfekte Reservierung für Ihren besonderen Anlass zu erstellen.',
    buttonText: 'Gruppenreservierung Anfragen',
    noDateTitle: 'Wählen Sie Zuerst Datum und Uhrzeit',
    noDateDescription: 'Bitte wählen Sie ein Datum und eine Uhrzeit, bevor Sie eine Gruppenreservierung anfragen.'
  }
}

/**
 * Sección específica para grupos grandes
 * Composición de ContactCTACard + LargeGroupContactModal
 * Se muestra cuando partySize >= 9
 */
export function LargeGroupSection({
  dateTime,
  partySize,
  language
}: LargeGroupSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const t = content[language]

  const handleOpenModal = () => {
    if (!dateTime) {
      // Si no hay fecha/hora seleccionada, no abrir modal
      return
    }
    setModalOpen(true)
  }

  // Si no hay fecha/hora, mostrar mensaje
  const displayTitle = dateTime ? t.title : t.noDateTitle
  const displayDescription = dateTime ? t.description : t.noDateDescription

  return (
    <>
      <ContactCTACard
        title={displayTitle}
        description={displayDescription}
        icon={<Users className="h-6 w-6 text-primary" />}
        buttonText={t.buttonText}
        onButtonClick={handleOpenModal}
        variant="whatsapp"
        disabled={!dateTime}
      />

      {dateTime && (
        <LargeGroupContactModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          dateTime={dateTime}
          partySize={partySize}
          language={language}
        />
      )}
    </>
  )
}
