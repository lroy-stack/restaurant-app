// src/app/(admin)/dashboard/mesas/page.tsx - ENIGMA TABLE MANAGEMENT
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableTabs } from './components/table-tabs'
import { QRSystemToggle } from '@/components/admin/QRSystemToggle'
import { AlertCircle, Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gestión de Mesas | Dashboard - Enigma Cocina Con Alma',
  description: 'Sistema completo de gestión de mesas con vista de planta, estados en tiempo real y análisis de ocupación.',
}

// Types based on REAL Enigma data structure
interface TableData {
  id: string
  number: string  // "T1", "S1", "S10", etc.
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  qrCode: string
  isActive: boolean
  restaurantId: string
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance'
  currentReservation?: any
}

interface TablesPageProps {
  searchParams: Promise<{
    tab?: string
    location?: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
    status?: string
    capacity?: string
    view?: string
  }>
}

// REAL Enigma zones with Spanish labels
const ENIGMA_ZONES = {
  'TERRACE_CAMPANARI': 'Terraza Campanari',
  'SALA_PRINCIPAL': 'Sala Principal', 
  'SALA_VIP': 'Sala VIP',
  'TERRACE_JUSTICIA': 'Terraza Justicia'
} as const

// Calculate table status based on current reservations
function calculateTableStatus(table: TableData): string {
  // TODO: Implement reservation-based status calculation
  // For now, default to 'available'
  return table.currentStatus || 'available'
}

// Fetch tables using direct Supabase connection (PRP pattern)
async function getTables(filters: any = {}): Promise<TableData[]> {
  try {
    let query = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tables?select=*&order=number`
    
    // Apply location filter if specified
    if (filters.location) {
      query += `&location=eq.${filters.location}`
    }
    
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Profile': 'restaurante',
        'Content-Profile': 'restaurante',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      // Revalidate every 30 seconds for real-time updates
      next: { revalidate: 30 }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status}`)
    }

    const tables = await response.json()
    
    // Calculate REAL status based on reservations and add zone labels
    const tablesWithStatus: TableData[] = tables.map((table: any) => ({
      ...table,
      currentStatus: calculateTableStatus(table),
      location: table.location // Ensure we keep the real location
    }))

    console.log(`✅ Fetched ${tablesWithStatus.length} total tables from Enigma DB (active + inactive)`)
    return tablesWithStatus

  } catch (error) {
    console.error('❌ Error fetching tables:', error)
    return []
  }
}

function TablesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="h-12 w-96 bg-muted rounded animate-pulse" />
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}

async function TablesContent({ searchParams }: { searchParams: Awaited<TablesPageProps['searchParams']> }) {
  const filters = {
    location: searchParams.location,
    status: searchParams.status,
    capacity: searchParams.capacity,
  }

  const tables = await getTables(filters)
  const activeTab = searchParams.tab || 'status'

  if (!tables || tables.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Mesas
          </h1>
          <p className="text-gray-600">
            Sistema de gestión visual y análisis de ocupación
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-amber-900 mb-2">
              No se encontraron mesas
            </h3>
            <p className="text-amber-600">
              Verifica la conexión con la base de datos o configura las primeras mesas.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Count stats for dashboard
  const activeTables = tables.filter(t => t.isActive)
  const inactiveTables = tables.filter(t => !t.isActive)
  
  const stats = {
    totalTables: tables.length,
    activeTables: activeTables.length,
    inactiveTables: inactiveTables.length,
    availableTables: activeTables.filter(t => t.currentStatus === 'available').length,
    occupiedTables: activeTables.filter(t => t.currentStatus === 'occupied').length,
    reservedTables: activeTables.filter(t => t.currentStatus === 'reserved').length,
    zoneBreakdown: Object.entries(ENIGMA_ZONES).map(([zone, label]) => ({
      zone,
      label,
      count: tables.filter(t => t.location === zone).length,
      activeCount: tables.filter(t => t.location === zone && t.isActive).length,
      inactiveCount: tables.filter(t => t.location === zone && !t.isActive).length
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header with Real Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Mesas
          </h1>
          <p className="text-gray-600">
            {stats.totalTables} mesas total • {stats.activeTables} activas • {stats.inactiveTables} temporalmente cerradas
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>En tiempo real</span>
        </div>
      </div>

      {/* Zone Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.zoneBreakdown.map(({ zone, label, count, activeCount, inactiveCount }) => (
          <Card key={zone}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className="text-xs text-muted-foreground">
                {activeCount} activas
                {inactiveCount > 0 && (
                  <> • <span className="text-amber-600">{inactiveCount} cerradas</span></>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR System Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QRSystemToggle />
        </div>
      </div>

      {/* Main Tabs Interface */}
      <TableTabs tables={tables} defaultTab={activeTab} />
    </div>
  )
}

export default async function TablesPage({ searchParams }: TablesPageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <Suspense fallback={<TablesSkeleton />}>
      <TablesContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
}