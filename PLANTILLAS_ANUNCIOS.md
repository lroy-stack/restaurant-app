# Plantillas de Anuncios - Enigma Restaurant

> **Sistema modular de anuncios reutilizables**
> Configura desde el panel admin en `/dashboard/configuracion` → Tab "Publicidad"

---

## 📋 Índice de Plantillas

1. **Menú del Día** - Banner informativo para platos especiales
2. **Promoción Especial** - Popup destacado para ofertas limitadas
3. **Evento Próximo** - Popup con reserva para eventos especiales
4. **Aviso Festivo** - Banner de advertencia para cierres
5. **Nuevo Plato** - Toast de novedad gastronómica
6. **Programa VIP** - Popup de fidelización

---

## 1. 🍽️ Menú del Día

**Propósito**: Destacar el plato especial diario
**Display**: Banner (top page)
**Frecuencia**: Cambiar diariamente

### Configuración

```json
{
  "title": "Menú del Día: Arroz Caldoso con Bogavante",
  "titleEn": "Daily Menu: Lobster Rice",
  "titleDe": "Tagesmenü: Hummer-Reis",

  "content": "Descubre nuestro arroz caldoso con bogavante fresco del día. Incluye entrante y postre. Solo hoy.",
  "contentEn": "Discover our creamy lobster rice with fresh catch of the day. Includes starter and dessert. Today only.",
  "contentDe": "Entdecken Sie unseren cremigen Hummerreis mit frischem Tagesfang. Inklusive Vorspeise und Dessert. Nur heute.",

  "type": "daily_dish",
  "displayType": "banner",
  "pages": ["inicio", "menu"],

  "theme": "default",
  "backgroundColor": "#2C5F2D",
  "textColor": "#FFFFFF",
  "borderColor": "#1A3F1B",

  "badgeText": "HOY",
  "badgeColor": "#FF6B35",

  "ctaText": "Ver Menú Completo",
  "ctaUrl": "/menu",
  "ctaButtonColor": "#FF6B35",

  "imageUrl": "https://images.unsplash.com/photo-1559847844-d26be0f7617e?w=400",
  "imageAlt": "Arroz caldoso con bogavante",

  "isDismissible": true,
  "showOncePerSession": false,
  "showOncePerDay": true
}
```

**SQL Insert**:
```sql
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published
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
  false, false
);
```

---

## 2. 🎉 Promoción Especial

**Propósito**: Ofertas por tiempo limitado (descuentos, combos)
**Display**: Popup (centro pantalla)
**Frecuencia**: 1-2 veces por semana

### Configuración

```json
{
  "title": "¡Solo Este Fin de Semana!",
  "titleEn": "This Weekend Only!",
  "titleDe": "Nur dieses Wochenende!",

  "content": "Disfruta de un 20% de descuento en todos nuestros menús degustación. Reserva ahora y vive una experiencia gastronómica inolvidable. Válido del viernes al domingo.",
  "contentEn": "Enjoy 20% off all our tasting menus. Book now and experience an unforgettable gastronomic journey. Valid Friday through Sunday.",
  "contentDe": "Genießen Sie 20% Rabatt auf alle unsere Degustationsmenüs. Jetzt buchen und ein unvergessliches gastronomisches Erlebnis erleben. Gültig von Freitag bis Sonntag.",

  "type": "promotion",
  "displayType": "popup",
  "pages": ["all"],

  "theme": "custom",
  "backgroundColor": "#D32F2F",
  "textColor": "#FFFFFF",
  "borderColor": "#B71C1C",

  "badgeText": "20% OFF",
  "badgeColor": "#FFD700",

  "ctaText": "Reservar Ahora",
  "ctaUrl": "/reservas",
  "ctaButtonColor": "#FFD700",

  "imageUrl": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
  "imageAlt": "Mesa elegante con velas",

  "startDate": "2025-10-17T00:00:00Z",
  "endDate": "2025-10-19T23:59:59Z",

  "isDismissible": true,
  "showOncePerSession": false,
  "showOncePerDay": true
}
```

**SQL Insert**:
```sql
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
  is_active, is_published
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
  false, false
);
```

---

## 3. 🎭 Evento Próximo

**Propósito**: Anunciar cenas temáticas, showcooking, eventos especiales
**Display**: Popup (centro pantalla)
**Frecuencia**: Mensual o según calendario

### Configuración

