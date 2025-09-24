# 🔥 MULTI_PASS.md - Enigma Restaurant Pages Improvement Plan

## 🚨 CRITICAL DISCOVERY: Infrastructure Already Exists

**PROBLEMA PRINCIPAL**: Las páginas públicas (Historia, Contacto, Galería) usan **HARDCODE** cuando la **INFRAESTRUCTURA DB + HOOKS YA EXISTE** perfectamente funcional.

---

## 📊 REAL DATABASE STRUCTURE (27 TABLES DISCOVERED)

### Tabla `restaurants` - DATOS REALES EN PRODUCCIÓN:
```sql
-- DATOS ACTUALES EN DB:
id: 'rest_enigma_001'
name: 'Enigma Cocina Con Alma'
email: 'reservas@enigmaconalma.com'  ✅ CORRECTO en páginas
phone: '+34 672 79 60 06'           ✅ CORRECTO en páginas
address: 'Carrer Justicia 6A, 03710 Calpe, Alicante'
google_rating: 4.8                  ⚠️  INCONSISTENTE (páginas usan 4.8/4.9)
hours_operation: 'Lun-Sab: 18:00 - 23:00'  ❌ PÁGINAS USAN: 'Mar-Dom: 18:00 - 24:00'
description: 'Cada plato es una historia de tradición, pasión y sabores únicos en el auténtico casco antiguo de Calpe.'
ambiente: 'Entre callejones históricos rodeados de plantas, descubre un ambiente auténtico y acogedor.'
awards: 'Restaurante Recomendado'
monthly_customers: 230
```

### Tabla `business_hours` - HORARIOS DINÁMICOS:
- `day_of_week` (0-6)
- `open_time`, `close_time`
- `last_reservation_time`
- `advance_booking_minutes`
- `is_holiday`, `holiday_name`

### Tabla `legal_content` - CONTENIDO LEGAL DINÁMICO:
- `document_type`: privacy_policy, terms_conditions, cookie_policy, legal_notice, gdpr_rights
- `language`: es, en
- `content`: JSONB versionado
- `version`, `effective_date`, `expiry_date`

### Tablas Menú - GALERÍA DINÁMICA:
- `menu_categories`: `name`, `nameEn`, `type` (FOOD, WINE, BEVERAGE)
- `menu_items`: `imageUrl`, `name`, `description`, `isRecommended`, multiidioma

---

## 🔧 EXISTING INFRASTRUCTURE (ALREADY WORKING)

### Hook `useRestaurant()` - src/hooks/use-restaurant.ts
```typescript
// ✅ YA EXISTE - APIs funcionando
const { restaurant, loading, error } = useRestaurant()
// Datos dinámicos: restaurant.name, restaurant.hours_operation, etc.

// Helper functions disponibles:
getFormattedRating()     // "4.8"
getFormattedCustomers()  // "230+ clientes satisfechos/mes"
getLocationDescription() // "En el auténtico casco antiguo de Calpe"
isOpenNow()             // boolean
```

### Hook `useMenuItems()` - Para Galería Dinámica
```typescript
// ✅ YA EXISTE - API /api/menu/items funcionando
const { menuItems } = useMenuItems({
  isRecommended: 'true',
  isAvailable: 'true'
})
// menuItems[].imageUrl disponible para galería
```

### Hook `useCategories()` - Para Organización Galería
```typescript
// ✅ YA EXISTE - API /api/menu/categories funcionando
const { categories } = useCategories({ type: 'FOOD' })
// categories[].name, categories[].nameEn disponibles
```

---

## 🎯 PASS 1: HISTORIA PAGE - Database Integration + Responsive Fixes

### ISSUES CRÍTICOS ENCONTRADOS:
1. **Título hardcodeado**: "Nuestra Historia" → debe ser "Tradición y Pasión"
2. **TODO el contenido hardcodeado** cuando `useRestaurant()` ya existe
3. **Rating inconsistente**: A veces 4.8, a veces 4.9

