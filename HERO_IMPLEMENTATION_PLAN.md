# HERO IMAGES - IMPLEMENTATION PLAN

> **SOLUCIÓN CONCRETA**: Conectar todas las páginas públicas a media_library DB usando patrón de galeria/page.tsx

## 🎯 IMPLEMENTACIÓN INMEDIATA

### PATRÓN CORRECTO (DE GALERÍA - FUNCIONAL)
```tsx
import { useMediaLibrary } from '@/hooks/use-media-library'

export default function PageComponent() {
  const { getHeroImage, buildImageUrl, loading } = useMediaLibrary({ type: 'hero' })
  const heroImage = getHeroImage('pagename') // 'home', 'contacto', 'menu', 'historia'

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <section className="relative h-[109vh] flex items-center justify-center overflow-hidden -mt-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div
          className="w-full h-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: heroImage
              ? `url(${buildImageUrl(heroImage)})`
              : 'url(fallback-image)',
            backgroundPosition: '65% center',
            backgroundAttachment: 'scroll'
          }}
        />
      </div>
      {/* Rest of component */}
    </section>
  )
}
```

## 📋 PÁGINAS A MODIFICAR

### 1. **Homepage** - `src/app/(public)/page.tsx`

**CAMBIAR DE:**
```tsx
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1758114245475)',
```

**A:**
```tsx
import { useMediaLibrary } from '@/hooks/use-media-library'

export default function HomePage() {
  const { getHeroImage, buildImageUrl, loading } = useMediaLibrary({ type: 'hero' })
  const heroImage = getHeroImage('home')

  // ... resto del componente con hero image dinámico
}
```

### 2. **Contacto** - `src/app/(public)/contacto/page.tsx`

**CAMBIAR DE:**
```tsx
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/_DSC1121.jpg?updatedAt=1754863669504&tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)'
```

**A:**
```tsx
const heroImage = getHeroImage('contacto') // Usará calpe.jpg de DB en lugar de _DSC1121.jpg
```

### 3. **Menu** - `src/app/(public)/menu/page.tsx`

**CAMBIAR DE:**
```tsx
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/IMG_9755.HEIC?updatedAt=1754141888431&tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)'
```

**A:**
```tsx
const heroImage = getHeroImage('menu') // Misma imagen pero transformaciones de DB
```

### 4. **Historia** - `src/app/(public)/historia/page.tsx`

**CAMBIAR DE:**
```tsx
backgroundImage: 'url(https://ik.imagekit.io/insomnialz/_DSC0559.jpg?tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)'
```

**A:**
```tsx
const heroImage = getHeroImage('historia') // Misma imagen pero transformaciones de DB
```

## 🎨 TRANSFORMACIONES IMAGEKIT AUTOMÁTICAS

### ✅ BENEFICIO: `buildImageUrl()` aplica automáticamente
```typescript
// Hook buildImageUrl function:
const buildImageUrl = (item: MediaItem): string => {
  if (!item.image_kit_transforms) return item.url

  const separator = item.url.includes('?') ? '&' : '?'
  return `${item.url}${separator}${item.image_kit_transforms}`
}

// Si media_library.image_kit_transforms = "tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true"
// Resultado: https://ik.imagekit.io/insomnialz/imagen.jpg?tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true
```

### ✅ DB MANAGEMENT: Admin puede actualizar transformaciones
```sql
UPDATE restaurante.media_library
SET image_kit_transforms = 'tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true'
WHERE category = 'hero_contacto';
```

## 🔧 IMPLEMENTACIÓN STEPS

### STEP 1: Verificar API funcional
```bash
# Verificar endpoint funciona:
curl "http://localhost:3000/api/media-library?type=hero" | jq
```

### STEP 2: Implementar por página
1. **Homepage** (hero_home)
2. **Contacto** (hero_contacto) - cambiará imagen actual
3. **Menu** (hero_menu) - mantendrá imagen actual
4. **Historia** (hero_historia) - mantendrá imagen actual

### STEP 3: Testing
- Verificar todas las imágenes cargan correctamente
- Confirmar transformaciones se aplican
- Test loading states funcionan

## 🎯 RESULTADOS ESPERADOS

### ANTES (HARDCODED):
- Homepage: enigma-dark.png ✅ (coincide con DB)
- Contacto: _DSC1121.jpg ❌ (no coincide - DB tiene calpe.jpg)
- Menu: IMG_9755.HEIC ✅ (coincide con DB)
- Historia: _DSC0559.jpg ✅ (coincide con DB)

### DESPUÉS (DB DINÁMICO):
- Homepage: hero_home desde DB ✅
- Contacto: hero_contacto desde DB ✅ (cambiará a calpe.jpg)
- Menu: hero_menu desde DB ✅
- Historia: hero_historia desde DB ✅
- **BONUS**: Admin puede cambiar cualquier imagen sin deployment

## 📊 DB REFERENCE

```sql
-- IMÁGENES HERO DISPONIBLES (VERIFICADO VIA SSH):
SELECT category, name, url FROM restaurante.media_library WHERE type = 'hero' AND is_active = true;

hero_home     | Enigma Dark Hero  | https://ik.imagekit.io/insomnialz/enigma-dark.png
hero_home     | Enigma Night Hero | https://ik.imagekit.io/insomnialz/compressed/enigma_night.png
hero_contacto | Contacto Hero     | https://ik.imagekit.io/insomnialz/calpe.jpg?updatedAt=1758715973173
hero_galeria  | Galería Hero      | https://ik.imagekit.io/insomnialz/especial.JPG?updatedAt=1744993021918
hero_historia | Historia Hero     | https://ik.imagekit.io/insomnialz/_DSC0559.jpg
hero_menu     | Menu Hero         | https://ik.imagekit.io/insomnialz/IMG_9755.HEIC
hero_reservas | Reservas Hero     | https://ik.imagekit.io/insomnialz/cafe-leche.jpg
```

## 💡 MULTIPLE HERO SUPPORT

**NOTA**: hero_home tiene 2 imágenes. `getHeroImage()` usa `display_order` para prioridad.

```sql
-- Para A/B testing o rotación de imágenes:
UPDATE restaurante.media_library
SET display_order = 1
WHERE id = 'f4f2b2c8-c4c8-4708-86ed-6bd940c68ae7'; -- Enigma Dark Hero

UPDATE restaurante.media_library
SET display_order = 2
WHERE id = 'e0e72092-abe3-4326-9a9c-c77e40eafcf4'; -- Enigma Night Hero
```

---

**IMPLEMENTACIÓN READY**: Infraestructura existe, patrón probado en galería, solo replicar en 4 páginas restantes.

*Implementation Plan: 2025-09-25*
*Based on: Working galeria/page.tsx pattern*