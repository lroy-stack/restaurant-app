# 📋 INFORME: PLAN DE CAMBIO - SISTEMA DE RESERVAS WEB

> **Fecha**: $(date +"%Y-%m-%d")
> **Estado**: ✅ Problema de validación RESUELTO | 📝 Plan de cambio completo
> **Objetivo**: Eliminar selección manual de mesas para clientes y migrar a sistema de asignación automática por restaurante

---

## 🚨 PARTE 1: PROBLEMA RESUELTO

### Problema Reportado
**Síntoma**: Los modales de edición de reservas (admin y customer) permitían seleccionar infinitas mesas sin validación de capacidad.

**Causa Raíz**:
- Implementación custom con checkboxes que NO usaba `useCapacityValidation`
- Se removieron límites arbitrarios pero NO se implementó validación real de capacidad
- Loop infinito por `checkAvailability` en dependencias de useEffect

### Solución Implementada ✅

#### 1. Eliminado Loop Infinito
```typescript
// ❌ ANTES (causaba loop infinito)
}, [watchedDate, watchedTime, watchedPartySize, checkAvailability])

// ✅ DESPUÉS (correcto)
}, [watchedDate, watchedTime, watchedPartySize])
// eslint-disable-next-line react-hooks/exhaustive-deps
```

#### 2. Reemplazado Implementación Custom con MultiTableSelector

**Archivos Modificados:**
- `src/app/(admin)/dashboard/reservaciones/components/edit-reservation-modal.tsx` (líneas 1076-1112)
- `src/app/(public)/mi-reserva/components/customer-edit-reservation-modal.tsx` (líneas 937-986)

**Antes:**
```tsx
// Implementación custom con 80+ líneas de código
<div className="grid">
  {tableOptions.map((table) => (
    <Card onClick={() => {
      // Lógica custom sin validación real
    }}>...</Card>
  ))}
</div>
```

**Después:**
```tsx
// Componente reutilizable con validación integrada
<MultiTableSelector
  tables={tableOptions.map(t => ({...}))}
  selectedTableIds={watch('tableIds') || []}
  onSelectionChange={(ids) => setValue('tableIds', ids)}
  partySize={watchedPartySize || 1}
  maxSelections={5}
/>
```

#### 3. Validación de Capacidad Implementada

**Hook**: `useCapacityValidation` (habilitado vía feature flag)

**Reglas Implementadas:**
1. ✅ **Si ya tiene capacidad suficiente** (currentCapacity >= partySize) → NO permite agregar más mesas
2. ✅ **Capacidad máxima permitida** → Máximo 1.5x el partySize (50% buffer)
3. ✅ **Mesa individual muy grande** → No permite mesa > 1.5x para grupos pequeños
4. ✅ **Máximo 5 mesas** → Límite de abuse prevention

**Ejemplo de Validación:**
- **2 personas selecciona mesa de 2**: ✅ Verde - Capacidad suficiente - NO permite más
- **8 personas selecciona mesa de 4**: ⚠️ Ámbar - Insuficiente - Permite agregar
- **8 personas selecciona 2 mesas (4+4)**: ✅ Verde - Suficiente - BLOQUEA más mesas
- **Submit con capacidad insuficiente**: ❌ Toast error - Submit bloqueado

**Feature Flag:**
```env
# .env.local
NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION=true  # ✅ Habilitado
```

---

## 📊 PARTE 2: ANÁLISIS COMPLETO DEL SISTEMA ACTUAL

### Componentes de Reservas Identificados

#### 1. Frontend - Cliente (Web Pública)
```
src/app/(public)/reservas/page.tsx
├── EnhancedDateTimeAndTableStep.tsx  [⚠️ AFECTADO]
│   ├── CalendarWithWeather.tsx
│   ├── TimeSlotSelector.tsx
│   ├── MultiTableSelector.tsx  [✅ Ya usa validación correcta]
│   └── FloorPlanSelector.tsx  [⚠️ AFECTADO]
└── useReservations.ts (checkAvailability)  [⚠️ AFECTADO]
```

