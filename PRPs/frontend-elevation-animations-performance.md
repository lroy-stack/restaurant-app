# PRP: Frontend Elevation - Modern Animations & Performance Optimization

**Feature**: Enigma Restaurant Platform - Public Frontend Transformation
**Date**: 2025-10-05
**Version**: 1.0.0
**Status**: 🚀 Ready for Implementation
**Source**: reports/REPORT_03_PROGRESSIVE_IMPLEMENTATION_PLAN.md
**Confidence Score**: 9/10

---

## 🎯 Goal

Transform Enigma's public frontend from functional to exceptional by implementing modern animations, enhanced UX, and performance optimizations while maintaining brand identity and accessibility standards.

### Success Metrics
- Lighthouse Performance: 95+
- User Engagement: +40%
- Conversion Rate: +25%
- Pre-order Rate: +60%
- Core Web Vitals: All green

---

## 🚀 Why

### Business Value
- **Premium Brand Perception**: Modern animations signal quality and attention to detail
- **Improved Conversion**: Enhanced product discovery and streamlined pre-orders
- **SEO Benefits**: Faster load times improve search rankings
- **Mobile-First Excellence**: 70%+ of traffic demands perfect responsive design

### Technical Debt Resolution
- Migrate to React Query for better state management
- Implement proper lazy loading patterns
- Modernize animation approach from CSS-only to declarative Motion API
- Establish reusable component patterns

### User Impact
- Delightful micro-interactions replace static clicks
- Storytelling creates emotional connection with brand
- Seamless menu discovery reduces friction
- Fast, smooth experience across all devices

---

## 📋 What

### Implementation Overview

**Phase 1: Foundation** (Weeks 1-2)
- Modern animation libraries (Framer Motion 12.x, Three.js, React Query v5)
- Smoke cursor trail for desktop
- Scroll-triggered animations
- Enhanced product cards with hover states
- Lazy loading with blur-up placeholders

**Phase 2: Homepage Elevation** (Weeks 3-4)
- Historia section with curated imagery
- Dynamic testimonials component
- Awards showcase
- Gallery preview
- Newsletter signup

**Phase 3: Product Experience** (Weeks 5-6)
- Quick-view modal
- Recommendations engine
- Image zoom functionality
- Interactive wine pairing cards
- Favorites/wishlist system

**Phase 4: Pre-Orders Enhancement** (Weeks 7-8)
- Menu browser in reservation form
- Smart recommendations based on party size
- Visual cart feedback
- Order summary with images
- Tip calculator

**Phase 5: Polish & Optimization** (Weeks 9-10)
- Complete React Query migration
- Intersection Observer for all lazy content
- Page transitions
- Gesture animations
- Performance audit

---

## 🔗 All Needed Context

### Documentation & References

#### Modern Animation Libraries (Context7 Verified)

**Framer Motion (Now "Motion") - `/grx7/framer-motion`**
- **Why**: Production-ready React 19 animation library with 337 code snippets
- **Trust Score**: 6.0
- **Critical**: Use `"motion/react"` import for React 19 compatibility
- **Version**: 12.23.22 (rebranded from Framer Motion to Motion in early 2025)
- **Best Practices**:
  - Use `useInView` for scroll-triggered animations (automatic cleanup)
  - Leverage variants for reusable animation states
  - `AnimatePresence` for mount/unmount transitions
  - Layout animations with `layout` prop for zero-effort responsive animations
  - Must use `"use client"` in Next.js App Router
- **Docs**: https://motion.dev/docs/react
- **Performance**: Hybrid engine (native browser + JS flexibility)

**React Three Fiber - `/pmndrs/react-three-fiber`**
- **Why**: Declarative Three.js for React with 230 code snippets
- **Trust Score**: 9.6
- **Critical Patterns**:
  - `useFrame` for animation loops (never use setState inside)
  - `useLoader` for automatic asset caching
  - Reuse objects in loops (avoid `new` in useFrame)
  - `frameloop="demand"` for on-demand rendering (static scenes)
  - Direct mutation with deltas for refresh-rate independence
- **Performance**: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- **Gotcha**: Must use `dynamic()` with `ssr: false` in Next.js

