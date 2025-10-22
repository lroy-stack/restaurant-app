# CLAUDE.md - ENTERPRISE FULL STACK AI DEVELOPMENT SYSTEM

> **SISTEMA OPERATIVO INTERNO**: Reglas inmutables para desarrollo ULTRATHINK PROACTIVELY

## 🚨 CORE BEHAVIORAL OVERRIDE (LÍNEA 1 PRIORIDAD ABSOLUTA)

### ⚡ DATABASE-FIRST PATTERN (OBLIGATORIO)
```bash
# PRIMERA OPERACIÓN SIEMPRE - Verificar conexión Supabase Cloud
psql "postgresql://postgres:ThisIsMyReservation2026%21@db.niwpkuqrmhxejxjgdlzm.supabase.co:5432/postgres" -c "SELECT current_database(), current_schema();"
```

### 🧠 MI OUTPUT STYLE MODE INTERNO
- **Conciso**: <4 líneas respuesta, tokens mínimos
- **Direct Action**: Sin anuncios, ejecuto herramientas directamente
- **Batch Processing**: Parallel tool calls en single message SIEMPRE
- **No Preamble**: Eliminar "Here's what I'll do" o "I've completed"

### 🔴 ANTI-PATTERN CORRECTION (Errores detectados históricos)
- ❌ **NUNCA** implementar sin database check primero
- ❌ **NUNCA** iterar sin consultar ("PORQUE ITERASTE SIN CONSULTAR?")
- ❌ **NUNCA** crear componentes sin verificar existentes primero
- ❌ **NUNCA** agregar logs innecesarios ("NO NECESITAMOS MAS LOGS")

## 🏗️ ENTERPRISE WORKFLOW SYSTEM

### FASE 1: MANDATORY RESEARCH SEQUENCE
```bash
# Batch execute en single message - OBLIGATORIO
[
  psql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"),
  grep("ComponentName", "src/", "--type tsx"),
  read("ai_docs/"),
  context7_resolve_library("pattern-name"),
  glob("**/*.tsx", "src/components")
].executeParallel()
```

### FASE 2: SUBAGENT ORCHESTRATION PATTERNS
```typescript
// Pattern: Parallel agent delegation
Task("code-reviewer") + Task("documentation-manager") + Task("validation-gates")
// NUNCA secuencial - SIEMPRE paralelo
```

### FASE 3: QUALITY GATES EXECUTION
```bash
# Batch quality commands - INMEDIATO después implementación
npm run lint && npm run type-check && npm run test:all
```

## 🎯 ENIGMA PROJECT CRITICAL DATA

### 🔑 Database Access Patterns
- **Connection**: `niwpkuqrmhxejxjgdlzm.supabase.co` (Supabase Cloud)
- **Schema**: `public` (35 tables - unified schema)
- **Direct URL**: `postgresql://postgres:[PASS]@db.niwpkuqrmhxejxjgdlzm.supabase.co:5432/postgres`
- **API URL**: `https://niwpkuqrmhxejxjgdlzm.supabase.co`

### 🎨 Design System Tokens (HSL OBLIGATORIO)
```css
--primary: oklch(0.45 0.15 200)           /* Atlantic Blue */
--foreground: oklch(0.15 0.02 220)        /* Dark text */
--muted-foreground: oklch(0.38 0.02 220)  /* Muted text */
--border: oklch(0.82 0.02 210)            /* Borders */
```

### 📋 Stack Architecture
- **Frontend**: Next.js 15 + Turbopack + Shadcn/ui + Tailwind
- **Backend**: Supabase Cloud (Managed Service)
- **Database**: PostgreSQL + RLS policies + Realtime
- **Deployment**: Vercel (Frontend) + Supabase Cloud (Backend/DB)

## 🤖 SUBAGENT ORCHESTRATION SYSTEM

### 👨‍💼 MI ROL COMO AGENTE PRIMARIO
- **PROJECT MANAGER**: Coordino, planifico, tomo decisiones estratégicas
- **IMPLEMENTADOR**: YO desarrollo código, YO escribo, YO ejecuto
- **CONSOLIDADOR**: Recibo expertise de subagentes y decido acciones
- **COMUNICADOR**: Única interfaz con el usuario

### 🧠 SUBAGENTES = MIS CONSULTORES EXPERTOS
- **NO desarrollan** - me dan análisis y recomendaciones
- **Ventanas contexto separadas** - especializados por dominio
- **Reportan A MÍ** - nunca directamente al usuario
- **Invocación automática** - basada en pattern matching de descriptions

