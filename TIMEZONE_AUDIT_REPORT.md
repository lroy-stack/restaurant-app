# 🕐 ENIGMA RESTAURANT PLATFORM - TIMEZONE AUDIT REPORT

**Fecha**: 2025-10-01
**Sistema**: Enigma Restaurant Platform (enigma-app + qr-menu-app)
**Problema**: Desfase horario UTC vs Europe/Madrid (+2h)
**Impacto**: Comandas muestran "URGENTE" cuando fueron creadas hace minutos

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
- **Database Timezone**: `Europe/Madrid` ✅
- **Columnas problemáticas**: 23 tablas con `timestamp WITHOUT time zone` ❌
- **APIs afectadas**: 48 archivos backend usando `new Date().toISOString()` ❌
- **Frontend components**: 31+ componentes parseando timestamps ⚠️
- **Hooks críticos**: 3 hooks (useBusinessHours, useReservations, usePDFExport) ❌

### Root Cause
```typescript
// JavaScript runtime (browser/Node.js)
new Date().toISOString() → "2025-10-01T16:02:30.278Z" // UTC (-2h de Madrid)

// PostgreSQL almacena SIN timezone info
timestamp without time zone → almacena "16:02:30" (ignora Z)

// Frontend parsea como LOCAL
new Date("2025-10-01 16:02:30") → Asume 16:02 hora Madrid

// Resultado: 2 horas de diferencia
Hora real: 18:02 → DB: 16:02 → UI muestra: "hace 2 horas"
```

---

## 🗄️ DATABASE SCHEMA ANALYSIS

### Tablas Críticas (timestamp WITHOUT time zone)

#### 1. **orders** - IMPACTO DIRECTO (Comandas)
```sql
orderedAt     timestamp(3) WITHOUT time zone  -- ❌ CRÍTICO
confirmedAt   timestamp(3) WITHOUT time zone
readyAt       timestamp(3) WITHOUT time zone
servedAt      timestamp(3) WITHOUT time zone
createdAt     timestamp(3) WITHOUT time zone  -- Default CURRENT_TIMESTAMP (Madrid OK)
updatedAt     timestamp(3) WITHOUT time zone
```
**Problema**: `orderedAt` insertado por qr-menu-app vía `toISOString()` = UTC
**Impacto**: Badges "URGENTE" incorrectos, tiempos de preparación erróneos

#### 2. **reservations** - IMPACTO ALTO (Reservas)
```sql
date          timestamp(3) WITHOUT time zone  -- ❌ CRÍTICO
time          timestamp(3) WITHOUT time zone  -- ❌ CRÍTICO
createdAt     timestamp(3) WITHOUT time zone
updatedAt     timestamp(3) WITHOUT time zone
```
**Problema**: Líneas 289-290 API `/reservations/route.ts` suma +2h manual (workaround incorrecto)
**Impacto**: Reservas mostradas con 2h adelanto, slots disponibles incorrectos

#### 3. **customers** - IMPACTO MEDIO
```sql
dateOfBirth   timestamp(3) WITHOUT time zone
lastVisit     timestamp(3) WITHOUT time zone  -- Afecta analytics
consentDate   timestamp(3) WITHOUT time zone  -- GDPR tracking
createdAt     timestamp(3) WITHOUT time zone
updatedAt     timestamp(3) WITHOUT time zone
```

#### 4. **order_items** - IMPACTO MEDIO
```sql
createdAt     timestamp(3) WITHOUT time zone
updatedAt     timestamp(3) WITHOUT time zone
```

#### 5. **menu_items** & **menu_categories** - IMPACTO BAJO
```sql
createdAt     timestamp(3) WITHOUT time zone
updatedAt     timestamp(3) WITHOUT time zone
```

### Tablas Correctas (timestamp WITH time zone) ✅
```sql
business_hours.date                    timestamptz  ✅
email_logs.sent_at                     timestamptz  ✅
qr_scans.scanned_at                    timestamptz  ✅
reservation_tokens.expires             timestamptz  ✅
table_sessions.started_at              timestamptz  ✅
cookie_consents.consent_timestamp      timestamptz  ✅
legal_audit_logs.timestamp             timestamptz  ✅
```

**Total columnas afectadas**: 23 tablas × 2-5 columnas = **~60 campos problemáticos**

