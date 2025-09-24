'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tags,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Search,
  RefreshCw,
  UtensilsCrossed,
  Wine,
  Coffee
} from 'lucide-react'
import { toast } from 'sonner'
import { useCategories } from '../hooks/use-categories'
import { CategoryForm } from './forms/category-form'
import { CategoryWithStats } from '../schemas/category.schema'

interface CategoryManagerProps {
  onCategorySelect?: (category: CategoryWithStats) => void
}

export function CategoryManager({ onCategorySelect }: CategoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithStats | null>(null)
  const [selectedType, setSelectedType] = useState<'FOOD' | 'WINE' | 'BEVERAGE' | null>(null)

  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch
  } = useCategories()

  // Filter categories based on search and type
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType ? category.type === selectedType : true

    return matchesSearch && matchesType
  })

  // Group categories by type for stats
  const categoriesByType = categories.reduce((acc, category) => {
    acc[category.type] = (acc[category.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleCreateCategory = () => {
    setShowCreateDialog(true)
  }

  const handleEditCategory = (category: CategoryWithStats) => {
    setEditingCategory(category)
    setShowEditDialog(true)
  }

  const handleDeleteCategory = async (category: CategoryWithStats) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      const success = await deleteCategory(category.id)
      if (success) {
        toast.success(`Categoría "${category.name}" eliminada exitosamente`)
      }
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    refetch()
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditingCategory(null)
    refetch()
  }

  const getCategoryTypeIcon = (type: string) => {
    switch (type) {
      case 'FOOD':
        return <UtensilsCrossed className="w-4 h-4 text-[#9FB289]" />
      case 'WINE':
        return <Wine className="w-4 h-4 text-[#CB5910]" />
      case 'BEVERAGE':
        return <Coffee className="w-4 h-4 text-[#237584]/70" />
      default:
        return <Tags className="w-4 h-4" />
    }
  }

  const getCategoryTypeBadge = (type: string) => {
    const config = {
      FOOD: { label: 'Comida', className: 'bg-[#9FB289]/10 text-[#9FB289] border-[#9FB289]/30' },
      WINE: { label: 'Vino', className: 'bg-[#CB5910]/10 text-[#CB5910] border-[#CB5910]/30' },
      BEVERAGE: { label: 'Bebida', className: 'bg-[#237584]/10 text-[#237584]/70 border-[#237584]/30' }
    }

    const typeConfig = config[type as keyof typeof config] || { label: type, className: 'bg-muted/20 text-muted-foreground border-muted' }

    return (
      <Badge variant="outline" className={typeConfig.className}>
        {typeConfig.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categorías</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Tags className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comida</p>
                <p className="text-2xl font-bold">{categoriesByType.FOOD || 0}</p>
              </div>
              <UtensilsCrossed className="w-8 h-8 text-[#9FB289]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vinos</p>
                <p className="text-2xl font-bold">{categoriesByType.WINE || 0}</p>
              </div>
              <Wine className="w-8 h-8 text-[#CB5910]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bebidas</p>
                <p className="text-2xl font-bold">{categoriesByType.BEVERAGE || 0}</p>
              </div>
              <Coffee className="w-8 h-8 text-[#237584]/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tags className="w-4 h-4 mr-2" />
                {selectedType ? selectedType : 'Todos los tipos'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={selectedType === null}
                onCheckedChange={() => setSelectedType(null)}
              >
                Todos los tipos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedType === 'FOOD'}
                onCheckedChange={() => setSelectedType(selectedType === 'FOOD' ? null : 'FOOD')}
              >
                Comida
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedType === 'WINE'}
                onCheckedChange={() => setSelectedType(selectedType === 'WINE' ? null : 'WINE')}
              >
                Vino
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedType === 'BEVERAGE'}
                onCheckedChange={() => setSelectedType(selectedType === 'BEVERAGE' ? null : 'BEVERAGE')}
              >
                Bebidas
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleCreateCategory} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Categorías del Menú
            <Badge variant="secondary" className="ml-auto">
              {filteredCategories.length} de {categories.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Elementos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow
                      key={category.id}
                      className={onCategorySelect ? "cursor-pointer hover:bg-muted/50" : ""}
                      onClick={onCategorySelect ? () => onCategorySelect(category) : undefined}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getCategoryTypeIcon(category.type)}
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.nameEn && (
                              <p className="text-sm text-muted-foreground">{category.nameEn}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryTypeBadge(category.type)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {category.description ? (
                            <p className="text-sm text-muted-foreground truncate">
                              {category.description}
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin descripción</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.itemCount || 0} elementos
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuCheckboxItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditCategory(category)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Editar categoría
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteCategory(category)
                              }}
                              className="cursor-pointer text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar categoría
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron categorías.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Categoría del Menú</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Categoría del Menú</DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={editingCategory}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditDialog(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}