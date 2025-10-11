'use client'

import Link from 'next/link'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Shield,
  Loader2 
} from 'lucide-react'
import type { Language } from '@/lib/validations/reservation-professional'
import type { AvailabilityData } from '@/hooks/useReservations'

interface ReservationStepFourProps {
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
    title: 'Confirmar Reserva',
    subtitle: 'Revisa los detalles de tu reserva',
    reservationSummary: 'Resumen de la Reserva',
    contactInfo: 'Información de Contacto',
    additionalInfo: 'Información Adicional',
    preOrderSummary: 'Resumen del Pre-pedido',
    occasion: 'Ocasión:',
    dietary: 'Alergias/Dieta:',
    special: 'Peticiones especiales:',
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
    processing: 'Procesando...'
  },
  en: {
    title: 'Confirm Reservation',
    subtitle: 'Review your reservation details',
    reservationSummary: 'Reservation Summary',
    contactInfo: 'Contact Information',
    additionalInfo: 'Additional Information',
    preOrderSummary: 'Pre-order Summary',
    occasion: 'Occasion:',
    dietary: 'Allergies/Diet:',
    special: 'Special requests:',
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
    processing: 'Processing...'
  },
  de: {
    title: 'Reservierung bestätigen',
    subtitle: 'Überprüfen Sie Ihre Reservierungsdetails',
    reservationSummary: 'Reservierungsübersicht',
    contactInfo: 'Kontaktinformationen',
    additionalInfo: 'Zusätzliche Informationen',
    preOrderSummary: 'Vorbestellungsübersicht',
    occasion: 'Anlass:',
    dietary: 'Allergien/Diät:',
    special: 'Besondere Wünsche:',
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
    processing: 'Wird verarbeitet...'
  }
}

export default function ReservationStepFour({
  language,
  onPrevious,
  onSubmit,
  isSubmitting,
  availability,
  selectedDate,
  selectedTime,
  partySize
}: ReservationStepFourProps) {
  const {
    watch,
    register,
    setValue,
    formState: { errors }
  } = useFormContext()

  const t = content[language]
  
  const watchedStepTwo = watch('stepTwo')
  const watchedStepThree = watch('stepThree')
  const watchedStepFour = watch('stepFour')

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

  const handleSubmit = () => {
    if (watchedStepFour?.dataProcessingConsent) {
      onSubmit()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.title}
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reservation Summary */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-3">{t.reservationSummary}</h3>
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
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-3">{t.contactInfo}</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{watchedStepThree?.firstName} {watchedStepThree?.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{watchedStepThree?.email}</span>
              </div>
              {watchedStepThree?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{watchedStepThree.phone}</span>
                </div>
              )}
            </div>
          </div>

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
                    <span className="text-sm font-medium">{t.dietary}</span>
                    <p className="text-sm text-muted-foreground">{watchedStepThree.dietaryNotes}</p>
                  </div>
                )}
                
                {watchedStepThree.specialRequests && (
                  <div>
                    <span className="text-sm font-medium">{t.special}</span>
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

          {/* GDPR Consents - Optimized Responsive Design */}
          <div className="p-3 sm:p-4 bg-gray-50/80 rounded-lg border border-gray-200/50">
            <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-600" />
              {t.gdprTitle}
            </h3>

            <div className="space-y-2.5 sm:space-y-3">
              {/* Required Data Processing Consent */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Checkbox
                  id="dataProcessingConsent"
                  checked={watchedStepFour?.dataProcessingConsent || false}
                  onCheckedChange={(checked) => setValue('stepFour.dataProcessingConsent', checked)}
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="dataProcessingConsent" className="text-xs sm:text-sm leading-relaxed text-gray-700 cursor-pointer">
                  {t.dataProcessing} <Link
                    href={language === 'es' ? '/legal/politica-privacidad' : '/legal/politica-privacidad/en'}
                    className="text-primary underline hover:text-primary/80 transition-colors"
                  >
                    {t.privacyPolicy}
                  </Link>. <span className="text-red-500 font-medium">*</span>
                </Label>
              </div>
              {errors.stepFour?.dataProcessingConsent && (
                <p className="text-xs sm:text-sm text-red-600 ml-6 sm:ml-7">
                  {errors.stepFour.dataProcessingConsent.message}
                </p>
              )}

              {/* Email Confirmation Consent */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Checkbox
                  id="emailConsent"
                  checked={Boolean(watchedStepFour?.emailConsent)}
                  onCheckedChange={(checked) => setValue('stepFour.emailConsent', Boolean(checked))}
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="emailConsent" className="text-xs sm:text-sm leading-relaxed text-gray-700 cursor-pointer">
                  {t.emailConsent}
                </Label>
              </div>

              {/* Marketing Consent */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Checkbox
                  id="marketingConsent"
                  checked={Boolean(watchedStepFour?.marketingConsent)}
                  onCheckedChange={(checked) => setValue('stepFour.marketingConsent', Boolean(checked))}
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="marketingConsent" className="text-xs sm:text-sm leading-relaxed text-gray-700 cursor-pointer">
                  {t.marketingConsent}
                </Label>
              </div>
            </div>
          </div>

          {/* Important Notice - Optimized Responsive Design */}
          <div className="p-3 sm:p-4 bg-blue-50/80 rounded-lg border border-blue-200/50">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#237584] mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-blue-900 mb-2 sm:mb-1">{t.importantNotices}</p>
                <div className="text-blue-800 space-y-1 sm:space-y-1">
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
      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
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
    </div>
  )
}