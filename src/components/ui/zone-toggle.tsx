"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const zoneToggleVariants = cva(
  "relative flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 hover:border-gray-300 dark:bg-card dark:border-border dark:hover:border-border/80",
        active: "bg-green-50 border-green-200 hover:border-green-300 dark:bg-green-950/30 dark:border-green-800 dark:hover:border-green-700",
        inactive: "bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-muted/30 dark:border-border dark:hover:border-border/80",
      },
      size: {
        default: "min-h-[80px]",
        sm: "min-h-[60px] p-3",
        lg: "min-h-[100px] p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ZoneToggleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof zoneToggleVariants> {
  label: string
  description?: string
  isActive: boolean
  isLoading?: boolean
  count?: number
  activeCount?: number
  inactiveCount?: number
  onToggle: (active: boolean) => void
  disabled?: boolean
}

const ZoneToggle = React.forwardRef<HTMLDivElement, ZoneToggleProps>(
  ({
    className,
    variant,
    size,
    label,
    description,
    isActive,
    isLoading = false,
    count,
    activeCount,
    inactiveCount,
    onToggle,
    disabled = false,
    ...props
  }, ref) => {
    const effectiveVariant = isActive ? "active" : "inactive"

    return (
      <div
        className={cn(zoneToggleVariants({ variant: effectiveVariant, size, className }))}
        ref={ref}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate">{label}</h3>
            {count !== undefined && (
              <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                {count}
              </Badge>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}

          {/* Stats */}
          {(activeCount !== undefined || inactiveCount !== undefined) && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              {activeCount !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                  <span>{activeCount} activas</span>
                </div>
              )}
              {inactiveCount !== undefined && inactiveCount > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
                  <span>{inactiveCount} cerradas</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 ml-4">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={isActive}
              onCheckedChange={onToggle}
              disabled={disabled}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
            />
          )}
        </div>

        {/* Status indicator */}
        <div className={`
          absolute top-2 right-2 w-2 h-2 rounded-full transition-colors
          ${isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}
          ${isLoading ? 'animate-pulse' : ''}
        `} />
      </div>
    )
  }
)
ZoneToggle.displayName = "ZoneToggle"

export { ZoneToggle, zoneToggleVariants }
export type { ZoneToggleProps }