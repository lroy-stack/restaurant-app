-- ============================================
-- SCRIPT: Update English Translations for Menu Items
-- Restaurant: Enigma con Alma
-- Date: 2025-10-12
-- Total items to translate: 155
-- ============================================

-- CATEGORY: CARNES (Meats)
UPDATE restaurante.menu_items SET "nameEn" = 'Black Angus Ribs' WHERE id = 'item_costillas_black_angus';
UPDATE restaurante.menu_items SET "nameEn" = 'Braised Lamb Shank' WHERE id = 'item_jarrete_cordero';
UPDATE restaurante.menu_items SET "nameEn" = '100% Acorn-Fed Iberian Pork Shoulder' WHERE id = 'item_pluma_iberica';
UPDATE restaurante.menu_items SET "nameEn" = 'Beef Tenderloin Enigma Style' WHERE id = 'item_solomillo_ternera';

-- CATEGORY: PULPO (Octopus)
UPDATE restaurante.menu_items SET "nameEn" = 'Broken Eggs with Octopus' WHERE id = 'item_huevos_rotos_pulpo';
UPDATE restaurante.menu_items SET "nameEn" = 'Galician-Style Octopus' WHERE id = 'item_pulpo_feira';
UPDATE restaurante.menu_items SET "nameEn" = 'Octopus in Garlic Sauce' WHERE id = 'item_pulpo_ajillo';
UPDATE restaurante.menu_items SET "nameEn" = 'Octopus Enigma Style' WHERE id = 'item_pulpo_enigma';

-- CATEGORY: PESCADOS (Fish)
UPDATE restaurante.menu_items SET "nameEn" = 'Fried Cod with Cornmeal' WHERE id = 'item_bacalao_frito';
UPDATE restaurante.menu_items SET "nameEn" = 'Sea Bass with Prawns and Saffron Sabayon' WHERE id = 'item_lubina_gambas';
UPDATE restaurante.menu_items SET "nameEn" = 'Yakitori Tuna Taco' WHERE id = 'item_taco_atun';

-- CATEGORY: PASTA
UPDATE restaurante.menu_items SET "nameEn" = 'XL Duck Cannelloni' WHERE id = 'item_canelon_pato';
UPDATE restaurante.menu_items SET "nameEn" = 'Pappardelle with Pesto and Vegetables' WHERE id = 'item_parpadelle_pesto';
UPDATE restaurante.menu_items SET "nameEn" = 'Ravioli Stuffed with Pumpkin and Parmesan' WHERE id = 'item_raviolis_calabaza';

-- CATEGORY: ENSALADAS (Salads)
UPDATE restaurante.menu_items SET "nameEn" = 'Burrata Salad' WHERE id = 'item_ensalada_burrata';
UPDATE restaurante.menu_items SET "nameEn" = 'Cauliflower and Quinoa Tabbouleh' WHERE id = 'item_tabuleh_coliflor';
UPDATE restaurante.menu_items SET "nameEn" = 'Vitello Tonnato' WHERE id = 'item_vitello_tonnato';

-- CATEGORY: ESPECIALES (Specials)
UPDATE restaurante.menu_items SET "nameEn" = 'Enigma Spoon' WHERE id = 'item_cuchara_enigma';
UPDATE restaurante.menu_items SET "nameEn" = 'Prawns in Garlic Sauce' WHERE id = 'item_langostinos_ajillo';
UPDATE restaurante.menu_items SET "nameEn" = 'Tuna Tataki' WHERE id = 'item_tataki_atun';

-- CATEGORY: POSTRES (Desserts)
UPDATE restaurante.menu_items SET "nameEn" = 'Fluffy Nougat Cake' WHERE id = 'item_bizcocho_turron';
UPDATE restaurante.menu_items SET "nameEn" = 'Enigma Chocolate' WHERE id = 'item_chocolate_enigma';
UPDATE restaurante.menu_items SET "nameEn" = 'Passion Fruit Crema Catalana' WHERE id = 'item_crema_catalana';
UPDATE restaurante.menu_items SET "nameEn" = 'Passion Fruit Sorbet' WHERE id = 'item_sorbete_pasion';

