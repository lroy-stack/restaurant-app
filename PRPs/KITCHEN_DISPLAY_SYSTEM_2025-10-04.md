name: "Kitchen Display System (KDS) - cocina.enigmaconalma.com"
description: |

## Purpose
App dedicada para cocina que muestra pedidos en tiempo real desde restaurante.orders. Sistema simplificado read-only donde chefs solo ven órdenes CONFIRMED/PREPARING y marcan como READY cuando terminan. Optimizado para pantallas grandes en ambiente de cocina.

## Core Principles
1. **Kitchen-First UX**: Diseñado para ambiente de alta presión, velocidad crítica
2. **Real-time Only**: Sin recargas manuales, todo vía Supabase Realtime
3. **Touch-Optimized**: Botones grandes (min 64px), anti-grasa screen protection
4. **Minimal Cognitive Load**: Sin opciones innecesarias, flujo lineal
5. **Global rules**: Seguir CLAUDE.md - SSH-first, batch processing, no mock data

---

## Goal
Desarrollar app Next.js 15 standalone para cocina.enigmaconalma.com que:
- Muestra solo pedidos activos (CONFIRMED, PREPARING) en tiempo real
- Permite marcar pedidos como READY (único cambio de estado permitido)
- Prioriza automáticamente por tiempo de espera
- Muestra detalles completos de cada item (notas, modificaciones)
- Audio/visual alerts para nuevas órdenes
- Vista optimizada para pantalla grande fija en cocina

## Why
- **Business value**: Eliminar tickets de papel, reducir errores de comunicación
- **Integration**: Recibe pedidos de comandero + QR en tiempo real
- **Problems solved**:
  - Para Chefs: Saben qué preparar primero, ven todas las modificaciones claramente
  - Para Comanderos: No necesitan gritar pedidos a cocina
  - Para Managers: Métricas de tiempo de preparación en tiempo real
  - Para Clientes: Menor tiempo de espera, menos errores en pedidos

## What
Sistema KDS con 3 vistas principales:

### 1. Vista Principal - Active Orders Grid
- Grid de cards con pedidos CONFIRMED y PREPARING
- Auto-sort por tiempo de espera (oldest first)
- Color coding por urgencia (verde <15min, amarillo 15-30min, rojo >30min)
- Botón grande "READY" por orden
- Timer visual en cada card

### 2. Vista Detalle - Order Breakdown
- Full screen modal con todos los items
- Notas especiales destacadas en rojo
- Alergias resaltadas (si existen)
- Modificaciones por item
- Print button para ticket de cocina

### 3. Vista Completados - Recent READY Orders
- Órdenes marcadas READY últimas 2 horas
- Para referencia rápida
- Auto-clean después de 2 horas

### Success Criteria
- [x] Real-time updates <300ms latency (crítico para cocina)
- [x] Marcar READY en <2 segundos (1 tap)
- [x] Auto-sort sin intervención manual
- [x] Audio alert audible en cocina ruidosa (>80dB)
- [x] Funciona en pantalla táctil 24" (full HD 1920x1080)
- [x] Uptime >99.9% (critical kitchen operations)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Context7 + Best Practices

- url: https://github.com/supabase/realtime
  why: Real-time subscription a restaurante.orders
  critical: |
    - Filter en subscription: status IN ('CONFIRMED', 'PREPARING')
    - Auto-reconnect con exponential backoff crítico
    - Heartbeat monitoring cada 30s

- url: https://medium.com/@osamahaashir/cooking-up-success-revamping-kitchen-display-system-kds-ux-case-study-6a6c92784fb9
  why: KDS UX best practices - prioritization, color coding, touch targets
  critical: |
    - Auto-prioritize por tiempo de espera
    - Color bars en top de cards (verde/amarillo/rojo)
    - Large touch targets (min 64x64px)
    - Audio alerts con visual fallback
    - Manual override para casos especiales

- url: https://smart-interface-design-patterns.com/articles/drag-and-drop-ux/
  why: Optional drag-drop para reordenar prioridades manualmente
  critical: |
    - Touch-friendly drag handles
    - Clear drop zones
    - Haptic feedback en mobile/tablet

- file: /Users/lr0y/local-ai-packaged/enigma-app/PRPs/COMANDERO_SYSTEM_2025-10-04.md
  why: Shared types, API endpoints, database schema
  critical: |
    - Mismo restaurante.orders table
    - Order, OrderItem interfaces compartidos
    - API GET /api/orders para initial load
    - Realtime subscription patterns

