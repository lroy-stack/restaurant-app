# SOY_CLAUDE_BITCH.md
# 🚀 ENIGMA RESTAURANT PLATFORM - ANÁLISIS END TO END COMPLETO

**Sistema de Reservas Profesional de Alta Complejidad**

---

## 📊 OVERVIEW DEL PROYECTO

**Enigma Restaurant Platform** es un sistema de gestión de restaurante **ENTERPRISE-GRADE** con:

- **29 tablas** en base de datos PostgreSQL con esquema `restaurante`
- **50+ APIs** REST con validaciones Zod y tipado TypeScript
- **Panel de administración completo** con tiempo real y analytics
- **Sistema de reservas público** con validaciones GDPR
- **Gestión multiidioma** (ES/EN/DE)
- **Tiempo real** con Supabase Realtime
- **Sistema de tokens** para gestión de reservas por clientes
- **Floor plan interactivo** con drag & drop
- **QR codes** para mesas y analytics
- **Email templates** y scheduling automático
- **Legal compliance** completo con GDPR

---

## 🏗️ ARQUITECTURA DE DATOS

### 📋 ESQUEMA DE BASE DE DATOS (29 TABLAS)

#### **CORE RESERVATIONS SYSTEM**
```sql
-- Tabla principal de reservas (HÍBRIDA)
restaurante.reservations (33 campos)
├── id (text, PK)
├── customerName, customerEmail, customerPhone
├── partySize (integer)
├── date, time (timestamp without timezone)
├── status (ReservationStatus ENUM)
├── tableId (text, FK) -- LEGACY compatibility
├── table_ids (text[]) -- NEW array system ✅
├── specialRequests, occasion, dietaryNotes
├── hasPreOrder (boolean)
├── restaurantId (text, FK)
├── customerId (text, FK)
└── GDPR Fields:
    ├── consentDataProcessing (boolean, NOT NULL)
    ├── consentDataProcessingTimestamp (timestamptz)
    ├── consentEmail, consentMarketing (boolean)
    ├── consentIpAddress (inet)
    ├── consentUserAgent (text)
    ├── gdprPolicyVersion (text, default 'v1.0')
    └── consentMethod (text, default 'web_form')

-- Mesas con ubicaciones exactas
restaurante.tables (21 campos)
├── id (text, PK)
├── number (text, UNIQUE)
├── capacity (integer)
├── location (TableLocation ENUM)
├── qrCode (text, UNIQUE)
├── isActive (boolean, default true)
├── restaurantId (text, FK)
├── Floor Plan Fields:
    ├── position_x, position_y (numeric)
    ├── rotation (numeric)
    ├── width, height (numeric)
├── Status Tracking:
    ├── currentstatus (text, default 'available')
    ├── statusnotes (text)
    └── estimatedfreetime (text)

-- Clientes con perfil completo
restaurante.customers (26 campos)
├── id (text, PK, gen_random_uuid())
├── firstName, lastName, email (UNIQUE), phone
├── language (text, default 'ES')
├── dateOfBirth, preferredTime, preferredLocation
├── dietaryRestrictions (text[])
├── allergies, favoriteDisheIds (text[])
├── Business Intelligence:
    ├── totalVisits (integer, default 0)
    ├── totalSpent (numeric(10,2), default 0)
    ├── averagePartySize (integer, default 2)
    ├── lastVisit (timestamp)
    └── isVip (boolean, default false)
└── GDPR Compliance:
    ├── emailConsent, smsConsent, marketingConsent
    ├── dataProcessingConsent (boolean, NOT NULL default true)
    ├── consentDate, consentIpAddress, consentUserAgent
    └── gdprPolicyVersion, consentMethod
```

#### **EMAIL & NOTIFICATIONS SYSTEM**
```sql
-- Logs de emails enviados
restaurante.email_logs (15 campos)
├── id, reservation_id (FK), template_id
├── recipient_email, subject, email_type
├── sent_at, delivered_at, opened_at, clicked_at, bounced_at
├── message_id, status (CHECK: sent|delivered|opened|clicked|bounced|failed)
└── error_message

-- Programación de emails
restaurante.email_schedule (8 campos)
├── id, reservation_id (FK), email_type
├── scheduled_at (timestamptz, NOT NULL)
├── sent_at, status (CHECK: pending|sent|failed)
└── retry_count (integer, default 0)

-- Templates de emails
restaurante.email_templates (8 campos)
├── id, name (UNIQUE), type, subject
├── html_content, created_at, updated_at
└── is_active (boolean, default true)
```

