name: "Real-Time Order Management & POS System for Enigma Restaurant Platform"
description: |

## Purpose
Sistema completo de gestión de pedidos en tiempo real con funcionalidad dual: comandero para mesa + TPV completo para gestión de cocina. Implementación en una sola pasada con asistencia de IA, preparado para futura app cocina.enigmaconalma.com.

## Core Principles
1. **Context is King**: Integramos con sistema QR menu.enigmaconalma.com existente
2. **Validation Loops**: Tests en cada feature crítica (real-time, stock, estados)
3. **Information Dense**: Patrones probados de dnd-kit, TanStack Table, Supabase Realtime
4. **Progressive Success**: Start simple (lista órdenes), validate, enhance (drag-drop, real-time)
5. **Global rules**: Seguir CLAUDE.md - SSH-first, batch processing, no mock data

---

## Goal
Desarrollar sistema profesional de gestión de pedidos en tiempo real para enigma-app que:
- Integre con pedidos QR de menu.enigmaconalma.com (schema restaurante.orders existente)
- Permita gestión dual: comandero rápido + TPV completo
- Soporte drag-and-drop para cambio de estados (PENDING → PREPARING → READY → SERVED)
- Actualice en tiempo real vía Supabase Realtime
- Prepare arquitectura para futura app cocina.enigmaconalma.com (Kitchen Display System)
- Selección rápida de productos tipo TPV para crear comandas presenciales

## Why
- **Business value**: Unificar pedidos QR + presenciales en single source of truth
- **Integration**: Conecta menu.enigmaconalma.com → enigma-app → futura cocina.enigmaconalma.com
- **Problems solved**:
  - Para Comanderos: Crear pedidos rápidos, asignar mesas, ver estado en tiempo real
  - Para Cocina: Priorizar órdenes, cambiar estados, coordinar preparación
  - Para Managers: Vista completa de operaciones, estadísticas en vivo, control de stock

## What
Sistema de gestión de pedidos con 3 niveles de funcionalidad:

### Nivel 1: Vista de Órdenes en Tiempo Real
- Dashboard con todas las órdenes activas (PENDING, CONFIRMED, PREPARING, READY)
- Agrupación por estados tipo Kanban
- Actualización automática vía Supabase Realtime
- Filtros por mesa, fuente (QR/presencial), estado, tiempo

### Nivel 2: Gestión de Estados con Drag-and-Drop
- Arrastrar órdenes entre columnas para cambiar estado
- Validaciones de flujo (no saltar estados críticos)
- Confirmaciones para acciones críticas (CANCELAR, SERVED)
- Audio alerts para nuevas órdenes y timeouts

### Nivel 3: Comandero/TPV Rápido
- Selección rápida de productos con grid visual
- Búsqueda instantánea de items del menú
- Asignación de mesa
- Vista previa del ticket
- Creación directa en DB (mismo endpoint que QR)

### Success Criteria
- [x] Real-time updates < 500ms latency (Supabase Realtime)
- [x] Drag-and-drop fluido sin glitches (dnd-kit)
- [x] Crear orden presencial en < 30 segundos
- [x] Vista móvil optimizada (comanderos usan tablets)
- [x] Stock validation antes de confirmar orden
- [x] Preparación para KDS separado (arquitectura modular)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Context7 patterns implementados

- url: https://github.com/clauderic/dnd-kit
  why: Drag-and-drop para Kanban board de órdenes
  critical: |
    - Usar @dnd-kit/sortable para columnas de estados
    - Modifiers: restrictToVerticalAxis para orden dentro de columna
    - DragOverlay para preview visual durante drag

- url: https://tanstack.com/table/latest
  why: Tabla de órdenes con filtros, sorting, pagination
  critical: |
    - Column filtering API para filtrar por mesa/estado
    - Global filtering API para búsqueda de productos en TPV
    - Sorting API para priorizar por tiempo de espera

- url: https://github.com/supabase/realtime
  why: Updates en tiempo real de orders table
  critical: |
    - Subscription a restaurante.orders con filtro por estado
    - Postgres CDC para capturar INSERT, UPDATE
    - Rehydration automática en caso de desconexión

- url: https://medium.com/@aziemelasari/ui-ux-case-study-a-pos-restaurant-app-for-efficient-order-management-2044b5151926
  why: POS UX best practices - speed, simplicity, visual hierarchy
  critical: |
    - Botones grandes (44x44px mínimo para touch)
    - Color coding por estado (verde=ready, naranja=preparing)
    - Shortcuts para acciones frecuentes

