# PRP: Table Floor Plan Visual Microservice with React Konva

## Goal
Build a visual table floor plan microservice using React Konva that displays 34 restaurant tables in real-time, integrates with existing useTableStore, supports click interactions for comandero modal, and provides zone filtering with mobile-responsive design.

## Why
- **Business Value**: Visual table management reduces staff confusion and improves service efficiency
- **Staff Experience**: Intuitive visual interface vs text-based table lists
- **Real-time Operations**: Instant visual feedback of table status changes
- **Mobile Support**: Staff using tablets/phones need touch-friendly interface
- **Integration**: Leverages existing reservation system and QR management

## What
Interactive visual floor plan showing 34 tables with:
- Real-time status colors (available/reserved/occupied/maintenance)
- Click → comandero modal with reservation info
- Zone filtering (Terrace Campanari, Sala Principal, VIP, Terrace Justicia)
- Touch-friendly responsive design
- 60fps performance on tablets

### Success Criteria
- [ ] 34 tables render visually with real positions from DB
- [ ] Click table → opens modal with reservation info
- [ ] Status colors update in real-time via useTableStore
- [ ] Zone filters work correctly
- [ ] Mobile/tablet responsive (375px+)
- [ ] 60fps performance with all tables visible
- [ ] Integrates seamlessly with existing mesas dashboard

## All Needed Context

### Documentation & References
```yaml
- url: https://konvajs.org/docs/performance/All_Performance_Tips.html
  why: Critical performance patterns for 30+ interactive shapes
  critical: Layer management, shape caching, event delegation

- url: https://konvajs.org/docs/react/index.html
  why: React Konva setup and component patterns

- url: https://github.com/delfina-ghimire/konva-shape-playground
  why: Restaurant table shape implementation examples

- url: https://github.com/iancometa/floorplan-canvas
  why: Floor plan canvas patterns with Konva

- file: src/stores/useTableStore.ts
  why: Existing table state management and data structure
  critical: TableData interface, loadTables(), realtime updates

- file: src/app/(admin)/dashboard/mesas/components/qr-viewer-modal.tsx
  why: Modal pattern to follow for table interaction
  critical: Dialog component usage, table prop structure

- file: src/app/(admin)/dashboard/mesas/page.tsx
  why: Integration point and existing zone definitions
  critical: ENIGMA_ZONES constant, TableData interface

- database: restaurante.tables schema
  why: position_x, position_y, width, height, rotation fields for visual layout
  critical: Real coordinates stored in DB, not hardcoded
```

### Current Codebase Tree (Relevant Sections)
```bash
src/app/(admin)/dashboard/mesas/
├── page.tsx                    # Main mesas dashboard with stats
├── components/
│   ├── qr-viewer-modal.tsx     # Modal pattern to follow
│   ├── table-tabs.tsx          # Tab system integration
│   ├── table-status-panel.tsx  # Status management
│   └── enhanced-qr-manager.tsx # QR integration
src/stores/
└── useTableStore.ts           # Global table state management
src/hooks/
├── useRealtimeAvailability.ts # Real-time updates pattern
└── useTables.ts               # Table data fetching
```

### Desired Codebase Tree
```bash
src/app/(admin)/dashboard/mesas/components/floor-plan-v2/
├── Mesa.tsx                   # Individual table component (Circle/Rect)
├── Plano.tsx                  # Main floor plan container (Konva Stage)
├── Modal.tsx                  # Table interaction modal (comandero)
├── Toolbar.tsx                # Zone filters and zoom controls
├── hooks/
│   ├── useFloorPlan.ts        # Floor plan state + sync with useTableStore
│   └── useKonvaSetup.ts       # Performance optimization configs
└── types/
    └── mesa.types.ts          # Table visual types and interfaces
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Next.js 15 + Turbopack requires dynamic import for Konva
// Must use dynamic() with ssr: false for client-side only rendering

// PERFORMANCE: Max 3-5 layers for optimal performance
// Use layer.listening(false) for non-interactive background layers

// REACT KONVA: Default mode allows shape position drift
// Use _useStrictMode prop or useStrictMode(true) for controlled positioning

// ENIGMA: Database has position_x, position_y fields as numeric
// Convert to numbers: position: { x: Number(table.position_x), y: Number(table.position_y) }

// MOBILE: Touch events require larger hit targets
// Minimum 44px touch targets, use strokeWidth for visual padding

// REAL-TIME: useTableStore already handles Supabase realtime
// Hook into existing tableStatuses updates, don't duplicate subscriptions
```

