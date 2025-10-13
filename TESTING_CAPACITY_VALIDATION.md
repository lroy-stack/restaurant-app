# Testing Guide: Table Capacity Validation

**Feature**: Validación robusta de capacidad de mesas en reservas
**Branch**: `feature/table-capacity-validation`
**Feature Flag**: `NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION` (default: `false`)

---

## 🚀 Cómo Activar la Feature

### Opción 1: Variable de entorno
```bash
# Crear/editar .env.local
echo "NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION=true" >> .env.local

# Reiniciar servidor
npm run dev
```

### Opción 2: Temporalmente (sin commit)
```typescript
// En src/hooks/useCapacityValidation.ts línea 23
enabled: true  // ← Cambiar de process.env... a hardcoded true
```

---

## 🧪 Casos de Prueba

### Setup Inicial
```bash
# 1. Asegúrate de estar en la rama correcta
git branch
# → debe mostrar: * feature/table-capacity-validation

# 2. Instala dependencias (si hay cambios)
npm install

# 3. Inicia el servidor
npm run dev

# 4. Navega a: http://localhost:3001/reservas
```

---

## 📋 Matriz de Testing

### **Test 1: Validación básica - 2 personas**

**Setup**:
- Party size: **2 personas**
- Feature flag: **ON**

**Comportamiento esperado**:

| Mesa | Capacidad | Resultado Esperado | Razón |
|------|-----------|-------------------|-------|
| T1   | 2 pax     | ✅ Seleccionable (verde) | Perfecta |
| T2   | 2 pax     | ✅ Seleccionable (verde) | Perfecta |
| T3   | 3 pax     | ⚠️ Seleccionable (amarillo warning) | Dentro buffer 50% |
| T4   | 4 pax     | ❌ BLOQUEADA (gris) | Excede buffer >50% |
| T5   | 6 pax     | ❌ BLOQUEADA (gris) | Excede buffer >50% |

**Acciones**:
1. Selecciona mesa T1 (2 pax) ✅
2. Intenta agregar mesa T2 ❌ → debe mostrar toast: "Ya tienes capacidad suficiente"
3. Intenta seleccionar mesa T4 directamente ❌ → debe mostrar toast: "Mesa demasiado grande"

---

### **Test 2: Validación media - 4 personas**

**Setup**:
- Party size: **4 personas**
- Feature flag: **ON**

**Comportamiento esperado**:

| Mesa | Capacidad | Resultado Esperado |
|------|-----------|-------------------|
| T1-T3| 2-3 pax   | ❌ BLOQUEADA (capacidad insuficiente individual) |
| T4   | 4 pax     | ✅ Seleccionable (verde) - PERFECTA |
| T5   | 5 pax     | ⚠️ Seleccionable (amarillo) - 25% extra |
| T6   | 6 pax     | ⚠️ Seleccionable (amarillo) - 50% extra (límite) |
| T8   | 8 pax     | ❌ BLOQUEADA - Excede 50% buffer |

**Acciones**:
1. Selecciona mesa T4 (4 pax) ✅
2. Ve el banner verde: "Capacidad apropiada para tu grupo" ✅
3. Intenta agregar mesa T1 ❌ → toast: "Ya tienes capacidad suficiente"
4. Click "Continuar" ✅ → debe funcionar

---

### **Test 3: Combinación de mesas - 6 personas**

**Setup**:
- Party size: **6 personas**
- Feature flag: **ON**

**Comportamiento esperado**:
- Mesa individual de 6 pax ✅ (si existe)
- Mesa de 4 + mesa de 2 = 6 ✅ (combinación válida)
- Mesa de 4 + mesa de 4 = 8 ⚠️ (dentro de buffer pero warning)
- Mesa de 6 + mesa de 2 = 8 ❌ → bloqueado al intentar agregar segunda

**Acciones**:
1. Si no hay mesa de 6, selecciona mesa de 4 pax
2. Debe permitir agregar mesa de 2 pax ✅
3. Total: 6 pax → banner verde ✅
4. Click "Continuar" ✅

---

### **Test 4: Feature Flag OFF (Backward Compatibility)**

**Setup**:
- Party size: **2 personas**
- Feature flag: **OFF** (comentar en .env.local o poner `false`)

**Comportamiento esperado**:
- ✅ TODAS las mesas disponibles (sin restricciones)
- ✅ Permite seleccionar mesa de 8 pax para 2 personas
- ✅ Permite seleccionar múltiples mesas sin límite de capacidad
- ⚠️ Solo muestra warning si capacidad < partySize (comportamiento actual)

**Acciones**:
1. Selecciona mesa T8 (8 pax) para 2 personas ✅ → debe funcionar
2. Agrega otra mesa ✅ → debe funcionar
3. Click "Continuar" ✅ → funciona igual que antes

---

### **Test 5: Validación final en botón "Continuar"**

