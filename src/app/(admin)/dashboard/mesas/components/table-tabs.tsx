'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableStatusPanel } from './table-status-panel'
import { TableAnalytics } from './table-analytics'
import { TableConfiguration } from './table-configuration'
import { EnhancedQRManager } from './enhanced-qr-manager'
import { PhysicalMenuQRManager } from './physical-menu-qr-manager'
import dynamic from 'next/dynamic'

// Dynamic import for floor plan to handle SSR compatibility with Konva
const FloorPlanView = dynamic(
  () => import('./floor-plan-v2/FloorPlanView'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando planta visual...</p>
        </div>
      </div>
    )
  }
)

interface TableData {
  id: string
  number: string
  capacity: number
  location: 'TERRACE_CAMPANARI' | 'SALA_PRINCIPAL' | 'SALA_VIP' | 'TERRACE_JUSTICIA'
  qrCode: string
  isActive: boolean
  restaurantId: string
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance' | 'temporally_closed'
  // 🔥 ACTUALIZADO: Tipo específico para currentReservation
  currentReservation?: {
    customerName: string
    partySize: number
    time: string
    status: string
  } | null
}

interface TableTabsProps {
  tables?: TableData[] // Optional for backward compatibility
  defaultTab?: string
}

export function TableTabs({ tables = [], defaultTab = 'status' }: TableTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || defaultTab

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`?${params.toString()}`)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="status">Estados</TabsTrigger>
        <TabsTrigger value="floor-plan">Planta</TabsTrigger>
        <TabsTrigger value="analytics">Análisis</TabsTrigger>
        <TabsTrigger value="config">Configuración</TabsTrigger>
        <TabsTrigger value="qrcodes">QR Mesas</TabsTrigger>
        <TabsTrigger value="physical-qr">Cartas & Exterior</TabsTrigger>
      </TabsList>


      <TabsContent value="status" className="space-y-4">
        <TableStatusPanel tables={tables} />
      </TabsContent>

      <TabsContent value="floor-plan" className="space-y-4">
        <FloorPlanView tables={tables} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <TableAnalytics tables={tables} />
      </TabsContent>

      <TabsContent value="config" className="space-y-4">
        <TableConfiguration tables={tables} />
      </TabsContent>

      <TabsContent value="qrcodes" className="space-y-4">
        <EnhancedQRManager tables={tables} />
      </TabsContent>

      <TabsContent value="physical-qr" className="space-y-4">
        <PhysicalMenuQRManager />
      </TabsContent>
    </Tabs>
  )
}