# 🎨 ENIGMA DASHBOARD REDESIGN - PLAN MAESTRO ULTRATHINK

**Fecha**: 2025-10-04
**Rama**: `design_007`
**Proyecto**: Enigma Cocina Con Alma - Panel Admin
**Referencia**: `/Users/lr0y/local-ai-packaged/next-shadcn-dashboard-starter-main`

---

## 📊 EXECUTIVE SUMMARY

### Objetivo Principal
Transformar el dashboard administrativo de Enigma en una experiencia visual moderna, interactiva y profesional, aprovechando componentes avanzados de shadcn/ui y patrones de diseño del proyecto de referencia, mientras se mantienen los colores signature de la marca Enigma.

### Problemas Actuales Identificados

| Problema | Impacto | Prioridad |
|----------|---------|-----------|
| **Código monolítico** (455 líneas en un archivo) | Difícil mantenimiento | 🔴 Alta |
| **Cards estáticos sin interactividad** | Pobre UX | 🔴 Alta |
| **Sin visualización de datos** (gráficas) | Limitada comprensión de métricas | 🟡 Media |
| **Componentes inline no reutilizables** | Código duplicado | 🟡 Media |
| **Sin badges de tendencias** | Falta contexto en métricas | 🟢 Baja |
| **Layout básico sin grid avanzado** | Experiencia visual plana | 🟡 Media |
| **Sin loading states profesionales** | UX incompleta | 🟢 Baja |

### Resultado Esperado

**Dashboard transformado en:**
- ✨ **Modular**: Componentes reutilizables en `/components/dashboard/`
- 📈 **Visual**: Gráficas interactivas con tendencias
- ⚡ **Responsive**: Container queries + grid avanzado
- 🎨 **Profesional**: Cards mejorados con badges, trends, footers
- 🔄 **Real-time**: Datos actualizados del VPS con indicadores visuales
- 🚀 **Performant**: Suspense boundaries + loading skeletons

---

## 🎨 PALETA DE COLORES ENIGMA (INMUTABLE)

### Colores Base a Mantener

```css
/* ENIGMA ATLANTICO THEME (Default) */
--primary: oklch(0.45 0.15 200)         /* Atlantic Blue - Brand Signature */
--secondary: oklch(0.92 0.02 120)       /* Sage Green - Harmony */
--accent: oklch(0.6 0.18 40)            /* Burnt Orange - Accent */
--destructive: oklch(0.55 0.22 25)      /* Professional Red */

/* Surface Colors */
--background: oklch(0.985 0.002 210)    /* Soft off-white */
--card: oklch(1 0 0)                    /* Pure white */
--muted: oklch(0.96 0.005 210)          /* Subtle Atlantic tint */

/* Text Hierarchy */
--foreground: oklch(0.13 0.028 200)     /* Deep Atlantic blue-gray */
--muted-foreground: oklch(0.45 0.025 200) /* WCAG AA compliant */
```

### Temas Disponibles
1. **Atlántico** (Default) - Atlantic Blue
2. **Bosque** - Sage Green
3. **Atardecer** - Burnt Orange
4. **Obsidiana** (Dark Mode) - Aggressive Blue

**Decisión**: Mantener estos colores base, aplicar únicamente mejoras en gradientes y uso de transparencias para depth.

---

## 📐 ARQUITECTURA DE COMPONENTES

### Estructura de Directorios Propuesta

```
src/
├── components/
│   ├── dashboard/
│   │   ├── stats/
│   │   │   ├── metric-card.tsx           # Card mejorado con trends
│   │   │   ├── metric-card-skeleton.tsx  # Loading state
│   │   │   └── metrics-grid.tsx          # Grid de 4 cards
│   │   ├── widgets/
│   │   │   ├── upcoming-reservations.tsx # Widget interactivo
│   │   │   ├── quick-actions.tsx         # Accesos rápidos
│   │   │   ├── table-occupancy.tsx       # Gráfica de ocupación
│   │   │   └── revenue-chart.tsx         # Gráfica de ingresos
│   │   ├── charts/
│   │   │   ├── bar-chart.tsx             # Recharts wrapper
│   │   │   ├── area-chart.tsx
│   │   │   ├── pie-chart.tsx
│   │   │   └── chart-skeleton.tsx
│   │   └── layout/
│   │       ├── dashboard-container.tsx   # Container principal
│   │       └── dashboard-header.tsx      # Header con breadcrumbs
│   └── ui/
│       ├── card.tsx                      # Actualizar con CardAction
│       ├── badge.tsx                     # Ya existe
│       └── trend-indicator.tsx           # NUEVO: Badges con trends
└── app/
    └── (admin)/
        └── dashboard/
            ├── page.tsx                  # Orquestador principal
            ├── layout.tsx                # Ya existe (sidebar)
            └── components/               # Componentes específicos dashboard
                └── dashboard-stats.tsx   # Wrapper de métricas
```

