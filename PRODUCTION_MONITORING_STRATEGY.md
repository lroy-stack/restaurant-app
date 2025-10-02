# Production Monitoring & Debugging Strategy
## QR Menu App - menu.enigmaconalma.com

**Document Version**: 1.0
**Last Updated**: 2025-10-01
**Target Domain**: menu.enigmaconalma.com
**Stack**: Next.js 15.5.2 + Turbopack + React 19 + Supabase

---

## Executive Summary

This document outlines a comprehensive production monitoring strategy for the Enigma QR Menu PWA, covering error tracking, performance monitoring, real user monitoring (RUM), debugging tools, alerting systems, and key metrics dashboards.

**Current State Analysis**:
- Basic performance monitoring exists (`use-performance-monitor.tsx`)
- Web Vitals tracking configured (LCP, FID, CLS, FCP, TTFB)
- No error tracking service configured
- No session replay capability
- No source map upload strategy
- Missing PWA manifest and service worker files
- Performance budgets defined but not enforced in CI/CD

**Target Metrics**:
- Lighthouse Score: 95+ (all categories)
- LCP < 2.5s | FID < 100ms | CLS < 0.1
- Error Rate < 0.5%
- JavaScript Bundle < 200KB (initial load)
- Time to Interactive < 3.5s on 3G

---

## 1. Error Tracking Setup

### 1.1 Sentry Integration for Next.js 15

**Recommended Tool**: Sentry (Next.js SDK)

#### Installation
```bash
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Configuration Files

**File**: `/sentry.client.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions in production

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'production',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration({
      // Track navigation events
      tracePropagationTargets: [
        "menu.enigmaconalma.com",
        "supabase.enigmaconalma.com",
        /^\//
      ],
    }),
  ],

  // Filter out non-critical errors
  beforeSend(event, hint) {
    // Ignore specific errors
    const ignoreErrors = [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ];

    if (event.exception?.values?.[0]?.value) {
      const errorMessage = event.exception.values[0].value;
      if (ignoreErrors.some(ignore => errorMessage.includes(ignore))) {
        return null;
      }
    }

    return event;
  },

  // Breadcrumbs configuration
  maxBreadcrumbs: 50,

  // Tag all events with user language
  initialScope: {
    tags: {
      "app.version": "1.0.0",
      "app.type": "qr-menu-pwa",
    },
  },
});
```

**File**: `/sentry.server.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Server-side sampling
  tracesSampleRate: 0.05, // 5% for server (higher volume)

  environment: process.env.VERCEL_ENV || 'production',
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Server-specific integrations
  integrations: [
    Sentry.prismaIntegration(),
    Sentry.httpIntegration({ tracing: true }),
  ],

  // Capture Supabase query performance
  beforeSend(event) {
    // Add custom context for API routes
    if (event.request?.url?.includes('/api/')) {
      event.tags = {
        ...event.tags,
        api_route: event.request.url,
      };
    }

    return event;
  },
});
```

**File**: `/sentry.edge.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.05,
  environment: process.env.VERCEL_ENV || 'production',
});
```

#### Source Map Upload Strategy

**File**: `/next.config.ts` (update)
```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // ... existing config

  // Production source maps for Sentry
  productionBrowserSourceMaps: true,

  // Sentry webpack plugin options
  sentry: {
    hideSourceMaps: true, // Hide source maps from public
    widenClientFileUpload: true, // Upload more source maps
  },
};

export default withSentryConfig(nextConfig, {
  org: "enigma-restaurant",
  project: "qr-menu-app",

  // Auth token for uploads
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Silent mode in CI
  silent: true,

  // Automatic release creation
  automaticVercelMonitors: true,
});
```

**Environment Variables** (`.env.local`):
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/123456
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=enigma-restaurant
SENTRY_PROJECT=qr-menu-app
```

### 1.2 Error Boundaries Placement

**Critical Locations**:

1. **Root Error Boundary**: `/src/app/error.tsx`
```tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We've been notified and are working on a fix.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
```

2. **Global Error Boundary**: `/src/app/global-error.tsx`
```tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <h2>Application Error</h2>
        <p>Please refresh the page or contact support.</p>
      </body>
    </html>
  )
}
```

3. **Route-specific Boundaries**: Already exists at `/src/app/(admin)/dashboard/menu/error.tsx`

### 1.3 Client vs Server Error Capture

**Pattern for API Routes**:
```typescript
// /src/app/api/menu/route.ts
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: Request) {
  try {
    // API logic
    const data = await fetchMenuData()
    return NextResponse.json(data)
  } catch (error) {
    // Capture server-side error
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/menu',
        method: 'GET',
      },
      contexts: {
        request: {
          url: request.url,
          headers: Object.fromEntries(request.headers),
        },
      },
    })

    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    )
  }
}
```

