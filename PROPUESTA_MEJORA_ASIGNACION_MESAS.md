# Propuesta: Mejora de Lógica de Asignación de Mesas

**Fecha**: 2025-10-13
**Estado**: Análisis y Propuesta
**Objetivo**: Mejorar restricciones de capacidad sin romper producción

---

## 📋 Análisis de Situación Actual

### Problemas Identificados

1. **Selección excesiva de mesas**
   - ✅ Valida capacidad mínima (warning si insuficiente)
   - ❌ NO valida capacidad máxima
   - ❌ Permite seleccionar 5 mesas para 2 personas

2. **Ineficiencia en asignación**
   - ❌ 2 personas pueden reservar mesa de 4 pax
   - ❌ No hay restricción de sobre-capacidad
   - ❌ Desperdicio de espacio disponible

3. **API sin filtros de capacidad**
   - `/api/tables/availability` devuelve TODAS las mesas disponibles
   - NO filtra por rangos apropiados según `partySize`
   - Cliente debe filtrar manualmente

### Ubicación del Código

```
/api/tables/availability/route.ts          # API sin filtros de capacidad
EnhancedDateTimeAndTableStep.tsx:339      # Validación mínima en continuar
MultiTableSelector.tsx:137-143            # Solo warning capacidad mínima
```

---

## 🎯 Solución Propuesta (Sin Romper Producción)

### Fase 1: Validación Frontend (Segura)

#### A. MultiTableSelector - Validación robusta

**Ubicación**: `src/components/reservations/MultiTableSelector.tsx`

**Nuevas reglas de negocio**:

```typescript
// Regla 1: Capacidad máxima permitida
const MAX_OVERCAPACITY_PERCENTAGE = 1.5 // 50% extra máximo
const maxAllowedCapacity = partySize * MAX_OVERCAPACITY_PERCENTAGE

// Regla 2: Capacidad mínima requerida
const minRequiredCapacity = partySize

// Regla 3: Validación al seleccionar mesa
function canSelectTable(table: Table): {
  canSelect: boolean
  reason?: string
} {
  const currentTotal = totalSelectedCapacity
  const newTotal = currentTotal + table.capacity

  // Si ya cumple capacidad mínima, no permitir agregar más
  if (currentTotal >= partySize && !isTableSelected(table.id)) {
    return {
      canSelect: false,
      reason: 'Ya tienes capacidad suficiente'
    }
  }

  // No permitir exceder capacidad máxima
  if (newTotal > maxAllowedCapacity) {
    return {
      canSelect: false,
      reason: `Excede capacidad máxima (${Math.round(maxAllowedCapacity)} personas)`
    }
  }

  // Mesa individual muy grande para grupo pequeño
  if (selectedTableIds.length === 0 && table.capacity > maxAllowedCapacity) {
    return {
      canSelect: false,
      reason: 'Mesa demasiado grande para tu grupo'
    }
  }

  return { canSelect: true }
}
```

**Cambios visuales**:
- ❌ Deshabilitar mesas con capacidad > `maxAllowedCapacity` (grises)
- ⚠️  Advertencia si capacidad excede `partySize` pero < `maxAllowedCapacity`
- ✅ Verde si capacidad perfecta (`partySize` ≤ capacity ≤ `maxAllowedCapacity`)

---

#### B. EnhancedDateTimeAndTableStep - Validación continuar

**Ubicación**: `src/components/reservations/EnhancedDateTimeAndTableStep.tsx:338`

```typescript
const handleContinue = () => {
  // ... validaciones existentes ...

  // NUEVA VALIDACIÓN: Capacidad apropiada
  const totalCapacity = selectedTables.reduce((sum, t) => sum + t.capacity, 0)
  const maxAllowed = partySize * 1.5

  if (totalCapacity < partySize) {
    toast.error(
      language === 'es'
        ? `Capacidad insuficiente. Necesitas ${partySize} personas, tienes ${totalCapacity}`
        : `Insufficient capacity. You need ${partySize} people, you have ${totalCapacity}`
    )
    return
  }

  if (totalCapacity > maxAllowed) {
    toast.error(
      language === 'es'
        ? `Capacidad excesiva. Máximo permitido: ${Math.round(maxAllowed)} personas para tu grupo de ${partySize}`
        : `Excessive capacity. Maximum allowed: ${Math.round(maxAllowed)} people for your group of ${partySize}`
    )
    return
  }

  // ... continuar normal ...
}
```

---

### Fase 2: API Optimizada (Opcional - Mayor Impacto)

#### `/api/tables/availability` - Filtros inteligentes

**Cambios en `route.ts`**:

```typescript
// ANTES: Devuelve todas las mesas disponibles
const availableTables = activeTables.filter(...)

// DESPUÉS: Filtra por rangos apropiados
const MIN_CAPACITY_BUFFER = 1.0 // Exacto o mayor
const MAX_CAPACITY_BUFFER = 1.5 // Máximo 50% extra

const suitableTables = activeTables
  .filter(table => {
    // Filtros existentes (conflictos, status)
    if (reservedTableIds.has(table.id)) return false
    if (table.currentstatus !== 'available') return false

    // NUEVO: Filtro por capacidad apropiada
    const capacity = table.capacity
    const minCapacity = partySize * MIN_CAPACITY_BUFFER
    const maxCapacity = partySize * MAX_CAPACITY_BUFFER

    return capacity >= minCapacity && capacity <= maxCapacity
  })

// Si no hay mesas apropiadas, buscar combinaciones
if (suitableTables.length === 0) {
  // Lógica para combinar mesas pequeñas
  const smallTables = activeTables.filter(t => t.capacity < partySize)
  // ... algoritmo de combinación óptima ...
}
```

