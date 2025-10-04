name: "Comandero - Sistema de Gestión de Pedidos para Enigma Restaurant Platform"
description: |

## Purpose
Sistema completo de gestión de pedidos en tiempo real para staff de restaurante: comandero rápido para crear pedidos presenciales + dashboard para gestionar todos los pedidos (QR + presenciales) con Kanban drag-and-drop y real-time updates.

## Core Principles
1. **Context is King**: Integramos con sistema QR menu.enigmaconalma.com existente
2. **Validation Loops**: Tests en cada feature crítica (real-time, stock, estados)
3. **Information Dense**: Patrones probados de dnd-kit, TanStack Table, Supabase Realtime
4. **Progressive Success**: Start simple (lista órdenes), validate, enhance (drag-drop, real-time)
5. **Global rules**: Seguir CLAUDE.md - SSH-first, batch processing, no mock data

---

## Goal
Desarrollar página "Comandero" en enigma-app sidebar que permita:
- **Staff**: Crear pedidos presenciales rápidamente (TPV-style)
- **Managers**: Gestionar todos los pedidos en tiempo real (QR + presenciales)
- **Kitchen**: Preparar arquitectura para futura app cocina.enigmaconalma.com
- **Integration**: Single source of truth en restaurante.orders table

## Why
- **Business value**: Unificar pedidos QR (menu.enigmaconalma.com) + presenciales en enigma-app
- **Integration**: Staff puede tomar pedidos sin papel, kitchen ve todo en tiempo real
- **Problems solved**:
  - Para Comanderos: Crear pedidos en <30s, asignar mesas, validar stock automáticamente
  - Para Managers: Vista completa de operaciones, cambiar estados con drag-drop
  - Para Kitchen: Receive orders en tiempo real (via futura KDS app)

## What
Sistema de gestión de pedidos con 2 componentes principales:

### 1. TPV/Comandero Rápido (`/dashboard/comandero/nuevo`)
- Selección rápida de productos con grid visual
- Búsqueda instantánea de items del menú
- Asignación de mesa
- Vista previa del ticket
- Creación directa en DB (mismo endpoint que QR)
- Validación automática de stock

### 2. Dashboard de Gestión (`/dashboard/comandero`)
- Vista Kanban con drag-and-drop (PENDING → PREPARING → READY → SERVED)
- Real-time updates vía Supabase
- Filtros avanzados (estado, fuente, mesa, fecha)
- Vista tabla alternativa (export, sorting)
- Estadísticas en vivo
- Audio alerts para nuevas órdenes

### Success Criteria
- [x] Crear orden presencial en <30 segundos
- [x] Real-time updates <500ms latency
- [x] Drag-and-drop fluido sin glitches
- [x] Stock validation automática antes de confirmar
- [x] Vista móvil optimizada (tablets para comanderos)
- [x] Arquitectura lista para KDS separado

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

- file: /Users/lr0y/local-ai-packaged/qr-menu-app/src/app/api/orders/route.ts
  why: Endpoint existente de creación de pedidos QR
  critical: |
    - Usa mismo schema restaurante.orders
    - Stock validation con decrease_menu_item_stock RPC
    - Email tracking con tokens (opcional para presenciales)
    - Rollback automático si falla stock reservation

- file: /Users/lr0y/local-ai-packaged/qr-menu-app/src/stores/cartStore.ts
  why: Patrón Zustand con persist
  critical: |
    - Factory pattern: un store por sesión
    - localStorage con TTL cleanup cada hora
    - addItem, removeItem, updateQuantity patterns

- docfile: enigma-app/CLAUDE.md
  why: Reglas inmutables del proyecto
  critical: |
    - SSH-FIRST: Validar DB antes de implementar
    - Batch processing: Parallel tool calls siempre
    - No mock data: Producción desde día 1