-- CATEGORY: APERITIVO (Aperitifs) - Keep brand names, translate descriptions
UPDATE restaurante.menu_items SET "nameEn" = 'Aperol Spritz' WHERE id = 'bev_aperol';
UPDATE restaurante.menu_items SET "nameEn" = 'Brandy Solera Gran Reserva' WHERE id = 'bev_brandy_solera';
UPDATE restaurante.menu_items SET "nameEn" = 'Campari' WHERE id = 'bev_campari';
UPDATE restaurante.menu_items SET "nameEn" = 'Cynar' WHERE id = 'bev_cynar';
UPDATE restaurante.menu_items SET "nameEn" = 'Grappa' WHERE id = 'bev_grappa';
UPDATE restaurante.menu_items SET "nameEn" = 'Havana Club 7 Years' WHERE id = 'bev_rum_havana_7';
UPDATE restaurante.menu_items SET "nameEn" = 'Martini Bianco' WHERE id = 'bev_martini_bianco';
UPDATE restaurante.menu_items SET "nameEn" = 'Martini Rosso' WHERE id = 'bev_martini_rosso';
UPDATE restaurante.menu_items SET "nameEn" = 'Tawny Port' WHERE id = 'bev_port_tawny';
UPDATE restaurante.menu_items SET "nameEn" = 'Herb Liqueur' WHERE id = 'bev_orujo_hierbas';
UPDATE restaurante.menu_items SET "nameEn" = 'Pimm''s No.1' WHERE id = 'bev_pimms';
UPDATE restaurante.menu_items SET "nameEn" = 'Prosecco Brut' WHERE id = 'bev_prosecco_brut';
UPDATE restaurante.menu_items SET "nameEn" = 'Sake Junmai' WHERE id = 'bev_sake_junmai';
UPDATE restaurante.menu_items SET "nameEn" = 'Fino Sherry' WHERE id = 'bev_sherry_fino';
UPDATE restaurante.menu_items SET "nameEn" = 'White Vermouth' WHERE id = 'bev_vermouth_blanco';
UPDATE restaurante.menu_items SET "nameEn" = 'Red Vermouth' WHERE id = 'bev_vermouth_rojo';

-- CATEGORY: CAFÉ (Coffee)
UPDATE restaurante.menu_items SET "nameEn" = 'Café Bombón (Condensed Milk Coffee)' WHERE id = 'bev_cafe_bombom';
UPDATE restaurante.menu_items SET "nameEn" = 'Carajillo (Coffee with Liqueur)' WHERE id = 'bev_cafe_carajillo';
UPDATE restaurante.menu_items SET "nameEn" = 'Cappuccino' WHERE id = 'bev_cappuccino';
UPDATE restaurante.menu_items SET "nameEn" = 'Chai Latte' WHERE id = 'bev_chai_latte';
UPDATE restaurante.menu_items SET "nameEn" = 'Cold Brew Coffee' WHERE id = 'bev_cold_brew';
UPDATE restaurante.menu_items SET "nameEn" = 'Latte Macchiato' WHERE id = 'bev_latte_macchiato';
UPDATE restaurante.menu_items SET "nameEn" = 'Matcha Latte' WHERE id = 'bev_matcha_latte';
UPDATE restaurante.menu_items SET "nameEn" = 'Premium Earl Grey Tea' WHERE id = 'bev_te_premium_earl_grey';

-- CATEGORY: CERVEZA (Beer) - Keep brand names
UPDATE restaurante.menu_items SET "nameEn" = 'Alhambra Especial' WHERE id = 'bev_alhambra_especial';
UPDATE restaurante.menu_items SET "nameEn" = 'Alhambra Reserva 1925' WHERE id = 'bev_alhambra_reserva';
UPDATE restaurante.menu_items SET "nameEn" = 'Corona Extra' WHERE id = 'bev_corona_extra';
UPDATE restaurante.menu_items SET "nameEn" = 'Estrella Damm Inedit' WHERE id = 'bev_estrella_damm_inedit';
UPDATE restaurante.menu_items SET "nameEn" = 'Franziskaner Weissbier' WHERE id = 'bev_franziskaner';
UPDATE restaurante.menu_items SET "nameEn" = 'Heineken' WHERE id = 'bev_heineken';
UPDATE restaurante.menu_items SET "nameEn" = 'Leffe Blonde' WHERE id = 'bev_leffe_blonde';
UPDATE restaurante.menu_items SET "nameEn" = 'Mahou Cinco Estrellas' WHERE id = 'bev_mahou_cinco_estrellas';
UPDATE restaurante.menu_items SET "nameEn" = 'San Miguel' WHERE id = 'bev_san_miguel';

