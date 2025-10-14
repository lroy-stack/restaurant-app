# 🎯 PROPUESTA: VISUAL FLOOR PLAN SELECTOR - CLIENTE PÚBLICO

**Rama:** `feature/visual-table-selector-reservas`  
**Fecha:** $(date +%Y-%m-%d)  
**Estado:** Análisis completado, pendiente implementación

---

## 📊 1. ANÁLISIS DEL SISTEMA ACTUAL

### 1.1 Arquitectura Existente

**Stack actual:**
- `EnhancedDateTimeAndTableStep.tsx` - Componente principal
- `MultiTableSelector.tsx` - Grid de botones (6 columnas)
- `useReservations.ts` - Hook con API `/api/tables/availability`
- Backend retorna mesas con coordenadas DB: `position_x`, `position_y`, `rotation`, `width`, `height`

**Problema crítico (línea 92 useReservations.ts):**
```typescript
.filter((table: any) => table.available) // ❌ OCULTA mesas no disponibles
```

**Flujo actual:**
```
Usuario selecciona fecha/hora
   ↓
API /api/tables/availability → Retorna TODAS las mesas + estado
   ↓
Frontend filtra → Muestra SOLO available:true
   ↓
MultiTableSelector → Grid 6 columnas (T1, T2, T3...)
   ↓
Usuario elige sin contexto espacial ❌
```

### 1.2 Limitaciones Detectadas

| Problema | Impacto | Prioridad |
|----------|---------|-----------|
| Mesas no disponibles invisibles | Usuario no ve contexto completo | 🔴 Alta |
| Sin ubicación espacial real | Decisión ciega (solo números) | 🔴 Alta |
| Grid genérico | No refleja layout físico | 🟡 Media |
| Mobile no optimizado para contexto | Experiencia pobre en 60% usuarios | 🔴 Alta |

---

## 🌐 2. RESEARCH & BEST PRACTICES

### 2.1 Industria (OpenTable, Resy, Alex Reservations)

**Hallazgos clave:**
- ✅ Floor plan visual aumenta conversión hasta **30%**
- ✅ 60%+ reservas desde móvil → Mobile-first obligatorio
- ⚠️ Floor plans complejos pueden ser "cumbersome" (Resy feedback)
- ✅ Dual mode (Map + List) maximiza accesibilidad

**Lección principal:** Floor plan debe ser **SIMPLE** para cliente, **DETALLADO** para admin.

### 2.2 Tecnologías Evaluadas

| Tecnología | Pros | Contras | Veredicto |
|------------|------|---------|-----------|
| **React Konva** | Ya lo usamos en admin, drag & drop | ❌ Overkill, 180KB bundle, complejo | ❌ No usar |
| **SVG nativo** | Ligero, escalable, accesible | Requiere viewBox calculations | ✅ **RECOMENDADO** |
| **CSS Grid + Absolute** | Super simple, 0 deps | Menos flexible para scaling | ✅ **ALTERNATIVA** |
| **Canvas nativo** | Alto performance | Mala accesibilidad, no SEO | ❌ No usar |

**DECISIÓN:** Usar **SVG con absolute positioning** por coordenadas DB.

---

## 🎨 3. PROPUESTA DE ARQUITECTURA

### 3.1 Componente Principal: `FloorPlanSelector`

**Ubicación:** `src/components/reservations/FloorPlanSelector.tsx`

**Props:**
```typescript
interface FloorPlanSelectorProps {
  tables: Array<{
    id: string
    number: string
    position_x: number  // Desde DB
    position_y: number  // Desde DB
    width: number       // Desde DB
    height: number      // Desde DB
    rotation: number    // Desde DB (0, 90, 180, 270)
    capacity: number
    location: string
    available: boolean  // ← KEY: Ya no filtrar, mostrar todas
  }>
  selectedTableIds: string[]
  onSelectionChange: (tableIds: string[]) => void
  partySize: number
  language: 'es' | 'en' | 'de'
}
```

### 3.2 Renderizado SVG Dinámico