- url: https://medium.com/@osamahaashir/cooking-up-success-revamping-kitchen-display-system-kds-ux-case-study-6a6c92784fb9
  why: KDS patterns para futura cocina.enigmaconalma.com
  critical: |
    - Priorización automática por tiempo de espera
    - Audio alerts para nuevas órdenes
    - Manual override para casos especiales

- file: /Users/lr0y/local-ai-packaged/qr-menu-app/src/app/api/orders/route.ts
  why: Endpoint existente de creación de pedidos QR
  critical: |
    - Usa mismo schema restaurante.orders
    - Stock validation con decrease_menu_item_stock RPC
    - Email tracking con tokens
    - Rollback automático si falla stock reservation

- file: /Users/lr0y/local-ai-packaged/qr-menu-app/src/stores/cartStore.ts
  why: Patrón Zustand con persist por mesa
  critical: |
    - Factory pattern: un store por mesa (getOrCreateCartStore)
    - localStorage con key dinámica: enigma-cart-${tableId}
    - TTL cleanup cada hora (24h expiration)

- docfile: enigma-app/CLAUDE.md
  why: Reglas inmutables del proyecto
  critical: |
    - SSH-FIRST: Validar DB antes de implementar
    - Batch processing: Parallel tool calls siempre
    - No mock data: Producción desde día 1
    - Hooks system: .env bloqueado, rm -rf bloqueado
```

### Current Codebase Tree
```bash
enigma-app/
├── src/
│   ├── app/(admin)/
│   │   └── dashboard/
│   │       ├── page.tsx                    # Dashboard principal
│   │       ├── analytics/                  # Analytics page
│   │       ├── clientes/                   # Customers management
│   │       ├── configuracion/              # Settings
│   │       ├── menu/                       # Menu management
│   │       ├── mesas/                      # Tables floor plan
│   │       └── reservaciones/              # Reservations system
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── stats/
│   │   │   │   ├── metric-card.tsx        # Metric display component
│   │   │   │   └── metric-card-skeleton.tsx
│   │   │   ├── widgets/
│   │   │   │   ├── upcoming-reservations.tsx
│   │   │   │   └── quick-actions.tsx
│   │   │   └── charts/
│   │   │       └── table-occupancy-chart.tsx
│   │   └── ui/                            # Shadcn components
│   │       ├── card.tsx                   # Updated with rounded-xl, gap-6
│   │       ├── button.tsx                 # Shadow-xs, ring-[3px] focus
│   │       ├── input.tsx                  # Professional styling
│   │       ├── chart.tsx                  # ChartContainer system
│   │       └── ...
│   ├── hooks/
│   │   ├── useDashboardMetrics.ts
│   │   ├── useRealtimeReservations.ts     # Pattern for realtime
│   │   └── useTableOccupancy.ts
│   └── lib/
│       └── supabase/
│           ├── client.ts
│           └── server.ts

qr-menu-app/                                # REFERENCIA - NO MODIFICAR
├── src/
│   ├── app/api/orders/route.ts            # POST /api/orders - USAR MISMO
│   ├── types/order.ts                     # OrderStatus enum
│   ├── stores/cartStore.ts                # Zustand factory pattern
│   └── hooks/useOrders.ts                 # createOrder hook

# DATABASE SCHEMA (PostgreSQL via SSH)
restaurante.orders:
  - id: text PK
  - orderNumber: text (ENI-YYMMDD-XXXXXX)
  - totalAmount: numeric(10,2)
  - status: OrderStatus enum (PENDING|CONFIRMED|PREPARING|READY|SERVED|CANCELLED)
  - notes: text
  - orderedAt, confirmedAt, readyAt, servedAt: timestamp
  - tableId: text FK → restaurante.tables
  - customerId: text FK → restaurante.users (nullable)
  - restaurantId: text FK → restaurante.restaurants
  - order_source: varchar(20) (presencial|qr|online|telefono)
  - customer_email, tracking_token, email_sent: tracking fields

restaurante.order_items:
  - id: text PK
  - orderId: text FK → restaurante.orders
  - menuItemId: text FK → restaurante.menu_items
  - quantity: integer
  - unitPrice, totalPrice: numeric
  - status: OrderItemStatus enum (PENDING|PREPARING|READY|SERVED)
  - notes: text (special requests)