#### **TOKEN SYSTEM & SECURITY**
```sql
-- Tokens para gestión de reservas por clientes
restaurante.reservation_tokens (9 campos)
├── id (text, PK, 'rt_' || gen_random_uuid())
├── reservation_id (FK), token (UNIQUE)
├── customer_email, expires (timestamptz)
├── created_at, used_at, is_active
└── purpose (text, default 'reservation_management')

-- Verificación de tokens
restaurante.verification_tokens
├── identifier, token, expires
```

#### **BUSINESS & OPERATIONS**
```sql
-- Horarios de negocio dinámicos
restaurante.business_hours (18 campos)
├── id, day_of_week (integer), is_open
├── open_time, close_time, last_reservation_time
├── advance_booking_minutes, slot_duration_minutes
├── is_holiday, holiday_name, date
├── restaurant_id (FK)
├── QR Features:
    ├── qr_ordering_enabled (boolean)
    └── qr_only_menu (boolean, default true)
└── Dynamic Config:
    ├── max_party_size (integer, default 10)
    └── buffer_minutes (integer, default 150)

-- Floor plan elements
restaurante.floor_plan_elements
├── id, type, position_x, position_y
├── width, height, rotation
├── properties (JSONB)
└── restaurant_id (FK)
```

#### **MENU & PRODUCTS**
```sql
restaurante.menu_categories, restaurante.menu_items
restaurante.menu_item_allergens, restaurante.allergens
restaurante.wine_pairings
restaurante.reservation_items -- Pre-orders vinculados a reservas
```

#### **LEGAL & COMPLIANCE**
```sql
restaurante.legal_content -- Contenido legal multiidioma
restaurante.gdpr_requests -- Solicitudes GDPR
restaurante.cookie_consents -- Consentimientos de cookies
restaurante.legal_audit_logs -- Auditoría legal
```

#### **ANALYTICS & TRACKING**
```sql
restaurante.qr_scans -- Analytics de QR codes
restaurante.newsletter_subscriptions
restaurante.media_library -- Gestión de archivos
```

### 🔒 ENUMS CRÍTICOS
```sql
ReservationStatus: PENDING | CONFIRMED | SEATED | COMPLETED | CANCELLED | NO_SHOW
TableLocation: TERRACE | INTERIOR | BAR | TERRACE_CAMPANARI | SALA_VIP | SALA_PRINCIPAL | TERRACE_JUSTICIA
UserRole: ADMIN | MANAGER | STAFF | CUSTOMER
OrderStatus: PENDING | CONFIRMED | PREPARING | READY | SERVED | CANCELLED
CategoryType: FOOD | WINE | BEVERAGE
```

### 🛡️ RLS POLICIES (18 POLÍTICAS ACTIVAS)

#### **Reservations Table**
- `Anonymous can create reservations` (INSERT to anon)
- `Staff can modify reservations` (ALL for ADMIN|MANAGER|STAFF roles)
- `Staff can view all reservations` (SELECT for ADMIN|MANAGER|STAFF roles)
- `Token holders can update own reservations` (UPDATE for anon/authenticated with valid tokens)
- `Token holders can view own reservations` (SELECT for anon/authenticated with valid tokens)
- `authenticated_can_create_reservations` (INSERT for authenticated)
- `authenticated_can_read_reservations` (SELECT for authenticated)
- `authenticated_can_update_reservations` (UPDATE for authenticated)
- `service_role_full_access` (ALL for service_role)

#### **Tables Table**
- `Customers can view active tables` (SELECT for isActive=true AND role=CUSTOMER)
- `Managers can modify tables` (ALL for ADMIN|MANAGER roles)
- `Staff can view tables` (SELECT for ADMIN|MANAGER|STAFF roles)
- `authenticated_can_read_tables` (SELECT for authenticated)
- `service_role_full_access` (ALL for service_role)

#### **Customers Table**
- `authenticated_can_create_customers` (INSERT for authenticated)
- `service_role_full_access_customers` (ALL for service_role)
- `staff_can_modify_customers` (ALL for ADMIN|MANAGER|STAFF roles)
- `staff_can_view_all_customers` (SELECT for ADMIN|MANAGER|STAFF roles)

### 🔧 FUNCIONES Y TRIGGERS