```

### Current Codebase Tree
```bash
enigma-app/
├── src/
│   ├── app/(admin)/
│   │   └── dashboard/
│   │       ├── page.tsx                    # Dashboard principal
│   │       ├── analytics/                  # Analytics
│   │       ├── clientes/                   # Customers
│   │       ├── configuracion/              # Settings
│   │       ├── menu/                       # Menu management
│   │       ├── mesas/                      # Tables floor plan
│   │       └── reservaciones/              # Reservations
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── stats/metric-card.tsx
│   │   │   └── widgets/
│   │   └── ui/                            # Shadcn components
│   │       ├── card.tsx                   # Rounded-xl, gap-6
│   │       ├── button.tsx                 # Shadow-xs, ring-[3px]
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useDashboardMetrics.ts
│   │   └── useRealtimeReservations.ts     # Pattern for realtime
│   │
│   └── lib/supabase/
│       ├── client.ts
│       └── server.ts

# DATABASE SCHEMA (PostgreSQL via SSH)
restaurante.orders:
  - id, orderNumber (ENI-YYMMDD-XXXXXX)
  - totalAmount, status (PENDING|CONFIRMED|PREPARING|READY|SERVED|CANCELLED)
  - tableId, customerId (nullable), restaurantId
  - order_source (presencial|qr|online|telefono)
  - timestamps: orderedAt, confirmedAt, readyAt, servedAt

restaurante.order_items:
  - id, orderId, menuItemId
  - quantity, unitPrice, totalPrice
  - status, notes (special requests)
```

### Desired Codebase Tree
```bash
enigma-app/src/
├── app/(admin)/dashboard/
│   └── comandero/                         # ✨ NEW PAGE
│       ├── page.tsx                       # Main orders management
│       └── nuevo/                         # TPV/Comandero quick create
│           └── page.tsx
│
├── components/comandero/                  # ✨ NEW DIRECTORY
│   ├── order-kanban-board.tsx            # Drag-drop Kanban (dnd-kit)
│   ├── order-card.tsx                    # Card por cada orden
│   ├── order-details-modal.tsx           # Modal detalles completos
│   ├── order-status-badge.tsx            # Badge con color por estado
│   ├── orders-filter-toolbar.tsx         # Filtros y búsqueda
│   ├── orders-stats-cards.tsx            # Métricas en tiempo real
│   ├── orders-table.tsx                  # Vista tabla (TanStack Table)
│   │
│   └── pos/                               # TPV components
│       ├── product-selector.tsx          # Grid de productos
│       ├── cart-preview.tsx              # Vista previa ticket
│       └── table-selector.tsx            # Selector de mesa
│
├── hooks/
│   ├── useRealtimeOrders.ts              # ✨ Supabase subscription
│   ├── useOrderMutations.ts              # ✨ CRUD operations
│   └── useMenuItemsForPOS.ts             # ✨ Products for TPV
│
├── stores/
│   └── posCartStore.ts                   # ✨ Zustand for POS cart
│
├── lib/comandero/                        # ✨ NEW DIRECTORY
│   ├── order-utils.ts                    # Time calculations, priority
│   ├── order-validators.ts               # Status flow validation
│   └── order-audio-alerts.ts             # Audio notifications
│
└── app/api/orders/                       # EXTEND existing
    ├── [id]/
    │   ├── route.ts                      # GET, PATCH, DELETE
    │   └── status/
    │       └── route.ts                  # PATCH /orders/:id/status
    └── route.ts                          # GET list (with filters)
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: dnd-kit requires stable IDs
// ❌ BAD: orders.map((order, index) => <OrderCard key={index} />)
// ✅ GOOD: orders.map((order) => <OrderCard key={order.id} id={order.id} />)

// CRITICAL: Supabase Realtime cleanup on unmount
useEffect(() => {
  const channel = supabase.channel('orders')
  // ... setup subscription
  return () => { supabase.removeChannel(channel) }
}, [])