**Concepto:**
```typescript
// Calcular bounds del contenido
const bounds = {
  minX: Math.min(...tables.map(t => t.position_x)),
  minY: Math.min(...tables.map(t => t.position_y)),
  maxX: Math.max(...tables.map(t => t.position_x + t.width)),
  maxY: Math.max(...tables.map(t => t.position_y + t.height))
}

const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`

return (
  <svg viewBox={viewBox} className="w-full h-auto max-h-[600px]">
    {tables.map(table => (
      <g 
        key={table.id}
        transform={`translate(${table.position_x}, ${table.position_y}) rotate(${table.rotation})`}
      >
        <rect
          width={table.width}
          height={table.height}
          rx={4}
          className={cn(
            "transition-all cursor-pointer",
            table.available 
              ? "fill-green-100 stroke-green-500 hover:fill-green-200"
              : "fill-gray-100 stroke-gray-400 opacity-40 cursor-not-allowed"
          )}
          onClick={table.available ? () => handleSelect(table) : undefined}
        />
        <text
          x={table.width / 2}
          y={table.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold pointer-events-none"
        >
          {table.number}
        </text>
      </g>
    ))}
  </svg>
)
```

### 3.3 Estados Visuales

| Estado | Color Fill | Stroke | Opacity | Cursor | Acción |
|--------|-----------|--------|---------|--------|--------|
| **Disponible** | `green-100` | `green-500` | 1.0 | `pointer` | Click → Seleccionar |
| **No disponible** | `gray-100` | `gray-400` | 0.4 | `not-allowed` | Click → Ignorar |
| **Seleccionada** | `blue-500` | `blue-700` | 1.0 | `pointer` | Click → Deseleccionar |
| **Ocupada** | `red-100` | `red-500` | 0.4 | `not-allowed` | Tooltip "Ocupada" |

### 3.4 Mobile Optimization

**Estrategia:**
```typescript
// Zoom & Pan usando transform CSS
const [scale, setScale] = useState(1)
const [pan, setPan] = useState({ x: 0, y: 0 })

// Touch gestures
<div 
  className="touch-pan-y overflow-auto"
  onTouchStart={handlePinchStart}
  onTouchMove={handlePinch}
>
  <div style={{ transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)` }}>
    <svg>...</svg>
  </div>
</div>

// Controles zoom
<div className="fixed bottom-4 right-4 flex gap-2">
  <Button onClick={() => setScale(s => s * 1.2)}>+</Button>
  <Button onClick={() => setScale(s => s / 1.2)}>-</Button>
  <Button onClick={fitToScreen}>⌂</Button>
</div>
```

---

## 🔧 4. CAMBIOS EN CÓDIGO EXISTENTE

### 4.1 useReservations.ts (Línea 92)

**ANTES:**
```typescript
const availableTables = data.data.tables
  .filter((table: any) => table.available) // ❌ Oculta no disponibles
  .map((table: any) => ({
    id: table.tableId,
    number: table.tableNumber,
    capacity: table.capacity,
    location: table.zone,
    priceMultiplier: 1.0
  }))
```

**DESPUÉS:**
```typescript
const allTables = data.data.tables
  .map((table: any) => ({
    id: table.tableId,
    number: table.tableNumber,
    capacity: table.capacity,
    location: table.zone,
    available: table.available,        // ← MANTENER
    position_x: table.position_x || 0, // ← AGREGAR
    position_y: table.position_y || 0, // ← AGREGAR
    width: table.width || 80,          // ← AGREGAR
    height: table.height || 80,        // ← AGREGAR
    rotation: table.rotation || 0,     // ← AGREGAR
    priceMultiplier: 1.0
  }))

// Separar para backwards compatibility
const availableTables = allTables.filter(t => t.available)
const unavailableTables = allTables.filter(t => !t.available)
```

### 4.2 EnhancedDateTimeAndTableStep.tsx (Línea 628)

**AGREGAR toggle de vista:**
```typescript
const [viewMode, setViewMode] = useState<'floor' | 'grid'>('floor')

return (
  <>
    {/* Tabs para cambiar vista */}
    <Tabs value={viewMode} onValueChange={setViewMode}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="floor">
          <Map className="h-4 w-4 mr-2" />
          Vista Sala
        </TabsTrigger>
        <TabsTrigger value="grid">
          <Grid className="h-4 w-4 mr-2" />
          Vista Lista
        </TabsTrigger>
      </TabsList>
    </Tabs>

    {/* Condicional rendering */}
    {viewMode === 'floor' ? (
      <FloorPlanSelector
        tables={transformedTables}  // TODAS (disponibles + no disponibles)
        selectedTableIds={selectedTableIds}
        onSelectionChange={handleTableSelectionChange}
        partySize={partySize}
        language={language}
      />
    ) : (
      <MultiTableSelector
        tables={availableTables}  // Solo disponibles (backwards compat)
        selectedTableIds={selectedTableIds}
        onSelectionChange={handleTableSelectionChange}
        partySize={partySize}
        maxSelections={5}
      />
    )}
  </>
)
```

### 4.3 API Response (Validar)

**Verificar que `/api/tables/availability` retorna:**
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "tableId": "table-123",
        "tableNumber": "T1",
        "capacity": 4,
        "zone": "TERRACE_CAMPANARI",
        "available": true,
        "position_x": 100,  // ← CRÍTICO
        "position_y": 200,  // ← CRÍTICO
        "width": 80,        // ← CRÍTICO
        "height": 120,      // ← CRÍTICO
        "rotation": 0       // ← CRÍTICO
      }
    ]
  }
}
```

**Si no existe:** Agregar en endpoint backend.

---

## 📋 5. PLAN DE IMPLEMENTACIÓN (5 FASES)

### Fase 1: Backend Validation (30 min)
- [ ] Verificar que API retorna `position_x`, `position_y`, `width`, `height`, `rotation`
- [ ] Si no: Agregar query en `/api/tables/availability` para incluir estos campos
- [ ] Test con Postman/cURL

### Fase 2: Data Flow Fix (45 min)
- [ ] Remover filtro `.filter(available)` en `useReservations.ts:92`
- [ ] Actualizar interface `AvailabilityData` para incluir campos de posición
- [ ] Separar `allTables` vs `availableTables` para backwards compatibility
- [ ] Test que grid view sigue funcionando

### Fase 3: FloorPlanSelector Component (3h)
- [ ] Crear `FloorPlanSelector.tsx` con SVG rendering
- [ ] Implementar estados visuales (colores según disponibilidad)
- [ ] Click handlers (solo mesas disponibles clickeables)
- [ ] Responsive: SVG con viewBox auto-calculado
- [ ] Tooltip hover con info de mesa
- [ ] Legend component (leyenda de colores)

### Fase 4: Mobile UX (1.5h)
- [ ] Zoom controls (+, -, fit)
- [ ] Touch gestures para pan (overflow-auto básico)
- [ ] Viewport optimization (max-height, aspect ratio)
- [ ] Test en iPhone SE, iPad, Desktop

### Fase 5: Integration & Polish (1h)
- [ ] Toggle Tabs (Floor / Grid view)
- [ ] Loading states
- [ ] Animaciones suaves (transitions)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] i18n (español, inglés, alemán)

**TIEMPO TOTAL:** ~6.5 horas

---

## 🎨 6. MOCKUPS VISUALES

### Desktop (1200px+)

```
┌─────────────────────────────────────────────────────────────┐
│ [Vista Sala 🗺️] [Vista Lista 📋]                    [+][-][⌂]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│        🟢 T1          🟢 T2      ⚫ T3                       │
│         (4p)           (2p)      (6p)                        │
│                                  OCUPADA                      │
│                                                               │
│   🟢 T5                  🟢 T6                               │
│    (4p)                   (4p)                               │
│                                                               │
│           ⚫ T10     🟢 T11    🔵 T12 ✓                      │
│            (2p)      (4p)      (6p)                          │
│          RESERVADA                 SELECCIONADA              │
│                                                               │
│                                                               │
│ Leyenda: 🟢 Disponible  ⚫ No disponible  🔵 Seleccionada   │
│                                                               │
│ [Seleccionadas: 1 mesa • Capacidad: 6 personas]  [Continuar]│
└─────────────────────────────────────────────────────────────┘
```

### Mobile (375px)

```
┌─────────────────────┐
│ [Sala] [Lista]  🔍 │
├─────────────────────┤
│                     │
│   🟢    🟢    ⚫   │
│   T1    T2    T3   │
│   4p    2p    6p   │
│                     │
│     🟢      🟢     │
│     T5      T6     │
│     4p      4p     │
│                     │
│   ⚫  🟢  🔵✓     │
│   T10 T11 T12     │
│                     │
├─────────────────────┤
│ 🟢 Libre  ⚫ No    │
│ 🔵 Elegida         │
├─────────────────────┤
│ 1 mesa • 6 pers    │
│ [Continuar →]      │
└─────────────────────┘
```

---

## ✅ 7. CRITERIOS DE ÉXITO

### KPIs Técnicos
- [ ] Todas las mesas renderizadas (disponibles + no disponibles)
- [ ] Coordenadas DB respetadas pixel-perfect
- [ ] Performance: FCP < 1.5s, LCP < 2.5s
- [ ] Mobile: Touch-friendly (44px min touch targets)
- [ ] Accesibilidad: WCAG 2.1 AA (keyboard nav, ARIA)

### KPIs UX
- [ ] Usuario puede ver contexto completo de sala
- [ ] Mesas no disponibles claramente distinguibles
- [ ] Click solo funciona en mesas disponibles
- [ ] Tooltip informativo en hover
- [ ] Fallback a grid view disponible

### KPIs Negocio (Post-launch)
- [ ] Conversión booking +10-30% (benchmark industria)
- [ ] Tiempo en página +20% (mayor engagement)
- [ ] Bounce rate -15% (menos fricción)
- [ ] Mobile completion rate +25%

---

## 🚨 8. RIESGOS & MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| API no retorna coordenadas | Media | Alto | Verificar Fase 1, agregar a backend si falta |
| SVG no escala bien en mobile | Baja | Medio | Usar viewBox dinámico + zoom controls |
| Performance con 50+ mesas | Baja | Medio | Lazy render zonas, memoization |
| Usuarios prefieren grid | Baja | Bajo | Mantener toggle dual mode |

---

## 📦 9. ENTREGABLES

### Código
```
src/components/reservations/
├── FloorPlanSelector.tsx         (NUEVO - 250 líneas)
├── FloorPlanLegend.tsx           (NUEVO - 50 líneas)
├── EnhancedDateTimeAndTableStep.tsx (MODIFICAR - agregar toggle)
└── MultiTableSelector.tsx        (SIN CAMBIOS - mantener)

src/hooks/
└── useReservations.ts            (MODIFICAR - quitar filtro)
```

### Documentación
- [ ] README actualizado con screenshots
- [ ] JSDoc en componentes nuevos
- [ ] Storybook stories (opcional)

---

## 🎯 10. DECISIÓN FINAL & NEXT STEPS

**RECOMENDACIÓN:** ✅ **IMPLEMENTAR**

**Justificación:**
1. **Bajo riesgo técnico:** Reutiliza coordenadas DB existentes
2. **Alto impacto UX:** Mejora percibida significativa
3. **Inversión razonable:** 6.5h para feature diferenciadora
4. **Fallback seguro:** Grid view como plan B

**Próximos pasos inmediatos:**
1. ✅ Aprobar propuesta
2. ⏳ Fase 1: Validar backend (30 min)
3. ⏳ Fase 2: Fix data flow (45 min)
4. ⏳ Fase 3: Crear componente (3h)

---

**Autor:** Claude Code Assistant  
**Rama:** `feature/visual-table-selector-reservas`  
**Estado:** ⏸️ Pendiente aprobación para continuar

