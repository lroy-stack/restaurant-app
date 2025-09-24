# 📋 PDR: FICHA COMPLETA DE CLIENTE ENIGMA
## Product Development Requirements v1.0

**Fecha:** 22 Septiembre 2025
**Autor:** Claude Code AI
**Arquitectura Referencia:** Badezeit-Sylt Customer Profile
**Prioridad:** Alta
**Estimación:** 8-12 horas

---

## 🎯 OBJETIVO

Desarrollar una página de **ficha completa de cliente** que centralice toda la información relevante del cliente, incluyendo detalles personales, preferencias, historial de reservas, pre-orders, consentimientos GDPR, notas del personal y métricas de inteligencia de cliente.

### **Resultado Esperado**
Una interfaz administrativa modular y escalable que permita al staff de Enigma gestionar de manera eficiente la relación con cada cliente, proporcionando insights valiosos para mejorar la experiencia y fidelización.

---

## 📊 ESQUEMA ACTUAL vs DESEADO

### **🔴 ESTADO ACTUAL**
```
Dashboard Clientes
├── Lista de clientes (customer-list.tsx)
├── Tarjetas básicas (customer-card.tsx)
├── Filtros simples (customer-filters.tsx)
└── Calendario (customer-calendar.tsx)

⚠️ LIMITACIONES:
- No existe página de detalle individual
- Información fragmentada en múltiples lugares
- Sin métricas de inteligencia de cliente
- Gestión GDPR básica
- Sin sistema de notas del personal
```

### **🟢 ESTADO DESEADO**
```
Dashboard Clientes
├── Lista de clientes (existente)
└── [NUEVO] Ficha Individual (/clientes/[id])
    ├── Header inteligente (avatar, tier, badges)
    ├── Métricas clave (loyalty score, CLV, frecuencia)
    ├── Datos contacto y preferencias
    ├── Historial reservas y pre-orders
    ├── Gestión GDPR completa
    ├── Sistema notas del personal
    ├── Analytics y recomendaciones IA
    └── Panel de acciones administrativas

✅ CAPACIDADES:
- Vista 360° del cliente
- Inteligencia automatizada
- GDPR compliance total
- Colaboración del staff
- Métricas de negocio
```

---

## 🏗️ ARQUITECTURA TÉCNICA

### **Estructura de Archivos**
```
src/app/(admin)/dashboard/clientes/[id]/
├── page.tsx                        # Página principal del perfil
└── components/
    ├── customer-header.tsx          # Avatar, nombre, tier, badges VIP
    ├── customer-stats.tsx           # Métricas clave y loyalty scoring
    ├── customer-contact.tsx         # Contacto, preferencias, dietary
    ├── customer-reservations.tsx    # Historial reservas + pre-orders
    ├── customer-gdpr.tsx           # Gestión completa GDPR
    ├── customer-notes.tsx          # Notas staff con permisos
    ├── customer-actions.tsx        # Dropdown acciones (VIP, export)
    └── customer-intelligence.tsx   # Analytics y recomendaciones

src/hooks/
└── useCustomerProfile.ts           # Hook principal con lógica

src/lib/validations/
└── customer-profile.ts            # Schemas Zod específicos

src/app/api/customers/[id]/
├── route.ts                        # CRUD principal
├── vip/route.ts                   # Toggle VIP status
├── export/route.ts                # Export GDPR
├── notes/route.ts                 # Gestión notas
├── analytics/route.ts             # Métricas detalladas
└── reservations/route.ts          # Historial reservas
```