#### **Validación de Table IDs**
```sql
restaurante.validate_table_ids_exist(table_ids text[]) RETURNS boolean
-- Valida que todos los IDs en el array existan y estén activos
-- CHECK constraint en reservations: table_ids IS NULL OR validate_table_ids_exist(table_ids)
```

#### **Triggers**
- `update_customers_updated_at` - Actualiza timestamp en customers

---

## 🚀 ARQUITECTURA FRONTEND

### 📁 ESTRUCTURA DE RUTAS

#### **Grupos de Rutas Next.js App Router**
```
src/app/
├── (admin)/
│   └── dashboard/
│       ├── analytics/ -- Analytics avanzado con KPIs
│       ├── clientes/ -- Gestión completa de clientes
│       ├── configuracion/ -- Configuración del sistema
│       ├── menu/ -- Gestión completa del menú
│       ├── mesas/ -- Floor plan + QR + analytics
│       └── reservaciones/ -- Centro de control de reservas
├── (public)/
│   ├── contacto/
│   ├── galeria/
│   ├── historia/
│   ├── legal/ -- Sistema legal completo multiidioma
│   │   ├── aviso-legal/ (ES/EN)
│   │   ├── derechos-gdpr/ (ES/EN)
│   │   ├── politica-cookies/ (ES/EN)
│   │   ├── politica-privacidad/ (ES/EN)
│   │   └── terminos-condiciones/ (ES/EN)
│   ├── menu/
│   ├── mi-reserva/ -- Gestión de reservas por clientes
│   │   ├── components/
│   │   │   ├── customer-cancel-reservation-modal.tsx
│   │   │   └── customer-edit-reservation-modal.tsx
│   │   └── page.tsx
│   ├── reservas/ -- Sistema de reservas público
│   │   ├── cancelacion-confirmada/
│   │   ├── modificacion-enviada/
│   │   └── page.tsx
│   └── page.tsx -- Homepage
├── almaenigma/ -- Ruta especial con layout propio
└── test-cart/ -- Testing del carrito
```

#### **Panel de Administración Completo**
```
dashboard/
├── analytics/
│   ├── components/ui/
│   │   ├── analytics-chart.tsx
│   │   └── kpi-card.tsx
│   └── page.tsx
├── clientes/
│   ├── components/
│   │   ├── compact-customer-list.tsx
│   │   ├── customer-calendar.tsx
│   │   ├── customer-card.tsx
│   │   ├── customer-filters.tsx
│   │   ├── customer-list.tsx
│   │   ├── quick-stats.tsx
│   │   └── view-toggle.tsx
│   └── page.tsx
├── menu/
│   ├── components/
│   │   ├── forms/ -- 7 formularios especializados
│   │   ├── ui/ -- Componentes UI especializados
│   │   ├── category-manager.tsx
│   │   ├── menu-analytics.tsx
│   │   ├── menu-data-grid.tsx
│   │   └── wine-pairings-tab.tsx
│   ├── hooks/ -- 6 hooks especializados
│   ├── schemas/ -- Validaciones Zod
│   └── wine-pairings/
├── mesas/
│   ├── components/
│   │   ├── floor-plan/ -- Sistema completo de floor plan
│   │   │   ├── elements/
│   │   │   │   ├── BarElement.tsx
│   │   │   │   ├── DoorElement.tsx
│   │   │   │   ├── PlantElement.tsx
│   │   │   │   └── TableElement.tsx
│   │   │   ├── FloorPlanSidebar.tsx
│   │   │   ├── ReactFloorPlan.tsx
│   │   │   └── utils/
│   │   ├── enhanced-qr-manager.tsx
│   │   ├── qr-viewer-modal.tsx
│   │   ├── table-analytics.tsx
│   │   ├── table-configuration.tsx
│   │   ├── table-floor-plan.tsx
│   │   ├── table-status-panel.tsx
│   │   └── table-tabs.tsx
│   └── page.tsx
└── reservaciones/
    ├── [id]/editar/ -- Edición individual de reservas
    ├── components/
    │   ├── cancellation-modal.tsx
    │   ├── compact-reservation-list.tsx
    │   ├── drag-drop-provider.tsx
    │   ├── edit-reservation-modal.tsx
    │   ├── professional-calendar.tsx
    │   ├── quick-stats.tsx
    │   ├── reservation-actions.tsx
    │   ├── reservation-calendar.tsx
    │   ├── reservation-detail-modal.tsx
    │   ├── reservation-filters.tsx
    │   ├── reservation-list.tsx
    │   └── view-toggle.tsx
    ├── nueva/ -- Nueva reserva desde admin
    └── page.tsx
```