// CRITICAL: OrderStatus flow validation
// PENDING → CONFIRMED → PREPARING → READY → SERVED
// Allow: any → CANCELLED
// Disallow: READY → PENDING (no backwards except cancel)

// GOTCHA: @dnd-kit modifiers must be memoized
const modifiers = useMemo(() => [restrictToVerticalAxis], [])
<DndContext modifiers={modifiers}>

// GOTCHA: Stock validation MUST happen server-side
// Already implemented in qr-menu-app/api/orders/route.ts
// Pattern: Check stock → Reserve → Create order → Rollback if fails
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// ========================================================================
// SHARED TYPES
// ========================================================================

// src/types/order.ts
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED'

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

  orderedAt: string
  confirmedAt?: string
  readyAt?: string
  servedAt?: string

  order_items: OrderItem[]
  table?: {
    id: string
    number: string
    location: string
  }
}

// ========================================================================
// POS TYPES
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

export interface CreateOrderDTO {
  tableId: string
  items: Array<{
    menuItemId: string
    quantity: number
    specialRequests?: string
  }>
  notes?: string
  order_source: 'presencial'
}

// ========================================================================
// REALTIME TYPES
// ========================================================================

// src/types/realtime.ts
export interface RealtimeOrderPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Order
  old: Order
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

Task 2: Database Validation via SSH
  SSH to production:
    - VERIFY: restaurante.orders table structure
    - VERIFY: OrderStatus enum values (6 values: PENDING...CANCELLED)
    - VERIFY: RLS policy "service_role_all_orders" exists
    - VERIFY: Realtime publication includes orders table
    - TEST: SELECT * FROM restaurante.orders WHERE order_source = 'qr' LIMIT 5

  COMMAND:
  ```bash
  ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c '\\d+ restaurante.orders'"

  ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c 'SELECT * FROM pg_publication_tables WHERE pubname = \"supabase_realtime\" AND schemaname = \"restaurante\"'"
  ```

Task 3: Create Shared Types
  CREATE src/types/order.ts:
    - OrderStatus, OrderSource types
    - Order, OrderItem interfaces
    - Include table relation (join data)

  CREATE src/types/pos.ts:
    - POSCartItem, CreateOrderDTO

  CREATE src/types/realtime.ts:
    - RealtimeOrderPayload, OrderFilters

Task 4: Setup Supabase Realtime Infrastructure
  CREATE src/lib/supabase/realtime-config.ts:
    - getRealtimeChannel(channelName: string)
    - subscribeToOrders(callback, filters)
    - Auto-reconnect on disconnect
    - Exponential backoff retry

  TEST with minimal subscription:
  ```typescript
  const channel = supabase.channel('test-orders')
    .on('postgres_changes',
      { event: '*', schema: 'restaurante', table: 'orders' },
      (payload) => console.log('Change:', payload)
    )
    .subscribe()
  ```

# ========================================================================
# FASE 2: CORE HOOKS & DATA LAYER (Tasks 5-8)
# ========================================================================

Task 5: Create useRealtimeOrders Hook
  CREATE src/hooks/useRealtimeOrders.ts:
    - Subscribe to restaurante.orders changes
    - Filter by active statuses (exclude SERVED, CANCELLED)
    - Merge with initial data from GET /api/orders
    - Optimistic updates on local state
    - Auto cleanup on unmount

  PATTERN:
  ```typescript
  'use client'

  export function useRealtimeOrders(filters?: OrderFilters) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      // 1. Fetch initial data
      fetchOrders(filters).then(setOrders)

      // 2. Subscribe to changes
      const channel = supabase
        .channel('active-orders')
        .on('postgres_changes', {
          event: '*',
          schema: 'restaurante',
          table: 'orders',
          filter: 'status=in.(PENDING,CONFIRMED,PREPARING,READY)'
        }, handleRealtimeChange)
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }, [filters])

    return { orders, loading, refetch }
  }
  ```