### **Hook Principal: useCustomerProfile**
```typescript
export function useCustomerProfile(customerId: string) {
  // Data fetching
  const { customer, loading, error, refetch } = useCustomerData(customerId)

  // Calculated metrics (badezeit-inspired)
  const loyaltyScore = calculateLoyaltyScore(customer)
  const customerTier = getCustomerTier(loyaltyScore)
  const visitFrequency = calculateVisitFrequency(customer)
  const avgSpendPerVisit = calculateAvgSpend(customer)
  const clv = calculateCustomerLifetimeValue(customer)

  // CRUD operations
  const updateCustomerField = async (field: string, value: any) => { /* ... */ }
  const toggleVipStatus = async () => { /* ... */ }
  const addCustomerNote = async (note: string, isImportant: boolean) => { /* ... */ }
  const exportCustomerData = async () => { /* ... */ }
  const updateGdprConsent = async (consentType: string, granted: boolean) => { /* ... */ }

  // Analytics
  const getReservationPatterns = () => { /* ... */ }
  const getFavoriteItems = () => { /* ... */ }
  const getPreferredTimeSlots = () => { /* ... */ }
  const getRecommendations = () => { /* ... */ }

  return {
    // Data
    customer, loading, error, refetch,

    // Metrics
    loyaltyScore, customerTier, visitFrequency, avgSpendPerVisit, clv,

    // Operations
    updateCustomerField, toggleVipStatus, addCustomerNote,
    exportCustomerData, updateGdprConsent,

    // Analytics
    getReservationPatterns, getFavoriteItems,
    getPreferredTimeSlots, getRecommendations
  }
}
```

---

## 🧮 SISTEMA DE INTELIGENCIA DE CLIENTE

### **Fórmula de Loyalty Score**
```typescript
const loyaltyScore = Math.min(100, Math.round(
  (customer.totalVisits * 12) +           // Base: visitas (peso alto)
  (customer.totalSpent / 30) +            // Gasto (ajustado a precios ES)
  (completionRate * 0.8) +                // Fiabilidad del cliente
  (customer.isVip ? 25 : 0) +             // Bonus VIP
  (monthsAsCustomer * 2) +                // Antigüedad
  (avgPartySize > 4 ? 10 : 0) +          // Grupos grandes (+ revenue)
  (hasSpecialOccasions ? 5 : 0)          // Celebraciones (engagement)
))
```

### **Customer Tiers**
- 🏆 **VIP Elite** (85+ puntos): Trato exclusivo, descuentos especiales
- 🥇 **Oro** (60-84 puntos): Cliente premium, atención prioritaria
- 🥈 **Plata** (35-59 puntos): Cliente frecuente, ofertas ocasionales
- 🥉 **Bronce** (0-34 puntos): Cliente regular, comunicación básica

### **Métricas Calculadas**
```typescript
interface CustomerMetrics {
  loyaltyScore: number              // 0-100 scoring algorithm
  customerTier: 'VIP Elite' | 'Oro' | 'Plata' | 'Bronce'
  visitFrequency: number            // visitas por mes
  avgSpendPerVisit: number          // gasto promedio por visita
  clv: number                       // Customer Lifetime Value estimado
  completionRate: number            // % reservas completadas vs canceladas
  noShowRate: number                // % no-shows
  avgPartySize: number              // tamaño promedio del grupo
  preferredTimeSlots: string[]      // horarios preferidos del cliente
  favoriteItems: MenuItem[]         // platos más pedidos
  seasonalityPattern: 'regular' | 'seasonal' | 'special_occasions'
  riskLevel: 'low' | 'medium' | 'high'  // riesgo de churning
}
```

---

## 📋 COMPONENTES A CREAR

### **1. CustomerHeader**
```typescript
interface CustomerHeaderProps {
  customer: Customer
  loyaltyScore: number
  customerTier: string
  onVipToggle: () => void
  canEditVip: boolean
}
```
**Funcionalidades:**
- Avatar con iniciales estilizado
- Badges VIP, tier, idioma
- Información básica (nombre, email, teléfono)
- Fecha de registro y última visita
- Botón toggle VIP (permisos)

### **2. CustomerStats**
```typescript
interface CustomerStatsProps {
  customer: Customer
  metrics: CustomerMetrics
  reservationStats: ReservationStats
}
```
**Funcionalidades:**
- Cards con métricas clave (4 columnas responsive)
- Progress bar de loyalty score
- Gráficos de distribución de reservas
- Comparativas con promedios del restaurante

### **3. CustomerContact**
```typescript
interface CustomerContactProps {
  customer: Customer
  onUpdate: (field: string, value: any) => void
  isEditing: boolean
  canEdit: boolean
}
```
**Funcionalidades:**
- Datos de contacto editables inline
- Preferencias de mesa (4 zonas Enigma)
- Restricciones dietéticas con tags
- Alergias detalladas
- Idioma preferido

