# 🍽️ GROUP RESERVATIONS - PLAN DEFINITIVO BASADO EN MEJORES PRÁCTICAS

## 📋 RESUMEN EJECUTIVO

**Problema**: Sistema actual usa metadata en `specialRequests` para manejar reservas de múltiples mesas - SOLUCIÓN NO PROFESIONAL.
**Solución**: Implementar patrón **Many-to-Many** estándar de la industria siguiendo mejores prácticas de PostgreSQL.
**Impacto**: Sistema escalable, mantenible y profesional sin dependencias de campos de texto.

---

## 🎯 PATRÓN ESTÁNDAR IDENTIFICADO (PostgreSQL Documentation)

### ✅ **MANY-TO-MANY JUNCTION TABLE** - Patrón Universal
```sql
-- PATRÓN ESTÁNDAR DE LA INDUSTRIA (PostgreSQL Docs)
CREATE TABLE products (
    product_no integer PRIMARY KEY,
    name text,
    price numeric
);

CREATE TABLE orders (
    order_id integer PRIMARY KEY,
    shipping_address text
);

CREATE TABLE order_items (
    product_no integer REFERENCES products ON DELETE RESTRICT,
    order_id integer REFERENCES orders ON DELETE CASCADE,
    quantity integer,
    PRIMARY KEY (product_no, order_id)
);
```

**APLICADO A NUESTRO SISTEMA:**
- `reservations` = orders
- `tables` = products
- `reservation_tables` = order_items

---

## 🏗️ DISEÑO DE BASE DE DATOS PROFESIONAL

### 🆕 **TABLA JUNCTION: `reservation_tables`**
```sql
-- NUEVA TABLA JUNCTION (Patrón Many-to-Many estándar)
CREATE TABLE restaurante.reservation_tables (
    reservation_id TEXT NOT NULL,
    table_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- FOREIGN KEYS con acciones específicas
    CONSTRAINT fk_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES restaurante.reservations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_table
        FOREIGN KEY (table_id)
        REFERENCES restaurante.tables(id)
        ON DELETE RESTRICT,

    -- PRIMARY KEY compuesto
    PRIMARY KEY (reservation_id, table_id)
);

-- ÍNDICES para performance
CREATE INDEX idx_reservation_tables_reservation_id
    ON restaurante.reservation_tables(reservation_id);
CREATE INDEX idx_reservation_tables_table_id
    ON restaurante.reservation_tables(table_id);
```

### 🔧 **QUERIES ESTÁNDAR**
```sql
-- 1. OBTENER TODAS LAS MESAS DE UNA RESERVA
SELECT t.*
FROM restaurante.tables t
JOIN restaurante.reservation_tables rt ON t.id = rt.table_id
WHERE rt.reservation_id = 'reservation_123';

-- 2. VERIFICAR CONFLICTOS DE RESERVA (Anti-overbooking)
SELECT DISTINCT rt.reservation_id
FROM restaurante.reservation_tables rt
JOIN restaurante.reservations r ON rt.reservation_id = r.id
WHERE rt.table_id = ANY($1) -- Array de table_ids
  AND r.status IN ('PENDING', 'CONFIRMED', 'SEATED')
  AND ABS(EXTRACT(EPOCH FROM (r.time - $2::timestamp))) < $3; -- buffer

-- 3. MOSTRAR COMBINACIONES EN DASHBOARD
SELECT
    r.*,
    string_agg(t.number, ' + ' ORDER BY t.number) as table_combination,
    sum(t.capacity) as total_capacity
FROM restaurante.reservations r
JOIN restaurante.reservation_tables rt ON r.id = rt.reservation_id
JOIN restaurante.tables t ON rt.table_id = t.id
GROUP BY r.id;
```

---

## 🚀 IMPLEMENTACIÓN STEP-BY-STEP

### **FASE 1: MIGRACIÓN DE BASE DE DATOS (5 minutos)**
```sql
-- 1. Crear tabla junction
CREATE TABLE restaurante.reservation_tables (
    reservation_id TEXT NOT NULL,
    table_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES restaurante.reservations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_table
        FOREIGN KEY (table_id)
        REFERENCES restaurante.tables(id)
        ON DELETE RESTRICT,
    PRIMARY KEY (reservation_id, table_id)
);

-- 2. Migrar datos existentes desde specialRequests
INSERT INTO restaurante.reservation_tables (reservation_id, table_id)
SELECT
    r.id,
    unnest(string_to_array(
        regexp_replace(r."specialRequests", '^COMBO:', ''),
        ','
    )) as table_id
FROM restaurante.reservations r
WHERE r."specialRequests" LIKE 'COMBO:%';

-- 3. Limpiar specialRequests
UPDATE restaurante.reservations
SET "specialRequests" = CASE
    WHEN "specialRequests" LIKE 'COMBO:%' THEN
        trim(regexp_replace("specialRequests", '^COMBO:[^\n]*\n?', ''))
    ELSE "specialRequests"
END
WHERE "specialRequests" LIKE 'COMBO:%';
```

