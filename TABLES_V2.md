# TABLES_V2.md - Enhanced Visual Floor Plan System
## Product Requirements Plan (PRP) - Enigma Restaurant Platform

---

**Project Title**: Enhanced Visual Table Management System with Real-time Floor Plan
**Platform**: Enigma Restaurant Management Platform
**Technology Stack**: Next.js 15, React Konva, Supabase, Zustand
**Target Release**: Q4 2025
**Document Version**: v2.0
**Last Updated**: September 28, 2025

---

## 🎯 Executive Summary

This PRP outlines the enhancement of Enigma's table management system to include a sophisticated visual floor plan interface powered by React Konva, featuring real-time table status updates, reservation integration, and mobile-responsive design. The system will elevate Enigma's platform to enterprise-grade standards comparable to OpenTable, CoverManager, and Tableo.

## 📊 Current State Analysis

### ✅ **Existing Strengths**

**1. Sophisticated QR System**
- **Security-first design**: Cryptographic identifiers with timestamp validation
- **Comprehensive analytics**: Real-time scan tracking via `restaurante.qr_scans` table
- **Menu/Comandero toggle**: Business logic for dual-mode operation
- **Integration ready**: Menu app (port 8070) with PWA capabilities

**2. Robust Database Architecture**
- **29-table schema**: Complete restaurant operations coverage
- **Multi-table reservations**: Advanced `table_ids[]` support
- **Real-time status calculation**: Dynamic status based on reservation state
- **GDPR compliance**: Full audit trails and consent management

**3. Solid API Foundation**
- **RESTful endpoints**: `/api/tables/*` with comprehensive CRUD operations
- **Security patterns**: Service role authentication with RLS policies
- **Error handling**: Graceful degradation and user feedback
- **Type safety**: Full TypeScript integration

### 🔍 **Identified Gaps**

**1. Visual Management Interface**
- **Missing floor plan**: No visual table layout representation
- **Static table display**: Grid-based layout lacks spatial context
- **Limited interactivity**: No drag-and-drop or visual status updates

**2. Real-time Capabilities**
- **Polling-based updates**: 30-second intervals create lag
- **No live subscriptions**: Missing Supabase real-time features
- **Manual refresh dependency**: Users must trigger updates

**3. Mobile Experience**
- **Limited touch interactions**: Desktop-focused interface
- **Performance concerns**: Heavy components on mobile devices
- **Offline capabilities**: No offline-first patterns

## 🏆 Competitive Analysis

### **OpenTable (Industry Leader)**
**Strengths**: Real-time table tracking, POS integration, color-coded layouts, toggle between floor plans
**Features**: Timeline view, automatic table statusing, server section management
**Mobile**: Full mobile app with native performance

### **CoverManager (European Focus)**
**Strengths**: Visual floor plan customization, QR integration, mobile-responsive design
**Features**: Color-coded status, multiple dining areas, real-time booking visualization
**Unique**: CoverOnTheGo queue management, VIP area support

### **Tableo (Drag & Drop Leader)**
**Strengths**: Intuitive drag-and-drop interface, zone creation, multi-room support
**Features**: Real-time status updates, booking movement between tables, guest status management
**Accessibility**: "No artistic skills required" philosophy

### **Enigma Competitive Position**
**Current**: Strong backend, excellent QR system, but limited visual interface
**Target**: Match industry leaders with superior QR integration and GDPR compliance

## 🏗️ Technical Architecture

### **Component Hierarchy**
```
FloorPlanView (Main Container)
├── Toolbar (Zone filters, zoom controls, settings)
├── Plano (Konva Stage/Layer container)
│   ├── Mesa (Individual table components)
│   ├── ZoneBackground (Visual zone separation)
│   └── SelectionOverlay (Multi-select interface)
├── Modal (Table details, QR status, comandero actions)
└── StatusPanel (Real-time metrics, notifications)
```

