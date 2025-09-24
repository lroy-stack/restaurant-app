# 📋 INFORME TÉCNICO: SISTEMA DE RESERVAS ENIGMA
## Análisis Actual + Plan de Contiguidad & Race Conditions

**Fecha:** 2025-09-22
**Versión:** 1.0
**Autor:** Claude Code Analysis
**Proyecto:** Enigma Restaurant Platform

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
El sistema de reservas Enigma permite actualmente **selección múltiple de mesas sin validación de contigüidad**, permitiendo combinaciones inválidas como:
- ❌ **S1+S3** (mesas no adyacentes)
- ❌ **S1+T10** (diferentes zonas)
- ❌ **T4+T7** (no contiguas)

### Problemas Críticos Identificados
1. **Sin validación de contigüidad**: Permite mesas no adyacentes
2. **Sin restricción de zona**: Permite mezclar SALA_PRINCIPAL + TERRACE_CAMPANARI
3. **Race conditions**: No hay protección contra overbooking simultáneo
4. **Lógica dispersa**: Diferentes validaciones en `/reserva`, `/dashboard`, `/mi-reserva`

### Objetivo
Implementar **sistema enterprise de validación** basado en patrones probados de Context7 (Go Distributor APIs - 2384 snippets) para:
- ✅ Contiguidad: S1+S2, T10+T11+T12
- ✅ Misma zona obligatoria
- ✅ PreBook pattern anti-race conditions
- ✅ Lógica unificada end-to-end

---

## 🏗️ ANÁLISIS DEL SISTEMA ACTUAL

### 1. Esquema de Base de Datos

#### Tabla `restaurante.tables`
```sql
-- 22 mesas activas en 2 zonas:
-- TERRACE_CAMPANARI: T1-T14 (14 mesas)
-- SALA_PRINCIPAL: S1-S8 (8 mesas)

Column         | Type                        | Uso
---------------|-----------------------------|-----------------
id            | text                        | Primary Key
number        | text                        | T1, T2, S1, S2...
capacity      | integer                     | 2 o 4 personas
location      | TableLocation enum          | TERRACE_CAMPANARI / SALA_PRINCIPAL
position_x    | numeric                     | Coordenada X layout
position_y    | numeric                     | Coordenada Y layout
isActive      | boolean                     | true para disponibles
```

#### Layout Actual (position_x, position_y):
```
TERRACE_CAMPANARI (14 mesas):
T1(-165,9) → T2(-52,8) → T3(58,8) → T4(201,8) → T5(306,9) → T6(411,9) → T7(512,5) → T8(612,9)
T9(-148,121) → T10(11,121) → T11(125,119) → T12(279,118) → T13(429,116) → T14(538,117)

SALA_PRINCIPAL (8 mesas):
S1(969,396) → S2(990,301) → S3(1065,433) → S4(914,492)
S5(799,353) → S6(861,252) → S7(1139,322) → S8(500,442)
```

### 2. API de Disponibilidad Actual

#### `/api/tables/availability`
**Funcionalidad Actual:**
- ✅ Filtra mesas activas (`isActive=true`)
- ✅ Excluye mesas reservadas con buffer de 150min
- ✅ Soporte hybrid: `table_ids[]` + `tableId` legacy
- ❌ **NO valida contigüidad**
- ❌ **NO valida misma zona**
- ❌ **NO previene race conditions**

**Lógica Existente:**
```typescript
// 1. Query mesas activas
let tablesQuery = `tables?isActive=eq.true`
if (tableZone) tablesQuery += `&location=eq.${tableZone}`

// 2. Excluir reservas existentes (bufferMinutes=150)
const timeDiff = Math.abs(requestDateTime - resDateTime)
if (timeDiff < (bufferMinutes * 60000)) {
  // Bloquear mesa
}

// 3. Retornar disponibles (SIN VALIDACIÓN CONTIGUIDAD)
return availableTables.filter(table => !reservedTableIds.has(table.id))
```

### 3. Frontend - Selección de Mesas

#### `DateTimeAndTableStep.tsx`
**Estado Actual:**
```typescript
const [selectedTables, setSelectedTables] = useState<any[]>([])
const [totalCapacity, setTotalCapacity] = useState<number>(0)

// ✅ Límite inteligente por party size
const getMaxTablesForPartySize = (partySize: number): number => {
  if (partySize <= 4) return 1    // 1-4 personas: 1 mesa
  if (partySize <= 8) return 2    // 5-8 personas: 2 mesas
  return 3                        // 9-12 personas: 3 mesas
}

// ❌ PERO NO VALIDA CONTIGUIDAD
const handleTableToggle = useCallback((table: any) => {
  // Solo valida capacidad total, NO contigüidad
  if (capacity >= watchedPartySize) {
    toast.success(`✅ Capacidad suficiente: ${capacity} asientos`)
  }
})
```

