/**
 * EMAIL CONFIG SECTION
 * Sección para gestión de configuración de emails
 * ✅ Read-only por ahora - muestra datos actuales desde DB
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Palette,
  Type,
  Eye,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react'
import { useRestaurant } from '@/hooks/use-restaurant'

export function EmailConfigSection() {
  const { restaurant, loading } = useRestaurant()

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cargando configuración...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración de Emails</h2>
        <p className="text-muted-foreground mt-2">
          Gestiona la apariencia y configuración de las plantillas de email
        </p>
      </div>

      {/* Información de Remitente (read-only, viene de DB) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Información del Remitente
          </CardTitle>
          <CardDescription>
            Esta información aparece en los emails enviados a clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del Restaurante</Label>
              <Input
                value={restaurant?.name || 'Tu Restaurante'}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Email de Contacto</Label>
              <Input
                value={restaurant?.email || 'info@turestaurante.com'}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={restaurant?.phone || '+00 000 000 000'}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={restaurant?.address || 'Dirección del restaurante'}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Gestión desde Información General</p>
              <p className="text-sm text-muted-foreground">
                Para modificar estos valores, ve al tab <strong>"Info General"</strong> → sub-tab <strong>"Básico"</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Colores (read-only por ahora) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Paleta de Colores de Plantillas
          </CardTitle>
          <CardDescription>
            Colores utilizados en las plantillas de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Color Primario */}
            <div className="space-y-2">
              <Label>Color Primario (Headers)</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: '#237584' }}
                />
                <Input
                  value="#237584"
                  disabled
                  className="bg-muted flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usado en encabezados y botones principales
              </p>
            </div>

            {/* Color Secundario */}
            <div className="space-y-2">
              <Label>Color Secundario (Fondos)</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: '#9FB289' }}
                />
                <Input
                  value="#9FB289"
                  disabled
                  className="bg-muted flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usado en cajas de información
              </p>
            </div>

            {/* Color Acento */}
            <div className="space-y-2">
              <Label>Color Acento (Destacados)</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: '#CB5910' }}
                />
                <Input
                  value="#CB5910"
                  disabled
                  className="bg-muted flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usado en precios y elementos destacados
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Personalización de Colores (Próximamente)
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                En futuras versiones podrás personalizar estos colores desde aquí.
                Por ahora, estos son los colores por defecto del design system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Fuentes (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Tipografías de Plantillas
          </CardTitle>
          <CardDescription>
            Fuentes utilizadas en las plantillas de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-semibold">Benaya</p>
                <p className="text-sm text-muted-foreground">Títulos principales y nombres</p>
              </div>
              <Badge variant="outline">Primary</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-semibold">Playfair Display</p>
                <p className="text-sm text-muted-foreground">Subtítulos y encabezados secundarios</p>
              </div>
              <Badge variant="outline">Secondary</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-semibold">Inter</p>
                <p className="text-sm text-muted-foreground">Cuerpo de texto y contenido general</p>
              </div>
              <Badge variant="outline">Body</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-semibold">Crimson Text</p>
                <p className="text-sm text-muted-foreground">Citas y textos elegantes</p>
              </div>
              <Badge variant="outline">Elegant</Badge>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Tipografías Optimizadas para Email
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Estas fuentes están cargadas desde Google Fonts y optimizadas para compatibilidad con clientes de email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview de Plantillas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview de Plantillas
          </CardTitle>
          <CardDescription>
            Vista previa de cómo se ven los emails con tu configuración actual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto flex-col items-start gap-2 p-4">
              <div className="flex items-center gap-2 w-full">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">Confirmación de Reserva</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Email enviado cuando se crea una nueva reserva
              </p>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start gap-2 p-4">
              <div className="flex items-center gap-2 w-full">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">Reserva Confirmada</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Email cuando el admin confirma la reserva
              </p>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start gap-2 p-4">
              <div className="flex items-center gap-2 w-full">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">Recordatorio</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Recordatorio enviado antes de la reserva
              </p>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start gap-2 p-4">
              <div className="flex items-center gap-2 w-full">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">Solicitud de Reseña</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Solicita feedback después de la visita
              </p>
            </Button>
          </div>

          <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              🚧 Sistema de preview en desarrollo
            </p>
            <p className="text-xs text-muted-foreground">
              Próximamente podrás ver y enviar emails de prueba desde aquí
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enlaces de Redes Sociales (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Enlaces en Footer de Emails</CardTitle>
          <CardDescription>
            URLs que aparecen en el pie de los emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <div className="flex gap-2">
                <Input
                  value={restaurant?.instagram_url || 'https://instagram.com/turestaurante'}
                  disabled
                  className="bg-muted flex-1"
                />
                {restaurant?.instagram_url && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(restaurant.instagram_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Facebook</Label>
              <div className="flex gap-2">
                <Input
                  value={restaurant?.facebook_url || 'https://facebook.com/turestaurante'}
                  disabled
                  className="bg-muted flex-1"
                />
                {restaurant?.facebook_url && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(restaurant.facebook_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={restaurant?.whatsapp_number || '+00 000 000 000'}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>TripAdvisor</Label>
              <div className="flex gap-2">
                <Input
                  value={restaurant?.footer_tripadvisor_url || 'https://tripadvisor.com'}
                  disabled
                  className="bg-muted flex-1"
                />
                {restaurant?.footer_tripadvisor_url && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(restaurant.footer_tripadvisor_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Gestión desde Información General</p>
              <p className="text-sm text-muted-foreground">
                Para modificar estos enlaces, ve al tab <strong>"Info General"</strong> → sub-tab <strong>"Social"</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
