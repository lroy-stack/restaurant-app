# 🛡️ GUÍA COMPLETA DE CONFIGURACIÓN SENTRY
## Proyecto Enigma Cocina Con Alma - Monitoreo de Producción 2025

> **Fecha de Creación**: 2025-01-XX
> **Stack**: Next.js 15.5.2 + Turbopack + Supabase + Prisma + NextAuth
> **Target**: menu.enigmaconalma.com + dashboard.enigmaconalma.com
> **Versión Sentry Recomendada**: @sentry/nextjs ^10.13.0+

---

## 📋 ÍNDICE

1. [Introducción y Beneficios](#introducción-y-beneficios)
2. [Requisitos y Compatibilidad](#requisitos-y-compatibilidad)
3. [Instalación Paso a Paso](#instalación-paso-a-paso)
4. [Configuración Base](#configuración-base)
5. [Instrumentación por Runtime](#instrumentación-por-runtime)
6. [Error Boundaries y Error Handling](#error-boundaries-y-error-handling)
7. [Integración con Stack Enigma](#integración-con-stack-enigma)
8. [Performance Monitoring](#performance-monitoring)
9. [Session Replay](#session-replay)
10. [Source Maps](#source-maps)
11. [Alertas y Notificaciones](#alertas-y-notificaciones)
12. [Best Practices de Producción](#best-practices-de-producción)
13. [Troubleshooting](#troubleshooting)
14. [Costos y Optimización](#costos-y-optimización)

---

## 🎯 INTRODUCCIÓN Y BENEFICIOS

### ¿Por qué Sentry para Enigma?

**Problema actual:**
- ❌ Sin visibilidad de errores en producción
- ❌ Usuarios reportan problemas que no podemos reproducir
- ❌ No sabemos cuándo fallan los pedidos o reservas
- ❌ Sin métricas de performance real

**Solución con Sentry:**
- ✅ **Error Tracking en tiempo real** - Notificación instantánea de errores
- ✅ **Context completo** - Stack traces, user info, breadcrumbs, request data
- ✅ **Performance Monitoring** - Identificar páginas lentas y consultas DB problemáticas
- ✅ **Session Replay** - Ver exactamente qué hizo el usuario antes del error
- ✅ **Release Tracking** - Correlacionar errores con deploys específicos
- ✅ **User Feedback** - Widget para que usuarios reporten problemas

### Beneficios Específicos para Enigma

| Feature | Impacto en Enigma |
|---------|-------------------|
| **Error Tracking** | Detectar fallos en proceso de pedidos/reservas inmediatamente |
| **Performance** | Identificar cuellos de botella en carga de menú y checkout |
| **Session Replay** | Ver cómo usuarios interactúan con sistema de mesas y QR |
| **Breadcrumbs** | Seguir flujo completo: QR scan → Menu → Cart → Order |
| **Supabase Integration** | Monitorear errores de queries y RLS policies |
| **Auth Errors** | Detectar problemas con NextAuth y sesiones |
| **Email Failures** | Alertas cuando emails de confirmación fallan |

---

## 🔧 REQUISITOS Y COMPATIBILIDAD

### Versiones Necesarias

```json
{
  "@sentry/nextjs": "^10.13.0",  // Mínimo para Turbopack support
  "next": "^15.4.1",             // Mínimo para full Turbopack
  "react": "^19.1.0",            // Compatible
  "typescript": "^5.0.0"         // Recomendado
}
```

**Estado Actual del Proyecto Enigma:**
- ✅ Next.js: 15.5.2 (Compatible)
- ✅ React: 19.1.0 (Compatible)
- ✅ Turbopack: Habilitado en dev y build
- ✅ TypeScript: 5.x (Compatible)

### Compatibilidad con Turbopack

**Importante**: A partir de @sentry/nextjs v10.13.0, el soporte completo para Turbopack en producción está disponible.

**Limitaciones conocidas:**
- `runAfterProductionCompile` hook no funciona con Turbopack
- Source maps requieren configuración especial
- Tunnel route necesita exclusión en middleware

---

## 📦 INSTALACIÓN PASO A PASO

### Paso 1: Instalar Sentry SDK

```bash
cd /Users/lr0y/local-ai-packaged/enigma-app

# Instalar con npm
npm install --save @sentry/nextjs
```

### Paso 2: Ejecutar Sentry Wizard (Recomendado)

El wizard automáticamente configura todos los archivos necesarios:

```bash
npx @sentry/wizard@latest -i nextjs
```

**El wizard hará:**
1. Crear `sentry.client.config.ts` (o `instrumentation-client.ts` en SDK 9.9.0+)
2. Crear `sentry.server.config.ts`
3. Crear `sentry.edge.config.ts`
4. Modificar `next.config.ts` para incluir Sentry plugin
5. Crear `.sentryclirc` para autenticación
6. Agregar variables de entorno a `.env.local`

**Durante el wizard:**
- Crear cuenta en sentry.io (si no existe)
- Crear proyecto "Enigma Restaurant Platform"
- Copiar DSN (Data Source Name)
- Configurar auth token para source maps

### Paso 3: Configurar Variables de Entorno

**Archivo**: `.env.local`

```bash
# Sentry Configuration
SENTRY_DSN=https://[YOUR_KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
SENTRY_ORG=enigma-restaurant
SENTRY_PROJECT=enigma-platform

# Auth Token para Source Maps (Obtener de sentry.io/settings/account/api/auth-tokens/)
SENTRY_AUTH_TOKEN=sntrys_[YOUR_TOKEN]

# Environment
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production  # o 'development', 'staging'
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**⚠️ IMPORTANTE**: Agregar al `.gitignore`:
```bash
.sentryclirc
.env.local
```

### Paso 4: Configurar `.sentryclirc`

**Archivo**: `.sentryclirc` (root del proyecto)

```ini
[auth]
token=sntrys_[YOUR_TOKEN]

[defaults]
org=enigma-restaurant
project=enigma-platform
```

---

## ⚙️ CONFIGURACIÓN BASE

### Estructura de Archivos

```
enigma-app/
├── instrumentation.ts              # Server-side instrumentation (Node.js)
├── instrumentation-client.ts       # Client-side instrumentation
├── sentry.client.config.ts         # Client Sentry init
├── sentry.server.config.ts         # Server Sentry init
├── sentry.edge.config.ts           # Edge Sentry init
├── next.config.ts                  # Modified with Sentry plugin
├── .sentryclirc                    # Sentry CLI config
└── src/
    ├── app/
    │   ├── global-error.tsx        # Root error boundary
    │   ├── error.tsx               # App-level error boundary
    │   └── (admin)/
    │       └── dashboard/
    │           └── error.tsx       # Dashboard error boundary
    └── lib/
        └── sentry/
            ├── config.ts           # Shared Sentry config
            ├── error-handler.ts    # Custom error handler
            └── context.ts          # Custom context helpers
```

### Configuración Base Compartida

**Archivo**: `src/lib/sentry/config.ts`

```typescript
import { BrowserOptions, NodeOptions } from '@sentry/nextjs'

// Shared configuration
export const baseSentryConfig = {
  // Environment
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Sample rate for error events (100% = all errors)
  sampleRate: 1.0,

  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'fb_xd_fragment',
    'Non-Error promise rejection captured',

    // Network errors that are expected
    'NetworkError',
    'Network request failed',
    'Failed to fetch',

    // User cancelled actions
    'AbortError',
    'The user aborted a request',
  ],

  // Ignore URLs (crawlers, bots, etc)
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,

    // Browser extensions
    /^moz-extension:\/\//i,
    /^safari-extension:\/\//i,
  ],

  // Configure which URLs to allow
  allowUrls: [
    /menu\.enigmaconalma\.com/,
    /dashboard\.enigmaconalma\.com/,
    /localhost/,
  ],
}

// Client-specific config
export const clientConfig: Partial<BrowserOptions> = {
  ...baseSentryConfig,

  // Performance monitoring sample rate
  // 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay sample rate
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Breadcrumbs
  maxBreadcrumbs: 100,

  // Attach stack traces to all events
  attachStacktrace: true,

  // Before send hook (client)
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }

    // Don't send events in development (unless explicitly enabled)
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      console.log('Sentry event (dev mode):', event)
      return null
    }

    return event
  },

  // Before breadcrumb hook
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter sensitive console logs
    if (breadcrumb.category === 'console' && breadcrumb.data) {
      const message = breadcrumb.data.arguments?.[0]
      if (typeof message === 'string' && message.includes('password')) {
        return null
      }
    }

    return breadcrumb
  },
}

// Server-specific config
export const serverConfig: Partial<NodeOptions> = {
  ...baseSentryConfig,

  // Performance monitoring sample rate (server)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Before send hook (server)
  beforeSend(event, hint) {
    // Filter sensitive server data
    if (event.request) {
      // Remove auth headers
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-auth-token']
      }

      // Remove sensitive query params
      if (event.request.query_string) {
        const params = new URLSearchParams(event.request.query_string)
        params.delete('token')
        params.delete('api_key')
        params.delete('password')
        event.request.query_string = params.toString()
      }
    }

    // Filter database connection strings
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map(exception => {
        if (exception.value) {
          exception.value = exception.value.replace(
            /postgres:\/\/[^@]+@/g,
            'postgres://***:***@'
          )
        }
        return exception
      })
    }

    return event
  },
}

// Tags for context
export const defaultTags = {
  project: 'enigma',
  application: 'restaurant-platform',
}

// User context helper
export function setUserContext(user: {
  id: string
  email?: string
  role?: string
}) {
  const { setUser } = require('@sentry/nextjs')
  setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  })
}

// Clear user context (on logout)
export function clearUserContext() {
  const { setUser } = require('@sentry/nextjs')
  setUser(null)
}
```

---

## 🌐 INSTRUMENTACIÓN POR RUNTIME

### Client-Side: `instrumentation-client.ts`

**Archivo**: `instrumentation-client.ts` (root del proyecto)

```typescript
import * as Sentry from '@sentry/nextjs'
import { clientConfig, defaultTags } from './src/lib/sentry/config'

// Initialize Sentry for client
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ...clientConfig,

  // Set default tags
  initialScope: {
    tags: {
      ...defaultTags,
      runtime: 'browser',
    },
  },

  // Integrations
  integrations: [
    // Browser tracing
    Sentry.browserTracingIntegration({
      // Track page loads
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/.*\.enigmaconalma\.com/,
      ],

      // Custom instrumentation for React Router
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        // You can pass React Router hooks here if needed
      ),
    }),

    // Session Replay
    Sentry.replayIntegration({
      // Privacy settings
      maskAllText: false,  // Don't mask all text
      maskAllInputs: true, // Mask input values
      blockAllMedia: false,

      // Network recording
      networkDetailAllowUrls: [
        /^https:\/\/supabase\.enigmaconalma\.com/,
        /^https:\/\/menu\.enigmaconalma\.com\/api/,
      ],

      // Performance
      networkCaptureBodies: true,
      networkRequestHeaders: ['X-Custom-Header'],
      networkResponseHeaders: ['X-Response-Time'],
    }),

    // React profiler
    Sentry.reactProfilerIntegration(),
  ],

  // Transport options
  transportOptions: {
    // Batch events
    maxBatchSize: 10,
  },
})

