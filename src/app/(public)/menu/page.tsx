'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Star,
  Leaf,
  Calendar,
  Shield,
  AlertTriangle,
  Heart,
  Users,
  Camera,
  ShoppingCart,
  Plus,
  Wine,
  ChefHat,
  Wheat,
  Milk,
  Egg,
  Fish,
  Nut,
  Soup,
  Shell,
  Sparkles,
  Badge as BadgeIcon,
  Eye
} from "lucide-react"
import { useMenu } from '@/hooks/use-menu'
import { MenuFilterData } from '@/lib/validations/menu'
import { useCart } from '@/hooks/useCart'
import { cn } from "@/lib/utils"
import { EnigmaLogo } from "@/components/ui/enigma-logo"
import { useMediaLibrary } from "@/hooks/use-media-library"
import { ProductDetailModal } from "@/components/menu/ProductDetailModal"
import { AllergenInfo } from '@/app/(admin)/dashboard/menu/components/ui/allergen-badges'
import { MenuSectionToggle } from "@/components/public/menu/MenuSectionToggle"

// Professional allergen mapping with Lucide icons
const getAllergenIcon = (key: string) => {
  switch(key) {
    case 'gluten': return Wheat
    case 'milk': return Milk
    case 'eggs': return Egg
    case 'nuts': return Nut
    case 'fish': return Fish
    case 'shellfish': return Shell
    case 'soy': return Soup
    case 'celery': return Leaf
    case 'mustard': return AlertTriangle
    case 'sesame': return Nut
    case 'sulfites': return AlertTriangle
    case 'lupin': return Leaf
    case 'mollusks': return Shell
    case 'peanuts': return Nut
    default: return AlertTriangle
  }
}

const allergenInfo = {
  gluten: { name: "Gluten", nameEn: "Gluten", icon: Wheat },
  milk: { name: "Leche", nameEn: "Milk", icon: Milk },
  eggs: { name: "Huevos", nameEn: "Eggs", icon: Egg },
  nuts: { name: "Frutos Secos", nameEn: "Nuts", icon: Nut },
  fish: { name: "Pescado", nameEn: "Fish", icon: Fish },
  shellfish: { name: "Marisco", nameEn: "Shellfish", icon: Shell },
  soy: { name: "Soja", nameEn: "Soy", icon: Soup },
  celery: { name: "Apio", nameEn: "Celery", icon: Leaf },
  mustard: { name: "Mostaza", nameEn: "Mustard", icon: AlertTriangle },
  sesame: { name: "Sésamo", nameEn: "Sesame", icon: Nut },
  sulfites: { name: "Sulfitos", nameEn: "Sulfites", icon: AlertTriangle },
  lupin: { name: "Altramuces", nameEn: "Lupin", icon: Leaf },
  mollusks: { name: "Moluscos", nameEn: "Mollusks", icon: Shell },
  peanuts: { name: "Cacahuetes", nameEn: "Peanuts", icon: Nut },
}

type MenuSection = 'PLATOS' | 'VINOS' | 'BEBIDAS'

