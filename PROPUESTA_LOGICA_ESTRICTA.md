# Propuesta: Lógica Estricta de Selección de Mesas

## Problema Identificado
Feature flags en .env son estáticos y no apropiados para lógica de negocio crítica que necesita ser dinámica.

## Reglas de Negocio Estrictas

### 1. Capacidad Exacta (NO buffers)
```typescript
2 PAX → SOLO mesas de 2 (NUNCA 4)
3 PAX → SOLO mesas de 4 (NO de 2, NO de 6)
4 PAX → SOLO mesas de 4
5-6 PAX → Combinar 2 mesas (ejemplo: 2+4 o 4+4)
7-8 PAX → Combinar 2 mesas de 4
```

### 2. Bloqueo por Primera Selección
```typescript
// Si primera mesa es capacity=2
→ Bloquear TODAS las mesas capacity >2

// Si primera mesa es capacity=4
→ Bloquear TODAS las mesas capacity !=4
```

### 3. Sub-zonas en Terrace Campanari
```typescript
TERRACE_CAMPANARI_ZONA_1: T1-T6
TERRACE_CAMPANARI_ZONA_2: T7-T10
TERRACE_CAMPANARI_ZONA_3: T11-T14

// Contigüidad = misma sub-zona
```

## Implementación Propuesta

### Opción A: Lógica Hardcoded (Más Rápido)
- Validación estricta programada directamente
- No necesita DB adicional
- Performance óptima
- Cambios requieren deploy

### Opción B: Configuración en DB (Más Flexible)
- Tabla `restaurante.capacity_rules`
- Modificable sin deploy
- Overhead de query
- Más complejo

### Opción C: Híbrida (RECOMENDADO)
- **Lógica estricta programada** (core rules)
- **Sub-zonas en DB** (tabla `restaurante.table_zones`)
- Balance perfecto

## Código Propuesto

```typescript
// src/hooks/useCapacityValidation.ts - REESCRIBIR

const STRICT_CAPACITY_RULES = {
  1: [2],       // 1 PAX → solo mesas de 2
  2: [2],       // 2 PAX → solo mesas de 2
  3: [4],       // 3 PAX → solo mesas de 4
  4: [4],       // 4 PAX → solo mesas de 4
  5: [2, 4],    // 5 PAX → combinar 2+4
  6: [4, 4],    // 6 PAX → combinar 4+4
  7: [4, 4],    // 7 PAX → combinar 4+4
  8: [4, 4],    // 8 PAX → combinar 4+4
}

function validateTableSelection(
  table: Table,
  partySize: number,
  selectedTables: Table[]
): ValidationResult {

  // Regla 1: Solo capacidades permitidas para este partySize
  const allowedCapacities = STRICT_CAPACITY_RULES[partySize] || []

  if (selectedTables.length === 0) {
    // Primera selección
    if (!allowedCapacities.includes(table.capacity)) {
      return {
        canSelect: false,
        reason: `Para ${partySize} personas solo puedes elegir mesas de ${allowedCapacities.join(' o ')}`,
        severity: 'error'
      }
    }
  } else {
    // Ya hay mesas seleccionadas
    const firstTableCapacity = selectedTables[0].capacity

    // Regla 2: Todas las mesas deben tener la misma capacidad que la primera
    if (table.capacity !== firstTableCapacity) {
      return {
        canSelect: false,
        reason: `Ya elegiste una mesa de ${firstTableCapacity}. Solo puedes combinar mesas de la misma capacidad`,
        severity: 'error'
      }
    }
  }

  // Regla 3: No exceder capacidad total necesaria
  const currentCapacity = selectedTables.reduce((sum, t) => sum + t.capacity, 0)
  const newCapacity = currentCapacity + table.capacity

  if (newCapacity > partySize + 1) { // +1 de margen (no +50%)
    return {
      canSelect: false,
      reason: `Con esta mesa tendrías ${newCapacity} asientos para ${partySize} personas (excesivo)`,
      severity: 'error'
    }
  }

  return { canSelect: true }
}

// Sub-zonas Terrace Campanari
function getTableSubZone(tableNumber: string, location: string): string {
  if (location !== 'TERRACE_CAMPANARI') return location

  const num = parseInt(tableNumber.replace(/\D/g, ''))

  if (num >= 1 && num <= 6) return 'TERRACE_CAMPANARI_ZONA_1'
  if (num >= 7 && num <= 10) return 'TERRACE_CAMPANARI_ZONA_2'
  if (num >= 11 && num <= 14) return 'TERRACE_CAMPANARI_ZONA_3'

  return location
}

function validateContiguity(tables: Table[]): ContiguityValidation {
  if (tables.length <= 1) return { valid: true }

  const subZones = tables.map(t => getTableSubZone(t.number, t.location))
  const uniqueZones = new Set(subZones)

  if (uniqueZones.size > 1) {
    return {
      valid: false,
      reason: 'Las mesas deben estar en la misma zona'
    }
  }

  return { valid: true }
}
```

## Eliminaciones Necesarias

### ❌ ELIMINAR de .env.sample
```bash
NEXT_PUBLIC_ENABLE_STRICT_CAPACITY=false    # ❌ ELIMINAR
NEXT_PUBLIC_ENABLE_CONTIGUITY_CHECK=false   # ❌ ELIMINAR
```

### ✅ MANTENER (es básico)
```bash
NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION=true  # ✅ OK (ON/OFF general)
```

## Migración

1. **Revertir feature flags tontos** de .env.sample
2. **Reescribir useCapacityValidation** con lógica estricta
3. **Agregar getTableSubZone** para sub-zonas
4. **Tests actualizados** con reglas reales
5. **NO necesita cambios en MultiTableSelector** (solo usa el hook)

## Ejemplo de Uso Real

### Escenario 1: 2 PAX
```
Usuario selecciona: T1 (2 PAX) ✅
Usuario intenta: T6 (4 PAX) ❌ "Para 2 personas solo puedes elegir mesas de 2"
```

### Escenario 2: 4 PAX
```
Usuario selecciona: T6 (4 PAX) ✅
Usuario intenta: T1 (2 PAX) ❌ "Ya elegiste una mesa de 4. Solo puedes combinar mesas de la misma capacidad"
```

### Escenario 3: 6 PAX
```
Usuario selecciona: T6 (4 PAX, Zona 1) ✅
Usuario intenta: T12 (4 PAX, Zona 3) ❌ "Las mesas deben estar en la misma zona"
Usuario selecciona: T12 (4 PAX, Zona 1) ✅ (misma zona)
Total: 8 asientos para 6 PAX ✅ (dentro de +1 margen)
```

## Tiempo de Implementación

- Reescribir hook: 30 min
- Tests actualizados: 30 min
- Refactors pendientes: 2 horas
- **Total: 3 horas**

---

**¿Apruebo esta lógica o necesitas ajustes?**