// Enhanced Web Vitals tracking
export function onRouterTransitionStart(
  url: string,
  navigationType: 'push' | 'replace' | 'traverse'
) {
  // Add breadcrumb for navigation
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigating to ${url}`,
    level: 'info',
    data: {
      navigationType,
      from: window.location.pathname,
      to: url,
      timestamp: Date.now(),
    },
  })

  // Mark performance
  performance.mark(`nav-start-${url}`)
}

// Track Web Vitals
if (typeof window !== 'undefined') {
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    function sendToSentry(metric: any) {
      Sentry.setMeasurement(metric.name, metric.value, metric.unit)

      // Also send as event for aggregation
      Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        level: 'info',
        tags: {
          web_vital: metric.name,
          rating: metric.rating,
        },
        contexts: {
          vitals: {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          },
        },
      })
    }

    onCLS(sendToSentry)
    onFID(sendToSentry)
    onFCP(sendToSentry)
    onLCP(sendToSentry)
    onTTFB(sendToSentry)
    onINP(sendToSentry)
  })
}
```

### Server-Side: `instrumentation.ts`

**Archivo**: `instrumentation.ts` (root del proyecto)

```typescript
import { type Instrumentation } from 'next'

// Server-side instrumentation hook
export async function register() {
  // Only load Sentry for Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs')
    const { serverConfig, defaultTags } = await import('./src/lib/sentry/config')

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      ...serverConfig,

      initialScope: {
        tags: {
          ...defaultTags,
          runtime: 'nodejs',
        },
      },

      integrations: [
        // Prisma integration
        Sentry.prismaIntegration({
          // Options for Prisma client
        }),

        // HTTP integration
        Sentry.httpIntegration({
          tracing: {
            // Don't create spans for healthcheck
            ignoreOutgoingRequests: (url) => {
              return url.includes('/api/health')
            },
          },
        }),
      ],
    })
  }

  // Edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs')
    const { baseSentryConfig, defaultTags } = await import('./src/lib/sentry/config')

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      ...baseSentryConfig,
      tracesSampleRate: 0.05,

      initialScope: {
        tags: {
          ...defaultTags,
          runtime: 'edge',
        },
      },
    })
  }
}

// Capture server errors automatically
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const Sentry = await import('@sentry/nextjs')

  // Capture the error with context
  Sentry.captureRequestError(err, request, context)

  // Add custom context
  Sentry.withScope((scope) => {
    scope.setContext('request', {
      url: request.url,
      method: request.method,
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'referer': request.headers.get('referer'),
      },
    })

    if (context.routerKind) {
      scope.setTag('router_kind', context.routerKind)
    }

    if (context.route) {
      scope.setTag('route', context.route)
    }
  })
}
```

### Server Config: `sentry.server.config.ts`

**Archivo**: `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs'
import { serverConfig, defaultTags } from './src/lib/sentry/config'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ...serverConfig,

  initialScope: {
    tags: {
      ...defaultTags,
      runtime: 'server',
    },
  },

  // Integrations for server
  integrations: [
    // Prisma integration
    Sentry.prismaIntegration(),

    // Node profiling
    Sentry.nodeProfilingIntegration(),
  ],
})
```

### Edge Config: `sentry.edge.config.ts`

**Archivo**: `sentry.edge.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs'
import { baseSentryConfig, defaultTags } from './src/lib/sentry/config'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ...baseSentryConfig,
  tracesSampleRate: 0.05,

  initialScope: {
    tags: {
      ...defaultTags,
      runtime: 'edge',
    },
  },
})
```

---

## 🚨 ERROR BOUNDARIES Y ERROR HANDLING

### Root Error Boundary: `global-error.tsx`

**Archivo**: `src/app/global-error.tsx`

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error with full context
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        error_boundary: 'global',
        digest: error.digest,
      },
      contexts: {
        react: {
          componentStack: (error as any).componentStack,
        },
      },
    })
  }, [error])

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-destructive">
              Algo salió mal
            </h1>
            <p className="text-muted-foreground">
              Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="default">
              Intentar de nuevo
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Volver al inicio
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Detalles del error (dev)
              </summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-xs">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  )
}
```

### App-Level Error Boundary: `src/app/error.tsx`

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        error_boundary: 'app',
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-sm text-muted-foreground">
              Algo salió mal al cargar esta página
            </p>
          </div>
        </div>

        <p className="text-sm">
          Por favor, inténtalo de nuevo. Si el problema persiste, contacta con soporte.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={reset} className="flex-1">
            Reintentar
          </Button>
          <Button onClick={() => window.history.back()} variant="outline" className="flex-1">
            Volver
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

### Custom Error Handler

**Archivo**: `src/lib/sentry/error-handler.ts`

```typescript
import * as Sentry from '@sentry/nextjs'

