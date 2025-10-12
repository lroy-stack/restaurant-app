# 🧪 GUÍA DE TESTING - Sistema de Notificaciones Real-Time

## ✅ IMPLEMENTACIÓN COMPLETADA

### **Archivos Creados**
```
✅ src/hooks/useReservationNotifications.ts (167 líneas)
✅ src/components/dashboard/notification-settings.tsx (174 líneas)
✅ public/sounds/new-reservation.mp3 (17KB)
✅ public/sounds/update-reservation.mp3 (17KB)
✅ public/sounds/cancel-reservation.mp3 (17KB)
✅ public/sounds/README.md (guía sonidos)
```

### **Archivos Modificados**
```
✅ src/hooks/useRealtimeReservations.ts (+15 líneas)
✅ src/app/(admin)/dashboard/reservaciones/page.tsx (+2 líneas)
✅ package.json (use-sound@5.0.0)
```

---

## 🧪 PLAN DE TESTING MANUAL

### **1. Verificar Instalación**

```bash
# Terminal 1: Levantar dev server
npm run dev

# Abrir navegador
http://localhost:3000/dashboard/reservaciones
```

**Verificar**:
- ✅ Página carga sin errores
- ✅ Botón "Notificaciones" visible en header
- ✅ Click en botón abre modal de configuración

---

### **2. Test Configuración de Sonidos**

**Pasos**:
1. Click en botón "Notificaciones" (campana)
2. Verificar modal se abre correctamente
3. Verificar switches:
   - ✅ "Notificaciones en tiempo real" (ON por defecto)
   - ✅ "Sonidos de alerta" (ON por defecto)
   - ✅ Slider de volumen (70% por defecto)
4. Click en "Probar Sonido"
   - ✅ Debe escucharse un "ding" claro

**Ajustes**:
1. Mover slider volumen a 100%
2. Click "Probar Sonido" → Más fuerte
3. Mover slider a 20%
4. Click "Probar Sonido" → Más suave
5. Toggle OFF "Sonidos de alerta"
6. Click "Probar Sonido" → Sin sonido ✅

---

### **3. Test Real-Time: Nueva Reserva**

**Setup**:
1. Abrir 2 pestañas:
   - **Pestaña A**: `/dashboard/reservaciones` (admin)
   - **Pestaña B**: `/reservas` (formulario público)

**Test**:
1. En Pestaña B: Crear nueva reserva
   - Fecha: Hoy
   - Hora: 20:00
   - Personas: 2
   - Nombre: "Test Audio"
   - Email: test@example.com
   - Phone: +34 600 123 456
2. Completar formulario → Submit

**Verificar en Pestaña A**:
- ✅ Escuchar sonido "ding" inmediatamente
- ✅ Ver toast verde: "🎉 Nueva Reserva"
- ✅ Toast debe mostrar: "Test Audio - 2 personas - 20:00"
- ✅ Botón "Ver" en toast
- ✅ Reserva aparece en lista sin refrescar

**Timing esperado**: <1 segundo

---

### **4. Test Real-Time: Modificar Reserva**

**Pasos**:
1. En dashboard, click en reserva "Test Audio"
2. Click "Editar"
3. Cambiar hora de 20:00 → 21:00
4. Guardar cambios

**Verificar**:
- ✅ Escuchar sonido breve (diferente al anterior)
- ✅ Ver toast azul: "✏️ Reserva Modificada"
- ✅ Hora actualizada en lista sin refrescar

---

### **5. Test Real-Time: Cancelar Reserva**

**Pasos**:
1. En dashboard, click en reserva "Test Audio"
2. Click "Cancelar Reserva"
3. Confirmar cancelación

**Verificar**:
- ✅ Escuchar sonido descendente (serio)
- ✅ Ver toast rojo: "❌ Reserva Cancelada"
- ✅ Estado actualizado a "CANCELLED"

---

### **6. Test Persistencia de Configuración**

**Pasos**:
1. Abrir modal notificaciones
2. Cambiar volumen a 50%
3. Toggle OFF sonidos
4. Cerrar modal
5. Cerrar pestaña navegador completamente
6. Reabrir `/dashboard/reservaciones`
7. Abrir modal notificaciones de nuevo

**Verificar**:
- ✅ Volumen sigue en 50%
- ✅ Sonidos siguen OFF
- ✅ Configuración persistida (localStorage)

---

### **7. Test Notificaciones Navegador (Desktop)**