### IMPLEMENTACIÓN:
```typescript
// ANTES (líneas 9-18):
export const metadata: Metadata = {
  title: "Nuestra Historia - Enigma Cocina Con Alma", // ❌ HARDCODE
  description: "Descubre la historia...", // ❌ HARDCODE
}

// DESPUÉS:
export default function HistoriaPage() {
  const { restaurant, loading } = useRestaurant() // ✅ USAR HOOK EXISTENTE

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="enigma-hero-title">
        Tradición y Pasión {/* ✅ TÍTULO CORRECTO */}
      </h1>
      <p>{restaurant?.description}</p> {/* ✅ DINÁMICO */}
      <div>Rating: {restaurant?.google_rating}/5</div> {/* ✅ CONSISTENTE */}
    </div>
  )
}
```

### RESPONSIVE GOTCHAS:
- Hero section ya responsive ✅
- Cards grid already optimal ✅
- Verify typography scales en mobile

---

## 🗺️ PASS 2: CONTACTO PAGE - Interactive Map + Dynamic Contact Info

### ISSUES CRÍTICOS ENCONTRADOS:
1. **Mapa placeholder** en lugar de interactivo (líneas 339-364)
2. **Info de contacto hardcodeada** cuando `useRestaurant()` ya existe
3. **Hardcode color**: `text-red-600` (línea 168)
4. **Form sin funcionalidad** - envío estático

### IMPLEMENTACIÓN REACT LEAFLET:
```typescript
// NUEVO COMPONENTE: src/components/maps/RestaurantMap.tsx
'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const CALPE_COORDS = [38.64359, 0.04208] // Carrer Justicia 6A

export function RestaurantMap() {
  return (
    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg overflow-hidden">
      <MapContainer
        center={CALPE_COORDS}
        zoom={17}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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

### DYNAMIC CONTACT INFO:
```typescript
// REEMPLAZAR líneas 88-177 hardcodeadas:
export default function ContactoPage() {
  const { restaurant, loading } = useRestaurant()

  return (
    <Card>
      <h3>Teléfono</h3>
      <a href={`tel:${restaurant?.phone?.replace(/\s/g, '')}`}>
        {restaurant?.phone}
      </a>

      <h3>Horarios</h3>
      <div className="text-destructive"> {/* ✅ DESIGN TOKEN vs text-red-600 */}
        {restaurant?.hours_operation}
      </div>
    </Card>
  )
}
```

### RESPONSIVE GOTCHAS:
- Map container must be `aspect-video` para mantener ratio
- Touch interactions enabled por defecto en React Leaflet

---

## 🖼️ PASS 3: GALERÍA PAGE - Image Breakpoints + Dynamic Gallery + Encuéntranos Fix

### ISSUES CRÍTICOS ENCONTRADOS:
1. **Grid breakpoints WRONG**: `md:grid-cols-2 lg:grid-cols-3`
   - **DEBE SER**: `grid-cols-2 md:grid-cols-4 lg:grid-cols-4` (2x2 mobile, 4x4 tablet/desktop)
2. **Array de imágenes hardcodeado** (líneas 20-69) cuando `useMenuItems()` ya existe
3. **Componente "Encuéntranos en Calpe" TERRIBLE**: (líneas 268-287)
   - `sm:grid-cols-3` cramming address+phone+email en móvil
   - `bg-white/50` instead of design tokens
   - Contact info duplicado y hardcodeado

### GRID BREAKPOINTS FIX:
```typescript
// ANTES (línea 146):
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