**Pattern for Server Components**:
```tsx
// Server component error handling
import * as Sentry from '@sentry/nextjs'

export default async function MenuPage() {
  try {
    const menu = await getMenuItems()
    return <MenuDisplay items={menu} />
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'MenuPage' },
    })
    throw error // Re-throw for error boundary
  }
}
```

### 1.4 Sample Rates Configuration

**Production Sampling Strategy**:
```typescript
// Dynamic sampling based on environment
const SAMPLE_RATES = {
  production: {
    traces: 0.1,        // 10% of performance traces
    sessions: 0.1,      // 10% of normal sessions
    errorsReplay: 1.0,  // 100% of error sessions
  },
  staging: {
    traces: 0.5,
    sessions: 0.5,
    errorsReplay: 1.0,
  },
  development: {
    traces: 1.0,
    sessions: 1.0,
    errorsReplay: 1.0,
  },
}

const env = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'
const rates = SAMPLE_RATES[env as keyof typeof SAMPLE_RATES]
```

**Cost Estimation**:
- 10K daily users
- 10% sampling = 1K sessions/day = 30K sessions/month
- Sentry Team Plan: ~$26/month (50K sessions)

---

## 2. Performance Monitoring

### 2.1 Core Web Vitals Tracking Enhancement

**Update**: `/src/hooks/use-performance-monitor.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'
import * as Sentry from '@sentry/nextjs'

interface PerformanceEntry {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  navigationType?: string
}

interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
  inp: number | null // New: Interaction to Next Paint
}

export function usePerformanceMonitor() {
  const metrics = useRef<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      const reportMetric = (metric: PerformanceEntry) => {
        const { name, value, rating, id } = metric

        // Store metric locally
        switch (name) {
          case 'LCP':
            metrics.current.lcp = value
            break
          case 'FID':
            metrics.current.fid = value
            break
          case 'CLS':
            metrics.current.cls = value
            break
          case 'FCP':
            metrics.current.fcp = value
            break
          case 'TTFB':
            metrics.current.ttfb = value
            break
          case 'INP':
            metrics.current.inp = value
            break
        }

        // Send to Sentry
        Sentry.metrics.distribution(name, value, {
          tags: {
            rating,
            page: window.location.pathname,
          },
          unit: name === 'CLS' ? 'ratio' : 'millisecond',
        })

        // Performance budget alerts
        const budgets = {
          LCP: 2500,
          FID: 100,
          CLS: 0.1,
          FCP: 1800,
          TTFB: 800,
          INP: 200,
        }

        if (name in budgets && value > budgets[name as keyof typeof budgets]) {
          // Alert only for "poor" ratings
          if (rating === 'poor') {
            Sentry.captureMessage(`Performance Budget Exceeded: ${name}`, {
              level: 'warning',
              tags: {
                metric: name,
                value: value.toString(),
                budget: budgets[name as keyof typeof budgets].toString(),
              },
            })
          }
        }

        // Analytics (if Google Analytics is configured)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', name, {
            value: Math.round(name === 'CLS' ? value * 1000 : value),
            event_category: 'Web Vitals',
            event_label: id,
            non_interaction: true,
          })
        }
      }

      // Register all web vitals
      onCLS(reportMetric)
      onFCP(reportMetric)
      onINP(reportMetric) // Replaces FID
      onLCP(reportMetric)
      onTTFB(reportMetric)
    })
  }, [])

  return {
    getMetrics: () => metrics.current,
    getPerformanceScore: () => {
      const { lcp, inp, cls } = metrics.current
      if (!lcp || !inp || cls === null) return null

      let score = 100

      // LCP scoring
      if (lcp > 4000) score -= 40
      else if (lcp > 2500) score -= 20

      // INP scoring
      if (inp > 500) score -= 30
      else if (inp > 200) score -= 15

      // CLS scoring
      if (cls > 0.25) score -= 30
      else if (cls > 0.1) score -= 15

      return Math.max(score, 0)
    },
  }
}
```

### 2.2 Turbopack Bundle Analysis

**Script**: Add to `package.json`
```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "analyze:server": "BUNDLE_ANALYZE=server npm run build",
    "analyze:browser": "BUNDLE_ANALYZE=browser npm run build",
    "analyze:both": "BUNDLE_ANALYZE=both npm run build"
  }
}
```

**Update**: `/next.config.ts`
```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // ... existing config

  // Turbopack-specific optimizations
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack config for bundle analysis
  webpack(config, { isServer }) {
    // Bundle size tracking
    if (process.env.ANALYZE === 'true') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunks
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module: any) {
                return (
                  module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier())
                )
              },
              name(module: any) {
                const hash = require('crypto')
                  .createHash('sha1')
                  .update(module.identifier())
                  .digest('hex')
                  .substring(0, 8)
                return `lib-${hash}`
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module: any, chunks: any) {
                return (
                  'shared-' +
                  require('crypto')
                    .createHash('sha1')
                    .update(
                      chunks.reduce((acc: any, chunk: any) => {
                        return acc + chunk.name
                      }, '')
                    )
                    .digest('hex')
                    .substring(0, 8)
                )
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
          maxInitialRequests: 25,
          minSize: 20000,
        },
      }
    }

    return config
  },
}

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // Sentry config...
})
```