```

### Desired Codebase Tree
```bash
enigma-app/src/
├── app/(admin)/dashboard/
│   └── pedidos/                           # ✨ NEW PAGE
│       ├── page.tsx                       # Main orders management page
│       └── nuevo/                         # NEW: POS/Comandero quick create
│           └── page.tsx
│
├── components/orders/                     # ✨ NEW DIRECTORY
│   ├── order-kanban-board.tsx            # Drag-drop Kanban (dnd-kit)
│   │   # Responsabilidad: Columnas PENDING/PREPARING/READY/SERVED
│   │   # Drag-and-drop entre estados
│   │   # Real-time subscription a orders table
│   │
│   ├── order-card.tsx                    # Card para cada orden
│   │   # Responsabilidad: Display order info, items, timing
│   │   # Actions: change status, view details, cancel
│   │
│   ├── order-details-modal.tsx           # Modal con detalles completos
│   │   # Responsabilidad: Full order view, edit notes, timeline
│   │
│   ├── pos-product-selector.tsx          # Grid de productos TPV
│   │   # Responsabilidad: Quick selection de menu_items
│   │   # Search, categories, stock indicators
│   │
│   ├── pos-cart-preview.tsx              # Vista previa del ticket
│   │   # Responsabilidad: Review antes de crear orden
│   │   # Edit quantities, special requests
│   │
│   └── order-status-badge.tsx            # Badge con color por estado
│       # Responsabilidad: Visual feedback de estado
│
├── hooks/
│   ├── useRealtimeOrders.ts              # ✨ NEW: Supabase subscription
│   │   # Responsabilidad: Subscribe to restaurante.orders changes
│   │   # Filter by active statuses, auto-revalidate
│   │
│   ├── useOrderMutations.ts              # ✨ NEW: CRUD operations
│   │   # Responsabilidad: updateOrderStatus, cancelOrder, createOrder
│   │   # Optimistic updates + rollback on error
│   │
│   └── useMenuItemsForPOS.ts             # ✨ NEW: Products for TPV
│       # Responsabilidad: Fetch available menu_items with stock
│       # Cache with React Query
│
├── lib/orders/                           # ✨ NEW DIRECTORY
│   ├── order-utils.ts                    # Utils (time since order, priority)
│   ├── order-validators.ts               # Status flow validation
│   └── order-audio-alerts.ts             # Audio notifications
│
└── app/api/
    └── orders/                           # EXTEND existing from qr-menu-app
        ├── [id]/
        │   ├── route.ts                  # GET, PATCH, DELETE order by ID
        │   └── status/
        │       └── route.ts              # PATCH /api/orders/:id/status
        └── realtime-config/
            └── route.ts                  # GET config for Realtime setup
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: dnd-kit requires stable IDs
// ❌ BAD: Using array index as ID
orders.map((order, index) => <OrderCard key={index} />)

// ✅ GOOD: Using order.id from database
orders.map((order) => <OrderCard key={order.id} id={order.id} />)

// CRITICAL: Supabase Realtime requires RLS policies for service_role
// Schema: restaurante.orders ya tiene policy "service_role_all_orders"
// Verificar con: ssh root@31.97.182.226 "docker exec db psql ..."

// CRITICAL: TanStack Table v8+ uses getCoreRowModel() pattern
// ❌ BAD (v7): useTable({ data, columns })
// ✅ GOOD (v8): useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

// CRITICAL: Stock validation MUST happen server-side
// Ya implementado en qr-menu-app/api/orders/route.ts con RPC decrease_menu_item_stock
// Pattern: Check stock → Reserve → Create order → Rollback if any step fails

// CRITICAL: OrderStatus flow validation
// PENDING → CONFIRMED → PREPARING → READY → SERVED
// Allow: PENDING → CANCELLED, any → CANCELLED
// Disallow: READY → PENDING (no backwards except cancel)

// GOTCHA: Supabase Realtime subscription cleanup
// MUST call .unsubscribe() on component unmount
useEffect(() => {
  const channel = supabase.channel('orders')
  // ... setup subscription
  return () => { supabase.removeChannel(channel) }
}, [])

// GOTCHA: @dnd-kit modifiers must be memoized
// ❌ Creates new array every render → breaks drag
<DndContext modifiers={[restrictToVerticalAxis]}>

// ✅ Memoize or define outside component
const modifiers = useMemo(() => [restrictToVerticalAxis], [])
<DndContext modifiers={modifiers}>

// GOTCHA: Next.js 15 + Supabase client must use 'use client'
// Server components can't use Realtime subscriptions
'use client' // Top of file for any component using useRealtimeOrders

// Pattern: We use @tanstack/react-query v5.90.2 in qr-menu-app
// Keep same version for enigma-app consistency
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// ========================================================================
// SHARED TYPES (extend from qr-menu-app)
// ========================================================================