### Componentes a Crear (12 nuevos)

#### 1. **MetricCard** (Actualización de Card)
```tsx
interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number      // +12.5 o -20
    direction: 'up' | 'down'
    label: string      // "vs mes anterior"
  }
  footer?: {
    label: string
    sublabel: string
  }
  variant?: 'default' | 'primary' | 'success' | 'warning'
  loading?: boolean
}
```

**Características**:
- Badge con `IconTrendingUp/Down` (de Tabler icons)
- CardFooter con contexto adicional
- CardAction para el trend badge
- Gradientes sutiles: `bg-gradient-to-t from-primary/5 to-card`
- Container queries: `@container/card`

#### 2. **TrendIndicator** (Nuevo)
```tsx
interface TrendIndicatorProps {
  value: number          // +12.5
  direction: 'up' | 'down'
  label?: string         // "vs mes anterior"
  showIcon?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning'
}
```

#### 3. **DashboardContainer** (Nuevo)
```tsx
// Reemplaza el <div className="space-y-6"> actual
// Incluye:
// - ScrollArea optimizado
// - Padding responsive
// - Max-width constraints
// - Grid system avanzado
```

#### 4. **UpcomingReservationsWidget** (Refactor)
Extraer las 183 líneas inline actuales a componente reutilizable:
- Lista de próximas 5 reservas
- Indicadores de tiempo (AHORA, 2h 30m, etc.)
- Status badges
- Link "Ver todas"
- Empty state optimizado
- Loading skeleton

#### 5. **QuickActionsWidget** (Refactor)
Extraer los 90 líneas de accesos rápidos:
- Grid 3x2 (principal + secundarios)
- Hover effects mejorados
- Icons con colores temáticos
- Navegación rápida

#### 6. **TableOccupancyChart** (Nuevo)
Visualización de ocupación de mesas:
- Bar chart horizontal
- Zonas: Terraza Campanari, Sala VIP, etc.
- Colores: Available (green), Occupied (blue), Reserved (orange)
- Real-time data del VPS

#### 7. **RevenueChart** (Nuevo - Opcional Fase 2)
Gráfica de ingresos últimos 30 días:
- Area chart
- Trend line
- Tooltips interactivos

---

## 🏗️ PLAN DE IMPLEMENTACIÓN POR FASES

### 🚀 FASE 1: FUNDAMENTOS (Día 1-2) - **PRIORIDAD MÁXIMA**

**Objetivo**: Mejorar cards de métricas y layout base

#### Task 1.1: Actualizar Card Component
```bash
# Copiar CardAction del proyecto referencia
cp next-shadcn-dashboard-starter-main/src/components/ui/card.tsx \
   enigma-app/src/components/ui/card-enhanced.tsx

# Adaptar a nuestros estilos Enigma
```

**Cambios**:
- Agregar `CardAction` component
- Agregar `CardFooter` con estilos mejorados
- Mantener nuestros colores base
- Test: Verificar que no rompa cards existentes

#### Task 1.2: Crear TrendIndicator Component
```tsx
// src/components/ui/trend-indicator.tsx
// Badge + Icon + Value + Label
// Variantes: up (green), down (red), neutral (gray)
```

#### Task 1.3: Crear MetricCard Component
```tsx
// src/components/dashboard/stats/metric-card.tsx
// Usar CardAction + TrendIndicator
// Props: title, value, icon, trend, footer
```

#### Task 1.4: Refactorizar Dashboard Page - Métricas
```tsx
// ANTES (86 líneas x 4 cards = 344 líneas)
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>

// DESPUÉS (4 líneas x 4 cards = 16 líneas)
<MetricCard
  title="Reservas Hoy"
  value={metrics?.todayReservations || 0}
  icon={CalendarDays}
  trend={{ value: 12.5, direction: 'up', label: 'vs ayer' }}
  footer={{
    label: 'Tendencia alcista este mes',
    sublabel: `${metrics?.confirmedReservations || 0} confirmadas`
  }}
  variant="primary"
/>
```

