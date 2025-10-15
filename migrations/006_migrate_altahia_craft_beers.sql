-- ============================================
-- Migration: Cervezas Artesanales Altahia con grados de alcohol
-- Purpose: Migrar cervezas craft Altahia desde carta legacy
-- Date: 2025-10-14
-- ============================================

BEGIN;

-- 1. Insertar 4 cervezas artesanales Altahia con traducciones completas y alcohol_content
INSERT INTO restaurante.menu_items (
  id,
  name,
  "nameEn",
  description,
  "descriptionEn",
  "richDescription",
  "richDescriptionEn",
  price,
  "isAvailable",
  "categoryId",
  "restaurantId",
  "alcoholcontent",
  "isVegetarian",
  "isVegan",
  "isGlutenFree",
  "isRecommended",
  stock,
  "createdAt",
  "updatedAt"
) VALUES
  -- 1. IPA Sin Alcohol Altahia
  (
    'beer_altahia_ipa_na_' || gen_random_uuid()::text,
    'IPA Sin Alcohol Altahia',
    'Altahia Non-Alcoholic IPA',
    'Cerveza artesanal IPA sin alcohol con aromas cítricos y florales',
    'Craft non-alcoholic IPA with citrus and floral aromas',
    'Cerveza artesanal Altahia IPA sin alcohol. Elaborada con lúpulos seleccionados que aportan intensos aromas cítricos y florales. Perfecto equilibrio entre amargor y frescura. Ideal para disfrutar en cualquier momento. **Artesanal** | 0.0% ABV',
    'Altahia craft non-alcoholic IPA. Brewed with selected hops delivering intense citrus and floral aromas. Perfect balance between bitterness and freshness. Ideal for enjoying anytime. **Craft** | 0.0% ABV',
    4.90,
    true,
    'cat_cerveza',
    'rest_enigma_001',
    0.00, -- Sin alcohol
    true, -- Vegetariano
    true, -- Vegano
    false, -- Contiene gluten
    false,
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),

  -- 2. Lager Mediterránea Altahia
  (
    'beer_altahia_lager_' || gen_random_uuid()::text,
    'Lager Mediterránea Altahia',
    'Altahia Mediterranean Lager',
    'Cerveza artesanal tipo lager con carácter mediterráneo',
    'Craft lager beer with Mediterranean character',
    'Cerveza artesanal Altahia estilo Lager Mediterránea. Refrescante y suave, con notas herbáceas y cítricas que evocan el Mediterráneo. Perfecta para acompañar arroces y pescados. **Artesanal** | 5.0% ABV',
    'Altahia craft Mediterranean Lager style. Refreshing and smooth, with herbal and citrus notes evoking the Mediterranean. Perfect with rice dishes and fish. **Craft** | 5.0% ABV',
    4.90,
    true,
    'cat_cerveza',
    'rest_enigma_001',
    5.00,
    true,
    true,
    false,
    true, -- Recomendada
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),

  -- 3. IPA Altahia
  (
    'beer_altahia_ipa_' || gen_random_uuid()::text,
    'IPA Altahia',
    'Altahia IPA',
    'Cerveza artesanal IPA con intenso carácter lupulado',
    'Craft IPA with intense hop character',
    'Cerveza artesanal Altahia estilo India Pale Ale. Elaborada con lúpulos americanos que aportan aromas tropicales y cítricos. Amargor marcado y persistente. Ideal para paladares atrevidos. **Artesanal** | 5.0% ABV',
    'Altahia craft India Pale Ale style. Brewed with American hops delivering tropical and citrus aromas. Bold and persistent bitterness. Ideal for adventurous palates. **Craft** | 5.0% ABV',
    5.10,
    true,
    'cat_cerveza',
    'rest_enigma_001',
    5.00,
    true,
    true,
    false,
    true, -- Recomendada
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),

  -- 4. Marzen Tostada Sin Gluten Altahia
  (
    'beer_altahia_marzen_gf_' || gen_random_uuid()::text,
    'Märzen Tostada Altahia (Sin Gluten)',
    'Altahia Toasted Märzen (Gluten-Free)',
    'Cerveza artesanal sin gluten estilo Märzen con notas tostadas',
    'Gluten-free craft beer Märzen style with toasted notes',
    'Cerveza artesanal Altahia estilo Märzen Tostada sin gluten. Elaborada con maltas tostadas que aportan color ámbar y sabores a caramelo y pan. Cuerpo medio y final seco. Perfecta para celíacos sin renunciar al sabor. **Artesanal | Sin Gluten** | 5.0% ABV',
    'Altahia craft Toasted Märzen style gluten-free. Brewed with toasted malts delivering amber color and caramel and bread flavors. Medium body and dry finish. Perfect for celiacs without compromising taste. **Craft | Gluten-Free** | 5.0% ABV',
    5.10,
    true,
    'cat_cerveza',
    'rest_enigma_001',
    5.00,
    true,
    true,
    true, -- SIN GLUTEN
    true, -- Recomendada
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Verificación: mostrar las cervezas Altahia migradas
DO $$
DECLARE
  altahia_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO altahia_count
  FROM restaurante.menu_items
  WHERE name LIKE '%Altahia%';

  RAISE NOTICE '=== Migration 006 Completed ===';
  RAISE NOTICE 'Cervezas Altahia migradas: %', altahia_count;
  RAISE NOTICE 'Todas incluyen:';
  RAISE NOTICE '  - Grado de alcohol (alcoholcontent)';
  RAISE NOTICE '  - Traducciones EN completas';
  RAISE NOTICE '  - Descripciones ricas multiidioma';
  RAISE NOTICE '  - Tag "Artesanal" en descripciones';
END $$;

-- 3. Actualizar TODAS las bebidas alcohólicas legacy con grado de alcohol
-- Nota: Esta sección actualiza las bebidas existentes que ya están en la DB
-- Solo ejecutar si quieres actualizar las bebidas que ya existen

-- Actualizar cervezas con alcohol_content
UPDATE restaurante.menu_items
SET "alcoholcontent" = 6.40
WHERE name = 'Alhambra Reserva 1925' AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 5.50
WHERE name = 'Estrella Galicia' AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 4.50
WHERE name = 'Corona' AND "categoryId" = 'cat_cerveza' AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 5.50
WHERE name = 'Tanque' AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 5.00
WHERE name IN ('Caña', 'Alhambra', 'Alhambra 1927', 'Mahou 5 Estrellas', 'Mahou Sin Gluten', 'Leef Blonde')
AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 8.50
WHERE name = 'Duvel' AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 8.00
WHERE name = 'Leef Brune' AND "alcoholcontent" IS NULL;

-- Actualizar licores y destilados
UPDATE restaurante.menu_items
SET "alcoholcontent" = 40.00
WHERE name IN (
  'Whisky Johnnie Walker', 'Ron Havana Club 7', 'Vodka Absolut',
  'Magno', 'Carlos I', 'Torres 10', 'Tía María', 'Licor 43',
  'Casalla', 'Triple Seco', 'Tequila Juan Cuervo', 'Chinchón de Anís',
  'Crema de Orujo', 'Orujo de Hierbas', 'Orujo Aguardiente', 'Grappa',
  'Mistela', 'Limoncello', 'Gin Mare', 'Henricks', 'Tanqueray',
  'Nordés', 'Bombay Sapphire', 'Martin Miller''s', 'Beefeater',
  'Seagram''s', 'Larios', 'Johnnie Walker Red Label', 'Jameson',
  'Jack Daniel''s', 'Chivas', 'Negrita', 'Brugal', 'Bacardí',
  'Habana 7', 'Cacique', 'Absolut', 'Smirnoff', 'Campari',
  'Campari Orange', 'Ricard', 'Martini', 'Hugo'
) AND "alcoholcontent" IS NULL;

-- Actualizar cócteles
UPDATE restaurante.menu_items
SET "alcoholcontent" = 15.00
WHERE name IN ('Mojito', 'Caipiriña', 'Daiquiri Fresa', 'Piña Colada', 'Pasion Sunrise')
AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 20.00
WHERE name = 'Expresso Martini' AND "alcoholcontent" IS NULL;

-- Actualizar aperitivos
UPDATE restaurante.menu_items
SET "alcoholcontent" = 11.00
WHERE name = 'Aperol Spritz' AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 18.00
WHERE name IN ('Negroni', 'Oporto', 'Vermouth Casero') AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 12.00
WHERE name IN ('Sangría Copa', 'Sangría Litro', 'Tinto de Verano Copa', 'Tinto de Verano Litro', 'Kir Royal')
AND "alcoholcontent" IS NULL;

-- Actualizar cafés con alcohol
UPDATE restaurante.menu_items
SET "alcoholcontent" = 4.00
WHERE name = 'Carajillo' AND "alcoholcontent" IS NULL;

UPDATE restaurante.menu_items
SET "alcoholcontent" = 8.00
WHERE name = 'Irish Coffee' AND "alcoholcontent" IS NULL;

COMMIT;

-- Rollback instructions (si es necesario):
-- DELETE FROM restaurante.menu_items WHERE name LIKE '%Altahia%';
-- UPDATE restaurante.menu_items SET "alcoholcontent" = NULL;
