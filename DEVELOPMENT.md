# 🛠️ Guía de Desarrollo - Enigma Restaurant Platform

![Development](https://img.shields.io/badge/Development-Guide-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

**Guía completa de desarrollo para contribuir y mantener la plataforma de gestión de restaurante Enigma.**

---

## 📖 Índice

- [🛠️ Guía de Desarrollo - Enigma Restaurant Platform](#️-guía-de-desarrollo---enigma-restaurant-platform)
  - [📖 Índice](#-índice)
  - [🎯 Arquitectura del Sistema](#-arquitectura-del-sistema)
  - [🗄️ Estructura de Base de Datos](#️-estructura-de-base-de-datos)
  - [🔗 API y Endpoints](#-api-y-endpoints)
  - [⚡ Tiempo Real con Supabase](#-tiempo-real-con-supabase)
  - [🎨 Patrones de Diseño](#-patrones-de-diseño)
  - [🔒 Autenticación y Autorización](#-autenticación-y-autorización)
  - [📊 Gestión de Estado](#-gestión-de-estado)
  - [🧪 Testing y Calidad](#-testing-y-calidad)
  - [🚀 Performance y Optimización](#-performance-y-optimización)
  - [🔧 Configuración de Desarrollo](#-configuración-de-desarrollo)
  - [📦 Gestión de Dependencias](#-gestión-de-dependencias)
  - [🐛 Debugging y Troubleshooting](#-debugging-y-troubleshooting)
  - [📋 Flujo de Trabajo](#-flujo-de-trabajo)
  - [🔄 CI/CD y Deployment](#-cicd-y-deployment)
  - [📚 Recursos y Referencias](#-recursos-y-referencias)

---

## 🎯 Arquitectura del Sistema

### **🏗️ Arquitectura General**
```
┌─────────────────────────────────────────────────────────────────┐
│                    ENIGMA RESTAURANT PLATFORM                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Next.js 15)          Backend (Supabase)              │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │  App Router         │       │  PostgreSQL DB     │          │
│  │  - Server Components│◄──────┤  - Real-time        │          │
│  │  - Client Components│       │  - Auth             │          │
│  │  - API Routes       │       │  - Storage          │          │
│  └─────────────────────┘       └─────────────────────┘          │
│           │                             │                       │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │  State Management   │       │  Kong Gateway       │          │
│  │  - Zustand          │       │  - Load Balancer    │          │
│  │  - React Query      │       │  - SSL Termination  │          │
│  │  - Local Storage    │       │  - Rate Limiting    │          │
│  └─────────────────────┘       └─────────────────────┘          │
│           │                             │                       │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │  UI Layer           │       │  VPS Infrastructure │          │
│  │  - shadcn/ui        │       │  - Docker Compose   │          │
│  │  - Tailwind CSS     │       │  - Nginx            │          │
│  │  - Framer Motion    │       │  - SSL Certificates │          │
│  └─────────────────────┘       └─────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **📁 Estructura de Directorios**
```
enigma-app/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 (admin)/           # Rutas protegidas de administración
│   │   │   └── 📁 dashboard/     # Panel administrativo
│   │   ├── 📁 (public)/          # Rutas públicas
│   │   ├── 📁 api/               # API Routes (Backend)
│   │   │   ├── 📁 auth/          # Autenticación
│   │   │   ├── 📁 reservations/  # CRUD de reservas
│   │   │   ├── 📁 menu/          # Gestión de menú
│   │   │   ├── 📁 tables/        # Gestión de mesas
│   │   │   └── 📁 customers/     # CRM de clientes
│   │   ├── 📄 layout.tsx         # Layout raíz
│   │   ├── 📄 page.tsx           # Página principal
│   │   └── 📄 globals.css        # Estilos globales
│   ├── 📁 components/            # Componentes React
│   │   ├── 📁 ui/                # Componentes shadcn/ui
│   │   ├── 📁 restaurant/        # Componentes específicos
│   │   └── 📁 providers/         # Context providers
│   ├── 📁 hooks/                 # Custom hooks
│   │   ├── 📄 useRealtimeReservations.ts
│   │   ├── 📄 useAuth.ts
│   │   └── 📄 useTables.ts
│   ├── 📁 lib/                   # Utilidades y configuración
│   │   ├── 📁 supabase/          # Cliente Supabase
│   │   ├── 📁 validations/       # Esquemas Zod
│   │   ├── 📄 auth.ts            # Configuración NextAuth
│   │   └── 📄 utils.ts           # Utilidades generales
│   ├── 📁 stores/                # Stores Zustand
│   ├── 📁 types/                 # Definiciones TypeScript
│   └── 📁 styles/                # Estilos adicionales
├── 📁 prisma/                    # Esquema de base de datos
│   ├── 📄 schema.prisma          # Definición de modelos
│   └── 📁 migrations/            # Migraciones de DB
├── 📁 public/                    # Assets estáticos
├── 📁 docs/                      # Documentación
├── 📁 tests/                     # Tests E2E y unitarios
├── 📄 package.json               # Dependencias y scripts
├── 📄 tailwind.config.js         # Configuración Tailwind
├── 📄 next.config.js             # Configuración Next.js
├── 📄 tsconfig.json              # Configuración TypeScript
└── 📄 .env.sample                # Variables de entorno template
```

---

## 🗄️ Estructura de Base de Datos

### **🗂️ Esquema PostgreSQL (restaurante)**
```sql
-- Base de datos principal: postgres
-- Esquema principal: restaurante
-- Total: 16 tablas operacionales

-- AUTENTICACIÓN Y USUARIOS
CREATE SCHEMA IF NOT EXISTS restaurante;

-- Usuarios del sistema (NextAuth.js compatible)
CREATE TABLE restaurante.users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER')),
  is_active BOOLEAN DEFAULT true,

  -- Inteligencia VIP
  is_vip BOOLEAN DEFAULT false,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_party_size INTEGER DEFAULT 2,
  last_visit TIMESTAMPTZ,

  -- Preferencias
  preferred_language TEXT DEFAULT 'ES' CHECK (preferred_language IN ('ES', 'EN', 'DE')),
  preferred_location TEXT CHECK (preferred_location IN ('TERRACE_CAMPANARI', 'SALA_VIP', 'TERRACE_JUSTICIA', 'SALA_PRINCIPAL')),
  dietary_restrictions TEXT[] DEFAULT '{}',
  favorite_dishes_ids TEXT[] DEFAULT '{}',

  -- GDPR
  email_consent BOOLEAN DEFAULT false,
  sms_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  data_processing_consent BOOLEAN DEFAULT true,
  consent_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GESTIÓN DE RESTAURANTE
CREATE TABLE restaurante.restaurants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT DEFAULT 'Enigma Cocina Con Alma',
  address TEXT DEFAULT 'Carrer Justicia 6A, 03710 Calpe',
  phone TEXT DEFAULT '+34 672 79 60 06',
  email TEXT DEFAULT 'info@enigmaconalma.com',

  -- Multiidioma
  name_en TEXT DEFAULT 'Enigma Kitchen With Soul',
  name_de TEXT DEFAULT 'Enigma Küche Mit Seele',
  address_en TEXT DEFAULT 'Carrer Justicia 6A, 03710 Calpe, Spain',
  address_de TEXT DEFAULT 'Carrer Justicia 6A, 03710 Calpe, Spanien',

  timezone TEXT DEFAULT 'Europe/Madrid',
  currency TEXT DEFAULT 'EUR',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESAS Y UBICACIONES
CREATE TABLE restaurante.tables (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  number TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('TERRACE_CAMPANARI', 'SALA_VIP', 'TERRACE_JUSTICIA', 'SALA_PRINCIPAL')),
  qr_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  restaurant_id TEXT NOT NULL REFERENCES restaurante.restaurants(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESERVAS
CREATE TABLE restaurante.reservations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  special_requests TEXT,

  -- Funcionalidades avanzadas
  occasion TEXT,
  dietary_notes TEXT,
  preferred_language TEXT DEFAULT 'ES' CHECK (preferred_language IN ('ES', 'EN', 'DE')),

  -- Pre-órdenes
  has_pre_order BOOLEAN DEFAULT false,

  -- Confirmación y comunicación
  is_confirmed BOOLEAN DEFAULT false,
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Tracking
  source TEXT DEFAULT 'WEBSITE' CHECK (source IN ('WEBSITE', 'PHONE', 'WALK_IN', 'WHATSAPP', 'EMAIL', 'SOCIAL_MEDIA')),

  -- Referencias
  table_id TEXT REFERENCES restaurante.tables(id),
  restaurant_id TEXT NOT NULL REFERENCES restaurante.restaurants(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MENÚ Y CATEGORÍAS
CREATE TABLE restaurante.menu_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  description TEXT,
  description_en TEXT,
  description_de TEXT,
  type TEXT NOT NULL CHECK (type IN ('FOOD', 'WINE', 'BEVERAGE')),
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  restaurant_id TEXT NOT NULL REFERENCES restaurante.restaurants(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE restaurante.menu_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  description_de TEXT,
  price DECIMAL(8,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,

  -- Características dietéticas
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_lactose_free BOOLEAN DEFAULT false,
  is_signature BOOLEAN DEFAULT false,
  is_seasonal_special BOOLEAN DEFAULT false,
  available_from TIMESTAMPTZ,
  available_to TIMESTAMPTZ,

  -- Alérgenos EU-14
  contains_gluten BOOLEAN DEFAULT false,
  contains_milk BOOLEAN DEFAULT false,
  contains_eggs BOOLEAN DEFAULT false,
  contains_nuts BOOLEAN DEFAULT false,
  contains_fish BOOLEAN DEFAULT false,
  contains_shellfish BOOLEAN DEFAULT false,
  contains_soy BOOLEAN DEFAULT false,
  contains_celery BOOLEAN DEFAULT false,
  contains_mustard BOOLEAN DEFAULT false,
  contains_sesame BOOLEAN DEFAULT false,
  contains_sulfites BOOLEAN DEFAULT false,
  contains_lupin BOOLEAN DEFAULT false,
  contains_mollusks BOOLEAN DEFAULT false,
  contains_peanuts BOOLEAN DEFAULT false,

  -- Referencias
  category_id TEXT NOT NULL REFERENCES restaurante.menu_categories(id),
  restaurant_id TEXT NOT NULL REFERENCES restaurante.restaurants(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRE-ÓRDENES
CREATE TABLE restaurante.reservation_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  quantity INTEGER NOT NULL,
  notes TEXT,

  reservation_id TEXT NOT NULL REFERENCES restaurante.reservations(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES restaurante.menu_items(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **🔄 Migraciones y Versionado**
```typescript
// Ejemplo de migración Prisma
-- 001_initial_schema.sql
-- Creación del esquema base

-- 002_add_vip_system.sql
-- Añadir sistema VIP a usuarios

-- 003_add_preorder_system.sql
-- Implementar pre-órdenes

-- 004_add_floor_plan.sql
-- Sistema de plano interactivo

-- 005_add_analytics.sql
-- Tablas de analytics y eventos
```

---

## 🔗 API y Endpoints

### **🗂️ Estructura de API Routes**
```
src/app/api/
├── 📁 auth/
│   └── 📁 [...nextauth]/
│       └── 📄 route.ts           # Configuración NextAuth.js
├── 📁 reservations/
│   ├── 📄 route.ts               # GET, POST /api/reservations
│   └── 📁 [id]/
│       ├── 📄 route.ts           # GET, PATCH, DELETE /api/reservations/[id]
│       └── 📁 reminder/
│           └── 📄 route.ts       # POST /api/reservations/[id]/reminder
├── 📁 menu/
│   ├── 📄 route.ts               # GET, POST /api/menu
│   ├── 📁 categories/
│   │   └── 📄 route.ts           # GET, POST /api/menu/categories
│   ├── 📁 items/
│   │   └── 📁 [id]/
│   │       └── 📄 route.ts       # GET, PATCH, DELETE /api/menu/items/[id]
│   └── 📁 wine-pairings/
│       └── 📄 route.ts           # GET, POST /api/menu/wine-pairings
├── 📁 tables/
│   ├── 📄 route.ts               # GET, POST /api/tables
│   ├── 📁 [id]/
│   │   └── 📄 route.ts           # GET, PATCH, DELETE /api/tables/[id]
│   ├── 📁 availability/
│   │   └── 📄 route.ts           # GET /api/tables/availability
│   └── 📁 qr/
│       └── 📄 route.ts           # GET /api/tables/qr
├── 📁 customers/
│   ├── 📄 route.ts               # GET, POST /api/customers
│   └── 📁 [id]/
│       ├── 📄 route.ts           # GET, PATCH, DELETE /api/customers/[id]
│       └── 📁 vip/
│           └── 📄 route.ts       # POST /api/customers/[id]/vip
└── 📁 analytics/
    ├── 📄 route.ts               # GET /api/analytics
    └── 📁 dashboard/
        └── 📄 route.ts           # GET /api/analytics/dashboard
```

### **📋 Ejemplos de Endpoints**

#### **🍽️ Reservas API**
```typescript
// src/app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/reservations - Listar reservas con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'MANAGER', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      where.date = {
        gte: startDate,
        lt: endDate
      }
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } }
      ]
    }

    const [reservations, summary] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          tables: true,
          reservation_items: {
            include: {
              menu_items: {
                include: {
                  menu_categories: true
                }
              }
            }
          }
        },
        orderBy: { date: 'asc' }
      }),

      // Calcular resumen
      prisma.reservation.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { partySize: true }
      })
    ])

    const summaryData = {
      total: reservations.length,
      pending: summary.find(s => s.status === 'PENDING')?._count._all || 0,
      confirmed: summary.find(s => s.status === 'CONFIRMED')?._count._all || 0,
      completed: summary.find(s => s.status === 'COMPLETED')?._count._all || 0,
      cancelled: summary.find(s => s.status === 'CANCELLED')?._count._all || 0,
      totalGuests: summary.reduce((total, s) => total + (s._sum.partySize || 0), 0)
    }

    return NextResponse.json({
      success: true,
      reservations,
      summary: summaryData
    })

  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/reservations - Crear nueva reserva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      date,
      time,
      tableId,
      specialRequests,
      preOrderItems = []
    } = body

    // Validación básica
    if (!customerName || !customerEmail || !customerPhone || !partySize || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar disponibilidad de mesa
    if (tableId) {
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          tableId,
          date: new Date(date),
          status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] }
        }
      })

      if (existingReservation) {
        return NextResponse.json(
          { error: 'Table not available at requested time' },
          { status: 409 }
        )
      }
    }

    // Crear reserva con pre-órdenes en transacción
    const reservation = await prisma.$transaction(async (tx) => {
      const newReservation = await tx.reservation.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          partySize,
          date: new Date(date),
          time: new Date(time),
          tableId,
          specialRequests,
          hasPreOrder: preOrderItems.length > 0,
          restaurantId: 'default-restaurant-id' // TODO: Get from context
        }
      })

      // Añadir pre-órdenes si existen
      if (preOrderItems.length > 0) {
        await tx.reservationItem.createMany({
          data: preOrderItems.map((item: any) => ({
            reservationId: newReservation.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes
          }))
        })
      }

      return newReservation
    })

    // TODO: Enviar email de confirmación
    // await sendReservationConfirmation(reservation)

    return NextResponse.json({
      success: true,
      reservation
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### **🍷 Menú API**
```typescript
// src/app/api/menu/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type') // 'FOOD', 'WINE', 'BEVERAGE'

    const where: any = {
      isAvailable: true
    }

    if (category) {
      where.categoryId = category
    }

    if (type) {
      where.menu_categories = {
        type: type
      }
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        menu_categories: true,
        allergens: true,
        winePairings: {
          include: {
            wineItem: true
          }
        }
      },
      orderBy: [
        { menu_categories: { order: 'asc' } },
        { name: 'asc' }
      ]
    })

    // Filtrar bebidas para pre-órdenes (excluir del sistema de pre-orden)
    const filteredItems = menuItems.filter(item => {
      if (searchParams.get('excludeBeverages') === 'true') {
        return item.menu_categories.type !== 'BEVERAGE'
      }
      return true
    })

    return NextResponse.json({
      success: true,
      menuItems: filteredItems
    })

  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## ⚡ Tiempo Real con Supabase

### **🔄 Configuración de Realtime**
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10 // Throttle para evitar spam
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Configuración específica para el restaurante
export const realtimeConfig = {
  schema: 'restaurante',
  tables: ['reservations', 'tables', 'menu_items', 'customers'],
  events: ['INSERT', 'UPDATE', 'DELETE']
}
```

### **📡 Hook de Tiempo Real Genérico**
```typescript
// src/hooks/useRealtime.ts
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  table: string
  schema?: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  throttleMs?: number
}

export function useRealtime<T = any>(
  options: UseRealtimeOptions,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    const {
      table,
      schema = 'restaurante',
      filter,
      event = '*',
      throttleMs = 1000
    } = options

    // Limpiar canal existente
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter
        },
        (payload) => {
          // Throttling para evitar demasiadas actualizaciones
          const now = Date.now()
          if (now - lastUpdateRef.current >= throttleMs) {
            lastUpdateRef.current = now
            callback(payload)
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime ${table} status:`, status)
        setConnected(status === 'SUBSCRIBED')

        if (status === 'CHANNEL_ERROR') {
          setError(`Error connecting to ${table} realtime`)
        } else {
          setError(null)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [options.table, options.schema, options.filter, options.event])

  return { connected, error }
}
```

### **🍽️ Implementación en useRealtimeReservations**
```typescript
// src/hooks/useRealtimeReservations.ts - Fragmento optimizado
export function useRealtimeReservations(filters: RealtimeFilters = {}) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hook de tiempo real optimizado
  const { connected } = useRealtime<Reservation>(
    {
      table: 'reservations',
      schema: 'restaurante',
      event: '*',
      throttleMs: 500 // Actualizaciones más frecuentes para reservas
    },
    (payload) => {
      console.log('Realtime reservation change:', payload)

      switch (payload.eventType) {
        case 'INSERT':
          setReservations(prev => {
            // Evitar duplicados
            if (prev.find(r => r.id === payload.new.id)) {
              return prev
            }
            return [payload.new as Reservation, ...prev]
          })
          break

        case 'UPDATE':
          setReservations(prev =>
            prev.map(reservation =>
              reservation.id === payload.new.id
                ? { ...reservation, ...payload.new } as Reservation
                : reservation
            )
          )
          break

        case 'DELETE':
          setReservations(prev =>
            prev.filter(reservation => reservation.id !== payload.old.id)
          )
          break
      }
    }
  )

  // Fetch inicial y cuando cambian los filtros
  useEffect(() => {
    fetchReservations()
  }, [filters.status, filters.date, filters.search])

  const fetchReservations = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/reservations?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setReservations(data.reservations)
      } else {
        setError(data.error || 'Error fetching reservations')
      }
    } catch (err) {
      setError('Network error fetching reservations')
      console.error('Error fetching reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    reservations,
    loading,
    error,
    connected,
    refetch: fetchReservations
  }
}
```

---

## 🎨 Patrones de Diseño

### **🏗️ Arquitectura de Componentes**

#### **📦 Composición sobre Herencia**
```typescript
// ✅ Correcto: Componente composable
interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'filled'
}

function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)}>
      {children}
    </div>
  )
}

// Subcomponentes especializados
Card.Header = function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>
}

Card.Content = function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>
}

Card.Footer = function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-6 pt-0 flex justify-end space-x-2", className)}>{children}</div>
}

// Uso
<Card variant="outline">
  <Card.Header>
    <h3>Reserva #1234</h3>
  </Card.Header>
  <Card.Content>
    <ReservationDetails />
  </Card.Content>
  <Card.Footer>
    <Button variant="outline">Editar</Button>
    <Button>Confirmar</Button>
  </Card.Footer>
</Card>
```

#### **🔄 Custom Hooks Pattern**
```typescript
// Hook genérico para CRUD operations
function useCRUD<T, CreateData, UpdateData>(
  resource: string,
  options: CRUDOptions = {}
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: CreateData): Promise<T | null> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const newItem = await response.json()
        setItems(prev => [newItem, ...prev])
        return newItem
      } else {
        const errorData = await response.json()
        setError(errorData.error)
        return null
      }
    } catch (err) {
      setError('Network error')
      return null
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: UpdateData): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${resource}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems(prev =>
          prev.map(item =>
            (item as any).id === id ? { ...item, ...updatedItem } : item
          )
        )
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error)
        return false
      }
    } catch (err) {
      setError('Network error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${resource}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setItems(prev => prev.filter(item => (item as any).id !== id))
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error)
        return false
      }
    } catch (err) {
      setError('Network error')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    setItems
  }
}

// Uso específico
const useReservations = () => useCRUD<Reservation, CreateReservationData, UpdateReservationData>('reservations')
const useMenuItems = () => useCRUD<MenuItem, CreateMenuItemData, UpdateMenuItemData>('menu/items')
```

#### **🏪 Store Pattern con Zustand**
```typescript
// src/stores/reservationStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ReservationState {
  reservations: Reservation[]
  filters: ReservationFilters
  selectedReservation: Reservation | null

  // Actions
  setReservations: (reservations: Reservation[]) => void
  addReservation: (reservation: Reservation) => void
  updateReservation: (id: string, updates: Partial<Reservation>) => void
  removeReservation: (id: string) => void
  setFilters: (filters: Partial<ReservationFilters>) => void
  selectReservation: (reservation: Reservation | null) => void

  // Computed values
  filteredReservations: () => Reservation[]
  reservationStats: () => ReservationStats
}

export const useReservationStore = create<ReservationState>()(
  devtools(
    persist(
      (set, get) => ({
        reservations: [],
        filters: {
          status: 'all',
          date: null,
          search: ''
        },
        selectedReservation: null,

        setReservations: (reservations) =>
          set({ reservations }, false, 'setReservations'),

        addReservation: (reservation) =>
          set(
            (state) => ({
              reservations: [reservation, ...state.reservations]
            }),
            false,
            'addReservation'
          ),

        updateReservation: (id, updates) =>
          set(
            (state) => ({
              reservations: state.reservations.map(r =>
                r.id === id ? { ...r, ...updates } : r
              )
            }),
            false,
            'updateReservation'
          ),

        removeReservation: (id) =>
          set(
            (state) => ({
              reservations: state.reservations.filter(r => r.id !== id)
            }),
            false,
            'removeReservation'
          ),

        setFilters: (newFilters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...newFilters }
            }),
            false,
            'setFilters'
          ),

        selectReservation: (reservation) =>
          set({ selectedReservation: reservation }, false, 'selectReservation'),

        filteredReservations: () => {
          const { reservations, filters } = get()
          return reservations.filter(reservation => {
            if (filters.status !== 'all' && reservation.status !== filters.status) {
              return false
            }
            if (filters.date && !isSameDay(reservation.date, filters.date)) {
              return false
            }
            if (filters.search) {
              const searchLower = filters.search.toLowerCase()
              return (
                reservation.customerName.toLowerCase().includes(searchLower) ||
                reservation.customerEmail.toLowerCase().includes(searchLower) ||
                reservation.customerPhone.includes(searchLower)
              )
            }
            return true
          })
        },

        reservationStats: () => {
          const reservations = get().filteredReservations()
          return {
            total: reservations.length,
            pending: reservations.filter(r => r.status === 'PENDING').length,
            confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
            completed: reservations.filter(r => r.status === 'COMPLETED').length,
            cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
            totalGuests: reservations.reduce((sum, r) => sum + r.partySize, 0)
          }
        }
      }),
      {
        name: 'reservation-store',
        partialize: (state) => ({
          // Solo persistir filtros, no las reservas (vienen del servidor)
          filters: state.filters
        })
      }
    ),
    {
      name: 'reservation-store'
    }
  )
)
```

---

## 🔒 Autenticación y Autorización

### **🔐 Configuración NextAuth.js**
```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.isVip = user.isVip
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.isVip = token.isVip
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Verificar si el usuario está activo
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (dbUser && !dbUser.isActive) {
          return false // Usuario desactivado
        }
      }

      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log de inicio de sesión
      console.log(`User ${user.email} signed in with ${account?.provider}`)

      // Actualizar última actividad
      if (user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { lastVisit: new Date() }
        })
      }
    }
  }
}
```

### **🛡️ Middleware de Protección**
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Proteger rutas de administración
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      const token = req.nextauth.token

      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }

      // Verificar roles para diferentes secciones
      const { role } = token
      const path = req.nextUrl.pathname

      // Solo ADMIN puede acceder a configuración
      if (path.startsWith('/dashboard/settings') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', req.url))
      }

      // ADMIN, MANAGER pueden gestionar menú
      if (path.startsWith('/dashboard/menu') && !['ADMIN', 'MANAGER'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', req.url))
      }

      // ADMIN, MANAGER, STAFF pueden gestionar reservas
      if (path.startsWith('/dashboard/reservaciones') && !['ADMIN', 'MANAGER', 'STAFF'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a rutas públicas
        if (req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/reservas')) {
          return true
        }

        // Requerir autenticación para rutas protegidas
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }

        return true
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/reservations/:path*',
    '/api/menu/:path*',
    '/api/tables/:path*',
    '/api/customers/:path*'
  ]
}
```

### **🔐 Hook useAuth**
```typescript
// src/hooks/useAuth.ts
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'

interface UseAuthReturn {
  user: any
  session: any
  loading: boolean
  isAuthenticated: boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
  requireAuth: () => void
  requireRole: (role: UserRole | UserRole[]) => void
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  const loading = status === 'loading'
  const isAuthenticated = !!session?.user

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!session?.user?.role) return false

    if (Array.isArray(role)) {
      return role.includes(session.user.role)
    }

    return session.user.role === role
  }

  const hasPermission = (permission: string): boolean => {
    if (!session?.user?.role) return false

    const permissions: Record<UserRole, string[]> = {
      ADMIN: ['*'], // Todos los permisos
      MANAGER: [
        'reservations:read',
        'reservations:write',
        'menu:read',
        'menu:write',
        'tables:read',
        'tables:write',
        'customers:read',
        'customers:write',
        'analytics:read'
      ],
      STAFF: [
        'reservations:read',
        'reservations:write',
        'customers:read',
        'tables:read'
      ],
      CUSTOMER: [
        'reservations:read:own',
        'profile:read:own',
        'profile:write:own'
      ]
    }

    const userPermissions = permissions[session.user.role] || []

    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  const requireAuth = () => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }

  const requireRole = (role: UserRole | UserRole[]) => {
    if (!loading && (!isAuthenticated || !hasRole(role))) {
      router.push('/dashboard/unauthorized')
    }
  }

  return {
    user: session?.user,
    session,
    loading,
    isAuthenticated,
    hasRole,
    hasPermission,
    requireAuth,
    requireRole
  }
}

// HOC para proteger componentes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredRole?: UserRole | UserRole[]
    redirectTo?: string
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasRole, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push(options.redirectTo || '/auth/signin')
          return
        }

        if (options.requiredRole && !hasRole(options.requiredRole)) {
          router.push('/dashboard/unauthorized')
          return
        }
      }
    }, [isAuthenticated, hasRole, loading, router])

    if (loading) {
      return <div>Cargando...</div>
    }

    if (!isAuthenticated || (options.requiredRole && !hasRole(options.requiredRole))) {
      return null
    }

    return <Component {...props} />
  }
}

// Uso del HOC
export const AdminDashboard = withAuth(
  function AdminDashboard() {
    return <div>Panel de administración</div>
  },
  { requiredRole: 'ADMIN' }
)

export const StaffPanel = withAuth(
  function StaffPanel() {
    return <div>Panel de personal</div>
  },
  { requiredRole: ['ADMIN', 'MANAGER', 'STAFF'] }
)
```

---

## 📊 Gestión de Estado

### **🏪 Zustand Stores**

#### **Store Principal de Reservas**
```typescript
// src/stores/reservationStore.ts
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

interface ReservationStore {
  // Estado
  reservations: Reservation[]
  loading: boolean
  error: string | null
  filters: ReservationFilters
  selectedReservation: Reservation | null
  editingReservation: Reservation | null

  // Configuración de vista
  viewMode: 'list' | 'calendar' | 'grid'
  sortBy: 'date' | 'name' | 'status'
  sortOrder: 'asc' | 'desc'

  // Actions
  setReservations: (reservations: Reservation[]) => void
  addReservation: (reservation: Reservation) => void
  updateReservation: (id: string, updates: Partial<Reservation>) => void
  removeReservation: (id: string) => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  setFilters: (filters: Partial<ReservationFilters>) => void
  clearFilters: () => void

  selectReservation: (reservation: Reservation | null) => void
  startEditing: (reservation: Reservation) => void
  stopEditing: () => void

  setViewMode: (mode: 'list' | 'calendar' | 'grid') => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void

  // Computed/Selectors
  filteredReservations: () => Reservation[]
  sortedReservations: () => Reservation[]
  reservationsByDate: (date: string) => Reservation[]
  reservationStats: () => ReservationStats
  upcomingReservations: () => Reservation[]
}

export const useReservationStore = create<ReservationStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Estado inicial
      reservations: [],
      loading: false,
      error: null,
      filters: {
        status: 'all',
        date: null,
        search: '',
        location: 'all'
      },
      selectedReservation: null,
      editingReservation: null,
      viewMode: 'list',
      sortBy: 'date',
      sortOrder: 'asc',

      // Actions
      setReservations: (reservations) =>
        set({ reservations }, false, 'setReservations'),

      addReservation: (reservation) =>
        set(
          (state) => ({
            reservations: [reservation, ...state.reservations]
          }),
          false,
          'addReservation'
        ),

      updateReservation: (id, updates) =>
        set(
          (state) => ({
            reservations: state.reservations.map(r =>
              r.id === id ? { ...r, ...updates } : r
            ),
            selectedReservation: state.selectedReservation?.id === id
              ? { ...state.selectedReservation, ...updates }
              : state.selectedReservation
          }),
          false,
          'updateReservation'
        ),

      removeReservation: (id) =>
        set(
          (state) => ({
            reservations: state.reservations.filter(r => r.id !== id),
            selectedReservation: state.selectedReservation?.id === id
              ? null
              : state.selectedReservation
          }),
          false,
          'removeReservation'
        ),

      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),

      setFilters: (newFilters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters }
          }),
          false,
          'setFilters'
        ),

      clearFilters: () =>
        set(
          {
            filters: {
              status: 'all',
              date: null,
              search: '',
              location: 'all'
            }
          },
          false,
          'clearFilters'
        ),

      selectReservation: (reservation) =>
        set({ selectedReservation: reservation }, false, 'selectReservation'),

      startEditing: (reservation) =>
        set({ editingReservation: reservation }, false, 'startEditing'),

      stopEditing: () =>
        set({ editingReservation: null }, false, 'stopEditing'),

      setViewMode: (viewMode) =>
        set({ viewMode }, false, 'setViewMode'),

      setSorting: (sortBy, sortOrder) =>
        set({ sortBy, sortOrder }, false, 'setSorting'),

      // Computed getters
      filteredReservations: () => {
        const { reservations, filters } = get()
        return reservations.filter(reservation => {
          if (filters.status !== 'all' && reservation.status !== filters.status) {
            return false
          }
          if (filters.location !== 'all' && reservation.tables?.location !== filters.location) {
            return false
          }
          if (filters.date && !isSameDay(new Date(reservation.date), new Date(filters.date))) {
            return false
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            return (
              reservation.customerName.toLowerCase().includes(searchLower) ||
              reservation.customerEmail.toLowerCase().includes(searchLower) ||
              reservation.customerPhone.includes(searchLower)
            )
          }
          return true
        })
      },

      sortedReservations: () => {
        const { filteredReservations, sortBy, sortOrder } = get()
        const filtered = filteredReservations()

        return filtered.sort((a, b) => {
          let comparison = 0

          switch (sortBy) {
            case 'date':
              comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
              break
            case 'name':
              comparison = a.customerName.localeCompare(b.customerName)
              break
            case 'status':
              comparison = a.status.localeCompare(b.status)
              break
            default:
              comparison = 0
          }

          return sortOrder === 'asc' ? comparison : -comparison
        })
      },

      reservationsByDate: (date) => {
        const { reservations } = get()
        return reservations.filter(r =>
          isSameDay(new Date(r.date), new Date(date))
        )
      },

      reservationStats: () => {
        const filtered = get().filteredReservations()
        return {
          total: filtered.length,
          pending: filtered.filter(r => r.status === 'PENDING').length,
          confirmed: filtered.filter(r => r.status === 'CONFIRMED').length,
          completed: filtered.filter(r => r.status === 'COMPLETED').length,
          cancelled: filtered.filter(r => r.status === 'CANCELLED').length,
          totalGuests: filtered.reduce((sum, r) => sum + r.partySize, 0),
          averagePartySize: filtered.length > 0
            ? filtered.reduce((sum, r) => sum + r.partySize, 0) / filtered.length
            : 0
        }
      },

      upcomingReservations: () => {
        const { reservations } = get()
        const now = new Date()
        return reservations
          .filter(r => new Date(r.date) > now && r.status === 'CONFIRMED')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
      }
    })),
    {
      name: 'reservation-store'
    }
  )
)

// Selector hooks para optimizar re-renders
export const useReservations = () => useReservationStore(state => state.sortedReservations())
export const useReservationStats = () => useReservationStore(state => state.reservationStats())
export const useReservationFilters = () => useReservationStore(state => state.filters)
export const useReservationActions = () => useReservationStore(state => ({
  addReservation: state.addReservation,
  updateReservation: state.updateReservation,
  removeReservation: state.removeReservation,
  setFilters: state.setFilters
}))
```

#### **Store de UI/Aplicación**
```typescript
// src/stores/appStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  // UI State
  sidebarCollapsed: boolean
  theme: 'atlantico' | 'bosque' | 'atardecer' | 'obsidiana'
  locale: 'es' | 'en' | 'de'

  // Notifications
  notifications: Notification[]
  unreadCount: number

  // Modal state
  modals: Record<string, boolean>

  // Loading states
  globalLoading: boolean
  loadingStates: Record<string, boolean>

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: string) => void
  setLocale: (locale: string) => void

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void

  openModal: (id: string) => void
  closeModal: (id: string) => void
  toggleModal: (id: string) => void

  setGlobalLoading: (loading: boolean) => void
  setLoading: (key: string, loading: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      theme: 'atlantico',
      locale: 'es',
      notifications: [],
      unreadCount: 0,
      modals: {},
      globalLoading: false,
      loadingStates: {},

      // Sidebar actions
      toggleSidebar: () =>
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      // Theme actions
      setTheme: (theme) => {
        set({ theme })
        // Aplicar tema al document
        document.documentElement.className = `theme-${theme}`
      },

      setLocale: (locale) => set({ locale }),

      // Notification actions
      addNotification: (notification) =>
        set(state => {
          const newNotification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false
          }
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }
        }),

      removeNotification: (id) =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: state.notifications.find(n => n.id === id && !n.read)
            ? state.unreadCount - 1
            : state.unreadCount
        })),

      markNotificationAsRead: (id) =>
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: state.notifications.find(n => n.id === id && !n.read)
            ? state.unreadCount - 1
            : state.unreadCount
        })),

      clearAllNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),

      // Modal actions
      openModal: (id) =>
        set(state => ({
          modals: { ...state.modals, [id]: true }
        })),

      closeModal: (id) =>
        set(state => ({
          modals: { ...state.modals, [id]: false }
        })),

      toggleModal: (id) =>
        set(state => ({
          modals: { ...state.modals, [id]: !state.modals[id] }
        })),

      // Loading actions
      setGlobalLoading: (loading) => set({ globalLoading: loading }),

      setLoading: (key, loading) =>
        set(state => ({
          loadingStates: { ...state.loadingStates, [key]: loading }
        }))
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        locale: state.locale
      })
    }
  )
)

