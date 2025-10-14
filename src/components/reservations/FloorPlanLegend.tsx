'use client'

import { cn } from '@/lib/utils'

interface FloorPlanLegendProps {
  language: 'es' | 'en' | 'de'
  className?: string
}

const translations = {
  es: {
    legend: 'Leyenda',
    available: 'Disponible',
    selected: 'Seleccionada',
    reserved: 'Reservada',
    unavailable: 'No disponible'
  },
  en: {
    legend: 'Legend',
    available: 'Available',
    selected: 'Selected',
    reserved: 'Reserved',
    unavailable: 'Unavailable'
  },
  de: {
    legend: 'Legende',
    available: 'Verfügbar',
    selected: 'Ausgewählt',
    reserved: 'Reserviert',
    unavailable: 'Nicht verfügbar'
  }
}

export function FloorPlanLegend({ language, className }: FloorPlanLegendProps) {
  const t = translations[language]

  const legendItems = [
    {
      label: t.available,
      color: 'oklch(0.75 0.12 145)', // Green
      borderColor: 'oklch(0.50 0.15 145)'
    },
    {
      label: t.selected,
      color: 'oklch(0.55 0.15 220)', // Blue
      borderColor: 'oklch(0.45 0.15 220)'
    },
    {
      label: t.reserved,
      color: 'oklch(0.65 0.12 30)', // Orange
      borderColor: 'oklch(0.45 0.15 30)',
      opacity: 0.4
    },
    {
      label: t.unavailable,
      color: 'oklch(0.70 0.02 220)', // Gray
      borderColor: 'oklch(0.50 0.02 220)',
      opacity: 0.4
    }
  ]

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      <span className="text-sm font-medium text-muted-foreground">{t.legend}:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border-2 transition-all"
            style={{
              backgroundColor: item.color,
              borderColor: item.borderColor,
              opacity: item.opacity || 1
            }}
          />
          <span className="text-sm text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
