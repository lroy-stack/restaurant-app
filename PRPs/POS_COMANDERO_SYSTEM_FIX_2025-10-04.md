# PRP: Sistema Comandero POS - Análisis de Raíz y Plan de Implementación

**Fecha**: 2025-10-04
**Módulo**: /dashboard/pedidos + /dashboard/pedidos/nuevo
**Estado**: ANÁLISIS CRÍTICO - Múltiples problemas identificados

---

## 🚨 PROBLEMAS IDENTIFICADOS (Root Cause Analysis)

### 1. **PEDIDOS NO VISIBLES EN /dashboard/pedidos**

**Síntoma**: Orden Mesa S10 creada pero NO aparece en el Kanban board

**Root Cause**:
```typescript
// src/hooks/useRealtimeOrders.ts:41
const [orders, setOrders] = useState<Order[]>(initialOrders)  // initialOrders = []

// ❌ NO HABÍA fetch inicial - solo escuchaba eventos realtime
// ✅ SOLUCIONADO: Agregado useEffect para refetch() al montar
```

**Estado**: ✅ **FIXED** - Agregado fetch inicial en useRealtimeOrders

---

### 2. **STOCK = 0 EN TODOS LOS PRODUCTOS**

**Síntoma**: /dashboard/pedidos/nuevo muestra "Stock: 0" en todos los productos

**Root Cause**:
```typescript
// /api/menu NO devuelve campo `stock`
// Verificado vía curl - JSON response NO contiene stock field
// DB SÍ tiene stock (verificado vía SSH):
//   wine_kaori: stock=19
//   item_croqueta_pollo: stock=40
//   item_bacalao_frito: stock=23
```

**Problema**: RPC `get_complete_menu` NO incluye stock en su SELECT

**Impacto Crítico**:
- Usuarios no pueden ver disponibilidad real
- Badge muestra datos incorrectos
- Validación de stock en POST /api/orders funciona, pero UX confusa

**Solución Requerida**: Modificar RPC get_complete_menu para incluir stock

---

### 3. **SELECTOR DE MESA HARDCODEADO**

**Síntoma**: Dropdown solo muestra 4 mesas fijas

```typescript
// src/app/(admin)/dashboard/pedidos/nuevo/page.tsx:195-199
<SelectContent>
  <SelectItem value="principal_s1">Mesa S1 - Principal</SelectItem>
  <SelectItem value="principal_s2">Mesa S2 - Principal</SelectItem>
  <SelectItem value="vip_s10">Mesa S10 - VIP</SelectItem>
  <SelectItem value="campanari_t4">Mesa T4 - Campanario</SelectItem>
</SelectContent>
```

**Realidad DB**: 34 mesas activas en 4 ubicaciones
```sql
TERRACE_CAMPANARI: 14 mesas (T1-T14)
SALA_PRINCIPAL: 8 mesas (S1-S8)
SALA_VIP: 3 mesas (S10-S12)
TERRACE_JUSTICIA: 9 mesas (T20-T28)
```

**Mala UX**:
- Dropdown plano con 34 mesas sería caótico
- No hay agrupación por ubicación
- No muestra estado de mesa (disponible/ocupada)

**Solución Requerida**:
- Cargar mesas dinámicamente desde /api/tables o similar
- Agrupar por location con separadores visuales
- Mostrar estado (ej: "S1 - Principal • Disponible")

---

### 4. **UX NAVEGACIÓN POR CATEGORÍAS DEFICIENTE**

**UX Actual**:
```
[Buscador] [Dropdown Categorías ▼]
┌─────┬─────┬─────┐
│ Img │ Img │ Img │  ← Grid de productos
│ P1  │ P2  │ P3  │
└─────┴─────┴─────┘
```

**Problemas**:
- Usuario debe scroll horizontal por dropdown para ver categorías
- No hay vista previa visual de cada categoría
- Difícil navegar con 15+ categorías (Vino Blanco, Vino Tinto, Cerveza, Entrantes, etc.)
- No hay breadcrumb ni navegación back/forward clara
- Pierde cart al cambiar categoría (NO - el cart sí persiste, pero UX no lo indica)

