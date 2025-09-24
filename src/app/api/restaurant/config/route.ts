import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Configuration value schema
const ConfigUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional()
})

// Restaurant configuration cache (in-memory for performance)
const configCache: Map<string, { value: string, type: string, lastUpdated: number }> = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * GET /api/restaurant/config
 * Get restaurant configuration values
 * Supports query parameters:
 * - key: specific configuration key
 * - category: filter by category
 * - typed: return typed values (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const category = searchParams.get('category')
    const typed = searchParams.get('typed') !== 'false'

    const supabase = await createServiceClient()

    let query = supabase
      .schema('restaurante')
      .from('restaurant_config')
      .select('key, value, value_type, description, category')
      .order('category, key')

    // Apply filters
    if (key) {
      query = query.eq('key', key)
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data: configs, error } = await query

    if (error) {
      console.error('Database error fetching config:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Error fetching configuration',
          details: error.message
        },
        { status: 500 }
      )
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: key ? `Configuration key '${key}' not found` : 'No configuration found',
        },
        { status: 404 }
      )
    }

    // Update cache
    const now = Date.now()
    configs.forEach(config => {
      configCache.set(config.key, {
        value: config.value,
        type: config.value_type,
        lastUpdated: now
      })
    })

    // Transform to typed values if requested
    const transformedConfigs = typed ? configs.map(config => ({
      ...config,
      value: convertValue(config.value, config.value_type)
    })) : configs

    // If single key requested, return just the value
    if (key && transformedConfigs.length === 1) {
      const config = transformedConfigs[0]
      return NextResponse.json({
        success: true,
        key: config.key,
        value: config.value,
        type: config.value_type,
        description: config.description,
        category: config.category
      })
    }

    // Return all matching configs
    return NextResponse.json({
      success: true,
      data: transformedConfigs,
      count: transformedConfigs.length,
      cached: false
    })

  } catch (error) {
    console.error('GET config API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/restaurant/config
 * Update restaurant configuration values
 * Body: { key: string, value: string, description?: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, description } = ConfigUpdateSchema.parse(body)

    const supabase = await createServiceClient()

    // Update configuration
    const { data: updatedConfig, error } = await supabase
      .schema('restaurante')
      .from('restaurant_config')
      .update({
        value: value,
        description: description,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      console.error('Database error updating config:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Error updating configuration',
          details: error.message
        },
        { status: 500 }
      )
    }

    if (!updatedConfig) {
      return NextResponse.json(
        { success: false, error: `Configuration key '${key}' not found` },
        { status: 404 }
      )
    }

    // Update cache
    configCache.set(key, {
      value: updatedConfig.value,
      type: updatedConfig.value_type,
      lastUpdated: Date.now()
    })

    console.log(`✅ Configuration updated: ${key} = ${value}`)

    return NextResponse.json({
      success: true,
      data: {
        ...updatedConfig,
        value: convertValue(updatedConfig.value, updatedConfig.value_type)
      },
      message: `Configuration '${key}' updated successfully`
    })

  } catch (error) {
    console.error('PUT config API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get cached configuration value
 * Used by other APIs for fast access
 */
export async function getCachedConfigValue(key: string): Promise<any> {
  const now = Date.now()
  const cached = configCache.get(key)

  // Return cached value if still valid
  if (cached && (now - cached.lastUpdated) < CACHE_TTL) {
    return convertValue(cached.value, cached.type)
  }

  // Fetch from database if cache miss or expired
  try {
    const supabase = await createServiceClient()
    const { data: config } = await supabase
      .schema('restaurante')
      .from('restaurant_config')
      .select('value, value_type')
      .eq('key', key)
      .single()

    if (config) {
      configCache.set(key, {
        value: config.value,
        type: config.value_type,
        lastUpdated: now
      })
      return convertValue(config.value, config.value_type)
    }
  } catch (error) {
    console.error(`Error fetching config '${key}':`, error)
  }

  return null
}

/**
 * Helper function to convert string values to their proper types
 */
function convertValue(value: string, type: string): any {
  switch (type) {
    case 'number':
      const num = parseFloat(value)
      return isNaN(num) ? 0 : num
    case 'boolean':
      return value.toLowerCase() === 'true'
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}

/**
 * Helper function to get multiple config values at once
 */
export async function getConfigValues(keys: string[]): Promise<Record<string, any>> {
  const values: Record<string, any> = {}

  await Promise.all(
    keys.map(async (key) => {
      const value = await getCachedConfigValue(key)
      if (value !== null) {
        values[key] = value
      }
    })
  )

  return values
}