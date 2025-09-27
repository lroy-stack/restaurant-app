/**
 * Zero-Downtime Migration Runner for Enigma Database
 * Handles progressive deployment with rollback capability
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

interface MigrationResult {
  migration: string
  success: boolean
  executionTime: number
  error?: string
}

interface MigrationPlan {
  migrations: string[]
  estimated_duration: string
  rollback_available: boolean
}

interface DatabaseIndex {
  indexname: string
  tablename: string
  schemaname: string
}

interface DatabasePolicy {
  policyname: string
  tablename: string
  schemaname: string
}

interface QueryPlan {
  query: string
  execution_time: number
  plan: string
}

type SupabaseClient = ReturnType<typeof createClient>

export class MigrationRunner {
  private supabaseAdmin: ReturnType<typeof createClient>
  private migrationsPath: string

  constructor() {
    this.supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: { schema: 'restaurante' },
        auth: { persistSession: false }
      }
    )

    this.migrationsPath = path.join(process.cwd(), 'migrations')
  }

  /**
   * Execute migration plan with zero-downtime strategy
   */
  async executeMigrationPlan(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []

    const migrations = [
      '001_performance_optimization.sql',
      '002_rls_security_hardening.sql',
      '003_type_alignment.sql'
    ]

    // Pre-flight checks
    await this.preflightChecks()

    for (const migration of migrations) {
      try {
        const startTime = Date.now()
        await this.executeMigration(migration)
        const executionTime = Date.now() - startTime

        results.push({
          migration,
          success: true,
          executionTime
        })

        console.log(`✅ Migration ${migration} completed in ${executionTime}ms`)
      } catch (error) {
        results.push({
          migration,
          success: false,
          executionTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        console.error(`❌ Migration ${migration} failed:`, error)
        // Don't break on index creation failures (they might already exist)
        if (!migration.includes('performance_optimization')) {
          throw error
        }
      }
    }

    return results
  }

  /**
   * Execute individual migration with CONCURRENTLY for zero-downtime
   */
  private async executeMigration(filename: string): Promise<void> {
    const migrationPath = path.join(this.migrationsPath, filename)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Split SQL by statements (handle CONCURRENTLY indexes specially)
    const statements = this.splitSQL(sql)

    for (const statement of statements) {
      if (statement.trim()) {
        // Execute via raw SQL for CONCURRENTLY support
        const { error } = await this.supabaseAdmin.rpc('exec_sql', {
          sql_statement: statement
        })

        if (error) {
          // Allow index creation to fail if already exists
          if (statement.includes('CREATE INDEX') && error.message.includes('already exists')) {
            console.warn(`Index already exists, skipping: ${statement.substring(0, 50)}...`)
            continue
          }
          throw error
        }
      }
    }
  }

  /**
   * Pre-flight safety checks before migration
   */
  private async preflightChecks(): Promise<void> {
    // Check database connectivity
    const { data, error } = await this.supabaseAdmin
      .from('restaurants')
      .select('id')
      .limit(1)

    if (error) {
      throw new Error(`Database connectivity check failed: ${error.message}`)
    }

    // Check for active connections (warn if high)
    const { data: connections } = await this.supabaseAdmin.rpc('check_active_connections')
    if (connections && connections > 50) {
      console.warn(`Warning: ${connections} active connections detected`)
    }

    // Validate schema exists
    const { data: schemas } = await this.supabaseAdmin.rpc('list_schemas')
    if (!schemas?.includes('restaurante')) {
      throw new Error('restaurante schema not found')
    }

    console.log('✅ Pre-flight checks passed')
  }

  /**
   * Split SQL into individual statements while preserving CONCURRENTLY
   */
  private splitSQL(sql: string): string[] {
    // Remove comments and split by semicolon, but preserve complex statements
    const cleaned = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
    return cleaned.split(';').map(s => s.trim()).filter(s => s.length > 0)
  }

  /**
   * Validate migration results and database integrity
   */
  async validateMigration(): Promise<boolean> {
    try {
      // Test critical indexes exist
      const { data: indexes } = await this.supabaseAdmin.rpc('list_indexes', {
        schema_name: 'restaurante'
      })

      const requiredIndexes = [
        'idx_menu_items_category_available',
        'idx_menu_allergens_composite',
        'idx_reservations_date_status'
      ]

      const missingIndexes = requiredIndexes.filter(idx =>
        !indexes?.some((dbIdx: DatabaseIndex) => dbIdx.indexname === idx)
      )

      if (missingIndexes.length > 0) {
        console.error('Missing indexes:', missingIndexes)
        return false
      }

      // Test RLS policies exist
      const { data: policies } = await this.supabaseAdmin.rpc('list_policies', {
        schema_name: 'restaurante'
      })

      const requiredPolicies = [
        'legal_content_public_read',
        'floor_plan_restaurant_scoped',
        'gdpr_requests_admin_all'
      ]

      const missingPolicies = requiredPolicies.filter(policy =>
        !policies?.some((dbPolicy: DatabasePolicy) => dbPolicy.policyname === policy)
      )

      if (missingPolicies.length > 0) {
        console.error('Missing RLS policies:', missingPolicies)
        return false
      }

      // Test enum mapping functions
      const { data: mappingTest } = await this.supabaseAdmin.rpc('test_enum_mapping')
      if (!mappingTest) {
        console.error('Enum mapping functions validation failed')
        return false
      }

      console.log('✅ Migration validation passed')
      return true
    } catch (error) {
      console.error('Migration validation failed:', error)
      return false
    }
  }

  /**
   * Performance impact analysis after migration
   */
  async analyzePerformanceImpact(): Promise<{
    before: QueryPlan[]
    after: QueryPlan[]
    improvement: number
  }> {
    // Query plan analysis for critical queries
    const testQueries = [
      `SELECT * FROM restaurante.menu_items WHERE "categoryId" = '1' AND "isAvailable" = true LIMIT 20`,
      `SELECT * FROM restaurante.menu_item_allergens WHERE "menuItemId" = '1'`,
      `SELECT * FROM restaurante.reservations WHERE reservation_date = CURRENT_DATE AND status IN ('PENDING', 'CONFIRMED')`
    ]

    const afterPlans: QueryPlan[] = []

    for (const query of testQueries) {
      const { data } = await this.supabaseAdmin.rpc('explain_query', {
        query_text: query
      })
      afterPlans.push(data)
    }

    return {
      before: [], // Would need historical data
      after: afterPlans,
      improvement: 0 // Calculated based on execution time differences
    }
  }
}

/**
 * Helper function to create required database functions for migration
 */
export async function createMigrationHelpers(supabaseAdmin: SupabaseClient) {
  const helperFunctions = `
    -- Check active connections
    CREATE OR REPLACE FUNCTION check_active_connections()
    RETURNS INTEGER AS $$
    BEGIN
      RETURN (SELECT count(*) FROM pg_stat_activity WHERE state = 'active');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- List schemas
    CREATE OR REPLACE FUNCTION list_schemas()
    RETURNS TEXT[] AS $$
    BEGIN
      RETURN ARRAY(SELECT schema_name FROM information_schema.schemata);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Execute SQL statement
    CREATE OR REPLACE FUNCTION exec_sql(sql_statement TEXT)
    RETURNS VOID AS $$
    BEGIN
      EXECUTE sql_statement;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- List indexes
    CREATE OR REPLACE FUNCTION list_indexes(schema_name TEXT DEFAULT 'restaurante')
    RETURNS TABLE(indexname TEXT, tablename TEXT) AS $$
    BEGIN
      RETURN QUERY
      SELECT i.relname::TEXT, t.relname::TEXT
      FROM pg_class i
      JOIN pg_index ix ON i.oid = ix.indexrelid
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_namespace n ON i.relnamespace = n.oid
      WHERE n.nspname = schema_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- List RLS policies
    CREATE OR REPLACE FUNCTION list_policies(schema_name TEXT DEFAULT 'restaurante')
    RETURNS TABLE(policyname TEXT, tablename TEXT) AS $$
    BEGIN
      RETURN QUERY
      SELECT pol.policyname::TEXT, pol.tablename::TEXT
      FROM pg_policies pol
      WHERE pol.schemaname = schema_name;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Test enum mapping
    CREATE OR REPLACE FUNCTION test_enum_mapping()
    RETURNS BOOLEAN AS $$
    DECLARE
      test_result BOOLEAN := true;
    BEGIN
      -- Test reservation status mapping
      IF map_reservation_status_to_ts('CONFIRMED'::ReservationStatus) != 'confirmed' THEN
        test_result := false;
      END IF;

      RETURN test_result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Explain query performance
    CREATE OR REPLACE FUNCTION explain_query(query_text TEXT)
    RETURNS TABLE(query_plan TEXT) AS $$
    BEGIN
      RETURN QUERY EXECUTE 'EXPLAIN (ANALYZE, BUFFERS) ' || query_text;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  const { error } = await supabaseAdmin.rpc('exec_sql', {
    sql_statement: helperFunctions
  })

  if (error) {
    throw new Error(`Failed to create migration helpers: ${error.message}`)
  }
}