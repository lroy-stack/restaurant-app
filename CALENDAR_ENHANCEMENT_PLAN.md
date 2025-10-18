# 📅 PLAN DE MEJORA: CALENDARIO EMPRESARIAL ENIGMA

**Rama:** `feature/calendar-enterprise-v2`
**Autor:** Claude + Context7 Research
**Fecha:** 2025-01-18
**Stack Investigado:** Schedule-X, react-calendar-timeline, react-calendar-heatmap

---

## 🎯 OBJETIVOS

### ✅ Implementaciones Críticas
1. **Click slot → Modal crear reserva** - UX instant booking
2. **Pagination escalable** - Soportar +1000 reservas
3. **Vista histórica** - Navegación reservas pasadas
4. **Mapa de calor** - Visualización ocupación por día/hora
5. **Click reserva → Detalles completos** - Modal información
6. **Timeline diario profesional** - Inspirado en OpenTable/Resy

---

## 🏗️ ARQUITECTURA PROPUESTA

### **FASE 1: Timeline Diario Robusto (Prioridad 1)**

#### **Librería Seleccionada: Schedule-X**
**Justificación:**
- ✅ **Moderna alternativa** a react-big-calendar/fullcalendar
- ✅ **Resource Scheduler** built-in (mesas = resources)
- ✅ **Hourly + Daily views** nativos
- ✅ **Drag & Drop + Resize** optimizados
- ✅ **Lazy Loading** nativo para pagination
- ✅ **Temporal API** (modern date handling)
- ✅ **TypeScript first** (217 snippets Context7, trust 8.2)
- ✅ **Premium plugins** disponibles (modal interactivo, scheduling assistant)

**Ventajas vs react-big-calendar:**
| Feature | react-big-calendar | Schedule-X |
|---------|-------------------|------------|
| Resource Scheduler | ❌ Manual | ✅ Native |
| Lazy Loading | ❌ Manual | ✅ Built-in |
| Temporal API | ❌ moment.js | ✅ Temporal |
| Hourly Timeline | ⚠️ Complex | ✅ Simple |
| TypeScript | ⚠️ Partial | ✅ Full |
| Performance +100 events | ⚠️ Slow | ✅ Fast |

#### **Implementación Schedule-X**

**Ubicación:** `/src/app/(admin)/dashboard/reservaciones/components/timeline-view.tsx`

**Estructura de Resources (Mesas):**
```typescript
// Mapeo de mesas físicas → recursos de Schedule-X
const resources = tables.map(table => ({
  id: table.id,
  label: `Mesa ${table.number}`,
  colorName: `table-${table.location}`,
  lightColors: LOCATION_COLORS[table.location],
  metadata: {
    capacity: table.capacity,
    location: table.location,
    isActive: table.isActive
  }
}))
```

**Configuración Hourly View:**
```typescript
import { createHourlyView, createConfig, TimeUnits } from "@sx-premium/resource-scheduler"

const rConfig = createConfig()
rConfig.initialHours.value = new TimeUnits().getDayHoursBetween(
  Temporal.PlainDateTime.from('2025-01-18T12:00'), // Lunch start
  Temporal.PlainDateTime.from('2025-01-18T23:00')  // Dinner end
)
rConfig.dragAndDrop.value = true
rConfig.resize.value = true
rConfig.dragSnapping.value = 15 // 15-min intervals
rConfig.resources.value = resources

// Callbacks críticos
rConfig.onClickDateTime.value = (datetime, resourceId) => {
  // OBJETIVO 1: Abrir modal crear reserva
  openCreateReservationModal({
    tableId: resourceId,
    dateTime: datetime
  })
}

rConfig.onDoubleClickDateTime.value = (datetime, resourceId) => {
  // Quick create (skip modal)
  createReservationQuick({ tableId: resourceId, dateTime: datetime })
}
```

**Eventos (Reservaciones):**
```typescript
const events = reservations.map(reservation => ({
  id: reservation.id,
  title: `${reservation.customerName} (${reservation.partySize}p)`,
  start: Temporal.ZonedDateTime.from(reservation.time),
  end: Temporal.ZonedDateTime.from(reservation.time).add({ hours: 2 }),
  resourceId: reservation.tableId || reservation.table_ids?.[0], // Multi-table: usar primera
  calendarId: STATUS_CALENDAR_IDS[reservation.status], // Color por status
  metadata: {
    status: reservation.status,
    hasPreOrder: reservation.hasPreOrder,
    specialRequests: reservation.specialRequests,
    partySize: reservation.partySize
  }
}))
```

