# MENU_PS.md - Menu Management System Development Plan

## 🎯 Project Scope

**Develop complete menu management system for `/dashboard/menu` route replacing current empty `/dashboard/speisekarte`**

- **Target Route**: `/dashboard/menu` (Spanish naming convention)
- **Reference Implementation**: Badezeit `/dashboard/speisekarte` components
- **Database Schema**: `restaurante.menu_items` + related tables (fully analyzed)
- **Tech Stack**: Next.js 15 + Shadcn/ui + React Hook Form + Zod + TanStack Query

## 📊 Database Schema Analysis

### Core Tables (SSH Analyzed - `restaurante` schema)

```sql
-- menu_items (15 columns)
id: text (PK)
name: text NOT NULL
nameEn: text (multilingual support)
description: text NOT NULL
descriptionEn: text (multilingual)
price: numeric(8,2) NOT NULL
isAvailable: boolean DEFAULT true
imageUrl: text (optional images)
isVegetarian: boolean DEFAULT false
isVegan: boolean DEFAULT false
isGlutenFree: boolean DEFAULT false
categoryId: text NOT NULL (FK)
restaurantId: text NOT NULL (FK)
createdAt: timestamp(3) DEFAULT CURRENT_TIMESTAMP
updatedAt: timestamp(3) NOT NULL

-- menu_categories (8 columns)
id: text (PK)
name: text NOT NULL
nameEn: text (multilingual)
type: USER-DEFINED NOT NULL
order: integer NOT NULL (display ordering)
isActive: boolean NOT NULL
restaurantId: text NOT NULL (FK)
createdAt/updatedAt: timestamp(3)

-- allergens (3 columns - EU-14 compliance)
id: text (PK)
name: text NOT NULL
nameEn: text NOT NULL (bilingual allergen names)

-- menu_item_allergens (junction table)
menuItemId: text (FK)
allergenId: text (FK)

-- wine_pairings (4 columns)
id: text (PK)
description: text (pairing notes)
foodItemId: text (FK to menu_items)
wineItemId: text (FK to menu_items)
```

### Row Level Security Policies
- **Public**: Available items accessible (`isAvailable = true`)
- **Staff**: View all items (ADMIN/MANAGER/STAFF roles)
- **Managers**: Modify items (ADMIN/MANAGER roles only)

## 🚀 **REVOLUTIONARY** Component Architecture

### **SUPERA A BADEZEIT** - Elimina Redundancias + UX Sobresaliente

**🎯 Modern Data-Grid Pattern** (NO más tabs redundantes):
```typescript
// Unified Data Management Dashboard
interface MenuDashboardView {
  mode: 'overview' | 'data-grid' | 'quick-actions'
  activeFilters: FilterState
  bulkSelection: Set<string>
  viewSettings: ViewPreferences
}

// Revolutionary Single-View Architecture
const MENU_DASHBOARD_MODES = {
  overview: { component: MenuOverview, icon: BarChart3 },
  dataGrid: { component: UnifiedDataGrid, icon: Table }, // TanStack Table
  quickActions: { component: CommandCenter, icon: Zap }
}
```

### **🏗️ Component Hierarchy COHERENTE con DB Real**
```
/dashboard/menu/
├── page.tsx (unified dashboard controller)
├── components/
│   ├── menu-data-grid.tsx (TanStack Table - platos + vinos)
│   ├── menu-overview.tsx (stats + insights)
│   ├── forms/
│   │   ├── menu-item-form.tsx (crear/editar platos/vinos)
│   │   ├── allergen-selector.tsx (EU-14 compliance)
│   │   └── wine-pairing-form.tsx (🍷 SIMPLE - select plato + vino)
│   ├── pairing/
│   │   ├── pairing-manager.tsx (CRUD maridajes simples)
│   │   ├── wine-selector.tsx (dropdown vinos disponibles)
│   │   └── pairing-card.tsx (mostrar maridaje existente)
│   └── ui/
│       ├── allergen-badges.tsx (EU-14 indicators)
│       ├── pairing-indicator.tsx (🍷 icono si tiene maridaje)
│       └── menu-item-preview.tsx (hover con alérgenos + vinos)
├── hooks/
│   ├── use-menu-items.ts (platos + vinos - mismo tabla)
│   ├── use-wine-pairings.ts (🍷 CRUD maridajes tabla real)
│   ├── use-allergens.ts (EU-14 compliance)
│   └── use-menu-stats.ts (dashboard metrics)
└── schemas/
    ├── menu-item.schema.ts (platos + vinos + EU-14)
    └── wine-pairing.schema.ts (🍷 id, description, foodItemId, wineItemId)
```