- docfile: enigma-app/CLAUDE.md
  why: Reglas inmutables del proyecto
  critical: |
    - SSH-FIRST: Validar DB access desde nueva app
    - No mock data: Producción desde día 1
    - Supabase service_role key para backend
```

### Current Infrastructure (Shared with enigma-app)
```bash
# DATABASE (PostgreSQL via SSH)
restaurante.orders:
  - id, orderNumber, status, totalAmount
  - tableId, order_source (presencial|qr)
  - orderedAt, confirmedAt, readyAt
  - notes (order-level)

restaurante.order_items:
  - id, orderId, menuItemId
  - quantity, status (per-item status)
  - notes (item-level: "sin cebolla", "poco hecho")

restaurante.menu_items:
  - id, name, category
  - allergens (EU-14 compliance)

# SUPABASE CONFIG
URL: https://supabase.enigmaconalma.com
Key: SUPABASE_SERVICE_ROLE_KEY (from enigma-app .env)
Schema: restaurante
Realtime: Enabled on orders table
```

### Desired Codebase Tree (NEW PROJECT)
```bash
cocina.enigmaconalma.com/                 # ✨ NEW Next.js 15 PROJECT
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (minimal)
│   │   ├── page.tsx                      # Main KDS view
│   │   ├── globals.css                   # Kitchen-optimized theme
│   │   └── api/
│   │       └── orders/
│   │           └── [id]/
│   │               └── status/
│   │                   └── route.ts      # PATCH to mark READY
│   │
│   ├── components/
│   │   ├── kds/
│   │   │   ├── order-grid.tsx           # Main grid de órdenes
│   │   │   ├── order-card.tsx           # Card simplificado para cocina
│   │   │   ├── order-detail-modal.tsx   # Full screen modal
│   │   │   ├── priority-indicator.tsx   # Visual timer + color bar
│   │   │   └── ready-button.tsx         # Large touch button
│   │   │
│   │   └── ui/                           # Minimal shadcn components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── badge.tsx
│   │
│   ├── hooks/
│   │   ├── useKitchenOrders.ts          # Realtime subscription
│   │   └── useMarkOrderReady.ts         # Mutation hook
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser client
│   │   │   └── server.ts                # Server client
│   │   └── kds/
│   │       ├── order-priority.ts        # Calculate urgency
│   │       ├── audio-alerts.ts          # Kitchen alerts
│   │       └── order-formatter.ts       # Display helpers
│   │
│   └── types/
│       ├── order.ts                      # Shared with enigma-app
│       └── kds.ts                        # KDS-specific types
│
├── public/
│   └── sounds/
│       ├── new-order.mp3                 # Loud kitchen alert
│       └── urgent-order.mp3              # Critical alert
│
├── .env.local                            # Supabase credentials
├── package.json
├── tailwind.config.ts                    # Kitchen color scheme
├── tsconfig.json
└── next.config.ts
```

### Known Gotchas & Kitchen-Specific Quirks
```typescript
// CRITICAL: Kitchen environment considerations
// - Screens get greasy/wet → Large touch targets (min 64px)
// - Noisy environment → Visual + audio alerts
// - Bright kitchen lights → High contrast colors
// - Always-on display → Prevent screen burn-in with auto-refresh

// CRITICAL: Realtime subscription MUST filter server-side
// ❌ BAD: Fetch all orders, filter client-side
const channel = supabase.channel('all-orders')
  .on('postgres_changes', { event: '*', schema: 'restaurante', table: 'orders' })

// ✅ GOOD: Filter in subscription
const channel = supabase.channel('kitchen-orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'restaurante',
    table: 'orders',
    filter: 'status=in.(CONFIRMED,PREPARING)'
  })

// CRITICAL: Auto-sort by time critical for kitchen
// Sort MUST happen on every realtime update
useEffect(() => {
  const sorted = orders.sort((a, b) =>
    new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()
  )
  setDisplayOrders(sorted)
}, [orders])

// GOTCHA: Kitchen staff may tap READY multiple times
// Debounce or disable button after first click
const handleMarkReady = useCallback(
  debounce(async (orderId) => {
    setLoading(orderId)
    await markOrderReady(orderId)
  }, 1000),
  []
)

// GOTCHA: Screen burn-in prevention
// Rotate order positions slightly every 30min
// Or use screensaver after 5min idle (but not recommended)
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// ========================================================================
// SHARED TYPES (from enigma-app)
// ========================================================================