---

## 🔌 BACKEND APIs ANALYSIS (48 archivos)

### CRÍTICOS - Insertan timestamps incorrectos

#### `/api/orders/route.ts` (qr-menu-app) ⚠️⚠️⚠️
```typescript
// Línea 124
orderedAt: new Date().toISOString()  // ❌ UTC

// Línea 106-107 (order_items)
createdAt: new Date().toISOString()  // ❌ UTC
updatedAt: new Date().toISOString()  // ❌ UTC
```
**Impacto**: ORIGEN del problema de comandas

#### `/api/orders/[orderId]/status/route.ts` (enigma-app) ⚠️⚠️
```typescript
// Líneas 27, 33, 35, 36, 37
updatedAt: new Date().toISOString()      // ❌ UTC
confirmedAt: new Date().toISOString()    // ❌ UTC
readyAt: new Date().toISOString()        // ❌ UTC
servedAt: new Date().toISOString()       // ❌ UTC
```

#### `/api/reservations/route.ts` (enigma-app) ⚠️⚠️⚠️
```typescript
// Líneas 289-290 - WORKAROUND MANUAL INCORRECTO
const spainTimeString = `${data.date}T${data.time}:00+02:00`
const utcDate = new Date(spainTimeString)
const reservationDateTime = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000)) // ❌ Suma +2h

// Línea 440-444
consentDataProcessingTimestamp: new Date()  // ❌ Enviado sin toISOString pero DB auto-convierte
consentEmailTimestamp: new Date()           // ❌
consentMarketingTimestamp: new Date()       // ❌
updatedAt: new Date()                       // ❌
```

#### `/api/reservations/token/generate/route.ts` ⚠️
```typescript
// Líneas 68-69
expires: expirationDateTime.toISOString()  // ❌ UTC
created_at: new Date().toISOString()       // ❌ UTC
```

#### `/api/reservations/token/validate/route.ts` ⚠️
```typescript
// Líneas 50-51, 55-56
const now = new Date()
const expiryDate = new Date(tokenData.expires)
now: now.toISOString()         // ❌ UTC
expires: expiryDate.toISOString()  // ❌ UTC
```

### MEDIO IMPACTO - Comparaciones de fechas

#### `/api/reservations/[id]/route.ts`
- Líneas 270-280: Token expiration calculation (usa toISOString)

#### `/api/customers/[id]/route.ts`
- Actualizaciones `lastVisit`, `updatedAt`

#### `/api/tables/[id]/route.ts`, `/api/tables/status/route.ts`
- Timestamps de actualizaciones

#### `/api/business-hours/route.ts`
- Manejo de slots (usa comparaciones de tiempo)

### BAJO IMPACTO - Analytics & Logs
```
/api/analytics/customer-journey/route.ts
/api/analytics/compliance/route.ts
/api/analytics/operations/route.ts
/api/emails/stats/route.ts
/api/qr/analytics/route.ts
/api/system/status/route.ts
```
Usan `Date.now()` para logs pero no afectan lógica core

---

## 🎨 FRONTEND COMPONENTS ANALYSIS (31+ archivos)

### CRÍTICOS - Parsean timestamps para UI

#### `OrderPanel.tsx` ⚠️⚠️⚠️
```typescript
// Línea 130
const minutesAgo = differenceInMinutes(new Date(), new Date(order.orderedAt))
//                                      18:02 Madrid   16:02 parseado como local
// Resultado: 120 minutos ❌

// Línea 142
formatDistanceToNow(new Date(order.orderedAt), { addSuffix: true, locale: es })
// Output: "hace 2 horas" cuando debería ser "hace 6 minutos" ❌
```

#### `reservation-filters.tsx` ⚠️
```typescript
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Parsea dates para filtros
format(date, 'PPP', { locale: es })
```

#### `professional-calendar.tsx` ⚠️
```typescript
// Formateo de fechas para calendario de reservas
// Afectado si reservations.date tiene UTC issue
```

#### `customer-card.tsx` ⚠️
```typescript
import { format } from 'date-fns'
// Muestra lastVisit, dateOfBirth
format(customer.lastVisit, 'dd/MM/yyyy')
```

#### `export-modal.tsx` & PDFExport componentes ⚠️
```typescript
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
// Exports PDF con timestamps - riesgo de fechas incorrectas
```