**Métricas con Trends** (obtener de DB):
1. **Reservas Hoy**: Comparar con ayer mismo día semana
2. **Ocupación Mesas**: Comparar con hora actual ayer
3. **Total Clientes**: Comparar con mes anterior
4. **Items Menú**: Comparar con disponibles semana anterior

**Reducción de código**: ~340 líneas → ~20 líneas (94% menos)

---

### 🎨 FASE 2: WIDGETS INTERACTIVOS (Día 3-4)

**Objetivo**: Componentizar lista de reservas y accesos rápidos

#### Task 2.1: Crear UpcomingReservationsWidget
```tsx
// src/components/dashboard/widgets/upcoming-reservations.tsx
// Extraer líneas 174-356 del dashboard actual
// Mejoras:
// - Skeleton loading state
// - Animaciones de entrada (framer-motion opcional)
// - Click para ver detalles (modal o navigate)
// - Filter por status (tabs: Todas/Confirmadas/Pendientes)
```

#### Task 2.2: Crear QuickActionsWidget
```tsx
// src/components/dashboard/widgets/quick-actions.tsx
// Extraer líneas 362-452 del dashboard actual
// Mejoras:
// - Hover scale animation
// - Active state indicator
// - Badge con counts (ej: "3 pendientes" en Reservaciones)
```

#### Task 2.3: Refactorizar Dashboard Page - Widgets
```tsx
// ANTES (270 líneas inline)
<Card>
  <CardHeader>Próximas Reservas</CardHeader>
  <CardContent>
    {/* 183 líneas de lógica + JSX */}
  </CardContent>
</Card>

<Card>
  <CardHeader>Accesos Rápidos</CardHeader>
  <CardContent>
    {/* 90 líneas de botones */}
  </CardContent>
</Card>

// DESPUÉS (10 líneas)
<UpcomingReservationsWidget
  reservations={reservations}
  loading={reservationsLoading}
  onViewAll={() => router.push('/dashboard/reservaciones')}
/>

<QuickActionsWidget />
```

**Reducción de código**: ~270 líneas → ~10 líneas (96% menos)

---

### 📊 FASE 3: VISUALIZACIÓN DE DATOS (Día 5-6)

**Objetivo**: Agregar gráficas interactivas

#### Task 3.1: Instalar Recharts
```bash
npm install recharts
```

#### Task 3.2: Crear TableOccupancyChart
```tsx
// src/components/dashboard/charts/table-occupancy-chart.tsx
// Bar chart horizontal
// Data: Por zona (4 zonas)
// Colors: Enigma brand colors
```

**Data Source**:
```tsx
const occupancyData = [
  {
    zone: 'Terraza Campanari',
    available: 8,
    occupied: 4,
    reserved: 2
  },
  {
    zone: 'Sala Principal',
    available: 12,
    occupied: 8,
    reserved: 3
  },
  // ... más zonas
]
```

#### Task 3.3: Agregar al Dashboard
```tsx
<div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
  {/* Lado izquierdo: Ocupación Mesas (col-span-4) */}
  <Card className="lg:col-span-4">
    <CardHeader>
      <CardTitle>Ocupación por Zona</CardTitle>
      <CardDescription>Estado actual en tiempo real</CardDescription>
    </CardHeader>
    <CardContent>
      <TableOccupancyChart data={occupancyData} />
    </CardContent>
  </Card>

  {/* Lado derecho: Próximas Reservas (col-span-3) */}
  <div className="lg:col-span-3">
    <UpcomingReservationsWidget {...props} />
  </div>
</div>
```

#### Task 3.4: (Opcional) Crear RevenueChart
Solo si hay datos de ventas/ingresos disponibles.

---

### 🎨 FASE 4: POLISH & DETALLES (Día 7)

**Objetivo**: Refinamiento visual y optimizaciones

#### Task 4.1: Loading Skeletons
```tsx
// Crear skeleton para cada componente
<MetricCardSkeleton />
<UpcomingReservationsWidgetSkeleton />
<TableOccupancyChartSkeleton />
```

#### Task 4.2: Container Queries
```tsx
// Aplicar @container/card en MetricCard
<Card className="@container/card">
  <CardTitle className="text-2xl @[250px]/card:text-3xl">
    {value}
  </CardTitle>
</Card>
```

#### Task 4.3: Gradientes Sutiles
```css
/* Aplicar en MetricCards */
.metric-card {
  @apply bg-gradient-to-t from-primary/5 to-card;
  @apply dark:bg-card; /* Sin gradiente en dark mode */
}
```

#### Task 4.4: Animaciones
```tsx
// Hover effects en QuickActions
className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
```