### **4. CustomerReservations**
```typescript
interface CustomerReservationsProps {
  customerId: string
  reservations: ReservationWithItems[]
  onViewReservation: (id: string) => void
}
```
**Funcionalidades:**
- Timeline de reservas ordenado cronológicamente
- Estados visuales (completada, cancelada, no-show)
- Pre-orders asociadas a cada reserva
- Ocasiones especiales (cumpleaños, etc.)
- Filtros por fecha y estado

### **5. CustomerGdpr**
```typescript
interface CustomerGdprProps {
  customer: Customer
  consents: GdprConsent[]
  onConsentUpdate: (type: ConsentType, granted: boolean) => void
  onExportData: () => void
  onDeleteData: () => void
}
```
**Funcionalidades:**
- Toggles para cada tipo de consentimiento
- Historial de cambios con timestamp e IP
- Botón export datos (JSON completo)
- Gestión de eliminación de datos
- Compliance con versiones de políticas

### **6. CustomerNotes**
```typescript
interface CustomerNotesProps {
  customerId: string
  notes: CustomerNote[]
  userRole: UserRole
  onAddNote: (note: string, isImportant: boolean) => void
  onEditNote: (id: string, note: string) => void
  onDeleteNote: (id: string) => void
}
```
**Funcionalidades:**
- Lista de notas con autor y timestamp
- Marcado de importancia visual
- Permisos por rol (ADMIN/MANAGER/STAFF)
- Editor inline con validación
- Filtros por importancia y autor

### **7. CustomerActions**
```typescript
interface CustomerActionsProps {
  customer: Customer
  onVipToggle: () => void
  onExportData: () => void
  onSendEmail: () => void
  onViewReservations: () => void
}
```
**Funcionalidades:**
- Dropdown con acciones principales
- Toggle VIP con confirmación
- Export datos GDPR
- Envío email bienvenida/promocional
- Navegación rápida a reservas

### **8. CustomerIntelligence**
```typescript
interface CustomerIntelligenceProps {
  customer: Customer
  metrics: CustomerMetrics
  recommendations: AIRecommendation[]
}
```
**Funcionalidades:**
- Insights automáticos basados en comportamiento
- Recomendaciones de marketing (email timing, ofertas)
- Alerts de riesgo (churn prediction)
- Patrones de comportamiento visualizados
- Sugerencias de upselling

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### **Tablas Existentes a Utilizar**
```sql
-- PRINCIPAL
restaurante.customers (26 campos completos)
├── Datos personales (firstName, lastName, email, phone, dateOfBirth)
├── Preferencias (preferredLocation, preferredTime, dietaryRestrictions)
├── Métricas (totalVisits, totalSpent, averagePartySize, lastVisit)
├── VIP (isVip)
└── GDPR (emailConsent, smsConsent, marketingConsent, consentDate, etc.)

-- RELACIONADAS
restaurante.reservations
├── customerEmail FK -> customers.email
├── Campos GDPR integrados (consentDataProcessing, etc.)
└── table_ids (array) para mesas múltiples

restaurante.customer_notes (schema existente)
├── customerId FK -> customers.id
├── note, isImportant, createdBy, createdAt
└── Policies RLS configuradas

restaurante.cookie_consents
├── Para tracking adicional GDPR
└── Historial de consentimientos
```

### **⚠️ GOTCHAS DE BASE DE DATOS**

#### **1. Esquema restaurante vs público**
```sql
-- ✅ CORRECTO: Usar header Accept-Profile
headers: {
  'Accept-Profile': 'restaurante',
  'Content-Profile': 'restaurante'
}

-- ❌ INCORRECTO: Queries sin schema
SELECT * FROM customers  -- Fallará
```

#### **2. Conexión Crítica**
```bash
# ✅ USAR SIEMPRE
supabase.enigmaconalma.com:8443

# ❌ NUNCA USAR DIRECTAMENTE
31.97.182.226:5432
```

#### **3. Foreign Keys Críticas**
```sql
-- Customers -> Reservations (email-based)
reservations.customerEmail = customers.email

-- Customer Notes (id-based)
customer_notes.customerId = customers.id

-- ⚠️ GOTCHA: Mix de FK por email vs ID
```

#### **4. Arrays y JSON**
```sql
-- Dietary restrictions como array
dietaryRestrictions: text[]

-- Table IDs como array (nueva feature)
table_ids: text[]

-- Validaciones automáticas con constraints
```