**Budget Configuration**: Create `/budgets.json`
```json
{
  "budgets": [
    {
      "path": "/_next/static/chunks/*.js",
      "maximumFileSizeMb": 0.2,
      "maximumError": "error"
    },
    {
      "path": "/_next/static/css/*.css",
      "maximumFileSizeMb": 0.05,
      "maximumError": "warning"
    },
    {
      "path": "/images/*",
      "maximumFileSizeMb": 0.5,
      "maximumError": "warning"
    }
  ]
}
```

### 2.3 Image Optimization Validation

**Create**: `/src/lib/image-optimizer.ts`
```typescript
export const IMAGE_SIZES = {
  thumbnail: 64,
  small: 256,
  medium: 512,
  large: 1024,
  hero: 1920,
}

export const IMAGE_QUALITY = {
  thumbnail: 75,
  default: 80,
  hero: 85,
}

export function getOptimizedImageUrl(
  src: string,
  width: number = IMAGE_SIZES.medium,
  quality: number = IMAGE_QUALITY.default
): string {
  // ImageKit.io optimization
  if (src.includes('ik.imagekit.io')) {
    const url = new URL(src)
    url.searchParams.set('tr', `w-${width},q-${quality},f-auto`)
    return url.toString()
  }

  return src
}

// Preload critical images
export function preloadImage(src: string, as: 'image' = 'image') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = src
  link.type = 'image/webp'
  document.head.appendChild(link)
}
```

**Usage Pattern**:
```tsx
import Image from 'next/image'
import { getOptimizedImageUrl, IMAGE_SIZES } from '@/lib/image-optimizer'

export function MenuItemImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={getOptimizedImageUrl(src, IMAGE_SIZES.medium)}
      alt={alt}
      width={512}
      height={384}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={80}
    />
  )
}
```

### 2.4 PWA Offline Performance

**Create**: `/public/manifest.json`
```json
{
  "name": "Enigma Cocina Con Alma - Menu",
  "short_name": "Enigma Menu",
  "description": "Digital menu for Enigma Restaurant",
  "start_url": "/menu",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a365d",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/menu-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/menu-mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

**Create**: `/public/sw.js` (Service Worker)
```javascript
const CACHE_NAME = 'enigma-menu-v1.0.0'
const RUNTIME_CACHE = 'runtime-cache'

// Assets to cache on install
const PRECACHE_URLS = [
  '/menu',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip Supabase API calls (always need fresh data)
  if (request.url.includes('supabase.enigmaconalma.com')) {
    return
  }

  // Network-first strategy for API routes
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline')
          })
        })
    )
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Cache images and static assets
        if (request.destination === 'image' || request.url.includes('/_next/static/')) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }

        return response
      })
    })
  )
})
```

**Register Service Worker**: Update `/src/app/layout.tsx`
```tsx
// Add to root layout
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  }
}, [])
```

---

## 3. Real User Monitoring (RUM)

### 3.1 Session Replay Configuration

**Already configured in Sentry** - see Section 1.1

**Privacy Controls**:
```typescript
Sentry.replayIntegration({
  // Mask sensitive data
  maskAllText: false,
  maskAllInputs: true, // Mask form inputs
  blockAllMedia: false,

  // Block specific selectors
  block: [
    '[data-sensitive]',
    '.credit-card-input',
    '.personal-info',
  ],

  // Mask specific selectors
  mask: [
    '.user-email',
    '.phone-number',
  ],

  // Network recording
  networkDetailAllowUrls: [
    'menu.enigmaconalma.com',
    'supabase.enigmaconalma.com',
  ],

  // Performance
  networkCaptureBodies: true,
  networkRequestHeaders: ['X-Custom-Header'],
  networkResponseHeaders: ['X-Response-Time'],
})
```

### 3.2 User Flow Tracking

**Create**: `/src/lib/analytics/flow-tracker.ts`
```typescript
import * as Sentry from '@sentry/nextjs'

type FlowEvent =
  | 'page_view'
  | 'menu_browse'
  | 'item_detail_view'
  | 'add_to_cart'
  | 'cart_view'
  | 'checkout_start'
  | 'order_submit'
  | 'order_complete'

interface FlowContext {
  language?: string
  category?: string
  itemId?: string
  cartTotal?: number
  tableId?: string
}