**Lazy Loading (Pagination):**
```typescript
rConfig.onLazyLoadDate.value = async (dates: Temporal.PlainDate[]) => {
  const startDate = dates[0].toString()
  const endDate = dates[dates.length - 1].toString()

  // Fetch solo reservas visibles en timeline
  const response = await fetch(
    `/api/reservations?startDate=${startDate}&endDate=${endDate}&limit=100`
  )
  const { reservations } = await response.json()

  // Merge con eventos existentes (evitar duplicados)
  eventsService.set(mergeEvents(currentEvents, reservations))
}
```

**Archivo:** `/src/app/(admin)/dashboard/reservaciones/components/timeline-view.tsx`
```typescript
'use client'

import { createCalendar } from '@schedule-x/calendar'
import { createEventsServicePlugin } from "@schedule-x/events-service"
import { createHourlyView, createDailyView, createConfig, TimeUnits } from "@sx-premium/resource-scheduler"
import { createInteractiveEventModal } from "@sx-premium/interactive-event-modal"
import { Temporal } from '@js-temporal/polyfill'

import '@sx-premium/resource-scheduler/index.css'
import '@sx-premium/interactive-event-modal/index.css'
import '@schedule-x/theme-default/dist/index.css'

interface TimelineViewProps {
  reservations: Reservation[]
  tables: Table[]
  onCreateReservation: (data: CreateReservationData) => void
  onUpdateReservation: (id: string, data: UpdateData) => void
}

export function TimelineView({
  reservations,
  tables,
  onCreateReservation,
  onUpdateReservation
}: TimelineViewProps) {
  // ... implementación completa
}
```

**Referencias Codebase:**
- Hook existente: `/src/hooks/useRealtimeReservations.ts:1` (reutilizar)
- Hook tables: `/src/hooks/useTables.ts:1` (reutilizar)
- API: `/src/app/api/reservations/route.ts:1` (extender con startDate/endDate)

---

### **FASE 2: Pagination Escalable (Prioridad 2)**

#### **Estrategia: Cursor-based Pagination + Virtual Scrolling**

**Justificación:**
- ✅ Soporta millones de registros (vs offset-based max ~10k)
- ✅ Performance constante O(1)
- ✅ Realtime-friendly (nuevos registros no afectan cursor)
- ✅ Implementado por: Stripe, GitHub, Slack

**Backend API Enhancement**

**Archivo:** `/src/app/api/reservations/route.ts:124`

**Cambios:**
```typescript
// ANTES (offset-based - limitado)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const date = searchParams.get('date')
  // ...
}

// DESPUÉS (cursor-based - escalable)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Filtros existentes
  const status = searchParams.get('status')
  const date = searchParams.get('date')
  const search = searchParams.get('search')
  const tableId = searchParams.get('tableId')

  // ✅ NUEVO: Pagination parameters
  const cursor = searchParams.get('cursor') // ID de última reserva cargada
  const limit = parseInt(searchParams.get('limit') || '50')
  const direction = searchParams.get('direction') || 'forward' // forward | backward

  // ✅ NUEVO: Date range (para timeline lazy loading)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // Query construction
  let query = `${SUPABASE_URL}/rest/v1/reservations?select=*,customers(*),reservation_items(*,menu_items(*,menu_categories(*)))`

  // Cursor pagination
  if (cursor) {
    if (direction === 'forward') {
      query += `&date=gt.${cursor}` // Fecha mayor que cursor
    } else {
      query += `&date=lt.${cursor}` // Fecha menor que cursor
    }
  }

  // Date range filter (timeline)
  if (startDate && endDate) {
    query += `&date=gte.${startDate}T00:00:00&date=lte.${endDate}T23:59:59`
  } else if (!cursor) {
    // Default: próximos 30 días (línea 142-149 original)
    const today = new Date()
    const next30Days = new Date(today)
    next30Days.setDate(today.getDate() + 30)
    query += `&date=gte.${today.toISOString().split('T')[0]}T00:00:00`
    query += `&date=lte.${next30Days.toISOString().split('T')[0]}T23:59:59`
  }

  // Otros filtros (status, search, tableId) - sin cambios
  if (status && status !== 'all') {
    query += `&status=eq.${status}`
  }

  // Order + Limit
  query += `&order=date.${direction === 'forward' ? 'asc' : 'desc'},time.asc`
  query += `&limit=${limit + 1}` // +1 para detectar hasMore

  const response = await fetch(query, { /* headers... */ })
  const reservations = await response.json()

  // ✅ NUEVO: Detectar si hay más páginas
  const hasMore = reservations.length > limit
  if (hasMore) reservations.pop() // Remover elemento extra

  // ✅ NUEVO: Calcular próximo cursor
  const nextCursor = reservations.length > 0
    ? reservations[reservations.length - 1].date
    : null

  // Tabla lookup (línea 169-237 original - sin cambios)
  // ... código existente de lookup de mesas ...

  return NextResponse.json({
    success: true,
    reservations,
    pagination: {
      cursor: nextCursor,
      hasMore,
      limit
    }
  })
}
```

