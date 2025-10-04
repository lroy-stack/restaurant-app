'use client'

import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export interface CategoryCard {
  id: string
  name: string
  itemCount: number
  representativeImage: string | null
}

interface CategoryGridProps {
  categories: CategoryCard[]
  onSelectCategory: (categoryId: string) => void
}

export function CategoryGrid({ categories, onSelectCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200"
          onClick={() => onSelectCategory(category.id)}
        >
          {category.representativeImage ? (
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg">
              <Image
                src={category.representativeImage}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-muted rounded-t-lg flex items-center justify-center">
              <span className="text-4xl text-muted-foreground">📦</span>
            </div>
          )}
          <CardContent className="p-4">
            <h3 className="font-semibold text-base mb-1 line-clamp-1">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {category.itemCount} producto{category.itemCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