// src/types/order.ts
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
export type OrderSource = 'presencial' | 'qr' | 'online' | 'telefono'

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED'
  notes?: string
  menuItem?: {
    id: string
    name: string
    nameEn: string
    category: string
  }
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  tableId: string
  customerId?: string
  restaurantId: string
  order_source: OrderSource
  notes?: string
  customer_email?: string

  // Timestamps
  orderedAt: string
  confirmedAt?: string
  readyAt?: string
  servedAt?: string

  // Relations
  order_items: OrderItem[]
  table?: {
    id: string
    number: string
    location: string
  }
}

// ========================================================================
// POS/COMANDERO TYPES
// ========================================================================

// src/types/pos.ts
export interface POSCartItem {
  menuItemId: string
  name: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  stock: number
}

export interface POSCart {
  items: POSCartItem[]
  totalItems: number
  totalAmount: number
  tableId?: string
  notes?: string
}

export interface CreateOrderDTO {
  tableId: string
  items: Array<{
    menuItemId: string
    quantity: number
    specialRequests?: string
  }>
  notes?: string
  order_source: 'presencial' | 'qr'
  sessionId?: string // For QR orders
}

// ========================================================================
// REALTIME TYPES
// ========================================================================

// src/types/realtime.ts
export interface RealtimeOrderPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Order
  old: Order
  schema: 'restaurante'
  table: 'orders'
}

export interface OrderFilters {
  statuses?: OrderStatus[]
  sources?: OrderSource[]
  tableId?: string
  dateFrom?: Date
  dateTo?: Date
}
```

### List of Tasks

```yaml
# ========================================================================
# FASE 1: SETUP & INFRASTRUCTURE (Tasks 1-4)
# ========================================================================

Task 1: Install Dependencies
  MODIFY package.json:
    - ADD "@dnd-kit/core": "^6.1.0"
    - ADD "@dnd-kit/sortable": "^8.0.0"
    - ADD "@dnd-kit/utilities": "^3.2.2"
    - ADD "@tanstack/react-table": "^8.20.5"
    - RUN: npm install

  VERIFY versions match qr-menu-app (@tanstack/react-query already installed)

Task 2: Database Validation via SSH
  SSH to production:
    - VERIFY: restaurante.orders table structure
    - VERIFY: restaurante.order_items table structure
    - VERIFY: OrderStatus enum values match types
    - VERIFY: RLS policy "service_role_all_orders" exists
    - TEST: SELECT * FROM restaurante.orders LIMIT 5

  DOCUMENT: Current order count, active orders, recent order_source distribution

Task 3: Create Shared Types
  CREATE src/types/order.ts:
    - COPY pattern from qr-menu-app/src/types/order.ts
    - EXTEND with table relation (join data)
    - ADD OrderFilters interface

  CREATE src/types/pos.ts:
    - POSCartItem, POSCart, CreateOrderDTO
    - MIRROR pattern from qr-menu-app cartStore types

  CREATE src/types/realtime.ts:
    - RealtimeOrderPayload for Supabase subscriptions
    - REFERENCE: supabase.channel().on() payload structure

Task 4: Setup Realtime Infrastructure
  CREATE src/lib/supabase/realtime-config.ts:
    - FUNCTION: getRealtimeChannel(channelName: string)
    - FUNCTION: subscribeToOrders(callback, filters)
    - PATTERN: Auto-reconnect on disconnect
    - ERROR HANDLING: Log errors, retry with exponential backoff

  CRITICAL: Test connection with minimal subscription first
  ```
  const channel = supabase.channel('test-orders')
    .on('postgres_changes',
      { event: '*', schema: 'restaurante', table: 'orders' },
      (payload) => console.log('Change received!', payload)
    )
    .subscribe()
  ```

# ========================================================================
# FASE 2: CORE HOOKS & DATA FETCHING (Tasks 5-8)
# ========================================================================

Task 5: Create useRealtimeOrders Hook
  CREATE src/hooks/useRealtimeOrders.ts:
    - SUBSCRIBE to restaurante.orders changes
    - FILTER by active statuses (exclude SERVED, CANCELLED)
    - MERGE with initial data from GET /api/orders
    - OPTIMISTIC updates on local state
    - AUTO cleanup on unmount

  PATTERN from qr-menu-app useTableCart:
  ```typescript
  useEffect(() => {
    const channel = supabase.channel('active-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'restaurante',
        table: 'orders',
        filter: `status=in.(PENDING,CONFIRMED,PREPARING,READY)`
      }, handleRealtimeChange)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])
  ```

