'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Star,
  Leaf,
  Heart,
  Shield,
  ShoppingCart,
  Wine,
  ChefHat,
  Clock,
  Users,
  Flame,
  Grape,
  MapPin,
  Calendar,
  Info,
  X,
  Sparkles,
  Badge as BadgeIcon
} from "lucide-react"
import { AllergenInfo } from '@/app/(admin)/dashboard/menu/components/ui/allergen-badges'
import { cn } from "@/lib/utils"

interface WinePairing {
  id: string
  description: string
  wineItem: {
    id: string
    name: string
    nameEn?: string
    price: number
    winery?: string
  }
}

interface FoodPairing {
  id: string
  description: string
  foodItem: {
    id: string
    name: string
    nameEn?: string
  }
}

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: any | null
  category: any | null
  language: 'es' | 'en'
  onAddToCart?: (item: any, category: any) => void
  isInCart?: (itemId: string) => boolean
  getCartItem?: (itemId: string) => any
}

export function ProductDetailModal({
  isOpen,
  onClose,
  item,
  category,
  language,
  onAddToCart,
  isInCart,
  getCartItem
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!item || !category) return null

  const getDisplayName = (obj: any) => {
    return language === 'en' && obj.nameEn ? obj.nameEn : obj.name
  }

  const getDisplayDescription = (obj: any) => {
    return language === 'en' && obj.descriptionEn ? obj.descriptionEn : obj.description
  }

  // Use allergens from API dynamically
  const allergens = item.allergens || []
  const hasImages = item.images && item.images.length > 0
  const winePairings = item.winePairings || []
  const foodPairings = item.foodPairings || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0">
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
            {/* Left Column - Image */}
            <div className="order-1">
              {hasImages ? (
                <div className={`relative rounded-2xl overflow-hidden border border-border/50 bg-muted shadow-sm ${
                  category.type === 'WINE' ? 'aspect-[3/4]' : 'aspect-square'
                }`}>
                  <Image
                    src={item.images[selectedImage]}
                    alt={getDisplayName(item)}
                    fill
                    className="object-cover"
                    priority={selectedImage === 0}
                    sizes="(max-width: 768px) 95vw, 400px"
                  />
                </div>
              ) : (
                <div className={`rounded-2xl border border-border/50 bg-muted shadow-sm flex items-center justify-center ${
                  category.type === 'WINE' ? 'aspect-[3/4]' : 'aspect-square'
                }`}>
                  <div className="text-center text-muted-foreground">
                    <div className="relative h-16 w-16 mx-auto mb-3">
                      <Image
                        src="/enigma-logo.svg"
                        alt="Enigma Logo"
                        fill
                        className="object-contain opacity-60"
                      />
                    </div>
                    <p className="text-sm">{language === 'en' ? 'No image available' : 'Sin imagen disponible'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Information */}
            <div className="order-2 space-y-6">
              {/* Title & Category */}
              <div>
                <DialogTitle className="text-2xl font-bold leading-tight mb-2">
                  {getDisplayName(item)}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {getDisplayName(category)}
                  </Badge>
                  {category.type === 'WINE' && item.winery && (
                    <span className="text-sm text-muted-foreground">{item.winery}</span>
                  )}
                </div>
              </div>

              {/* Price & Badges */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    €{item.price}
                    {category.type === 'WINE' && (
                      <span className="text-lg text-muted-foreground ml-2">
                        {language === 'en' ? 'bottle' : 'botella'}
                      </span>
                    )}
                  </div>
                  {category.type === 'WINE' && item.glassPrice && (
                    <div className="text-lg font-semibold text-primary mt-1">
                      €{item.glassPrice}
                      <span className="text-sm text-muted-foreground ml-2">
                        {language === 'en' ? 'glass' : 'copa'}
                      </span>
                    </div>
                  )}
                  {category.type === 'WINE' && item.alcoholContent && (
                    <div className="text-sm text-muted-foreground mt-1">{item.alcoholContent}% Vol.</div>
                  )}
                </div>
                <div className="flex gap-1">
                  {item.isSignature && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {language === 'en' ? 'Recommended' : 'Recomendado'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Wine Details - Basic Info */}
              <p className="text-muted-foreground leading-relaxed text-base mb-3">
                {getDisplayDescription(item)}
              </p>

              {/* Rich Description - Experience & Tasting */}
              {(item.richDescription || item.richDescriptionEn) && (
                <p className="text-foreground leading-relaxed text-base font-medium">
                  {language === 'en' && item.richDescriptionEn ? item.richDescriptionEn : item.richDescription}
                </p>
              )}

              {/* Allergens */}
              <AllergenInfo
                allergens={allergens}
                isVegetarian={item.isVegetarian}
                isVegan={item.isVegan}
                isGlutenFree={item.isGlutenFree}
                variant="default"
                size="sm"
                layout="inline"
                maxVisible={99}
                showNames={true}
                language={language}
              />

              {/* Wine Details */}
              {category.type === 'WINE' && (item.vintage || item.region || item.wineType) && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {item.vintage && (
                        <div>
                          <span className="text-muted-foreground">Añada:</span>
                          <p className="font-medium">{item.vintage}</p>
                        </div>
                      )}
                      {item.region && (
                        <div>
                          <span className="text-muted-foreground">Región:</span>
                          <p className="font-medium">{item.region}</p>
                        </div>
                      )}
                      {item.wineType && (
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <p className="font-medium">{item.wineType}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Wine Pairings */}
              {winePairings.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Wine className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-sm">
                        {language === 'en' ? 'Wine Pairings' : 'Maridajes'}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {winePairings.map((pairing: WinePairing) => (
                        <div key={pairing.id} className="border-l-2 border-primary/20 pl-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">
                              {getDisplayName(pairing.wineItem)}
                            </p>
                            <span className="text-sm text-primary font-medium">
                              €{pairing.wineItem.price}
                            </span>
                          </div>
                          {pairing.wineItem.winery && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {pairing.wineItem.winery}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {pairing.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Food Pairings (for wines) */}
              {foodPairings.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ChefHat className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-sm">
                        {language === 'en' ? 'Food Pairings' : 'Maridajes Gastronómicos'}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {foodPairings.map((pairing: FoodPairing) => (
                        <div key={pairing.id} className="border-l-2 border-primary/20 pl-3">
                          <p className="font-medium text-sm mb-1">
                            {getDisplayName(pairing.foodItem)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pairing.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cart Action */}
              {(category.type === 'FOOD' || category.type === 'WINE') && onAddToCart && (
                <Button onClick={() => onAddToCart(item, category)} className="w-full mt-6">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isInCart && isInCart(item.id) ?
                    `${language === 'en' ? 'Add Another' : 'Añadir Otro'}` :
                    `${language === 'en' ? 'Add to Cart' : 'Agregar al Carrito'}`
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}