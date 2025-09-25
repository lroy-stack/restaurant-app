# HERO IMAGES ANALYSIS - DB DISCONNECTION ISSUE

> **PROBLEMA IDENTIFICADO**: Hero images en páginas públicas están hardcoded en lugar de usar media_library DB

## 🚨 ESTADO ACTUAL

### ✅ PÁGINA GALERÍA (CORRECTA - DB CONECTADA)
```tsx
// /galeria/page.tsx - LÍNEAS 22-25, 94-96
const { getHeroImage, buildImageUrl } = useMediaLibrary({ type: 'gallery' })
const heroImage = getHeroImage('galeria')

backgroundImage: heroImage
  ? `url(${buildImageUrl(heroImage)})`
  : 'url(fallback)'
```
**FUNCIONA CORRECTAMENTE**: Lee de `media_library.hero_galeria`

### ❌ PÁGINAS HARDCODED (INCORRECTAS)

**1. Homepage (page.tsx):**
```tsx
// HARDCODED:
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1758114245475)'

// DB TIENE:
hero_home: https://ik.imagekit.io/insomnialz/enigma-dark.png
```

**2. Contacto:**
```tsx
// HARDCODED:
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/_DSC1121.jpg?updatedAt=1754863669504&tr=...)'

// DB TIENE:
hero_contacto: https://ik.imagekit.io/insomnialz/calpe.jpg?updatedAt=1758715973173
```
**PROBLEMA**: Imagen completamente diferente!

**3. Menu:**
```tsx
// HARDCODED:
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/IMG_9755.HEIC?updatedAt=1754141888431&tr=...)'

// DB TIENE:
hero_menu: https://ik.imagekit.io/insomnialz/IMG_9755.HEIC
```
**PROBLEMA**: Misma imagen base pero transformaciones hardcoded

**4. Historia:**
```tsx
// HARDCODED:
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/_DSC0559.jpg?tr=...)'

// DB TIENE:
hero_historia: https://ik.imagekit.io/insomnialz/_DSC0559.jpg
```
**PROBLEMA**: Misma imagen pero transformaciones hardcoded

## 📊 BASE DE DATOS VERIFIED

```sql
-- VERIFICADO VIA SSH:
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c '...'"

SELECT id, name, url, category, type, is_active FROM restaurante.media_library WHERE type = 'hero';

RESULTADOS:
hero_contacto | https://ik.imagekit.io/insomnialz/calpe.jpg?updatedAt=1758715973173    | ✅ ACTIVE
hero_galeria  | https://ik.imagekit.io/insomnialz/especial.JPG?updatedAt=1744993021918 | ✅ ACTIVE
hero_historia | https://ik.imagekit.io/insomnialz/_DSC0559.jpg                         | ✅ ACTIVE
hero_home     | https://ik.imagekit.io/insomnialz/enigma-dark.png                      | ✅ ACTIVE
hero_home     | https://ik.imagekit.io/insomnialz/compressed/enigma_night.png          | ✅ ACTIVE (Alternative)
hero_menu     | https://ik.imagekit.io/insomnialz/IMG_9755.HEIC                        | ✅ ACTIVE
hero_reservas | https://ik.imagekit.io/insomnialz/cafe-leche.jpg                       | ✅ ACTIVE
```

## 🏗️ INFRAESTRUCTURA EXISTENTE

### ✅ HOOK FUNCIONAL: `useMediaLibrary`
```typescript
// FUNCIONES DISPONIBLES:
getHeroImage(page: string): MediaItem | null
buildImageUrl(item: MediaItem): string  // Aplica transformations automáticamente
```

### ✅ API ENDPOINT: `/api/media-library`
- Endpoint funcional que lee de `restaurante.media_library`
- Filtra por type, category, is_active
- Aplica image_kit_transforms automáticamente

### ✅ TYPES & INTERFACES COMPLETAS
```typescript
interface MediaItem {
  category: 'hero_home' | 'hero_historia' | 'hero_menu' | 'hero_galeria' | 'hero_contacto' | 'hero_reservas' | ...
  url: string
  image_kit_transforms?: string  // Transformaciones automáticas
  is_active: boolean
}
```

