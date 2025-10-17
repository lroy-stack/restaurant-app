# 📋 PLAN: Campo `is_public` para Mesas Comodín (S9 y S10)

> **Fecha**: 2025-10-14
> **Proyecto**: Enigma Restaurant Platform
> **Objetivo**: Separar lógica de "activo interno" vs "visible en web pública"

---

## 🎯 RESUMEN EJECUTIVO

Actualmente, el campo `isActive` en la tabla `restaurante.tables` controla dos comportamientos:
1. ✅ **Uso interno**: Si el personal puede usar la mesa
2. ✅ **Visibilidad pública**: Si aparece en el formulario web

**Problema**: Necesitamos mesas "comodín" (S9, S10) que:
- ✅ Estén disponibles para el personal en dashboard
- ✅ Aparezcan en floor plan y configuración
- ✅ Se puedan asignar en reservas admin
- ❌ **NO** aparezcan en el formulario web público

**Solución**: Agregar campo `is_public BOOLEAN` que controla solo la visibilidad pública.

---

## 📊 ESTADO ACTUAL DEL SISTEMA

### 1. **Schema de Base de Datos**

#### **Tabla `restaurante.tables`** (Actual)
```sql
CREATE TABLE restaurante.tables (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  location TEXT NOT NULL, -- TERRACE_CAMPANARI, SALA_PRINCIPAL, SALA_VIP, TERRACE_JUSTICIA
  qrCode TEXT,
  isActive BOOLEAN DEFAULT true, -- ⚠️ CONTROLA TODO
  restaurantId TEXT NOT NULL,
  currentStatus TEXT DEFAULT 'available',
  position_x NUMERIC,
  position_y NUMERIC,
  rotation NUMERIC,
  width NUMERIC,
  height NUMERIC,
  totalScans INTEGER DEFAULT 0,
  lastScannedAt TIMESTAMPTZ,
  qrVersion INTEGER DEFAULT 1,
  securityHash VARCHAR(64),
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);
```

**Estado Actual**:
- `isActive = true` → Mesa disponible para TODO (admin + web)
- `isActive = false` → Mesa oculta en TODO (admin + web)
- **No hay separación** entre uso interno y visibilidad pública

---

### 2. **Rutas Afectadas por `isActive`**

#### **A. Dashboard Admin (VE TODAS las mesas)**

| Ruta | Archivo | Filtro Actual | Comportamiento |
|------|---------|---------------|----------------|
| `/dashboard/mesas` | `src/app/(admin)/dashboard/mesas/page.tsx:57` | ❌ SIN filtro | Muestra **TODAS** (active + inactive) |
| `/dashboard/mesas?tab=floor-plan` | `src/app/(admin)/dashboard/mesas/components/floor-plan-v2/FloorPlanView.tsx:118` | ❌ SIN filtro | Filtra en UI `filter(t => t.isActive)` |
| `/dashboard/mesas?tab=config` | `src/app/(admin)/dashboard/mesas/components/table-configuration.tsx:470` | ❌ SIN filtro | Usa store sin filtro |

**✅ Conclusión**: Dashboard admin **ya ve todo**, solo aplica filtros visuales opcionales.

---

#### **B. APIs de Disponibilidad (Filtran `isActive=true`)**

| API Endpoint | Archivo | Línea | Query Actual |
|--------------|---------|-------|--------------|
| `/api/tables/availability` | `src/app/api/tables/availability/route.ts` | 60 | `?isActive=eq.true` ✅ |
| `/api/zones/active` | `src/app/api/zones/active/route.ts` | 35 | `?isActive=eq.true` ✅ |
| `/api/reservations` (validación) | `src/app/api/reservations/route.ts` | 306 | `.eq('isActive', true)` ✅ |
| `/api/tables/smart-assignment` | `src/app/api/tables/smart-assignment/route.ts` | 276 | `.eq('isActive', true)` ✅ |
| `/api/dashboard/table-occupancy` | `src/app/api/dashboard/table-occupancy/route.ts` | 17 | `.eq('isActive', true)` ✅ |

**⚠️ Conclusión**: **TODAS las APIs públicas** filtran `isActive=true`.

---

#### **C. Formularios (Usan APIs con filtro)**

| Formulario | Componente | API Usada | Resultado |
|------------|------------|-----------|-----------|
| **Admin Form** | `src/components/forms/reservation/reservation-form.tsx:142` | `/api/tables/availability` | Ve solo `isActive=true` |
| **Web Form** | `src/components/reservations/EnhancedDateTimeAndTableStep.tsx` | `/api/tables/availability` | Ve solo `isActive=true` |

**⚠️ Problema**: Ambos formularios usan la misma API → **ven las mismas mesas**.

---

### 3. **Flujo de Reservas**

