'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useFormContext, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InternationalPhoneInput } from '@/components/ui/phone-input'
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

interface PreOrderItem {
  id: string
  name: string
  price: number
  quantity: number
  type: string
}

interface SelectedTable {
  id: string
  number: string
  capacity: number
  location?: string
}

interface ContactAndConfirmStepProps {
  language: Language
  onPrevious: () => void
  onSubmit: () => void
  isSubmitting: boolean
  availability: AvailabilityData | null
  selectedDate: string
  selectedTime: string
  partySize: number
  childrenCount?: number
  tableIds?: string[]
  preOrderItems?: PreOrderItem[]
  preOrderTotal?: number
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
    additionalInfoOptional: 'Información adicional (opcional)',
    preOrderSummary: 'Resumen del Pre-pedido',
    date: 'Fecha:',
    time: 'Hora:',
    people: 'Personas:',
    table: 'Mesa:',
    total: 'Total:',
    gdprTitle: 'Protección de datos y consentimientos',
    dataProcessing: 'Acepto el procesamiento de mis datos',
    dataProcessingFull: 'conforme a la',
    privacyPolicy: 'política de privacidad',
    emailConsentShort: 'Email de confirmación',
    marketingConsentShort: 'Ofertas y eventos por email',
    compactNotice: 'Las reservas pueden cancelarse hasta 2h antes • En caso de retraso +15min, la mesa puede reasignarse • Recibirás email de confirmación',
    emailConsent: 'Deseo recibir un email de confirmación para mi reserva.',
    marketingConsent: 'Deseo recibir información ocasional sobre ofertas especiales y eventos por email.',
    importantNotices: 'Información importante:',
    notice1: '• Las reservas pueden cancelarse gratuitamente hasta 2h antes',
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
    additionalInfoOptional: 'Additional information (optional)',
    preOrderSummary: 'Pre-order Summary',
    date: 'Date:',
    time: 'Time:',
    people: 'People:',
    table: 'Table:',
    total: 'Total:',
    gdprTitle: 'Data protection and consents',
    dataProcessing: 'I agree to the processing of my data',
    dataProcessingFull: 'according to the',
    privacyPolicy: 'privacy policy',
    emailConsentShort: 'Confirmation email',
    marketingConsentShort: 'Offers and events by email',
    compactNotice: 'Reservations can be cancelled up to 2h before • In case of +15min delay, the table may be reassigned • You will receive a confirmation email',
    emailConsent: 'I want to receive a confirmation email for my reservation.',
    marketingConsent: 'I want to receive occasional information about special offers and events by email.',
    importantNotices: 'Important information:',
    notice1: '• Reservations can be cancelled free of charge up to 2h before',
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
    additionalInfoOptional: 'Zusätzliche Informationen (optional)',
    preOrderSummary: 'Vorbestellungsübersicht',
    date: 'Datum:',
    time: 'Uhrzeit:',
    people: 'Personen:',
    table: 'Tisch:',
    total: 'Gesamt:',
    gdprTitle: 'Datenschutz und Einverständniserklärungen',
    dataProcessing: 'Ich stimme der Verarbeitung meiner Daten zu',
    dataProcessingFull: 'gemäß der',
    privacyPolicy: 'Datenschutzerklärung',
    emailConsentShort: 'Bestätigungs-E-Mail',
    marketingConsentShort: 'Angebote und Events per E-Mail',
    compactNotice: 'Reservierungen können bis 2h vorher storniert werden • Bei +15min Verspätung kann der Tisch neu vergeben werden • Sie erhalten eine Bestätigungs-E-Mail',
    emailConsent: 'Ich möchte eine Bestätigungs-E-Mail für meine Reservierung erhalten.',
    marketingConsent: 'Ich möchte gelegentlich Informationen über besondere Angebote und Veranstaltungen per E-Mail erhalten.',
    importantNotices: 'Wichtige Hinweise:',
    notice1: '• Reservierungen können bis 2h vorher kostenfrei storniert werden',
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
  partySize,
  childrenCount = 0,
  tableIds = [],
  preOrderItems: propPreOrderItems = [],
  preOrderTotal: propPreOrderTotal = 0
}: ContactAndConfirmStepProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    control,
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

  // Use props if provided, otherwise fallback to form state (legacy)
  const selectedTableId = watchedStepTwo?.tableId
  const preOrderItems = propPreOrderItems.length > 0 ? propPreOrderItems : (watchedStepTwo?.preOrderItems || [])
  const preOrderTotal = propPreOrderTotal > 0 ? propPreOrderTotal : (watchedStepTwo?.preOrderTotal || 0)

  // Find selected table details (legacy single table)
  const selectedTable = availability?.recommendations?.find(
    table => table.id === selectedTableId
  )

  // Find multiple tables details (new multi-table support)
  const selectedTables = useMemo(() => {
    if (tableIds.length === 0 || !availability?.recommendations) return []
    return tableIds
      .map(id => availability.recommendations?.find(table => table.id === id))
      .filter((table): table is NonNullable<typeof table> => table !== undefined && table !== null)
  }, [tableIds, availability])

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
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.title}
          </CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-3 md:mb-4">{t.contactTitle}</h3>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="firstName" className="text-xs md:text-sm">
                    {t.firstName} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('stepThree.firstName')}
                    className="h-9 md:h-10 text-base md:text-sm"
                  />
                  {errors.stepThree?.firstName && (
                    <p className="text-xs md:text-sm text-destructive">
                      {errors.stepThree.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="lastName" className="text-xs md:text-sm">
                    {t.lastName} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('stepThree.lastName')}
                    className="h-9 md:h-10 text-base md:text-sm"
                  />
                  {errors.stepThree?.lastName && (
                    <p className="text-xs md:text-sm text-destructive">
                      {errors.stepThree.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="email" className="text-xs md:text-sm">
                    {t.email} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('stepThree.email')}
                    className="h-9 md:h-10 text-base md:text-sm"
                  />
                  {errors.stepThree?.email && (
                    <p className="text-xs md:text-sm text-red-600">
                      {errors.stepThree.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="phone" className="text-xs md:text-sm">
                    {t.phone} <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="stepThree.phone"
                    control={control}
                    render={({ field }) => (
                      <InternationalPhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        defaultCountry="ES"
                        placeholder={language === 'es' ? '+34 600 123 456' :
                                   language === 'en' ? '+34 600 123 456' :
                                   '+34 600 123 456'}
                        error={!!errors.stepThree?.phone}
                      />
                    )}
                  />
                  {errors.stepThree?.phone && (
                    <p className="text-xs md:text-sm text-red-600">
                      {errors.stepThree.phone.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Special Information - Modern Checkboxes */}
                <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4 mt-3 md:mt-4">
                  <h3 className="text-xs md:text-sm font-medium text-muted-foreground">{t.additionalInfoOptional}</h3>

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
                          className="border-primary/20 focus:border-primary text-base md:text-sm"
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
                          className="border-secondary/20 focus:border-secondary resize-none text-base md:text-sm"
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
                          className="border-accent/20 focus:border-accent resize-none text-base md:text-sm"
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
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.reservationSummary}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Reservation Summary - MEJORADO PARA MÓVIL */}
          <div>
            <div className="grid gap-3 md:gap-3">
              <div className="flex justify-between items-center p-3 md:p-3 bg-muted rounded-lg">
                <span className="flex items-center gap-2 md:gap-2 text-sm md:text-sm font-medium">
                  <Calendar className="h-4 w-4 md:h-4 md:w-4" />
                  {t.date}
                </span>
                <span className="font-semibold text-sm md:text-sm">{formatDate(selectedDate)}</span>
              </div>

              <div className="flex justify-between items-center p-3 md:p-3 bg-muted rounded-lg">
                <span className="flex items-center gap-2 md:gap-2 text-sm md:text-sm font-medium">
                  <Clock className="h-4 w-4 md:h-4 md:w-4" />
                  {t.time}
                </span>
                <span className="font-semibold text-sm md:text-sm">{selectedTime}</span>
              </div>

              <div className="flex justify-between items-center p-3 md:p-3 bg-muted rounded-lg">
                <span className="flex items-center gap-2 md:gap-2 text-sm md:text-sm font-medium">
                  <Users className="h-4 w-4 md:h-4 md:w-4" />
                  {t.people}
                </span>
                <div className="text-right">
                  <span className="font-semibold text-sm md:text-sm">{partySize}</span>
                  {childrenCount > 0 && (
                    <span className="block text-xs md:text-xs text-muted-foreground mt-1">
                      ({partySize - childrenCount} {language === 'es' ? 'adulto(s)' : language === 'en' ? 'adult(s)' : 'Erwachsene'} + {childrenCount} {language === 'es' ? 'niño(s)' : language === 'en' ? 'child(ren)' : 'Kinder'})
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-table support (new) */}
              {selectedTables.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="flex items-center gap-2 text-sm md:text-sm font-medium">
                    <MapPin className="h-4 w-4 md:h-4 md:w-4" />
                    {t.table}
                  </span>
                  <span className="font-semibold text-sm md:text-sm">
                    {selectedTables.map((table) => `Mesa ${table.number}`).join(', ')}
                  </span>
                </div>
              )}

              {/* Legacy single table fallback */}
              {selectedTables.length === 0 && selectedTable && (
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="flex items-center gap-2 text-sm md:text-sm font-medium">
                    <MapPin className="h-4 w-4 md:h-4 md:w-4" />
                    {t.table}
                  </span>
                  <span className="font-semibold text-sm md:text-sm">
                    {selectedTable.number} ({locations[selectedTable.location as keyof typeof locations]?.name[language]})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information - MEJORADO PARA MÓVIL */}
          {(watchedStepThree?.firstName || watchedStepThree?.email) && (
            <div>
              <h3 className="font-semibold text-base sm:text-base mb-3">{t.contactInfo}</h3>
              <div className="grid gap-3 text-sm md:text-sm">
                {(watchedStepThree?.firstName || watchedStepThree?.lastName) && (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Users className="h-4 w-4 md:h-4 md:w-4" />
                    <span className="font-medium">{watchedStepThree?.firstName} {watchedStepThree?.lastName}</span>
                  </div>
                )}
                {watchedStepThree?.email && (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Mail className="h-4 w-4 md:h-4 md:w-4" />
                    <span className="font-medium">{watchedStepThree.email}</span>
                  </div>
                )}
                {watchedStepThree?.phone && (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Phone className="h-4 w-4 md:h-4 md:w-4" />
                    <span className="font-medium">{watchedStepThree.phone}</span>
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
                {preOrderItems.map((item) => (
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

            {/* GDPR - Integrated Compact Design */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t.gdprTitle}
              </h3>

              {/* Required Data Processing - MÁS EVIDENTE */}
              <div className="flex items-start gap-4 p-4 bg-primary border-4 border-primary rounded-xl shadow-lg">
                <Checkbox
                  id="dataProcessingConsent"
                  checked={watchedStepFour?.dataProcessingConsent || false}
                  onCheckedChange={(checked) => setValue('stepFour.dataProcessingConsent', checked)}
                  className="mt-1 shrink-0 h-6 w-6 border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-primary"
                />
                <Label htmlFor="dataProcessingConsent" className="text-sm md:text-base leading-relaxed cursor-pointer flex-1">
                  <span className="font-bold text-white block mb-1">
                    {t.dataProcessing} <span className="text-red-200 text-lg">*</span>
                  </span>
                  <span className="text-white/90 block">
                    {t.dataProcessingFull}{' '}
                    <Link
                      href={language === 'es' ? '/legal/politica-privacidad' : '/legal/politica-privacidad/en'}
                      className="text-white font-semibold underline decoration-2 underline-offset-2 hover:text-primary-foreground transition-colors"
                      target="_blank"
                    >
                      {t.privacyPolicy}
                    </Link>
                  </span>
                </Label>
              </div>
              {errors.stepFour?.dataProcessingConsent && (
                <p className="text-sm md:text-base text-red-600 font-semibold ml-6 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {errors.stepFour.dataProcessingConsent.message}
                </p>
              )}

              {/* Optional Marketing Consent - REMOVIDO checkbox de email (es obligatorio) */}
              <div className="p-3 bg-muted/30 rounded-lg border">
                <Label className="flex items-start gap-3 cursor-pointer text-sm">
                  <Checkbox
                    id="marketingConsent"
                    checked={Boolean(watchedStepFour?.marketingConsent)}
                    onCheckedChange={(checked) => setValue('stepFour.marketingConsent', Boolean(checked))}
                    className="mt-0.5 h-5 w-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Utensils className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{t.marketingConsentShort}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'es' ? 'Recibe ofertas especiales y noticias sobre eventos' :
                       language === 'en' ? 'Receive special offers and event news' :
                       'Erhalten Sie Sonderangebote und Veranstaltungsnachrichten'}
                    </p>
                  </div>
                </Label>
              </div>

              {/* Compact Notice - TEXTO MÁS GRANDE */}
              <div className="text-sm md:text-base text-muted-foreground bg-muted/60 p-3 md:p-4 rounded-lg border">
                <p><strong className="text-foreground">{t.importantNotices}</strong> {t.compactNotice}</p>
              </div>
            </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4 md:pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="w-full sm:flex-1 h-10 md:h-11"
          size="default"
        >
          <ChevronLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          <span className="text-sm md:text-base">{t.previous}</span>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !watchedStepFour?.dataProcessingConsent}
          className="w-full sm:flex-1 h-10 md:h-11"
          size="default"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
              <span className="text-sm md:text-base">{t.processing}</span>
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="text-sm md:text-base">{t.confirmReservation}</span>
            </>
          )}
        </Button>
      </div>

      {/* Progress Indicator - SOLO SI NO ESTÁ MARCADO */}
      {watchedStepFour?.dataProcessingConsent === false && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm md:text-base font-semibold text-destructive bg-destructive/10 border-2 border-destructive/30 p-4 rounded-lg animate-pulse">
          <Shield className="h-5 w-5" />
          <span>
            {language === 'es' ? 'Debes aceptar la política de privacidad para continuar' :
             language === 'en' ? 'You must accept the privacy policy to continue' :
             'Sie müssen die Datenschutzrichtlinie akzeptieren, um fortzufahren'}
          </span>
        </div>
      )}
    </div>
  )
}