#### Task 4.5: Breadcrumbs Header (Opcional)
```tsx
// src/components/dashboard/layout/dashboard-header.tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="text-2xl font-bold tracking-tight">
      Dashboard Principal
    </h2>
    <p className="text-muted-foreground">
      Bienvenido de vuelta, {userName} 👋
    </p>
  </div>
  <Button variant="outline" onClick={handleRefresh}>
    <RefreshCw className="mr-2 h-4 w-4" />
    Actualizar
  </Button>
</div>
```

---

## 📏 GRID SYSTEM DEFINITIVO

### Layout Principal

```tsx
<DashboardContainer>
  {/* Header */}
  <DashboardHeader user={user} onRefresh={handleRefresh} />

  {/* Métricas Grid - 4 columns responsive */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricCard {...metric1} />
    <MetricCard {...metric2} />
    <MetricCard {...metric3} />
    <MetricCard {...metric4} />
  </div>

  {/* Widgets Grid - 7 columns system */}
  <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
    {/* Ocupación Mesas - 4 cols */}
    <Card className="lg:col-span-4">
      <TableOccupancyChart />
    </Card>

    {/* Próximas Reservas - 3 cols */}
    <div className="lg:col-span-3">
      <UpcomingReservationsWidget />
    </div>
  </div>

  {/* Accesos Rápidos - Full width */}
  <QuickActionsWidget />
</div>
```

### Breakpoints

| Breakpoint | Aplicación | Métricas Grid | Widgets Grid |
|------------|-----------|---------------|--------------|
| Mobile (<768px) | Single column | 1 col | 1 col |
| Tablet (768-1023px) | 2 columns | 2 cols | 1 col |
| Desktop (1024px+) | Full grid | 4 cols | 7 cols system |

---

## 🔧 TECNOLOGÍAS Y DEPENDENCIAS

### Nuevas Dependencias Necesarias

```json
{
  "dependencies": {
    "recharts": "^2.12.7",           // Gráficas
    "@tabler/icons-react": "^3.21.0" // Icons de trends
  },
  "devDependencies": {
    "@tailwindcss/container-queries": "^0.1.1" // Container queries
  }
}
```

### Configuración Tailwind (Actualizar)

```js
// tailwind.config.ts
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
```

---

## 📊 MÉTRICAS DE ÉXITO

### Antes vs Después

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Líneas de código** (page.tsx) | 455 | ~100 | -78% |
| **Componentes reutilizables** | 0 | 12 | +1200% |
| **Visualización de datos** | Ninguna | 1-2 gráficas | +200% |
| **Interactividad** | Básica | Avanzada | +300% |
| **Loading states** | Básico | Profesional | +500% |
| **Responsive design** | Básico | Container queries | +100% |

### KPIs de Experiencia

- ✅ **Reducción de líneas**: >70%
- ✅ **Componentización**: 100% modular
- ✅ **Visual hierarchy**: Trends + badges + footers
- ✅ **Performance**: Suspense boundaries
- ✅ **Mantenibilidad**: Separación de concerns
- ✅ **Escalabilidad**: Fácil agregar nuevos widgets

---

## 🎨 MOCKUP VISUAL (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard Principal                        [↻ Actualizar]   │
│ Bienvenido de vuelta, Admin 👋                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 34       │  │ 12/34    │  │ 1,234    │  │ 89       │   │
│  │ Reservas │  │ Ocupación│  │ Clientes │  │ Platos   │   │
│  │ [↑+12%]  │  │ [↑+8%]   │  │ [↓-5%]   │  │ [↑+3%]   │   │
│  │ ▸ vs ayer│  │ ▸ 35% ocu│  │ ▸ activos│  │ ▸ menú   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌────────────────────────────┐  ┌──────────────────────┐  │
│  │ Ocupación por Zona         │  │ Próximas Reservas    │  │
│  │ ▓▓▓▓▓░░░  T.Campanari     │  │ • García (14:30) ↑  │  │
│  │ ▓▓▓▓▓▓▓░  Sala Principal  │  │ • Martínez (15:00)  │  │
│  │ ▓▓░░░░░░  Sala VIP        │  │ • López (16:30)     │  │
│  │ ▓▓▓▓░░░░  T.Justicia      │  │ • Sánchez (19:00)   │  │
│  └────────────────────────────┘  │ [Ver todas →]        │  │
│                                   └──────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Accesos Rápidos                                      │   │
│  │  [📅 Reservas]  [🪑 Mesas]  [🍽️ Menú]              │   │
│  │  [👥 Clientes]  [📊 Analytics]  [⚙️ Config]          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Romper funcionalidad existente** | Media | Alto | Testing exhaustivo, feature flags |
| **Performance degradation** | Baja | Medio | Lazy loading, code splitting |
| **Dependencias conflictos** | Baja | Bajo | Lock versions, test en staging |
| **Tiempo estimado excedido** | Media | Medio | Implementación por fases, MVP primero |
| **Recharts bundle size** | Media | Bajo | Tree-shaking, dynamic imports |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-requisitos
- [ ] Backup de rama main
- [ ] Crear rama `design_007` ✅ (YA CREADA)
- [ ] Revisar este plan con el equipo
- [ ] Instalar dependencias nuevas