**Drei - `/pmndrs/drei`**
- **Why**: React Three Fiber helpers with 329 code snippets
- **Trust Score**: 9.6
- **Components Used**:
  - `<Points>` and `<PointMaterial>` for particle systems
  - `<Html>` for 3D HTML placement
  - `useProgress` for loading states
  - `PerformanceMonitor` for adaptive quality
- **Docs**: https://github.com/pmndrs/drei

**TanStack React Query v5 - `/tanstack/query`**
- **Why**: Modern data fetching with 753 code snippets
- **Trust Score**: 8.0
- **Version**: v5.84.1
- **Next.js 15 Patterns**:
  - Server Components as prefetch layer
  - Dehydration API for SSR hydration
  - `@tanstack/react-query-next-experimental` for streaming
  - Server Actions integration
- **Docs**: https://tanstack.com/query/v5/docs/framework/react/guides/ssr
- **March 2025 Article**: https://javascript.plainenglish.io/using-tanstack-query-v5-in-next-js-15-8c2aa60fdf5e

**Blurhash - `/woltapp/blurhash`**
- **Why**: Compact image placeholder algorithm
- **Trust Score**: 8.6
- **Usage**: Decode blurhash to canvas, display while image loads
- **Integration**: Combine with Intersection Observer for lazy loading

---

### Codebase Analysis (Completed via SSH & Grep)

#### Database Schema (restaurante schema - 33 tables)
```sql
-- Media & Content
restaurante.media_library          # Image assets with blurhash support
restaurante.menu_items            # Food & wine products
restaurante.menu_categories       # Category organization
restaurante.allergens             # EU-14 allergen tracking
restaurante.wine_pairings         # Food-wine relationships

-- Customer & Reservations
restaurante.customers             # Customer profiles (VIP, spending)
restaurante.reservations          # Multi-table bookings
restaurante.reservation_items     # Pre-order support

-- Orders & Cart
restaurante.orders                # Order management
restaurante.order_items           # Line items
restaurante.table_sessions        # Active dining sessions

-- Analytics & Tracking
restaurante.qr_scans              # QR code analytics
restaurante.reservation_success_patterns  # ML insights

-- GDPR & Legal
restaurante.gdpr_requests         # Data export/deletion
restaurante.cookie_consents       # Consent tracking
restaurante.legal_content         # Policy versions
```

#### Existing Hooks (Analysis Complete)
```typescript
// src/hooks/use-menu.ts
- Current: useState + useEffect pattern
- Issues: Manual cache management, no automatic refetch
- Migration: → React Query useQuery
- Benefits: Automatic caching, deduplication, background updates

// src/hooks/useCart.ts
- Pattern: Re-exports from CartContext
- Kept: Already using Context (no migration needed)

// src/hooks/use-media-library.ts
- Pattern: Media fetching with filters
- Migration: → React Query with prefetching

// src/hooks/use-restaurant.ts
- Pattern: Restaurant data fetching
- Migration: → React Query (rarely changes = long staleTime)
```

#### Current Next.js Configuration
```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: [
    "@radix-ui/react-icons",
    "lucide-react",
    "react-grid-layout",
    "recharts",
    "react-konva"
    // ADD: "framer-motion", "@react-three/fiber", "@react-three/drei"
  ],
  turbopack: { /* SVG handling */ }
},
images: {
  formats: ['image/webp', 'image/avif'],
  domains: ['ik.imagekit.io'],
  minimumCacheTTL: 31536000
}
```

#### Design System (OKLCH Color Tokens)
```css
/* src/app/globals.css */
--primary: oklch(0.45 0.15 200);          /* Atlantic Blue */
--foreground: oklch(0.13 0.028 200);       /* Dark text */
--muted-foreground: oklch(0.45 0.025 200); /* WCAG AA (4.8:1) */
--border: oklch(0.88 0.01 210);            /* Subtle borders */
--accent: oklch(0.6 0.18 40);              /* Burnt Orange */

/* CRITICAL: Framer Motion needs RGB for some effects */
/* Solution: Create utility function for OKLCH → RGB conversion */
```