export default function MenuPage() {
  const [filters, setFilters] = useState<MenuFilterData>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAllergenInfo, setShowAllergenInfo] = useState(false)
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [activeSection, setActiveSection] = useState<MenuSection>('PLATOS')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedItemCategory, setSelectedItemCategory] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { menu, loading, error } = useMenu(filters)
  const { addToCart, setLanguage: setCartLanguage, state, getCartCount, isInCart, getCartItem } = useCart()
  const { getHeroImage, buildImageUrl, loading: mediaLoading } = useMediaLibrary({ type: 'hero' })
  const heroImage = getHeroImage('menu')

  // Filter menu based on search, category, and ACTIVE SECTION
  const filteredMenu = useMemo(() => {
    if (!menu) return null

    let filteredCategories = menu.categories

    // FIRST: Filter by active section (PLATOS/VINOS/BEBIDAS)
    const sectionTypeMap = {
      'PLATOS': 'FOOD',
      'VINOS': 'WINE',
      'BEBIDAS': 'BEVERAGE'
    }
    const targetType = sectionTypeMap[activeSection]
    filteredCategories = filteredCategories.filter(cat => cat.type === targetType)

    // SECOND: Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filteredCategories = filteredCategories.filter(cat => cat.id === selectedCategory)
    }

    // THIRD: Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filteredCategories = filteredCategories.map(category => ({
        ...category,
        menuItems: category.menuItems.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(searchLower)) ||
          item.description.toLowerCase().includes(searchLower) ||
          (item.descriptionEn && item.descriptionEn.toLowerCase().includes(searchLower))
        )
      })).filter(category => category.menuItems.length > 0)
    }

    return {
      ...menu,
      categories: filteredCategories
    }
  }, [menu, searchTerm, selectedCategory, activeSection])

  const updateFilters = (newFilters: Partial<MenuFilterData>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setSelectedCategory('all')
  }

  // Calculate counts for each section
  const getSectionCounts = () => {
    if (!menu) return { food: 0, wine: 0, beverage: 0 }

    const foodCount = menu.categories
      .filter(cat => cat.type === 'FOOD')
      .reduce((sum, cat) => sum + cat.menuItems.length, 0)

    const wineCount = menu.categories
      .filter(cat => cat.type === 'WINE')
      .reduce((sum, cat) => sum + cat.menuItems.length, 0)

    const beverageCount = menu.categories
      .filter(cat => cat.type === 'BEVERAGE')
      .reduce((sum, cat) => sum + cat.menuItems.length, 0)

    return { food: foodCount, wine: wineCount, beverage: beverageCount }
  }

  const sectionCounts = getSectionCounts()

  // Dynamic menu sections based on database
  const menuSections = useMemo(() => [
    {
      key: 'PLATOS',
      label: 'Platos',
      labelEn: 'Dishes',
      count: sectionCounts.food
    },
    {
      key: 'VINOS',
      label: 'Vinos',
      labelEn: 'Wines',
      count: sectionCounts.wine
    },
    {
      key: 'BEBIDAS',
      label: 'Bebidas',
      labelEn: 'Beverages',
      count: sectionCounts.beverage
    }
  ], [sectionCounts])

  // Categories filtered by active section for dropdown
  const availableCategories = useMemo(() => {
    if (!menu) return []
    const sectionTypeMap = {
      'PLATOS': 'FOOD',
      'VINOS': 'WINE',
      'BEBIDAS': 'BEVERAGE'
    }
    const targetType = sectionTypeMap[activeSection]
    return menu.categories.filter(cat => cat.type === targetType)
  }, [menu, activeSection])

  const getItemDisplayName = (item: any) => {
    return language === 'en' && item.nameEn ? item.nameEn : item.name
  }

  const getItemDisplayDescription = (item: any) => {
    return language === 'en' && item.descriptionEn ? item.descriptionEn : item.description
  }

  const getCategoryDisplayName = (category: any) => {
    return language === 'en' && category.nameEn ? category.nameEn : category.name
  }

  const getItemAllergens = (item: any) => {
    const allergens: any[] = []
    Object.entries(allergenInfo).forEach(([key, info]) => {
      const containsKey = `contains${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof item
      if (item[containsKey]) {
        allergens.push({ key, ...info })
      }
    })
    return allergens
  }

  // Use allergens from API dynamically
  const getAdvancedAllergenObjects = (item: any) => {
    return item.allergens || []
  }

  // Map menu item to cart item format - ENHANCED para BEBIDAS
  const mapMenuItemToCartItem = (item: any, category: any) => {
    // Mapear tipos según CategoryType del DB
    let cartType: 'dish' | 'wine' | 'beverage' = 'dish'
    if (category.type === 'WINE') cartType = 'wine'
    else if (category.type === 'BEVERAGE') cartType = 'beverage'

    return {
      id: item.id,
      type: cartType,
      name: item.name,
      nameEn: item.nameEn,
      description: item.description,
      descriptionEn: item.descriptionEn,
      price: item.price,
      image_url: item.imageUrl,
      category: getCategoryDisplayName(category),
      categoryEn: category.nameEn || category.name,
      winery: item.winery, // Para vinos
      wine_type: item.wineType, // Para vinos
    }
  }

  // Sync language with cart
  // Reset selectedCategory when activeSection changes
  useEffect(() => {
    setSelectedCategory('all')
  }, [activeSection])

  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    setLanguage(newLanguage)
    setCartLanguage(newLanguage)
  }

  const handleAddToCart = (item: any, category: any) => {
    const cartItem = mapMenuItemToCartItem(item, category)
    addToCart(cartItem)
  }

  const openDetailModal = (item: any, category: any) => {
    setSelectedItem(item)
    setSelectedItemCategory(category)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedItem(null)
    setSelectedItemCategory(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <EnigmaLogo className="h-12 w-12 mx-auto mb-4 animate-spin" variant="primary" />
          <p className="text-lg">{language === 'en' ? 'Loading menu...' : 'Cargando carta...'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="enigma-subsection-title">{language === 'en' ? 'Error loading menu' : 'Error al cargar la carta'}</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section - Enhanced Mobile-First */}
      <section className="relative py-12 sm:py-16 md:py-20 xl:py-24 text-white overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          {/* Real restaurant gastronomic atmosphere image */}
          <div
            className="w-full h-full bg-cover bg-no-repeat"
            style={{
              backgroundImage: heroImage
                ? `url(${buildImageUrl(heroImage)})`
                : 'url(https://ik.imagekit.io/insomnialz/IMG_9755.HEIC?updatedAt=1754141888431&tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true)',
              backgroundPosition: 'center center'
            }}
          />
        </div>
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 mt-20 sm:mt-20 pt-8 sm:pt-6">
            <h1 className="enigma-hero-title">
              {language === 'en' ? 'Our Menu' : 'Nuestra Carta'}
            </h1>

            <p className="enigma-hero-subtitle">
              {language === 'en'
                ? 'Discover our exquisite selection of dishes that fuse Atlantic and Mediterranean flavors between historic alleys and plants.'
                : 'Descubre nuestra exquisita selección de platos que fusionan sabores atlánticos y mediterráneos entre callejones históricos y plantas.'
              }
            </p>

            {/* Quick Stats - ALWAYS Horizontal Alignment */}
            {menu && (
              <div className="flex flex-row justify-center items-center gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="enigma-menu-stat-value">{menu.summary.wineItems || 0}</div>
                  <div className="text-sm sm:text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{language === 'en' ? 'Wines' : 'Vinos'}</div>
                </div>
                <div className="text-center">
                  <div className="enigma-menu-stat-value">{sectionCounts.food}</div>
                  <div className="text-sm sm:text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{language === 'en' ? 'Dishes' : 'Platos'}</div>
                </div>
                <div className="text-center">
                  <div className="enigma-menu-stat-value">{menu.summary.vegetarianItems}</div>
                  <div className="text-sm sm:text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{language === 'en' ? 'Vegetarian' : 'Vegetarianos'}</div>
                </div>
                {menu.summary.priceRange && (
                  <div className="text-center">
                    <div className="enigma-menu-stat-value">€{menu.summary.priceRange.min}-{menu.summary.priceRange.max}</div>
                    <div className="text-sm sm:text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{language === 'en' ? 'Price Range' : 'Rango de Precios'}</div>
                  </div>
                )}
              </div>
            )}

            {/* Language Toggle */}
            <div className="flex justify-center gap-2 mb-8">
              <Button
                variant={language === 'es' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('es')}
                className={language === 'es' ? 'bg-primary text-white shadow-lg' : 'border-white/40 text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:text-gray-900'}
                style={{ textShadow: language === 'es' ? 'none' : '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                Español
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('en')}
                className={language === 'en' ? 'bg-primary text-white shadow-lg' : 'border-white/40 text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:text-gray-900'}
                style={{ textShadow: language === 'en' ? 'none' : '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                English
              </Button>
            </div>

            {/* Conversion CTA */}
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 max-w-lg mx-auto border border-white/30 shadow-lg">
              <p className="text-sm text-white/90 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {language === 'en'
                  ? '🎯 Book your table and enjoy | ⏰ Guaranteed table available'
                  : '🎯 Reserva tu mesa y disfruta | ⏰ Mesa garantizada disponible'
                }
              </p>
              <Button className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-lg" asChild>
                <Link href="/reservas">
                  <Calendar className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'Book Table Now' : 'Reservar Mesa Ahora'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Search and Filter Section */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === 'en' ? 'Search dishes...' : 'Buscar platos...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={language === 'en' ? 'Choose category' : 'Elegir categoría'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Categories' : 'Todas las Categorías'}</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryDisplayName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {language === 'en' ? 'Filters' : 'Filtros'}
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>{language === 'en' ? 'Filters & Allergens' : 'Filtros y Alérgenos'}</SheetTitle>
                  <SheetDescription>
                    {language === 'en' ? 'Customize the menu according to your needs' : 'Personaliza la carta según tus necesidades'}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  {/* Dietary Preferences */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">{language === 'en' ? 'Dietary Preferences' : 'Preferencias Alimentarias'}</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recommended"
                          checked={filters.isRecommended || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isRecommended: checked })}
                        />
                        <Label htmlFor="recommended" className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-600" />
                          {language === 'en' ? 'Recommended' : 'Recomendado'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="organic"
                          checked={filters.isOrganic || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isOrganic: checked })}
                        />
                        <Label htmlFor="organic" className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-green-600" />
                          {language === 'en' ? 'Organic' : 'Ecológico'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vegan"
                          checked={filters.isVegan || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isVegan: checked })}
                        />
                        <Label htmlFor="vegan" className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-green-700" />
                          {language === 'en' ? 'Vegan' : 'Vegano'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gluten-free"
                          checked={filters.isGlutenFree || false}
                          onCheckedChange={(checked: boolean) => updateFilters({ isGlutenFree: checked })}
                        />
                        <Label htmlFor="gluten-free" className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          {language === 'en' ? 'Gluten Free' : 'Sin Gluten'}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Allergen Exclusions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-medium">{language === 'en' ? 'Exclude Allergens' : 'Excluir Alérgenos'}</Label>
                      <Dialog open={showAllergenInfo} onOpenChange={setShowAllergenInfo}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {language === 'en' ? 'Info' : 'Info'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{language === 'en' ? 'EU-14 Allergen Information' : 'Información de Alérgenos EU-14'}</DialogTitle>
                            <DialogDescription>
                              {language === 'en'
                                ? 'Information about the 14 most common allergens according to European regulations'
                                : 'Información sobre los 14 alérgenos más comunes según normativa europea'
                              }
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {Object.entries(allergenInfo).map(([key, info]) => {
                              const IconComponent = info.icon
                              return (
                                <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted">
                                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{language === 'en' ? info.nameEn : info.name}</div>
                                    <div className="text-sm text-muted-foreground">{language === 'en' ? info.name : info.nameEn}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(allergenInfo).map(([key, info]) => {
                        const IconComponent = info.icon
                        return (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`exclude-${key}`}
                              checked={filters[`exclude${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof MenuFilterData] as boolean || false}
                              onCheckedChange={(checked: boolean) => {
                                const filterKey = `exclude${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof MenuFilterData
                                updateFilters({ [filterKey]: checked })
                              }}
                            />
                            <Label htmlFor={`exclude-${key}`} className="text-sm flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              {language === 'en' ? info.nameEn : info.name}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">{language === 'en' ? 'Price Range' : 'Rango de Precios'}</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder={language === 'en' ? 'Min €' : 'Min €'}
                        value={filters.priceMin || ''}
                        onChange={(e) => updateFilters({ priceMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-24"
                      />
                      <span>{language === 'en' ? 'to' : 'hasta'}</span>
                      <Input
                        type="number"
                        placeholder={language === 'en' ? 'Max €' : 'Max €'}
                        value={filters.priceMax || ''}
                        onChange={(e) => updateFilters({ priceMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-24"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    {language === 'en' ? 'Clear all filters' : 'Limpiar todos los filtros'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Results Count */}
            {filteredMenu && (
              <div className="text-sm text-muted-foreground">
                {filteredMenu.categories.reduce((sum, cat) => sum + cat.menuItems.length, 0)} {language === 'en' ? 'products found' : 'productos encontrados'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Section Toggle */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <MenuSectionToggle
            sections={menuSections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            language={language}
          />
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {filteredMenu?.categories.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="enigma-subsection-title">{language === 'en' ? 'No dishes found' : 'No se encontraron platos'}</h3>
              <p className="text-muted-foreground mb-4">
                {language === 'en'
                  ? 'Try different search terms or remove some filters'
                  : 'Prueba con otros términos de búsqueda o elimina algunos filtros'
                }
              </p>
              <Button variant="outline" onClick={clearFilters}>
                {language === 'en' ? 'Reset filters' : 'Resetear filtros'}
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredMenu?.categories.map((category) => (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {category.icon && <span className="text-3xl">{category.icon}</span>}
                      <h2 className="enigma-menu-category-title">{getCategoryDisplayName(category)}</h2>
                    </div>
                    {category.description && (
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        {language === 'en' && category.descriptionEn ? category.descriptionEn : category.description}
                      </p>
                    )}
                  </div>

                  {/* Menu Items Grid - Mobile-First Responsive */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
                    {category.menuItems.map((item) => {
                      const allergens = getAdvancedAllergenObjects(item)

                      return (
                        <Card key={item.id} className="relative group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20 p-0 gap-0">
                          {/* CARD CONTENT - Padding optimizado */}
                          <CardContent className="flex-1 flex flex-col p-4 gap-3">
                            {/* Header: Título y Precio juntos */}
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-base font-bold leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                                {getItemDisplayName(item)}
                              </h3>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xl font-bold text-primary">€{item.price}</div>
                                {category.type === 'WINE' && item.glassPrice && (
                                  <div className="text-xs text-muted-foreground">
                                    €{item.glassPrice} <span className="hidden sm:inline">{language === 'en' ? 'glass' : 'copa'}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Descripción */}
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {getItemDisplayDescription(item)}
                            </p>

                            {/* Badges en una sola línea */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.isRecommended && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-2 py-0.5 rounded-full border-0">
                                  <Heart className="w-3 h-3 mr-1 fill-current" />
                                  Recomendado
                                </Badge>
                              )}
                              {item.isOrganic && (
                                <Badge className="bg-emerald-500/90 text-white text-xs px-2 py-0.5 rounded-full border-0">
                                  <Leaf className="w-3 h-3 mr-1" />
                                  Eco
                                </Badge>
                              )}
                              {category.type === 'WINE' && item.vintage && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  {item.vintage}
                                </Badge>
                              )}
                              {(category.type === 'WINE' || category.type === 'BEVERAGE') && item.alcoholContent && item.alcoholContent > 0 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  <Wine className="w-3 h-3 mr-1 inline" />
                                  {item.alcoholContent}%
                                </Badge>
                              )}
                            </div>

                            {/* Wine/Food Pairing Compact Display - Mobile Optimized */}
                            {category.type === 'FOOD' && item.winePairings && item.winePairings.length > 0 && (
                              <div className="mb-2 p-2 sm:p-2.5 bg-purple-50/80 dark:bg-purple-950/20 rounded-md border border-purple-200/60 dark:border-purple-800/60">
                                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300">
                                  <Wine className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                  <span className="truncate">{item.winePairings[0].wineItem.name}</span>
                                  <span className="text-purple-600 dark:text-purple-400 flex-shrink-0">€{item.winePairings[0].wineItem.price}</span>
                                </div>
                              </div>
                            )}

                            {category.type === 'WINE' && item.foodPairings && item.foodPairings.length > 0 && (
                              <div className="mb-2 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                                <ChefHat className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600 flex-shrink-0" />
                                <span className="text-green-700 dark:text-green-300 font-medium truncate">
                                  <span className="hidden sm:inline">{language === 'en' ? 'Pairs with:' : 'Marida con:'} </span>{item.foodPairings[0].foodItem.name}
                                </span>
                              </div>
                            )}

                            {/* Allergen & Dietary Info */}
                            <div>
                              <AllergenInfo
                                allergens={allergens}
                                isVegetarian={item.isVegetarian}
                                isVegan={item.isVegan}
                                isGlutenFree={item.isGlutenFree}
                                variant="default"
                                size="sm"
                                layout="inline"
                                showNames={false}
                                maxVisible={99}
                                className="justify-start"
                                language={language}
                              />
                            </div>

                            {/* CARD FOOTER - Botones */}
                            <div className="mt-auto pt-3 border-t border-border/30">
                              {/* Cart Status */}
                              {(category.type === 'FOOD' || category.type === 'WINE') && isInCart(item.id) && getCartItem(item.id) && (
                                <div className="mb-2 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                  <ShoppingCart className="h-3 w-3" />
                                  {language === 'en' ? `In cart (${getCartItem(item.id)?.quantity})` : `En carrito (${getCartItem(item.id)?.quantity})`}
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDetailModal(item, category)}
                                  className="flex-1 h-8 sm:h-9 px-2 sm:px-3"
                                >
                                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                                  <span className="hidden sm:inline">{language === 'en' ? 'View' : 'Ver'}</span>
                                </Button>

                                {(category.type === 'FOOD' || category.type === 'WINE') && (
                                  <Button
                                    onClick={() => handleAddToCart(item, category)}
                                    size="sm"
                                    className={cn(
                                      "flex-1 h-8 sm:h-9 px-2 sm:px-3 relative",
                                      isInCart(item.id) && "bg-green-600 hover:bg-green-700"
                                    )}
                                  >
                                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                      {isInCart(item.id)
                                        ? (language === 'en' ? 'Add' : 'Añadir')
                                        : (language === 'en' ? 'Add' : 'Añadir')
                                      }
                                    </span>

                                    {isInCart(item.id) && getCartItem(item.id) && getCartItem(item.id)!.quantity > 0 && (
                                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 hover:bg-red-500 text-white border-0 rounded-full">
                                        {getCartItem(item.id)?.quantity}
                                      </Badge>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 xl:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="enigma-menu-category-title mb-4">
            {language === 'en' ? 'Do You Like Our Selection?' : '¿Te Gusta Nuestra Selección?'}
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Book your table now and enjoy a unique gastronomic experience in the authentic old town of Calpe between historic alleys.'
              : 'Reserva ahora tu mesa y disfruta de una experiencia gastronómica única en el auténtico casco antiguo de Calpe entre callejones históricos.'
            }
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="text-primary-foreground/90">
                {language === 'en' ? '4.8/5 (230+ reviews)' : '4.8/5 (230+ reseñas)'}
              </span>
            </div>
            <div className="text-primary-foreground/60 hidden sm:block">|</div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Users className="h-4 w-4" />
              <span>
                {language === 'en' ? '230+ satisfied customers/month' : '230+ clientes satisfechos/mes'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" asChild>
              <Link href="/reservas">
                <Calendar className="mr-2 h-5 w-5" />
                {language === 'en' ? 'Book Table Now' : 'Reservar Mesa Ahora'}
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200" asChild>
              <Link href="/">
                <Camera className="mr-2 h-5 w-5" />
                {language === 'en' ? 'Back to Home' : 'Volver al Inicio'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cart components now in PublicLayout */}

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        item={selectedItem}
        category={selectedItemCategory}
        language={language}
        onAddToCart={handleAddToCart}
        isInCart={isInCart}
        getCartItem={getCartItem}
      />
    </>
  )
}