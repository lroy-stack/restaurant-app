'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Loader2,
  Eye,
  Utensils,
  Wine,
  Crown,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { Language } from '@/lib/validations/reservation-professional'
import type { AvailabilityData } from '@/hooks/useReservations'

interface AvailabilitySummaryProps {
  language: Language
  availabilityData: AvailabilityData | null
  selectedDate: Date | null
  selectedTime: string | null
  partySize: number
  selectedZone?: string | null
  weatherQuality?: boolean
  selectedTables?: any[] // Array of selected tables for multi-table display
  onContinue?: () => void
  onChangeSelection?: () => void
  isLoading?: boolean
  className?: string
}

const content = {
  es: {
    excellent: '¡Excelente disponibilidad!',
    limited: 'Disponibilidad limitada',
    noAvailability: 'Sin disponibilidad',
    checking: 'Verificando disponibilidad...',
    tablesAvailable: 'mesas disponibles',
    tableAvailable: 'mesa disponible',
    forYourSelection: 'para tu selección',
    recommendations: 'Recomendaciones',
    perfectMatch: '¡Coincidencia perfecta!',
    alternativeTimes: 'Horarios alternativos',
    alternativeZones: 'Zonas alternativas',
    continueReservation: 'Continuar con la reserva',
    changeSelection: 'Cambiar selección',
    tryDifferent: 'Probar diferente hora o fecha',
    capacity: 'Capacidad',
    location: 'Ubicación',
    people: 'personas',
    person: 'persona',
    demandHigh: 'Alta demanda',
    demandMedium: 'Demanda media',
    demandLow: 'Disponibilidad amplia',
    weatherPerfect: 'Clima perfecto para terraza',
    vipAvailable: 'Mesa VIP disponible',
    primeTime: 'Horario Prime Time',
    quietTime: 'Ambiente tranquilo',
    lastTable: 'Última mesa disponible',
    bookNow: 'Reserva ahora',
    features: 'Características',
    terrace: 'Terraza',
    indoor: 'Interior',
    vip: 'VIP',
    mainHall: 'Salón Principal',
    campanario: 'Vista Campanario',
    romanticCorner: 'Rincón Romántico',
    familyArea: 'Zona Familiar',
    businessArea: 'Zona Business',
    tips: {
      title: 'Consejos para tu visita',
      weather: 'El pronóstico indica condiciones ideales para terraza',
      busy: 'Horario con alta demanda, llegada puntual recomendada',
      quiet: 'Horario tranquilo, perfecto para conversación',
      vip: 'Mesa VIP con servicio exclusivo disponible'
    }
  },
  en: {
    excellent: 'Excellent availability!',
    limited: 'Limited availability',
    noAvailability: 'No availability',
    checking: 'Checking availability...',
    tablesAvailable: 'tables available',
    tableAvailable: 'table available',
    forYourSelection: 'for your selection',
    recommendations: 'Recommendations',
    perfectMatch: 'Perfect match!',
    alternativeTimes: 'Alternative times',
    alternativeZones: 'Alternative zones',
    continueReservation: 'Continue with reservation',
    changeSelection: 'Change selection',
    tryDifferent: 'Try different time or date',
    capacity: 'Capacity',
    location: 'Location',
    people: 'people',
    person: 'person',
    demandHigh: 'High demand',
    demandMedium: 'Medium demand',
    demandLow: 'Wide availability',
    weatherPerfect: 'Perfect weather for terrace',
    vipAvailable: 'VIP table available',
    primeTime: 'Prime Time slot',
    quietTime: 'Quiet atmosphere',
    lastTable: 'Last table available',
    bookNow: 'Book now',
    features: 'Features',
    terrace: 'Terrace',
    indoor: 'Indoor',
    vip: 'VIP',
    mainHall: 'Main Hall',
    campanario: 'Bell Tower View',
    romanticCorner: 'Romantic Corner',
    familyArea: 'Family Area',
    businessArea: 'Business Area',
    tips: {
      title: 'Tips for your visit',
      weather: 'Forecast shows ideal conditions for terrace',
      busy: 'High demand time, punctual arrival recommended',
      quiet: 'Quiet time, perfect for conversation',
      vip: 'VIP table with exclusive service available'
    }
  },
  de: {
    excellent: 'Ausgezeichnete Verfügbarkeit!',
    limited: 'Begrenzte Verfügbarkeit',
    noAvailability: 'Keine Verfügbarkeit',
    checking: 'Verfügbarkeit wird geprüft...',
    tablesAvailable: 'Tische verfügbar',
    tableAvailable: 'Tisch verfügbar',
    forYourSelection: 'für Ihre Auswahl',
    recommendations: 'Empfehlungen',
    perfectMatch: 'Perfekte Übereinstimmung!',
    alternativeTimes: 'Alternative Zeiten',
    alternativeZones: 'Alternative Bereiche',
    continueReservation: 'Mit Reservierung fortfahren',
    changeSelection: 'Auswahl ändern',
    tryDifferent: 'Andere Zeit oder Datum versuchen',
    capacity: 'Kapazität',
    location: 'Standort',
    people: 'Personen',
    person: 'Person',
    demandHigh: 'Hohe Nachfrage',
    demandMedium: 'Mittlere Nachfrage',
    demandLow: 'Große Verfügbarkeit',
    weatherPerfect: 'Perfektes Wetter für Terrasse',
    vipAvailable: 'VIP-Tisch verfügbar',
    primeTime: 'Hauptzeit',
    quietTime: 'Ruhige Atmosphäre',
    lastTable: 'Letzter verfügbarer Tisch',
    bookNow: 'Jetzt buchen',
    features: 'Eigenschaften',
    terrace: 'Terrasse',
    indoor: 'Innenbereich',
    vip: 'VIP',
    mainHall: 'Hauptsaal',
    campanario: 'Glockenturmblick',
    romanticCorner: 'Romantische Ecke',
    familyArea: 'Familienbereich',
    businessArea: 'Geschäftsbereich',
    tips: {
      title: 'Tipps für Ihren Besuch',
      weather: 'Vorhersage zeigt ideale Bedingungen für Terrasse',
      busy: 'Hohe Nachfragezeit, pünktliche Ankunft empfohlen',
      quiet: 'Ruhige Zeit, perfekt für Gespräche',
      vip: 'VIP-Tisch mit exklusivem Service verfügbar'
    }
  }
}