## Implementation Blueprint

### Data Models and Structure
```typescript
// types/mesa.types.ts - Core visual table interface
interface VisualMesa {
  id: string
  number: string  // "T1", "S10", etc.
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  position: { x: number, y: number }  // From DB position_x, position_y
  dimensions: { width: number, height: number }  // From DB width, height
  rotation: number  // From DB rotation field
  currentStatus: 'available' | 'reserved' | 'occupied' | 'maintenance'
  currentReservation?: {
    customerName: string
    time: string
    partySize: number
  }
}

// Visual shape configuration
interface MesaShapeConfig {
  type: 'circle' | 'rectangle'  // circle for capacity ≤4, rectangle for >4
  fill: string                  // Status color from Enigma design tokens
  stroke: string               // Border color
  strokeWidth: number          // Touch-friendly borders
}

// Zone filter state
interface ZoneFilter {
  selectedZone: string | 'all'
  visibleTables: VisualMesa[]
  zoneStats: Record<string, { available: number, total: number }>
}
```

### List of Tasks to Complete (In Order)

```yaml
Task 1 - Setup React Konva Infrastructure:
INSTALL packages:
  - npm install react-konva konva @types/konva

CONFIGURE next.config.js:
  - ADD webpack externals for canvas module
  - FOLLOW pattern from Context7 React Konva docs

CREATE src/app/(admin)/dashboard/mesas/components/floor-plan-v2/types/mesa.types.ts:
  - DEFINE VisualMesa interface matching database schema
  - DEFINE MesaShapeConfig for visual properties
  - EXPORT zone filter interfaces

Task 2 - Core Visual Components:
CREATE Mesa.tsx:
  - IMPORT { Circle, Rect, Text, Group } from 'react-konva'
  - IMPLEMENT shape selection: capacity ≤4 → Circle, >4 → Rect
  - USE Enigma design tokens for status colors
  - HANDLE click events for modal trigger
  - OPTIMIZE with React.memo for performance

CREATE Plano.tsx:
  - IMPORT { Stage, Layer } from 'react-konva'
  - SETUP performance: max 3 layers, listening(false) for background
  - IMPLEMENT responsive sizing with useEffect + window resize
  - MAP over visibleTables to render Mesa components
  - HANDLE zoom/pan with Konva built-in transform

Task 3 - State Management Integration:
CREATE hooks/useFloorPlan.ts:
  - IMPORT useTableStore for existing table data
  - TRANSFORM TableData[] → VisualMesa[] with DB positions
  - SYNC with real-time updates from useTableStore
  - MANAGE zone filtering logic
  - HANDLE zoom/pan state

CREATE hooks/useKonvaSetup.ts:
  - IMPLEMENT performance configs from Konva docs
  - SETUP shape caching for complex table groups
  - OPTIMIZE layer management for 30+ shapes
  - HANDLE mobile touch vs desktop mouse events

Task 4 - User Interface Components:
CREATE Modal.tsx:
  - COPY pattern from existing qr-viewer-modal.tsx
  - DISPLAY table info: number, capacity, location, status
  - SHOW reservation details if currentReservation exists
  - INTEGRATE comandero actions (placeholder buttons)
  - USE Enigma Dialog/Card components for consistency

CREATE Toolbar.tsx:
  - USE existing zone constants from mesas/page.tsx
  - IMPLEMENT zone filter dropdown with stats
  - ADD zoom controls: fit-to-screen, zoom in/out
  - CREATE responsive layout for mobile/tablet
  - USE Enigma Button/Select components

Task 5 - Performance Optimization:
OPTIMIZE Plano.tsx:
  - IMPLEMENT layer separation: background, tables, interactive
  - ADD shape caching for table groups
  - USE FastLayer for static elements
  - IMPLEMENT efficient re-render with dependency arrays

OPTIMIZE Mesa.tsx:
  - ADD React.memo with proper comparison function
  - USE useMemo for expensive calculations
  - IMPLEMENT efficient status color updates
  - OPTIMIZE touch target sizing for mobile

Task 6 - Integration & Testing:
INTEGRATE into mesas dashboard:
  - ADD new tab option in table-tabs.tsx
  - IMPLEMENT dynamic import pattern for SSR compatibility
  - SYNC with existing QR system toggle
  - MAINTAIN url state for tab switching

VALIDATE performance:
  - TEST 34 tables rendering at 60fps
  - VERIFY mobile touch responsiveness
  - CHECK memory usage with Chrome DevTools
  - ENSURE real-time updates work correctly
```

