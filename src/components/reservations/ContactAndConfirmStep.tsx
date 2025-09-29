'use client'

import Link from 'next/link'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Users,
  ChevronLeft,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Shield,
  Loader2,
  Utensils,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/validations/reservation-professional'
import type { AvailabilityData } from '@/hooks/useReservations'

interface ContactAndConfirmStepProps {
  language: Language
  onPrevious: () => void
  onSubmit: () => void
  isSubmitting: boolean
  availability: AvailabilityData | null
  selectedDate: string
  selectedTime: string
  partySize: number
}

const locations = {
  TERRACE_SEA_VIEW: {
    name: { es: 'Terraza Vista Mar', en: 'Sea View Terrace', de: 'Terrasse Meerblick' }
  },
  TERRACE_STANDARD: {
    name: { es: 'Terraza Standard', en: 'Standard Terrace', de: 'Terrasse Standard' }
  },
  INTERIOR_WINDOW: {
    name: { es: 'Interior Ventana', en: 'Interior Window', de: 'Innen am Fenster' }
  },
  INTERIOR_STANDARD: {
    name: { es: 'Interior Standard', en: 'Interior Standard', de: 'Innen Standard' }
  },
  BAR_AREA: {
    name: { es: 'Zona Bar', en: 'Bar Area', de: 'Bar-Bereich' }
  },
}

const content = {
  es: {
    title: 'Contacto y Confirmación',
    subtitle: 'Completa tus datos y confirma tu reserva',
    contactTitle: 'Datos de Contacto',
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
    reservationSummary: 'Resumen de la Reserva',
    contactInfo: 'Información de Contacto',
    additionalInfo: 'Información Adicional',
    preOrderSummary: 'Resumen del Pre-pedido',
    date: 'Fecha:',
    time: 'Hora:',
    people: 'Personas:',
    table: 'Mesa:',
    total: 'Total:',
    gdprTitle: 'Protección de datos y consentimientos',
    dataProcessing: 'Acepto el procesamiento de mis datos personales para realizar la reserva conforme a la',
    privacyPolicy: 'política de privacidad',
    emailConsent: 'Deseo recibir un email de confirmación para mi reserva.',
    marketingConsent: 'Deseo recibir información ocasional sobre ofertas especiales y eventos por email.',
    importantNotices: 'Información importante:',
    notice1: '• Las reservas pueden cancelarse gratuitamente hasta 24h antes',
    notice2: '• En caso de retraso superior a 15 minutos, la mesa puede ser reasignada',
    notice3: '• Recibirás un email de confirmación con todos los detalles',
    previous: 'Anterior',
    confirmReservation: 'Confirmar Reserva',
    processing: 'Procesando...',
    required: 'requerido'
  },
  en: {
    title: 'Contact & Confirmation',
    subtitle: 'Complete your details and confirm your reservation',
    contactTitle: 'Contact Details',
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
    reservationSummary: 'Reservation Summary',
    contactInfo: 'Contact Information',
    additionalInfo: 'Additional Information',
    preOrderSummary: 'Pre-order Summary',
    date: 'Date:',
    time: 'Time:',
    people: 'People:',
    table: 'Table:',
    total: 'Total:',
    gdprTitle: 'Data protection and consents',
    dataProcessing: 'I agree to the processing of my personal data to make the reservation according to the',
    privacyPolicy: 'privacy policy',
    emailConsent: 'I want to receive a confirmation email for my reservation.',
    marketingConsent: 'I want to receive occasional information about special offers and events by email.',
    importantNotices: 'Important information:',
    notice1: '• Reservations can be cancelled free of charge up to 24h before',
    notice2: '• In case of delay exceeding 15 minutes, the table may be reassigned',
    notice3: '• You will receive a confirmation email with all details',
    previous: 'Previous',
    confirmReservation: 'Confirm Reservation',
    processing: 'Processing...',
    required: 'required'
  },
  de: {
    title: 'Kontakt & Bestätigung',
    subtitle: 'Vervollständigen Sie Ihre Daten und bestätigen Sie Ihre Reservierung',
    contactTitle: 'Kontaktdaten',
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
    reservationSummary: 'Reservierungsübersicht',
    contactInfo: 'Kontaktinformationen',
    additionalInfo: 'Zusätzliche Informationen',
    preOrderSummary: 'Vorbestellungsübersicht',
    date: 'Datum:',
    time: 'Uhrzeit:',
    people: 'Personen:',
    table: 'Tisch:',
    total: 'Gesamt:',
    gdprTitle: 'Datenschutz und Einverständniserklärungen',
    dataProcessing: 'Ich stimme der Verarbeitung meiner personenbezogenen Daten zur Reservierung gemäß der',
    privacyPolicy: 'Datenschutzerklärung',
    emailConsent: 'Ich möchte eine Bestätigungs-E-Mail für meine Reservierung erhalten.',
    marketingConsent: 'Ich möchte gelegentlich Informationen über besondere Angebote und Veranstaltungen per E-Mail erhalten.',
    importantNotices: 'Wichtige Hinweise:',
    notice1: '• Reservierungen können bis 24h vorher kostenfrei storniert werden',
    notice2: '• Bei Verspätung von mehr als 15 Minuten kann der Tisch anderweitig vergeben werden',
    notice3: '• Sie erhalten eine Bestätigungs-E-Mail mit allen Details',
    previous: 'Zurück',
    confirmReservation: 'Reservierung bestätigen',
    processing: 'Wird verarbeitet...',
    required: 'erforderlich'
  }
}

