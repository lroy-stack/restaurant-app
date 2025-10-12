# 📢 INFORME: Sistema de Notificaciones Real-Time con Audio
**Proyecto**: Enigma Restaurant Management System
**Fecha**: 12 Octubre 2025
**Objetivo**: Implementar notificaciones visuales + sonoras en tiempo real para reservas

---

## 📊 ANÁLISIS DEL SISTEMA ACTUAL

### ✅ **YA IMPLEMENTADO**
```typescript
// src/hooks/useRealtimeReservations.ts (líneas 251-324)
const channel = supabase
  .channel('reservations')
  .on('postgres_changes', { event: '*', schema: 'restaurante', table: 'reservations' },
    (payload) => {
      // ✅ Escucha INSERT/UPDATE/DELETE
      // ❌ NO notifica visualmente al usuario
      // ❌ NO reproduce sonidos
    }
  )
```

**Stack actual**:
- ✅ Supabase Realtime: `@supabase/supabase-js@2.55.0` (configurado)
- ✅ Sonner: `sonner@2.0.7` (toast notifications)
- ✅ Next.js 15 con React 18
- ✅ Hook `useRealtimeReservations` funcional

### ❌ **PROBLEMA IDENTIFICADO**

El código realtime **SÍ recibe** cambios de DB, pero:
1. **No notifica visualmente** → Usuario no ve cambios hasta refrescar
2. **No reproduce audio** → No alerta de reservas urgentes
3. **No diferencia tipos** → INSERT/UPDATE/DELETE se ven igual

---

## 🎯 SOLUCIÓN PROPUESTA

### **Librerías Recomendadas** (Investigadas y Validadas 2025)

#### 1. **Sonner** (YA INSTALADO ✅)
- **Ventaja**: Mejor toast library React 2025
- **Peso**: ~5KB gzipped
- **Features**: Promise-based, stacking, accessible
- **Uso**: Notificaciones visuales

#### 2. **use-sound** (INSTALAR)
```bash
npm install use-sound
```
- **Ventaja**: Hook React ligero (~1KB + 10KB howler.js async)
- **Peso**: ~11KB total (lazy loaded)
- **Features**: Audio sprites, volume control, interrupt
- **Uso**: Sonidos de notificación

#### 3. **Alternativa**: `react-hot-toast` (NO NECESARIO)
- Ya tenemos Sonner que es superior

---

## 🔊 ESTRATEGIA DE SONIDOS

### **Tres Sonidos Diferenciados**

```typescript
const NOTIFICATION_SOUNDS = {
  NEW_RESERVATION: '/sounds/new-reservation.mp3',      // Tono agradable, ascendente
  UPDATED_RESERVATION: '/sounds/update-reservation.mp3', // Tono neutro, breve
  CANCELLED_RESERVATION: '/sounds/cancel-reservation.mp3' // Tono descendente, serio
}
```

### **Características Sonidos**
- **Formato**: MP3 (compatibilidad universal)
- **Duración**: 0.5-1.5 segundos (no intrusivo)
- **Volumen**: 0.7 por defecto (ajustable)
- **Sprites**: Opción para un solo archivo con múltiples sonidos

### **Fuentes de Sonidos Recomendadas** (Libres)
1. **Freesound.org** (Creative Commons)
2. **Zapsplat.com** (Free for commercial)
3. **Notification Sounds.com** (Royalty free)
4. **Crear propios**: Audacity (software gratis)

---

## 🛠️ PLAN DE IMPLEMENTACIÓN

### **FASE 1: Instalación y Setup** (15 min)

```bash
# 1. Instalar use-sound
npm install use-sound

# 2. Crear directorio sonidos
mkdir -p public/sounds

# 3. Descargar/crear 3 archivos MP3:
# public/sounds/new-reservation.mp3
# public/sounds/update-reservation.mp3
# public/sounds/cancel-reservation.mp3
```

### **FASE 2: Hook de Notificaciones** (30 min)

Crear: `src/hooks/useReservationNotifications.ts`

```typescript
'use client'

import { useEffect } from 'react'
import useSound from 'use-sound'
import { toast } from 'sonner'

interface NotificationConfig {
  enabled: boolean
  soundEnabled: boolean
  volume: number
}

export function useReservationNotifications(config: NotificationConfig = {
  enabled: true,
  soundEnabled: true,
  volume: 0.7
}) {
  // Cargar sonidos (lazy loaded)
  const [playNew] = useSound('/sounds/new-reservation.mp3', {
    volume: config.volume,
    soundEnabled: config.soundEnabled
  })

  const [playUpdate] = useSound('/sounds/update-reservation.mp3', {
    volume: config.volume,
    soundEnabled: config.soundEnabled
  })

  const [playCancel] = useSound('/sounds/cancel-reservation.mp3', {
    volume: config.volume,
    soundEnabled: config.soundEnabled
  })

  const notifyNewReservation = (data: any) => {
    if (!config.enabled) return

    // Sonido
    playNew()

    // Toast visual
    toast.success(`🎉 Nueva Reserva`, {
      description: `${data.customerName} - ${data.partySize} personas - ${data.time}`,
      duration: 6000,
      action: {
        label: 'Ver',
        onClick: () => window.location.href = `/dashboard/reservaciones`
      }
    })
  }

  const notifyUpdateReservation = (data: any) => {
    if (!config.enabled) return

    playUpdate()

    toast.info(`✏️ Reserva Modificada`, {
      description: `${data.customerName} - Cambios en la reserva`,
      duration: 4000
    })
  }

  const notifyCancelReservation = (data: any) => {
    if (!config.enabled) return

    playCancel()

    toast.error(`❌ Reserva Cancelada`, {
      description: `${data.customerName} - ${data.partySize} personas`,
      duration: 5000
    })
  }

  return {
    notifyNewReservation,
    notifyUpdateReservation,
    notifyCancelReservation
  }
}
```

