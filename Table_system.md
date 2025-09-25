# 🏢 TABLE SYSTEM REDISEÑO - REACT-KONVA ARCHITECTURE

## 📋 **EXECUTIVE SUMMARY**

### **OBJETIVO**
Rediseñar completamente `/dashboard/mesas?tab=floor-plan` utilizando React-Konva para crear un sistema de gestión de mesas interactivo, de alta performance y scalable.

### **CAMBIOS ARQUITECTURALES**
- **ANTES**: ReactFlow + react-grid-layout (pesado, complejo)
- **DESPUÉS**: React-Konva (canvas nativo, performance optimizada)
- **RESULTADO**: Floor plan interactivo con drag & drop, tiempo real, y UX profesional

---

## 🔍 **RESEARCH ANALYSIS - CANVAS LIBRARIES**

### **React-Konva** ⭐️ **SELECCIONADA** (Trust Score: 7.6)
```typescript
// VENTAJAS CLAVE:
✅ Declarative React integration
✅ High performance canvas rendering
✅ Built-in drag & drop support
✅ Event handling nativo
✅ Next.js compatible
✅ TypeScript support
✅ Mobile touch support
```

### **Comparación vs Alternativas**
| Library | Trust Score | React Integration | Performance | Complexity |
|---------|-------------|------------------|-------------|------------|
| React-Konva | 7.6 | ✅ Native | ⚡ High | 🟢 Simple |
| Fabric.js | 6.8 | 🔶 Manual | ⚡ High | 🔴 Complex |
| JointJS | 7.5 | 🔶 Manual | 🔶 Medium | 🔴 Complex |

---

## 🏗️ **NUEVA ARQUITECTURA - ENTERPRISE PATTERN**

### **Directory Structure**
```
src/app/(admin)/dashboard/mesas/
├── components/
│   ├── floor-plan-v2/           # 🆕 Nueva implementación
│   │   ├── Mesa.tsx            # Individual table component
│   │   ├── Plano.tsx           # Main floor plan canvas
│   │   ├── Modal.tsx           # Reservation info modal
│   │   ├── Toolbar.tsx         # Controls & filters
│   │   └── index.ts            # Clean exports
│   ├── floor-plan/             # 🔴 DEPRECATED - ReactFlow
│   └── table-tabs.tsx          # ✏️ UPDATE - comment advanced-plan
│
├── stores/
│   ├── useTableSystemStore.ts  # 🆕 React-Konva state
│   ├── useFloorPlanStore.ts    # 🔴 DEPRECATED
│   └── useTableStore.ts        # ✏️ REFACTOR - keep core logic
│
├── services/
│   ├── reservasApi.ts          # 🆕 API calls
│   ├── wsService.ts            # 🆕 WebSocket/Realtime
│   └── tableStates.ts          # 🆕 State calculations
│
└── utils/
    ├── konvaHelpers.ts         # 🆕 Canvas utilities
    ├── tableColors.ts          # 🆕 Status colors
    └── floorPlanConfig.ts      # 🆕 Layout configs
```

---

## 🎯 **COMPONENT ARCHITECTURE**

### **1. Mesa.tsx - Individual Table Component**
```typescript
interface MesaProps {
  id: string
  number: string // "T1", "S10"
  position: { x: number, y: number }
  capacity: number
  status: TableStatus
  currentReservation?: ReservationData
  isSelected: boolean
  onSelect: (id: string) => void
  onDragEnd: (id: string, position: Position) => void
}

// REACT-KONVA IMPLEMENTATION
import { Group, Circle, Text, Rect } from 'react-konva'

export const Mesa = ({ id, number, position, capacity, status, ... }: MesaProps) => {
  const colors = getStatusColors(status)

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      {/* Table visual - Circle for round, Rect for square */}
      <Circle
        radius={capacity * 8 + 20} // Size based on capacity
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={isSelected ? 3 : 1}
      />

      {/* Table number */}
      <Text
        text={number}
        fontSize={14}
        fontFamily="Inter"
        fill="#333"
        align="center"
        offsetX={10}
        offsetY={7}
      />

      {/* Capacity indicator */}
      <Text
        text={`${capacity}p`}
        fontSize={10}
        fill="#666"
        offsetX={8}
        y={15}
      />
    </Group>
  )
}
```

