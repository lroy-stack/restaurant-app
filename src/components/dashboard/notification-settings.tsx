'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Bell, Volume2, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReservationNotifications } from '@/hooks/useReservationNotifications'

export function NotificationSettings() {
  const { config, updateConfig, requestBrowserPermission, unlockAudio, audioUnlocked } = useReservationNotifications()
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  const handleRequestPermission = async () => {
    const granted = await requestBrowserPermission()
    if (granted) {
      setBrowserPermission('granted')
    }
  }

  const handleTestSound = () => {
    // Reproducir sonido de prueba
    if (config.soundEnabled && config.enabled) {
      try {
        const audio = new Audio('/sounds/new-reservation.mp3')
        audio.volume = config.volume
        audio.play()
      } catch (err) {
        console.error('Error playing test sound:', err)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            !config.enabled && "text-muted-foreground"
          )}
        >
          {config.enabled ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          <span className="hidden md:inline">Notificaciones</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuración de Notificaciones
          </DialogTitle>
          <DialogDescription>
            Personaliza cómo quieres recibir alertas de nuevas reservas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Activar notificaciones */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-base font-medium">
                Notificaciones en tiempo real
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe alertas instantáneas de cambios
              </p>
            </div>
            <Switch
              id="notifications"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                updateConfig({ enabled: checked })
              }
            />
          </div>

          {/* Activar sonidos */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sounds" className="text-base font-medium">
                Sonidos de alerta
              </Label>
              <p className="text-sm text-muted-foreground">
                Reproducir audio distintivo por tipo
              </p>
            </div>
            <Switch
              id="sounds"
              checked={config.soundEnabled}
              onCheckedChange={(checked) =>
                updateConfig({ soundEnabled: checked })
              }
              disabled={!config.enabled}
            />
          </div>

          {/* Audio Unlock Button */}
          {config.enabled && config.soundEnabled && !audioUnlocked && (
            <div className="space-y-3 rounded-lg border-2 border-orange-500 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">🔇</div>
                <div className="flex-1 space-y-2">
                  <Label className="text-base font-semibold text-orange-900">
                    Sonido bloqueado por el navegador
                  </Label>
                  <p className="text-sm text-orange-700">
                    Los navegadores requieren que actives el sonido manualmente.
                    Haz click en el botón para habilitar notificaciones con audio.
                  </p>
                  <Button
                    onClick={unlockAudio}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Activar Sonido Ahora
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Status indicator cuando desbloqueado */}
          {audioUnlocked && config.soundEnabled && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
              <Volume2 className="h-4 w-4" />
              <span className="font-medium">Sonido activo y listo</span>
            </div>
          )}

          {/* Control volumen */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Volume2 className="h-4 w-4" />
              Volumen: {Math.round(config.volume * 100)}%
            </Label>
            <Slider
              value={[config.volume]}
              onValueChange={([value]) =>
                updateConfig({ volume: value })
              }
              max={1}
              min={0}
              step={0.1}
              disabled={!config.enabled || !config.soundEnabled}
              className="py-2"
            />
          </div>

          {/* Notificaciones del navegador */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Notificaciones del navegador
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas incluso fuera de la pestaña
                </p>
              </div>
              {browserPermission === 'default' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestPermission}
                >
                  Activar
                </Button>
              )}
              {browserPermission === 'granted' && (
                <span className="text-sm text-green-600 font-medium">✓ Activo</span>
              )}
              {browserPermission === 'denied' && (
                <span className="text-sm text-red-600 font-medium">✗ Bloqueado</span>
              )}
            </div>
            {browserPermission === 'denied' && (
              <p className="text-xs text-muted-foreground">
                Activa los permisos desde la configuración de tu navegador
              </p>
            )}
          </div>

          {/* Tipos de sonido */}
          <div className="space-y-2 rounded-lg border p-4 bg-muted/30">
            <Label className="text-sm font-medium">Tipos de sonido:</Label>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>🎉 <strong>Nueva reserva</strong> - Tono agradable</li>
              <li>✏️ <strong>Modificada</strong> - Tono neutro</li>
              <li>❌ <strong>Cancelada</strong> - Tono descendente</li>
            </ul>
          </div>

          {/* Test sonidos */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleTestSound}
            disabled={!config.enabled || !config.soundEnabled || !audioUnlocked}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Probar Sonido
          </Button>
          {!audioUnlocked && config.soundEnabled && (
            <p className="text-xs text-muted-foreground text-center">
              Activa el sonido primero para probarlo
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
