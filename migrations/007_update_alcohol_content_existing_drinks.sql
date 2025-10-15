-- ============================================
-- Migration: Actualizar alcoholcontent de bebidas existentes
-- Purpose: Agregar grados de alcohol a bebidas actuales basado en legacy
-- Date: 2025-10-14
-- ============================================

BEGIN;

-- CERVEZAS (cat_cerveza)
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.00 WHERE name = 'Alhambra Especial' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.00 WHERE name = 'Alhambra Verde Ecológica' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 4.50 WHERE name = 'Corona Extra' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.00 WHERE name = 'Heineken' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.00 WHERE name = 'Leffe Blonde' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.00 WHERE name = 'Mahou Cinco Estrellas' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.00 WHERE name = 'San Miguel' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.50 WHERE name = 'Franziskaner Weissbier' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 5.30 WHERE name = 'Estrella Damm Inedit' AND "alcoholcontent" IS NULL;

-- CÓCTELES (cat_coctel)
UPDATE restaurante.menu_items SET "alcoholcontent" = 15.00 WHERE name = 'Caipirinha' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 18.00 WHERE name = 'Cosmopolitan' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 15.00 WHERE name = 'Daiquiri de Fresa' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 20.00 WHERE name = 'Espresso Martini' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 12.00 WHERE name = 'Gin Tonic Premium' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 22.00 WHERE name = 'Long Island Iced Tea' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 30.00 WHERE name = 'Manhattan' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 15.00 WHERE name LIKE '%Mojito%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 15.00 WHERE name LIKE '%Piña Colada%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 18.00 WHERE name LIKE '%Margarita%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 12.00 WHERE name LIKE '%Sex on the Beach%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 18.00 WHERE name LIKE '%Negroni%' AND "alcoholcontent" IS NULL;

-- APERITIVOS (cat_aperitivo)
UPDATE restaurante.menu_items SET "alcoholcontent" = 11.00 WHERE name = 'Aperol' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 11.00 WHERE name LIKE '%Aperol Spritz%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 36.00 WHERE name = 'Brandy Solera Gran Reserva' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 40.00 WHERE name LIKE '%Cognac%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 16.50 WHERE name = 'Cynar' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 40.00 WHERE name = 'Havana Club 7 Años' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 16.00 WHERE name = 'Martini Bianco' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 16.00 WHERE name = 'Martini Rosso' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 20.00 WHERE name LIKE '%Oporto%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 25.00 WHERE name = 'Pimm''s No.1' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 11.00 WHERE name = 'Prosecco Brut' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 15.00 WHERE name LIKE '%Sake%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 15.00 WHERE name LIKE '%Sherry%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 18.00 WHERE name LIKE '%Vermouth%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 12.00 WHERE name LIKE '%Sangría%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 12.00 WHERE name LIKE '%Tinto de Verano%' AND "alcoholcontent" IS NULL;
UPDATE restaurante.menu_items SET "alcoholcontent" = 12.00 WHERE name LIKE '%Kir Royal%' AND "alcoholcontent" IS NULL;

-- GINEBRAS (cat_ginebra)
UPDATE restaurante.menu_items SET "alcoholcontent" = 40.00 WHERE "categoryId" = 'cat_ginebra' AND "alcoholcontent" IS NULL;

-- LICORES (cat_licor)
UPDATE restaurante.menu_items SET "alcoholcontent" = 40.00 WHERE "categoryId" = 'cat_licor' AND "alcoholcontent" IS NULL;

-- VERIFICACIÓN
DO $$
DECLARE
  total_with_alcohol INTEGER;
  total_alcoholic_drinks INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_alcoholic_drinks
  FROM restaurante.menu_items
  WHERE "categoryId" IN ('cat_cerveza', 'cat_ginebra', 'cat_licor', 'cat_coctel', 'cat_aperitivo');

  SELECT COUNT(*) INTO total_with_alcohol
  FROM restaurante.menu_items
  WHERE "categoryId" IN ('cat_cerveza', 'cat_ginebra', 'cat_licor', 'cat_coctel', 'cat_aperitivo')
  AND "alcoholcontent" IS NOT NULL;

  RAISE NOTICE '=== Migration 007 Completed ===';
  RAISE NOTICE 'Total bebidas alcohólicas: %', total_alcoholic_drinks;
  RAISE NOTICE 'Bebidas con grado de alcohol: %', total_with_alcohol;
  RAISE NOTICE 'Bebidas sin grado de alcohol: %', (total_alcoholic_drinks - total_with_alcohol);
END $$;

COMMIT;
