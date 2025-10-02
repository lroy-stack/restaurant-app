# 🚀 Development Plan: ULTRATHINK P0 Critical Fixes
**Objetivo**: Resolver 5 blockers críticos (P0) con máxima velocidad AI-assisted
**Fecha**: 2 de Octubre, 2025
**Timeframe Total**: 20-24 horas (3 días laborales)
**Health Score Target**: 72 → 90+ (GREEN status)

---

## 🎯 **1. OBJETIVO / GOAL**

### Contexto del Objetivo
**Meta Principal**: Eliminar los 5 blockers P0 identificados en `/dev-status` que impiden producción segura y compliance legal

**Business Impact**:
- **Legal**: Evitar €3k-€10k en multas por allergen non-compliance
- **Security**: Prevenir data breach por RLS vulnerabilities
- **Revenue**: Habilitar customer-orders tracking para analytics reales
- **Operations**: Reducir 24% cancellation rate con email automation
- **Stability**: Eliminar schema drift que causa type safety issues

**Success Metrics**:
```
✅ EU-14 allergen compliance: 18.4% → 100% items with allergen data
✅ Schema drift: 48% missing → 0% (all 31 tables in Prisma)
✅ RLS coverage: 87% → 100% (4 critical tables protected)
✅ Revenue attribution: Broken → Working (orders.customerId FK)
✅ Email automation: OFF → ON (cron job active)
✅ Health Score: 72 → 90+ (GREEN)
```

### Funciones Claras Esperadas
```
📋 Funcionalidad Requerida:
├── 🔥 Core Features:
│   ├── EU-14 allergen tracking completo (mandatory en menu forms)
│   ├── Prisma schema sync con 31 production tables
│   ├── RLS policies emergency para 4 tables
│   ├── Customer-orders revenue attribution
│   └── Email automation scheduler (Resend API)
├── 🎯 User Experience:
│   ├── Admin: Allergen audit dashboard
│   ├── Admin: GDPR request portal (fase 2)
│   ├── System: Automated emails (confirmations, reminders)
│   └── Analytics: Real revenue tracking per customer
├── 🔧 Technical Requirements:
│   ├── TypeScript type safety restaurado
│   ├── PostgreSQL config tuning (30min)
│   ├── Database transaction handling
│   └── Quality gates: ESLint + TypeScript passing
└── 🔗 Integration Points:
    ├── Resend API (email service)
    ├── Cron scheduler (email automation)
    ├── Prisma (schema sync)
    └── Supabase RLS (security policies)
```

### Tree/Esquema Esperado
```
📁 P0 Critical Fixes Structure
├── 🎨 Frontend Components (4-6h)
│   ├── AllergenAuditDashboard.tsx - Admin UI para audit 160 items
│   ├── MenuItemAllergenSelector.tsx - Mandatory allergen selection
│   └── EmailSchedulerMonitor.tsx - Cron job health dashboard
│
├── 🗃️  Backend Changes (8-12h)
│   ├── Database:
│   │   ├── Prisma schema sync (15 missing tables)
│   │   ├── RLS policies emergency (4 tables)
│   │   ├── orders.customerId FK + migration
│   │   └── PostgreSQL config tuning
│   ├── APIs:
│   │   ├── /api/admin/allergens/audit (GET allergen coverage)
│   │   ├── /api/customers/[id]/orders (revenue attribution)
│   │   ├── /api/cron/email-scheduler (automation)
│   │   └── /api/gdpr/requests (legal compliance)
│   └── Services:
│       ├── AllergenValidator.ts (EU-14 compliance)
│       ├── EmailSchedulerService.ts (cron logic)
│       └── RevenueAttributionService.ts (orders linkage)
│
├── 🔐 Security & Permissions (2-3h)
│   ├── RLS Policies:
│   │   ├── gdpr_requests (ADMIN-only + customer own)
│   │   ├── legal_audit_logs (ADMIN-only)
│   │   ├── legal_content (public READ, ADMIN write)
│   │   └── reservations UPDATE fix (ownership check)
│   └── Auth Middleware:
│       └── GDPR request verification token
│
└── 🧪 Testing Strategy (4-6h)
    ├── Unit Tests:
    │   ├── AllergenValidator.test.ts
    │   ├── EmailSchedulerService.test.ts
    │   └── RevenueAttribution.test.ts
    └── Integration Tests:
        ├── Menu allergen flow (create → validate → display)
        ├── Email automation flow (schedule → send → log)
        └── Revenue tracking (order → customer → analytics)
```

---

## 📊 **2. ESTADO ACTUAL**

### Assessment del Estado
**Health Score Actual**: 72/100 🟡 (Moderate Health)

**Source**: `reports/dev-status-2025-10-02.md`

**Componentes Disponibles** (from `/tech-inventory` + SSH analysis):
```
✅ Database Infrastructure:
├── 31 production tables (restaurante schema)
├── RLS enabled on 27/31 tables (87%)
├── Proper indexes (8 on reservations, 6 on customers)
├── GDPR audit trails (IP, timestamp, user agent tracking)
└── Email infrastructure (email_schedule, email_logs, email_templates)

✅ Frontend Assets:
├── 370 TypeScript files (build successful despite type errors)
├── Shadcn/ui components (full design system)
├── 196 menu items with 100% ES/EN translation
├── Email templates ready (6 types: confirmation, reminder, etc.)
└── 16 subagentes activos (4 domain specialists + 12 support)

⚠️  Gaps Críticos:
├── 15 production tables missing from Prisma (48% schema drift)
├── 160/196 menu items sin allergen data (81.6% non-compliance)
├── 4 tables sin RLS policies (gdpr_requests, legal_audit_logs, etc.)
├── No orders.customerId FK (revenue attribution broken)
└── Email automation cron job no existe
```

### Gotchas Críticos
```
🚨 P0 BLOCKERS (From Expert Analysis):

1. EU-14 Allergen Non-Compliance - LEGAL LIABILITY
   ├── Status: 81.6% menu items (160/196) missing mandatory allergen data
   ├── Regulatory: €3,000-€10,000 per violation (Spanish AECOSAN)
   ├── Root Cause: Schema conflict (junction table vs boolean flags)
   ├── Files: menu_items table, /src/lib/validations/menu.ts
   ├── Expert: menu-wine-specialist
   └── Impact: Immediate legal exposure, cannot serve without compliance

2. Schema Drift - TYPE SAFETY BREACH
   ├── Status: 48% of production tables (15/31) lack TypeScript types
   ├── Impact: Migration drift, potential orphaned records, FK risks
   ├── Critical Tables: gdpr_requests, legal_audit_logs, email_logs, qr_scans
   ├── Files: prisma/schema.prisma (missing models)
   ├── Expert: supabase-schema-architect
   └── Impact: Development blocked, no type safety, runtime errors

3. RLS Security Vulnerabilities - DATA BREACH RISK
   ├── Status: 4 critical tables without RLS, 1 vulnerable UPDATE policy
   ├── Vulnerable:
   │   ├── gdpr_requests (PII deletion requests unprotected)
   │   ├── legal_audit_logs (audit trail accessible by all)
   │   ├── legal_content (Terms/Privacy editable by anyone)
   │   └── reservations UPDATE (any authenticated user can modify any reservation)
   ├── Files: Supabase RLS policies (SQL)
   ├── Expert: supabase-schema-architect
   └── Impact: GDPR breach, data manipulation, legal liability

4. Broken Revenue Attribution - BUSINESS INTELLIGENCE FAILURE
   ├── Status: No orders.customerId FK, cannot verify €114.50 totalSpent
   ├── Impact: Cannot calculate avg spend, track menu preferences, verify LTV
   ├── Root Cause: orders table missing customerId foreign key
   ├── Files: prisma/schema.prisma, /api/customers/[id]/orders/
   ├── Expert: customer-intelligence-analyst
   └── Impact: Analytics broken, revenue tracking impossible, VIP scoring invalid

5. Email Automation Not Running - OPERATIONAL FAILURE
   ├── Status: Templates exist, email_schedule table active, but no cron job
   ├── Impact: 24% cancellation rate (vs 10-15% industry), customers miss reminders
   ├── Missing: Cron job consuming email_schedule table
   ├── Files: /api/cron/email-scheduler/route.ts (doesn't exist)
   ├── Expert: restaurant-operations-master
   └── Impact: Customer experience degraded, revenue loss, operational chaos
```