### Per Task Pseudocode

```typescript
// Task 2 - Mesa.tsx Core Implementation
const Mesa = React.memo(({ mesa, onClick, scale }: MesaProps) => {
  // PATTERN: Shape selection based on capacity
  const shapeType = mesa.capacity <= 4 ? 'circle' : 'rectangle'

  // CRITICAL: Enigma design tokens for status colors
  const statusColors = {
    available: '#9FB289',   // Enigma green
    reserved: '#CB5910',    // Enigma orange
    occupied: '#E53E3E',    // Enigma red
    maintenance: '#6B7280'  // Enigma gray
  }

  // PERFORMANCE: Memoize expensive calculations
  const shapeConfig = useMemo(() => ({
    x: mesa.position.x,
    y: mesa.position.y,
    fill: statusColors[mesa.currentStatus],
    stroke: '#000',
    strokeWidth: scale < 0.5 ? 4 : 2, // Touch-friendly on zoom out
    // MOBILE: Minimum 44px touch target
    width: Math.max(mesa.dimensions.width, 44 / scale),
    height: Math.max(mesa.dimensions.height, 44 / scale)
  }), [mesa, scale])

  // PATTERN: Group shape + text for atomic interaction
  return (
    <Group onClick={() => onClick(mesa)}>
      {shapeType === 'circle' ? (
        <Circle radius={shapeConfig.width / 2} {...shapeConfig} />
      ) : (
        <Rect {...shapeConfig} />
      )}
      <Text
        text={mesa.number}
        fontSize={12 / scale} // Scale-aware text
        align="center"
        verticalAlign="middle"
      />
    </Group>
  )
})

// Task 3 - useFloorPlan.ts State Management
const useFloorPlan = () => {
  const { tables, loading } = useTableStore()
  const [selectedZone, setSelectedZone] = useState<string>('all')

  // TRANSFORM: Database tables → Visual tables with positions
  const visualTables = useMemo(() =>
    tables.map(table => ({
      ...table,
      position: {
        x: Number(table.position_x || 0),
        y: Number(table.position_y || 0)
      },
      dimensions: {
        width: Number(table.width || 120),
        height: Number(table.height || 80)
      },
      rotation: Number(table.rotation || 0)
    })), [tables])

  // FILTER: Zone-based visibility with performance optimization
  const visibleTables = useMemo(() => {
    if (selectedZone === 'all') return visualTables
    return visualTables.filter(table => table.location === selectedZone)
  }, [visualTables, selectedZone])

  // REAL-TIME: Sync updates from useTableStore (already handles Supabase)
  useEffect(() => {
    // useTableStore handles real-time updates automatically
    // No additional subscriptions needed
  }, [])

  return { visualTables, visibleTables, selectedZone, setSelectedZone, loading }
}
```