-- CATEGORY: CÓCTEL (Cocktails) - Keep international names
UPDATE restaurante.menu_items SET "nameEn" = 'Caipirinha' WHERE id = 'bev_caipirinha';
UPDATE restaurante.menu_items SET "nameEn" = 'Cosmopolitan' WHERE id = 'bev_cosmopolitan';
UPDATE restaurante.menu_items SET "nameEn" = 'Espresso Martini' WHERE id = 'bev_espresso_martini';
UPDATE restaurante.menu_items SET "nameEn" = 'Long Island Iced Tea' WHERE id = 'bev_long_island';
UPDATE restaurante.menu_items SET "nameEn" = 'Manhattan' WHERE id = 'bev_manhattan';
UPDATE restaurante.menu_items SET "nameEn" = 'Classic Margarita' WHERE id = 'bev_margarita_clasica';
UPDATE restaurante.menu_items SET "nameEn" = 'Classic Mojito' WHERE id = 'bev_mojito_clasico';
UPDATE restaurante.menu_items SET "nameEn" = 'Red Berries Mojito' WHERE id = 'bev_mojito_frutos_rojos';
UPDATE restaurante.menu_items SET "nameEn" = 'Moscow Mule' WHERE id = 'bev_moscow_mule';
UPDATE restaurante.menu_items SET "nameEn" = 'Negroni' WHERE id = 'bev_negroni';
UPDATE restaurante.menu_items SET "nameEn" = 'Old Fashioned' WHERE id = 'bev_old_fashioned';
UPDATE restaurante.menu_items SET "nameEn" = 'Piña Colada' WHERE id = 'bev_piña_colada';
UPDATE restaurante.menu_items SET "nameEn" = 'Pisco Sour' WHERE id = 'bev_pisco_sour';
UPDATE restaurante.menu_items SET "nameEn" = 'Sex on the Beach' WHERE id = 'bev_sex_on_beach';
UPDATE restaurante.menu_items SET "nameEn" = 'Whiskey Sour' WHERE id = 'bev_whiskey_sour';

-- CATEGORY: GINEBRA (Gin) - Keep brand names
UPDATE restaurante.menu_items SET "nameEn" = 'Beefeater' WHERE id = 'bev_beefeater';
UPDATE restaurante.menu_items SET "nameEn" = 'Bombay Sapphire' WHERE id = 'bev_bombay';
UPDATE restaurante.menu_items SET "nameEn" = 'Gin Mare' WHERE id = 'bev_gin_mare';
UPDATE restaurante.menu_items SET "nameEn" = 'Hendrick''s Gin' WHERE id = 'bev_gin_hendricks';
UPDATE restaurante.menu_items SET "nameEn" = 'Larios' WHERE id = 'bev_larios';
UPDATE restaurante.menu_items SET "nameEn" = 'Martin Miller''s' WHERE id = 'bev_martin_millers';
UPDATE restaurante.menu_items SET "nameEn" = 'Nordés' WHERE id = 'bev_nordes';
UPDATE restaurante.menu_items SET "nameEn" = 'Seagram''s' WHERE id = 'bev_seagrams';
UPDATE restaurante.menu_items SET "nameEn" = 'Tanqueray' WHERE id = 'bev_tanqueray';

-- CATEGORY: LICOR (Liqueurs) - Keep brand names
UPDATE restaurante.menu_items SET "nameEn" = 'Amaretto Disaronno' WHERE id = 'bev_amaretto_disaronno';
UPDATE restaurante.menu_items SET "nameEn" = 'Baileys Irish Cream' WHERE id = 'bev_baileys';
UPDATE restaurante.menu_items SET "nameEn" = 'Cointreau' WHERE id = 'bev_cointreau';
UPDATE restaurante.menu_items SET "nameEn" = 'Drambuie' WHERE id = 'bev_drambuie';
UPDATE restaurante.menu_items SET "nameEn" = 'Frangelico' WHERE id = 'bev_frangelico';
UPDATE restaurante.menu_items SET "nameEn" = 'Grand Marnier' WHERE id = 'bev_grand_marnier';
UPDATE restaurante.menu_items SET "nameEn" = 'Grey Goose' WHERE id = 'bev_grey_goose';
UPDATE restaurante.menu_items SET "nameEn" = 'Hennessy XO' WHERE id = 'bev_hennessy_xo';
UPDATE restaurante.menu_items SET "nameEn" = 'Jägermeister' WHERE id = 'bev_jagermeister';
UPDATE restaurante.menu_items SET "nameEn" = 'Kahlúa' WHERE id = 'bev_kahlua';
UPDATE restaurante.menu_items SET "nameEn" = 'Licor 43' WHERE id = 'bev_licor_43';
UPDATE restaurante.menu_items SET "nameEn" = 'Macallan 12 Years' WHERE id = 'bev_macallan_12';
UPDATE restaurante.menu_items SET "nameEn" = 'Patrón Silver' WHERE id = 'bev_patron_silver';
UPDATE restaurante.menu_items SET "nameEn" = 'Patrón XO Café' WHERE id = 'bev_patron_xo_cafe';
UPDATE restaurante.menu_items SET "nameEn" = 'Sambuca' WHERE id = 'bev_sambuca';