**Frontend Hook: usePaginatedReservations**

**Archivo:** `/src/hooks/usePaginatedReservations.ts` (nuevo)

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { Reservation } from '@/types/reservation'

interface PaginationState {
  cursor: string | null
  hasMore: boolean
  loading: boolean
}

export function usePaginatedReservations(filters: ReservationFilters) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    cursor: null,
    hasMore: true,
    loading: false
  })

  const fetchPage = useCallback(async (direction: 'forward' | 'backward' = 'forward') => {
    if (pagination.loading) return
    if (direction === 'forward' && !pagination.hasMore) return

    setPagination(prev => ({ ...prev, loading: true }))

    try {
      const params = new URLSearchParams({
        ...filters,
        cursor: pagination.cursor || '',
        direction,
        limit: '50'
      })

      const response = await fetch(`/api/reservations?${params}`)
      const { reservations: newReservations, pagination: paginationData } = await response.json()

      setReservations(prev =>
        direction === 'forward'
          ? [...prev, ...newReservations]  // Append
          : [...newReservations, ...prev]  // Prepend
      )

      setPagination({
        cursor: paginationData.cursor,
        hasMore: paginationData.hasMore,
        loading: false
      })
    } catch (error) {
      console.error('Pagination error:', error)
      setPagination(prev => ({ ...prev, loading: false }))
    }
  }, [filters, pagination.cursor, pagination.hasMore, pagination.loading])

  const loadMore = () => fetchPage('forward')
  const reset = () => {
    setReservations([])
    setPagination({ cursor: null, hasMore: true, loading: false })
  }

  return {
    reservations,
    loadMore,
    reset,
    hasMore: pagination.hasMore,
    loading: pagination.loading
  }
}
```

**Infinite Scroll Component**

**Archivo:** `/src/app/(admin)/dashboard/reservaciones/components/infinite-reservation-list.tsx` (nuevo)

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { usePaginatedReservations } from '@/hooks/usePaginatedReservations'
import { CompactReservationList } from './compact-reservation-list'

export function InfiniteReservationList({ filters }: { filters: ReservationFilters }) {
  const { reservations, loadMore, hasMore, loading } = usePaginatedReservations(filters)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.5 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  return (
    <div className="space-y-4">
      <CompactReservationList reservations={reservations} loading={loading} />

      {hasMore && (
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          ) : (
            <button onClick={loadMore} className="text-muted-foreground">
              Cargar más reservas
            </button>
          )}
        </div>
      )}

      {!hasMore && reservations.length > 0 && (
        <p className="text-center text-muted-foreground text-sm">
          No hay más reservas para mostrar
        </p>
      )}
    </div>
  )
}
```

---

### **FASE 3: Vista Histórica (Prioridad 3)**

#### **Implementación: Dual Calendar Navigation**

**Archivo:** `/src/app/(admin)/dashboard/reservaciones/components/reservation-filters.tsx:54`