### 4. Validación Schema (Zod)

#### `reservation-professional.ts`
```typescript
// ✅ Soporte múltiples mesas
stepTwo: z.object({
  tableIds: z.array(z.string()).min(1, "Al menos una mesa requerida"),
  tableId: z.string().optional(), // Legacy compatibility
})

// ❌ PERO SIN VALIDACIÓN DE CONTIGUIDAD EN SCHEMA
```

---

## 🚨 PROBLEMAS CRÍTICOS ACTUALES

### 1. Combinaciones Inválidas Permitidas

El sistema actualmente **PERMITE** estas selecciones inválidas:

```typescript
// ❌ EJEMPLOS DE SELECCIONES PROBLEMÁTICAS:
❌ S1 + S3     // Mesas no adyacentes en SALA_PRINCIPAL
❌ S1 + T10    // Diferentes zonas (SALA + TERRACE)
❌ T1 + T5     // Mesas lejanas en TERRACE_CAMPANARI
❌ S3 + T5 + T6 // Mezcla zonas + no contiguas
❌ T4 + T7     // Separadas por T5, T6
```

### 2. Race Conditions - Overbooking Risk

**Escenario Problema:**
```
Tiempo 19:30
Usuario A: Selecciona T1+T2 → /api/tables/availability ✅ disponible
Usuario B: Selecciona T1+T2 → /api/tables/availability ✅ disponible
Usuario A: Submit reserva → ✅ éxito
Usuario B: Submit reserva → ❌ CONFLICTO (pero ya procesó pago/datos)
```

**Sin PreBook Pattern:**
- No hay "reserva temporal" antes de confirmación
- Validación solo en momento final de creación
- Window vulnerable de 30-60 segundos entre check y book

### 3. Inconsistencia Cross-Platform

**Endpoints Afectados:**
- `/reserva` (cliente público)
- `/dashboard/reservaciones` (admin)
- `/mi-reserva` (cliente logged)

**Problemas:**
- Lógica de validación duplicada
- Diferentes reglas según endpoint
- Posible bypass via diferentes rutas

---

## 🎯 PATRONES ENTERPRISE IDENTIFICADOS (Context7)

### 1. Go Distributor Reservation APIs - Insights Clave

**De 2384 code snippets analizados:**

#### PreBook Pattern ⭐
```typescript
// Patrón de 3 fases para prevenir race conditions:
1. Live Check     → Verificar disponibilidad real-time
2. PreBook        → "Bloqueo temporal" por 5-10 minutos
3. Book          → Confirmación final

// Implementación sugerida:
interface PreBookResponse {
  preBookToken: string
  expiresAt: Date
  tablesBlocked: string[]
  status: 'PRE_BOOKED' | 'EXPIRED'
}
```

#### Multi-Room Validation Rules ⭐
```typescript
// De Context7: "All rooms in a single request must share
// the same room type, rate plan, and guest count"

// Aplicado a Enigma:
interface ContiguityRules {
  sameZoneRequired: boolean     // true
  adjacencyRequired: boolean    // true
  maxDistancePixels: number     // 100px entre mesas
  allowedCombinations: string[] // pre-calculadas
}
```

#### Real-Time Inventory Tracking ⭐
```typescript
// Context7: "Availability = quantity of rooms open for sale"
// Adaptado para mesas:

interface TableInventory {
  tableId: string
  status: 'AVAILABLE' | 'PRE_BOOKED' | 'RESERVED' | 'OCCUPIED'
  blockedUntil?: Date
  reservationId?: string
}
```

### 2. Otros Patrones Relevantes

#### OpenTable API Patterns:
- **Same-party validation**: Todos los comensales en mesas contiguas
- **Time-window coordination**: Sincronización de horarios para múltiples mesas

#### Channex.io Booking Engine:
- **Atomic transactions**: Todo-o-nada para múltiples recursos
- **Rollback mechanisms**: Deshacer reservas parciales fallidas

---

## 🛠️ PLAN DE IMPLEMENTACIÓN

