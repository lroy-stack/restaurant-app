'use client'
import { getSupabaseHeaders } from '@/lib/supabase/config'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTableStore } from '@/stores/useTableStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ZoneToggle } from '@/components/ui/zone-toggle'
import { QRViewerModal } from './qr-viewer-modal'
import { toast } from 'sonner'
import {
  Plus,
  Settings,
  Trash2,
  Edit2,
  QrCode,
  MapPin,
  Users,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'

// REAL Enigma location options
const ENIGMA_LOCATION_OPTIONS = [
  { value: 'TERRACE_1', label: 'Terraza 1' },
  { value: 'MAIN_ROOM', label: 'Sala Principal' },
  { value: 'VIP_ROOM', label: 'Sala VIP' },
  { value: 'TERRACE_2', label: 'Terraza 2' }
]

// Standard capacity options for restaurant tables
const CAPACITY_OPTIONS = [2, 4, 6, 8, 10, 12]

interface TableData {
  id: string
  number: string
  capacity: number
  location: keyof typeof ENIGMA_LOCATION_OPTIONS
  qrCode: string
  isActive: boolean
  is_public?: boolean
  restaurantId: string
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance'
}

interface TableConfigurationProps {
  tables: TableData[]
  onRefresh?: () => Promise<void>
}

interface TableFormData {
  number: string
  capacity: number
  location: string
  isActive: boolean
  is_public: boolean // Controls visibility in public web form
}

// Table configuration card component
function TableConfigCard({
  tableId,
  onEdit,
  onDelete,
  onToggleActive,
  onTogglePublic
}: {
  tableId: string
  onEdit: (table: TableData) => void
  onDelete: (tableId: string) => void
  onToggleActive: (tableId: string, isActive: boolean) => void
  onTogglePublic: (tableId: string, isPublic: boolean) => void
}) {
  // GET FRESH DATA from store - NO STALE PROPS
  const table = useTableStore(state => state.tables.find(t => t.id === tableId))

  const [isUpdatingActive, setIsUpdatingActive] = useState(false)
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  // Handle case where table not found in store yet
  if (!table) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-4 text-center text-muted-foreground">
          Cargando mesa...
        </CardContent>
      </Card>
    )
  }

  const locationLabel = ENIGMA_LOCATION_OPTIONS.find(opt => opt.value === table.location)?.label || table.location

  const handleToggleActive = async () => {
    setIsUpdatingActive(true)
    try {
      await onToggleActive(table.id, !table.isActive)
    } finally {
      setIsUpdatingActive(false)
    }
  }

  const handleTogglePublic = async () => {
    if (!table.isActive) {
      toast.error('Activa la mesa primero antes de cambiar visibilidad')
      return
    }
    setIsUpdatingPublic(true)
    try {
      await onTogglePublic(table.id, !table.is_public)
    } finally {
      setIsUpdatingPublic(false)
    }
  }

  return (
    <Card className={`${table.isActive ? '' : 'opacity-60 bg-muted/30'} hover:shadow-md transition-shadow`}>
      <CardContent className="p-3 space-y-2">
        {/* Header Compacto */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Mesa {table.number}</h3>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{table.capacity}</span>
          </div>
        </div>

        {/* Toggles Compactos */}
        <div className="flex gap-1.5">
          {/* Active Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
            disabled={isUpdatingActive}
            className={`flex-1 h-7 px-2 text-[10px] font-medium ${
              table.isActive ? 'border-chart-2 bg-chart-2/10 text-chart-2' : 'border-muted text-muted-foreground'
            }`}
            title={table.isActive ? 'Mesa activa' : 'Mesa inactiva'}
          >
            {isUpdatingActive ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : table.isActive ? (
              <ToggleRight className="w-3 h-3" />
            ) : (
              <ToggleLeft className="w-3 h-3" />
            )}
          </Button>

          {/* Public Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePublic}
            disabled={!table.isActive || isUpdatingPublic}
            className={`flex-1 h-7 px-2 text-[10px] font-medium ${
              table.is_public
                ? 'border-chart-1 bg-chart-1/10 text-chart-1'
                : 'border-accent bg-accent/10 text-accent-foreground'
            } ${!table.isActive ? 'opacity-40' : ''}`}
            title={table.is_public ? 'Pública en web' : 'Solo personal'}
          >
            {isUpdatingPublic ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : table.is_public ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </Button>
        </div>

        {/* Estado */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Estado:</span>
          <Badge variant={
            !table.isActive ? 'secondary' :
            table.currentStatus === 'available' ? 'default' :
            table.currentStatus === 'occupied' ? 'destructive' : 'outline'
          } className="h-4 text-[10px] px-1.5">
            {!table.isActive ? 'Cerrada' :
             table.currentStatus === 'available' ? 'Libre' :
             table.currentStatus === 'reserved' ? 'Reserv' :
             table.currentStatus === 'occupied' ? 'Ocup' : 'Libre'}
          </Badge>
        </div>

        {/* Acciones */}
        <div className="flex gap-1 pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQRModal(true)}
            disabled={!table.isActive}
            className="flex-1 h-7 px-1 text-[10px]"
            title="Ver código QR"
          >
            <QrCode className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(table)}
            className="flex-1 h-7 px-1 text-[10px]"
            title="Editar mesa"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-1.5" title="Eliminar mesa">
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar Mesa {table.number}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. La mesa se eliminará permanentemente del sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(table.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* QR Viewer Modal */}
        <QRViewerModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          table={table}
        />
      </CardContent>
    </Card>
  )
}

