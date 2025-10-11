'use client'

import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import type { Language } from '@/lib/validations/reservation-professional'

interface SuccessScreenProps {
  language: Language
  onBackHome: () => void
  onViewMenu: () => void
}

const content = {
  es: {
    title: '¡Reserva Confirmada!',
    message: 'Gracias por tu reserva. Te enviaremos un email de confirmación en breve.',
    backHome: 'Volver al Inicio',
    viewMenu: 'Ver Carta'
  },
  en: {
    title: 'Reservation Confirmed!',
    message: 'Thank you for your reservation. We will send you a confirmation email shortly.',
    backHome: 'Back to Home',
    viewMenu: 'View Menu'
  },
  de: {
    title: 'Reservierung bestätigt!',
    message: 'Vielen Dank für Ihre Reservierung. Wir senden Ihnen in Kürze eine Bestätigungs-E-Mail.',
    backHome: 'Zur Startseite',
    viewMenu: 'Speisekarte ansehen'
  }
}

export const SuccessScreen = forwardRef<HTMLDivElement, SuccessScreenProps>(
  ({ language, onBackHome, onViewMenu }, ref) => {
    const t = content[language]

    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Card ref={ref} className="max-w-lg w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="enigma-card-title">
              {t.title}
            </h2>

            <p className="text-muted-foreground mb-6">
              {t.message}
            </p>

            <div className="flex gap-3">
              <Button onClick={onBackHome} className="flex-1">
                {t.backHome}
              </Button>
              <Button variant="outline" onClick={onViewMenu} className="flex-1">
                {t.viewMenu}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
)

SuccessScreen.displayName = 'SuccessScreen'
