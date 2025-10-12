'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { useTableStore } from '@/stores/useTableStore'
import { QRViewerModal } from '../qr-viewer-modal'
import { OrderPanel } from './OrderPanel'
import {
  MapPin,
  Users,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle,
  Settings,
  QrCode,
  ExternalLink,
  Edit3,
  Save,
  X,
  ChefHat,
  CreditCard,
  Timer,
  Eye,
  Activity,
  Wifi,
  Smartphone,
  Calendar,
  MessageSquare,
  Star,
  UserCheck,
  Utensils,
  ShoppingCart
} from 'lucide-react'
import { ModalProps, ENIGMA_ZONES, STATUS_COLORS } from './types/mesa.types'

export function Modal({ isOpen, onClose, table }: ModalProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(table?.currentStatus || 'available')
  const [statusNotes, setStatusNotes] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [showOrderPanel, setShowOrderPanel] = useState(false)
  const [hasActiveOrders, setHasActiveOrders] = useState(false)
  const [orderCount, setOrderCount] = useState(0)

  const { updateTableStatus } = useTableStore()

  // Check active orders
  useEffect(() => {
    if (!table?.id || !isOpen) return

    fetch(`/api/orders/by-table/${table.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHasActiveOrders(data.count > 0)
          setOrderCount(data.count)
        }
      })
      .catch(console.error)
  }, [table?.id, isOpen])

  // ✅ DEBUG: Log modal state changes
  console.log('🎭 Modal render:', { isOpen, table: table?.number, hasTable: !!table })

  if (!table) {
    console.log('⚠️ Modal: No table provided')
    return null
  }

  const locationLabel = ENIGMA_ZONES[table.location] || table.location

  // Enhanced status configuration following OpenTable/CoverManager patterns
  const statusConfig = {
    available: {
      label: 'Disponible',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle,
      description: 'Mesa lista para nuevos clientes'
    },
    reserved: {
      label: 'Reservada',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Calendar,
      description: 'Mesa reservada para cliente confirmado'
    },
    occupied: {
      label: 'Ocupada',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: Users,
      description: 'Mesa con clientes actualmente'
    },
    maintenance: {
      label: 'Mantenimiento',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Settings,
      description: 'Mesa fuera de servicio temporalmente'
    },
    temporally_closed: {
      label: 'Cerrada',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: AlertCircle,
      description: 'Mesa desactivada por configuración'
    }
  }

  const currentStatusConfig = statusConfig[table.currentStatus]
  const StatusIcon = currentStatusConfig.icon

  // Generate secure QR URL following existing pattern
  const generateSecureQRContent = () => {
    const timestamp = Date.now().toString()
    const payload = `${table.id}:${table.location}:${timestamp}`
    const base64 = Buffer.from(payload).toString('base64')
    const secureIdentifier = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, 12)

    const secureUrl = new URL('https://menu.enigmaconalma.com')
    secureUrl.searchParams.set('mesa', table.number)
    secureUrl.searchParams.set('qr', secureIdentifier)
    secureUrl.searchParams.set('table_id', table.id)
    secureUrl.searchParams.set('location', table.location)
    secureUrl.searchParams.set('utm_source', 'qr')
    secureUrl.searchParams.set('utm_medium', 'table')
    secureUrl.searchParams.set('utm_campaign', 'restaurante')
    secureUrl.searchParams.set('timestamp', timestamp)

    return secureUrl.toString()
  }

  const qrUrl = generateSecureQRContent()

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!table || selectedStatus === table.currentStatus) {
      setIsEditingStatus(false)
      return
    }

    setIsUpdating(true)
    try {
      await updateTableStatus(
        table.id,
        selectedStatus,
        statusNotes || undefined,
        estimatedTime || undefined
      )

      toast.success(`Estado de Mesa ${table.number} actualizado`)
      setIsEditingStatus(false)
      setStatusNotes('')
      setEstimatedTime('')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar el estado')
    } finally {
      setIsUpdating(false)
    }
  }

  // Copy QR URL to clipboard
  const copyQRUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      toast.success('URL del QR copiada al portapapeles')
    } catch (error) {
      toast.error('Error al copiar la URL')
    }
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{ backgroundColor: STATUS_COLORS[table.currentStatus] }}
              />
              Mesa {table.number}
            </div>
            <Badge className={`${currentStatusConfig.color} border`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {currentStatusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Table Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Información de la Mesa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{locationLabel}</p>
                    <p className="text-xs text-muted-foreground">Ubicación</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{table.capacity} personas</p>
                    <p className="text-xs text-muted-foreground">Capacidad</p>
                  </div>
                </div>
              </div>

              {/* Activity Status */}
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado de Actividad</span>
                  <Badge variant={table.isActive ? "default" : "secondary"}>
                    {table.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Reservation (if exists) */}
          {table.currentReservation && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reserva Actual
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{table.currentReservation.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {table.currentReservation.partySize} persona{table.currentReservation.partySize !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {table.currentReservation.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {table.currentReservation.time}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Status Change - Direct Buttons */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Gestión Rápida de Mesa</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={table.currentStatus === 'available' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={async () => {
                    setIsUpdating(true)
                    try {
                      await updateTableStatus(table.id, 'available')
                      toast.success('Mesa liberada')
                    } catch (error) {
                      toast.error('Error al liberar mesa')
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={!table.isActive || isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Liberar
                </Button>
                <Button
                  variant={table.currentStatus === 'occupied' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={async () => {
                    setIsUpdating(true)
                    try {
                      await updateTableStatus(table.id, 'occupied')
                      toast.success('Mesa ocupada')
                    } catch (error) {
                      toast.error('Error al ocupar mesa')
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={!table.isActive || isUpdating}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ocupar
                </Button>
                <Button
                  variant={table.currentStatus === 'maintenance' ? 'default' : 'outline'}
                  className="justify-start col-span-2"
                  onClick={async () => {
                    setIsUpdating(true)
                    try {
                      await updateTableStatus(table.id, 'maintenance')
                      toast.success('Mesa en mantenimiento')
                    } catch (error) {
                      toast.error('Error al cambiar estado')
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={!table.isActive || isUpdating}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Mantenimiento
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Management - If reservation exists */}
          {table.currentReservation && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Gestión de Reserva</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="default"
                    className="justify-start bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      setIsUpdating(true)
                      try {
                        const response = await fetch(`/api/reservations/${table.currentReservation.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'SEATED' })
                        })
                        if (response.ok) {
                          toast.success('Cliente sentado')
                          // Refresh tables to update UI
                          window.location.reload()
                        } else {
                          toast.error('Error al sentar cliente')
                        }
                      } catch (error) {
                        toast.error('Error de conexión')
                      } finally {
                        setIsUpdating(false)
                      }
                    }}
                    disabled={isUpdating}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Sentar
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start border-orange-500 text-orange-600"
                    onClick={async () => {
                      setIsUpdating(true)
                      try {
                        const response = await fetch(`/api/reservations/${table.currentReservation.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'NO_SHOW' })
                        })
                        if (response.ok) {
                          toast.success('Marcado como No Show')
                          window.location.reload()
                        } else {
                          toast.error('Error al marcar No Show')
                        }
                      } catch (error) {
                        toast.error('Error de conexión')
                      } finally {
                        setIsUpdating(false)
                      }
                    }}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    No Show
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start col-span-2"
                    onClick={async () => {
                      setIsUpdating(true)
                      try {
                        const response = await fetch(`/api/reservations/${table.currentReservation.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'COMPLETED' })
                        })
                        if (response.ok) {
                          toast.success('Reserva completada')
                          window.location.reload()
                        } else {
                          toast.error('Error al completar')
                        }
                      } catch (error) {
                        toast.error('Error de conexión')
                      } finally {
                        setIsUpdating(false)
                      }
                    }}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comandero Actions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Acciones de Comandero</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setShowOrderPanel(true)}
                  disabled={!hasActiveOrders}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Ver Comanda
                  {hasActiveOrders && (
                    <Badge className="ml-2 bg-red-500 text-white">{orderCount}</Badge>
                  )}
                </Button>
                <Button variant="outline" className="justify-start" disabled>
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar Cliente
                </Button>
              </div>
              {!hasActiveOrders && (
                <p className="text-xs text-muted-foreground mt-3">
                  No hay pedidos activos
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-medium">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(qrUrl, '_blank')}
                className="justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Carta Digital
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsQRModalOpen(true)}
                className="justify-start"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Ver Código QR
              </Button>
            </div>
          </div>

          {/* Position Information (for debugging/admin) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  Debug Info
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Position</p>
                    <p className="font-mono">
                      x: {Math.round(table.position.x)}, y: {Math.round(table.position.y)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-mono">
                      {table.dimensions.width} × {table.dimensions.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rotation</p>
                    <p className="font-mono">{table.rotation}°</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Table ID</p>
                    <p className="font-mono text-xs">{table.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* QR Viewer Modal Integration */}
    <QRViewerModal
      isOpen={isQRModalOpen}
      onClose={() => setIsQRModalOpen(false)}
      table={table ? {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        qrCode: qrUrl, // Use generated QR URL
        isActive: table.isActive
      } : undefined}
    />

    {/* Order Panel */}
    <OrderPanel
      tableId={table.id}
      tableNumber={table.number}
      isOpen={showOrderPanel}
      onClose={() => setShowOrderPanel(false)}
    />
  </>
  )
}