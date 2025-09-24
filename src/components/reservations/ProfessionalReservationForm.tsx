'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Utensils,
  Timer,
  Shield,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Professional components - Consolidated (4→2 steps)
import DateTimeAndTableStep from './DateTimeAndTableStep'
import ContactAndConfirmStep from './ContactAndConfirmStep'

// Professional hooks and validations
import { useReservations, type AvailabilityData } from '@/hooks/useReservations'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import {
  createProfessionalReservationSchema,
  type Language,
  type ProfessionalReservationFormData
} from '@/lib/validations/reservation-professional'

interface ProfessionalReservationFormProps {
  language: Language
  onLanguageChange: (lang: Language) => void
}

const steps = [
  {
    id: 1,
    name: { es: 'Fecha, Hora y Mesa', en: 'Date, Time & Table', de: 'Datum, Zeit & Tisch' },
    description: { es: 'Elige cuándo y qué mesa', en: 'Choose when and which table', de: 'Wählen Sie wann und welchen Tisch' }
  },
  {
    id: 2,
    name: { es: 'Contacto y Confirmación', en: 'Contact & Confirmation', de: 'Kontakt & Bestätigung' },
    description: { es: 'Datos y confirmación final', en: 'Details and final confirmation', de: 'Daten und endgültige Bestätigung' }
  }
]

const content = {
  es: {
    hero: {
      title: 'Reservar Mesa',
      subtitle: 'Reserva tu experiencia culinaria en el corazón del casco antiguo de Calpe. Cocina mediterránea con productos locales y vistas a las callejuelas históricas.',
      badge: 'Reserva Online'
    },
    trustSignals: {
      confirmation: 'Confirmación inmediata',
      gdpr: 'Cumplimiento GDPR',
      cancellation: 'Cancelación gratuita'
    },
    success: {
      title: '¡Reserva Confirmada!',
      message: 'Gracias por tu reserva. Te enviaremos un email de confirmación en breve.',
      backHome: 'Volver al Inicio',
      viewMenu: 'Ver Carta'
    },
    connection: {
      live: 'En vivo',
      offline: 'Sin conexión'
    }
  },
  en: {
    hero: {
      title: 'Book a Table',
      subtitle: 'Reserve your culinary experience in the heart of Calpe\'s old town. Mediterranean cuisine with local products and views of historic streets.',
      badge: 'Online Booking'
    },
    trustSignals: {
      confirmation: 'Instant confirmation',
      gdpr: 'GDPR compliant',
      cancellation: 'Free cancellation'
    },
    success: {
      title: 'Reservation Confirmed!',
      message: 'Thank you for your reservation. We will send you a confirmation email shortly.',
      backHome: 'Back to Home',
      viewMenu: 'View Menu'
    },
    connection: {
      live: 'Live',
      offline: 'Offline'
    }
  },
  de: {
    hero: {
      title: 'Tisch reservieren',
      subtitle: 'Reservieren Sie Ihr kulinarisches Erlebnis im Herzen der Altstadt von Calpe. Mediterrane Küche mit lokalen Produkten und Blick auf historische Gassen.',
      badge: 'Online Reservierung'
    },
    trustSignals: {
      confirmation: 'Sofortige Bestätigung',
      gdpr: 'DSGVO-konform',
      cancellation: 'Kostenlose Stornierung'
    },
    success: {
      title: 'Reservierung bestätigt!',
      message: 'Vielen Dank für Ihre Reservierung. Wir senden Ihnen in Kürze eine Bestätigungs-E-Mail.',
      backHome: 'Zur Startseite',
      viewMenu: 'Speisekarte ansehen'
    },
    connection: {
      live: 'Live',
      offline: 'Offline'
    }
  }
}