#### 2. Frontend - Admin
```
src/app/(admin)/dashboard/reservaciones/
├── nueva/page.tsx
│   └── reservation-form.tsx  [⚠️ AFECTADO]
├── components/
│   ├── edit-reservation-modal.tsx  [✅ CORREGIDO HOY]
│   └── compact-reservation-list.tsx
└── [id]/editar/page.tsx
```

#### 3. Frontend - Cliente (Modificación)
```
src/app/(public)/mi-reserva/components/
└── customer-edit-reservation-modal.tsx  [✅ CORREGIDO HOY]
```

### Hooks Identificados

| Hook | Ruta | Afectado | Función |
|------|------|----------|---------|
| `useReservations` | `src/hooks/useReservations.ts` | ⚠️ SÍ | checkAvailability, createReservation |
| `useCapacityValidation` | `src/hooks/useCapacityValidation.ts` | ✅ NO | Validación de capacidad (correcto) |
| `useBusinessHours` | `src/hooks/useBusinessHours.ts` | ⚠️ SÍ | Franjas horarias disponibles |
| `useTables` | `src/hooks/useTables.ts` | ⚠️ SÍ | Obtener todas las mesas |

### APIs Identificadas

| Endpoint | Método | Afectado | Función |
|----------|--------|----------|---------|
| `/api/tables/availability` | POST | ⚠️ SÍ | Verifica disponibilidad + retorna mesas |
| `/api/reservations` | POST | ⚠️ SÍ | Crea reserva con `table_ids[]` |
| `/api/reservations/[id]` | PATCH | ⚠️ SÍ | Actualiza reserva con `table_ids[]` |
| `/api/tables/smart-assignment` | POST | ✅ NO | Ya existe para asignación automática |

### Templates de Email Identificados

```
src/lib/email/templates/
├── reservation-confirmation.tsx  [⚠️ AFECTADO - Muestra mesas seleccionadas]
├── reservation-reminder.tsx      [⚠️ AFECTADO - Muestra mesas asignadas]
├── reservation-modified.tsx      [⚠️ AFECTADO - Muestra cambio de mesas]
└── reservation-cancelled.tsx     [✅ NO - No muestra mesas]
```

### Base de Datos

**Tabla**: `restaurante.reservations`

**Campos Afectados:**
```sql
table_ids TEXT[]  -- Array de IDs de mesas asignadas
```

**Actualmente:**
- Cliente selecciona mesas → `table_ids` poblado al crear
- Admin modifica mesas → `table_ids` actualizado

**Cambio Propuesto:**
- Cliente NO selecciona → `table_ids = NULL` al crear
- Sistema asigna después → `table_ids` poblado por admin/automatización

---

## 🎯 PARTE 3: PLAN DE CAMBIO COMPLETO

### Objetivo del Cambio

**Problema identificado por el restaurante:**
> "Los clientes están siendo irresponsables al seleccionar mesas. Necesitamos controlar la asignación internamente."

**Solución propuesta:**
1. ✅ Cliente reserva indicando **SOLO** aforo (número de personas)
2. ✅ Sistema verifica disponibilidad **total de aforo** en franja horaria
3. ✅ Restaurante asigna mesas **manualmente** desde admin dashboard
4. ⚠️ (Opcional futuro) Sistema asigna automáticamente usando algoritmo

### Cambios Necesarios

#### FASE 1: Frontend Web Pública (Cliente)

**1.1. Modificar `EnhancedDateTimeAndTableStep.tsx`**

**Cambio:**
```tsx
// ❌ ELIMINAR: MultiTableSelector y FloorPlanSelector
<MultiTableSelector
  tables={availability.recommendations}
  selectedTableIds={selectedTableIds}
  onSelectionChange={setSelectedTableIds}
  partySize={partySize}
/>

// ✅ AGREGAR: Información de disponibilidad de aforo
<Card className="bg-green-50 border-green-200">
  <CardContent className="pt-6">
    <div className="flex items-center gap-3">
      <Check className="h-6 w-6 text-green-600" />
      <div>
        <p className="font-semibold text-green-900">
          Aforo disponible para {partySize} personas
        </p>
        <p className="text-sm text-green-700">
          El restaurante asignará las mesas según disponibilidad al confirmar tu reserva
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

**Archivos:**
- `src/components/reservations/EnhancedDateTimeAndTableStep.tsx` (líneas 180-240)

---

**1.2. Modificar Hook `useReservations.createReservation`**

**Cambio:**
```typescript
// ❌ ANTES
const createReservation = async (data: ReservationData) => {
  // ... validaciones ...

  const body = {
    ...data,
    tableIds: data.tableIds  // Cliente envía mesas seleccionadas
  }

  await fetch('/api/reservations', { method: 'POST', body })
}

