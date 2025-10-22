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
  location: 'TERRACE_1' | 'MAIN_ROOM' | 'VIP_ROOM' | 'TERRACE_2'
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
      {/* Responsive TabsList: ScrollArea en móvil, grid en tablet+ */}
      <div className="w-full overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <TabsList className="inline-flex sm:grid sm:w-full sm:grid-cols-3 lg:grid-cols-6 min-w-full sm:min-w-0">
          <TabsTrigger value="status" className="flex-1 sm:flex-initial whitespace-nowrap">
            <span className="hidden sm:inline">Estados</span>
            <span className="sm:hidden">Est.</span>
          </TabsTrigger>
          <TabsTrigger value="floor-plan" className="flex-1 sm:flex-initial whitespace-nowrap">
            <span className="hidden sm:inline">Planta</span>
            <span className="sm:hidden">Plano</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-initial whitespace-nowrap">
            <span className="hidden sm:inline">Análisis</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex-1 sm:flex-initial whitespace-nowrap">
            <span className="hidden lg:inline">Configuración</span>
            <span className="lg:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="qrcodes" className="flex-1 sm:flex-initial whitespace-nowrap">
            <span className="hidden sm:inline">QR Mesas</span>
            <span className="sm:hidden">QRs</span>
          </TabsTrigger>
          <TabsTrigger value="physical-qr" className="flex-1 sm:flex-initial whitespace-nowrap">
            <span className="hidden lg:inline">Cartas & Exterior</span>
            <span className="lg:hidden">Cartas</span>
          </TabsTrigger>
        </TabsList>
      </div>


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