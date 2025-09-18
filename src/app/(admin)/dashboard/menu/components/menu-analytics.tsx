'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  UtensilsCrossed,
  Wine,
  Coffee,
  Users,
  Euro,
  Percent,
  Target,
  Activity,
  CheckCircle2,
  XCircle,
  Leaf,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useMenuAnalytics } from '../hooks/use-menu-analytics'
import { Button } from '@/components/ui/button'

export function MenuAnalytics() {
  const { analytics, loading, error, refetch } = useMenuAnalytics()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive/60 dark:text-destructive/80 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-destructive dark:text-destructive mb-2">
              Error al cargar análisis
            </h3>
            <p className="text-destructive/80 dark:text-destructive/90 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground">
              Los análisis aparecerán cuando tengas elementos en el menú
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análisis del Menú</h2>
          <p className="text-muted-foreground">
            Métricas detalladas y tendencias del menú
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Elementos</p>
                <p className="text-3xl font-bold">{analytics.totalItems}</p>
              </div>
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Available Items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-3xl font-bold text-[#9FB289]">{analytics.availableItems}</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.totalItems > 0 ? ((analytics.availableItems / analytics.totalItems) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-[#9FB289]" />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                <p className="text-3xl font-bold">{analytics.categoryDistribution.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#237584]" />
            </div>
          </CardContent>
        </Card>

        {/* Average Price */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio Promedio</p>
                <p className="text-3xl font-bold">
                  €{analytics.priceAnalysis?.average.toFixed(2) || '0.00'}
                </p>
                {analytics.priceAnalysis && (
                  <p className="text-sm text-muted-foreground">
                    €{analytics.priceAnalysis.min.toFixed(2)} - €{analytics.priceAnalysis.max.toFixed(2)}
                  </p>
                )}
              </div>
              <Euro className="w-8 h-8 text-[#CB5910]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown & Wine Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryDistribution.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {category.type === 'FOOD' && <UtensilsCrossed className="w-4 h-4 text-[#9FB289]" />}
                      {category.type === 'WINE' && <Wine className="w-4 h-4 text-[#CB5910]" />}
                      {category.type === 'BEVERAGE' && <Coffee className="w-4 h-4 text-[#237584]" />}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {category.availableCount}/{category.count}
                      </span>
                      <Badge variant="outline">
                        {category.count} items
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={analytics.totalItems > 0 ? (category.count / analytics.totalItems) * 100 : 0}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wine Pairing Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="w-5 h-5" />
              Análisis de Maridajes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#CB5910]">{analytics.wineAnalytics.totalPairings}</p>
                  <p className="text-sm text-muted-foreground">Maridajes Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#9FB289]">
                    {analytics.wineAnalytics.foodPairingRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Cobertura Comida</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Platos con maridajes</span>
                    <span>{analytics.wineAnalytics.pairedFoodItems}/{analytics.wineAnalytics.totalFoodItems}</span>
                  </div>
                  <Progress value={analytics.wineAnalytics.foodPairingRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Vinos utilizados</span>
                    <span>{analytics.wineAnalytics.pairedWines}/{analytics.wineAnalytics.totalWineItems}</span>
                  </div>
                  <Progress value={analytics.wineAnalytics.winePairingRate} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dietary & Allergen Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dietary Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Opciones Dietéticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#9FB289]">{analytics.allergenCompliance.vegetarianItems}</p>
                  <p className="text-sm text-muted-foreground">Vegetarianos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#9FB289]">{analytics.allergenCompliance.veganItems}</p>
                  <p className="text-sm text-muted-foreground">Veganos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#CB5910]">{analytics.allergenCompliance.glutenFreeItems}</p>
                  <p className="text-sm text-muted-foreground">Sin Gluten</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cumplimiento Dietético General</span>
                  <span>{analytics.allergenCompliance.complianceRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.allergenCompliance.complianceRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Items Destacados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{item.rank}</Badge>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {analytics.popularItems.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No hay items destacados configurados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Distribución por Tipo de Elemento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Food Items */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <UtensilsCrossed className="w-12 h-12 text-[#9FB289]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#9FB289]">{analytics.foodItems}</p>
                <p className="text-sm text-muted-foreground">Elementos de Comida</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalItems > 0 ? ((analytics.foodItems / analytics.totalItems) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
            </div>

            {/* Wine Items */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <Wine className="w-12 h-12 text-[#CB5910]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#CB5910]">{analytics.wineItems}</p>
                <p className="text-sm text-muted-foreground">Elementos de Vino</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalItems > 0 ? ((analytics.wineItems / analytics.totalItems) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
            </div>

            {/* Beverage Items */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <Coffee className="w-12 h-12 text-[#237584]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#237584]">{analytics.beverageItems}</p>
                <p className="text-sm text-muted-foreground">Bebidas</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalItems > 0 ? ((analytics.beverageItems / analytics.totalItems) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer with Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Última actualización: {new Date(analytics.lastUpdated).toLocaleString('es-ES')}
      </div>
    </div>
  )
}