### Listado completo componentes afectados:
```
✅ CRÍTICO (parsing directo de timestamps problemáticos):
- src/app/(admin)/dashboard/mesas/components/floor-plan-v2/OrderPanel.tsx
- src/app/(admin)/dashboard/reservaciones/components/reservation-filters.tsx
- src/app/(admin)/dashboard/reservaciones/components/professional-calendar.tsx
- src/app/(admin)/dashboard/reservaciones/components/edit-reservation-modal.tsx
- src/app/(admin)/dashboard/clientes/components/customer-card.tsx

⚠️ MEDIO (usan date-fns para formateo):
- src/components/ui/custom-calendar.tsx
- src/components/reservations/export-modal.tsx
- src/app/(admin)/dashboard/analytics/components/ui/kpi-card.tsx
- src/app/(admin)/dashboard/clientes/components/customer-filters.tsx
- src/components/forms/reservation/reservation-form.tsx
- src/components/forms/reservation/datetime-selection.backup.tsx
- src/components/reservations/DateTimeAndTableStep.tsx
- src/components/reservations/ReservationStepOne.tsx

📊 BAJO (solo formateo de UI sin cálculos):
- 18 componentes adicionales con imports de date-fns
```

---

## 🪝 HOOKS ANALYSIS

### CRÍTICOS

#### `useBusinessHours.ts` ⚠️⚠️⚠️
```typescript
// Línea 120
const selectedDate = new Date(date)  // Parsing de fecha
const dayOfWeek = selectedDate.getDay()

// Líneas 174-189 - isDateDisabled
const now = new Date()
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
// Comparaciones de fechas asumen timezone local

// Líneas 196-205 - isTimeAvailable
const lastResTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes))
// Construcción manual de Date sin timezone explícita
```

**Problema**: Cálculos de "ya no hay tiempo para reservar hoy" pueden ser +2h incorrectos
**Impacto**: Usuario no puede reservar slots que SÍ están disponibles

#### `useReservations.ts` ⚠️⚠️
```typescript
// Línea 137-138
const [date, time] = data.dateTime.split('T')
const timeOnly = time?.slice(0, 5) || '19:00'

// Envía a API sin gestión de timezone
// API hace workaround +2h (líneas 289-290 reservations/route.ts)
```

**Problema**: Depende del workaround manual en API

#### `usePDFExport.ts` ⚠️
```typescript
// Líneas 5-6
import { format, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

// Línea 86-87
const reservationDate = new Date(reservation.date)
return reservationDate >= startDate && reservationDate <= endDate

// Línea 98
return new Date(a.time).getTime() - new Date(b.time).getTime()
```

**Problema**: Exports PDF pueden filtrar reservas incorrectamente si `reservation.date` tiene UTC

### MEDIO IMPACTO
```typescript
useCustomerPreOrders.ts    // Timestamps de pre-orders
useRealtimeCustomers.ts   // lastVisit parsing
useCustomerProfile.ts     // dateOfBirth, consentDate
```

### SIN IMPACTO
```typescript
useMobileNavigation.ts
useResponsiveLayout.ts
useMediaQuery.ts
use-auth.ts
use-legal-image.ts
use-media-library.ts
useBreakpoint.ts
```

---

## 📦 DEPENDENCIES

### Instaladas
```json
{
  "date-fns": "^4.1.0",  // ✅ Instalado
  "date-fns-tz": "❌ NO INSTALADO"  // Requerido para timezone-aware parsing
}
```

### Required para solución
```bash
npm install date-fns-tz@^3.2.0
```

**Funciones clave de date-fns-tz**:
```typescript
import { utcToZonedTime, zonedTimeToUtc, format as formatTz } from 'date-fns-tz'

// Parse UTC string como Madrid time
const madridTime = utcToZonedTime(new Date(order.orderedAt), 'Europe/Madrid')

// Convert Madrid time a UTC para INSERT
const utcTime = zonedTimeToUtc('2025-10-01 18:30:00', 'Europe/Madrid')
```

---

## 🔥 CASOS ESPECÍFICOS PROBLEMÁTICOS

