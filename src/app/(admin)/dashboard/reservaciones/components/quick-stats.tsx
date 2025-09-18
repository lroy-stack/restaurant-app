import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Star,
  Target
} from 'lucide-react'

interface Reservation {
  id: string
  date: string
  time: string
  partySize: number
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests?: string
  hasPreOrder: boolean
  tableId: string
  createdAt: string
  updatedAt: string
}

interface QuickStatsProps {
  reservations: Reservation[]
  previousPeriodData?: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    vip: number
  }
}

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  trend?: { 
    value: number
    label: string
    isPositive?: boolean
  }
  color?: "default" | "green" | "yellow" | "red" | "blue" | "purple"
  badge?: string
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "default",
  badge
}: StatCardProps) {
  const colorClasses = {
    default: "border-border hover:border-border/70",
    green: "border-green-200 bg-green-50/50 hover:bg-green-50 dark:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/30",
    yellow: "border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30",
    red: "border-red-200 bg-red-50/50 hover:bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/30",
    blue: "border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
    purple: "border-purple-200 bg-purple-50/50 hover:bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
  }
  
  const iconColors = {
    default: "text-muted-foreground",
    green: "text-green-500 dark:text-green-400",
    yellow: "text-yellow-500 dark:text-yellow-400",
    red: "text-red-500 dark:text-red-400",
    blue: "text-blue-500 dark:text-blue-400",
    purple: "text-purple-500 dark:text-purple-400"
  }
  
  return (
    <Card className={`${colorClasses[color]} transition-all duration-200 cursor-pointer hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {badge}
            </Badge>
          )}
          <Icon className={`h-4 w-4 ${iconColors[color]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.isPositive !== undefined
              ? (trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
              : (trend.value > 0 ? 'text-green-600 dark:text-green-400' : trend.value < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')
          }`}>
            {trend.value !== 0 && (
              <>
                {(trend.isPositive !== undefined ? trend.isPositive : trend.value > 0) ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
              </>
            )}
            <span className="font-medium">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function QuickStats({ reservations, previousPeriodData }: QuickStatsProps) {
  // Calculate current stats
  const totalReservations = reservations.length
  const pendingReservations = reservations.filter(r => r.status === 'PENDING').length
  const confirmedReservations = reservations.filter(r => 
    ['CONFIRMED', 'SEATED'].includes(r.status)
  ).length
  const cancelledReservations = reservations.filter(r => 
    ['CANCELLED', 'NO_SHOW'].includes(r.status)
  ).length
  const completedReservations = reservations.filter(r => r.status === 'COMPLETED').length
  
  // Calculate party size stats
  const totalGuests = reservations.reduce((sum, r) => sum + r.partySize, 0)
  const averagePartySize = totalReservations > 0 
    ? Math.round((totalGuests / totalReservations) * 10) / 10 
    : 0
    
  // VIP customers - TODO: Add VIP field to database
  const vipReservations = reservations.filter(r => 
    r.customerEmail.includes('vip') || r.specialRequests?.toLowerCase().includes('vip')
  ).length
  
  // Today's reservations
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const todayReservations = reservations.filter(r => {
    const reservationDate = new Date(r.date)
    return reservationDate >= today && reservationDate < tomorrow
  }).length
  
  // Calculate rates
  const confirmationRate = totalReservations > 0 
    ? Math.round((confirmedReservations / totalReservations) * 100)
    : 0
    
  const cancellationRate = totalReservations > 0
    ? Math.round((cancelledReservations / totalReservations) * 100)
    : 0

  // Calculate trends vs previous period
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      value: change,
      label: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    }
  }

  const totalTrend = previousPeriodData ? calculateTrend(totalReservations, previousPeriodData.total) : null
  const pendingTrend = previousPeriodData ? calculateTrend(pendingReservations, previousPeriodData.pending) : null
  const confirmedTrend = previousPeriodData ? calculateTrend(confirmedReservations, previousPeriodData.confirmed) : null
  const completedTrend = previousPeriodData ? calculateTrend(completedReservations, previousPeriodData.completed) : null
  const vipTrend = previousPeriodData ? calculateTrend(vipReservations, previousPeriodData.vip) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Reservas"
        value={totalReservations}
        icon={Calendar}
        trend={totalTrend}
        color="default"
      />
      
      <StatCard
        title="Pendientes"
        value={pendingReservations}
        icon={Clock}
        trend={pendingTrend ? { ...pendingTrend, isPositive: false } : undefined}
        color={pendingReservations > 0 ? "yellow" : "default"}
        badge={pendingReservations > 5 ? "ALTA" : undefined}
      />
      
      <StatCard
        title="Confirmadas"
        value={confirmedReservations}
        icon={CheckCircle}
        trend={confirmedTrend ? { ...confirmedTrend, isPositive: true } : undefined}
        color={confirmedReservations > 0 ? "green" : "default"}
      />
      
      <StatCard
        title="Completadas"
        value={completedReservations}
        icon={Target}
        trend={completedTrend ? { ...completedTrend, isPositive: true } : undefined}
        color={completedReservations > 0 ? "blue" : "default"}
      />
      
      <StatCard
        title="Hoy"
        value={todayReservations}
        icon={Calendar}
        trend={todayReservations > 0 ? { value: 0, label: `${totalGuests} comensales` } : undefined}
        color={todayReservations > 0 ? "blue" : "default"}
        badge={todayReservations > 10 ? "ALTO" : undefined}
      />
      
      <StatCard
        title="Clientes VIP"
        value={vipReservations}
        icon={Star}
        trend={vipTrend ? { ...vipTrend, isPositive: true } : undefined}
        color={vipReservations > 0 ? "purple" : "default"}
        badge={vipReservations > 0 ? `${Math.round((vipReservations/totalReservations)*100)}%` : undefined}
      />
    </div>
  )
}