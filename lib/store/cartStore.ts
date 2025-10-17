import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Product = {
  id: string
  name: string
  price: number
  image?: string
  quantity?: number
}

type CartState = {
  cart: Product[]
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const existing = get().cart.find((item) => item.id === product.id)
        if (existing) {
          // Increase quantity if already in cart
          set({
            cart: get().cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                : item
            ),
          })
        } else {
          set({
            cart: [...get().cart, { ...product, quantity: 1 }],
          })
        }
      },

      removeFromCart: (id) => {
        set({
          cart: get().cart.filter((item) => item.id !== id),
        })
      },

      clearCart: () => set({ cart: [] }),
    }),
    { name: 'cart-storage' } // persists in localStorage
  )
)
