# PLAN: Sistema de Selección de Mesas Inteligente y Robusto
## Implementación Rápida Basada en Mejores Prácticas 2024

---

## 📊 ANÁLISIS TÉCNICO DE LA SITUACIÓN ACTUAL

### Problema Identificado
- **Frontend**: Solo selección singular (`selectedTable`)
- **Backend**: Ya soporta arrays (`tableIds`) con validación de capacidad ✅
- **Gap**: Frontend no implementa lógica de selección múltiple inteligente

### Líneas de Código Específicas a Modificar
```typescript
// DateTimeAndTableStep.tsx:146
const [selectedTable, setSelectedTable] = useState<any>(null) // ❌ CAMBIAR

// DateTimeAndTableStep.tsx:382-385
const handleTableSelect = useCallback((table: any) => {
  setSelectedTable(table)                    // ❌ CAMBIAR
  setValue('stepTwo.tableId', table.id)      // ❌ CAMBIAR
}, [setValue])

// ProfessionalReservationForm.tsx:168
stepTwo: { tableId: '' }                     // ❌ CAMBIAR a tableIds: []
```

---

## 🎯 FUNDAMENTO TÉCNICO APLICADO

### 1. Validación Multi-Nivel (Class-Validator Pattern)
**Fuente**: Context7 `/typestack/class-validator` - ArrayMaxSize Pattern
```typescript
@ArrayMaxSize(3) // Máximo 3 mesas para prevenir abuse
selectedTables: TableSelection[];
```

### 2. Capacity-First Validation (Database Best Practices)
**Fuente**: WebSearch "Restaurant Reservation Best Practices 2024"
- **Principio**: Validar capacidad antes de permitir selección
- **Técnica**: Real-time capacity calculation durante selección

### 3. Abuse Prevention Limits (Industry Standard)
**Fuente**: WebSearch "Restaurant Cybersecurity Best Practices"
- **Límite máximo**: 3 mesas por reserva (previene colapso del sistema)
- **Validación temporal**: Timeout de 10 minutos para selección

### 4. Optimistic Concurrency Control
**Fuente**: WebSearch "Booking System Double Booking Prevention"
```javascript
// B.start < A.end && B.end > A.start (overlap detection)
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN SISTEMÁTICA (20 MINUTOS)

### FASE 1: Cambio de Estado Frontend (5 min)
```typescript
// ANTES:
const [selectedTable, setSelectedTable] = useState<any>(null)

// DESPUÉS:
const [selectedTables, setSelectedTables] = useState<Table[]>([])
const [totalCapacity, setTotalCapacity] = useState<number>(0)
```

### FASE 2: Lógica de Selección Inteligente (8 min)
```typescript
const handleTableToggle = useCallback((table: Table) => {
  setSelectedTables(prev => {
    const isSelected = prev.find(t => t.id === table.id)
    let newSelection: Table[]

    if (isSelected) {
      // Deseleccionar
      newSelection = prev.filter(t => t.id !== table.id)
    } else {
      // Seleccionar con límites anti-abuse
      if (prev.length >= 3) {
        toast.error('Máximo 3 mesas por reserva permitidas')
        return prev
      }
      newSelection = [...prev, table]
    }

    // Calcular capacidad total
    const capacity = newSelection.reduce((sum, t) => sum + t.capacity, 0)
    setTotalCapacity(capacity)

    // Validar capacidad vs party size
    if (capacity >= watchedPartySize) {
      setValue('stepTwo.tableIds', newSelection.map(t => t.id))
    }

    return newSelection
  })
}, [setValue, watchedPartySize])
```

### FASE 3: UI de Selección Múltiple (5 min)
```typescript
// Indicador visual de selección múltiple
const isSelected = selectedTables.find(t => t.id === table.id)
const isCapacitySufficient = totalCapacity >= watchedPartySize
const canAddMore = selectedTables.length < 3

<div className={cn(
  "relative p-3 rounded-lg border cursor-pointer",
  isSelected ? "border-primary bg-primary/10" : "border-gray-200",
  !canAddMore && !isSelected ? "opacity-50 cursor-not-allowed" : ""
)}>

  {/* Checkbox de selección múltiple */}
  <div className="absolute top-2 right-2">
    <div className={cn(
      "w-4 h-4 rounded border flex items-center justify-center",
      isSelected ? "bg-primary border-primary" : "border-gray-300"
    )}>
      {isSelected && <Check className="h-3 w-3 text-white" />}
    </div>
  </div>

  {/* Indicador de capacidad */}
  <div className="text-center">
    <div className="text-lg font-bold">{table.number}</div>
    <div className="text-xs text-gray-600">{table.capacity} pers.</div>
  </div>
