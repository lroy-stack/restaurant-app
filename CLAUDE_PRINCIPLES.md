# CLAUDE_PRINCIPLES.md

## 🚨 RESUMEN EJECUTIVO

**DIAGNÓSTICO CRÍTICO**: Análisis de comportamiento revela 70% de errores causados por violación sistemática de principios fundamentales establecidos en CLAUDE.md.

### DATOS DEL PROBLEMA:
- **Anti-Patrón Principal**: Salto directo a implementación sin research obligatorio
- **Caso Concreto**: ReservationDetailModal ya existía y funcionaba, pero se intentó crear sistema nuevo
- **Violaciones Específicas**: CLAUDE.md líneas 8-15 (MANDATORY FIRST STEPS), 27-31 (NEVER improvise), 33-39 (ALWAYS analyze patterns)
- **Impacto**: Pérdida de tiempo, duplicación de código, inconsistencias arquitecturales

### RAÍZ DEL PROBLEMA:
**Context Engineering deficiente** - No construcción de contexto completo antes de decisiones técnicas.

---

## 🎯 PRINCIPIOS FUNDAMENTALES

### 1. CONTEXT ENGINEERING > PROMPT ENGINEERING
```
VERDAD ABSOLUTA: "Garbage In, Garbage Out"
LLMs requieren TODA información relevante ANTES de decisiones
```

### 2. RESEARCH FIRST, IMPLEMENT SECOND
```
OBLIGATORIO: Analizar patrones existentes antes de cualquier código
NUNCA crear nuevos componentes sin verificar existentes
```

### 3. PRECISION > SPEED
```
"STUDY before iterating" - Precisión es no-negociable
"NEVER improvise" - Seguir patrones establecidos exactamente
```

### 4. MODULARIDAD ESTRICTA
```
Usar componentes existentes > Modificar existentes > Crear nuevos
Jerarquía de decisión inmutable
```

### 5. SUBAGENT SEPARATION OF CONCERNS
```
Cada subagent tiene responsabilidades específicas
NO mezclar funcionalidades entre agentes
```

### 6. HOLISTIC VALIDATION
```
Validar impacto completo antes de cualquier cambio
Testing inmediato en múltiples viewports
```

### 7. DOCUMENTATION SYNCHRONIZATION
```
Documentación es tan importante como código
Actualizar docs proactivamente con cambios
```

---

## ❌ ANTI-PATRONES A EVITAR

### 🚫 IMPULSE IMPLEMENTATION
**Problema**: Saltar directamente a escribir código sin research
```tsx
// MAL ❌
function NewReservationModal() {
  // Crear modal desde cero sin verificar existentes
}

// BIEN ✅
// Primero: grep "Modal" src/ --type tsx
// Encontrar: ReservationDetailModal ya existe
// Usar: Extender/modificar existente
```

### 🚫 CONTEXT BLINDNESS
**Problema**: No construir contexto completo antes de decisiones
```bash
# MAL ❌ - Implementar sin context
Edit src/components/NewComponent.tsx

# BIEN ✅ - Context Engineering completo
Grep "similar-pattern" src/
Read existing components
Check design system tokens
Analyze user flows
THEN implement
```

### 🚫 PATTERN VIOLATION
**Problema**: Ignorar convenciones establecidas del proyecto
```css
/* MAL ❌ */
.custom-color { color: #3b82f6; }

/* BIEN ✅ */
.custom-color { color: hsl(var(--primary)); }
```

### 🚫 SUBAGENT MISUSE
**Problema**: Usar subagents incorrectamente o no usarlos
```bash
# MAL ❌ - Hacer todo manualmente
# Implementar -> Olvidar tests -> Olvidar docs

# BIEN ✅ - Delegar apropiadamente
# code-reviewer: Revisar después de cambios
# test-runner: Validar automáticamente
# documentation-manager: Actualizar docs
```

---

## ✅ WORKFLOW OBLIGATORIO