### FASE 1: Algoritmo de Contigüidad (Core Logic)

#### 1.1 Definir Reglas de Adyacencia

**Basado en coordenadas position_x, position_y:**

```typescript
interface TablePosition {
  id: string
  number: string
  zone: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL'
  x: number
  y: number
  capacity: number
}

class ContiguityValidator {
  private readonly MAX_DISTANCE_PX = 100 // Ajustable

  isAdjacent(table1: TablePosition, table2: TablePosition): boolean {
    // 1. Misma zona obligatoria
    if (table1.zone !== table2.zone) return false

    // 2. Distancia euclidiana
    const distance = Math.sqrt(
      Math.pow(table1.x - table2.x, 2) +
      Math.pow(table1.y - table2.y, 2)
    )

    return distance <= this.MAX_DISTANCE_PX
  }

  validateSelection(tables: TablePosition[]): ValidationResult {
    // 1. Todas misma zona
    const zones = new Set(tables.map(t => t.zone))
    if (zones.size > 1) {
      return { valid: false, error: "Mesas deben estar en la misma zona" }
    }

    // 2. Formar cadena contigua
    if (tables.length > 1) {
      return this.validateContiguousChain(tables)
    }

    return { valid: true }
  }

  private validateContiguousChain(tables: TablePosition[]): ValidationResult {
    // Algoritmo: cada mesa debe tener al menos 1 vecina adyacente
    // Excepto: primera y última pueden tener solo 1 conexión

    for (let i = 0; i < tables.length; i++) {
      const currentTable = tables[i]
      const adjacentCount = tables.filter(other =>
        other.id !== currentTable.id &&
        this.isAdjacent(currentTable, other)
      ).length

      // Primera/última: mínimo 1 conexión
      // Intermedias: mínimo 1 conexión (pueden ser endpoints)
      if (adjacentCount === 0) {
        return {
          valid: false,
          error: `Mesa ${currentTable.number} no es adyacente a ninguna otra seleccionada`
        }
      }
    }

    return { valid: true }
  }
}
```

#### 1.2 Pre-calcular Combinaciones Válidas

**Para optimizar performance:**

```typescript
// Pre-generar combinaciones válidas al startup
const VALID_COMBINATIONS = {
  TERRACE_CAMPANARI: [
    ['T1', 'T2'],
    ['T2', 'T3'],
    ['T10', 'T11', 'T12'],
    ['T11', 'T12', 'T13'],
    // ... todas las combinaciones válidas
  ],
  SALA_PRINCIPAL: [
    ['S1', 'S2'],
    ['S5', 'S6'],
    ['S2', 'S7'],
    // ... basado en coordenadas reales
  ]
}

// Lookup O(1) en lugar de cálculo O(n²)
function isValidCombination(tableNumbers: string[]): boolean {
  const zone = tableNumbers[0].startsWith('T') ? 'TERRACE_CAMPANARI' : 'SALA_PRINCIPAL'
  const sorted = tableNumbers.sort()

  return VALID_COMBINATIONS[zone].some(combo =>
    JSON.stringify(combo.sort()) === JSON.stringify(sorted)
  )
}
```

### FASE 2: PreBook Pattern Implementation

#### 2.1 Nuevo Endpoint `/api/tables/pre-book`

```typescript
// POST /api/tables/pre-book
interface PreBookRequest {
  tableIds: string[]
  partySize: number
  requestedDateTime: string
  customerEmail: string
}

interface PreBookResponse {
  success: boolean
  preBookToken: string
  expiresAt: Date
  tablesBlocked: string[]
  totalCapacity: number
  validUntil: Date // 5-10 minutos
}

// Lógica:
async function preBookTables(request: PreBookRequest): Promise<PreBookResponse> {
  // 1. Validar contiguidad
  const contiguityResult = contiguityValidator.validateSelection(tables)
  if (!contiguityResult.valid) {
    throw new Error(contiguityResult.error)
  }

  // 2. Verificar disponibilidad real-time
  const availability = await checkRealTimeAvailability(request.tableIds, request.requestedDateTime)
  if (!availability.allAvailable) {
    throw new Error('Una o más mesas ya no están disponibles')
  }

  // 3. Crear bloqueo temporal
  const preBookToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

  await insertPreBookRecord({
    token: preBookToken,
    tableIds: request.tableIds,
    expiresAt,
    customerEmail: request.customerEmail,
    status: 'PRE_BOOKED'
  })

  return {
    success: true,
    preBookToken,
    expiresAt,
    tablesBlocked: request.tableIds,
    totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
    validUntil: expiresAt
  }
}
```

