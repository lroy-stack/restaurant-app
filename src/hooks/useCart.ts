// Hook wrapper for cart functionality
// Re-exports the useCart hook from CartContext for cleaner imports

export { useCart } from '@/contexts/CartContext'
export type { CartItem, CartState } from '@/contexts/CartContext'