export default function ProfessionalReservationForm({ 
  language, 
  onLanguageChange 
}: ProfessionalReservationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [isConnected] = useState(true) // WebSocket connection status

  // Refs for auto-scroll
  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  
  const router = useRouter()
  const {
    checkAvailability,
    createReservation,
    getMenuItems,
    isLoading,
    isCheckingAvailability
  } = useReservations()

  // 🚀 CRITICAL FIX: Import cart functionality to clear after successful reservation
  const { clearCart, setCartOpen } = useCart()

  // Get dynamic maxPartySize from business hours
  const { maxPartySize } = useBusinessHours()

  const t = content[language]
  const totalSteps = steps.length
  const progress = (currentStep / totalSteps) * 100

  // Form setup with professional schema - DYNAMIC with maxPartySize from DB
  const methods = useForm<ProfessionalReservationFormData>({
    resolver: zodResolver(createProfessionalReservationSchema(language, maxPartySize)),
    defaultValues: {
      stepOne: {
        date: '',
        time: '',
        partySize: 2,
        preferredLocation: ''
      },
      stepTwo: {
        tableId: '',
        preOrderItems: [],
        preOrderTotal: 0,
        hasPreOrder: false
      },
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

  // Load menu items on component mount
  useEffect(() => {
    const loadMenuItems = async () => {
      setIsLoadingMenu(true)
      try {
        const items = await getMenuItems()
        setMenuItems(items)
      } catch (error) {
        console.error('Error loading menu:', error)
        toast.error('Error al cargar el menú')
      } finally {
        setIsLoadingMenu(false)
      }
    }

    loadMenuItems()
  }, [])

  const handleCheckAvailability = async (
    date: string, 
    time: string, 
    partySize: number, 
    preferredLocation?: string
  ): Promise<boolean> => {
    try {
      // 🚀 CRITICAL FIX: Prevent automatic timezone conversion - same pattern as API
      const [year, month, day] = date.split('-')
      const [hour, minute] = time.split(':')
      const dateTime = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )).toISOString()
      const result = await checkAvailability(dateTime, partySize, preferredLocation)
      
      if (result) {
        setAvailability(result)
        return result.available
      }
      return false
    } catch (error) {
      console.error('Error checking availability:', error)
      return false
    }
  }

  const handleSubmit = async (data: ProfessionalReservationFormData) => {
    try {
      // Flatten the form data for API
      const reservationData = {
        // 🚀 CRITICAL FIX: Use same Date.UTC pattern to prevent timezone conversion
        dateTime: (() => {
          const [year, month, day] = data.stepOne.date.split('-')
          const [hour, minute] = data.stepOne.time.split(':')
          return new Date(Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
          )).toISOString()
        })(),
        tableIds: data.stepTwo.tableIds || (data.stepTwo.tableId ? [data.stepTwo.tableId] : []), // ✅ FIXED: Support both tableIds array AND tableId fallback
        partySize: data.stepOne.partySize,
        firstName: data.stepThree.firstName,
        lastName: data.stepThree.lastName,
        email: data.stepThree.email,
        phone: data.stepThree.phone,
        ...(data.stepThree.occasion && { occasion: data.stepThree.occasion }),
        ...(data.stepThree.dietaryNotes && { dietaryNotes: data.stepThree.dietaryNotes }),
        ...(data.stepThree.specialRequests && { specialRequests: data.stepThree.specialRequests }),
        preOrderItems: data.stepTwo.preOrderItems || [],
        preOrderTotal: data.stepTwo.preOrderTotal || 0,
        hasPreOrder: data.stepTwo.hasPreOrder || false,
        dataProcessingConsent: data.stepFour.dataProcessingConsent,
        emailConsent: data.stepFour.emailConsent,
        marketingConsent: data.stepFour.marketingConsent,
        preferredLanguage: language.toUpperCase() as 'ES' | 'EN' | 'DE' // FIXED: Convert to uppercase for backend
      }


      await createReservation(reservationData)

      // 🚀 CRITICAL FIX: Clear cart and close cart sidebar after successful reservation
      clearCart()
      setCartOpen(false)

      setIsSuccess(true)
    } catch (error) {
      console.error('Error creating reservation:', error)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      // Reset form validations for new step
      methods.reset(methods.getValues(), { keepValues: true })

      // Auto-scroll to form section with smooth animation
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 150)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Reset form validations for previous step
      methods.reset(methods.getValues(), { keepValues: true })

      // Auto-scroll to form section with smooth animation
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 150)
    }
  }

  const watchedStepOne = methods.watch('stepOne')

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
      <div className="min-h-screen flex items-center justify-center py-12">
        <Card ref={successRef} className="max-w-lg w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="enigma-card-title">
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3)'
            }}
          />
        </div>
        
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Utensils className="h-4 w-4 mr-2" />
              {t.hero.badge}
            </Badge>
            
            <h1 className="enigma-hero-title">
              {t.hero.title}
            </h1>
            
            <p className="enigma-hero-subtitle">
              {t.hero.subtitle}
            </p>

            {/* Language Selector */}
            <div className="flex justify-center gap-2 mb-8">
              {(['es', 'en', 'de'] as Language[]).map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "outline"}
                  size="sm"
                  onClick={() => onLanguageChange(lang)}
                  className={language === lang ? 'bg-white text-black' : 'bg-white/20 text-white border-white/30'}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">{t.trustSignals.confirmation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">{t.trustSignals.gdpr}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <span className="text-sm">{t.trustSignals.cancellation}</span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {isConnected ? t.connection.live : t.connection.offline}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="px-6 py-4 rounded-xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/20">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {steps.map((step, index) => {
                  const stepNumber = index + 1
                  const isActive = stepNumber === currentStep
                  const isCompleted = stepNumber < currentStep

                  return (
                    <div key={stepNumber} className="flex items-center">
                      <div className="flex flex-col items-center text-center">
                        <div className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300",
                          isActive ? 'bg-primary text-primary-foreground shadow-md scale-105' : '',
                          isCompleted ? 'bg-green-500 text-white shadow-sm' : '',
                          !isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''
                        )}>
                          {isCompleted ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            stepNumber
                          )}
                        </div>

                        <div className="mt-2">
                          <p className={cn(
                            "text-xs sm:text-sm font-medium",
                            isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                          )}>
                            {step.name[language]}
                          </p>
                        </div>
                      </div>

                      {index < steps.length - 1 && (
                        <div className={cn(
                          "w-12 sm:w-16 h-0.5 mx-3 transition-colors duration-300",
                          isCompleted ? 'bg-green-500' : 'bg-muted'
                        )} />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4">
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section ref={formRef} className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleSubmit)}>
                {currentStep === 1 && (
                  <DateTimeAndTableStep
                    language={language}
                    onNext={nextStep}
                    watchedDate={watchedStepOne.date}
                    watchedTime={watchedStepOne.time}
                    watchedPartySize={watchedStepOne.partySize}
                    watchedLocation={watchedStepOne.preferredLocation}
                  />
                )}

                {currentStep === 2 && (
                  <ContactAndConfirmStep
                    language={language}
                    onPrevious={prevStep}
                    onSubmit={methods.handleSubmit(handleSubmit)}
                    isSubmitting={isLoading}
                    availability={availability}
                    selectedDate={watchedStepOne.date}
                    selectedTime={watchedStepOne.time}
                    partySize={watchedStepOne.partySize}
                  />
                )}
              </form>
            </FormProvider>
          </div>
        </div>
      </section>
    </div>
  )
}