### Integration Points
```yaml
DATABASE:
  - fields: position_x, position_y, width, height, rotation from restaurante.tables
  - connection: Existing useTableStore handles all DB interactions

ROUTING:
  - integration: Add floor-plan tab in existing table-tabs.tsx
  - pattern: Use searchParams for tab state management

COMPONENTS:
  - modal: Extend existing qr-viewer-modal.tsx pattern
  - design: Use Enigma design tokens from globals.css
  - responsive: Follow existing mobile patterns in mesas components

STATE:
  - global: Integrate with existing useTableStore
  - real-time: Use existing Supabase subscriptions
  - filters: Extend existing zone filtering patterns
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# FIRST: Fix any TypeScript/linting errors
npm run lint
npm run type-check

# Expected: No errors. If errors, read carefully and fix before proceeding.
```

### Level 2: Component Tests
```typescript
// Test basic table rendering and interaction
const testRenderTables = () => {
  // SETUP: Mock table data with DB-like structure
  const mockTables = [
    { id: '1', number: 'T1', capacity: 2, position_x: 100, position_y: 50 },
    { id: '2', number: 'S10', capacity: 6, position_x: 200, position_y: 100 }
  ]

  // VERIFY: Tables render with correct shapes
  // capacity ≤4 → Circle, >4 → Rectangle

  // VERIFY: Click events trigger modal
  // VERIFY: Status colors apply correctly
}

const testPerformance = () => {
  // SETUP: 34 tables data
  // MEASURE: Render time < 16ms (60fps)
  // VERIFY: No memory leaks on re-renders
  // CHECK: Mobile touch responsiveness
}
```

```bash
# Run component tests
npm run test -- --testPathPattern=floor-plan

# Performance validation with React DevTools
npm run dev
# Open React DevTools → Profiler → Record interaction
```

### Level 3: Integration Test
```bash
# Start development server
npm run dev

# Navigate to: http://localhost:3000/dashboard/mesas
# Click floor plan tab (to be added)

# VERIFY Checklist:
# ✅ All 34 tables visible with real positions
# ✅ Click table → modal opens with correct data
# ✅ Zone filters change visible tables
# ✅ Status colors match current table states
# ✅ Mobile responsive on 375px+ screens
# ✅ Smooth 60fps interaction on tablet
# ✅ Real-time updates when table status changes
```

## Final Validation Checklist
- [ ] All TypeScript errors resolved: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Component tests pass: `npm run test`
- [ ] 34 tables render with DB positions: Visual verification
- [ ] Click interaction opens modal: Manual test
- [ ] Zone filtering functional: Test all 4 zones + "all"
- [ ] Mobile responsive 375px+: Browser dev tools
- [ ] 60fps performance: Chrome DevTools performance tab
- [ ] Real-time sync works: Change table status in another tab
- [ ] Integration with existing mesas dashboard: Tab switching works

---

## Anti-Patterns to Avoid
- ❌ Don't create more than 5 Konva layers (performance killer)
- ❌ Don't ignore mobile touch target sizing (44px minimum)
- ❌ Don't duplicate real-time subscriptions (useTableStore handles it)
- ❌ Don't hardcode table positions (use database position_x, position_y)
- ❌ Don't skip React.memo optimization for Mesa components
- ❌ Don't use sync blocking operations in render loops
- ❌ Don't break existing useTableStore patterns or modal conventions

---

## Confidence Score: 9/10

This PRP provides comprehensive context including:
- ✅ Complete database schema understanding
- ✅ Existing codebase patterns and integration points
- ✅ React Konva performance best practices
- ✅ External implementation examples
- ✅ Enigma design system tokens and conventions
- ✅ Mobile-responsive requirements
- ✅ Detailed task breakdown with pseudocode
- ✅ Executable validation tests

The implementation should succeed in one pass with this level of context and validation loops.