export interface ErrorContext {
  user?: {
    id: string
    email?: string
    role?: string
  }
  extra?: Record<string, any>
  tags?: Record<string, string>
  level?: Sentry.SeverityLevel
}

/**
 * Capture exception with enhanced context
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext
) {
  Sentry.withScope((scope) => {
    // Set user context
    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        role: context.user.role,
      })
    }

    // Set extra context
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    // Set tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    // Set level
    if (context?.level) {
      scope.setLevel(context.level)
    }

    // Capture the exception
    Sentry.captureException(error)
  })
}

/**
 * Capture message with context
 */
export function captureMessage(
  message: string,
  context?: ErrorContext
) {
  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
      })
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    Sentry.captureMessage(message, context?.level || 'info')
  })
}

/**
 * Add breadcrumb for tracking user flow
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    level: 'info',
    timestamp: Date.now() / 1000,
    data,
  })
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string,
  data?: Record<string, any>
) {
  return Sentry.startTransaction({
    name,
    op,
    data,
  })
}

/**
 * Measure async operation
 */
export async function measureAsync<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(operationName, 'function')

  try {
    const result = await fn()
    transaction.setStatus('ok')
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    captureException(error, {
      tags: { operation: operationName },
    })
    throw error
  } finally {
    transaction.finish()
  }
}
```

---

## 🔌 INTEGRACIÓN CON STACK ENIGMA

### Integración con Supabase

**Archivo**: `src/lib/sentry/supabase-integration.ts`

```typescript
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/utils/supabase/client'
import { createServiceClient } from '@/utils/supabase/server'