### FASE 1: MANDATORY RESEARCH (NO NEGOCIABLE)
```bash
1. Check ai_docs/ directory
   Grep "similar-feature" ai_docs/

2. Search existing codebase
   Grep "ComponentName" src/ --type tsx
   Grep "similar-pattern" src/

3. Analyze Context7 patterns
   mcp__context7__get-library-docs

4. Check design system
   Read src/app/globals.css
   Verify HSL tokens usage

5. Study project structure
   Glob "**/*.tsx" src/components
```

### FASE 2: CONTEXT ENGINEERING
```bash
1. Map existing components
   List all related components found

2. Identify reuse opportunities
   Can existing component be extended?

3. Check integration points
   How does this fit existing flows?

4. Validate design consistency
   Are we following established patterns?

5. Plan subagent usage
   Which tasks delegate to subagents?
```

### FASE 3: IMPLEMENTATION
```bash
1. Use established patterns EXACTLY
   Copy proven component structure

2. Apply design tokens consistently
   Use hsl(var(--token)) format

3. Test multiple viewports IMMEDIATELY
   iPhone SE, iPad, Desktop

4. Validate accessibility basics
   Focus, keyboard navigation, ARIA

5. Run quality gates continuously
   npm run lint && npm run type-check
```

### FASE 4: VALIDATION & DELEGATION
```bash
1. Execute all quality commands
   npm run test:all

2. Delegate to subagents
   /agents code-reviewer
   /agents test-runner
   /agents documentation-manager

3. Verify responsive behavior
   Test all breakpoints

4. Check performance impact
   Monitor bundle size

5. Update documentation proactively
   Sync with code changes
```

---

## 🔍 CHECKLIST PRE-IMPLEMENTACIÓN

### ✅ RESEARCH COMPLETO
- [ ] Verificado ai_docs/ para patrones Claude Code
- [ ] Búsqueda Context7 para best practices
- [ ] Analizado codebase para patrones similares
- [ ] Identificado componentes reutilizables
- [ ] Revisado design system tokens
- [ ] Planificado uso de subagents

### ✅ CONTEXT ENGINEERING
- [ ] Mapeado componentes existentes relacionados
- [ ] Identificado oportunidades de reutilización
- [ ] Verificado puntos de integración
- [ ] Validado consistencia con patrones existentes
- [ ] Comprendido flujos de usuario completos

### ✅ IMPLEMENTATION READINESS
- [ ] Patrón específico identificado para seguir
- [ ] Design tokens correctos seleccionados
- [ ] Breakpoints de testing planificados
- [ ] Consideraciones de accesibilidad definidas
- [ ] Quality gates preparados para ejecución

### ✅ POST-IMPLEMENTATION
- [ ] Tests ejecutados y pasando
- [ ] Subagents delegados apropiadamente
- [ ] Comportamiento responsive validado
- [ ] Documentación actualizada
- [ ] Performance verificado

---

## 🤖 MEJORES PRÁCTICAS SUBAGENTS

### CODE-REVIEWER (Post-Implementation)
```bash
# USAR PARA: Revisión automática después de cambios
# CUÁNDO: Inmediatamente después de implementar feature
# DELEGAR: Análisis de calidad, consistencia de patrones

/agents code-reviewer
"Review recent changes for pattern consistency and best practices"
```

### TEST-RUNNER (Validation)
```bash
# USAR PARA: Ejecutar y arreglar tests automáticamente
# CUÁNDO: Durante y después de implementación
# DELEGAR: Test failures, coverage validation

/agents test-runner
"Run all tests and fix any failures found"
```

### DEBUGGER (Problem Solving)
```bash
# USAR PARA: Root cause analysis de issues complejos
# CUÁNDO: Cuando hay bugs o comportamientos inesperados
# DELEGAR: Deep debugging, stack trace analysis

/agents debugger
"Analyze and fix integration issue with ReservationDetailModal"
```

