"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Language } from "@/lib/validations/reservation-multilingual"

interface ReservationProgressProps {
  currentStep: number
  totalSteps: number
  language: Language
}

const stepTitles = {
  es: [
    { title: "Datos Personales", description: "Información básica" },
    { title: "Selección de Mesa", description: "Elige tu espacio favorito" },
    { title: "Pre-pedido", description: "Opcional" },
    { title: "Confirmación", description: "Revisa y confirma" }
  ],
  en: [
    { title: "Personal Info", description: "Basic information" },
    { title: "Table Selection", description: "Choose your favorite space" },
    { title: "Pre-order", description: "Optional" },
    { title: "Confirmation", description: "Review and confirm" }
  ],
  de: [
    { title: "Persönliche Daten", description: "Grundinformationen" },
    { title: "Tischauswahl", description: "Wählen Sie Ihren Lieblingsplatz" },
    { title: "Vorbestellung", description: "Optional" },
    { title: "Bestätigung", description: "Überprüfen und bestätigen" }
  ]
}

export function ReservationProgress({ currentStep, totalSteps, language }: ReservationProgressProps) {
  const steps = stepTitles[language]
  const progress = (currentStep / totalSteps) * 100

  return (
    <motion.div 
      className="mb-8 p-6 rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4 overflow-x-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          
          return (
            <div key={stepNumber} className="flex items-center min-w-0 flex-shrink-0">
              <motion.div
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                  transition-all duration-200
                  ${isActive ? 'bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  stepNumber
                )}
              </motion.div>
              
              {index < totalSteps - 1 && (
                <div className={`w-12 sm:w-20 h-1 mx-1 sm:mx-2 rounded-full transition-colors duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          )
        })}
      </div>
      
      <Progress value={progress} className="h-2" />
      
      {/* Step descriptions - Hidden on small screens */}
      <div className="hidden sm:flex justify-between mt-2 text-sm text-muted-foreground">
        {steps.map((step, index) => (
          <div key={index} className="text-center max-w-[120px]">
            <p className="font-medium">{step.title}</p>
            <p className="text-xs">{step.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}