Task 6: Create useOrderMutations Hook
  CREATE src/hooks/useOrderMutations.ts:
    - FUNCTION: updateOrderStatus(orderId, newStatus)
    - FUNCTION: cancelOrder(orderId, reason?)
    - FUNCTION: createPresencialOrder(orderData)
    - USE @tanstack/react-query for mutations
    - OPTIMISTIC updates + rollback on error

  CRITICAL: Validate status transitions
  ```typescript
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['SERVED', 'CANCELLED'],
  }
  ```

Task 7: Create useMenuItemsForPOS Hook
  CREATE src/hooks/useMenuItemsForPOS.ts:
    - FETCH from GET /api/menu (existing endpoint)
    - FILTER: isAvailable = true, stock > 0
    - GROUP by category
    - SEARCH functionality (fuzzy match on name)
    - CACHE with React Query (staleTime: 5 minutes)

Task 8: Create API Endpoints for Orders Management
  CREATE src/app/api/orders/[id]/route.ts:
    - GET: Fetch single order with items + table join
    - PATCH: Update order (notes, status)
    - DELETE: Soft delete (set status = CANCELLED)

  CREATE src/app/api/orders/[id]/status/route.ts:
    - PATCH: Update order status with validation
    - MIDDLEWARE: Check valid transitions
    - TRIGGER: Update timestamps (confirmedAt, readyAt, etc.)

  PATTERN: Reuse validation from qr-menu-app/api/orders/route.ts

# ========================================================================
# FASE 3: UI COMPONENTS - KANBAN BOARD (Tasks 9-12)
# ========================================================================

Task 9: Create OrderStatusBadge Component
  CREATE src/components/orders/order-status-badge.tsx:
    - VARIANT per status with color coding:
      - PENDING: yellow (pending user action)
      - CONFIRMED: blue (acknowledged)
      - PREPARING: orange (in kitchen)
      - READY: green (ready to serve)
      - SERVED: gray (completed)
      - CANCELLED: red (cancelled)
    - ICON per status (Clock, CheckCircle, ChefHat, Bell, Check, X)
    - SIZE variants: sm, md, lg

  REFERENCE: enigma-app/src/components/dashboard/stats/trend-indicator.tsx
  PATTERN: Use CVA (class-variance-authority) for variants

Task 10: Create OrderCard Component
  CREATE src/components/orders/order-card.tsx:
    - DISPLAY: order number, table, items count, total, time elapsed
    - ACTIONS: Quick status change buttons, view details
    - DRAG HANDLE: Visual indicator for drag-and-drop
    - URGENT INDICATOR: Color bar if order > 30min old

  LAYOUT:
  ```tsx
  <Card className="@container cursor-grab">
    <CardHeader>
      <OrderStatusBadge status={order.status} />
      <span className="font-mono">{order.orderNumber}</span>
      <TimeElapsed since={order.orderedAt} />
    </CardHeader>
    <CardContent>
      <TableBadge number={order.table.number} />
      <ItemsList items={order.order_items} />
      <TotalAmount amount={order.totalAmount} />
    </CardContent>
    <CardFooter>
      <QuickActions order={order} />
    </CardFooter>
  </Card>
  ```

Task 11: Create OrderDetailsModal Component
  CREATE src/components/orders/order-details-modal.tsx:
    - FULL order information (all fields)
    - TIMELINE: orderedAt → confirmedAt → readyAt → servedAt
    - ITEMS table with individual statuses
    - EDIT notes (server-side update)
    - ACTIONS: Cancel with reason, print ticket

  USE: Dialog component from shadcn/ui
  PATTERN: Form with React Hook Form for notes editing

Task 12: Create OrderKanbanBoard Component
  CREATE src/components/orders/order-kanban-board.tsx:
    - COLUMNS: PENDING, CONFIRMED, PREPARING, READY, SERVED
    - DRAG-DROP with @dnd-kit/sortable
    - DROP validation: Only allow valid status transitions
    - OPTIMISTIC update on drop
    - EMPTY state per column
    - SCROLL: Vertical scroll within columns, horizontal scroll for board

  CRITICAL PATTERN from dnd-kit docs:
  ```tsx
  import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
  import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

  const [activeOrder, setActiveOrder] = useState(null)

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const newStatus = over.id // Column ID = status name
    updateOrderStatus(active.id, newStatus)
  }

  <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
    {STATUSES.map(status => (
      <SortableContext key={status} items={getOrdersByStatus(status)} strategy={verticalListSortingStrategy}>
        <KanbanColumn status={status}>
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </KanbanColumn>
      </SortableContext>
    ))}
    <DragOverlay>
      {activeOrder && <OrderCard order={activeOrder} isDragging />}
    </DragOverlay>
  </DndContext>
  ```