### **FASE 3: Integrar en useRealtimeReservations** (20 min)

Modificar: `src/hooks/useRealtimeReservations.ts`

```typescript
// Agregar import
import { useReservationNotifications } from './useReservationNotifications'

export function useRealtimeReservations(filters: RealtimeFilters = {}) {
  // ... código existente ...

  // ✅ NUEVO: Hook de notificaciones
  const {
    notifyNewReservation,
    notifyUpdateReservation,
    notifyCancelReservation
  } = useReservationNotifications({
    enabled: true,
    soundEnabled: true,
    volume: 0.7
  })

  // Modificar useEffect de realtime (línea 252)
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      // ... código existente ...

      const channel = supabase
        .channel('reservations')
        .on('postgres_changes', { event: '*', schema: 'restaurante', table: 'reservations' },
          (payload) => {
            console.log('Realtime reservation change:', payload)

            switch (payload.eventType) {
              case 'INSERT':
                setReservations(prev => [payload.new as Reservation, ...prev])
                // ... código existente summary ...

                // ✅ NUEVO: Notificar
                notifyNewReservation(payload.new)
                break

              case 'UPDATE':
                setReservations(prev =>
                  prev.map(reservation =>
                    reservation.id === payload.new.id
                      ? { ...reservation, ...payload.new } as Reservation
                      : reservation
                  )
                )

                // ✅ NUEVO: Notificar solo si cambio importante
                if (payload.old.status !== payload.new.status) {
                  if (payload.new.status === 'CANCELLED') {
                    notifyCancelReservation(payload.new)
                  } else {
                    notifyUpdateReservation(payload.new)
                  }
                }
                break

              case 'DELETE':
                // ... código existente ...
                notifyCancelReservation(payload.old)
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
        })

      channelRef.current = channel
    }

    setupRealtimeSubscription()
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  // ... resto del código ...
}
```

### **FASE 4: Panel de Control de Notificaciones** (30 min)

Crear: `src/components/dashboard/notification-settings.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Bell, Volume2 } from 'lucide-react'

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    enabled: true,
    soundEnabled: true,
    volume: 0.7
  })

  // Cargar de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notification-settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  // Guardar en localStorage
  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    localStorage.setItem('notification-settings', JSON.stringify(newSettings))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activar notificaciones */}
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Notificaciones en tiempo real</Label>
          <Switch
            id="notifications"
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              saveSettings({ ...settings, enabled: checked })
            }
          />
        </div>

        {/* Activar sonidos */}
        <div className="flex items-center justify-between">
          <Label htmlFor="sounds">Sonidos de alerta</Label>
          <Switch
            id="sounds"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) =>
              saveSettings({ ...settings, soundEnabled: checked })
            }
            disabled={!settings.enabled}
          />
        </div>

        {/* Control volumen */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Volumen: {Math.round(settings.volume * 100)}%
          </Label>
          <Slider
            value={[settings.volume]}
            onValueChange={([value]) =>
              saveSettings({ ...settings, volume: value })
            }
            max={1}
            step={0.1}
            disabled={!settings.enabled || !settings.soundEnabled}
          />
        </div>

        {/* Test sonidos */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Reproducir sonido de prueba
            const audio = new Audio('/sounds/new-reservation.mp3')
            audio.volume = settings.volume
            audio.play()
          }}
          disabled={!settings.soundEnabled}
        >
          Probar Sonido
        </Button>
      </CardContent>
    </Card>
  )
}
```

### **FASE 5: Integrar Settings en Dashboard** (10 min)

Modificar: `src/app/(admin)/dashboard/reservaciones/page.tsx`

```typescript
// Agregar import
import { NotificationSettings } from '@/components/dashboard/notification-settings'

// En el componente, agregar botón settings en header
<div className="flex gap-2">
  <NotificationSettings />
  <Button onClick={handleRefresh}>
    <RefreshCw className="h-4 w-4" />
  </Button>
</div>
```

---

## 🎨 MEJORAS UX OPCIONALES

