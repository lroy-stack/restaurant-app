'use client'

import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ChevronLeft, ChevronRight, Calendar, Utensils, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
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
    occasion: 'Ocasión especial',
    occasionLabel: 'Es una ocasión especial (cumpleaños, aniversario, etc.)',
    occasionPlaceholder: 'ej. Cumpleaños, Aniversario, Cena de negocios',
    dietaryNotes: 'Alergias / Necesidades dietéticas',
    dietaryLabel: 'Tengo alergias o necesidades dietéticas especiales',
    dietaryPlaceholder: 'Compártenos cualquier alergia o necesidad dietética especial',
    specialRequests: 'Peticiones especiales',
    specialLabel: 'Tengo peticiones especiales para la mesa',
    specialPlaceholder: '¿Tienes alguna petición especial? Haremos todo lo posible por cumplirla.',
    additionalInfoOptional: 'Información adicional (opcional)',
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
    occasion: 'Special occasion',
    occasionLabel: 'This is a special occasion (birthday, anniversary, etc.)',
    occasionPlaceholder: 'e.g. Birthday, Anniversary, Business dinner',
    dietaryNotes: 'Allergies / Dietary requirements',
    dietaryLabel: 'I have allergies or special dietary requirements',
    dietaryPlaceholder: 'Please share any allergies or special dietary requirements',
    specialRequests: 'Special requests',
    specialLabel: 'I have special requests for the table',
    specialPlaceholder: 'Do you have any special requests? We will do our best to accommodate them.',
    additionalInfoOptional: 'Additional information (optional)',
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
    occasion: 'Besonderer Anlass',
    occasionLabel: 'Dies ist ein besonderer Anlass (Geburtstag, Jubiläum, etc.)',
    occasionPlaceholder: 'z.B. Geburtstag, Jubiläum, Geschäftsessen',
    dietaryNotes: 'Allergien / Ernährungshinweise',
    dietaryLabel: 'Ich habe Allergien oder besondere Ernährungswünsche',
    dietaryPlaceholder: 'Bitte teilen Sie uns Allergien oder besondere Ernährungswünsche mit',
    specialRequests: 'Besondere Wünsche',
    specialLabel: 'Ich habe besondere Wünsche für den Tisch',
    specialPlaceholder: 'Haben Sie besondere Wünsche? Wir versuchen gerne, diese zu erfüllen.',
    additionalInfoOptional: 'Zusätzliche Informationen (optional)',
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
    watch,
    setValue,
    formState: { errors }
  } = useFormContext()

  const t = content[language]

  // Watch checkbox states
  const hasOccasion = watch('stepThree.hasOccasion')
  const hasDietaryNotes = watch('stepThree.hasDietaryNotes')
  const hasSpecialRequests = watch('stepThree.hasSpecialRequests')

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
            <Label htmlFor="phone">
              {t.phone} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+34 600 123 456"
              {...register('stepThree.phone')}
              className="mt-2"
            />
            {errors.stepThree?.phone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stepThree.phone.message}
              </p>
            )}
          </div>

          {/* Special Information - Modern Checkboxes */}
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">{t.additionalInfoOptional}</h3>

            {/* Ocasión especial */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hasOccasion"
                  checked={hasOccasion}
                  onCheckedChange={(checked) => setValue('stepThree.hasOccasion', checked)}
                />
                <Label
                  htmlFor="hasOccasion"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  {t.occasionLabel}
                </Label>
              </div>
              {hasOccasion && (
                <div className={cn(
                  "space-y-2 pl-7 animate-in slide-in-from-top-1 duration-200",
                  hasOccasion && "fade-in-0"
                )}>
                  <Input
                    id="occasion"
                    placeholder={t.occasionPlaceholder}
                    {...register('stepThree.occasion')}
                    className="border-primary/20 focus:border-primary"
                  />
                  {errors.stepThree?.occasion && (
                    <p className="text-sm text-red-600">
                      {errors.stepThree.occasion.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Alergias y necesidades dietéticas */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hasDietaryNotes"
                  checked={hasDietaryNotes}
                  onCheckedChange={(checked) => setValue('stepThree.hasDietaryNotes', checked)}
                />
                <Label
                  htmlFor="hasDietaryNotes"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Utensils className="h-4 w-4 text-secondary" />
                  {t.dietaryLabel}
                </Label>
              </div>
              {hasDietaryNotes && (
                <div className={cn(
                  "space-y-2 pl-7 animate-in slide-in-from-top-1 duration-200",
                  hasDietaryNotes && "fade-in-0"
                )}>
                  <Textarea
                    id="dietaryNotes"
                    placeholder={t.dietaryPlaceholder}
                    rows={3}
                    {...register('stepThree.dietaryNotes')}
                    className="border-secondary/20 focus:border-secondary resize-none"
                  />
                  {errors.stepThree?.dietaryNotes && (
                    <p className="text-sm text-red-600">
                      {errors.stepThree.dietaryNotes.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Peticiones especiales */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hasSpecialRequests"
                  checked={hasSpecialRequests}
                  onCheckedChange={(checked) => setValue('stepThree.hasSpecialRequests', checked)}
                />
                <Label
                  htmlFor="hasSpecialRequests"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Heart className="h-4 w-4 text-accent" />
                  {t.specialLabel}
                </Label>
              </div>
              {hasSpecialRequests && (
                <div className={cn(
                  "space-y-2 pl-7 animate-in slide-in-from-top-1 duration-200",
                  hasSpecialRequests && "fade-in-0"
                )}>
                  <Textarea
                    id="specialRequests"
                    placeholder={t.specialPlaceholder}
                    rows={3}
                    {...register('stepThree.specialRequests')}
                    className="border-accent/20 focus:border-accent resize-none"
                  />
                  {errors.stepThree?.specialRequests && (
                    <p className="text-sm text-red-600">
                      {errors.stepThree.specialRequests.message}
                    </p>
                  )}
                </div>
              )}
            </div>
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