### **2. Plano.tsx - Main Canvas Component**
```typescript
import { Stage, Layer } from 'react-konva'
import { useTableSystemStore } from '@/stores/useTableSystemStore'

export const Plano = () => {
  const {
    tables,
    selectedTableId,
    floorPlanConfig,
    updateTablePosition,
    selectTable
  } = useTableSystemStore()

  const handleTableDragEnd = (id: string, newPosition: Position) => {
    updateTablePosition(id, newPosition)
    // Auto-save to backend
    saveFloorPlanLayout()
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      <Stage
        width={floorPlanConfig.width}
        height={floorPlanConfig.height}
        scaleX={floorPlanConfig.scale}
        scaleY={floorPlanConfig.scale}
      >
        {/* Background layer */}
        <Layer>
          <BackgroundGrid />
          <ZoneAreas zones={ENIGMA_ZONES} />
        </Layer>

        {/* Tables layer */}
        <Layer>
          {tables.map(table => (
            <Mesa
              key={table.id}
              {...table}
              isSelected={selectedTableId === table.id}
              onSelect={selectTable}
              onDragEnd={handleTableDragEnd}
            />
          ))}
        </Layer>

        {/* UI layer */}
        <Layer>
          <ZoomControls />
          <SelectedTableInfo />
        </Layer>
      </Stage>
    </div>
  )
}
```

### **3. Toolbar.tsx - Controls & Filters**
```typescript
export const Toolbar = () => {
  const {
    zoomIn,
    zoomOut,
    resetView,
    selectedZone,
    setZoneFilter,
    floorPlanMode,
    setFloorPlanMode
  } = useTableSystemStore()

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      {/* View controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={zoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={zoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetView}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Zone filter */}
      <Select value={selectedZone} onValueChange={setZoneFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por zona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las zonas</SelectItem>
          {Object.entries(ENIGMA_ZONES).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status legend */}
      <StatusLegend />
    </div>
  )
}
```

---

## 🗃️ **STATE MANAGEMENT - ZUSTAND ARCHITECTURE**

### **useTableSystemStore.ts - Main Store**
```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface TableSystemStore {
  // State
  tables: TableData[]
  selectedTableId: string | null
  floorPlanConfig: FloorPlanConfig
  selectedZone: string
  isLoading: boolean

  // Actions
  loadTables: () => Promise<void>
  updateTablePosition: (id: string, position: Position) => void
  selectTable: (id: string) => void
  setZoneFilter: (zone: string) => void

  // Canvas actions
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void

  // Real-time updates
  subscribeToUpdates: () => void
  unsubscribeFromUpdates: () => void
}

export const useTableSystemStore = create<TableSystemStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    tables: [],
    selectedTableId: null,
    floorPlanConfig: DEFAULT_FLOOR_PLAN_CONFIG,
    selectedZone: 'all',
    isLoading: false,

    // Load tables from API
    loadTables: async () => {
      set({ isLoading: true })
      try {
        const tables = await fetchTablesWithStatus()
        set({ tables, isLoading: false })
      } catch (error) {
        console.error('Error loading tables:', error)
        set({ isLoading: false })
      }
    },

    // Update table position (optimistic update)
    updateTablePosition: (id: string, position: Position) => {
      set(state => ({
        tables: state.tables.map(table =>
          table.id === id
            ? { ...table, position }
            : table
        )
      }))

      // Background save
      saveTablePosition(id, position)
    },

    // Canvas controls
    zoomIn: () => set(state => ({
      floorPlanConfig: {
        ...state.floorPlanConfig,
        scale: Math.min(state.floorPlanConfig.scale * 1.2, 3)
      }
    })),

    zoomOut: () => set(state => ({
      floorPlanConfig: {
        ...state.floorPlanConfig,
        scale: Math.max(state.floorPlanConfig.scale / 1.2, 0.3)
      }
    })),

    // WebSocket subscription
    subscribeToUpdates: () => {
      const { subscribeToTableUpdates } = get()
      subscribeToTableUpdates((updatedTable) => {
        set(state => ({
          tables: state.tables.map(table =>
            table.id === updatedTable.id
              ? { ...table, ...updatedTable }
              : table
          )
        }))
      })
    }
  }))
)
```