**UX Solicitada por Usuario**:
```
NIVEL 1: Vista Categorías
┌──────────────┬──────────────┬──────────────┐
│ [IMG VINO]   │ [IMG COMIDA] │ [IMG BEBIDA] │
│ Vino Blanco  │ Entrantes    │ Cerveza      │
│ 15 productos │ 12 productos │ 9 productos  │
└──────────────┴──────────────┴──────────────┘

↓ Click en "Vino Blanco"

NIVEL 2: Productos de Vino Blanco
[← Volver] Vino Blanco / Productos

┌─────┬─────┬─────┐
│ P1  │ P2  │ P3  │ ← Grid productos
└─────┴─────┴─────┘

↓ Click en producto → añade a cart
↓ [← Volver] → regresa a vista categorías
```

**Requisitos Específicos Usuario**:
- ✅ Click en categoría → ver productos
- ✅ Navegación back sin perder cart
- ✅ Usar imagen de producto representativo como icono categoría
- ✅ Identificación rápida visual

**Solución Requerida**: Implementar navegación por niveles con estado persistente

---

## 📋 PLAN DE IMPLEMENTACIÓN (Priorizado)

### FASE 1: CRITICAL FIXES (2-3 horas)

#### Task 1.1: Fix Stock en /api/menu
```sql
-- Modificar RPC get_complete_menu para incluir stock
ALTER FUNCTION restaurante.get_complete_menu() ...
-- O crear nuevo endpoint /api/menu-with-stock que sí incluya stock
```

**Alternativa más rápida**: Modificar /api/menu route.ts para hacer SELECT directo con stock

```typescript
// src/app/api/menu/route.ts
// Agregar stock al SELECT de menu_items en línea 103+
const categories = menuData.map((category: any) => ({
  ...category,
  menuItems: (category.items || []).map((item: any) => ({
    ...item,
    stock: item.stock || 0,  // ← AGREGAR ESTO
    isAvailable: item.isAvailable !== false,  // ← AGREGAR ESTO
  }))
}))
```

**Validación**:
- curl /api/menu → verificar campo stock presente
- /dashboard/pedidos/nuevo → badges muestran stock real

---

#### Task 1.2: Cargar Mesas Dinámicamente

**Opción A**: Usar API existente
```typescript
// Verificar si existe /api/tables
// Si no, crear:

// src/app/api/tables/route.ts
export async function GET() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .schema('restaurante')
    .from('tables')
    .select('id, number, location, isActive')
    .eq('isActive', true)
    .order('location, number')

  return NextResponse.json({ success: true, tables: data })
}
```

**Opción B**: Server-side fetch en page component
```typescript
// src/app/(admin)/dashboard/pedidos/nuevo/page.tsx
async function getTables() {
  // Fetch directo desde servidor
}
```

**UX Mejorado**:
```typescript
<Select value={selectedTable} onValueChange={setSelectedTable}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar mesa" />
  </SelectTrigger>
  <SelectContent>
    {/* Agrupado por ubicación */}
    <SelectLabel>Terraza Campanario</SelectLabel>
    {campanariTables.map(t => (
      <SelectItem value={t.id}>
        Mesa {t.number} • {t.status}
      </SelectItem>
    ))}

    <SelectSeparator />

    <SelectLabel>Sala Principal</SelectLabel>
    {principalTables.map(...)}
  </SelectContent>
</Select>
```

---

### FASE 2: UX NAVEGACIÓN CATEGORÍAS (4-6 horas)

#### Task 2.1: Consultar Context7 para Mejores Prácticas

**Patrones a investigar**:
- Nested navigation con estado persistente
- Category grid → Product grid patterns
- Breadcrumb navigation
- Back button UX
- Cart persistence durante navegación

**Librerías relevantes**: React Router (nested routes), zustand (state management)

---

#### Task 2.2: Diseñar Arquitectura de Navegación

