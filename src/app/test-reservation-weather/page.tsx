'use client'

import { useState, useRef, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import type { Language } from '@/lib/validations/reservation-professional'
import EnhancedDateTimeAndTableStep from '@/components/reservations/EnhancedDateTimeAndTableStep'
import ContactAndConfirmStep from '@/components/reservations/ContactAndConfirmStep'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useReservations } from '@/hooks/useReservations'
import { useCart } from '@/hooks/useCart'

// Schema matching ContactAndConfirmStep structure
const enhancedReservationSchema = z.object({
  // Step 1 data (stored when clicking "next")
  dateTime: z.string().min(1),
  tableIds: z.array(z.string()).min(1),
  partySize: z.number().int().min(1).max(20),
  childrenCount: z.number().int().min(0).optional(),
  location: z.string().default(''),

  // Step 2 (ContactAndConfirmStep) - matching stepThree structure
  stepThree: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^[+][1-9]\d{1,14}$/),
    occasion: z.string().default(''),
    dietaryNotes: z.string().default(''),
    specialRequests: z.string().default('')
  }),

  // Step 2 (ContactAndConfirmStep) - matching stepFour structure
  stepFour: z.object({
    dataProcessingConsent: z.boolean().refine(val => val === true, {
      message: 'Debes aceptar la política de privacidad para continuar'
    }),
    emailConsent: z.boolean().default(true),
    marketingConsent: z.boolean().default(false)
  })
})

type EnhancedReservationFormData = z.infer<typeof enhancedReservationSchema>

const content = {
  es: {
    title: 'Sistema de Reservas - Prueba',
    subtitle: 'Formulario mejorado con pronóstico del tiempo',
    step1: 'Fecha y Mesa',
    step2: 'Datos de Contacto',
    back: 'Atrás',
    language: 'Idioma',
    success: {
      title: '¡Reserva Confirmada!',
      message: 'Gracias por tu reserva. Te enviaremos un email de confirmación en breve.',
      backHome: 'Volver al Inicio',
      viewMenu: 'Ver Carta'
    }
  },
  en: {
    title: 'Reservation System - Test',
    subtitle: 'Enhanced form with weather forecast',
    step1: 'Date & Table',
    step2: 'Contact Details',
    back: 'Back',
    language: 'Language',
    success: {
      title: 'Reservation Confirmed!',
      message: 'Thank you for your reservation. We will send you a confirmation email shortly.',
      backHome: 'Back to Home',
      viewMenu: 'View Menu'
    }
  },
  de: {
    title: 'Reservierungssystem - Test',
    subtitle: 'Erweitertes Formular mit Wettervorhersage',
    step1: 'Datum & Tisch',
    step2: 'Kontaktdaten',
    back: 'Zurück',
    language: 'Sprache',
    success: {
      title: 'Reservierung Bestätigt!',
      message: 'Vielen Dank für Ihre Reservierung. Wir senden Ihnen in Kürze eine Bestätigungs-E-Mail.',
      backHome: 'Zurück zur Startseite',
      viewMenu: 'Menü ansehen'
    }
  }
}

