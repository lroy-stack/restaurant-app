'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Trend {
  value: number
  direction: 'up' | 'down' | 'neutral'
  period: string
}

interface QuickAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'secondary' | 'destructive'
}

interface ModernStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: Trend
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
  }
  quickActions?: QuickAction[]
  isLoading?: boolean
  onClick?: () => void
  className?: string
}

export function ModernStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  quickActions,
  isLoading = false,
  onClick,
  className
}: ModernStatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null

    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'

    switch (trend.direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        "hover:shadow-md hover:shadow-primary/5",
        "border-border/50 hover:border-border",
        onClick && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </p>
              {badge && (
                <Badge
                  variant={badge.variant || 'secondary'}
                  className="mt-1 text-xs"
                >
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>

          {quickActions && quickActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {quickActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.onClick()
                    }}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Main Value */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <div className="text-3xl font-bold text-foreground">
              {value}
            </div>
          )}

          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Trend Information */}
        {trend && !isLoading && (
          <div className="flex items-center space-x-1 mt-3">
            {getTrendIcon()}
            <span className={cn("text-sm font-medium", getTrendColor())}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-muted-foreground">
              vs. {trend.period}
            </span>
          </div>
        )}

        {/* Click Action Indicator */}
        {onClick && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}