#### Component Patterns (Analyzed)
```typescript
// src/components/homepage/featured-dishes.tsx
- Pattern: Grid layout with skeleton loading
- Reuse: AllergenInfo, ProductDetailModal
- Cart: useCart hook integration
- Enhancement: Add Framer Motion hover states

// src/components/menu/ProductDetailModal.tsx
- Pattern: Dialog with AnimatePresence support
- Image: Next Image with lazy loading
- Wine Pairings: Already structured for expansion
- Enhancement: Add quick-view variant

// src/components/layout/public-layout.tsx
- Global: CartFloatingButton, CartSidebar, CookieConsent
- Background: ThemeAwareMeshGradient
- Addition: SmokeCursorTrail (desktop only)
```

---

### Known Gotchas & Critical Constraints

#### React 19 + Next.js 15 Compatibility

```typescript
// CRITICAL: Import change for React 19
// ❌ OLD (React 18)
import { motion } from "framer-motion"

// ✅ NEW (React 19 compatible)
import { motion } from "motion/react"

// Version: framer-motion@12.23.22 (Motion rebrand 2025)
```

#### Three.js SSR Constraints

```typescript
// CRITICAL: Three.js MUST be client-side only
// ❌ DON'T render on server
import SmokeCursorTrail from './SmokeCursorTrail'

// ✅ DO use dynamic import
import dynamic from 'next/dynamic'

const SmokeCursorTrail = dynamic(
  () => import('@/components/effects/SmokeCursorTrail'),
  {
    ssr: false,
    loading: () => null // No loading UI needed for visual effect
  }
)
```

#### Performance Patterns (React Three Fiber)

```typescript
// ❌ BAD: Creates new object every frame (GC pressure)
useFrame(() => {
  ref.current.position.lerp(new THREE.Vector3(x, y, z), 0.1)
})

// ✅ GOOD: Reuse object outside component
const tempVec = new THREE.Vector3()

useFrame(() => {
  ref.current.position.lerp(tempVec.set(x, y, z), 0.1)
})

// ❌ BAD: setState in render loop
const [x, setX] = useState(0)
useFrame(() => setX(x + 0.1))

// ✅ GOOD: Direct mutation with delta
const meshRef = useRef()
useFrame((state, delta) => {
  meshRef.current.position.x += delta
})
```

#### OKLCH to RGB Conversion

```typescript
// CRITICAL: Some Framer Motion effects require RGB
// Create utility: src/lib/utils/color-conversion.ts

import { formatHex, oklch, rgb } from 'culori'

export function oklchToRgb(oklchString: string): string {
  // Parse OKLCH: "oklch(0.45 0.15 200)"
  const color = oklch(oklchString)
  const rgbColor = rgb(color)
  return formatHex(rgbColor) // Returns "#1a73e8"
}

// Usage in animations
<motion.div
  animate={{ backgroundColor: oklchToRgb("oklch(0.45 0.15 200)") }}
/>
```

#### ImageKit Blur-Up Pattern

```typescript
// CRITICAL: Specify dimensions for LQIP (Low Quality Image Placeholder)
const blurDataURL = `https://ik.imagekit.io/insomnialz/dish.jpg?tr=w-20,h-20,bl-10`

<Image
  src="https://ik.imagekit.io/insomnialz/dish.jpg"
  blurDataURL={blurDataURL}
  placeholder="blur"
  width={800}
  height={600}
/>
```

#### Supabase Realtime + React Query

```typescript
// ❌ DON'T duplicate subscriptions
useEffect(() => {
  const channel = supabase.channel('menu')
  channel.on('UPDATE', () => fetchMenu())
}, [])