### DOCUMENTATION-MANAGER (Sync)
```bash
# USAR PARA: Actualizar docs después de cambios de código
# CUÁNDO: Después de cualquier feature o cambio arquitectural
# DELEGAR: README updates, API docs, architecture docs

/agents documentation-manager
"Update documentation to reflect new reservation flow"
```

### WORKFLOW DE SUBAGENTS
1. **Pre-Implementation**: Ningún subagent (research manual obligatorio)
2. **During Implementation**: test-runner para validación continua
3. **Post-Implementation**: code-reviewer + documentation-manager
4. **Problem Solving**: debugger cuando sea necesario

---

## 📋 REFERENCIA RÁPIDA

### 🚀 COMANDOS ESENCIALES
```bash
# Research Phase
grep "ComponentName" src/ --type tsx
glob "**/*.tsx" src/components
read src/app/globals.css

# Quality Gates (MANDATORY)
npm run lint
npm run type-check
npm run test:all

# Database Operations
npm run db:studio
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c 'SELECT current_database();'"

# Subagent Access
/agents
```

### 🎨 DESIGN TOKENS CRÍTICOS
```css
/* USAR SIEMPRE estos tokens HSL */
--primary: oklch(0.45 0.15 200)        /* Atlantic Blue */
--foreground: oklch(0.15 0.02 220)     /* Dark text */
--muted-foreground: oklch(0.38 0.02 220) /* Muted text */
--border: oklch(0.82 0.02 210)         /* Borders */

/* Input height UNIVERSAL */
h-9  /* TODOS los inputs */

/* Radius tokens */
rounded-md  /* var(--radius-md) */
```

### 🏗️ ARCHITECTURE CRÍTICA
```typescript
// Database Connection
NEXT_PUBLIC_SUPABASE_URL="https://supabase.enigmaconalma.com"

// Headers Required
Accept-Profile: restaurante
Content-Profile: restaurante

// Table Locations
TERRACE_CAMPANARI, SALA_VIP, TERRACE_JUSTICIA, SALA_PRINCIPAL
```

### 📱 RESPONSIVE PATTERNS
```css
/* Mobile-first pattern */
.component {
  /* Base styles for mobile */
}

@media (min-width: 768px) {
  .component {
    /* Tablet+ styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop+ styles */
  }
}
```

### 🔍 DEBUGGING SHORTCUTS
```bash
# Database Direct Access
ssh root@31.97.182.226 "docker exec supabase-db psql -U postgres -c '\dt restaurante.*'"

# Component Search
grep -r "ReservationDetailModal" src/

# Pattern Analysis
grep -r "useState.*modal" src/ --include="*.tsx"

# Design System Check
grep -r "hsl(var(--" src/ --include="*.css"
```

---

## ⚡ APLICACIÓN INMEDIATA

### EJEMPLO: Funcionalidad CTAs Nueva Reserva
```bash
# ❌ COMPORTAMIENTO ANTERIOR (INCORRECTO)
# Crear nuevo modal desde cero

# ✅ COMPORTAMIENTO CORRECTO
1. grep "Modal" src/ --type tsx
   # RESULTADO: ReservationDetailModal existe

2. read src/components/ReservationDetailModal.tsx
   # ANÁLISIS: Modal funcional, patrón establecido

3. read src/hooks/useReservationModal.ts
   # ANÁLISIS: Hook de estado existe

4. DECISIÓN: Extender modal existente en lugar de crear nuevo

5. /agents code-reviewer
   # DELEGACIÓN: Revisar modificaciones
```

### CHECKLIST RÁPIDO (30 SEGUNDOS)
- [ ] ¿Busqué patrones existentes?
- [ ] ¿Puedo reutilizar componente existente?
- [ ] ¿Estoy siguiendo design tokens?
- [ ] ¿Planifiqué uso de subagents?
- [ ] ¿Validaré en múltiples viewports?

**REGLA DE ORO**: Si la respuesta a cualquier pregunta es "No", DETENER implementación y completar research.

---

*Última actualización: 2025-09-24*
*Versión: 1.0 - Executive Behavioral Correction*