## 🍷 **SISTEMA DE MARIDAJE SIMPLE** - Experiencia Cliente Deluxe

### **🎯 Base de Datos REAL** (SSH Analizada)
```sql
-- ✅ YA EXISTE: wine_pairings (4 columnas)
CREATE TABLE restaurante.wine_pairings (
  id          text PRIMARY KEY,
  description text,                    -- Nota del sommelier
  foodItemId  text NOT NULL,          -- FK a menu_items (plato)
  wineItemId  text NOT NULL           -- FK a menu_items (vino)
);

-- ✅ YA EXISTE: menu_items (con vinos y platos)
-- Los vinos se identifican por categoryId específica
```

### **🍾 Interface SIMPLE de Maridajes**
```typescript
// ✅ COHERENTE con DB real
interface WinePairing {
  id: string
  description: string      // "Perfecto equilibrio entre acidez y grasa"
  foodItemId: string      // ID del plato
  wineItemId: string      // ID del vino
}

// Funcionalidad SIMPLE:
// 1. Seleccionar plato → mostrar vinos disponibles
// 2. Seleccionar vino → crear maridaje con descripción
// 3. Gestionar descripciones del sommelier
// 4. Vista pública: cliente ve recomendaciones
```

### **🎨 UX Deluxe - Menu Público + Admin**
```typescript
// CLIENTE (Menu Público):
interface PublicMenuView {
  showPairings: boolean          // Mostrar vinos recomendados
  allergenCompliance: boolean    // EU-14 obligatorio
  pairingDescriptions: boolean   // Notas del sommelier
}

// ADMIN (Dashboard):
interface WinePairingAdmin {
  selectDish: MenuItem           // Seleccionar plato
  availableWines: MenuItem[]     // Lista de vinos en carta
  createPairing: (dish, wine, description) => void
  managePairings: WinePairing[]  // CRUD simple
}
```

## 🔧 **ULTRAMODERN** Technology Stack Integration

### **🚀 TanStack Table - Unified Data Grid** (NO más cards redundantes)

```typescript
// menu-item.schema.ts (EU-14 Allergen Compliance)
const menuItemSchema = z.object({
  categoryId: z.string().min(1, 'Categoría requerida'),
  name: z.string().min(1, 'Nombre requerido').max(150),
  nameEn: z.string().max(150).optional(),
  description: z.string().min(1, 'Descripción requerida').max(1000),
  descriptionEn: z.string().max(1000).optional(),
  price: z.number().min(0.01).max(999.99),

  // Availability flags
  isAvailable: z.boolean().default(true),
  isSignature: z.boolean().default(false),

  // EU-14 Allergen Compliance (from Badezeit reference)
  containsGluten: z.boolean().default(false),
  containsMilk: z.boolean().default(false),
  containsEggs: z.boolean().default(false),
  containsNuts: z.boolean().default(false),
  containsFish: z.boolean().default(false),
  containsShellfish: z.boolean().default(false),
  containsSoy: z.boolean().default(false),
  containsCelery: z.boolean().default(false),
  containsMustard: z.boolean().default(false),
  containsSesame: z.boolean().default(false),
  containsSulfites: z.boolean().default(false),
  containsLupin: z.boolean().default(false),
  containsMollusks: z.boolean().default(false),
  containsPeanuts: z.boolean().default(false),

  // Dietary flags
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),

  // Display
  displayOrder: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).max(5).default([])
})
```

