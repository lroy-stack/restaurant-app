import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface TrendIndicatorProps {
  value: number
  direction?: 'up' | 'down'
  label?: string
  showIcon?: boolean
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function TrendIndicator({
  value,
  direction,
  label,
  showIcon = true,
  variant,
  className
}: TrendIndicatorProps) {
  // Auto-detect direction from value if not provided
  const trendDirection = direction ?? (value >= 0 ? 'up' : 'down')

  // Auto-select variant based on direction if not provided
  const trendVariant = variant ?? (trendDirection === 'up' ? 'default' : 'destructive')

  const Icon = trendDirection === 'up' ? TrendingUp : TrendingDown
  const formattedValue = value >= 0 ? `+${value}` : value

  return (
    <Badge
      variant={trendVariant}
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{formattedValue}%</span>
      {label && <span className="text-xs opacity-80">{label}</span>}
    </Badge>
  )
}