**Modificaciones:**
```typescript
// LÍNEA 81-101 (isDateDisabledForFilter)
const isDateDisabledForFilter = (date: Date): boolean => {
  // ❌ ANTES: Solo bloquear días cerrados
  return closedDays.includes(date.getDay())

  // ✅ DESPUÉS: Permitir TODO (histórico incluido)
  return false // No restrictions for filtering
}

// ✅ NUEVO: Indicador visual para días con reservas
const getDateIndicator = (date: Date): 'none' | 'few' | 'medium' | 'full' => {
  const dateString = format(date, 'yyyy-MM-dd')
  const count = reservationCountByDate[dateString] || 0

  if (count === 0) return 'none'
  if (count < 5) return 'few'
  if (count < 10) return 'medium'
  return 'full'
}

// CustomCalendar component enhancement
<CustomCalendar
  value={date ? format(date, 'yyyy-MM-dd') : ''}
  onChange={(dateString) => handleDateChange(dateString ? new Date(dateString) : undefined)}
  placeholder="Seleccionar fecha"
  className="h-9"
  closedDays={[]} // ✅ CAMBIO: Empty array (permitir todos los días)
  minAdvanceMinutes={0}
  isDateDisabled={() => false} // ✅ CAMBIO: No restrictions
  allowPastDates={true}
  // ✅ NUEVO: Mostrar indicador de ocupación
  renderDay={(date) => {
    const indicator = getDateIndicator(date)
    return (
      <div className="relative">
        <span>{date.getDate()}</span>
        {indicator !== 'none' && (
          <div className={cn(
            "absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
            indicator === 'few' && "bg-yellow-400",
            indicator === 'medium' && "bg-orange-400",
            indicator === 'full' && "bg-red-400"
          )} />
        )}
      </div>
    )
  }}
/>
```

**Fetch Reservation Count by Date (pre-carga)**

**Archivo:** `/src/hooks/useReservationCountByDate.ts` (nuevo)

```typescript
'use client'

import { useState, useEffect } from 'use client'
import { useState, useEffect } from 'react'

export function useReservationCountByDate(month: Date) {
  const [countByDate, setCountByDate] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true)
      try {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

        const response = await fetch(
          `/api/reservations/stats/by-date?startDate=${startOfMonth.toISOString().split('T')[0]}&endDate=${endOfMonth.toISOString().split('T')[0]}`
        )
        const { countByDate } = await response.json()
        setCountByDate(countByDate)
      } catch (error) {
        console.error('Error fetching reservation counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [month])

  return { countByDate, loading }
}
```

**API Endpoint: Stats by Date**

**Archivo:** `/src/app/api/reservations/stats/by-date/route.ts` (nuevo)

