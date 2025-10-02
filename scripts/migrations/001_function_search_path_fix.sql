-- ====================================================================
-- MIGRATION 001: Function search_path Security Hardening
-- OBJETIVO: Proteger 27 funciones contra search path hijacking
-- FECHA: 2025-10-02
-- RIESGO: LOW (no breaking changes si funciones usan qualified names)
-- DOWNTIME: ZERO
-- ====================================================================

-- PASO 1: Verificar funciones vulnerables (PRE-migration)
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE
    WHEN p.proconfig IS NULL THEN '❌ VULNERABLE'
    WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN '✅ PROTECTED'
    ELSE '⚠️ PARTIAL'
  END as security_status,
  CASE WHEN p.prosecdef THEN '🔴 SECURITY DEFINER' ELSE 'INVOKER' END as execution_mode
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('restaurante', 'public', 'experimental')
  AND p.proconfig IS NULL
ORDER BY
  CASE WHEN p.prosecdef THEN 1 ELSE 2 END, -- SECURITY DEFINER primero
  n.nspname,
  p.proname;

-- Expected: 27 funciones con status VULNERABLE

-- ====================================================================
-- PASO 2: Aplicar SET search_path = '' a todas las funciones vulnerables
-- ====================================================================

DO $$
DECLARE
  func_record RECORD;
  fixed_count INT := 0;
  error_count INT := 0;
BEGIN
  RAISE NOTICE 'Starting function search_path hardening...';
  RAISE NOTICE '================================================';

  FOR func_record IN
    SELECT
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args,
      p.prosecdef as is_security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('restaurante', 'public', 'experimental')
      AND p.proconfig IS NULL -- Solo funciones sin search_path configurado
    ORDER BY
      CASE WHEN p.prosecdef THEN 1 ELSE 2 END -- SECURITY DEFINER primero
  LOOP
    BEGIN
      -- Aplicar SET search_path = ''
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = ''''',
        func_record.schema_name,
        func_record.function_name,
        func_record.args
      );

      fixed_count := fixed_count + 1;

      RAISE NOTICE '[✅] Fixed: %.%(%s) %s',
        func_record.schema_name,
        func_record.function_name,
        func_record.args,
        CASE WHEN func_record.is_security_definer THEN '🔴 SECURITY DEFINER' ELSE '' END;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING '[❌] ERROR: %.%(%s) - %',
        func_record.schema_name,
        func_record.function_name,
        func_record.args,
        SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '  - Fixed: % functions', fixed_count;
  RAISE NOTICE '  - Errors: % functions', error_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run verification query (PASO 3)';
END;
$$;

-- ====================================================================
-- PASO 3: Verificar que todas las funciones están protegidas (POST-migration)
-- ====================================================================

SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE
    WHEN p.proconfig IS NULL THEN '❌ VULNERABLE'
    WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN '✅ PROTECTED'
    ELSE '⚠️ PARTIAL'
  END as security_status,
  CASE WHEN p.prosecdef THEN '🔴 SECURITY DEFINER' ELSE 'INVOKER' END as execution_mode
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('restaurante', 'public', 'experimental')
ORDER BY
  CASE
    WHEN p.proconfig IS NULL THEN 1
    ELSE 2
  END,
  n.nspname,
  p.proname;

-- Expected: 0 funciones con status VULNERABLE (todas deben estar PROTECTED)

-- ====================================================================
-- PASO 4: Testing funcional - Verificar que funciones siguen operando correctamente
-- ====================================================================

-- Test 1: Función SECURITY DEFINER más crítica
SELECT restaurante.current_user_role();
-- Expected: Devuelve role del usuario autenticado (admin, staff, customer, etc.)

-- Test 2: Función get_user_role
SELECT restaurante.get_user_role();
-- Expected: Similar al anterior, sin errores

-- Test 3: Handle new user (trigger function)
-- (Se ejecuta automáticamente en INSERT a auth.users, validar mediante nueva inserción)

-- Test 4: Trigger update_updated_at
UPDATE restaurante.menu_items
SET name = name -- No-op update para disparar trigger
WHERE id = (SELECT id FROM restaurante.menu_items LIMIT 1);
-- Expected: updatedAt se actualiza correctamente

-- Test 5: Business logic function
SELECT restaurante.calculate_table_capacity(
  (SELECT id FROM restaurante.floor_plan_elements WHERE type = 'table' LIMIT 1)
);
-- Expected: Devuelve capacidad de mesa sin errores

-- ====================================================================
-- ROLLBACK PROCEDURE (solo ejecutar si testing falla)
-- ====================================================================

/*
-- Si alguna función tiene breaking changes, resetear search_path individualmente:
ALTER FUNCTION restaurante.current_user_role() RESET search_path;
ALTER FUNCTION restaurante.get_user_role() RESET search_path;
-- ... etc para funciones problemáticas

-- O rollback completo (NO RECOMENDADO, solo en caso crítico):
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('restaurante', 'public', 'experimental')
      AND p.proconfig IS NOT NULL
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) RESET search_path', func_record.nspname, func_record.proname, func_record.args);
  END LOOP;
END;
$$;
*/

-- ====================================================================
-- NOTAS IMPORTANTES:
-- 1. Migration es idempotente (puede ejecutarse múltiples veces)
-- 2. Zero downtime (ALTER FUNCTION no bloquea ejecuciones en curso)
-- 3. Si funciones usan qualified names (schema.table), cero breaking changes
-- 4. Si funciones usan nombres sin schema, pueden necesitar ajustes
-- 5. Testing exhaustivo requerido post-migration (ver PASO 4)
-- ====================================================================
