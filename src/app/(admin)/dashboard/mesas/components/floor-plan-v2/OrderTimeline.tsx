'use client'

import { CheckCircle2, Clock, ChefHat, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderTimelineProps {
  currentStatus: string
  onStatusClick: (status: string) => void
  isUpdating: boolean
}

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Pendiente', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparando', icon: ChefHat },
  { key: 'READY', label: 'Listo', icon: Package },
  { key: 'SERVED', label: 'Servido', icon: CheckCircle2 }
]

export function OrderTimeline({ currentStatus, onStatusClick, isUpdating }: OrderTimelineProps) {
  const currentIndex = TIMELINE_STEPS.findIndex(s => s.key === currentStatus)
  const nextStep = TIMELINE_STEPS[currentIndex + 1]

  return (
    <div className="space-y-6">
      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
          style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon
            const isCompleted = idx < currentIndex
            const isCurrent = idx === currentIndex
            const isNext = idx === currentIndex + 1

            return (
              <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                {/* Circle */}
                <button
                  onClick={() => isNext && !isUpdating && onStatusClick(step.key)}
                  disabled={!isNext || isUpdating}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/50",
                    !isCompleted && !isCurrent && "bg-background border-border text-muted-foreground",
                    isNext && !isUpdating && "hover:scale-110 hover:border-blue-400 cursor-pointer"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium text-center",
                    (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Button */}
      {nextStep && (
        <button
          onClick={() => onStatusClick(nextStep.key)}
          disabled={isUpdating}
          className={cn(
            "w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200",
            "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
            "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {isUpdating ? "Actualizando..." : `✓ ${nextStep.label}`}
        </button>
      )}
    </div>
  )
}
