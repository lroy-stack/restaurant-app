# Guía: Configurar Google Analytics GA4 y Limpiar Datos Antiguos

## 🎯 Objetivo

1. ✅ Instalar Google Analytics GA4 en la nueva web Next.js
2. 🗑️ Excluir datos antiguos de páginas obsoletas
3. 📊 Configurar tracking limpio para nuevas páginas

---

## ⚠️ **IMPORTANTE: Datos Antiguos NO se Eliminan**

Google Analytics **NO permite eliminar datos históricos**. Los datos de `/pages/desserts.html` y otras páginas antiguas permanecerán en el historial.

**Pero SÍ puedes:**
- ✅ Configurar filtros para datos futuros
- ✅ Crear segmentos/audiencias que excluyan páginas antiguas
- ✅ Marcar con anotaciones el cambio de web
- ✅ Instalar tracking correcto en la nueva web

---

## PASO 1: Obtener Measurement ID de GA4

### En el Panel de Google Analytics:

1. **Ve a Admin** (⚙️ icono abajo a la izquierda)
2. **Columna "Propiedad"** → Clic en **Data Streams**
3. **Clic en tu stream web** (probablemente "enigmaconalma.com")
4. **Copia el Measurement ID** (formato: `G-XXXXXXXXXX`)

**Captura de ejemplo:**
```
📱 Stream Name: enigmaconalma.com
🆔 Measurement ID: G-ABC1234567
🌐 Stream URL: https://enigmaconalma.com
```

---

## PASO 2: Agregar Measurement ID a .env.local

### Editar archivo `.env.local`:

**Ya agregado automáticamente. Solo completa el ID:**

```bash
# Google Analytics GA4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TU_ID_AQUI
```