### 🔗 SISTEMA DE APIs (50+ ENDPOINTS)

#### **Core Reservations APIs**
```typescript
/api/reservations
├── / (GET, POST) -- CRUD principal de reservas
├── /[id] (GET, PATCH, DELETE) -- Operaciones individuales
└── /token/
    ├── /generate (POST) -- Generar token para cliente
    ├── /validate (POST) -- Validar token
    └── /cancel (POST) -- Cancelar con token

/api/tables
├── / (GET, POST) -- CRUD de mesas
├── /[id] (GET, PATCH, DELETE)
├── /availability (POST) -- Consulta disponibilidad
├── /layout (GET, POST) -- Layout del floor plan
├── /qr (GET) -- Gestión de QR codes
└── /status (GET, PATCH) -- Estados de mesas

/api/customers
├── / (GET, POST) -- CRUD de clientes
├── /[id] (GET, PATCH, DELETE)
├── /[id]/export (GET) -- Exportar datos del cliente
└── /[id]/vip (PATCH) -- Gestión estado VIP
```

#### **Business Operations APIs**
```typescript
/api/business-hours (GET, POST) -- Horarios dinámicos
/api/availability (POST) -- Disponibilidad general
/api/zones/active (GET) -- Zonas activas

/api/analytics/
├── /compliance (GET) -- Analytics de compliance
├── /customer-journey (GET) -- Journey del cliente
└── /operations (GET) -- Analytics operacionales

/api/emails/
├── /preview (GET) -- Preview de templates
├── /stats (GET) -- Estadísticas de emails
└── /test (POST) -- Testing de envío
```

#### **Admin & Management APIs**
```typescript
/api/admin/
├── /floor-plan-elements (GET, POST)
├── /floor-plan-elements/batch (POST)
└── /qr-settings (GET, PATCH)

/api/menu/
├── / (GET) -- Menú público
├── /items (GET, POST)
├── /items/[id] (GET, PATCH, DELETE)
├── /categories (GET, POST)
├── /allergens (GET)
├── /analytics (GET)
└── /wine-pairings (GET, POST)
    └── /[id] (GET, PATCH, DELETE)

/api/legal/
├── /content (GET) -- Contenido legal
├── /cookies (GET, POST) -- Gestión de cookies
└── /gdpr (GET, POST) -- Solicitudes GDPR
```

#### **Analytics & Tracking APIs**
```typescript
/api/qr/
├── /analytics (GET) -- Analytics de QR codes
└── /scan (POST) -- Registro de escaneos

/api/newsletter/
├── /subscribe (POST) -- Suscripción
└── /identify (POST) -- Identificación de usuarios

/api/dashboard (GET) -- Datos del dashboard
/api/media-library (GET, POST) -- Gestión de archivos
```

#### **System & Maintenance APIs**
```typescript
/api/system/
├── /status (GET) -- Estado del sistema
├── /cleanup-wal (POST) -- Limpieza de WAL
├── /clear-logs (POST) -- Limpieza de logs
├── /kill-idle (POST) -- Eliminar conexiones idle
└── /vacuum (POST) -- Vacuum de DB

/api/migrations/
└── /create-qr-scans (POST) -- Migraciones

// Testing APIs
/api/test-db (GET)
/api/test-env (GET)
/api/test-supabase (GET)
```

### ⚡ HOOKS ESPECIALIZADOS

#### **useRealtimeReservations** - CRÍTICO
```typescript
// src/hooks/useRealtimeReservations.ts
interface UseRealtimeReservationsReturn {
  reservations: Reservation[]
  summary: ReservationSummary
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateReservationStatus: (id: string, status: string, additionalData?: any) => Promise<boolean>
  updateReservation: (id: string, data: any) => Promise<boolean>
  sendReminder: (id: string) => Promise<boolean>
}

// Características:
✅ Supabase Realtime subscription en tabla 'reservations'
✅ Optimistic updates para UI responsiva
✅ Throttling (1 segundo) para evitar spam de APIs
✅ Filtros dinámicos (status, date, search, tableId)
✅ Manejo de estados: PENDING | CONFIRMED | SEATED | COMPLETED | CANCELLED | NO_SHOW
✅ Gestión de summary con métricas en tiempo real
✅ Sistema de recordatorios integrado
```