// ✅ DESPUÉS
const createReservation = async (data: ReservationData) => {
  // ... validaciones ...

  const body = {
    ...data,
    tableIds: null  // Cliente NO selecciona mesas
  }

  await fetch('/api/reservations', { method: 'POST', body })
}
```

**Archivos:**
- `src/hooks/useReservations.ts` (líneas 162-220)

---

**1.3. Modificar API `/api/tables/availability`**

**Cambio:**
```typescript
// ❌ ANTES: Retorna lista de mesas disponibles
return {
  success: true,
  data: {
    tables: [...],              // Lista detallada
    availableTables: [...],     // Lista filtrada
    summary: { ... }
  }
}

// ✅ DESPUÉS: Retorna solo si hay aforo disponible
return {
  success: true,
  data: {
    hasCapacity: true,          // Boolean
    totalCapacity: 48,          // Aforo total disponible
    requestedCapacity: 8,       // Aforo solicitado
    summary: {
      requestedDate: '2025-10-17',
      requestedTime: '20:00',
      requestedPartySize: 8
    }
  }
}
```

**Archivos:**
- `src/app/api/tables/availability/route.ts` (líneas 50-120)

---

#### FASE 2: Frontend Admin Dashboard

**2.1. Agregar Widget de Asignación de Mesas**

**Nuevo Componente**: `TableAssignmentWidget.tsx`

```tsx
// src/app/(admin)/dashboard/reservaciones/components/TableAssignmentWidget.tsx