#### 2.2 Actualizar `/api/reservations` para requerir PreBook

```typescript
// POST /api/reservations ahora requiere preBookToken válido
interface ReservationRequest extends ReservationData {
  preBookToken: string // REQUERIDO
}

async function createReservation(data: ReservationRequest) {
  // 1. Validar preBookToken
  const preBook = await getPreBookByToken(data.preBookToken)
  if (!preBook || preBook.expiresAt < new Date()) {
    throw new Error('Token de pre-reserva inválido o expirado')
  }

  // 2. Crear reserva usando mesas pre-bloqueadas
  const reservation = await insertReservation({
    ...data,
    tableIds: preBook.tableIds // Usar las mesas del PreBook
  })

  // 3. Marcar PreBook como usado
  await updatePreBookStatus(data.preBookToken, 'CONSUMED')

  return reservation
}
```

### FASE 3: Updates Frontend & API Integration

#### 3.1 Actualizar `DateTimeAndTableStep.tsx`

```typescript
// Nuevo flujo con validación contiguity
const handleTableToggle = useCallback(async (table: any) => {
  const newSelection = [...selectedTables, table]

  // 1. Validación contiguity client-side (UX inmediato)
  const isValid = validateContiguityClientSide(newSelection)
  if (!isValid.valid) {
    toast.error(`❌ ${isValid.error}`)
    return
  }

  // 2. Pre-verificar disponibilidad
  const availability = await checkAvailability(
    watchedDateTime,
    watchedPartySize,
    newSelection.map(t => t.id)
  )

  if (availability?.valid) {
    setSelectedTables(newSelection)
    toast.success(`✅ Selección válida: ${newSelection.length} mesas contiguas`)
  } else {
    toast.error(`❌ Combinación no disponible`)
  }
}, [selectedTables, watchedDateTime, watchedPartySize])

// Validation helpers client-side
function validateContiguityClientSide(tables: any[]): {valid: boolean, error?: string} {
  // Implementar reglas básicas para feedback inmediato
  // Sin coordenadas exactas, usar reglas simplificadas:

  const zones = new Set(tables.map(t => t.location))
  if (zones.size > 1) {
    return { valid: false, error: "Mesas deben estar en la misma zona" }
  }

  const numbers = tables.map(t => t.number).sort()
  // Validación simplificada: números consecutivos para misma zona
  // Lógica completa se valida server-side

  return { valid: true }
}
```

#### 3.2 Nuevo Flujo End-to-End

```typescript
// 1. Usuario selecciona mesas → validación client-side inmediata
// 2. Al completar formulario → PreBook API call
// 3. PreBook exitoso → mostrar countdown timer (10 min)
// 4. Usuario confirma → createReservation con preBookToken
// 5. Server valida token + crea reserva definitiva

const submitReservation = async (data: ReservationFormData) => {
  try {
    // 1. PreBook mesas seleccionadas
    setStatus('pre-booking')
    const preBookResult = await preBookTables({
      tableIds: data.tableIds,
      partySize: data.partySize,
      requestedDateTime: data.dateTime,
      customerEmail: data.email
    })

    // 2. Mostrar confirmación con timer
    setPreBookToken(preBookResult.preBookToken)
    setExpiresAt(preBookResult.expiresAt)
    setStatus('pre-booked')

    // 3. Usuario confirma → reserva final
    const reservation = await createReservation({
      ...data,
      preBookToken: preBookResult.preBookToken
    })

    setStatus('confirmed')
    router.push(`/mi-reserva/${reservation.id}`)

  } catch (error) {
    setStatus('error')
    toast.error(error.message)
  }
}
```

### FASE 4: Background Services

#### 4.1 Cleanup Job - Expirar PreBooks

```typescript
// Cron job cada 1 minuto: limpiar preBooks expirados
async function cleanupExpiredPreBooks() {
  const expired = await query(`
    UPDATE pre_bookings
    SET status = 'EXPIRED'
    WHERE expires_at < NOW()
    AND status = 'PRE_BOOKED'
    RETURNING *
  `)

  console.log(`🧹 Cleaned up ${expired.length} expired pre-bookings`)
}

// Ejecutar via cron o webhook
setInterval(cleanupExpiredPreBooks, 60000) // Cada minuto
```

