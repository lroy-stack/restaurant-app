'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Crown,
  Mail,
  Phone,
  Download,
  UserPlus,
  Calendar,
  MessageSquare,
  Share2,
  Eye,
  Edit,
  Trash2,
  Gift
} from 'lucide-react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/validations/customer'

interface CustomerActionsProps {
  customer: Customer
  onVipToggle: () => Promise<boolean>
  onExportData: () => Promise<boolean>
  onSendEmail: () => void
  onViewReservations: () => void
}

export function CustomerActions({
  customer,
  onVipToggle,
  onExportData,
  onSendEmail,
  onViewReservations
}: CustomerActionsProps) {
  const [isTogglingVip, setIsTogglingVip] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleVipToggle = async () => {
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
    } catch (error) {
      toast.error('Error al cambiar estado VIP')
    } finally {
      setIsTogglingVip(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const success = await onExportData()
      if (success) {
        toast.success('Datos exportados correctamente')
      }
    } catch (error) {
      toast.error('Error al exportar datos')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePhoneCall = () => {
    if (customer.phone) {
      window.open(`tel:${customer.phone}`, '_self')
    } else {
      toast.error('Cliente no tiene teléfono registrado')
    }
  }

  const handleEmailContact = () => {
    if (customer.email) {
      window.open(`mailto:${customer.email}`, '_self')
    } else {
      toast.error('Cliente no tiene email registrado')
    }
  }

  const handleCreateReservation = () => {
    // Redirect to create reservation with customer pre-filled
    const url = `/dashboard/reservaciones/nueva?customerId=${customer.id}&customerEmail=${customer.email}`
    window.open(url, '_blank')
  }

  const handleShareProfile = async () => {
    try {
      const profileUrl = `${window.location.origin}/dashboard/clientes/${customer.id}`
      await navigator.clipboard.writeText(profileUrl)
      toast.success('Enlace copiado al portapapeles')
    } catch (error) {
      toast.error('Error al copiar enlace')
    }
  }

  const quickActions = [
    {
      label: 'Nueva Reserva',
      icon: Calendar,
      onClick: handleCreateReservation,
      variant: 'default' as const,
      description: 'Crear nueva reserva para este cliente'
    },
    {
      label: 'Enviar Email',
      icon: Mail,
      onClick: handleEmailContact,
      variant: 'outline' as const,
      description: 'Enviar email al cliente',
      disabled: !customer.email
    },
    {
      label: 'Llamar',
      icon: Phone,
      onClick: handlePhoneCall,
      variant: 'outline' as const,
      description: 'Llamar al cliente',
      disabled: !customer.phone
    },
    {
      label: 'Ver Reservas',
      icon: Eye,
      onClick: onViewReservations,
      variant: 'outline' as const,
      description: 'Ver historial de reservas'
    }
  ]

  const adminActions = [
    {
      label: customer.isVip ? 'Quitar VIP' : 'Hacer VIP',
      icon: Crown,
      onClick: handleVipToggle,
      variant: customer.isVip ? 'destructive' : 'default' as const,
      loading: isTogglingVip,
      description: customer.isVip ? 'Remover estado VIP' : 'Otorgar estado VIP'
    },
    {
      label: 'Exportar Datos',
      icon: Download,
      onClick: handleExportData,
      variant: 'outline' as const,
      loading: isExporting,
      description: 'Descargar datos del cliente (GDPR)'
    },
    {
      label: 'Compartir Perfil',
      icon: Share2,
      onClick: handleShareProfile,
      variant: 'outline' as const,
      description: 'Copiar enlace del perfil'
    }
  ]

  const ActionButton = ({
    action,
    size = 'default'
  }: {
    action: any
    size?: 'sm' | 'default'
  }) => (
    <Button
      variant={action.variant}
      size={size}
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      className="w-full justify-start"
      title={action.description}
    >
      {action.loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : (
        <action.icon className="h-4 w-4 mr-2" />
      )}
      {action.label}
    </Button>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-green-600" />
          Acciones del Cliente
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div>
              <div className="font-medium text-sm">Estado del Cliente</div>
              <div className="text-xs text-muted-foreground">
                {customer.isVip ? 'Cliente VIP' : 'Cliente Regular'} •
                {customer.totalVisits} visitas •
                €{customer.totalSpent} gastado
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {customer.isVip && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Crown className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            )}
            {customer.emailConsent && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <Mail className="h-3 w-3 mr-1" />
                Email OK
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Acciones Rápidas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <ActionButton key={index} action={action} size="sm" />
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium text-foreground">Administración</h4>
          <div className="space-y-2">
            {adminActions.map((action, index) => (
              <ActionButton key={index} action={action} />
            ))}
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium text-foreground">Preferencias de Comunicación</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">Email Marketing</div>
                <div className={`text-xs ${customer.emailConsent ? 'text-green-600' : 'text-red-600'}`}>
                  {customer.emailConsent ? 'Aceptado' : 'No aceptado'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">SMS Marketing</div>
                <div className={`text-xs ${customer.smsConsent ? 'text-green-600' : 'text-red-600'}`}>
                  {customer.smsConsent ? 'Aceptado' : 'No aceptado'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Actions */}
        {customer.isVip && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Acciones VIP</span>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Gift className="h-3 w-3 mr-2" />
                Enviar Oferta Especial
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-3 w-3 mr-2" />
                Mesa Preferencial
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <div>Última visita: {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('es-ES') : 'Nunca'}</div>
          <div>Tamaño promedio mesa: {customer.averagePartySize} personas</div>
          <div>Cliente desde: {new Date(customer.createdAt).toLocaleDateString('es-ES')}</div>
        </div>
      </CardContent>
    </Card>
  )
}