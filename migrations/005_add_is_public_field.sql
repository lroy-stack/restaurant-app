-- ============================================
-- Migration: Add is_public field to tables
-- Purpose: Separate internal usage from public web visibility
-- Date: 2025-10-14
-- ============================================

BEGIN;

-- 1. Add is_public column with default true (backward compatible)
ALTER TABLE restaurante.tables
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 2. Create index for performance on public tables queries
CREATE INDEX IF NOT EXISTS idx_tables_public_visible
ON restaurante.tables(is_public)
WHERE is_public = true;

-- 3. Set is_public based on current isActive state (maintain current behavior)
UPDATE restaurante.tables
SET is_public = "isActive"
WHERE is_public IS NULL;

-- 4. Add comment for documentation
COMMENT ON COLUMN restaurante.tables.is_public IS
'Controls visibility in public web reservation form. isActive controls internal restaurant usage.
is_public=true: Visible to public. is_public=false: Only visible to staff (wildcard tables like S9, S10).';

-- 5. Insert wildcard tables S9 and S10 (hidden from public, available for staff)
INSERT INTO restaurante.tables (
  id,
  number,
  capacity,
  location,
  "qrCode",
  "isActive",
  is_public,
  "restaurantId",
  currentstatus,
  position_x,
  position_y,
  rotation,
  width,
  height,
  "createdAt",
  "updatedAt"
) VALUES
  (
    'table_s9_' || gen_random_uuid()::text,
    'S9',
    4,
    'SALA_PRINCIPAL',
    'QR_S9_PRINCIPAL_' || substr(md5(random()::text), 1, 8),
    true,
    false,
    'rest_enigma_001',
    'available',
    800,
    400,
    0,
    120,
    80,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'table_s10_' || gen_random_uuid()::text,
    'S10',
    4,
    'SALA_PRINCIPAL',
    'QR_S10_PRINCIPAL_' || substr(md5(random()::text), 1, 8),
    true,
    false,
    'rest_enigma_001',
    'available',
    950,
    400,
    0,
    120,
    80,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (number) DO UPDATE SET
  is_public = false,
  "isActive" = true
WHERE restaurante.tables.number IN ('S9', 'S10');

-- 6. Verification query
DO $$
DECLARE
  total_tables INTEGER;
  public_tables INTEGER;
  private_tables INTEGER;
  s9_exists BOOLEAN;
  s10_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO total_tables FROM restaurante.tables;
  SELECT COUNT(*) INTO public_tables FROM restaurante.tables WHERE is_public = true;
  SELECT COUNT(*) INTO private_tables FROM restaurante.tables WHERE is_public = false;
  SELECT EXISTS(SELECT 1 FROM restaurante.tables WHERE number = 'S9') INTO s9_exists;
  SELECT EXISTS(SELECT 1 FROM restaurante.tables WHERE number = 'S10') INTO s10_exists;

  RAISE NOTICE '=== Migration 005 Completed ===';
  RAISE NOTICE 'Total tables: %', total_tables;
  RAISE NOTICE 'Public tables: %', public_tables;
  RAISE NOTICE 'Private tables (staff only): %', private_tables;
  RAISE NOTICE 'S9 exists: %', s9_exists;
  RAISE NOTICE 'S10 exists: %', s10_exists;

  IF NOT s9_exists OR NOT s10_exists THEN
    RAISE WARNING 'Wildcard tables S9 or S10 missing - check conflicts';
  END IF;
END $$;

COMMIT;

-- Rollback instructions (if needed):
-- ALTER TABLE restaurante.tables DROP COLUMN IF EXISTS is_public;
-- DROP INDEX IF EXISTS restaurante.idx_tables_public_visible;
-- DELETE FROM restaurante.tables WHERE number IN ('S9', 'S10');