// Selector hooks
export const useTheme = () => useAppStore(state => state.theme)
export const useSidebar = () => useAppStore(state => ({
  collapsed: state.sidebarCollapsed,
  toggle: state.toggleSidebar,
  setCollapsed: state.setSidebarCollapsed
}))
export const useNotifications = () => useAppStore(state => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  add: state.addNotification,
  remove: state.removeNotification,
  markAsRead: state.markNotificationAsRead,
  clear: state.clearAllNotifications
}))
```

---

## 🧪 Testing y Calidad

### **🔧 Configuración de Testing**

#### **Jest Configuration**
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './'
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/api/**', // Excluir API routes del coverage
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ]
}

module.exports = createJestConfig(customJestConfig)
```

#### **Jest Setup**
```javascript
// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './src/test/mocks/server'

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))

// Mock de NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN'
      }
    },
    status: 'authenticated'
  }),
  signIn: jest.fn(),
  signOut: jest.fn()
}))

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock de Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: jest.fn() }) }),
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
    }),
    removeChannel: jest.fn()
  }
}))
```

### **🧪 Tests Unitarios**

#### **Test de Hook**
```typescript
// src/hooks/__tests__/useRealtimeReservations.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useRealtimeReservations } from '../useRealtimeReservations'
import { createWrapper } from '@/test/test-utils'

describe('useRealtimeReservations', () => {
  it('debería cargar reservas inicialmente', async () => {
    const { result } = renderHook(
      () => useRealtimeReservations(),
      { wrapper: createWrapper() }
    )

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reservations).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('debería filtrar reservas por estado', async () => {
    const { result } = renderHook(
      () => useRealtimeReservations({ status: 'CONFIRMED' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar que se llamó la API con el filtro correcto
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('status=CONFIRMED')
    )
  })

  it('debería actualizar una reserva optimísticamente', async () => {
    const { result } = renderHook(
      () => useRealtimeReservations(),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const success = await result.current.updateReservationStatus(
      'test-id',
      'CONFIRMED'
    )

    expect(success).toBe(true)
    // Verificar que el estado se actualizó
  })
})
```