```typescript
import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 })
    }

    // Usar SQL agregación para performance
    const query = `${SUPABASE_URL}/rest/v1/rpc/get_reservation_count_by_date`

    const response = await fetch(query, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ start_date: startDate, end_date: endDate })
    })

    const data = await response.json()

    // Transformar a objeto clave-valor
    const countByDate = data.reduce((acc, row) => {
      acc[row.date] = row.count
      return acc
    }, {})

    return NextResponse.json({ success: true, countByDate })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Database Function (PostgreSQL)**

**Archivo:** Crear migración Supabase

```sql
-- Create function to aggregate reservation counts by date
CREATE OR REPLACE FUNCTION restaurante.get_reservation_count_by_date(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  date DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(r.date) as date,
    COUNT(*) as count
  FROM restaurante.reservations r
  WHERE
    r.date >= start_date
    AND r.date <= end_date
    AND r.status NOT IN ('CANCELLED', 'NO_SHOW')
  GROUP BY DATE(r.date)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql;
```

---

### **FASE 4: Heatmap de Ocupación (Prioridad 4)**

#### **Librería Seleccionada: react-calendar-heatmap**

**Justificación:**
- ✅ Lightweight (12 snippets, trust 9.1)
- ✅ SVG-based (performance)
- ✅ GitHub-style estética
- ✅ Custom colors via classForValue
- ✅ Click/hover events

**Implementación: Ocupancy Heatmap**

**Archivo:** `/src/app/(admin)/dashboard/reservaciones/components/occupancy-heatmap.tsx` (nuevo)

```typescript
'use client'

import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { format, subMonths, addMonths } from 'date-fns'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OccupancyHeatmapProps {
  startDate?: Date
  endDate?: Date
  onDateClick?: (date: Date) => void
}

interface HeatmapValue {
  date: string
  count: number
  occupancyRate: number // 0-100
}

export function OccupancyHeatmap({
  startDate = subMonths(new Date(), 6),
  endDate = addMonths(new Date(), 1),
  onDateClick
}: OccupancyHeatmapProps) {
  const [values, setValues] = useState<HeatmapValue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOccupancyData = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/reservations/stats/occupancy?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
        )
        const { occupancyData } = await response.json()
        setValues(occupancyData)
      } catch (error) {
        console.error('Error fetching occupancy:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOccupancyData()
  }, [startDate, endDate])

  // Color scale basado en tasa de ocupación
  const classForValue = (value: HeatmapValue | undefined) => {
    if (!value || value.count === 0) {
      return 'color-empty'
    }

    const rate = value.occupancyRate
    if (rate < 30) return 'color-scale-1' // Verde claro
    if (rate < 60) return 'color-scale-2' // Verde
    if (rate < 85) return 'color-scale-3' // Amarillo/Naranja
    return 'color-scale-4' // Rojo (casi full)
  }

  const titleForValue = (value: HeatmapValue | undefined) => {
    if (!value || value.count === 0) {
      return 'Sin reservas'
    }
    return `${value.count} reservas (${value.occupancyRate}% ocupación)`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mapa de Calor - Ocupación</CardTitle>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="color-scale-1">Baja (&lt;30%)</Badge>
            <Badge variant="outline" className="color-scale-2">Media (30-60%)</Badge>
            <Badge variant="outline" className="color-scale-3">Alta (60-85%)</Badge>
            <Badge variant="outline" className="color-scale-4">Completa (&gt;85%)</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={values}
            classForValue={classForValue}
            titleForValue={titleForValue}
            showMonthLabels={true}
            showWeekdayLabels={true}
            onClick={(value) => {
              if (value && onDateClick) {
                onDateClick(new Date(value.date))
              }
            }}
          />
        )}
      </CardContent>

      <style jsx global>{`
        .react-calendar-heatmap .color-empty { fill: #ebedf0; }
        .react-calendar-heatmap .color-scale-1 { fill: #9be9a8; }
        .react-calendar-heatmap .color-scale-2 { fill: #40c463; }
        .react-calendar-heatmap .color-scale-3 { fill: #f59e0b; }
        .react-calendar-heatmap .color-scale-4 { fill: #ef4444; }

        /* Dark mode */
        .dark .react-calendar-heatmap .color-empty { fill: #161b22; }
        .dark .react-calendar-heatmap .color-scale-1 { fill: #0e4429; }
        .dark .react-calendar-heatmap .color-scale-2 { fill: #006d32; }
        .dark .react-calendar-heatmap .color-scale-3 { fill: #92400e; }
        .dark .react-calendar-heatmap .color-scale-4 { fill: #991b1b; }
      `}</style>
    </Card>
  )
}
```

**API Endpoint: Occupancy Stats**

**Archivo:** `/src/app/api/reservations/stats/occupancy/route.ts` (nuevo)

```typescript
import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 })
    }

    // 1. Get total capacity per day (from business_hours)
    const businessHoursResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/business_hours?select=day_of_week,max_capacity`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )
    const businessHours = await businessHoursResponse.json()
    const capacityByDayOfWeek = businessHours.reduce((acc, bh) => {
      acc[bh.day_of_week] = bh.max_capacity || 100 // Default 100 if not set
      return acc
    }, {})

    // 2. Get reservation counts by date
    const query = `${SUPABASE_URL}/rest/v1/rpc/get_occupancy_by_date`
    const response = await fetch(query, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ start_date: startDate, end_date: endDate })
    })

    const data = await response.json()

    // 3. Calculate occupancy rate
    const occupancyData = data.map(row => {
      const date = new Date(row.date)
      const dayOfWeek = date.getDay()
      const maxCapacity = capacityByDayOfWeek[dayOfWeek] || 100
      const occupancyRate = Math.round((row.total_party_size / maxCapacity) * 100)

      return {
        date: row.date,
        count: row.reservation_count,
        totalPartySize: row.total_party_size,
        maxCapacity,
        occupancyRate: Math.min(occupancyRate, 100) // Cap at 100%
      }
    })

    return NextResponse.json({ success: true, occupancyData })
  } catch (error) {
    console.error('Error fetching occupancy stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Database Function (PostgreSQL)**

```sql
-- Create function to calculate occupancy by date
CREATE OR REPLACE FUNCTION restaurante.get_occupancy_by_date(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  date DATE,
  reservation_count BIGINT,
  total_party_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(r.date) as date,
    COUNT(*) as reservation_count,
    SUM(r."partySize") as total_party_size
  FROM restaurante.reservations r
  WHERE
    r.date >= start_date
    AND r.date <= end_date
    AND r.status IN ('CONFIRMED', 'SEATED', 'COMPLETED')
  GROUP BY DATE(r.date)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql;
```

---

### **FASE 5: Modal Detalles + Modal Crear (Prioridad 5)**

#### **Modal Detalles Completos**

**Archivo:** `/src/app/(admin)/dashboard/reservaciones/components/reservation-detail-modal.tsx:1` (YA EXISTE - MEJORAR)

**Mejoras necesarias:**
```typescript
// ✅ NUEVO: Trigger desde click en evento de calendario
interface ReservationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  reservationId: string // ✅ CAMBIO: Recibir solo ID, fetch interno
  onUpdate?: (id: string, data: any) => void
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  reservationId,
  onUpdate
}: ReservationDetailModalProps) {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && reservationId) {
      fetchReservationDetails()
    }
  }, [isOpen, reservationId])

  const fetchReservationDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservationId}`)
      const { reservation } = await response.json()
      setReservation(reservation)
    } catch (error) {
      console.error('Error fetching reservation:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... resto de implementación existente
}
```