**Opción 1: URL-based navigation (React Router style)**
```
/dashboard/pedidos/nuevo → Vista categorías
/dashboard/pedidos/nuevo?category=vino_blanco → Vista productos
```

**Pros**: Historial del navegador, deep linking, shareable
**Cons**: Más complejo, requiere router config

**Opción 2: State-based navigation (zustand)**
```typescript
// src/stores/posNavigationStore.ts
interface POSNavigation {
  view: 'categories' | 'products'
  selectedCategory: string | null
  goToCategory: (catId: string) => void
  goBack: () => void
}
```

**Pros**: Más simple, rápido, control total
**Cons**: No hay URL state, no shareable

**RECOMENDACIÓN**: Opción 2 (state-based) para MVP, migrar a URLs después

---

#### Task 2.3: Componentes Requeridos

```typescript
// src/components/pos/CategoryGrid.tsx
interface Category {
  id: string
  name: string
  type: 'FOOD' | 'WINE' | 'BEVERAGE'
  itemCount: number
  representativeImage: string  // Primera imagen de un producto
}

export function CategoryGrid({ categories, onSelectCategory }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map(cat => (
        <Card onClick={() => onSelectCategory(cat.id)}>
          <div className="relative h-32">
            <Image src={cat.representativeImage} />
          </div>
          <CardContent>
            <h3>{cat.name}</h3>
            <p className="text-sm text-muted">{cat.itemCount} productos</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// src/components/pos/ProductGrid.tsx
export function ProductGrid({ products, categoryName, onBack, onAddToCart }) {
  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Volver
        </Button>
        <h2>{categoryName}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard product={product} onAdd={() => onAddToCart(product)} />
        ))}
      </div>
    </>
  )
}
```

---

#### Task 2.4: Integración en nuevo/page.tsx

```typescript
// src/app/(admin)/dashboard/pedidos/nuevo/page.tsx
export default function NuevoPedidoPage() {
  const [view, setView] = useState<'categories' | 'products'>('categories')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { items, categories, groupedItems } = useMenuItemsForPOS()

  // Preparar datos de categorías con imágenes representativas
  const categoryCards = categories.map(catName => {
    const catProducts = groupedItems[catName] || []
    const firstImage = catProducts.find(p => p.imageUrl)?.imageUrl

    return {
      id: catName,
      name: catName,
      itemCount: catProducts.length,
      representativeImage: firstImage || '/placeholder-category.jpg',
    }
  })

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId)
    setView('products')
  }

  const handleBack = () => {
    setView('categories')
    setSelectedCategory(null)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {view === 'categories' ? (
          <CategoryGrid
            categories={categoryCards}
            onSelectCategory={handleSelectCategory}
          />
        ) : (
          <ProductGrid
            products={groupedItems[selectedCategory!] || []}
            categoryName={selectedCategory!}
            onBack={handleBack}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>

      <div className="lg:col-span-1">
        {/* Cart permanece visible SIEMPRE */}
        <CartSidebar />
      </div>
    </div>
  )
}
```

---

### FASE 3: CALIDAD Y TESTING (2 horas)

#### Task 3.1: Validaciones
- [ ] Stock muestra valores reales > 0
- [ ] Selector mesas carga 34 mesas agrupadas
- [ ] Navegación categoría ↔ productos fluida
- [ ] Cart persiste durante navegación
- [ ] Breadcrumb funcional
- [ ] Responsive mobile (categorías en 2 cols, productos en 2 cols)

#### Task 3.2: Performance
- [ ] Lazy loading de imágenes (Image component Next.js)
- [ ] Memoización de categoryCards
- [ ] Optimistic updates en cart
- [ ] Skeleton loaders durante fetch

#### Task 3.3: Accessibility
- [ ] Navegación keyboard (Tab, Enter, Escape para back)
- [ ] ARIA labels en botones
- [ ] Focus management al cambiar vista
- [ ] Screen reader announcements

---

## 🎯 CRITERIOS DE ÉXITO

