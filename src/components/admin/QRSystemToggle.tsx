'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, QrCode, ShoppingCart, Menu } from 'lucide-react'
import { toast } from 'sonner'

interface QRSettings {
  qr_ordering_enabled: boolean
  qr_only_menu: boolean
  last_updated?: string
}

export function QRSystemToggle() {
  const [settings, setSettings] = useState<QRSettings>({
    qr_ordering_enabled: false,
    qr_only_menu: true
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Get headers for API calls (no auth needed - API uses service role)
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json'
    }
  }

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const headers = getHeaders()
        const response = await fetch('/api/admin/qr-settings', { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.settings) {
            setSettings(data.settings)
          }
        }
      } catch (error) {
        console.error('Error fetching QR settings:', error)
        toast.error('No se pudieron cargar las configuraciones QR')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Update settings
  const updateSettings = async (newSettings: Partial<QRSettings>) => {
    setUpdating(true)
    try {
      const updatedSettings = { ...settings, ...newSettings }
      const headers = getHeaders()

      const response = await fetch('/api/admin/qr-settings', {
        method: 'POST',
        headers,
        body: JSON.stringify(updatedSettings)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
          toast.success('✅ Configuración actualizada - Los cambios se aplicarán inmediatamente en el sistema QR')
        }
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating QR settings:', error)
      toast.error('❌ No se pudo actualizar la configuración')
    } finally {
      setUpdating(false)
    }
  }

  const handleOrderingToggle = (enabled: boolean) => {
    if (enabled) {
      // Activar Pedidos QR = desactivar Solo Menú (mutuamente excluyentes)
      updateSettings({
        qr_ordering_enabled: true,
        qr_only_menu: false
      })
    } else {
      // Si desactivas Pedidos QR, automáticamente activa Solo Menú
      updateSettings({
        qr_ordering_enabled: false,
        qr_only_menu: true
      })
    }
  }

  const handleMenuModeToggle = (menuOnly: boolean) => {
    if (menuOnly) {
      // Activar Solo Menú = desactivar Pedidos QR (mutuamente excluyentes)
      updateSettings({
        qr_ordering_enabled: false,
        qr_only_menu: true
      })
    } else {
      // Si desactivas Solo Menú, automáticamente activa Pedidos QR
      updateSettings({
        qr_ordering_enabled: true,
        qr_only_menu: false
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Sistema QR
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = () => {
    if (settings.qr_ordering_enabled) {
      return <Badge variant="default">Pedidos Activos</Badge>
    } else {
      return <Badge variant="outline">Solo Menú</Badge>
    }
  }

  const getStatusDescription = () => {
    if (settings.qr_ordering_enabled) {
      return "Los clientes pueden ver el menú Y realizar pedidos mediante códigos QR"
    } else {
      return "Los clientes pueden ver el menú mediante QR pero NO realizar pedidos"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Sistema QR
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          {getStatusDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ordering Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">
                Pedidos QR
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Permitir realizar pedidos desde códigos QR
            </p>
          </div>
          <Switch
            checked={settings.qr_ordering_enabled}
            onCheckedChange={handleOrderingToggle}
            disabled={updating}
          />
        </div>

        {/* Menu Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <span className="text-sm font-medium">
                Solo Menú
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mostrar solo el menú sin opción de pedido
            </p>
          </div>
          <Switch
            checked={settings.qr_only_menu}
            onCheckedChange={handleMenuModeToggle}
            disabled={updating}
          />
        </div>

        {/* Status Information */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {settings.last_updated && (
              <>
                Última actualización: {new Date(settings.last_updated).toLocaleString('es-ES')}
              </>
            )}
          </div>
        </div>

        {/* Update Indicator */}
        {updating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Actualizando configuración...
          </div>
        )}
      </CardContent>
    </Card>
  )
}