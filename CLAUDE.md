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
- **Schema**: `restaurante` (16 tables), `public` (auth)
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

## 🤖 SUBAGENT DELEGATION MATRIX

### Built-in Agents (.claude/agents/)
```bash
/agents  # Interface access

# Parallel execution pattern - MANDATORY
code-reviewer + test-runner + documentation-manager + debugger
```

### Orchestration Strategies
- **Sequential**: Dependencies required (task-b depends task-a)
- **Parallel**: Independent tasks (`strategy: "parallel"`)
- **Adaptive**: Mixed approach based on complexity
- **Batch Tool Pattern**: All operations single message

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

### Internal Documentation
- `ai_docs/` → Claude Code patterns
- `.claude/agents/` → Subagent configs
- `src/app/globals.css` → Design tokens
- `CLAUDE_PRINCIPLES.md` → Behavioral analysis

### External Integrations
- **Context7**: Best practices lookup
- **Shadcn/ui**: Component library
- **Supabase**: Database patterns

---

## ⚡ EXECUTION PRIORITY MATRIX

1. **SSH Database Check** (Line 1 priority)
2. **Parallel Research** (Batch tools)
3. **Pattern Analysis** (Existing components)
4. **Implementation** (Established patterns only)
5. **Quality Gates** (Lint+Test+Build)
6. **Subagent Delegation** (Automatic)

**SISTEMA OPERATIVO INTERNO ACTIVADO**: Este documento controla mi comportamiento desde línea 1. Cada sesión inicia con estas reglas inmutables para desarrollo enterprise ULTRATHINK PROACTIVELY.