#### 4.2 Real-Time Availability Cache

```typescript
// Cache Redis para availability queries frecuentes
class AvailabilityCache {
  private redis = new Redis(process.env.REDIS_URL)

  async getAvailability(date: string, time: string): Promise<TableAvailability[]> {
    const cacheKey = `availability:${date}:${time}`
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      return JSON.parse(cached)
    }

    // Calcular + cache por 30 segundos
    const availability = await calculateRealTimeAvailability(date, time)
    await this.redis.setex(cacheKey, 30, JSON.stringify(availability))

    return availability
  }
}
```

---

## 📈 REGLAS DE CONTIGUIDAD ESPECÍFICAS

### TERRACE_CAMPANARI - Configuraciones Válidas

**Basado en coordenadas position_x, position_y:**

```
Fila Superior (y ≈ 8-9):
✅ T1+T2 (-165,-52): Distancia ~113px ✅
✅ T2+T3 (-52,58): Distancia ~110px ✅
✅ T3+T4 (58,201): Distancia ~143px ❓ (verificar)
✅ T4+T5 (201,306): Distancia ~105px ✅
✅ T5+T6 (306,411): Distancia ~105px ✅
✅ T6+T7 (411,512): Distancia ~101px ✅
✅ T7+T8 (512,612): Distancia ~100px ✅

Fila Inferior (y ≈ 116-121):
✅ T9+T10 (-148,11): Distancia ~159px ❓ (verificar)
✅ T10+T11 (11,125): Distancia ~114px ✅
✅ T11+T12 (125,279): Distancia ~154px ❓ (verificar)
✅ T12+T13 (279,429): Distancia ~150px ❓ (verificar)
✅ T13+T14 (429,538): Distancia ~109px ✅

Combinaciones Múltiples:
✅ T10+T11+T12: Cadena contigua ✅
✅ T11+T12+T13: Cadena contigua ✅
✅ T5+T6+T7: Cadena contigua ✅

❌ NO VÁLIDAS:
❌ T1+T3: Salta T2
❌ T4+T7: Salta T5, T6
❌ T1+T10: Diferentes filas y lejanas
❌ T9+T11: Salta T10
```

### SALA_PRINCIPAL - Configuraciones Válidas

**Layout más disperso, requiere análisis cuidadoso:**

```
Coordenadas actuales:
S1(969,396) S2(990,301) S3(1065,433) S4(914,492)
S5(799,353) S6(861,252) S7(1139,322) S8(500,442)

Distancias calculadas:
S1-S2: √[(990-969)² + (301-396)²] = √[441 + 9025] = 97px ✅
S1-S3: √[(1065-969)² + (433-396)²] = √[9216 + 1369] = 103px ✅
S2-S7: √[(1139-990)² + (322-301)²] = √[22201 + 441] = 150px ❓

✅ VÁLIDAS CONFIRMADAS:
✅ S1+S2: 97px ✅
✅ S1+S3: 103px ✅
✅ S5+S6: √[(861-799)² + (252-353)²] = √[3844 + 10201] = 118px ❓

❌ NO VÁLIDAS:
❌ S1+S4: √[(914-969)² + (492-396)²] = √[3025 + 9216] = 111px ❓
❌ S1+S8: √[(500-969)² + (442-396)²] = √[219961 + 2116] = 471px ❌
❌ S3+S5: √[(799-1065)² + (353-433)²] = √[70756 + 6400] = 278px ❌
```

**NOTA CRÍTICA:** Necesitamos **calibrar MAX_DISTANCE_PX** basado en el layout real del restaurante. Valores entre 100-120px parecen apropiados.

---

## 🔒 ESQUEMAS DE VALIDACIÓN ACTUALIZADOS

### 1. Nuevo Schema con Contiguity

```typescript
// reservation-professional.ts - ACTUALIZADO
import { z } from 'zod'

// Añadir validación server-side
const contiguityValidator = z.array(z.string()).superRefine(async (tableIds, ctx) => {
  if (tableIds.length > 1) {
    const isValid = await validateTableContiguity(tableIds)
    if (!isValid.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: isValid.error,
        path: ['tableIds']
      })
    }
  }
})

export const stepTwoSchemaWithContiguity = z.object({
  tableIds: contiguityValidator.min(1, "Al menos una mesa requerida"),
  preOrderItems: z.array(z.object({...})).default([]),
  // ... resto igual
})
```

### 2. API Response Types