/**
 * Wrap Supabase client with Sentry monitoring
 */
export function monitorSupabaseClient() {
  const supabase = createClient()

  // Intercept all Supabase queries
  const originalFrom = supabase.from.bind(supabase)

  supabase.from = function(table: string) {
    const query = originalFrom(table)

    // Wrap query execution
    const originalSelect = query.select.bind(query)
    query.select = function(...args: any[]) {
      const transaction = Sentry.startTransaction({
        name: `supabase.select.${table}`,
        op: 'db.query',
        data: {
          table,
          method: 'select',
        },
      })

      const result = originalSelect(...args)

      // Wrap promise to capture errors
      const originalThen = result.then.bind(result)
      result.then = function(onFulfilled: any, onRejected: any) {
        return originalThen(
          (data: any) => {
            transaction.setStatus('ok')
            transaction.finish()
            return onFulfilled?.(data) ?? data
          },
          (error: any) => {
            transaction.setStatus('internal_error')
            transaction.finish()

            Sentry.captureException(error, {
              tags: {
                supabase_table: table,
                supabase_operation: 'select',
              },
            })

            return onRejected?.(error) ?? Promise.reject(error)
          }
        )
      }

      return result
    }

    return query
  }

  return supabase
}

/**
 * Monitor Supabase RLS errors
 */
export function captureSupabaseError(
  error: any,
  context: {
    table: string
    operation: string
    userId?: string
  }
) {
  // Check if it's an RLS policy error
  const isRLSError = error?.code === 'PGRST301' ||
                     error?.message?.includes('policy')

  Sentry.captureException(error, {
    level: isRLSError ? 'warning' : 'error',
    tags: {
      supabase: 'true',
      table: context.table,
      operation: context.operation,
      rls_error: isRLSError ? 'true' : 'false',
    },
    extra: {
      userId: context.userId,
      errorCode: error?.code,
      errorDetails: error?.details,
    },
  })
}
```

### Integración con Prisma

**Archivo**: `src/lib/sentry/prisma-integration.ts`

```typescript
import * as Sentry from '@sentry/nextjs'
import { PrismaClient } from '@prisma/client'

/**
 * Enhance Prisma client with Sentry monitoring
 */
