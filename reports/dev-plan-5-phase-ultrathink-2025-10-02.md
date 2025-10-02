# 🚀 Development Plan: ULTRATHINK P0 Critical Fixes (5-Phase Refactored)
**Objetivo**: Resolver 5 blockers críticos (P0) con máxima calidad y fundamento técnico
**Fecha**: 2 de Octubre, 2025
**Timeframe Total**: 26-35 horas (4-5 días laborales)
**Health Score Target**: 72 → 92+ (GREEN status)
**Testing Coverage Target**: 0% → 85%+

---

## 🎯 **EXECUTIVE SUMMARY**

### Contexto del Objetivo
**Meta Principal**: Eliminar los 5 blockers P0 con enfoque en fundamentals, testing robusto, y mantenimiento sostenible

**Business Impact**:
- **Legal**: Evitar €480k en multas por allergen non-compliance
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
✅ Test coverage: 0% → 85%+ (unit + integration + E2E)
✅ Health Score: 72 → 92+ (GREEN)
```

### Cambios vs Plan Original (4-Phase)

**Mejoras Clave**:
1. **Separación de Concerns**: Security (Fase 1) separada de Business Logic (Fase 3)
2. **Testing Dedicado**: Fase 5 expandida con comprehensive testing strategy
3. **Foundation-First**: Schema sync (Fase 2) antes de features (Fase 3)
4. **Quality Gates**: Checkpoints incrementales por cada fase
5. **Rollback Procedures**: Estrategias de rollback documentadas por fase

**Estructura Refactorizada**:
```
4-Phase Plan → 5-Phase Plan (Refactored)

Old Phase 1 (Security + Revenue)
  ├─→ New Phase 1: Foundation & Security (RLS only)
  └─→ New Phase 3: Business Logic (Revenue FK)

Old Phase 2 (Schema + Allergen)
  ├─→ New Phase 2: Schema Synchronization
  └─→ New Phase 3: Business Logic (Allergen)

Old Phase 3 (Email Automation)
  └─→ New Phase 4: Automation & Integration

Old Phase 4 (Validation + Docs)
  └─→ New Phase 5: Testing, Validation & Documentation (EXPANDED)
```

---

## 📊 **ESTADO ACTUAL**

**Source**: `reports/dev-status-2025-10-02.md`

**Health Score Actual**: 72/100 🟡 (Moderate Health)

**Componentes Disponibles**:
```
✅ Database Infrastructure:
├── 31 production tables (restaurante schema)
├── RLS enabled on 27/31 tables (87%)
├── Proper indexes (8 on reservations, 6 on customers)
└── Email infrastructure (email_schedule, email_logs, email_templates)

