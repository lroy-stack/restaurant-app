'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  UtensilsCrossed,
  RefreshCw,
  Plus,
  Filter,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { useMenuItems } from './hooks/use-menu-items'
import { useCategories } from './hooks/use-categories'
import { MenuTabs } from './components/menu-tabs'
import { MenuItemWithAllergens } from './schemas/menu-item.schema'
import { CategoryForm } from './components/forms/category-form'
import { WorkingMenuItemForm } from './components/forms/working-menu-item-form'

export default function MenuPage() {
  const searchParams = useSearchParams()
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [editingItem, setEditingItem] = useState<MenuItemWithAllergens | null>(null)

  // Extract filters from URL params
  const filters = {
    categoryId: searchParams.get('categoryId') || undefined,
    search: searchParams.get('search') || undefined,
    isAvailable: searchParams.get('isAvailable') || undefined,
    type: searchParams.get('type') as 'FOOD' | 'WINE' | 'BEVERAGE' || undefined,
  }

  // Use hooks for data management
  const {
    menuItems,
    summary,
    loading,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability
  } = useMenuItems(filters)

  const {
    categories,
    loading: categoriesLoading
  } = useCategories()


  const handleRefresh = async () => {
    await refetch()
    toast.success('Menú actualizado')
  }

  const handleCreateItem = (preselectedCategoryId?: string) => {
    setSelectedCategoryId(preselectedCategoryId)
    setShowItemForm(true)
  }

  const handleCreateCategory = () => {
    setShowCategoryForm(true)
  }

  const handleCategoryFormSuccess = () => {
    setShowCategoryForm(false)
    refetch() // Refresh categories
  }

  const handleItemFormSuccess = () => {
    setShowItemForm(false)
    setSelectedCategoryId(undefined)
    refetch() // Refresh menu items
  }

  const handleEditFormSuccess = () => {
    setShowEditForm(false)
    setEditingItem(null)
    refetch() // Refresh menu items
  }

  const handleItemEdit = (item: MenuItemWithAllergens) => {
    setEditingItem(item)
    setShowEditForm(true)
  }

  const handleItemDelete = async (item: MenuItemWithAllergens) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.name}"?`)) {
      const success = await deleteItem(item.id)
      if (success) {
        toast.success(`Elemento "${item.name}" eliminado exitosamente`)
      }
    }
  }

  const handleToggleAvailability = async (itemId: string, isAvailable: boolean) => {
    const success = await toggleAvailability(itemId, isAvailable)
    if (success) {
      toast.success(`Disponibilidad actualizada`)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Menú
            </h1>
            <p className="text-muted-foreground">
              Administrar carta, categorías, alérgenos y maridajes
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-destructive/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-destructive mb-2">
              Error al cargar el menú
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Menú
          </h1>
          <p className="text-gray-600">
            Administrar carta, categorías, alérgenos y maridajes
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleCreateCategory} variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button onClick={handleCreateItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Elemento
          </Button>
        </div>
      </div>

      {/* Tabbed Menu Management Interface */}
      <MenuTabs onItemEdit={handleItemEdit} />

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Categoría del Menú</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={handleCategoryFormSuccess}
            onCancel={() => setShowCategoryForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Menu Item Form Dialog */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Elemento del Menú</DialogTitle>
          </DialogHeader>
          <WorkingMenuItemForm
            onSuccess={handleItemFormSuccess}
            onCancel={() => setShowItemForm(false)}
            preselectedCategoryId={selectedCategoryId}
          />
        </DialogContent>
      </Dialog>

      {/* Menu Item Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Elemento del Menú</DialogTitle>
          </DialogHeader>
          <WorkingMenuItemForm
            initialData={editingItem}
            onSuccess={handleEditFormSuccess}
            onCancel={() => setShowEditForm(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}