export function createMonitoredPrismaClient() {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  })

  // Monitor slow queries
  prisma.$on('query' as any, (e: any) => {
    const duration = e.duration

    // Log slow queries (> 1s)
    if (duration > 1000) {
      Sentry.captureMessage('Slow Prisma Query', {
        level: 'warning',
        tags: {
          query_duration: duration.toString(),
          prisma: 'true',
        },
        extra: {
          query: e.query,
          params: e.params,
          duration,
          target: e.target,
        },
      })
    }

    // Add breadcrumb for all queries
    Sentry.addBreadcrumb({
      category: 'prisma.query',
      message: e.query,
      level: 'info',
      data: {
        duration,
        params: e.params,
      },
    })
  })

  // Monitor errors
  prisma.$on('error' as any, (e: any) => {
    Sentry.captureException(new Error(e.message), {
      tags: {
        prisma: 'true',
        target: e.target,
      },
      extra: {
        message: e.message,
        target: e.target,
      },
    })
  })

  // Monitor warnings
  prisma.$on('warn' as any, (e: any) => {
    Sentry.captureMessage(e.message, {
      level: 'warning',
      tags: {
        prisma: 'true',
      },
    })
  })

  return prisma
}
```

### Integración con NextAuth

**Archivo**: `src/lib/sentry/auth-integration.ts`

```typescript
import * as Sentry from '@sentry/nextjs'
import { setUserContext, clearUserContext } from './config'

/**
 * Track authentication events
 */
export function trackAuthEvent(
  event: 'signin' | 'signout' | 'session' | 'error',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category: 'auth',
    message: `Auth event: ${event}`,
    level: event === 'error' ? 'error' : 'info',
    data,
  })

  // Set user context on signin
  if (event === 'signin' && data?.user) {
    setUserContext({
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
    })
  }

  // Clear user context on signout
  if (event === 'signout') {
    clearUserContext()
  }
}

/**
 * Capture auth errors
 */
export function captureAuthError(error: Error, provider?: string) {
  Sentry.captureException(error, {
    tags: {
      auth: 'true',
      provider: provider || 'unknown',
    },
  })
}
```

### Ejemplo de Uso en API Routes

**Archivo**: `src/app/api/orders/route.ts` (ejemplo)

```typescript
import { captureException, addBreadcrumb, measureAsync } from '@/lib/sentry/error-handler'
import { captureSupabaseError } from '@/lib/sentry/supabase-integration'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Add breadcrumb for tracking
    addBreadcrumb('order', 'Creating new order', {
      tableId: body.tableId,
      itemsCount: body.items?.length,
    })

    // Measure performance of order creation
    const result = await measureAsync('create_order', async () => {
      const supabase = await createServiceClient()

      // Create order
      const { data, error } = await supabase
        .schema('restaurante')
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        captureSupabaseError(error, {
          table: 'orders',
          operation: 'insert',
          userId: user?.id,
        })
        throw error
      }

      return data
    })

    return Response.json({ success: true, order: result })

  } catch (error) {
    captureException(error, {
      tags: {
        api_route: 'orders',
        method: 'POST',
      },
      extra: {
        requestBody: await request.json().catch(() => null),
      },
    })

    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
```

---

## 📊 PERFORMANCE MONITORING

### Configurar Performance Monitoring

El performance monitoring ya está habilitado en la configuración base con `tracesSampleRate`.

### Custom Transactions

```typescript
import * as Sentry from '@sentry/nextjs'

// Example: Monitor menu loading performance
export async function loadMenu() {
  const transaction = Sentry.startTransaction({
    name: 'load_menu',
    op: 'function',
    data: {
      source: 'api',
    },
  })

  try {
    // Span 1: Fetch from Supabase
    const fetchSpan = transaction.startChild({
      op: 'db.query',
      description: 'Fetch menu from Supabase',
    })

    const { data, error } = await supabase
      .schema('restaurante')
      .from('menu_items')
      .select('*')

    fetchSpan.finish()

    if (error) throw error

    // Span 2: Process data
    const processSpan = transaction.startChild({
      op: 'function',
      description: 'Process menu data',
    })

    const processedMenu = processMenuData(data)

    processSpan.finish()

    transaction.setStatus('ok')
    return processedMenu

  } catch (error) {
    transaction.setStatus('internal_error')
    Sentry.captureException(error)
    throw error
  } finally {
    transaction.finish()
  }
}
```

### Automatic Performance Tracking

Sentry automáticamente rastrea:
- ✅ Page loads
- ✅ Navigation timing
- ✅ API calls (fetch/XHR)
- ✅ Database queries (Prisma)
- ✅ Component render times (con React Profiler)

---

## 🎥 SESSION REPLAY

### Configuración de Session Replay

Session Replay ya está configurado en `instrumentation-client.ts`.

**Configuración de Privacidad:**

```typescript
Sentry.replayIntegration({
  // Máscara automática de inputs sensibles
  maskAllInputs: true,

  // No ocultar todo el texto
  maskAllText: false,

  // Elementos específicos a ocultar
  block: [
    '.password-field',
    '[data-sensitive]',
    '.credit-card-input',
  ],

  // Enmascarar elementos específicos
  mask: [
    '.user-email',
    '.phone-number',
  ],

  // Bloquear medios
  blockAllMedia: false,

  // Captura de red
  networkDetailAllowUrls: [
    /^https:\/\/supabase\.enigmaconalma\.com/,
    /^https:\/\/menu\.enigmaconalma\.com\/api/,
  ],
  networkCaptureBodies: true,

  // Performance
  useCompression: true,

  // Sampling
  sessionSampleRate: 0.1,        // 10% de todas las sesiones
  errorSampleRate: 1.0,          // 100% de sesiones con errores
})
```

### Marcar Datos Sensibles

**En HTML:**

```tsx
<div>
  {/* Ocultar completamente */}
  <div data-sentry-block>
    Información sensible aquí
  </div>

  {/* Enmascarar (mostrar ***) */}
  <input data-sentry-mask type="text" value="user@email.com" />

  {/* Permitir explícitamente */}
  <div data-sentry-unmask>
    Contenido público
  </div>
</div>
```

### Controlar Replay Manualmente

```typescript
import * as Sentry from '@sentry/nextjs'

// Pausar replay temporalmente
function handleSensitiveOperation() {
  const replay = Sentry.getReplay()
  replay?.pause()

  // ... operación sensible ...

  replay?.resume()
}

// Iniciar replay manualmente en error
try {
  // Código que puede fallar
} catch (error) {
  const replay = Sentry.getReplay()
  replay?.flush()

  Sentry.captureException(error)
}
```

---

## 🗺️ SOURCE MAPS

### Configuración de Source Maps

**Archivo**: `next.config.ts`

```typescript
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  // ... tu configuración existente

  // Habilitar source maps en producción
  productionBrowserSourceMaps: true,

  // Output standalone
  output: 'standalone',
}