export class FlowTracker {
  private sessionId: string
  private events: Array<{ event: FlowEvent; timestamp: number; context?: FlowContext }> = []

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  track(event: FlowEvent, context?: FlowContext) {
    const timestamp = Date.now()

    this.events.push({ event, timestamp, context })

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      category: 'user.flow',
      message: event,
      level: 'info',
      data: {
        ...context,
        sessionId: this.sessionId,
      },
    })

    // Track funnel conversion
    if (event === 'order_complete') {
      this.trackConversion()
    }
  }

  private trackConversion() {
    const funnel = [
      'menu_browse',
      'item_detail_view',
      'add_to_cart',
      'checkout_start',
      'order_submit',
      'order_complete',
    ]

    const completedSteps = funnel.filter((step) =>
      this.events.some((e) => e.event === step)
    )

    const conversionRate = (completedSteps.length / funnel.length) * 100

    Sentry.metrics.distribution('conversion.rate', conversionRate, {
      tags: {
        sessionId: this.sessionId,
        completedSteps: completedSteps.length.toString(),
      },
      unit: 'percent',
    })
  }

  getSessionEvents() {
    return this.events
  }
}

// Global instance
export const flowTracker = new FlowTracker()
```

**Usage**:
```tsx
'use client'

import { flowTracker } from '@/lib/analytics/flow-tracker'
import { useEffect } from 'react'

export default function MenuPage() {
  useEffect(() => {
    flowTracker.track('menu_browse', {
      language: 'es',
      category: 'all',
    })
  }, [])

  return (
    <div>
      {/* Menu content */}
    </div>
  )
}
```

### 3.3 Conversion Funnel Monitoring

**Funnel Stages**:
1. Menu Browse (entry)
2. Item Detail View
3. Add to Cart
4. Cart View
5. Checkout Start
6. Order Submit
7. Order Complete (conversion)

**Dashboard Query** (Sentry Discover):
```sql
-- Conversion funnel
SELECT
  count_if(event.type = 'menu_browse') as browse,
  count_if(event.type = 'item_detail_view') as detail_views,
  count_if(event.type = 'add_to_cart') as cart_adds,
  count_if(event.type = 'checkout_start') as checkouts,
  count_if(event.type = 'order_complete') as orders,
  (count_if(event.type = 'order_complete') / count_if(event.type = 'menu_browse') * 100) as conversion_rate
FROM events
WHERE timestamp > now() - interval '24 hours'
```

### 3.4 Multi-Language Performance Comparison

**Create**: `/src/lib/analytics/language-metrics.ts`
```typescript
import * as Sentry from '@sentry/nextjs'

export function trackLanguagePerformance(language: string, metric: string, value: number) {
  Sentry.metrics.distribution(`performance.${metric}`, value, {
    tags: {
      language,
      page: window.location.pathname,
    },
    unit: 'millisecond',
  })
}

// Usage
export function useLanguagePerformance() {
  useEffect(() => {
    const language = getCurrentLanguage() // From i18n context

    // Track bundle size by language
    const performanceData = performance.getEntriesByType('resource')
    const totalSize = performanceData.reduce((acc, entry) => {
      return acc + (entry as PerformanceResourceTiming).transferSize
    }, 0)

    trackLanguagePerformance(language, 'bundle_size', totalSize)
  }, [])
}
```

---

## 4. Production Debugging Tools

### 4.1 Browser DevTools Integration

**React DevTools Profiler** - Add flag:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable React Profiler in production
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production'
      ? { properties: ['^data-test'] }
      : false,
  },
}
```

**Performance Marks**:
```typescript
// /src/lib/debug/performance-marks.ts
export function markStart(label: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`${label}:start`)
  }
}

export function markEnd(label: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`${label}:end`)
    performance.measure(label, `${label}:start`, `${label}:end`)

    const measure = performance.getEntriesByName(label)[0]
    if (measure) {
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`)
    }
  }
}

// Usage
markStart('menu-load')
// ... async operation
markEnd('menu-load')
```

### 4.2 Network Request Logging

**Create**: `/src/lib/debug/network-logger.ts`
```typescript
import * as Sentry from '@sentry/nextjs'

interface RequestLog {
  url: string
  method: string
  duration: number
  status: number
  timestamp: number
}

class NetworkLogger {
  private logs: RequestLog[] = []
  private enabled: boolean = process.env.NODE_ENV === 'production'

