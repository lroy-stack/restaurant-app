'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Star,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  UserCheck,
  User,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface CustomerCardProps {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    isVip: boolean
    totalReservations: number
    totalSpent: number
    lastVisit?: string
    loyaltyTier?: string
    gdprConsent: boolean
    marketingConsent: boolean
    emailConsent?: boolean
    createdAt: string
  }
  onStatusUpdate?: (id: string, field: string, value: any) => Promise<void>
  onGdprExport?: (customerId: string) => Promise<void>
  onGdprDelete?: (customerId: string) => Promise<void>
}

export function CustomerCard({
  customer,
  onStatusUpdate,
  onGdprExport,
  onGdprDelete
}: CustomerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleVipToggle = async () => {
    await onStatusUpdate?.(customer.id, 'isVip', !customer.isVip)
  }

  const handleGdprExport = async () => {
    await onGdprExport?.(customer.id)
  }

  const handleDeleteConfirm = async () => {
    await onGdprDelete?.(customer.id)
    setShowDeleteDialog(false)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header with Name and VIP Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">
                {customer.firstName} {customer.lastName}
              </h3>
              {customer.isVip && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                  <Star className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
                {customer.emailConsent && (
                  <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Statistics */}
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{customer.totalReservations} Reservas</span>
            </div>
            {customer.totalSpent > 0 && (
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>€{customer.totalSpent.toFixed(0)}</span>
              </div>
            )}
            {customer.loyaltyTier && (
              <Badge variant="outline" className="text-xs">
                {customer.loyaltyTier}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Last Visit Information */}
        {customer.lastVisit && (
          <div className="mb-4 p-3 bg-muted rounded text-sm">
            <p className="font-medium mb-1">Última Visita:</p>
            <p className="text-muted-foreground">
              {format(new Date(customer.lastVisit), 'dd/MM/yyyy HH:mm', { locale: es })}
            </p>
          </div>
        )}
        
        {/* GDPR Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            <span>GDPR:</span>
            {customer.gdprConsent ? (
              <Badge variant="default" className="text-xs px-2 py-0">OK</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs px-2 py-0">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Pendiente
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1">
            {customer.emailConsent && (
              <Badge variant="outline" className="text-xs px-2 py-0">E-mail</Badge>
            )}
            {customer.marketingConsent && (
              <Badge variant="outline" className="text-xs px-2 py-0">Marketing</Badge>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/clientes/${customer.id}`}>
                <User className="h-4 w-4 mr-2" />
                Ver Perfil
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/reservaciones/nueva?customerId=${customer.id}`}>
                <Calendar className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Link>
            </Button>
          </div>
          
          {/* VIP Toggle */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={customer.isVip ? "default" : "outline"}
              onClick={handleVipToggle}
              className="flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              {customer.isVip ? 'Quitar VIP' : 'Hacer VIP'}
            </Button>
          </div>
          
          {/* GDPR Controls */}
          <div className="flex gap-2 text-xs">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleGdprExport}
              className="flex-1 text-xs"
            >
              Exportar Datos
            </Button>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar Datos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <AlertDialogTitle className="text-red-900 dark:text-red-100">
                        ⚠️ Eliminación COMPLETA del Cliente
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-red-700 dark:text-red-300">
                        Esta acción es IRREVERSIBLE
                      </AlertDialogDescription>
                    </div>
                  </div>
                </AlertDialogHeader>

                <div className="space-y-3">
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                      Se eliminará PERMANENTEMENTE:
                    </p>
                    <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                      <li>• Registro completo del cliente</li>
                      <li>• Todas sus reservas ({customer.totalReservations})</li>
                      <li>• Políticas GDPR y consentimientos</li>
                      <li>• Historial completo de actividad</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Cliente:</strong> {customer.firstName} {customer.lastName}<br/>
                    <strong>Email:</strong> {customer.email}<br/>
                    <strong>Reservas:</strong> {customer.totalReservations} | <strong>Gastado:</strong> €{customer.totalSpent}
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    🗑️ Eliminar COMPLETAMENTE
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Creation Date */}
        <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
          Cliente desde: {format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: es })}
        </div>
      </CardContent>
    </Card>
  )
}