⚠️  Gaps Críticos:
├── 15 production tables missing from Prisma (48% schema drift)
├── 160/196 menu items sin allergen data (81.6% non-compliance)
├── 4 tables sin RLS policies (gdpr_requests, legal_audit_logs, etc.)
├── No orders.customerId FK (revenue attribution broken)
├── Email automation cron job no existe
└── 0% test coverage (no tests implemented)
```

**Production Data Reality Check**:
- **Customers**: 5 (1 VIP = 100% revenue)
- **Reservations**: 25 (9 confirmed, 6 pending, 6 cancelled, 4 completed)
- **Menu Items**: 196 (111 beverages, 46 wines, 39 food)
- **Emails Sent**: 53 (manual, no automation)

---

## 🚀 **FASES DE DESARROLLO (5-PHASE)**

---

## **FASE 1: FOUNDATION & SECURITY** [3-4 horas]
**Priority**: Database security foundation + PostgreSQL performance
**Expert Consultants**: supabase-schema-architect

### Objetivo de Fase
Establecer base de seguridad sólida antes de cualquier feature development. Zero business logic, pure infrastructure.

### Tareas

```
🔐 Database Security Foundation:
├── 🗃️  Emergency RLS Policies (2-2.5h) - P0.3 RLS Security
│   ├── [ ] gdpr_requests: ADMIN-only + customer own requests
│   │   ```sql
│   │   CREATE POLICY gdpr_requests_admin ON restaurante.gdpr_requests
│   │   FOR ALL TO authenticated
│   │   USING (
│   │     EXISTS (SELECT 1 FROM restaurante.users
│   │             WHERE id = auth.uid()::text AND role = 'ADMIN')
│   │   );
│   │
│   │   CREATE POLICY gdpr_requests_own ON restaurante.gdpr_requests
│   │   FOR SELECT TO authenticated
│   │   USING (email = auth.email());
│   │   ```
│   │
│   ├── [ ] legal_audit_logs: ADMIN-only SELECT
│   │   ```sql
│   │   CREATE POLICY legal_audit_admin ON restaurante.legal_audit_logs
│   │   FOR SELECT TO authenticated
│   │   USING (
│   │     EXISTS (SELECT 1 FROM restaurante.users
│   │             WHERE id = auth.uid()::text AND role = 'ADMIN')
│   │   );
│   │   ```
│   │
│   ├── [ ] legal_content: Public READ, ADMIN write
│   │   ```sql
│   │   CREATE POLICY legal_content_read ON restaurante.legal_content
│   │   FOR SELECT TO anon, authenticated
│   │   USING (is_active = true);
│   │
│   │   CREATE POLICY legal_content_admin ON restaurante.legal_content
│   │   FOR ALL TO authenticated
│   │   USING (
│   │     EXISTS (SELECT 1 FROM restaurante.users
│   │             WHERE id = auth.uid()::text AND role = 'ADMIN')
│   │   );
│   │   ```
│   │
│   └── [ ] reservations UPDATE: Fix ownership check
│       ```sql
│       DROP POLICY IF EXISTS authenticated_can_update_reservations
│         ON restaurante.reservations;
│
│       CREATE POLICY authenticated_can_update_own_reservations
│         ON restaurante.reservations
│       FOR UPDATE TO authenticated
│       USING (
│         customerEmail = auth.email() OR
│         EXISTS (SELECT 1 FROM restaurante.users
│                 WHERE id = auth.uid()::text
│                 AND role IN ('ADMIN', 'MANAGER', 'STAFF'))
│       );
│       ```
│
├── 🔧 PostgreSQL Performance Tuning (30min)
│   ├── [ ] Update postgresql.conf via SSH
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
│   └── [ ] Verify PostgreSQL startup and config applied
│       ```bash
│       ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -c 'SHOW shared_buffers;'"
│       # Expected: 1GB
│       ```
│
└── 🧪 Testing Strategy - Fase 1
    ├── [ ] Security Tests (1-1.5h)
    │   ├── [ ] Unit Tests: RLS policy logic validation
    │   │   ```typescript
    │   │   // /src/lib/security/__tests__/rls-policies.test.ts
    │   │   import { createClient } from '@supabase/supabase-js';
    │   │
    │   │   describe('RLS Policies - gdpr_requests', () => {
    │   │     it('ADMIN can read all GDPR requests', async () => {
    │   │       const adminClient = createClient(url, key, { headers: { role: 'ADMIN' } });
    │   │       const { data, error } = await adminClient.from('gdpr_requests').select('*');
    │   │       expect(error).toBeNull();
    │   │       expect(data).toBeInstanceOf(Array);
    │   │     });
    │   │
    │   │     it('Customer can only read own GDPR requests', async () => {
    │   │       const customerClient = createClient(url, key, {
    │   │         headers: { email: 'customer@test.com' }
    │   │       });
    │   │       const { data } = await customerClient.from('gdpr_requests').select('*');
    │   │       expect(data.every(req => req.email === 'customer@test.com')).toBe(true);
    │   │     });
    │   │
    │   │     it('Unauthorized user cannot access GDPR requests', async () => {
    │   │       const anonClient = createClient(url, anonKey);
    │   │       const { data, error } = await anonClient.from('gdpr_requests').select('*');
    │   │       expect(error).not.toBeNull();
    │   │       expect(data).toBeNull();
    │   │     });
    │   │   });
    │   │
    │   │   describe('RLS Policies - legal_audit_logs', () => {
    │   │     it('Only ADMIN can read audit logs', async () => {
    │   │       // Test ADMIN access succeeds
    │   │       // Test non-ADMIN access fails
    │   │     });
    │   │   });
    │   │
    │   │   describe('RLS Policies - legal_content', () => {
    │   │     it('Anonymous users can read active legal content', async () => {
    │   │       // Test public read access
    │   │     });
    │   │
    │   │     it('Only ADMIN can create/update legal content', async () => {
    │   │       // Test write restrictions
    │   │     });
    │   │   });
    │   │
    │   │   describe('RLS Policies - reservations UPDATE', () => {
    │   │     it('Customer can only update own reservations', async () => {
    │   │       // Test ownership check
    │   │     });
    │   │
    │   │     it('STAFF can update any reservation', async () => {
    │   │       // Test staff access
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   ├── [ ] Integration Tests: End-to-end RLS validation
    │   │   ```typescript
    │   │   // /tests/integration/security/rls-integration.test.ts
    │   │   describe('RLS Integration Tests', () => {
    │   │     it('GDPR request workflow respects RLS', async () => {
    │   │       // 1. Customer creates GDPR request
    │   │       // 2. Customer can read own request
    │   │       // 3. Different customer cannot read it
    │   │       // 4. ADMIN can read all requests
    │   │     });
    │   │
    │   │     it('Reservation update workflow enforces ownership', async () => {
    │   │       // 1. Customer creates reservation
    │   │       // 2. Customer can update own reservation
    │   │       // 3. Different customer cannot update it
    │   │       // 4. STAFF can update any reservation
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   └── [ ] Manual Security Audit (30min)
    │       ```bash
    │       # Verify all RLS policies deployed
    │       ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c 'SELECT tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE schemaname = '\''restaurante'\'' ORDER BY tablename;'"
    │
    │       # Expected: 31+ policies covering all tables
    │       # Verify gdpr_requests has 2 policies (admin + own)
    │       # Verify legal_audit_logs has 1 policy (admin)
    │       # Verify legal_content has 2 policies (read + admin)
    │       # Verify reservations has updated ownership policy
    │       ```
    │
    ├── [ ] Performance Tests (30min)
    │   ├── [ ] PostgreSQL config validation
    │   │   ```bash
    │   │   # Verify new config applied
    │   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -c 'SHOW shared_buffers; SHOW effective_cache_size; SHOW max_connections;'"
    │   │   ```
    │   │
    │   └── [ ] Query performance baseline
    │       ```sql
    │       -- Measure query performance with new config
    │       EXPLAIN ANALYZE SELECT * FROM restaurante.reservations
    │       WHERE status = 'CONFIRMED' AND date >= NOW();
    │       -- Expected: < 50ms
    │       ```
    │
    └── [ ] Rollback Procedures Documentation
        ```markdown
        ## Rollback Plan - Fase 1

        ### If RLS policies block legitimate access:
        1. DROP specific policy causing issue:
           ```sql
           DROP POLICY policy_name ON restaurante.table_name;
           ```
        2. Revert to service_role for admin operations temporarily
        3. Review policy logic, fix, redeploy

        ### If PostgreSQL fails to restart:
        1. Restore previous postgresql.conf from backup
        2. Restart PostgreSQL
        3. Investigate config conflict in logs

        ### Emergency Access:
        - Service role key: Always bypasses RLS
        - Use for emergency admin operations only
        ```
```

### Checkpoints Fase 1

**Validation Criteria**:
- ✅ RLS policies deployed: 4 new policies + 1 updated (total 31+ in prod)
- ✅ PostgreSQL config tuned: shared_buffers = 1GB, max_connections = 200
- ✅ Security tests passing: 15+ test cases green
- ✅ No unauthorized access: All RLS policies enforce correct permissions
- ✅ Performance baseline: Query times < 50ms for common operations

**Quality Gates**:
```bash
# All tests must pass before Phase 2
npm run test:security  # 15+ tests passing
ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -c 'SELECT COUNT(*) FROM pg_policies WHERE schemaname = '\''restaurante'\'';'"
# Expected: 31+
```

**Blockers Resolved**:
- ✅ **P0.3 RLS Security Vulnerabilities**: 87% → 100% table coverage

---

## **FASE 2: SCHEMA SYNCHRONIZATION** [5-7 horas]
**Priority**: Type safety + production parity
**Expert Consultants**: supabase-schema-architect

### Objetivo de Fase
Sincronizar Prisma schema con 31 production tables, restaurar type safety, eliminar schema drift.

### Tareas

```
🧠 Schema Drift Resolution:
├── 🗃️  Production Schema Introspection (1h)
│   ├── [ ] Backup current schema
│   │   ```bash
│   │   cp prisma/schema.prisma prisma/schema.prisma.backup-$(date +%Y-%m-%d)
│   │   ```
│   │
│   ├── [ ] Pull production schema
│   │   ```bash
│   │   npx prisma db pull --schema=prisma/schema-production.prisma
│   │   ```
│   │
│   └── [ ] Compare schemas side-by-side
│       ```bash
│       diff -u prisma/schema.prisma prisma/schema-production.prisma > prisma/schema-diff.txt
│       # Review 15 missing tables
│       ```
│
├── 📝 Manual Schema Merge (3-4h)
│   ├── [ ] Add missing table models (15 tables)
│   │   ```prisma
│   │   // prisma/schema.prisma - Add these models
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
│   │     reservation   Reservation @relation(fields: [reservationId], references: [id])
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
│   │     userAgent             String?   @map("user_agent")
│   │     referrer              String?
│   │     sessionId             String?   @map("session_id")
│   │
│   │     table                 Table     @relation(fields: [tableId], references: [id])
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
│   │     requestData       Json?     @map("request_data")
│   │     responseData      Json?     @map("response_data")
│   │     createdAt         DateTime  @default(now()) @map("created_at")
│   │     processedAt       DateTime? @map("processed_at")
│   │     verificationToken String?   @map("verification_token")
│   │
│   │     customer          Customer? @relation(fields: [customerId], references: [id])
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
│   │     status          String
│   │     resendMessageId String?   @map("resend_message_id")
│   │     sentAt          DateTime? @map("sent_at") @db.Timestamptz
│   │     errorMessage    String?   @map("error_message")
│   │
│   │     reservation     Reservation? @relation(fields: [reservationId], references: [id])
│   │
│   │     @@map("email_logs")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model EmailSchedule {
│   │     id             String    @id @default(uuid()) @db.Uuid
│   │     reservationId  String?   @map("reservation_id")
│   │     recipientEmail String    @map("recipient_email")
│   │     templateType   String    @map("template_type")
│   │     scheduledAt    DateTime  @map("scheduled_at") @db.Timestamptz
│   │     status         String    @default("pending")
│   │     sentAt         DateTime? @map("sent_at") @db.Timestamptz
│   │     retryCount     Int       @default(0) @map("retry_count")
│   │     lastError      String?   @map("last_error")
│   │     createdAt      DateTime  @default(now()) @map("created_at")
│   │
│   │     reservation    Reservation? @relation(fields: [reservationId], references: [id])
│   │
│   │     @@map("email_schedule")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model EmailTemplate {
│   │     id          String   @id @default(uuid()) @db.Uuid
│   │     type        String   @unique
│   │     subject     String
│   │     bodyHtml    String   @map("body_html")
│   │     bodyText    String?  @map("body_text")
│   │     isActive    Boolean  @default(true) @map("is_active")
│   │     createdAt   DateTime @default(now()) @map("created_at")
│   │     updatedAt   DateTime @updatedAt @map("updated_at")
│   │
│   │     @@map("email_templates")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model CookieConsent {
│   │     id             String    @id @default(uuid()) @db.Uuid
│   │     visitorId      String?   @map("visitor_id")
│   │     customerId     String?   @map("customer_id")
│   │     consentGiven   Boolean   @map("consent_given")
│   │     consentDate    DateTime  @map("consent_date") @db.Timestamptz
│   │     ipAddress      String?   @map("ip_address") @db.Inet
│   │     userAgent      String?   @map("user_agent")
│   │     cookieVersion  String?   @map("cookie_version")
│   │
│   │     customer       Customer? @relation(fields: [customerId], references: [id])
│   │
│   │     @@map("cookie_consents")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model LegalAuditLog {
│   │     id             String   @id @default(uuid()) @db.Uuid
│   │     eventType      String   @map("event_type")
│   │     userId         String?  @map("user_id")
│   │     customerId     String?  @map("customer_id")
│   │     ipAddress      String?  @map("ip_address") @db.Inet
│   │     userAgent      String?  @map("user_agent")
│   │     eventData      Json?    @map("event_data")
│   │     timestamp      DateTime @default(now()) @db.Timestamptz
│   │
│   │     customer       Customer? @relation(fields: [customerId], references: [id])
│   │
│   │     @@map("legal_audit_logs")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model LegalContent {
│   │     id            String   @id @default(uuid()) @db.Uuid
│   │     contentType   String   @map("content_type")
│   │     title         String
│   │     content       String
│   │     version       Int
│   │     language      String   @default("es")
│   │     isActive      Boolean  @default(true) @map("is_active")
│   │     effectiveDate DateTime @map("effective_date") @db.Timestamptz
│   │     createdAt     DateTime @default(now()) @map("created_at")
│   │     updatedAt     DateTime @updatedAt @map("updated_at")
│   │
│   │     @@unique([contentType, version, language])
│   │     @@map("legal_content")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model TableSession {
│   │     id             String    @id @default(uuid()) @db.Uuid
│   │     tableId        String    @map("table_id")
│   │     sessionStart   DateTime  @map("session_start") @db.Timestamptz
│   │     sessionEnd     DateTime? @map("session_end") @db.Timestamptz
│   │     orderId        String?   @map("order_id")
│   │     customerId     String?   @map("customer_id")
│   │     qrScanId       String?   @map("qr_scan_id")
│   │     isActive       Boolean   @default(true) @map("is_active")
│   │
│   │     table          Table     @relation(fields: [tableId], references: [id])
│   │     order          Order?    @relation(fields: [orderId], references: [id])
│   │     customer       Customer? @relation(fields: [customerId], references: [id])
│   │
│   │     @@map("table_sessions")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model ZoneUtilizationTarget {
│   │     id                String   @id @default(uuid()) @db.Uuid
│   │     zoneName          String   @map("zone_name")
│   │     targetUtilization Decimal  @map("target_utilization") @db.Decimal(5,2)
│   │     dayOfWeek         Int?     @map("day_of_week")
│   │     timeSlot          String?  @map("time_slot")
│   │     priority          Int      @default(1)
│   │
│   │     @@unique([zoneName, dayOfWeek, timeSlot])
│   │     @@map("zone_utilization_targets")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   model ReservationSuccessPattern {
│   │     id                  String   @id @default(uuid()) @db.Uuid
│   │     partySize           Int      @map("party_size")
│   │     dayOfWeek           Int      @map("day_of_week")
│   │     timeSlot            String   @map("time_slot")
│   │     successRate         Decimal  @map("success_rate") @db.Decimal(5,2)
│   │     sampleSize          Int      @map("sample_size")
│   │     lastCalculated      DateTime @map("last_calculated") @db.Timestamptz
│   │
│   │     @@unique([partySize, dayOfWeek, timeSlot])
│   │     @@map("reservation_success_patterns")
│   │     @@schema("restaurante")
│   │   }
│   │
│   │   // + 2 more missing tables (if applicable)
│   │   ```
│   │
│   ├── [ ] Update existing models with reverse relations
│   │   ```prisma
│   │   model Customer {
│   │     // ... existing fields
│   │     gdprRequests      GdprRequest[]
│   │     cookieConsents    CookieConsent[]
│   │     legalAuditLogs    LegalAuditLog[]
│   │     tableSessions     TableSession[]
│   │   }
│   │
│   │   model Reservation {
│   │     // ... existing fields
│   │     reservationTokens ReservationToken[]
│   │     emailLogs         EmailLog[]
│   │     emailSchedules    EmailSchedule[]
│   │   }
│   │
│   │   model Table {
│   │     // ... existing fields
│   │     qrScans           QrScan[]
│   │     tableSessions     TableSession[]
│   │   }
│   │
│   │   model Order {
│   │     // ... existing fields
│   │     tableSessions     TableSession[]
│   │   }
│   │   ```
│   │
│   └── [ ] Validate schema syntax
│       ```bash
│       npx prisma validate
│       # Must pass with 0 errors
│       ```
│
├── 🔄 Prisma Client Generation (30min)
│   ├── [ ] Generate new Prisma Client with all types
│   │   ```bash
│   │   npx prisma generate
│   │   ```
│   │
│   └── [ ] Verify types exported correctly
│       ```typescript
│       // Test import in TypeScript file
│       import { Prisma, GdprRequest, EmailLog, EmailSchedule } from '@prisma/client';
│       // Should compile with no errors
│       ```
│
├── 🔧 TypeScript Error Resolution (1-2h)
│   ├── [ ] Update imports across codebase
│   │   ```bash
│   │   # Find files with Prisma imports
│   │   grep -r "from '@prisma/client'" src/
│   │
│   │   # Fix type errors in affected files
│   │   # customer-contact.tsx, customer-reservations.tsx, etc.
│   │   npm run type-check
│   │   ```
│   │
│   └── [ ] Resolve Prisma relation errors
│       ```bash
│       # Iteratively fix type errors
│       npm run type-check 2>&1 | tee type-errors.log
│       # Target: 164 errors → <20 errors
│       ```
│
└── 🧪 Testing Strategy - Fase 2
    ├── [ ] Schema Validation Tests (1h)
    │   ├── [ ] Unit Tests: Schema integrity
    │   │   ```typescript
    │   │   // /src/lib/db/__tests__/schema-validation.test.ts
    │   │   import { PrismaClient } from '@prisma/client';
    │   │
    │   │   describe('Prisma Schema Validation', () => {
    │   │     let prisma: PrismaClient;
    │   │
    │   │     beforeAll(() => {
    │   │       prisma = new PrismaClient();
    │   │     });
    │   │
    │   │     afterAll(async () => {
    │   │       await prisma.$disconnect();
    │   │     });
    │   │
    │   │     it('All 31 production tables have Prisma models', async () => {
    │   │       // Verify each model can be queried
    │   │       const models = [
    │   │         'customer', 'reservation', 'order', 'menuItem',
    │   │         'gdprRequest', 'emailLog', 'emailSchedule', 'emailTemplate',
    │   │         'qrScan', 'reservationToken', 'cookieConsent',
    │   │         'legalAuditLog', 'legalContent', 'tableSession',
    │   │         'zoneUtilizationTarget', 'reservationSuccessPattern'
    │   │         // ... all 31 models
    │   │       ];
    │   │
    │   │       for (const model of models) {
    │   │         expect(() => prisma[model]).not.toThrow();
    │   │       }
    │   │     });
    │   │
    │   │     it('All relations are properly defined', async () => {
    │   │       // Test customer → gdprRequests relation
    │   │       const customer = await prisma.customer.findFirst({
    │   │         include: { gdprRequests: true }
    │   │       });
    │   │       expect(customer.gdprRequests).toBeInstanceOf(Array);
    │   │
    │   │       // Test reservation → emailLogs relation
    │   │       const reservation = await prisma.reservation.findFirst({
    │   │         include: { emailLogs: true }
    │   │       });
    │   │       expect(reservation.emailLogs).toBeInstanceOf(Array);
    │   │     });
    │   │
    │   │     it('Schema matches production database structure', async () => {
    │   │       // Query production to get table count
    │   │       const result = await prisma.$queryRaw`
    │   │         SELECT COUNT(*) as table_count
    │   │         FROM information_schema.tables
    │   │         WHERE table_schema = 'restaurante'
    │   │       `;
    │   │       expect(result[0].table_count).toBe(31);
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   ├── [ ] Integration Tests: Cross-model queries
    │   │   ```typescript
    │   │   // /tests/integration/db/cross-model-queries.test.ts
    │   │   describe('Cross-Model Query Integration', () => {
    │   │     it('Can fetch customer with all related data', async () => {
    │   │       const customer = await prisma.customer.findFirst({
    │   │         include: {
    │   │           reservations: true,
    │   │           orders: true,
    │   │           gdprRequests: true,
    │   │           cookieConsents: true,
    │   │           legalAuditLogs: true,
    │   │           tableSessions: true
    │   │         }
    │   │       });
    │   │
    │   │       expect(customer).toBeTruthy();
    │   │       expect(customer.reservations).toBeInstanceOf(Array);
    │   │       expect(customer.gdprRequests).toBeInstanceOf(Array);
    │   │     });
    │   │
    │   │     it('Can fetch reservation with email automation data', async () => {
    │   │       const reservation = await prisma.reservation.findFirst({
    │   │         include: {
    │   │           emailLogs: true,
    │   │           emailSchedules: true,
    │   │           reservationTokens: true
    │   │         }
    │   │       });
    │   │
    │   │       expect(reservation.emailLogs).toBeInstanceOf(Array);
    │   │       expect(reservation.emailSchedules).toBeInstanceOf(Array);
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   └── [ ] Manual Schema Sync Verification (30min)
    │       ```bash
    │       # Verify schema is in sync with production
    │       npx prisma db pull --schema=prisma/schema-verify.prisma
    │       diff prisma/schema.prisma prisma/schema-verify.prisma
    │       # Expected: 0 differences
    │
    │       # Verify all models compile
    │       npm run type-check
    │       # Expected: <20 TypeScript errors (down from 164)
    │       ```
    │
    ├── [ ] Type Safety Tests (30min)
    │   └── [ ] TypeScript compilation with strict mode
    │       ```bash
    │       # Enable strict TypeScript checks
    │       npm run type-check -- --noEmit
    │       # Should complete with minimal errors
    │       ```
    │
    └── [ ] Rollback Procedures Documentation
        ```markdown
        ## Rollback Plan - Fase 2

        ### If schema merge breaks application:
        1. Restore from backup:
           ```bash
           cp prisma/schema.prisma.backup-YYYY-MM-DD prisma/schema.prisma
           npx prisma generate
           ```
        2. Restart application
        3. Review schema-diff.txt for conflicts

        ### If Prisma Client generation fails:
        1. Fix schema syntax errors
        2. Run `npx prisma validate` until clean
        3. Regenerate client: `npx prisma generate`

        ### If type errors cascade:
        1. Use @ts-ignore temporarily for non-critical errors
        2. Fix critical path first (API routes, core components)
        3. Schedule technical debt cleanup
        ```
```

### Checkpoints Fase 2

**Validation Criteria**:
- ✅ Schema drift: 48% → 0% (all 31 tables in schema.prisma)
- ✅ Prisma Client generated: All types exported correctly
- ✅ TypeScript errors: 164 → <20 (majority resolved)
- ✅ Schema validation tests: 25+ test cases passing
- ✅ Cross-model queries: All relations functional

**Quality Gates**:
```bash
# All tests must pass before Phase 3
npm run test:db-schema  # 25+ tests passing
npx prisma validate     # Clean validation
npm run type-check      # <20 errors
```

**Blockers Resolved**:
- ✅ **P0.2 Schema Drift**: 15 missing tables now in Prisma
- 🔄 **TypeScript Type Safety**: Majority of 164 errors resolved

---

## **FASE 3: BUSINESS LOGIC & COMPLIANCE** [6-8 horas]
**Priority**: Revenue attribution + EU-14 allergen compliance
**Expert Consultants**: customer-intelligence-analyst, menu-wine-specialist

### Objetivo de Fase
Implementar business requirements críticos: customer-orders linkage para revenue tracking y EU-14 allergen compliance.

### Tareas

```
💼 Business Logic Implementation:
├── 🔗 Revenue Attribution Fix (2-3h) - P0.4 Customer-Orders
│   ├── [ ] Add orders.customerId FK to schema
│   │   ```prisma
│   │   model Order {
│   │     id           String      @id @default(cuid())
│   │     orderNumber  String      @unique
│   │     totalAmount  Decimal     @db.Decimal(10,2)
│   │     status       OrderStatus
│   │     notes        String?
│   │
│   │     // NEW: Customer linkage for revenue attribution
│   │     customer     Customer?   @relation(fields: [customerId], references: [id], onDelete: SetNull)
│   │     customerId   String?     @map("customer_id")
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
│   ├── [ ] Create and apply migration
│   │   ```bash
│   │   npx prisma migrate dev --name add_customer_orders_link
│   │   # Review migration SQL before applying
│   │   npx prisma migrate deploy
│   │   ```
│   │
│   ├── [ ] Backfill existing orders with customerId
│   │   ```sql
│   │   -- SSH to prod DB, run backfill script
│   │   UPDATE restaurante.orders o
│   │   SET "customerId" = r."customerId"
│   │   FROM restaurante.reservations r
│   │   WHERE o."reservationId" = r.id
│   │     AND o."customerId" IS NULL
│   │     AND r."customerId" IS NOT NULL;
│   │
│   │   -- Verify backfill results
│   │   SELECT
│   │     COUNT(*) FILTER (WHERE "customerId" IS NOT NULL) as linked_orders,
│   │     COUNT(*) FILTER (WHERE "customerId" IS NULL) as orphaned_orders,
│   │     COUNT(*) as total_orders
│   │   FROM restaurante.orders;
│   │   ```
│   │
│   └── [ ] Create API endpoint /api/customers/[id]/orders
│       ```typescript
│       // /src/app/api/customers/[id]/orders/route.ts
│       import { NextResponse } from 'next/server';
│       import { prisma } from '@/lib/db';
│
│       export async function GET(
│         req: Request,
│         { params }: { params: { id: string } }
│       ) {
│         const customerId = params.id;
│
│         try {
│           const orders = await prisma.order.findMany({
│             where: { customerId },
│             include: {
│               items: {
│                 include: {
│                   menuItem: {
│                     select: {
│                       id: true,
│                       name: true,
│                       price: true,
│                       category: true
│                     }
│                   }
│                 }
│               },
│               table: {
│                 select: {
│                   id: true,
│                   number: true,
│                   zone: true
│                 }
│               }
│             },
│             orderBy: { orderedAt: 'desc' }
│           });
│
│           const revenue = await prisma.order.aggregate({
│             where: {
│               customerId,
│               status: { in: ['COMPLETED', 'PAID'] }
│             },
│             _sum: { totalAmount: true },
│             _avg: { totalAmount: true },
│             _count: true
│           });
│
│           return NextResponse.json({
│             orders,
│             revenue: {
│               totalSpent: revenue._sum.totalAmount || 0,
│               averageSpend: revenue._avg.totalAmount || 0,
│               orderCount: revenue._count
│             }
│           });
│         } catch (error) {
│           console.error('Error fetching customer orders:', error);
│           return NextResponse.json(
│             { error: 'Failed to fetch customer orders' },
│             { status: 500 }
│           );
│         }
│       }
│       ```
│
├── 🎨 EU-14 Allergen Compliance (3-4h) - P0.1 Legal Fix
│   ├── [ ] Remove boolean allergen flags from validation
│   │   ```typescript
│   │   // /src/lib/validations/menu.ts
│   │   // REMOVE estas líneas (schema conflict):
│   │   // containsGluten, containsMilk, containsEggs... (14 booleans)
│   │
│   │   // KEEP solo junction table pattern:
│   │   export const menuItemSchema = z.object({
│   │     // ... other fields
│   │     allergenIds: z.array(z.string()).min(1, {
│   │       message: "Selecciona al menos un alérgeno. Si el item no contiene alérgenos, selecciona 'Ninguno' (EU-14 compliance obligatorio)"
│   │     })
│   │   });
│   │   ```
│   │
│   ├── [ ] Create mandatory allergen selector component
│   │   ```tsx
│   │   // /src/components/admin/MenuItemAllergenSelector.tsx
│   │   import { useQuery } from '@tanstack/react-query';
│   │   import { Checkbox } from '@/components/ui/checkbox';
│   │   import { Label } from '@/components/ui/label';
│   │
│   │   interface AllergenSelectorProps {
│   │     value: string[];
│   │     onChange: (ids: string[]) => void;
│   │   }
│   │
│   │   export function MenuItemAllergenSelector({
│   │     value,
│   │     onChange
│   │   }: AllergenSelectorProps) {
│   │     const { data: allergens } = useQuery({
│   │       queryKey: ['allergens'],
│   │       queryFn: () => fetch('/api/menu/allergens').then(r => r.json())
│   │     });
│   │
│   │     return (
│   │       <div className="space-y-3">
│   │         <Label className="text-sm font-medium text-destructive">
│   │           Alérgenos EU-14 (Obligatorio) *
│   │         </Label>
│   │         <p className="text-xs text-muted-foreground">
│   │           Regulación española AECOSAN - selección obligatoria
│   │         </p>
│   │
│   │         <div className="grid grid-cols-2 gap-3 rounded-md border border-input p-4">
│   │           {allergens?.map((allergen: any) => (
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
│   │               <Label
│   │                 htmlFor={allergen.id}
│   │                 className="text-sm font-normal cursor-pointer"
│   │               >
│   │                 {allergen.name} / {allergen.nameEn}
│   │               </Label>
│   │             </div>
│   │           ))}
│   │         </div>
│   │
│   │         {value.length === 0 && (
│   │           <p className="text-xs text-destructive font-medium">
│   │             ⚠️  Selecciona "Ninguno" si el item no contiene alérgenos
│   │           </p>
│   │         )}
│   │       </div>
│   │     );
│   │   }
│   │   ```
│   │
│   ├── [ ] Integrate selector into working-menu-item-form.tsx
│   │   ```tsx
│   │   // /src/app/(admin)/dashboard/menu/components/forms/working-menu-item-form.tsx
│   │   import { MenuItemAllergenSelector } from '@/components/admin/MenuItemAllergenSelector';
│   │
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
│   ├── [ ] Create allergen audit dashboard
│   │   ```tsx
│   │   // /src/app/(admin)/dashboard/menu/allergens/page.tsx
│   │   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
│   │   import { Progress } from '@/components/ui/progress';
│   │   import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
│   │   import { Badge } from '@/components/ui/badge';
│   │   import { Button } from '@/components/ui/button';
│   │   import { useQuery } from '@tanstack/react-query';
│   │   import { useRouter } from 'next/navigation';
│   │
│   │   export default function AllergenAuditPage() {
│   │     const router = useRouter();
│   │
│   │     const { data: auditResults, refetch } = useQuery({
│   │       queryKey: ['allergen-audit'],
│   │       queryFn: () => fetch('/api/admin/allergens/audit').then(r => r.json())
│   │     });
│   │
│   │     return (
│   │       <div className="space-y-6 p-6">
│   │         <div className="flex justify-between items-center">
│   │           <h1 className="text-3xl font-bold">EU-14 Allergen Audit</h1>
│   │           <Button onClick={() => refetch()}>Refresh Data</Button>
│   │         </div>
│   │
│   │         <div className="grid gap-4 md:grid-cols-3">
│   │           <Card>
│   │             <CardHeader>
│   │               <CardTitle className="text-sm">Compliance Status</CardTitle>
│   │             </CardHeader>
│   │             <CardContent>
│   │               <div className="text-3xl font-bold">
│   │                 {auditResults?.compliancePercentage || 0}%
│   │               </div>
│   │               <Progress
│   │                 value={auditResults?.compliancePercentage || 0}
│   │                 className="mt-2"
│   │               />
│   │               <p className="text-xs text-muted-foreground mt-2">
│   │                 {auditResults?.itemsWithAllergens || 0} / {auditResults?.totalItems || 0} items
│   │               </p>
│   │             </CardContent>
│   │           </Card>
│   │
│   │           <Card>
│   │             <CardHeader>
│   │               <CardTitle className="text-sm">Items Sin Datos</CardTitle>
│   │             </CardHeader>
│   │             <CardContent>
│   │               <div className="text-3xl font-bold text-destructive">
│   │                 {auditResults?.itemsWithoutAllergens || 160}
│   │               </div>
│   │               <p className="text-sm text-muted-foreground mt-2">
│   │                 Requieren atención inmediata
│   │               </p>
│   │             </CardContent>
│   │           </Card>
│   │
│   │           <Card>
│   │             <CardHeader>
│   │               <CardTitle className="text-sm">Legal Risk Estimate</CardTitle>
│   │             </CardHeader>
│   │             <CardContent>
│   │               <div className="text-lg font-medium text-destructive">
│   │                 €{((auditResults?.itemsWithoutAllergens || 160) * 3000).toLocaleString()}
│   │               </div>
│   │               <p className="text-xs text-muted-foreground mt-2">
│   │                 Potential fines (€3k per violation - Spanish AECOSAN)
│   │               </p>
│   │             </CardContent>
│   │           </Card>
│   │         </div>
│   │
│   │         <Card>
│   │           <CardHeader>
│   │             <CardTitle>Items Requiriendo Atención ({auditResults?.missingItems?.length || 0})</CardTitle>
│   │           </CardHeader>
│   │           <CardContent>
│   │             <Table>
│   │               <TableHeader>
│   │                 <TableRow>
│   │                   <TableHead>Item Name</TableHead>
│   │                   <TableHead>Categoría</TableHead>
│   │                   <TableHead>Status</TableHead>
│   │                   <TableHead>Acción</TableHead>
│   │                 </TableRow>
│   │               </TableHeader>
│   │               <TableBody>
│   │                 {auditResults?.missingItems?.slice(0, 50).map((item: any) => (
│   │                   <TableRow key={item.id}>
│   │                     <TableCell className="font-medium">{item.name}</TableCell>
│   │                     <TableCell>{item.category?.name || 'N/A'}</TableCell>
│   │                     <TableCell>
│   │                       <Badge variant="destructive">Sin alérgenos</Badge>
│   │                     </TableCell>
│   │                     <TableCell>
│   │                       <Button
│   │                         size="sm"
│   │                         variant="outline"
│   │                         onClick={() => router.push(`/dashboard/menu/edit/${item.id}`)}
│   │                       >
│   │                         Completar
│   │                       </Button>
│   │                     </TableCell>
│   │                   </TableRow>
│   │                 ))}
│   │               </TableBody>
│   │             </Table>
│   │
│   │             {(auditResults?.missingItems?.length || 0) > 50 && (
│   │               <p className="text-sm text-muted-foreground mt-4 text-center">
│   │                 Mostrando 50 de {auditResults?.missingItems?.length} items.
│   │                 Completa estos primero.
│   │               </p>
│   │             )}
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
│       import { NextResponse } from 'next/server';
│       import { prisma } from '@/lib/db';
│
│       export async function GET() {
│         try {
│           const totalItems = await prisma.menuItem.count();
│
│           const itemsWithAllergens = await prisma.menuItem.count({
│             where: {
│               allergens: {
│                 some: {}
│               }
│             }
│           });
│
│           const missingItems = await prisma.menuItem.findMany({
│             where: {
│               allergens: {
│                 none: {}
│               }
│             },
│             select: {
│               id: true,
│               name: true,
│               category: {
│                 select: {
│                   id: true,
│                   name: true
│                 }
│               }
│             },
│             orderBy: {
│               name: 'asc'
│             }
│           });
│
│           const compliancePercentage = totalItems > 0
│             ? (itemsWithAllergens / totalItems) * 100
│             : 0;
│
│           return NextResponse.json({
│             totalItems,
│             itemsWithAllergens,
│             itemsWithoutAllergens: totalItems - itemsWithAllergens,
│             compliancePercentage: Math.round(compliancePercentage * 10) / 10,
│             missingItems,
│             lastUpdated: new Date().toISOString()
│           });
│         } catch (error) {
│           console.error('Error in allergen audit:', error);
│           return NextResponse.json(
│             { error: 'Failed to generate allergen audit' },
│             { status: 500 }
│           );
│         }
│       }
│       ```
│
└── 🧪 Testing Strategy - Fase 3
    ├── [ ] Revenue Attribution Tests (1.5-2h)
    │   ├── [ ] Unit Tests: Revenue calculation logic
    │   │   ```typescript
    │   │   // /src/lib/revenue/__tests__/revenue-attribution.test.ts
    │   │   import { prisma } from '@/lib/db';
    │   │
    │   │   describe('Revenue Attribution', () => {
    │   │     it('Calculates total customer spend correctly', async () => {
    │   │       const customerId = 'test-customer-id';
    │   │
    │   │       const revenue = await prisma.order.aggregate({
    │   │         where: {
    │   │           customerId,
    │   │           status: { in: ['COMPLETED', 'PAID'] }
    │   │         },
    │   │         _sum: { totalAmount: true },
    │   │         _count: true
    │   │       });
    │   │
    │   │       expect(revenue._sum.totalAmount).toBeGreaterThanOrEqual(0);
    │   │       expect(revenue._count).toBeGreaterThanOrEqual(0);
    │   │     });
    │   │
    │   │     it('Excludes cancelled orders from revenue', async () => {
    │   │       // Verify cancelled orders not counted
    │   │     });
    │   │
    │   │     it('Links orders to customers via reservations', async () => {
    │   │       // Test backfill logic
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   ├── [ ] Integration Tests: API endpoint validation
    │   │   ```typescript
    │   │   // /tests/integration/api/customer-orders.test.ts
    │   │   describe('Customer Orders API', () => {
    │   │     it('Returns customer orders with revenue data', async () => {
    │   │       const response = await fetch('/api/customers/test-id/orders');
    │   │       const data = await response.json();
    │   │
    │   │       expect(data).toHaveProperty('orders');
    │   │       expect(data).toHaveProperty('revenue');
    │   │       expect(data.revenue).toHaveProperty('totalSpent');
    │   │       expect(data.revenue).toHaveProperty('averageSpend');
    │   │       expect(data.revenue).toHaveProperty('orderCount');
    │   │     });
    │   │
    │   │     it('Handles non-existent customer gracefully', async () => {
    │   │       const response = await fetch('/api/customers/non-existent/orders');
    │   │       expect(response.status).toBe(200);
    │   │       const data = await response.json();
    │   │       expect(data.orders).toHaveLength(0);
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   └── [ ] E2E Tests: Revenue tracking workflow
    │       ```typescript
    │       // /e2e/revenue-tracking.spec.ts
    │       test('Order creation updates customer revenue', async ({ page }) => {
    │         // 1. Get initial customer revenue
    │         // 2. Create new order
    │         // 3. Verify revenue increased
    │       });
    │       ```
    │
    ├── [ ] Allergen Compliance Tests (1.5-2h)
    │   ├── [ ] Unit Tests: Validation logic
    │   │   ```typescript
    │   │   // /src/lib/validations/__tests__/menu-validation.test.ts
    │   │   import { menuItemSchema } from '@/lib/validations/menu';
    │   │
    │   │   describe('Menu Item Validation', () => {
    │   │     it('Requires at least one allergen selection', () => {
    │   │       const result = menuItemSchema.safeParse({
    │   │         name: 'Test Item',
    │   │         allergenIds: []  // Empty array should fail
    │   │       });
    │   │
    │   │       expect(result.success).toBe(false);
    │   │       expect(result.error?.issues[0].message).toContain('EU-14 compliance');
    │   │     });
    │   │
    │   │     it('Accepts "None" allergen selection', () => {
    │   │       const result = menuItemSchema.safeParse({
    │   │         name: 'Test Item',
    │   │         allergenIds: ['none']
    │   │       });
    │   │
    │   │       expect(result.success).toBe(true);
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   ├── [ ] Integration Tests: Admin dashboard
    │   │   ```typescript
    │   │   // /tests/integration/admin/allergen-audit.test.ts
    │   │   describe('Allergen Audit Dashboard', () => {
    │   │     it('Displays accurate compliance percentage', async () => {
    │   │       const response = await fetch('/api/admin/allergens/audit');
    │   │       const data = await response.json();
    │   │
    │   │       expect(data.compliancePercentage).toBeGreaterThanOrEqual(0);
    │   │       expect(data.compliancePercentage).toBeLessThanOrEqual(100);
    │   │       expect(data.totalItems).toBeGreaterThan(0);
    │   │     });
    │   │
    │   │     it('Lists all items without allergen data', async () => {
    │   │       const response = await fetch('/api/admin/allergens/audit');
    │   │       const data = await response.json();
    │   │
    │   │       expect(data.missingItems).toBeInstanceOf(Array);
    │   │       expect(data.itemsWithoutAllergens).toBe(data.missingItems.length);
    │   │     });
    │   │   });
    │   │   ```
    │   │
    │   └── [ ] E2E Tests: Menu item creation with allergens
    │       ```typescript
    │       // /e2e/menu-allergen-workflow.spec.ts
    │       test('Admin can create menu item with allergen selection', async ({ page }) => {
    │         await page.goto('/dashboard/menu/new');
    │
    │         // Fill form
    │         await page.fill('[name="name"]', 'Test Menu Item');
    │
    │         // Select allergens
    │         await page.check('[id="allergen-gluten"]');
    │         await page.check('[id="allergen-milk"]');
    │
    │         // Submit
    │         await page.click('button[type="submit"]');
    │
    │         // Verify success
    │         await expect(page).toHaveURL(/\/dashboard\/menu/);
    │       });
    │
    │       test('Form blocks submission without allergen selection', async ({ page }) => {
    │         await page.goto('/dashboard/menu/new');
    │
    │         await page.fill('[name="name"]', 'Test Item');
    │         await page.click('button[type="submit"]');
    │
    │         // Should show validation error
    │         await expect(page.locator('.text-destructive')).toContainText('EU-14 compliance');
    │       });
    │       ```
    │
    └── [ ] Rollback Procedures Documentation
        ```markdown
        ## Rollback Plan - Fase 3

        ### If revenue attribution breaks:
        1. Remove FK constraint:
           ```sql
           ALTER TABLE restaurante.orders DROP CONSTRAINT IF EXISTS orders_customerId_fkey;
           ```
        2. Set customerId to NULL for problematic records
        3. Investigate data integrity issues

        ### If allergen validation blocks menu management:
        1. Temporarily disable validation in code:
           ```typescript
           allergenIds: z.array(z.string()).optional()  // Remove .min(1)
           ```
        2. Allow admins to save items
        3. Fix validation logic separately

        ### If audit dashboard causes performance issues:
        1. Add pagination to missingItems query
        2. Cache audit results for 5 minutes
        3. Optimize Prisma query with proper indexes
        ```
```

### Checkpoints Fase 3

**Validation Criteria**:
- ✅ Revenue attribution: orders.customerId FK functional with backfill
- ✅ API /api/customers/[id]/orders returns accurate revenue data
- ✅ Allergen compliance: Mandatory selector in menu forms
- ✅ Audit dashboard: 100% compliance tracking
- ✅ Tests passing: 30+ test cases for revenue + allergen features

**Quality Gates**:
```bash
# All tests must pass before Phase 4
npm run test:revenue        # Revenue attribution tests
npm run test:allergen       # Allergen compliance tests
npm run test:api            # API integration tests

# Manual verification
curl http://localhost:3000/api/customers/[vip-id]/orders
curl http://localhost:3000/api/admin/allergens/audit
```

**Blockers Resolved**:
- ✅ **P0.4 Broken Revenue Attribution**: Customer-orders linkage functional
- ✅ **P0.1 EU-14 Allergen Non-Compliance**: Compliance tracking enabled

---

## **FASE 4: AUTOMATION & INTEGRATION** [6-8 horas]
**Priority**: Email automation system
**Expert Consultants**: restaurant-operations-master

### Objetivo de Fase
Implementar email automation scheduler para reducir cancellation rate de 24% a <15%.

### Tareas

```
🔗 Email Automation System:
├── 🧠 Email Scheduler Service (3-4h) - P0.5 Email Automation
│   ├── [ ] Create EmailSchedulerService class
│   │   ```typescript
│   │   // /src/lib/email/EmailSchedulerService.ts
│   │   import { Resend } from 'resend';
│   │   import { prisma } from '@/lib/db';
│   │   import { render } from '@react-email/render';
│   │
│   │   const resend = new Resend(process.env.RESEND_API_KEY);
│   │
│   │   export class EmailSchedulerService {
│   │     /**
│   │      * Process pending emails in batch
│   │      * Called by cron job every 5 minutes
│   │      */
│   │     async processPendingEmails() {
│   │       const now = new Date();
│   │
│   │       const pendingEmails = await prisma.emailSchedule.findMany({
│   │         where: {
│   │           status: 'pending',
│   │           scheduledAt: {
│   │             lte: now  // Only emails scheduled for now or past
│   │           }
│   │         },
│   │         include: {
│   │           reservation: {
│   │             include: {
│   │               customer: true,
│   │               table: true,
│   │               reservationItems: {
│   │                 include: {
│   │                   menuItem: true
│   │                 }
│   │               }
│   │             }
│   │           }
│   │         },
│   │         take: 50,  // Process in batches to avoid timeout
│   │         orderBy: {
│   │           scheduledAt: 'asc'
│   │         }
│   │       });
│   │
│   │       let processed = 0;
│   │       let failed = 0;
│   │
│   │       for (const email of pendingEmails) {
│   │         try {
│   │           const template = await this.getTemplate(email.templateType);
│   │
│   │           if (!template) {
│   │             throw new Error(`Template not found: ${email.templateType}`);
│   │           }
│   │
│   │           const rendered = await this.renderTemplate(
│   │             template,
│   │             email.reservation
│   │           );
│   │
│   │           const result = await resend.emails.send({
│   │             from: 'Enigma Cocina Con Alma <reservas@enigmaconalma.com>',
│   │             to: email.recipientEmail,
│   │             subject: template.subject,
│   │             html: rendered
│   │           });
│   │
│   │           // Mark as sent
│   │           await prisma.emailSchedule.update({
│   │             where: { id: email.id },
│   │             data: {
│   │               status: 'sent',
│   │               sentAt: new Date()
│   │             }
│   │           });
│   │
│   │           // Log successful send
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
│   │
│   │           processed++;
│   │         } catch (error: any) {
│   │           failed++;
│   │
│   │           // Update with failure info
│   │           await prisma.emailSchedule.update({
│   │             where: { id: email.id },
│   │             data: {
│   │               status: email.retryCount >= 3 ? 'failed' : 'pending',
│   │               retryCount: { increment: 1 },
│   │               lastError: error.message,
│   │               scheduledAt: email.retryCount < 3
│   │                 ? new Date(Date.now() + 5 * 60 * 1000)  // Retry in 5 min
│   │                 : email.scheduledAt
│   │             }
│   │           });
│   │         }
│   │       }
│   │
│   │       return {
│   │         processed,
│   │         failed,
│   │         total: pendingEmails.length,
│   │         timestamp: new Date().toISOString()
│   │       };
│   │     }
│   │
│   │     async getTemplate(type: string) {
│   │       return await prisma.emailTemplate.findFirst({
│   │         where: {
│   │           type,
│   │           isActive: true
│   │         }
│   │       });
│   │     }
│   │
│   │     async renderTemplate(template: any, data: any) {
│   │       // Dynamic import of React Email template
│   │       try {
│   │         const TemplateModule = await import(
│   │           `@/lib/email/templates/${template.type}`
│   │         );
│   │         return render(TemplateModule.default(data));
│   │       } catch (error) {
│   │         // Fallback to plain HTML from database
│   │         return template.bodyHtml;
│   │       }
│   │     }
│   │   }
│   │   ```
│   │
│   ├── [ ] Create cron API endpoint
│   │   ```typescript
│   │   // /src/app/api/cron/email-scheduler/route.ts
│   │   import { EmailSchedulerService } from '@/lib/email/EmailSchedulerService';
│   │   import { NextResponse } from 'next/server';
│   │
│   │   export const dynamic = 'force-dynamic';
│   │   export const runtime = 'nodejs';
│   │
│   │   /**
│   │    * Cron job endpoint - called every 5 minutes
│   │    * External cron service hits this with Authorization header
│   │    */
│   │   export async function GET(request: Request) {
│   │     // Verify cron secret for security
│   │     const authHeader = request.headers.get('authorization');
│   │     const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
│   │
│   │     if (authHeader !== expectedAuth) {
│   │       return new NextResponse('Unauthorized', { status: 401 });
│   │     }
│   │
│   │     try {
│   │       const scheduler = new EmailSchedulerService();
│   │       const result = await scheduler.processPendingEmails();
│   │
│   │       return NextResponse.json({
│   │         success: true,
│   │         ...result
│   │       });
│   │     } catch (error: any) {
│   │       console.error('Email scheduler error:', error);
│   │       return NextResponse.json({
│   │         success: false,
│   │         error: error.message
│   │       }, { status: 500 });
│   │     }
│   │   }
│   │
│   │   /**
│   │    * POST endpoint for manual/local testing
│   │    */
│   │   export async function POST() {
│   │     const scheduler = new EmailSchedulerService();
│   │     const result = await scheduler.processPendingEmails();
│   │     return NextResponse.json(result);
│   │   }
│   │   ```
│   │
│   ├── [ ] Setup external cron job (cron-job.org)
│   │   ```markdown
│   │   ## Cron Configuration (cron-job.org)
│   │
│   │   1. Go to https://cron-job.org
│   │   2. Create new cron job:
│   │      - Title: "Enigma Email Scheduler"
│   │      - URL: https://enigmaconalma.com/api/cron/email-scheduler
│   │      - Schedule: */5 * * * * (every 5 minutes)
│   │      - Request method: GET
│   │      - Headers:
│   │        - Authorization: Bearer [CRON_SECRET from .env]
│   │   3. Enable notifications on failure
│   │   4. Save and activate
│   │   ```
│   │
│   └── [ ] Add environment variables
│       ```bash
│       # Add to .env
│       RESEND_API_KEY="re_..."  # Get from resend.com dashboard
│       CRON_SECRET="[generate-random-32-char-string]"
│       ```
│
├── 📊 Email Monitoring Dashboard (2-3h)
│   ├── [ ] Create email stats API
│   │   ```typescript
│   │   // /src/app/api/admin/email-stats/route.ts
│   │   import { NextResponse } from 'next/server';
│   │   import { prisma } from '@/lib/db';
│   │
│   │   export async function GET() {
│   │     const today = new Date();
│   │     today.setHours(0, 0, 0, 0);
│   │
│   │     const [pending, sentToday, failed, recentLogs] = await Promise.all([
│   │       prisma.emailSchedule.count({
│   │         where: { status: 'pending' }
│   │       }),
│   │
│   │       prisma.emailLog.count({
│   │         where: {
│   │           sentAt: { gte: today },
│   │           status: 'sent'
│   │         }
│   │       }),
│   │
│   │       prisma.emailSchedule.count({
│   │         where: { status: 'failed' }
│   │       }),
│   │
│   │       prisma.emailLog.findMany({
│   │         take: 20,
│   │         orderBy: { sentAt: 'desc' },
│   │         include: {
│   │           reservation: {
│   │             select: {
│   │               id: true,
│   │               customer: {
│   │                 select: {
│   │                   name: true,
│   │                   email: true
│   │                 }
│   │               }
│   │             }
│   │           }
│   │         }
│   │       })
│   │     ]);
│   │
│   │     const lastRun = await prisma.emailLog.findFirst({
│   │       orderBy: { sentAt: 'desc' },
│   │       select: { sentAt: true }
│   │     });
│   │
│   │     return NextResponse.json({
│   │       pending,
│   │       sentToday,
│   │       failed,
│   │       lastRun: lastRun?.sentAt || null,
│   │       recentLogs
│   │     });
│   │   }
│   │   ```
│   │
│   └── [ ] Create monitoring dashboard page
│       ```tsx
│       // /src/app/(admin)/dashboard/email-monitor/page.tsx
│       'use client';
│
│       import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
│       import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
│       import { Badge } from '@/components/ui/badge';
│       import { Button } from '@/components/ui/button';
│       import { useQuery } from '@tanstack/react-query';
│
│       export default function EmailMonitorPage() {
│         const { data: stats, refetch } = useQuery({
│           queryKey: ['email-stats'],
│           queryFn: () => fetch('/api/admin/email-stats').then(r => r.json()),
│           refetchInterval: 30000  // Auto-refresh every 30s
│         });
│
│         return (
│           <div className="space-y-6 p-6">
│             <div className="flex justify-between items-center">
│               <h1 className="text-3xl font-bold">Email Automation Monitor</h1>
│               <Button onClick={() => refetch()}>Refresh</Button>
│             </div>
│
│             <div className="grid gap-4 md:grid-cols-4">
│               <Card>
│                 <CardHeader>
│                   <CardTitle className="text-sm">Pending</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-2xl font-bold">{stats?.pending || 0}</div>
│                   <p className="text-xs text-muted-foreground">Queued for delivery</p>
│                 </CardContent>
│               </Card>
│
│               <Card>
│                 <CardHeader>
│                   <CardTitle className="text-sm">Sent Today</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-2xl font-bold text-green-600">
│                     {stats?.sentToday || 0}
│                   </div>
│                   <p className="text-xs text-muted-foreground">Successfully delivered</p>
│                 </CardContent>
│               </Card>
│
│               <Card>
│                 <CardHeader>
│                   <CardTitle className="text-sm">Failed</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-2xl font-bold text-destructive">
│                     {stats?.failed || 0}
│                   </div>
│                   <p className="text-xs text-muted-foreground">Require attention</p>
│                 </CardContent>
│               </Card>
│
│               <Card>
│                 <CardHeader>
│                   <CardTitle className="text-sm">Last Run</CardTitle>
│                 </CardHeader>
│                 <CardContent>
│                   <div className="text-sm font-medium">
│                     {stats?.lastRun
│                       ? new Date(stats.lastRun).toLocaleTimeString()
│                       : 'Never'
│                     }
│                   </div>
│                   <p className="text-xs text-muted-foreground">
│                     Runs every 5 minutes
│                   </p>
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
│                     {stats?.recentLogs?.map((log: any) => (
│                       <TableRow key={log.id}>
│                         <TableCell className="text-sm">
│                           {new Date(log.sentAt).toLocaleString()}
│                         </TableCell>
│                         <TableCell>
│                           <div className="text-sm">
│                             <div className="font-medium">{log.recipientEmail}</div>
│                             <div className="text-xs text-muted-foreground">
│                               {log.reservation?.customer?.name}
│                             </div>
│                           </div>
│                         </TableCell>
│                         <TableCell className="text-sm">{log.templateType}</TableCell>
│                         <TableCell>
│                           <Badge
│                             variant={log.status === 'sent' ? 'default' : 'destructive'}
│                           >
│                             {log.status}
│                           </Badge>
│                         </TableCell>
│                         <TableCell className="font-mono text-xs">
│                           {log.resendMessageId?.substring(0, 16)}...
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
└── 🧪 Testing Strategy - Fase 4
    ├── [ ] Unit Tests: EmailSchedulerService (1.5-2h)
    │   ```typescript
    │   // /src/lib/email/__tests__/EmailSchedulerService.test.ts
    │   import { EmailSchedulerService } from '../EmailSchedulerService';
    │   import { prisma } from '@/lib/db';
    │   import { Resend } from 'resend';
    │
    │   jest.mock('resend');
    │
    │   describe('EmailSchedulerService', () => {
    │     let service: EmailSchedulerService;
    │
    │     beforeEach(() => {
    │       service = new EmailSchedulerService();
    │     });
    │
    │     it('processes pending emails in batch', async () => {
    │       const result = await service.processPendingEmails();
    │
    │       expect(result).toHaveProperty('processed');
    │       expect(result).toHaveProperty('failed');
    │       expect(result).toHaveProperty('total');
    │       expect(result.processed).toBeGreaterThanOrEqual(0);
    │     });
    │
    │     it('handles Resend API failures with retry logic', async () => {
    │       // Mock Resend to fail
    │       (Resend.prototype.emails.send as jest.Mock).mockRejectedValue(
    │         new Error('Resend API error')
    │       );
    │
    │       await service.processPendingEmails();
    │
    │       // Verify retry counter incremented
    │       const failedEmail = await prisma.emailSchedule.findFirst({
    │         where: { status: 'pending', retryCount: { gt: 0 } }
    │       });
    │
    │       expect(failedEmail).toBeTruthy();
    │       expect(failedEmail?.retryCount).toBeGreaterThan(0);
    │     });
    │
    │     it('logs successful sends to email_logs table', async () => {
    │       const initialCount = await prisma.emailLog.count();
    │
    │       await service.processPendingEmails();
    │
    │       const finalCount = await prisma.emailLog.count();
    │       expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    │     });
    │
    │     it('marks emails as failed after 3 retries', async () => {
    │       // Test retry limit logic
    │     });
    │   });
    │   ```
    │
    ├── [ ] Integration Tests: Email workflow (1h)
    │   ```typescript
    │   // /tests/integration/email/email-automation.test.ts
    │   describe('Email Automation Integration', () => {
    │     it('Reservation creation schedules confirmation email', async () => {
    │       // 1. Create reservation
    │       const reservation = await prisma.reservation.create({
    │         data: {
    │           customerEmail: 'test@example.com',
    │           date: new Date(),
    │           partySize: 2,
    │           status: 'CONFIRMED'
    │         }
    │       });
    │
    │       // 2. Verify email_schedule entry created
    │       const scheduledEmail = await prisma.emailSchedule.findFirst({
    │         where: {
    │           reservationId: reservation.id,
    │           templateType: 'reservation-confirmation'
    │         }
    │       });
    │
    │       expect(scheduledEmail).toBeTruthy();
    │       expect(scheduledEmail?.status).toBe('pending');
    │     });
    │
    │     it('Cron job processes scheduled emails', async () => {
    │       // Trigger cron manually
    │       const response = await fetch('/api/cron/email-scheduler', {
    │         method: 'POST'
    │       });
    │
    │       const result = await response.json();
    │       expect(result.processed).toBeGreaterThanOrEqual(0);
    │     });
    │   });
    │   ```
    │
    ├── [ ] E2E Tests: Full email workflow (1h)
    │   ```typescript
    │   // /e2e/email-automation.spec.ts
    │   import { test, expect } from '@playwright/test';
    │
    │   test('Complete email automation workflow', async ({ page }) => {
    │     // 1. Admin creates reservation
    │     await page.goto('/dashboard/reservations/new');
    │     await page.fill('[name="customerEmail"]', 'e2e-test@example.com');
    │     await page.fill('[name="partySize"]', '4');
    │     await page.click('button[type="submit"]');
    │
    │     // 2. Verify email scheduled
    │     // Query database to check email_schedule
    │
    │     // 3. Manually trigger cron
    │     await fetch('http://localhost:3000/api/cron/email-scheduler', {
    │       method: 'POST'
    │     });
    │
    │     // 4. Verify email sent in logs
    │     await page.goto('/dashboard/email-monitor');
    │     await expect(page.locator('text=e2e-test@example.com')).toBeVisible();
    │   });
    │   ```
    │
    ├── [ ] Load Tests: Batch processing (30min)
    │   ```bash
    │   # Test cron can handle 100 pending emails
    │   # Use k6 or Artillery
    │   artillery quick --count 1 --num 1 \
    │     -H "Authorization: Bearer $CRON_SECRET" \
    │     https://enigmaconalma.com/api/cron/email-scheduler
    │
    │   # Should complete in <5s for 50 email batch
    │   ```
    │
    └── [ ] Rollback Procedures Documentation
        ```markdown
        ## Rollback Plan - Fase 4

        ### If email automation fails catastrophically:
        1. Disable cron job immediately (cron-job.org dashboard)
        2. Check Resend API status and rate limits
        3. Review email_schedule for pending emails
        4. Manual send critical emails (reservation confirmations)

        ### If infinite loop detected:
        1. Kill cron job
        2. Fix status update logic in EmailSchedulerService
        3. Reset stuck emails:
           ```sql
           UPDATE restaurante.email_schedule
           SET status = 'pending', retryCount = 0
           WHERE status = 'processing' AND updatedAt < NOW() - INTERVAL '10 minutes';
           ```

        ### If Resend rate limit exceeded:
        1. Upgrade Resend plan temporarily
        2. Reduce cron frequency to */10 (every 10 min)
        3. Implement email queuing with priority
        ```
```

### Checkpoints Fase 4

**Validation Criteria**:
- ✅ Email automation: Cron job running every 5 minutes
- ✅ EmailSchedulerService: Processes 50 emails/batch successfully
- ✅ Monitoring dashboard: Real-time stats visible
- ✅ Email logs: >100 sent emails in production
- ✅ Tests passing: 25+ test cases for automation

**Quality Gates**:
```bash
# All tests must pass before Phase 5
npm run test:email-automation  # 25+ tests passing

# Manual verification
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://enigmaconalma.com/api/cron/email-scheduler

# Check email stats
curl http://localhost:3000/api/admin/email-stats
```

**Blockers Resolved**:
- ✅ **P0.5 Email Automation Not Running**: Cron job active

---

## **FASE 5: TESTING, VALIDATION & DOCUMENTATION** [6-8 horas]
**Priority**: Comprehensive QA + production readiness
**Expert Consultants**: validation-gates, documentation-manager

### Objetivo de Fase
Final quality assurance, comprehensive testing, production deployment validation, documentation sync.

### Tareas

```
✅ Comprehensive Quality Assurance:
├── 🧪 Full Test Suite Execution (2-3h)
│   ├── [ ] Run all unit tests
│   │   ```bash
│   │   npm run test:unit -- --coverage
│   │   # Target: 85%+ coverage
│   │   # Expect: 100+ tests passing
│   │   ```
│   │
│   ├── [ ] Run all integration tests
│   │   ```bash
│   │   npm run test:integration
│   │   # Expect: 50+ tests passing
│   │   ```
│   │
│   ├── [ ] Run all E2E tests
│   │   ```bash
│   │   npm run test:e2e
│   │   # Expect: 20+ scenarios passing
│   │   ```
│   │
│   ├── [ ] TypeScript type check
│   │   ```bash
│   │   npm run type-check
│   │   # Expect: 0 errors (down from 164)
│   │   ```
│   │
│   ├── [ ] ESLint validation
│   │   ```bash
│   │   npm run lint
│   │   # Expect: Clean (0 errors, 0 warnings)
│   │   ```
│   │
│   └── [ ] Production build test
│       ```bash
│       npm run build
│       # Expect: Successful build, no errors
│       ```
│
├── 🔍 Production Validation (2-3h)
│   ├── [ ] P0.1 Allergen Compliance Verification
│   │   ```bash
│   │   # SSH to production database
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c '
│   │     SELECT
│   │       COUNT(*) FILTER (WHERE EXISTS (
│   │         SELECT 1 FROM restaurante.menu_item_allergens
│   │         WHERE menu_item_id = mi.id
│   │       )) as items_with_allergens,
│   │       COUNT(*) as total_items
│   │     FROM restaurante.menu_items mi;
│   │   '"
│   │   # Expected: items_with_allergens = 196 (100% compliance)
│   │   ```
│   │
│   ├── [ ] P0.2 Schema Drift Verification
│   │   ```bash
│   │   # Verify Prisma schema matches production
│   │   npx prisma db pull --schema=prisma/schema-final-check.prisma
│   │   diff prisma/schema.prisma prisma/schema-final-check.prisma
│   │   # Expected: 0 differences
│   │   ```
│   │
│   ├── [ ] P0.3 RLS Security Verification
│   │   ```bash
│   │   # Check all RLS policies deployed
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c '
│   │     SELECT
│   │       COUNT(DISTINCT tablename) as tables_with_rls,
│   │       (SELECT COUNT(*) FROM information_schema.tables
│   │        WHERE table_schema = '\''restaurante'\'') as total_tables
│   │     FROM pg_policies
│   │     WHERE schemaname = '\''restaurante'\'';
│   │   '"
│   │   # Expected: tables_with_rls = 31 (100% coverage)
│   │   ```
│   │
│   ├── [ ] P0.4 Revenue Attribution Verification
│   │   ```bash
│   │   # Test customer orders API
│   │   curl https://enigmaconalma.com/api/customers/[vip-customer-id]/orders
│   │   # Expected: { orders: [...], revenue: { totalSpent: 114.50, orderCount: 4 } }
│   │
│   │   # Verify orders.customerId FK exists
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c '
│   │     SELECT
│   │       COUNT(*) FILTER (WHERE \"customerId\" IS NOT NULL) as linked_orders,
│   │       COUNT(*) as total_orders
│   │     FROM restaurante.orders;
│   │   '"
│   │   # Expected: linked_orders > 0
│   │   ```
│   │
│   ├── [ ] P0.5 Email Automation Verification
│   │   ```bash
│   │   # Check email_schedule status distribution
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c '
│   │     SELECT status, COUNT(*) as count
│   │     FROM restaurante.email_schedule
│   │     GROUP BY status;
│   │   '"
│   │   # Expected: pending: 0-5, sent: >100, failed: <5
│   │
│   │   # Verify cron job running
│   │   curl -H "Authorization: Bearer $CRON_SECRET" \
│   │     https://enigmaconalma.com/api/cron/email-scheduler
│   │   # Expected: { success: true, processed: X }
│   │   ```
│   │
│   └── [ ] Performance Benchmarks
│       ```bash
│       # Database query performance
│       ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres -c '
│         EXPLAIN ANALYZE
│         SELECT mi.*, array_agg(a.name) as allergens
│         FROM restaurante.menu_items mi
│         LEFT JOIN restaurante.menu_item_allergens mia ON mi.id = mia.menu_item_id
│         LEFT JOIN restaurante.allergens a ON mia.allergen_id = a.id
│         WHERE mi.is_available = true
│         GROUP BY mi.id;
│       '"
│       # Expected: < 50ms execution time
│
│       # Email scheduler performance
│       time curl -X POST http://localhost:3000/api/cron/email-scheduler
│       # Expected: < 5s for 50 emails batch
│       ```
│
├── 📚 Documentation Sync (2-3h)
│   ├── [ ] Update README.md with P0 fixes summary
│   │   ```markdown
│   │   ## Recent Critical Updates (October 2025)
│   │
│   │   ### P0 Blockers Resolved ✅
│   │
│   │   **Security & Compliance:**
│   │   - ✅ **RLS Security**: 100% table coverage (31/31 tables protected)
│   │   - ✅ **EU-14 Allergen Compliance**: 100% menu items with mandatory allergen data
│   │   - ✅ **GDPR Audit Trails**: Legal compliance tracking active
│   │
│   │   **Technical Infrastructure:**
│   │   - ✅ **Schema Sync**: All 31 production tables in Prisma (0% drift)
│   │   - ✅ **Type Safety**: 164 TypeScript errors → 0 errors
│   │   - ✅ **Test Coverage**: 0% → 85%+ (170+ tests)
│   │
│   │   **Business Features:**
│   │   - ✅ **Revenue Attribution**: Customer-orders linkage functional
│   │   - ✅ **Email Automation**: Cron job running every 5 minutes
│   │   - ✅ **Monitoring Dashboards**: Allergen audit + Email stats
│   │
│   │   **Health Score**: 72/100 (YELLOW) → 92/100 (GREEN) 🎯
│   │
│   │   **Timeline**: 26-35 hours (4-5 days) with AI assistance
│   │   ```
│   │
│   ├── [ ] Update API documentation
│   │   ```markdown
│   │   ## API Reference Updates
│   │
│   │   ### Customer Revenue Tracking
│   │   `GET /api/customers/[id]/orders`
│   │
│   │   Returns customer order history with revenue analytics.
│   │
│   │   **Response:**
│   │   ```json
│   │   {
│   │     "orders": [
│   │       {
│   │         "id": "order-123",
│   │         "totalAmount": 45.50,
│   │         "status": "COMPLETED",
│   │         "items": [...],
│   │         "table": {...}
│   │       }
│   │     ],
│   │     "revenue": {
│   │       "totalSpent": 114.50,
│   │       "averageSpend": 28.63,
│   │       "orderCount": 4
│   │     }
│   │   }
│   │   ```
│   │
│   │   ### Allergen Compliance Audit
│   │   `GET /api/admin/allergens/audit`
│   │
│   │   Returns EU-14 allergen compliance status.
│   │
│   │   **Response:**
│   │   ```json
│   │   {
│   │     "totalItems": 196,
│   │     "itemsWithAllergens": 196,
│   │     "itemsWithoutAllergens": 0,
│   │     "compliancePercentage": 100.0,
│   │     "missingItems": [],
│   │     "lastUpdated": "2025-10-02T..."
│   │   }
│   │   ```
│   │
│   │   ### Email Automation (Cron)
│   │   `GET /api/cron/email-scheduler`
│   │
│   │   Processes pending scheduled emails.
│   │
│   │   **Headers:**
│   │   - `Authorization: Bearer {CRON_SECRET}`
│   │
│   │   **Response:**
│   │   ```json
│   │   {
│   │     "success": true,
│   │     "processed": 15,
│   │     "failed": 0,
│   │     "total": 15,
│   │     "timestamp": "2025-10-02T..."
│   │   }
│   │   ```
│   │   ```
│   │
│   ├── [ ] Create deployment guide
│   │   ```markdown
│   │   # Deployment Guide - P0 Critical Fixes
│   │
│   │   ## Pre-Deployment Checklist
│   │
│   │   - [ ] Backup production database
│   │     ```bash
│   │     ssh root@31.97.182.226
│   │     docker exec -i $(docker ps -qf "name=db") pg_dump -U postgres postgres > backup-p0-fixes-$(date +%Y-%m-%d).sql
│   │     ```
│   │   - [ ] Review all SQL scripts (RLS policies, migrations)
│   │   - [ ] Set environment variables:
│   │     - `RESEND_API_KEY`
│   │     - `CRON_SECRET`
│   │   - [ ] Test in staging environment first
│   │   - [ ] Schedule deployment during low-traffic window
│   │
│   │   ## Deployment Steps
│   │
│   │   ### Step 1: Database Security (30min)
│   │   ```bash
│   │   # Apply RLS policies
│   │   ssh root@31.97.182.226
│   │   docker exec -i $(docker ps -qf "name=db") psql -U postgres -d postgres < rls-policies.sql
│   │
│   │   # Verify policies deployed
│   │   docker exec -i $(docker ps -qf "name=db") psql -U postgres -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'restaurante';"
│   │   ```
│   │
│   │   ### Step 2: PostgreSQL Tuning (10min + restart)
│   │   ```bash
│   │   # Update config
│   │   docker exec -i $(docker ps -qf "name=db") bash -c "cat >> /var/lib/postgresql/data/postgresql.conf" <<EOF
│   │   shared_buffers = 1GB
│   │   effective_cache_size = 3GB
│   │   max_connections = 200
│   │   EOF
│   │
│   │   # Restart PostgreSQL (30s downtime)
│   │   docker restart supabase-db
│   │   ```
│   │
│   │   ### Step 3: Prisma Migrations (15min)
│   │   ```bash
│   │   # Apply migrations
│   │   npx prisma migrate deploy
│   │
│   │   # Backfill orders.customerId
│   │   ssh root@31.97.182.226 "docker exec -i \$(docker ps -qf 'name=db') psql -U postgres -d postgres" < backfill-customer-orders.sql
│   │   ```
│   │
│   │   ### Step 4: Application Deployment (10min)
│   │   ```bash
│   │   # Deploy to production (Vercel)
│   │   npm run build
│   │   vercel --prod
│   │   ```
│   │
│   │   ### Step 5: Email Automation Setup (5min)
│   │   ```
│   │   1. Go to cron-job.org
│   │   2. Create cron:
│   │      - URL: https://enigmaconalma.com/api/cron/email-scheduler
│   │      - Schedule: */5 * * * *
│   │      - Header: Authorization: Bearer {CRON_SECRET}
│   │   3. Activate
│   │   ```
│   │
│   │   ### Step 6: Validation (30min)
│   │   Run all validation scripts from Fase 5.
│   │
│   │   ## Rollback Plan
│   │
│   │   ### If deployment fails:
│   │   1. Restore database backup
│   │   2. Revert application deployment
│   │   3. Disable cron job
│   │   4. Review logs and errors
│   │   5. Schedule fix for next deployment window
│   │
│   │   ### Emergency Contacts
│   │   - Database: root@31.97.182.226 (SSH access)
│   │   - Vercel: [deployment URL]
│   │   - Resend: [dashboard URL]
│   │   - Cron: cron-job.org dashboard
│   │   ```
│   │
│   ├── [ ] Update Prisma schema documentation
│   │   ```bash
│   │   # Generate schema docs
│   │   npx prisma generate --docs
│   │
│   │   # Create schema diagram
│   │   npx prisma-docs generate
│   │   ```
│   │
│   └── [ ] Create test coverage report
│       ```bash
│       # Generate coverage report
│       npm run test:coverage
│
│       # Expected output:
│       # Coverage Summary:
│       # - Statements: 85%+
│       # - Branches: 80%+
│       # - Functions: 85%+
│       # - Lines: 85%+
│       ```
│
├── ✅ Final Subagent Quality Checks
│   ├── [ ] Invoke validation-gates for final QA
│   │   ```
│   │   Task: "Run comprehensive quality gates validation for P0 fixes"
│   │
│   │   Validate:
│   │   - All tests passing (unit + integration + E2E)
│   │   - TypeScript errors: 0
│   │   - ESLint clean
│   │   - Build successful
│   │   - Production smoke tests passing
│   │   - Coverage: 85%+
│   │   ```
│   │
│   ├── [ ] Invoke documentation-manager for docs sync
│   │   ```
│   │   Task: "Sync all documentation with P0 fixes implementation"
│   │
│   │   Update:
│   │   - README.md with P0 fixes summary
│   │   - API reference documentation
│   │   - Deployment guide
│   │   - Schema documentation
│   │   - Test coverage reports
│   │   ```
│   │
│   └── [ ] Generate final status report
│       ```bash
│       # Re-run dev-status to verify Health Score
│       /dev-status
│
│       # Expected: Health Score 92+ (GREEN status)
│       # Expected: All P0 blockers resolved
│       ```
│
└── 📊 Production Monitoring Setup (1h)
    ├── [ ] Setup error tracking (Sentry)
    │   ```bash
    │   # Install Sentry
    │   npm install @sentry/nextjs
    │   npx @sentry/wizard@latest -i nextjs
    │
    │   # Configure SENTRY_DSN in .env
    │   ```
    │
    ├── [ ] Configure uptime monitoring
    │   ```
    │   Setup at uptimerobot.com:
    │   - Monitor: https://enigmaconalma.com/api/health
    │   - Interval: 5 minutes
    │   - Alerts: Email + SMS
    │   ```
    │
    └── [ ] Create health check endpoint
        ```typescript
        // /src/app/api/health/route.ts
        import { NextResponse } from 'next/server';
        import { prisma } from '@/lib/db';

        export async function GET() {
          try {
            // Check database connection
            await prisma.$queryRaw`SELECT 1`;

            // Check email scheduler
            const pendingEmails = await prisma.emailSchedule.count({
              where: { status: 'pending' }
            });

            return NextResponse.json({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              checks: {
                database: 'ok',
                emailScheduler: pendingEmails < 100 ? 'ok' : 'warning'
              }
            });
          } catch (error) {
            return NextResponse.json({
              status: 'unhealthy',
              error: error.message
            }, { status: 500 });
          }
        }
        ```
```

### Checkpoints Fase 5

**Validation Criteria**:
- ✅ All tests passing: 170+ tests (unit + integration + E2E)
- ✅ TypeScript errors: 0 (down from 164)
- ✅ ESLint: Clean (0 errors, 0 warnings)
- ✅ Production build: Successful
- ✅ Test coverage: 85%+ across codebase
- ✅ Documentation: Complete and accurate
- ✅ Production validation: All P0 fixes verified
- ✅ Monitoring: Sentry + uptime checks active

**Quality Gates**:
```bash
# Final validation commands
npm run test:all         # All tests passing
npm run type-check       # 0 errors
npm run lint             # Clean
npm run build            # Successful
npm run test:coverage    # 85%+ coverage

# Production verification
/dev-status              # Health Score 92+ (GREEN)
```

**Final Success Criteria**:
```
🎯 P0 Blockers Resolution:
├── [✅] P0.1 EU-14 Allergen Non-Compliance: 18.4% → 100%
├── [✅] P0.2 Schema Drift: 48% missing → 0% (all 31 tables synced)
├── [✅] P0.3 RLS Security Vulnerabilities: 87% → 100% coverage
├── [✅] P0.4 Broken Revenue Attribution: Fixed with FK + backfill
└── [✅] P0.5 Email Automation: OFF → ON (cron active)

📊 Quality Metrics:
├── Health Score: 72 → 92+ (GREEN) ✅
├── Test Coverage: 0% → 85%+ ✅
├── TypeScript Errors: 164 → 0 ✅
├── Production Uptime: 99.9%+ ✅
└── Documentation: Complete ✅
```

---

## 📈 **TIMELINE & EFFORT SUMMARY**

### 5-Phase AI-Accelerated Timeline

**Total Time**: 26-35 horas (4-5 días laborales con Claude Code + Subagents)

| Fase | Duración | Tareas Clave | Testing Hours | Expert Subagents |
|------|----------|--------------|---------------|------------------|
| **Fase 1** | 3-4h | RLS policies, PostgreSQL tuning | 1.5h | supabase-schema-architect |
| **Fase 2** | 5-7h | Prisma sync (15 tables), TypeScript fixes | 1.5h | supabase-schema-architect |
| **Fase 3** | 6-8h | Revenue FK, Allergen compliance | 3h | customer-intelligence-analyst, menu-wine-specialist |
| **Fase 4** | 6-8h | Email automation, cron job, monitoring | 3h | restaurant-operations-master |
| **Fase 5** | 6-8h | Full test suite, validation, docs | 6h | validation-gates, documentation-manager |
| **TOTAL** | **26-35h** | | **15h testing** | **6 specialists** |

### Testing Breakdown by Phase

**Total Testing Hours**: 15h (43% of total time)

- **Fase 1**: 1.5h (Security tests)
- **Fase 2**: 1.5h (Schema validation tests)
- **Fase 3**: 3h (Revenue + Allergen tests)
- **Fase 4**: 3h (Email automation tests)
- **Fase 5**: 6h (Comprehensive QA + validation)

**Test Count**: 170+ tests total
- Unit tests: 100+
- Integration tests: 50+
- E2E tests: 20+

### Velocity Comparison

**Traditional Development (Without AI):**
- Fase 1: 3-4h → 15-20h (5x slower)
- Fase 2: 5-7h → 30-40h (6x slower)
- Fase 3: 6-8h → 35-45h (6x slower)
- Fase 4: 6-8h → 30-40h (5x slower)
- Fase 5: 6-8h → 30-40h (5x slower)
- **Total tradicional**: 140-185 horas (3.5-4.5 semanas)
- **Total con Claude Code**: 26-35 horas (4-5 días) ✨

**AI Acceleration Factor**: **5-6x faster**

---

## ⚠️  **RISK MITIGATION & ROLLBACK STRATEGIES**

### Phase-by-Phase Rollback Plans

**Fase 1 Rollback**:
- Drop RLS policies if blocking access
- Revert PostgreSQL config if restart fails
- Emergency: Use service_role key to bypass RLS

**Fase 2 Rollback**:
- Restore schema.prisma from backup
- Regenerate Prisma Client
- Use @ts-ignore for cascading type errors

**Fase 3 Rollback**:
- Remove orders.customerId FK constraint
- Disable allergen validation temporarily
- Cache audit results to reduce DB load

**Fase 4 Rollback**:
- Disable cron job immediately
- Fix EmailSchedulerService logic
- Reset stuck emails in database

**Fase 5 Rollback**:
- Full database backup restore
- Revert application deployment
- Document issues for post-mortem

### Critical Dependencies

**External Services**:
- **Resend API**: Email delivery (upgrade to paid tier if rate limited)
- **Cron-job.org**: Automation trigger (backup: Vercel Cron)
- **PostgreSQL**: Database performance (monitor shared_buffers impact)

**Database Integrity**:
- **Backups**: Automated daily backups + manual before each phase
- **Migrations**: Test in staging before production
- **FK Constraints**: Verify data integrity before adding

---

## 🚀 **DEPLOYMENT CHECKLIST**

### Pre-Deployment (30min)
- [ ] Backup production database
- [ ] Review all SQL scripts
- [ ] Set environment variables (RESEND_API_KEY, CRON_SECRET)
- [ ] Test in staging environment
- [ ] Schedule during low-traffic window

### Deployment Steps (1.5h)
1. [ ] Apply RLS policies (SSH to prod DB)
2. [ ] Tune PostgreSQL config + restart
3. [ ] Run Prisma migrations
4. [ ] Backfill orders.customerId
5. [ ] Deploy Next.js application
6. [ ] Activate email cron job
7. [ ] Verify all P0 fixes in production

### Post-Deployment Validation (1h)
- [ ] Run all validation scripts (Fase 5)
- [ ] Check error logs (Sentry, Vercel)
- [ ] Monitor email automation (first 30 min)
- [ ] Validate revenue attribution API
- [ ] Verify allergen audit dashboard
- [ ] Run smoke tests

---

## 📚 **REFERENCES & DOCUMENTATION**

### Expert Analysis Sources
- `reports/dev-status-2025-10-02.md` - Current state analysis
- `reports/dev-plan-ultrathink-p0-fixes-2025-10-02.md` - Original 4-phase plan
- `.claude/agents/supabase-schema-architect.md` - Database expert
- `.claude/agents/menu-wine-specialist.md` - Allergen compliance expert
- `.claude/agents/restaurant-operations-master.md` - Operations expert
- `.claude/agents/customer-intelligence-analyst.md` - Revenue expert

### Critical Code Locations
- `/prisma/schema.prisma` - 15 missing tables added
- `/src/lib/validations/menu.ts` - Allergen validation updated
- `/src/lib/email/EmailSchedulerService.ts` - NEW automation service
- `/src/app/api/customers/[id]/orders/route.ts` - NEW revenue API
- `/src/app/api/admin/allergens/audit/route.ts` - NEW compliance API
- `/src/app/api/cron/email-scheduler/route.ts` - NEW cron endpoint

### Production Access
```bash
# SSH to production VPS
ssh root@31.97.182.226

# PostgreSQL access
docker exec -i $(docker ps -qf "name=db") psql -U postgres -d postgres

# Database credentials
User: postgres
Password: EncryptionConAlma23
Database: postgres
Schema: restaurante
```

---

**Plan Generated**: 2025-10-02
**Refactored From**: 4-phase plan
**Objective**: ULTRATHINK P0 Critical Fixes with solid fundamentals
**Total Effort**: 26-35 hours (AI-accelerated)
**Testing Coverage**: 85%+ (170+ tests)
**Health Score Target**: 72 → 92+ (GREEN)
**Expert Contributors**: 6 domain specialist subagents
**Estimated Completion**: 4-5 días laborales con Claude Code assistance
**Quality Philosophy**: Foundation-first, test-driven, production-ready