---

## 🌐 **SERVICES ARCHITECTURE**

### **reservasApi.ts - API Integration**
```typescript
// API service following existing patterns
export class ReservasApiService {
  private baseURL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1'
  private headers = {
    'Accept': 'application/json',
    'Accept-Profile': 'restaurante',
    'Content-Profile': 'restaurante',
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }

  async getTablesWithReservations(): Promise<TableData[]> {
    const response = await fetch(
      `${this.baseURL}/tables?select=*,reservations(*)&order=number`,
      { headers: this.headers }
    )

    const tables = await response.json()
    return tables.map(table => ({
      ...table,
      currentStatus: calculateTableStatus(table),
      currentReservation: getCurrentReservation(table.reservations)
    }))
  }

  async updateTablePosition(id: string, position: Position): Promise<void> {
    await fetch(`${this.baseURL}/tables?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        floor_plan_x: position.x,
        floor_plan_y: position.y
      })
    })
  }
}
```

### **wsService.ts - Real-time Updates**
```typescript
import { createClient } from '@supabase/supabase-js'

export class WebSocketService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  subscribeToTableUpdates(callback: (table: TableData) => void) {
    return this.supabase
      .channel('table-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'restaurante',
          table: 'tables'
        },
        (payload) => {
          callback(payload.new as TableData)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'restaurante',
          table: 'reservations'
        },
        () => {
          // Refresh table status when reservations change
          this.refreshTableStatus()
        }
      )
      .subscribe()
  }

  private async refreshTableStatus() {
    // Trigger re-fetch of table data
    window.dispatchEvent(new CustomEvent('tables-update'))
  }
}
```

---

## 🎨 **DESIGN PATTERNS & BEST PRACTICES**

### **Status Colors System**
```typescript
// utils/tableColors.ts
export const TABLE_STATUS_COLORS = {
  available: {
    fill: '#10B981', // Green
    stroke: '#059669',
    text: '#FFFFFF'
  },
  reserved: {
    fill: '#F59E0B', // Orange
    stroke: '#D97706',
    text: '#FFFFFF'
  },
  occupied: {
    fill: '#EF4444', // Red
    stroke: '#DC2626',
    text: '#FFFFFF'
  },
  maintenance: {
    fill: '#6B7280', // Gray
    stroke: '#4B5563',
    text: '#FFFFFF'
  }
} as const
```

### **Performance Optimizations**
```typescript
// Memoized table component
export const Mesa = React.memo(({ id, ...props }: MesaProps) => {
  // Only re-render if essential props change
  return <MesaComponent {...props} />
}, (prevProps, nextProps) => {
  return (
    prevProps.status === nextProps.status &&
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.isSelected === nextProps.isSelected
  )
})