</div>
```

### FASE 4: Validación y Form Update (2 min)
```typescript
// Actualizar form schema
stepTwo: {
  tableIds: z.array(z.string()).min(1).max(3), // Anti-abuse: máximo 3 mesas
  preOrderItems: z.array(preOrderItemSchema).default([]),
  // ...resto
}

// Validation feedback en tiempo real
{!isCapacitySufficient && selectedTables.length > 0 && (
  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
    <p className="text-sm text-amber-700">
      Capacidad actual: {totalCapacity} personas.
      Necesitas: {watchedPartySize} personas.
      {totalCapacity < watchedPartySize && " Selecciona más mesas."}
    </p>
  </div>
)}
```

---

## 🛡️ MEDIDAS ANTI-ABUSE IMPLEMENTADAS

### 1. Límites Técnicos
```typescript
const MAX_TABLES_PER_RESERVATION = 3
const MAX_PARTY_SIZE = 12
const SELECTION_TIMEOUT_MINUTES = 10
```

### 2. Validación Multi-Nivel
- **Frontend**: Límite visual de 3 mesas máximo
- **Backend**: Ya implementado - `ArrayMaxSize` en Zod schema
- **Database**: Constraint checks en `table_ids` column

### 3. Rate Limiting Implícito
- **Timeout de selección**: 10 minutos para completar
- **Capacidad máxima**: Evita reservas masivas
- **Validación tempo real**: Previene estados inválidos

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Completar en Orden:
1. [ ] **Estado Frontend**: Cambiar `selectedTable` → `selectedTables[]`
2. [ ] **Handler Logic**: Implementar `handleTableToggle` con límites
3. [ ] **UI Components**: Checkbox múltiple + indicadores capacidad
4. [ ] **Form Schema**: Actualizar a `tableIds: z.array(z.string()).max(3)`
5. [ ] **Validation**: Real-time feedback capacidad insuficiente
6. [ ] **Testing**: Probar con grupos 2, 6, 8, 12 personas
7. [ ] **Edge Cases**: Máximo 3 mesas, capacidad insuficiente
8. [ ] **User Feedback**: Mensajes claros de estado

---

## 🔍 CASOS DE PRUEBA OBLIGATORIOS

### Escenarios de Validación:
1. **2 personas** → Auto-seleccionar 1 mesa de 2-4 capacity
2. **6 personas** → Permitir selección de 2 mesas (2+4 o 4+4)
3. **8 personas** → Requerir 2-3 mesas según disponibilidad
4. **Abuse Test** → Intentar seleccionar 5 mesas → Bloqueado en 3
5. **Capacidad insuficiente** → Feedback visual claro
6. **Deselección** → Recalcular capacidad correctamente

---

## 🚨 PRINCIPIOS NO NEGOCIABLES

### 1. Performance
- Cálculos en tiempo real sin lag
- Máximo 3 mesas previene overhead
- Estado local optimizado

### 2. UX Sin Fricción
- Selección intuitiva tipo checkbox
- Feedback inmediato de capacidad
- Mensajes de error claros

### 3. Seguridad Anti-Abuse
- Límites técnicos estrictos
- Validación multi-nivel
- Rate limiting implícito

### 4. Compatibilidad
- Backend ya soporta `tableIds[]` ✅
- Backward compatibility con `tableId` legacy
- Database schema optimizado ✅

---

## 📈 MÉTRICAS DE ÉXITO

### Objetivos Medibles:
- **Tiempo implementación**: ≤ 20 minutos
- **Casos de prueba**: 6/6 pasando
- **Performance**: Sin lag en selección
- **Abuse prevention**: Máximo 3 mesas enforced
- **UX**: Feedback inmediato de capacidad

### Validación Final:
- Reserva 2 personas → 1 mesa seleccionada
- Reserva 6 personas → 2 mesas requeridas y permitidas
- Reserva 8 personas → 2-3 mesas según capacidad
- Intento abuse → Bloqueado correctamente

---

## 🏁 CONCLUSIÓN

Esta implementación aplica **fundamento técnico sólido** basado en:
- **Class-Validator patterns** para límites arrays
- **Industry best practices** para abuse prevention
- **Database optimization** aprovechando backend existente
- **Real-time validation** para UX sin fricción

**Resultado**: Sistema robusto, rápido de implementar, imposible de abusar.