// src/types/order.ts
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED'

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED'
  notes?: string // "sin cebolla", "poco hecho"
  menuItem: {
    id: string
    name: string
    category: string
    allergens?: string[] // EU-14 allergens
  }
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  tableId: string
  order_source: 'presencial' | 'qr' | 'online'
  notes?: string // Order-level notes

  orderedAt: string
  confirmedAt?: string
  readyAt?: string

  order_items: OrderItem[]
  table: {
    number: string
    location: string
  }
}

// ========================================================================
// KDS-SPECIFIC TYPES
// ========================================================================

// src/types/kds.ts
export type UrgencyLevel = 'normal' | 'warning' | 'critical'

export interface KDSOrder extends Order {
  // Computed fields
  waitingMinutes: number
  urgency: UrgencyLevel
  priorityScore: number // 1-100 (higher = more urgent)
}

export interface KDSSettings {
  audioEnabled: boolean
  audioVolume: number // 0-100
  showCompletedOrders: boolean
  completedOrdersRetention: number // hours
  autoRefreshInterval: number // seconds
}
```

### List of Tasks

```yaml
# ========================================================================
# FASE 1: PROJECT SETUP (Tasks 1-5)
# ========================================================================

Task 1: Initialize Next.js 15 Project
  CREATE new project:
    - npx create-next-app@latest cocina.enigmaconalma.com
    - Options: TypeScript ✓, Tailwind ✓, App Router ✓, Turbopack ✓
    - cd cocina.enigmaconalma.com

  INSTALL dependencies:
    - npm install @supabase/supabase-js @supabase/ssr
    - npm install @tanstack/react-query
    - npm install lucide-react class-variance-authority clsx tailwind-merge
    - npm install date-fns (for time formatting)

