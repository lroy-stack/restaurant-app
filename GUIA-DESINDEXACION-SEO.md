# Guía de Desindexación de Páginas Antiguas + SEO Mejorado

## 🎯 Problema Resuelto

**URLs antiguas indexadas en Google/ChatGPT que no existen:**
- `https://enigmaconalma.com/pages/desserts.html`
- Otras páginas HTML antiguas de Hostinger

**Solución implementada:**
1. ✅ Middleware Next.js para retornar **410 Gone** (desindexación permanente)
2. ✅ .htaccess para Hostinger (backup si todavía está activo)
3. ✅ Metadata individual optimizada por página
4. ✅ Corrección de metadata raíz con información REAL

---

## 📋 Archivos Creados/Modificados

### 1. **src/middleware.ts** (NUEVO)
**Función:** Intercepta URLs antiguas y retorna 410 Gone o 301 redirects.

**Páginas que retornan 410 Gone (no existen más):**
```
/pages/desserts.html
/pages/drinks.html
/pages/menu.html
/pages/wine.html
/pages/about.html
/pages/contact.html
```

**Redirects 301 (URLs que cambiaron):**
```
/menu.html → /menu
/contacto.html → /contacto
/historia.html → /historia
/galeria.html → /galeria
/reservas.html → /reservas
```

**HTTP 410 Gone = Desindexación permanente:**
- Google/ChatGPT eliminarán estas páginas del índice
- Más efectivo que 404 Not Found
- Incluye meta robots: `noindex, nofollow`

---

### 2. **public/.htaccess** (NUEVO - Backup Hostinger)
**Función:** Si Hostinger todavía está activo, este archivo maneja las mismas reglas.

**Uso:**
- Solo aplica si DNS todavía apunta a Hostinger
- Backup para transición durante cambio DNS a Vercel

---

### 3. **Metadata Individual por Página** (5 layouts nuevos)

#### ✅ `/menu/layout.tsx`
```typescript
title: 'Menú - Restaurante Enigma Calpe | Cocina Mediterránea de Autor'
description: 'Carta mediterránea: Especiales, croquetas, pulpo, pescados frescos...'
keywords: 'menú enigma calpe, pulpo calpe, pescado fresco, vinos calpe...'
```

#### ✅ `/reservas/layout.tsx`
```typescript
title: 'Reservas Online - Enigma Calpe | Mesa Garantizada'
description: 'Sistema de pre-pedidos, gestión por email, disponibilidad 24/7...'
keywords: 'reservar mesa enigma calpe, pre-pedidos, mesa garantizada...'
```

#### ✅ `/historia/layout.tsx`
```typescript
title: 'Nuestra Historia - Enigma Calpe | Fundado 2023'
description: 'Fundado en 2023 en el casco antiguo. Tradición mediterránea...'
keywords: 'historia enigma, restaurante 2023 calpe, tradición mediterránea...'
```

#### ✅ `/contacto/layout.tsx`
```typescript
title: 'Contacto - Enigma Calpe | +34 672 79 60 06'
description: 'Teléfono, email, dirección Carrer Justicia 6A, horarios...'
keywords: 'contacto enigma, teléfono restaurante calpe...'
```

#### ✅ `/galeria/layout.tsx`
```typescript
title: 'Galería - Enigma Calpe | Fotos y Ambiente'
description: 'Fotos de platos mediterráneos, ambiente casco antiguo...'
keywords: 'fotos enigma calpe, galería restaurante...'
```

---

### 4. **src/app/layout.tsx** (CORREGIDO)

**Antes (inventado):**
```
"Fusionamos tradición atlántica y mediterránea..."
```

**Ahora (REAL):**
```typescript
description: "Cocina mediterránea de autor en el casco antiguo de Calpe desde 2023.
Ingredientes de proximidad, producto de temporada. Pre-pedidos disponibles."

keywords: "restaurante Calpe, casco antiguo, cocina mediterránea de autor,
restaurante 2023, ingredientes proximidad, pre-pedidos, Carrer Justicia"
```

---

## 🚀 Cómo Funciona la Desindexación

### 1. **410 Gone vs 404 Not Found**

| Status | Significado | Indexación |
|--------|-------------|------------|
| **410 Gone** | Página eliminada PERMANENTEMENTE | Google desindexará en días |
| 404 Not Found | Página no encontrada (temporal) | Google mantiene por semanas |

**Nuestro middleware retorna 410 Gone + meta robots noindex:**
```html
HTTP/1.1 410 Gone
X-Robots-Tag: noindex, nofollow

<meta name="robots" content="noindex, nofollow">
```

---

### 2. **Proceso de Desindexación en Google**

**Timeline esperado:**
1. **Día 1-2:** Google recrawlea URLs antiguas
2. **Día 3-7:** Detecta 410 Gone + noindex
3. **Día 7-14:** Elimina de índice permanentemente
4. **ChatGPT/Claude:** Se actualizan cuando refresquen su índice (variable)

---

## ✅ Pasos Siguientes

### 1. **Deploy a Vercel (después de commit)**
```bash
git push origin main  # Vercel autodeploy
```