// Virtualized rendering for large floor plans
const useVirtualizedTables = (tables: TableData[], viewport: Viewport) => {
  return useMemo(() => {
    return tables.filter(table =>
      isTableInViewport(table.position, viewport)
    )
  }, [tables, viewport])
}
```

---

## 📱 **RESPONSIVE & MOBILE SUPPORT**

### **Touch Gestures**
```typescript
// Mobile-first touch handling
const handleTouchEvents = useCallback((e: KonvaEventObject<TouchEvent>) => {
  if (e.evt.touches.length === 2) {
    // Pinch to zoom
    handlePinchZoom(e)
  } else if (e.evt.touches.length === 1) {
    // Single touch drag
    handleTableDrag(e)
  }
}, [])
```

### **Responsive Layout**
```typescript
// Adaptive canvas sizing
const useResponsiveCanvas = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: Math.min(container.offsetHeight, 600)
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return dimensions
}
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **FASE 1: Foundation (Sprint 1 - 1 week)**
- [ ] Comment out advanced-plan tab
- [ ] Create new floor-plan-v2 components structure
- [ ] Implement basic React-Konva Mesa component
- [ ] Setup useTableSystemStore with Zustand

### **FASE 2: Core Features (Sprint 2 - 1 week)**
- [ ] Implement Plano canvas with drag & drop
- [ ] Add Toolbar with zoom controls
- [ ] Implement table status colors and legends
- [ ] Add zone filtering functionality

### **FASE 3: Integration (Sprint 3 - 1 week)**
- [ ] Integrate with existing API endpoints
- [ ] Add WebSocket real-time updates
- [ ] Implement Modal for reservation details
- [ ] Performance optimization and testing

### **FASE 4: Polish & Deploy (Sprint 4 - 1 week)**
- [ ] Mobile responsiveness
- [ ] Touch gesture support
- [ ] Accessibility improvements
- [ ] Production deployment and monitoring

---

## 🔧 **MIGRATION STRATEGY**

### **Gradual Migration Approach**
1. **Keep both implementations** during transition
2. **Feature flag** to switch between old/new
3. **A/B testing** with real users
4. **Performance monitoring** and comparison
5. **Complete cutover** after validation

### **Rollback Plan**
- Keep existing ReactFlow implementation as backup
- Database schema remains unchanged
- Easy toggle via environment variable
- Zero downtime deployment strategy

---

## 📊 **SUCCESS METRICS**

### **Performance KPIs**
- **Canvas Rendering**: <16ms (60 FPS)
- **Drag Response Time**: <50ms
- **Initial Load**: <2 seconds
- **Memory Usage**: <100MB for 50+ tables

### **User Experience KPIs**
- **Click-to-Action**: <200ms
- **Mobile Touch Response**: <100ms
- **Zoom Performance**: Smooth 60 FPS
- **Real-time Update Lag**: <1 second

### **Business KPIs**
- **Table Management Efficiency**: 30% faster
- **Reservation Accuracy**: 99%+ status sync
- **User Adoption**: 90%+ staff usage
- **Error Rate**: <1% failed interactions

---

## 🔒 **SECURITY & DATA INTEGRITY**

### **Real-time Data Validation**
- Server-side validation for all position updates
- Conflict resolution for concurrent edits
- Audit logging for floor plan changes
- Role-based access control (ADMIN only can modify layout)

### **Error Handling**
- Graceful degradation if WebSocket fails
- Offline mode with sync when reconnected
- Automatic retry for failed API calls
- User feedback for all error states

---

## 📚 **TECHNICAL REFERENCES**

### **React-Konva Integration Patterns**
- Official docs: https://konvajs.org/docs/react/
- Performance guide: Canvas optimization techniques
- Event handling: Touch and mouse event coordination
- Next.js compatibility: SSR considerations

### **Restaurant Floor Plan Best Practices**
- Industry standard table sizing ratios
- Color accessibility (WCAG 2.1 AA compliant)
- Touch target sizes (44px minimum)
- Visual hierarchy and information density

---

**NEXT STEPS**: Comenzar implementación FASE 1 con comentar advanced-plan tab y crear estructura base de componentes React-Konva.

**ESTIMATED EFFORT**: 4 sprints (1 month) con equipo de 2 desarrolladores

**RISK MITIGATION**: Approach gradual con rollback plan y feature flags para deployment seguro