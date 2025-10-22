import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseApiUrl, getSupabaseHeaders } from '@/lib/supabase/config'

// Zone metadata for UI (minimal, static data only)
const ZONE_METADATA = {
  TERRACE_1: { 
    name: { es: 'Terraza Principal', en: 'Main Terrace', de: 'Hauptterrasse' },
    type: 'terrace',
    description: { es: 'Terraza principal', en: 'Main terrace', de: 'Hauptterrasse' }
  },
  VIP_ROOM: { 
    name: { es: 'Sala VIP', en: 'VIP Room', de: 'VIP-Bereich' },
    type: 'indoor',
    description: { es: 'Sala privada', en: 'Private room', de: 'Privater Bereich' }
  },
  MAIN_ROOM: { 
    name: { es: 'Sala Interior', en: 'Main Hall', de: 'Hauptsaal' },
    type: 'indoor', 
    description: { es: 'Sala interior principal', en: 'Main interior hall', de: 'Hauptinnensaal' }
  },
  TERRACE_2: { 
    name: { es: 'Terraza 2', en: 'Justicia Terrace', de: 'Justicia Terrasse' },
    type: 'terrace',
    description: { es: 'Terraza de verano', en: 'Summer terrace', de: 'Sommerterrasse' }
  }
} as const

// GET: Active zones only - 100% dynamic from database
export async function GET(request: NextRequest) {
  try {
    // Detect if this is an admin request
    const searchParams = new URL(request.url).searchParams
    const includePrivate = searchParams.get('includePrivate') === 'true'

    // Query active tables - filter by is_public for web, show all for admin
    let queryStr = `tables?select=location&isActive=eq.true`
    if (!includePrivate) {
      queryStr += `&is_public=eq.true` // Web form: only public zones
    }

    const response = await fetch(
      getSupabaseApiUrl(queryStr),
      {
        headers: getSupabaseHeaders(true)
      }
    )

    if (!response.ok) {
      console.error('❌ Database query failed:', response.status, response.statusText)
      throw new Error(`Database error: ${response.status}`)
    }

    const tables = await response.json()
    console.log(`🔍 Database query result: ${tables.length} active tables`)
    
    // Extract unique active zones - DISTINCT location WHERE isActive=true
    const activeZoneIds = [...new Set(tables.map((table: any) => table.location))]
    console.log(`✅ Active zones from DB:`, activeZoneIds)
    
    // Combine with UI metadata
    const activeZones = activeZoneIds.map(zoneId => ({
      id: zoneId,
      isActive: true, // Already filtered by database query
      ...ZONE_METADATA[zoneId as keyof typeof ZONE_METADATA]
    }))

    return NextResponse.json({
      success: true,
      data: {
        zones: activeZones,
        totalActiveZones: activeZones.length,
        queryTimestamp: new Date().toISOString()
      },
      message: `${activeZones.length} zona${activeZones.length !== 1 ? 's' : ''} activa${activeZones.length !== 1 ? 's' : ''} disponible${activeZones.length !== 1 ? 's' : ''}`
    })

  } catch (error) {
    console.error('❌ Active zones API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch active zones',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}