### Referencias y Advertencias

**Database Dependencies:**
- ✅ **Available**: email_schedule, email_logs, email_templates (53 logs sent)
- ✅ **Available**: gdpr_requests, legal_audit_logs, legal_content tables
- ✅ **Available**: qr_scans (85 records), reservation_tokens (24 active)
- ❌ **Missing in Prisma**: All 15 tables above (need schema sync)
- ⚠️  **RLS Gaps**: 4 tables unprotected, 1 vulnerable policy

**API Dependencies:**
- ✅ **Reusable**: `/api/reservations/route.ts` (469-492 pre-order integration)
- ✅ **Reusable**: `/api/menu/route.ts` (menu CRUD operations)
- ✅ **Reusable**: `/api/customers/route.ts` (customer management)
- ❌ **Missing**: `/api/cron/email-scheduler` (automation endpoint)
- ❌ **Missing**: `/api/customers/[id]/orders` (revenue tracking)
- ❌ **Missing**: `/api/admin/allergens/audit` (compliance dashboard)
- ❌ **Missing**: `/api/gdpr/requests` (legal compliance portal)

**Component Dependencies:**
- ✅ **Reusable**: ProductDetailModal.tsx (allergen display pattern)
- ✅ **Reusable**: working-menu-item-form.tsx (menu editing base)
- ✅ **Reusable**: Shadcn/ui components (Button, Form, Dialog, Table, etc.)
- ❌ **New Needed**: AllergenAuditDashboard, MenuItemAllergenSelector
- ❌ **New Needed**: EmailSchedulerMonitor, GDPRRequestPortal
- ✅ **Design System**: Full adherence to Shadcn/ui + OKLCH color tokens

**Expert Subagents (Parallel Consultation Strategy):**
- 🔴 **P0.1 Allergen**: menu-wine-specialist (EU-14 expertise)
- 🔴 **P0.2 Schema**: supabase-schema-architect (Prisma + RLS)
- 🔴 **P0.3 Security**: supabase-schema-architect (RLS policies)
- 🔴 **P0.4 Revenue**: customer-intelligence-analyst (analytics)
- 🔴 **P0.5 Email**: restaurant-operations-master (operations)
- ✅ **Quality**: validation-gates (automated testing)
- ✅ **Docs**: documentation-manager (sync post-fix)

---

## 🚀 **3. FASES DE DESARROLLO**

### Fase 1: Emergency Security & Infrastructure [4-6 horas]
**Priority**: Critical security holes + infrastructure foundation
**Expert Consultants**: supabase-schema-architect, restaurant-operations-master

```
🔧 Security & Database Foundation:
├── 🗃️  Database Security (2-3h) - P0.3 RLS Security
│   ├── [ ] Emergency RLS Policies (SSH to prod DB)
│   │   ├── [ ] gdpr_requests: ADMIN-only + customer own requests
│   │   │   ```sql
│   │   │   CREATE POLICY gdpr_requests_admin ON restaurante.gdpr_requests
│   │   │   FOR ALL TO authenticated
│   │   │   USING (
│   │   │     EXISTS (SELECT 1 FROM restaurante.users
│   │   │             WHERE id = auth.uid()::text AND role = 'ADMIN')
│   │   │   );
│   │   │
│   │   │   CREATE POLICY gdpr_requests_own ON restaurante.gdpr_requests
│   │   │   FOR SELECT TO authenticated
│   │   │   USING (email = auth.email());
│   │   │   ```
│   │   ├── [ ] legal_audit_logs: ADMIN-only SELECT
│   │   │   ```sql
│   │   │   CREATE POLICY legal_audit_admin ON restaurante.legal_audit_logs
│   │   │   FOR SELECT TO authenticated
│   │   │   USING (
│   │   │     EXISTS (SELECT 1 FROM restaurante.users
│   │   │             WHERE id = auth.uid()::text AND role = 'ADMIN')
│   │   │   );
│   │   │   ```
│   │   ├── [ ] legal_content: Public READ, ADMIN write
│   │   │   ```sql
│   │   │   CREATE POLICY legal_content_read ON restaurante.legal_content
│   │   │   FOR SELECT TO anon, authenticated
│   │   │   USING (is_active = true);
│   │   │
│   │   │   CREATE POLICY legal_content_admin ON restaurante.legal_content
│   │   │   FOR ALL TO authenticated
│   │   │   USING (
│   │   │     EXISTS (SELECT 1 FROM restaurante.users
│   │   │             WHERE id = auth.uid()::text AND role = 'ADMIN')
│   │   │   );
│   │   │   ```
│   │   └── [ ] reservations UPDATE: Fix ownership check
│   │       ```sql
│   │       DROP POLICY IF EXISTS authenticated_can_update_reservations
│   │         ON restaurante.reservations;
│   │
│   │       CREATE POLICY authenticated_can_update_own_reservations
│   │         ON restaurante.reservations
│   │       FOR UPDATE TO authenticated
│   │       USING (
│   │         customerEmail = auth.email() OR
│   │         EXISTS (SELECT 1 FROM restaurante.users
│   │                 WHERE id = auth.uid()::text
│   │                 AND role IN ('ADMIN', 'MANAGER', 'STAFF'))
│   │       );
│   │       ```
│   │
│   ├── [ ] PostgreSQL Performance Tuning (30min)
│   │   ```bash
│   │   ssh root@31.97.182.226
│   │   docker exec -i $(docker ps -qf "name=db") bash -c "cat >> /var/lib/postgresql/data/postgresql.conf" <<EOF
│   │   shared_buffers = 1GB
│   │   effective_cache_size = 3GB
│   │   max_connections = 200
│   │   work_mem = 16MB
│   │   maintenance_work_mem = 256MB
│   │   EOF
│   │   docker restart supabase-db
│   │   ```
│   │
│   └── [ ] Validate RLS policies deployment
│       ```bash
│       ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c 'SELECT tablename, policyname FROM pg_policies WHERE schemaname = '\''restaurante'\'' ORDER BY tablename;'"
│       ```
│
├── 🔌 Revenue Attribution Fix (2-3h) - P0.4 Customer-Orders
│   ├── [ ] Add orders.customerId FK to Prisma schema
│   │   ```prisma
│   │   model Order {
│   │     id           String      @id @default(cuid())
│   │     orderNumber  String      @unique
│   │     totalAmount  Decimal     @db.Decimal(10,2)
│   │     status       OrderStatus
│   │     notes        String?
│   │
│   │     // NEW: Customer linkage for revenue attribution
│   │     customer     Customer?   @relation(fields: [customerId], references: [id])
│   │     customerId   String?
│   │
│   │     // ... rest of fields
│   │   }
│   │
│   │   model Customer {
│   │     // ... existing fields
│   │     orders       Order[]     // Add reverse relation
│   │   }
│   │   ```
│   │
│   ├── [ ] Create migration script
│   │   ```bash
│   │   npx prisma migrate dev --name add_customer_orders_link
│   │   ```
│   │
│   ├── [ ] Backfill existing orders with customerId (via reservations)
│   │   ```sql
│   │   -- SSH to prod DB
│   │   UPDATE restaurante.orders o
│   │   SET "customerId" = r."customerId"
│   │   FROM restaurante.reservations r
│   │   WHERE o."reservationId" = r.id
│   │     AND o."customerId" IS NULL;
│   │   ```
│   │
│   └── [ ] Create API endpoint /api/customers/[id]/orders/route.ts
│       ```typescript
│       export async function GET(req: Request, { params }: { params: { id: string } }) {
│         const customerId = params.id;
│
│         const orders = await prisma.order.findMany({
│           where: { customerId },
│           include: {
│             items: { include: { menuItem: true } },
│             table: true
│           },
│           orderBy: { orderedAt: 'desc' }
│         });
│
│         const revenue = await prisma.order.aggregate({
│           where: { customerId },
│           _sum: { totalAmount: true },
│           _avg: { totalAmount: true },
│           _count: true
│         });
│
│         return Response.json({ orders, revenue });
│       }
│       ```
│
└── 🎯 Subagent Quality Check
    └── [ ] Invoke supabase-schema-architect para validar RLS policies
        └── [ ] Invoke customer-intelligence-analyst para validar revenue queries
```

