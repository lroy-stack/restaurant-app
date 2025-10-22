"use client"

import { motion } from "framer-motion"
import { Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Language } from "@/lib/validations/reservation-multilingual"

interface ReservationHeroProps {
  language: Language
  setLanguage: (lang: Language) => void
  isConnected: boolean
}

const messages = {
  es: {
    title: "Reserva tu Mesa",
    subtitle: "Disfruta de la experiencia gastronómica atlántico-mediterránea en Calpe",
    systemStatus: "Sistema Conectado",
    offlineMode: "Modo Offline",
    hours: "Mar-Dom 18:00-23:00",
    availabilityStatus: "Mesa Disponible en Tiempo Real"
  },
  en: {
    title: "Reserve Your Table", 
    subtitle: "Enjoy the Atlantic-Mediterranean gastronomic experience in Calpe",
    systemStatus: "System Connected",
    offlineMode: "Offline Mode", 
    hours: "Tue-Sun 6PM-11PM",
    availabilityStatus: "Real-Time Table Availability"
  },
  de: {
    title: "Reservieren Sie Ihren Tisch",
    subtitle: "Genießen Sie das atlantisch-mediterrane gastronomische Erlebnis in Calpe", 
    systemStatus: "System Verbunden",
    offlineMode: "Offline-Modus",
    hours: "Di-So 18:00-23:00",
    availabilityStatus: "Tischverfügbarkeit in Echtzeit"
  }
}

export function ReservationHero({ language, setLanguage, isConnected }: ReservationHeroProps) {
  const t = messages[language]

  return (
    <section 
      className="relative py-24 -mt-16 pt-32 min-h-[600px] flex items-center overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1920&h=1080&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Elegant Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/60"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      
      {/* Subtle Pattern Overlay for Texture */}
      <div 
        className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)]" 
        style={{ backgroundSize: '20px 20px' }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Elegant Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium"
            >
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              {t.availabilityStatus}
            </motion.div>

            {/* Enhanced Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              <span className="block">{t.title}</span>
              <motion.span 
                className="block text-2xl sm:text-3xl md:text-4xl font-light mt-2 text-amber-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Enigma Cocina Con Alma
              </motion.span>
            </h1>
            
            {/* Enhanced Subtitle */}
            <motion.p 
              className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {t.subtitle}
            </motion.p>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-6 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">
                  {isConnected ? t.systemStatus : t.offlineMode}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">{t.hours}</span>
              </div>
            </motion.div>
              
            {/* Enhanced Language Switcher */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="flex items-center gap-2 px-2 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {[
                  { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
                  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
                  { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' }
                ].map((lang) => (
                  <motion.button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 
                      flex items-center gap-2 relative overflow-hidden
                      ${language === lang.code 
                        ? 'bg-white text-gray-900 shadow-lg' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.label}</span>
                    <span className="sm:hidden">{lang.code.toUpperCase()}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}