### TanStack Query Optimistic Updates (Context7 Patterns)

```typescript
// use-menu-items.ts
export function useCreateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMenuItem,
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['menu-items'] })

      // Snapshot previous value
      const previousItems = queryClient.getQueryData(['menu-items'])

      // Optimistic update
      queryClient.setQueryData(['menu-items'], (old) => [...old, newItem])

      return { previousItems }
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(['menu-items'], context.previousItems)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    }
  })
}
```

## 🚀 **Implementation Phases COHERENTES con DB Real**

### **✅ YA EXISTE en Base de Datos** (SSH Confirmado)
```sql
-- ✅ Tablas creadas y funcionales:
restaurante.menu_items (15 columnas + RLS policies)
restaurante.menu_categories (8 columnas + ordering)
restaurante.allergens (3 columnas - EU bilingual)
restaurante.menu_item_allergens (junction table)
restaurante.wine_pairings (4 columnas - LISTO para maridajes)

-- ✅ Relaciones configuradas:
- menu_items → menu_categories (categoryId FK)
- menu_items → restaurants (restaurantId FK)
- wine_pairings → menu_items (foodItemId + wineItemId FKs)
- menu_item_allergens → menu_items + allergens (junction)
```

### **🔨 Phase 1: Frontend Foundation** (Week 1)
**Crear:**
```
src/app/(admin)/dashboard/menu/
├── page.tsx (controller principal + stats)
├── components/
│   ├── menu-data-grid.tsx (TanStack Table)
│   └── menu-overview.tsx (dashboard stats)
```

**APIs a crear:**
- `GET /api/menu/items` - Lista platos + vinos (misma tabla)
- `GET /api/menu/categories` - Lista categorías activas
- `GET /api/menu/stats` - Estadísticas dashboard

**Criteria:**
- ✅ Route `/dashboard/menu` funcional
- ✅ Conexión Kong Gateway (`supabase.enigmaconalma.com:8443`)
- ✅ Role-based access (ADMIN/MANAGER/STAFF)
- ✅ TanStack Table con datos reales

### **🍽️ Phase 2: Menu Items CRUD** (Week 1-2)
**Crear:**
```
components/forms/
├── menu-item-form.tsx (platos + vinos en mismo form)
├── allergen-selector.tsx (EU-14 checkboxes)
└── category-selector.tsx (dropdown categorías)
```

**APIs a crear:**
- `POST /api/menu/items` - Crear plato/vino
- `PUT /api/menu/items/[id]` - Actualizar
- `DELETE /api/menu/items/[id]` - Eliminar
- `GET/POST /api/menu/items/[id]/allergens` - Gestión alérgenos

**Features:**
- Form unificado para platos Y vinos (misma tabla)
- EU-14 allergen selector (14 checkboxes obligatorios)
- Multilingual support (name/nameEn, description/descriptionEn)
- Category assignment + price validation
- Image upload (imageUrl field)

### **🍷 Phase 3: Sistema Maridaje SIMPLE** (Week 2)
**Crear:**
```
components/pairing/
├── pairing-manager.tsx (CRUD simple maridajes)
├── wine-selector.tsx (dropdown vinos de carta)
└── pairing-card.tsx (mostrar maridaje existente)
```

**APIs a crear:**
- `GET /api/wine-pairings` - Lista maridajes existentes
- `POST /api/wine-pairings` - Crear maridaje (foodItemId + wineItemId + description)
- `DELETE /api/wine-pairings/[id]` - Eliminar maridaje

**Features SIMPLES:**
- Seleccionar plato → mostrar vinos disponibles en carta
- Crear maridaje = plato + vino + descripción sommelier
- Vista cliente: mostrar vinos recomendados con cada plato
- NO sobreingeniería - solo gestión básica y práctica

