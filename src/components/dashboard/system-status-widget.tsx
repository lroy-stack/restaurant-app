'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Server,
  Database,
  Shield,
  HardDrive,
  Cpu,
  Network,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Trash2,
  Settings,
  Activity,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface SystemMetric {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'error'
  value?: string
  lastCheck: Date
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: () => Promise<void>
  variant?: 'default' | 'destructive' | 'secondary'
  requiresConfirmation?: boolean
}

interface SystemStatusWidgetProps {
  className?: string
}

export function SystemStatusWidget({ className }: SystemStatusWidgetProps) {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Acciones rápidas inteligentes
  const quickActions: QuickAction[] = [
    {
      id: 'clear-cache',
      label: 'Limpiar Cache',
      description: 'Limpiar cache de base de datos',
      icon: Trash2,
      action: async () => {
        try {
          const response = await fetch('/api/system/clear-cache', {
            method: 'POST'
          })
          if (response.ok) {
            toast.success('Cache limpiado exitosamente')
            await fetchSystemStatus()
          } else {
            throw new Error('Error al limpiar cache')
          }
        } catch (error) {
          toast.error('Error al limpiar cache')
        }
      },
      variant: 'secondary'
    },
    {
      id: 'optimize-db',
      label: 'Optimizar DB',
      description: 'Optimizar consultas de base de datos',
      icon: Database,
      action: async () => {
        try {
          const response = await fetch('/api/system/optimize-db', {
            method: 'POST'
          })
          if (response.ok) {
            toast.success('Base de datos optimizada')
            await fetchSystemStatus()
          } else {
            throw new Error('Error al optimizar DB')
          }
        } catch (error) {
          toast.error('Error al optimizar base de datos')
        }
      }
    },
    {
      id: 'clear-logs',
      label: 'Limpiar Logs',
      description: 'Eliminar logs antiguos del sistema',
      icon: Activity,
      action: async () => {
        try {
          const response = await fetch('/api/system/clear-logs', {
            method: 'DELETE'
          })
          if (response.ok) {
            toast.success('Logs limpiados exitosamente')
            await fetchSystemStatus()
          } else {
            throw new Error('Error al limpiar logs')
          }
        } catch (error) {
          toast.error('Error al limpiar logs')
        }
      },
      variant: 'destructive',
      requiresConfirmation: true
    },
    {
      id: 'restart-services',
      label: 'Reiniciar Servicios',
      description: 'Reiniciar servicios críticos del sistema',
      icon: RefreshCw,
      action: async () => {
        try {
          const response = await fetch('/api/system/restart-services', {
            method: 'POST'
          })
          if (response.ok) {
            toast.success('Servicios reiniciados')
            await fetchSystemStatus()
          } else {
            throw new Error('Error al reiniciar servicios')
          }
        } catch (error) {
          toast.error('Error al reiniciar servicios')
        }
      },
      variant: 'destructive',
      requiresConfirmation: true
    }
  ]

  const fetchSystemStatus = async () => {
    try {
      // Simulación de métricas del sistema (en producción vendría de la API)
      const mockMetrics: SystemMetric[] = [
        {
          id: 'database',
          name: 'Base de Datos',
          status: 'healthy',
          value: '99.9% uptime',
          lastCheck: new Date(),
          description: 'PostgreSQL operativa',
          icon: Database
        },
        {
          id: 'auth',
          name: 'Autenticación',
          status: 'healthy',
          value: 'Activa',
          lastCheck: new Date(),
          description: 'Supabase Auth funcionando',
          icon: Shield
        },
        {
          id: 'api',
          name: 'API Gateway',
          status: 'healthy',
          value: '< 100ms',
          lastCheck: new Date(),
          description: 'Respuesta rápida',
          icon: Network
        },
        {
          id: 'storage',
          name: 'Almacenamiento',
          status: 'warning',
          value: '78% usado',
          lastCheck: new Date(),
          description: 'Espacio disponible suficiente',
          icon: HardDrive
        },
        {
          id: 'cpu',
          name: 'CPU',
          status: 'healthy',
          value: '23% uso',
          lastCheck: new Date(),
          description: 'Rendimiento óptimo',
          icon: Cpu
        },
        {
          id: 'backup',
          name: 'Backup',
          status: 'healthy',
          value: 'Última: 03:00',
          lastCheck: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
          description: 'Backup automático completado',
          icon: Server
        }
      ]

      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error fetching system status:', error)
      toast.error('Error al obtener estado del sistema')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSystemStatus()
    setIsRefreshing(false)
    toast.success('Estado del sistema actualizado')
  }

  const executeQuickAction = async (action: QuickAction) => {
    if (action.requiresConfirmation) {
      if (!confirm(`¿Estás seguro de que quieres ${action.label.toLowerCase()}?`)) {
        return
      }
    }

    toast.loading(`${action.label}...`)
    try {
      await action.action()
    } catch (error) {
      console.error(`Error executing ${action.id}:`, error)
    }
  }

  useEffect(() => {
    const initializeStatus = async () => {
      await fetchSystemStatus()
      setIsLoading(false)
    }

    initializeStatus()

    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchSystemStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          badge: 'default' as const
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          badge: 'warning' as const
        }
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          badge: 'destructive' as const
        }
    }
  }

  const healthyCount = metrics.filter(m => m.status === 'healthy').length
  const warningCount = metrics.filter(m => m.status === 'warning').length
  const errorCount = metrics.filter(m => m.status === 'error').length

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Estado del Sistema</span>
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Estado del Sistema</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {healthyCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {healthyCount} OK
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="warning" className="text-xs">
                  {warningCount} ⚠
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {errorCount} ⚠
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Métricas del Sistema */}
        <div className="space-y-3 mb-6">
          {metrics.map((metric) => {
            const statusConfig = getStatusConfig(metric.status)
            const StatusIcon = statusConfig.icon
            const MetricIcon = metric.icon

            return (
              <div
                key={metric.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn("p-1.5 rounded-md", statusConfig.bgColor)}>
                    <MetricIcon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{metric.name}</span>
                      <StatusIcon className={cn("h-3 w-3", statusConfig.color)} />
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {metric.lastCheck.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <Separator className="mb-4" />

        {/* Acciones Rápidas */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Acciones Rápidas</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const ActionIcon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  className="h-auto p-3 flex flex-col items-start space-y-1"
                  onClick={() => executeQuickAction(action)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <ActionIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {action.description}
                  </p>
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}