Task 2: Setup Supabase Client
  CREATE .env.local:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=https://supabase.enigmaconalma.com
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
    SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
    ```

  CREATE src/lib/supabase/client.ts:
    - Browser client with createBrowserClient
    - PATTERN: Same as enigma-app

  CREATE src/lib/supabase/server.ts:
    - Server client for API routes
    - Service role key for admin operations

  TEST connection:
    ```typescript
    const { data } = await supabase
      .from('orders')
      .select('count')
      .eq('status', 'CONFIRMED')
    console.log('Active orders:', data)
    ```

Task 3: Database Validation via SSH
  SSH to production (from local machine):
    - VERIFY: restaurante.orders accessible
    - VERIFY: Can UPDATE order status to READY
    - VERIFY: Realtime publication includes orders
    - TEST: SELECT with filter status IN ('CONFIRMED', 'PREPARING')

  COMMAND:
    ```bash
    ssh root@31.97.182.226 "docker exec db psql -U postgres -c \"SELECT id, orderNumber, status, order_source FROM restaurante.orders WHERE status IN ('CONFIRMED', 'PREPARING') ORDER BY orderedAt ASC LIMIT 10\""
    ```

Task 4: Create Shared Types
  CREATE src/types/order.ts:
    - COPY from enigma-app (Order, OrderItem, OrderStatus)
    - Keep in sync between projects

  CREATE src/types/kds.ts:
    - KDSOrder (extends Order with computed fields)
    - UrgencyLevel, KDSSettings

Task 5: Setup Kitchen Color Scheme
  MODIFY src/app/globals.css:
    - Kitchen-optimized palette (high contrast)
    - Large text sizes (min 16px, headers 24px+)
    - Theme: Light mode only (bright kitchen)

  COLORS:
    ```css
    :root {
      --background: 240 10% 98%;
      --foreground: 240 10% 10%;

      --normal: 142 76% 36%;      /* Green - <15min */
      --warning: 38 92% 50%;      /* Orange - 15-30min */
      --critical: 0 84% 60%;      /* Red - >30min */

      --card: 0 0% 100%;
      --card-foreground: 240 10% 10%;

      --border: 240 6% 90%;
      --input: 240 6% 90%;
    }
    ```

# ========================================================================
# FASE 2: CORE DATA LAYER (Tasks 6-8)
# ========================================================================

Task 6: Create useKitchenOrders Hook
  CREATE src/hooks/useKitchenOrders.ts:
    - Subscribe to restaurante.orders
    - Filter: status IN ('CONFIRMED', 'PREPARING')
    - Fetch initial data from API
    - Merge realtime updates
    - Auto-sort by orderedAt ASC (oldest first)
    - Calculate computed fields (waitingMinutes, urgency)

  PATTERN:
    ```typescript
    'use client'

    export function useKitchenOrders() {
      const [orders, setOrders] = useState<KDSOrder[]>([])

      useEffect(() => {
        // 1. Initial fetch
        fetchKitchenOrders().then(setOrders)

        // 2. Realtime subscription
        const channel = supabase
          .channel('kitchen-orders')
          .on('postgres_changes', {
            event: '*',
            schema: 'restaurante',
            table: 'orders',
            filter: 'status=in.(CONFIRMED,PREPARING)'
          }, handleRealtimeUpdate)
          .subscribe()

        return () => supabase.removeChannel(channel)
      }, [])

      // Auto-sort on every update
      useEffect(() => {
        const sorted = [...orders].sort((a, b) =>
          new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()
        )
        setOrders(sorted)
      }, [orders])

      return { orders, loading }
    }
    ```

Task 7: Create useMarkOrderReady Hook
  CREATE src/hooks/useMarkOrderReady.ts:
    - Mutation to update order status to READY
    - Update readyAt timestamp
    - Optimistic update (remove from UI immediately)
    - Rollback on error
    - Success: Audio confirmation beep

  USE @tanstack/react-query:
    ```typescript
    export function useMarkOrderReady() {
      const queryClient = useQueryClient()

      return useMutation({
        mutationFn: async (orderId: string) => {
          const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'READY' })
          })
          if (!response.ok) throw new Error('Failed to mark ready')
          return response.json()
        },
        onMutate: async (orderId) => {
          // Optimistic: Remove from UI
          queryClient.setQueryData(['kitchen-orders'], (old: Order[]) =>
            old.filter(o => o.id !== orderId)
          )
        },
        onSuccess: () => {
          playSuccessSound()
        },
        onError: (error, orderId) => {
          // Rollback
          queryClient.invalidateQueries(['kitchen-orders'])
        }
      })
    }
    ```

Task 8: Create API Endpoint for Status Update
  CREATE src/app/api/orders/[id]/status/route.ts:
    - PATCH handler
    - Validate: Can only change to READY from CONFIRMED/PREPARING
    - Update order status
    - Set readyAt timestamp
    - Return updated order

  SECURITY: Use service_role key (already bypasses RLS)

  ```typescript
  export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const { status } = await request.json()

    // Validate
    if (status !== 'READY') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'READY',
        readyAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  }
  ```

# ========================================================================
# FASE 3: CORE UI COMPONENTS (Tasks 9-13)
# ========================================================================

Task 9: Create PriorityIndicator Component
  CREATE src/components/kds/priority-indicator.tsx:
    - Color bar at top of card (green/orange/red)
    - Timer showing minutes waiting
    - Visual pulse animation for critical orders

  LOGIC:
    ```typescript
    function getUrgency(waitingMinutes: number): UrgencyLevel {
      if (waitingMinutes < 15) return 'normal'
      if (waitingMinutes < 30) return 'warning'
      return 'critical'
    }
    ```

  LAYOUT:
    ```tsx
    <div className={cn(
      "h-2 w-full rounded-t-lg",
      urgency === 'normal' && "bg-normal",
      urgency === 'warning' && "bg-warning animate-pulse",
      urgency === 'critical' && "bg-critical animate-pulse"
    )} />
    <div className="flex items-center justify-between p-2">
      <Clock className="h-5 w-5" />
      <span className="text-lg font-bold">{waitingMinutes} min</span>
    </div>
    ```

Task 10: Create ReadyButton Component
  CREATE src/components/kds/ready-button.tsx:
    - Large button (min 64x64px, full width)
    - Loading state while mutation in progress
    - Success animation
    - Disabled after click (prevent double-tap)

  ```tsx
  export function ReadyButton({ orderId }: { orderId: string }) {
    const { mutate, isPending } = useMarkOrderReady()

    return (
      <Button
        size="lg"
        className="w-full h-16 text-xl font-bold"
        onClick={() => mutate(orderId)}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Marcando...
          </>
        ) : (
          <>
            <Check className="mr-2" />
            LISTO
          </>
        )}
      </Button>
    )
  }
  ```

Task 11: Create OrderCard Component
  CREATE src/components/kds/order-card.tsx:
    - Compact card for grid view
    - Priority indicator at top
    - Order number + table number (large font)
    - Item count + source badge
    - Ready button at bottom
    - Click card to open detail modal

  LAYOUT:
    ```tsx
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <PriorityIndicator waitingMinutes={order.waitingMinutes} />

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">{order.orderNumber}</h3>
            <p className="text-xl text-muted-foreground">Mesa {order.table.number}</p>
          </div>
          <Badge variant={order.order_source === 'qr' ? 'default' : 'secondary'}>
            {order.order_source.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-1">
          {order.order_items.slice(0, 3).map(item => (
            <div key={item.id} className="text-base">
              <span className="font-semibold">{item.quantity}x</span> {item.menuItem.name}
              {item.notes && (
                <p className="text-sm text-critical font-medium">⚠️ {item.notes}</p>
              )}
            </div>
          ))}
          {order.order_items.length > 3 && (
            <p className="text-sm text-muted-foreground">
              +{order.order_items.length - 3} más...
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <ReadyButton orderId={order.id} />
      </CardFooter>
    </Card>
    ```

Task 12: Create OrderDetailModal Component
  CREATE src/components/kds/order-detail-modal.tsx:
    - Full-screen dialog
    - All order items with full details
    - Notes highlighted in red
    - Allergens highlighted with warning icon
    - Large text for readability
    - Ready button at bottom

  ```tsx
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-4xl">
          {order.orderNumber} - Mesa {order.table.number}
        </DialogTitle>
        <PriorityIndicator waitingMinutes={order.waitingMinutes} />
      </DialogHeader>

      <div className="space-y-4">
        {order.order_items.map(item => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold">
                    {item.quantity}x {item.menuItem.name}
                  </h4>

                  {item.notes && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle className="text-lg">Nota Especial</AlertTitle>
                      <AlertDescription className="text-base">
                        {item.notes}
                      </AlertDescription>
                    </Alert>
                  )}

                  {item.menuItem.allergens && item.menuItem.allergens.length > 0 && (
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">
                        Alérgenos: {item.menuItem.allergens.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <Badge variant="outline" className="text-lg">
                  {item.menuItem.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DialogFooter>
        <ReadyButton orderId={order.id} />
      </DialogFooter>
    </DialogContent>
  </Dialog>
  ```

Task 13: Create OrderGrid Component
  CREATE src/components/kds/order-grid.tsx:
    - Responsive grid (2-4 columns based on screen size)
    - Auto-sort by priority (oldest first)
    - Empty state when no orders
    - Refresh indicator

  ```tsx
  export function OrderGrid({ orders }: { orders: KDSOrder[] }) {
    const [selectedOrder, setSelectedOrder] = useState<KDSOrder | null>(null)

    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
          <CheckCircle2 className="h-24 w-24 mb-4" />
          <h2 className="text-3xl font-bold">Todo al día!</h2>
          <p className="text-xl">No hay pedidos pendientes</p>
        </div>
      )
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)}>
              <OrderCard order={order} />
            </div>
          ))}
        </div>

        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            open={!!selectedOrder}
            onOpenChange={(open) => !open && setSelectedOrder(null)}
          />
        )}
      </>
    )
  }
  ```

# ========================================================================
# FASE 4: MAIN PAGE & LAYOUT (Tasks 14-16)
# ========================================================================

Task 14: Create Kitchen Header Component
  CREATE src/components/kds/kitchen-header.tsx:
    - Restaurant logo/name
    - Current time (updates every second)
    - Active orders count
    - Connection status indicator (Realtime)
    - Settings button

  ```tsx
  export function KitchenHeader({ ordersCount }: { ordersCount: number }) {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000)
      return () => clearInterval(timer)
    }, [])

    return (
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Cocina Enigma</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-3xl font-bold">
                {format(currentTime, 'HH:mm:ss')}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(currentTime, 'dd/MM/yyyy')}
              </p>
            </div>

            <Badge variant="default" className="text-xl px-4 py-2">
              {ordersCount} pedidos
            </Badge>

            <Button variant="ghost" size="icon">
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
    )
  }
  ```

Task 15: Create Main KDS Page
  CREATE src/app/page.tsx:
    - Full-screen layout
    - Kitchen header
    - Order grid
    - Auto-refresh every 30s (fallback for Realtime)
    - Audio alert system

  ```tsx
  'use client'

  export default function KitchenPage() {
    const { orders, loading } = useKitchenOrders()
    const { playNewOrderSound } = useAudioAlerts()

    // Audio alert on new order
    useEffect(() => {
      if (orders.length > 0) {
        const latestOrder = orders[orders.length - 1]
        const orderAge = differenceInSeconds(new Date(), new Date(latestOrder.orderedAt))

        if (orderAge < 10) { // New order in last 10s
          playNewOrderSound()
        }
      }
    }, [orders.length])

    return (
      <div className="min-h-screen bg-background">
        <KitchenHeader ordersCount={orders.length} />

        <main className="container py-6">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-12 w-12 animate-spin" />
            </div>
          ) : (
            <OrderGrid orders={orders} />
          )}
        </main>
      </div>
    )
  }
  ```

Task 16: Create Root Layout
  CREATE src/app/layout.tsx:
    - Minimal layout (no sidebar)
    - React Query provider
    - Metadata for PWA
    - Prevent screen sleep (keepAwake)

  ```tsx
  export const metadata: Metadata = {
    title: 'Cocina Enigma - KDS',
    description: 'Kitchen Display System',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="es" suppressHydrationWarning>
        <body className={inter.className}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </body>
      </html>
    )
  }
  ```

# ========================================================================
# FASE 5: UTILITIES & ENHANCEMENTS (Tasks 17-19)
# ========================================================================

Task 17: Create Order Priority Calculator
  CREATE src/lib/kds/order-priority.ts:
    - calculateWaitingMinutes(orderedAt): number
    - calculateUrgency(waitingMinutes): UrgencyLevel
    - calculatePriorityScore(order): number (1-100)

  ```typescript
  export function calculateWaitingMinutes(orderedAt: string): number {
    return differenceInMinutes(new Date(), new Date(orderedAt))
  }

  export function calculateUrgency(waitingMinutes: number): UrgencyLevel {
    if (waitingMinutes < 15) return 'normal'
    if (waitingMinutes < 30) return 'warning'
    return 'critical'
  }

  export function calculatePriorityScore(order: Order): number {
    const waitingMinutes = calculateWaitingMinutes(order.orderedAt)
    const itemsCount = order.order_items.length

    // Base score from waiting time
    let score = waitingMinutes * 2

    // Bonus for more items (complex orders)
    score += itemsCount * 5

    // Bonus for special notes (needs attention)
    const hasSpecialNotes = order.order_items.some(item => item.notes)
    if (hasSpecialNotes) score += 10

    return Math.min(score, 100)
  }
  ```

Task 18: Create Audio Alert System
  CREATE src/lib/kds/audio-alerts.ts:
    - playNewOrderSound()
    - playUrgentOrderSound()
    - playSuccessSound() (order marked ready)
    - Settings: volume control, enable/disable

  ADD sound files to public/sounds/:
    - new-order.mp3 (loud, distinct)
    - urgent-order.mp3 (more aggressive)
    - success.mp3 (confirmation beep)

  ```typescript
  export function useAudioAlerts() {
    const [settings, setSettings] = useLocalStorage('kds-audio', {
      enabled: true,
      volume: 80
    })

    const playSound = useCallback((soundPath: string) => {
      if (!settings.enabled) return

      const audio = new Audio(soundPath)
      audio.volume = settings.volume / 100
      audio.play().catch(console.error)
    }, [settings])

    return {
      playNewOrderSound: () => playSound('/sounds/new-order.mp3'),
      playUrgentOrderSound: () => playSound('/sounds/urgent-order.mp3'),
      playSuccessSound: () => playSound('/sounds/success.mp3'),
      settings,
      updateSettings: setSettings
    }
  }
  ```

Task 19: Create Order Formatter Utilities
  CREATE src/lib/kds/order-formatter.ts:
    - formatOrderTime(timestamp): "15:30"
    - formatWaitingTime(minutes): "15 min" | "1h 30min"
    - formatTableInfo(table): "Mesa 12 - Terraza"
    - getSourceLabel(source): Spanish label

  ```typescript
  export function formatWaitingTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  export function getSourceLabel(source: OrderSource): string {
    const labels = {
      presencial: 'Presencial',
      qr: 'QR Mesa',
      online: 'Online',
      telefono: 'Teléfono'
    }
    return labels[source] || source
  }
  ```

# ========================================================================
# FASE 6: DEPLOYMENT & PRODUCTION (Tasks 20-22)
# ========================================================================

Task 20: Configure Production Build
  UPDATE next.config.ts:
    ```typescript
    const nextConfig = {
      experimental: {
        turbopack: true
      },
      output: 'standalone', // For Docker deployment
    }
    ```

  CREATE Dockerfile:
    ```dockerfile
    FROM node:20-alpine AS base

    FROM base AS deps
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci

    FROM base AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    RUN npm run build

    FROM base AS runner
    WORKDIR /app
    ENV NODE_ENV=production

    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public

    EXPOSE 3001
    CMD ["node", "server.js"]
    ```

Task 21: Production Testing
  CREATE test checklist:
    - [ ] SSH: Can connect to production DB
    - [ ] Realtime: Subscription connects successfully
    - [ ] Orders: Display correctly with all data
    - [ ] Ready button: Updates order status
    - [ ] Audio: Plays on new order
    - [ ] Touch: All buttons work on tablet
    - [ ] Performance: No lag with 20+ orders
    - [ ] Network: Handles reconnection gracefully

  RUN Lighthouse:
    - Performance >90
    - Accessibility >95
    - PWA installable

Task 22: Deploy to VPS
  SSH to VPS:
    ```bash
    cd /opt/cocina-enigma
    docker build -t cocina-kds .
    docker run -d -p 3001:3001 --name cocina-kds \
      -e NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
      -e SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY \
      cocina-kds
    ```

  NGINX reverse proxy:
    ```nginx
    server {
      server_name cocina.enigmaconalma.com;

      location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
      }
    }
    ```

  VERIFY:
    - https://cocina.enigmaconalma.com accessible
    - WebSocket connection stable
    - Orders update in real-time
```

