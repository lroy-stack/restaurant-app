# PRP: Enigma Multi-Pass Dynamic Pages Implementation

## Executive Summary

**CRITICAL DISCOVERY**: The Enigma public pages (Historia, Contacto, Galería) currently use 100% hardcoded content while a **fully functional database infrastructure with hooks already exists**. This PRP eliminates hardcoding by integrating existing dynamic data sources, fixes responsive design issues, and implements an interactive map with React Leaflet.

**Success Metric**: Transform 3 static pages into dynamic, database-driven pages with consistent data, proper responsive design, and enhanced user experience.

---

## Context & Research Findings

### 🔍 Current State Analysis

**Database Infrastructure (Verified via SSH)**:
- **27 operational tables** in `restaurante` schema
- **Real restaurant data** confirmed in production:
  ```sql
  id: 'rest_enigma_001'
  name: 'Enigma Cocina Con Alma'
  email: 'reservas@enigmaconalma.com'  ✅ CORRECT in pages
  phone: '+34 672 79 60 06'           ✅ CORRECT in pages
  address: 'Carrer Justicia 6A, 03710 Calpe, Alicante'
  google_rating: 4.8                  ⚠️ INCONSISTENT (pages use 4.8/4.9)
  hours_operation: 'Lun-Sab: 18:00 - 23:00'  ❌ PAGES USE: 'Mar-Dom: 18:00 - 24:00'
  description: 'Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe.'
  ambiente: 'Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor.'
  awards: 'Restaurante Recomendado'
  monthly_customers: 230
  ```

**Existing Hook Infrastructure**:
- ✅ `useRestaurant()` - `/src/hooks/use-restaurant.ts` - **FULLY FUNCTIONAL**
- ✅ `useMenuItems()` - `/src/app/(admin)/dashboard/menu/hooks/use-menu-items.ts` - **FULLY FUNCTIONAL**
- ✅ `useCategories()` - `/src/app/(admin)/dashboard/menu/hooks/use-categories.ts` - **FULLY FUNCTIONAL**
- ✅ API endpoints working: `/api/restaurant`, `/api/menu/items`, `/api/menu/categories`

### 🚨 Critical Issues Discovered

**Historia Page (`/src/app/(public)/historia/page.tsx`)**:
- **Line 10**: Hardcoded title "Nuestra Historia" should be "Tradición y Pasión"
- **Lines 9-18**: All metadata hardcoded instead of using `useRestaurant()`
- **Line 105**: Hardcoded rating "4.8/5 Google" instead of `{restaurant?.google_rating}/5`
- **Lines 71-87**: All content hardcoded despite `restaurant?.description` being available

**Contacto Page (`/src/app/(public)/contacto/page.tsx`)**:
- **Lines 339-364**: Placeholder map instead of interactive React Leaflet implementation
- **Lines 88-177**: All contact info hardcoded instead of using `useRestaurant()` data
- **Line 168**: Hardcoded color `text-red-600` violates design system (`text-destructive`)
- **Lines 163-164**: Wrong hours "Mar-Dom: 18:00 - 24:00" vs DB "Lun-Sab: 18:00 - 23:00"

**Galería Page (`/src/app/(public)/galeria/page.tsx`)**:
- **Line 146**: Wrong grid breakpoints `md:grid-cols-2 lg:grid-cols-3` should be `grid-cols-2 md:grid-cols-4 lg:grid-cols-4`
- **Lines 20-69**: Hardcoded image array instead of using `useMenuItems()` with `imageUrl`
- **Lines 268-287**: "Encuéntranos en Calpe" component with `sm:grid-cols-3` cramming on mobile
- **Line 269**: `bg-white/50` violates design system (should use `bg-card`)

### 🎨 Design System Reference (from `/src/app/globals.css`)

**OKLCH Design Tokens**:
```css
--primary: oklch(0.45 0.15 200)        /* Atlantic Blue */
--destructive: oklch(0.65 0.15 25)     /* Error states */
--card: oklch(1 0 0)                   /* Card backgrounds */
--border: oklch(0.82 0.02 210)         /* Borders */
--muted-foreground: oklch(0.38 0.02 220) /* Muted text */
```

**Typography Classes**:
```css
.enigma-hero-title { @apply text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight; }
.enigma-section-title-large { @apply text-2xl sm:text-3xl font-bold mb-6 text-primary; }
.enigma-section-title-center { @apply text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-primary; }
```

**Responsive Grid Standards**:
```css
/* ✅ ENIGMA PATTERNS: */
grid-cols-2          /* Mobile: 2x2 maximiza espacio */
md:grid-cols-4       /* Tablet: 4x4 optimal viewing */
lg:grid-cols-4       /* Desktop: 4x4 mantiene consistencia */
```