// Función para obtener el estado de disponibilidad
function getAvailabilityStatus(data: AvailabilityData | null) {
  if (!data || data.totalTables === 0) {
    return 'none'
  }
  if (data.totalTables === 1) {
    return 'limited'
  }
  if (data.totalTables > 3) {
    return 'excellent'
  }
  return 'good'
}

// Función para obtener el icono de zona
function getZoneIcon(zone: string) {
  const icons: Record<string, JSX.Element> = {
    'TERRACE_1': <Eye className="h-4 w-4" />,
    'VIP_ROOM': <Crown className="h-4 w-4" />,
    'TERRACE_2': <MapPin className="h-4 w-4" />,
    'MAIN_ROOM': <Utensils className="h-4 w-4" />
  }
  return icons[zone] || <MapPin className="h-4 w-4" />
}

// Función para formatear fecha y hora
function formatDateTime(date: Date | null, time: string | null, language: Language) {
  if (!date || !time) return ''

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }

  const locale = language === 'es' ? 'es-ES' :
                 language === 'de' ? 'de-DE' : 'en-US'

  return `${date.toLocaleDateString(locale, options)} - ${time}`
}

export default function AvailabilitySummary({
  language,
  availabilityData,
  selectedDate,
  selectedTime,
  partySize,
  selectedZone,
  weatherQuality,
  selectedTables = [],
  onContinue,
  onChangeSelection,
  isLoading = false,
  className
}: AvailabilitySummaryProps) {
  const t = content[language]
  const [isAnimated, setIsAnimated] = useState(false)
  const status = getAvailabilityStatus(availabilityData)

  useEffect(() => {
    if (availabilityData) {
      setIsAnimated(true)
      const timer = setTimeout(() => setIsAnimated(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [availabilityData])

  // Si está cargando
  if (isLoading) {
    return (
      <Card className={cn("border-2 border-dashed", className)}>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t.checking}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si no hay datos
  if (!availabilityData || !selectedDate || !selectedTime) {
    return null
  }

  // Definir colores y iconos según el estado
  const statusConfig = {
    none: {
      icon: <XCircle className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      progressColor: 'bg-red-500',
      progress: 0
    },
    limited: {
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      progressColor: 'bg-orange-500',
      progress: 33
    },
    good: {
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      progressColor: 'bg-blue-500',
      progress: 66
    },
    excellent: {
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      progressColor: 'bg-green-500',
      progress: 100
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          "border-2 overflow-hidden",
          config.borderColor,
          isAnimated && "ring-2 ring-primary ring-offset-2 transition-all duration-500",
          className
        )}>
          {/* Header con estado */}
          <div className={cn("p-4", config.bgColor)}>
            <div className="flex items-start gap-4">
              <div className={cn("p-2 rounded-full bg-white", config.color)}>
                {config.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {status === 'none' ? t.noAvailability :
                   status === 'limited' ? t.limited :
                   status === 'good' ? t.perfectMatch :
                   t.excellent}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {availabilityData.totalTables > 0 ? (
                    <>
                      <span className="font-medium">{availabilityData.totalTables}</span>{' '}
                      {availabilityData.totalTables === 1 ? t.tableAvailable : t.tablesAvailable}{' '}
                      {t.forYourSelection}
                    </>
                  ) : (
                    t.tryDifferent
                  )}
                </p>
              </div>
            </div>

            {/* Barra de progreso de disponibilidad */}
            <div className="mt-4">
              <Progress
                value={config.progress}
                className="h-2"
              />
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* Resumen de la selección */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDateTime(selectedDate, selectedTime, language)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{partySize} {partySize === 1 ? t.person : t.people}</span>
                </div>
                {selectedZone && (
                  <Badge variant="secondary">
                    {getZoneIcon(selectedZone)}
                    <span className="ml-1">
                      {selectedZone === 'terrace' ? t.terrace :
                       selectedZone === 'vip' ? t.vip :
                       selectedZone === 'indoor' ? t.indoor : selectedZone}
                    </span>
                  </Badge>
                )}
              </div>
              {/* Table selection indicator - single or multiple */}
              {selectedTables && selectedTables.length > 0 && (
                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-medium">
                      {selectedTables.length === 1
                        ? `Mesa ${selectedTables[0].number}`
                        : selectedTables.map(t => `Mesa ${t.number}`).join(' + ')
                      }
                    </Badge>
                    <span className="text-muted-foreground">
                      ({selectedTables.reduce((sum: number, t: any) => sum + (t.capacity || 0), 0)} {t.people})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tips y características */}
            {status !== 'none' && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  {t.tips.title}
                </h4>
                <div className="space-y-2">
                  {weatherQuality && (
                    <div className="flex items-start gap-2 text-sm">
                      <Sun className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-muted-foreground">{t.tips.weather}</span>
                    </div>
                  )}
                  {availabilityData.totalTables === 1 && (
                    <div className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-muted-foreground">{t.tips.busy}</span>
                    </div>
                  )}
                  {availabilityData.totalTables > 3 && (
                    <div className="flex items-start gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-muted-foreground">{t.tips.quiet}</span>
                    </div>
                  )}
                  {availabilityData.recommendations?.some(r => r.location === 'VIP_ROOM') && (
                    <div className="flex items-start gap-2 text-sm">
                      <Crown className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="text-muted-foreground">{t.tips.vip}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              {status !== 'none' ? (
                <>
                  <Button
                    className="flex-1"
                    onClick={onContinue}
                    disabled={!availabilityData.available}
                  >
                    {t.continueReservation}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onChangeSelection}
                  >
                    {t.changeSelection}
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={onChangeSelection}
                >
                  {t.tryDifferent}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}