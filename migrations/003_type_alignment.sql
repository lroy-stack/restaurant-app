-- =============================================
-- ENIGMA TYPE ALIGNMENT MIGRATION
-- Migration: 003_type_alignment.sql
-- Description: Align database enums with TypeScript definitions
-- =============================================

-- Current Database Enums:
-- CategoryType: {FOOD,WINE,BEVERAGE}
-- OrderItemStatus: {PENDING,PREPARING,READY,SERVED,CANCELLED}
-- OrderStatus: {PENDING,CONFIRMED,PREPARING,READY,SERVED,CANCELLED}
-- ReservationStatus: {PENDING,CONFIRMED,SEATED,COMPLETED,CANCELLED,NO_SHOW}
-- TableLocation: {TERRACE,INTERIOR,BAR,TERRACE_CAMPANARI,SALA_VIP,SALA_PRINCIPAL,TERRACE_JUSTICIA}
-- UserRole: {ADMIN,MANAGER,STAFF,CUSTOMER}

-- TypeScript expects lowercase enum values for consistency
-- Option 1: Update database enums to lowercase (BREAKING CHANGE)
-- Option 2: Create mapping functions (RECOMMENDED)

-- =============================================
-- ENUM MAPPING FUNCTIONS FOR TYPE SAFETY
-- =============================================

-- Reservation Status Mapping
CREATE OR REPLACE FUNCTION map_reservation_status_to_ts(db_status ReservationStatus)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE db_status
        WHEN 'PENDING' THEN 'pending'
        WHEN 'CONFIRMED' THEN 'confirmed'
        WHEN 'SEATED' THEN 'seated'
        WHEN 'COMPLETED' THEN 'completed'
        WHEN 'CANCELLED' THEN 'cancelled'
        WHEN 'NO_SHOW' THEN 'no_show'
        ELSE db_status::text
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- User Role Mapping
CREATE OR REPLACE FUNCTION map_user_role_to_ts(db_role UserRole)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE db_role
        WHEN 'ADMIN' THEN 'admin'
        WHEN 'MANAGER' THEN 'manager'
        WHEN 'STAFF' THEN 'staff'
        WHEN 'CUSTOMER' THEN 'customer'
        ELSE db_role::text
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Category Type Mapping
CREATE OR REPLACE FUNCTION map_category_type_to_ts(db_type CategoryType)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE db_type
        WHEN 'FOOD' THEN 'food'
        WHEN 'WINE' THEN 'wine'
        WHEN 'BEVERAGE' THEN 'beverage'
        ELSE db_type::text
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Table Location Mapping
CREATE OR REPLACE FUNCTION map_table_location_to_ts(db_location TableLocation)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE db_location
        WHEN 'TERRACE' THEN 'terrace'
        WHEN 'INTERIOR' THEN 'interior'
        WHEN 'BAR' THEN 'bar'
        WHEN 'TERRACE_CAMPANARI' THEN 'terrace_campanari'
        WHEN 'SALA_VIP' THEN 'sala_vip'
        WHEN 'SALA_PRINCIPAL' THEN 'sala_principal'
        WHEN 'TERRACE_JUSTICIA' THEN 'terrace_justicia'
        ELSE db_location::text
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- REVERSE MAPPING FUNCTIONS (TS TO DB)
-- =============================================

-- TypeScript to Database Reservation Status
CREATE OR REPLACE FUNCTION map_ts_to_reservation_status(ts_status TEXT)
RETURNS ReservationStatus AS $$
BEGIN
    RETURN CASE ts_status
        WHEN 'pending' THEN 'PENDING'::ReservationStatus
        WHEN 'confirmed' THEN 'CONFIRMED'::ReservationStatus
        WHEN 'seated' THEN 'SEATED'::ReservationStatus
        WHEN 'completed' THEN 'COMPLETED'::ReservationStatus
        WHEN 'cancelled' THEN 'CANCELLED'::ReservationStatus
        WHEN 'no_show' THEN 'NO_SHOW'::ReservationStatus
        ELSE ts_status::ReservationStatus
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- TYPE-SAFE VIEWS FOR FRONTEND CONSUMPTION
-- =============================================

-- Reservations with TypeScript-compatible enum values
CREATE OR REPLACE VIEW restaurante.reservations_ts AS
SELECT
    id,
    customer_id,
    table_ids,
    reservation_date,
    reservation_time,
    party_size,
    duration,
    map_reservation_status_to_ts(status) as status,
    special_requests,
    dietary_notes,
    occasion,
    pre_order_items,
    pre_order_total,
    total_estimated,
    customer_notes,
    internal_notes,
    consent_data_processing,
    consent_marketing,
    gdpr_policy_version,
    created_at,
    updated_at,
    confirmed_at,
    seated_at,
    completed_at
FROM restaurante.reservations;

-- Users with TypeScript-compatible role values
CREATE OR REPLACE VIEW restaurante.users_ts AS
SELECT
    id,
    email,
    name,
    map_user_role_to_ts(role) as role,
    restaurant_id,
    is_active,
    last_login,
    created_at,
    updated_at
FROM restaurante.users;

-- Menu Categories with TypeScript-compatible type values
CREATE OR REPLACE VIEW restaurante.menu_categories_ts AS
SELECT
    id,
    name,
    "nameEn",
    description,
    "descriptionEn",
    map_category_type_to_ts(type) as type,
    "displayOrder",
    "isActive",
    "createdAt",
    "updatedAt"
FROM restaurante.menu_categories;

-- =============================================
-- RLS POLICIES FOR TYPE-SAFE VIEWS
-- =============================================

-- Enable RLS on views
ALTER VIEW restaurante.reservations_ts SET (security_invoker = true);
ALTER VIEW restaurante.users_ts SET (security_invoker = true);
ALTER VIEW restaurante.menu_categories_ts SET (security_invoker = true);

-- =============================================
-- MIGRATION VALIDATION
-- =============================================

-- Test enum mapping functions
DO $$
DECLARE
    test_status ReservationStatus := 'CONFIRMED';
    mapped_status TEXT;
    reverse_mapped ReservationStatus;
BEGIN
    -- Test forward mapping
    mapped_status := map_reservation_status_to_ts(test_status);
    RAISE NOTICE 'Forward mapping: % -> %', test_status, mapped_status;

    -- Test reverse mapping
    reverse_mapped := map_ts_to_reservation_status(mapped_status);
    RAISE NOTICE 'Reverse mapping: % -> %', mapped_status, reverse_mapped;

    -- Validate round trip
    IF reverse_mapped = test_status THEN
        RAISE NOTICE 'Enum mapping validation: SUCCESS';
    ELSE
        RAISE EXCEPTION 'Enum mapping validation: FAILED';
    END IF;
END $$;