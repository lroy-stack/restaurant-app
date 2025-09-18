# 🏗️ FLOOR PLAN EVOLUTION PLAN
## Migración de react-grid-layout a React Flow para Vista de Planta Avanzada

**Documento:** Plan de Desarrollo Técnico
**Proyecto:** Enigma Restaurant Platform
**Fecha:** 2025-01-15
**Versión:** 1.0
**Equipo:** Desarrollo Frontend

---

## 📊 **EXECUTIVE SUMMARY**

### Objetivo
Evolucionar el sistema de gestión de planta del restaurante de un grid rígido limitado a mesas, hacia un editor de planta completamente flexible que permita elementos arquitectónicos, mobiliario y decoración para un mapeo real del espacio.

### Impacto del Negocio
- **Mejora UX**: Editor visual intuitivo para crear layouts realistas
- **Eficiencia Operacional**: Mejor visualización de flujos de servicio
- **Flexibilidad**: Adaptación a cambios físicos del restaurante
- **Escalabilidad**: Soporte para múltiples tipos de elementos

### Justificación Técnica
El sistema actual usando `react-grid-layout` está limitado por:
- Grid rígido que no refleja el espacio real
- Solo soporta mesas como elementos
- Imposibilidad de añadir elementos arquitectónicos
- Limitaciones en posicionamiento y tamaños

---

## 🔍 **ESTADO ACTUAL DEL SISTEMA**

### Arquitectura Existente

#### **Frontend Components**
```typescript
// ACTUAL: react-grid-layout
src/app/(admin)/dashboard/mesas/components/
├── table-floor-plan.tsx          // 🔴 CORE - Sistema actual
├── table-status-panel.tsx        // ✅ COMPATIBLE - Se mantiene
├── table-configuration.tsx       // ✅ COMPATIBLE - Se mantiene
├── enhanced-qr-manager.tsx        // ✅ COMPATIBLE - Se mantiene
├── table-analytics.tsx           // ✅ COMPATIBLE - Se mantiene
└── table-tabs.tsx                // 🟡 MINOR - Requiere tab adicional
```

#### **Backend APIs**
```typescript
// APIs relacionadas con floor plan
src/app/api/tables/
├── layout/route.ts               // 🔴 CRITICAL - Refactor completo
├── status/route.ts               // ✅ COMPATIBLE - Se mantiene
├── route.ts                      // ✅ COMPATIBLE - Se mantiene
├── availability/route.ts         // ✅ COMPATIBLE - Se mantiene
└── [id]/route.ts                 // ✅ COMPATIBLE - Se mantiene
```

#### **State Management**
```typescript
// Zustand store actual
src/stores/useTableStore.ts       // 🟡 EXTEND - Requiere extensión
```

#### **Database Schema**
```sql
-- Tabla actual (PostgreSQL)
restaurante.tables {
  id              uuid PRIMARY KEY
  number          varchar NOT NULL
  capacity        integer NOT NULL
  location        table_location NOT NULL
  qrCode          varchar
  isActive        boolean DEFAULT true
  restaurantId    uuid REFERENCES restaurants(id)
  currentStatus   table_status
  statusNotes     text
  estimatedFreeTime varchar
  -- ❌ MISSING: Campos de posicionamiento
  -- xPosition     numeric
  -- yPosition     numeric
  -- rotation      numeric
  -- width         numeric
  -- height        numeric
}
```

### Dependencias y Stakeholders

#### **Componentes que Consumen el Floor Plan**
1. **TableTabs** (`table-tabs.tsx`) - Navegación principal
2. **Mesa Management Page** (`/dashboard/mesas`) - Página principal
3. **Table Status Panel** - Estados en tiempo real
4. **Analytics** - Métricas de ocupación
5. **QR Manager** - Gestión de códigos QR

#### **APIs que Dependen de Table Layout**
- `GET /api/tables/layout` - Recuperar posiciones
- `POST /api/tables/layout` - Guardar posiciones
- `GET /api/tables/status` - Estados con posición
- `PATCH /api/tables/[id]` - Actualizar estado individual