Task 6: Create useOrderMutations Hook
  CREATE src/hooks/useOrderMutations.ts:
    - updateOrderStatus(orderId, newStatus)
    - cancelOrder(orderId, reason?)
    - createPresencialOrder(orderData)
    - Use @tanstack/react-query mutations
    - Optimistic updates + rollback on error

  VALIDATION: Check valid transitions
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
    - Fetch from GET /api/menu
    - Filter: isAvailable = true, stock > 0
    - Group by category
    - Search functionality (fuzzy match on name)
    - Cache with React Query (staleTime: 5min)

Task 8: Create/Extend API Endpoints
  CREATE src/app/api/orders/[id]/route.ts:
    - GET: Fetch single order with items + table join
    - PATCH: Update order (notes, status)
    - DELETE: Soft delete (status = CANCELLED)

  CREATE src/app/api/orders/[id]/status/route.ts:
    - PATCH: Update order status with validation
    - Check valid transitions
    - Update timestamps (confirmedAt, readyAt, servedAt)

  MODIFY src/app/api/orders/route.ts:
    - ADD GET handler: List orders with filters (status, source, table, date)
    - Keep existing POST handler (from qr-menu-app)

# ========================================================================
# FASE 3: UI COMPONENTS - KANBAN BOARD (Tasks 9-12)
# ========================================================================

Task 9: Create OrderStatusBadge Component
  CREATE src/components/comandero/order-status-badge.tsx:
    - Variants per status with color coding:
      - PENDING: yellow (Clock icon)
      - CONFIRMED: blue (CheckCircle icon)
      - PREPARING: orange (ChefHat icon)
      - READY: green (Bell icon)
      - SERVED: gray (Check icon)
      - CANCELLED: red (X icon)
    - Sizes: sm, md, lg
    - Use CVA (class-variance-authority)

Task 10: Create OrderCard Component
  CREATE src/components/comandero/order-card.tsx:
    - Display: order#, table, items count, total, time elapsed
    - Actions: Quick status change, view details
    - Drag handle: Visual indicator
    - Urgent indicator: Red bar if >30min old

  LAYOUT:
  ```tsx
  <Card className="@container cursor-grab">
    <CardHeader className="flex-row justify-between">
      <OrderStatusBadge status={order.status} />
      <span className="font-mono text-sm">{order.orderNumber}</span>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <span>Mesa {order.table.number}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {order.order_items.length} items · €{order.totalAmount}
      </div>
      <TimeElapsed since={order.orderedAt} />
    </CardContent>
  </Card>
  ```

Task 11: Create OrderDetailsModal Component
  CREATE src/components/comandero/order-details-modal.tsx:
    - Full order info (all fields)
    - Timeline: orderedAt → confirmedAt → readyAt → servedAt
    - Items table with individual statuses
    - Edit notes (server update)
    - Actions: Cancel with reason, print ticket

  USE: Dialog from shadcn/ui
  PATTERN: React Hook Form for notes

Task 12: Create OrderKanbanBoard Component
  CREATE src/components/comandero/order-kanban-board.tsx:
    - Columns: PENDING, CONFIRMED, PREPARING, READY, SERVED
    - Drag-drop with @dnd-kit/sortable
    - Drop validation: Only valid transitions
    - Optimistic update on drop
    - Empty state per column
    - Scroll: Vertical within columns

  CRITICAL PATTERN:
  ```tsx
  import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
  import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const newStatus = over.id as OrderStatus
    const orderId = active.id as string

    updateOrderStatus(orderId, newStatus)
  }

  <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
    {STATUSES.map(status => (
      <SortableContext
        key={status}
        items={getOrdersByStatus(status).map(o => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <KanbanColumn status={status}>
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </KanbanColumn>
      </SortableContext>
    ))}
    <DragOverlay>
      {activeOrder && <OrderCard order={activeOrder} />}
    </DragOverlay>
  </DndContext>
  ```

