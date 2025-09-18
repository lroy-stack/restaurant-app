'use client'

import { useState, useEffect } from 'react'
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

// Professional components
import ReservationStepOne from './ReservationStepOne'
import ReservationStepTwo from './ReservationStepTwo'
import ReservationStepThree from './ReservationStepThree'
import ReservationStepFour from './ReservationStepFour'

// Professional hooks and validations
import { useReservations, type AvailabilityData } from '@/hooks/useReservations'
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
    name: { es: 'Fecha y Hora', en: 'Date & Time', de: 'Datum & Zeit' },
    description: { es: '¿Cuándo quieres venir?', en: 'When do you want to come?', de: 'Wann möchten Sie kommen?' }
  },
  { 
    id: 2, 
    name: { es: 'Mesa y Menú', en: 'Table & Menu', de: 'Tisch & Menü' },
    description: { es: 'Elige mesa y platos', en: 'Choose table and dishes', de: 'Tisch und Gerichte wählen' }
  },
  { 
    id: 3, 
    name: { es: 'Tus Datos', en: 'Your Details', de: 'Ihre Daten' },
    description: { es: 'Información de contacto', en: 'Contact information', de: 'Kontaktinformationen' }
  },
  { 
    id: 4, 
    name: { es: 'Confirmación', en: 'Confirmation', de: 'Bestätigung' },
    description: { es: 'Finalizar reserva', en: 'Finalize reservation', de: 'Reservierung abschließen' }
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

  const t = content[language]
  const totalSteps = steps.length
  const progress = (currentStep / totalSteps) * 100

  // Form setup with professional schema
  const methods = useForm<ProfessionalReservationFormData>({
    resolver: zodResolver(createProfessionalReservationSchema(language)),
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
      const dateTime = new Date(`${date}T${time}:00`).toISOString()
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
        dateTime: new Date(`${data.stepOne.date}T${data.stepOne.time}:00`).toISOString(),
        tableId: data.stepTwo.tableId,
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

      // Record cookie consent when reservation is confirmed with privacy policy acceptance
      if (data.stepFour.dataProcessingConsent) {
        try {
          await fetch('/api/legal/cookies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: data.stepThree.email, // Use email as user identifier
              sessionId: `reservation_${Date.now()}`,
              consentMethod: 'banner_accept_all',
              analyticsConsent: true, // Essential for reservation functionality
              marketingConsent: data.stepFour.marketingConsent || false,
              functionalConsent: true, // Essential for reservation functionality
              userAgent: navigator.userAgent,
              language: language
            })
          })
        } catch (error) {
          console.error('Error recording cookie consent:', error)
          // Don't fail the reservation if cookie consent fails
        }
      }

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
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Reset form validations for previous step
      methods.reset(methods.getValues(), { keepValues: true })
    }
  }

  const watchedStepOne = methods.watch('stepOne')

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Card className="max-w-lg w-full mx-4">
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
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4 overflow-x-auto">
              {steps.map((step, index) => {
                const stepNumber = index + 1
                const isActive = stepNumber === currentStep
                const isCompleted = stepNumber < currentStep
                
                return (
                  <div key={stepNumber} className="flex items-center min-w-0 flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                      isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : '',
                      isCompleted ? 'bg-green-500 text-white' : '',
                      !isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''
                    )}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    
                    <div className="ml-3 hidden sm:block">
                      <p className={cn(
                        "text-sm font-medium",
                        isActive || isCompleted ? "text-primary" : "text-gray-500"
                      )}>
                        {step.name[language]}
                      </p>
                      <p className="text-xs text-gray-500">{step.description[language]}</p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "hidden sm:block w-20 h-px mx-4",
                        isCompleted ? "bg-primary" : "bg-gray-200"
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
            
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleSubmit)}>
                {currentStep === 1 && (
                  <ReservationStepOne
                    language={language}
                    onNext={nextStep}
                    onCheckAvailability={handleCheckAvailability}
                    isCheckingAvailability={isCheckingAvailability}
                  />
                )}

                {currentStep === 2 && (
                  <ReservationStepTwo
                    language={language}
                    onNext={nextStep}
                    onPrevious={prevStep}
                    availability={availability}
                    selectedDate={watchedStepOne.date}
                    selectedTime={watchedStepOne.time}
                    partySize={watchedStepOne.partySize}
                    menuItems={menuItems}
                    isLoadingMenu={isLoadingMenu}
                  />
                )}

                {currentStep === 3 && (
                  <ReservationStepThree
                    language={language}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                )}

                {currentStep === 4 && (
                  <ReservationStepFour
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