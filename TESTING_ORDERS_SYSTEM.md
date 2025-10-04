# Testing Real-Time Orders System

## ✅ Fixes Applied

### 1. QueryClient Provider
**Issue**: "No QueryClient set, use QueryClientProvider to set one"
**Solution**: Added `QueryProvider` to dashboard layout

```tsx
// src/app/(admin)/dashboard/layout.tsx
<QueryProvider>
  <div className="h-screen bg-background">
    {children}
  </div>
</QueryProvider>
```

### 2. Realtime Configuration
**Verified**: Supabase Realtime enabled for:
- `restaurante.orders` table
- `restaurante.order_items` table

## 🧪 Testing Steps

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Orders Page
```
http://localhost:3000/dashboard/pedidos
```

**Expected**:
- ✅ Page loads without errors
- ✅ Connection status shows "En línea" (green Wifi icon)
- ✅ Statistics cards display (Active Orders, In Kitchen, Ready, Prep Time)
- ✅ Kanban board shows 4 columns: PENDING, CONFIRMED, PREPARING, READY
- ✅ No console errors

### 3. Test Real-Time Connection

**Check Browser DevTools**:
```javascript
// Network Tab → Filter: WS
// Should see WebSocket connection to Supabase Realtime
// Status: 101 Switching Protocols
```

**Console output**:
```
[Realtime] Successfully subscribed to orders-rest_enigma_001-[timestamp]
[Realtime] Subscription status: SUBSCRIBED
```

### 4. Test POS Order Creation

**Navigate to**:
```
http://localhost:3000/dashboard/pedidos/nuevo
```

**Steps**:
1. Select a table from dropdown (e.g., "Mesa S1 - Principal")
2. Search for a product or browse categories
3. Click on a product to add to cart
4. Adjust quantity with +/- buttons
5. Add notes if needed
6. Click "Crear Pedido"

**Expected**:
- ✅ Success toast: "Pedido ENI-YYMMDD-XXXXXX creado"
- ✅ Redirect to `/dashboard/pedidos`
- ✅ New order appears in PENDING column
- ✅ Cart clears automatically

### 5. Test Drag-and-Drop

**On Kanban board**:
1. Click and hold an order card in PENDING column
2. Drag to CONFIRMED column
3. Release

**Expected**:
- ✅ Order moves to new column
- ✅ Status badge updates color
- ✅ Optimistic update (immediate visual feedback)
- ✅ Database updated (check with refresh)

**Valid transitions**:
- PENDING → CONFIRMED ✅
- CONFIRMED → PREPARING ✅
- PREPARING → READY ✅
- READY → SERVED ✅
- Any → CANCELLED ✅

**Invalid transitions** (should show error):
- READY → PENDING ❌
- SERVED → READY ❌

### 6. Test Real-Time Updates (2 Browsers)

**Browser 1**:
- Open `/dashboard/pedidos`

**Browser 2**:
- Open `/dashboard/pedidos/nuevo`
- Create a new order

**Expected in Browser 1**:
- ✅ New order appears automatically in PENDING column
- ✅ No manual refresh needed
- ✅ Statistics update

**Browser 2**:
- Drag an order to different status

**Expected in Browser 1**:
- ✅ Order moves to new column in real-time
- ✅ Statistics update

### 7. Test Stock Validation

**Create order with high quantity**:
1. Go to `/dashboard/pedidos/nuevo`
2. Select a product
3. Set quantity higher than stock (e.g., 100)
4. Try to create order

**Expected**:
- ✅ Error toast: "Stock insuficiente"
- ✅ Detailed error showing requested vs available
- ✅ Order NOT created
- ✅ Stock unchanged

### 8. Test Order Cancellation

**On Kanban board**:
1. Click "Cancelar" button on any active order

**Expected**:
- ✅ Order moves to CANCELLED status (or disappears if activeOnly filter)
- ✅ Success toast
- ✅ Stock returned to inventory (verify in menu page)

### 9. Test Urgent Order Indicator

**Check orders older than 30 minutes**:
- ✅ Red border on left side of card
- ✅ Red alert bar at top: "¡Orden urgente! - hace X minutos"
- ✅ Full-width red alert if any order >30min:
  "¡Atención! Hay pedidos esperando más de X minutos"

### 10. Test Responsive Design

**Mobile (375px)**:
- ✅ Kanban columns stack vertically
- ✅ Cart sidebar becomes bottom sheet in POS
- ✅ Touch targets ≥ 44x44px
- ✅ Navigation via FloatingNav

**Tablet (768px)**:
- ✅ 2 Kanban columns visible
- ✅ Stats cards in grid
- ✅ Product grid responsive

**Desktop (1024px+)**:
- ✅ 4 Kanban columns side-by-side
- ✅ Full POS split view (60% products, 40% cart)

## 🔍 Troubleshooting

### Error: "No QueryClient set"
**Solution**: Restart dev server after adding QueryProvider

### WebSocket Connection Fails
**Check**:
1. Environment variables set:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://supabase.enigmaconalma.com
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
2. Supabase Realtime enabled:
   ```sql
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime'
   AND tablename = 'orders';
   ```

### Orders Not Appearing
**Check**:
1. `restaurantId` matches: `rest_enigma_001`
2. Status filter active (excludes SERVED/CANCELLED)
3. Browser console for errors
4. Database query:
   ```sql
   SELECT * FROM restaurante.orders
   WHERE status IN ('PENDING','CONFIRMED','PREPARING','READY')
   ORDER BY "orderedAt" DESC;
   ```

### Drag-and-Drop Not Working
**Check**:
1. Order has stable `id` (not array index)
2. No console errors from dnd-kit
3. Browser supports Pointer Events
4. Not running in Turbopack strict mode (known issue)

### Stock Not Updating
**Check**:
1. RPC functions exist:
   ```sql
   SELECT proname FROM pg_proc
   WHERE proname IN ('decrease_menu_item_stock', 'increase_menu_item_stock');
   ```
2. menu_items has stock column:
   ```sql
   SELECT stock FROM restaurante.menu_items LIMIT 1;
   ```

### Real-Time Not Updating
**Check**:
1. WebSocket connection active (Network tab)
2. Channel subscription successful (Console)
3. RLS policies allow service_role:
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'orders'
   AND policyname = 'service_role_all_orders';
   ```

## 📊 Performance Benchmarks

**Expected Metrics**:
- Page Load: < 2s
- Real-time Latency: < 500ms
- Drag-and-Drop: 60fps (no jank)
- Order Creation: < 3s total
- API Response: < 200ms

**Monitor**:
```javascript
// Browser DevTools → Performance tab
// Record interaction
// Check for:
// - Long tasks (> 50ms)
// - Layout shifts (CLS)
// - Memory leaks
```

## ✅ Success Criteria

- [ ] All pages load without errors
- [ ] Real-time updates working (<500ms)
- [ ] Drag-and-drop smooth (60fps)
- [ ] Order creation complete in <30s
- [ ] Stock validation prevents overselling
- [ ] Mobile responsive (tested on real device)
- [ ] No console errors in production build
- [ ] WebSocket connection stable (no disconnects)

## 🚀 Next Steps

After validation:
1. Test with real menu data
2. Verify email notifications (if enabled)
3. Load test with 50+ concurrent orders
4. Cross-browser testing (Chrome, Firefox, Safari)
5. Accessibility audit (keyboard navigation, screen readers)
6. Performance audit (Lighthouse score >90)
