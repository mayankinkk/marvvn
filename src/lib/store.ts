'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from './types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  promoCode: string
  discount: number
  addItem: (product: Product, size: string, color: string) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  applyPromoCode: (code: string) => boolean
  removePromoCode: () => void
  totalItems: () => number
  totalPrice: () => number
  finalPrice: () => number
  loadFromServer: () => Promise<void>
}

const PROMO_CODES: Record<string, number> = {
  'SHARKTANK10': 10,
  'WELCOME10': 10,
  'MARVVN15': 15,
  'FLAT20': 20,
}

async function syncToServer(items: CartItem[]) {
  try {
    const serializable = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }))
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: serializable }),
    })
  } catch {}
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: '',
      discount: 0,

      addItem: (product, size, color) => {
        const existing = get().items.find(
          (item) => item.product.id === product.id && item.size === size && item.color === color
        )

        let newItems: CartItem[]
        if (existing) {
          newItems = get().items.map((item) =>
            item.product.id === product.id && item.size === size && item.color === color
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          newItems = [...get().items, { product, quantity: 1, size, color }]
        }

        set({ items: newItems })
        syncToServer(newItems)
      },

      removeItem: (productId, size, color) => {
        const newItems = get().items.filter(
          (item) => !(item.product.id === productId && item.size === size && item.color === color)
        )
        set({ items: newItems })
        syncToServer(newItems)
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }

        const newItems = get().items.map((item) =>
          item.product.id === productId && item.size === size && item.color === color
            ? { ...item, quantity }
            : item
        )
        set({ items: newItems })
        syncToServer(newItems)
      },

      clearCart: () => {
        set({ items: [], promoCode: '', discount: 0 })
        syncToServer([])
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (open) => set({ isOpen: open }),

      applyPromoCode: (code) => {
        const upperCode = code.toUpperCase()
        if (PROMO_CODES[upperCode]) {
          set({ promoCode: upperCode, discount: PROMO_CODES[upperCode] })
          return true
        }
        return false
      },

      removePromoCode: () => set({ promoCode: '', discount: 0 }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      finalPrice: () => {
        const total = get().totalPrice()
        const discount = get().discount
        return total - (total * discount) / 100
      },

      loadFromServer: async () => {
        try {
          const res = await fetch('/api/cart')
          if (!res.ok) return
          const data = await res.json()
          if (data.cart && data.cart.length > 0) {
            const { useProducts } = await import('./hooks/useProducts')
            // We need products data to hydrate cart items
            const productRes = await fetch('/api/products')
            const productData = await productRes.json()
            const allProducts = productData.products || []

            const items: CartItem[] = data.cart.map((ci: any) => {
              const product = allProducts.find((p: any) => p.id === ci.product_id)
              return product ? {
                product,
                quantity: ci.quantity,
                size: ci.size || '',
                color: ci.color || '',
              } : null
            }).filter(Boolean)

            if (items.length > 0) {
              set({ items })
            }
          }
        } catch {}
      },
    }),
    {
      name: 'marvvn-cart',
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discount: state.discount,
      }),
    }
  )
)
