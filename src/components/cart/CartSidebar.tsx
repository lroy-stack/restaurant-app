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
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold">
                  {state.language === 'es' ? 'Tu Selección' : 'Your Selection'}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  {state.items.length > 0
                    ? `${getCartCount()} ${state.language === 'es' ? 'productos seleccionados' : 'items selected'}`
                    : state.language === 'es' ? 'Ningún producto seleccionado' : 'No items selected'
                  }
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {state.items.length === 0 ? (
              <div className="text-center py-12 px-4">
                {/* Elegant Empty State */}
                <div className="relative mb-6">
                  {/* Background decorative circle */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center relative">
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5" />
                    <ShoppingCart className="h-10 w-10 text-primary/60 relative z-10" strokeWidth={1.5} />
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Utensils className="h-3 w-3 text-primary/50" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -left-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                      <Wine className="h-4 w-4 text-secondary/60" />
                    </div>
                  </div>
                </div>

                {/* Main Message */}
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {state.language === 'es'
                    ? 'No has seleccionado nada aún'
                    : 'No items selected yet'}
                </h3>

                {/* Subtitle */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[240px] mx-auto">
                  {state.language === 'es'
                    ? 'Explora nuestro menú y pre-selecciona platos y vinos para tu reserva'
                    : 'Browse our menu and pre-select dishes and wines for your reservation'}
                </p>

                {/* Call to Action */}
                <div className="space-y-3">
                  <Button
                    onClick={() => setCartOpen(false)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    size="sm"
                  >
                    {state.language === 'es' ? 'Ver Menú' : 'Browse Menu'}
                  </Button>

                  {/* Features list */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      <span>{state.language === 'es' ? 'Pre-selección' : 'Pre-selection'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary/40" />
                      <span>{state.language === 'es' ? 'Mesa reservada' : 'Table reserved'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                      <span>{state.language === 'es' ? 'Sin prisa' : 'No rush'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      <span>{state.language === 'es' ? 'Experiencia única' : 'Unique experience'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Dishes Section */}
                {groupedItems.dishes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                        <Utensils className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground flex-1">
                        {state.language === 'es' ? 'Platos' : 'Dishes'}
                      </h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                        {groupedItems.dishes.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {groupedItems.dishes.map((item, index) => (
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
                          className="animate-in fade-in slide-in-from-left-2"
                          style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Elegant Separator */}
                {groupedItems.dishes.length > 0 && groupedItems.wines.length > 0 && (
                  <div className="relative py-2">
                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                )}

                {/* Wines Section */}
                {groupedItems.wines.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/15 to-secondary/5 flex items-center justify-center">
                        <Wine className="h-4 w-4 text-secondary" />
                      </div>
                      <h3 className="font-semibold text-foreground flex-1">
                        {state.language === 'es' ? 'Vinos' : 'Wines'}
                      </h3>
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 text-xs font-medium">
                        {groupedItems.wines.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {groupedItems.wines.map((item, index) => (
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
                          className="animate-in fade-in slide-in-from-left-2"
                          style={{ animationDelay: `${(index + groupedItems.dishes.length) * 50}ms` } as React.CSSProperties}
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
            <div className="border-t bg-gradient-to-t from-muted/10 to-background p-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{state.language === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                  <span>€{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-primary text-xl">€{getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoToReservation}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  {state.language === 'es'
                    ? 'Continuar Reserva'
                    : 'Continue Reservation'}
                </Button>

                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full h-9 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {state.language === 'es' ? 'Limpiar Selección' : 'Clear Selection'}
                </Button>
              </div>

              {/* Info Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                </div>
                <span>{state.language === 'es' ? 'Selección incluida en tu reserva' : 'Selection included in your reservation'}</span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CartSidebar