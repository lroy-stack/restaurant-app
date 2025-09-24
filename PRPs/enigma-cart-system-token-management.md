# PRP: Enigma Cart System + Token Management Integration

## 🎯 EXECUTIVE SUMMARY

**Status**: ✅ RESEARCH COMPLETE - READY FOR IMPLEMENTATION
**Confidence Score**: 9.5/10 (One-pass implementation success expected)

### Implementation Overview
Complete the existing cart system integration with reservation flow and implement post-reservation management through verification tokens. The cart infrastructure is **already implemented** - we need to:

1. **Connect cart to ReservationStepTwo** (minimal modification)
2. **Add token generation** to useReservations.ts
3. **Create /mi-reserva page** for post-reservation management
4. **Enhance cart-to-menu integration** patterns

### Key Discovery: Cart System Already Exists
The cart system infrastructure is fully implemented in the codebase:
- ✅ `src/contexts/CartContext.tsx` - Complete state management with localStorage persistence
- ✅ `src/components/cart/CartSidebar.tsx` - UI with Framer Motion animations
- ✅ `src/components/cart/CartFloatingButton.tsx` - Mobile FAB component
- ✅ `src/app/layout.tsx` - CartProvider integration
- ✅ Database field `verification_token` exists in reservations table

## 🔍 CRITICAL RESEARCH FINDINGS

### Existing Cart Implementation Analysis
```typescript
// src/contexts/CartContext.tsx - VERIFIED IMPLEMENTATION
interface CartItem {
  id: string
  type: 'wine' | 'dish' // MAPPED from menu_categories.type
  name: string
  nameEn?: string // Multilingual support
  price: number
  quantity: number
  addedAt: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  language: 'es' | 'en'
  lastUpdated: string
}

// VERIFIED: 24h localStorage persistence with expiry cleanup
const CART_EXPIRY_HOURS = 24
```

### ReservationStepTwo Integration Point
```typescript
// src/components/reservations/ReservationStepTwo.tsx:150-169
const addToPreOrder = (item: any) => {
  const existingItems = watchedPreOrderItems
  // ... existing logic handles quantity updates
  setValue('stepTwo.preOrderItems', newItems)
  updatePreOrderTotals(newItems)
}

// CRITICAL: This function already exists and works perfectly
// We just need to connect it to cart data on component mount
```

### Database Schema Verification
```sql
-- SSH VERIFIED: Field already exists
ALTER TABLE restaurante.reservations
ADD COLUMN verification_token VARCHAR(255) UNIQUE;
-- ✅ ALREADY IMPLEMENTED

CREATE INDEX idx_reservations_verification_token
ON restaurante.reservations(verification_token);
-- ✅ ALREADY IMPLEMENTED
```

## 🏗️ IMPLEMENTATION BLUEPRINT

### Phase 1: Cart-to-Reservation Connection (1-2 hours)
**File**: `src/components/reservations/ReservationStepTwo.tsx`

**Minimal Addition** (lines ~140):
```typescript
// ADD: Import cart hook
import { useCart } from '@/hooks/useCart'

// ADD: Inside ReservationStepTwo component
const { getCartItems, clearCart } = useCart()

// ADD: useEffect to load cart items on mount
useEffect(() => {
  const cartItems = getCartItems()

  if (cartItems.length > 0) {
    // Transform cart items to preOrder format
    const preOrderItems = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      type: item.type
    }))

    // Use existing functions (VERIFIED: lines 167-168)
    setValue('stepTwo.preOrderItems', preOrderItems)
    updatePreOrderTotals(preOrderItems)
  }
}, [setValue, getCartItems])

// OPTIONAL: Clear cart after successful reservation
// Add to handleNext function if needed
```

### Phase 2: Token Generation Enhancement (2-3 hours)
**File**: `src/hooks/useReservations.ts`