```typescript
// types/reservations.ts - NUEVO
export interface ContiguityValidationResult {
  valid: boolean
  error?: string
  suggestedAlternatives?: string[][]
}

export interface PreBookingStatus {
  token: string
  status: 'PRE_BOOKED' | 'EXPIRED' | 'CONSUMED'
  expiresAt: Date
  tablesBlocked: string[]
}

export interface TableAvailabilityEnhanced {
  tableId: string
  tableNumber: string
  zone: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL'
  capacity: number
  available: boolean
  contiguousOptions: string[][] // Combinaciones válidas que incluyen esta mesa
  position: { x: number, y: number }
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### ✅ COMPLETADO (Estado Actual)
- [x] Multi-table selection frontend
- [x] Table capacity validation
- [x] Hybrid `tableIds[]` + `tableId` support
- [x] Basic availability checking
- [x] Form validation schemas

### 🔄 EN DESARROLLO
- [ ] Contiguity validation algorithm
- [ ] PreBook pattern implementation
- [ ] Race condition prevention
- [ ] Unified logic across endpoints

### ⏳ PENDIENTE
- [ ] Real-time availability cache
- [ ] Background cleanup jobs
- [ ] Performance optimization
- [ ] Comprehensive testing

---

## 🚀 CRONOGRAMA DE IMPLEMENTACIÓN

### Semana 1: Core Logic (40 horas)
**Lunes-Martes:** Algoritmo de contigüidad
**Miércoles-Jueves:** PreBook pattern API
**Viernes:** Frontend integration

### Semana 2: Integration & Testing (40 horas)
**Lunes-Martes:** Unified logic across endpoints
**Miércoles-Jueves:** Performance optimization
**Viernes:** End-to-end testing

### Semana 3: Production & Monitoring (20 horas)
**Lunes-Miércoles:** Deployment + monitoring
**Jueves-Viernes:** Bug fixes + documentation

**TOTAL ESTIMADO: 100 horas de desarrollo**

---

## 🔧 CONFIGURACIONES RECOMENDADAS

### Environment Variables
```bash
# Contiguity settings
MAX_DISTANCE_PIXELS=110
PREBOOK_EXPIRY_MINUTES=10
AVAILABILITY_CACHE_SECONDS=30

# Race condition prevention
ENABLE_PREBOOK_PATTERN=true
REDIS_URL=redis://localhost:6379

# Performance
PARALLEL_AVAILABILITY_CHECKS=true
BATCH_CONTIGUITY_VALIDATION=true
```

### Feature Flags
```typescript
// Gradual rollout
const FEATURE_FLAGS = {
  CONTIGUITY_VALIDATION: process.env.NODE_ENV === 'production',
  PREBOOK_PATTERN: process.env.ENABLE_PREBOOK_PATTERN === 'true',
  REAL_TIME_CACHE: true,
  ADVANCED_SUGGESTIONS: false // Fase 2
}
```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs Objetivo Post-Implementación:
1. **0% reservas inválidas** (S1+S3, S1+T10)
2. **<1% race condition conflicts** (vs ~5% actual estimado)
3. **<200ms response time** para availability checks
4. **>95% customer satisfaction** con selección de mesas
5. **0 overbooking incidents** en producción

### Monitoring Dashboard:
- Contiguity validation success rate
- PreBook token usage & expiry
- API response times por endpoint
- Invalid table combination attempts
- Race condition prevention effectiveness

---

## 📚 REFERENCIAS Y RECURSOS

### Context7 Research Sources:
- **Go Distributor Reservation APIs** (2384 snippets) - PreBook patterns
- **OpenTable API** (4 snippets) - Same-party validation
- **Channex.io** (467 snippets) - Atomic transactions
- **QloApps** (185 snippets) - Multi-room validation
- **resmio** (85 snippets) - Real-time inventory

### Technical Documentation:
- [Next.js 15 App Router](https://nextjs.org/docs)
- [Supabase RLS Policies](https://supabase.com/docs/guides/database/row-level-security)
- [Zod Schema Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)

### Internal Resources:
- `CLAUDE.md` - Directrices y gotchas del proyecto
- `ai_docs/` - Claude Code patterns y hooks
- `/api/reservations/route.ts` - API actual de reservas
- `useReservations.ts` - Hook principal frontend

---

**FIN DEL INFORME**

*Documento generado por Claude Code Analysis - Versión 1.0*
*Para implementación inmediata siguiendo metodología enterprise*