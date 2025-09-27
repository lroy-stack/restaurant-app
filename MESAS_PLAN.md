# PLAN EJECUTABLE: TABLE FLOOR PLAN MICROSERVICE

## 🎯 OBJETIVO
Microservicio visual de plano de mesas para dashboard admin usando React Konva.

**FLUJO TARGET**:
1. Staff ve mapa visual de 34 mesas en tiempo real
2. Click mesa → Modal.tsx con comandero/info reserva
3. Toolbar.tsx → filtros zona + zoom controls
4. Sync automático con reservas y estados existentes

## 📁 TREE STRUCTURE (USUARIO DEFINIDO)

```
src/app/(admin)/dashboard/mesas/components/floor-plan-v2/
├── Mesa.tsx               # Representa una mesa individual (Konva Circle/Rect)
├── Plano.tsx              # Plano del restaurante, renderiza todas las mesas (Konva Stage)
├── Modal.tsx              # Comandero / información de reserva
├── Toolbar.tsx            # Opciones de filtro, zoom, vista por zona
├── hooks/
│   ├── useFloorPlan.ts    # Estado mesas + real-time sync
│   └── useKonvaSetup.ts   # Canvas performance + config
└── types/
    └── mesa.types.ts      # Interfaces Mesa + Estados
```

## 🔌 INTEGRACIÓN CON EXISTENTE

**APIs QUE FUNCIONAN**:
- `GET /api/tables/status` → 34 mesas con position_x, position_y, currentStatus
- `useTableStore` → estado global mesas (ya implementado)
- Supabase real-time → subscriptions automáticas

**DATOS MESA**:
```typescript
interface Mesa {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  position: { x: number, y: number }  // FIJAS - no drag&drop en runtime
  currentStatus: 'available' | 'reserved' | 'occupied' | 'maintenance'
  currentReservation?: { customerName: string, time: string, partySize: number }
}
```

## ⚡ SPRINTS EJECUTABLES

### SPRINT 1: Setup Konva Base
**Objetivo**: Canvas básico funcionando
```bash
npm install react-konva konva @types/konva
```

**Deliverables**:
- `Plano.tsx` → Konva Stage container
- `Mesa.tsx` → shapes básicos (círculo capacity ≤4, rectángulo capacity >4)
- Cargar 34 mesas desde `/api/tables/status`
- Posiciones FIJAS desde DB (position_x, position_y)

### SPRINT 2: Estados Visuales + Click
**Objetivo**: Mesas interactivas con estados

**Deliverables**:
- Mesa.tsx → colores por currentStatus:
  - available: verde #9FB289
  - reserved: amarillo #CB5910
  - occupied: rojo #E53E3E
  - maintenance: gris #6B7280
- Click mesa → abrir Modal.tsx
- `useFloorPlan.ts` → sincronización con useTableStore existente

### SPRINT 3: Modal + Toolbar
**Objetivo**: UX completa

**Deliverables**:
- `Modal.tsx` → info reserva + botones comandero
- `Toolbar.tsx` → filtros por zona + zoom controls
- Vista responsive tablet/móvil
- Performance optimization Konva

### SPRINT 4: Real-time + QR
**Objetivo**: Integración completa

**Deliverables**:
- Supabase subscriptions → updates estado mesa automáticos
- Modal.tsx → integración QR scan/comandero
- Testing + deployment

## 🎨 COMPONENTES ESPECÍFICOS

### Mesa.tsx
```typescript
interface MesaProps {
  mesa: Mesa
  onClick: (mesa: Mesa) => void
  scale: number
}
// Konva Circle/Rect + color por estado + click handler
```

### Plano.tsx
```typescript
interface PlanoProps {
  mesas: Mesa[]
  selectedZone?: string
  onMesaClick: (mesa: Mesa) => void
}
// Konva Stage + renderiza todas Mesa.tsx + zoom/pan
```

### Modal.tsx
```typescript
interface ModalProps {
  mesa: Mesa | null
  onClose: () => void
}
// Dialog con info reserva + botones comandero + QR integration
```

### Toolbar.tsx
```typescript
interface ToolbarProps {
  zones: string[]
  selectedZone: string
  onZoneChange: (zone: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
}
// Filtros + controles vista
```

## 📊 CRITERIOS ÉXITO

- ✅ 34 mesas renderizadas visualmente en tiempo real
- ✅ Click mesa → modal comandero funcional
- ✅ Filtros zona operativos
- ✅ Sync automático con reservas
- ✅ Performance 60fps en tablet
- ✅ Responsive móvil/tablet/desktop

## 🚀 SIGUIENTE PASO

**EJECUTAR SPRINT 1**: Setup Konva + render básico mesas

¿PROCEDER? (Y/N)