# ========================================================================
# FASE 4: POS/COMANDERO COMPONENTS (Tasks 13-16)
# ========================================================================

Task 13: Create POSProductSelector Component
  CREATE src/components/comandero/pos/product-selector.tsx:
    - Grid layout with menu items (image, name, price, stock)
    - Search bar with instant filtering
    - Category tabs (Entrantes, Principales, Postres, Bebidas, Vinos)
    - Click to add to cart
    - Stock indicators (green >5, yellow 1-5, red 0)

  LAYOUT: grid-cols-2 md:grid-cols-4 lg:grid-cols-6
  PERFORMANCE: Virtualize with @tanstack/react-virtual if >100 items

Task 14: Create POSCartPreview Component
  CREATE src/components/comandero/pos/cart-preview.tsx:
    - Display: Selected items with quantity controls
    - Edit: Special requests per item
    - Remove: Delete items
    - Total: Calculated with VAT
    - Notes: General order notes
    - Submit: Create order button (validates stock)

  STATE: Use posCartStore

  CREATE src/stores/posCartStore.ts:
    - Zustand store
    - addItem, removeItem, updateQuantity, updateNotes
    - clearCart after success
    - No persist (session only)

Task 15: Create TableSelector Component
  CREATE src/components/comandero/pos/table-selector.tsx:
    - Fetch available tables from /api/tables
    - Simple dropdown (futuro: floor plan visual)
    - Filter: Show available or occupied tables
    - Validation: Warn if table has pending orders

Task 16: Create POS Main Page
  CREATE src/app/(admin)/dashboard/comandero/nuevo/page.tsx:
    - Layout: Split screen (60% products, 40% cart)
    - LEFT: POSProductSelector
    - RIGHT: POSCartPreview + TableSelector
    - Workflow: Select table → Add products → Review → Submit
    - Success: Redirect to /dashboard/comandero

  MOBILE: Stack vertically, cart fixed bottom sheet

# ========================================================================
# FASE 5: MAIN COMANDERO PAGE (Tasks 17-20)
# ========================================================================

Task 17: Create OrdersFilterToolbar Component
  CREATE src/components/comandero/orders-filter-toolbar.tsx:
    - Filters: Status checkboxes, Source dropdown, Table search, Date range
    - Search: Global on order#, email
    - Sort: By time (oldest first)
    - Refresh: Manual + auto-refresh indicator
    - New order button: Link to /comandero/nuevo

  STATE: useQueryState for URL persistence

Task 18: Create OrdersStatsCards Component
  CREATE src/components/comandero/orders-stats-cards.tsx:
    - Metric: Active orders count
    - Metric: Avg preparation time today
    - Metric: Orders by source (QR vs Presencial)
    - Metric: Longest waiting order (urgent alert)

  REALTIME: Update from useRealtimeOrders
  PATTERN: Use MetricCard from dashboard

Task 19: Create OrdersTable Component (Alternative View)
  CREATE src/components/comandero/orders-table.tsx:
    - Use @tanstack/react-table
    - Columns: Order#, Table, Status, Source, Items, Total, Time, Actions
    - All columns sortable
    - Per-column filters
    - Actions: Quick status dropdown, view details
    - Export: CSV with visible data
    - Pagination: 25 per page

Task 20: Create Main Comandero Page
  CREATE src/app/(admin)/dashboard/comandero/page.tsx:
    - Header: Title, stats cards, filter toolbar
    - Main: OrderKanbanBoard (default view)
    - Toggle: Switch to table view
    - Audio: Alert for new orders (configurable)

  LAYOUT:
  ```tsx
  'use client'

  export default function ComanderoPage() {
    const { orders, loading } = useRealtimeOrders()
    const [view, setView] = useState<'kanban' | 'table'>('kanban')

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Comandero</h1>
          <Button asChild>
            <Link href="/dashboard/comandero/nuevo">
              Nuevo Pedido
            </Link>
          </Button>
        </div>

        <OrdersStatsCards orders={orders} />
        <OrdersFilterToolbar />

        <div className="flex justify-end">
          <ToggleGroup type="single" value={view} onValueChange={setView}>
            <ToggleGroupItem value="kanban">Kanban</ToggleGroupItem>
            <ToggleGroupItem value="table">Tabla</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {view === 'kanban'
          ? <OrderKanbanBoard orders={orders} />
          : <OrdersTable orders={orders} />
        }
      </div>
    )
  }
  ```