#### **Test de Componente**
```typescript
// src/components/__tests__/reservation-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ReservationCard } from '../reservation-card'
import { mockReservation } from '@/test/mocks/data'

describe('ReservationCard', () => {
  const mockOnEdit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza la información de la reserva correctamente', () => {
    render(
      <ReservationCard
        reservation={mockReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(mockReservation.customerName)).toBeInTheDocument()
    expect(screen.getByText(mockReservation.customerEmail)).toBeInTheDocument()
    expect(screen.getByText(`${mockReservation.partySize} personas`)).toBeInTheDocument()
  })

  it('muestra el badge correcto según el estado', () => {
    const { rerender } = render(
      <ReservationCard
        reservation={{ ...mockReservation, status: 'PENDING' }}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Pendiente')).toHaveClass('bg-yellow-100')

    rerender(
      <ReservationCard
        reservation={{ ...mockReservation, status: 'CONFIRMED' }}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Confirmada')).toHaveClass('bg-green-100')
  })

  it('llama a onEdit cuando se hace clic en editar', () => {
    render(
      <ReservationCard
        reservation={mockReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(mockOnEdit).toHaveBeenCalledWith(mockReservation.id)
  })

  it('muestra pre-órdenes cuando existen', () => {
    const reservationWithPreOrder = {
      ...mockReservation,
      hasPreOrder: true,
      reservation_items: [
        {
          id: '1',
          quantity: 2,
          menu_items: { name: 'Paella Valenciana', price: 18 }
        }
      ]
    }

    render(
      <ReservationCard
        reservation={reservationWithPreOrder}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Pre-orden')).toBeInTheDocument()
    expect(screen.getByText('2x Paella Valenciana')).toBeInTheDocument()
  })
})
```