#### **Modal Crear Reserva Rápido**

**Archivo:** `/src/app/(admin)/dashboard/reservaciones/components/quick-create-modal.tsx` (nuevo)

```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface QuickCreateModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    tableId?: string
    dateTime?: Date
    partySize?: number
  }
  onSuccess?: (reservation: Reservation) => void
}

export function QuickCreateModal({
  isOpen,
  onClose,
  initialData,
  onSuccess
}: QuickCreateModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: initialData?.partySize || 2,
    date: initialData?.dateTime ? format(initialData.dateTime, 'yyyy-MM-dd') : '',
    time: initialData?.dateTime ? format(initialData.dateTime, 'HH:mm') : '',
    tableId: initialData?.tableId || '',
    specialRequests: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.customerName.split(' ')[0],
          lastName: formData.customerName.split(' ').slice(1).join(' ') || '',
          phone: formData.customerPhone,
          email: formData.customerEmail,
          partySize: formData.partySize,
          date: formData.date,
          time: formData.time,
          tableIds: formData.tableId ? [formData.tableId] : [],
          specialRequests: formData.specialRequests,
          dataProcessingConsent: true,
          emailConsent: true,
          marketingConsent: false,
          preferredLanguage: 'ES',
          source: 'admin' // ✅ AUTO-CONFIRM
        })
      })

      if (response.ok) {
        const { reservation } = await response.json()
        toast.success('Reserva creada exitosamente')
        onSuccess?.(reservation)
        onClose()
      } else {
        const { error } = await response.json()
        toast.error(error || 'Error al crear reserva')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Error de red al crear reserva')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Reserva Rápida</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información inicial pre-llenada */}
          {initialData?.dateTime && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
              <strong>Fecha:</strong> {format(initialData.dateTime, 'PPP', { locale: es })} •
              <strong> Hora:</strong> {format(initialData.dateTime, 'HH:mm')}
              {initialData.tableId && <> • <strong>Mesa asignada</strong></>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="customerName">Nombre Completo *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Teléfono *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
                placeholder="+34 600 123 456"
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="opcional"
              />
            </div>

            <div>
              <Label htmlFor="partySize">Personas *</Label>
              <Select
                value={formData.partySize.toString()}
                onValueChange={(value) => setFormData({ ...formData, partySize: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} persona{num > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
              <Input
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Alergias, preferencias..."
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🔗 INTEGRACIÓN COMPLETA

### **Archivo Principal Modificado**

**Archivo:** `/src/app/(admin)/dashboard/reservaciones/page.tsx:28`

**Cambios:**
```typescript
'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// ✅ NUEVOS COMPONENTES
import { TimelineView } from './components/timeline-view'
import { OccupancyHeatmap } from './components/occupancy-heatmap'
import { InfiniteReservationList } from './components/infinite-reservation-list'
import { QuickCreateModal } from './components/quick-create-modal'
import { ReservationDetailModal } from './components/reservation-detail-modal'

// Componentes existentes
import { useRealtimeReservations } from '@/hooks/useRealtimeReservations'
import { useTables } from '@/hooks/useTables'
import { ReservationFilters } from './components/reservation-filters'
import { QuickStats } from './components/quick-stats'
import { ViewToggle, useViewMode } from './components/view-toggle'
import { ReservationCalendar } from './components/reservation-calendar'
import { toast } from 'sonner'

