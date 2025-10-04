'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  nameEn?: string | null
  price: number
  stock: number
  imageUrl?: string | null
  category: string
}

interface ProductGridProps {
  products: Product[]
  categoryName: string
  onBack: () => void
  onAddToCart: (product: Product) => void
}

export function ProductGrid({
  products,
  categoryName,
  onBack,
  onAddToCart,
}: ProductGridProps) {
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{categoryName}</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} producto{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No hay productos disponibles en esta categoría
          </div>
        ) : (
          products.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onAddToCart(product)}
            >
              {product.imageUrl ? (
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] bg-muted rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
              )}
              <CardContent className="p-3">
                <h3 className="font-semibold line-clamp-2 mb-1 text-sm">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">
                    {product.price.toFixed(2)}€
                  </span>
                  <Badge
                    variant={product.stock > 5 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    Stock: {product.stock}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
