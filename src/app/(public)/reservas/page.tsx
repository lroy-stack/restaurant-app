'use client'

import { useState } from 'react'
import ProfessionalReservationForm from '@/components/reservations/ProfessionalReservationForm'
import type { Language } from '@/lib/validations/reservation-professional'

export default function ReservasPage() {
  const [language, setLanguage] = useState<Language>('es')

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }


  return (
    <ProfessionalReservationForm 
      language={language}
      onLanguageChange={handleLanguageChange}
    />
  )
}