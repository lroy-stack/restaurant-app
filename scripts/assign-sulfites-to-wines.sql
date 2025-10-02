-- ====================================================================
-- SCRIPT: Asignación Automática de "Sulfitos" a Todos los Vinos
-- OBJETIVO: Cumplir EU Regulation 1169/2011 - Allergen labeling
-- FECHA: 2025-10-02
-- ITEMS AFECTADOS: 46 vinos (Tinto: 16, Blanco: 16, Rosado: 7, Espumoso: 7)
-- ====================================================================

-- PASO 1: Verificar estado actual (antes de la asignación)
SELECT
  mc.name as categoria_vino,
  COUNT(mi.id) as total_vinos,
  COUNT(DISTINCT mia."menuItemId") as vinos_con_sulfitos,
  COUNT(mi.id) - COUNT(DISTINCT mia."menuItemId") as vinos_sin_sulfitos
FROM restaurante.menu_items mi
JOIN restaurante.menu_categories mc ON mi."categoryId" = mc.id
LEFT JOIN restaurante.menu_item_allergens mia ON mi.id = mia."menuItemId"
  AND mia."allergenId" = '11'  -- ID del alérgeno "Sulfitos"
WHERE mc.name IN ('Vino Tinto', 'Vino Blanco', 'Vino Rosado', 'Vino Espumoso')
GROUP BY mc.name
ORDER BY total_vinos DESC;

-- PASO 2: Asignar "Sulfitos" a todos los vinos automáticamente
-- Usar ON CONFLICT DO NOTHING para evitar duplicados
INSERT INTO restaurante.menu_item_allergens ("menuItemId", "allergenId")
SELECT
  mi.id,
  '11'  -- ID del alérgeno "Sulfitos"
FROM restaurante.menu_items mi
JOIN restaurante.menu_categories mc ON mi."categoryId" = mc.id
WHERE mc.name IN ('Vino Tinto', 'Vino Blanco', 'Vino Rosado', 'Vino Espumoso')
ON CONFLICT DO NOTHING;

-- PASO 3: Verificar estado después de la asignación
SELECT
  mc.name as categoria_vino,
  COUNT(mi.id) as total_vinos,
  COUNT(DISTINCT mia."menuItemId") as vinos_con_sulfitos,
  COUNT(mi.id) - COUNT(DISTINCT mia."menuItemId") as vinos_sin_sulfitos
FROM restaurante.menu_items mi
JOIN restaurante.menu_categories mc ON mi."categoryId" = mc.id
LEFT JOIN restaurante.menu_item_allergens mia ON mi.id = mia."menuItemId"
  AND mia."allergenId" = '11'
WHERE mc.name IN ('Vino Tinto', 'Vino Blanco', 'Vino Rosado', 'Vino Espumoso')
GROUP BY mc.name
ORDER BY total_vinos DESC;

-- PASO 4: Verificar compliance general después de la asignación
SELECT
  COUNT(*) as total_menu_items,
  COUNT(DISTINCT mia."menuItemId") as items_con_alergenos,
  COUNT(*) - COUNT(DISTINCT mia."menuItemId") as items_sin_alergenos,
  ROUND(100.0 * COUNT(DISTINCT mia."menuItemId") / COUNT(*), 1) as porcentaje_compliance
FROM restaurante.menu_items mi
LEFT JOIN restaurante.menu_item_allergens mia ON mi.id = mia."menuItemId";

-- RESULTADO ESPERADO:
-- Antes: 18.4% compliance (36/196 items con alérgenos)
-- Después: 41.8% compliance (82/196 items con alérgenos)
-- Incremento: +46 items (todos los vinos)

-- ====================================================================
-- NOTAS IMPORTANTES:
-- 1. Todos los vinos contienen sulfitos como conservante
-- 2. EU Regulation 1169/2011 obliga a declarar sulfitos >10mg/L
-- 3. Este script es idempotente (puede ejecutarse múltiples veces)
-- 4. ON CONFLICT DO NOTHING evita duplicados
-- ====================================================================
