# Implementación Pendiente - Centralización de Selección de Mesas

**Fecha:** 2025-01-17
**Estado:** 🟡 Parcialmente Completado
**Branch:** `feature/mejora-seleccion-mesas`

---

## ✅ Completado

### 1. Fix Bug Crítico de Capacidad
- ✅ Buffer cambiado de 1.5x a +2
- ✅ Sub-zonas Terrace Campanari (T1-T6, T7-T10, T11-T14)
- ✅ Función `getTableSubZone` implementada
- ✅ Validación `validateContiguity` mejorada

### 2. Web Pública Activada
- ✅ `enableContiguityValidation={true}` en `EnhancedDateTimeAndTableStep.tsx`
- ✅ Ahora valida sub-zonas correctamente

---

## ⏳ Pendiente (CRÍTICO)

### Task A: Refactorizar reservation-form.tsx (Admin Nueva Reserva)
**Archivo:** `src/components/forms/reservation/reservation-form.tsx`
**Líneas a modificar:** 81-85, 230-268, 547-613 (~200 líneas)

**Cambios necesarios:**

1. **Agregar Import (después línea 19):**
```typescript
import { MultiTableSelector } from '@/components/reservations/MultiTableSelector'
```

2. **Eliminar función duplicada (líneas 81-85):**
```typescript
// ❌ ELIMINAR COMPLETAMENTE
const getMaxTablesForPartySize = (partySize: number) => {
  if (partySize <= 4) return 1
  if (partySize <= 8) return 2
  return 3
}
```

3. **Eliminar función duplicada (líneas 230-268):**
```typescript
// ❌ ELIMINAR COMPLETAMENTE handleTableToggle
// La lógica ahora está en MultiTableSelector
```

4. **Reemplazar Grid Completo (líneas 481-659):**

**ELIMINAR:**
```typescript
{/* Grid de Mesas - Mobile Friendly */}
<div className="grid gap-2 grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
  {availability.recommendations
    .filter(table => ...)
    .map((table) => {
      // ... custom UI
    })}
</div>
```

**REEMPLAZAR CON:**
```typescript
<Card>
  <CardHeader className="pb-4">
    <CardTitle className="flex items-center gap-2 text-lg">
      <Utensils className="h-5 w-5" />
      Selección de Mesa <span className="text-red-500">*</span>
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {availability?.available && availability.recommendations?.length ? (
      <>
        {/* Zone Filter - Si hay múltiples zonas */}
        {(() => {
          const zones = getAvailableZones(availability.recommendations)
          if (zones.length <= 1) return null

          return (
            <div className="space-y-3">
              <Label>Filtrar por zona</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={!formData.preferredLocation ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, preferredLocation: '' }))}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Todas
                </Button>
                {zones.map((zone) => (
                  <Button
                    key={zone.id}
                    type="button"
                    variant={formData.preferredLocation === zone.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, preferredLocation: zone.id }))}
                  >
                    {zone.icon} <span className="ml-2">{zone.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )
        })()}

        {/* MultiTableSelector Centralizado */}
        <MultiTableSelector
          tables={availability.recommendations
            .filter(t => !formData.preferredLocation || t.location === formData.preferredLocation)
            .map(t => ({
              id: t.id,
              number: t.number.toString(),
              capacity: t.capacity,
              location: t.location,
              status: 'available' as const,
              available: true
            }))}
          selectedTableIds={formData.tableIds}
          onSelectionChange={(tableIds) => {
            const newSelection = availability.recommendations.filter(t => tableIds.includes(t.id))
            setSelectedTables(newSelection)
            setTotalCapacity(newSelection.reduce((sum, t) => sum + t.capacity, 0))
            setFormData(prev => ({ ...prev, tableIds }))
          }}
          partySize={formData.partySize}
          maxSelections={5}
          enableContiguityValidation={true}
          adminMode={true}
        />

        {/* Capacity Feedback (mantener existente) */}
        {selectedTables.length > 0 && (
          <div className="mt-4">
            {totalCapacity >= formData.partySize ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Capacidad suficiente: {totalCapacity} para {formData.partySize}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  Capacidad insuficiente: {totalCapacity}/{formData.partySize}
                </p>
              </div>
            )}
          </div>
        )}
      </>
    ) : (
      <div className="p-6 border rounded-md bg-muted/50 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm">Selecciona fecha, hora y personas para ver mesas</p>
      </div>
    )}
  </CardContent>
</Card>
```

---

### Task B: Refactorizar edit-reservation-modal.tsx (Admin Edición)
**Archivo:** `src/app/(admin)/dashboard/reservaciones/components/edit-reservation-modal.tsx`
**Líneas a modificar:** 456-461, 1013-1124 (~120 líneas)

**Cambios necesarios:**

1. **Agregar Import (línea 15):**
```typescript
import { MultiTableSelector } from '@/components/reservations/MultiTableSelector'
```

2. **Eliminar función duplicada (líneas 456-461):**
```typescript
// ❌ ELIMINAR COMPLETAMENTE
const getMaxTablesForPartySize = (partySize: number) => {
  if (partySize <= 4) return 1
  if (partySize <= 8) return 2
  return 3
}
```

