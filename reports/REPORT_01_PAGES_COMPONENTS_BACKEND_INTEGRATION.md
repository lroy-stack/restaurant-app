# Report 1: Pages, Components & Backend Integration Map

**Project**: Enigma Restaurant Platform - Public Frontend
**Date**: 2025-10-05
**Scope**: Complete mapping of public-facing pages, components, and backend integrations

---

## Executive Summary

- **11 public pages** across 7 main routes + 5 legal pages
- **45+ React components** (23 shadcn/ui base + 22 custom)
- **8 critical hooks** for backend integration
- **6 API routes** consumed by frontend
- **Supabase realtime** active on 4 critical domains
- **ImageKit CDN** for media delivery with dynamic transformations

---

## 1. Page Structure Map

### Core Pages (7)

| Route | File | Components Used | Backend Integration | Status |
|-------|------|-----------------|---------------------|--------|
| `/` | `(public)/page.tsx` | FeaturedDishes, FeaturedWines, EnigmaLogo, OptimizedImage | `useMenu`, `useMediaLibrary` | ✅ Active |
| `/menu` | `(public)/menu/page.tsx` | MenuSectionToggle, ProductDetailModal, AllergenInfo, CartSidebar | `useMenu`, `useCart` (realtime) | ✅ Active |
| `/reservas` | `(public)/reservas/page.tsx` | ProfessionalReservationForm, DateTimeAndTableStep, ContactAndConfirmStep | `useReservations`, `useBusinessHours` (realtime) | ✅ Active |
| `/historia` | `(public)/historia/page.tsx` | Card, Badge, EnigmaLogo | `useRestaurant`, `useMediaLibrary` | ✅ Active |
| `/galeria` | `(public)/galeria/page.tsx` | GalleryLightbox, Card | `useMediaLibrary`, `useRestaurant` | ✅ Active |
| `/contacto` | `(public)/contacto/page.tsx` | RestaurantMap (dynamic), Card, Form components | `useRestaurant`, `useBusinessHours` | ✅ Active |
| `/mi-reserva` | `(public)/mi-reserva/page.tsx` | CustomerCancelReservationModal, CustomerEditReservationModal | Token-based reservation API | ✅ Active |

### Legal Pages (5)

| Route | File | Type |
|-------|------|------|
| `/legal/aviso-legal` | `(public)/legal/aviso-legal/page.tsx` | LegalPageLayout |
| `/legal/politica-privacidad` | `(public)/legal/politica-privacidad/page.tsx` | LegalPageLayout |
| `/legal/politica-cookies` | `(public)/legal/politica-cookies/page.tsx` | LegalPageLayout |
| `/legal/terminos-condiciones` | `(public)/legal/terminos-condiciones/page.tsx` | LegalPageLayout |
| `/legal/derechos-gdpr` | `(public)/legal/derechos-gdpr/page.tsx` | GdprRequestForm |

**All legal pages support ES + EN versions** (`/en` suffix)

---

## 2. Component Hierarchy

### Layout Components

```
PublicLayout (root wrapper)
├── ThemeAwareMeshGradient (background)
├── FloatingNavbar
│   ├── MobileNav (< 768px)
│   └── Desktop navigation (≥ 768px)
├── CartFloatingButton (global)
├── CartSidebar (global)
│   ├── CartItem (repeated)
│   └── Cart summary
├── CookieConsentBanner (first visit)
├── {children} (page content)
└── Footer
```

### Page-Specific Components

#### Homepage Components
```
HomePage
├── Hero Section
│   └── OptimizedImage (ImageKit)
├── FeaturedDishes (src/components/homepage/)
│   ├── ProductCard × 4
│   ├── ProductDetailModal
│   └── AllergenInfo
├── FeaturedWines (src/components/homepage/)
│   └── ProductCard × 2
├── Features Grid
│   └── Card × 3
└── Location & Contact
    └── Card
```