### **State Management Architecture**
```typescript
// Enhanced useTableStore (Zustand)
interface FloorPlanStore {
  // Visual state
  visualTables: VisualMesa[]
  selectedZone: string
  zoomLevel: number
  stagePosition: { x: number, y: number }

  // Interaction state
  selectedTables: string[]
  draggedTable: VisualMesa | null
  isEditing: boolean

  // Real-time subscriptions
  subscriptions: Map<string, RealtimeChannel>
  lastUpdate: Date

  // Actions
  initializeFloorPlan: () => Promise<void>
  updateTablePosition: (tableId: string, position: Position) => Promise<void>
  subscribeToUpdates: () => void
  handleReservationChange: (reservation: Reservation) => void
}
```

### **React Konva Integration**
```typescript
// Performance-optimized Mesa component
const Mesa = React.memo<MesaProps>(({ mesa, scale, isSelected }) => {
  const shapeConfig = useMemo(() => ({
    type: mesa.capacity <= 2 ? 'square' : 'rectangle',
    fill: STATUS_COLORS[mesa.currentStatus],
    stroke: isSelected ? ENIGMA_COLORS.primary : ENIGMA_COLORS.border,
    dimensions: {
      width: mesa.capacity <= 2 ? 80 : 120,
      height: 80
    }
  }), [mesa, isSelected])

  return (
    <Group draggable={!mesa.isReserved} onDragEnd={handleDragEnd}>
      <Rect {...shapeConfig} />
      <Text text={mesa.number} align="center" />
      {mesa.hasActiveReservation && <StatusIndicator />}
    </Group>
  )
})
```

## 🎨 Design System Integration

### **Enigma Visual Tokens**
```css
/* Status Colors (OKLCH format for consistency) */
--status-available: oklch(0.65 0.15 145)     /* Enigma Green */
--status-reserved: oklch(0.55 0.20 50)       /* Enigma Orange */
--status-occupied: oklch(0.50 0.25 10)       /* Enigma Red */
--status-maintenance: oklch(0.50 0.02 220)   /* Enigma Gray */
--status-closed: oklch(0.40 0.05 280)        /* Enigma Purple */

/* Interactive States */
--table-hover: oklch(0.95 0.02 220)          /* Subtle hover */
--table-selected: oklch(0.45 0.15 200)       /* Atlantic Blue */
--table-dragging: oklch(0.90 0.05 50)        /* Drag feedback */
```

### **Responsive Breakpoints**
- **Mobile**: Base styles (375px min) - Touch-optimized interface
- **Tablet**: `md:` prefix (768px+) - Hybrid interaction patterns
- **Desktop**: `lg:` prefix (1024px+) - Full feature set with precision controls

### **Component Patterns**
- **Shadcn/ui consistency**: All modals, buttons, and inputs follow existing patterns
- **Touch-friendly targets**: Minimum 44px touch targets on mobile
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

## 📱 Mobile-First Implementation

### **Touch Interaction Patterns**
```typescript
// Mobile-optimized touch handlers
const handleTouchInteraction = {
  // Single tap: Select table
  onTap: (mesa: VisualMesa) => setSelectedTable(mesa),

  // Long press: Enter edit mode
  onLongPress: (mesa: VisualMesa) => enterEditMode(mesa),

  // Pinch: Zoom control
  onPinch: (scale: number) => updateZoom(scale),

  // Pan: Navigate floor plan
  onPan: (delta: Position) => updateStagePosition(delta)
}
```

### **Progressive Enhancement**
- **Base experience**: Touch-friendly table grid (fallback)
- **Enhanced**: Konva floor plan with gesture support
- **Advanced**: Drag-and-drop with haptic feedback

## ⚡ Performance Optimization

### **Konva Performance Targets**
- **60fps rendering**: Smooth animations and interactions
- **34+ tables**: Handle full restaurant capacity without lag
- **Mobile performance**: Optimized for low-end devices