#### **Stakeholders Técnicos**
- **Frontend**: Afectado por cambio de biblioteca
- **Backend**: Nuevos campos en base de datos
- **UX**: Nuevo diseño de herramientas
- **Testing**: Nuevos casos de prueba

---

## 🎯 **ARQUITECTURA OBJETIVO**

### Nueva Estructura de Datos

#### **Floor Plan Element Types**
```typescript
interface FloorPlanElement {
  id: string
  type: ElementType
  position: { x: number, y: number }
  size: { width: number, height: number }
  rotation: number
  style: ElementStyle
  data: ElementData
  zIndex: number
  createdAt: Date
  updatedAt: Date
}

enum ElementType {
  // EXISTING
  TABLE = 'table',

  // STRUCTURAL
  DOOR = 'door',
  WINDOW = 'window',
  WALL = 'wall',
  STAIRS = 'stairs',
  COLUMN = 'column',

  // OPERATIONAL
  BAR = 'bar',
  KITCHEN = 'kitchen',
  HOST_STATION = 'host_station',
  SERVICE_STATION = 'service_station',
  STORAGE = 'storage',
  BATHROOM = 'bathroom',

  // FURNITURE
  CHAIR = 'chair',
  SOFA = 'sofa',
  BENCH = 'bench',

  // DECORATION
  PLANT = 'plant',
  ARTWORK = 'artwork',
  FOUNTAIN = 'fountain',
  LIGHTING = 'lighting'
}
```

#### **Database Migration**
```sql
-- Nueva tabla para elementos de planta
CREATE TABLE restaurante.floor_plan_elements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid NOT NULL REFERENCES restaurante.restaurants(id),
  element_type    varchar(50) NOT NULL,
  position_x      numeric NOT NULL,
  position_y      numeric NOT NULL,
  width           numeric NOT NULL,
  height          numeric NOT NULL,
  rotation        numeric DEFAULT 0,
  z_index         integer DEFAULT 0,
  style_data      jsonb,
  element_data    jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Migrar mesas existentes
INSERT INTO restaurante.floor_plan_elements (
  restaurant_id, element_type, position_x, position_y,
  width, height, element_data
)
SELECT
  restaurantId, 'table', 0, 0, 120, 80,
  jsonb_build_object(
    'table_id', id,
    'number', number,
    'capacity', capacity,
    'location', location
  )
FROM restaurante.tables;
```

### Componentes Nuevos

#### **Estructura de Archivos**
```typescript
src/app/(admin)/dashboard/mesas/components/
├── floor-plan/                    // 🆕 NUEVO DIRECTORIO
│   ├── ReactFloorPlan.tsx        // 🆕 Componente principal React Flow
│   ├── FloorPlanSidebar.tsx      // 🆕 Paleta de elementos
│   ├── elements/                  // 🆕 Elementos customizados
│   │   ├── TableElement.tsx      // 🆕 Mesa como nodo React Flow
│   │   ├── DoorElement.tsx       // 🆕 Puerta
│   │   ├── BarElement.tsx        // 🆕 Barra
│   │   ├── PlantElement.tsx      // 🆕 Planta decorativa
│   │   └── index.ts              // 🆕 Export barrel
│   ├── hooks/                     // 🆕 Hooks específicos
│   │   ├── useFloorPlan.ts       // 🆕 State management
│   │   ├── useDragDrop.ts        // 🆕 Drag & drop logic
│   │   └── useElementActions.ts  // 🆕 Context menus
│   └── utils/                     // 🆕 Utilidades
│       ├── elementTypes.ts       // 🆕 Definiciones de tipos
│       ├── nodeFactory.ts        // 🆕 Factory para crear nodos
│       └── persistence.ts        // 🆕 Save/load layout
├── table-floor-plan.tsx          // 🟡 LEGACY - Deprecar gradualmente
└── ... (resto se mantiene)
```

---

## 🛣️ **PLAN DE MIGRACIÓN POR FASES**