-- CATEGORY: REFRESCO (Soft Drinks)
UPDATE restaurante.menu_items SET "nameEn" = 'Bitter Kas' WHERE id = 'bev_bitter_kas';
UPDATE restaurante.menu_items SET "nameEn" = 'Coca-Cola' WHERE id = 'bev_coca_cola';
UPDATE restaurante.menu_items SET "nameEn" = 'Coca-Cola Zero' WHERE id = 'bev_coca_cola_zero';
UPDATE restaurante.menu_items SET "nameEn" = 'Ginger Ale' WHERE id = 'bev_ginger_ale';
UPDATE restaurante.menu_items SET "nameEn" = 'Ginger Kombucha' WHERE id = 'bev_kombucha_jengibre';
UPDATE restaurante.menu_items SET "nameEn" = 'Fresh Lemonade' WHERE id = 'bev_limonada_natural';
UPDATE restaurante.menu_items SET "nameEn" = 'Nestea' WHERE id = 'bev_nestea';
UPDATE restaurante.menu_items SET "nameEn" = 'Red Bull' WHERE id = 'bev_red_bull';
UPDATE restaurante.menu_items SET "nameEn" = 'San Pellegrino' WHERE id = 'bev_agua_san_pellegrino';
UPDATE restaurante.menu_items SET "nameEn" = 'Tropical Smoothie' WHERE id = 'bev_smoothie_tropical';
UPDATE restaurante.menu_items SET "nameEn" = 'Green Detox Smoothie' WHERE id = 'bev_smoothie_verde';
UPDATE restaurante.menu_items SET "nameEn" = 'Sprite' WHERE id = 'bev_sprite';
UPDATE restaurante.menu_items SET "nameEn" = 'Schweppes Tonic Water' WHERE id = 'bev_tonica_schweppes';

-- CATEGORY: VINO BLANCO (White Wine) - Keep wine names, translate descriptions
UPDATE restaurante.menu_items SET "nameEn" = 'Atrium Organic' WHERE id = 'wine_atrium_eco';
UPDATE restaurante.menu_items SET "nameEn" = 'Camiños Dos Faros' WHERE id = 'wine_caminos_faros';
UPDATE restaurante.menu_items SET "nameEn" = 'Celeste' WHERE id = 'wine_celeste';
UPDATE restaurante.menu_items SET "nameEn" = 'Chablis Domaine Fevree' WHERE id = 'wine_chablis_fevree';
UPDATE restaurante.menu_items SET "nameEn" = 'ClosFarena' WHERE id = 'wine_closfarena';
UPDATE restaurante.menu_items SET "nameEn" = 'Godeval' WHERE id = 'wine_godeval';
UPDATE restaurante.menu_items SET "nameEn" = 'Kaori' WHERE id = 'wine_kaori';
UPDATE restaurante.menu_items SET "nameEn" = 'Los Lau Private Collection' WHERE id = 'wine_los_lau';
UPDATE restaurante.menu_items SET "nameEn" = 'Lurton' WHERE id = 'wine_lurton';
UPDATE restaurante.menu_items SET "nameEn" = 'Mandame Merseguera' WHERE id = 'wine_merseguera';
UPDATE restaurante.menu_items SET "nameEn" = 'Marieta' WHERE id = 'wine_marieta';
UPDATE restaurante.menu_items SET "nameEn" = 'Marimar Estate' WHERE id = 'wine_marimar_state';
UPDATE restaurante.menu_items SET "nameEn" = 'Menade Organic' WHERE id = 'wine_menade_eco';
UPDATE restaurante.menu_items SET "nameEn" = 'Miranda d''Espíells' WHERE id = 'wine_miranda_espiells';
UPDATE restaurante.menu_items SET "nameEn" = 'Pazo das Bruxas' WHERE id = 'wine_pazo_bruxas';
UPDATE restaurante.menu_items SET "nameEn" = 'Sericis Viognier' WHERE id = 'wine_sericis_viognier';