### Integration Points

```yaml
DATABASE:
  - Table: restaurante.orders (shared with enigma-app)
  - READ-ONLY except for status updates to READY
  - Filter: status IN ('CONFIRMED', 'PREPARING')
  - Join: order_items, menu_items, tables

SUPABASE REALTIME:
  - Channel: kitchen-orders
  - Filter: status=in.(CONFIRMED,PREPARING)
  - Events: INSERT, UPDATE (when new orders confirmed)
  - Auto-reconnect critical

API:
  - PATCH /api/orders/:id/status (mark READY)
  - Uses service_role key (bypasses RLS)

FRONTEND:
  - Standalone Next.js app
  - No shared components with enigma-app
  - Shared types only (Order, OrderItem)

DEPLOYMENT:
  - Docker container on same VPS
  - Port 3001
  - cocina.enigmaconalma.com subdomain
  - NGINX reverse proxy
```

## Validation Loop

### Level 1: Type & Build Checking
```bash
npm run type-check
npm run build
# Expected: No errors
```

### Level 2: Functional Testing
```bash
# Manual checklist:
- [ ] Open cocina.enigmaconalma.com
- [ ] See existing CONFIRMED orders
- [ ] Create new order from comandero
- [ ] Order appears in KDS <5s
- [ ] Click READY button
- [ ] Order disappears from KDS
- [ ] Check enigma-app: order shows as READY
```