// DESPUÉS - SIGUIENDO PATRÓN ENIGMA:
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8">
```

### DYNAMIC GALLERY:
```typescript
// REEMPLAZAR líneas 20-69 hardcodeadas:
export default function GaleriaPage() {
  const { menuItems, loading } = useMenuItems({
    isAvailable: 'true',
    isRecommended: 'true'
  })
  const { categories } = useCategories()

  const galleryImages = menuItems.filter(item => item.imageUrl).map(item => ({
    id: item.id,
    src: item.imageUrl,
    title: item.name,
    description: item.description,
    category: item.categoryId
  }))

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
      {galleryImages.map(image => (
        <GalleryCard key={image.id} image={image} />
      ))}
    </div>
  )
}
```

### "ENCUÉNTRANOS EN CALPE" COMPONENT REDESIGN:
```typescript
// REEMPLAZAR líneas 268-287 COMPLETAMENTE:
function EncontranosSection() {
  const { restaurant } = useRestaurant()

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="enigma-section-title-large">Encuéntranos en Calpe</h2>

          {/* RESPONSIVE STACK - NO CRAMMING */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base">
            <Card className="p-3 bg-card border border-border"> {/* ✅ DESIGN TOKENS */}
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{restaurant?.address}</span>
              </div>
            </Card>

            <Card className="p-3 bg-card border border-border">
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href={`tel:${restaurant?.phone?.replace(/\s/g, '')}`}
                   className="hover:text-primary transition-colors">
                  {restaurant?.phone}
                </a>
              </div>
            </Card>

            <Card className="p-3 bg-card border border-border">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href={`mailto:${restaurant?.email}`}
                   className="hover:text-primary transition-colors">
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
  )
}
```

---

## 🎨 DESIGN SYSTEM COMPLIANCE

### HARDCODED COLORS TO FIX:
```css
/* ❌ ENCONTRADOS: */
text-red-600        → text-destructive
bg-white/50         → bg-card
border-white/40     → border-border
text-blue-800       → text-primary
bg-green-50         → bg-secondary/50

/* ✅ ENIGMA DESIGN TOKENS: */
--primary: oklch(0.45 0.15 200)        /* Atlantic Blue */
--destructive: oklch(0.65 0.15 25)     /* Error states */
--card: oklch(1 0 0)                   /* Card backgrounds */
--border: oklch(0.82 0.02 210)         /* Borders */
```

### RESPONSIVE BREAKPOINTS STANDARDS:
```css
/* ✅ ENIGMA PATTERNS: */
grid-cols-2          /* Mobile: 2x2 maximiza espacio */
md:grid-cols-4       /* Tablet: 4x4 optimal viewing */
lg:grid-cols-4       /* Desktop: 4x4 mantiene consistencia */

