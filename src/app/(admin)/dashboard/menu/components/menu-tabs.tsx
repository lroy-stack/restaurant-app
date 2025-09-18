'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UtensilsCrossed, Wine, BarChart3, Tags } from 'lucide-react'
import { MenuOverview } from './menu-overview'
import { MenuDataGrid } from './menu-data-grid'
import { WinePairingsTab } from './wine-pairings-tab'
import { CategoryManager } from './category-manager'
import { useMenuItems } from '../hooks/use-menu-items'
import { useCategories } from '../hooks/use-categories'
import { MenuItemWithAllergens } from '../schemas/menu-item.schema'

interface MenuTabsProps {
  defaultTab?: string
  onItemEdit?: (item: MenuItemWithAllergens) => void
}

export function MenuTabs({ defaultTab = 'items', onItemEdit }: MenuTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(urlTab || defaultTab)

  // Sync URL changes to local state (for browser navigation)
  useEffect(() => {
    const tab = searchParams.get('tab') || defaultTab
    setActiveTab(tab)
  }, [searchParams, defaultTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value) // Instant UI update

    // Debounced URL update to maintain shareability
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Extract current filters from URL params
  const filters = {
    categoryId: searchParams.get('categoryId') || undefined,
    search: searchParams.get('search') || undefined,
    isAvailable: searchParams.get('isAvailable') || undefined,
    type: searchParams.get('type') as 'FOOD' | 'WINE' | 'BEVERAGE' || undefined,
  }

  // Data hooks with current filters
  const {
    menuItems,
    loading: itemsLoading,
    deleteItem,
    toggleAvailability,
    updateStock,
    quickStockAction
  } = useMenuItems(filters)

  // Categories hook for potential future use
  const { categories: _ } = useCategories()

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 h-12">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Vista General</span>
        </TabsTrigger>
        <TabsTrigger value="items" className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4" />
          <span className="hidden sm:inline">Elementos</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <Tags className="w-4 h-4" />
          <span className="hidden sm:inline">Categorías</span>
        </TabsTrigger>
        <TabsTrigger value="pairings" className="flex items-center gap-2">
          <Wine className="w-4 h-4" />
          <span className="hidden sm:inline">Maridajes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <MenuOverview />
      </TabsContent>

      <TabsContent value="items" className="space-y-4">
        <MenuDataGrid
          items={menuItems}
          loading={itemsLoading}
          onItemEdit={onItemEdit || ((item) => {
            console.log('Edit item:', item)
          })}
          onItemDelete={async (item) => {
            if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.name}"?`)) {
              const success = await deleteItem(item.id)
              if (success) {
                console.log('Item deleted successfully')
              }
            }
          }}
          onItemToggleAvailability={async (itemId, isAvailable) => {
            const success = await toggleAvailability(itemId, isAvailable)
            if (success) {
              console.log('Item availability updated')
            }
          }}
          onStockUpdate={async (itemId, newStock) => {
            const success = await updateStock(itemId, newStock)
            if (success) {
              console.log('Stock updated successfully')
            }
          }}
          onQuickStockAction={async (itemId, action) => {
            await quickStockAction(itemId, action)
          }}
        />
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        <CategoryManager />
      </TabsContent>

      <TabsContent value="pairings" className="space-y-4">
        <WinePairingsTab />
      </TabsContent>
    </Tabs>
  )
}