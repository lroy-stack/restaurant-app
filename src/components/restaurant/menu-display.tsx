"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Search, Filter, Star, Leaf, Wheat, Milk, Fish, Egg, 
  Nut, Shellfish, Wine, Euro, Clock, ChefHat 
} from "lucide-react"
import type { MenuItem, MenuCategory, CategoryType } from "@prisma/client"

// Mock data structure - replace with actual API data
type MenuItemWithDetails = MenuItem & {
  category: MenuCategory
  winePairings?: { wineItem: MenuItem }[]
}

interface MenuFilters {
  search: string
  category: CategoryType | "ALL"
  priceRange: [number, number]
  dietaryFilters: string[]
  allergenFilters: string[]
  showOnlyAvailable: boolean
  showOnlySignature: boolean
}

const initialFilters: MenuFilters = {
  search: "",
  category: "ALL",
  priceRange: [0, 100],
  dietaryFilters: [],
  allergenFilters: [],
  showOnlyAvailable: true,
  showOnlySignature: false,
}

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetariano", icon: Leaf, color: "text-green-600" },
  { id: "vegan", label: "Vegano", icon: Leaf, color: "text-green-700" },
  { id: "gluten-free", label: "Sin Gluten", icon: Wheat, color: "text-amber-600" },
  { id: "lactose-free", label: "Sin Lactosa", icon: Milk, color: "text-blue-600" },
]

const allergenOptions = [
  { id: "gluten", label: "Gluten", icon: Wheat },
  { id: "milk", label: "Lácteos", icon: Milk },
  { id: "eggs", label: "Huevos", icon: Egg },
  { id: "nuts", label: "Frutos Secos", icon: Nut },
  { id: "fish", label: "Pescado", icon: Fish },
  { id: "shellfish", label: "Mariscos", icon: Shellfish },
]

const categoryLabels: Record<CategoryType | "ALL", string> = {
  ALL: "Todas las categorías",
  FOOD: "Comida",
  WINE: "Vinos",
  BEVERAGE: "Bebidas",
}

interface MenuDisplayProps {
  menuItems: MenuItemWithDetails[]
  onItemSelect?: (item: MenuItemWithDetails) => void
  showFilters?: boolean
  compact?: boolean
  className?: string
}

