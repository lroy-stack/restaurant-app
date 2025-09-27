'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Crown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Shield,
  X,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/validations/customer'

interface CustomerHeaderProps {
  customer: Customer
  loyaltyScore: number
  customerTier: 'VIP Elite' | 'Oro' | 'Plata' | 'Bronce'
  onVipToggle: () => Promise<boolean>
  canEditVip: boolean
}

const tierConfig = {
  'VIP Elite': {
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    icon: Crown,
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50'
  },
  'Oro': {
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    icon: Star,
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50'
  },
  'Plata': {
    color: 'bg-gradient-to-r from-gray-300 to-gray-500',
    icon: Shield,
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50'
  },
  'Bronce': {
    color: 'bg-gradient-to-r from-orange-400 to-red-500',
    icon: Shield,
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50'
  }
}

export function CustomerHeader({
  customer,
  loyaltyScore,
  customerTier,
  onVipToggle,
  canEditVip
}: CustomerHeaderProps) {
  const [isTogglingVip, setIsTogglingVip] = useState(false)

  const tierInfo = tierConfig[customerTier]
  const TierIcon = tierInfo.icon

  const handleVipToggle = async () => {
    if (!canEditVip) {
      toast.error('No tienes permisos para cambiar el estado VIP')
      return
    }

    setIsTogglingVip(true)
    try {
      const success = await onVipToggle()
      if (success) {
        toast.success(
          customer.isVip
            ? 'Estado VIP removido correctamente'
            : 'Estado VIP otorgado correctamente'
        )
      }
    } catch {
      toast.error('Error al cambiar estado VIP')
    } finally {
      setIsTogglingVip(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatLastVisit = (lastVisit?: string) => {
    if (!lastVisit) return 'Nunca'

    const days = Math.floor(
      (new Date().getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 7) return `Hace ${days} días`
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
    return `Hace ${Math.floor(days / 365)} años`
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {getInitials(customer.firstName, customer.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {customer.firstName} {customer.lastName}
                </h1>
                {customer.isVip && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Crown className="h-3 w-3 mr-1" />
                    VIP
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {customer.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{customer.email}</span>
                  </div>
                )}

                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}

                {customer.preferredLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="capitalize">
                      {customer.preferredLocation.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Loyalty Tier */}
            <div className={`p-4 rounded-lg ${tierInfo.bgColor} border-l-4 ${tierInfo.color.replace('bg-gradient-to-r', 'border-l-purple-500')}`}>
              <div className="flex items-center gap-2">
                <TierIcon className={`h-5 w-5 ${tierInfo.textColor}`} />
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Tier</div>
                  <div className={`text-sm font-semibold ${tierInfo.textColor}`}>
                    {customerTier}
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Score */}
            <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Score</div>
                  <div className="text-sm font-semibold text-blue-700">
                    {loyaltyScore}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Total Visits */}
            <div className="p-4 rounded-lg bg-green-50 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Visitas</div>
                  <div className="text-sm font-semibold text-green-700">
                    {customer.totalVisits}
                  </div>
                </div>
              </div>
            </div>

            {/* Last Visit */}
            <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-l-orange-500">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Última visita</div>
                  <div className="text-sm font-semibold text-orange-700">
                    {formatLastVisit(customer.lastVisit)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VIP Toggle Button */}
          {canEditVip && (
            <div className="flex flex-col gap-2">
              <Button
                variant={customer.isVip ? "destructive" : "default"}
                size="sm"
                onClick={handleVipToggle}
                disabled={isTogglingVip}
                className="min-w-[120px]"
              >
                {isTogglingVip ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Cambiando...</span>
                  </div>
                ) : customer.isVip ? (
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>Quitar VIP</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span>Hacer VIP</span>
                  </div>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                {customer.isVip ? 'Cliente VIP activo' : 'Cliente regular'}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Row */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Cliente desde: </span>
              <span className="text-foreground">{formatDate(customer.createdAt)}</span>
            </div>

            <div>
              <span className="font-medium text-muted-foreground">Ubicación preferida: </span>
              <span className="text-foreground capitalize">
                {customer.preferredLocation?.replace('_', ' ').toLowerCase() || 'Sin preferencia'}
              </span>
            </div>

            <div>
              <span className="font-medium text-muted-foreground">Tamaño promedio mesa: </span>
              <span className="text-foreground">{customer.averagePartySize} personas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}