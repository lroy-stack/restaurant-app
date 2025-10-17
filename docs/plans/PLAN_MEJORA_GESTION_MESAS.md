# Plan de Mejora: Gestión de Mesas Floor-Plan

**Fecha**: 2025-10-12
**Objetivo**: Mejorar la gestión rápida de mesas para walk-ins y reservas desde `/dashboard/mesas?tab=floor-plan`

---

## 🎯 Problema Actual

### Limitaciones Identificadas

1. **✅ Funciona correctamente**:
   - Identifica reservas CONFIRMED
   - Asigna correctamente a las mesas
   - Muestra información de reservas

2. **❌ Problemas críticos**:
   - Botón "Cambiar Estado" deshabilitado (línea 291 Modal.tsx)
   - No hay quick actions para walk-ins
   - Imposible marcar mesas como ocupadas rápidamente
   - No se pueden cambiar estados de reserva (SEATED, NO_SHOW, COMPLETED)
   - Trabajador necesita **muchos clics** para operaciones simples

### Contexto del Negocio
- **Restaurante vive de walk-ins** (gente que llega sin reserva)
- Necesitan ocupar/desocupar mesas en **segundos**
- Personal necesita gestionar estados de reservas desde el floor-plan
- Experiencia actual: **lenta y frustrante** para operación diaria

---

## 💡 Solución Propuesta

### 1. Quick Actions en la Mesa (SIN abrir modal)

**Interacción directa en el canvas**:

```
Click derecho / Long-press en mesa →
┌─────────────────────────┐
│ Mesa S7 (4 personas)    │
│ ────────────────────── │
│ 🟢 Ocupar Walk-in       │ ← 1 clic
│ 📋 Ver Detalles         │
│ 🔄 Refrescar            │
└─────────────────────────┘

Si está ocupada:
┌─────────────────────────┐
│ Mesa S7 (Ocupada)       │
│ ────────────────────── │
│ ✅ Liberar Mesa         │ ← 1 clic
│ ⏱️ Extender +30min      │
│ 📋 Ver Detalles         │
└─────────────────────────┘
```

**Beneficio**: Gestión ultra-rápida sin abrir modal completo

---

### 2. Modal Rediseñado - Secciones por Prioridad

#### A) Walk-in Quick Actions (Arriba, destacado)

```
┌────────────────────────────────────┐
│ 🟢 MESA DISPONIBLE - S7            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                    │
│  [🚀 Ocupar Walk-in] [⏱️ +2h]     │ ← 1-2 clics máximo
│                                    │
│  Tiempo estimado: 2h               │
└────────────────────────────────────┘
```

Si está ocupada:
```
┌────────────────────────────────────┐
│ 🔴 MESA OCUPADA - S7               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                    │
│  Ocupada desde: 20:30 (45 min)     │
│                                    │
│  [✅ Liberar Mesa]                 │ ← 1 clic
│  [⏱️ Extender +30min]              │
│                                    │
└────────────────────────────────────┘
```

---

#### B) Gestión de Reserva (Si tiene reserva CONFIRMED)

```
┌────────────────────────────────────┐
│ 📅 RESERVA CONFIRMADA              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                    │
│  Juan Pérez - 4 personas           │
│  Hora: 20:30                       │
│  📧 juan@email.com                 │
│  📱 +34 600 123 456                │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Estado de la Reserva:        │ │
│  │                              │ │
│  │ [✅ Sentar]  Status: SEATED  │ │ ← 1 clic
│  │ [❌ No Show] Status: NO_SHOW │ │
│  │ [🚫 Cancelar] Status: CANCEL │ │
│  └──────────────────────────────┘ │
│                                    │
│  ⚠️ Si tiene pre-pedido:          │
│  [📋 Ver Pre-pedido]              │
└────────────────────────────────────┘
```

**Flujo completo de reserva**:
```
PENDING → [Sentar] → SEATED → [Completar] → COMPLETED → Mesa liberada
                  ↓
              [No Show] → NO_SHOW → Mesa liberada
```

---

#### C) Cambio Manual de Estado (Avanzado)