export default function ReservacionesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ✅ NUEVO: View mode con timeline + heatmap
  const currentView = searchParams.get('view') || 'list' // list | calendar | timeline | heatmap

  // Filtros
  const filters = {
    status: searchParams.get('status') || undefined,
    date: searchParams.get('date') || undefined,
    search: searchParams.get('search') || undefined,
    tableId: searchParams.get('tableId') || undefined
  }

  // Hooks existentes
  const {
    reservations,
    summary,
    loading,
    error,
    refetch,
    updateReservationStatus,
    updateReservation,
  } = useRealtimeReservations(filters)

  const { tables, loading: tablesLoading } = useTables()

  // ✅ NUEVO: Modales state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalData, setCreateModalData] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailReservationId, setDetailReservationId] = useState<string | null>(null)

  // ✅ NUEVO: Handlers para timeline
  const handleTimelineSlotClick = (data: { tableId: string, dateTime: Date }) => {
    setCreateModalData(data)
    setCreateModalOpen(true)
  }

  const handleEventClick = (reservationId: string) => {
    setDetailReservationId(reservationId)
    setDetailModalOpen(true)
  }

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`/dashboard/reservaciones?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reservas</h1>
          <p className="text-muted-foreground">Sistema de calendario empresarial</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          Nueva Reserva
        </Button>
      </div>

      {/* QuickStats */}
      <QuickStats reservations={reservations} />

      {/* ✅ NUEVO: Tabs para views */}
      <Tabs value={currentView} onValueChange={handleViewChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
        </TabsList>

        {/* Filters - Común para todos */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <ReservationFilters
              tables={tables}
              loading={tablesLoading}
              currentFilters={filters}
            />
          </CardContent>
        </Card>

        {/* ✅ Vista Lista Infinita */}
        <TabsContent value="list">
          <InfiniteReservationList filters={filters} />
        </TabsContent>

        {/* Vista Calendario Existente */}
        <TabsContent value="calendar">
          <ReservationCalendar
            reservations={reservations}
            loading={loading}
            currentDate={new Date()}
            onReservationClick={handleEventClick}
          />
        </TabsContent>

        {/* ✅ Vista Timeline */}
        <TabsContent value="timeline">
          <TimelineView
            reservations={reservations}
            tables={tables}
            onSlotClick={handleTimelineSlotClick}
            onEventClick={handleEventClick}
            onUpdateReservation={updateReservation}
          />
        </TabsContent>

        {/* ✅ Vista Heatmap */}
        <TabsContent value="heatmap">
          <OccupancyHeatmap
            startDate={new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)} // 6 meses atrás
            endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 1 mes adelante
            onDateClick={(date) => {
              // Navegar a esa fecha en timeline/calendar
              const params = new URLSearchParams(searchParams.toString())
              params.set('date', format(date, 'yyyy-MM-dd'))
              params.set('view', 'timeline')
              router.push(`/dashboard/reservaciones?${params.toString()}`)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* ✅ NUEVO: Modales */}
      <QuickCreateModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          setCreateModalData(null)
        }}
        initialData={createModalData}
        onSuccess={() => {
          refetch()
          toast.success('Reserva creada exitosamente')
        }}
      />

      <ReservationDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setDetailReservationId(null)
        }}
        reservationId={detailReservationId || ''}
        onUpdate={updateReservation}
      />
    </div>
  )
}
```

---

## 📦 DEPENDENCIAS NUEVAS

**Archivo:** `package.json`

```json
{
  "dependencies": {
    "@schedule-x/calendar": "^3.11.1",
    "@schedule-x/events-service": "^3.11.1",
    "@schedule-x/theme-default": "^3.11.1",
    "@sx-premium/resource-scheduler": "^3.11.1",
    "@sx-premium/interactive-event-modal": "^3.11.1",
    "@sx-premium/scheduling-assistant": "^3.11.1",
    "@js-temporal/polyfill": "^0.4.4",
    "react-calendar-heatmap": "^1.9.0",
    "@types/react-calendar-heatmap": "^1.6.3"
  }
}
```

