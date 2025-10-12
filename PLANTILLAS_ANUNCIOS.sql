-- ============================================
-- PLANTILLAS DE ANUNCIOS - ENIGMA RESTAURANT
-- ============================================
-- Ejecutar en DB para insertar las 6 plantillas base
-- Todas se crean como INACTIVAS (is_active=false, is_published=false)
-- Actívalas desde el panel admin según necesites

-- ============================================
-- 1. MENÚ DEL DÍA - Banner informativo
-- ============================================
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published, display_order
) VALUES (
  'Menú del Día: Arroz Caldoso con Bogavante',
  'Daily Menu: Lobster Rice',
  'Tagesmenü: Hummer-Reis',
  'Descubre nuestro arroz caldoso con bogavante fresco del día. Incluye entrante y postre. Solo hoy.',
  'Discover our creamy lobster rice with fresh catch of the day. Includes starter and dessert. Today only.',
  'Entdecken Sie unseren cremigen Hummerreis mit frischem Tagesfang. Inklusive Vorspeise und Dessert. Nur heute.',
  'daily_dish', 'banner', ARRAY['inicio', 'menu'],
  'default', '#2C5F2D', '#FFFFFF', '#1A3F1B',
  'HOY', '#FF6B35',
  'Ver Menú Completo', '/menu', '#FF6B35',
  'https://images.unsplash.com/photo-1559847844-d26be0f7617e?w=400', 'Arroz caldoso con bogavante',
  true, false, true,
  false, false, 10
);

-- ============================================
-- 2. PROMOCIÓN ESPECIAL - Popup destacado
-- ============================================
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  start_date, end_date,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published, display_order
) VALUES (
  '¡Solo Este Fin de Semana!',
  'This Weekend Only!',
  'Nur dieses Wochenende!',
  'Disfruta de un 20% de descuento en todos nuestros menús degustación. Reserva ahora y vive una experiencia gastronómica inolvidable. Válido del viernes al domingo.',
  'Enjoy 20% off all our tasting menus. Book now and experience an unforgettable gastronomic journey. Valid Friday through Sunday.',
  'Genießen Sie 20% Rabatt auf alle unsere Degustationsmenüs. Jetzt buchen und ein unvergessliches gastronomisches Erlebnis erleben. Gültig von Freitag bis Sonntag.',
  'promotion', 'popup', ARRAY['all'],
  'custom', '#D32F2F', '#FFFFFF', '#B71C1C',
  '20% OFF', '#FFD700',
  'Reservar Ahora', '/reservas', '#FFD700',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', 'Mesa elegante con velas',
  '2025-10-17T00:00:00Z', '2025-10-19T23:59:59Z',
  true, false, true,
  false, false, 20
);

-- ============================================
-- 3. EVENTO PRÓXIMO - Popup con reserva
-- ============================================
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  start_date, end_date,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published, display_order
) VALUES (
  'Cena Maridaje: Vinos de la Rioja',
  'Wine Pairing Dinner: Rioja Wines',
  'Weinbegleitungsabend: Rioja-Weine',
  '<strong>Viernes 25 de Octubre, 20:30h</strong><br><br>Una experiencia única con 6 platos elaborados por nuestro chef ejecutivo, maridados con vinos exclusivos de La Rioja. Plazas limitadas.<br><br>Precio: 85€/persona',
  '<strong>Friday, October 25th, 8:30 PM</strong><br><br>A unique experience with 6 courses created by our executive chef, paired with exclusive wines from La Rioja. Limited seating.<br><br>Price: 85€/person',
  '<strong>Freitag, 25. Oktober, 20:30 Uhr</strong><br><br>Ein einzigartiges Erlebnis mit 6 Gängen, kreiert von unserem Küchenchef, kombiniert mit exklusiven Weinen aus La Rioja. Begrenzte Plätze.<br><br>Preis: 85€/Person',
  'event', 'popup', ARRAY['inicio', 'reservas'],
  'custom', '#4A148C', '#FFFFFF', '#6A1B9A',
  'EVENTO ESPECIAL', '#FFC107',
  'Reservar Plaza', '/reservas?event=cena-maridaje', '#FFC107',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', 'Copas de vino tinto',
  '2025-10-12T00:00:00Z', '2025-10-25T18:00:00Z',
  true, false, true,
  false, false, 15
);