### 2. **Verificar 410 Gone funciona**
```bash
curl -I https://enigmaconalma.com/pages/desserts.html
# Debe retornar: HTTP/2 410
```

### 3. **Google Search Console - Solicitar Eliminación Manual**

**Acciones en Search Console:**
1. Ve a **Eliminaciones** → **Nueva solicitud**
2. Introduce URLs antiguas:
   ```
   https://enigmaconalma.com/pages/desserts.html
   https://enigmaconalma.com/pages/drinks.html
   https://enigmaconalma.com/pages/menu.html
   ```
3. Selecciona: **Eliminar esta URL temporalmente**
4. Google las eliminará en 24-48h

**IMPORTANTE:** 410 Gone las eliminará permanentemente, pero esto acelera el proceso.

---

### 4. **ChatGPT/Claude - Forzar Reindexación**

**No hay botón directo, pero:**
1. ✅ Ya agregamos `llms.txt` y `llms-full.txt` con info correcta
2. ✅ `robots.txt` ahora permite ChatGPT/Claude (GPTBot, Claude-Web)
3. ⏳ Esperan su próximo crawl (puede tardar semanas)

**Alternativa:** Reportar directamente a OpenAI/Anthropic si persiste.

---

### 5. **Hostinger - Eliminar Archivos Antiguos (Opcional)**

Si todavía tienes acceso FTP a Hostinger:
```bash
# Conectar via FTP
# Eliminar directorio /pages/
# Eliminar archivos .html antiguos
```

**Si DNS ya apunta a Vercel:** Hostinger no afecta, middleware maneja todo.

---

## 📊 Mejoras SEO Implementadas

### ✅ **Metadata Individual por Página**
- Cada página tiene title/description/keywords únicos
- Open Graph optimizado para redes sociales
- Twitter Cards configuradas
- Canonical URLs para evitar contenido duplicado

### ✅ **Keywords Estratégicos**
- **Menu:** pulpo calpe, pescado fresco, vinos calpe, carta alérgenos
- **Reservas:** pre-pedidos, mesa garantizada, reserva online
- **Historia:** restaurante 2023, tradición mediterránea, fundado 2023
- **Contacto:** Carrer Justicia, teléfono restaurante calpe, horarios
- **Galería:** fotos enigma, ambiente casco antiguo

### ✅ **Correcciones Información Real**
- ❌ **Eliminado:** "fusión atlántica", arroces, información inventada
- ✅ **Agregado:** Fundado 2023, ingredientes proximidad, pre-pedidos disponibles, producto temporada

---

## 🎯 Resultados Esperados

### **Google Search (7-14 días):**
- ✅ Páginas antiguas desaparecen del índice
- ✅ Páginas nuevas indexadas con metadata correcta
- ✅ Mejora ranking con keywords específicos
- ✅ Rich snippets con Open Graph

### **ChatGPT/Claude (variable):**
- ✅ Acceden a `llms.txt` con info REAL
- ✅ No más referencias a páginas antiguas
- ✅ Datos actualizados: 2023, mediterráneo, pre-pedidos, NO arroces

---

## 🔍 Verificación Post-Deploy

### 1. **Verificar middleware funciona:**
```bash
# Debe retornar 410 Gone
curl -I https://enigmaconalma.com/pages/desserts.html

# Debe retornar 301 → /menu
curl -I https://enigmaconalma.com/menu.html
```

### 2. **Verificar metadata en páginas:**
```bash
# Ver metadata de /menu
curl -s https://enigmaconalma.com/menu | grep -A 5 "<title>"
```

### 3. **Google Search Console:**
- Sube sitemap.xml actualizado
- Solicita reindexación de páginas principales
- Marca URLs antiguas para eliminación

---

## 📝 Resumen de Cambios

| Archivo | Acción | Propósito |
|---------|--------|-----------|
| `src/middleware.ts` | ✅ NUEVO | 410 Gone para URLs antiguas |
| `public/.htaccess` | ✅ NUEVO | Backup Hostinger |
| `src/app/layout.tsx` | ✏️ EDITADO | Corregir metadata root (sin inventos) |
| `src/app/(public)/menu/layout.tsx` | ✅ NUEVO | Metadata individual menú |
| `src/app/(public)/reservas/layout.tsx` | ✅ NUEVO | Metadata individual reservas |
| `src/app/(public)/historia/layout.tsx` | ✅ NUEVO | Metadata individual historia |
| `src/app/(public)/contacto/layout.tsx` | ✅ NUEVO | Metadata individual contacto |
| `src/app/(public)/galeria/layout.tsx` | ✅ NUEVO | Metadata individual galería |

---

## ⚠️ IMPORTANTE: No Olvides

1. ✅ **Commit y push** estos cambios a main
2. ✅ **Vercel autodeploy** aplicará cambios en 2-3 min
3. ✅ **Google Search Console** - solicitar eliminación manual de URLs antiguas
4. ⏳ **Esperar 7-14 días** para desindexación completa
5. 📊 **Monitorear** Google Analytics para ver mejoras en tráfico orgánico

---

**Fecha:** 2025-10-12
**Versión:** 1.0
**Estado:** ✅ Listo para commit y deploy
