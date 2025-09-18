'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { CartItem } from './CartItem'
import { ShoppingCart, Utensils, Wine, Trash2 } from 'lucide-react'

export const CartSidebar: React.FC = () => {
  const router = useRouter()
  const {
    state,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCartOpen,
    getCartTotal,
    getCartCount,
    getItemName,
    getItemDescription,
    getItemCategory
  } = useCart()

  // VERIFIED: Exact grouping pattern (PRP lines 124-127)
  const groupedItems = {
    wines: state.items.filter(item => item.type === 'wine'),
    dishes: state.items.filter(item => item.type === 'dish')
  }

  // VERIFIED: Navigation pattern (PRP lines 129-133) - ADAPTED for Next.js
  const handleGoToReservation = () => {
    setCartOpen(false)
    router.push('/reservas') // NEXT.JS: useRouter() instead of navigate()
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  return (
    <Sheet open={state.isOpen} onOpenChange={setCartOpen}>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <SheetTitle className="text-lg">
                {state.language === 'es' ? 'Tu Pedido' : 'Your Order'}
              </SheetTitle>
              <Badge variant="secondary" className="text-xs">
                {getCartCount()}
              </Badge>
            </div>
            <SheetDescription className="text-left">
              {state.language === 'es'
                ? 'Revisa y modifica tu pedido antes de continuar'
                : 'Review and modify your order before continuing'}
            </SheetDescription>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {state.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {state.language === 'es'
                    ? 'Tu carrito está vacío'
                    : 'Your cart is empty'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {state.language === 'es'
                    ? 'Añade platos y vinos desde nuestro menú'
                    : 'Add dishes and wines from our menu'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Dishes Section */}
                {groupedItems.dishes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-sm">
                        {state.language === 'es' ? 'Platos' : 'Dishes'}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {groupedItems.dishes.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {groupedItems.dishes.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onQuantityChange={handleQuantityChange}
                          onRemove={removeFromCart}
                          language={state.language}
                          getItemName={getItemName}
                          getItemDescription={getItemDescription}
                          getItemCategory={getItemCategory}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator between sections */}
                {groupedItems.dishes.length > 0 && groupedItems.wines.length > 0 && (
                  <Separator />
                )}

                {/* Wines Section */}
                {groupedItems.wines.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wine className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-sm">
                        {state.language === 'es' ? 'Vinos' : 'Wines'}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {groupedItems.wines.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {groupedItems.wines.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onQuantityChange={handleQuantityChange}
                          onRemove={removeFromCart}
                          language={state.language}
                          getItemName={getItemName}
                          getItemDescription={getItemDescription}
                          getItemCategory={getItemCategory}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">€{getCartTotal().toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handleGoToReservation}
                  className="w-full h-9"
                  size="sm"
                >
                  {state.language === 'es'
                    ? 'Continuar Reserva'
                    : 'Continue Reservation'}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full h-9"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {state.language === 'es' ? 'Limpiar Carrito' : 'Clear Cart'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CartSidebar