-- CATEGORY: VINO ESPUMOSO (Sparkling Wine)
UPDATE restaurante.menu_items SET "nameEn" = 'Juavé & Camps Essential' WHERE id = 'wine_juave_camps_essential';
UPDATE restaurante.menu_items SET "nameEn" = 'Privat Brut Rosé Organic' WHERE id = 'wine_privat_brut_rose';
UPDATE restaurante.menu_items SET "nameEn" = 'Provetto Brut' WHERE id = 'wine_provetto_brut';
UPDATE restaurante.menu_items SET "nameEn" = 'Raventós i Blanc La Finca' WHERE id = 'wine_raventos_la_finca';
UPDATE restaurante.menu_items SET "nameEn" = 'Raventós La Nit' WHERE id = 'wine_raventos_la_nit';
UPDATE restaurante.menu_items SET "nameEn" = 'Taittinger Brut Reserve' WHERE id = 'wine_taittinger_brut';
UPDATE restaurante.menu_items SET "nameEn" = 'Vinestar Ancestral' WHERE id = 'wine_vinestar_ancestral';

-- CATEGORY: VINO ROSADO (Rosé Wine)
UPDATE restaurante.menu_items SET "nameEn" = 'Albarroble' WHERE id = 'wine_albarroble';
UPDATE restaurante.menu_items SET "nameEn" = 'Aurora d''Espíells' WHERE id = 'wine_aurora_espiells';
UPDATE restaurante.menu_items SET "nameEn" = 'Cuatro Pasos Rosé' WHERE id = 'wine_cuatro_pasos_rose';
UPDATE restaurante.menu_items SET "nameEn" = 'Hacienda Casa del Valle' WHERE id = 'wine_hacienda_casa_valle';
UPDATE restaurante.menu_items SET "nameEn" = 'Jean Leon 3055' WHERE id = 'wine_jean_leon_3055';
UPDATE restaurante.menu_items SET "nameEn" = 'La Vieille Ferme' WHERE id = 'wine_la_vieille_ferme';
UPDATE restaurante.menu_items SET "nameEn" = 'Sericis Rosé' WHERE id = 'wine_sericis_rose';

-- CATEGORY: VINO TINTO (Red Wine)
UPDATE restaurante.menu_items SET "nameEn" = 'Cabriola by Borsao' WHERE id = 'wine_cabriola_borsao';
UPDATE restaurante.menu_items SET "nameEn" = 'Carmelo Rodero 9 Months' WHERE id = 'wine_carmelo_rodero';
UPDATE restaurante.menu_items SET "nameEn" = 'Carramimbre Crianza' WHERE id = 'wine_carramimbre_crianza';
UPDATE restaurante.menu_items SET "nameEn" = 'Celeste Roble' WHERE id = 'wine_celeste_roble';
UPDATE restaurante.menu_items SET "nameEn" = 'CVO 5 Single Vineyard' WHERE id = 'wine_cvo_parcelario';
UPDATE restaurante.menu_items SET "nameEn" = 'El Pillo' WHERE id = 'wine_el_pillo';
UPDATE restaurante.menu_items SET "nameEn" = 'La Viña de Mateo' WHERE id = 'wine_la_vina_mateo';
UPDATE restaurante.menu_items SET "nameEn" = 'Madame Monastrell' WHERE id = 'wine_madame_monastrell';
UPDATE restaurante.menu_items SET "nameEn" = 'Malpastor Crianza' WHERE id = 'wine_malpastor_crianza';
UPDATE restaurante.menu_items SET "nameEn" = 'Monteabellon 14 Months' WHERE id = 'wine_monteabellon';
UPDATE restaurante.menu_items SET "nameEn" = 'Rafa Cañizares Winemaker' WHERE id = 'wine_rafa_canizares';
UPDATE restaurante.menu_items SET "nameEn" = 'Renaix de Giró' WHERE id = 'wine_renaix_giro';
UPDATE restaurante.menu_items SET "nameEn" = 'Secret del Priorat' WHERE id = 'wine_secret_priorat';
UPDATE restaurante.menu_items SET "nameEn" = 'Sericis Old Vines' WHERE id = 'wine_sericis_cepas_viejas';
UPDATE restaurante.menu_items SET "nameEn" = 'Sericis Monastrell' WHERE id = 'wine_sericis_monastrell';
UPDATE restaurante.menu_items SET "nameEn" = 'Valdebarón' WHERE id = 'wine_valdebaron';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after updates to verify all items have proper translations:
-- SELECT COUNT(*) as still_missing
-- FROM restaurante.menu_items
-- WHERE "isAvailable" = true
--   AND ("nameEn" IS NULL OR "nameEn" = '' OR "nameEn" = name);
-- Expected result: 0 rows

-- ============================================
-- END OF SCRIPT
-- ============================================