```
┌────────────────────────────────────┐
│ ⚙️ GESTIÓN AVANZADA                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                    │
│  Estado actual: Ocupada            │
│                                    │
│  Cambiar a:                        │
│  ○ Disponible                      │
│  ○ Reservada                       │
│  ● Ocupada                         │
│  ○ Mantenimiento                   │
│                                    │
│  Notas (opcional):                 │
│  ┌──────────────────────────────┐ │
│  │ Ej: Mesa dañada, reparación  │ │
│  └──────────────────────────────┘ │
│                                    │
│  [💾 Guardar Cambios]             │
└────────────────────────────────────┘
```

---

### 3. Indicadores Visuales Mejorados en el Canvas

**Colores y estados en el floor-plan**:

```
🟢 Verde      → Disponible
🔵 Azul       → Reservada (CONFIRMED)
🔴 Rojo       → Ocupada (walk-in o SEATED)
🟡 Amarillo   → Mantenimiento
⚪ Gris       → Inactiva
```

**Badges adicionales**:
```
┌──────────┐
│   S7     │  🍽️ ← Tiene pedidos activos
│  4 pax   │  ⏱️ ← Tiempo transcurrido
└──────────┘  📋 ← Tiene pre-pedido
```

---

## 🔧 Implementación Técnica

### Nuevos API Endpoints

#### 1. Quick Actions Walk-in

```typescript
// POST /api/tables/[id]/quick-occupy
{
  estimatedDuration: 120, // minutos
  notes?: string
}
Response: { success: true, status: 'occupied' }

// POST /api/tables/[id]/release
Response: { success: true, status: 'available' }
```

#### 2. Gestión Estados de Reserva

```typescript
// PATCH /api/reservations/[id]/seat
Response: { success: true, status: 'SEATED' }

// PATCH /api/reservations/[id]/no-show
Response: { success: true, status: 'NO_SHOW', tableReleased: true }

// PATCH /api/reservations/[id]/complete
Response: { success: true, status: 'COMPLETED', tableReleased: true }
```

#### 3. Estado Manual de Mesa

```typescript
// PATCH /api/tables/[id]/status
{
  status: 'available' | 'occupied' | 'maintenance',
  notes?: string,
  estimatedDuration?: number
}
Response: { success: true, newStatus: string }
```

---

### Actualización de Base de Datos

**Tabla `restaurante.tables`** - Agregar campos:

```sql
ALTER TABLE restaurante.tables
ADD COLUMN occupied_since TIMESTAMP,
ADD COLUMN estimated_available_at TIMESTAMP,
ADD COLUMN current_walk_in_id TEXT,
ADD COLUMN status_notes TEXT;
```

**Nueva tabla `restaurante.walk_ins`** (opcional):

