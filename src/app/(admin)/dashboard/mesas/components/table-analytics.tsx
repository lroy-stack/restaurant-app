'use client'

import { useMemo, useEffect } from 'react'
import { useTableStore } from '@/stores/useTableStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock,
  Target,
  BarChart3
} from 'lucide-react'

// REAL Enigma zones with chart colors
const ENIGMA_ZONES = {
  'TERRACE_1': 'Terraza 1',
  'MAIN_ROOM': 'Sala Principal', 
  'VIP_ROOM': 'Sala VIP',
  'TERRACE_2': 'Terraza 2'
} as const

// Chart color palette for Enigma brand - Manual de Marca colors
const ENIGMA_COLORS = {
  primary: '#237584',      // Azul Atlántico
  secondary: '#9FB289',    // Verde Sage
  accent: '#CB5910',       // Naranja Burnt
  success: '#9FB289',      // Verde Sage
  warning: '#CB5910',      // Naranja Burnt
  danger: '#E53E3E',       // Muted red for charts
  muted: '#6B7280'         // Neutral gray
}

const ZONE_COLORS = [
  ENIGMA_COLORS.primary,
  ENIGMA_COLORS.secondary, 
  ENIGMA_COLORS.accent,
  ENIGMA_COLORS.success
]

interface TableData {
  id: string
  number: string
  capacity: number
  location: keyof typeof ENIGMA_ZONES
  qrCode: string
  isActive: boolean
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance'
  currentReservation?: any
}

interface TableAnalyticsProps {
  tables: TableData[]
}

