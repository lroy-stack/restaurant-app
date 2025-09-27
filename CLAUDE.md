# CLAUDE.md - ENTERPRISE FULL STACK AI DEVELOPMENT SYSTEM

> **SISTEMA OPERATIVO INTERNO**: Reglas inmutables para desarrollo ULTRATHINK PROACTIVELY

## 🚨 CORE BEHAVIORAL OVERRIDE (LÍNEA 1 PRIORIDAD ABSOLUTA)

### ⚡ SSH-FIRST PATTERN (OBLIGATORIO)
```bash
# PRIMERA OPERACIÓN SIEMPRE - Sin excepción
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT current_database();'"
```

### 🧠 MI OUTPUT STYLE MODE INTERNO
- **Conciso**: <4 líneas respuesta, tokens mínimos
- **Direct Action**: Sin anuncios, ejecuto herramientas directamente
- **Batch Processing**: Parallel tool calls en single message SIEMPRE
- **No Preamble**: Eliminar "Here's what I'll do" o "I've completed"

### 🔴 ANTI-PATTERN CORRECTION (Errores detectados históricos)
- ❌ **NUNCA** implementar sin SSH database check primero
- ❌ **NUNCA** iterar sin consultar ("PORQUE ITERASTE SIN CONSULTAR?")
- ❌ **NUNCA** crear componentes sin verificar existentes primero
- ❌ **NUNCA** agregar logs innecesarios ("NO NECESITAMOS MAS LOGS")

## 🏗️ ENTERPRISE WORKFLOW SYSTEM

### FASE 1: MANDATORY RESEARCH SEQUENCE
```bash
# Batch execute en single message - OBLIGATORIO
[
  ssh("docker exec supabase-db psql -U postgres -c '\dt restaurante.*'"),
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
- **Connection**: `supabase.enigmaconalma.com:8443`
- **Schema**: `restaurante` (29 tables), `public` (auth)
- **Headers**: `Accept-Profile: restaurante`, `Content-Profile: restaurante`
- **SSH Debug**: `ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -d postgres -c '\dt restaurante.*'"`

### 🎨 Design System Tokens (HSL OBLIGATORIO)
```css
--primary: oklch(0.45 0.15 200)           /* Atlantic Blue */
--foreground: oklch(0.15 0.02 220)        /* Dark text */
--muted-foreground: oklch(0.38 0.02 220)  /* Muted text */
--border: oklch(0.82 0.02 210)            /* Borders */
```

### 📋 Stack Architecture
- **Frontend**: Next.js 15 + Turbopack + Shadcn/ui + Tailwind
- **Backend**: Supabase self-hosted + Kong API Gateway
- **Database**: PostgreSQL + RLS policies
- **VPS**: 31.97.182.226 (Docker Compose)

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
  - 29 tablas, multi-table reservations (`table_ids[]`)
  - GDPR compliance con audit trails y consent tracking
  - Capacity optimization y algoritmos de asignación
  - Pre-orders via `reservation_items` + `menu_items`

- **Database Architecture**: ✅ `supabase-schema-architect.md`
  - RLS policies optimizadas con auth.jwt() patterns
  - Performance tuning y migration strategies
  - Multi-tenant security con role hierarchies
  - JSONB management para `floor_plan_elements`

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
NEXT_PUBLIC_SUPABASE_URL="https://supabase.enigmaconalma.com"
DATABASE_URL="postgresql://postgres:[PASS]@31.97.182.226:5432/postgres"
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

### Critical Database Schema (29 Tables)
```bash
# Core domains para subagents:
restaurante.reservations         # Multi-table + GDPR + pre-orders
restaurante.customers           # VIP analytics + spending patterns
restaurante.menu_items         # Multiidioma + wine + allergens
restaurante.floor_plan_elements # JSONB drag&drop system
restaurante.email_schedule     # Automation workflows
restaurante.gdpr_requests      # Legal compliance
# + 23 more specialized tables
```

### External Integrations
- **Context7**: Real-time best practices (`mcp__context7__resolve-library-id`)
- **Shadcn/ui**: Component system patterns
- **Supabase**: Self-hosted with Kong Gateway
- **Firecrawl MCP**: Web scraping for agent creation

---

## ⚡ EXECUTION PRIORITY MATRIX

1. **SSH Database Check** (Line 1 priority)
2. **Parallel Research** (Batch tools)
3. **Pattern Analysis** (Existing components)
4. **Implementation** (Established patterns only)
5. **Quality Gates** (Lint+Test+Build)
6. **Subagent Delegation** (Automatic)

**SISTEMA OPERATIVO INTERNO ACTIVADO**: Este documento controla mi comportamiento desde línea 1. Cada sesión inicia con estas reglas inmutables para desarrollo enterprise ULTRATHINK PROACTIVELY.