**Enhancement** (lines ~123-160):
```typescript
// ADD: Token generation to existing createReservation function
const createReservation = async (data: ReservationData) => {
  setIsLoading(true)

  try {
    // NEW: Generate verification token immediately
    const verificationToken = crypto.randomUUID()

    // MODIFY: Include token in existing API data (line ~137)
    const apiData = {
      ...existingApiData, // All existing fields remain unchanged
      verification_token: verificationToken // ADD this field only
    }

    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante'
      },
      body: JSON.stringify(apiData),
    })

    if (response.ok) {
      const result = await response.json()

      // ADD: Insert token in verification_tokens table
      const { error: tokenError } = await supabase
        .schema('restaurante')
        .from('verification_tokens')
        .insert({
          identifier: result.reservation.id,
          token: verificationToken,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })

      if (tokenError) {
        console.warn('Token creation failed:', tokenError)
      }

      return { success: true, reservation: result.reservation, token: verificationToken }
    }
  } catch (error) {
    // ... existing error handling
  } finally {
    setIsLoading(false)
  }
}
```

### Phase 3: Token Service Implementation (3-4 hours)
**File**: `src/lib/services/reservationTokenService.ts` (NEW)

**Reference Pattern**: Based on enigma-web-moderna/reservationTokenService.ts
```typescript
import { supabase } from '@/lib/supabase'

export interface TokenValidationResult {
  valid: boolean
  reservation?: any
  customer?: any
  error?: string
}

export class ReservationTokenService {
  static async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const { data: tokenData, error } = await supabase
        .schema('restaurante')
        .from('verification_tokens')
        .select(`
          *,
          reservations!inner(
            *,
            customers!customerId(*),
            tables!tableId(*)
          )
        `)
        .eq('token', token)
        .single()

      if (error || !tokenData) {
        return { valid: false, error: 'Token no encontrado' }
      }

      // Validate expiry
      const now = new Date()
      const expirationDate = new Date(tokenData.expires)

      if (now > expirationDate) {
        return { valid: false, error: 'Token expirado' }
      }

      // Validate reservation is not too close to start time (2h buffer)
      const reservationDateTime = new Date(`${tokenData.reservations.date}T${tokenData.reservations.time}`)
      const timeDiff = reservationDateTime.getTime() - now.getTime()
      const hoursUntilReservation = timeDiff / (1000 * 60 * 60)

      if (hoursUntilReservation < 2) {
        return {
          valid: false,
          error: 'No se pueden realizar cambios 2 horas antes de la reserva'
        }
      }

      return {
        valid: true,
        reservation: tokenData.reservations,
        customer: tokenData.reservations.customers
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return { valid: false, error: 'Error de validación' }
    }
  }

  static async updateReservation(
    reservationId: string,
    updates: any,
    token: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First validate token
      const validation = await this.validateToken(token)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Update reservation
      const { error } = await supabase
        .schema('restaurante')
        .from('reservations')
        .update(updates)
        .eq('id', reservationId)

      if (error) {
        return { success: false, error: 'Error al actualizar reserva' }
      }

      // Invalidate token after modification (security)
      await supabase
        .schema('restaurante')
        .from('verification_tokens')
        .delete()
        .eq('token', token)

      return { success: true }
    } catch (error) {
      console.error('Update reservation error:', error)
      return { success: false, error: 'Error interno' }
    }
  }
}
```

### Phase 4: Mi-Reserva Page Implementation (4-5 hours)
**File**: `src/app/(public)/mi-reserva/page.tsx` (NEW)

