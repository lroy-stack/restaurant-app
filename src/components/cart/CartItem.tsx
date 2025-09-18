'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Minus } from 'lucide-react'
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

  return (
    <Card className={cn('transition-colors hover:bg-accent/50', className)}>
      <CardContent className={cn('p-3', isCompact && 'p-2')}>
        <div className="flex items-start justify-between gap-3">
          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h4 className={cn(
                'font-medium leading-tight',
                isCompact ? 'text-sm' : 'text-sm'
              )}>
                {getItemName(item)}
              </h4>
              {getItemCategory(item) && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs px-1.5 py-0.5 h-auto',
                    isCompact && 'hidden'
                  )}
                >
                  {getItemCategory(item)}
                </Badge>
              )}
            </div>

            {getItemDescription(item) && !isCompact && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {getItemDescription(item)}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                'font-medium text-primary',
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

          {/* Actions */}
          <div className="flex flex-col items-end gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className={cn(
                  'h-6 w-6 p-0 shrink-0',
                  isCompact && 'h-5 w-5'
                )}
                disabled={item.quantity <= 1}
              >
                <Minus className={cn('h-3 w-3', isCompact && 'h-2.5 w-2.5')} />
              </Button>

              <span className={cn(
                'font-medium min-w-[2rem] text-center',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                {item.quantity}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className={cn(
                  'h-6 w-6 p-0 shrink-0',
                  isCompact && 'h-5 w-5'
                )}
              >
                <Plus className={cn('h-3 w-3', isCompact && 'h-2.5 w-2.5')} />
              </Button>
            </div>

            {/* Subtotal */}
            <span className={cn(
              'font-semibold',
              isCompact ? 'text-sm' : 'text-sm'
            )}>
              €{(item.price * item.quantity).toFixed(2)}
            </span>

            {/* Remove Button */}
            {showRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className={cn(
                  'h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0',
                  isCompact && 'h-5 w-5'
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