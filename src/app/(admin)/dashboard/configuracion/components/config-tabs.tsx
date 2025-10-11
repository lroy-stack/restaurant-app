/**
 * CONFIG TABS NAVIGATION
 * Sistema de navegación por tabs para configuración
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Clock,
  CalendarOff,
  Images,
  Mail,
  Share2,
  QrCode,
  FileText
} from 'lucide-react'
import type { ConfigSection } from '../types/config.types'

interface ConfigTabsProps {
  defaultSection?: ConfigSection
  children: React.ReactNode
}

export function ConfigTabs({ defaultSection = 'info', children }: ConfigTabsProps) {
  return (
    <Tabs defaultValue={defaultSection} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2 h-auto p-2">
        <TabsTrigger value="info" className="flex items-center gap-2 h-9">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Info General</span>
          <span className="sm:hidden">Info</span>
        </TabsTrigger>

        <TabsTrigger value="horarios" className="flex items-center gap-2 h-9">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Horarios</span>
        </TabsTrigger>

        <TabsTrigger value="vacaciones" className="flex items-center gap-2 h-9">
          <CalendarOff className="h-4 w-4" />
          <span className="hidden sm:inline">Vacaciones</span>
          <span className="sm:hidden">Festivos</span>
        </TabsTrigger>

        <TabsTrigger value="medios" className="flex items-center gap-2 h-9">
          <Images className="h-4 w-4" />
          <span className="hidden sm:inline">Medios</span>
        </TabsTrigger>

        <TabsTrigger value="emails" className="flex items-center gap-2 h-9">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Emails</span>
        </TabsTrigger>

        <TabsTrigger value="social" className="flex items-center gap-2 h-9">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Redes</span>
        </TabsTrigger>

        <TabsTrigger value="qr" className="flex items-center gap-2 h-9">
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">QR</span>
        </TabsTrigger>

        <TabsTrigger value="legal" className="flex items-center gap-2 h-9">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Legal</span>
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  )
}

interface ConfigTabContentProps {
  value: ConfigSection
  children: React.ReactNode
}

export function ConfigTabContent({ value, children }: ConfigTabContentProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      {children}
    </TabsContent>
  )
}
