/**
 * CONFIG HEADER
 * Header reutilizable para página de configuración
 */

'use client'

import { Settings } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface ConfigHeaderProps {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function ConfigHeader({
  title = 'Configuración',
  description = 'Gestiona la configuración del restaurante y preferencias del sistema',
  icon
}: ConfigHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {icon || <Settings className="h-8 w-8 text-primary" />}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>
      <Separator />
    </div>
  )
}
