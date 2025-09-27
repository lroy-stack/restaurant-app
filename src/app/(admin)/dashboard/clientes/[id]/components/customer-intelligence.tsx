'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Brain,
  TrendingUp,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Star,
  Award,
} from 'lucide-react'
import type { Customer, CustomerMetrics, AIRecommendation } from '@/lib/validations/customer'

interface CustomerIntelligenceProps {
  customer: Customer
  metrics: CustomerMetrics
  recommendations: AIRecommendation[]
}

export function CustomerIntelligence({
  customer,
  metrics,
  recommendations
}: CustomerIntelligenceProps) {

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excelente cliente'
    if (score >= 60) return 'Buen cliente'
    if (score >= 40) return 'Cliente regular'
    return 'Cliente ocasional'
  }

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'VIP Elite':
        return { color: 'bg-purple-100 text-purple-800', icon: '👑' }
      case 'Oro':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '🥇' }
      case 'Plata':
        return { color: 'bg-gray-100 text-gray-800', icon: '🥈' }
      case 'Bronce':
        return { color: 'bg-orange-100 text-orange-800', icon: '🥉' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📊' }
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium': return <Target className="h-4 w-4 text-yellow-600" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Lightbulb className="h-4 w-4 text-blue-600" />
    }
  }

  const calculateRetentionProbability = () => {
    const monthsSinceLastVisit = customer.lastVisit
      ? Math.floor((new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 12

    const visitScore = Math.min(customer.totalVisits * 12, 60)
    const recencyScore = Math.max(40 - monthsSinceLastVisit * 5, 0)

    return Math.min(visitScore + recencyScore, 100)
  }

  const tierInfo = getTierInfo(metrics.customerTier)
  const retentionProbability = calculateRetentionProbability()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Inteligencia de Cliente
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Loyalty Score */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.loyaltyScore)}`}>
              {metrics.loyaltyScore}
            </div>
            <div className="text-xs text-muted-foreground">Score Lealtad</div>
            <div className="text-xs text-blue-600 mt-1">
              {getScoreDescription(metrics.loyaltyScore)}
            </div>
          </div>

          {/* Customer Tier */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg">
              <Badge variant="secondary" className={tierInfo.color}>
                {tierInfo.icon} {metrics.customerTier}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Tier Cliente</div>
          </div>

          {/* Avg Party Size */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {customer.averagePartySize}
            </div>
            <div className="text-xs text-muted-foreground">Personas/mesa</div>
          </div>

          {/* Retention Risk */}
          <div className="text-center p-4 rounded-lg">
            <div className={`text-xl font-bold ${retentionProbability > 70 ? 'text-green-600' : retentionProbability > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {retentionProbability}%
            </div>
            <div className="text-xs text-muted-foreground">Retención</div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Análisis Detallado
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visit Frequency */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Frecuencia de Visitas</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.visitFrequency >= 2 ? 'Alta' : metrics.visitFrequency >= 1 ? 'Media' : 'Baja'}
                </span>
              </div>
              <Progress
                value={Math.min(metrics.visitFrequency * 50, 100)}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.visitFrequency.toFixed(1)} visitas/mes
              </div>
            </div>

            {/* Completion Rate */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tasa de Cumplimiento</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.completionRate}%
                </span>
              </div>
              <Progress
                value={metrics.completionRate}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Reservas completadas
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nivel de Riesgo</span>
                <Badge variant="outline" className={getRiskColor(metrics.riskLevel)}>
                  {metrics.riskLevel === 'low' ? 'Bajo' :
                   metrics.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Basado en patrones de comportamiento
              </div>
            </div>

            {/* Seasonality */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Estacionalidad</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {metrics.seasonalityPattern}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Patrón de reservas detectado
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Times */}
        {metrics.preferredTimeSlots.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horarios Preferidos
            </h4>
            <div className="flex flex-wrap gap-2">
              {metrics.preferredTimeSlots.slice(0, 5).map((slot, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {slot}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recomendaciones IA
          </h4>

          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(rec.priority)}
                      <span className="text-sm font-medium">{rec.title}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        rec.priority === 'high' ? 'border-red-200 text-red-600' :
                        rec.priority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                        'border-green-200 text-green-600'
                      }
                    >
                      {rec.priority === 'high' ? 'Alta' :
                       rec.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{rec.description}</p>

                  {rec.action && (
                    <Button variant="outline" size="sm" className="w-full">
                      {rec.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay recomendaciones en este momento</p>
              <p className="text-xs">El sistema analizará más datos para generar sugerencias</p>
            </div>
          )}
        </div>

        {/* Behavioral Insights */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Award className="h-4 w-4" />
            Insights de Comportamiento
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Tendencia Positiva</span>
              </div>
              <p className="text-xs text-blue-700">
                {customer.totalVisits > 5
                  ? 'Cliente fiel con patrón de visitas consistente'
                  : 'Cliente nuevo con potencial de crecimiento'
                }
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Oportunidad</span>
              </div>
              <p className="text-xs text-green-700">
                {customer.isVip
                  ? 'Cliente VIP - mantener experiencia premium'
                  : metrics.loyaltyScore > 70
                    ? 'Candidato ideal para programa VIP'
                    : 'Fomentar mayor frecuencia de visitas'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}