### 📚 React Leaflet Integration (Context7 Research)

**Import Patterns**:
```javascript
// ✅ Correct TypeScript imports with types
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// ⚠️ No types available here
import { MapContainer } from 'react-leaflet/MapContainer'

// ✅ Types are available here
import { MapContainer } from 'react-leaflet'
```

**Next.js 15 SSR Gotchas**:
- **React Strict Mode issues**: May need `{ reactStrictMode: false }` in `next.config.js`
- **Dynamic imports required**: Use `dynamic(() => import('./Map'), { ssr: false })`
- **CSS import mandatory**: `import 'leaflet/dist/leaflet.css'`

---

## Implementation Blueprint

### Phase 1: Historia Page - Database Integration (2 hours)

**File**: `/src/app/(public)/historia/page.tsx`

**Changes Required**:

1. **Add useRestaurant Hook**:
   ```typescript
   'use client'
   import { useRestaurant } from '@/hooks/use-restaurant'

   export default function HistoriaPage() {
     const { restaurant, loading, error, getFormattedRating, getLocationDescription } = useRestaurant()

     if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
     if (error) return <div>Error: {error}</div>
   ```

2. **Replace Hardcoded Content** (Lines 41-46):
   ```typescript
   // BEFORE:
   <h1 className="enigma-hero-title">
     Enigma Cocina Con Alma
   </h1>
   <p className="enigma-hero-subtitle">
     Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe
   </p>

   // AFTER:
   <h1 className="enigma-hero-title">
     Tradición y Pasión {/* ✅ CORRECT TITLE */}
   </h1>
   <p className="enigma-hero-subtitle">
     {restaurant?.description}
   </p>
   ```

3. **Fix Rating Consistency** (Line 105):
   ```typescript
   // BEFORE:
   <span className="text-sm text-muted-foreground ml-2">4.8/5 Google</span>

   // AFTER:
   <span className="text-sm text-muted-foreground ml-2">{getFormattedRating()}/5 Google</span>
   ```

4. **Dynamic Content Integration** (Lines 71-87):
   ```typescript
   <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
     {restaurant?.description}
   </p>
   <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
     {restaurant?.ambiente}
   </p>
   ```

### Phase 2: Contacto Page - React Leaflet + Dynamic Data (4 hours)

**File**: `/src/app/(public)/contacto/page.tsx`

**Dependencies Installation**:
```bash
npm install react-leaflet leaflet
npm install -D @types/leaflet
```

**Step 1: Create RestaurantMap Component**

**New File**: `/src/components/maps/RestaurantMap.tsx`
```typescript
'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

const CALPE_COORDS: [number, number] = [38.64359, 0.04208] // Carrer Justicia 6A

export function RestaurantMap() {
  useEffect(() => {
    // Fix for default markers in Next.js
    const L = require('leaflet')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    })
  }, [])

  return (
    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg overflow-hidden">
      <MapContainer
        center={CALPE_COORDS}
        zoom={17}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={CALPE_COORDS}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-semibold">Enigma Cocina Con Alma</h3>
              <p className="text-sm">Carrer Justicia 6A, Calpe</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
```

**Step 2: Dynamic Import Integration**

**File**: `/src/app/(public)/contacto/page.tsx`
```typescript
'use client'
import dynamic from 'next/dynamic'
import { useRestaurant } from '@/hooks/use-restaurant'

// Dynamic import to prevent SSR issues
const RestaurantMap = dynamic(() => import('@/components/maps/RestaurantMap').then(mod => ({ default: mod.RestaurantMap })), {
  loading: () => (
    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
  ssr: false,
})

export default function ContactoPage() {
  const { restaurant, loading, error } = useRestaurant()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (error) return <div>Error: {error}</div>
```

**Step 3: Replace Hardcoded Contact Info** (Lines 88-177):
```typescript
// BEFORE (Lines 96-100):
<p className="text-muted-foreground">
  Carrer Justicia 6A<br />
  03710 Calpe, Alicante<br />
  España
</p>

// AFTER:
<p className="text-muted-foreground">
  {restaurant?.address}<br />
  España
</p>

// Phone (Lines 117-122):
<a
  href={`tel:${restaurant?.phone?.replace(/\s/g, '')}`}
  className="enigma-brand-body text-muted-foreground hover:text-primary transition-colors text-lg font-medium"
>
  {restaurant?.phone}
</a>

// Email (Lines 139-143):
<a
  href={`mailto:${restaurant?.email}`}
  className="enigma-brand-body text-muted-foreground hover:text-primary transition-colors font-medium"
>
  {restaurant?.email}
</a>

// Hours (Lines 163-164) - FIX CRITICAL DATA ERROR:
<div className="flex justify-between">
  <span>Horarios:</span>
  <span className="enigma-brand-body text-destructive font-medium">{restaurant?.hours_operation}</span>
</div>
```

