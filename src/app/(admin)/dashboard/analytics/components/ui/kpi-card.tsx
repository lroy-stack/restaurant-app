'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  icon?: React.ElementType
  description?: string
  target?: number
  status?: 'good' | 'warning' | 'danger'
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function KPICard({
  title,
  value,
  unit,
  change,
  trend = 'neutral',
  className,
  icon: Icon,
  description,
  target,
  status = 'good',
  loading = false,
  size = 'md'
}: KPICardProps) {

  const trendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  }[trend]

  const trendColor = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  }[trend]

  const statusColor = {
    good: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600'
  }[status]

  const statusBadgeVariant = {
    good: 'default' as const,
    warning: 'secondary' as const,
    danger: 'destructive' as const
  }[status]

  const sizeClasses = {
    sm: {
      card: 'p-4',
      title: 'text-sm',
      value: 'text-lg',
      unit: 'text-sm',
      icon: 'h-4 w-4',
      change: 'text-xs'
    },
    md: {
      card: 'p-6',
      title: 'text-sm',
      value: 'text-2xl',
      unit: 'text-lg',
      icon: 'h-4 w-4',
      change: 'text-xs'
    },
    lg: {
      card: 'p-8',
      title: 'text-base',
      value: 'text-3xl',
      unit: 'text-xl',
      icon: 'h-5 w-5',
      change: 'text-sm'
    }
  }[size]

  const TrendIcon = trendIcon

  if (loading) {
    return (
      <Card className={cn('transition-all hover:shadow-md', className)}>
        <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2', sizeClasses.card)}>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-8 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
          {Icon && (
            <div className={cn('bg-muted rounded animate-pulse', sizeClasses.icon)}></div>
          )}
        </CardHeader>
      </Card>
    )
  }

  // Calculate achievement percentage for target comparison
  const achievementPercentage = target && typeof value === 'number'
    ? Math.round((value / target) * 100)
    : null

  return (
    <Card className={cn('transition-all hover:shadow-md border-l-4',
      status === 'good' && 'border-l-green-500',
      status === 'warning' && 'border-l-amber-500',
      status === 'danger' && 'border-l-red-500',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn('font-medium text-muted-foreground', sizeClasses.title)}>
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {status === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {status === 'danger' && <AlertTriangle className="h-4 w-4 text-red-500" />}
          {Icon && <Icon className={cn('text-muted-foreground', sizeClasses.icon)} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Value Display */}
          <div className={cn('font-bold text-foreground flex items-baseline', sizeClasses.value)}>
            <span className={target ? statusColor : ''}>
              {typeof value === 'number'
                ? new Intl.NumberFormat('es-ES').format(value)
                : value
              }
            </span>
            {unit && (
              <span className={cn('text-muted-foreground ml-1 font-normal', sizeClasses.unit)}>
                {unit}
              </span>
            )}
          </div>

          {/* Trend Indicator */}
          {change !== undefined && (
            <div className={cn('flex items-center space-x-1', sizeClasses.change)}>
              <TrendIcon className={cn('h-3 w-3', trendColor)} />
              <span className={trendColor}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-muted-foreground">vs. período anterior</span>
            </div>
          )}

          {/* Target Progress */}
          {target && achievementPercentage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Objetivo: {new Intl.NumberFormat('es-ES').format(target)}{unit}
                </span>
                <Badge variant={statusBadgeVariant} className="text-xs">
                  {achievementPercentage}%
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    status === 'good' && 'bg-green-500',
                    status === 'warning' && 'bg-amber-500',
                    status === 'danger' && 'bg-red-500'
                  )}
                  style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Utility component for KPI grids
interface KPIGridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4 | 6
}

export function KPIGrid({
  children,
  className,
  columns = 3
}: KPIGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }[columns]

  return (
    <div className={cn('grid gap-4', gridClasses, className)}>
      {children}
    </div>
  )
}