**Instalación:**
```bash
npm install @schedule-x/calendar @schedule-x/events-service @schedule-x/theme-default @sx-premium/resource-scheduler @sx-premium/interactive-event-modal @sx-premium/scheduling-assistant @js-temporal/polyfill react-calendar-heatmap @types/react-calendar-heatmap
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Timeline Diario (Semana 1)**
- [ ] Instalar dependencias Schedule-X
- [ ] Crear `components/timeline-view.tsx`
- [ ] Configurar resource scheduler (hourly + daily views)
- [ ] Implementar callbacks de click/double-click
- [ ] Integrar drag & drop con backend save
- [ ] Testing timeline básico

### **Fase 2: Pagination (Semana 1-2)**
- [ ] Modificar `/api/reservations/route.ts` (cursor-based)
- [ ] Crear hook `usePaginatedReservations.ts`
- [ ] Crear `components/infinite-reservation-list.tsx`
- [ ] Implementar intersection observer
- [ ] Testing con +500 reservas

### **Fase 3: Vista Histórica (Semana 2)**
- [ ] Modificar `reservation-filters.tsx` (allowPastDates)
- [ ] Crear hook `useReservationCountByDate.ts`
- [ ] Crear API `/api/reservations/stats/by-date`
- [ ] Crear función PostgreSQL `get_reservation_count_by_date`
- [ ] Implementar indicadores visuales en calendario

### **Fase 4: Heatmap (Semana 2-3)**
- [ ] Instalar react-calendar-heatmap
- [ ] Crear `components/occupancy-heatmap.tsx`
- [ ] Crear API `/api/reservations/stats/occupancy`
- [ ] Crear función PostgreSQL `get_occupancy_by_date`
- [ ] Integrar click heatmap → timeline navigation

### **Fase 5: Modales (Semana 3)**
- [ ] Crear `components/quick-create-modal.tsx`
- [ ] Mejorar `reservation-detail-modal.tsx` (fetch interno)
- [ ] Integrar modales con timeline clicks
- [ ] Testing flujo completo crear + editar

### **Integración Final (Semana 3-4)**
- [ ] Modificar `page.tsx` con Tabs
- [ ] Integrar 4 vistas (list/calendar/timeline/heatmap)
- [ ] Testing cross-view navigation
- [ ] Testing realtime updates en timeline
- [ ] Performance audit con Lighthouse
- [ ] Mobile testing (iPhone SE + iPad)

---

## 🚀 MEJORAS FUTURAS (Post-MVP)

1. **Timeline Multi-Day View** - Vista semanal con todos los días
2. **Resource Grouping** - Agrupar mesas por ubicación (Terrace/VIP/Sala)
3. **Conflict Detection Visual** - Highlight conflicts en timeline
4. **Bulk Operations** - Selección múltiple en timeline
5. **Export Timeline** - PDF/PNG snapshot del timeline
6. **Predictive Analytics** - ML para predecir ocupación futura
7. **Mobile Timeline** - Versión optimizada para tablets

---

## 📚 REFERENCIAS TÉCNICAS

### **Schedule-X Docs**
- Resource Scheduler: https://schedule-x.dev/docs/calendar/resource-scheduler
- Events Service: https://schedule-x.dev/docs/calendar/plugins/events-service
- Interactive Modal: https://schedule-x.dev/docs/premium/interactive-event-modal

### **Context7 Snippets**
- Schedule-X: 217 snippets (trust 8.2)
- react-calendar-timeline: 42 snippets (trust 7.6)
- react-calendar-heatmap: 12 snippets (trust 9.1)

### **Industria Benchmark**
- OpenTable: Timeline + Grid + Calendar views
- Resy: Mobile-first timeline diario
- Eat App: Resource scheduler con lazy loading
- TableIn: Full day view con ocupación visual

---

## 🎯 MÉTRICAS DE ÉXITO

### **Performance**
- ✅ Carga inicial <2s (con 100 reservas)
- ✅ Scroll infinito smooth 60fps
- ✅ Timeline drag & drop <100ms latency
- ✅ Realtime updates <500ms propagation

### **UX**
- ✅ Click slot → Modal <300ms
- ✅ Navegación histórica sin lag
- ✅ Heatmap interactivo responsive
- ✅ Mobile timeline usable (touch gestures)

### **Escalabilidad**
- ✅ Soportar 1000+ reservas sin pagination issues
- ✅ Lazy loading eficiente (fetch solo visible range)
- ✅ Cursor-based pagination O(1) performance

---

**FIN DEL PLAN** ✅
