# CLAUDE.md - ENTERPRISE FULL STACK AI DEVELOPMENT SYSTEM

> **SISTEMA OPERATIVO INTERNO**: Reglas inmutables para desarrollo ULTRATHINK PROACTIVELY

## 🚨 CORE BEHAVIORAL OVERRIDE (LÍNEA 1 PRIORIDAD ABSOLUTA)

### ⚡ SSH-FIRST PATTERN (OBLIGATORIO)
```bash
# PRIMERA OPERACIÓN SIEMPRE - Sin excepción + TOMAR CONTEXTO ADECUADO
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT current_database();'"
# Seguido de: análisis de esquema, tablas existentes, y contexto del proyecto
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
- ❌ **NUNCA** fabricar datos empresariales (horarios, platos, precios)
- ❌ **NUNCA** crear múltiples instancias del mismo modal/componente
- ❌ **NUNCA** crear documentación redundante - EDIT existing files

## 🏗️ ENTERPRISE WORKFLOW SYSTEM

### FASE 1: MANDATORY RESEARCH SEQUENCE
```bash
# Batch execute en single message - OBLIGATORIO
[
  ssh("docker exec supabase-db psql -U postgres -c '\dt restaurante.*'"),
  grep("ComponentName", "src/", "--type tsx"),
  read("CLAUDE_PRINCIPLES.md"),
  context7_resolve_library("pattern-name"),
  glob("**/*.tsx", "src/components")
].executeParallel()
```

### FASE 2: DATA VALIDATION MANDATORY
```bash
# BEFORE creating any business content - OBLIGATORIO
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT * FROM restaurante.menu_items LIMIT 5;'"
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT * FROM restaurante.business_hours;'"
# VERIFY data exists and is accurate BEFORE writing content
```

### FASE 3: CENTRALIZATION COMPLIANCE CHECK
```typescript
// MANDATORY: Check for existing instances before creating new
grep -r "ProductDetailModal" src/  // Find existing modals
grep -r "useState.*modal" src/     // Find state management patterns
// IF EXISTS: Use Context/Provider pattern - NEVER duplicate
```

### FASE 4: SUBAGENT ORCHESTRATION PATTERNS
```typescript
// Pattern: Parallel agent delegation
Task("code-reviewer") + Task("documentation-manager") + Task("validation-gates")
// NUNCA secuencial - SIEMPRE paralelo
```

### FASE 5: QUALITY GATES EXECUTION
```bash
# Batch quality commands - INMEDIATO después implementación
npm run lint && npm run type-check && npm run test:all
```

## 🎯 ENIGMA PROJECT CRITICAL DATA

### 🔑 Database Access Patterns
- **Connection**: `supabase.enigmaconalma.com:8443`
- **Schema**: `restaurante` (29+ tables - verified via SSH)
- **Headers**: `Accept-Profile: restaurante`, `Content-Profile: restaurante`
- **SSH Debug**: `ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -d postgres -c '\dt restaurante.*'"`
- **CRITICAL**: ALWAYS use SSH direct DB access - NO PRISMA per user specification

### 📊 Table Structure (SSH Verified)
```bash
# Core tables (29+ total):
restaurante.menu_items, restaurante.menu_categories, restaurante.business_hours,
restaurante.reservations, restaurante.customers, restaurante.orders,
restaurante.media_library, restaurante.wine_pairings, restaurante.allergens
# Full list via: ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c '\dt restaurante.*'"
```

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
- **Database**: PostgreSQL + RLS policies (SSH direct access)
- **VPS**: 31.97.182.226 (Docker Compose)

## 🏛️ CENTRALIZATION PATTERNS (OBLIGATORIO)

### Context/Provider Pattern MANDATORY
- ❌ **NUNCA** crear instancias múltiples del mismo modal
- ❌ **NUNCA** duplicar estado para misma funcionalidad
- ✅ **SIEMPRE** usar Context/Provider para estado global
- ✅ **SIEMPRE** single instance + hook consumption pattern