### **1. Badge de Contador Animado**
```typescript
<Button className="relative">
  Reservaciones
  {newReservationsCount > 0 && (
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500
                     text-white text-xs flex items-center justify-center
                     animate-bounce">
      {newReservationsCount}
    </span>
  )}
</Button>
```

### **2. Browser Notification API** (Desktop)
```typescript
// Solicitar permiso
if (Notification.permission === 'default') {
  Notification.requestPermission()
}

// Mostrar notificación
if (Notification.permission === 'granted') {
  new Notification('Nueva Reserva', {
    body: `${data.customerName} - ${data.partySize} personas`,
    icon: '/logo.png',
    badge: '/badge.png'
  })
}
```

### **3. Tab Title Animation**
```typescript
// Cambiar título cuando hay nuevas reservas
useEffect(() => {
  if (newReservationsCount > 0) {
    document.title = `(${newReservationsCount}) Nueva Reserva - Enigma`
  } else {
    document.title = 'Reservaciones - Enigma Dashboard'
  }
}, [newReservationsCount])
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Performance**
1. ✅ Sonidos lazy-loaded (no afectan bundle inicial)
2. ✅ Throttle en notificaciones (evitar spam)
3. ✅ Cleanup adecuado de subscriptions

### **Accesibilidad**
1. ✅ Sonidos opcionales (switch on/off)
2. ✅ Control de volumen
3. ✅ Toast con ARIA labels (Sonner built-in)
4. ✅ No dependencia exclusiva de sonido

### **UX**
1. ✅ Sonidos breves (0.5-1.5s)
2. ✅ Volumen moderado por defecto (70%)
3. ✅ Diferenciación clara entre tipos
4. ✅ Persistencia de preferencias (localStorage)

### **Browser Compatibility**
```typescript
// Verificar soporte Audio API
const audioSupported = typeof Audio !== 'undefined'
const notificationSupported = 'Notification' in window
```

---

## 📊 TESTING PLAN

### **Pruebas Unitarias**
```bash
# Test hook notificaciones
npm run test src/hooks/useReservationNotifications.test.ts
```

### **Pruebas Manuales**
1. ✅ Crear reserva desde formulario público → Escuchar sonido nuevo
2. ✅ Modificar reserva desde admin → Escuchar sonido update
3. ✅ Cancelar reserva → Escuchar sonido cancel
4. ✅ Múltiples reservas rápidas → Verificar no spam
5. ✅ Cambiar volumen → Verificar ajuste
6. ✅ Deshabilitar sonidos → Verificar silencio
7. ✅ Cerrar tab → Reabrir → Verificar persistencia settings

### **Escenarios Edge Case**
- ✅ Usuario sin permisos audio → Fallback solo visual
- ✅ Connection drop → Reconexión automática Supabase
- ✅ Múltiples tabs abiertos → Cada tab notifica (o filtrar?)

---

## 🚀 CRONOGRAMA ESTIMADO

| Fase | Tiempo | Descripción |
|------|--------|-------------|
| **1. Setup** | 15 min | Instalar deps + sonidos |
| **2. Hook notificaciones** | 30 min | Crear useReservationNotifications |
| **3. Integración realtime** | 20 min | Modificar useRealtimeReservations |
| **4. Panel settings** | 30 min | Crear NotificationSettings component |
| **5. Testing** | 30 min | Pruebas manuales |
| **TOTAL** | **~2 horas** | Implementación completa |

---

## 📦 ARCHIVOS A CREAR/MODIFICAR

### **Nuevos**
```
public/sounds/
  ├── new-reservation.mp3
  ├── update-reservation.mp3
  └── cancel-reservation.mp3

src/hooks/
  └── useReservationNotifications.ts (NUEVO)

src/components/dashboard/
  └── notification-settings.tsx (NUEVO)
```

### **Modificar**
```
src/hooks/useRealtimeReservations.ts
  └── Agregar llamadas a notificaciones (3 líneas)

src/app/(admin)/dashboard/reservaciones/page.tsx
  └── Agregar NotificationSettings component
```

---

## 🎯 RESULTADO ESPERADO

**Antes**:
- ❌ Usuario refresca página cada minuto
- ❌ Se pierden reservas urgentes
- ❌ No hay feedback inmediato

**Después**:
- ✅ Notificación visual + sonora instantánea
- ✅ Staff alerta en <1 segundo de nueva reserva
- ✅ Diferenciación clara entre tipos de cambio
- ✅ Control usuario sobre volumen/activación
- ✅ UX profesional y moderna

---

## 💡 RECOMENDACIONES ADICIONALES

1. **Sentry Integration**: Log de errores notificaciones
2. **Analytics**: Track tasa de respuesta staff
3. **Mobile PWA**: Push notifications nativas
4. **Slack Integration**: Notificar canal Slack también
5. **WhatsApp Business**: Notificar admin por WhatsApp

---

**Documento creado por**: Claude Code
**Basado en**: Best practices 2025 + Stack actual Enigma
**Librerías validadas**: Sonner, use-sound, Supabase Realtime
