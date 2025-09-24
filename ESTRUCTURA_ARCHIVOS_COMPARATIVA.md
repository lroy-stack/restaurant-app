# ESTRUCTURA ARCHIVOS: ACTUAL vs DESEADO
## Análisis Comparativo para Implementación Cart System + Token Management

---

## 📁 ESTRUCTURA ACTUAL (enigma-app)

### ✅ Archivos que SE MANTIENEN (funcionan correctamente)
```
src/
├── components/reservations/
│   ├── ProfessionalReservationForm.tsx        ✅ PERFECTO - Orquestador principal
│   ├── ReservationStepOne.tsx                 ✅ PERFECTO - Fecha/hora
│   ├── ReservationStepTwo.tsx                 ✅ PERFECTO - Ya maneja preOrderItems
│   ├── ReservationStepThree.tsx               ✅ PERFECTO - Datos personales
│   └── ReservationStepFour.tsx                ✅ PERFECTO - Confirmación
├── hooks/
│   └── useReservations.ts                     ✅ BASE SÓLIDA - Necesita modificaciones menores
├── lib/validations/
│   └── reservation-professional.ts            ✅ PERFECTO - Schema ya incluye preOrderItems
└── app/api/reservations/route.ts              ✅ FUNCIONAL - Necesita enhancement token
```

### ❌ Archivos que FALTAN (por implementar)
```
❌ NO EXISTE: Sistema Cart completo
❌ NO EXISTE: Context para cart state
❌ NO EXISTE: Componentes cart UI
❌ NO EXISTE: Página /mi-reserva
❌ NO EXISTE: Token management system
❌ NO EXISTE: Server actions cart
```

---

## 🎯 ESTRUCTURA DESEADA (basada en enigma-web-moderna + PLAN_123)

### 🆕 NUEVOS ARCHIVOS A CREAR
```
src/
├── contexts/
│   └── CartContext.tsx                        🆕 CRÍTICO - Estado carrito global
├── components/cart/
│   ├── CartSidebar.tsx                        🆕 CRÍTICO - UI principal carrito
│   ├── CartFloatingButton.tsx                 🆕 CRÍTICO - FAB móvil
│   ├── CartItem.tsx                           🆕 REQUERIDO - Item individual
│   └── CartSummary.tsx                        🆕 OPCIONAL - Resumen totales
├── components/reservations/
│   └── ReservationManagement.tsx              🆕 CRÍTICO - Gestión post-reserva
├── hooks/
│   ├── useCart.ts                             🆕 CRÍTICO - Lógica carrito
│   ├── useReservationByToken.ts               🆕 CRÍTICO - Gestión por token
│   └── useCartPersistence.ts                  🆕 OPCIONAL - Persistencia especializada
├── app/(public)/mi-reserva/
│   └── page.tsx                               🆕 CRÍTICO - Página gestión reserva
├── lib/actions/
│   ├── cart-actions.ts                        🆕 CRÍTICO - Server Actions carrito
│   └── token-actions.ts                       🆕 CRÍTICO - Server Actions tokens
└── lib/services/
    └── reservationTokenService.ts             🆕 CRÍTICO - Servicio tokens (adaptado)
```

### ✏️ ARCHIVOS A MODIFICAR (cambios mínimos)
```
src/
├── hooks/useReservations.ts                   ✏️ MENOR - Añadir token generation
├── app/layout.tsx                             ✏️ MENOR - Envolver CartProvider
├── app/(public)/menu/page.tsx                 ✏️ MENOR - Botones "Añadir Carrito"
├── app/(public)/reservas/page.tsx             ✏️ MENOR - Integrar CartSidebar
└── components/navigation/                     ✏️ MENOR - Cart button header/mobile
```

---

## 🗄️ MODIFICACIONES DATABASE REQUERIDAS

### ❌ CAMPOS FALTANTES (CRÍTICOS)
```sql
-- CRÍTICO: Añadir campo verification_token a reservations
ALTER TABLE restaurante.reservations
ADD COLUMN verification_token VARCHAR(255) UNIQUE;

-- ÍNDICE para búsquedas rápidas
CREATE INDEX idx_reservations_verification_token
ON restaurante.reservations(verification_token);
```