// Create/Edit table dialog
function TableFormDialog({
  table,
  isOpen,
  onClose,
  onSave
}: {
  table?: TableData
  isOpen: boolean
  onClose: () => void
  onSave: (data: TableFormData) => Promise<void>
}) {
  const [formData, setFormData] = useState<TableFormData>({
    number: table?.number || '',
    capacity: table?.capacity || 2,
    location: table?.location || 'TERRACE_1',
    isActive: table?.isActive ?? true,
    is_public: table?.is_public ?? true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        isActive: table.isActive,
        is_public: table.is_public ?? true
      })
    } else {
      setFormData({
        number: '',
        capacity: 2,
        location: 'TERRACE_1',
        isActive: true,
        is_public: true
      })
    }
    setErrors({})
  }, [table, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.number.trim()) {
      newErrors.number = 'Número de mesa requerido'
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.number)) {
      newErrors.number = 'Solo letras y números permitidos'
    }

    if (formData.capacity < 1 || formData.capacity > 20) {
      newErrors.capacity = 'Capacidad debe estar entre 1 y 20'
    }

    if (!formData.location) {
      newErrors.location = 'Ubicación requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving table:', error)
      toast.error('Error al guardar la mesa')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {table ? `Editar Mesa ${table.number}` : 'Crear Nueva Mesa'}
          </DialogTitle>
          <DialogDescription>
            {table 
              ? 'Modifica la configuración de la mesa existente.'
              : 'Configura una nueva mesa para el restaurante Enigma.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Table Number */}
          <div className="space-y-2">
            <Label htmlFor="number">Número de Mesa *</Label>
            <Input
              id="number"
              placeholder="T1, S5, VIP1, etc."
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value.toUpperCase() }))}
              className={errors.number ? 'border-destructive' : ''}
            />
            {errors.number && (
              <p className="text-sm text-destructive">{errors.number}</p>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidad (personas) *</Label>
            <Select 
              value={formData.capacity.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, capacity: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAPACITY_OPTIONS.map(capacity => (
                  <SelectItem key={capacity} value={capacity.toString()}>
                    {capacity} personas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.capacity && (
              <p className="text-sm text-destructive">{errors.capacity}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENIGMA_LOCATION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado de la Mesa</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className="flex items-center gap-2 justify-start"
              >
                {formData.isActive ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-chart-2" />
                    Mesa Activa (Uso Interno)
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                    Mesa Inactiva (Temporalmente Cerrada)
                  </>
                )}
              </Button>

              {/* Public Visibility Toggle - Only available when table is active */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
                className="flex items-center gap-2 justify-start"
                disabled={!formData.isActive}
              >
                {formData.is_public ? (
                  <>
                    <Eye className="w-4 h-4 text-chart-1" />
                    Visible en Web Pública
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 text-accent" />
                    Solo Personal (Mesa Comodín)
                  </>
                )}
              </Button>

              {/* Help text */}
              <p className="text-xs text-muted-foreground">
                {!formData.isActive
                  ? "Mesa temporalmente cerrada (no disponible para nadie)"
                  : formData.is_public
                    ? "Esta mesa aparece en el formulario web público"
                    : "Esta mesa solo es visible para el personal (ideal para mesas comodín como S9, S10)"}
              </p>
            </div>
          </div>

          {/* QR Code Preview */}
          {formData.number && formData.location && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <QrCode className="w-4 h-4" />
                <span>Código QR: QR_{formData.number}_{formData.location.split('_')[1] || formData.location}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {table ? 'Actualizar' : 'Crear Mesa'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TableConfiguration({ tables, onRefresh }: TableConfigurationProps) {
  const router = useRouter()
  const {
    tables: storeTables,
    loading,
    loadTables,
    toggleTable,
    toggleZone
  } = useTableStore()

  const [selectedTable, setSelectedTable] = useState<TableData | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [zoneLoadingStates, setZoneLoadingStates] = useState<Record<string, boolean>>({})

  // Load tables on mount - SINGLE SOURCE OF TRUTH
  useEffect(() => {
    loadTables()
  }, [])

  // Use store tables, fallback to props for SSR
  const activeTables = storeTables.length > 0 ? storeTables : tables

  // Filter tables - SINGLE SOURCE
  const filteredTables = activeTables.filter(table => {
    const matchesLocation = locationFilter === 'all' || table.location === locationFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && table.isActive) ||
      (statusFilter === 'inactive' && !table.isActive)

    return matchesLocation && matchesStatus
  })

  const handleCreateTable = () => {
    setSelectedTable(undefined)
    setIsDialogOpen(true)
  }

  const handleEditTable = (table: TableData) => {
    setSelectedTable(table)
    setIsDialogOpen(true)
  }

  const handleSaveTable = async (formData: TableFormData) => {
    const method = selectedTable ? 'PATCH' : 'POST'
    const url = selectedTable ? `/api/tables/${selectedTable.id}` : '/api/tables'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Schema handled by getSupabaseHeaders()
        // Schema handled by getSupabaseHeaders()
      },
      body: JSON.stringify({
        ...formData,
        restaurantId: process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001',
        qrCode: `QR_${formData.number}_${formData.location.split('_')[1] || formData.location}`
      })
    })

    if (!response.ok) {
      throw new Error('Error saving table')
    }

    toast.success(
      selectedTable
        ? `Mesa ${formData.number} actualizada correctamente`
        : `Mesa ${formData.number} creada correctamente`
    )

    // SIMPLE: Just reload store data
    await loadTables()
  }

  const handleDeleteTable = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
        headers: {
          // Schema handled by getSupabaseHeaders()
          // Schema handled by getSupabaseHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Error deleting table')
      }

      const table = activeTables.find(t => t.id === tableId)
      toast.success(`Mesa ${table?.number} eliminada correctamente`)

      // SIMPLE: Just reload store data
      await loadTables()
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error('Error al eliminar la mesa')
    }
  }

  // SIMPLE: Direct store action
  const handleToggleActive = async (tableId: string, isActive: boolean) => {
    await toggleTable(tableId, isActive)
  }

  // Toggle is_public field
  const handleTogglePublic = async (tableId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: isPublic })
      })

      if (!response.ok) {
        throw new Error('Error updating table visibility')
      }

      toast.success(isPublic ? 'Mesa ahora visible en web pública' : 'Mesa ahora solo visible para personal')

      // Reload tables
      await loadTables()
    } catch (error) {
      console.error('Error toggling public:', error)
      toast.error('Error al actualizar visibilidad')
    }
  }

  // Enhanced zone toggle with loading states
  const handleBulkToggleZone = async (location: string, activate: boolean) => {
    setZoneLoadingStates(prev => ({ ...prev, [location]: true }))
    try {
      await toggleZone(location, activate)
    } finally {
      setZoneLoadingStates(prev => ({ ...prev, [location]: false }))
    }
  }

  // Statistics - SINGLE SOURCE OF TRUTH
  const stats = {
    total: activeTables.length,
    active: activeTables.filter(t => t.isActive).length,
    inactive: activeTables.filter(t => !t.isActive).length,
    public: activeTables.filter(t => t.isActive && t.is_public).length,
    private: activeTables.filter(t => t.isActive && !t.is_public).length,
    totalCapacity: activeTables.filter(t => t.isActive).reduce((sum, t) => sum + t.capacity, 0)
  }

  // Zone statistics for toggles
  const zoneStats = ENIGMA_LOCATION_OPTIONS.map(({ value, label }) => {
    const zoneTables = activeTables.filter(t => t.location === value)
    const activeCount = zoneTables.filter(t => t.isActive).length
    const inactiveCount = zoneTables.filter(t => !t.isActive).length
    return {
      location: value,
      label,
      total: zoneTables.length,
      activeCount,
      inactiveCount,
      isActive: activeCount > 0 && inactiveCount === 0, // All tables in zone active
      hasAnyActive: activeCount > 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Mesas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {stats.total} mesas • {stats.active} activas • {stats.public} públicas • {stats.totalCapacity} personas
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Ubicaciones</SelectItem>
                  {ENIGMA_LOCATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleCreateTable}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Mesa
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Quick Stats */}
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-chart-2">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Activas</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
              <div className="text-sm text-muted-foreground">Inactivas</div>
            </div>
            <div className="text-center p-3 border-l">
              <div className="text-2xl font-bold text-chart-1">{stats.public}</div>
              <div className="text-sm text-muted-foreground">Públicas</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-accent">{stats.private}</div>
              <div className="text-sm text-muted-foreground">Privadas</div>
            </div>
            <div className="text-center p-3 border-l">
              <div className="text-2xl font-bold text-primary">{stats.totalCapacity}</div>
              <div className="text-sm text-muted-foreground">Capacidad</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Management - Modern Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Control de Zonas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Activa o desactiva todas las mesas de cada zona de forma individual
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zoneStats.map((zone) => (
              <ZoneToggle
                key={zone.location}
                label={zone.label}
                description={`${zone.total} mesas en total`}
                isActive={zone.isActive}
                isLoading={zoneLoadingStates[zone.location] || false}
                count={zone.total}
                activeCount={zone.activeCount}
                inactiveCount={zone.inactiveCount}
                onToggle={(active) => handleBulkToggleZone(zone.location, active)}
                disabled={zone.total === 0}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  ENIGMA_LOCATION_OPTIONS.forEach(({ value }) => {
                    handleBulkToggleZone(value, true)
                  })
                }}
                className="text-chart-2 hover:text-chart-2/80"
                disabled={Object.values(zoneLoadingStates).some(Boolean)}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Activar Todas las Zonas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  ENIGMA_LOCATION_OPTIONS.forEach(({ value }) => {
                    handleBulkToggleZone(value, false)
                  })
                }}
                className="text-destructive hover:text-destructive/80"
                disabled={Object.values(zoneLoadingStates).some(Boolean)}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Cerrar Todas las Zonas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid - Agrupadas por Zona */}
      {ENIGMA_LOCATION_OPTIONS.map(({ value, label }) => {
        const zoneTables = filteredTables.filter(t => t.location === value)

        if (zoneTables.length === 0) return null

        return (
          <Card key={value}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">{label}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {zoneTables.filter(t => t.isActive).length} / {zoneTables.length} activas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {zoneTables.map(table => (
                  <TableConfigCard
                    key={table.id}
                    tableId={table.id}
                    onEdit={handleEditTable}
                    onDelete={handleDeleteTable}
                    onToggleActive={handleToggleActive}
                    onTogglePublic={handleTogglePublic}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-lg font-medium text-accent mb-2">
              No hay mesas con los filtros seleccionados
            </h3>
            <p className="text-accent/80">
              Cambia los filtros o crea una nueva mesa.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <TableFormDialog
        table={selectedTable}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTable}
      />
    </div>
  )
}