```mermaid
graph TD
    A[Usuario Web] --> B[/reservas]
    C[Admin] --> D[/dashboard/reservaciones/nueva]
    B --> E[EnhancedDateTimeAndTableStep]
    D --> F[reservation-form.tsx]
    E --> G[/api/tables/availability?isActive=eq.true]
    F --> G
    G --> H[Devuelve SOLO mesas con isActive=true]
    H --> I[Ambos formularios ven LAS MISMAS mesas]
```

---

## 🛠️ SOLUCIÓN PROPUESTA

### 1. **Nuevo Schema de Base de Datos**

```sql
-- Migration: agregar campo is_public
ALTER TABLE restaurante.tables
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_tables_public_visible
ON restaurante.tables(is_public)
WHERE is_public = true;

-- Actualizar mesas existentes (mantener comportamiento actual)
UPDATE restaurante.tables
SET is_public = true
WHERE isActive = true;

UPDATE restaurante.tables
SET is_public = false
WHERE isActive = false;

-- Insertar mesas comodín S9 y S10 (OCULTAS AL PÚBLICO)
INSERT INTO restaurante.tables (
  number,
  capacity,
  location,
  isActive,
  is_public,
  restaurantId,
  qrCode
) VALUES
  ('S9', 4, 'SALA_PRINCIPAL', true, false, 'rest_enigma_001', 'QR_S9_PRINCIPAL'),
  ('S10', 4, 'SALA_PRINCIPAL', true, false, 'rest_enigma_001', 'QR_S10_PRINCIPAL')
ON CONFLICT (number) DO NOTHING;

COMMENT ON COLUMN restaurante.tables.is_public IS
'Controla visibilidad en formulario web público. isActive controla uso interno del restaurante.';
```

**Resultado**:
- `isActive = true, is_public = true` → **Uso normal** (admin + web)
- `isActive = true, is_public = false` → **Solo admin** (S9, S10)
- `isActive = false, is_public = *` → **Temporalmente cerrada** (no se usa en ningún lado)

---

### 2. **Modificaciones de Código**

#### **A. Tipo TypeScript** (`src/types/reservation.ts:67-93`)

```typescript
export interface Table {
  id: string
  number: string
  capacity: number
  location: TableLocation
  qrCode: string
  isActive: boolean
  is_public: boolean // ✅ NUEVO CAMPO
  restaurantId: string
  createdAt: string | Date
  updatedAt: string | Date
  // ... resto de campos
}
```

---

#### **B. API Availability** (`src/app/api/tables/availability/route.ts:60`)

**Antes**:
```typescript
let tablesQuery = `${SUPABASE_URL}/rest/v1/tables?select=*&isActive=eq.true`
```

**Después**:
```typescript
// Detectar si es request del formulario web o admin
const isPublicRequest = !searchParams.get('includePrivate') // Admin pasa includePrivate=true

let tablesQuery = `${SUPABASE_URL}/rest/v1/tables?select=*&isActive=eq.true`

// Filtro adicional: solo mesas públicas para web
if (isPublicRequest) {
  tablesQuery += `&is_public=eq.true`
}
```

**Justificación**: Admin pasa `includePrivate=true`, web no lo pasa.

---

#### **C. Hook `useReservations`** (`src/hooks/useReservations.ts`)

**Modificar `checkAvailability`**:
```typescript
const checkAvailability = async (
  dateTime: string,
  partySize: number,
  preferredLocation?: string,
  includePrivate: boolean = false // ✅ NUEVO PARÁMETRO
) => {
  const params = new URLSearchParams({
    date: dateISO,
    time: timeISO,
    partySize: partySize.toString(),
    duration: '150'
  })

  // ✅ Admin puede ver mesas privadas
  if (includePrivate) {
    params.set('includePrivate', 'true')
  }

  if (preferredLocation) {
    params.set('tableZone', preferredLocation)
  }

  const response = await fetch(`/api/tables/availability?${params}`)
  // ...
}
```

---

#### **D. Formulario Admin** (`src/components/forms/reservation/reservation-form.tsx:211`)

**Modificar llamada a `checkAvailability`**:
```typescript
const result = await checkAvailability(
  dateTime,
  partySize,
  formData.preferredLocation,
  true // ✅ Admin ve mesas privadas (S9, S10)
)
```

---

#### **E. Formulario Web** (`src/components/reservations/EnhancedDateTimeAndTableStep.tsx`)

**Mantener sin cambios** (por defecto `includePrivate=false`):
```typescript
const result = await checkAvailability(
  dateTime,
  partySize,
  selectedZone
  // ✅ NO pasa includePrivate → solo ve mesas públicas
)
```

---

#### **F. API `/api/tables/route.ts`** (Crear/Editar mesas)

**Modificar POST** (línea 85):
```typescript
const createData = {
  ...tableData,
  restaurantId: 'rest_enigma_001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentStatus: 'available',
  isActive: tableData.isActive ?? true,
  is_public: tableData.is_public ?? true // ✅ Por defecto público
}
```