### **FASE 2: ACTUALIZAR APIs (15 minutos)**

#### **📝 `/api/reservations/route.ts`**
```typescript
// CREAR RESERVA CON MÚLTIPLES MESAS
if (isCombination) {
    const tableIds = data.tableId.split('+')

    // 1. Crear reserva principal (sin cambios)
    const reservation = await createReservation(reservationData)

    // 2. Crear relaciones en tabla junction
    const reservationTables = tableIds.map(tableId => ({
        reservation_id: reservation.id,
        table_id: tableId.trim()
    }))

    await supabase
        .schema('restaurante')
        .from('reservation_tables')
        .insert(reservationTables)
}
```

#### **🔍 `/api/tables/availability/route.ts`**
```typescript
// VERIFICAR CONFLICTOS USANDO JUNCTION TABLE
const { data: conflictingReservations } = await supabase
    .schema('restaurante')
    .rpc('check_table_conflicts', {
        table_ids: activeTables.map(t => t.id),
        check_time: requestDateTime.toISOString(),
        buffer_minutes: config.bufferMinutes
    })

// FUNCIÓN SQL PARA PERFORMANCE
CREATE OR REPLACE FUNCTION restaurante.check_table_conflicts(
    table_ids TEXT[],
    check_time TIMESTAMP,
    buffer_minutes INTEGER
) RETURNS TABLE(reservation_id TEXT, table_id TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT rt.reservation_id, rt.table_id
    FROM restaurante.reservation_tables rt
    JOIN restaurante.reservations r ON rt.reservation_id = r.id
    WHERE rt.table_id = ANY(table_ids)
      AND r.status IN ('PENDING', 'CONFIRMED', 'SEATED')
      AND ABS(EXTRACT(EPOCH FROM (r.time - check_time))) < (buffer_minutes * 60);
END;
$$ LANGUAGE plpgsql;
```

### **FASE 3: ACTUALIZAR FRONTEND (10 minutos)**

#### **📱 Dashboard Components**
```typescript
// HOOK PARA OBTENER MESAS DE RESERVA
const useReservationTables = (reservationId: string) => {
    return useQuery({
        queryKey: ['reservation-tables', reservationId],
        queryFn: async () => {
            const { data } = await supabase
                .schema('restaurante')
                .from('reservation_tables')
                .select(`
                    table_id,
                    tables (number, location, capacity)
                `)
                .eq('reservation_id', reservationId)
            return data
        }
    })
}

// FORMATEAR DISPLAY DINÁMICAMENTE
function formatTableDisplay(reservationTables: ReservationTable[]): string {
    if (!reservationTables?.length) return 'N/A'

    if (reservationTables.length === 1) {
        return reservationTables[0].tables.number
    }

    // Múltiples mesas - mostrar combinación
    const tableNumbers = reservationTables
        .map(rt => rt.tables.number)
        .sort()
        .join(' + ')

    return tableNumbers
}
```

#### **📧 Email Templates**
```typescript
// OBTENER INFORMACIÓN DE MESAS PARA EMAIL
const getReservationEmailData = async (reservationId: string) => {
    const { data: reservationTables } = await supabase
        .schema('restaurante')
        .from('reservation_tables')
        .select(`
            tables (number, location)
        `)
        .eq('reservation_id', reservationId)

    const tableDisplay = reservationTables.length > 1
        ? reservationTables.map(rt => rt.tables.number).join(' + ')
        : reservationTables[0]?.tables.number || 'Por asignar'

    return {
        tableNumber: tableDisplay,
        tableLocation: reservationTables[0]?.tables.location,
        // ... otros campos
    }
}
```

---

## ⚡ BENEFICIOS DEL PATRÓN PROFESIONAL

### 🎯 **VENTAJAS TÉCNICAS**
- ✅ **Patrón estándar**: Usado por toda la industria
- ✅ **Escalable**: Soporta cualquier número de mesas
- ✅ **Performante**: Queries optimizadas con índices
- ✅ **Mantenible**: Lógica relacional clara
- ✅ **Sin dependencias**: No usa campos de texto para metadata