### **FASE 1: INFRAESTRUCTURA Y SETUP** ⏱️ 1-2 sprints
**Objetivo**: Establecer base técnica sin afectar funcionalidad actual

#### Deliverables
- [ ] Instalar y configurar React Flow
- [ ] Crear estructura de directorios
- [ ] Setup del nuevo store `useFloorPlanStore`
- [ ] Migración de base de datos (campos adicionales)
- [ ] APIs extendidas para nuevos elementos

#### Tasks Técnicos
```bash
# Instalación
npm install @xyflow/react @xyflow/system

# Database migration
psql -d postgres -c "
  ALTER TABLE restaurante.tables
  ADD COLUMN position_x numeric DEFAULT 0,
  ADD COLUMN position_y numeric DEFAULT 0,
  ADD COLUMN rotation numeric DEFAULT 0,
  ADD COLUMN width numeric DEFAULT 120,
  ADD COLUMN height numeric DEFAULT 80;
"

# Crear tabla elementos
-- SQL schema arriba definido
```

#### Criterios de Aceptación
- [x] React Flow instalado y funcionando
- [x] Base de datos extendida
- [x] APIs básicas funcionando
- [x] No regresiones en funcionalidad actual

#### Risk Mitigation
- **Riesgo**: Conflictos de dependencias
- **Mitigación**: Testing en rama separada, rollback plan

---

### **FASE 2: IMPLEMENTACIÓN PARALELA** ⏱️ 2-3 sprints
**Objetivo**: Implementar React Flow junto al sistema actual

#### Deliverables
- [ ] Componente `ReactFloorPlan` funcional
- [ ] Migración de mesas existentes a React Flow
- [ ] Tab adicional "Vista Avanzada" en UI
- [ ] Elementos básicos: tabla, puerta, barra

#### Task Breakdown

##### **Sprint 1**: Core React Flow
- [ ] `ReactFloorPlan.tsx` - Componente base
- [ ] `TableElement.tsx` - Migrar mesa actual
- [ ] Drag & drop básico funcionando
- [ ] Save/Load desde localStorage

##### **Sprint 2**: Elementos Adicionales
- [ ] `FloorPlanSidebar.tsx` - Paleta de elementos
- [ ] `DoorElement.tsx`, `BarElement.tsx`
- [ ] Context menus básicos
- [ ] Persistencia en base de datos

##### **Sprint 3**: Polish & Integration
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Performance optimization
- [ ] Error handling

#### Criterios de Aceptación
- [x] React Flow funciona junto al sistema actual
- [x] Mesas migradas correctamente
- [x] Elementos básicos añadibles
- [x] Persistencia funcionando

---

### **FASE 3: ELEMENTOS AVANZADOS** ⏱️ 2-3 sprints
**Objetivo**: Añadir elementos arquitectónicos y decorativos

#### Deliverables
- [ ] Categorías completas de elementos
- [ ] Sistema de snapping y alineación
- [ ] Undo/redo functionality
- [ ] Shortcuts de teclado
- [ ] Copy/paste elementos

#### Elementos por Sprint

##### **Sprint 1**: Estructura
- [ ] `WallElement.tsx` - Paredes
- [ ] `WindowElement.tsx` - Ventanas
- [ ] `StairsElement.tsx` - Escaleras
- [ ] `ColumnElement.tsx` - Columnas

##### **Sprint 2**: Operaciones
- [ ] `KitchenElement.tsx` - Cocina
- [ ] `ServiceStationElement.tsx` - Estación de servicio
- [ ] `StorageElement.tsx` - Almacén
- [ ] `BathroomElement.tsx` - Baños

##### **Sprint 3**: Decoración
- [ ] `PlantElement.tsx` - Plantas
- [ ] `ArtworkElement.tsx` - Arte
- [ ] `LightingElement.tsx` - Iluminación
- [ ] Templates pre-definidos

---

### **FASE 4: DEPRECACIÓN Y OPTIMIZACIÓN** ⏱️ 1-2 sprints
**Objetivo**: Reemplazar sistema anterior y optimizar