# ========================================================================
# FASE 6: ENHANCEMENTS & UTILITIES (Tasks 21-23)
# ========================================================================

Task 21: Audio Alerts System
  CREATE src/lib/comandero/order-audio-alerts.ts:
    - playNewOrderSound()
    - playUrgentOrderSound() (>30min)
    - Settings: Enable/disable via localStorage
    - Assets: Add .mp3 to public/sounds/

  TRIGGER: useEffect in useRealtimeOrders
  PERMISSION: Request notification permission

Task 22: Order Utilities & Validators
  CREATE src/lib/comandero/order-utils.ts:
    - calculateTimeSince(timestamp): "15 min ago"
    - calculatePriority(order): urgency 1-10
    - formatOrderNumber(orderNumber): display
    - getOrdersByStatus(orders, status): grouping

  CREATE src/lib/comandero/order-validators.ts:
    - validateStatusTransition(from, to): boolean
    - canCancelOrder(order): boolean
    - validateOrderItems(items): stock check

Task 23: Keyboard Shortcuts
  CREATE src/hooks/useOrderKeyboardShortcuts.ts:
    - CMD+N: New order
    - CMD+F: Focus search
    - ESC: Close modals
    - ←/→: Navigate columns
    - ENTER: Confirm action

  DISPLAY: Help modal (CMD+/)
  PATTERN: Use @react-aria/keyboard

# ========================================================================
# FASE 7: INTEGRATION & SIDEBAR (Tasks 24-25)
# ========================================================================

Task 24: Add Comandero to Sidebar Navigation
  MODIFY src/app/(admin)/dashboard/layout.tsx:
    - ADD nav item: "Comandero" with UtensilsCrossed icon
    - Route: /dashboard/comandero
    - Position: After "Mesas", before "Clientes"

  UPDATE sidebar component with proper permissions check

Task 25: Update Dashboard Quick Actions
  MODIFY src/components/dashboard/widgets/quick-actions.tsx:
    - ADD action: "Nuevo Pedido" → /dashboard/comandero/nuevo
    - Icon: Plus + UtensilsCrossed
    - Position: Primary actions section

# ========================================================================
# FASE 8: TESTING & VALIDATION (Tasks 26-28)
# ========================================================================

Task 26: Integration Tests
  CREATE src/app/(admin)/dashboard/comandero/__tests__/:
    - test-orders-flow.test.tsx
    - test-pos-creation.test.tsx
    - test-realtime-updates.test.tsx

  TEST scenarios:
    - Create presencial order → Appears in Kanban PENDING
    - Drag PENDING → PREPARING → Success
    - Invalid transition READY → PENDING → Blocked
    - Realtime update → UI updates
    - Cancel order → Stock restored

  USE: Playwright E2E, React Testing Library

Task 27: Performance Validation
  RUN audits:
    - Lighthouse >90 on /dashboard/comandero
    - First Contentful Paint <1.5s
    - Realtime latency <500ms

  OPTIMIZE:
    - Code split POS page
    - Memoize sorting calculations
    - Debounce search (300ms)
    - Virtual scrolling if >50 orders

Task 28: Production Deployment Checklist
  VERIFY:
    - [ ] SSH: Orders table accessible
    - [ ] RLS policies work with service_role
    - [ ] Realtime channel connects
    - [ ] Stock RPC callable
    - [ ] No console errors
    - [ ] Mobile responsive (tablet tested)
    - [ ] Audio alerts work

  MONITOR:
    - Sentry for errors
    - Supabase dashboard for connections
    - WAL sender usage