#### **useReservations** - Formulario de Reservas
```typescript
// src/hooks/useReservations.ts
interface ReservationData {
  dateTime: string // ISO string
  tableIds: string[] // ✅ Array de table IDs (NUEVO)
  partySize: number
  firstName: string
  lastName: string
  email: string
  phone: string // REQUIRED
  occasion?: string
  dietaryNotes?: string
  specialRequests?: string
  preOrderItems?: Array<{...}>
  preOrderTotal?: number
  hasPreOrder?: boolean
  // GDPR Compliance (OBLIGATORIO)
  dataProcessingConsent: boolean // REQUIRED by GDPR Article 6
  emailConsent: boolean
  marketingConsent: boolean
  preferredLanguage?: 'ES' | 'EN' | 'DE'
}

// Métodos:
✅ checkAvailability() -- Consulta disponibilidad en tiempo real
✅ createReservation() -- Crear reserva con validaciones GDPR
✅ getMenuItems() -- Obtener elementos del menú
✅ getTables() -- Obtener mesas disponibles

// Validaciones críticas:
🔒 GDPR compliance validation (dataProcessingConsent REQUIRED)
🔒 Transformación de timezone (UTC + España)
🔒 Verificación de table_ids array
🔒 Verification token generation
```

#### **Otros Hooks Especializados**
```typescript
useBusinessHours() -- Horarios dinámicos del negocio
useTables() -- Gestión de mesas con tiempo real
useCart() -- Carrito de pre-orders
```

### 🎨 COMPONENTES UI CLAVE

#### **Sistema de Reservas Público**
```typescript
// Componente principal de reservas
ProfessionalReservationForm
├── DateTimeAndTableStep -- Selección de fecha/hora/mesa
├── ContactAndConfirmStep -- Datos personales + GDPR
├── useForm con zodResolver -- Validación dinámica
├── Manejo de timezone España (UTC+2)
├── Pre-orders con carrito integrado
└── Confirmación y clearing de carrito

// Validaciones Zod dinámicas
createProfessionalReservationSchema(lang: Language, maxPartySize: number)
├── StepOne: date, time, partySize (dinámico), preferredLocation
├── StepTwo: tableId, preOrderItems, preOrderTotal, hasPreOrder
├── StepThree: firstName, lastName, email, phone, occasion, dietaryNotes, specialRequests
└── StepFour: dataProcessingConsent (REQUIRED), emailConsent, marketingConsent
```

#### **Panel de Administración**
```typescript
// Centro de control de reservas
ReservacionesPage
├── useRealtimeReservations() -- Tiempo real
├── ReservationFilters -- Filtros avanzados
├── QuickStats -- Métricas en tiempo real
├── ViewToggle -- Calendar vs List view
├── CompactReservationList -- Lista optimizada
├── ReservationCalendar -- Vista de calendario
└── Drag & Drop support para cambios de estado

// Gestión de clientes
ClientesPage
├── CustomerList / CompactCustomerList
├── CustomerFilters con búsqueda avanzada
├── CustomerCalendar para historial
├── QuickStats para métricas
└── Export functionality

// Floor Plan Interactivo
MesasPage
├── ReactFloorPlan con drag & drop
├── TableElement, BarElement, DoorElement, PlantElement
├── FloorPlanSidebar para herramientas
├── QR code management
├── Table analytics en tiempo real
└── Status management
```

### 🔐 SISTEMA DE TOKENS Y SEGURIDAD

#### **Token System para Clientes**
```typescript
// Generación de tokens seguros
POST /api/reservations/token/generate
├── Token format: rt_{uuid_without_dashes}
├── Expiration: 2 horas ANTES de la reserva
├── Vinculado a: reservationId + customerEmail
├── Purpose: 'reservation_management'
└── RLS policies para acceso seguro

// Validación de tokens
POST /api/reservations/token/validate
├── Verificación de expiración
├── Verificación de email match
├── Estado is_active
└── Return: reservation data + permissions

// Cancelación con token
POST /api/reservations/token/cancel
├── Token validation
├── Status update a CANCELLED
├── Email notification
└── Token deactivation
```

