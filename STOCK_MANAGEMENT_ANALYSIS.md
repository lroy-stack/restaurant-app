# 📦 STOCK MANAGEMENT SYSTEM - ANÁLISIS Y DISEÑO

**Fecha**: 2025-10-01
**Objetivo**: Implementar gestión automática de stock influenciada por comandas

---

## 🔍 ESTADO ACTUAL

### Database Schema
```sql
restaurante.menu_items
  - stock           integer NOT NULL DEFAULT 0
  - isAvailable     boolean NOT NULL DEFAULT true
```

### Flujos sin gestión de stock
1. ❌ **Creación orden** (`qr-menu-app/api/orders/route.ts:55-90`)
   - Valida `isAvailable`
   - NO valida stock
   - NO resta stock

2. ❌ **Cambio estado orden** (`enigma-app/api/orders/[orderId]/status/route.ts`)
   - Actualiza status
   - NO devuelve stock en CANCELLED

---

## 🎯 DISEÑO DE SOLUCIÓN

### Principios
1. **Atomic Operations**: Stock updates en transacciones
2. **Pessimistic Locking**: Prevent race conditions
3. **Status-driven**: Stock solo se reserva en PENDING, se libera en CANCELLED
4. **Idempotent**: Múltiples calls mismo estado = mismo resultado

### Estados y Stock Flow
```
PENDING    → Stock RESERVADO (restar)
CONFIRMED  → Stock ya reservado (no cambio)
PREPARING  → Stock ya reservado (no cambio)
READY      → Stock ya reservado (no cambio)
SERVED     → Stock CONSUMIDO (no cambio - ya reservado)
CANCELLED  → Stock LIBERADO (devolver)
```

---

## 📋 IMPLEMENTACIÓN

### FASE 1: Validación y Reserva en Creación de Orden

**Archivo**: `qr-menu-app/src/app/api/orders/route.ts`

**Cambios**:
1. Agregar `stock` al SELECT de menu_items (línea 58)
2. Validar stock suficiente (después línea 90)
3. Restar stock en transacción (después insert order_items)

```typescript
// 1. Fetch con stock
const { data: menuItems } = await supabase
  .schema('restaurante')
  .from('menu_items')
  .select('id, name, nameEn, price, isAvailable, stock')
  .in('id', menuItemIds)

// 2. Validar stock
for (const orderItem of items) {
  const menuItem = menuItems?.find(mi => mi.id === orderItem.menuItemId)
  const quantity = parseInt(orderItem.quantity) || 1

  if (menuItem.stock < quantity) {
    return NextResponse.json({
      error: `Stock insuficiente para ${menuItem.name}. Disponible: ${menuItem.stock}, solicitado: ${quantity}`
    }, { status: 400 })
  }
}

// 3. Restar stock (después de crear order_items)
for (const orderItem of items) {
  await supabase
    .schema('restaurante')
    .from('menu_items')
    .update({
      stock: supabase.sql`stock - ${orderItem.quantity}`
    })
    .eq('id', orderItem.menuItemId)
    .gte('stock', orderItem.quantity) // Safety check
}
```

### FASE 2: Devolución en Cancelación

**Archivo**: `enigma-app/src/app/api/orders/[orderId]/status/route.ts`

**Cambios**:
1. Detectar cambio a CANCELLED
2. Fetch order_items
3. Devolver stock

```typescript
// Después de línea 39 (update order status)
if (status === 'CANCELLED') {
  // Fetch order items
  const { data: orderItems } = await supabase
    .schema('restaurante')
    .from('order_items')
    .select('menuItemId, quantity')
    .eq('orderId', orderId)

  // Devolver stock
  if (orderItems) {
    for (const item of orderItems) {
      await supabase
        .schema('restaurante')
        .from('menu_items')
        .update({
          stock: supabase.sql`stock + ${item.quantity}`
        })
        .eq('id', item.menuItemId)
    }
  }
}
```

### FASE 3: Auto-disable cuando stock = 0