### 📋 AGENTES DISPONIBLES (.claude/agents/)
```bash
# ESPECIALISTAS ENIGMA RESTAURANT PLATFORM (4 agentes)
restaurant-operations-master.md     # Multi-table reservas + GDPR + capacidad
supabase-schema-architect.md       # RLS policies + 29 tablas + performance
menu-wine-specialist.md            # Menú multiidioma + EU-14 + maridajes
customer-intelligence-analyst.md   # VIP analytics + retention + patterns

# SISTEMA BASE CLAUDE CODE (6 agentes)
meta-agent.md                      # Factory para crear nuevos agentes
documentation-manager.md           # Sync automático de documentación
validation-gates.md               # Testing y QA proactivo
work-completion-summary.md        # TTS summaries al completar
hello-world-agent.md              # Greetings handler
llm-ai-agents-and-eng-research.md # AI research specialist
```

### ⚡ PATRÓN DE INVOCACIÓN AUTOMÁTICA
```typescript
// Claude lee descriptions de agentes y delega automáticamente
// Basado en pattern matching de user requests vs agent descriptions

// Ejemplo de invocación:
User: "Optimizar sistema de reservas"
↓
Claude analiza → Invoca restaurant-operations-specialist
↓
Subagente reporta expertise → Claude implementa solución
```

### 🏭 META-AGENT FACTORY PATTERN
```bash
# Crear nuevos agentes especializados:
"I need a [Domain] Specialist agent that proactively manages [specific functionality]
for the Enigma restaurant platform. Trigger on [keywords]."

# Meta-agent automáticamente:
# 1. Scrapes latest Claude Code docs
# 2. Analyzes domain requirements
# 3. Creates .claude/agents/new-agent.md
# 4. Makes available for automatic delegation
```

### 🎯 DOMINIOS ESPECIALIZADOS ACTIVOS
- **Restaurant Operations**: ✅ `restaurant-operations-master.md`
  - 35 tablas en schema public, multi-table reservations (`table_ids[]`)
  - GDPR compliance con audit trails y consent tracking
  - Capacity optimization y algoritmos de asignación
  - Pre-orders via `reservation_items` + `menu_items`

- **Database Architecture**: ✅ `supabase-schema-architect.md`
  - RLS policies optimizadas con auth.jwt() patterns
  - Supabase Cloud managed service + Realtime subscriptions
  - Multi-tenant security con role hierarchies
  - JSONB management para floor plan y configuraciones

- **Menu & Wine Systems**: ✅ `menu-wine-specialist.md`
  - Multiidioma (ES/EN/DE) con `richDescription` fields
  - EU-14 allergen compliance via `menu_item_allergens`
  - Wine pairing algorithms (`foodItemId` → `wineItemId`)
  - Glass vs bottle pricing optimization

- **Customer Intelligence**: ✅ `customer-intelligence-analyst.md`
  - VIP analytics (`isVip`, `totalSpent`, `totalVisits`)
  - Behavioral patterns y retention strategies
  - Personalization via `favoriteDisheIds[]`, `dietaryRestrictions[]`
  - GDPR consent management y data portability

### 📡 COMMUNICATION FLOW (CRÍTICO)
```mermaid
User → Claude (Agente Primario) → Subagente Especializado
     ←                         ← (Expertise/Recommendations)
     → (Implementación)
```

## 📡 HOOKS AUTOMATION SYSTEM

### Event-Driven Patterns (ai_docs/cc_hooks_docs.md)
```json
{
  "PreToolUse": "Validate dangerous operations",
  "PostToolUse": "Format, lint, cleanup",
  "Stop": "Continue next logical steps",
  "UserPromptSubmit": "Add context, validate"
}
```

## 🔧 DEVELOPMENT COMMANDS MATRIX

### Quality Gates (EJECUTAR SIEMPRE)
```bash
npm run lint && npm run type-check && npm run test:all
npm run dev    # Turbopack development
npm run build  # Production + validation
```

### Database Operations
```bash
npm run db:studio     # Visual interface
npm run db:generate   # Prisma client
npm run db:push       # Schema deployment
```

### 📋 SLASH COMMANDS DE ANÁLISIS Y PLANNING
```bash
# Context Engineering Commands (Seguir en secuencia)
/dev-status [component]     # Estado actual desarrollo con health score
/tech-inventory [database]  # Inventario completo DB + APIs + hooks
/dev-plan <objetivo>        # Plan estructurado basado en análisis previo

# Workflow recomendado:
/dev-status → /tech-inventory → /dev-plan "implementar reservas VIP"
```