# ========================================================================
# FASE 4: POS/COMANDERO COMPONENTS (Tasks 13-16)
# ========================================================================

Task 13: Create POSProductSelector Component
  CREATE src/components/orders/pos-product-selector.tsx:
    - GRID layout with menu items (image, name, price, stock)
    - SEARCH bar with instant filtering
    - CATEGORY tabs (Entrantes, Principales, Postres, Bebidas, Vinos)
    - CLICK to add to cart
    - STOCK indicators (green >5, yellow 1-5, red 0)

  LAYOUT: Responsive grid (grid-cols-2 md:grid-cols-4 lg:grid-cols-6)
  PATTERN: Similar to enigma-app/src/app/(admin)/dashboard/menu page

  PERFORMANCE: Virtualize with @tanstack/react-virtual if >100 items

Task 14: Create POSCartPreview Component
  CREATE src/components/orders/pos-cart-preview.tsx:
    - DISPLAY: Selected items with quantity controls
    - EDIT: Special requests per item
    - REMOVE: Delete items from cart
    - TOTAL: Calculated total with VAT breakdown
    - NOTES: General order notes
    - SUBMIT: Create order button (validates stock)

  STATE: Zustand store similar to qr-menu-app cartStore
  CREATE src/stores/posCartStore.ts:
    - Pattern: Factory per session (not per table like QR)
    - addItem, removeItem, updateQuantity, updateNotes
    - clearCart after successful order creation

Task 15: Create TableSelector Component
  CREATE src/components/orders/table-selector.tsx:
    - FETCH available tables from /api/tables
    - VISUAL: Floor plan inspired (pero simple dropdown inicial)
    - FILTER: Only show available or occupied tables
    - VALIDATION: Warn if table already has pending orders

  FUTURE: Link to floor plan from mesas page

Task 16: Create POS Main Page
  CREATE src/app/(admin)/dashboard/pedidos/nuevo/page.tsx:
    - LAYOUT: Split screen (60% products, 40% cart)
    - LEFT: POSProductSelector
    - RIGHT: POSCartPreview + TableSelector
    - WORKFLOW: Select table → Add products → Review → Submit
    - SUCCESS: Redirect to main pedidos page showing new order

  MOBILE: Stack vertically, cart fixed bottom sheet

# ========================================================================
# FASE 5: MAIN ORDERS PAGE (Tasks 17-20)
# ========================================================================

Task 17: Create Orders Filter Toolbar
  CREATE src/components/orders/orders-filter-toolbar.tsx:
    - FILTERS: Status checkboxes, Source dropdown, Table search, Date range
    - SEARCH: Global search on order number, customer email
    - SORT: By time (oldest first = highest priority)
    - REFRESH: Manual refresh button + auto-refresh indicator
    - NEW ORDER: Link to /dashboard/pedidos/nuevo

  STATE: useQueryState for URL persistence
  PATTERN: Similar to reservaciones filters

Task 18: Create Orders Statistics Cards
  CREATE src/components/orders/orders-stats-cards.tsx:
    - METRIC: Active orders (not SERVED/CANCELLED)
    - METRIC: Average preparation time today
    - METRIC: Orders by source (QR vs Presencial breakdown)
    - METRIC: Longest waiting order (urgent alert)

  REALTIME: Update metrics from useRealtimeOrders data
  PATTERN: Use MetricCard from dashboard components

Task 19: Create Main Orders Page
  CREATE src/app/(admin)/dashboard/pedidos/page.tsx:
    - HEADER: Page title, stats cards, filter toolbar
    - MAIN: OrderKanbanBoard (default view)
    - TOGGLE: Switch to table view (TanStack Table)
    - AUDIO: Alert sound for new orders (configurable)

  LAYOUT:
  ```tsx
  <div className="space-y-6">
    <PageHeader title="Gestión de Pedidos" />
    <OrdersStatsCards />
    <OrdersFilterToolbar />
    <ViewToggle /> {/* Kanban | Table */}
    {view === 'kanban' ? <OrderKanbanBoard /> : <OrdersTable />}
  </div>
  ```

Task 20: Create Orders Table View (Alternative to Kanban)
  CREATE src/components/orders/orders-table.tsx:
    - USE @tanstack/react-table
    - COLUMNS: Order#, Table, Status, Source, Items, Total, Time, Actions
    - SORTING: All columns sortable
    - FILTERING: Per-column filters
    - ACTIONS: Quick status change dropdown, view details

  EXPORT: CSV export with all visible data
  PAGINATION: 25 orders per page

  PATTERN from TanStack Table docs:
  ```tsx
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  ```

# ========================================================================
# FASE 6: ENHANCEMENTS & POLISH (Tasks 21-24)
# ========================================================================