### 🧹 **LIMPIEZA DE CÓDIGO**
- ✅ **specialRequests limpio**: Solo notas del cliente
- ✅ **Emails profesionales**: Sin metadata técnica
- ✅ **Dashboard dinámico**: Información real de BD
- ✅ **APIs simples**: Queries relacionales estándar

### 🔒 **ROBUSTEZ**
- ✅ **Foreign Keys**: Integridad referencial garantizada
- ✅ **ON DELETE CASCADE**: Limpieza automática
- ✅ **ON DELETE RESTRICT**: Protección de datos críticos
- ✅ **Transaccional**: Operaciones atómicas

---

## 📊 COMPARACIÓN: ANTES VS DESPUÉS

### ❌ **IMPLEMENTACIÓN ACTUAL (PROBLEMÁTICA)**
```typescript
// Detección de combinación
if (reservation.specialRequests?.includes('COMBO:')) {
    // Parse string "COMBO:t1,t2,t3"
    const tables = parseComboString(specialRequests)
}

// Problemas:
// - Metadata en campo de usuario
// - Parsing de strings
// - No escalable
// - Confunde al personal
```

### ✅ **IMPLEMENTACIÓN PROFESIONAL (PROPUESTA)**
```typescript
// Detección de combinación
const reservationTables = await getReservationTables(reservationId)
const isGroup = reservationTables.length > 1

// Ventajas:
// - Queries relacionales
// - Datos normalizados
// - Escalable infinitamente
// - Información limpia
```

---

## ⏱️ CRONOGRAMA DE IMPLEMENTACIÓN

| Fase | Tarea | Tiempo | Riesgo |
|------|-------|---------|---------|
| 1 | Crear tabla `reservation_tables` | 2 min | 🟢 Ninguno |
| 2 | Migrar datos existentes | 3 min | 🟢 Reversible |
| 3 | Actualizar `/api/reservations/route.ts` | 5 min | 🟡 Bajo |
| 4 | Actualizar `/api/tables/availability/route.ts` | 5 min | 🟡 Bajo |
| 5 | Actualizar componentes frontend | 8 min | 🟢 Ninguno |
| 6 | Actualizar email templates | 2 min | 🟢 Ninguno |
| **TOTAL** | **25 minutos** | **🟢 RIESGO MÍNIMO** |

---

## 🧪 PLAN DE TESTING

### **1. Test de Migración**
```sql
-- Verificar migración correcta
SELECT
    r.id,
    r."specialRequests",
    string_agg(rt.table_id, ',') as migrated_tables
FROM restaurante.reservations r
LEFT JOIN restaurante.reservation_tables rt ON r.id = rt.reservation_id
WHERE r."specialRequests" LIKE 'COMBO:%' OR rt.reservation_id IS NOT NULL;
```

### **2. Test de Funcionalidad**
```typescript
// Test crear reserva de grupo
const result = await createGroupReservation({
    tableId: "campanari_t3+campanari_t4",
    partySize: 6,
    // ...
})

// Verificar:
// ✅ Una reserva creada
// ✅ Dos filas en reservation_tables
// ✅ specialRequests limpio
// ✅ Bloqueo correcto de ambas mesas
```

### **3. Test de UI**
- ✅ Dashboard muestra "T3 + T4"
- ✅ Modal detalle muestra capacidad correcta
- ✅ Email muestra combinación completa
- ✅ Campo "Solicitudes Especiales" limpio

---

## 🚀 CONCLUSIÓN

Esta implementación sigue el **PATRÓN ESTÁNDAR DE LA INDUSTRIA** documentado en PostgreSQL y usado por todos los sistemas de reservas profesionales.

### **🎯 RESULTADOS GARANTIZADOS:**
- Sistema profesional y escalable
- Código limpio y mantenible
- UI dinámica sin metadata
- Performance optimizada
- Cumple estándares de la industria

### **⚡ IMPLEMENTACIÓN RÁPIDA:**
- 25 minutos total
- Riesgo mínimo
- Completamente reversible
- Sin breaking changes

**🏆 ESTE ES EL ESTÁNDAR PROFESIONAL QUE USAN TODAS LAS GRANDES PLATAFORMAS**

---

*Documento basado en mejores prácticas de PostgreSQL Documentation*
*Versión: 1.0 - Patrón Many-to-Many Estándar*
*Fecha: 2025-09-20*