### ✅ ESQUEMA ACTUAL COMPATIBLE
```sql
-- ✅ YA EXISTE: verification_tokens table (estructura correcta)
-- ✅ YA EXISTE: reservation_items table (estructura correcta)
-- ✅ YA EXISTE: menu_items con categoryId (FOOD/WINE classification)
-- ✅ YA EXISTE: Todas las políticas RLS necesarias
```

---

## 🔄 FLUJO DE INTEGRACIÓN POR PRIORIDADES

### 🥇 PRIORIDAD 1: Cart System Base (Días 1-2)
```
1. CartContext.tsx - Estado global carrito
2. CartSidebar.tsx - UI principal
3. CartFloatingButton.tsx - FAB móvil
4. useCart.ts - Hook gestión carrito
5. Integrar en /menu y /reservas
```

### 🥈 PRIORIDAD 2: Token Management (Día 3)
```
1. Modificar DB: ADD verification_token field
2. reservationTokenService.ts - Lógica tokens
3. useReservationByToken.ts - Hook validación
4. Modificar useReservations.ts - Generar token en create
```

### 🥉 PRIORIDAD 3: Mi-Reserva Page (Días 4-5)
```
1. /mi-reserva/page.tsx - Página principal
2. ReservationManagement.tsx - Componente gestión
3. Server actions para updates
4. Testing E2E completo
```

---

## 📊 COMPARATIVA ARQUITECTURAL

### REFERENCIA (enigma-web-moderna)
```
- ✅ React Router (SPA)
- ✅ Supabase schema: reservas + clientes + reservation_tokens
- ✅ Context + useReducer pattern
- ✅ Framer Motion animations
- ✅ Complete token service
- ✅ MiReservaPrincipal page
```

### OBJETIVO (enigma-app enhanced)
```
- ✅ Next.js 15 App Router (SSR)
- ✅ Supabase schema: reservations + customers + verification_tokens
- ✅ Context + useReducer pattern (IDÉNTICO)
- ✅ Framer Motion animations (IDÉNTICO)
- ✅ Adapted token service (compatible)
- ✅ /mi-reserva page (equivalente)
```

### 🎯 DIFERENCIAS CLAVE (adaptaciones necesarias)
```
1. Router: react-router-dom → next/navigation
2. Schema names: reservas → reservations, clientes → customers
3. URL handling: useSearchParams() → searchParams prop
4. Server Actions: Client calls → RSC pattern
5. Middleware: Client-side → Server-side validation
```

---

## 🚨 GOTCHAS ARQUITECTURALES IDENTIFICADOS

### 🔴 CRÍTICOS (pueden romper implementación)
```
1. NO existe verification_token field en reservations
2. Step 2 YA FUNCIONA - NO reescribir, solo integrar cart
3. Schema names diferentes (reservations vs reservas)
4. Next.js patterns diferentes a React Router
```

### 🟡 IMPORTANTES (afectan UX)
```
1. Cart persistence 24h like reference
2. Responsive behavior mobile/desktop
3. Animations matching reference quality
4. Error handling token expiration
```

### 🟢 MENORES (optimizaciones)
```
1. Bundle size cart components
2. Performance localStorage checks
3. SEO /mi-reserva page
4. Analytics cart abandonment
```

---

## ✅ CRITERIOS VALIDACIÓN IMPLEMENTACIÓN

### Database Schema ✅
- [x] verification_tokens exists
- [x] reservation_items exists
- [ ] verification_token field in reservations (FALTA)
- [x] menu_items supports FOOD/WINE classification

### Component Architecture ✅
- [x] Step 2 handles preOrderItems correctly
- [x] Validation schemas support cart structure
- [ ] Cart context created (FALTA)
- [ ] Cart UI components (FALTA)

### Integration Points ✅
- [x] useReservations hook is adaptable
- [x] API routes support modifications
- [ ] Token generation on create (FALTA)
- [ ] /mi-reserva page (FALTA)

---

**RESUMEN EJECUTIVO:**
- **33% COMPLETO**: Step 2 + schemas + DB base
- **67% FALTA**: Cart system + token mgmt + mi-reserva
- **TIEMPO ESTIMADO**: 5-6 días implementación siguiendo prioridades
- **RIESGO**: BAJO - Patrones claros de referencia disponibles