**Pasos**:
1. Abrir modal notificaciones
2. En sección "Notificaciones del navegador"
3. Click "Activar"
4. Browser mostrará popup: "Permitir notificaciones"
5. Click "Permitir"

**Test**:
1. Crear nueva reserva desde formulario público
2. Minimizar/cambiar de pestaña

**Verificar**:
- ✅ Ver notificación del sistema operativo
- ✅ Notificación contiene: "Nueva Reserva - Enigma"
- ✅ Body: "Test Audio - 2 personas - 20:00"

---

### **8. Test Anti-Spam (Multiple Reservas)**

**Pasos**:
1. Crear 5 reservas seguidas desde formulario público
   - Todas con datos diferentes
   - Submit rápido (1 cada 3 segundos)

**Verificar**:
- ✅ No más de 1 toast visible a la vez (stacking de Sonner)
- ✅ Sonidos espaciados (no overlap)
- ✅ Todas las 5 reservas aparecen en lista

---

### **9. Test Casos Edge**

#### **9.1 Sonidos deshabilitados**
- ✅ Toggle OFF sonidos → Crear reserva → Solo toast, sin audio

#### **9.2 Notificaciones deshabilitadas**
- ✅ Toggle OFF notificaciones → Crear reserva → Sin toast, sin audio
- ✅ Datos siguen actualizándose en lista (realtime funciona)

#### **9.3 Connection drop**
- ✅ DevTools → Network → Offline
- ✅ Crear reserva → Falla (esperado)
- ✅ Network → Online
- ✅ Auto-reconexión Supabase
- ✅ Crear reserva → Funciona

#### **9.4 Multiple tabs**
- ✅ Abrir 3 tabs de dashboard
- ✅ Crear reserva
- ✅ Las 3 tabs notifican simultáneamente

---

## 🎯 CHECKLIST FINAL

Antes de considerar completo, verificar:

### **Funcionalidad**
- [ ] Sonido nuevo: "ding" agradable
- [ ] Sonido update: breve neutro
- [ ] Sonido cancel: descendente
- [ ] Volume control funciona (0-100%)
- [ ] Toggle on/off funciona
- [ ] Persistencia localStorage

### **UI/UX**
- [ ] Botón notificaciones en header
- [ ] Modal responsive (mobile/desktop)
- [ ] Toasts no overlap (stacking)
- [ ] Animaciones suaves
- [ ] No lag en dashboard

### **Real-Time**
- [ ] INSERT detectado <1s
- [ ] UPDATE detectado <1s
- [ ] DELETE detectado <1s
- [ ] Sin refresh manual necesario
- [ ] Connection resilience

### **Cross-Browser**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🐛 TROUBLESHOOTING

### **No escucho sonidos**
1. Verificar volumen sistema operativo no muted
2. Abrir DevTools → Console → Buscar errores
3. Verificar archivos `/sounds/*.mp3` existen
4. Probar URL directa: `http://localhost:3000/sounds/new-reservation.mp3`

### **No llegan notificaciones realtime**
1. DevTools → Console → Buscar "Realtime subscription status"
2. Debe mostrar: "✅ Successfully subscribed to reservations"
3. Si no: Verificar Supabase realtime habilitado en DB

### **Toast no aparece**
1. Verificar "Notificaciones en tiempo real" = ON
2. Console → Buscar errores de `sonner`
3. Verificar import correcto en `page.tsx`

### **Volumen no funciona**
1. Slider debe estar enabled (check switches)
2. Volume range: 0.0 - 1.0 (no 0-100)
3. Verificar `audio.volume = config.volume` en código

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Target | Medición |
|---------|--------|----------|
| **Latencia notificación** | <1s | Tiempo desde DB insert → Toast visible |
| **Audio playback** | <100ms | Tiempo desde trigger → Audio audible |
| **UI responsiveness** | <50ms | Tiempo click botón → Modal abre |
| **Memory leak** | 0 | DevTools Memory Profiler |
| **Bundle size** | +11KB | use-sound + howler.js |

---

## ✅ APROBACIÓN FINAL

Completar todos los tests arriba antes de hacer commit y push a producción.

**Testing completado por**: _________________
**Fecha**: _________________
**Status**: [ ] ✅ APROBADO | [ ] ❌ REQUIERE FIXES

---

**Siguiente paso**: Si todos los tests pasan → Commit con mensaje descriptivo y push a `main`
