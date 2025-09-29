'use client'

import { useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Utensils,
  Wine,
  Coffee,
  X,
  Check
} from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  price: number
  isAvailable: boolean
  categoryId: string
  menu_categories: {
    name: string
    type: 'FOOD' | 'WINE' | 'BEVERAGE'
  }
  description?: string
  imageUrl?: string
}

interface ModernProductSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduct: (product: MenuItem) => void
  menuItems: MenuItem[]
  selectedProductIds?: string[]
  loadingMenuItems: boolean
  title?: string
}

interface ModernProductSelectorRef {
  // Mantener compatibilidad con implementación anterior si es necesario
}

const ModernProductSelector = forwardRef<ModernProductSelectorRef, ModernProductSelectorProps>(
  ({ isOpen, onClose, onSelectProduct, menuItems, selectedProductIds = [], loadingMenuItems, title = "Agregar Productos" }, ref) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')

    // Expose ref methods for compatibility
    useImperativeHandle(ref, () => ({}), [])

    // Filter and sort products by categories
    const { filteredItems, categoryStats } = useMemo(() => {
      const filtered = menuItems.filter(item => {
        // Search filter
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.menu_categories.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))

        // Category filter
        const matchesCategory = activeTab === 'all' ||
                               (activeTab === 'food' && item.menu_categories.type === 'FOOD') ||
                               (activeTab === 'wine' && item.menu_categories.type === 'WINE')

        // Only FOOD and WINE allowed in pre-order
        const allowedForPreOrder = item.menu_categories.type === 'FOOD' || item.menu_categories.type === 'WINE'

        return matchesSearch && matchesCategory && allowedForPreOrder && item.isAvailable
      }).sort((a, b) => {
        // Sort by category name first, then by product name
        if (a.menu_categories.name !== b.menu_categories.name) {
          return a.menu_categories.name.localeCompare(b.menu_categories.name)
        }
        return a.name.localeCompare(b.name)
      })

      // Calculate category statistics
      const stats = {
        all: menuItems.filter(item => item.isAvailable && (item.menu_categories.type === 'FOOD' || item.menu_categories.type === 'WINE')).length,
        food: menuItems.filter(item => item.isAvailable && item.menu_categories.type === 'FOOD').length,
        wine: menuItems.filter(item => item.isAvailable && item.menu_categories.type === 'WINE').length
      }

      return { filteredItems: filtered, categoryStats: stats }
    }, [menuItems, searchTerm, activeTab])

    // Handle product selection
    const handleProductSelect = (product: MenuItem) => {
      onSelectProduct(product)
      // Don't close dialog immediately - let parent handle the logic
    }

    // Get category icon
    const getCategoryIcon = (type: string) => {
      switch (type) {
        case 'WINE': return Wine
        case 'BEVERAGE': return Coffee
        default: return Utensils
      }
    }

    // Reset search when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
      if (!open) {
        setSearchTerm('')
        setActiveTab('all')
        onClose()
      }
    }

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-7xl max-h-[95vh] w-[98vw] sm:w-[95vw] lg:w-full flex flex-col">
          {/* Header: Solo título y search */}
          <DialogHeader className="flex-shrink-0 space-y-4 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl pr-8">
              <Plus className="h-5 w-5" />
              {title}
            </DialogTitle>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos, categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>
          </DialogHeader>

          {/* Main Content: Tabs y Grid */}
          <div className="flex-1 overflow-y-auto space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  Todos ({categoryStats.all})
                </TabsTrigger>
                <TabsTrigger value="food" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Platos ({categoryStats.food})
                </TabsTrigger>
                <TabsTrigger value="wine" className="flex items-center gap-2">
                  <Wine className="h-4 w-4" />
                  Vinos ({categoryStats.wine})
                </TabsTrigger>
              </TabsList>

              {/* Product Grid */}
              <TabsContent value="all" className="mt-0">
                <ProductGrid
                  products={filteredItems}
                  onSelect={handleProductSelect}
                  selectedIds={selectedProductIds}
                  loading={loadingMenuItems}
                  searchTerm={searchTerm}
                />
              </TabsContent>
              <TabsContent value="food" className="mt-0">
                <ProductGrid
                  products={filteredItems}
                  onSelect={handleProductSelect}
                  selectedIds={selectedProductIds}
                  loading={loadingMenuItems}
                  searchTerm={searchTerm}
                />
              </TabsContent>
              <TabsContent value="wine" className="mt-0">
                <ProductGrid
                  products={filteredItems}
                  onSelect={handleProductSelect}
                  selectedIds={selectedProductIds}
                  loading={loadingMenuItems}
                  searchTerm={searchTerm}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer: Solo visible con selecciones */}
          {selectedProductIds.length > 0 && (
            <div className="flex-shrink-0 border-t bg-background px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {selectedProductIds.length} producto{selectedProductIds.length > 1 ? 's' : ''} seleccionado{selectedProductIds.length > 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Finalizar Selección
                </Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    )
  }
)