### DRY Enforcement Architecture
```typescript
// ❌ PROHIBITED: Multiple modal instances
// /menu/page.tsx: <ProductDetailModal/>
// featured-dishes.tsx: <ProductDetailModal/>
// featured-wines.tsx: <ProductDetailModal/>

// ✅ REQUIRED: Single instance in Provider
<ProductModalProvider>
  <ProductDetailModal/> // SINGLE instance
  <App/>
</ProductModalProvider>

// Components consume via hook:
const { openProductModal } = useProductModal()
```

### Component Hierarchy (IMMUTABLE)
1. **Use Existing** → Extend existing component
2. **Modify Existing** → Edit current implementation
3. **Create New** → ONLY if absolutely necessary and authorized

## 🔍 DATA VALIDATION (OBLIGATORIO)

### NEVER Fabricate Business Data
- ❌ **NUNCA** inventar platos, precios, horarios de restaurante
- ❌ **NUNCA** crear contenido sin verificar con DB
- ✅ **SIEMPRE** SSH check antes de content creation
- ✅ **SIEMPRE** contrastar datos con fuente autoritativa

### Mandatory Verification Pattern
```bash
# BEFORE any business content creation:
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT name, price FROM restaurante.menu_items;'"
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT day_of_week, open_time, close_time FROM restaurante.business_hours;'"
# VALIDATE data exists and is accurate
# THEN create content based on REAL data only
```

## 🚫 INCIDENT-BASED ANTI-PATTERNS

### Critical Incidents Prevention (Based on 7 Documented Failures)

#### Incident #001 Prevention: Data Fabrication
```
NEVER: Fabricate "Costillas Black Angus", "Lubina con Gambas y Sabayón"
ALWAYS: Verify menu items exist in restaurante.menu_items table
```

#### Incident #007 Prevention: Architecture Redundancy
```
NEVER: Create 3 separate ProductDetailModal instances
ALWAYS: Use Context/Provider centralized pattern
```

#### Incident #004/#006 Prevention: File Management
```
NEVER: Create redundant documentation files
NEVER: Delete core files (Prisma schema) without authorization
ALWAYS: Edit existing files vs Write new files
```

#### Incident #002/#003 Prevention: Implementation Without Research
```
NEVER: Make changes without consulting DB first
ALWAYS: Complete research phase before ANY iteration
```

## 🤖 SUBAGENT DELEGATION MATRIX

### Built-in Agents (VERIFIED ACTIVE)
```bash
# Available through official Claude Code:
/agents  # Interface access for subagent delegation

# Parallel execution pattern - MANDATORY
Task("code-reviewer") + Task("documentation-manager") + Task("validation-gates")
```

### Orchestration Strategies
- **Sequential**: Dependencies required (task-b depends task-a)
- **Parallel**: Independent tasks (`strategy: "parallel"`)
- **Adaptive**: Mixed approach based on complexity
- **Batch Tool Pattern**: All operations single message

## 📡 HOOKS AUTOMATION SYSTEM

### Event-Driven Patterns (Official Claude Code)
```json
{
  "PreToolUse": "Validate dangerous operations",
  "PostToolUse": "Format, lint, cleanup",
  "Stop": "Continue next logical steps",
  "UserPromptSubmit": "Add context, validate"
}
```

### Custom Project Hooks
- **Pre-DB-Write**: Validate data exists via SSH
- **Pre-Component-Create**: Check for existing implementations
- **Post-Implementation**: Run quality gates automatically

## 🔧 DEVELOPMENT COMMANDS MATRIX

### Quality Gates (EJECUTAR SIEMPRE)
```bash
npm run lint && npm run type-check && npm run test:all
npm run dev    # Turbopack development
npm run build  # Production + validation
```

### Database Operations (SSH DIRECT - NO PRISMA)
```bash
# SSH Direct DB Access (USER SPECIFIED)
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT...'"

# Visual interface ONLY when needed:
npm run db:studio     # Visual interface
```

## 🎯 COMPONENT DEVELOPMENT PATTERNS

### Shadcn/ui Standards (INMUTABLE)
```tsx
// Pattern ALL inputs follow
<Input className="h-9 w-full border-input bg-transparent px-3 py-1 text-base md:text-sm" />

// HSL tokens ONLY
className="text-foreground border-border bg-card"
```