**Setup**:
- Party size: **4 personas**
- Feature flag: **ON**

**Casos de prueba**:

**A. Capacidad insuficiente**:
1. Selecciona mesa T1 (2 pax)
2. Click "Continuar" ❌
3. Debe mostrar error: "Capacidad insuficiente. Necesitas 4 personas, tienes 2"

**B. Capacidad excesiva** (si logras burlar validación frontend):
1. Mock: selectedTables = [T4, T6] = 10 pax
2. Click "Continuar" ❌
3. Debe mostrar error: "Capacidad excesiva. Máximo permitido: 6 personas para tu grupo de 4"

**C. Capacidad correcta**:
1. Selecciona mesa T4 (4 pax)
2. Click "Continuar" ✅
3. Debe avanzar al paso 2

---

### **Test 6: Responsive & Dark Mode**

**Setup**:
- Device: Mobile (iPhone SE 375px)
- Theme: Dark mode

**Acciones**:
1. Cambia a dark mode (si tienes theme switcher)
2. Mesas bloqueadas deben verse grises con buen contraste ✅
3. Banner de "Capacidad apropiada" debe verse verde oscuro ✅
4. Warnings deben verse amarillo oscuro ✅
5. Toasts deben tener buena legibilidad ✅

---

### **Test 7: UX Messages (Multiidioma)**

**Setup**:
- Idioma: Español, Inglés, Alemán
- Party size: 2 personas
- Feature flag: ON

**Validar mensajes en cada idioma**:
- Toast de mesa bloqueada
- Banner de capacidad apropiada
- Warning de capacidad insuficiente
- Error al continuar

---

## 🐛 Checklist de Bugs Potenciales

Durante el testing, verifica:

- [ ] Toasts no se solapan entre sí
- [ ] Las mesas no parpadean al seleccionar/deseleccionar
- [ ] El banner verde/amarillo aparece inmediatamente
- [ ] Feature flag OFF funciona 100% como antes
- [ ] No hay console.errors en DevTools
- [ ] Validación funciona con diferentes party sizes (1-10 personas)
- [ ] Combinación de mesas se valida correctamente
- [ ] Click en mesa bloqueada no hace nada (no crash)
- [ ] Limpiar selección funciona correctamente
- [ ] Deseleccionar mesa actualiza validación de otras mesas

---

## 📊 Resultados Esperados

### ✅ Con Feature Flag ON:
- Mesas apropiadas seleccionables
- Mesas grandes bloqueadas visualmente
- Feedback inmediato con toasts
- Validación en "Continuar" funciona
- Mejor UX (menos opciones confusas)

### ✅ Con Feature Flag OFF:
- **IDÉNTICO** al comportamiento actual
- Sin cambios en funcionalidad
- Sin restricciones adicionales
- Producción no se ve afectada

---

## 📸 Screenshots Esperados

### Estado 1: Mesas disponibles (2 pax, flag ON)
```
┌─────┬─────┬─────┬─────┬─────┐
│ T1  │ T2  │ T3  │ T4  │ T5  │
│ 2pax│ 2pax│ 3pax│ 4pax│ 6pax│
│ ✅  │ ✅  │ ⚠️  │ ❌  │ ❌  │
│Verde│Verde│Amar │Gris │Gris │
└─────┴─────┴─────┴─────┴─────┘
```

### Estado 2: Mesa seleccionada (4 pax, flag ON)
```
┌─────────────────────────────┐
│ ✅ 1 mesa seleccionada      │
│ 👥 Capacidad total: 4 pax   │
│                             │
│ 🟢 Capacidad apropiada      │
│    Grupo: 4 • Cap: 4        │
│    Rango: 4-6               │
└─────────────────────────────┘
```

---

## 🚨 Rollback Plan

Si algo sale mal:

```bash
# Opción 1: Deshabilitar flag
echo "NEXT_PUBLIC_ENABLE_CAPACITY_VALIDATION=false" > .env.local

# Opción 2: Volver a main
git checkout main

# Opción 3: Eliminar rama (si no está en producción)
git branch -D feature/table-capacity-validation
```

---

## ✅ Checklist Final

Antes de aprobar para merge:

- [ ] Todos los tests pasados
- [ ] Feature flag OFF → comportamiento idéntico a main
- [ ] Feature flag ON → restricciones funcionan correctamente
- [ ] No hay console errors
- [ ] Responsive funciona (mobile + desktop)
- [ ] Dark mode funciona correctamente
- [ ] Multiidioma funciona (ES/EN/DE)
- [ ] Documentación actualizada (este archivo)
- [ ] Screenshots tomados (opcional)

---

## 📞 Soporte

Si encuentras bugs o comportamiento inesperado:
1. Toma screenshot del problema
2. Anota los pasos exactos para reproducir
3. Verifica qué valor tiene el feature flag
4. Revisa console.log en DevTools

**Happy Testing! 🚀**