  logRequest(log: RequestLog) {
    if (!this.enabled) return

    this.logs.push(log)

    // Alert on slow requests (>3s)
    if (log.duration > 3000) {
      Sentry.captureMessage('Slow network request detected', {
        level: 'warning',
        tags: {
          url: log.url,
          method: log.method,
          duration: log.duration.toString(),
        },
      })
    }

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift()
    }
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export const networkLogger = new NetworkLogger()

// Fetch interceptor
export function createMonitoredFetch() {
  const originalFetch = window.fetch

  window.fetch = async (...args) => {
    const startTime = Date.now()
    const url = typeof args[0] === 'string' ? args[0] : args[0].url
    const method = args[1]?.method || 'GET'

    try {
      const response = await originalFetch(...args)
      const duration = Date.now() - startTime

      networkLogger.logRequest({
        url,
        method,
        duration,
        status: response.status,
        timestamp: Date.now(),
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      networkLogger.logRequest({
        url,
        method,
        duration,
        status: 0,
        timestamp: Date.now(),
      })

      throw error
    }
  }
}
```

### 4.3 Supabase Query Performance

**Create**: `/src/lib/supabase/query-monitor.ts`
```typescript
import { createClient } from '@/lib/supabase/client'
import * as Sentry from '@sentry/nextjs'

export function createMonitoredSupabaseClient() {
  const supabase = createClient()

  // Intercept queries
  const originalFrom = supabase.from.bind(supabase)

  supabase.from = (table: string) => {
    const queryBuilder = originalFrom(table)
    const startTime = Date.now()

    // Override select
    const originalSelect = queryBuilder.select.bind(queryBuilder)
    queryBuilder.select = (...args: any[]) => {
      const result = originalSelect(...args)

      // Add .then() to track execution time
      const originalThen = result.then.bind(result)
      result.then = (onFulfilled: any, onRejected: any) => {
        return originalThen(
          (data: any) => {
            const duration = Date.now() - startTime

            // Log slow queries (>500ms)
            if (duration > 500) {
              Sentry.captureMessage('Slow Supabase query', {
                level: 'warning',
                tags: {
                  table,
                  duration: duration.toString(),
                },
                contexts: {
                  query: {
                    table,
                    select: JSON.stringify(args),
                  },
                },
              })
            }

            return onFulfilled?.(data) || data
          },
          onRejected
        )
      }

      return result
    }

    return queryBuilder
  }

  return supabase
}
```

### 4.4 State Debugging (React Context/Zustand)

**Create**: `/src/lib/debug/state-debugger.ts`
```typescript
export function createStateLogger<T extends object>(
  storeName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  return (setState: any, getState: any, api: any) => {
    if (!enabled) return

    // Log state changes
    const originalSetState = setState
    api.setState = (update: any, replace: boolean) => {
      const previousState = getState()
      originalSetState(update, replace)
      const nextState = getState()

      console.group(`🔄 ${storeName} State Change`)
      console.log('Previous:', previousState)
      console.log('Update:', update)
      console.log('Next:', nextState)
      console.groupEnd()
    }
  }
}

// Usage with Zustand
import create from 'zustand'
import { devtools } from 'zustand/middleware'

export const useCartStore = create(
  devtools(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    }),
    { name: 'CartStore' }
  )
)
```

---

## 5. Alerting & Incident Response

### 5.1 Critical Error Thresholds

**Sentry Alerts Configuration**:

1. **High Error Rate Alert**
   - Condition: Error rate > 1% of all events
   - Window: 5 minutes
   - Action: Email + Slack notification
   - Team: @engineering

2. **Performance Degradation Alert**
   - Condition: LCP > 4s for 10% of users
   - Window: 15 minutes
   - Action: Email notification
   - Team: @frontend-team

3. **API Failure Alert**
   - Condition: API error rate > 5%
   - Window: 5 minutes
   - Action: PagerDuty incident
   - Team: @backend-team

4. **Budget Exceeded Alert**
   - Condition: JavaScript bundle > 250KB
   - Window: On deployment
   - Action: Block deployment + Slack
   - Team: @engineering

**Alert Configuration File**: Create `/.sentry/alerts.yaml`
```yaml
alerts:
  - name: "High Error Rate - Production"
    conditions:
      - type: "event_frequency"
        value: 100
        interval: "5m"
    filters:
      - type: "environment"
        value: "production"
    actions:
      - type: "slack"
        workspace: "enigma-tech"
        channel: "#alerts-production"
      - type: "email"
        target: "engineering@enigmaconalma.com"

  - name: "LCP Performance Degradation"
    conditions:
      - type: "metric_threshold"
        metric: "measurements.lcp"
        threshold: 4000
        percentile: 0.9
        interval: "15m"
    actions:
      - type: "email"
        target: "frontend@enigmaconalma.com"