// Configuración de Sentry
const sentryWebpackPluginOptions = {
  // Organización y proyecto
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Source maps
  silent: true, // Suppress logs
  hideSourceMaps: true, // Hide source maps from public
  widenClientFileUpload: true, // Upload more files

  // Disable source map upload in development
  dryRun: process.env.NODE_ENV === 'development',

  // Turbopack compatibility
  disableLogger: true,

  // Release management
  release: {
    name: process.env.NEXT_PUBLIC_APP_VERSION,
    cleanArtifacts: true,
    finalize: true,
  },

  // Sourcemaps configuration
  sourcemaps: {
    assets: ['.next/static/chunks/**', '.next/server/**'],
    ignore: ['node_modules/**'],
  },
}

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
```

### Upload Manual de Source Maps

Si el plugin falla o usas Turbopack:

```bash
# Script: scripts/upload-sourcemaps.sh
#!/bin/bash

# Variables
RELEASE="$NEXT_PUBLIC_APP_VERSION"
ORG="enigma-restaurant"
PROJECT="enigma-platform"

# Upload source maps
npx @sentry/cli sourcemaps upload \
  --org="$ORG" \
  --project="$PROJECT" \
  --release="$RELEASE" \
  .next/static/chunks

# Finalize release
npx @sentry/cli releases finalize "$RELEASE"

echo "Source maps uploaded for release: $RELEASE"
```

**Agregar a package.json:**

```json
{
  "scripts": {
    "sentry:sourcemaps": "bash ./scripts/upload-sourcemaps.sh"
  }
}
```

---

## 🔔 ALERTAS Y NOTIFICACIONES

### Configurar Alertas en Sentry.io

1. **Ir a Project Settings → Alerts**
2. **Crear Alert Rules:**

#### Alert 1: Critical Errors

```yaml
Name: Critical Errors - Immediate Action
Conditions:
  - Error type: is anything
  - Level: is equal to fatal or error
  - First seen: in the last 5 minutes
  - Event count: is greater than 10
Actions:
  - Send notification to: #incidents-critical (Slack)
  - Send email to: dev@enigmaconalma.com
  - Create PagerDuty incident
```

#### Alert 2: High Error Rate

```yaml
Name: High Error Rate
Conditions:
  - Error rate: is greater than 5%
  - Time period: in the last 1 hour
Actions:
  - Send notification to: #engineering (Slack)
  - Send email to: dev@enigmaconalma.com