// ✅ DO use React Query invalidation
useEffect(() => {
  const channel = supabase.channel('menu')
  channel.on('UPDATE', () => {
    queryClient.invalidateQueries({ queryKey: ['menu'] })
  })
  return () => channel.unsubscribe()
}, [])
```

---

## 🏗️ Implementation Blueprint

### Desired Codebase Tree

```
src/
├── components/
│   ├── effects/
│   │   └── SmokeCursorTrail.tsx          # NEW: Three.js particle system
│   ├── animations/
│   │   ├── ScrollReveal.tsx              # NEW: Motion wrapper
│   │   ├── FadeIn.tsx                    # NEW: Common animation
│   │   └── PageTransition.tsx            # NEW: Route transitions
│   ├── ui/
│   │   └── lazy-image.tsx                # NEW: Intersection Observer + Blurhash
│   ├── menu/
│   │   ├── EnhancedProductCard.tsx       # NEW: Hover animations
│   │   ├── QuickViewModal.tsx            # NEW: Fast preview
│   │   └── ProductDetailModal.tsx        # MODIFIED: Add quick-view mode
│   ├── homepage/
│   │   ├── historia-preview-section.tsx  # NEW: Brand storytelling
│   │   ├── testimonials-section.tsx      # NEW: Social proof
│   │   └── featured-dishes.tsx           # MODIFIED: Add animations
│   └── reservations/
│       └── ContactAndConfirmStep.tsx     # MODIFIED: Add menu browser
├── hooks/
│   ├── use-menu.ts                       # MODIFIED: Migrate to React Query
│   ├── use-media-library.ts              # MODIFIED: Add prefetching
│   └── use-restaurant.ts                 # MODIFIED: Long staleTime
├── providers/
│   └── query-client-provider.tsx         # NEW: React Query setup
├── lib/
│   └── utils/
│       └── color-conversion.ts           # NEW: OKLCH → RGB
└── app/
    ├── (public)/
    │   ├── layout.tsx                    # MODIFIED: Add QueryProvider
    │   └── page.tsx                      # MODIFIED: Add animations
    └── globals.css                       # MODIFIED: Add animation utilities
```

---

### Task Breakdown (Sequential Implementation)

#### Task 1: Install Dependencies & Configure (Week 1)

**Subtask 1.1: Install Animation Libraries**

```bash
# Install production dependencies
npm install framer-motion@12.x three@0.160.x @react-three/fiber@8.x @react-three/drei@9.x

# Install React Query
npm install @tanstack/react-query@5.x @tanstack/react-query-devtools@5.x

# Install image optimization
npm install blurhash

# Verify no peer dependency warnings
npm list framer-motion three @react-three/fiber @tanstack/react-query blurhash
```

**Subtask 1.2: Update Next.js Config**

MODIFY `next.config.mjs`:
```javascript
experimental: {
  optimizePackageImports: [
    "@radix-ui/react-icons",
    "lucide-react",
    // ADD NEW
    "framer-motion",
    "@react-three/fiber",
    "@react-three/drei",
    "@tanstack/react-query"
  ]
}
```

**Validation**:
```bash
npm run type-check  # Should pass
npm run build       # Should complete without errors
```

---

#### Task 2: Create React Query Provider (Week 1)

**CREATE** `src/providers/query-client-provider.tsx`:

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes (menu data rarely changes)
        staleTime: 5 * 60 * 1000,
        // Keep in cache for 10 minutes
        gcTime: 10 * 60 * 1000, // v5 renamed from cacheTime
        // Don't refetch on window focus (avoid unnecessary requests)
        refetchOnWindowFocus: false,
        // Retry failed requests once
        retry: 1,
        // Show stale data while refetching
        placeholderData: (previousData) => previousData
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  )
}
```

**MODIFY** `src/app/(public)/layout.tsx`:

```typescript
import { QueryProvider } from '@/providers/query-client-provider'

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <QueryProvider>
      <PublicLayout>
        {children}
      </PublicLayout>
    </QueryProvider>
  )
}
```

**Validation**:
- Open app → check for React Query Devtools in bottom-right
- Verify no console errors

---

#### Task 3: Migrate useMenu to React Query (Week 1-2)

**MODIFY** `src/hooks/use-menu.ts`:

```typescript
'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MenuFilterData } from '@/lib/validations/menu'
import type { MenuItem, MenuCategory, MenuData } from './use-menu'

export function useMenu(filters?: MenuFilterData) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['menu', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, value.toString())
          }
        })
      }

      const url = `/api/menu?${queryParams}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Error al cargar el menú')
      }

      return response.json() as Promise<MenuData>
    },
    staleTime: 5 * 60 * 1000, // Menu rarely changes
  })

  // Helper functions (keep existing logic)
  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    if (!query.data) return []
    const category = query.data.categories.find(cat => cat.id === categoryId)
    return category?.menuItems || []
  }

  const searchItems = (searchQuery: string): MenuItem[] => {
    if (!query.data || !searchQuery.trim()) return []

    const searchTerm = searchQuery.toLowerCase()
    const allItems = query.data.categories.flatMap(cat => cat.menuItems)

    return allItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.nameEn?.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.descriptionEn?.toLowerCase().includes(searchTerm)
    )
  }

  const getRecommendedItems = (): MenuItem[] => {
    if (!query.data) return []
    return query.data.categories.flatMap(cat =>
      cat.menuItems.filter(item => item.isRecommended)
    )
  }

  return {
    menu: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    getItemsByCategory,
    searchItems,
    getRecommendedItems,
    // React Query extras
    isFetching: query.isFetching,
    isStale: query.isStale,
  }
}

// Prefetch hook for SSR/RSC
export function usePrefetchMenu(filters?: MenuFilterData) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['menu', filters],
      queryFn: async () => {
        const queryParams = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.set(key, value.toString())
            }
          })
        }
        const response = await fetch(`/api/menu?${queryParams}`)
        return response.json()
      }
    })
  }
}
```

**Validation**:
```bash
# Check React Query Devtools
# - Query key: ['menu', filters]
# - Status: success
# - Data: { categories: [...], summary: {...} }
# - Stale time: 5min
```

---

#### Task 4: Three.js Smoke Cursor Trail (Week 2)

**CREATE** `src/components/effects/SmokeCursorTrail.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface ParticleSystemProps {
  count: number
}

// PATTERN: Reuse objects outside component to avoid GC pressure
const tempColor = new THREE.Color()

function ParticleSystem({ count }: ParticleSystemProps) {
  const points = useRef<THREE.Points>(null)
  const positions = useRef(new Float32Array(count * 3))
  const velocities = useRef(new Float32Array(count * 3))
  const mousePos = useRef({ x: 0, y: 0 })
  const particleIndex = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 range
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state, delta) => {
    if (!points.current) return

    const positionsArray = points.current.geometry.attributes.position.array as Float32Array

    // Add new particle at cursor position
    const idx = particleIndex.current * 3
    positionsArray[idx] = mousePos.current.x * 10
    positionsArray[idx + 1] = mousePos.current.y * 10
    positionsArray[idx + 2] = 0

    // Random velocity for organic movement
    velocities.current[idx] = (Math.random() - 0.5) * 0.02
    velocities.current[idx + 1] = Math.random() * 0.05
    velocities.current[idx + 2] = (Math.random() - 0.5) * 0.02

    particleIndex.current = (particleIndex.current + 1) % count

    // Update all particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positionsArray[i3] += velocities.current[i3]
      positionsArray[i3 + 1] += velocities.current[i3 + 1]
      positionsArray[i3 + 2] += velocities.current[i3 + 2]

      // Fade out over time
      velocities.current[i3 + 1] += 0.001
    }

    points.current.geometry.attributes.position.needsUpdate = true
  })

  // OKLCH primary color: oklch(0.45 0.15 200) ≈ #1a73e8
  // Convert to hex for Three.js compatibility
  tempColor.setStyle('#1a73e8')

  return (
    <Points ref={points} positions={positions.current} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={tempColor}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export default function SmokeCursorTrail() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        dpr={[1, 2]} // Adaptive pixel ratio for performance
        gl={{ alpha: true, antialias: false }} // Transparent canvas, disable AA for perf
      >
        <ParticleSystem count={100} />
      </Canvas>
    </div>
  )
}
```

**MODIFY** `src/components/layout/public-layout.tsx`:

```typescript
import dynamic from 'next/dynamic'

// CRITICAL: Three.js must be client-only (SSR incompatible)
const SmokeCursorTrail = dynamic(
  () => import('@/components/effects/SmokeCursorTrail'),
  {
    ssr: false,
    loading: () => null // No loading UI for visual effect
  }
)