**Ejemplo:**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC1234567
```

---

## PASO 3: Configurar Filtros en Google Analytics

### A. Crear Anotación del Cambio

1. **Ve a Reports** → **Overview**
2. **Clic en "Customization"** → **Annotations**
3. **Clic "Create Annotation"**:
   ```
   Fecha: 2025-10-12
   Título: Migración a Nueva Web Next.js
   Descripción: URLs antiguas (/pages/*.html) deshabilitadas.
   Nueva estructura: /menu, /reservas, /historia, /contacto, /galeria
   ```

### B. Crear Exploración que Excluya Páginas Antiguas

1. **Ve a Explore** (lado izquierdo)
2. **Clic "Blank"** para crear exploración nueva
3. **Nombre:** "Datos Web Nueva (sin páginas antiguas)"
4. **En "Filters"** → **Add filter:**
   ```
   Dimensión: Page path
   Condición: does not contain
   Valor: /pages/
   ```
5. **Agregar otro filtro:**
   ```
   Dimensión: Page path
   Condición: does not match regex
   Valor: .*\.html$
   ```
6. **Save** y úsala como tu exploración principal

### C. Crear Audiencia "Usuarios Nueva Web"

1. **Ve a Admin** → **Propiedad** → **Audiences**
2. **Clic "New audience"**
3. **Nombre:** "Usuarios Nueva Web (sin páginas antiguas)"
4. **Conditions:**
   ```
   Include users when:
   - Page path does not contain "/pages/"
   - Page path does not end with ".html"
   ```
5. **Create**

---

## PASO 4: Configurar Data Stream Correctamente

### En el Panel de Analytics:

1. **Admin** → **Data Streams** → **Tu stream**
2. **Enhanced measurement** (debe estar ON):
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Form interactions
   - ✅ Video engagement

3. **Configure tagging settings** → **Show all**:
   - ✅ **List unwanted referrals:** Agrega `enigmaconalma.com` (para evitar self-referral)

4. **Data Filters** (CRÍTICO):
   - Clic **Create filter**
   - **Nombre:** "Excluir páginas antiguas HTML"
   - **Filter Type:** "Exclude"
   - **Condición:**
     ```
     Parameter: page_location
     Match type: contains
     Value: /pages/
     ```
   - **Create**

5. **Crear segundo filtro:**
   - **Nombre:** "Excluir URLs .html antiguas"
   - **Filter Type:** "Exclude"
   - **Condición:**
     ```
     Parameter: page_location
     Match type: matches regex
     Value: .*\.html$
     ```

**IMPORTANTE:** Estos filtros solo aplican a **datos futuros**, no afectan datos históricos.

---

## PASO 5: Verificar que el Measurement ID Funciona

### Después de hacer commit y deploy:

1. **Visita:** https://enigmaconalma.com
2. **Abre DevTools** (F12) → **Console**
3. **Escribe:**
   ```javascript
   window.gtag
   ```
4. **Debe retornar:** `function gtag() { ... }`

### En Google Analytics Real-Time:

1. **Ve a Reports** → **Realtime**
2. **Abre tu web en otra pestaña**
3. **Debes ver tu visita en tiempo real**

---

## PASO 6: Commit y Deploy

**Ya tienes los archivos listos:**
- ✅ `src/components/analytics/GoogleAnalytics.tsx`
- ✅ `.env.local` con `NEXT_PUBLIC_GA_MEASUREMENT_ID=`
- ✅ `src/app/layout.tsx` importando GoogleAnalytics

**Pasos:**

1. **Agregar tu Measurement ID en `.env.local`:**
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TU_ID_AQUI
   ```

2. **Commit y push:**
   ```bash
   git add .
   git commit -m "feat: Add Google Analytics GA4 tracking"
   git push origin main
   ```

3. **Vercel autodeploy** en 2-3 minutos

---

## 📊 Resumen: Qué Va a Pasar

### **Datos Antiguos (Históricos):**
- ❌ **NO se pueden eliminar** (Google no lo permite)
- ✅ Quedan en el historial pero puedes filtrarlos con exploraciones
- ✅ Anotaciones marcan el cambio de web

### **Datos Nuevos (Desde hoy):**
- ✅ Solo páginas válidas: `/menu`, `/reservas`, `/historia`, `/contacto`, `/galeria`
- ✅ Filtros excluyen `/pages/` y `*.html`
- ✅ Audiencias solo con usuarios de nueva web
- ✅ Performance metrics enviados a GA4 via gtag

---

## 🔍 Verificación Post-Deploy

### 1. **Verificar script en producción:**
```bash
curl -s https://enigmaconalma.com | grep "googletagmanager"
# Debe mostrar: <script src="https://www.googletagmanager.com/gtag/js?id=G-..."
```

### 2. **Verificar en Browser:**
- Abre DevTools → Network
- Filtra por "collect?v=2"
- Debe haber requests a `https://www.google-analytics.com/g/collect?v=2&...`

### 3. **Verificar en GA4 Real-Time:**
- Ve a **Reports** → **Realtime**
- Visita tu web
- Debes ver la visita en tiempo real con:
  - ✅ Page path correcto (`/menu`, no `/pages/menu.html`)
  - ✅ User engagement events
  - ✅ Page views

---

## ⚙️ Configuraciones Avanzadas (Opcional)

### A. Event Tracking Personalizado

El código ya envía **Core Web Vitals** automáticamente vía `use-performance-monitor.tsx`:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

### B. Conversion Events

Configura conversiones en GA4:

1. **Admin** → **Events** → **Create event**
2. **Eventos recomendados:**
   ```
   - reservation_completed (cuando completan reserva)
   - menu_item_added_to_cart (cuando agregan plato al carrito)
   - reservation_form_started (cuando abren formulario reserva)
   ```

3. **Marca como conversión:**
   - **Admin** → **Events**
   - Toggle **"Mark as conversion"** en cada evento

---

## 🚨 Troubleshooting

### **Problema 1: No veo datos en Real-Time**
**Solución:**
```bash
# Verifica que el Measurement ID está en .env.local
cat .env.local | grep GA_MEASUREMENT_ID

# Verifica que Vercel lo tiene en Variables de Entorno
# Vercel Dashboard → Settings → Environment Variables
```

### **Problema 2: Sigo viendo URLs antiguas en Analytics**
**Solución:**
- Datos históricos permanecen (no se pueden eliminar)
- Usa **Exploraciones con filtros** para excluirlas
- Los filtros de Data Stream solo aplican a datos futuros

### **Problema 3: "gtag is not defined"**
**Solución:**
```typescript
// El componente GoogleAnalytics usa strategy="afterInteractive"
// Espera a que window.dataLayer esté disponible
// Si usas gtag manualmente, verifica:
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'custom_event', { ... })
}
```

---

## 📖 Recursos Útiles

- **GA4 Dimensions & Metrics:** https://developers.google.com/analytics/devguides/collection/ga4/reference/dimensions
- **Next.js + GA4 Best Practices:** https://nextjs.org/docs/app/building-your-application/optimizing/analytics
- **Core Web Vitals:** https://web.dev/vitals/

---

**Fecha:** 2025-10-12
**Estado:** ✅ Listo para agregar Measurement ID y deploy
**Próximo paso:** Copiar tu Measurement ID de GA4 y agregarlo a `.env.local`