#### Deliverables
- [ ] Migración completa de usuarios
- [ ] Deprecación del sistema grid
- [ ] Performance optimization
- [ ] Analytics de uso

#### Migration Strategy
```typescript
// Feature flag para migration
const ENABLE_ADVANCED_FLOOR_PLAN = process.env.NEXT_PUBLIC_ENABLE_ADVANCED_FLOOR_PLAN === 'true'

// Backward compatibility
if (ENABLE_ADVANCED_FLOOR_PLAN) {
  return <ReactFloorPlan />
} else {
  return <TableFloorPlan />
}
```

---

## 🧪 **ESTRATEGIA DE TESTING**

### **Unit Testing**
```typescript
// Jest + React Testing Library
describe('ReactFloorPlan', () => {
  test('renders floor plan correctly', () => {})
  test('handles drag and drop', () => {})
  test('saves layout to store', () => {})
})

describe('FloorPlanElements', () => {
  test('TableElement renders with correct props', () => {})
  test('DoorElement handles rotation', () => {})
})
```

### **Integration Testing**
```typescript
// API endpoints
describe('/api/floor-plan', () => {
  test('POST creates new element', () => {})
  test('GET retrieves layout', () => {})
  test('PATCH updates position', () => {})
  test('DELETE removes element', () => {})
})
```

### **E2E Testing**
```typescript
// Playwright
describe('Floor Plan Management', () => {
  test('User can drag table from sidebar', () => {})
  test('User can save and reload layout', () => {})
  test('Context menu works correctly', () => {})
})
```

### **Performance Testing**
- Load testing con 100+ elementos
- Memory leak detection
- Bundle size impact analysis

---

## 📈 **MÉTRICAS DE ÉXITO**

### **Técnicas**
- [ ] **Bundle Size**: < +200KB total
- [ ] **Performance**: < 100ms render time
- [ ] **Coverage**: > 80% test coverage
- [ ] **Accessibility**: WCAG 2.1 AA compliant

### **UX**
- [ ] **Adoption**: > 90% usuarios usan vista avanzada
- [ ] **Satisfaction**: > 4.5/5 rating en feedback
- [ ] **Efficiency**: -50% tiempo para crear layouts
- [ ] **Error Rate**: < 5% errores de usuario

### **Business**
- [ ] **Layout Changes**: +300% cambios de layout realizados
- [ ] **Staff Training**: -70% tiempo de entrenamiento
- [ ] **Flexibility**: Support para 5+ tipos de eventos

---

## ⚠️ **GESTIÓN DE RIESGOS**

### **Riesgos Técnicos**

#### **Alto: Migración de Datos**
- **Impacto**: Pérdida de layouts existentes
- **Probabilidad**: Media
- **Mitigación**:
  - Backup completo antes de migración
  - Script de migración testado
  - Rollback automático en caso de fallo

#### **Medio: Performance Impact**
- **Impacto**: Slowdown en páginas de mesas
- **Probabilidad**: Media
- **Mitigación**:
  - Lazy loading de React Flow
  - Virtualization para muchos elementos
  - Bundle splitting

#### **Bajo: Learning Curve**
- **Impacto**: Adopción lenta por usuarios
- **Probabilidad**: Baja
- **Mitigación**:
  - Templates pre-definidos
  - Tutorial interactivo
  - Documentación detallada

### **Riesgos de Negocio**

#### **Alto: Interrupción del Servicio**
- **Impacto**: Restaurant no puede gestionar mesas
- **Probabilidad**: Baja
- **Mitigación**:
  - Deploy con feature flags
  - Rollback plan < 5 minutos
  - Fallback al sistema anterior

---

## 🚀 **PLAN DE DEPLOYMENT**

### **Estrategia de Release**