### 1. Comandas OrderPanel (URGENTE badge) ⚠️⚠️⚠️
**Flujo actual**:
```
qr-menu-app → POST /api/orders
  orderedAt: new Date().toISOString() → "2025-10-01T16:02:30Z" (UTC)
  ↓
PostgreSQL almacena → 2025-10-01 16:02:30 (sin tz info)
  ↓
enigma-app → GET /api/orders/by-table/[tableId]
  Retorna: { orderedAt: "2025-10-01T16:02:30.278" }
  ↓
OrderPanel.tsx:130
  const minutesAgo = differenceInMinutes(new Date(), new Date(order.orderedAt))
  // new Date() = 18:02 Madrid
  // new Date("2025-10-01T16:02:30") parsea como 16:02 LOCAL
  // Diferencia: 120 minutos ❌
  ↓
isUrgent = minutesAgo > 20 → TRUE cuando debería ser FALSE
```

**Solución requerida**: Frontend parsear explícitamente como UTC

### 2. Reservas - Workaround +2h ⚠️⚠️⚠️
**Código actual** (`/api/reservations/route.ts:289-290`):
```typescript
const spainTimeString = `${data.date}T${data.time}:00+02:00`
const utcDate = new Date(spainTimeString)
const reservationDateTime = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000)) // ❌
```

**Problema**:
- Construcción manual timestamp Spain
- Suma +2h sobre timezone offset
- Frágil ante cambios DST (horario verano/invierno)

**Solución requerida**: Usar date-fns-tz con zonedTimeToUtc

### 3. Business Hours - Validación anticipación ⚠️
**Código** (`useBusinessHours.ts:196-205`):
```typescript
const isTimeAvailable = (now: Date, lastReservationTime?: string, advanceMinutes = 30) => {
  const [hours, minutes] = lastReservationTime.split(':')
  const lastResTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes))
  const minAdvanceMs = advanceMinutes * 60 * 1000
  const minTimeForReservation = new Date(lastResTime.getTime() - minAdvanceMs)
  return now <= minTimeForReservation
}
```

**Problema**: Constructor `new Date(year, month, day, hours, minutes)` usa timezone local
**Impacto**: Si navegador en timezone diferente, cálculo incorrecto

---

## ✅ SOLUCIÓN RECOMENDADA

### Opción 1: Frontend-Only Fix (RÁPIDO)
**Pros**: No requiere migration DB, cambios mínimos
**Contras**: Frágil, workarounds se mantienen

```typescript
// OrderPanel.tsx
import { parseISO } from 'date-fns'

// Force UTC interpretation
const orderedDate = new Date(order.orderedAt + 'Z')  // Append Z si no existe
const minutesAgo = differenceInMinutes(new Date(), orderedDate)
```

### Opción 2: Backend API Normalization (MEDIO)
**Pros**: Centraliza lógica, frontend simple
**Contras**: No resuelve root cause DB

```typescript
// APIs retornan timestamps en formato timezone-aware
orderedAt: "2025-10-01T16:02:30+00:00"  // Explicit UTC offset
```

### Opción 3: Database Migration (CORRECTO, LARGO PLAZO) ⭐
**Pros**: Solución definitiva, elimina ambigüedad
**Contras**: Requiere migration, downtime, testing exhaustivo

```sql
-- Migration script
ALTER TABLE restaurante.orders
  ALTER COLUMN orderedAt TYPE timestamptz USING orderedAt AT TIME ZONE 'UTC',
  ALTER COLUMN confirmedAt TYPE timestamptz USING confirmedAt AT TIME ZONE 'UTC',
  ALTER COLUMN readyAt TYPE timestamptz USING readyAt AT TIME ZONE 'UTC',
  ALTER COLUMN servedAt TYPE timestamptz USING servedAt AT TIME ZONE 'UTC',
  ALTER COLUMN createdAt TYPE timestamptz USING createdAt AT TIME ZONE 'Europe/Madrid',
  ALTER COLUMN updatedAt TYPE timestamptz USING updatedAt AT TIME ZONE 'Europe/Madrid';

ALTER TABLE restaurante.reservations
  ALTER COLUMN date TYPE timestamptz USING date AT TIME ZONE 'Europe/Madrid',
  ALTER COLUMN time TYPE timestamptz USING time AT TIME ZONE 'Europe/Madrid',
  ALTER COLUMN createdAt TYPE timestamptz USING createdAt AT TIME ZONE 'Europe/Madrid',
  ALTER COLUMN updatedAt TYPE timestamptz USING updatedAt AT TIME ZONE 'Europe/Madrid';

-- Repeat for customers, order_items, menu_items...
```