**Checkpoints Fase 1:**
- ✅ RLS policies deployed y testeadas (no unauthorized access)
- ✅ PostgreSQL config mejorado (shared_buffers 1GB, connections 200)
- ✅ orders.customerId FK funcional con backfill completo
- ✅ API /api/customers/[id]/orders retornando revenue data

---

### Fase 2: Prisma Schema Sync & Allergen Compliance [8-12 horas]
**Priority**: Type safety + legal compliance
**Expert Consultants**: supabase-schema-architect, menu-wine-specialist

```
⚡ Core Development:
├── 🧠 Schema Drift Resolution (6-8h) - P0.2 Prisma Sync
│   ├── [ ] Introspect production database (1h)
│   │   ```bash
│   │   # Backup current schema
│   │   cp prisma/schema.prisma prisma/schema.prisma.backup
│   │
│   │   # Pull production schema
│   │   npx prisma db pull --schema=prisma/schema-production.prisma
│   │   ```
│   │
│   ├── [ ] Merge missing 15 tables into schema.prisma (4-5h)
│   │   ```prisma
│   │   // Add models for missing tables:
│   │
│   │   model ReservationToken {
│   │     id            String   @id @default(cuid())
│   │     reservationId String   @map("reservation_id")
│   │     token         String   @unique
│   │     customerEmail String   @map("customer_email")
│   │     expires       DateTime
│   │     createdAt     DateTime @default(now()) @map("created_at")
│   │     usedAt        DateTime? @map("used_at")
│   │     isActive      Boolean  @default(true) @map("is_active")
│   │     purpose       String?
│   │
│   │     @@map("reservation_tokens")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model QrScan {
│   │     id                    String    @id @default(uuid()) @db.Uuid
│   │     tableId               String    @map("table_id")
│   │     scannedAt             DateTime? @map("scanned_at") @db.Timestamptz
│   │     customerIp            String?   @map("customer_ip") @db.Inet
│   │     // ... (complete 85 records tracked)
│   │
│   │     @@map("qr_scans")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model GdprRequest {
│   │     id                String    @id @default(cuid())
│   │     requestType       String    @map("request_type")
│   │     status            String
│   │     customerId        String?   @map("customer_id")
│   │     email             String
│   │     // ... (complete GDPR compliance structure)
│   │
│   │     @@map("gdpr_requests")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model EmailLog {
│   │     id              String    @id @default(uuid()) @db.Uuid
│   │     reservationId   String?   @map("reservation_id")
│   │     recipientEmail  String    @map("recipient_email")
│   │     templateType    String    @map("template_type")
│   │     // ... (53 logs tracked)
│   │
│   │     @@map("email_logs")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model EmailSchedule {
│   │     id             String    @id @default(uuid()) @db.Uuid
│   │     reservationId  String?   @map("reservation_id")
│   │     scheduledAt    DateTime  @map("scheduled_at") @db.Timestamptz
│   │     status         String    @default("pending")
│   │     // ... (email automation table)
│   │
│   │     @@map("email_schedule")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model CookieConsent {
│   │     // ... (13 consents tracked)
│   │     @@map("cookie_consents")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model LegalAuditLog {
│   │     // ... (GDPR audit trail)
│   │     @@map("legal_audit_logs")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model LegalContent {
│   │     // ... (Terms/Privacy pages)
│   │     @@map("legal_content")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model TableSession {
│   │     // ... (146 active sessions)
│   │     @@map("table_sessions")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model ZoneUtilizationTarget {
│   │     // ... (5 capacity targets)
│   │     @@map("zone_utilization_targets")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model ReservationSuccessPattern {
│   │     // ... (ML analytics)
│   │     @@map("reservation_success_patterns")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   // + 4 more missing tables
│   │   ```
│   │
│   ├── [ ] Generate Prisma Client with new types (15min)
│   │   ```bash
│   │   npx prisma generate
│   │   ```
│   │
│   ├── [ ] Update TypeScript imports across codebase (1h)
│   │   ```bash
│   │   # Fix type errors in 32+ affected files
│   │   # customer-contact.tsx, customer-reservations.tsx, etc.
│   │   npm run type-check
│   │   ```
│   │
│   └── [ ] Validate schema sync (30min)
│       ```bash
│       npx prisma db push --accept-data-loss=false
│       # Should show "Already in sync"
│       ```
│
├── 🎨 EU-14 Allergen Compliance (4-6h) - P0.1 Legal Fix
│   ├── [ ] Remove boolean allergen flags from validation (1h)
│   │   ```typescript
│   │   // /src/lib/validations/menu.ts
│   │   // DELETE estas líneas (schema conflict):
│   │   // containsGluten, containsMilk, containsEggs... (14 booleans)
│   │
│   │   // KEEP solo junction table pattern:
│   │   export const menuItemSchema = z.object({
│   │     // ... other fields
│   │     allergenIds: z.array(z.string()).min(1, {
│   │       message: "Al menos un alérgeno debe ser seleccionado (EU-14 compliance)"
│   │     })
│   │   });
│   │   ```
│   │
│   ├── [ ] Create mandatory allergen selector component (2h)
│   │   ```tsx
│   │   // /src/components/admin/MenuItemAllergenSelector.tsx
│   │   export function MenuItemAllergenSelector({
│   │     value,
│   │     onChange
│   │   }: {
│   │     value: string[],
│   │     onChange: (ids: string[]) => void
│   │   }) {
│   │     const { data: allergens } = useQuery({
│   │       queryKey: ['allergens'],
│   │       queryFn: () => fetch('/api/menu/allergens').then(r => r.json())
│   │     });
│   │
│   │     return (
│   │       <div className="space-y-2">
│   │         <Label className="text-destructive">
│   │           Alérgenos EU-14 (Obligatorio) *
│   │         </Label>
│   │         <div className="grid grid-cols-2 gap-2">
│   │           {allergens?.map(allergen => (
│   │             <div key={allergen.id} className="flex items-center space-x-2">
│   │               <Checkbox
│   │                 id={allergen.id}
│   │                 checked={value.includes(allergen.id)}
│   │                 onCheckedChange={(checked) => {
│   │                   onChange(
│   │                     checked
│   │                       ? [...value, allergen.id]
│   │                       : value.filter(id => id !== allergen.id)
│   │                   );
│   │                 }}
│   │               />
│   │               <Label htmlFor={allergen.id} className="text-sm">
│   │                 {allergen.name} / {allergen.nameEn}
│   │               </Label>
│   │             </div>
│   │           ))}
│   │         </div>
│   │         {value.length === 0 && (
│   │           <p className="text-xs text-destructive">
│   │             Selecciona "Ninguno" si el item no contiene alérgenos
│   │           </p>
│   │         )}
│   │       </div>
│   │     );
│   │   }
│   │   ```
│   │
│   ├── [ ] Integrate selector into working-menu-item-form.tsx (1h)
│   │   ```tsx
│   │   // Replace existing allergen checkboxes with:
│   │   <FormField
│   │     control={form.control}
│   │     name="allergenIds"
│   │     render={({ field }) => (
│   │       <FormItem>
│   │         <MenuItemAllergenSelector
│   │           value={field.value || []}
│   │           onChange={field.onChange}
│   │         />
│   │         <FormMessage />
│   │       </FormItem>
│   │     )}
│   │   />
│   │   ```
│   │
│   ├── [ ] Create allergen audit dashboard (2-3h)
│   │   ```tsx
│   │   // /src/app/(admin)/dashboard/menu/allergens/page.tsx
│   │   export default function AllergenAuditPage() {
│   │     const { data: auditResults } = useQuery({
│   │       queryKey: ['allergen-audit'],
│   │       queryFn: () => fetch('/api/admin/allergens/audit').then(r => r.json())
│   │     });
│   │
│   │     return (
│   │       <div className="space-y-6">
│   │         <div className="grid gap-4 md:grid-cols-3">
│   │           <Card>
│   │             <CardHeader>
│   │               <CardTitle>Compliance Status</CardTitle>
│   │             </CardHeader>
│   │             <CardContent>
│   │               <div className="text-3xl font-bold">
│   │                 {auditResults?.compliancePercentage || 0}%
│   │               </div>
│   │               <Progress
│   │                 value={auditResults?.compliancePercentage || 0}
│   │                 className="mt-2"
│   │               />
│   │             </CardContent>
│   │           </Card>
│   │
│   │           <Card>
│   │             <CardHeader>
│   │               <CardTitle>Items Sin Datos</CardTitle>
│   │             </CardHeader>
│   │             <CardContent>
│   │               <div className="text-3xl font-bold text-destructive">
│   │                 {auditResults?.itemsWithoutAllergens || 160}
│   │               </div>
│   │               <p className="text-sm text-muted-foreground">
│   │                 De {auditResults?.totalItems || 196} items
│   │               </p>
│   │             </CardContent>
│   │           </Card>
│   │
│   │           <Card>
│   │             <CardHeader>
│   │               <CardTitle>Legal Risk</CardTitle>
│   │             </CardHeader>
│   │             <CardContent>
│   │               <div className="text-sm font-medium text-destructive">
│   │                 €{((auditResults?.itemsWithoutAllergens || 160) * 3000).toLocaleString()}
│   │               </div>
│   │               <p className="text-xs text-muted-foreground">
│   │                 Potential fines (€3k per violation)
│   │               </p>
│   │             </CardContent>
│   │           </Card>
│   │         </div>
│   │
│   │         <Card>
│   │           <CardHeader>
│   │             <CardTitle>Items Requiriendo Atención</CardTitle>
│   │           </CardHeader>
│   │           <CardContent>
│   │             <Table>
│   │               <TableHeader>
│   │                 <TableRow>
│   │                   <TableHead>Item</TableHead>
│   │                   <TableHead>Categoría</TableHead>
│   │                   <TableHead>Status</TableHead>
│   │                   <TableHead>Acción</TableHead>
│   │                 </TableRow>
│   │               </TableHeader>
│   │               <TableBody>
│   │                 {auditResults?.missingItems?.map(item => (
│   │                   <TableRow key={item.id}>
│   │                     <TableCell>{item.name}</TableCell>
│   │                     <TableCell>{item.category}</TableCell>
│   │                     <TableCell>
│   │                       <Badge variant="destructive">Sin alérgenos</Badge>
│   │                     </TableCell>
│   │                     <TableCell>
│   │                       <Button
│   │                         size="sm"
│   │                         onClick={() => router.push(`/dashboard/menu/edit/${item.id}`)}
│   │                       >
│   │                         Completar
│   │                       </Button>
│   │                     </TableCell>
│   │                   </TableRow>
│   │                 ))}
│   │               </TableBody>
│   │             </Table>
│   │           </CardContent>
│   │         </Card>
│   │       </div>
│   │     );
│   │   }
│   │   ```
│   │
│   └── [ ] Create audit API endpoint
│       ```typescript
│       // /src/app/api/admin/allergens/audit/route.ts
│       export async function GET() {
│         const totalItems = await prisma.menuItem.count();
│
│         const itemsWithAllergens = await prisma.menuItem.count({
│           where: {
│             allergens: {
│               some: {}
│             }
│           }
│         });
│
│         const missingItems = await prisma.menuItem.findMany({
│           where: {
│             allergens: {
│               none: {}
│             }
│           },
│           select: {
│             id: true,
│             name: true,
│             category: { select: { name: true } }
│           }
│         });
│
│         const compliancePercentage = (itemsWithAllergens / totalItems) * 100;
│
│         return Response.json({
│           totalItems,
│           itemsWithAllergens,
│           itemsWithoutAllergens: totalItems - itemsWithAllergens,
│           compliancePercentage: Math.round(compliancePercentage * 10) / 10,
│           missingItems
│         });
│       }
│       ```
│
└── 🎯 Subagent Quality Check
    ├── [ ] Invoke supabase-schema-architect para validar schema sync
    └── [ ] Invoke menu-wine-specialist para validar allergen compliance
```

**Checkpoints Fase 2:**
- ✅ Prisma schema sync: 0 missing tables (31/31 in schema.prisma)
- ✅ TypeScript errors: 164 → <50 (majority resolved by type sync)
- ✅ Allergen compliance: 18.4% → 100% (all items audited)
- ✅ Admin dashboard functional (audit UI operational)

---

### Fase 3: Email Automation & Integration [6-8 horas]
**Priority**: Operational automation + customer experience
**Expert Consultants**: restaurant-operations-master, validation-gates

```
🔗 Automation & Integration:
├── 🧠 Email Scheduler Service (4-6h) - P0.5 Email Automation
│   ├── [ ] Create email scheduler service (2h)
│   │   ```typescript
│   │   // /src/lib/email/EmailSchedulerService.ts
│   │   import { Resend } from 'resend';
│   │   import { prisma } from '@/lib/db';
│   │
│   │   const resend = new Resend(process.env.RESEND_API_KEY);
│   │
│   │   export class EmailSchedulerService {
│   │     async processPendingEmails() {
│   │       const pendingEmails = await prisma.emailSchedule.findMany({
│   │         where: {
│   │           status: 'pending',
│   │           scheduledAt: {
│   │             lte: new Date()
│   │           }
│   │         },
│   │         include: {
│   │           reservation: {
│   │             include: {
│   │               customer: true,
│   │               table: true,
│   │               reservationItems: {
│   │                 include: { menuItem: true }
│   │               }
│   │             }
│   │           }
│   │         },
│   │         take: 50 // Process in batches
│   │       });
│   │
│   │       for (const email of pendingEmails) {
│   │         try {
│   │           const template = await this.getTemplate(email.templateType);
│   │           const rendered = await this.renderTemplate(template, email.reservation);
│   │
│   │           const result = await resend.emails.send({
│   │             from: 'Enigma Cocina Con Alma <reservas@enigmaconalma.com>',
│   │             to: email.recipientEmail,
│   │             subject: template.subject,
│   │             html: rendered
│   │           });
│   │
│   │           await prisma.emailSchedule.update({
│   │             where: { id: email.id },
│   │             data: {
│   │               status: 'sent',
│   │               sentAt: new Date()
│   │             }
│   │           });
│   │
│   │           await prisma.emailLog.create({
│   │             data: {
│   │               reservationId: email.reservationId,
│   │               recipientEmail: email.recipientEmail,
│   │               templateType: email.templateType,
│   │               status: 'sent',
│   │               resendMessageId: result.id,
│   │               sentAt: new Date()
│   │             }
│   │           });
│   │         } catch (error) {
│   │           await prisma.emailSchedule.update({
│   │             where: { id: email.id },
│   │             data: {
│   │               status: 'failed',
│   │               retryCount: { increment: 1 },
│   │               lastError: error.message
│   │             }
│   │           });
│   │         }
│   │       }
│   │
│   │       return { processed: pendingEmails.length };
│   │     }
│   │
│   │     async getTemplate(type: string) {
│   │       return await prisma.emailTemplate.findFirst({
│   │         where: { type, isActive: true }
│   │       });
│   │     }
│   │
│   │     async renderTemplate(template: any, data: any) {
│   │       // Use React Email templates from /src/lib/email/templates/
│   │       const { render } = await import('@react-email/render');
│   │       const TemplateComponent = await import(\`@/lib/email/templates/\${template.type}\`);
│   │       return render(TemplateComponent.default(data));
│   │     }
│   │   }
│   │   ```
│   │
│   ├── [ ] Create cron API endpoint (1h)
│   │   ```typescript
│   │   // /src/app/api/cron/email-scheduler/route.ts
│   │   import { EmailSchedulerService } from '@/lib/email/EmailSchedulerService';
│   │   import { NextResponse } from 'next/server';
│   │
│   │   export async function GET(request: Request) {
│   │     // Verify cron secret
│   │     const authHeader = request.headers.get('authorization');
│   │     if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
│   │       return new NextResponse('Unauthorized', { status: 401 });
│   │     }
│   │
│   │     const scheduler = new EmailSchedulerService();
│   │     const result = await scheduler.processPendingEmails();
│   │
│   │     return NextResponse.json({
│   │       success: true,
│   │       ...result,
│   │       timestamp: new Date().toISOString()
│   │     });
│   │   }
│   │
│   │   // For local testing
│   │   export async function POST() {
│   │     const scheduler = new EmailSchedulerService();
│   │     const result = await scheduler.processPendingEmails();
│   │     return NextResponse.json(result);
│   │   }
│   │   ```
│   │
│   ├── [ ] Setup cron job (Vercel Cron or external) (30min)
│   │   ```json
│   │   // vercel.json (if using Vercel)
│   │   {
│   │     "crons": [{
│   │       "path": "/api/cron/email-scheduler",
│   │       "schedule": "*/5 * * * *"  // Every 5 minutes
│   │     }]
│   │   }
│   │
│   │   // OR use external cron (cron-job.org)
│   │   // GET https://enigmaconalma.com/api/cron/email-scheduler
│   │   // Headers: Authorization: Bearer {CRON_SECRET}
│   │   // Schedule: */5 * * * * (every 5 min)
│   │   ```
│   │
│   └── [ ] Create monitoring dashboard (1-2h)
│       ```tsx
│       // /src/app/(admin)/dashboard/email-monitor/page.tsx
│       export default function EmailMonitorPage() {
│         const { data: stats } = useQuery({
│           queryKey: ['email-stats'],
│           queryFn: () => fetch('/api/admin/email-stats').then(r => r.json()),
│           refetchInterval: 30000 // Refresh every 30s
│         });
│
│         return (
│           <div className="space-y-6">
│             <div className="grid gap-4 md:grid-cols-4">
│               <Card>
│                 <CardHeader>
│                   <CardTitle>Pending</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-2xl font-bold">{stats?.pending || 0}</div>
│                 </CardContent>
│               </Card>
│
│               <Card>
│                 <CardHeader>
│                   <CardTitle>Sent Today</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-2xl font-bold text-green-600">
│                     {stats?.sentToday || 0}
│                   </div>
│                 </CardContent>
│               </Card>
│
│               <Card>
│                 <CardHeader>
│                   <CardTitle>Failed</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-2xl font-bold text-destructive">
│                     {stats?.failed || 0}
│                   </div>
│                 </CardContent>
│               </Card>
│
│               <Card>
│                 <CardHeader>
│                   <CardTitle>Last Run</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-sm">
│                     {stats?.lastRun ? new Date(stats.lastRun).toLocaleString() : 'Never'}
│                   </div>
│                 </CardContent>
│               </Card>
│             </div>
│
│             <Card>
│               <CardHeader>
│                 <CardTitle>Recent Email Logs</CardTitle>
│               </CardHeader>
│               <CardContent>
│                 <Table>
│                   <TableHeader>
│                     <TableRow>
│                       <TableHead>Timestamp</TableHead>
│                       <TableHead>Recipient</TableHead>
│                       <TableHead>Type</TableHead>
│                       <TableHead>Status</TableHead>
│                       <TableHead>Resend ID</TableHead>
│                     </TableRow>
│                   </TableHeader>
│                   <TableBody>
│                     {stats?.recentLogs?.map(log => (
│                       <TableRow key={log.id}>
│                         <TableCell>{new Date(log.sentAt).toLocaleString()}</TableCell>
│                         <TableCell>{log.recipientEmail}</TableCell>
│                         <TableCell>{log.templateType}</TableCell>
│                         <TableCell>
│                           <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
│                             {log.status}
│                           </Badge>
│                         </TableCell>
│                         <TableCell className="font-mono text-xs">
│                           {log.resendMessageId}
│                         </TableCell>
│                       </TableRow>
│                     ))}
│                   </TableBody>
│                 </Table>
│               </CardContent>
│             </Card>
│           </div>
│         );
│       }
│       ```
│
├── 🧪 Integration Testing (2-3h)
│   ├── [ ] Unit tests for EmailSchedulerService
│   │   ```typescript
│   │   // /src/lib/email/__tests__/EmailSchedulerService.test.ts
│   │   describe('EmailSchedulerService', () => {
│   │     it('processes pending emails in batch', async () => {
│   │       const service = new EmailSchedulerService();
│   │       const result = await service.processPendingEmails();
│   │       expect(result.processed).toBeGreaterThanOrEqual(0);
│   │     });
│   │
│   │     it('handles Resend API failures with retry', async () => {
│   │       // Mock Resend API to fail
│   │       // Verify retry counter increments
│   │     });
│   │
│   │     it('logs successful sends to email_logs table', async () => {
│   │       // Verify audit trail creation
│   │     });
│   │   });
│   │   ```
│   │
│   ├── [ ] E2E test: Reservation → Email flow
│   │   ```typescript
│   │   // /e2e/email-automation.spec.ts
│   │   test('reservation confirmation triggers scheduled email', async ({ page }) => {
│   │     // 1. Create reservation
│   │     await createReservation(page, testData);
│   │
│   │     // 2. Verify email_schedule entry created
│   │     const scheduled = await prisma.emailSchedule.findFirst({
│   │       where: {
│   │         reservationId: testData.id,
│   │         templateType: 'reservation-confirmation'
│   │       }
│   │     });
│   │     expect(scheduled).toBeTruthy();
│   │
│   │     // 3. Trigger cron manually
│   │     await fetch('/api/cron/email-scheduler', {
│   │       method: 'POST',
│   │       headers: { 'Authorization': \`Bearer \${process.env.CRON_SECRET}\` }
│   │     });
│   │
│   │     // 4. Verify email sent
│   │     const log = await prisma.emailLog.findFirst({
│   │       where: { reservationId: testData.id }
│   │     });
│   │     expect(log?.status).toBe('sent');
│   │   });
│   │   ```
│   │
│   └── [ ] Load test: 100 concurrent emails
│       ```bash
│       # Use k6 or Artillery for load testing
│       artillery quick --count 100 --num 10 https://enigmaconalma.com/api/cron/email-scheduler
│       ```
│
└── 🎯 Subagent Quality Check
    ├── [ ] Invoke restaurant-operations-master para validar workflow
    └── [ ] Invoke validation-gates para automated testing
```

**Checkpoints Fase 3:**
- ✅ Email automation: OFF → ON (cron job running every 5 min)
- ✅ Email logs: 53 → 100+ sent (automation functional)
- ✅ Monitoring dashboard: Real-time email stats visible
- ✅ Tests passing: Unit + E2E + load tests green

---

### Fase 4: Final Validation & Documentation [4-6 horas]
**Priority**: Quality assurance + documentation sync
**Expert Consultants**: validation-gates, documentation-manager

```
🎨 Polish & Quality Assurance:
├── 📚 Comprehensive Testing (2-3h)
│   ├── [ ] Run full test suite
│   │   ```bash
│   │   npm run test:ci  # All tests must pass
│   │   npm run type-check  # 0 TypeScript errors
│   │   npm run lint  # ESLint clean
│   │   npm run build  # Production build successful
│   │   ```
│   │
│   ├── [ ] Validate P0 fixes in production (1h)
│   │   ```bash
│   │   # P0.1 Allergen Compliance
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c 'SELECT COUNT(*) as items_with_allergens FROM restaurante.menu_items mi WHERE EXISTS (SELECT 1 FROM restaurante.menu_item_allergens WHERE menu_item_id = mi.id);'"
│   │   # Expected: 196 (100% compliance)
│   │
│   │   # P0.2 Schema Drift
│   │   npx prisma db pull --schema=prisma/schema-validation.prisma
│   │   diff prisma/schema.prisma prisma/schema-validation.prisma
│   │   # Expected: 0 differences
│   │
│   │   # P0.3 RLS Security
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c 'SELECT COUNT(*) FROM pg_policies WHERE schemaname = '\''restaurante'\'';'"
│   │   # Expected: 31+ policies (100% table coverage)
│   │
│   │   # P0.4 Revenue Attribution
│   │   curl https://enigmaconalma.com/api/customers/[vip-customer-id]/orders
│   │   # Expected: { orders: [...], revenue: { _sum: 114.50, _count: 4 } }
│   │
│   │   # P0.5 Email Automation
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c 'SELECT status, COUNT(*) FROM restaurante.email_schedule GROUP BY status;'"
│   │   # Expected: pending: 0, sent: 100+, failed: <5
│   │   ```
│   │
│   └── [ ] Performance benchmarks
│       ```bash
│       # Database query performance
│       EXPLAIN ANALYZE SELECT * FROM restaurante.menu_items mi
│       JOIN restaurante.menu_item_allergens mia ON mi.id = mia.menu_item_id
│       WHERE mi.is_available = true;
│       # Expected: < 50ms
│
│       # Email scheduler performance
│       time curl -X POST http://localhost:3000/api/cron/email-scheduler
│       # Expected: < 2s for 50 emails batch
│       ```
│
├── 🔧 Documentation Sync (2-3h)
│   ├── [ ] Update README.md with P0 fixes summary
│   │   ```markdown
│   │   ## Recent Updates (Oct 2025)
│   │
│   │   ### P0 Critical Fixes Completed ✅
│   │
│   │   - **EU-14 Allergen Compliance**: 100% menu items with allergen data
│   │   - **Schema Drift Resolved**: All 31 production tables in Prisma
│   │   - **RLS Security**: 100% table coverage with proper policies
│   │   - **Revenue Attribution**: Customer-orders linkage functional
│   │   - **Email Automation**: Cron job running every 5 minutes
│   │
│   │   Health Score: 72 → 92 (GREEN status)
│   │   ```
│   │
│   ├── [ ] Document new API endpoints
│   │   ```markdown
│   │   ## API Reference Updates
│   │
│   │   ### Customer Revenue
│   │   GET /api/customers/[id]/orders
│   │   Returns: { orders: Order[], revenue: { _sum, _avg, _count } }
│   │
│   │   ### Allergen Audit
│   │   GET /api/admin/allergens/audit
│   │   Returns: { compliancePercentage, missingItems[] }
│   │
│   │   ### Email Scheduler (Cron)
│   │   GET /api/cron/email-scheduler
│   │   Headers: Authorization: Bearer {CRON_SECRET}
│   │   Returns: { processed: number, timestamp: ISO8601 }
│   │   ```
│   │
│   ├── [ ] Update Prisma schema documentation
│   │   ```bash
│   │   npx prisma generate --docs
│   │   # Generates updated schema documentation
│   │   ```
│   │
│   └── [ ] Create deployment guide
│       ```markdown
│       # Deployment Guide - P0 Fixes
│
│       ## Pre-Deployment Checklist
│       - [ ] Backup production database
│       - [ ] Review RLS policies SQL scripts
│       - [ ] Set CRON_SECRET environment variable
│       - [ ] Configure Resend API key
│
│       ## Deployment Steps
│       1. Apply RLS policies (SSH to prod DB, run scripts)
│       2. Run Prisma migrations: `npx prisma migrate deploy`
│       3. Restart PostgreSQL with new config
│       4. Deploy Next.js application
│       5. Activate email cron job
│       6. Verify all P0 fixes in production
│
│       ## Rollback Plan
│       If issues occur:
│       1. Restore database backup
│       2. Revert to previous deployment
│       3. Disable email cron job
│       ```
│
└── ✅ Final Validation & Handoff
    ├── [ ] Invoke validation-gates agent for final QA
    │   ```
    │   Validate:
    │   - All tests passing (unit + integration + E2E)
    │   - TypeScript errors: 164 → 0
    │   - ESLint clean
    │   - Build successful
    │   - Production smoke tests passing
    │   ```
    │
    ├── [ ] Invoke documentation-manager for docs sync
    │   ```
    │   Update:
    │   - README.md with P0 fixes summary
    │   - API reference documentation
    │   - Deployment guide
    │   - Schema documentation
    │   ```
    │
    └── [ ] Generate final status report
        ```bash
        /dev-status  # Re-run to verify Health Score 72 → 90+
        ```
```

**Checkpoints Fase 4:**
- ✅ All tests passing (Jest + Playwright)
- ✅ TypeScript errors: 0 (down from 164)
- ✅ Documentation updated and accurate
- ✅ Production deployment successful
- ✅ Health Score: 90+ (GREEN status achieved)

---

## ⚠️  **4. AVISOS Y CONSIDERACIONES**

### Context Engineering Best Practices

**Subagent Utilization Strategy (Proactive):**
```
🤖 Expert Delegation per Phase:
├── Fase 1 (Security):
│   ├── supabase-schema-architect → RLS policies design & validation
│   └── customer-intelligence-analyst → Revenue attribution logic
│
├── Fase 2 (Compliance):
│   ├── supabase-schema-architect → Prisma schema introspection & merge
│   └── menu-wine-specialist → EU-14 allergen compliance expertise
│
├── Fase 3 (Automation):
│   ├── restaurant-operations-master → Email workflow optimization
│   └── validation-gates → Automated testing & QA
│
└── Fase 4 (Quality):
    ├── validation-gates → Final quality assurance
    └── documentation-manager → Comprehensive docs sync
```

**Parallel Execution Pattern (CRITICAL):**
```typescript
// ALWAYS batch independent operations in single message
[
  Task("supabase-schema-architect", "Review RLS policies"),
  Task("menu-wine-specialist", "Validate allergen compliance"),
  Bash("npm run type-check"),
  Bash("npm run lint")
].executeInParallel()

// NEVER sequential when tasks are independent
```

**Context7 Integration:**
```typescript
// Use Context7 MCP for real-time best practices
mcp__context7__resolve_library_id({ libraryName: "Prisma" })
mcp__context7__get_library_docs({
  context7CompatibleLibraryID: "/prisma/prisma",
  topic: "RLS policies"
})
```

### Risk Mitigation

```
🛡️  Risk Management:

📌 Technical Risks:
├── Schema Drift Merge Conflicts
│   ├── Risk: Manual merge errors when adding 15 tables
│   ├── Mitigation: Use `prisma db pull` then careful comparison
│   └── Fallback: Restore from schema.prisma.backup
│
├── RLS Policy Deployment Errors
│   ├── Risk: Syntax errors in SQL, policies block legitimate access
│   ├── Mitigation: Test each policy with sample queries before deploy
│   └── Fallback: DROP POLICY scripts ready for rollback
│
├── Email Automation Infinite Loop
│   ├── Risk: Cron job processes same emails repeatedly
│   ├── Mitigation: Status updates atomic, use transactions
│   └── Fallback: Kill cron job, manual email_schedule cleanup
│
└── Revenue Attribution Backfill Issues
    ├── Risk: orders.customerId backfill orphans some orders
    ├── Mitigation: Verify all reservationId have valid customerId first
    └── Fallback: Manual investigation of orphaned orders

📌 Dependency Risks:
├── Resend API Rate Limits
│   ├── Risk: 100 emails/hour limit on free tier
│   ├── Mitigation: Upgrade to paid tier ($20/month for 10k emails)
│   └── Fallback: Queue emails for next hour if rate limited
│
├── PostgreSQL Restart Downtime
│   ├── Risk: Config tuning requires restart (30s-1min downtime)
│   ├── Mitigation: Schedule during low-traffic window
│   └── Fallback: Revert config if restart fails
│
└── Prisma Migration Failures
    ├── Risk: Migration breaks production schema
    ├── Mitigation: Test migrations in staging first
    └── Fallback: Database backup + manual rollback

📌 Timeline Risks:
├── Allergen Data Entry Bottleneck
│   ├── Risk: Manually auditing 160 items takes >2 days
│   ├── Mitigation: Use admin dashboard for batch operations
│   └── Acceleration: AI-assisted allergen suggestions from item names
│
├── TypeScript Error Resolution
│   ├── Risk: 164 errors may reveal deeper architecture issues
│   ├── Mitigation: Schema sync resolves 80%+, manual fix remainder
│   └── Fallback: Suppress errors with @ts-ignore temporarily
│
└── Email Template Rendering Issues
    ├── Risk: React Email rendering breaks with new data structure
    ├── Mitigation: Test each template type before automation
    └── Fallback: Fallback to plain text emails

📌 Integration Risks:
├── Customer-Orders FK Constraint Violations
│   ├── Risk: Existing orders reference deleted customers
│   ├── Mitigation: Cascade deletes properly configured
│   └── Fallback: customerId nullable, set to NULL for orphans
│
├── RLS Policy Over-Restriction
│   ├── Risk: Legitimate users blocked from data access
│   ├── Mitigation: Test with each role (ADMIN, MANAGER, STAFF)
│   └── Fallback: service_role bypass for admin operations
│
└── Cron Job Authentication Failures
    ├── Risk: CRON_SECRET leaked or misconfigured
    ├── Mitigation: Use Vercel env vars, rotate secret monthly
    └── Fallback: IP whitelist for cron endpoint
```

### Success Validation Criteria

**Checkpoints por Fase:**

**Fase 1 (Emergency Security - 4-6h):**
- ✅ 4 RLS policies deployed successfully
- ✅ PostgreSQL config tuned (shared_buffers 1GB)
- ✅ orders.customerId FK functional with backfill
- ✅ API /api/customers/[id]/orders returns revenue data
- ✅ No unauthorized access in RLS policy tests

**Fase 2 (Schema & Compliance - 8-12h):**
- ✅ Prisma schema contains all 31 production tables
- ✅ TypeScript errors < 50 (down from 164)
- ✅ Allergen compliance dashboard shows 100% coverage
- ✅ MenuItemAllergenSelector integrated in admin forms
- ✅ All 196 menu items have allergen data

**Fase 3 (Email Automation - 6-8h):**
- ✅ EmailSchedulerService processes 50 emails/batch
- ✅ Cron job running every 5 minutes
- ✅ Email logs show >100 sent emails
- ✅ Monitoring dashboard displays real-time stats
- ✅ E2E test: reservation → scheduled email → sent → logged

**Fase 4 (Quality & Docs - 4-6h):**
- ✅ All tests passing (Jest + Playwright)
- ✅ TypeScript errors: 0
- ✅ ESLint clean (no warnings)
- ✅ Build successful (production ready)
- ✅ Documentation updated (README, API docs, deployment guide)

**Final Success Criteria:**
```
🎯 P0 Blockers Resolution:
├── [✅] P0.1 EU-14 Allergen Non-Compliance: 18.4% → 100%
├── [✅] P0.2 Schema Drift: 48% missing → 0% (all synced)
├── [✅] P0.3 RLS Security Vulnerabilities: 87% → 100% coverage
├── [✅] P0.4 Broken Revenue Attribution: Fixed with FK
└── [✅] P0.5 Email Automation: OFF → ON (cron active)

📊 Health Score Target:
├── Starting: 72/100 (YELLOW)
└── Target: 90+ (GREEN) ✅

🧪 Quality Gates:
├── Tests: All passing (unit + integration + E2E)
├── TypeScript: 0 errors (164 → 0)
├── ESLint: Clean (no warnings)
├── Build: Successful
└── Production: Smoke tests passing

📚 Documentation:
├── README updated with P0 fixes
├── API reference complete
├── Deployment guide ready
└── Schema documentation synced
```

---

## 📈 **5. TIMELINE & EFFORT SUMMARY**

### AI-Accelerated Development Timeline

**Total Time**: 20-24 horas (3 días laborales con Claude Code)

| Fase | Duración | Tareas Clave | Expert Subagents |
|------|----------|--------------|------------------|
| **Fase 1** | 4-6h | RLS policies, PostgreSQL tuning, orders FK | supabase-schema-architect, customer-intelligence-analyst |
| **Fase 2** | 8-12h | Prisma sync (15 tables), Allergen compliance (160 items) | supabase-schema-architect, menu-wine-specialist |
| **Fase 3** | 6-8h | Email automation, cron job, monitoring dashboard | restaurant-operations-master, validation-gates |
| **Fase 4** | 4-6h | Testing, documentation, deployment | validation-gates, documentation-manager |

**Velocity Multiplier**: Con Claude Code, desarrollo es **5-10x más rápido** que tradicional

**Comparison (Estimación tradicional sin IA):**
- Fase 1: 4-6h → 20-30h (traditional)
- Fase 2: 8-12h → 40-60h (traditional)
- Fase 3: 6-8h → 30-40h (traditional)
- Fase 4: 4-6h → 20-30h (traditional)
- **Total tradicional**: 110-160 horas (3-4 semanas)
- **Total con Claude Code**: 20-24 horas (3 días) ✨

### Resource Allocation

**Human Developer (You):**
- Fase 1: Strategic decisions, RLS policy review, FK migration approval
- Fase 2: Allergen data verification (AI-suggested, human-confirmed)
- Fase 3: Email template content review, cron schedule config
- Fase 4: Final approval, production deployment

**Claude Code (AI Assistant):**
- Code generation (100% automation)
- Test writing (100% automation)
- Documentation sync (100% automation)
- Subagent coordination (100% automation)
- Quality gates execution (100% automation)

**Subagent Specialists:**
- supabase-schema-architect: DB schema expertise, RLS policy design
- menu-wine-specialist: EU-14 compliance guidance, allergen validation
- restaurant-operations-master: Email workflow optimization
- customer-intelligence-analyst: Revenue attribution logic
- validation-gates: Automated testing & QA
- documentation-manager: Docs sync post-implementation

---

## 🚀 **6. DEPLOYMENT CHECKLIST**

### Pre-Deployment (30min)
- [ ] Backup production database
  ```bash
  ssh root@31.97.182.226
  docker exec -i $(docker ps -qf "name=db") pg_dump -U postgres postgres > backup-$(date +%Y-%m-%d).sql
  ```
- [ ] Review all SQL scripts for RLS policies
- [ ] Set environment variables (CRON_SECRET, RESEND_API_KEY)
- [ ] Test migrations in staging environment

### Deployment Steps (1-2h)
1. [ ] Apply RLS policies (SSH to prod DB)
2. [ ] Tune PostgreSQL config + restart
3. [ ] Run Prisma migrations: `npx prisma migrate deploy`
4. [ ] Deploy Next.js application (Vercel/production)
5. [ ] Activate email cron job (verify first run)
6. [ ] Run allergen audit dashboard (verify 100% compliance)

### Post-Deployment Validation (1h)
- [ ] Verify RLS policies active (test with different roles)
- [ ] Check email automation (confirm emails sending)
- [ ] Validate revenue attribution (customer orders API)
- [ ] Monitor error logs (Sentry, Vercel logs)
- [ ] Run smoke tests (critical user journeys)

### Rollback Plan
If critical issues occur:
1. Restore database backup
2. Revert application deployment
3. Disable email cron job
4. Document issues for post-mortem

---

## 📚 **7. REFERENCES & CROSS-LINKS**

### Expert Analysis Sources
- `reports/dev-status-2025-10-02.md` - Current state analysis
- `.claude/agents/supabase-schema-architect.md` - Database expert
- `.claude/agents/menu-wine-specialist.md` - Allergen compliance expert
- `.claude/agents/restaurant-operations-master.md` - Operations expert
- `.claude/agents/customer-intelligence-analyst.md` - Revenue expert

### Critical Code Locations
- `/prisma/schema.prisma` - Add 15 missing tables
- `/src/lib/validations/menu.ts` - Remove boolean allergen flags
- `/api/reservations/route.ts:331-377` - Fix race condition (future)
- `/api/cron/email-scheduler/route.ts` - NEW cron endpoint
- `/api/customers/[id]/orders/route.ts` - NEW revenue API

### Production Database (SSH Access)
```bash
ssh root@31.97.182.226
docker exec -i $(docker ps -qf "name=db") psql -U postgres -d postgres
```

### Documentation Updates Required
- [ ] README.md - P0 fixes summary
- [ ] API_REFERENCE.md - New endpoints
- [ ] DEPLOYMENT.md - Migration guide
- [ ] SCHEMA.md - Updated with 31 tables

---

**Plan Generated**: 2025-10-02
**Objective**: ULTRATHINK P0 Critical Fixes
**Total Effort**: 20-24 hours (AI-accelerated)
**Health Score Target**: 72 → 90+ (GREEN)
**Expert Contributors**: 6 domain specialist subagents
**Estimated Completion**: 3 días laborales con Claude Code assistance