#### Menu Components
```
MenuPage
├── Hero Section (dynamic image)
├── Search + Filter Section
│   ├── Input (search)
│   ├── Select (category)
│   └── Sheet (advanced filters)
├── MenuSectionToggle
│   └── Button × 3 (PLATOS/VINOS/BEBIDAS)
├── Menu Grid (2×2 mobile → 4×4 desktop)
│   ├── Card (product) × N
│   │   ├── AllergenInfo
│   │   ├── Badge (status)
│   │   └── Button (view/add)
│   └── ProductDetailModal
└── Bottom CTA
```

#### Reservations Components
```
ProfessionalReservationForm
├── Hero Section
├── Progress Steps (2 steps)
├── Step 1: DateTimeAndTableStep
│   ├── Calendar
│   ├── Time selector
│   ├── Party size
│   └── Table selection (multi-table support)
├── Step 2: ContactAndConfirmStep
│   ├── Customer form
│   ├── Pre-order items (cart integration)
│   ├── GDPR consents
│   └── Confirmation
└── Success Screen
```

---

## 3. Backend Integration Map

### API Routes Consumed

| Endpoint | Method | Frontend Hook | Purpose | Realtime |
|----------|--------|---------------|---------|----------|
| `/api/menu/items` | GET | `useMenu` | Fetch menu with categories + filters | ✅ Supabase |
| `/api/menu/allergens` | GET | `useMenu` | EU-14 allergen data | ❌ |
| `/api/reservations` | POST | `useReservations` | Create reservation + pre-orders | ✅ Supabase |
| `/api/availability` | POST | `useReservations` | Check table availability realtime | ✅ Supabase |
| `/api/business-hours` | GET | `useBusinessHours` | Dual-shift schedule + current status | ✅ Supabase |
| `/api/restaurant/config` | GET | `useRestaurant` | Restaurant info (address, hours, etc.) | ❌ |
| `/api/reservations/token/*` | GET/POST | Token service | Customer self-service (cancel/edit) | ❌ |

### Supabase Schema Usage

**Active Tables** (frontend reads):
```sql
-- Menu system
restaurante.menu_items          → useMenu
restaurante.menu_categories     → useMenu
restaurante.allergens           → useMenu
restaurante.wine_pairings       → useMenu (food pairings)

-- Reservations
restaurante.reservations        → useReservations (realtime)
restaurante.tables              → useReservations (availability)
restaurante.business_hours      → useBusinessHours (dual-shift)

-- Restaurant config
restaurante.restaurant_info     → useRestaurant
restaurante.media_library       → useMediaLibrary (ImageKit URLs)
```

### Custom Hooks Architecture

```typescript
// Data fetching hooks
useMenu()                  → Menu items + categories + filters
useCart()                  → Cart state (Zustand) + localStorage
useReservations()          → Reservations CRUD + availability
useBusinessHours()         → Dual-shift hours + open status
useRestaurant()            → Restaurant metadata
useMediaLibrary()          → ImageKit integration + lazy loading

// UI/UX hooks
useBreakpoint()           → Responsive utilities
useMediaQuery()           → Custom media queries
useMobileNavigation()     → Mobile menu state
useScrollLock()           → Prevent scroll (modals)
```

---

## 4. State Management

### Zustand Stores

```typescript
// Cart Store (src/stores/posCartStore.ts)
{
  items: CartItem[]
  language: 'es' | 'en'
  isOpen: boolean
  addToCart()
  removeFromCart()
  updateQuantity()
  clearCart()
  getTotalPrice()
}

// Table Store (admin-only, not public)
useTableStore
```

### React Query Integration

**NOT IMPLEMENTED YET** - All data fetching is currently custom hooks with `useState` + `useEffect`

**Opportunity**: Migrate to `@tanstack/react-query` for:
- Automatic caching
- Background refetching
- Optimistic updates
- Devtools integration

---

## 5. Media & Assets

### ImageKit CDN Integration