**Step 4: Replace Map Placeholder** (Lines 339-364):
```typescript
// BEFORE:
<div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-4">
  <div className="text-center">
    <Navigation className="h-12 w-12 text-primary mx-auto mb-2" />
    <p className="text-muted-foreground">Mapa Interactivo</p>
  </div>
</div>

// AFTER:
<RestaurantMap />
```

### Phase 3: Galería Page - Dynamic Gallery + Responsive Fixes (3 hours)

**File**: `/src/app/(public)/galeria/page.tsx`

**Step 1: Add Dynamic Hooks**:
```typescript
'use client'
import { useMenuItems } from '@/app/(admin)/dashboard/menu/hooks/use-menu-items'
import { useCategories } from '@/app/(admin)/dashboard/menu/hooks/use-categories'
import { useRestaurant } from '@/hooks/use-restaurant'

export default function GaleriaPage() {
  const { menuItems, loading: itemsLoading } = useMenuItems({
    isAvailable: 'true',
    isRecommended: 'true'
  })
  const { categories } = useCategories({ type: 'FOOD' })
  const { restaurant } = useRestaurant()

  const galleryImages = menuItems
    .filter(item => item.imageUrl)
    .map(item => ({
      id: item.id,
      src: item.imageUrl,
      title: item.name,
      description: item.description,
      category: item.categoryId
    }))

  if (itemsLoading) return <div className="min-h-screen flex items-center justify-center">Cargando galería...</div>
```

**Step 2: Fix Grid Breakpoints** (Line 146):
```typescript
// BEFORE:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

// AFTER - ENIGMA STANDARD:
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8">
```

**Step 3: Replace Hardcoded Images** (Lines 20-69):
```typescript
// REMOVE entire hardcoded galleryImages array (lines 20-69)
// USE dynamic galleryImages from useMenuItems() (defined above)

{galleryImages.map((image) => (
  <Card
    key={image.id}
    className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
  >
    <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
      {image.src ? (
        <img
          src={image.src}
          alt={image.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Camera className="h-12 w-12 text-primary/40" />
        </div>
      )}
    </div>
    <CardContent className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-2 text-primary group-hover:text-primary/80 transition-colors">
        {image.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {image.description}
      </p>
    </CardContent>
  </Card>
))}
```

**Step 4: Redesign "Encuéntranos en Calpe" Component** (Lines 268-287):
```typescript
// REPLACE ENTIRE SECTION (Lines 261-288):
<section className="py-12 sm:py-16 bg-muted/30">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="enigma-section-title-large">Encuéntranos en Calpe</h2>

      {/* RESPONSIVE STACK - NO CRAMMING */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base">
        <Card className="p-3 bg-card border border-border"> {/* ✅ DESIGN TOKENS */}
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-center">{restaurant?.address}</span>
          </div>
        </Card>

        <Card className="p-3 bg-card border border-border">
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
            <a href={`tel:${restaurant?.phone?.replace(/\s/g, '')}`}
               className="hover:text-primary transition-colors text-center">
              {restaurant?.phone}
            </a>
          </div>
        </Card>

        <Card className="p-3 bg-card border border-border">
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
            <a href={`mailto:${restaurant?.email}`}
               className="hover:text-primary transition-colors text-center">
              {restaurant?.email}
            </a>
          </div>
        </Card>
      </div>

      <p className="text-sm sm:text-base text-muted-foreground mt-6 italic">
        "{restaurant?.ambiente}"
      </p>
    </div>
  </div>
</section>
```

---

## Validation Gates

**Quality Checks** (Run after each phase):

```bash
# Syntax/Style Check
npm run lint
npm run type-check

# Build Verification
npm run build

# Development Server Test
npm run dev
# Verify pages load at:
# - http://localhost:3000/historia
# - http://localhost:3000/contacto
# - http://localhost:3000/galeria
```

**Functional Validation**:

1. **Database Connectivity**:
   - [ ] All pages use `useRestaurant()` hook instead of hardcode
   - [ ] Gallery uses `useMenuItems()` for dynamic images
   - [ ] Contact info matches DB exactly (especially hours: "Lun-Sab: 18:00 - 23:00")
   - [ ] Rating displays consistently as 4.8 across all pages

2. **Responsive Design**:
   - [ ] Grid breakpoints follow `grid-cols-2 md:grid-cols-4 lg:grid-cols-4` pattern
   - [ ] Typography scales properly on mobile (375px iPhone SE)
   - [ ] No horizontal scrolling on any device
   - [ ] Touch interactions work on map