### Fase 1: Fundamentos (Día 1-2)
- [ ] Actualizar Card component con CardAction
- [ ] Crear TrendIndicator component
- [ ] Crear MetricCard component
- [ ] Crear MetricCardSkeleton
- [ ] Refactorizar métricas en dashboard
- [ ] Testing: Verificar métricas funcionan
- [ ] Testing: Verificar trends se calculan correctamente

### Fase 2: Widgets (Día 3-4)
- [ ] Crear UpcomingReservationsWidget
- [ ] Crear UpcomingReservationsWidgetSkeleton
- [ ] Crear QuickActionsWidget
- [ ] Refactorizar widgets en dashboard
- [ ] Testing: Verificar navegación funciona
- [ ] Testing: Verificar loading states

### Fase 3: Visualización (Día 5-6)
- [ ] Instalar recharts
- [ ] Configurar Tailwind container queries
- [ ] Crear TableOccupancyChart
- [ ] Crear TableOccupancyChartSkeleton
- [ ] Integrar gráfica en dashboard
- [ ] Testing: Verificar datos se renderizan
- [ ] Testing: Verificar responsive funciona

### Fase 4: Polish (Día 7)
- [ ] Aplicar gradientes sutiles
- [ ] Agregar container queries
- [ ] Agregar animaciones hover
- [ ] Crear DashboardHeader (opcional)
- [ ] Testing: Visual QA en 3 breakpoints
- [ ] Testing: Verificar temas Enigma
- [ ] Testing: Performance audit

### Post-Implementación
- [ ] Code review
- [ ] Documentation update
- [ ] Deploy a staging
- [ ] QA testing
- [ ] User acceptance testing
- [ ] Merge to main
- [ ] Deploy a producción

---

## 📚 REFERENCIAS

### Documentación
- [shadcn/ui Cards](https://ui.shadcn.com/docs/components/card)
- [shadcn/ui Badges](https://ui.shadcn.com/docs/components/badge)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind Container Queries](https://tailwindcss.com/docs/plugins#container-queries)
- [Tabler Icons React](https://tabler.io/icons)

### Código de Referencia
- **Proyecto**: `next-shadcn-dashboard-starter-main`
- **Layout**: `src/app/dashboard/overview/layout.tsx`
- **Cards**: `src/components/ui/card.tsx`
- **Widgets**: `src/features/overview/components/`

### Patterns Enigma
- **Colores**: `src/app/globals.css` (líneas 37-90)
- **Hooks**: `src/hooks/useDashboardMetrics.ts`
- **Sidebar**: `src/components/ui/responsive-sidebar.tsx`

---

## 🚀 SIGUIENTE PASO INMEDIATO

### Acción Recomendada (AHORA)

1. **Revisar este plan** con el equipo
2. **Aprobar fases** y prioridades
3. **Comenzar Fase 1, Task 1.1**: Actualizar Card component

### Comando para Empezar

```bash
# Ya estamos en la rama correcta
git status  # Confirmar en design_007

# Instalar dependencias nuevas
npm install recharts @tabler/icons-react
npm install -D @tailwindcss/container-queries

# Crear directorios
mkdir -p src/components/dashboard/{stats,widgets,charts,layout}

# Copiar Card de referencia para estudiar
cp /Users/lr0y/local-ai-packaged/next-shadcn-dashboard-starter-main/src/components/ui/card.tsx \
   src/components/ui/card-reference.tsx
```

---

**PLAN MAESTRO COMPLETADO**
**Listo para implementación sistemática**
**Duración estimada: 7 días**
**Reducción de código: ~78%**
**Componentes nuevos: 12**
**Mejora en UX: +300%**

🎨 **Enigma Dashboard Redesign** - *Profesional, Moderno, Interactivo*