### Level 3: Production Validation
```bash
# SSH test
ssh root@31.97.182.226 "docker logs cocina-kds --tail=50"

# Realtime test
curl -X POST https://cocina.enigmaconalma.com/api/test-realtime

# Load test: 50 concurrent orders
# Monitor: CPU <50%, Memory <512MB, Response time <100ms
```

## Final Validation Checklist
- [ ] Build successful
- [ ] Docker image builds
- [ ] Deployed to VPS
- [ ] HTTPS works
- [ ] Realtime connects
- [ ] Orders display correctly
- [ ] Ready button works
- [ ] Audio alerts play
- [ ] Touch targets adequate (64px)
- [ ] No console errors
- [ ] Handles 50+ orders without lag

---

## Anti-Patterns to Avoid
- ❌ Don't allow editing orders (kitchen read-only except READY)
- ❌ Don't show PENDING orders (only CONFIRMED+)
- ❌ Don't use small fonts (<16px)
- ❌ Don't forget reconnection logic
- ❌ Don't ignore audio fallbacks (visual alerts)
- ❌ Don't allow status changes other than → READY

## Next Steps (Post-Implementation)
1. **Staff Training**: Video tutorial para kitchen staff
2. **Hardware**: Tablet mount + protective case
3. **Printer Integration**: Print tickets automáticamente
4. **Analytics**: Avg preparation time dashboard
5. **Multi-station**: Separate views (grill, fryer, expo)