```json
{
  "title": "Cena Maridaje: Vinos de la Rioja",
  "titleEn": "Wine Pairing Dinner: Rioja Wines",
  "titleDe": "Weinbegleitungsabend: Rioja-Weine",

  "content": "<strong>Viernes 25 de Octubre, 20:30h</strong><br><br>Una experiencia única con 6 platos elaborados por nuestro chef ejecutivo, maridados con vinos exclusivos de La Rioja. Plazas limitadas.<br><br>Precio: 85€/persona",
  "contentEn": "<strong>Friday, October 25th, 8:30 PM</strong><br><br>A unique experience with 6 courses created by our executive chef, paired with exclusive wines from La Rioja. Limited seating.<br><br>Price: 85€/person",
  "contentDe": "<strong>Freitag, 25. Oktober, 20:30 Uhr</strong><br><br>Ein einzigartiges Erlebnis mit 6 Gängen, kreiert von unserem Küchenchef, kombiniert mit exklusiven Weinen aus La Rioja. Begrenzte Plätze.<br><br>Preis: 85€/Person",

  "type": "event",
  "displayType": "popup",
  "pages": ["inicio", "reservas"],

  "theme": "custom",
  "backgroundColor": "#4A148C",
  "textColor": "#FFFFFF",
  "borderColor": "#6A1B9A",

  "badgeText": "EVENTO ESPECIAL",
  "badgeColor": "#FFC107",

  "ctaText": "Reservar Plaza",
  "ctaUrl": "/reservas?event=cena-maridaje",
  "ctaButtonColor": "#FFC107",

  "imageUrl": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600",
  "imageAlt": "Copas de vino tinto",

  "startDate": "2025-10-12T00:00:00Z",
  "endDate": "2025-10-25T18:00:00Z",

  "isDismissible": true,
  "showOncePerSession": false,
  "showOncePerDay": true
}
```

**SQL Insert**:
```sql
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
  is_active, is_published
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
  false, false
);
```

---

## 4. 🏖️ Aviso Festivo / Cierre

**Propósito**: Informar de cierres por festivos, vacaciones, reformas
**Display**: Banner (top page, no dismissible)
**Frecuencia**: Según calendario festivo

### Configuración

```json
{
  "title": "Cerrado por Vacaciones de Verano",
  "titleEn": "Closed for Summer Holidays",
  "titleDe": "Geschlossen wegen Sommerferien",

  "content": "Estaremos cerrados del <strong>15 al 31 de Agosto</strong> por vacaciones. Volvemos el 1 de Septiembre con nuevas propuestas gastronómicas. ¡Nos vemos pronto!",
  "contentEn": "We will be closed from <strong>August 15th to 31st</strong> for summer holidays. We'll be back on September 1st with new gastronomic proposals. See you soon!",
  "contentDe": "Wir sind vom <strong>15. bis 31. August</strong> wegen Sommerferien geschlossen. Ab 1. September sind wir mit neuen gastronomischen Vorschlägen zurück. Bis bald!",

  "type": "news",
  "displayType": "banner",
  "pages": ["all"],

  "theme": "custom",
  "backgroundColor": "#FF6F00",
  "textColor": "#FFFFFF",
  "borderColor": "#E65100",

  "badgeText": "AVISO",
  "badgeColor": "#FFFFFF",

  "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
  "imageAlt": "Playa paradisíaca",

  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",

  "isDismissible": false,
  "showOncePerSession": false,
  "showOncePerDay": false
}
```

**SQL Insert**:
```sql
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  image_url, image_alt,
  start_date, end_date,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published
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
  false, false
);
```

---

## 5. 🆕 Nuevo Plato / Lanzamiento

**Propósito**: Destacar nuevas incorporaciones a la carta
**Display**: Toast (bottom-right, no intrusivo)
**Frecuencia**: Al lanzar nuevos platos

### Configuración

```json
{
  "title": "Novedad: Tataki de Atún Rojo",
  "titleEn": "New: Bluefin Tuna Tataki",
  "titleDe": "Neu: Roter Thunfisch Tataki",

  "content": "Prueba nuestro nuevo tataki de atún rojo con salsa ponzu y aguacate. Ahora disponible en nuestra carta.",
  "contentEn": "Try our new bluefin tuna tataki with ponzu sauce and avocado. Now available on our menu.",
  "contentDe": "Probieren Sie unser neues Roten Thunfisch Tataki mit Ponzu-Sauce und Avocado. Jetzt auf unserer Karte verfügbar.",

  "type": "menu_update",
  "displayType": "toast",
  "pages": ["menu"],

  "theme": "default",
  "backgroundColor": "#00695C",
  "textColor": "#FFFFFF",
  "borderColor": "#004D40",

  "badgeText": "NUEVO",
  "badgeColor": "#00E676",

  "ctaText": "Ver Carta",
  "ctaUrl": "/menu",
  "ctaButtonColor": "#00E676",

  "imageUrl": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
  "imageAlt": "Tataki de atún rojo",

  "isDismissible": true,
  "showOncePerSession": true,
  "showOncePerDay": false
}
```

**SQL Insert**:
```sql
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published
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
  false, false
);
```

---

## 6. 💎 Programa VIP / Fidelización

**Propósito**: Invitar a clientes a programa de fidelización
**Display**: Popup (centro pantalla)
**Frecuencia**: Primera visita o usuarios no registrados

### Configuración

