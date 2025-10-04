import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardAction
} from "@/components/ui/card"
import { TrendIndicator } from "@/components/ui/trend-indicator"

export interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    direction?: 'up' | 'down'
    label?: string
  }
  footer?: {
    label: string
    sublabel?: string
  }
  variant?: 'default' | 'primary' | 'success' | 'warning'
  loading?: boolean
  className?: string
}

const variantStyles = {
  default: "bg-gradient-to-t from-muted/50 to-card",
  primary: "bg-gradient-to-t from-primary/5 to-card",
  success: "bg-gradient-to-t from-green-500/5 to-card",
  warning: "bg-gradient-to-t from-orange-500/5 to-card"
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  footer,
  variant = 'default',
  loading = false,
  className
}: MetricCardProps) {
  return (
    <Card className={cn("@container/card", variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {trend && (
          <CardAction>
            <TrendIndicator
              value={trend.value}
              direction={trend.direction}
              label={trend.label}
            />
          </CardAction>
        )}
        {!trend && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold @[250px]/card:text-3xl">
          {loading ? (
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          ) : (
            value
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="flex-col items-start gap-1">
          <p className="text-xs font-medium text-foreground">
            {footer.label}
          </p>
          {footer.sublabel && (
            <p className="text-xs text-muted-foreground">
              {footer.sublabel}
            </p>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