**Trigger PostgreSQL** (opcional pero recomendado):
```sql
CREATE OR REPLACE FUNCTION restaurante.auto_disable_on_zero_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= 0 THEN
    NEW."isAvailable" := false;
  ELSIF NEW.stock > 0 AND OLD.stock <= 0 THEN
    NEW."isAvailable" := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_disable_stock
BEFORE UPDATE OF stock ON restaurante.menu_items
FOR EACH ROW
EXECUTE FUNCTION restaurante.auto_disable_on_zero_stock();
```

---

## 🚨 EDGE CASES

### 1. Orden parcialmente disponible
**Problema**: 3 items en orden, solo 2 tienen stock
**Solución**: Validar TODO antes de crear orden. All-or-nothing.

### 2. Race condition (2 usuarios piden último item)
**Solución**: Usar `supabase.sql` con operación atómica
```typescript
.update({ stock: supabase.sql`stock - ${quantity}` })
.gte('stock', quantity) // Solo actualiza si hay suficiente
```

### 3. Orden cancelada parcialmente (item cancelado, no orden completa)
**Problema actual**: No hay endpoint para cancelar item individual
**Solución futura**: Si se implementa, devolver stock del item específico

### 4. Admin edita stock manualmente
**Solución**: Trigger auto-disable protege. Admin responsable de activar/desactivar.

---

## 📊 TESTING PLAN

### Test Cases
```bash
# TC1: Orden normal con stock suficiente
POST /api/orders { items: [{ menuItemId: X, quantity: 2 }] }
Expect: stock -= 2, order created

# TC2: Orden sin stock suficiente
POST /api/orders { items: [{ menuItemId: X, quantity: 100 }] }
Expect: 400 error, stock unchanged

# TC3: Cancelación devuelve stock
PATCH /api/orders/[id]/status { status: 'CANCELLED' }
Expect: stock += quantity original

# TC4: Stock = 0 auto-disable
Update menu_items SET stock = 0
Expect: isAvailable = false

# TC5: Race condition
2 requests simultáneos con último item
Expect: Solo 1 succeed, el otro 400 error
```

---

## ⚠️ CONSIDERACIONES

### Performance
- **Costo**: +1 query por item en orden (UPDATE stock)
- **Mitigation**: Batch updates si performance issue

### Data Integrity
- **Rollback**: Si order_items insert falla, stock ya restado → Usar transacciones
- **Solution**: Wrap en transaction explícita

### UX
- **Feedback**: UI debe mostrar stock disponible en carta
- **Real-time**: Considerar refetch después de agregar al carrito

---

## 🔄 MIGRACIÓN

### Script para ajustar stock actual basado en órdenes activas
```sql
-- Calcular stock "reservado" por órdenes activas
WITH reserved AS (
  SELECT
    oi."menuItemId",
    SUM(oi.quantity) as reserved_quantity
  FROM restaurante.order_items oi
  JOIN restaurante.orders o ON oi."orderId" = o.id
  WHERE o.status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY')
  GROUP BY oi."menuItemId"
)
SELECT
  mi.id,
  mi.name,
  mi.stock as current_stock,
  COALESCE(r.reserved_quantity, 0) as reserved,
  mi.stock - COALESCE(r.reserved_quantity, 0) as available
FROM restaurante.menu_items mi
LEFT JOIN reserved r ON mi.id = r."menuItemId"
WHERE mi.stock > 0
ORDER BY available;
```

---

## ✅ CHECKLIST IMPLEMENTACIÓN

### Backend
- [ ] qr-menu-app: Agregar validación stock en POST /api/orders
- [ ] qr-menu-app: Restar stock al crear orden
- [ ] enigma-app: Devolver stock en PATCH status → CANCELLED
- [ ] Testing: Verificar race conditions
- [ ] Testing: Verificar rollback en failures

### Database
- [ ] Crear trigger auto_disable_on_zero_stock
- [ ] Script migration para ajustar stock actual
- [ ] Backup antes de migration

### Frontend (futuro)
- [ ] qr-menu-app: Mostrar stock disponible
- [ ] qr-menu-app: Deshabilitar botón "Agregar" si stock = 0
- [ ] enigma-app: Dashboard stock alerts
- [ ] enigma-app: Manual stock adjustment UI

---

**Generado**: 2025-10-01
**Versión**: 1.0.0