  - name: "Supabase Connection Errors"
    conditions:
      - type: "event_frequency"
        value: 10
        interval: "5m"
      - type: "tag_match"
        tag: "error.type"
        value: "SupabaseError"
    actions:
      - type: "pagerduty"
        service_key: "YOUR_PD_KEY"
```

### 5.2 Performance Degradation Alerts

**Create**: `/src/lib/monitoring/performance-alerts.ts`
```typescript
import * as Sentry from '@sentry/nextjs'

interface PerformanceThreshold {
  metric: string
  warning: number
  critical: number
}

const THRESHOLDS: PerformanceThreshold[] = [
  { metric: 'LCP', warning: 2500, critical: 4000 },
  { metric: 'FID', warning: 100, critical: 300 },
  { metric: 'CLS', warning: 0.1, critical: 0.25 },
  { metric: 'TTFB', warning: 800, critical: 1800 },
]

export function checkPerformanceThresholds(metrics: Record<string, number>) {
  THRESHOLDS.forEach(({ metric, warning, critical }) => {
    const value = metrics[metric]

    if (value > critical) {
      Sentry.captureMessage(`CRITICAL: ${metric} exceeded threshold`, {
        level: 'error',
        tags: {
          metric,
          value: value.toString(),
          threshold: critical.toString(),
        },
      })
    } else if (value > warning) {
      Sentry.captureMessage(`WARNING: ${metric} approaching threshold`, {
        level: 'warning',
        tags: {
          metric,
          value: value.toString(),
          threshold: warning.toString(),
        },
      })
    }
  })
}
```

### 5.3 Supabase Connection Issues

**Create**: `/src/lib/monitoring/supabase-health.ts`
```typescript
import { createClient } from '@/lib/supabase/client'
import * as Sentry from '@sentry/nextjs'

export async function checkSupabaseHealth() {
  const supabase = createClient()
  const startTime = Date.now()

  try {
    // Simple health check query
    const { data, error } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1)

    const duration = Date.now() - startTime

    if (error) {
      Sentry.captureException(error, {
        tags: {
          service: 'supabase',
          check: 'health',
        },
      })
      return false
    }

    // Alert on slow connection
    if (duration > 2000) {
      Sentry.captureMessage('Supabase connection slow', {
        level: 'warning',
        tags: {
          duration: duration.toString(),
        },
      })
    }

    return true
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        service: 'supabase',
        check: 'health',
      },
    })
    return false
  }
}

// Run periodic health checks
if (typeof window !== 'undefined') {
  setInterval(() => {
    checkSupabaseHealth()
  }, 60000) // Every 60 seconds
}
```

### 5.4 Email Delivery Failures

**Update**: `/src/app/api/email/route.ts`
```typescript
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = await sendEmail({
      to: body.to,
      subject: body.subject,
      html: body.html,
    })

    if (!result.success) {
      // Log email failure
      Sentry.captureMessage('Email delivery failed', {
        level: 'error',
        tags: {
          service: 'email',
          recipient: body.to,
        },
        contexts: {
          email: {
            subject: body.subject,
            error: result.error,
          },
        },
      })

      return NextResponse.json(
        { error: 'Email delivery failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { service: 'email' },
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 6. Dashboard & Metrics

### 6.1 Key Metrics to Track Daily

**Production Dashboard** (Sentry + Custom):

1. **Performance Metrics** (Target: 90%+ "good" ratings)
   - LCP: < 2.5s
   - FID/INP: < 100ms
   - CLS: < 0.1
   - TTFB: < 800ms

2. **Error Metrics** (Target: < 0.5% error rate)
   - Total errors (count)
   - Error rate (%)
   - Unique users affected
   - Most common errors (top 10)

3. **User Metrics**
   - Daily Active Users (DAU)
   - Session duration (avg)
   - Pages per session (avg)
   - Bounce rate (%)

4. **Business Metrics**
   - Menu views (total)
   - Item detail views (total)
   - Orders placed (total)
   - Conversion rate (%)

5. **Infrastructure Metrics**
   - API response time (p50, p95, p99)
   - Supabase query time (avg)
   - Cache hit rate (%)
   - Service worker cache size

### 6.2 Weekly Review Checklist

**Monday Morning Review** (15 minutes):

```markdown
## Weekly Performance Review - Week of [DATE]

### 1. Core Web Vitals Trends
- [ ] LCP trend (vs last week): _______
- [ ] FID/INP trend (vs last week): _______
- [ ] CLS trend (vs last week): _______
- [ ] Overall performance score: _______

### 2. Error Analysis
- [ ] Total errors this week: _______
- [ ] New error types introduced: _______
- [ ] Critical errors resolved: _______
- [ ] Open critical errors: _______

### 3. User Experience
- [ ] Average session duration: _______
- [ ] Conversion rate: _______
- [ ] Top exit pages: _______
- [ ] Mobile vs Desktop performance gap: _______

### 4. Infrastructure Health
- [ ] Supabase uptime: _______
- [ ] Average API response time: _______
- [ ] Failed API requests (%): _______
- [ ] Service worker cache hit rate: _______

### 5. Action Items
- [ ] _______________________________
- [ ] _______________________________
- [ ] _______________________________

### 6. Deployments This Week
- [ ] Number of deployments: _______
- [ ] Deployment success rate: _______
- [ ] Rollbacks performed: _______
```

### 6.3 Monthly Performance Reports

**Create**: `/scripts/generate-monthly-report.ts`
```typescript
import * as Sentry from '@sentry/node'

interface MonthlyReport {
  month: string
  performance: {
    lcp: { p50: number; p95: number; trend: string }
    fid: { p50: number; p95: number; trend: string }
    cls: { p50: number; p95: number; trend: string }
  }
  errors: {
    total: number
    critical: number
    trend: string
    topErrors: Array<{ message: string; count: number }>
  }
  users: {
    dau: number
    sessions: number
    avgDuration: number
  }
  business: {
    menuViews: number
    orders: number
    conversionRate: number
  }
}

async function generateMonthlyReport(): Promise<MonthlyReport> {
  // Fetch from Sentry API
  const response = await fetch(
    'https://sentry.io/api/0/organizations/enigma-restaurant/stats_v2/',
    {
      headers: {
        Authorization: `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
      },
    }
  )

  const data = await response.json()

  // Process and format data
  const report: MonthlyReport = {
    month: new Date().toISOString().slice(0, 7),
    performance: {
      lcp: calculatePercentiles(data.lcp),
      fid: calculatePercentiles(data.fid),
      cls: calculatePercentiles(data.cls),
    },
    errors: {
      total: data.errors.total,
      critical: data.errors.critical,
      trend: calculateTrend(data.errors.trend),
      topErrors: data.errors.top,
    },
    users: {
      dau: data.users.dau,
      sessions: data.users.sessions,
      avgDuration: data.users.avgDuration,
    },
    business: {
      menuViews: data.business.menuViews,
      orders: data.business.orders,
      conversionRate: data.business.conversionRate,
    },
  }

  return report
}

