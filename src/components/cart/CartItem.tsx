'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Minus, Wine, Utensils, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/contexts/CartContext'

interface CartItemProps {
  item: CartItemType
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  language: 'es' | 'en'
  getItemName: (item: CartItemType) => string
  getItemDescription: (item: CartItemType) => string
  getItemCategory: (item: CartItemType) => string
  variant?: 'default' | 'compact'
  showRemove?: boolean
  className?: string
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  language,
  getItemName,
  getItemDescription,
  getItemCategory,
  variant = 'default',
  showRemove = true,
  className
}) => {
  const isCompact = variant === 'compact'
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Modern horizontal layout: Image + Content + Actions
  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md border-border/50',
      'hover:border-border group',
      className
    )}>
      <CardContent className={cn('p-3', isCompact && 'p-2')}>
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className={cn(
            'relative shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10',
            isCompact ? 'w-10 h-10' : 'w-14 h-14'
          )}>
            {item.image_url && !imageError ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 animate-pulse bg-muted/50 flex items-center justify-center">
                    <ImageIcon className={cn('text-muted-foreground', isCompact ? 'h-3 w-3' : 'h-4 w-4')} />
                  </div>
                )}
                <img
                  src={item.image_url}
                  alt={getItemName(item)}
                  className={cn(
                    'w-full h-full object-cover transition-all duration-300',
                    imageLoading ? 'opacity-0' : 'opacity-100',
                    'group-hover:scale-105'
                  )}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              // Elegant fallback with type-specific icon
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                {item.type === 'wine' ? (
                  <Wine className={cn('text-primary/60', isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
                ) : (
                  <Utensils className={cn('text-primary/60', isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              {/* Name + Category Badge */}
              <div className="flex items-start gap-2">
                <h4 className={cn(
                  'font-semibold leading-tight text-foreground line-clamp-2',
                  isCompact ? 'text-sm' : 'text-sm'
                )}>
                  {getItemName(item)}
                </h4>
                {getItemCategory(item) && !isCompact && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 h-auto shrink-0 bg-primary/10 text-primary border-primary/20"
                  >
                    {getItemCategory(item)}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {getItemDescription(item) && !isCompact && (
                <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                  {getItemDescription(item)}
                </p>
              )}

              {/* Wine Details */}
              {item.type === 'wine' && (item.winery || item.wine_type) && !isCompact && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.winery && <span>{item.winery}</span>}
                  {item.winery && item.wine_type && <span>•</span>}
                  {item.wine_type && <span>{item.wine_type}</span>}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'font-bold text-primary',
                  isCompact ? 'text-sm' : 'text-sm'
                )}>
                  €{item.price.toFixed(2)}
                </span>
                {item.quantity > 1 && (
                  <span className="text-xs text-muted-foreground">
                    × {item.quantity}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className={cn(
                  'h-7 w-7 p-0 hover:bg-background rounded-md',
                  isCompact && 'h-6 w-6'
                )}
                disabled={item.quantity <= 1}
              >
                <Minus className={cn('h-3 w-3', isCompact && 'h-2.5 w-2.5')} />
              </Button>

              <span className={cn(
                'font-semibold min-w-[2rem] text-center text-foreground',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                {item.quantity}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className={cn(
                  'h-7 w-7 p-0 hover:bg-background rounded-md',
                  isCompact && 'h-6 w-6'
                )}
              >
                <Plus className={cn('h-3 w-3', isCompact && 'h-2.5 w-2.5')} />
              </Button>
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <span className={cn(
                'font-bold text-foreground block',
                isCompact ? 'text-sm' : 'text-base'
              )}>
                €{(item.price * item.quantity).toFixed(2)}
              </span>
              {item.quantity > 1 && (
                <span className="text-xs text-muted-foreground">
                  Total
                </span>
              )}
            </div>

            {/* Remove Button */}
            {showRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className={cn(
                  'h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors',
                  isCompact && 'h-6 w-6'
                )}
              >
                <Trash2 className={cn('h-3 w-3', isCompact && 'h-2.5 w-2.5')} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CartItem