### **🎭 Tests E2E con Playwright**

#### **Test de Flujo Completo**
```typescript
// tests/reservation-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Flujo de Reservas', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', 'admin@enigmaconalma.com')
    await page.fill('[name="password"]', 'admin123')
    await page.click('[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('crear, editar y confirmar una reserva', async ({ page }) => {
    // Ir a reservaciones
    await page.click('text=Reservaciones')
    await page.waitForURL('/dashboard/reservaciones')

    // Crear nueva reserva
    await page.click('text=Nueva Reserva')

    await page.fill('[name="customerName"]', 'Test Customer')
    await page.fill('[name="customerEmail"]', 'test@example.com')
    await page.fill('[name="customerPhone"]', '+34 123 456 789')
    await page.fill('[name="partySize"]', '4')

    // Seleccionar fecha y hora
    await page.click('[data-testid="date-picker"]')
    await page.click(`[data-date="${new Date().toISOString().split('T')[0]}"]`)
    await page.selectOption('[name="time"]', '20:00')

    // Seleccionar mesa
    await page.selectOption('[name="tableId"]', { label: 'Mesa 5 - Terraza' })

    // Añadir pre-orden
    await page.click('text=Añadir Pre-orden')
    await page.click('[data-testid="menu-item-1"]')
    await page.fill('[data-testid="quantity-1"]', '2')

    // Guardar reserva
    await page.click('[type="submit"]')

    // Verificar que se creó
    await expect(page.locator('text=Reserva creada correctamente')).toBeVisible()
    await expect(page.locator('text=Test Customer')).toBeVisible()

    // Editar la reserva
    await page.click('[data-testid="edit-reservation"]')
    await page.fill('[name="specialRequests"]', 'Mesa junto a la ventana')
    await page.click('text=Guardar Cambios')

    // Confirmar reserva
    await page.click('[data-testid="confirm-reservation"]')
    await expect(page.locator('[data-status="CONFIRMED"]')).toBeVisible()
  })

  test('filtrar reservas por estado y fecha', async ({ page }) => {
    await page.goto('/dashboard/reservaciones')

    // Filtrar por estado
    await page.selectOption('[data-testid="status-filter"]', 'CONFIRMED')
    await page.waitForSelector('[data-status="CONFIRMED"]')

    // Verificar que solo se muestran reservas confirmadas
    const reservations = await page.locator('[data-testid="reservation-card"]').all()
    for (const reservation of reservations) {
      await expect(reservation.locator('[data-status="CONFIRMED"]')).toBeVisible()
    }

    // Filtrar por fecha
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    await page.fill('[data-testid="date-filter"]', tomorrowStr)
    await page.waitForResponse('**/api/reservations**')

    // Verificar que las reservas son de mañana
    const dateElements = await page.locator('[data-testid="reservation-date"]').all()
    for (const element of dateElements) {
      const text = await element.textContent()
      expect(text).toContain(tomorrowStr)
    }
  })

  test('sistema de tiempo real', async ({ page, context }) => {
    // Abrir dos pestañas
    const page1 = page
    const page2 = await context.newPage()

    await page1.goto('/dashboard/reservaciones')
    await page2.goto('/dashboard/reservaciones')

    // Crear reserva en la primera pestaña
    await page1.click('text=Nueva Reserva')
    await page1.fill('[name="customerName"]', 'Realtime Test')
    await page1.fill('[name="customerEmail"]', 'realtime@test.com')
    await page1.fill('[name="customerPhone"]', '+34 987 654 321')
    await page1.fill('[name="partySize"]', '2')
    await page1.click('[type="submit"]')

    // Verificar que aparece en la segunda pestaña automáticamente
    await expect(page2.locator('text=Realtime Test')).toBeVisible({ timeout: 5000 })
  })
})
```

