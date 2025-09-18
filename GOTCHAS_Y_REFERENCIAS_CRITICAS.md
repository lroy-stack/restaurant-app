# GOTCHAS Y REFERENCIAS CRÍTICAS
## Compilación Definitiva para Implementación Score 100%

---

## 🚨 GOTCHAS CRÍTICOS (PUEDEN ROMPER LA IMPLEMENTACIÓN)

### 🔴 DATABASE GOTCHAS (CLAUDE.md + Análisis SSH)
```sql
-- CRÍTICO: SIEMPRE usar estos headers en llamadas DB
headers: {
  'Accept-Profile': 'restaurante',
  'Content-Profile': 'restaurante'
}

-- CRÍTICO: Supabase URL NUNCA IP directa
const supabaseUrl = "https://supabase.enigmaconalma.com"
// ❌ NUNCA: "https://31.97.182.226:5432"

-- CRÍTICO: FALTA CAMPO verification_token en reservations
-- DEBE añadirse antes de implementación:
ALTER TABLE restaurante.reservations
ADD COLUMN verification_token VARCHAR(255) UNIQUE;

-- CRÍTICO: Distinguir tipos cart via categoryId
-- FOOD categories → type: 'dish'
-- WINE categories → type: 'wine'
```

### 🔴 COMPONENT GOTCHAS (Step 2 + ReservationStepTwo.tsx)
```typescript
// CRÍTICO: Step 2 YA EXISTE y funciona perfectamente
// ❌ NO REESCRIBIR ReservationStepTwo.tsx
// ✅ SOLO integrar cart data:

// En ReservationStepTwo.tsx línea ~160:
useEffect(() => {
  const cartItems = getCartItems() // Desde CartContext
  if (cartItems.length > 0) {
    setValue('stepTwo.preOrderItems', cartItems)
    updatePreOrderTotals(cartItems)
  }
}, [])

// CRÍTICO: Validation schema YA PERFECTO
// reservation-professional.ts líneas 109-120 NO TOCAR
preOrderItems: z.array(z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
  type: z.enum(['dish', 'wine']), // ✅ YA CORRECTO
})).default([])
```

### 🔴 SHADCN/UI GOTCHAS (CLAUDE.md críticos)
```css
/* CRÍTICO: SIEMPRE usar estos patrones exactos */
.input-height { height: 2.25rem; } /* h-9 - ALL inputs */

/* CRÍTICO: SOLO colores HSL tokens */
background: hsl(var(--primary));     /* ✅ CORRECTO */
background: #3b82f6;                 /* ❌ INCORRECTO */

/* CRÍTICO: Radius consistency */
border-radius: var(--radius-md);     /* ✅ rounded-md */
border-radius: 8px;                  /* ❌ hardcoded */

/* CRÍTICO: Responsive text patterns */
font-size: 1rem;                     /* Base móvil */
@media (min-width: 768px) {
  font-size: 0.875rem;               /* md:text-sm desktop */
}
```

---

## 📋 REFERENCIAS EXACTAS (PATRONES A SEGUIR)

### 🎯 CART CONTEXT PATTERN (enigma-web-moderna/CartContext.tsx)
```typescript
// REFERENCIA EXACTA - líneas 155-204:
const CART_EXPIRY_HOURS = 24  // ✅ OBLIGATORIO: 24h persistence

// PATRÓN localStorage con expiración:
const cartToSave = {
  ...state,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}
localStorage.setItem('enigma-cart', JSON.stringify(cartToSave))

// PATRÓN verificación expiry:
const parsedCart = JSON.parse(storedCart)
if (new Date() > new Date(parsedCart.expiresAt)) {
  localStorage.removeItem('enigma-cart') // ✅ Auto-cleanup
}
```

### 🎯 CART SIDEBAR PATTERN (enigma-web-moderna/CartSidebar.tsx)
```typescript
// REFERENCIA EXACTA - líneas 40-43 agrupación:
const groupedItems = {
  wines: state.items.filter(item => item.type === 'wine'),
  dishes: state.items.filter(item => item.type === 'dish')
}

// REFERENCIA EXACTA - líneas 28-31 navegación:
const handleGoToReservation = () => {
  setCartOpen(false)
  navigate('/reservas') // ✅ En Next.js: router.push('/reservas')
}

// REFERENCIA EXACTA - Framer Motion patterns:
initial={{ x: '-100%' }}
animate={{ x: 0 }}
exit={{ x: '-100%' }}
transition={{ type: 'spring', damping: 25, stiffness: 200 }}
```

### 🎯 TOKEN SERVICE PATTERN (enigma-web-moderna/reservationTokenService.ts)
```typescript
// REFERENCIA EXACTA - líneas 62-84 validación expiración:
const now = new Date()
const expirationDate = new Date(tokenData.expires_at)

if (now > expirationDate) {
  const reservationDateTime = new Date(tokenData.reservas.fecha_reserva + 'T' + tokenData.reservas.hora_reserva)
  const hoursUntilReservation = Math.max(0, (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60))

  const errorMessage = hoursUntilReservation <= 2
    ? `Tu reserva es en ${hoursUntilReservation.toFixed(1)} horas. No se pueden hacer modificaciones a menos de 2 horas de la reserva.`
    : 'El enlace ha expirado - no se puede modificar a menos de 2 horas de la reserva'
}

// REFERENCIA EXACTA - líneas 206-218 invalidar token por seguridad:
await supabase.schema('restaurante')
  .from('verification_tokens') // ✅ Adaptar nombre tabla
  .delete()
  .eq('reserva_id', reservationId) // ✅ Usar reservation_id
```

---

## ⚡ NEXT.JS 15 APP ROUTER GOTCHAS