3. **Design System Compliance**:
   - [ ] Zero hardcoded colors - all use design tokens
   - [ ] Components use `bg-card`, `border-border`, `text-destructive`
   - [ ] Typography follows `enigma-hero-title`, `enigma-section-title` classes
   - [ ] Consistent spacing and radius usage

4. **Interactive Map**:
   - [ ] Map loads without blocking page render
   - [ ] Marker displays correctly at Calpe coordinates
   - [ ] Popup shows restaurant information
   - [ ] No SSR hydration errors in console

**Performance Validation**:
```bash
# Check bundle size impact
npm run build
npm run analyze # if available

# Network tab verification:
# - Dynamic imports work correctly
# - Images lazy load appropriately
# - API calls cached appropriately
```

---

## Error Handling & Gotchas

### Database Connection Fallbacks
The `useRestaurant()` hook includes fallback data if API fails:
```typescript
// From /src/hooks/use-restaurant.ts lines 50-66
const fallbackData: RestaurantInfo = {
  id: 'rest_enigma_001',
  name: 'Enigma Cocina Con Alma',
  description: 'Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe.',
  // ... complete fallback
}
```

### React Leaflet Next.js 15 Issues
```typescript
// next.config.js - May need if React Strict Mode causes issues
module.exports = {
  reactStrictMode: false, // Temporary workaround
}

// Dynamic import pattern to prevent SSR issues
const Map = dynamic(() => import('./components/RestaurantMap'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})
```

### CSS Import Requirements
```typescript
// MANDATORY in RestaurantMap component
import 'leaflet/dist/leaflet.css'

// Marker icon fix for Next.js
useEffect(() => {
  const L = require('leaflet')
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}, [])
```

---

## Implementation Tasks Checklist

**Phase 1: Historia Page (2 hours)**
- [ ] Add `useRestaurant()` hook import and integration
- [ ] Replace hardcoded title with "Tradición y Pasión"
- [ ] Replace hardcoded content with `restaurant?.description` and `restaurant?.ambiente`
- [ ] Fix rating to use `getFormattedRating()` function
- [ ] Test responsive behavior and typography scaling
- [ ] Verify loading states and error handling

**Phase 2: Contacto Page (4 hours)**
- [ ] Install react-leaflet and leaflet dependencies
- [ ] Create `/src/components/maps/RestaurantMap.tsx` with interactive map
- [ ] Add dynamic import with SSR disabled
- [ ] Replace hardcoded contact info with `useRestaurant()` data
- [ ] Fix hardcoded `text-red-600` to `text-destructive`
- [ ] Replace map placeholder with `<RestaurantMap />` component
- [ ] Test map interactivity and mobile touch support
- [ ] Verify marker displays and popup functionality

**Phase 3: Galería Page (3 hours)**
- [ ] Add `useMenuItems()` and `useCategories()` hooks
- [ ] Replace hardcoded image array with dynamic `galleryImages`
- [ ] Fix grid breakpoints to `grid-cols-2 md:grid-cols-4 lg:grid-cols-4`
- [ ] Redesign "Encuéntranos en Calpe" component with proper responsive grid
- [ ] Replace `bg-white/50` with `bg-card` design token
- [ ] Test image loading and fallback states
- [ ] Verify responsive grid behavior across breakpoints

**Final Validation**
- [ ] Run all quality gates (lint, type-check, build)
- [ ] Test all pages on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Verify database data consistency across all pages
- [ ] Confirm zero hardcoded colors remain
- [ ] Test loading states and error boundaries
- [ ] Performance check - no impact on Core Web Vitals

---

## Success Metrics

**Before (Current State)**:
- ❌ 3 pages with 100% hardcoded content
- ❌ Placeholder map with no interactivity
- ❌ Grid breakpoints not following responsive best practices
- ❌ Multiple hardcoded colors breaking design system
- ❌ Inconsistent restaurant data across pages

**After (Target State)**:
- ✅ 3 pages using dynamic database content via existing hooks
- ✅ Interactive React Leaflet map with restaurant marker
- ✅ Responsive 2x2 → 4x4 → 4x4 grid patterns
- ✅ 100% design token compliance
- ✅ Consistent data source across all pages

---

## Confidence Score: 9/10

This PRP provides comprehensive context for one-pass implementation success including:
- ✅ Real database data structure verified via SSH
- ✅ Existing functional hooks documented with code examples
- ✅ Specific line-by-line changes identified
- ✅ Complete React Leaflet integration pattern with Next.js 15 compatibility
- ✅ Design system compliance requirements with exact token values
- ✅ Responsive grid patterns established from codebase analysis
- ✅ Error handling and gotchas from Context7 research
- ✅ Validation gates ensure quality and functionality

The infrastructure already exists - this is an integration task, not a reconstruction task.