**Beneficios**:
- Cliente recibe solo opciones apropiadas
- Reduce confusión del usuario
- Mejor utilización del espacio
- Backend controla reglas de negocio

---

## 📊 Matriz de Validación Propuesta

| Party Size | Mesas Apropiadas (Capacidad) | Mesas Rechazadas | Razón |
|------------|------------------------------|------------------|-------|
| 2 pax      | 2-3 pax                      | 4+ pax           | Desperdicio >50% |
| 4 pax      | 4-6 pax                      | 8+ pax           | Desperdicio >50% |
| 6 pax      | 6-9 pax                      | 10+ pax          | Desperdicio >50% |
| 8 pax      | 8-12 pax                     | 14+ pax          | Desperdicio >50% |

**Casos especiales**:
- **Combinación de mesas**: Si no hay mesa individual apropiada, permitir 2-3 mesas pequeñas
- **VIP override**: Mesas VIP sin restricción de capacidad (flag especial)
- **Grupos grandes (>10)**: Algoritmo especial en smart-assignment

---

## 🚀 Plan de Implementación Seguro

### Estrategia: Feature Flag + Testing

```typescript
// Nueva configuración en business_hours table
{
  "enable_capacity_restrictions": false, // OFF por defecto
  "min_capacity_buffer": 1.0,
  "max_capacity_buffer": 1.5
}

// En el código
const config = await getBusinessConfig()
if (config.enable_capacity_restrictions) {
  // Aplicar nuevas restricciones
} else {
  // Lógica actual (backward compatible)
}
```

### Fases de Rollout

**Fase 1: Frontend solo (SEGURA)**
1. Implementar validaciones en `MultiTableSelector`
2. Agregar validación en `handleContinue`
3. Testing exhaustivo en desarrollo
4. Deploy con feature flag OFF
5. Monitoreo de errores/comportamiento

**Fase 2: API optimizada (OPCIONAL)**
1. Agregar filtros de capacidad en API
2. Mantener endpoint legacy sin cambios
3. Crear nuevo endpoint `/api/tables/availability-v2`
4. Testing A/B progresivo
5. Migración gradual

**Fase 3: Producción**
1. Habilitar feature flag en horarios bajos
2. Monitoreo de métricas (conversión, errores)
3. Rollback inmediato si hay problemas
4. Ajuste de buffers según feedback real

---

## 📈 Métricas de Éxito

### KPIs a monitorear

1. **Eficiencia de asignación**
   - Antes: Desperdicio promedio de capacidad
   - Después: Reducción de desperdicio >30%

2. **Conversión de reservas**
   - No debe bajar (mantener >95% actual)
   - Usuarios deben encontrar opciones apropiadas

3. **Tiempo de decisión**
   - Reducir confusión (menos opciones irrelevantes)
   - Target: <30% tiempo de selección

4. **Satisfacción del cliente**
   - Feedback sobre proceso de reserva
   - Menos quejas de "mi mesa es muy grande/pequeña"

---

## 🔍 Testing Requerido

### Casos de Prueba

```typescript
describe('Table Assignment Validation', () => {
  test('2 pax NO puede seleccionar mesa de 6 pax', () => {
    // partySize: 2, mesa: 6 capacity
    // Expected: canSelect = false, reason = "Mesa demasiado grande"
  })

  test('4 pax puede seleccionar mesa de 6 pax', () => {
    // partySize: 4, mesa: 6 capacity
    // Expected: canSelect = true (within 50% buffer)
  })

  test('NO permite agregar más mesas si capacidad suficiente', () => {
    // partySize: 4, selected: [mesa 4 pax]
    // Intenta agregar: mesa 2 pax
    // Expected: canSelect = false, reason = "Ya tienes capacidad suficiente"
  })

  test('Permite combinar mesas pequeñas', () => {
    // partySize: 6, no hay mesa de 6
    // Permite: mesa 4 + mesa 2
    // Expected: canSelect = true para ambas
  })
})
```

---

## ⚠️ Riesgos y Mitigaciones

### Riesgos Identificados

1. **Restricción excesiva → Pérdida de reservas**
   - Mitigación: Feature flag, buffers ajustables
   - Rollback: Desactivar flag inmediatamente

2. **Edge cases no contemplados**
   - Mitigación: Testing exhaustivo pre-prod
   - Monitoreo: Logs detallados de rechazos

3. **UX confusa (usuarios no entienden por qué no pueden seleccionar)**
   - Mitigación: Mensajes claros, tooltips explicativos
   - Feedback: Capturar intentos de selección bloqueados

---

## 💡 Recomendación Final

**Implementar Fase 1 (Frontend) PRIMERO**:
- ✅ Sin riesgo para producción (solo validación cliente)
- ✅ Testing fácil en desarrollo
- ✅ Feature flag para control total
- ✅ Backward compatible 100%

**Evaluar Fase 2 (API) según resultados**:
- Esperar 1-2 semanas de datos reales
- Analizar patrones de selección de usuarios
- Optimizar algoritmo según comportamiento real

---

## 📝 Próximos Pasos

1. **Revisar y aprobar propuesta** con equipo
2. **Implementar Fase 1** en rama feature separada
3. **Testing local exhaustivo** (todos los casos)
4. **Desplegar con feature flag OFF** a producción
5. **Habilitar progresivamente** y monitorear
6. **Iterar según feedback** real de usuarios

---

**¿Aprobado para implementación?** ⬜ Sí ⬜ No ⬜ Requiere ajustes
