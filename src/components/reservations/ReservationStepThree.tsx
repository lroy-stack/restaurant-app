'use client'

import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Language } from '@/lib/validations/reservation-professional'

interface ReservationStepThreeProps {
  language: Language
  onNext: () => void
  onPrevious: () => void
}

const content = {
  es: {
    title: 'Datos de Contacto',
    subtitle: 'Completa tus datos para la reserva',
    firstName: 'Nombre',
    lastName: 'Apellidos',
    email: 'Email',
    phone: 'Teléfono',
    phoneOptional: 'Teléfono (opcional)',
    occasion: 'Ocasión (opcional)',
    occasionPlaceholder: 'ej. Cumpleaños, Aniversario, Cena de negocios',
    dietaryNotes: 'Alergias / Necesidades dietéticas',
    dietaryPlaceholder: 'Compártenos cualquier alergia o necesidad dietética especial',
    specialRequests: 'Peticiones especiales',
    specialPlaceholder: '¿Tienes alguna petición especial? Haremos todo lo posible por cumplirla.',
    previous: 'Anterior',
    next: 'Siguiente',
    required: 'requerido'
  },
  en: {
    title: 'Contact Details',
    subtitle: 'Complete your details for the reservation',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    phoneOptional: 'Phone (optional)',
    occasion: 'Occasion (optional)',
    occasionPlaceholder: 'e.g. Birthday, Anniversary, Business dinner',
    dietaryNotes: 'Allergies / Dietary requirements',
    dietaryPlaceholder: 'Please share any allergies or special dietary requirements',
    specialRequests: 'Special requests',
    specialPlaceholder: 'Do you have any special requests? We will do our best to accommodate them.',
    previous: 'Previous',
    next: 'Next',
    required: 'required'
  },
  de: {
    title: 'Kontaktdaten',
    subtitle: 'Vervollständigen Sie Ihre Daten für die Reservierung',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    phone: 'Telefon',
    phoneOptional: 'Telefon (optional)',
    occasion: 'Anlass (optional)',
    occasionPlaceholder: 'z.B. Geburtstag, Jubiläum, Geschäftsessen',
    dietaryNotes: 'Allergien / Ernährungshinweise',
    dietaryPlaceholder: 'Bitte teilen Sie uns Allergien oder besondere Ernährungswünsche mit',
    specialRequests: 'Besondere Wünsche',
    specialPlaceholder: 'Haben Sie besondere Wünsche? Wir versuchen gerne, diese zu erfüllen.',
    previous: 'Zurück',
    next: 'Weiter',
    required: 'erforderlich'
  }
}

export default function ReservationStepThree({
  language,
  onNext,
  onPrevious
}: ReservationStepThreeProps) {
  const {
    register,
    trigger,
    formState: { errors }
  } = useFormContext()

  const t = content[language]

  const handleNext = async () => {
    const isValid = await trigger('stepThree')
    if (isValid) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          {t.title}
        </CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t.firstName} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register('stepThree.firstName')}
                className="mt-2"
              />
              {errors.stepThree?.firstName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.stepThree.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t.lastName} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register('stepThree.lastName')}
                className="mt-2"
              />
              {errors.stepThree?.lastName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.stepThree.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t.email} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('stepThree.email')}
              className="mt-2"
            />
            {errors.stepThree?.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stepThree.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+34 XXX XXX XXX"
              {...register('stepThree.phone')}
              className="mt-2"
            />
            {errors.stepThree?.phone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stepThree.phone.message}
              </p>
            )}
          </div>

          {/* Special Information */}
          <div className="space-y-2">
            <Label htmlFor="occasion">{t.occasion}</Label>
            <Input
              id="occasion"
              placeholder={t.occasionPlaceholder}
              {...register('stepThree.occasion')}
              className="mt-2"
            />
            {errors.stepThree?.occasion && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stepThree.occasion.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietaryNotes">{t.dietaryNotes}</Label>
            <Textarea
              id="dietaryNotes"
              placeholder={t.dietaryPlaceholder}
              rows={3}
              {...register('stepThree.dietaryNotes')}
              className="mt-2"
            />
            {errors.stepThree?.dietaryNotes && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stepThree.dietaryNotes.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">{t.specialRequests}</Label>
            <Textarea
              id="specialRequests"
              placeholder={t.specialPlaceholder}
              rows={3}
              {...register('stepThree.specialRequests')}
              className="mt-2"
            />
            {errors.stepThree?.specialRequests && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stepThree.specialRequests.message}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={onPrevious} className="flex-1">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t.previous}
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {t.next}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}