### **🔒 Phase 4: EU-14 Compliance** (Week 3)
**Crear:**
```
components/ui/
├── allergen-badges.tsx (indicators EU-14)
├── allergen-matrix.tsx (vista compliance)
└── compliance-report.tsx (export PDF/Excel)
```

**Features:**
- EU-14 allergen compliance obligatorio
- Vista matriz alérgenos × platos
- Badges visuales en menu público
- Reports de compliance para auditorías
- Export legal documents

### **🌟 Phase 5: Menu Público + UX Deluxe** (Week 3-4)
**Crear:**
```
src/app/(public)/menu/ (actualizar existente)
├── components/
│   ├── menu-item-card.tsx (con alérgenos + maridajes)
│   ├── wine-pairing-display.tsx (recomendaciones)
│   └── allergen-filter.tsx (filtro EU-14)
```

**Features Cliente:**
- Menu público con maridajes visibles
- Filtros por alérgenos (EU-14 compliance)
- Experiencia deluxe: recomendaciones sommelier
- Mobile-first responsive design
- Accessibility compliance

### **📊 Phase 6: Analytics + Polish** (Week 4)
**Features finales:**
- Dashboard analytics (platos populares, maridajes frecuentes)
- Bulk operations (TanStack Table selection)
- Export menu PDF para imprimir
- Performance optimization
- Testing completo (unit + E2E)

## 📁 Complete File Structure

```
src/app/(admin)/dashboard/menu/
├── page.tsx                    # Main container + stats
├── loading.tsx                 # Loading states
├── error.tsx                   # Error boundaries
├── components/
│   ├── tabs-navigation.tsx     # 6-tab navigation
│   ├── menu-overview.tsx       # Dashboard stats + category cards
│   ├── category-manager.tsx    # Category CRUD + ordering
│   ├── item-manager.tsx        # Menu item CRUD + EU-14 allergens
│   ├── allergen-manager.tsx    # EU-14 compliance management
│   ├── wine-pairing-manager.tsx # Food-wine pairing system
│   ├── menu-settings.tsx       # Configuration panel
│   └── ui/
│       ├── menu-item-card.tsx  # Reusable item display
│       ├── category-card.tsx   # Category display
│       ├── allergen-badge.tsx  # EU-14 allergen indicators
│       └── wine-pairing-card.tsx # Pairing display
├── hooks/
│   ├── use-menu-items.ts       # TanStack Query for items
│   ├── use-categories.ts       # TanStack Query for categories
│   ├── use-allergens.ts        # Allergen data management
│   ├── use-wine-pairings.ts    # Wine pairing hooks
│   └── use-menu-stats.ts       # Dashboard statistics
├── schemas/
│   ├── menu-item.schema.ts     # Zod schema + EU-14 allergens
│   ├── category.schema.ts      # Category validation
│   ├── wine-pairing.schema.ts  # Wine pairing validation
│   └── menu-settings.schema.ts # Settings validation
└── utils/
    ├── menu-helpers.ts         # Utility functions
    ├── allergen-utils.ts       # EU-14 compliance helpers
    └── export-utils.ts         # PDF/Excel generation

src/app/api/menu/
├── items/
│   ├── route.ts               # GET/POST items
│   ├── [id]/
│   │   ├── route.ts           # GET/PUT/DELETE item
│   │   ├── allergens/route.ts # Item allergen management
│   │   └── pairings/route.ts  # Item wine pairings
│   └── bulk/route.ts          # Bulk operations
├── categories/
│   ├── route.ts               # GET/POST categories
│   ├── [id]/route.ts          # GET/PUT/DELETE category
│   └── reorder/route.ts       # Drag-and-drop ordering
├── allergens/
│   ├── route.ts               # GET allergens
│   └── compliance/route.ts    # EU-14 compliance reports
├── wine-pairings/
│   ├── route.ts               # GET/POST pairings
│   └── [id]/route.ts          # GET/PUT/DELETE pairing
└── stats/route.ts             # Dashboard statistics
```

