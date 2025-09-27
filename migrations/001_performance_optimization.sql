-- =============================================
-- ENIGMA DATABASE PERFORMANCE OPTIMIZATION
-- Migration: 001_performance_optimization.sql
-- Description: Index optimization for critical query patterns
-- =============================================

-- Performance Optimization Indexes (Created)
-- Note: These indexes were created successfully via SSH

-- Menu Items Performance Index (Completed)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_category_available
-- ON restaurante.menu_items ("categoryId", "isAvailable") WHERE "isAvailable" = true;

-- Menu Allergens Composite Index (Completed)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_allergens_composite
-- ON restaurante.menu_item_allergens ("menuItemId", "allergenId");

-- Floor Plan JSONB Spatial Index (Pending - requires GIN)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_floor_plan_jsonb_position
ON restaurante.floor_plan_elements USING GIN ((element_data->'position'));

-- Additional Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_date_status
ON restaurante.reservations (reservation_date, status)
WHERE status IN ('PENDING', 'CONFIRMED', 'SEATED');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_vip_language
ON restaurante.customers (is_vip, language) WHERE is_vip = true;

-- Email Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_schedule_due
ON restaurante.email_schedule (scheduled_at, status)
WHERE status = 'pending' AND scheduled_at <= NOW();

-- GDPR Request Processing Index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gdpr_requests_processing
ON restaurante.gdpr_requests (request_type, status, due_date)
WHERE status IN ('pending', 'in_progress');

-- Wine Pairing Optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wine_pairings_lookup
ON restaurante.wine_pairings ("foodItemId", "wineItemId");

-- QR Code Access Pattern
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_qr_scans_table_date
ON restaurante.qr_scans (table_id, scanned_at)
WHERE scanned_at >= (NOW() - INTERVAL '30 days');

-- Validation Query Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservation_tokens_validation
ON restaurante.reservation_tokens (token, expires_at, is_used)
WHERE expires_at > NOW() AND is_used = false;