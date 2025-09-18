'use client'

import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestCartPage() {
  const {
    state,
    addToCart,
    removeFromCart,
    getCartTotal,
    getCartCount,
    clearCart,
    setLanguage,
    getItemName,
    getItemDescription,
    getItemCategory
  } = useCart()

  const testDish = {
    id: 'test-dish-1',
    type: 'dish' as const,
    name: 'Paella Valenciana',
    nameEn: 'Valencian Paella',
    description: 'Arroz con pollo, conejo y verduras',
    descriptionEn: 'Rice with chicken, rabbit and vegetables',
    price: 25.50,
    category: 'Arroces',
    categoryEn: 'Rice Dishes'
  }

  const testWine = {
    id: 'test-wine-1',
    type: 'wine' as const,
    name: 'Rioja Reserva',
    nameEn: 'Rioja Reserve',
    description: 'Vino tinto con crianza de 24 meses',
    descriptionEn: 'Red wine aged for 24 months',
    price: 18.00,
    category: 'Vino Tinto',
    categoryEn: 'Red Wine'
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Cart Context Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cart State Display */}
          <div>
            <h3 className="font-semibold mb-2">Cart State:</h3>
            <p>Items: {getCartCount()}</p>
            <p>Total: €{getCartTotal().toFixed(2)}</p>
            <p>Language: {state.language}</p>
            <p>Is Open: {state.isOpen ? 'Yes' : 'No'}</p>
            <p>Last Updated: {new Date(state.lastUpdated).toLocaleTimeString()}</p>
          </div>

          {/* Language Controls */}
          <div>
            <h3 className="font-semibold mb-2">Language Control:</h3>
            <div className="flex gap-2">
              <Button
                variant={state.language === 'es' ? 'default' : 'outline'}
                onClick={() => setLanguage('es')}
              >
                Español
              </Button>
              <Button
                variant={state.language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
            </div>
          </div>

          {/* Test Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test Actions:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => addToCart(testDish)}>
                Add {getItemName(testDish)} (€{testDish.price})
              </Button>
              <Button onClick={() => addToCart(testWine)}>
                Add {getItemName(testWine)} (€{testWine.price})
              </Button>
              <Button variant="outline" onClick={() => removeFromCart(testDish.id)}>
                Remove Dish
              </Button>
              <Button variant="outline" onClick={() => removeFromCart(testWine.id)}>
                Remove Wine
              </Button>
              <Button variant="destructive" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Cart Items Display */}
          <div>
            <h3 className="font-semibold mb-2">Cart Items:</h3>
            {state.items.length === 0 ? (
              <p className="text-muted-foreground">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {state.items.map((item) => (
                  <div key={item.id} className="p-3 border rounded flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.type} • Qty: {item.quantity} • €{item.price}
                      </p>
                    </div>
                    <p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LocalStorage Test */}
          <div>
            <h3 className="font-semibold mb-2">LocalStorage Test:</h3>
            <Button
              variant="outline"
              onClick={() => {
                const stored = localStorage.getItem('enigma-cart')
                if (stored) {
                  const parsed = JSON.parse(stored)
                  alert(`LocalStorage data found:\nItems: ${parsed.items?.length || 0}\nExpires: ${parsed.expiresAt}`)
                } else {
                  alert('No cart data in localStorage')
                }
              }}
            >
              Check localStorage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}