export default function TestReservationWeatherPage() {
  const [language, setLanguage] = useState<Language>('es')
  const [currentStep, setCurrentStep] = useState(1)
  const [availability, setAvailability] = useState<any>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const t = content[language]

  const { createReservation, isLoading: isSubmitting } = useReservations()
  const { items: cartItems, total: cartTotal, clearCart, setCartOpen } = useCart()

  const form = useForm<EnhancedReservationFormData>({
    resolver: zodResolver(enhancedReservationSchema),
    defaultValues: {
      dateTime: '',
      tableIds: [],
      partySize: 2,
      childrenCount: 0,
      location: '',
      stepThree: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        occasion: '',
        dietaryNotes: '',
        specialRequests: ''
      },
      stepFour: {
        dataProcessingConsent: false,
        emailConsent: true,
        marketingConsent: false
      }
    },
    shouldUnregister: false,
    mode: 'onChange'
  })

  const handleNext = () => {
    if (currentStep === 1) {
      const dateTime = form.getValues('dateTime')
      const tableIds = form.getValues('tableIds')

      if (!dateTime || tableIds.length === 0) {
        toast.error(language === 'es' ?
          'Por favor completa la fecha, hora y mesa' :
          'Please complete date, time and table'
        )
        return
      }
    }

    setCurrentStep(2)

    // Auto-scroll to form section with smooth animation
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 150)
  }

  const handleBack = () => {
    setCurrentStep(1)

    // Auto-scroll to form section with smooth animation
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 150)
  }

  const handleSubmit = async (data: EnhancedReservationFormData) => {
    try {
      // Transform cart items to pre-order format
      const preOrderItems = (cartItems || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type as 'dish' | 'wine'
      }))

      // Transform form data to API format
      const reservationData = {
        dateTime: data.dateTime,
        tableIds: data.tableIds,
        partySize: data.partySize,
        childrenCount: data.childrenCount && data.childrenCount > 0 ? data.childrenCount : undefined,
        firstName: data.stepThree.firstName,
        lastName: data.stepThree.lastName,
        email: data.stepThree.email,
        phone: data.stepThree.phone,
        occasion: data.stepThree.occasion || '',
        dietaryNotes: data.stepThree.dietaryNotes || '',
        specialRequests: data.stepThree.specialRequests || '',
        preOrderItems: preOrderItems,
        preOrderTotal: cartTotal,
        hasPreOrder: (cartItems || []).length > 0,
        dataProcessingConsent: data.stepFour.dataProcessingConsent,
        emailConsent: data.stepFour.emailConsent,
        marketingConsent: data.stepFour.marketingConsent,
        preferredLanguage: language.toUpperCase() as 'ES' | 'EN' | 'DE'
      }

      // Call API via existing hook
      await createReservation(reservationData)

      // Cleanup post-reservation
      clearCart()
      setCartOpen(false)

      // Success - show success screen
      setIsSuccess(true)
    } catch (error) {
      console.error('Error submitting reservation:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : (language === 'es' ? 'Error al enviar la reserva' :
           language === 'en' ? 'Error submitting reservation' :
           'Fehler beim Absenden der Reservierung')
      toast.error(errorMessage)
    }
  }

  // Auto-scroll to success message when reservation is confirmed
  useEffect(() => {
    if (isSuccess && successRef.current) {
      setTimeout(() => {
        successRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 300)
    }
  }, [isSuccess])

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center py-12">
        <Card ref={successRef} className="max-w-lg w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold mb-4">
              {t.success.title}
            </h2>

            <p className="text-muted-foreground mb-6">
              {t.success.message}
            </p>

            <div className="flex gap-3">
              <Button onClick={() => router.push('/')} className="flex-1">
                {t.success.backHome}
              </Button>
              <Button variant="outline" onClick={() => router.push('/menu')} className="flex-1">
                {t.success.viewMenu}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{t.title}</CardTitle>
                <p className="text-muted-foreground mt-1">{t.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t.language}:</span>
                {(['es', 'en', 'de'] as Language[]).map((lang) => (
                  <Button
                    key={lang}
                    size="sm"
                    variant={language === lang ? 'default' : 'outline'}
                    onClick={() => setLanguage(lang)}
                  >
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                1
              </div>
              <span className={cn(
                "text-sm",
                currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
              )}>
                {t.step1}
              </span>
            </div>
            <div className="w-24 h-0.5 bg-muted">
              <div className={cn(
                "h-full bg-primary transition-all duration-300",
                currentStep >= 2 ? "w-full" : "w-0"
              )} />
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                2
              </div>
              <span className={cn(
                "text-sm",
                currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
              )}>
                {t.step2}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div ref={formRef}>
              {currentStep === 1 && (
              <EnhancedDateTimeAndTableStep
                language={language}
                onNext={handleNext}
                onAvailabilityChange={setAvailability}
              />
            )}

            {currentStep === 2 && (() => {
              const dateTimeISO = form.getValues('dateTime')
              const dateObj = new Date(dateTimeISO)

              // Extract date in YYYY-MM-DD format
              const selectedDate = dateObj.toISOString().split('T')[0]

              // Extract time in HH:mm format
              const hours = dateObj.getUTCHours().toString().padStart(2, '0')
              const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0')
              const selectedTime = `${hours}:${minutes}`

              // Transform cart items to pre-order format for display
              const preOrderItems = (cartItems || []).map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                type: item.type
              }))

              return (
                <ContactAndConfirmStep
                  language={language}
                  onPrevious={handleBack}
                  onSubmit={form.handleSubmit(handleSubmit)}
                  isSubmitting={isSubmitting}
                  availability={availability}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  partySize={form.getValues('partySize')}
                  childrenCount={form.getValues('childrenCount')}
                  tableIds={form.getValues('tableIds')}
                  preOrderItems={preOrderItems}
                  preOrderTotal={cartTotal}
                />
              )
            })()}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}