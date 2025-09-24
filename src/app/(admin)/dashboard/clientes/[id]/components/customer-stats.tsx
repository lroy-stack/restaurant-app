'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Timer,
  Star
} from 'lucide-react'
import type { Customer, CustomerMetrics } from '@/lib/validations/customer'

interface ReservationStats {
  totalReservations: number
  completedReservations: number
  cancelledReservations: number
  noShows: number
  recentReservations: number
  upcomingReservations: number
  averagePartySize: number
  favoriteTimeSlots: [string, number][]
  completionRate: number
  cancellationRate: number
}

interface CustomerStatsProps {
  customer: Customer
  metrics: CustomerMetrics
  reservationStats: ReservationStats
}

export function CustomerStats({
  customer,
  metrics,
  reservationStats
}: CustomerStatsProps) {
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`
  }

  const formatFrequency = (frequency: number) => {
    if (frequency >= 1) return `${frequency.toFixed(1)}/mes`
    return `${(frequency * 12).toFixed(1)}/año`
  }

  const getFrequencyColor = (frequency: number) => {
    if (frequency >= 2) return 'text-green-600 bg-green-50 border-green-200'
    if (frequency >= 1) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (frequency >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 80) return 'text-blue-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Experiencia del Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Experiencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Visitas</span>
              <span className="text-sm font-semibold text-blue-600">
                {customer.totalVisits}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tamaño Promedio Mesa</span>
              <span className="text-sm font-semibold flex items-center gap-1">
                <Users className="h-3 w-3" />
                {customer.averagePartySize}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Score Lealtad</span>
              <span className="text-sm font-semibold text-purple-600">
                {metrics.loyaltyScore}/100
              </span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">
                Cliente {metrics.customerTier}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Patrones de Visita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Visitas</span>
              <span className="text-sm font-semibold">
                {customer.totalVisits}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Frecuencia</span>
              <Badge variant="outline" className={getFrequencyColor(metrics.visitFrequency)}>
                {formatFrequency(metrics.visitFrequency)}
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tamaño Promedio</span>
              <span className="text-sm font-semibold flex items-center gap-1">
                <Users className="h-3 w-3" />
                {customer.averagePartySize}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Estacionalidad</span>
              <span className="text-xs capitalize text-muted-foreground">
                {metrics.seasonalityPattern}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reliability Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Fiabilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Tasa de Cumplimiento</span>
              <span className={`text-sm font-semibold ${getCompletionColor(metrics.completionRate)}`}>
                {metrics.completionRate}%
              </span>
            </div>
            <Progress
              value={metrics.completionRate}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">No-Shows</span>
              <span className="text-sm font-semibold text-red-600">
                {metrics.noShowRate}%
              </span>
            </div>
            <Progress
              value={metrics.noShowRate}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Nivel de Riesgo</span>
              <Badge variant="outline" className={getRiskColor(metrics.riskLevel)}>
                {metrics.riskLevel}
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mb-1" />
                <span className="text-xs text-muted-foreground">Completadas</span>
                <span className="text-xs font-semibold">{reservationStats.completedReservations}</span>
              </div>
              <div className="flex flex-col items-center">
                <XCircle className="h-4 w-4 text-red-600 mb-1" />
                <span className="text-xs text-muted-foreground">Canceladas</span>
                <span className="text-xs font-semibold">{reservationStats.cancelledReservations}</span>
              </div>
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mb-1" />
                <span className="text-xs text-muted-foreground">No-Shows</span>
                <span className="text-xs font-semibold">{reservationStats.noShows}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences & Intelligence */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            Inteligencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Score de Lealtad</span>
              <span className="text-sm font-semibold text-blue-600">
                {metrics.loyaltyScore}/100
              </span>
            </div>
            <Progress
              value={metrics.loyaltyScore}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tier Cliente</span>
              <Badge variant="secondary" className="text-xs">
                {metrics.customerTier}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block mb-2">Horarios Favoritos</span>
            <div className="flex flex-wrap gap-1">
              {metrics.preferredTimeSlots.slice(0, 3).map((slot, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {slot}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="flex flex-col items-center">
                <Timer className="h-4 w-4 text-blue-600 mb-1" />
                <span className="text-xs text-muted-foreground">Próximas</span>
                <span className="text-xs font-semibold">{reservationStats.upcomingReservations}</span>
              </div>
              <div className="flex flex-col items-center">
                <Calendar className="h-4 w-4 text-green-600 mb-1" />
                <span className="text-xs text-muted-foreground">Recientes</span>
                <span className="text-xs font-semibold">{reservationStats.recentReservations}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}