// Helper function to calculate zone occupancy percentage (ONLY ACTIVE TABLES)
function calculateZoneOccupancy(zoneTables: TableData[]): number {
  // Filter only active tables for occupancy calculation
  const activeTables = zoneTables.filter(t => t.isActive)
  if (activeTables.length === 0) return 0
  const occupiedTables = activeTables.filter(t => t.currentStatus === 'occupied').length
  return Math.round((occupiedTables / activeTables.length) * 100)
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes('Percentage') ? '%' : ''}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function TableAnalytics({ tables: propTables }: TableAnalyticsProps) {
  // Use Zustand store instead of props
  const { tables: storeTables, loadTables } = useTableStore()
  const tables = storeTables.length > 0 ? storeTables : propTables

  // Load tables from store on mount
  useEffect(() => {
    loadTables()
  }, [])

  // Zone-based analytics data (ONLY ACTIVE TABLES)
  const zoneData = useMemo(() => {
    return Object.entries(ENIGMA_ZONES).map(([zoneKey, zoneName], index) => {
      const zoneTables = tables.filter(t => t.location === zoneKey && t.isActive) // Only active tables
      const occupiedTables = zoneTables.filter(t => t.currentStatus === 'occupied')
      const reservedTables = zoneTables.filter(t => t.currentStatus === 'reserved')
      const availableTables = zoneTables.filter(t => t.currentStatus === 'available')
      
      return {
        zone: zoneName,
        totalTables: zoneTables.length,
        capacity: zoneTables.reduce((sum, t) => sum + t.capacity, 0),
        occupied: occupiedTables.length,
        reserved: reservedTables.length,
        available: availableTables.length,
        occupancyPercentage: calculateZoneOccupancy(zoneTables),
        fill: ZONE_COLORS[index % ZONE_COLORS.length]
      }
    }).filter(zone => zone.totalTables > 0)
  }, [tables])

  // Status distribution data for pie chart (ONLY ACTIVE TABLES)
  const statusData = useMemo(() => {
    const activeTables = tables.filter(t => t.isActive) // Only active tables for operational analytics
    const statuses = ['available', 'reserved', 'occupied', 'maintenance'] as const
    const statusLabels = {
      available: 'Disponibles',
      reserved: 'Reservadas',
      occupied: 'Ocupadas',
      maintenance: 'Mantenimiento'
    }
    const statusColors = [
      ENIGMA_COLORS.success,
      ENIGMA_COLORS.warning,
      ENIGMA_COLORS.danger,
      ENIGMA_COLORS.muted
    ]

    return statuses.map((status, index) => {
      const count = activeTables.filter(t => t.currentStatus === status).length
      return {
        name: statusLabels[status],
        value: count,
        fill: statusColors[index],
        percentage: activeTables.length > 0 ? Math.round((count / activeTables.length) * 100) : 0
      }
    }).filter(item => item.value > 0)
  }, [tables])

  // Capacity utilization data (ONLY ACTIVE TABLES)
  const capacityData = useMemo(() => {
    return Object.entries(ENIGMA_ZONES).map(([ zoneKey, zoneName]) => {
      const zoneTables = tables.filter(t => t.location === zoneKey && t.isActive) // Only active tables
      const totalCapacity = zoneTables.reduce((sum, t) => sum + t.capacity, 0)
      const occupiedCapacity = zoneTables
        .filter(t => t.currentStatus === 'occupied')
        .reduce((sum, t) => sum + t.capacity, 0)
      const reservedCapacity = zoneTables
        .filter(t => t.currentStatus === 'reserved')
        .reduce((sum, t) => sum + t.capacity, 0)
      
      return {
        zone: zoneName,
        totalCapacity,
        occupiedCapacity,
        reservedCapacity,
        availableCapacity: totalCapacity - occupiedCapacity - reservedCapacity,
        utilizationPercentage: totalCapacity > 0 
          ? Math.round(((occupiedCapacity + reservedCapacity) / totalCapacity) * 100) 
          : 0
      }
    }).filter(zone => zone.totalCapacity > 0)
  }, [tables])

  // ENHANCED summary statistics with professional restaurant metrics (ONLY ACTIVE TABLES)
  const summaryStats = useMemo(() => {
    const activeTables = tables.filter(t => t.isActive) // Only active tables for operational KPIs
    const inactiveTables = tables.filter(t => !t.isActive) // Track closed tables separately

    const totalTables = activeTables.length
    const totalCapacity = activeTables.reduce((sum, t) => sum + t.capacity, 0)
    const occupiedTables = activeTables.filter(t => t.currentStatus === 'occupied')
    const reservedTables = activeTables.filter(t => t.currentStatus === 'reserved')
    const availableTables = activeTables.filter(t => t.currentStatus === 'available')
    const maintenanceTables = activeTables.filter(t => t.currentStatus === 'maintenance')
    
    // Professional restaurant KPIs
    const occupiedCapacity = occupiedTables.reduce((sum, t) => sum + t.capacity, 0)
    const reservedCapacity = reservedTables.reduce((sum, t) => sum + t.capacity, 0)
    const utilizationRate = totalCapacity > 0 ? Math.round(((occupiedCapacity + reservedCapacity) / totalCapacity) * 100) : 0
    
    // Table turnover estimation (industry standard: 1.5-2 hours per turn)
    const estimatedTurns = Math.floor(12 / 1.75) // 12 service hours / 1.75h avg dining time
    const maxDailyCapacity = totalCapacity * estimatedTurns
    const currentUtilization = occupiedCapacity + reservedCapacity
    
    // Revenue potential (based on current utilization)
    const avgTicketPerPerson = 35 // Enigma average ticket
    const estimatedCurrentRevenue = currentUtilization * avgTicketPerPerson
    const maxDailyRevenue = maxDailyCapacity * avgTicketPerPerson
    
    return {
      // Basic counts (ONLY ACTIVE)
      totalTables,
      totalCapacity,
      occupiedTables: occupiedTables.length,
      reservedTables: reservedTables.length,
      availableTables: availableTables.length,
      maintenanceTables: maintenanceTables.length,

      // Inactive tables tracking
      inactiveTables: inactiveTables.length,
      totalTablesIncludingClosed: tables.length,

      // Capacity metrics (ONLY ACTIVE)
      occupiedCapacity,
      reservedCapacity,
      availableCapacity: totalCapacity - occupiedCapacity - reservedCapacity,

      // Professional KPIs (ONLY ACTIVE)
      overallOccupancy: totalTables > 0 ? Math.round((occupiedTables.length / totalTables) * 100) : 0,
      utilizationRate,
      averageTableSize: totalTables > 0 ? Math.round(totalCapacity / totalTables * 10) / 10 : 0,

      // Industry metrics (ONLY ACTIVE)
      estimatedTurns,
      maxDailyCapacity,
      currentUtilization,
      utilizationPercentage: maxDailyCapacity > 0 ? Math.round((currentUtilization / maxDailyCapacity) * 100) : 0,

      // Revenue analytics (ONLY ACTIVE)
      avgTicketPerPerson,
      estimatedCurrentRevenue,
      maxDailyRevenue,
      revenueEfficiency: maxDailyRevenue > 0 ? Math.round((estimatedCurrentRevenue / maxDailyRevenue) * 100) : 0
    }
  }, [tables])

  return (
    <div className="space-y-6">
      {/* ENHANCED Summary Cards - Professional Restaurant KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{summaryStats.utilizationRate}%</p>
                <p className="text-sm text-muted-foreground">Tasa Utilización</p>
                <p className="text-xs text-muted-foreground">{summaryStats.currentUtilization}/{summaryStats.totalCapacity} personas</p>
              </div>
              <Target className="w-8 h-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[#9FB289]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#9FB289]">€{summaryStats.estimatedCurrentRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Ingresos Actuales</p>
                <p className="text-xs text-muted-foreground">{summaryStats.revenueEfficiency}% del potencial</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#9FB289] opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#237584]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#237584]">{summaryStats.estimatedTurns}x</p>
                <p className="text-sm text-muted-foreground">Rotación Diaria</p>
                <p className="text-xs text-muted-foreground">{summaryStats.maxDailyCapacity} pers/día máx</p>
              </div>
              <Clock className="w-8 h-8 text-[#237584] opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#CB5910]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#CB5910]">{summaryStats.overallOccupancy}%</p>
                <p className="text-sm text-muted-foreground">Ocupación Mesas</p>
                <p className="text-xs text-muted-foreground">{summaryStats.occupiedTables}/{summaryStats.totalTables} mesas</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#CB5910] opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PROFESSIONAL Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Eficiencia Revenue</span>
                <span className="text-sm font-bold">{summaryStats.revenueEfficiency}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-[#9FB289] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(summaryStats.revenueEfficiency, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">€{summaryStats.estimatedCurrentRevenue} de €{summaryStats.maxDailyRevenue} diarios</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Capacidad Actual</span>
                <span className="text-sm font-bold">{summaryStats.utilizationRate}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-[#237584] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(summaryStats.utilizationRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{summaryStats.currentUtilization} personas sentadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ticket Promedio</span>
                <span className="text-sm font-bold">€{summaryStats.avgTicketPerPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>por persona</span>
              </div>
              <p className="text-xs text-muted-foreground">Basado en histórico Enigma</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="occupancy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="occupancy">Ocupación</TabsTrigger>
          <TabsTrigger value="zones">Por Zona</TabsTrigger>
          <TabsTrigger value="capacity">Capacidad</TabsTrigger>
          <TabsTrigger value="trends">Estado Actual</TabsTrigger>
        </TabsList>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ocupación por Zona</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={zoneData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="zone" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="occupancyPercentage" 
                      fill={ENIGMA_COLORS.primary} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado por Zona</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={zoneData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="zone" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="occupied" stackId="a" fill={ENIGMA_COLORS.danger} name="Ocupadas" />
                  <Bar dataKey="reserved" stackId="a" fill={ENIGMA_COLORS.warning} name="Reservadas" />
                  <Bar dataKey="available" stackId="a" fill={ENIGMA_COLORS.success} name="Disponibles" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capacity Tab */}
        <TabsContent value="capacity">
          <Card>
            <CardHeader>
              <CardTitle>Utilización de Capacidad por Zona</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={capacityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="zone"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="occupiedCapacity" stackId="a" fill={ENIGMA_COLORS.danger} name="Personas Ocupadas" />
                  <Bar dataKey="reservedCapacity" stackId="a" fill={ENIGMA_COLORS.warning} name="Personas Reservadas" />
                  <Bar dataKey="availableCapacity" stackId="a" fill={ENIGMA_COLORS.success} name="Personas Disponibles" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Status Tab */}
        <TabsContent value="trends">
          <div className="space-y-6">
            {/* Zone Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {zoneData.map((zone, index) => (
                <Card key={zone.zone}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{zone.zone}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {zone.totalTables} mesas • {zone.capacity} personas
                        </p>
                      </div>
                      <Badge 
                        variant={zone.occupancyPercentage > 75 ? "destructive" : 
                               zone.occupancyPercentage > 50 ? "secondary" : "default"}
                      >
                        {zone.occupancyPercentage}% ocupada
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#9FB289]">Disponibles</span>
                        <span className="font-medium">{zone.available} mesas</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#CB5910]">Reservadas</span>
                        <span className="font-medium">{zone.reserved} mesas</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-destructive">Ocupadas</span>
                        <span className="font-medium">{zone.occupied} mesas</span>
                      </div>
                      
                      {/* Occupancy bar */}
                      <div className="mt-4">
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${zone.occupancyPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Real-time Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Estado en Tiempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-[#9FB289]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#9FB289]">{summaryStats.availableTables}</div>
                    <div className="text-sm text-[#9FB289]">Disponibles Ahora</div>
                  </div>
                  <div className="p-4 bg-[#CB5910]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#CB5910]">{summaryStats.reservedTables}</div>
                    <div className="text-sm text-[#CB5910]">Próximas Reservas</div>
                  </div>
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{summaryStats.occupiedTables}</div>
                    <div className="text-sm text-destructive">Ocupadas Ahora</div>
                  </div>
                  <div className="p-4 bg-[#237584]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#237584]">{summaryStats.occupiedCapacity + summaryStats.reservedCapacity}</div>
                    <div className="text-sm text-[#237584]">Personas Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}