export function TableAssignmentWidget({ reservation }) {
  const [selectedTables, setSelectedTables] = useState(reservation.table_ids || [])

  // Usa MultiTableSelector existente con validación
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignar Mesas</CardTitle>
        {!reservation.table_ids && (
          <Badge variant="destructive">Sin mesas asignadas</Badge>
        )}
      </CardHeader>
      <CardContent>
        <MultiTableSelector
          tables={availableTables}
          selectedTableIds={selectedTables}
          onSelectionChange={setSelectedTables}
          partySize={reservation.partySize}
        />
        <Button onClick={() => assignTables(reservation.id, selectedTables)}>
          Asignar Mesas
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Integración:**
- Mostrar en `/dashboard/reservaciones` (lista de reservas)
- Mostrar en `/dashboard/reservaciones/[id]/editar` (detalle)
- Indicador visual de reservas sin mesas asignadas

---

**2.2. Crear API de Asignación Manual**

**Nuevo Endpoint**: `/api/reservations/[id]/assign-tables`

```typescript
// src/app/api/reservations/[id]/assign-tables/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { tableIds } = await request.json()

  // Validar capacidad
  const tables = await getTables(tableIds)
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)
  const reservation = await getReservation(params.id)

  if (totalCapacity < reservation.partySize) {
    return NextResponse.json({
      error: 'Capacidad insuficiente'
    }, { status: 400 })
  }

  // Actualizar reserva
  await supabase
    .from('reservations')
    .update({ table_ids: tableIds })
    .eq('id', params.id)

  // Enviar email de confirmación con mesas asignadas
  await sendTableAssignmentEmail(reservation, tables)

  return NextResponse.json({ success: true })
}
```

---

#### FASE 3: Plantillas de Email

**3.1. Modificar `reservation-confirmation.tsx`**

**Cambio:**
```tsx
// ❌ ANTES: Muestra mesas seleccionadas inmediatamente
<Text>Mesas asignadas: {reservation.table_ids.join(', ')}</Text>

// ✅ DESPUÉS: Mensaje condicional
{reservation.table_ids ? (
  <Text>Mesas asignadas: {reservation.table_ids.join(', ')}</Text>
) : (
  <Text>
    Las mesas serán asignadas por el restaurante antes de tu llegada.
    Recibirás un email de confirmación con la asignación final.
  </Text>
)}
```

**Archivos:**
- `src/lib/email/templates/reservation-confirmation.tsx`

---

**3.2. Crear Nueva Plantilla `table-assignment-notification.tsx`**

**Nuevo Template:**
```tsx
// src/lib/email/templates/table-assignment-notification.tsx

export const TableAssignmentNotification = ({ reservation, tables }) => (
  <EmailTemplate>
    <Heading>Mesas Asignadas</Heading>
    <Text>
      Estimado/a {reservation.customerName},
    </Text>
    <Text>
      Hemos asignado las siguientes mesas para tu reserva del {reservation.date}:
    </Text>
    <Section className="bg-gray-50 p-4 rounded">
      {tables.map(table => (
        <Row key={table.id}>
          <Column>Mesa {table.number}</Column>
          <Column>{table.capacity} personas</Column>
          <Column>{table.location}</Column>
        </Row>
      ))}
    </Section>
    <Text>
      Total de capacidad: {tables.reduce((sum, t) => sum + t.capacity, 0)} personas
    </Text>
  </EmailTemplate>
)
```

---

#### FASE 4: Validación y Testing

**4.1. Casos de Prueba**

| # | Escenario | Resultado Esperado |
|---|-----------|-------------------|
| 1 | Cliente crea reserva de 4 personas | ✅ Reserva creada sin mesas, email enviado con mensaje pendiente |
| 2 | Admin asigna mesa de 4 a reserva anterior | ✅ table_ids actualizado, email enviado con asignación |
| 3 | Admin intenta asignar mesa de 2 a reserva de 4 | ❌ Error de capacidad insuficiente |
| 4 | Cliente modifica reserva a 6 personas | ✅ table_ids = NULL, admin debe reasignar |
| 5 | Admin dashboard muestra reservas sin mesas | ✅ Badge rojo indica "Sin mesas asignadas" |

---

**4.2. Migración de Datos Existentes**

**Opción A: Mantener mesas asignadas existentes**
```sql
-- No hacer nada, las reservas existentes mantienen sus table_ids
-- Solo las nuevas reservas tendrán table_ids = NULL
```

**Opción B: Resetear todas las mesas**
```sql
-- Solo para testing, NO para producción
UPDATE restaurante.reservations
SET table_ids = NULL
WHERE date >= CURRENT_DATE;
```

---

## 📈 PARTE 4: ESTIMACIÓN DE ESFUERZO

### Tiempos Estimados

| Fase | Tarea | Tiempo | Prioridad |
|------|-------|--------|-----------|
| **FASE 1** | Modificar EnhancedDateTimeAndTableStep | 2h | 🔴 Alta |
| | Modificar useReservations.createReservation | 1h | 🔴 Alta |
| | Modificar API availability | 2h | 🔴 Alta |
| | Testing frontend web | 1h | 🔴 Alta |
| **FASE 2** | Crear TableAssignmentWidget | 3h | 🟡 Media |
| | Integrar en dashboard | 2h | 🟡 Media |
| | Crear API assign-tables | 2h | 🟡 Media |
| | Testing admin dashboard | 1h | 🟡 Media |
| **FASE 3** | Modificar email confirmation | 1h | 🟢 Baja |
| | Crear email table-assignment | 2h | 🟢 Baja |
| | Testing emails | 1h | 🟢 Baja |
| **FASE 4** | Testing end-to-end | 3h | 🔴 Alta |
| | Documentación | 1h | 🟢 Baja |
| | Migración/rollback plan | 1h | 🟡 Media |

**Total Estimado**: ~23 horas (~3 días de trabajo)

---

## 🚀 PARTE 5: PLAN DE IMPLEMENTACIÓN

### Orden Sugerido

#### Día 1: Backend + API
1. ✅ Modificar `/api/tables/availability` (2h)
2. ✅ Crear `/api/reservations/[id]/assign-tables` (2h)
3. ✅ Testing APIs con Postman (1h)
4. ✅ Modificar `useReservations.createReservation` (1h)

#### Día 2: Frontend Cliente + Admin
1. ✅ Modificar `EnhancedDateTimeAndTableStep` (2h)
2. ✅ Crear `TableAssignmentWidget` (3h)
3. ✅ Integrar widget en dashboard (2h)

#### Día 3: Emails + Testing
1. ✅ Modificar plantillas de email (3h)
2. ✅ Testing end-to-end completo (3h)
3. ✅ Documentación y capacitación (1h)

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo 1: Reservas sin mesas asignadas
**Impacto**: Alto - Cliente llega y no tiene mesa

**Mitigación:**
- Dashboard muestra claramente reservas sin asignar
- Email de recordatorio 24h antes SOLO si tiene mesas asignadas
- Alerta automática si reserva < 24h sin mesas

### Riesgo 2: Capacidad mal calculada
**Impacto**: Medio - Overbooking

**Mitigación:**
- API verifica capacidad total real antes de aceptar
- Admin dashboard muestra capacidad total vs usada
- Feature flag para rollback rápido

### Riesgo 3: Confusión del cliente
**Impacto**: Bajo - Clientes esperan seleccionar mesas

**Mitigación:**
- Mensaje claro en formulario de reserva
- Email de confirmación explica proceso
- FAQ actualizado

---

## 🔄 PLAN DE ROLLBACK

### Si necesitas volver atrás

**1. Frontend:**
```bash
git revert <commit-hash>
npm run build
```

**2. Feature Flag:**
```env
# .env.local
NEXT_PUBLIC_ENABLE_TABLE_SELECTION=true  # Habilita selección manual
```

**3. Base de Datos:**
```sql
-- No hay cambios de schema, solo datos
-- Reservas sin mesas pueden ser asignadas manualmente
```

---

## 📝 CHECKLIST DE ACEPTACIÓN

### Frontend Web Pública
- [ ] Cliente NO ve selector de mesas
- [ ] Cliente ve mensaje "Mesas serán asignadas por el restaurante"
- [ ] Reserva se crea con `table_ids = NULL`
- [ ] Email de confirmación muestra mensaje pendiente

### Frontend Admin Dashboard
- [ ] Dashboard muestra reservas sin mesas con badge rojo
- [ ] Widget de asignación funciona correctamente
- [ ] Validación de capacidad impide asignaciones incorrectas
- [ ] Después de asignar, se envía email al cliente

### APIs
- [ ] `/api/tables/availability` retorna aforo disponible (no lista de mesas)
- [ ] `/api/reservations` acepta `table_ids = NULL`
- [ ] `/api/reservations/[id]/assign-tables` funciona correctamente
- [ ] Validación de capacidad en backend

### Emails
- [ ] Confirmación muestra mensaje condicional
- [ ] Email de asignación se envía correctamente
- [ ] Recordatorio solo si tiene mesas asignadas

---

## 🎯 SIGUIENTE PASO RECOMENDADO

**Opción A: Implementación Inmediata**
1. Crear branch `feature/auto-table-assignment`
2. Implementar FASE 1 (Backend + API) primero
3. Testing incremental

**Opción B: Prototipo Primero**
1. Crear feature flag temporal
2. Implementar solo para nuevas reservas
3. Validar con staff del restaurante
4. Full rollout después de 1 semana

**Mi Recomendación**: Opción B (prototipo controlado)

---

## ❓ PREGUNTAS PARA DECIDIR

1. **¿Cuánto tiempo antes de la reserva debe asignarse?**
   - Opción A: 24 horas antes
   - Opción B: Inmediatamente al confirmar
   - Opción C: A demanda del admin

2. **¿Qué pasa si el cliente modifica la reserva?**
   - Opción A: Resetea mesas (admin reasigna)
   - Opción B: Mantiene mesas si capacidad suficiente

3. **¿Quieres asignación automática en el futuro?**
   - Sí → Preparar infraestructura ahora
   - No → Solo asignación manual

---

**FIN DEL INFORME**