**Pattern**: Based on Next.js 15 App Router + useSearchParams
```typescript
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ReservationTokenService } from '@/lib/services/reservationTokenService'
import type { TokenValidationResult } from '@/lib/services/reservationTokenService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'

function MiReservaContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [validation, setValidation] = useState<TokenValidationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setValidation({ valid: false, error: 'Token no proporcionado' })
      setLoading(false)
      return
    }

    ReservationTokenService.validateToken(token)
      .then(setValidation)
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Validando reserva...</span>
      </div>
    )
  }

  if (!validation?.valid) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {validation?.error || 'Token inválido'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { reservation, customer } = validation

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Mi Reserva - {customer?.firstName} {customer?.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Detalles de la Reserva</h3>
              <p><strong>Fecha:</strong> {reservation.date}</p>
              <p><strong>Hora:</strong> {reservation.time}</p>
              <p><strong>Comensales:</strong> {reservation.partySize}</p>
              <p><strong>Mesa:</strong> {reservation.tables?.number}</p>
            </div>
            <div>
              <h3 className="font-semibold">Información de Contacto</h3>
              <p><strong>Email:</strong> {customer?.email}</p>
              <p><strong>Teléfono:</strong> {customer?.phone}</p>
            </div>
          </div>

          {reservation.preOrderItems?.length > 0 && (
            <div>
              <h3 className="font-semibold">Pre-pedido</h3>
              <div className="space-y-2">
                {reservation.preOrderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>€{reservation.preOrderTotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button variant="outline">
              Modificar Reserva
            </Button>
            <Button variant="destructive">
              Cancelar Reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MiReservaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MiReservaContent />
    </Suspense>
  )
}
```

## 🔧 VALIDATION GATES

### Code Quality Gates
```bash
# TypeScript compilation
npx tsc --noEmit

# ESLint validation
npm run lint

# Prettier formatting
npm run format

# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

### Functional Validation Tests
```typescript
// Test scenarios to validate manually
describe('Cart Integration Flow', () => {
  test('Menu → Cart → Reservas → Step 2 shows cart items', async () => {
    // 1. Add items to cart from menu
    // 2. Navigate to reservas
    // 3. Complete Step 1
    // 4. Verify Step 2 shows pre-loaded cart items
    // 5. Verify totals match cart totals
  })

  test('Token generation and validation', async () => {
    // 1. Create reservation
    // 2. Verify token generated in verification_tokens table
    // 3. Access /mi-reserva?token=xxx
    // 4. Verify reservation details display correctly
  })

  test('Cart persistence and expiry', async () => {
    // 1. Add items to cart
    // 2. Refresh page
    // 3. Verify cart items persist
    // 4. Simulate 25h later
    // 5. Verify cart is cleared
  })
})
```

### Database Validation
```sql
-- Verify token field exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'restaurante'
AND table_name = 'reservations'
AND column_name = 'verification_token';

-- Verify verification_tokens table structure
SELECT * FROM information_schema.columns
WHERE table_schema = 'restaurante'
AND table_name = 'verification_tokens';
```

## 📚 EXTERNAL REFERENCES & BEST PRACTICES

### React Cart Management Patterns
**Source**: `/notrab/react-use-cart` (Context7 Research)
- ✅ **localStorage persistence** with expiry (24h pattern)
- ✅ **useReducer pattern** for complex state management
- ✅ **Context Provider** at app root level
- ✅ **Quantity management** with increment/decrement

### Next.js 15 App Router Patterns
**Source**: `/vercel/next.js` (Context7 Research)
- ✅ **useSearchParams()** for token extraction in client components
- ✅ **Suspense boundaries** for loading states
- ✅ **Server Components** for data fetching when possible
- ✅ **Dynamic routing** with [token] segment if needed

### State Management Best Practices
**Source**: `/pmndrs/zustand` (Context7 Research)
- ✅ **Single source of truth** for cart state
- ✅ **Immutable updates** with proper state transitions
- ✅ **Local storage sync** with automatic cleanup
- ✅ **TypeScript integration** for type safety

## 🎯 IMPLEMENTATION TASKS (Chronological Order)

### Task 1: Connect Cart to ReservationStepTwo (Priority: HIGH)
- [ ] Add useCart import to ReservationStepTwo.tsx
- [ ] Add useEffect to load cart items on component mount
- [ ] Transform cart items to preOrder format
- [ ] Test cart → reservation flow

### Task 2: Enhance Token Generation (Priority: HIGH)
- [ ] Modify useReservations.ts createReservation function
- [ ] Add crypto.randomUUID() token generation
- [ ] Include verification_token in API payload
- [ ] Insert token record in verification_tokens table
- [ ] Test token creation and database insertion

### Task 3: Create Token Service (Priority: MEDIUM)
- [ ] Create src/lib/services/reservationTokenService.ts
- [ ] Implement validateToken method with expiry checks
- [ ] Implement updateReservation method with security
- [ ] Add comprehensive error handling
- [ ] Test token validation and expiry logic

### Task 4: Build Mi-Reserva Page (Priority: MEDIUM)
- [ ] Create src/app/(public)/mi-reserva/page.tsx
- [ ] Implement useSearchParams for token extraction
- [ ] Add loading, error, and success states
- [ ] Display reservation details and pre-order summary
- [ ] Add modify/cancel reservation buttons (UI only initially)
- [ ] Test URL access: /mi-reserva?token=xxx

### Task 5: Menu-Cart Integration Enhancement (Priority: LOW)
- [ ] Enhance menu page with "Add to Cart" button styling
- [ ] Improve cart sidebar animations and responsiveness
- [ ] Add cart count indicator to navigation
- [ ] Test complete flow from menu to reservation

### Task 6: Testing & Quality Assurance (Priority: HIGH)
- [ ] Run all validation gates (lint, type-check, test)
- [ ] Test responsive behavior on mobile/tablet/desktop
- [ ] Test cart persistence across browser sessions
- [ ] Test token expiry edge cases
- [ ] Validate GDPR compliance maintained

## 🚨 CRITICAL GOTCHAS & CONSIDERATIONS

### Database Connection Headers
```typescript
// CRITICAL: Always use these headers for Supabase requests
headers: {
  'Accept-Profile': 'restaurante',
  'Content-Profile': 'restaurante'
}
```

### Shadcn/ui Design System Compliance
```typescript
// ALWAYS use design system tokens
className="h-9 w-full border-input bg-transparent px-3 py-1"
// NOT hardcoded values like height: 36px
```

### Next.js 15 App Router Patterns
```typescript
// Client Component for useSearchParams
'use client'
import { useSearchParams } from 'next/navigation'

