import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')
    const days = parseInt(searchParams.get('days') || '7')

    // Consulta real a la tabla qr_scans para métricas
    let analyticsQuery = `${SUPABASE_URL}/rest/v1/qr_scans?select=*`
    
    if (tableId) {
      analyticsQuery += `&table_id=eq.${tableId}`
    }

    // Filtrar por días si se especifica
    if (days > 0) {
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - days)
      analyticsQuery += `&scanned_at=gte.${dateLimit.toISOString()}`
    }

    const analyticsResponse = await fetch(analyticsQuery, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (!analyticsResponse.ok) {
      throw new Error(`Failed to fetch QR analytics: ${analyticsResponse.status}`)
    }

    const scans = await analyticsResponse.json()

    // Consulta a tablas para obtener datos de totalscans y lastscannedat
    let tablesQuery = `${SUPABASE_URL}/rest/v1/tables?select=id,number,qrCode,totalscans,lastscannedat,location`
    
    if (tableId) {
      tablesQuery += `&id=eq.${tableId}`
    }

    const tablesResponse = await fetch(tablesQuery, {
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    })

    if (!tablesResponse.ok) {
      throw new Error(`Failed to fetch tables data: ${tablesResponse.status}`)
    }

    const tables = await tablesResponse.json()

    // Procesar métricas reales
    const analytics = {
      totalScans: scans.length,
      uniqueTables: new Set(scans.map((s: any) => s.table_id)).size,
      avgScansPerTable: scans.length / Math.max(tables.length, 1),
      conversionRate: scans.filter((s: any) => s.converted_to_reservation).length / Math.max(scans.length, 1) * 100,
      
      // Métricas por mesa
      tableMetrics: tables.map((table: any) => {
        const tableScans = scans.filter((s: any) => s.table_id === table.id)
        const lastScan = tableScans.length > 0 
          ? Math.max(...tableScans.map((s: any) => new Date(s.scanned_at).getTime()))
          : null
        
        return {
          tableId: table.id,
          tableNumber: table.number,
          location: table.location,
          totalScans: table.totalscans || tableScans.length,
          lastScannedAt: table.lastscannedat || (lastScan ? new Date(lastScan).toISOString() : null),
          conversions: tableScans.filter((s: any) => s.converted_to_reservation).length,
          conversionRate: tableScans.length > 0 
            ? (tableScans.filter((s: any) => s.converted_to_reservation).length / tableScans.length) * 100 
            : 0
        }
      }),

      // Análisis temporal
      dailyScans: getDailyScans(scans, days),
      hourlyDistribution: getHourlyDistribution(scans),
      
      // Top performing tables
      topTables: tables
        .map((table: any) => ({
          tableId: table.id,
          tableNumber: table.number,
          totalScans: table.totalScans || scans.filter((s: any) => s.table_id === table.id).length,
          location: table.location
        }))
        .sort((a: any, b: any) => b.totalScans - a.totalScans)
        .slice(0, 5),

      // UTM Analysis
      utmAnalysis: getUTMAnalysis(scans),
      
      // Resumen de última actividad
      recentActivity: scans
        .sort((a: any, b: any) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())
        .slice(0, 10)
    }

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching QR analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR analytics' },
      { status: 500 }
    )
  }
}

function getDailyScans(scans: any[], days: number) {
  const dailyData: { [key: string]: number } = {}
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailyData[dateStr] = 0
  }
  
  scans.forEach(scan => {
    const scanDate = new Date(scan.scanned_at).toISOString().split('T')[0]
    if (dailyData.hasOwnProperty(scanDate)) {
      dailyData[scanDate]++
    }
  })
  
  return Object.entries(dailyData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function getHourlyDistribution(scans: any[]) {
  const hourly = Array(24).fill(0)
  
  scans.forEach(scan => {
    const hour = new Date(scan.scanned_at).getHours()
    hourly[hour]++
  })
  
  return hourly.map((count, hour) => ({ hour, count }))
}

function getUTMAnalysis(scans: any[]) {
  const sources: { [key: string]: number } = {}
  const mediums: { [key: string]: number } = {}
  const campaigns: { [key: string]: number } = {}
  
  scans.forEach(scan => {
    if (scan.utm_source) sources[scan.utm_source] = (sources[scan.utm_source] || 0) + 1
    if (scan.utm_medium) mediums[scan.utm_medium] = (mediums[scan.utm_medium] || 0) + 1
    if (scan.utm_campaign) campaigns[scan.utm_campaign] = (campaigns[scan.utm_campaign] || 0) + 1
  })
  
  return {
    sources: Object.entries(sources).map(([name, count]) => ({ name, count })),
    mediums: Object.entries(mediums).map(([name, count]) => ({ name, count })),
    campaigns: Object.entries(campaigns).map(([name, count]) => ({ name, count }))
  }
}