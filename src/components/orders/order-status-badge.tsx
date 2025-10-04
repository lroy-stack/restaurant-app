import { OrderStatus } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, ChefHat, Bell, Check, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium transition-colors',
  {
    variants: {
      status: {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
        PREPARING: 'bg-orange-100 text-orange-800 border-orange-300',
        READY: 'bg-green-100 text-green-800 border-green-300',
        SERVED: 'bg-gray-100 text-gray-600 border-gray-300',
        CANCELLED: 'bg-red-100 text-red-800 border-red-300',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
      },
    },
    defaultVariants: {
      status: 'PENDING',
      size: 'md',
    },
  }
)

interface OrderStatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: OrderStatus
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ElementType }
> = {
  PENDING: { label: 'Pendiente', icon: Clock },
  CONFIRMED: { label: 'Confirmado', icon: CheckCircle },
  PREPARING: { label: 'Preparando', icon: ChefHat },
  READY: { label: 'Listo', icon: Bell },
  SERVED: { label: 'Servido', icon: Check },
  CANCELLED: { label: 'Cancelado', icon: X },
}

export function OrderStatusBadge({
  status,
  size,
  showIcon = true,
  className,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ status, size }), className)}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{config.label}</span>
    </Badge>
  )
}
