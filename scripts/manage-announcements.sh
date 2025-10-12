#!/bin/bash

# ============================================
# SCRIPT DE GESTIÓN DE ANUNCIOS - ENIGMA
# ============================================
# Gestiona anuncios desde SSH/CLI sin usar panel admin

DB_CONTAINER=$(docker ps -qf "name=db")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   GESTIÓN DE ANUNCIOS - ENIGMA        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# FUNCIONES
# ============================================

list_announcements() {
  echo -e "${YELLOW}📋 Lista de Anuncios:${NC}"
  docker exec -i $DB_CONTAINER psql -U postgres -d postgres <<EOF
\x
SELECT
  id,
  SUBSTRING(title, 1, 40) as titulo,
  type as tipo,
  display_type as display,
  ARRAY_TO_STRING(pages, ', ') as paginas,
  is_active as activo,
  is_published as publicado,
  CASE
    WHEN start_date IS NOT NULL THEN 'Desde: ' || TO_CHAR(start_date, 'DD/MM/YYYY')
    ELSE 'Sin inicio'
  END as periodo,
  CASE
    WHEN end_date IS NOT NULL THEN 'Hasta: ' || TO_CHAR(end_date, 'DD/MM/YYYY')
    ELSE 'Sin fin'
  END as vigencia
FROM restaurante.announcements
ORDER BY display_order DESC, created_at DESC;
EOF
}

activate_announcement() {
  local id=$1
  echo -e "${GREEN}✅ Activando anuncio ${id}...${NC}"
  docker exec -i $DB_CONTAINER psql -U postgres -d postgres <<EOF
UPDATE restaurante.announcements
SET is_active = true, is_published = true, updated_at = NOW()
WHERE id = '$id';

SELECT title, type, display_type, pages
FROM restaurante.announcements
WHERE id = '$id';
EOF
  echo -e "${GREEN}✓ Anuncio activado y publicado${NC}"
}

deactivate_announcement() {
  local id=$1
  echo -e "${YELLOW}⏸️  Desactivando anuncio ${id}...${NC}"
  docker exec -i $DB_CONTAINER psql -U postgres -d postgres <<EOF
UPDATE restaurante.announcements
SET is_active = false, updated_at = NOW()
WHERE id = '$id';

SELECT title, is_active, is_published
FROM restaurante.announcements
WHERE id = '$id';
EOF
  echo -e "${YELLOW}✓ Anuncio desactivado${NC}"
}

delete_announcement() {
  local id=$1
  echo -e "${RED}🗑️  ADVERTENCIA: ¿Eliminar anuncio permanentemente? (s/N)${NC}"
  read -r confirm
  if [[ $confirm =~ ^[Ss]$ ]]; then
    docker exec -i $DB_CONTAINER psql -U postgres -d postgres <<EOF
DELETE FROM restaurante.announcements WHERE id = '$id';
EOF
    echo -e "${RED}✓ Anuncio eliminado${NC}"
  else
    echo -e "${BLUE}Cancelado${NC}"
  fi
}

active_announcements() {
  echo -e "${GREEN}🟢 Anuncios Activos:${NC}"
  docker exec -i $DB_CONTAINER psql -U postgres -d postgres <<EOF
SELECT
  SUBSTRING(title, 1, 50) as titulo,
  type as tipo,
  display_type as display,
  views_count as vistas,
  clicks_count as clicks,
  ROUND((clicks_count::numeric / NULLIF(views_count, 0) * 100), 2) as ctr_percent
FROM restaurante.announcements
WHERE is_active = true AND is_published = true
ORDER BY display_order DESC;
EOF
}

stats_announcements() {
  echo -e "${BLUE}📊 Estadísticas de Anuncios:${NC}"
  docker exec -i $DB_CONTAINER psql -U postgres -d postgres <<EOF
SELECT
  SUBSTRING(title, 1, 40) as titulo,
  views_count as vistas,
  clicks_count as clicks,
  conversion_count as conversiones,
  ROUND((clicks_count::numeric / NULLIF(views_count, 0) * 100), 2) || '%' as ctr,
  ROUND((conversion_count::numeric / NULLIF(clicks_count, 0) * 100), 2) || '%' as conversion_rate
FROM restaurante.announcements
WHERE views_count > 0
ORDER BY views_count DESC
LIMIT 10;
EOF
}

# ============================================
# MENÚ PRINCIPAL
# ============================================

while true; do
  echo ""
  echo -e "${BLUE}Selecciona una opción:${NC}"
  echo "  1) Listar todos los anuncios"
  echo "  2) Ver anuncios activos"
  echo "  3) Activar anuncio"
  echo "  4) Desactivar anuncio"
  echo "  5) Eliminar anuncio"
  echo "  6) Ver estadísticas"
  echo "  0) Salir"
  echo ""
  read -p "Opción: " option

  case $option in
    1)
      list_announcements
      ;;
    2)
      active_announcements
      ;;
    3)
      read -p "ID del anuncio a activar: " ann_id
      activate_announcement "$ann_id"
      ;;
    4)
      read -p "ID del anuncio a desactivar: " ann_id
      deactivate_announcement "$ann_id"
      ;;
    5)
      read -p "ID del anuncio a eliminar: " ann_id
      delete_announcement "$ann_id"
      ;;
    6)
      stats_announcements
      ;;
    0)
      echo -e "${GREEN}¡Hasta luego!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Opción inválida${NC}"
      ;;
  esac
done
