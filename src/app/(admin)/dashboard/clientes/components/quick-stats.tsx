import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Crown,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Star
} from 'lucide-react'
// Removed unused imports: Calendar, Activity, Target, Shield

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  isVip: boolean
  totalReservations: number
  totalSpent: number
  lastVisit?: string
  preferences?: string
  allergies?: string[]
  gdprConsent: boolean
  marketingConsent: boolean
  createdAt: string
  updatedAt: string
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  averageSpending: number
  visitFrequency: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface CustomerSummary {
  total: number
  active: number
  vip: number
  inactive: number
  newThisMonth: number
}

interface QuickStatsProps {
  customers: Customer[]
  summary: CustomerSummary
  previousPeriodData?: {
    total: number
    active: number
    vip: number
    inactive: number
    newThisMonth: number
  }
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
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
    default: "border-border hover:border-border/80",
    green: "border-border bg-green-500/5 hover:bg-green-500/10 dark:bg-green-400/5 dark:hover:bg-green-400/10",
    yellow: "border-border bg-yellow-500/5 hover:bg-yellow-500/10 dark:bg-yellow-400/5 dark:hover:bg-yellow-400/10",
    red: "border-border bg-red-500/5 hover:bg-red-500/10 dark:bg-red-400/5 dark:hover:bg-red-400/10",
    blue: "border-border bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-400/5 dark:hover:bg-blue-400/10",
    purple: "border-border bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-400/5 dark:hover:bg-purple-400/10"
  }
  
  const iconColors = {
    default: "text-muted-foreground",
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400"
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
              ? (trend.isPositive ? 'text-green-600' : 'text-red-600')
              : (trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-500')
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

export function QuickStats({ customers, summary, previousPeriodData }: QuickStatsProps) {
  // Calculate current stats
  const totalCustomers = customers.length
  const vipCustomers = customers.filter(c => c.isVip).length
  const activeCustomers = customers.filter(c => {
    if (!c.lastVisit) return false
    const lastVisit = new Date(c.lastVisit)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    return lastVisit >= threeMonthsAgo
  }).length
  
  const newThisMonth = customers.filter(c => {
    const created = new Date(c.createdAt)
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    return created >= thisMonth
  }).length
  
  // Calculate GDPR compliance
  const gdprCompliantCustomers = customers.filter(c => c.gdprConsent).length
  const gdprComplianceRate = totalCustomers > 0 
    ? Math.round((gdprCompliantCustomers / totalCustomers) * 100)
    : 0
    
  // Calculate loyalty distribution
  const loyaltyDistribution = customers.reduce((acc, c) => {
    acc[c.loyaltyTier] = (acc[c.loyaltyTier] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const platinumCustomers = loyaltyDistribution.PLATINUM || 0
  const goldCustomers = loyaltyDistribution.GOLD || 0
  
  // High frequency customers
  const highFrequencyCustomers = customers.filter(c => c.visitFrequency === 'HIGH').length
  
  // Calculate trends vs previous period
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      value: change,
      label: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    }
  }

  const totalTrend = previousPeriodData ? calculateTrend(totalCustomers, previousPeriodData.total) : null
  const activeTrend = previousPeriodData ? calculateTrend(activeCustomers, previousPeriodData.active) : null
  const vipTrend = previousPeriodData ? calculateTrend(vipCustomers, previousPeriodData.vip) : null
  const newCustomerTrend = previousPeriodData ? calculateTrend(newThisMonth, previousPeriodData.newThisMonth) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Clientes"
        value={totalCustomers}
        icon={Users}
        {...(totalTrend && { trend: totalTrend })}
        color="default"
      />
      
      <StatCard
        title="Clientes VIP"
        value={vipCustomers}
        icon={Crown}
        {...(vipTrend && { trend: { ...vipTrend, isPositive: true } })}
        color={vipCustomers > 0 ? "yellow" : "default"}
        {...(totalCustomers > 0 && { badge: `${Math.round((vipCustomers/totalCustomers)*100)}%` })}
      />
      
      <StatCard
        title="Nuevos (Mes)"
        value={newThisMonth}
        icon={UserCheck}
        {...(newCustomerTrend && { trend: { ...newCustomerTrend, isPositive: true } })}
        color={newThisMonth > 0 ? "purple" : "default"}
        {...(newThisMonth > 5 && { badge: "ALTO" })}
      />
      
      <StatCard
        title="Alta Fidelidad"
        value={platinumCustomers + goldCustomers}
        icon={Star}
        {...(platinumCustomers > 0 && { trend: { value: 0, label: `${platinumCustomers} Platino` } })}
        color={platinumCustomers > 0 ? "purple" : goldCustomers > 0 ? "yellow" : "default"}
        {...(highFrequencyCustomers > 0 && { badge: `${highFrequencyCustomers} Alta Freq` })}
      />
    </div>
  )
}