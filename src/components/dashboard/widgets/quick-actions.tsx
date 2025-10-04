'use client'

import * as React from "react"
import { CalendarDays, MapPin, UtensilsCrossed, Users, RefreshCw, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  variant?: 'primary' | 'accent' | 'warning' | 'default'
}

interface QuickActionsWidgetProps {
  className?: string
}

const primaryActions: QuickAction[] = [
  {
    title: 'Reservaciones',
    description: 'Gestionar reservas y disponibilidad',
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    href: '/dashboard/reservaciones',
    variant: 'primary'
  },
  {
    title: 'Mesas',
    description: 'Estado y disposición de mesas',
    icon: <MapPin className="h-8 w-8 text-accent" />,
    href: '/dashboard/mesas',
    variant: 'accent'
  },
  {
    title: 'Menú',
    description: 'Gestión de platos y categorías',
    icon: <UtensilsCrossed className="h-8 w-8 text-orange-500" />,
    href: '/dashboard/menu',
    variant: 'warning'
  }
]

const secondaryActions = [
  {
    title: 'Clientes',
    icon: <Users className="h-4 w-4" />,
    href: '/dashboard/clientes'
  },
  {
    title: 'Analytics',
    icon: <RefreshCw className="h-4 w-4" />,
    href: '/dashboard/analytics'
  },
  {
    title: 'Configuración',
    icon: <Clock className="h-4 w-4" />,
    href: '/dashboard/configuracion'
  }
]

const variantStyles = {
  primary: 'hover:bg-primary/5 hover:border-primary/20',
  accent: 'hover:bg-accent/5 hover:border-accent/20',
  warning: 'hover:bg-orange-500/5 hover:border-orange-500/20',
  default: 'hover:bg-muted/50'
}

export function QuickActionsWidget({ className }: QuickActionsWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Accesos Rápidos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gestión operativa del restaurante
        </p>
      </CardHeader>
      <CardContent>
        {/* Primary Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className={cn(
                "h-auto p-6 flex flex-col items-center space-y-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                variantStyles[action.variant || 'default']
              )}
              onClick={() => window.location.href = action.href}
            >
              {action.icon}
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{action.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>

        {/* Secondary Actions Row */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {secondaryActions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                size="sm"
                className={cn(
                  "justify-start space-x-2",
                  variantStyles.default,
                  action.title === 'Configuración' && 'col-span-2 md:col-span-1'
                )}
                onClick={() => window.location.href = action.href}
              >
                {action.icon}
                <span>{action.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