export function PublicLayout({ children, ...props }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated Mesh Gradient Background */}
      <ThemeAwareMeshGradient />

      {/* Smoke cursor trail - desktop only (hidden on mobile for perf) */}
      <div className="hidden lg:block">
        <SmokeCursorTrail />
      </div>

      {/* Floating Navigation */}
      {showNavbar && <FloatingNavbar />}

      {/* Rest of layout... */}
    </div>
  )
}
```

**Validation**:
- Desktop: Move cursor → see blue smoke trail
- Mobile: No trail rendered (hidden lg:block)
- DevTools Performance: No frame drops
- Console: No errors

---

#### Task 5: Framer Motion Scroll Animations (Week 2)

**CREATE** `src/components/animations/ScrollReveal.tsx`:

```typescript
'use client'

// CRITICAL: Use "motion/react" for React 19 compatibility
import { motion, useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionOffset[direction]
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        y: 0
      } : undefined}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Enigma brand easing curve
      }}
    >
      {children}
    </motion.div>
  )
}
```

**CREATE** `src/components/animations/FadeIn.tsx`:

```typescript
'use client'

import { motion } from 'motion/react'
import { type ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
}

export function FadeIn({ children, delay = 0, duration = 0.4 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

**MODIFY** `src/app/(public)/page.tsx`:

```typescript
import { ScrollReveal } from '@/components/animations/ScrollReveal'

export default function HomePage() {
  return (
    <>
      {/* Hero - no animation (immediate display) */}
      <section className="relative h-[109vh]...">
        {/* ... */}
      </section>

      {/* Featured Dishes - scroll reveal */}
      <ScrollReveal direction="up" delay={0.1}>
        <FeaturedDishes maxItems={4} showViewMore={true} />
      </ScrollReveal>

      {/* Featured Wines - scroll reveal */}
      <ScrollReveal direction="up" delay={0.2}>
        <FeaturedWines maxItems={2} showViewMore={true} />
      </ScrollReveal>

      {/* Features Grid - stagger children */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="enigma-section-title">Una Experiencia Gastronómica Única</h3>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={0.1 * index} direction="up">
                <Card>...</Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
```

**Validation**:
- Scroll down → sections fade in smoothly
- Each feature card staggers by 100ms
- Animations play only once (once={true})
- Mobile: Animations work, no performance issues

---

#### Task 6: Enhanced Product Cards (Week 3)

**CREATE** `src/components/menu/EnhancedProductCard.tsx`:

```typescript
'use client'

import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Eye, ShoppingCart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface EnhancedProductCardProps {
  item: any
  onQuickView: () => void
  onAddToCart: () => void
  isInCart: boolean
  cartQuantity: number
}

export function EnhancedProductCard({
  item,
  onQuickView,
  onAddToCart,
  isInCart,
  cartQuantity
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        {/* Image Container with Overlay */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <motion.img
            src={item.imageUrl || '/placeholder-dish.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Quick Actions Overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="sm"
              variant="secondary"
              className="backdrop-blur-sm bg-white/90 hover:bg-white"
              onClick={onQuickView}
            >
              <Eye className="h-4 w-4 mr-1" />
              Vista Rápida
            </Button>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {item.isRecommended && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Badge className="bg-accent/90 backdrop-blur-sm">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Recomendado
                </Badge>
              </motion.div>
            )}
            {item.isOrganic && (
              <Badge variant="secondary" className="bg-secondary/90 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Ecológico
              </Badge>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute top-3 right-3">
            <motion.div
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              €{item.price}
            </motion.div>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {item.description}
          </p>

          {/* Allergens */}
          {item.allergens?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.allergens.slice(0, 3).map((allergen: any) => (
                <Badge key={allergen.id} variant="outline" className="text-xs">
                  {allergen.icon}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto pt-4 border-t">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onAddToCart}
                className={cn(
                  "w-full relative",
                  isInCart && "bg-green-600 hover:bg-green-700"
                )}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isInCart ? `En carrito (${cartQuantity})` : 'Añadir al carrito'}

                {isInCart && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {cartQuantity}
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

**Validation**:
- Hover → card lifts, image zooms, overlay appears
- Quick View button fades in smoothly
- Price tag scales on hover
- Badge entrance animation (spring rotation)
- Add to cart → quantity badge animates in

---

#### Task 7: Lazy Image with Blur-Up (Week 3)

**CREATE** `src/components/ui/lazy-image.tsx`:

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { decode } from 'blurhash'
import { Loader2 } from 'lucide-react'

interface LazyImageProps {
  src: string
  alt: string
  blurhash?: string
  className?: string
  aspectRatio?: string
  priority?: boolean
}

export function LazyImage({
  src,
  alt,
  blurhash,
  className = '',
  aspectRatio = '1/1',
  priority = false
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // If priority, load immediately
  const imgRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' } // Start loading 50px before entering viewport
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [priority])

  // Render blurhash placeholder
  useEffect(() => {
    if (!blurhash || !canvasRef.current || isLoaded) return

    try {
      const pixels = decode(blurhash, 32, 32)
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const imageData = ctx.createImageData(32, 32)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
    } catch (error) {
      console.error('Failed to decode blurhash:', error)
    }
  }, [blurhash, isLoaded])

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* Blurhash canvas (background) */}
      {blurhash && !isLoaded && (
        <canvas
          ref={canvasRef}
          width={32}
          height={32}
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Loading spinner (only show if no blurhash) */}
      {!blurhash && !isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        </div>
      )}
    </div>
  )
}
```

**USAGE Example**:
```typescript
<LazyImage
  src="https://ik.imagekit.io/insomnialz/dish.jpg"
  alt="Plato recomendado"
  blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
  aspectRatio="4/3"
  className="rounded-lg"
  priority={false} // Only set true for above-the-fold images
/>
```

**Validation**:
- Scroll to image → blurhash appears immediately
- Image loads → smooth fade-in over blurhash
- DevTools Network: Images load when 50px before viewport
- Accessibility: Proper alt text, loading states

---

## ✅ Validation Loop

### Level 1: Type Safety & Build

```bash
# Type check (must pass with 0 errors)
npm run type-check

# Production build
npm run build

# Expected output:
# - No TypeScript errors
# - Bundle size < 500KB for main chunk
# - framer-motion tree-shaken properly
# - Three.js only in client bundle
```

### Level 2: Visual QA Checklist

```bash
# Start dev server
npm run dev

# Manual testing checklist:
✅ Desktop: Smoke cursor trail visible on mouse move
✅ Mobile: No smoke trail (hidden lg:block)
✅ Scroll: Sections fade in at 30% viewport (amount={0.3})
✅ Product cards: Hover lifts -8px, image scales to 1.1
✅ Quick view: Button fades in on hover
✅ Lazy images: Blurhash → smooth fade to real image
✅ Badges: Spring animation on recommended items
✅ Cart button: Quantity badge animates on add
✅ No layout shift (CLS = 0)
✅ Animations respect prefers-reduced-motion
```

### Level 3: Performance Audit

```bash
# Build and test production
npm run build
npm start

# Lighthouse audit (target scores):
npm run perf:lighthouse

# Expected results:
Performance: 95+
  - FCP < 1.8s
  - LCP < 2.5s
  - TBT < 200ms
  - CLS = 0
Accessibility: 95+
  - Proper ARIA labels
  - Keyboard navigation
Best Practices: 95+
SEO: 95+

# Web Vitals (real-world):
npm run perf:vitals
# - LCP: < 2.5s
# - FID: < 100ms
# - CLS: < 0.1
```

### Level 4: React Query Validation

```bash
# Open React Query Devtools
# Verify:
✅ Query ['menu'] cached for 5 minutes
✅ No duplicate network requests on re-render
✅ Background refetch works correctly
✅ Stale-while-revalidate pattern active
✅ Prefetching on hover working (if implemented)
```

### Level 5: Browser Compatibility

```bash
# Test matrix:
✅ Chrome 120+ (desktop & Android)
✅ Firefox 120+ (desktop)
✅ Safari 17+ (desktop & iOS)
✅ Edge 120+

# Animation fallbacks:
✅ prefers-reduced-motion: opacity-only transitions
✅ No animations on old browsers (graceful degradation)
```

---

## 📊 Integration Points

### New Components

```
src/components/
├── effects/SmokeCursorTrail.tsx        ← Three.js particle system
├── animations/ScrollReveal.tsx         ← Motion useInView wrapper
├── animations/FadeIn.tsx               ← Simple fade-in
├── ui/lazy-image.tsx                   ← Intersection Observer + Blurhash
├── menu/EnhancedProductCard.tsx        ← Animated product cards
├── menu/QuickViewModal.tsx             ← Fast product preview
└── homepage/historia-preview-section.tsx  ← Brand storytelling
```

### Modified Files

```
src/hooks/
├── use-menu.ts                         ← Migrated to React Query
├── use-media-library.ts                ← Add prefetching

src/app/(public)/
├── layout.tsx                          ← Add QueryProvider
├── page.tsx                            ← Add scroll animations

src/components/layout/
└── public-layout.tsx                   ← Add SmokeCursorTrail

next.config.mjs                         ← Add package optimizations
```

---

## 🎯 Final Quality Checklist

- [ ] All dependencies installed without peer warnings
- [ ] TypeScript compiles with 0 errors
- [ ] Production build succeeds
- [ ] React Query Devtools visible in dev mode
- [ ] Smoke cursor trail works on desktop only
- [ ] Scroll animations trigger at correct viewport threshold
- [ ] Product cards have smooth hover states
- [ ] Quick-view modal functional
- [ ] Lazy images load with blur-up transition
- [ ] Lighthouse Performance: 95+
- [ ] Lighthouse Accessibility: 95+
- [ ] No console errors in production
- [ ] prefers-reduced-motion respected
- [ ] All tests pass: `npm run test:all` (if tests exist)

---

## 📝 Anti-Patterns to Avoid

❌ Installing framer-motion without version constraint → Use `framer-motion@12.x`
❌ Using `import { motion } from "framer-motion"` → Use `"motion/react"` for React 19
❌ Rendering Three.js on server → Always use `dynamic()` with `ssr: false`
❌ Creating new objects in `useFrame` loop → Reuse objects outside component
❌ Using `setState` in `useFrame` → Direct mutation with refs
❌ No lazy loading → Implement Intersection Observer for all images
❌ Hardcoded colors for animations → Use design token conversion utilities
❌ Skipping React Query → Migrate for automatic caching and better UX
❌ No blurhash for LQIP → Always provide blurhash for lazy images
❌ Blocking main thread → Use `requestAnimationFrame` for heavy operations

---

## 🤖 Recommended Subagents (for parallel delegation)

```bash
# Use Task tool to delegate to specialized agents:

Task("frontend-performance-optimization-specialist")
  - Domain: React Query, lazy loading, bundle optimization
  - Trigger: Performance audit fails, slow page loads

Task("responsive-mobile-experience-specialist")
  - Domain: Mobile-first design, touch interactions
  - Trigger: Mobile viewport issues, accessibility concerns

Task("ui-ux-design-systems-architect")
  - Domain: Component reusability, design token consistency
  - Trigger: Animation patterns, color system integration

Task("validation-gates")
  - Domain: Automated testing, Lighthouse audits
  - Trigger: After implementation complete, run quality gates

Task("documentation-manager")
  - Domain: Keep docs in sync with code changes
  - Trigger: After significant code changes
```

---

## 📖 External Resources

### Official Documentation
- **Motion (Framer Motion)**: https://motion.dev/docs/react
- **React Three Fiber**: https://r3f.docs.pmnd.rs/
- **Drei**: https://github.com/pmndrs/drei
- **TanStack Query v5**: https://tanstack.com/query/v5
- **Blurhash**: https://github.com/woltapp/blurhash

### Best Practices Articles (2025)
- **Motion + React 19**: https://www.framer.community/c/developers/trying-to-install-framer-motion-in-react-19-next-15
- **R3F Performance**: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- **React Query + Next.js 15**: https://javascript.plainenglish.io/using-tanstack-query-v5-in-next-js-15-8c2aa60fdf5e
- **Three.js Performance 2025**: https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/

---

**Implementation Status**: ✅ Ready to Execute
**Estimated Timeline**: 10 weeks (2 weeks per phase)
**Success Probability**: 9/10 (one-pass implementation with this context)

This PRP has been generated with comprehensive research including:
- Context7 library documentation (1100+ code snippets analyzed)
- SSH database schema verification (33 tables)
- Complete codebase pattern analysis
- 2025 best practices from WebSearch
- Enigma-specific design system constraints (OKLCH colors)
- React 19 + Next.js 15 compatibility patterns