```

### Integration Points

```yaml
DATABASE:
  - Tables: restaurante.orders, restaurante.order_items, restaurante.menu_items, restaurante.tables
  - NO migrations needed (exists)
  - ADD index: "CREATE INDEX idx_orders_status_source ON restaurante.orders(status, order_source)"
  - VERIFY RLS: "service_role_all_orders" policy

SUPABASE REALTIME:
  - Enable: ALTER PUBLICATION supabase_realtime ADD TABLE restaurante.orders
  - Test: ssh check pg_publication_tables
  - Monitor: max_wal_senders

API ENDPOINTS:
  - REUSE: POST /api/orders (from qr-menu-app)
  - NEW: GET /api/orders (list with filters)
  - NEW: PATCH /api/orders/:id/status
  - NEW: GET /api/orders/:id

FRONTEND ROUTES:
  - /dashboard/comandero (main page)
  - /dashboard/comandero/nuevo (POS)
  - UPDATE layout.tsx sidebar navigation

STATE:
  - Zustand: posCartStore (session only)
  - React Query: API calls + cache
  - Supabase Realtime: useRealtimeOrders
```

## Validation Loop

### Level 1: Type & Lint Checking
```bash
npm run type-check   # TypeScript
npm run lint         # ESLint
# Expected: No errors
```

### Level 2: Unit Tests
```typescript
describe('useRealtimeOrders', () => {
  test('subscribes on mount', () => {})
  test('updates on INSERT event', () => {})
  test('unsubscribes on unmount', () => {})
})

describe('order-validators', () => {
  test('allows valid transitions', () => {
    expect(validateStatusTransition('PENDING', 'CONFIRMED')).toBe(true)
  })
  test('blocks invalid transitions', () => {
    expect(validateStatusTransition('READY', 'PENDING')).toBe(false)
  })
})
```

```bash
npm run test:unit
```

### Level 3: Integration Tests
```bash
npm run dev
npm run test:e2e -- comandero

# Scenarios:
# 1. Navigate /dashboard/comandero → loads
# 2. Realtime → order appears
# 3. Drag-drop → status changes
# 4. Create via POS → appears in Kanban
# 5. Cancel → stock restored
```

### Level 4: Production Validation
```bash
# SSH database checks
ssh root@31.97.182.226 "docker exec db psql -U postgres -c 'SELECT COUNT(*) FROM restaurante.orders WHERE status != \"SERVED\"'"

# Realtime publication
ssh root@31.97.182.226 "docker exec db psql -U postgres -c 'SELECT * FROM pg_publication_tables WHERE pubname = \"supabase_realtime\" AND tablename = \"orders\"'"

# API test
curl https://enigmaconalma.com/api/orders?status=PENDING
```

## Final Validation Checklist
- [ ] All tests pass
- [ ] No lint/type errors
- [ ] Build successful
- [ ] Realtime connects (check Network → WS)
- [ ] Drag-drop smooth
- [ ] Stock validation works
- [ ] Audio alerts play
- [ ] Mobile responsive (tablet)
- [ ] SSH queries work
- [ ] No console errors

---

## Anti-Patterns to Avoid
- ❌ Don't use mock data
- ❌ Don't skip status transition validation
- ❌ Don't forget Realtime cleanup
- ❌ Don't hardcode statuses
- ❌ Don't batch multiple status changes
- ❌ Don't ignore stock validation
- ❌ Don't use array indices as keys

## Next Steps (Post-Implementation)
1. **User Training**: Guide for comanderos
2. **Kitchen Display App**: cocina.enigmaconalma.com (separate PRP)
3. **Analytics**: Order completion time metrics
4. **Notifications**: Browser push for urgent orders
5. **Integrations**: Delivery platforms (Uber Eats, etc.)