// Server Component for data fetching
export default async function Page({ params }: { params: { slug: string } }) {
  const data = await fetchData(params.slug)
  return <div>{data.title}</div>
}
```

### Security Considerations
- ✅ **Token Invalidation**: After reservation modifications
- ✅ **Expiry Validation**: 2h buffer before reservation time
- ✅ **SQL Injection Prevention**: Use parameterized queries
- ✅ **GDPR Compliance**: Maintain consent fields

## 🎯 SUCCESS METRICS

### Technical Success Criteria
- [ ] All validation gates pass (lint, type-check, test)
- [ ] Cart persistence works across sessions (24h)
- [ ] Token generation success rate > 99%
- [ ] /mi-reserva page load time < 2s
- [ ] Mobile responsiveness on iPhone SE (375px)

### User Experience Success Criteria
- [ ] Seamless menu → cart → reservation flow
- [ ] Cart items pre-populate in Step 2 automatically
- [ ] Token email link works correctly
- [ ] Reservation management intuitive and accessible
- [ ] Error states provide clear guidance

### Business Success Criteria
- [ ] Cart abandonment rate < 30%
- [ ] Token usage rate > 60% within 48h
- [ ] Customer satisfaction with pre-order feature
- [ ] Reduced manual reservation management workload

---

## 🏆 CONFIDENCE ASSESSMENT

**Overall Confidence: 9.5/10**

**Strengths:**
- ✅ **Complete Research**: Codebase analysis + external best practices
- ✅ **Existing Infrastructure**: Cart system already implemented
- ✅ **Clear Implementation Path**: Minimal modifications required
- ✅ **Proven Patterns**: Based on working reference implementations
- ✅ **Comprehensive Testing**: Clear validation gates defined

**Risk Factors:**
- ⚠️ **Token Service Complexity**: New service with security implications
- ⚠️ **Database Schema Assumptions**: Need to verify Supabase RLS policies
- ⚠️ **Mobile UX**: Cart sidebar responsive behavior needs testing

**Mitigation Strategies:**
- 🛡️ **Incremental Implementation**: Build and test phase by phase
- 🛡️ **Comprehensive Testing**: Validation gates for each component
- 🛡️ **Reference Implementation**: Follow proven patterns exactly

This PRP provides everything needed for a successful one-pass implementation of the complete cart system with token management integration.