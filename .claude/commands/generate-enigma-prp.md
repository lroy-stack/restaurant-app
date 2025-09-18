# Generate Enigma Restaurant PRP #ULTRATHINK PROACTIVELY

Generate a comprehensive PRP (Product Requirement Prompt) for Enigma Restaurant Platform using Context Engineering supremacy and the proven PRP methodology with complete validation loops.

## INITIAL File: $ARGUMENTS

⚠️ **CRITICAL REQUIREMENT**: This command MUST receive an INITIAL.md file path as input (e.g., `PRPs/INITIAL_WEBSOCKETS_REALTIME.md`)

## PRP Framework Rules & Context Limits

**Context Engineering Principles:**
1. **Context is King**: Include ALL necessary documentation, examples, caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix  
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Window Management**: Work within LLM context limits - be precise, not verbose

## Research Process

**CRITICAL: Follow this exact order - INITIAL analysis → codebase research → documentation gathering → PRP generation**

### Phase 1: INITIAL File Analysis
```bash
# Read and understand the INITIAL.md completely
Read: "$ARGUMENTS"  # The INITIAL file path provided
```

**Extract from INITIAL:**
- Business objectives and deliverables
- Technical stack requirements with specific versions
- Implementation timeline and validation criteria
- Context engineering references
- Critical success factors and gotchas

### Phase 2: Codebase Intelligence Gathering

```bash
# Current Enigma project structure analysis
tree /Users/lr0y/local-ai-packaged/enigma-next/enigma-app/src -L 3

# Existing implementation patterns
Grep: "authentication|database|components" in src/
Glob: "*.ts,*.tsx" for existing code patterns
Read: Key files identified in INITIAL for reference patterns
```

**Identify Existing Patterns:**
- Authentication: NextAuth.js v5 + role patterns
- Database: Prisma schema + Supabase integration  
- UI: Radix UI + Tailwind CSS components
- Forms: React Hook Form + Zod validation
- State: TanStack Query patterns

### Phase 3: Archon Knowledge Base Research

```bash
# Strategic research using Archon MCP
mcp__archon__perform_rag_query(query="[FEATURE from INITIAL] enterprise architecture patterns", match_count=5)
mcp__archon__search_code_examples(query="[TECHNOLOGY] implementation patterns", match_count=3)
mcp__archon__get_project(project_id="enigma-restaurant") # Current state
```

**Research Focus Areas:**
- Architecture patterns for the specific feature
- Implementation examples with similar tech stack
- Common gotchas and anti-patterns
- Performance considerations for restaurant traffic
- Security patterns for business-critical features

### Phase 4: External Documentation & Reference Links

**CRITICAL**: Collect specific URLs and documentation sections:

```yaml
# Essential documentation to include in PRP:
- url: https://nextjs.org/docs/app/building-your-application/[relevant-section]
  why: Specific implementation patterns needed
  
- url: https://react.dev/reference/[specific-hook-or-pattern]
  why: React 19 patterns for the feature
  
- url: https://www.prisma.io/docs/[relevant-section] 
  why: Database patterns and gotchas
  
- url: https://supabase.com/docs/guides/[relevant-guide]
  why: Real-time or specific integration patterns
  
- file: /Users/lr0y/local-ai-packaged/enigma-next/enigma-app/src/[existing-file]
  why: Pattern to follow or extend
```

## PRP Generation Using Template

**Using `/Users/lr0y/local-ai-packaged/enigma-next/PRPs/templates/prp_base.md` as structure:**

### 1. Goal, Why, What (from INITIAL)
- Extract business value and user impact
- Define technical requirements precisely
- Set measurable success criteria

### 2. All Needed Context Section
```yaml
# MUST READ - Include these in your context window:
- url: [Specific documentation URLs found in research]
  why: [Exact sections/methods needed]
  critical: [Key insights that prevent common errors]
  
- file: [Existing codebase files with patterns to follow]  
  why: [Pattern to follow, gotchas to avoid]
  
- docfile: [ai_docs files with library documentation]
  why: [Context for implementation decisions]
```

### 3. Implementation Blueprint
- **Current Codebase Tree**: From research phase
- **Desired Codebase Tree**: Files to be added with responsibilities
- **Known Gotchas**: Library quirks and Enigma-specific patterns
- **Task List**: Ordered implementation steps with MODIFY/CREATE/INJECT patterns

### 4. Validation Loops (Executable)

**Level 1: Syntax & Style**
```bash
# Next.js + TypeScript validation
npm run typecheck  # Must pass
npm run lint       # Must pass  
npm run build      # Must succeed
```

**Level 2: Unit Tests**
```typescript
// Pattern-specific test cases based on feature
// Must follow existing test patterns in __tests__/
// Restaurant business logic validation
```

**Level 3: Integration Tests**
```bash
# Feature-specific integration tests
# Database connectivity and real-time features
# Performance validation for restaurant operations
```

### 5. Restaurant-Specific Context

**Business Logic Integration:**
- 6-hour minimum reservation rule patterns
- EU-14 allergen compliance requirements
- VIP customer detection and management
- Atlantic-Mediterranean branding consistency
- Multi-language support (ES/EN/DE)

**Performance Requirements:**
- Mobile-first (70%+ traffic) optimization
- Real-time latency <100ms for reservations
- Lighthouse score >90 for all pages
- Core Web Vitals compliance

## Output Generation

### File Structure:
```bash
# Create comprehensive PRP file:
Write: "/Users/lr0y/local-ai-packaged/enigma-next/PRPs/ENIGMA_[FEATURE_NAME]_PRP.md"

# Content structure following prp_base.md template:
1. name: "ENIGMA [Feature] - PRP v1"
2. description: Business objectives + technical summary
3. Goal/Why/What: From INITIAL analysis
4. All Needed Context: Complete documentation + file references
5. Implementation Blueprint: Detailed pseudocode + task breakdown
6. Validation Loop: Executable test commands
7. Anti-Patterns: Restaurant-specific gotchas to avoid
```

### Quality Assurance Checklist

**Context Completeness:**
- [ ] All URLs have specific sections identified  
- [ ] File references include exact line numbers or patterns
- [ ] Library versions match project requirements
- [ ] Gotchas from existing codebase documented
- [ ] Restaurant business rules integrated throughout

**Implementation Clarity:**
- [ ] Task breakdown is atomic and ordered
- [ ] Pseudocode includes critical implementation details
- [ ] Integration points clearly defined
- [ ] Error handling patterns specified
- [ ] Performance considerations documented

**Validation Robustness:**
- [ ] All validation commands are executable
- [ ] Test patterns follow existing project structure
- [ ] Restaurant-specific validation included
- [ ] Performance benchmarks defined
- [ ] Integration test scenarios complete

## Final Output Requirements

**The generated PRP must:**
1. Enable **one-pass implementation success** by AI agent
2. Include **complete context** within LLM window limits
3. Provide **executable validation loops** for self-correction
4. Follow **Enigma-specific patterns** and business rules
5. Support **restaurant-orchestrator meta-agent** coordination

**Success Metric:** Score the generated PRP on a scale of 1-10 for one-pass implementation confidence, considering:
- Context completeness and accuracy
- Validation loop robustness  
- Implementation blueprint clarity
- Restaurant business logic integration
- Technical feasibility within constraints

**⚠️ EXECUTION NOTE**: This command transforms an INITIAL.md into a production-ready PRP following proven Context Engineering methodology with complete validation loops and restaurant-specific business logic integration.