## 🎯 SOLUCIÓN REQUERIDA

### IMPLEMENTAR useMediaLibrary EN TODAS LAS PÁGINAS

**PATRÓN CORRECTO (de galeria/page.tsx):**
```tsx
// 1. Import hook
import { useMediaLibrary } from '@/hooks/use-media-library'

// 2. Use hook
const { getHeroImage, buildImageUrl, loading } = useMediaLibrary({ type: 'hero' })

// 3. Get specific hero
const heroImage = getHeroImage('home')  // 'contacto', 'menu', 'historia'

// 4. Apply in JSX
backgroundImage: heroImage
  ? `url(${buildImageUrl(heroImage)})`
  : 'url(fallback-image)'

// 5. Handle loading state
if (loading) return <LoadingSpinner />
```

## 📋 PÁGINAS A CORREGIR

### 1. **src/app/(public)/page.tsx** (Homepage)
```tsx
- const heroImage = getHeroImage('home')  // hero_home from DB
```

### 2. **src/app/(public)/contacto/page.tsx**
```tsx
- const heroImage = getHeroImage('contacto')  // hero_contacto from DB
```

### 3. **src/app/(public)/menu/page.tsx**
```tsx
- const heroImage = getHeroImage('menu')  // hero_menu from DB
```

### 4. **src/app/(public)/historia/page.tsx**
```tsx
- const heroImage = getHeroImage('historia')  // hero_historia from DB
```

### 5. **Reservas page** (si existe)
```tsx
- const heroImage = getHeroImage('reservas')  // hero_reservas from DB
```

## 💡 BENEFICIOS ESPERADOS

### ✅ DESPUÉS DE LA IMPLEMENTACIÓN:
1. **Centralización**: Todas las hero images desde DB
2. **Consistencia**: Transformaciones ImageKit automáticas
3. **Flexibilidad**: Admin puede cambiar imágenes sin deployments
4. **Performance**: image_kit_transforms aplicadas correctamente
5. **Fallbacks**: Sistema robusto con imágenes de respaldo

### ✅ ADMIN EXPERIENCE:
- Cambiar hero image contacto → Se refleja inmediatamente
- Aplicar transformaciones → Automático vía buildImageUrl()
- A/B testing de imágenes → Cambiar display_order en DB

## 🔧 IMPLEMENTACIÓN PLAN

### PHASE 1: Immediate Fix (High Priority)
1. ✅ Add `useMediaLibrary` to page.tsx (Homepage)
2. ✅ Add `useMediaLibrary` to contacto/page.tsx
3. ✅ Add `useMediaLibrary` to menu/page.tsx
4. ✅ Add `useMediaLibrary` to historia/page.tsx

### PHASE 2: Validation (Medium Priority)
1. ✅ Test all pages load hero images correctly
2. ✅ Verify transformations apply automatically
3. ✅ Check loading states work properly
4. ✅ Test fallback images when DB empty

### PHASE 3: Enhancement (Low Priority)
1. ✅ Add error boundaries for failed image loads
2. ✅ Implement preload for better performance
3. ✅ Add responsive image variations via transforms

## 🎯 SUCCESS METRICS

### Before (Current State):
- ❌ 1/5 pages using DB (galeria only)
- ❌ Inconsistent image transformations
- ❌ Hardcoded URLs requiring deployments to change
- ❌ Different images than what's configured in DB

### After (Target State):
- ✅ 5/5 pages using DB for hero images
- ✅ Consistent ImageKit transformations
- ✅ Dynamic images changeable via admin
- ✅ Single source of truth: media_library table

---

**CONCLUSIÓN**: La infraestructura existe y funciona (galería es prueba). Solo necesitamos replicar el patrón correcto a las 4 páginas restantes.

---

*Analysis Date: 2025-09-25*
*Based on: SSH DB Verification + Code Analysis*
*Status: Ready for Implementation*