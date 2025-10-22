'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePOSCartStore } from '@/stores/posCartStore'
import { useMenuItemsForPOS } from '@/hooks/useMenuItemsForPOS'
import { useOrderMutations } from '@/hooks/useOrderMutations'
import { useActiveTables } from '@/hooks/useActiveTables'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from '@/components/ui/select'
import { ArrowLeft, Search, ShoppingCart, Minus, Plus, Trash2, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { CategoryGrid, CategoryCard } from '@/components/pos/CategoryGrid'
import { ProductGrid } from '@/components/pos/ProductGrid'

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [view, setView] = useState<'categories' | 'products'>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [orderNotes, setOrderNotes] = useState('')

  const cart = usePOSCartStore()
  const { items, groupedItems, categories, isLoading } = useMenuItemsForPOS({
    searchQuery: view === 'products' ? searchQuery : undefined,
  })
  const { grouped: groupedTables, locationLabels, isLoading: tablesLoading } = useActiveTables()

  const { createOrder } = useOrderMutations()

  // Prepare category cards with representative images
  const categoryCards: CategoryCard[] = categories.map((catName) => {
    const catProducts = groupedItems[catName] || []
    const firstImage = catProducts.find((p) => p.imageUrl)?.imageUrl || null

    return {
      id: catName,
      name: catName,
      itemCount: catProducts.length,
      representativeImage: firstImage,
    }
  })

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setView('products')
  }

  const handleBack = () => {
    setView('categories')
    setSelectedCategory(null)
    setSearchQuery('')
  }

  const handleAddToCart = (item: typeof items[0]) => {
    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      nameEn: item.nameEn,
      nameDe: item.nameDe,
      category: item.category,
      quantity: 1,
      unitPrice: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl,
    })
    toast.success(`${item.name} añadido al pedido`)
  }

  const handleCreateOrder = async () => {
    if (!selectedTable) {
      toast.error('Selecciona una mesa')
      return
    }

    if (!cart.hasItems()) {
      toast.error('Añade productos al pedido')
      return
    }

    const result = await createOrder.mutateAsync({
      tableId: selectedTable,
      restaurantId: process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_demo_001',
      items: cart.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        specialRequests: item.notes,
      })),
      notes: orderNotes || undefined,
      order_source: 'presencial',
    })

    if (result.success && result.order) {
      toast.success(`Pedido ${result.order.orderNumber} creado`)
      cart.clearCart()
      router.push('/dashboard/pedidos')
    } else {
      toast.error(result.error || 'Error al crear pedido')
      if (result.stockErrors) {
        result.stockErrors.forEach((err) => {
          toast.error(
            `${err.name}: solicitado ${err.requested}, disponible ${err.available}`
          )
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/pedidos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Pedido - Comandero</h1>
        <p className="text-muted-foreground">Crear pedido presencial</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products section - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : view === 'categories' ? (
            <CategoryGrid
              categories={categoryCards}
              onSelectCategory={handleSelectCategory}
            />
          ) : (
            <>
              {/* Search bar for products view */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              <ProductGrid
                products={groupedItems[selectedCategory!] || []}
                categoryName={selectedCategory!}
                onBack={handleBack}
                onAddToCart={handleAddToCart}
              />
            </>
          )}
        </div>

        {/* Cart section - 1/3 width */}
        <div className="space-y-4">
          {/* Table selection */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Mesa</h3>
            </CardHeader>
            <CardContent>
              <Select value={selectedTable} onValueChange={setSelectedTable} disabled={tablesLoading}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={tablesLoading ? "Cargando..." : "Seleccionar mesa"} />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {Object.entries(groupedTables).map(([location, tables], idx) => (
                    <SelectGroup key={location}>
                      <SelectLabel className="text-sm font-semibold px-3 py-2 bg-muted/50">
                        {locationLabels[location] || location}
                      </SelectLabel>
                      {tables.map((table) => (
                        <SelectItem
                          key={table.id}
                          value={table.id}
                          className="py-2.5 px-3"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-base">Mesa {table.number}</span>
                            <span className="text-sm text-muted-foreground ml-3">
                              {table.capacity} personas
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Pedido ({cart.totalItems})
                </h3>
                {cart.hasItems() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cart.clearCart()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!cart.hasItems() ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Añade productos al pedido
                </p>
              ) : (
                <>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {cart.items.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.unitPrice.toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              cart.updateQuantity(item.menuItemId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              cart.updateQuantity(item.menuItemId, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => cart.removeItem(item.menuItemId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        {cart.totalAmount.toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{cart.totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas del pedido</Label>
                    <Textarea
                      id="notes"
                      placeholder="Alergias, preferencias..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </CardContent>
            {cart.hasItems() && (
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreateOrder}
                  disabled={!selectedTable || createOrder.isLoading}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {createOrder.isLoading ? 'Creando...' : 'Crear Pedido'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