```json
{
  "title": "Únete al Club Enigma",
  "titleEn": "Join the Enigma Club",
  "titleDe": "Werden Sie Mitglied im Enigma Club",

  "content": "<strong>Ventajas exclusivas para ti:</strong><br>✓ Descuento del 10% en todos tus pedidos<br>✓ Acceso anticipado a eventos especiales<br>✓ Cumpleaños con sorpresa de la casa<br>✓ Acumulación de puntos canjeables<br><br>Regístrate gratis y comienza a disfrutar.",
  "contentEn": "<strong>Exclusive benefits for you:</strong><br>✓ 10% discount on all your orders<br>✓ Early access to special events<br>✓ Birthday surprise from the house<br>✓ Redeemable points accumulation<br><br>Register for free and start enjoying.",
  "contentDe": "<strong>Exklusive Vorteile für Sie:</strong><br>✓ 10% Rabatt auf alle Bestellungen<br>✓ Frühzeitiger Zugang zu Sonderveranstaltungen<br>✓ Geburtstagsüberraschung vom Haus<br>✓ Ansammlung einlösbarer Punkte<br><br>Kostenlos registrieren und genießen.",

  "type": "promotion",
  "displayType": "popup",
  "pages": ["inicio"],

  "theme": "custom",
  "backgroundColor": "#1A237E",
  "textColor": "#FFFFFF",
  "borderColor": "#0D47A1",

  "badgeText": "VIP",
  "badgeColor": "#FFD700",

  "ctaText": "Registrarme Ahora",
  "ctaUrl": "/reservas#registro",
  "ctaButtonColor": "#FFD700",

  "imageUrl": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600",
  "imageAlt": "Mesa VIP elegante",

  "isDismissible": true,
  "showOncePerSession": false,
  "showOncePerDay": true
}
```

**SQL Insert**:
```sql
INSERT INTO restaurante.announcements (
  title, title_en, title_de,
  content, content_en, content_de,
  type, display_type, pages,
  theme, background_color, text_color, border_color,
  badge_text, badge_color,
  cta_text, cta_url, cta_button_color,
  image_url, image_alt,
  is_dismissible, show_once_per_session, show_once_per_day,
  is_active, is_published
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
  false, false
);
```

---

## 📊 Guía de Uso

### Cómo Activar un Anuncio

1. **Vía Panel Admin** (Recomendado):
   - Accede a `/dashboard/configuracion`
   - Tab "Publicidad"
   - Crear nuevo → Copiar valores de plantilla
   - Activar toggle "Activo" y "Publicado"

2. **Vía SQL Directo**:
   ```sql
   -- Copiar INSERT de plantilla deseada
   -- Ejecutar en DB
   -- Luego activar:
   UPDATE restaurante.announcements
   SET is_active = true, is_published = true
   WHERE title = 'Título del Anuncio';
   ```

### Cuándo Usar Cada Display Type

- **Popup**: Información crítica o promociones importantes (máx 1 activo)
- **Banner**: Avisos persistentes, información horarios (máx 2 activos)
- **Toast**: Novedades no intrusivas, actualizaciones menores (múltiples OK)

### Paleta de Colores Predefinida

```css
/* Rojo Promoción */ #D32F2F
/* Verde Menú Día */ #2C5F2D
/* Púrpura Evento */ #4A148C
/* Naranja Aviso */ #FF6F00
/* Teal Novedad */ #00695C
/* Azul VIP */ #1A237E
/* Dorado Acento */ #FFD700
/* Blanco Texto */ #FFFFFF
```

### Best Practices

1. **Máximo 3 anuncios activos simultáneos** (1 popup + 2 banners/toasts)
2. **Actualizar fechas** en eventos y promociones temporales
3. **Probar en móvil** antes de publicar
4. **Revisar traducciones** EN/DE si tienes público internacional
5. **Monitorear analytics** en tab Publicidad (views, clicks, conversions)

---

## 🔄 Reciclaje de Plantillas

Para reutilizar una plantilla:

1. **Duplicar** el anuncio existente en panel admin
2. **Cambiar**:
   - Título y contenido específico
   - Fechas `start_date` y `end_date`
   - URL de imagen si aplica
   - CTA URL si redirige a página específica
3. **Mantener**:
   - Colores (para consistencia de marca)
   - Display type (según propósito)
   - Configuración de repetición

---

## 📸 Imágenes Recomendadas

**Fuentes gratuitas**:
- Unsplash (https://unsplash.com) - Alta calidad, sin atribución
- Pexels (https://pexels.com) - Stock photos gratis
- Pixabay (https://pixabay.com) - Imágenes y videos libres

**Especificaciones**:
- **Popup**: 1200x600px (ratio 2:1)
- **Banner**: 1600x400px (ratio 4:1)
- **Toast**: 800x400px (ratio 2:1)
- **Formato**: WebP o JPG optimizado
- **Peso máximo**: 150KB

---

**Última actualización**: 12 Octubre 2025
**Sistema**: Enigma Restaurant Management v2.0