---

## 🚀 Performance y Optimización

### **⚡ Optimizaciones de Next.js**

#### **Next.js Configuration**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },

  // Optimización de imágenes
  images: {
    domains: ['supabase.enigmaconalma.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Compresión
  compress: true,

  // Headers de seguridad y cache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60'
          }
        ]
      }
    ]
  },

  // Rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/supabase/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`
      }
    ]
  },

  // Bundle analyzer en modo análisis
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true
        })
      )
      return config
    }
  })
}

module.exports = nextConfig
```

#### **Lazy Loading de Componentes**
```typescript
// src/components/lazy-components.ts
import { lazy } from 'react'

// Componentes pesados cargados solo cuando se necesitan
export const ReservationCalendar = lazy(() =>
  import('./reservation-calendar').then(mod => ({ default: mod.ReservationCalendar }))
)

export const FloorPlanEditor = lazy(() =>
  import('./floor-plan-editor').then(mod => ({ default: mod.FloorPlanEditor }))
)

export const AnalyticsDashboard = lazy(() =>
  import('./analytics-dashboard').then(mod => ({ default: mod.AnalyticsDashboard }))
)

export const MenuEditor = lazy(() =>
  import('./menu-editor').then(mod => ({ default: mod.MenuEditor }))
)

// HOC para envolver con Suspense automáticamente
export function withSuspense<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode
) {
  return function SuspendedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Componentes lazy con suspense incluido
export const LazyReservationCalendar = withSuspense(ReservationCalendar)
export const LazyFloorPlanEditor = withSuspense(FloorPlanEditor)
export const LazyAnalyticsDashboard = withSuspense(AnalyticsDashboard)
```

#### **Memoización Inteligente**
```typescript
// src/hooks/useMemoizedCalculation.ts
import { useMemo } from 'react'

interface ReservationStats {
  totalRevenue: number
  averagePartySize: number
  popularTimeSlots: TimeSlot[]
  occupancyRate: number
}

export function useReservationStats(reservations: Reservation[]): ReservationStats {
  return useMemo(() => {
    if (!reservations.length) {
      return {
        totalRevenue: 0,
        averagePartySize: 0,
        popularTimeSlots: [],
        occupancyRate: 0
      }
    }

    // Cálculos pesados memoizados
    const totalRevenue = reservations
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => {
        return sum + r.reservation_items.reduce((itemSum, item) => {
          return itemSum + (item.menu_items.price * item.quantity)
        }, 0)
      }, 0)

    const averagePartySize = reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length

    const timeSlotCounts = reservations.reduce((counts, r) => {
      const hour = new Date(r.time).getHours()
      const slot = `${hour}:00`
      counts[slot] = (counts[slot] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    const popularTimeSlots = Object.entries(timeSlotCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([time, count]) => ({ time, count }))

    const occupancyRate = (reservations.filter(r => r.status !== 'CANCELLED').length / reservations.length) * 100

    return {
      totalRevenue,
      averagePartySize,
      popularTimeSlots,
      occupancyRate
    }
  }, [reservations])
}

// Hook memoizado para filtros complejos
export function useFilteredReservations(
  reservations: Reservation[],
  filters: ReservationFilters
) {
  return useMemo(() => {
    return reservations.filter(reservation => {
      // Filtros memoizados para evitar recálculos
      if (filters.status !== 'all' && reservation.status !== filters.status) {
        return false
      }

      if (filters.date && !isSameDay(new Date(reservation.date), new Date(filters.date))) {
        return false
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchFields = [
          reservation.customerName,
          reservation.customerEmail,
          reservation.customerPhone
        ].join(' ').toLowerCase()

        if (!searchFields.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [reservations, filters])
}
```

### **🗄️ Optimización de Base de Datos**

#### **Índices Críticos**
```sql
-- Índices para optimizar consultas frecuentes
CREATE INDEX CONCURRENTLY idx_reservations_date_status
ON restaurante.reservations (date, status);

CREATE INDEX CONCURRENTLY idx_reservations_email
ON restaurante.reservations (customer_email);

CREATE INDEX CONCURRENTLY idx_reservations_phone
ON restaurante.reservations (customer_phone);

CREATE INDEX CONCURRENTLY idx_reservations_table_date
ON restaurante.reservations (table_id, date);

CREATE INDEX CONCURRENTLY idx_menu_items_category
ON restaurante.menu_items (category_id, is_available);

CREATE INDEX CONCURRENTLY idx_reservation_items_reservation
ON restaurante.reservation_items (reservation_id);

-- Índice compuesto para búsquedas de texto
CREATE INDEX CONCURRENTLY idx_reservations_search
ON restaurante.reservations
USING gin((customer_name || ' ' || customer_email || ' ' || customer_phone) gin_trgm_ops);

-- Índice para ordenamiento por fecha
CREATE INDEX CONCURRENTLY idx_reservations_date_desc
ON restaurante.reservations (date DESC);
```

#### **Consultas Optimizadas**
```typescript
// src/lib/database/optimized-queries.ts
import { prisma } from '@/lib/prisma'

export class OptimizedReservationQueries {
  // Consulta optimizada para dashboard con agregaciones
  static async getDashboardStats(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const [reservationStats, tableStats, revenueStats] = await Promise.all([
      // Estadísticas de reservas del día
      prisma.reservation.groupBy({
        by: ['status'],
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        _count: { _all: true },
        _sum: { partySize: true }
      }),

      // Estado de mesas
      prisma.table.findMany({
        select: {
          id: true,
          number: true,
          location: true,
          capacity: true,
          reservations: {
            where: {
              date: {
                gte: startOfDay,
                lte: endOfDay
              },
              status: { in: ['CONFIRMED', 'SEATED'] }
            },
            select: { id: true }
          }
        }
      }),

      // Ingresos del día
      prisma.$queryRaw`
        SELECT
          COALESCE(SUM(mi.price * ri.quantity), 0) as total_revenue
        FROM restaurante.reservations r
        JOIN restaurante.reservation_items ri ON r.id = ri.reservation_id
        JOIN restaurante.menu_items mi ON ri.menu_item_id = mi.id
        WHERE r.date >= ${startOfDay}
          AND r.date <= ${endOfDay}
          AND r.status = 'COMPLETED'
      `
    ])

    return {
      reservations: reservationStats,
      tables: tableStats,
      revenue: revenueStats[0]?.total_revenue || 0
    }
  }

  // Búsqueda optimizada con paginación
  static async searchReservations({
    search,
    status,
    date,
    limit = 20,
    offset = 0
  }: SearchParams) {
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      where.date = { gte: startDate, lt: endDate }
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } }
      ]
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          tables: {
            select: { id: true, number: true, location: true, capacity: true }
          },
          reservation_items: {
            include: {
              menu_items: {
                select: { id: true, name: true, price: true }
              }
            }
          }
        },
        orderBy: [
          { date: 'asc' },
          { time: 'asc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.reservation.count({ where })
    ])

    return {
      reservations,
      total,
      hasMore: offset + limit < total
    }
  }

  // Consulta optimizada para disponibilidad de mesas
  static async getTableAvailability(date: Date, time: string) {
    const requestedDateTime = new Date(`${date.toISOString().split('T')[0]}T${time}:00`)
    const bufferMinutes = 120 // 2 horas de buffer

    return prisma.table.findMany({
      where: {
        isActive: true,
        reservations: {
          none: {
            date: {
              gte: new Date(requestedDateTime.getTime() - bufferMinutes * 60000),
              lte: new Date(requestedDateTime.getTime() + bufferMinutes * 60000)
            },
            status: { in: ['CONFIRMED', 'SEATED'] }
          }
        }
      },
      select: {
        id: true,
        number: true,
        capacity: true,
        location: true
      },
      orderBy: [
        { location: 'asc' },
        { number: 'asc' }
      ]
    })
  }
}
```

### **📦 Bundle Optimization**

#### **Webpack Bundle Analysis**
```bash
# Analizar bundle
npm run build
ANALYZE=true npm run build

# Ver archivo de análisis
open .next/analyze/client.html
```

#### **Tree Shaking Configuration**
```javascript
// Configuración en package.json para tree shaking
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/app/globals.css"
  ]
}
```

#### **Dynamic Imports Estratégicos**
```typescript
// src/utils/dynamic-imports.ts

// Importación dinámica de librerías pesadas
export const loadChartLibrary = async () => {
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  return Chart
}

export const loadPDFLibrary = async () => {
  const [jsPDF, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ])
  return { jsPDF: jsPDF.default, autoTable }
}

export const loadQRLibrary = async () => {
  const QRCode = await import('qrcode')
  return QRCode.default
}

// Uso en componentes
function AnalyticsChart() {
  const [Chart, setChart] = useState(null)

  useEffect(() => {
    loadChartLibrary().then(setChart)
  }, [])

  if (!Chart) return <ChartSkeleton />

  return <Chart data={chartData} />
}
```

---

<div align="center">

**🛠️ Guía de Desarrollo - Enigma Restaurant Platform**

*Desarrollo profesional y mantenimiento de la plataforma*

[⬅️ Volver al README principal](README.md) • [🚀 Guía de Deployment](DEPLOYMENT.md) • [🏛️ Panel Admin](src/app/(admin)/dashboard/README.md)

---

**Desarrollado con ❤️ para la excelencia en desarrollo de software**

</div>