-- ============================================
-- 4. AVISO FESTIVO / CIERRE - Banner persistente
-- ============================================
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  image_url, image_alt,
  start_date, end_date,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published, display_order
) VALUES (
  'Cerrado por Vacaciones de Verano',
  'Closed for Summer Holidays',
  'Geschlossen wegen Sommerferien',
  'Estaremos cerrados del <strong>15 al 31 de Agosto</strong> por vacaciones. Volvemos el 1 de Septiembre con nuevas propuestas gastronómicas. ¡Nos vemos pronto!',
  'We will be closed from <strong>August 15th to 31st</strong> for summer holidays. We''ll be back on September 1st with new gastronomic proposals. See you soon!',
  'Wir sind vom <strong>15. bis 31. August</strong> wegen Sommerferien geschlossen. Ab 1. September sind wir mit neuen gastronomischen Vorschlägen zurück. Bis bald!',
  'news', 'banner', ARRAY['all'],
  'custom', '#FF6F00', '#FFFFFF', '#E65100',
  'AVISO', '#FFFFFF',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', 'Playa paradisíaca',
  '2025-08-01T00:00:00Z', '2025-08-31T23:59:59Z',
  false, false, false,
  false, false, 5
);

-- ============================================
-- 5. NUEVO PLATO / LANZAMIENTO - Toast no intrusivo
-- ============================================
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published, display_order
) VALUES (
  'Novedad: Tataki de Atún Rojo',
  'New: Bluefin Tuna Tataki',
  'Neu: Roter Thunfisch Tataki',
  'Prueba nuestro nuevo tataki de atún rojo con salsa ponzu y aguacate. Ahora disponible en nuestra carta.',
  'Try our new bluefin tuna tataki with ponzu sauce and avocado. Now available on our menu.',
  'Probieren Sie unser neues Roten Thunfisch Tataki mit Ponzu-Sauce und Avocado. Jetzt auf unserer Karte verfügbar.',
  'menu_update', 'toast', ARRAY['menu'],
  'default', '#00695C', '#FFFFFF', '#004D40',
  'NUEVO', '#00E676',
  'Ver Carta', '/menu', '#00E676',
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', 'Tataki de atún rojo',
  true, true, false,
  false, false, 8
);

-- ============================================
-- 6. PROGRAMA VIP / FIDELIZACIÓN - Popup conversión
-- ============================================
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published, display_order
) VALUES (
  'Únete al Club Enigma',
  'Join the Enigma Club',
  'Werden Sie Mitglied im Enigma Club',
  '<strong>Ventajas exclusivas para ti:</strong><br>✓ Descuento del 10% en todos tus pedidos<br>✓ Acceso anticipado a eventos especiales<br>✓ Cumpleaños con sorpresa de la casa<br>✓ Acumulación de puntos canjeables<br><br>Regístrate gratis y comienza a disfrutar.',
  '<strong>Exclusive benefits for you:</strong><br>✓ 10% discount on all your orders<br>✓ Early access to special events<br>✓ Birthday surprise from the house<br>✓ Redeemable points accumulation<br><br>Register for free and start enjoying.',
  '<strong>Exklusive Vorteile für Sie:</strong><br>✓ 10% Rabatt auf alle Bestellungen<br>✓ Frühzeitiger Zugang zu Sonderveranstaltungen<br>✓ Geburtstagsüberraschung vom Haus<br>✓ Ansammlung einlösbarer Punkte<br><br>Kostenlos registrieren und genießen.',
  'promotion', 'popup', ARRAY['inicio'],
  'custom', '#1A237E', '#FFFFFF', '#0D47A1',
  'VIP', '#FFD700',
  'Registrarme Ahora', '/reservas#registro', '#FFD700',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600', 'Mesa VIP elegante',
  true, false, true,
  false, false, 12
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Contar plantillas insertadas
SELECT
  type,
  display_type,
  COUNT(*) as cantidad,
  STRING_AGG(title, ', ' ORDER BY display_order) as titulos
FROM restaurante.announcements
WHERE is_active = false AND is_published = false
GROUP BY type, display_type
ORDER BY type, display_type;

-- Ver todas las plantillas creadas
SELECT
  id,
  title,
  type,
  display_type,
  pages,
  display_order,
  is_active,
  is_published
FROM restaurante.announcements
WHERE is_active = false AND is_published = false
ORDER BY display_order;