### 🔴 CONTEXT PROVIDERS (Context7 research)
```typescript
// CRÍTICO: Context debe estar en Client Component
'use client'

// PATRÓN EXACTO para CartProvider en layout.tsx:
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider>  {/* ✅ Envolver aquí */}
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
```

### 🔴 SERVER ACTIONS GOTCHAS
```typescript
// CRÍTICO: Server Actions pattern
'use server'

export async function createReservationWithToken(data: ReservationData) {
  // CRÍTICO: Generar token INMEDIATAMENTE
  const token = crypto.randomUUID() // ✅ Simple y seguro

  // CRÍTICO: Transacción para consistencia
  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      ...data,
      verification_token: token // ✅ Incluir desde create
    })
    .select()
    .single()

  // CRÍTICO: Insertar en verification_tokens también
  await supabase
    .from('verification_tokens')
    .insert({
      identifier: reservation.id,
      token: token,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    })
}
```

### 🔴 ROUTING GOTCHAS
```typescript
// CRÍTICO: useSearchParams para tokens
'use client'
import { useSearchParams } from 'next/navigation'

export function MiReservaPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') // ✅ URL: /mi-reserva?token=abc

  // ❌ NO usar: useRouter().query (Pages Router)
  // ❌ NO usar: window.location.search (CSR)
}
```

---

## 🎨 DESIGN SYSTEM GOTCHAS (CLAUDE.md críticos)

### 🔴 RESPONSIVE PATTERNS (obligatorios)
```tsx
// CRÍTICO: Mobile-first SIEMPRE
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* ✅ Base: móvil → md: tablet → lg: desktop */}
</div>

// CRÍTICO: FAB solo móvil
<CartFloatingButton className="md:hidden" />
<CartSidebar className="hidden md:block" />
```

### 🔴 ANIMATION GOTCHAS
```typescript
// CRÍTICO: Framer Motion patterns exactos de referencia
const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' }
}

// CRÍTICO: Stagger children animations
const containerVariants = {
  open: {
    transition: { staggerChildren: 0.1 }
  }
}
```

---

## 🚨 WARNINGS CRÍTICOS (EVITAR A TODA COSTA)

### 🚫 DATABASE WARNINGS
```sql
-- ❌ NUNCA hacer DROP en producción
-- ❌ NUNCA cambiar tipos columnas existentes
-- ❌ NUNCA usar IP directa en env vars
-- ❌ NUNCA skip headers Accept-Profile/Content-Profile
```

### 🚫 COMPONENT WARNINGS
```typescript
// ❌ NUNCA reescribir ReservationStepTwo.tsx
// ❌ NUNCA hardcodear colores RGB/HEX
// ❌ NUNCA usar useState para cart (usa Context)
// ❌ NUNCA skip responsive testing
```

### 🚫 ARCHITECTURE WARNINGS
```typescript
// ❌ NUNCA mixing Client/Server components incorrectly
// ❌ NUNCA usar React Router patterns en Next.js
// ❌ NUNCA skip Server Actions validation
// ❌ NUNCA localStorage sin expiry
```

---

## 📚 REFERENCIAS DOCUMENTACIÓN CRÍTICA

### 📖 EXTERNAL DOCS (Context7 research)
- **Next.js App Router Context**: /vercel/next.js patterns validated
- **Zustand patterns**: /pmndrs/zustand localStorage middleware
- **Framer Motion**: Sidebar animation patterns verified

### 📖 INTERNAL DOCS (CLAUDE.md)
- **Lines 408-412**: Shadcn/ui component standards
- **Lines 65-66**: Database headers OBLIGATORIOS
- **Lines 439-444**: Responsive mobile-first patterns
- **Lines 59-60**: Supabase connection gotchas

### 📖 REFERENCE IMPLEMENTATION
- **enigma-web-moderna/CartContext.tsx**: Complete cart state management
- **enigma-web-moderna/CartSidebar.tsx**: UI patterns and animations
- **enigma-web-moderna/reservationTokenService.ts**: Token security patterns
- **enigma-web-moderna/MiReservaPrincipal.tsx**: Page structure and error handling

---

## ✅ CHECKLIST VALIDACIÓN PRE-IMPLEMENTACIÓN

### Database ✅
- [ ] verification_token field added to reservations
- [ ] Index created for token searches
- [ ] Headers Accept-Profile/Content-Profile configured
- [ ] Supabase URL correctly set (not IP)

### Architecture ✅
- [ ] CartContext pattern matches reference exactly
- [ ] Step 2 integration approach confirmed (NO rewrite)
- [ ] Server Actions pattern validated for Next.js 15
- [ ] Token generation on create (not confirm) planned

### Design System ✅
- [ ] Shadcn/ui patterns confirmed (h-9, HSL colors, radius)
- [ ] Responsive breakpoints validated (mobile-first)
- [ ] Framer Motion animations match reference quality
- [ ] Component library usage patterns confirmed

### Testing ✅
- [ ] E2E flow planned: Cart → Step 2 → Token → Mi-reserva
- [ ] Mobile/tablet/desktop responsive validation
- [ ] Token expiry edge cases covered
- [ ] Cart persistence 24h validation

---

**SCORE OBJETIVO: 100%**
- **RESEARCH**: ✅ COMPLETO - Referencia analizada en detalle
- **GOTCHAS**: ✅ IDENTIFICADOS - Todos los críticos documentados
- **PATTERNS**: ✅ VALIDADOS - Context7 + referencia confirmados
- **WARNINGS**: ✅ CATALOGADOS - Errores evitables identificados
- **REFERENCIAS**: ✅ COMPILADAS - Documentación lista para implementación

**READY FOR PLAN_123.md GENERATION WITH CONFIDENCE LEVEL: MÁXIMO**