export default function ContactAndConfirmStep({
  language,
  onPrevious,
  onSubmit,
  isSubmitting,
  availability,
  selectedDate,
  selectedTime,
  partySize
}: ContactAndConfirmStepProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useFormContext()

  const t = content[language]

  const watchedStepTwo = watch('stepTwo')
  const watchedStepThree = watch('stepThree')
  const watchedStepFour = watch('stepFour')

  // Watch checkbox states for special fields
  const hasOccasion = watch('stepThree.hasOccasion')
  const hasDietaryNotes = watch('stepThree.hasDietaryNotes')
  const hasSpecialRequests = watch('stepThree.hasSpecialRequests')

  const selectedTableId = watchedStepTwo?.tableId
  const preOrderItems = watchedStepTwo?.preOrderItems || []
  const preOrderTotal = watchedStepTwo?.preOrderTotal || 0

  // Find selected table details
  const selectedTable = availability?.recommendations?.find(
    table => table.id === selectedTableId
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = async () => {
    const stepThreeValid = await trigger('stepThree')
    const stepFourValid = await trigger('stepFour')

    if (stepThreeValid && stepFourValid && watchedStepFour?.dataProcessingConsent) {
      onSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: Contacto (copiar de ReservationStepThree) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.title}
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-4">{t.contactTitle}</h3>

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

              <div className="space-y-4">
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
                  <h3 className="text-sm font-medium text-muted-foreground">Información adicional (opcional)</h3>

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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 2: Resumen (copiar de ReservationStepFour) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.reservationSummary}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reservation Summary */}
          <div>
            <div className="grid gap-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t.date}
                </span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t.time}
                </span>
                <span className="font-medium">{selectedTime}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t.people}
                </span>
                <span className="font-medium">{partySize}</span>
              </div>

              {selectedTable && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t.table}
                  </span>
                  <span className="font-medium">
                    {selectedTable.number} ({locations[selectedTable.location as keyof typeof locations]?.name[language]})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(watchedStepThree?.firstName || watchedStepThree?.email) && (
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-3">{t.contactInfo}</h3>
              <div className="grid gap-2 text-sm">
                {(watchedStepThree?.firstName || watchedStepThree?.lastName) && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{watchedStepThree?.firstName} {watchedStepThree?.lastName}</span>
                  </div>
                )}
                {watchedStepThree?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{watchedStepThree.email}</span>
                  </div>
                )}
                {watchedStepThree?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{watchedStepThree.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(watchedStepThree?.occasion || watchedStepThree?.dietaryNotes || watchedStepThree?.specialRequests) && (
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-3">{t.additionalInfo}</h3>
              <div className="space-y-3">
                {watchedStepThree.occasion && (
                  <div>
                    <span className="text-sm font-medium">{t.occasion}</span>
                    <p className="text-sm text-muted-foreground">{watchedStepThree.occasion}</p>
                  </div>
                )}

                {watchedStepThree.dietaryNotes && (
                  <div>
                    <span className="text-sm font-medium">{t.dietaryNotes}:</span>
                    <p className="text-sm text-muted-foreground">{watchedStepThree.dietaryNotes}</p>
                  </div>
                )}

                {watchedStepThree.specialRequests && (
                  <div>
                    <span className="text-sm font-medium">{t.specialRequests}:</span>
                    <p className="text-sm text-muted-foreground">{watchedStepThree.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pre-order Summary */}
          {preOrderItems.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-3">{t.preOrderSummary}</h3>
              <div className="space-y-2">
                {preOrderItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>{t.total}</span>
                    <span>€{preOrderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECCIÓN 3: GDPR - Optimized Responsive Design */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.gdprTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* GDPR Consent Section */}
          <div className="p-3 sm:p-4 bg-gray-50/80 rounded-lg border border-gray-200/50">
            <div className="space-y-3 sm:space-y-4">
              {/* Required Data Processing Consent */}
              <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-md border border-primary/30 bg-primary/5">
                <Checkbox
                  id="dataProcessingConsent"
                  checked={watchedStepFour?.dataProcessingConsent || false}
                  onCheckedChange={(checked) => setValue('stepFour.dataProcessingConsent', checked)}
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="dataProcessingConsent" className="text-xs sm:text-sm leading-relaxed cursor-pointer text-gray-700">
                  <span className="font-medium text-primary">Consentimiento obligatorio <span className="text-red-500">*</span></span>
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> — </span>
                  <span>{t.dataProcessing} <Link
                    href={language === 'es' ? '/legal/politica-privacidad' : '/legal/politica-privacidad/en'}
                    className="text-primary underline hover:text-primary/80 transition-colors"
                    target="_blank"
                  >
                    {t.privacyPolicy}
                  </Link>.</span>
                </Label>
              </div>
              {errors.stepFour?.dataProcessingConsent && (
                <p className="text-xs sm:text-sm text-red-600 ml-6 sm:ml-7">
                  {errors.stepFour.dataProcessingConsent.message}
                </p>
              )}

              {/* Email Confirmation Consent */}
              <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-md border border-gray-200/50 bg-white/50">
                <Checkbox
                  id="emailConsent"
                  checked={Boolean(watchedStepFour?.emailConsent)}
                  onCheckedChange={(checked) => setValue('stepFour.emailConsent', Boolean(checked))}
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="emailConsent" className="text-xs sm:text-sm leading-relaxed cursor-pointer text-gray-700">
                  <span className="font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email de confirmación
                  </span>
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> — </span>
                  <span className="text-gray-600">{t.emailConsent}</span>
                </Label>
              </div>

              {/* Marketing Consent */}
              <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-md border border-gray-200/50 bg-white/50">
                <Checkbox
                  id="marketingConsent"
                  checked={Boolean(watchedStepFour?.marketingConsent)}
                  onCheckedChange={(checked) => setValue('stepFour.marketingConsent', Boolean(checked))}
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="marketingConsent" className="text-xs sm:text-sm leading-relaxed cursor-pointer text-gray-700">
                  <span className="font-medium flex items-center gap-2">
                    <Utensils className="h-3 w-3" />
                    Ofertas y eventos
                  </span>
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> — </span>
                  <span className="text-gray-600">{t.marketingConsent}</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Important Notice - Optimized Responsive Design */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50/80 rounded-lg border border-blue-200/50">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#237584] mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-blue-900 mb-2 sm:mb-1">{t.importantNotices}</p>
                <div className="text-blue-800 space-y-1">
                  <p className="leading-relaxed">{t.notice1}</p>
                  <p className="leading-relaxed">{t.notice2}</p>
                  <p className="leading-relaxed">{t.notice3}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
          size="lg"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t.previous}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !watchedStepFour?.dataProcessingConsent}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t.confirmReservation}
            </>
          )}
        </Button>
      </div>

      {/* Progress Indicator */}
      {!watchedStepFour?.dataProcessingConsent && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Shield className="h-4 w-4" />
          <span>Acepta la política de privacidad para continuar</span>
        </div>
      )}
    </div>
  )
}