3. **Reemplazar Grid Completo (líneas 1013-1124):**

**ELIMINAR:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
  {tableOptions.map((table) => {
    // ... custom cards
  })}
</div>
```

**REEMPLAZAR CON:**
```typescript
<Card>
  <CardHeader>
    <CardTitle className="text-base">
      <Label>
        Mesas *
        {watch('tableIds')?.length > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            ({watch('tableIds').length} mesa{watch('tableIds').length > 1 ? 's' : ''})
          </span>
        )}
      </Label>
    </CardTitle>
  </CardHeader>
  <CardContent>
    {isLoadingAvailability ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Verificando disponibilidad...</span>
      </div>
    ) : hasValidAvailabilityData ? (
      <MultiTableSelector
        tables={allAvailableTables.map(t => ({
          id: t.id || t.tableId,
          number: t.number || t.tableNumber || 'N/A',
          capacity: t.capacity || 0,
          location: t.location || t.zone || 'SALA_PRINCIPAL',
          status: 'available' as const,
          available: true
        }))}
        selectedTableIds={watch('tableIds') || []}
        onSelectionChange={(tableIds) => setValue('tableIds', tableIds)}
        partySize={watchedPartySize || 2}
        maxSelections={5}
        currentTableIds={currentReservationTableIds}
        enableContiguityValidation={true}
        adminMode={true}
      />
    ) : (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Complete fecha y hora para ver mesas</p>
      </div>
    )}
  </CardContent>
</Card>
```

4. **Eliminar validación manual redundante (líneas 711-727):**
```typescript
// ❌ ELIMINAR - Ya está en MultiTableSelector
// Validación de mesas seleccionadas vs capacidad
```

---

## 📋 Testing Post-Implementación

### Test 1: Web Pública (/reservas)
```bash
Escenario: 4 PAX, Terrace Campanari
1. Seleccionar T1 → ✅ Permite
2. Intentar T12 → ❌ Bloquea "Las mesas deben estar en la misma zona"
3. Seleccionar T2 → ✅ Permite (misma zona)
```

### Test 2: Admin Nueva (/dashboard/reservaciones/nueva)
```bash
Escenario: 4 PAX
1. Seleccionar mesa de 4 → ✅ Permite
2. Intentar otra mesa → ❌ Bloquea "Ya tienes 4 asientos"
3. Deseleccionar y seleccionar 2+2 → ✅ Permite
4. Intentar T1+S3 → ❌ Bloquea "misma zona"
```

### Test 3: Admin Edit Modal
```bash
Escenario: Editar reserva existente 6 PAX
1. Cambiar fecha/hora → Muestra mesas disponibles
2. Seleccionar T1+T2 (4 asientos) → ⚠️ Warning insuficiente
3. Agregar T3 (6 asientos total) → ✅ Permite
4. Intentar T12 → ❌ Bloquea "misma zona"
```

---

## 🎯 Impacto Esperado

### Código
- ❌ **Antes:** 3 implementaciones (~800 líneas código duplicado)
- ✅ **Después:** 1 implementación centralizada
- 📉 **Reducción:** ~400 líneas eliminadas

### Validación
- ❌ **Antes:** Sin validación de contigüidad
- ✅ **Después:** Validación activa en 100% de flujos

### Operaciones
- ❌ **Antes:** Permite mesas cruzadas (T1 + S3)
- ✅ **Después:** Bloquea mesas de diferentes zonas

---

## ⏱️ Tiempo Estimado

- **Task A** (reservation-form): 45 minutos
- **Task B** (edit-modal): 30 minutos
- **Testing**: 30 minutos
- **Total**: 1h 45min

---

## 🚀 Comandos para Implementar

```bash
# 1. Asegurar estar en la rama correcta
git checkout feature/mejora-seleccion-mesas

# 2. Implementar Task A
# Editar: src/components/forms/reservation/reservation-form.tsx
# Seguir pasos de arriba

# 3. Implementar Task B
# Editar: src/app/(admin)/dashboard/reservaciones/components/edit-reservation-modal.tsx
# Seguir pasos de arriba

# 4. Validar TypeScript
npm run type-check

# 5. Test en dev
npm run dev
# Probar los 3 escenarios

# 6. Commit
git add -A
git commit -m "feat: Centralizar selección de mesas en admin (Tasks A+B)"
```

---

## 📝 Notas Importantes

1. **Mantener zone filter:** El filtro de zonas es útil, mantenerlo
2. **Mantener capacity feedback:** Los mensajes de capacidad son buenos UX
3. **currentTableIds:** En edit modal, necesario para no bloquear mesas ya reservadas
4. **adminMode={true}:** Necesario para futura flexibilidad

---

**Estado:** ⏳ Pendiente de implementación
**Prioridad:** 🔥 ALTA - Afecta consistencia del sistema
**Bloqueador:** No hay bloqueadores técnicos

**Próximo paso:** Implementar Task A (reservation-form.tsx)