---

## 📋 PLAN DE MIGRACIÓN POR PRIORIDAD

### FASE 1: HOT-FIX (1-2 horas) 🔥
**Objetivo**: Resolver comando URGENTE badge inmediatamente

1. **OrderPanel.tsx** - Append 'Z' force UTC
```typescript
const orderedDate = new Date(order.orderedAt.includes('Z') ? order.orderedAt : order.orderedAt + 'Z')
```

2. **Testing**: Verificar badge URGENTE desaparece en comandas recientes

### FASE 2: API Consistency (1 día) ⚠️
**Objetivo**: Normalizar formato retornado por APIs

1. **Instalar date-fns-tz**:
```bash
npm install date-fns-tz@^3.2.0
```

2. **Crear utility helper** (`src/lib/utils/timestamps.ts`):
```typescript
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

const MADRID_TZ = 'Europe/Madrid'

export const formatToMadridTime = (utcDate: Date): string => {
  const madridTime = utcToZonedTime(utcDate, MADRID_TZ)
  return madridTime.toISOString()
}

export const parseFromMadridTime = (dateString: string): Date => {
  return utcToZonedTime(new Date(dateString), MADRID_TZ)
}
```

3. **Actualizar APIs críticas**:
   - `/api/orders/by-table/[tableId]/route.ts`
   - `/api/reservations/route.ts` (eliminar workaround +2h)
   - `/api/reservations/token/validate/route.ts`

4. **Testing**: E2E tests para reservas y comandas

### FASE 3: Frontend Normalization (2 días) 📱
**Objetivo**: date-fns-tz en todos los componentes

1. **Actualizar hooks críticos**:
   - useBusinessHours.ts
   - useReservations.ts
   - usePDFExport.ts

2. **Actualizar componentes**:
   - OrderPanel.tsx (completo con date-fns-tz)
   - reservation-filters.tsx
   - customer-card.tsx
   - export-modal.tsx

3. **Testing**: Manual QA + unit tests

### FASE 4: Database Migration (1 semana planning + testing) 🗄️
**Objetivo**: Eliminar `WITHOUT time zone` definitivamente

**Pre-requisitos**:
- Backup completo DB
- Testing environment con copia data real
- Rollback plan

**Ejecución**:
1. Crear migration scripts para 23 tablas afectadas
2. Dry-run en staging environment
3. Verificar NO breaking changes en queries
4. Ejecutar migration en producción (ventana mantenimiento)
5. Verificar data integrity post-migration

**Tablas orden prioridad**:
1. orders (CRÍTICO)
2. reservations (CRÍTICO)
3. customers (ALTO)
4. order_items (MEDIO)
5. menu_items/categories (BAJO)
6. Resto (BAJO)

---

## 🧪 TESTING CHECKLIST

### Comandas (OrderPanel)
- [ ] Badge URGENTE solo si >20min reales
- [ ] Badge WARNING 10-20min
- [ ] formatDistanceToNow preciso
- [ ] Auto-refresh 5s mantiene estado correcto

### Reservas
- [ ] Slots disponibles correctos según anticipación
- [ ] Fecha/hora mostrada = fecha/hora seleccionada
- [ ] Email confirmation con hora correcta
- [ ] PDF export fechas precisas

### Business Hours
- [ ] "Ya no hay tiempo para reservar" preciso
- [ ] Calendario disabled days correctos
- [ ] Dual shift (lunch/dinner) timing correcto

### Analytics
- [ ] Customer lastVisit preciso
- [ ] Reports date ranges correctos
- [ ] GDPR timestamps audit trail preciso

---

## 📞 CONTACTO & RECURSOS

**Responsable técnico**: Claude (AI Development System)
**Stack**: Next.js 15 + Supabase PostgreSQL + date-fns
**Timezone DB**: Europe/Madrid (CEST/CET)
**Docs**:
- date-fns-tz: https://github.com/marnusw/date-fns-tz
- PostgreSQL timestamptz: https://www.postgresql.org/docs/current/datatype-datetime.html

---

**Generado**: 2025-10-01 18:15 CEST
**Versión**: 1.0.0
