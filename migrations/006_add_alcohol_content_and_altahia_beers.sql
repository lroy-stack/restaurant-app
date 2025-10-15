-- ============================================
-- Migration: Add alcohol content and Altahia craft beers
-- Purpose: Import alcohol percentages from legacy and add craft beers
-- Date: 2025-10-15
-- ============================================

BEGIN;

-- 1. Get Cerveza category ID
DO $$
DECLARE
  cerveza_cat_id TEXT;
BEGIN
  -- Find or create Cervezas category
  SELECT id INTO cerveza_cat_id
  FROM restaurante.menu_categories
  WHERE type='BEVERAGE' AND (name ILIKE '%cerv%' OR "nameEn" ILIKE '%beer%')
  LIMIT 1;

  IF cerveza_cat_id IS NULL THEN
    -- Create if doesn't exist
    INSERT INTO restaurante.menu_categories (
      id, name, "nameEn", "nameDe", type, "displayOrder", "isAvailable"
    ) VALUES (
      'cat_cervezas_' || gen_random_uuid()::text,
      'Cervezas',
      'Beers',
      'Biere',
      'BEVERAGE',
      10,
      true
    ) RETURNING id INTO cerveza_cat_id;

    RAISE NOTICE 'Created Cervezas category: %', cerveza_cat_id;
  ELSE
    RAISE NOTICE 'Using existing Cervezas category: %', cerveza_cat_id;
  END IF;

  -- Store in temp table for later use
  CREATE TEMP TABLE IF NOT EXISTS temp_cerveza_id (cat_id TEXT);
  TRUNCATE temp_cerveza_id;
  INSERT INTO temp_cerveza_id VALUES (cerveza_cat_id);
END $$;

