'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Wine,
  Plus,
  BarChart3,
  UtensilsCrossed,
  RefreshCw,
  AlertTriangle,
  Trophy,
  TrendingUp,
  ChefHat
} from 'lucide-react'
import { toast } from 'sonner'
import { useWinePairings } from '../hooks/use-wine-pairings'
import { WinePairingForm } from './forms/wine-pairing-form'
import { WinePairingDataGrid } from './wine-pairing-data-grid'
import type { WinePairingWithItems } from '../schemas/wine-pairing.schema'

// Statistics card component
interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'default' | 'blue' | 'purple' | 'green' | 'orange'
}

function StatCard({ title, value, description, icon: Icon, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'border-border',
    blue: 'border-[#237584]/30 bg-[#237584]/10',
    purple: 'border-[#CB5910]/30 bg-[#CB5910]/10',
    green: 'border-[#9FB289]/30 bg-[#9FB289]/10',
    orange: 'border-[#CB5910]/30 bg-[#CB5910]/10'
  }

  const iconColors = {
    default: 'text-muted-foreground',
    blue: 'text-[#237584]',
    purple: 'text-[#CB5910]',
    green: 'text-[#9FB289]',
    orange: 'text-[#CB5910]'
  }

  return (
    <Card className={colorClasses[color]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColors[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function WinePairingsTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPairing, setSelectedPairing] = useState<WinePairingWithItems | null>(null)

  // Wine pairings data and operations
  const {
    pairings,
    summary,
    loading,
    error,
    refetch,
    deletePairing
  } = useWinePairings()

  // Handle form success
  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    refetch()
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setSelectedPairing(null)
    refetch()
  }

  // Handle refresh
  const handleRefresh = async () => {
    await refetch()
    toast.success('Maridajes actualizados')
  }

  // Handle pairing actions
  const handleViewPairing = (pairing: WinePairingWithItems) => {
    setSelectedPairing(pairing)
    setShowViewDialog(true)
  }

  const handleEditPairing = (pairing: WinePairingWithItems) => {
    setSelectedPairing(pairing)
    setShowEditDialog(true)
  }

  const handleDeleteClick = (pairing: WinePairingWithItems) => {
    setSelectedPairing(pairing)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedPairing) return

    const success = await deletePairing(selectedPairing.id)
    if (success) {
      setShowDeleteDialog(false)
      setSelectedPairing(null)
    }
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-destructive mb-2">
              Error al cargar maridajes
            </h3>
            <p className="text-destructive/80 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gestión de Maridajes
          </h2>
          <p className="text-muted-foreground">
            Administrar maridajes entre platos y vinos de la carta
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Maridaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Maridaje</DialogTitle>
                <DialogDescription>
                  Crea un maridaje profesional entre un plato y un vino de la carta
                </DialogDescription>
              </DialogHeader>
              <WinePairingForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Maridajes"
            value={summary.totalPairings}
            description="Combinaciones creadas"
            icon={Wine}
            color="purple"
          />
          <StatCard
            title="Platos Maridados"
            value={summary.uniqueFoodItems}
            description="Elementos con maridaje"
            icon={UtensilsCrossed}
            color="green"
          />
          <StatCard
            title="Vinos Utilizados"
            value={summary.uniqueWineItems}
            description="Selecciones disponibles"
            icon={Trophy}
            color="orange"
          />
          <StatCard
            title="Promedio por Plato"
            value={summary.averagePairingsPerFood.toFixed(1)}
            description="Maridajes por elemento"
            icon={TrendingUp}
            color="blue"
          />
        </div>
      )}


      {/* Main Data Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wine className="w-5 h-5" />
            Maridajes Configurados
          </CardTitle>
          <CardDescription>
            Lista completa de maridajes entre platos y vinos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WinePairingDataGrid
            pairings={pairings}
            loading={loading}
            onViewPairing={handleViewPairing}
            onEditPairing={handleEditPairing}
            onDeletePairing={handleDeleteClick}
          />
        </CardContent>
      </Card>

      {/* View Pairing Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Maridaje</DialogTitle>
            <DialogDescription>
              Información completa del maridaje seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedPairing && (
            <div className="space-y-6">
              {/* Pairing Header */}
              <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-[#9FB289]/10 to-[#CB5910]/10 rounded-lg border">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-[#9FB289]" />
                  <span className="font-semibold text-lg">{selectedPairing.foodItem.name}</span>
                </div>
                <div className="text-muted-foreground text-xl">+</div>
                <div className="flex items-center gap-2">
                  <Wine className="w-5 h-5 text-[#CB5910]" />
                  <span className="font-semibold text-lg">{selectedPairing.wineItem.name}</span>
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#9FB289]/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Plato</p>
                  <p className="font-medium text-[#9FB289]">{selectedPairing.foodItem.category?.name}</p>
                </div>
                <div className="text-center p-3 bg-[#CB5910]/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Vino</p>
                  <p className="font-medium text-[#CB5910]">{selectedPairing.wineItem.category?.name}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Descripción del Sommelier
                </h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">{selectedPairing.description}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Pairing Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Maridaje</DialogTitle>
            <DialogDescription>
              Modificar la descripción del maridaje seleccionado
            </DialogDescription>
          </DialogHeader>
          <WinePairingForm
            initialData={selectedPairing}
            mode="edit"
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar maridaje?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPairing && (
                <>
                  Esta acción eliminará permanentemente el maridaje entre{' '}
                  <strong>&quot;{selectedPairing.foodItem.name}&quot;</strong> y{' '}
                  <strong>&quot;{selectedPairing.wineItem.name}&quot;</strong>.
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar Maridaje
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}