Task 21: Audio Alerts System
  CREATE src/lib/orders/order-audio-alerts.ts:
    - FUNCTION: playNewOrderSound()
    - FUNCTION: playUrgentOrderSound() (>30min waiting)
    - SETTINGS: Enable/disable via localStorage
    - ASSETS: Add .mp3 files to public/sounds/

  TRIGGER: useEffect in useRealtimeOrders when new order detected
  PERMISSION: Request notification permission on first use

Task 22: Order Utilities & Validators
  CREATE src/lib/orders/order-utils.ts:
    - calculateTimeSince(timestamp): human-readable "15 min ago"
    - calculatePriority(order): urgency score 1-10
    - formatOrderNumber(orderNumber): pretty display
    - getOrdersByStatus(orders, status): group helper

  CREATE src/lib/orders/order-validators.ts:
    - validateStatusTransition(from, to): boolean
    - canCancelOrder(order): boolean (only if not SERVED)
    - validateOrderItems(items): stock check

Task 23: Responsive Mobile Optimization
  MODIFY all order components:
    - ADD @container queries for adaptive layouts
    - ADJUST touch targets (min 44x44px)
    - SIMPLIFY Kanban on mobile (stack columns, swipe to change)
    - BOTTOM sheet for order details (not modal)

  TEST on iPad (comanderos use tablets)
  VIEWPORT: Test 768px (tablet portrait), 1024px (tablet landscape)

Task 24: Keyboard Shortcuts
  CREATE src/hooks/useOrderKeyboardShortcuts.ts:
    - CMD+N: New order (go to /pedidos/nuevo)
    - CMD+F: Focus search
    - ESC: Close modals
    - ←/→: Navigate between status columns
    - ENTER: Confirm action in modal

  DISPLAY: Keyboard shortcuts help modal (CMD+/)
  PATTERN: Use @react-aria/keyboard for accessibility

# ========================================================================
# FASE 7: TESTING & VALIDATION (Tasks 25-27)
# ========================================================================

Task 25: Integration Tests
  CREATE src/app/(admin)/dashboard/pedidos/__tests__/orders-flow.test.tsx:
    - TEST: Create presencial order → Appears in Kanban PENDING
    - TEST: Drag order PENDING → PREPARING → Success
    - TEST: Try invalid transition READY → PENDING → Blocked
    - TEST: Realtime update from another session → UI updates
    - TEST: Cancel order → Moves to CANCELLED, stock restored

  USE: Playwright for E2E, React Testing Library for components
  MOCK: Supabase with MSW (Mock Service Worker)

Task 26: Performance Validation
  RUN performance audit:
    - Lighthouse score >90 on /dashboard/pedidos
    - First Contentful Paint <1.5s
    - Time to Interactive <3s
    - Realtime latency <500ms (measure with performance.now())

  OPTIMIZE:
    - Code split heavy components (POS page)
    - Memoize expensive calculations (priority sorting)
    - Debounce search inputs (300ms)
    - Virtual scrolling if >50 orders in Kanban

Task 27: Production Deployment Checklist
  VERIFY:
    - [ ] SSH test: Orders table accessible from production
    - [ ] RLS policies work with service_role key
    - [ ] Supabase Realtime channel connects successfully
    - [ ] Stock decrease_menu_item_stock RPC callable
    - [ ] Email notifications work (if enabled)
    - [ ] No console errors in browser
    - [ ] Mobile responsive on real device
    - [ ] Audio alerts play (check permissions)

  MONITOR:
    - Sentry for error tracking (already configured)
    - Supabase dashboard for Realtime connection count
    - Database WAL sender usage (check not at max)
```

### Integration Points

```yaml
DATABASE:
  - Existing tables: restaurante.orders, restaurante.order_items, restaurante.menu_items, restaurante.tables
  - NO migrations needed (schema already exists)
  - ADD index (if not exists): "CREATE INDEX idx_orders_status_source ON restaurante.orders(status, order_source)"
  - VERIFY RLS: Policy "service_role_all_orders" allows full access for backend

SUPABASE REALTIME:
  - Enable: ALTER PUBLICATION supabase_realtime ADD TABLE restaurante.orders
  - Test: ssh root@31.97.182.226 "docker exec db psql -c 'SELECT * FROM pg_publication_tables WHERE pubname = \"supabase_realtime\"'"
  - Monitor: Max WAL senders (current: 10, check with SHOW max_wal_senders)