## 🔥 Critical Gotchas & Solutions

### 1. **Database Connection GOTCHA**
**Problem**: Direct IP connection fails
**Solution**: ALWAYS use Kong API Gateway
```typescript
// ❌ NEVER DO THIS
DATABASE_URL="postgresql://user:pass@31.97.182.226:5432/postgres"

// ✅ ALWAYS USE THIS
DATABASE_URL="postgresql://user:pass@supabase.enigmaconalma.com:8443/postgres"
```

### 2. **Schema Profile Headers GOTCHA**
**Problem**: Wrong schema access
**Solution**: Include profile headers
```typescript
const headers = {
  'Accept-Profile': 'restaurante',
  'Content-Profile': 'restaurante'
}
```

### 3. **EU-14 Allergen Compliance GOTCHA**
**Problem**: Missing required allergen data
**Solution**: Implement all 14 EU allergens exactly as Badezeit
```typescript
// All 14 EU allergens must be tracked
const EU_ALLERGENS = [
  'containsGluten', 'containsMilk', 'containsEggs', 'containsNuts',
  'containsFish', 'containsShellfish', 'containsSoy', 'containsCelery',
  'containsMustard', 'containsSesame', 'containsSulfites', 'containsLupin',
  'containsMollusks', 'containsPeanuts'
]
```

### 4. **Multilingual Data GOTCHA**
**Problem**: Inconsistent language handling
**Solution**: Always handle `name`/`nameEn` and `description`/`descriptionEn`
```typescript
interface MenuItem {
  name: string        // Spanish (primary)
  nameEn?: string    // English (optional)
  description: string     // Spanish (required)
  descriptionEn?: string  // English (optional)
}
```

### 5. **Role-Based Access GOTCHA**
**Problem**: Insufficient permission checks
**Solution**: Implement granular role checking
```typescript
const canEdit = ['ADMIN', 'MANAGER'].includes(userRole)
const canView = ['ADMIN', 'MANAGER', 'STAFF'].includes(userRole)
const canDelete = ['ADMIN'].includes(userRole)
```

### 6. **TanStack Query Cache GOTCHA**
**Problem**: Stale data after mutations
**Solution**: Proper invalidation strategy
```typescript
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['menu-items'] })
  queryClient.invalidateQueries({ queryKey: ['menu-stats'] })
}
```

## 🧪 Testing Strategy

### Unit Tests (Jest + Testing Library)
```bash
src/app/(admin)/dashboard/menu/__tests__/
├── components/
│   ├── tabs-navigation.test.tsx
│   ├── category-manager.test.tsx
│   ├── item-manager.test.tsx
│   └── allergen-manager.test.tsx
├── hooks/
│   ├── use-menu-items.test.ts
│   └── use-categories.test.ts
└── schemas/
    ├── menu-item.schema.test.ts
    └── category.schema.test.ts
```

### E2E Tests (Playwright)
```bash
tests/e2e/menu-management/
├── menu-navigation.spec.ts        # Tab navigation
├── category-crud.spec.ts          # Category operations
├── menu-item-crud.spec.ts         # Item operations + EU-14
├── allergen-compliance.spec.ts    # EU-14 compliance
├── wine-pairing.spec.ts           # Wine pairing system
└── role-based-access.spec.ts      # Permission testing
```

### Test Commands Integration
```bash
# Run all menu management tests
npm run test:menu
npm run test:e2e:menu

# Quality gates
npm run lint && npm run type-check && npm run test && npm run test:e2e:menu
```

## ⚡ Performance Considerations

### TanStack Query Optimization
- **Stale Time**: 5 minutes for menu items (low change frequency)
- **Cache Time**: 10 minutes for categories (very stable)
- **Background Refetch**: On window focus for real-time updates
- **Optimistic Updates**: All mutations for instant UX