function calculatePercentiles(data: number[]) {
  const sorted = data.sort((a, b) => a - b)
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    trend: 'stable', // Calculate actual trend
  }
}

function calculateTrend(data: number[]): string {
  if (data.length < 2) return 'insufficient data'
  const recent = data[data.length - 1]
  const previous = data[data.length - 2]
  const change = ((recent - previous) / previous) * 100

  if (change > 10) return 'increasing ⬆️'
  if (change < -10) return 'decreasing ⬇️'
  return 'stable →'
}

// Run report generation
generateMonthlyReport().then((report) => {
  console.log('Monthly Report Generated:')
  console.log(JSON.stringify(report, null, 2))

  // Send report via email or save to file
})
```

**Add to package.json**:
```json
{
  "scripts": {
    "report:monthly": "ts-node scripts/generate-monthly-report.ts"
  }
}
```

---

## 7. Implementation Timeline

### Week 1: Foundation (Days 1-7)

**Day 1-2: Error Tracking Setup**
- [ ] Install Sentry SDK
- [ ] Configure client/server/edge configs
- [ ] Create error boundaries
- [ ] Set up source maps
- [ ] Test error capture

**Day 3-4: Performance Monitoring**
- [ ] Enhance web vitals tracking
- [ ] Add INP metric
- [ ] Configure bundle analyzer
- [ ] Create performance budgets
- [ ] Set up CI/CD checks

**Day 5-7: PWA Implementation**
- [ ] Create manifest.json
- [ ] Implement service worker
- [ ] Generate PWA icons
- [ ] Test offline functionality
- [ ] Add install prompt

### Week 2: Advanced Features (Days 8-14)

**Day 8-9: Session Replay**
- [ ] Configure replay integration
- [ ] Set privacy controls
- [ ] Test replay capture
- [ ] Configure sampling rates
- [ ] Review sample sessions

**Day 10-11: User Flow Tracking**
- [ ] Implement flow tracker
- [ ] Add conversion funnel
- [ ] Configure language metrics
- [ ] Test tracking events
- [ ] Validate data in Sentry

**Day 12-14: Debugging Tools**
- [ ] Add network logger
- [ ] Create Supabase monitor
- [ ] Implement state debugger
- [ ] Add performance marks
- [ ] Test debugging workflow

### Week 3: Alerting & Dashboards (Days 15-21)

**Day 15-16: Alert Configuration**
- [ ] Set error rate alerts
- [ ] Configure performance alerts
- [ ] Add Supabase health checks
- [ ] Set up email notifications
- [ ] Test alert delivery

**Day 17-18: Dashboard Setup**
- [ ] Create Sentry dashboards
- [ ] Configure custom queries
- [ ] Set up weekly reports
- [ ] Create monthly report script
- [ ] Document metrics

**Day 19-21: Testing & Validation**
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Error injection tests
- [ ] Performance regression tests
- [ ] Documentation review

---

## 8. Cost Analysis

### Monthly Costs (Estimated)

1. **Sentry**
   - Team Plan: $26/month (50K errors, 100K transactions)
   - Session Replay: +$29/month (5K replays)
   - **Total**: ~$55/month

2. **Infrastructure**
   - Vercel Pro: $20/month (already have)
   - Supabase: $25/month (already have)
   - ImageKit.io: $0 (free tier)
   - **Total**: $0 additional

3. **Tools**
   - Lighthouse CI: Free
   - Bundle Analyzer: Free
   - Web Vitals: Free
   - **Total**: $0

**Total Monthly Cost**: ~$55/month

**ROI**:
- Reduced downtime: +$500/month (fewer lost orders)
- Faster issue resolution: +$300/month (less engineer time)
- Better user experience: +$200/month (higher conversion)
- **Total Value**: +$1,000/month

**Break-even**: Immediate (20x ROI)

---

## 9. Success Criteria

### 3-Month Goals

**Performance**:
- [ ] Lighthouse score 95+ on mobile
- [ ] LCP < 2.0s (95th percentile)
- [ ] CLS < 0.05
- [ ] JavaScript bundle < 180KB

**Reliability**:
- [ ] Error rate < 0.3%
- [ ] 99.9% uptime
- [ ] MTTR < 15 minutes
- [ ] Zero critical errors unresolved

**User Experience**:
- [ ] Conversion rate +15%
- [ ] Session duration +20%
- [ ] Bounce rate -10%
- [ ] Mobile performance parity

**Monitoring Coverage**:
- [ ] 100% of API routes monitored
- [ ] All critical user flows tracked
- [ ] 24/7 alerting coverage
- [ ] Weekly performance reviews

---

## 10. Maintenance & Support

### Daily Tasks (5 minutes)
- Review Sentry dashboard
- Check error rate
- Monitor performance trends
- Verify alert health

### Weekly Tasks (30 minutes)
- Complete weekly checklist
- Review top errors
- Analyze conversion funnel
- Update documentation

### Monthly Tasks (2 hours)
- Generate performance report
- Review budget compliance
- Update alert thresholds
- Team retrospective

### Quarterly Tasks (1 day)
- Performance audit
- Tool evaluation
- Strategy review
- Goal setting

---

## Appendix A: Tool Comparison

| Tool | Error Tracking | Performance | Session Replay | Cost |
|------|----------------|-------------|----------------|------|
| **Sentry** | ✅ Excellent | ✅ Excellent | ✅ Yes | $55/mo |
| LogRocket | ✅ Good | ⚠️ Limited | ✅ Yes | $99/mo |
| Datadog RUM | ✅ Good | ✅ Excellent | ✅ Yes | $150/mo |
| New Relic | ⚠️ Limited | ✅ Excellent | ❌ No | $99/mo |
| AppSignal | ✅ Good | ✅ Good | ❌ No | $49/mo |

**Recommendation**: Sentry (best value + Next.js integration)

---

## Appendix B: Critical File Paths

**Configuration**:
- `/sentry.client.config.ts`
- `/sentry.server.config.ts`
- `/sentry.edge.config.ts`
- `/next.config.ts`
- `/public/manifest.json`
- `/public/sw.js`

**Monitoring**:
- `/src/hooks/use-performance-monitor.tsx`
- `/src/components/performance/performance-provider.tsx`
- `/src/lib/analytics/flow-tracker.ts`
- `/src/lib/monitoring/performance-alerts.ts`
- `/src/lib/monitoring/supabase-health.ts`

**Debugging**:
- `/src/lib/debug/performance-marks.ts`
- `/src/lib/debug/network-logger.ts`
- `/src/lib/debug/state-debugger.ts`

**Reports**:
- `/scripts/generate-monthly-report.ts`

---

## Appendix C: Emergency Runbook

### High Error Rate (>5%)

1. **Immediate Actions** (0-5 minutes)
   - Check Sentry dashboard
   - Identify error source
   - Check recent deployments
   - Verify Supabase status

2. **Investigation** (5-15 minutes)
   - Review error stack traces
   - Check session replays
   - Analyze user flow
   - Test locally

3. **Resolution** (15-30 minutes)
   - Fix critical bug
   - Deploy hotfix
   - Verify error rate drops
   - Monitor for 1 hour

### Performance Degradation (LCP >5s)

1. **Immediate Actions**
   - Check CDN status
   - Verify image optimization
   - Review recent changes
   - Test on multiple devices

2. **Investigation**
   - Run Lighthouse audit
   - Analyze bundle size
   - Check API response times
   - Review Supabase queries

3. **Resolution**
   - Optimize critical path
   - Add caching
   - Lazy load components
   - Deploy fix

### Supabase Connection Failures

1. **Immediate Actions**
   - Check Supabase dashboard
   - Verify VPS status
   - Test direct connection
   - Enable offline mode

2. **Investigation**
   - Review error logs
   - Check network latency
   - Verify credentials
   - Test API endpoints

3. **Resolution**
   - Restart services if needed
   - Update connection pool
   - Add retry logic
   - Monitor recovery

---

**Document Status**: ✅ Complete
**Next Review**: 2025-11-01
**Owner**: Engineering Team
**Contact**: tech@enigmaconalma.com