**Modificar PATCH** en `/api/tables/[id]/route.ts`:
```typescript
// Permitir actualizar is_public
const { is_public, isActive, ...otherFields } = updateData

const response = await fetch(
  `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}`,
  {
    method: 'PATCH',
    body: JSON.stringify({
      ...otherFields,
      isActive,
      is_public, // ✅ Incluir en update
      updatedAt: new Date().toISOString()
    })
  }
)
```

---

#### **G. Dashboard Config** (`src/app/(admin)/dashboard/mesas/components/table-configuration.tsx`)

**Agregar checkbox en form** (línea 390):
```typescript
{/* Active Status */}
<div className="flex items-center space-x-2">
  <Button
    type="button"
    variant="outline"
    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
    className="flex items-center gap-2"
  >
    {formData.isActive ? (
      <>
        <ToggleRight className="w-4 h-4 text-[#9FB289]" />
        Mesa Activa (Uso Interno)
      </>
    ) : (
      <>
        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
        Mesa Inactiva
      </>
    )}
  </Button>
</div>

{/* ✅ NUEVO: Public Visibility */}
<div className="flex items-center space-x-2">
  <Button
    type="button"
    variant="outline"
    onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
    className="flex items-center gap-2"
    disabled={!formData.isActive} // Solo si está activa
  >
    {formData.is_public ? (
      <>
        <Eye className="w-4 h-4 text-blue-600" />
        Visible en Web Pública
      </>
    ) : (
      <>
        <EyeOff className="w-4 h-4 text-muted-foreground" />
        Solo Personal (Comodín)
      </>
    )}
  </Button>
</div>
```

---

### 3. **Archivos a Modificar (Lista Completa)**

| # | Archivo | Líneas | Cambio |
|---|---------|--------|--------|
| 1 | `migrations/add_is_public_field.sql` | NEW | Crear migration |
| 2 | `src/types/reservation.ts` | 67-93 | Agregar `is_public` a interface |
| 3 | `src/app/api/tables/availability/route.ts` | 60-63 | Filtro condicional |
| 4 | `src/hooks/useReservations.ts` | ~80 | Parámetro `includePrivate` |
| 5 | `src/components/forms/reservation/reservation-form.tsx` | 211 | Pasar `includePrivate=true` |
| 6 | `src/app/api/tables/route.ts` | 85 | Agregar `is_public` en POST |
| 7 | `src/app/api/tables/[id]/route.ts` | ~60 | Permitir update de `is_public` |
| 8 | `src/app/(admin)/dashboard/mesas/components/table-configuration.tsx` | 390-420 | Agregar toggle UI |

**Total**: 1 migration SQL + 7 archivos TypeScript/React

---

## ✅ GARANTÍAS DE FUNCIONALIDAD

### **1. Dashboard Admin**
- ✅ Floor plan mostrará S9 y S10 (filtro visual `isActive=true`)
- ✅ Config mostrará S9 y S10 para edición
- ✅ Podrán asignarse en reservas admin (pasan `includePrivate=true`)

### **2. Formulario Web Público**
- ✅ NO verá S9 ni S10 (filtro `is_public=true` en API)
- ✅ Resto de mesas activas funcionan igual

### **3. Mesas Existentes**
- ✅ Todas mantienen comportamiento actual (migración setea `is_public = isActive`)

### **4. Performance**
- ✅ Índice `idx_tables_public_visible` optimiza query web
- ✅ Admin no tiene overhead (ya consulta todo)

### **5. Backward Compatibility**
- ✅ Campo nullable con default `true` (no rompe nada)
- ✅ APIs existentes funcionan sin cambios si no usan filtro
- ✅ TypeScript marca errores en tiempo de desarrollo

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Database** (5 min)
```bash
# Conectar a producción
ssh root@31.97.182.226
docker exec -i supabase-db psql -U postgres -d postgres

# Ejecutar migration
\i migrations/add_is_public_field.sql

# Verificar
SELECT number, isActive, is_public FROM restaurante.tables WHERE number IN ('S9', 'S10');
```

### **Fase 2: Backend** (15 min)
1. Modificar types
2. Modificar API availability
3. Modificar API tables CRUD
4. Modificar hook useReservations

### **Fase 3: Frontend** (10 min)
1. Modificar formulario admin
2. Agregar toggle en table-configuration

### **Fase 4: Testing** (10 min)
1. Crear mesa S9 desde dashboard
2. Verificar aparece en floor plan admin
3. Verificar NO aparece en formulario web
4. Verificar se puede asignar desde admin
5. Verificar mesas normales siguen funcionando

---

## 📝 NOTAS FINALES

- **Tiempo estimado**: 40 minutos total
- **Risk level**: ⚠️ MEDIO (modificación de schema en producción)
- **Rollback**: Simple (eliminar columna, revertir commits)
- **Breaking changes**: ❌ NINGUNO (campo nullable con default)
- **Tests requeridos**: ✅ Formulario web + admin + floor plan

---

**Aprobado por**: Pendiente
**Fecha ejecución**: Pendiente
**Status**: 📋 DOCUMENTADO
