'use client'

import { useState, useEffect, useRef } from 'react'
import { OptimizedMenuCard, MenuCardSkeleton } from './OptimizedMenuCard'

interface LazyMenuGridProps {
  items: any[]
  category: any
  language: 'es' | 'en'
  onQuickView: (item: any) => void
  onAddToCart: (item: any) => void
  isInCart: (itemId: string) => boolean
  getCartQuantity: (itemId: string) => number
  getItemDisplayName: (item: any) => string
  getItemDisplayDescription: (item: any) => string
  getAllergens: (item: any) => any[]
  initialBatchSize?: number
  batchSize?: number
}

export function LazyMenuGrid({
  items,
  category,
  language,
  onQuickView,
  onAddToCart,
  isInCart,
  getCartQuantity,
  getItemDisplayName,
  getItemDisplayDescription,
  getAllergens,
  initialBatchSize = 12,
  batchSize = 12
}: LazyMenuGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialBatchSize)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!loadMoreRef.current) return
    if (visibleCount >= items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && !isLoading) {
          setIsLoading(true)

          // Simulate realistic loading delay
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + batchSize, items.length))
            setIsLoading(false)
          }, 150)
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before sentinel
        threshold: 0.1
      }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [visibleCount, items.length, isLoading, batchSize])

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <>
      {/* Optimized Grid with Better Breakpoints */}
      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((item) => {
          const allergens = getAllergens(item)
          const itemIsInCart = isInCart(item.id)
          const cartQuantity = getCartQuantity(item.id)

          return (
            <OptimizedMenuCard
              key={item.id}
              item={item}
              category={category}
              language={language}
              onQuickView={() => onQuickView(item)}
              onAddToCart={() => onAddToCart(item)}
              isInCart={itemIsInCart}
              cartQuantity={cartQuantity}
              getItemDisplayName={getItemDisplayName}
              getItemDisplayDescription={getItemDisplayDescription}
              allergens={allergens}
            />
          )
        })}

        {/* Loading Skeletons */}
        {isLoading && Array.from({ length: Math.min(batchSize, items.length - visibleCount) }).map((_, i) => (
          <MenuCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>

      {/* Sentinel Element for IntersectionObserver */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="h-4 w-full flex items-center justify-center py-8"
          aria-label="Cargando más productos"
        >
          {!isLoading && (
            <div className="text-sm text-muted-foreground">
              {language === 'en' ? 'Scroll to load more...' : 'Desplázate para cargar más...'}
            </div>
          )}
        </div>
      )}
    </>
  )
}