```

#### Alert 3: Performance Degradation

```yaml
Name: Performance Degradation
Conditions:
  - Transaction duration (p95): is greater than 3 seconds
  - Transaction: matches ^/api/*
  - Time period: in the last 15 minutes
Actions:
  - Send notification to: #performance (Slack)
```

#### Alert 4: Order Creation Failures

```yaml
Name: Order Creation Failures
Conditions:
  - Error message: contains "Failed to create order"
  - Event count: is greater than 3
  - Time period: in the last 5 minutes
Actions:
  - Send notification to: #incidents-critical (Slack)
  - Send email to: admin@enigmaconalma.com
  - Create GitHub issue
```

### Integración con Slack

1. **Settings → Integrations → Slack**
2. **Autorizar workspace de Enigma**
3. **Configurar canales:**
   - `#incidents-critical` - Errores P0
   - `#engineering` - Errores generales
   - `#performance` - Degradación de performance

### Integración con Email

**Configurar destinatarios:**
- `dev@enigmaconalma.com` - Equipo dev
- `admin@enigmaconalma.com` - Admin
- `ops@enigmaconalma.com` - Operaciones

---

## ✅ BEST PRACTICES DE PRODUCCIÓN

### 1. Sampling Rates Optimizadas

```typescript
// Producción: Reducir costos sin perder información crítica
const productionConfig = {
  // Errores: 100%
  sampleRate: 1.0,

  // Performance: 10% (suficiente para tendencias)
  tracesSampleRate: 0.1,

  // Session Replay: 10% normal, 100% con errores
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
}

// Development: Full tracking
const developmentConfig = {
  sampleRate: 1.0,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
}
```

### 2. Filtrar Datos Sensibles

```typescript
// En beforeSend
beforeSend(event, hint) {
  // Remover cookies
  if (event.request?.cookies) {
    delete event.request.cookies
  }

  // Remover headers de autenticación
  if (event.request?.headers) {
    delete event.request.headers['authorization']
    delete event.request.headers['cookie']
  }

  // Filtrar query strings sensibles
  if (event.request?.query_string) {
    const params = new URLSearchParams(event.request.query_string)
    ;['token', 'api_key', 'password', 'secret'].forEach(key => {
      if (params.has(key)) {
        params.set(key, '[Filtered]')
      }
    })
    event.request.query_string = params.toString()
  }

  // Filtrar body
  if (event.request?.data) {
    const filtered = { ...event.request.data }
    ;['password', 'creditCard', 'ssn'].forEach(key => {
      if (filtered[key]) {
        filtered[key] = '[Filtered]'
      }
    })
    event.request.data = filtered
  }

  return event
}
```

### 3. Context Enriquecido

```typescript
// Agregar contexto útil a todos los eventos
Sentry.setContext('restaurant', {
  location: 'Valencia',
  version: '2.0',
  features: {
    qr_menu: true,
    reservations: true,
    multi_language: true,
  },
})

Sentry.setContext('device', {
  type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
  viewport: `${window.innerWidth}x${window.innerHeight}`,
})
```

### 4. Release Tracking

```bash
# En CI/CD (GitHub Actions)
- name: Create Sentry Release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: enigma-restaurant
    SENTRY_PROJECT: enigma-platform
  run: |
    npx @sentry/cli releases new "$GITHUB_SHA"
    npx @sentry/cli releases set-commits "$GITHUB_SHA" --auto
    npx @sentry/cli releases finalize "$GITHUB_SHA"
    npx @sentry/cli releases deploys "$GITHUB_SHA" new -e production
```

### 5. Feature Flags con Sentry

```typescript
import * as Sentry from '@sentry/nextjs'

function useFeatureFlag(flagName: string): boolean {
  const user = Sentry.getCurrentScope().getUser()

  // Log feature flag usage
  Sentry.addBreadcrumb({
    category: 'feature-flag',
    message: `Checking flag: ${flagName}`,
    data: {
      userId: user?.id,
    },
  })

  // Your feature flag logic
  return checkFeatureFlag(flagName, user)
}
```

### 6. Error Grouping Personalizado

```typescript
beforeSend(event, hint) {
  // Agrupar errores de timeout
  if (event.exception?.values?.[0]?.type === 'TimeoutError') {
    event.fingerprint = ['timeout-error', event.transaction || 'unknown']
  }

  // Agrupar errores de Supabase RLS
  if (event.tags?.supabase === 'true' && event.tags?.rls_error === 'true') {
    event.fingerprint = ['rls-policy-error', event.tags.table || 'unknown']
  }

  return event
}
```

---

## 🔧 TROUBLESHOOTING

### Problema 1: Events No Aparecen

**Síntomas**: Errores no llegan a Sentry

**Soluciones:**

```typescript
// 1. Verificar DSN
console.log('Sentry DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN)

// 2. Verificar inicialización
import * as Sentry from '@sentry/nextjs'
console.log('Sentry initialized:', Sentry.getCurrentHub().getClient() !== undefined)

// 3. Habilitar debug mode
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: true, // Ver logs de Sentry
})

// 4. Verificar beforeSend no está bloqueando
beforeSend(event, hint) {
  console.log('Sentry beforeSend:', event)
  return event // Asegurar que se retorna
}

// 5. Verificar sample rate
sampleRate: 1.0, // Asegurar 100% en testing
```

### Problema 2: Turbopack Source Maps No Funcionan

**Síntomas**: Stack traces sin source maps

**Solución:**

```bash
# 1. Verificar que source maps están habilitados
productionBrowserSourceMaps: true

# 2. Upload manual
npm run sentry:sourcemaps

# 3. Verificar upload en Sentry.io
npx @sentry/cli releases list

# 4. Verificar artifacts
npx @sentry/cli releases files <RELEASE_NAME> list
```

### Problema 3: Tunnel Route Bloqueado por Middleware

**Síntomas**: Cliente no puede enviar eventos

**Solución en middleware:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Exclude Sentry tunnel route
  if (request.nextUrl.pathname.startsWith('/monitoring')) {
    return NextResponse.next()
  }

  // Your middleware logic
  // ...
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /monitoring (Sentry tunnel)
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    '/((?!monitoring|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Configurar tunnel en Sentry:**

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tunnel: '/monitoring', // Custom tunnel route
})
```

### Problema 4: Performance Overhead

**Síntomas**: App lenta después de agregar Sentry

**Soluciones:**

```typescript
// 1. Reducir sample rates
tracesSampleRate: 0.05, // 5% en vez de 10%

// 2. Deshabilitar replay en ciertas páginas
if (window.location.pathname === '/admin/heavy-dashboard') {
  Sentry.getReplay()?.stop()
}

// 3. Lazy load Sentry en páginas no críticas
const SentryLazy = dynamic(
  () => import('@/lib/sentry/lazy-init').then(mod => mod.initSentry),
  { ssr: false }
)

// 4. Reducir breadcrumbs
maxBreadcrumbs: 50, // Default es 100
```

### Problema 5: Too Many Events (Quota)

**Síntomas**: Cuota de Sentry excedida

**Soluciones:**

```typescript
// 1. Filtrar errores de bots
ignoreErrors: [
  'bot',
  'crawler',
  'spider',
  'googlebot',
],

// 2. Filtrar errores conocidos
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
],

// 3. Rate limiting
beforeSend(event, hint) {
  // Solo enviar si no hemos enviado uno similar recientemente
  const errorKey = event.exception?.values?.[0]?.type
  const lastSent = localStorage.getItem(`sentry-last-${errorKey}`)
  const now = Date.now()

  if (lastSent && now - parseInt(lastSent) < 60000) { // 1 minuto
    return null // Skip
  }

  localStorage.setItem(`sentry-last-${errorKey}`, now.toString())
  return event
}

// 4. Reducir sample rates drásticamente
tracesSampleRate: 0.01, // 1%
replaysSessionSampleRate: 0.01, // 1%
```

---

## 💰 COSTOS Y OPTIMIZACIÓN

### Plan Recomendado para Enigma

**Sentry Pricing (2025):**
- **Developer**: $26/mes (50K errors, 10K replay)
- **Team**: $80/mes (100K errors, 50K replay)
- **Business**: Custom pricing

**Estimación para Enigma:**

Con 1000 usuarios/día:
- **Errores**: ~1000/mes (< 1% error rate) = Developer plan OK
- **Performance**: ~3000 transactions/mes (10% sample) = Within limits
- **Replay**: ~100 sessions/mes (1% + errores) = Within limits

**Costo mensual estimado**: $26-80 USD

### Optimización de Costos

```typescript
// Configuración cost-optimized
const costOptimizedConfig = {
  // Errores: 100% (siempre queremos saber de errores)
  sampleRate: 1.0,

  // Performance: 5% (suficiente para tendencias)
  tracesSampleRate: 0.05,

  // Replay: 1% normal, 100% errores
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Filtrar transacciones no críticas
  beforeSendTransaction(event) {
    // No enviar healthchecks
    if (event.transaction === '/api/health') {
      return null
    }

    // No enviar static assets
    if (event.transaction?.startsWith('/_next/static')) {
      return null
    }

    return event
  },

  // Reducir breadcrumbs
  maxBreadcrumbs: 50,

  // Ignorar errores comunes
  ignoreErrors: [
    'ResizeObserver',
    'Non-Error promise rejection',
  ],
}
```

### Monitorear Uso

```bash
# Ver uso actual
npx @sentry/cli stats

# Ver eventos por tipo
npx @sentry/cli stats --type=errors,transactions,replays
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry SDK Reference](https://docs.sentry.io/platforms/javascript/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

### Enigma-Specific Resources

- Sentry Dashboard: https://sentry.io/organizations/enigma-restaurant/
- Incident Runbook: `/docs/incident-response.md`
- Performance Baseline: `/docs/performance-baseline.md`

---

## 🚀 PRÓXIMOS PASOS

### Fase 1: Setup Inicial (Week 1)

- [ ] Instalar @sentry/nextjs
- [ ] Ejecutar wizard de configuración
- [ ] Configurar variables de entorno
- [ ] Crear archivos de instrumentación
- [ ] Implementar error boundaries
- [ ] Testear en development

### Fase 2: Integración Stack (Week 2)

- [ ] Integrar con Supabase
- [ ] Integrar con Prisma
- [ ] Integrar con NextAuth
- [ ] Configurar context helpers
- [ ] Implementar custom error handler

### Fase 3: Production Setup (Week 3)

- [ ] Configurar source maps
- [ ] Setup alertas en Slack
- [ ] Configurar email notifications
- [ ] Implementar release tracking
- [ ] Setup CI/CD integration
- [ ] Deploy a staging

### Fase 4: Monitoring & Optimization (Week 4)

- [ ] Monitorear métricas baseline
- [ ] Ajustar sample rates
- [ ] Configurar custom dashboards
- [ ] Documentar incident response
- [ ] Training del equipo

---

## ✨ CONCLUSIÓN

Con esta configuración completa de Sentry, el proyecto Enigma tendrá:

✅ **Visibilidad completa** de errores en producción
✅ **Context rico** para debugging rápido
✅ **Performance monitoring** proactivo
✅ **Session replay** para reproducir issues
✅ **Alertas inteligentes** para respuesta rápida
✅ **Integración perfecta** con stack actual
✅ **Costos optimizados** para startup

**Próximo paso**: Ejecutar `npx @sentry/wizard@latest -i nextjs` para comenzar el setup automático.

---

**Documento creado por**: Claude Code AI Assistant
**Para**: Proyecto Enigma Cocina Con Alma
**Última actualización**: 2025-01-XX