API ENDPOINTS:
  - REUSE: POST /api/orders from qr-menu-app (already in production)
  - NEW: GET /api/orders?status=PENDING,PREPARING (list active orders)
  - NEW: PATCH /api/orders/:id/status (update order status)
  - NEW: GET /api/orders/:id (single order with joins)

FRONTEND ROUTES:
  - ADD to sidebar: /dashboard/pedidos (main orders page)
  - ADD to sidebar: /dashboard/pedidos/nuevo (POS/comandero)
  - UPDATE: src/app/(admin)/dashboard/layout.tsx (add nav items)

STATE MANAGEMENT:
  - Zustand for POS cart (src/stores/posCartStore.ts)
  - React Query for API calls (@tanstack/react-query)
  - Supabase Realtime for live updates (useRealtimeOrders hook)

FUTURE INTEGRATION (cocina.enigmaconalma.com):
  - Same orders table (read-only for kitchen)
  - Filter: status IN ('CONFIRMED', 'PREPARING')
  - Display: Simplified KDS view (no edit, just mark READY)
  - Architecture: Separate Next.js app, shared Supabase client
```

## Validation Loop

### Level 1: Syntax & Type Checking
```bash
# Run FIRST - fix errors before proceeding
npm run type-check   # TypeScript compilation
npm run lint         # ESLint rules

# Expected: No errors
# If errors: Read carefully, fix one by one
```

### Level 2: Component Unit Tests
```typescript
// Test critical business logic
describe('useRealtimeOrders', () => {
  test('subscribes to orders channel on mount', () => {
    // Mock Supabase channel
    // Assert .subscribe() called
  })

  test('updates state when new order received', () => {
    // Emit INSERT event
    // Assert order added to state
  })

  test('unsubscribes on unmount', () => {
    // Unmount component
    // Assert removeChannel() called
  })
})

describe('order-validators', () => {
  test('allows valid status transitions', () => {
    expect(validateStatusTransition('PENDING', 'CONFIRMED')).toBe(true)
  })

  test('blocks invalid status transitions', () => {
    expect(validateStatusTransition('READY', 'PENDING')).toBe(false)
  })
})
```

```bash
npm run test:unit
# If failing: Read error, fix logic, re-run
```

### Level 3: Integration Tests
```bash
# Start development server
npm run dev

# Run Playwright E2E tests
npm run test:e2e -- pedidos

# Test scenarios:
# 1. Navigate to /dashboard/pedidos → Page loads
# 2. Realtime updates → Order appears without refresh
# 3. Drag-drop order → Status changes, DB updated
# 4. Create new order via POS → Appears in Kanban
# 5. Cancel order → Stock restored, status updated
```

### Level 4: Production Validation
```bash
# SSH to production database
ssh root@31.97.182.226 "docker exec db psql -U postgres -c 'SELECT COUNT(*) FROM restaurante.orders WHERE status != \"SERVED\"'"

# Verify Realtime publication
ssh root@31.97.182.226 "docker exec db psql -U postgres -c 'SELECT * FROM pg_publication_tables WHERE pubname = \"supabase_realtime\" AND tablename = \"orders\"'"

# Test API endpoint
curl -X GET https://enigmaconalma.com/api/orders?status=PENDING \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Expected: JSON array of pending orders
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build successful: `npm run build`
- [ ] Realtime subscription connects: Check browser DevTools → Network → WS
- [ ] Drag-drop works smoothly: Try dragging order card in Kanban
- [ ] Stock validation works: Try creating order with quantity > stock → Error
- [ ] Audio alerts play: Create test order, hear notification
- [ ] Mobile responsive: Test on iPad, iPhone
- [ ] SSH database queries work: Verify orders in production
- [ ] No console errors in production build

---

## Anti-Patterns to Avoid
- ❌ Don't use mock data - connect to production DB from day 1
- ❌ Don't skip status transition validation - enforce flow rules
- ❌ Don't forget Realtime cleanup - memory leaks are serious
- ❌ Don't hardcode order statuses - use enum from database
- ❌ Don't batch multiple status changes - one at a time for clarity
- ❌ Don't ignore stock validation - causes customer service issues
- ❌ Don't create new cart pattern - reuse qr-menu-app factory pattern
- ❌ Don't implement without SSH test first - verify DB access
- ❌ Don't use array indices as keys - breaks drag-drop

## Next Steps (Post-Implementation)
1. **User Training**: Create guide for comanderos (screenshots + video)
2. **Kitchen Display App**: Duplicate project for cocina.enigmaconalma.com
3. **Analytics**: Add order completion time metrics to dashboard
4. **Notifications**: Browser push notifications for urgent orders
5. **Integrations**: Connect to external delivery platforms (Uber Eats, etc.)