### Database Query Optimization
- **Indexes**: Ensure indexes on `categoryId`, `restaurantId`, `isAvailable`
- **Pagination**: Implement for large menu catalogs
- **Selective Loading**: Load allergen data only when needed

### Bundle Optimization
- **Dynamic Imports**: Tab components loaded on demand
- **Image Optimization**: Next.js Image component for menu photos
- **Tree Shaking**: Import specific Lucide icons only

## 🎨 Design System Integration

### Enigma Design Tokens (from CLAUDE.md)
```css
/* Use existing HSL tokens */
--primary: oklch(0.45 0.15 200)     /* Atlantic Blue */
--card: hsl(var(--card))            /* Card backgrounds */
--muted-foreground: hsl(var(--muted-foreground))
```

### Component Styling Patterns
- **Cards**: `Card/CardContent/CardHeader` for all containers
- **Forms**: `Form/FormField/FormLabel/FormMessage` structure
- **Buttons**: Primary for actions, Secondary for navigation
- **Badges**: Status indicators (Available/Unavailable/Vegetarian/etc.)
- **Icons**: Lucide icons with consistent 4x4 sizing

## 📋 Development Checklist

### Pre-Development
- [ ] SSH access to production database confirmed
- [ ] Database schema analysis complete
- [ ] Badezeit reference components analyzed
- [ ] Context7 patterns researched
- [ ] File structure planned

### Phase 1 - Foundation ✅
- [ ] `/dashboard/menu` route created
- [ ] Tab navigation implemented (6 tabs)
- [ ] Database connection via Kong Gateway
- [ ] Role-based access control
- [ ] Basic layout with Enigma design system

### Phase 2 - Categories
- [ ] Category CRUD operations
- [ ] Drag-and-drop ordering
- [ ] Active/inactive toggles
- [ ] Multilingual support (ES/EN)
- [ ] TanStack Query integration

### Phase 3 - Menu Items
- [ ] Menu item CRUD with full validation
- [ ] EU-14 allergen compliance (all 14 allergens)
- [ ] Dietary flags (vegetarian/vegan/gluten-free)
- [ ] Multilingual descriptions
- [ ] Image upload system (max 5 per item)
- [ ] Advanced filtering and search

### Phase 4 - Allergen Management
- [ ] EU-14 allergen visualization
- [ ] Items-by-allergen reporting
- [ ] Compliance checking tools
- [ ] Export functionality

### Phase 5 - Wine Pairings
- [ ] Food-wine pairing CRUD
- [ ] Pairing recommendations
- [ ] Sommelier interface

### Phase 6 - Advanced Features
- [ ] Menu settings management
- [ ] Export/Import functionality
- [ ] Analytics dashboard
- [ ] Bulk operations
- [ ] Performance optimization

### Quality Gates
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compilation (`npm run type-check`)
- [ ] Unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e:menu`)
- [ ] Production build successful (`npm run build`)

---

## 🏆 Success Criteria

**The menu management system is complete when:**

1. **Functional Requirements Met:**
   - All 6 tabs functional with real CRUD operations
   - EU-14 allergen compliance fully implemented
   - Wine pairing system operational
   - Multilingual support (ES/EN) working
   - Role-based access control enforced

2. **Technical Excellence:**
   - All quality gates passing (lint, type-check, tests)
   - Optimistic updates working smoothly
   - Database integration via Kong Gateway stable
   - Performance targets met (< 2s page loads)

3. **User Experience:**
   - Intuitive navigation between management tabs
   - Responsive design (mobile/tablet/desktop)
   - Real-time updates across admin users
   - Error handling with user-friendly messages

4. **Production Ready:**
   - Full test coverage (unit + E2E)
   - Documentation updated in CLAUDE.md
   - No security vulnerabilities
   - Compatible with existing Enigma infrastructure

**This plan follows context engineering best practices and provides a comprehensive roadmap for implementing a world-class menu management system.**