/* ❌ EVITAR: */
sm:grid-cols-3       /* Crams content on mobile */
md:grid-cols-2       /* Subutiliza espacio tablet */
lg:grid-cols-3       /* Inconsistente con 4x4 pattern */
```

---

## 📦 DEPENDENCIES NEEDED

### React Leaflet (Maps):
```bash
npm install react-leaflet leaflet
npm install -D @types/leaflet
```

### CSS Import Required:
```typescript
// En componente o layout:
import 'leaflet/dist/leaflet.css'
```

---

## ⚡ IMPLEMENTATION SEQUENCE

### Phase 1: Historia Page (2 hours)
1. Integrate `useRestaurant()` hook
2. Replace hardcoded content with dynamic data
3. Fix title to "Tradición y Pasión"
4. Verify responsive behavior

### Phase 2: Contacto Page (4 hours)
1. Install React Leaflet dependencies
2. Create `RestaurantMap` component with interactivity
3. Replace hardcoded contact info with `useRestaurant()` data
4. Fix hardcoded colors with design tokens
5. Add form submission functionality

### Phase 3: Galería Page (3 hours)
1. Fix grid breakpoints to 2x2 → 4x4 → 4x4 pattern
2. Replace hardcoded images with `useMenuItems()` data
3. Integrate `useCategories()` for filtering
4. Complete redesign of "Encuéntranos en Calpe" component
5. Apply design token compliance

---

## 🔍 VALIDATION CRITERIA

### Database Connectivity:
- [ ] All pages use `useRestaurant()` hook instead of hardcode
- [ ] Gallery uses `useMenuItems()` for dynamic images
- [ ] Contact info matches DB exactly (especially hours)
- [ ] Rating displays consistently as 4.8 across all pages

### Responsive Design:
- [ ] Grid breakpoints follow 2x2 → 4x4 → 4x4 pattern
- [ ] Typography scales properly on mobile
- [ ] No horizontal scrolling on 375px (iPhone SE)
- [ ] Touch interactions work on map

### Design System:
- [ ] Zero hardcoded colors - all use design tokens
- [ ] Components use `bg-card`, `border-border`, `text-primary`
- [ ] Typography follows `enigma-hero-title`, `enigma-section-title` classes

### Performance:
- [ ] Map loads without blocking page render
- [ ] Images lazy load appropriately
- [ ] Hook data cached and doesn't refetch unnecessarily

---

## 🚨 GOTCHAS & EDGE CASES

### Database Connection:
- `useRestaurant()` hook has fallback data if API fails
- Hours format in DB is "Lun-Sab: 18:00 - 23:00" not "Mar-Dom: 18:00 - 24:00"
- Email in DB is `reservas@enigmaconalma.com` (verified correct)

### Leaflet Map Issues:
- Must import CSS: `import 'leaflet/dist/leaflet.css'`
- Default markers may not show - use custom marker icon
- Map container needs explicit height: `aspect-video` or `h-64`

### Responsive Breakpoints:
- Mobile: `grid-cols-2` (not 1, not 3)
- Tablet: `md:grid-cols-4` (optimal viewing)
- Desktop: `lg:grid-cols-4` (consistency)

### Next.js 15 + Turbopack:
- Client components need `'use client'` for map interactivity
- Dynamic imports may be needed for Leaflet to avoid SSR issues

---

## 📚 CROSS-REFERENCES

### Existing Infrastructure:
- `src/hooks/use-restaurant.ts` - Restaurant data hook
- `src/hooks/use-menu-items.ts` - Menu items with images
- `src/hooks/use-categories.ts` - Category organization
- `/api/restaurant` - Restaurant API endpoint
- `/api/menu/items` - Menu items API endpoint

### Design System:
- `src/app/globals.css` - Design tokens definitions
- `src/components/ui/` - Shadcn/UI components
- `.enigma-hero-title`, `.enigma-section-title` - Typography classes

### Database Schema:
- `restaurante.restaurants` - Main restaurant info
- `restaurante.business_hours` - Dynamic schedules
- `restaurante.menu_items` - Images for gallery
- `restaurante.legal_content` - Dynamic legal content

---

## 🎯 SUCCESS METRICS

### Before (Current State):
- ❌ 3 pages with 100% hardcoded content
- ❌ Placeholder map with no interactivity
- ❌ Grid breakpoints not following responsive best practices
- ❌ Multiple hardcoded colors breaking design system
- ❌ Inconsistent restaurant data across pages

### After (Target State):
- ✅ 3 pages using dynamic database content via existing hooks
- ✅ Interactive React Leaflet map with restaurant marker
- ✅ Responsive 2x2 → 4x4 → 4x4 grid patterns
- ✅ 100% design token compliance
- ✅ Consistent data source across all pages

---

## 💡 FUTURE ENHANCEMENTS

### Business Hours Integration:
- Use `business_hours` table for real-time open/closed status
- Dynamic "Abierto ahora" / "Cerrado" indicators
- Holiday hours and special schedules

### Legal Content Management:
- Dynamic privacy policy from `legal_content` table
- GDPR compliance with versioned content
- Multi-language support (es/en)

### Advanced Gallery Features:
- Image categories filtering with `useCategories()`
- Lightbox gallery with image zoom
- Wine pairing suggestions integration

---

**ULTRATHINK PROACTIVELY**: Este plan usa la infraestructura existente perfectamente funcional. El problema no es técnico - es que las páginas públicas ignoran los hooks que ya existen. La solución es integration, no reconstruction.