// Product Grid Component
interface ProductGridProps {
  products: MenuItem[]
  onSelect: (product: MenuItem) => void
  selectedIds: string[]
  loading: boolean
  searchTerm: string
}

function ProductGrid({ products, onSelect, selectedIds, loading, searchTerm }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchTerm ?
              `No se encontraron productos para "${searchTerm}"` :
              'No hay productos disponibles'
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Verifica la configuración del menú'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 p-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={() => onSelect(product)}
          isSelected={selectedIds.includes(product.id)}
        />
      ))}
    </div>
  )
}

// SEMANTIC color mapping using ENIGMA design system
function getCategoryBadgeColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    // CARNES → Burnt Orange (accent) - cálido, intenso
    'Carnes': 'bg-accent/20 text-accent border-accent/30',

    // PESCADOS → Atlantic Blue (primary) - fresco, oceánico
    'Pescados': 'bg-primary/15 text-primary border-primary/25',
    'Pulpo': 'bg-primary/15 text-primary border-primary/25',

    // ENSALADAS → Sage Green (secondary) - natural, fresco
    'Ensaladas': 'bg-secondary/50 text-secondary-foreground border-secondary/70',

    // POSTRES → Rosa suave - dulce, delicado
    'Postres': 'bg-pink-50 text-pink-700 border-pink-200',

    // VINO TINTO → Rojo - intenso, cálido
    'Vino Tinto': 'bg-red-50 text-red-700 border-red-200',

    // VINO BLANCO → Dorado pálido - elegante, suave
    'Vino Blanco': 'bg-yellow-50 text-yellow-700 border-yellow-200',

    // VINO ROSADO → Rosa - delicado, femenino
    'Vino Rosado': 'bg-rose-50 text-rose-700 border-rose-200',

    // VINO ESPUMOSO → Azul claro - burbujas, festivo
    'Vino Espumoso': 'bg-primary/10 text-primary border-primary/20',

    // NEUTROS → Muted tones
    'Pasta': 'bg-amber-50 text-amber-700 border-amber-200',
    'Cocas': 'bg-orange-50 text-orange-600 border-orange-200',
    'Croquetas': 'bg-accent/15 text-accent border-accent/25',
    'Acompañantes': 'bg-muted text-muted-foreground border-border',
    'Especiales': 'bg-accent/25 text-accent border-accent/35'
  }

  return colorMap[categoryName] || 'bg-muted text-muted-foreground border-border'
}

// Product Card Component
interface ProductCardProps {
  product: MenuItem
  onSelect: () => void
  isSelected: boolean
}

function ProductCard({ product, onSelect, isSelected }: ProductCardProps) {
  const IconComponent = getCategoryIcon(product.menu_categories.type)

  return (
    <Card
      className={`relative cursor-pointer transition-all hover:shadow-lg border-2 ${
        isSelected
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md z-10">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getCategoryBadgeColor(product.menu_categories.name)}`}>
            <IconComponent className="h-2.5 w-2.5 mr-1" />
            {product.menu_categories.name}
          </Badge>
        </div>
        <h3 className="font-semibold text-xs leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
      </CardHeader>

      <CardContent className="p-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            €{product.price.toFixed(2)}
          </span>
          {product.menu_categories.type === 'WINE' && (
            <Wine className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {product.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function
function getCategoryIcon(type: string) {
  switch (type) {
    case 'WINE': return Wine
    case 'BEVERAGE': return Coffee
    default: return Utensils
  }
}

ModernProductSelector.displayName = 'ModernProductSelector'

export default ModernProductSelector
export type { ModernProductSelectorProps, ModernProductSelectorRef }