### Funcionales
- [x] Órdenes visibles en /dashboard/pedidos inmediatamente
- [ ] Stock real mostrado en todos los productos (>0 cuando disponible)
- [ ] 34 mesas cargadas dinámicamente con agrupación
- [ ] Navegación categorías ↔ productos sin perder cart
- [ ] Imágenes representativas en cards de categoría

### UX
- [ ] ≤3 clicks para añadir producto al cart (categoría → producto → añadir)
- [ ] Back button intuitivo y visible
- [ ] Cart visible en todo momento (sticky sidebar)
- [ ] Responsive mobile (iPhone SE, iPad)

### Performance
- [ ] Initial load <2s
- [ ] Navigation transitions <300ms
- [ ] No memory leaks en navegación repetida

---

## 🔧 DECISIONES TÉCNICAS

### ¿Por qué state-based navigation en vez de URL-based?

**Ventajas state-based**:
- Implementación más rápida (1-2 horas vs 4-6 horas)
- No requiere configurar router
- Control total sobre transiciones
- Cart state ya está en zustand (coherencia)

**Desventajas**:
- No hay deep linking (menos crítico en POS interno)
- No hay browser history (Ctrl+Z no funciona)

**Decisión**: State-based para MVP, evaluar URLs en v2

---

### ¿Cómo obtener imagen representativa de categoría?

**Opción 1**: Seleccionar primera imagen disponible
```typescript
const firstImage = products.find(p => p.imageUrl)?.imageUrl
```

**Opción 2**: Definir manualmente en DB (tabla categories)
```sql
ALTER TABLE restaurante.menu_categories
ADD COLUMN representative_image_url TEXT;
```

**Decisión**: Opción 1 para MVP (0 cambios DB), Opción 2 para v2 (más control editorial)

---

### ¿Dónde cargar mesas: cliente o servidor?

**Server Component** (RECOMENDADO):
```typescript
// src/app/(admin)/dashboard/pedidos/nuevo/page.tsx
async function getTables() {
  const supabase = await createServiceClient()
  // ...
}

export default async function Page() {
  const tables = await getTables()
  return <ClientComponent tables={tables} />
}
```

**Client Fetch**:
```typescript
const { data: tables } = useQuery(['tables'], fetchTables)
```

**Decisión**: Server Component (mejor SEO, menos client JS, datos frescos)

---

## 📚 REFERENCIAS

### Internal Docs
- `STOCK_INTEGRATION_VERIFICATION.md` - Stock RPCs funcionando
- `TESTING_ORDERS_SYSTEM.md` - Testing guidelines
- `/dashboard/mesas` - Referencia UX existente

### External Patterns
- Context7: React Router nested routes
- Shadcn/ui: Card, Select, Navigation patterns
- TanStack Query: Optimistic updates

---

## 🚀 TIMELINE ESTIMADO

| Fase | Tareas | Tiempo | Prioridad |
|------|--------|--------|-----------|
| 1 | Fix stock + mesas dinámicas | 2-3h | 🔴 CRÍTICO |
| 2 | UX navegación categorías | 4-6h | 🟡 IMPORTANTE |
| 3 | Testing + refinamiento | 2h | 🟢 NORMAL |
| **TOTAL** | **8-11h** | **~1.5 días** | |

---

## ✅ CHECKLIST PRE-IMPLEMENTACIÓN

- [x] Problema stock identificado (RPC no devuelve field)
- [x] Problema mesas hardcode identificado
- [x] Problema fetch inicial resuelto
- [ ] Consultar Context7 para navigation patterns ✅ DONE
- [ ] Revisar useMenuItemsForPOS response structure
- [ ] Mockups UX aprobados por usuario
- [ ] Plan técnico revisado

---

**Próximos pasos**:
1. Implementar Task 1.1 (fix stock en /api/menu)
2. Implementar Task 1.2 (cargar mesas dinámicamente)
3. Validar con usuario antes de FASE 2
4. Proceder con navegación por categorías si aprobado

**ULTRATHINK PROACTIVELY**: No improvisar, seguir este plan estructurado, consultar Context7 antes de codificar.