---

## 🎛️ REFERENCIAS CRUZADAS CODEBASE

### **Componentes Existentes a Reutilizar**
```typescript
// ✅ USAR COMPONENTES EXISTENTES
import { CustomerCard } from '@/app/(admin)/dashboard/clientes/components/customer-card'
import { CustomerFilters } from '@/app/(admin)/dashboard/clientes/components/customer-filters'
import { CustomerProfile } from '@/components/restaurant/customer-profile'

// ✅ HOOKS DISPONIBLES
import { useRealtimeCustomers } from '@/hooks/useRealtimeCustomers'

// ✅ UTILIDADES
import { customerUpsert } from '@/lib/customer-upsert'
```

### **APIs Existentes para Extender**
```typescript
// ✅ ENDPOINTS DISPONIBLES
GET    /api/customers/[id]/route.ts          // Básico existente
PATCH  /api/customers/[id]/route.ts          // Update básico
GET    /api/customers/[id]/export/route.ts   // Export GDPR
POST   /api/customers/[id]/vip/route.ts      // Toggle VIP

// 🆕 ENDPOINTS A CREAR
GET    /api/customers/[id]/analytics         // Métricas detalladas
GET    /api/customers/[id]/reservations      // Historial con pre-orders
POST   /api/customers/[id]/notes             // Gestión notas
PATCH  /api/customers/[id]/gdpr             // Consentimientos
```

### **Shadcn/ui Components**
```typescript
// ✅ DISPONIBLES EN PROYECTO
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { AlertDialog } from '@/components/ui/alert-dialog'
```

---

## ⚠️ GOTCHAS CRÍTICOS DEL CODEBASE

### **1. Design System Enigma**
```css
/* ✅ USAR TOKENS HSL EXACTOS */
--primary: oklch(0.45 0.15 200)        /* Atlantic Blue */
--primary-foreground: oklch(0.98 0.005 200)
--foreground: oklch(0.15 0.02 220)     /* Dark text */
--muted-foreground: oklch(0.38 0.02 220)

/* ✅ RADIUS CONSISTENTE */
--radius-sm: calc(var(--radius) - 4px)  /* 8px */
--radius-md: calc(var(--radius) - 2px)  /* 10px */
--radius-lg: var(--radius)              /* 12px */

/* ⚠️ GOTCHA: NUNCA hardcodear colores */
bg-blue-500  ❌
bg-primary   ✅
```

### **2. Input Heights Obligatorios**
```typescript
// ✅ TODOS los inputs usan h-9
<Input className="h-9 w-full" />
<Textarea className="min-h-9" />
<Select className="h-9" />

// ❌ NUNCA usar otras alturas sin h-9
```

### **3. Responsive Patterns**
```typescript
// ✅ PATRÓN ENIGMA
<div className="text-base md:text-sm">  // Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

### **4. Rutas y Navegación**
```typescript
// ✅ ESTRUCTURA CORRECTA
/dashboard/clientes/[id]/page.tsx

// ✅ NAVEGACIÓN
import { useRouter } from 'next/navigation'
router.push(`/dashboard/clientes/${customerId}`)

// ⚠️ GOTCHA: App Router, NO Pages Router
```

### **5. Manejo de Estados**
```typescript
// ✅ PATRÓN LOADING/ERROR CONSISTENTE
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// ✅ TOAST NOTIFICATIONS
import { toast } from 'sonner'
toast.success('Cliente actualizado')
toast.error('Error al actualizar cliente')
```

### **6. Permisos y Roles**
```typescript
// ✅ ROLES DISPONIBLES
type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'

// ✅ CHECKS DE PERMISOS
const canEditCustomer = ['ADMIN', 'MANAGER'].includes(userRole)
const canAddNotes = ['ADMIN', 'MANAGER', 'STAFF'].includes(userRole)
```

### **7. Validaciones y Schemas**
```typescript
// ✅ PATRÓN ZOD CONSISTENTE
import { z } from 'zod'

export const customerUpdateSchema = z.object({
  // Usar .optional() para campos opcionales
  // Usar .transform() para formatear datos
  // Usar .refine() para validaciones custom
})