-- 2. Insert/Update Altahia Craft Beers with translations
INSERT INTO restaurante.menu_items (
  id,
  name,
  "nameEn",
  "nameDe",
  description,
  "descriptionEn",
  "descriptionDe",
  price,
  "categoryId",
  "isAvailable",
  alcoholcontent,
  tags,
  origin,
  "createdAt",
  "updatedAt"
) VALUES
  (
    'item_altahia_ipa_sin_' || substr(md5(random()::text), 1, 8),
    'IPA Sin Alcohol Altahia',
    'Altahia Non-Alcoholic IPA',
    'Altahia Alkoholfreies IPA',
    'Cerveza artesanal IPA sin alcohol, sabor intenso sin compromiso',
    'Craft non-alcoholic IPA beer, intense flavor without compromise',
    'Alkoholfreies Craft-IPA-Bier, intensiver Geschmack ohne Kompromisse',
    4.90,
    (SELECT cat_id FROM temp_cerveza_id),
    true,
    0.0,
    ARRAY['Artesanal', 'Sin Alcohol', 'IPA'],
    'España',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'item_altahia_lager_' || substr(md5(random()::text), 1, 8),
    'Lager Mediterránea Altahia',
    'Altahia Mediterranean Lager',
    'Altahia Mediterrane Lager',
    'Cerveza artesanal tipo lager con carácter mediterráneo',
    'Mediterranean-style craft lager beer',
    'Handwerkliches Lager-Bier im mediterranen Stil',
    4.90,
    (SELECT cat_id FROM temp_cerveza_id),
    true,
    5.0,
    ARRAY['Artesanal', 'Lager'],
    'España',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'item_altahia_ipa_' || substr(md5(random()::text), 1, 8),
    'IPA Altahia',
    'Altahia IPA',
    'Altahia IPA',
    'Cerveza artesanal IPA con notas cítricas y amargor equilibrado',
    'Craft IPA beer with citrus notes and balanced bitterness',
    'Handwerkliches IPA-Bier mit Zitrusnoten und ausgewogener Bitterkeit',
    5.10,
    (SELECT cat_id FROM temp_cerveza_id),
    true,
    5.0,
    ARRAY['Artesanal', 'IPA'],
    'España',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'item_altahia_marzen_' || substr(md5(random()::text), 1, 8),
    'Märzen Tostada Altahia (Sin Gluten)',
    'Altahia Toasted Märzen (Gluten-Free)',
    'Altahia Geröstetes Märzen (Glutenfrei)',
    'Cerveza artesanal estilo Märzen tostada, sin gluten',
    'Gluten-free craft toasted Märzen-style beer',
    'Glutenfreies handwerkliches geröstetes Märzen-Bier',
    5.10,
    (SELECT cat_id FROM temp_cerveza_id),
    true,
    5.0,
    ARRAY['Artesanal', 'Märzen', 'Sin Gluten', 'Tostada'],
    'España',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (name) DO UPDATE SET
  alcoholcontent = EXCLUDED.alcoholcontent,
  tags = EXCLUDED.tags,
  "nameEn" = EXCLUDED."nameEn",
  "nameDe" = EXCLUDED."nameDe",
  description = EXCLUDED.description,
  "descriptionEn" = EXCLUDED."descriptionEn",
  "descriptionDe" = EXCLUDED."descriptionDe",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 3. Update alcohol content for existing beverages from legacy data
-- Sample of common beverages with alcohol content
UPDATE restaurante.menu_items SET alcoholcontent = 40.0 WHERE name ILIKE '%whisky%' OR name ILIKE '%whiskey%';
UPDATE restaurante.menu_items SET alcoholcontent = 40.0 WHERE name ILIKE '%ron%' OR name ILIKE '%rum%';
UPDATE restaurante.menu_items SET alcoholcontent = 40.0 WHERE name ILIKE '%vodka%';
UPDATE restaurante.menu_items SET alcoholcontent = 40.0 WHERE name ILIKE '%ginebra%' OR name ILIKE '%gin %';
UPDATE restaurante.menu_items SET alcoholcontent = 40.0 WHERE name ILIKE '%licor%';
UPDATE restaurante.menu_items SET alcoholcontent = 40.0 WHERE name ILIKE '%tequila%';

-- Cervezas específicas
UPDATE restaurante.menu_items SET alcoholcontent = 6.4 WHERE name ILIKE '%alhambra reserva%';
UPDATE restaurante.menu_items SET alcoholcontent = 5.5 WHERE name ILIKE '%estrella galicia%';
UPDATE restaurante.menu_items SET alcoholcontent = 4.5 WHERE name ILIKE '%corona%';
UPDATE restaurante.menu_items SET alcoholcontent = 5.0 WHERE name ILIKE '%alhambra%' AND name NOT ILIKE '%reserva%';
UPDATE restaurante.menu_items SET alcoholcontent = 5.0 WHERE name ILIKE '%mahou%';
UPDATE restaurante.menu_items SET alcoholcontent = 8.5 WHERE name ILIKE '%duvel%';
UPDATE restaurante.menu_items SET alcoholcontent = 8.0 WHERE name ILIKE '%leef brune%';
UPDATE restaurante.menu_items SET alcoholcontent = 5.0 WHERE name ILIKE '%leef blonde%';
UPDATE restaurante.menu_items SET alcoholcontent = 5.5 WHERE name ILIKE '%tanque%';
UPDATE restaurante.menu_items SET alcoholcontent = 5.0 WHERE name ILIKE '%caña%';

-- Cócteles
UPDATE restaurante.menu_items SET alcoholcontent = 15.0 WHERE name ILIKE '%mojito%';
UPDATE restaurante.menu_items SET alcoholcontent = 15.0 WHERE name ILIKE '%caipiriña%';
UPDATE restaurante.menu_items SET alcoholcontent = 15.0 WHERE name ILIKE '%daiquiri%';
UPDATE restaurante.menu_items SET alcoholcontent = 15.0 WHERE name ILIKE '%piña colada%';
UPDATE restaurante.menu_items SET alcoholcontent = 20.0 WHERE name ILIKE '%expresso martini%';

-- Aperitivos
UPDATE restaurante.menu_items SET alcoholcontent = 11.0 WHERE name ILIKE '%aperol%';
UPDATE restaurante.menu_items SET alcoholcontent = 18.0 WHERE name ILIKE '%negroni%';
UPDATE restaurante.menu_items SET alcoholcontent = 12.0 WHERE name ILIKE '%sangr%';
UPDATE restaurante.menu_items SET alcoholcontent = 12.0 WHERE name ILIKE '%tinto de verano%';
UPDATE restaurante.menu_items SET alcoholcontent = 18.0 WHERE name ILIKE '%vermouth%';
UPDATE restaurante.menu_items SET alcoholcontent = 18.0 WHERE name ILIKE '%oporto%';

-- Café con alcohol
UPDATE restaurante.menu_items SET alcoholcontent = 4.0 WHERE name ILIKE '%carajillo%';
UPDATE restaurante.menu_items SET alcoholcontent = 8.0 WHERE name ILIKE '%irish coffee%';

-- Verification
DO $$
DECLARE
  altahia_count INTEGER;
  alcohol_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO altahia_count
  FROM restaurante.menu_items
  WHERE 'Artesanal' = ANY(tags);

  SELECT COUNT(*) INTO alcohol_count
  FROM restaurante.menu_items
  WHERE alcoholcontent IS NOT NULL AND alcoholcontent > 0;

  RAISE NOTICE '=== Migration 006 Completed ===';
  RAISE NOTICE 'Altahia craft beers: %', altahia_count;
  RAISE NOTICE 'Items with alcohol content: %', alcohol_count;
END $$;

COMMIT;

-- Rollback (if needed):
-- DELETE FROM restaurante.menu_items WHERE 'Artesanal' = ANY(tags);
-- UPDATE restaurante.menu_items SET alcoholcontent = NULL;