export function MenuDisplay({ 
  menuItems, 
  onItemSelect, 
  showFilters = true, 
  compact = false,
  className 
}: MenuDisplayProps) {
  const [filters, setFilters] = useState<MenuFilters>(initialFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        if (!item.name.toLowerCase().includes(searchTerm) &&
            !item.description.toLowerCase().includes(searchTerm)) {
          return false
        }
      }

      // Category filter
      if (filters.category !== "ALL" && item.category.type !== filters.category) {
        return false
      }

      // Price range filter
      const price = parseFloat(item.price.toString())
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false
      }

      // Availability filter
      if (filters.showOnlyAvailable && !item.isAvailable) {
        return false
      }

      // Signature filter
      if (filters.showOnlySignature && !item.isSignature) {
        return false
      }

      // Dietary filters
      if (filters.dietaryFilters.length > 0) {
        const itemDietary = []
        if (item.isVegetarian) itemDietary.push("vegetarian")
        if (item.isVegan) itemDietary.push("vegan")
        if (item.isGlutenFree) itemDietary.push("gluten-free")
        if (item.isLactoseFree) itemDietary.push("lactose-free")

        if (!filters.dietaryFilters.some(filter => itemDietary.includes(filter))) {
          return false
        }
      }

      // Allergen filters (exclude items that contain selected allergens)
      if (filters.allergenFilters.length > 0) {
        const itemAllergens = []
        if (item.containsGluten) itemAllergens.push("gluten")
        if (item.containsMilk) itemAllergens.push("milk")
        if (item.containsEggs) itemAllergens.push("eggs")
        if (item.containsNuts || item.containsPeanuts) itemAllergens.push("nuts")
        if (item.containsFish) itemAllergens.push("fish")
        if (item.containsShellfish || item.containsMollusks) itemAllergens.push("shellfish")

        if (filters.allergenFilters.some(filter => itemAllergens.includes(filter))) {
          return false
        }
      }

      return true
    })
  }, [menuItems, filters])

  const updateFilter = (key: keyof MenuFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  const getItemAllergens = (item: MenuItemWithDetails) => {
    const allergens = []
    if (item.containsGluten) allergens.push({ label: "Gluten", icon: Wheat })
    if (item.containsMilk) allergens.push({ label: "Lácteos", icon: Milk })
    if (item.containsEggs) allergens.push({ label: "Huevos", icon: Egg })
    if (item.containsNuts || item.containsPeanuts) allergens.push({ label: "Frutos Secos", icon: Nut })
    if (item.containsFish) allergens.push({ label: "Pescado", icon: Fish })
    if (item.containsShellfish || item.containsMollusks) allergens.push({ label: "Mariscos", icon: Shellfish })
    return allergens
  }

  const getItemDietary = (item: MenuItemWithDetails) => {
    const dietary = []
    if (item.isVegan) dietary.push({ label: "Vegano", icon: Leaf, color: "text-green-700 bg-green-50" })
    else if (item.isVegetarian) dietary.push({ label: "Vegetariano", icon: Leaf, color: "text-green-600 bg-green-50" })
    if (item.isGlutenFree) dietary.push({ label: "Sin Gluten", icon: Wheat, color: "text-amber-600 bg-amber-50" })
    if (item.isLactoseFree) dietary.push({ label: "Sin Lactosa", icon: Milk, color: "text-blue-600 bg-blue-50" })
    return dietary
  }

  return (
    <div className={className}>
      {/* Search and Filter Bar */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar platos, ingredientes..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {(filters.dietaryFilters.length + filters.allergenFilters.length) > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.dietaryFilters.length + filters.allergenFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros del Menú</SheetTitle>
                  <SheetDescription>
                    Personaliza tu búsqueda según tus preferencias dietéticas y restricciones
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rango de Precio</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange[0]}
                        onChange={(e) => updateFilter("priceRange", [parseFloat(e.target.value) || 0, filters.priceRange[1]])}
                        className="w-20"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange[1]}
                        onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], parseFloat(e.target.value) || 100])}
                        className="w-20"
                      />
                      <Euro className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Preferencias Dietéticas</label>
                    {dietaryOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={filters.dietaryFilters.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter("dietaryFilters", [...filters.dietaryFilters, option.id])
                            } else {
                              updateFilter("dietaryFilters", filters.dietaryFilters.filter(f => f !== option.id))
                            }
                          }}
                        />
                        <label htmlFor={option.id} className="flex items-center space-x-2 cursor-pointer">
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Allergen Exclusions */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Excluir Alérgenos</label>
                    <p className="text-xs text-muted-foreground">
                      Selecciona los alérgenos que deseas evitar
                    </p>
                    {allergenOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allergen-${option.id}`}
                          checked={filters.allergenFilters.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter("allergenFilters", [...filters.allergenFilters, option.id])
                            } else {
                              updateFilter("allergenFilters", filters.allergenFilters.filter(f => f !== option.id))
                            }
                          }}
                        />
                        <label htmlFor={`allergen-${option.id}`} className="flex items-center space-x-2 cursor-pointer">
                          <option.icon className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Additional Filters */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={filters.showOnlyAvailable}
                        onCheckedChange={(checked) => updateFilter("showOnlyAvailable", checked)}
                      />
                      <label htmlFor="available" className="text-sm cursor-pointer">
                        Solo mostrar platos disponibles
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="signature"
                        checked={filters.showOnlySignature}
                        onCheckedChange={(checked) => updateFilter("showOnlySignature", checked)}
                      />
                      <label htmlFor="signature" className="flex items-center space-x-2 text-sm cursor-pointer">
                        <ChefHat className="h-4 w-4" />
                        Solo platos de autor
                      </label>
                    </div>
                  </div>

                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpiar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} de {menuItems.length} platos
          {filters.search && ` · Búsqueda: "${filters.search}"`}
        </p>
      </div>

      {/* Menu Items Grid */}
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onSelect={onItemSelect}
            compact={compact}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No se encontraron platos</h3>
          <p className="text-muted-foreground mb-4">
            Intenta ajustar tus filtros o buscar algo diferente
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}

interface MenuItemCardProps {
  item: MenuItemWithDetails
  onSelect?: (item: MenuItemWithDetails) => void
  compact?: boolean
}

function MenuItemCard({ item, onSelect, compact }: MenuItemCardProps) {
  const allergens = getItemAllergens(item)
  const dietary = getItemDietary(item)

  return (
    <Card 
      className={`group cursor-pointer hover:shadow-md transition-shadow ${!item.isAvailable ? "opacity-60" : ""}`}
      onClick={() => onSelect?.(item)}
    >
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              {item.isSignature && (
                <Badge variant="secondary" className="text-xs">
                  <ChefHat className="h-3 w-3 mr-1" />
                  Autor
                </Badge>
              )}
              {item.isSeasonalSpecial && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Temporada
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="text-right ml-4">
            <div className="text-lg font-bold text-primary">
              €{parseFloat(item.price.toString()).toFixed(2)}
            </div>
            {!item.isAvailable && (
              <Badge variant="destructive" className="text-xs">
                No disponible
              </Badge>
            )}
          </div>
        </div>

        {/* Dietary and Allergen Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {dietary.map((badge, index) => (
            <Badge key={index} variant="outline" className={`text-xs ${badge.color}`}>
              <badge.icon className="h-3 w-3 mr-1" />
              {badge.label}
            </Badge>
          ))}
        </div>

        {allergens.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-1">Contiene:</p>
            <div className="flex flex-wrap gap-1">
              {allergens.map((allergen, index) => (
                <Badge key={index} variant="outline" className="text-xs text-red-600 border-red-200">
                  <allergen.icon className="h-3 w-3 mr-1" />
                  {allergen.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Wine Pairings */}
        {item.winePairings && item.winePairings.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <p className="text-xs text-muted-foreground mb-1">Maridaje sugerido:</p>
            <div className="flex items-center space-x-1">
              <Wine className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium">
                {item.winePairings[0]?.wineItem.name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper functions (moved outside to avoid recreation)
function getItemAllergens(item: MenuItemWithDetails) {
  const allergens = []
  if (item.containsGluten) allergens.push({ label: "Gluten", icon: Wheat })
  if (item.containsMilk) allergens.push({ label: "Lácteos", icon: Milk })
  if (item.containsEggs) allergens.push({ label: "Huevos", icon: Egg })
  if (item.containsNuts || item.containsPeanuts) allergens.push({ label: "Frutos Secos", icon: Nut })
  if (item.containsFish) allergens.push({ label: "Pescado", icon: Fish })
  if (item.containsShellfish || item.containsMollusks) allergens.push({ label: "Mariscos", icon: Shellfish })
  return allergens
}

function getItemDietary(item: MenuItemWithDetails) {
  const dietary = []
  if (item.isVegan) dietary.push({ label: "Vegano", icon: Leaf, color: "text-green-700 bg-green-50" })
  else if (item.isVegetarian) dietary.push({ label: "Vegetariano", icon: Leaf, color: "text-green-600 bg-green-50" })
  if (item.isGlutenFree) dietary.push({ label: "Sin Gluten", icon: Wheat, color: "text-amber-600 bg-amber-50" })
  if (item.isLactoseFree) dietary.push({ label: "Sin Lactosa", icon: Milk, color: "text-blue-600 bg-blue-50" })
  return dietary
}