```typescript
// Pattern
const { buildImageUrl, getHeroImage } = useMediaLibrary({ type: 'hero' | 'gallery' })

// Transformations
buildImageUrl(item, {
  width: 1920,
  height: 1080,
  quality: 'auto',
  format: 'auto'
})

// Categories
- hero_home
- hero_menu
- hero_historia
- hero_galeria
- hero_contacto
- gallery_ambiente
- gallery_platos
- gallery_ubicacion
- gallery_cocina
```

### Static Assets
```
public/
├── benaya.ttf             → Brand font
├── enigma-logo-circle.svg
├── enigma-logo.svg
└── leaflet/               → Map markers
```

---

## 6. Third-Party Integrations

| Service | Purpose | Component/Hook | Status |
|---------|---------|----------------|--------|
| **Supabase** | Database + Realtime | All data hooks | ✅ Active |
| **ImageKit** | CDN + Transformations | `useMediaLibrary` | ✅ Active |
| **Leaflet** | Interactive maps | `RestaurantMap` | ✅ Active (dynamic import) |
| **NextAuth** | Authentication | Admin only (not public) | ✅ Active |
| **Shadcn/ui** | Component library | All UI components | ✅ Active |
| **Framer Motion** | Animations | ❌ NOT IMPLEMENTED | 🔴 Missing |
| **Three.js** | 3D effects | ❌ NOT IMPLEMENTED | 🔴 Missing |

---

## 7. Performance Patterns

### Current Optimizations
✅ Dynamic imports (`next/dynamic`) for heavy components
✅ Image lazy loading (`loading="lazy"`)
✅ Suspense boundaries with loading skeletons
✅ CSS-based animations (no JS)
✅ Mobile-first responsive design

### Missing Optimizations
❌ React Query for caching
❌ Virtual scrolling for long lists
❌ Code splitting per route
❌ Web Workers for heavy computations
❌ Service Worker for offline support
❌ Intersection Observer for scroll animations

---

## 8. GDPR & Legal Compliance

### Cookie Consent
```typescript
<CookieConsentBanner />
- localStorage tracking
- Preferences stored: marketing, analytics, functional
- Banner shows on first visit
```

### Data Processing
```typescript
// Reservation form (step 4)
{
  dataProcessingConsent: boolean     // Required
  emailConsent: boolean              // Optional
  marketingConsent: boolean          // Optional
}
```

### Customer Rights
- `/legal/derechos-gdpr` → GDPR request form
- Export personal data
- Delete account
- Modify data

---

## 9. Critical Dependencies

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "@supabase/supabase-js": "latest",
  "zustand": "^4.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "shadcn/ui": "latest",
  "tailwindcss": "^4.0.0",
  "framer-motion": "❌ NOT INSTALLED",
  "three": "❌ NOT INSTALLED",
  "@react-three/fiber": "❌ NOT INSTALLED"
}
```

---

## 10. Key Findings & Recommendations

### Strengths ✅
- Complete backend integration with Supabase realtime
- Type-safe forms with Zod + React Hook Form
- Mobile-first responsive design
- GDPR compliant
- Multi-language support (ES/EN/DE)
- Cart system fully functional

### Gaps 🔴
- **No modern animations** (Framer Motion, Three.js missing)
- **No lazy loading optimization** beyond basic `loading="lazy"`
- **Homepage incomplete** (missing historia integration, curated images)
- **Product cards functional but basic** (no premium interactions)
- **Pre-orders exist but UX needs elevation**
- **No React Query** (manual state management everywhere)

### Priority Actions
1. Install animation libraries (`framer-motion`, `three`, `@react-three/fiber`)
2. Implement Three.js smoke/particle cursor trail
3. Enhance homepage with story sections + curated gallery
4. Upgrade product cards with hover effects + smooth transitions
5. Add Intersection Observer for scroll-triggered animations
6. Migrate to React Query for caching + optimistic updates

---

**Next Steps**: See Report 2 for detailed frontend state analysis
