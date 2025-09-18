'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  UtensilsCrossed,
  Wine,
  Coffee,
  TrendingUp,
  Shield,
  Leaf,
  Euro,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useMenuAnalytics } from '../hooks/use-menu-analytics'

// Reusable metric card component following established patterns
interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  color?: "default" | "green" | "yellow" | "red" | "blue" | "purple"
  badge?: string
  onClick?: () => void
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "default",
  badge,
  onClick
}: MetricCardProps) {
  const colorClasses = {
    default: "border-border hover:border-border/80",
    green: "border-[#9FB289]/30 bg-[#9FB289]/10 hover:bg-[#9FB289]/20",
    yellow: "border-[#CB5910]/30 bg-[#CB5910]/10 hover:bg-[#CB5910]/20",
    red: "border-destructive/30 bg-destructive/10 hover:bg-destructive/20",
    blue: "border-[#237584]/30 bg-[#237584]/10 hover:bg-[#237584]/20",
    purple: "border-[#CB5910]/30 bg-[#CB5910]/10 hover:bg-[#CB5910]/20"
  }

  const iconColors = {
    default: "text-muted-foreground",
    green: "text-[#9FB289]",
    yellow: "text-[#CB5910]",
    red: "text-destructive",
    blue: "text-[#237584]",
    purple: "text-[#CB5910]"
  }

  return (
    <Card
      className={`${colorClasses[color]} transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
          <Icon className={`h-4 w-4 ${iconColors[color]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  )
}

// Loading skeleton following established patterns
function AnalyticsSkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-8 w-16 bg-muted rounded"></div>
                <div className="h-3 w-24 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Error component following established patterns
interface AnalyticsErrorProps {
  error: string
  onRetry: () => void
}

function AnalyticsError({ error, onRetry }: AnalyticsErrorProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/10">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive/60 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-destructive mb-2">
          Error al cargar métricas
        </h3>
        <p className="text-destructive/80 mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  )
}

// Main menu overview component
export function MenuOverview() {
  const { analytics, loading, error, refetch } = useMenuAnalytics()

  if (loading) {
    return <AnalyticsSkeletonLoader />
  }

  if (error || !analytics) {
    return <AnalyticsError error={error || 'Error desconocido'} onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Vista General del Menú</h2>
          <p className="text-sm text-muted-foreground">
            Última actualización: {new Date(analytics.lastUpdated).toLocaleString('es-ES')}
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Items"
          value={analytics.totalItems}
          icon={UtensilsCrossed}
          trend={`${analytics.availableItems} disponibles`}
          color="default"
        />

        <MetricCard
          title="Platos Principales"
          value={analytics.foodItems}
          icon={UtensilsCrossed}
          trend={`${analytics.wineAnalytics.foodPairingRate}% con maridaje`}
          color="green"
          badge="FOOD"
        />

        <MetricCard
          title="Vinos"
          value={analytics.wineItems}
          icon={Wine}
          trend={`${analytics.wineAnalytics.winePairingRate}% maridados`}
          color="purple"
          badge="WINE"
        />

        <MetricCard
          title="Bebidas"
          value={analytics.beverageItems}
          icon={Coffee}
          color="blue"
          badge="BEVERAGE"
        />
      </div>

      {/* Price & compliance analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Precio Promedio"
          value={analytics.priceAnalysis ? `€${analytics.priceAnalysis.average.toFixed(2)}` : '€0.00'}
          icon={Euro}
          trend={analytics.priceAnalysis ?
            `€${analytics.priceAnalysis.min.toFixed(2)} - €${analytics.priceAnalysis.max.toFixed(2)}` :
            'Sin datos'
          }
          color="default"
        />

        <MetricCard
          title="Vegetarianos"
          value={analytics.allergenCompliance.vegetarianItems}
          icon={Leaf}
          trend={`${Math.round((analytics.allergenCompliance.vegetarianItems / analytics.foodItems) * 100)}% de los platos`}
          color="green"
        />

        <MetricCard
          title="Sin Gluten"
          value={analytics.allergenCompliance.glutenFreeItems}
          icon={Shield}
          trend={`${Math.round((analytics.allergenCompliance.glutenFreeItems / analytics.foodItems) * 100)}% de los platos`}
          color="yellow"
        />

        <MetricCard
          title="Cumplimiento Dietético Platos"
          value={`${analytics.allergenCompliance.complianceRate}%`}
          icon={TrendingUp}
          trend={`${analytics.allergenCompliance.dietaryCompliantItems} platos dietéticos`}
          color={
            analytics.allergenCompliance.complianceRate > 75 ? "green" :
            analytics.allergenCompliance.complianceRate > 50 ? "yellow" : "red"
          }
        />
      </div>

      {/* Redesigned analytics sections - fully responsive and beautiful */}
      <div className="space-y-8">
        {/* Category distribution - Modern grid layout */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-[#237584]" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {analytics.categoryDistribution
                .filter(cat => cat.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((category) => {
                  const availabilityPercentage = category.count > 0 ? (category.availableCount / category.count) * 100 : 0
                  const typeConfig = {
                    FOOD: { bg: 'bg-[#9FB289]/10 dark:bg-[#9FB289]/20', border: 'border-[#9FB289]/30', text: 'text-[#9FB289] dark:text-[#9FB289]', icon: 'bg-[#9FB289]' },
                    WINE: { bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary', icon: 'bg-primary' },
                    BEVERAGE: { bg: 'bg-[#CB5910]/10 dark:bg-[#CB5910]/20', border: 'border-[#CB5910]/30', text: 'text-[#CB5910] dark:text-[#CB5910]', icon: 'bg-[#CB5910]' }
                  }
                  const config = typeConfig[category.type as keyof typeof typeConfig]

                  return (
                    <div key={category.id} className={`${config.bg} ${config.border} border rounded-lg p-4 hover:shadow-sm transition-all duration-200`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-8 h-8 ${config.icon} rounded-full flex items-center justify-center`}>
                          {category.type === 'FOOD' && <UtensilsCrossed className="w-4 h-4 text-white" />}
                          {category.type === 'WINE' && <Wine className="w-4 h-4 text-white" />}
                          {category.type === 'BEVERAGE' && <Coffee className="w-4 h-4 text-white" />}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{category.count}</div>
                          <div className="text-xs text-muted-foreground">items</div>
                        </div>
                      </div>

                      <h3 className={`font-semibold text-sm ${config.text} mb-2 line-clamp-1`}>
                        {category.name}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Disponibles</span>
                          <span className={`font-medium ${availabilityPercentage === 100 ? 'text-[#9FB289]' : 'text-foreground'}`}>
                            {category.availableCount}/{category.count}
                          </span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5">
                          <div
                            className={`${availabilityPercentage === 100 ? 'bg-[#9FB289]' : 'bg-muted-foreground'} h-1.5 rounded-full transition-all duration-300`}
                            style={{ width: `${availabilityPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Wine pairing analytics - Beautiful visual layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wine className="w-5 h-5 text-[#237584]" />
                Análisis de Maridajes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Big number showcase */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    {analytics.wineAnalytics.totalPairings}
                  </div>
                  <div className="text-sm text-muted-foreground">Maridajes Totales</div>
                </div>

                {/* Progress indicators */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Platos con Maridaje</span>
                      <span className="font-semibold text-foreground">
                        {analytics.wineAnalytics.pairedFoodItems}/{analytics.wineAnalytics.totalFoodItems}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-[#9FB289] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analytics.wineAnalytics.foodPairingRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {analytics.wineAnalytics.foodPairingRate.toFixed(1)}% cobertura
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Vinos Utilizados</span>
                      <span className="font-semibold text-foreground">
                        {analytics.wineAnalytics.pairedWines}/{analytics.wineAnalytics.totalWineItems}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analytics.wineAnalytics.winePairingRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {analytics.wineAnalytics.winePairingRate.toFixed(1)}% aprovechamiento
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular items - Elegant card layout */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-[#9FB289]" />
                Items Destacados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.popularItems.slice(0, 5).map((item, index) => {
                  const rankColors = [
                    'bg-[#CB5910]/10 text-[#CB5910] border-[#CB5910]/20',
                    'bg-muted text-muted-foreground border-border',
                    'bg-[#CB5910]/20 text-[#CB5910] border-[#CB5910]/30',
                    'bg-primary/10 text-primary border-primary/20',
                    'bg-[#9FB289]/10 text-[#9FB289] border-[#9FB289]/20'
                  ]

                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${rankColors[index]}`}>
                        #{item.rank}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="font-semibold text-[#9FB289] text-sm">
                            €{item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {analytics.popularItems.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No hay items destacados configurados
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}