#### **Blue-Green Deployment**
```bash
# Paso 1: Deploy a staging
npm run build
npm run deploy:staging

# Paso 2: Smoke tests
npm run test:e2e:staging

# Paso 3: Feature flag activation
curl -X POST /api/feature-flags -d '{"ADVANCED_FLOOR_PLAN": true}'

# Paso 4: Gradual rollout
# 10% -> 50% -> 100% usuarios
```

#### **Rollback Strategy**
```bash
# Rollback inmediato via feature flag
curl -X POST /api/feature-flags -d '{"ADVANCED_FLOOR_PLAN": false}'

# Rollback completo si necesario
git revert HEAD~3..HEAD
npm run deploy:production
```

### **Monitoring & Alerting**
- **Error Rate**: Alert si > 5% errors
- **Performance**: Alert si > 2s load time
- **Usage**: Monitor adoption metrics
- **Database**: Monitor query performance

---

## 📅 **CRONOGRAMA DETALLADO**

| Fase | Sprint | Inicio | Fin | Deliverables |
|------|--------|--------|-----|--------------|
| **1** | 1 | Sem 1 | Sem 2 | Setup técnico, APIs base |
| **1** | 2 | Sem 3 | Sem 4 | Migration scripts, testing |
| **2** | 3 | Sem 5 | Sem 6 | React Flow básico |
| **2** | 4 | Sem 7 | Sem 8 | Elementos básicos |
| **2** | 5 | Sem 9 | Sem 10 | Integration & polish |
| **3** | 6 | Sem 11 | Sem 12 | Elementos estructurales |
| **3** | 7 | Sem 13 | Sem 14 | Elementos operacionales |
| **3** | 8 | Sem 15 | Sem 16 | Elementos decorativos |
| **4** | 9 | Sem 17 | Sem 18 | Migration & optimization |

**Total Estimado**: 18 semanas (4.5 meses)

---

## 💡 **CONCLUSIONES Y PRÓXIMOS PASOS**

### **Beneficios Esperados**
1. **UX Mejorada**: Editor visual intuitivo y flexible
2. **Escalabilidad**: Soporte para cualquier tipo de elemento
3. **Realismo**: Layouts que reflejan el espacio físico real
4. **Eficiencia**: Menor tiempo de setup y cambios

### **Próximos Pasos Inmediatos**
1. [ ] **Approval**: Revisión y aprobación de este plan
2. [ ] **Setup**: Configurar repo branch y environment
3. [ ] **Kickoff**: Sprint planning para Fase 1
4. [ ] **Dependencies**: Instalar React Flow y setup inicial

### **Consideraciones Futuras**
- **Multi-restaurant**: Soporte para múltiples restaurantes
- **3D View**: Posible evolución a vista 3D
- **Mobile**: Versión optimizada para tablets
- **AI**: Auto-layout suggestions basadas en ML

---

## 📋 **APÉNDICES**

### **A. Dependency Analysis**
```json
{
  "new_dependencies": {
    "@xyflow/react": "^12.0.0",
    "@xyflow/system": "^0.4.0"
  },
  "bundle_impact": "+180KB gzipped",
  "breaking_changes": "None - backward compatible"
}
```

### **B. API Specification**
```typescript
// GET /api/floor-plan/elements
interface GetElementsResponse {
  success: boolean
  elements: FloorPlanElement[]
  version: string
}

// POST /api/floor-plan/elements
interface CreateElementRequest {
  type: ElementType
  position: { x: number, y: number }
  size: { width: number, height: number }
  data: Record<string, any>
}
```

### **C. Migration Scripts**
```sql
-- Detailed migration scripts available in
-- /migrations/floor-plan-evolution/
```

---

**Documento preparado por**: Equipo de Desarrollo Frontend
**Revisado por**: Tech Lead, Product Owner
**Fecha última revisión**: 2025-01-15
**Próxima revisión**: Semana 4 (tras Fase 1)

---

> 🔗 **Links Relacionados**:
> - [React Flow Documentation](https://reactflow.dev)
> - [Enigma Database Schema](/docs/database-schema.md)
> - [UI Component Library](/docs/ui-components.md)
> - [Testing Strategy](/docs/testing-guidelines.md)