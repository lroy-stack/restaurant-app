"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, TrendingDown, Users, Euro, Calendar, Clock, 
  Star, Crown, Utensils, Coffee, Wine, BarChart, PieChart,
  ArrowUp, ArrowDown, Minus, Download, RefreshCw
} from "lucide-react"

interface AnalyticsData {
  revenue: {
    total: number
    change: number
    trend: "up" | "down" | "neutral"
    byPeriod: Array<{ period: string; amount: number }>
  }
  reservations: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
    noShows: number
    conversionRate: number
  }
  customers: {
    total: number
    new: number
    returning: number
    vip: number
    averageSpend: number
  }
  capacity: {
    utilization: number
    peakHours: Array<{ hour: string; utilization: number }>
    popularTables: Array<{ location: string; bookings: number }>
  }
  menu: {
    topDishes: Array<{ name: string; orders: number; revenue: number }>
    categoryPerformance: Array<{ category: string; orders: number; revenue: number }>
  }
}

// Mock data - replace with real API data
const mockAnalytics: AnalyticsData = {
  revenue: {
    total: 18450,
    change: 12.5,
    trend: "up",
    byPeriod: [
      { period: "Lun", amount: 2800 },
      { period: "Mar", amount: 2400 },
      { period: "Mié", amount: 2900 },
      { period: "Jue", amount: 3200 },
      { period: "Vie", amount: 3800 },
      { period: "Sáb", amount: 4200 },
      { period: "Dom", amount: 3150 },
    ]
  },
  reservations: {
    total: 127,
    confirmed: 98,
    pending: 15,
    cancelled: 12,
    noShows: 2,
    conversionRate: 85.2
  },
  customers: {
    total: 89,
    new: 23,
    returning: 66,
    vip: 18,
    averageSpend: 65.8
  },
  capacity: {
    utilization: 78.5,
    peakHours: [
      { hour: "19:00", utilization: 95 },
      { hour: "20:00", utilization: 100 },
      { hour: "21:00", utilization: 92 },
      { hour: "22:00", utilization: 67 },
    ],
    popularTables: [
      { location: "Terraza", bookings: 45 },
      { location: "Interior", bookings: 52 },
      { location: "Barra", bookings: 30 },
    ]
  },
  menu: {
    topDishes: [
      { name: "Paella de Mariscos", orders: 24, revenue: 432 },
      { name: "Pulpo a la Gallega", orders: 19, revenue: 323 },
      { name: "Lubina en Sal", orders: 16, revenue: 448 },
      { name: "Gazpacho Andaluz", orders: 21, revenue: 231 },
    ],
    categoryPerformance: [
      { category: "Entrantes", orders: 67, revenue: 938 },
      { category: "Principales", orders: 89, revenue: 2134 },
      { category: "Postres", orders: 34, revenue: 374 },
      { category: "Vinos", orders: 56, revenue: 1456 },
    ]
  }
}

interface AnalyticsDashboardProps {
  data?: AnalyticsData
  period?: "today" | "week" | "month" | "quarter"
  onPeriodChange?: (period: string) => void
  onExport?: () => void
  className?: string
}

export function AnalyticsDashboard({ 
  data = mockAnalytics, 
  period = "week",
  onPeriodChange,
  onExport,
  className 
}: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className={className}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Panel de Analytics</h2>
          <p className="text-muted-foreground">
            Métricas de rendimiento del restaurante
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          
          {onExport && (
            <Button size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</p>
                <div className="flex items-center mt-1">
                  {data.revenue.trend === "up" ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : data.revenue.trend === "down" ? (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-600" />
                  )}
                  <span className={`text-sm ml-1 ${
                    data.revenue.trend === "up" ? "text-green-600" : 
                    data.revenue.trend === "down" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {formatPercentage(Math.abs(data.revenue.change))}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reservas</p>
                <p className="text-2xl font-bold">{data.reservations.total}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPercentage(data.reservations.conversionRate)} conversión
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{data.customers.total}</p>
                <div className="flex items-center mt-1">
                  <Crown className="h-3 w-3 text-yellow-600 mr-1" />
                  <span className="text-sm text-muted-foreground">
                    {data.customers.vip} VIP
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ocupación</p>
                <p className="text-2xl font-bold">{formatPercentage(data.capacity.utilization)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Capacidad promedio
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Ingresos por Día</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenue.byPeriod.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.period}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(item.amount / Math.max(...data.revenue.byPeriod.map(p => p.amount))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reservations Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Estado de Reservas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {data.reservations.confirmed}
                  </div>
                  <div className="text-xs text-green-700">Confirmadas</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.reservations.pending}
                  </div>
                  <div className="text-xs text-yellow-700">Pendientes</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {data.reservations.cancelled}
                  </div>
                  <div className="text-xs text-red-700">Canceladas</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {data.reservations.noShows}
                  </div>
                  <div className="text-xs text-gray-700">No Shows</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Dishes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Platos Más Populares</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.menu.topDishes.map((dish, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{dish.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {dish.orders} pedidos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(dish.revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">ingresos</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Horas Pico</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.capacity.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{hour.hour}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          hour.utilization === 100 ? "bg-red-500" :
                          hour.utilization >= 90 ? "bg-orange-500" :
                          hour.utilization >= 70 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${hour.utilization}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">
                      {formatPercentage(hour.utilization)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Mesas Más Solicitadas</h4>
              <div className="space-y-2">
                {data.capacity.popularTables.map((table, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{table.location}</span>
                    <Badge variant="secondary">
                      {table.bookings} reservas
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}