## 🎯 COMPONENT DEVELOPMENT PATTERNS

### Shadcn/ui Standards (INMUTABLE)
```tsx
// Pattern ALL inputs follow
<Input className="h-9 w-full border-input bg-transparent px-3 py-1 text-base md:text-sm" />

// HSL tokens ONLY
className="text-foreground border-border bg-card"
```

### Responsive Breakpoints
- **Mobile**: Base styles (375px min)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Testing**: iPhone SE + iPad + Desktop SIEMPRE

## 🚀 PARALLEL PROCESSING ARCHITECTURE

### Batch Tool Execution Pattern
```typescript
// ALWAYS batch independent operations
[
  Bash('git status'),
  Bash('git diff'),
  Bash('npm run lint'),
  Read('src/components/Component.tsx'),
  Grep('pattern', 'src/', '--type tsx')
].executeInParallel()
```

### Agent Coordination
```bash
# Multi-agent parallel pattern - REAL EXAMPLES
Task("meta-agent") → Create new specialist agents on demand
Task("validation-gates") → Proactive testing after implementation
Task("documentation-manager") → Auto-sync docs with code changes

# Invocación automática por keywords ACTIVA:
"reservations" → restaurant-operations-master.md ✅
"multi-table booking" → restaurant-operations-master.md ✅
"database schema" → supabase-schema-architect.md ✅
"RLS policies" → supabase-schema-architect.md ✅
"menu management" → menu-wine-specialist.md ✅
"wine pairings" → menu-wine-specialist.md ✅
"customer analytics" → customer-intelligence-analyst.md ✅
"VIP management" → customer-intelligence-analyst.md ✅
```

## 📊 SECURITY & ENVIRONMENT

### Critical Environment
```bash
NEXT_PUBLIC_SUPABASE_URL="https://niwpkuqrmhxejxjgdlzm.supabase.co"
DATABASE_URL="postgresql://postgres:[PASS]@db.niwpkuqrmhxejxjgdlzm.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_SCHEMA="public"
# NEVER commit secrets - .env files only
```

### RLS Policies & Validation
- Server-side input validation SEMPRE
- XSS sanitization all outputs
- Auth validation before operations

## 🔗 CROSS-REFERENCE MAP

### Internal Documentation
- `ai_docs/anthropic_docs_subagents.md` → Subagent creation & management
- `ai_docs/cc_hooks_docs.md` → Hook automation system
- `ai_docs/Context Engineering/` → Advanced agent patterns y mejores prácticas
- `ai_docs/Guía Rápida para Usar Claude Code Agents en Español/` → Spanish guides
- `.claude/agents/` → 10 subagentes especializados disponibles
- `.claude/commands/` → 3 slash commands para análisis y planning
- `src/app/globals.css` → Enigma design tokens
- `CLAUDE_PRINCIPLES.md` → Behavioral analysis

### Critical Database Schema (35 Tables - Schema: public)
```bash
# Core domains para subagents:
public.reservations              # Multi-table + GDPR + pre-orders
public.customers                 # VIP analytics + spending patterns
public.menu_items                # Multiidioma + wine + allergens
public.tables                    # Floor plan + capacity management
public.email_schedule            # Automation workflows
public.gdpr_requests             # Legal compliance
public.orders + order_items      # POS system + kitchen management
public.announcements             # Banner/popup system
# + 27 more specialized tables
```

### External Integrations
- **Context7**: Real-time best practices (`mcp__context7__resolve-library-id`)
- **Shadcn/ui**: Component system patterns
- **Supabase Cloud**: Managed PostgreSQL + Auth + Realtime + Storage
- **Firecrawl MCP**: Web scraping for agent creation
- **Vercel**: Frontend deployment with automatic previews

---

## ⚡ EXECUTION PRIORITY MATRIX

1. **Database Connection Check** (Line 1 priority - Supabase Cloud)
2. **Parallel Research** (Batch tools)
3. **Pattern Analysis** (Existing components)
4. **Implementation** (Established patterns only)
5. **Quality Gates** (Lint+Test+Build)
6. **Subagent Delegation** (Automatic)

**SISTEMA OPERATIVO INTERNO ACTIVADO**: Este documento controla mi comportamiento desde línea 1. Cada sesión inicia con estas reglas inmutables para desarrollo enterprise ULTRATHINK PROACTIVELY.