```sql
CREATE TABLE restaurante.walk_ins (
  id TEXT PRIMARY KEY,
  table_id TEXT REFERENCES restaurante.tables(id),
  party_size INTEGER NOT NULL,
  seated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  estimated_duration INTEGER, -- minutos
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Modificaciones de Componentes

**Archivos a modificar**:

1. **`src/app/(admin)/dashboard/mesas/components/floor-plan-v2/Modal.tsx`**
   - ✅ Habilitar botón "Cambiar Estado"
   - ✅ Agregar sección Walk-in Quick Actions
   - ✅ Agregar sección Gestión de Reserva
   - ✅ Mejorar UX con secciones colapsables

2. **`src/app/(admin)/dashboard/mesas/components/floor-plan-v2/Mesa.tsx`**
   - ✅ Agregar context menu (click derecho)
   - ✅ Agregar badges visuales (pedidos, tiempo)
   - ✅ Mejorar colores por estado

3. **`src/stores/useTableStore.ts`**
   - ✅ Agregar métodos: `quickOccupy()`, `releaseTable()`
   - ✅ Agregar estado: `occupiedSince`, `estimatedAvailable`

4. **Nuevos archivos**:
   - `src/app/api/tables/[id]/quick-occupy/route.ts`
   - `src/app/api/tables/[id]/release/route.ts`
   - `src/app/api/reservations/[id]/seat/route.ts`
   - `src/app/api/reservations/[id]/no-show/route.ts`
   - `src/app/api/reservations/[id]/complete/route.ts`

---

## 📊 Priorización de Implementación

### Fase 1: Walk-ins (Crítico) 🔥
**Tiempo estimado**: 2-3 horas

- ✅ Quick toggle ocupada/disponible (context menu)
- ✅ API endpoints: `/quick-occupy` y `/release`
- ✅ Actualizar colores visuales en canvas
- ✅ Agregar sección Walk-in en Modal

**Impacto**: **ALTO** - Resuelve el 80% del problema diario

---

### Fase 2: Gestión Estados Reserva (Importante) 📋
**Tiempo estimado**: 2-3 horas

- ✅ Botones: Sentar, No Show, Completar
- ✅ API endpoints para cambios de estado
- ✅ Actualizar tabla cuando cambia estado
- ✅ Notificaciones toast

**Impacto**: **MEDIO** - Cierra el ciclo completo de gestión

---

### Fase 3: Mejoras UX Avanzadas (Nice-to-have) ⭐
**Tiempo estimado**: 1-2 horas

- ✅ Badges visuales (pedidos, tiempo)
- ✅ Contador de tiempo en mesa ocupada
- ✅ Animaciones de transición
- ✅ Sonido de confirmación

**Impacto**: **BAJO** - Refinamiento de experiencia

---

## 🎨 Wireframes de Interacción

### Flujo Walk-in (2 clics)

```
1. Click derecho en mesa verde
   ↓
2. Click en "Ocupar Walk-in"
   ↓
3. ✅ Mesa roja (ocupada)
```

### Flujo Reserva → Sentada → Completada (3 clics)

```
1. Click en mesa azul (reservada)
   ↓
2. Click en "Sentar" botón
   ↓
3. Mesa cambia a roja (SEATED)
   ↓
... cliente come ...
   ↓
4. Click en "Completar"
   ↓
5. ✅ Mesa verde (disponible)
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear API `/api/tables/[id]/quick-occupy`
- [ ] Crear API `/api/tables/[id]/release`
- [ ] Crear API `/api/reservations/[id]/seat`
- [ ] Crear API `/api/reservations/[id]/no-show`
- [ ] Crear API `/api/reservations/[id]/complete`
- [ ] Actualizar schema DB (campos ocupación)
- [ ] Agregar validaciones de estado

### Frontend
- [ ] Habilitar botón "Cambiar Estado" en Modal
- [ ] Agregar sección Walk-in Quick Actions
- [ ] Agregar botones gestión reserva
- [ ] Implementar context menu en Mesa
- [ ] Actualizar colores visuales por estado
- [ ] Agregar badges visuales (opcional)
- [ ] Testing en móvil y tablet

### Testing
- [ ] Test: Ocupar mesa walk-in
- [ ] Test: Liberar mesa walk-in
- [ ] Test: Sentar reserva CONFIRMED
- [ ] Test: Marcar No Show
- [ ] Test: Completar reserva
- [ ] Test: Cambio manual de estado
- [ ] Test: Sincronización tiempo real

---

## 🚀 Resultado Esperado

**Antes**:
- ❌ 5-7 clics para ocupar mesa
- ❌ No se puede cambiar estado reserva
- ❌ Confusión sobre estados

**Después**:
- ✅ **1-2 clics** para ocupar/liberar mesa
- ✅ Gestión completa de reservas desde floor-plan
- ✅ Estados visuales claros e intuitivos
- ✅ Personal del restaurante trabaja **3x más rápido**

---

## 📝 Notas Adicionales

- **Compatibilidad móvil**: Context menu debe funcionar con long-press
- **Tiempo real**: Usar Supabase realtime para sincronizar cambios
- **Permisos**: Solo staff/manager puede cambiar estados
- **Historial**: Registrar todos los cambios en tabla `table_status_log`
- **Rollback**: Si API falla, restaurar estado visual anterior

---

**Documento generado**: 2025-10-12
**Versión**: 1.0
**Autor**: Claude Code