// ✅ ERROR HANDLING
try {
  const validData = schema.parse(formData)
  // Process...
} catch (error) {
  if (error instanceof z.ZodError) {
    toast.error('Datos inválidos')
    return error.errors
  }
}
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Fundación** ⏱️ 2-3 horas
1. **Crear estructura de archivos**
   - `/dashboard/clientes/[id]/page.tsx`
   - Componentes base en `/components/`

2. **Implementar hook principal**
   - `useCustomerProfile.ts` con toda la lógica
   - Cálculos de métricas e inteligencia

3. **Configurar validaciones**
   - Schemas Zod específicos
   - Types TypeScript robustos

### **Fase 2: Componentes Core** ⏱️ 3-4 horas
1. **CustomerHeader + CustomerStats**
   - Avatar, badges, métricas principales
   - Sistema de tiers visualizado

2. **CustomerContact + CustomerReservations**
   - Datos editables inline
   - Historial de reservas completo

3. **APIs principales**
   - Extend `/api/customers/[id]/route.ts`
   - Nuevos endpoints analytics y notes

### **Fase 3: Funcionalidades Avanzadas** ⏱️ 2-3 horas
1. **CustomerGdpr + CustomerNotes**
   - Gestión completa GDPR
   - Sistema de notas con permisos

2. **CustomerActions + CustomerIntelligence**
   - Panel de acciones administrativas
   - Analytics e insights automáticos

### **Fase 4: Testing y Polish** ⏱️ 1-2 horas
1. **Testing responsivo completo**
   - iPhone SE (375px), iPad (768px), Desktop (1024px+)
   - Dark/Light themes

2. **Optimización y accesibilidad**
   - Performance React 19
   - ARIA labels, keyboard navigation

3. **Documentation**
   - JSDoc en componentes
   - README de uso

**🎯 Total Estimado: 8-12 horas**

---

## ✅ CRITERIOS DE ACEPTACIÓN

### **Funcional**
- [ ] Vista completa del perfil del cliente en página individual
- [ ] Métricas de inteligencia calculadas automáticamente
- [ ] Sistema de tiers visualizado (Bronce, Plata, Oro, VIP Elite)
- [ ] Gestión completa de consentimientos GDPR
- [ ] Sistema de notas del personal con permisos por rol
- [ ] Historial completo de reservas y pre-orders
- [ ] Panel de acciones administrativas (VIP, export, etc.)
- [ ] Datos editables inline con validación

### **Técnico**
- [ ] Responsive design mobile-first funcional
- [ ] Componentes reutilizables y modulares
- [ ] TypeScript sin errores
- [ ] Validaciones Zod robustas
- [ ] Error handling consistente
- [ ] Loading states en todas las operaciones
- [ ] Performance optimizada (React 19 + Next.js 15)

### **UX/UI**
- [ ] Consistencia con design system Enigma
- [ ] Tokens HSL aplicados correctamente
- [ ] Navegación intuitiva y accesible
- [ ] Feedback visual inmediato (toasts, estados)
- [ ] Dark/Light mode compatible

### **Negocio**
- [ ] Insights valiosos para el staff
- [ ] Compliance GDPR completa
- [ ] Herramientas de fidelización (VIP management)
- [ ] Datos accionables para marketing
- [ ] Mejora en la gestión de relaciones con clientes

---

## 📚 REFERENCIAS

### **Arquitectura Base**
- **Badezeit-Sylt Customer Profile**: `/Project_resource/Badezeit.de/badezeit-sylt/src/app/dashboard/kunden/[id]/`
- **Badezeit Components**: `/components/ui/` y hooks personalizados
- **Badezeit Validations**: `/lib/validations/customer.ts`

### **Documentación Enigma**
- **CLAUDE.md**: Gotchas del proyecto y design system
- **Schema Prisma**: `/prisma/schema.prisma` - modelo completo de datos
- **Componentes Existentes**: `/src/app/(admin)/dashboard/clientes/components/`

### **Standards y Patterns**
- **Shadcn/ui**: Componentes base del design system
- **Next.js 15 + App Router**: Routing y SSR patterns
- **Zod**: Validación y schemas de datos
- **Tailwind CSS**: Utility-first styling con tokens HSL

---

*Documento generado por Claude Code AI - Arquitectura basada en análisis de badezeit-sylt y codebase enigma-app*