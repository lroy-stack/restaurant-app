# Análisis: Problemas de Selección de Mesas

**Fecha:** 2025-01-17
**Estado:** 🔴 CRÍTICO - Sistema NO centralizado

---

## 🐛 Problemas Identificados

### 1. Web Pública (`/reservas`) ✅ Parcial
**Archivo:** `src/components/reservations/EnhancedDateTimeAndTableStep.tsx`
- ✅ Usa `MultiTableSelector` (línea 728)
- ❌ NO tiene `enableContiguityValidation` explícito
- ❌ Validación de contigüidad NO está activa

```typescript
// ACTUAL (línea 728)
<MultiTableSelector
  tables={transformedTables}
  selectedTableIds={selectedTableIds}
  onSelectionChange={handleTableSelectionChange}
  partySize={partySize}
  maxSelections={5}
/>

// NECESARIO
<MultiTableSelector
  tables={transformedTables}
  selectedTableIds={selectedTableIds}
  onSelectionChange={handleTableSelectionChange}
  partySize={partySize}
  maxSelections={5}
  enableContiguityValidation={true}  // ✅ AGREGAR
/>
```

---

### 2. Admin Nueva Reserva (`/dashboard/reservaciones/nueva`) ❌ CRÍTICO
**Archivo:** `src/components/forms/reservation/reservation-form.tsx`
- ❌ USA GRID CUSTOM (líneas 547-613)
- ❌ NO usa `MultiTableSelector`
- ❌ Tiene función duplicada `getMaxTablesForPartySize` (línea 81)
- ❌ Tiene función duplicada `handleTableToggle` (línea 230)
- ❌ SIN validación de contigüidad
- ❌ SIN validación de capacidad estricta

**Grid Custom Problemático:**
```typescript
// LÍNEA 547-613 - GRID CUSTOM DUPLICADO
<div className="grid gap-2 grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
  {availability.recommendations
    .filter(table => !formData.preferredLocation || table.location === formData.preferredLocation)
    .map((table) => {
      const isSelected = selectedTables.find(t => t.id === table.id)
      const maxTablesAllowed = getMaxTablesForPartySize(formData.partySize) // ❌ DUPLICADO

      return (
        <div
          onClick={() => handleTableToggle(table)} // ❌ DUPLICADO
        >
          {/* Custom UI sin validación */}
        </div>
      )
    })}
</div>
```

---

### 3. Admin Edit Modal (`/dashboard/reservaciones/[id]`) ❌ CRÍTICO
**Archivo:** `src/app/(admin)/dashboard/reservaciones/components/edit-reservation-modal.tsx`
- ❌ USA GRID CUSTOM (líneas 1050-1114)
- ❌ NO usa `MultiTableSelector`
- ❌ Tiene función duplicada `getMaxTablesForPartySize` (línea 456)
- ❌ SIN validación de contigüidad
- ❌ SIN validación de capacidad estricta

**Grid Custom Problemático:**
```typescript
// LÍNEA 1050-1114 - GRID CUSTOM DUPLICADO
tableOptions.map((table) => {
  const currentTableIds = watch('tableIds') || []
  const isSelected = currentTableIds.includes(tableId)
  const canSelectMore = currentTableIds.length < maxTablesAllowed // ❌ Lógica simple

  return (
    <Card
      onClick={() => {
        if (isSelected) {
          setValue('tableIds', currentTables.filter(id => id !== tableId))
        } else if (canSelectMore) {
          setValue('tableIds', [...currentTables, tableId]) // ❌ SIN VALIDACIÓN
        }
      }}
    >
      {/* Custom UI */}
    </Card>
  )
})
```

---

## 🔥 Consecuencias Actuales

### Permite Mesas Cruzadas ❌
```
Usuario en Admin:
- Selecciona T1 (Terrace Campanari Zona 1)
- Selecciona S3 (Sala Principal)
✅ Sistema permite → ❌ Mesas en salas diferentes!
```

### Permite Capacidad Excesiva ❌
```
Usuario 4 PAX:
- Selecciona mesa de 2
- Selecciona mesa de 4
✅ Total 6 asientos → ❌ Excede necesidad!
```

### Código Duplicado 3x ❌
- `getMaxTablesForPartySize` en 2 archivos diferentes
- `handleTableToggle` en 2 archivos diferentes
- Lógica de selección custom en 3 lugares

---

## ✅ Solución: Centralización Completa

### Paso 1: Habilitar Contigüidad en Web Pública
**Archivo:** `EnhancedDateTimeAndTableStep.tsx`
```typescript
<MultiTableSelector
  tables={transformedTables}
  selectedTableIds={selectedTableIds}
  onSelectionChange={handleTableSelectionChange}
  partySize={partySize}
  maxSelections={5}
  enableContiguityValidation={true}  // ✅ AGREGAR
/>
```

### Paso 2: Reemplazar Grid en reservation-form.tsx
**Eliminar:** Líneas 81-85, 230-268, 547-613 (total ~200 líneas)
**Reemplazar con:**
```typescript
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
```

### Paso 3: Reemplazar Grid en edit-reservation-modal.tsx
**Eliminar:** Líneas 456-461, 1050-1114 (total ~120 líneas)
**Reemplazar con:**
```typescript
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
```

---

## 📊 Impacto Esperado

### Antes (Actual)
- 3 implementaciones diferentes
- Sin validación de contigüidad
- Código duplicado 400+ líneas
- Permite errores operacionales

### Después (Objetivo)
- 1 implementación centralizada
- Validación de contigüidad activa
- -300 líneas de código
- Previene errores operacionales

---

## 🎯 Testing Required

### Test 1: Contigüidad Terrace Campanari
```
Admin Nueva Reserva (4 PAX):
1. Seleccionar T1 (Zona 1) → ✅ Permite
2. Intentar T12 (Zona 3) → ❌ Debe bloquear "Las mesas deben estar en la misma zona"
3. Seleccionar T2 (Zona 1) → ✅ Permite
```

### Test 2: Contigüidad Entre Salas
```
Admin Nueva Reserva (4 PAX):
1. Seleccionar T1 (Terrace Campanari) → ✅ Permite
2. Intentar S3 (Sala Principal) → ❌ Debe bloquear "Las mesas deben estar en la misma zona"
```

### Test 3: Capacidad Estricta
```
Admin Nueva Reserva (4 PAX):
1. Seleccionar mesa de 4 → ✅ Permite
2. Intentar cualquier otra mesa → ❌ Debe bloquear "Ya tienes 4 asientos para 4 personas"
```

### Test 4: Web Pública (Mismo Comportamiento)
```
Web Pública (4 PAX):
- Mismo comportamiento que admin
- Validación de contigüidad activa
- Mensajes en español/inglés según idioma
```

---

## 📋 Checklist de Implementación

- [ ] Habilitar `enableContiguityValidation` en EnhancedDateTimeAndTableStep
- [ ] Refactorizar reservation-form.tsx (eliminar ~200 líneas)
- [ ] Refactorizar edit-reservation-modal.tsx (eliminar ~120 líneas)
- [ ] Testing manual Test 1-4
- [ ] Verificar sin errores TypeScript
- [ ] Commit y push a branch
- [ ] Testing en dev server

---

**Tiempo Estimado:** 1-2 horas
**Complejidad:** Media (refactors grandes pero directos)
**Riesgo:** Bajo (MultiTableSelector ya validado en web pública)

---

**Estado:** 🔴 Pendiente de implementación
**Prioridad:** 🔥 CRÍTICA - Afecta operaciones diarias