### Centralization Requirements
```tsx
// ✅ CORRECT: Context/Provider pattern
export const ProductModalProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ProductModalContext.Provider value={{selectedItem, isOpen, openModal, closeModal}}>
      {children}
      <ProductDetailModal isOpen={isOpen} item={selectedItem} />
    </ProductModalContext.Provider>
  )
}

// ❌ WRONG: Multiple instances
// <ProductDetailModal/> in multiple components
```

### Responsive Breakpoints
- **Mobile**: Base styles (375px min)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Testing**: iPhone SE + iPad + Desktop SIEMPRE

## 🚀 PARALLEL PROCESSING ARCHITECTURE

### Batch Tool Execution Pattern
```typescript
// ONLY batch INDEPENDENT operations - NUNCA iterar mismo documento
[
  Bash('git status'),        // ✅ Independent
  Bash('git diff'),          // ✅ Independent
  Bash('npm run lint'),      // ✅ Independent
  Read('src/components/A.tsx'), // ✅ Different files
  Read('src/components/B.tsx')  // ✅ Different files
].executeInParallel()

// ❌ PROHIBIDO: Parallel edits to same document
[
  Edit('file.ts', oldA, newA),  // ❌ Same file conflict
  Edit('file.ts', oldB, newB)   // ❌ Same file conflict
]

// ✅ CORRECTO: Sequential edits to same document
Edit('file.ts', oldA, newA) → then → Edit('file.ts', oldB, newB)
```

### ⚠️ PARALLEL PROCESS RULES
- **✅ PERMITIDO**: Diferentes archivos, comandos independientes, agentes distintos
- **❌ PROHIBIDO**: Mismo archivo, operaciones dependientes, iteración documento
- **REGLA CRÍTICA**: UN solo edit por archivo por mensaje

### Agent Coordination
```bash
# Multi-agent parallel pattern
Task("backend-architect") + Task("frontend-dev") + Task("qa-engineer")
# Result aggregation automatic
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

### Internal Documentation (VERIFIED)
- `CLAUDE_PRINCIPLES.md` ✅ → Behavioral analysis (403 lines)
- `src/app/globals.css` ✅ → Design tokens
- `Claude_Code_Feedback_Report_EN.md` ✅ → Incident documentation (7 critical incidents)
- `CLAUDE_ANALYSIS_REPORT.md` ✅ → This analysis documentation

### External Integrations (ACTIVE)
- **Context7**: Best practices lookup ✅
- **Shadcn/ui**: Component library ✅
- **SSH Direct DB**: PostgreSQL queries ✅ (NO Prisma per user spec)

---

## ⚡ EXECUTION PRIORITY MATRIX

1. **SSH Database Check** (Line 1 priority)
2. **Data Validation** (Verify real data exists)
3. **Centralization Check** (Existing components/state)
4. **Parallel Research** (Batch tools)
5. **Pattern Analysis** (Existing components)
6. **Implementation** (Established patterns only)
7. **Quality Gates** (Lint+Test+Build)
8. **Subagent Delegation** (Automatic)

## 🎯 VALIDATION CHECKLIST

### Before ANY Implementation:
- [ ] SSH DB connection verified
- [ ] Data exists and is real (no fabrication)
- [ ] Existing components/patterns checked
- [ ] Centralization compliance verified
- [ ] Context/Provider pattern used if applicable
- [ ] No duplicate state/components created

### During Implementation:
- [ ] Following existing patterns exactly
- [ ] Using design tokens consistently
- [ ] Single edit per file per message
- [ ] Batch tool operations appropriately

### After Implementation:
- [ ] Quality gates passed
- [ ] Subagents delegated appropriately
- [ ] Documentation updated if needed
- [ ] No redundant files created

**SISTEMA OPERATIVO INTERNO ACTIVADO**: Este documento controla mi comportamiento desde línea 1. Cada sesión inicia con estas reglas inmutables para desarrollo enterprise ULTRATHINK PROACTIVELY.

---

*Version: 2.0 - Incident-Based Improvements*
*Updated: 2025-09-25*
*Based on: 7 Critical Incident Analysis + SSH DB Verification*