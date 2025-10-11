'use client'

import { Progress } from '@/components/ui/progress'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/validations/reservation-professional'

interface Step {
  name: { es: string; en: string; de: string }
  description: { es: string; en: string; de: string }
}

interface ProgressStepsProps {
  currentStep: number
  steps: Step[]
  language: Language
}

export function ProgressSteps({ currentStep, steps, language }: ProgressStepsProps) {
  const totalSteps = steps.length
  const progress = (currentStep / totalSteps) * 100

  return (
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
  )
}
