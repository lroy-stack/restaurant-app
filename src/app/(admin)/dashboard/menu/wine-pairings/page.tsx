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
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { useWinePairings } from '../hooks/use-wine-pairings'
import { WinePairingForm } from '../components/forms/wine-pairing-form'
import { WinePairingDataGrid } from '../components/wine-pairing-data-grid'
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
    default: 'border-gray-200',
    blue: 'border-blue-200 bg-blue-50/50',
    purple: 'border-purple-200 bg-purple-50/50',
    green: 'border-green-200 bg-green-50/50',
    orange: 'border-orange-200 bg-orange-50/50'
  }

  const iconColors = {
    default: 'text-gray-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
    orange: 'text-orange-500'
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

export default function WinePairingsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
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

  // Handle refresh
  const handleRefresh = async () => {
    await refetch()
    toast.success('Maridajes actualizados')
  }

  // Handle pairing actions
  const handleViewPairing = (pairing: WinePairingWithItems) => {
    console.log('View pairing:', pairing)
    // TODO: Open view modal
    toast.info(`Viendo maridaje: ${pairing.foodItem.name} + ${pairing.wineItem.name}`)
  }

  const handleEditPairing = (pairing: WinePairingWithItems) => {
    console.log('Edit pairing:', pairing)
    // TODO: Open edit modal
    toast.info(`Editar maridaje: ${pairing.foodItem.name} + ${pairing.wineItem.name}`)
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Maridajes
            </h1>
            <p className="text-gray-600">
              Administrar maridajes entre platos y vinos de la carta
            </p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error al cargar maridajes
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
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
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Maridajes
          </h1>
          <p className="text-gray-600">
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
            <DialogContent className="max-w-3xl">
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

      {/* Pairing Performance Insight */}
      {summary && summary.totalPairings > 0 && (
        <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Análisis de Maridajes
            </CardTitle>
            <CardDescription>
              Estado actual del programa de maridajes del restaurante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((summary.uniqueFoodItems / (summary.uniqueFoodItems + summary.uniqueWineItems)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Cobertura de platos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.averagePairingsPerWine.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Maridajes por vino</div>
              </div>
              <div className="text-center">
                <Badge variant={summary.totalPairings >= 10 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                  {summary.totalPairings >= 10 ? 'Excelente' : summary.totalPairings >= 5 ? 'Bueno' : 'Inicial'}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Estado del programa</div>
              </div>
            </div>
          </CardContent>
        </Card>
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
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Maridaje
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}