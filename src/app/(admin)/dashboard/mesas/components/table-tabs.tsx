'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableStatusPanel } from './table-status-panel'
import { TableAnalytics } from './table-analytics'
import { TableConfiguration } from './table-configuration'
import { EnhancedQRManager } from './enhanced-qr-manager'

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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="status">Estados</TabsTrigger>
        <TabsTrigger value="analytics">Análisis</TabsTrigger>
        <TabsTrigger value="config">Configuración</TabsTrigger>
        <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
      </TabsList>


      <TabsContent value="status" className="space-y-4">
        <TableStatusPanel tables={tables} />
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
    </Tabs>
  )
}