### **Optimization Strategies**
```typescript
// Layer-based performance optimization
const useKonvaOptimization = () => {
  const backgroundLayer = useRef<Konva.Layer>()  // Static elements
  const tableLayer = useRef<Konva.Layer>()       // Interactive tables
  const overlayLayer = useRef<Konva.Layer>()     // UI overlays

  // Caching strategy
  useEffect(() => {
    backgroundLayer.current?.cache()  // Cache static backgrounds
    tableLayer.current?.listening(true)  // Only table layer listens
  }, [])

  // Smart re-rendering
  const updateTableLayer = useCallback((changedTables: string[]) => {
    changedTables.forEach(tableId => {
      const tableNode = tableLayer.current?.findOne(`#${tableId}`)
      tableNode?.draw()  // Update only changed tables
    })
  }, [])
}
```

## 🔄 Real-time Integration

### **Supabase Real-time Architecture**
```typescript
// Real-time subscription management
const useRealtimeSubscriptions = () => {
  useEffect(() => {
    // Table status changes
    const tableSubscription = supabase
      .channel('table-status')
      .on('postgres_changes', {
        event: '*',
        schema: 'restaurante',
        table: 'tables',
        filter: 'isActive=eq.true'
      }, handleTableChange)
      .subscribe()

    // Reservation updates
    const reservationSubscription = supabase
      .channel('reservations')
      .on('postgres_changes', {
        event: '*',
        schema: 'restaurante',
        table: 'reservations'
      }, handleReservationChange)
      .subscribe()

    return () => {
      tableSubscription.unsubscribe()
      reservationSubscription.unsubscribe()
    }
  }, [])
}
```

### **Business Logic Integration**
```typescript
// Real-time status calculation
const calculateTableStatus = (table: TableData, reservations: Reservation[]): TableStatus => {
  if (!table.isActive) return 'temporally_closed'

  const activeReservation = findActiveReservation(table.id, reservations)

  if (activeReservation?.status === 'SEATED') return 'occupied'
  if (activeReservation?.status === 'CONFIRMED') return 'reserved'

  return table.currentStatus || 'available'
}
```

## 🔧 Implementation Plan

### **Phase 1: Foundation (Week 1-2)**
1. **Install Dependencies**
   - React Konva integration
   - Performance monitoring setup
   - Mobile gesture libraries

2. **Core Components**
   - Mesa.tsx (table visualization)
   - Plano.tsx (stage container)
   - Basic interaction handlers

3. **State Management**
   - Enhanced useTableStore
   - Visual state management
   - Performance monitoring

### **Phase 2: Visual Interface (Week 3-4)**
1. **Floor Plan Rendering**
   - Table positioning system
   - Zone visualization
   - Status color coding

2. **Interaction System**
   - Table selection
   - Basic drag and drop
   - Zoom and pan controls

3. **Mobile Optimization**
   - Touch gesture support
   - Responsive layouts
   - Performance tuning

### **Phase 3: Real-time Features (Week 5-6)**
1. **Supabase Integration**
   - Real-time subscriptions
   - Optimistic updates
   - Conflict resolution

2. **Business Logic**
   - Reservation integration
   - Status calculation
   - QR system integration

3. **Advanced Features**
   - Multi-select operations
   - Bulk status updates
   - Analytics integration

### **Phase 4: Enhancement & Testing (Week 7-8)**
1. **Advanced UI/UX**
   - Enhanced modal system
   - Comandero integration
   - Accessibility features

2. **Performance Optimization**
   - 34+ table testing
   - Memory optimization
   - Mobile performance

3. **Testing & Validation**
   - Cross-device testing
   - Performance benchmarking
   - User acceptance testing

## ⚠️ Critical Gotchas & Considerations

### **🚨 High Priority Issues**

**1. React Konva SSR Compatibility**
```typescript
// CRITICAL: Must use dynamic imports
const FloorPlanView = dynamic(
  () => import('./FloorPlanView'),
  { ssr: false }  // Konva doesn't support SSR
)
```

**2. Mobile Performance on Low-end Devices**
- **Issue**: Konva canvas can be heavy on older mobile devices
- **Solution**: Progressive enhancement with fallback to grid view
- **Monitoring**: Performance budgets and device-specific optimizations

**3. Real-time Data Consistency**
- **Issue**: Race conditions between optimistic updates and real-time subscriptions
- **Solution**: Timestamp-based conflict resolution and rollback mechanisms

### **⚠️ Implementation Warnings**

**1. State Management Complexity**
- Keep visual state separate from business logic
- Use memoization extensively for performance
- Implement proper cleanup for subscriptions

**2. Touch vs Mouse Interactions**
- Different interaction patterns required
- Gesture conflicts on mobile devices
- Fallback strategies for unsupported features

**3. Database Load Considerations**
- Real-time subscriptions can increase DB load
- Implement connection pooling and rate limiting
- Monitor subscription count and optimize

## ✅ Success Criteria

### **🎯 Primary Success Metrics**

**1. Performance Benchmarks**
- [ ] **60fps** sustained during table interactions
- [ ] **<2 seconds** initial load time on mobile
- [ ] **<500ms** table status update propagation
- [ ] **34+ tables** rendered without performance degradation

**2. User Experience Metrics**
- [ ] **<3 clicks** to access any table information
- [ ] **Touch-friendly** interface on mobile devices
- [ ] **Real-time updates** without manual refresh
- [ ] **Accessibility compliance** WCAG 2.1 AA

**3. Business Logic Integration**
- [ ] **100% accurate** reservation-to-table mapping
- [ ] **Real-time status** reflection across all interfaces
- [ ] **QR system integration** with secure table identification
- [ ] **Comandero compatibility** with existing toggle system

### **🚀 Advanced Success Indicators**

**1. Competitive Parity**
- [ ] Feature parity with OpenTable table management
- [ ] Visual design quality matching CoverManager
- [ ] Drag-and-drop intuitiveness of Tableo
- [ ] Superior QR integration vs all competitors

**2. Technical Excellence**
- [ ] Zero memory leaks during extended usage
- [ ] Graceful degradation on all device types
- [ ] Offline-first patterns for critical functions
- [ ] Real-time synchronization across multiple clients

**3. Business Impact**
- [ ] Reduced table management time by 50%
- [ ] Increased table turnover through visual optimization
- [ ] Enhanced staff productivity with real-time updates
- [ ] Improved customer experience through faster seating

## 🔄 Maintenance & Evolution

### **Monitoring Strategy**
- **Performance**: Real User Monitoring (RUM) for Konva rendering
- **Usage**: Analytics on feature adoption and user interactions
- **Errors**: Comprehensive error tracking and alerting
- **Business**: Impact metrics on table turnover and efficiency

### **Future Enhancements**
- **Heat Maps**: Visual analytics of table utilization patterns
- **Predictive Modeling**: AI-powered table assignment recommendations
- **Multi-location**: Support for restaurant groups with multiple venues
- **Integration Expansion**: POS systems, payment processing, staff scheduling

---

## 📋 Validation Checklist

### **Before Implementation**
- [ ] All existing QR functionality preserved
- [ ] Database schema compatibility verified
- [ ] Performance testing environment prepared
- [ ] Mobile testing devices available

### **During Development**
- [ ] Progressive enhancement approach maintained
- [ ] Accessibility testing at each milestone
- [ ] Performance budgets monitored continuously
- [ ] Cross-browser compatibility verified

### **Pre-deployment**
- [ ] Full regression testing completed
- [ ] Mobile performance validated on target devices
- [ ] Real-time subscription load testing passed
- [ ] User acceptance testing with restaurant staff

### **Post-deployment**
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] User feedback collection implemented
- [ ] Business impact measurement in place

---

**Document prepared by**: Claude Code AI System
**Technical Review**: Required before implementation
**Business Approval**: Required for Phase 1 initiation
**Next Review Date**: 2 weeks post Phase 1 completion

---

*This PRP follows enterprise-grade planning methodologies with emphasis on risk mitigation, performance optimization, and business value delivery. All technical decisions are based on current industry best practices and competitive analysis.*