#### **GDPR Compliance Completo**
```typescript
// Campos GDPR en reservations table
├── consentDataProcessing (boolean, NOT NULL) -- OBLIGATORIO por GDPR Art. 6
├── consentDataProcessingTimestamp (timestamptz)
├── consentEmail, consentMarketing (boolean)
├── consentIpAddress (inet) -- Para auditoría
├── consentUserAgent (text) -- Para auditoría
├── gdprPolicyVersion (text, default 'v1.0')
├── consentMethod (text, default 'web_form')
├── consentWithdrawnAt (timestamptz) -- Para revocación
└── consentWithdrawalReason (text)

// Sistema legal multiidioma
/legal/
├── politica-privacidad (ES/EN)
├── politica-cookies (ES/EN)
├── terminos-condiciones (ES/EN)
├── aviso-legal (ES/EN)
└── derechos-gdpr (ES/EN)
```

---

## 🔄 FLUJO END TO END DEL SISTEMA DE RESERVAS

### 🎯 FLUJO DE RESERVA PÚBLICA

#### **1. Inicio de Reserva**
```typescript
// Usuario accesa /reservas
ProfessionalReservationForm
├── Selección de idioma (ES/EN/DE)
├── Hero section con trust signals
├── Connection status (WebSocket)
└── Progress indicator (2 pasos)
```

#### **2. Step 1: DateTime & Table Selection**
```typescript
DateTimeAndTableStep
├── Business hours validation desde /api/business-hours
├── Dynamic max party size desde DB
├── Date/time picker con validaciones
├── checkAvailability() call a /api/tables/availability
├── Table recommendations con capacidad y ubicación
├── Zona preference (TERRACE_CAMPANARI, SALA_VIP, etc.)
└── Validation errors en tiempo real
```

#### **3. Step 2: Contact & Confirmation**
```typescript
ContactAndConfirmStep
├── Formulario de contacto con validación
├── Ocasión especial y notas dietéticas
├── Pre-order opcional con carrito
├── GDPR compliance checkboxes (OBLIGATORIO)
├── Preferred language selection
└── Final confirmation preview
```

#### **4. Submission & Processing**
```typescript
handleSubmit(data: ProfessionalReservationFormData)
├── Transform form data para API format
├── Timezone conversion (España UTC+2)
├── Array tableIds (NUEVO sistema híbrido)
├── GDPR validation (dataProcessingConsent REQUIRED)
├── POST /api/reservations con payload completo
└── Success: Clear cart + Show confirmation
```

#### **5. API Processing**
```typescript
// POST /api/reservations
├── Dynamic config fetch desde business_hours
├── Zod validation con maxPartySize dinámico
├── Time slot validation contra business_hours
├── Table availability check con buffer_minutes
├── Customer upsert con GDPR audit trail
├── Reservation creation con table_ids array
├── Email scheduling para confirmación
└── Return: success + reservation details
```

### 🛠️ FLUJO DE GESTIÓN ADMIN

#### **1. Dashboard Principal**
```typescript
/dashboard/reservaciones
├── useRealtimeReservations() subscription
├── Real-time metrics y summary
├── QuickStats dashboard widgets
├── ViewToggle (Calendar vs List)
├── Advanced filtering
└── Bulk operations support
```

#### **2. Real-time Updates**
```typescript
// Supabase Realtime subscription
channel('reservations')
├── postgres_changes: INSERT → Add to list + update summary
├── postgres_changes: UPDATE → Optimistic update + refresh
├── postgres_changes: DELETE → Remove + update summary
├── Throttled API calls (1 segundo)
└── Error handling con retry logic
```

#### **3. Status Management**
```typescript
updateReservationStatus(id, status, additionalData)
├── PATCH /api/reservations/[id] con nuevo status
├── Optimistic UI update
├── Real-time broadcast a otros admin
├── Email notifications automáticas
└── Summary recalculation
```

#### **4. Floor Plan Integration**
```typescript
/dashboard/mesas
├── ReactFloorPlan con real-time table status
├── Drag & drop table management
├── QR code generation y analytics
├── Table availability visualization
├── Capacity y zone management
└── Integration con reservation system
```

### 📧 SISTEMA DE EMAIL Y NOTIFICACIONES

#### **1. Email Templates System**
```sql
restaurante.email_templates
├── name (UNIQUE), type, subject
├── html_content con template variables
├── is_active flag
└── created_at, updated_at tracking
```

#### **2. Email Scheduling**
```sql
restaurante.email_schedule
├── reservation_id linkage
├── email_type (confirmation, reminder, cancellation)
├── scheduled_at con business logic
├── status tracking (pending, sent, failed)
└── retry_count para failed emails
```

