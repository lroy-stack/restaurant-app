'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Language } from '@/lib/validations/reservation-professional'

// Layout components
import { ReservationHero } from '@/components/reservations/layout/ReservationHero'
import { ProgressSteps } from '@/components/reservations/layout/ProgressSteps'
import { SuccessScreen } from '@/components/reservations/layout/SuccessScreen'

// Step components
import EnhancedDateTimeAndTableStep from '@/components/reservations/EnhancedDateTimeAndTableStep'
import ContactAndConfirmStep from '@/components/reservations/ContactAndConfirmStep'

// Hooks
import { useReservations } from '@/hooks/useReservations'
import { useCart } from '@/hooks/useCart'
import { isValidPhoneNumber } from 'libphonenumber-js'

// Validation schema
const reservationSchema = z.object({
  dateTime: z.string().min(1),
  tableIds: z.array(z.string()).default([]), // Opcional - staff asigna mesas
  partySize: z.number().int().min(1).max(20),
  childrenCount: z.number().int().min(0).optional(),
  location: z.string().default(''),
  stepThree: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().refine((value) => {
      // Validación con libphonenumber-js - acepta formato internacional completo
      return isValidPhoneNumber(value)
    }, {
      message: 'Número de teléfono inválido. Incluye código de país (+34, +33, etc.)'
    }),
    occasion: z.string().default(''),
    dietaryNotes: z.string().default(''),
    specialRequests: z.string().default('')
  }),
  stepFour: z.object({
    dataProcessingConsent: z.boolean().refine(val => val === true, {
      message: 'Debes aceptar la política de privacidad para continuar'
    }),
    emailConsent: z.boolean().default(true),
    marketingConsent: z.boolean().default(false)
  })
})

type ReservationFormData = z.infer<typeof reservationSchema>

const steps = [
  {
    name: { es: 'Fecha y Hora', en: 'Date & Time', de: 'Datum & Zeit' },
    description: { es: 'Elige cuándo quieres venir', en: 'Choose when you want to come', de: 'Wählen Sie, wann Sie kommen möchten' }
  },
  {
    name: { es: 'Contacto y Confirmación', en: 'Contact & Confirmation', de: 'Kontakt & Bestätigung' },
    description: { es: 'Datos y confirmación final', en: 'Details and final confirmation', de: 'Daten und endgültige Bestätigung' }
  }
]

export default function ReservasPage() {
  const [language, setLanguage] = useState<Language>('es')
  const [currentStep, setCurrentStep] = useState(1)
  const [availability, setAvailability] = useState<any>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isConnected] = useState(true)

  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { createReservation, isLoading: isSubmitting } = useReservations()
  const { state, getCartTotal, clearCart } = useCart()
  const cartItems = state.items
  const cartTotal = getCartTotal()

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
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
      const partySize = form.getValues('partySize')

      // Validar solo fecha/hora (mesas se asignan por staff)
      if (!dateTime || !partySize) {
        toast.error(
          language === 'es' ? 'Selecciona fecha y hora' :
          language === 'en' ? 'Select date and time' :
          'Wählen Sie Datum und Uhrzeit'
        )
        return
      }
    }

    setCurrentStep(2)

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 150)
  }

  const handleBack = () => {
    setCurrentStep(1)

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 150)
  }

  const handleSubmit = async (data: ReservationFormData) => {
    try {
      const preOrderItems = (cartItems || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type as 'dish' | 'wine'
      }))

      const reservationData = {
        dateTime: data.dateTime,
        tableIds: data.tableIds,
        partySize: data.partySize,
        childrenCount: data.childrenCount,
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
        preferredLanguage: language.toUpperCase() as 'ES' | 'EN' | 'DE',
        source: 'web'
      }

      await createReservation(reservationData)

      clearCart()
      setIsSuccess(true)

      toast.success(
        language === 'es' ? 'Reserva confirmada con éxito' :
        language === 'en' ? 'Reservation confirmed successfully' :
        'Reservierung erfolgreich bestätigt'
      )
    } catch (error) {
      console.error('Error submitting reservation:', error)
      const errorMessage = language === 'es' ? 'Error al enviar la reserva' :
        language === 'en' ? 'Error submitting reservation' :
        'Fehler beim Absenden der Reservierung'
      toast.error(errorMessage)
    }
  }

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

  if (isSuccess) {
    return (
      <SuccessScreen
        ref={successRef}
        language={language}
        onBackHome={() => router.push('/')}
        onViewMenu={() => router.push('/menu')}
      />
    )
  }

  return (
    <>
      <ReservationHero
        language={language}
        onLanguageChange={setLanguage}
        isConnected={isConnected}
      />

      <section ref={formRef} className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
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

                  const year = dateObj.getUTCFullYear()
                  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0')
                  const day = dateObj.getUTCDate().toString().padStart(2, '0')
                  const selectedDate = `${year}-${month}-${day}`

                  const hours = dateObj.getUTCHours().toString().padStart(2, '0')
                  const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0')
                  const selectedTime = `${hours}:${minutes}`

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
              </form>
            </FormProvider>
        </div>
      </section>
    </>
  )
}