#### **3. Email Logging**
```sql
restaurante.email_logs
├── Complete delivery tracking
├── message_id para provider integration
├── Status: sent → delivered → opened → clicked
├── bounce_at para failed deliveries
└── error_message para debugging
```

#### **4. Email Flow**
```typescript
// Automatic email scheduling
Reservation Created →
├── Immediate: Confirmation email
├── 24h before: Reminder email
├── 2h before: Final reminder
└── Post-visit: Feedback request

// Template variables
├── {{customerName}}, {{reservationDate}}
├── {{restaurantName}}, {{tableNumber}}
├── {{cancellationLink}}, {{modificationLink}}
└── {{gdprLink}}, {{unsubscribeLink}}
```

### 🔍 TOKEN SYSTEM Y GESTIÓN DE CLIENTES

#### **1. Token Generation**
```typescript
// POST /api/reservations/token/generate
├── Input: reservationId + customerEmail
├── UUID generation: rt_{uuid_without_dashes}
├── Expiration: 2 hours BEFORE reservation
├── Database storage con audit trail
└── Email delivery con management link
```

#### **2. Client Reservation Management**
```typescript
// /mi-reserva?token=rt_xxx
├── Token validation API call
├── Reservation details display
├── Edit capabilities (limitadas)
├── Cancellation option
└── GDPR compliance interface
```

#### **3. Cancellation Flow**
```typescript
customer-cancel-reservation-modal.tsx
├── Confirmation dialog con reason selection
├── POST /api/reservations/token/cancel
├── Status update a CANCELLED
├── Email notification automática
├── Token deactivation
└── Confirmation page redirect
```

---

## 🚨 PROBLEMAS IDENTIFICADOS Y FIXES

### ❌ PROBLEMA PRINCIPAL: Validation Failed

#### **Root Cause Analysis**
```typescript
// ProfessionalReservationForm.tsx:255
reservationData = {
  tableId: data.stepTwo.tableId,  // ❌ LEGACY field
  // Missing: tableIds array
}

// API expects (reservations/route.ts:83)
tableIds: z.array(z.string()).min(1) // ✅ NEW array system
```

#### **Fix Implementation**
```typescript
// ✅ CORRECTED payload structure
const reservationData = {
  // ... other fields
  tableIds: [data.stepTwo.tableId], // Convert single to array
  // OR support multiple selection:
  tableIds: data.stepTwo.selectedTableIds, // If multiple selection
}
```

### 🔧 HYBRID TABLE SYSTEM

#### **Database Schema**
```sql
reservations table:
├── tableId (text) -- LEGACY single table (backward compatibility)
├── table_ids (text[]) -- NEW array system for multiple tables
├── Check constraint: table_ids IS NULL OR validate_table_ids_exist(table_ids)
└── GIN index: idx_reservations_table_ids_gin
```

#### **API Logic**
```typescript
// Availability check considers BOTH fields
reservedTableIds.add(reservation.tableId) // Legacy
reservation.table_ids?.forEach(id => reservedTableIds.add(id)) // New

// Validation function ensures all table_ids exist and are active
validate_table_ids_exist(table_ids) → boolean
```

### 📱 FRONTEND CORRECTIONS NEEDED

#### **1. Form Validation Schema**
```typescript
// Current: stepTwoSchema uses single tableId
stepTwo: z.object({
  tableId: z.string().min(1, messages.tableRequired), // ❌ LEGACY
})

// ✅ SHOULD BE:
stepTwo: z.object({
  tableIds: z.array(z.string()).min(1, messages.tablesRequired), // NEW
})
```

#### **2. Component Updates Required**
```typescript
// DateTimeAndTableStep.tsx needs:
├── MultiTableSelector component integration
├── setValue('stepTwo.tableIds', selectedTableIds) // Array
├── Validation for maximum tables per party size
└── UI for table combination display

// ContactAndConfirmStep.tsx needs:
├── Display multiple selected tables
├── Calculate total capacity validation
└── Show table combination in preview
```

---

## 🎯 CONFIGURACIÓN CRÍTICA

### 🔑 ENVIRONMENT VARIABLES
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://supabase.enigmaconalma.com"
SUPABASE_SERVICE_ROLE_KEY="[service_key]"

# Database Configuration
DATABASE_URL="postgresql://postgres:[PASS]@31.97.182.226:5432/postgres"

# Authentication
AUTH_SECRET="[secret]"
NEXTAUTH_URL="https://enigma.local"
NEXTAUTH_SECRET="[auth_secret]"

# Email Configuration (if implemented)
SMTP_HOST="[smtp_host]"
SMTP_USER="[smtp_user]"
SMTP_PASS="[smtp_pass]"
```

### 📦 DEPENDENCIES CRÍTICAS
```json
{
  "dependencies": {
    "next": "15.5.2",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "react": "19.1.0",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "@radix-ui/react-*": "1.3.x",
    "tailwind-merge": "^3.3.1", // ⚠️ Version causing issues
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "sonner": "^1.x", // Toast notifications
    "uuid": "^10.x"
  }
}
```

### 🏗️ BUILD CONFIGURATION
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      useLocalCache: true,
    },
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
}
```

---

## 📈 MÉTRICAS Y ANALYTICS

### 📊 KPIs TRACKING
```typescript
// Business Intelligence fields in customers table
├── totalVisits (integer) -- Número de visitas
├── totalSpent (numeric(10,2)) -- Total gastado
├── averagePartySize (integer) -- Tamaño promedio del grupo
├── lastVisit (timestamp) -- Última visita
└── isVip (boolean) -- Estado VIP

// Reservation analytics
├── Status distribution (PENDING/CONFIRMED/COMPLETED/CANCELLED)
├── Hourly distribution of reservations
├── Table utilization rates
├── Average party size trends
├── Cancellation rate analysis
└── Revenue per reservation
```

### 🎯 QR CODE ANALYTICS
```sql
restaurante.qr_scans
├── table_id, scanned_at, user_agent
├── reservation_id (if applicable)
├── session_id para tracking
└── Analytics endpoints en /api/qr/analytics
```

---

## 🔮 RECOMENDACIONES DE MEJORA

### ⚡ IMMEDIATE FIXES (HIGH PRIORITY)
1. **Fix tableIds validation mismatch** entre frontend y backend
2. **Implement MultiTableSelector** component para reservas múltiples
3. **Update form schemas** para soporte de arrays
4. **Test token system** end-to-end
5. **Verify email templates** y scheduling

### 🚀 PERFORMANCE OPTIMIZATIONS
1. **Implement caching** para business hours y zonas activas
2. **Add database indexes** para queries frecuentes
3. **Optimize real-time subscriptions** con filtros específicos
4. **Bundle size optimization** con code splitting
5. **Image optimization** para gallery y media library

### 🛡️ SECURITY ENHANCEMENTS
1. **Rate limiting** en APIs públicas
2. **Input sanitization** más estricta
3. **GDPR audit trail** completo
4. **Token rotation** system
5. **API key management** mejorado

### 📱 UX/UI IMPROVEMENTS
1. **Mobile-first optimization** para reservas
2. **Progressive Web App** features
3. **Offline support** básico
4. **Push notifications** para admin
5. **Dark mode** completo

### 🔧 TECHNICAL DEBT
1. **TypeScript strict mode** habilitado
2. **Error boundaries** para componentes críticos
3. **Unit tests** para hooks críticos
4. **E2E tests** para flujo de reservas
5. **Documentation** técnica completa

---

## 🎊 CONCLUSIÓN

**Enigma Restaurant Platform** es un sistema de gestión de restaurante **ENTERPRISE-GRADE** con:

- ✅ **29 tablas** en PostgreSQL con RLS completo
- ✅ **50+ APIs** REST con validaciones
- ✅ **Tiempo real** completo con Supabase
- ✅ **GDPR compliance** legal
- ✅ **Sistema de tokens** seguro
- ✅ **Floor plan interactivo**
- ✅ **Analytics avanzado**
- ✅ **Multiidioma** (ES/EN/DE)

### 🏆 ACHIEVEMENTS
- Sistema híbrido de mesas (legacy + array)
- Real-time updates en toda la aplicación
- GDPR compliance completo con audit trail
- Token system para gestión de clientes
- Email automation con templates
- Floor plan con drag & drop
- Analytics y métricas completas
- Legal compliance multiidioma

### ⚠️ CRITICAL AREAS
- **Validation mismatch** tableId vs tableIds
- **Form schema updates** required
- **Multi-table selection** UI needed
- **Email delivery** testing required
- **Performance optimization** pending

**Este análisis representa el estado completo y actual del sistema de reservas Enigma - Un sistema de clase empresarial con complejidad y características avanzadas.**

---

*Generated by Claude Code Analysis - SOY_CLAUDE_BITCH.md*
*Last Updated: 2025-01-22*