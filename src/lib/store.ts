'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from './types'
import { trackAddToCart } from '@/components/Analytics'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  promoCode: string
  discount: number
  addItem: (product: Product, size: string, color: string, qty?: number) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  applyPromoCode: (code: string) => Promise<boolean>
  removePromoCode: () => void
  totalItems: () => number
  totalPrice: () => number
  finalPrice: () => number
  loadFromServer: () => Promise<void>
}

async function syncToServer(items: CartItem[]) {
  try {
    if (items.length === 0) return
    const serializable = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }))
    await Promise.all(
      serializable.map((item) =>
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
      )
    )
  } catch (e) {
    console.error('Cart sync failed:', e)
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: '',
      discount: 0,

      addItem: (product: Product, size: string, color: string, qty: number = 1) => {
        const existing = get().items.find(
          (item) => item.product.id === product.id && item.size === size && item.color === color
        )

        let newItems: CartItem[]
        if (existing) {
          newItems = get().items.map((item) =>
            item.product.id === product.id && item.size === size && item.color === color
              ? { ...item, quantity: Math.min(99, item.quantity + qty) }
              : item
          )
        } else {
          newItems = [...get().items, { product, quantity: Math.min(99, qty), size, color }]
        }

        set({ items: newItems })
        syncToServer(newItems)
        trackAddToCart(product.id, product.title, product.price)
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

        const clampedQty = Math.min(99, quantity)
        const newItems = get().items.map((item) =>
          item.product.id === productId && item.size === size && item.color === color
            ? { ...item, quantity: clampedQty }
            : item
        )
        set({ items: newItems })
        syncToServer(newItems)
      },

      clearCart: () => {
        set({ items: [], promoCode: '', discount: 0 })
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (open) => set({ isOpen: open }),

      applyPromoCode: async (code) => {
        try {
          const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          })
          if (!res.ok) return false
          const data = await res.json()
          if (data.valid) {
            set({ promoCode: data.code, discount: data.discount_value || 0 })
            return true
          }
        } catch (e) {
          console.error('Promo code validation failed:', e)
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
          if (data.items && data.items.length > 0) {
            const productRes = await fetch('/api/products')
            const productData = await productRes.json()
            const allProducts = productData.products || []

            const items: CartItem[] = data.items.map((ci: any) => {
              const product = allProducts.find((p: any) => p.id === ci.productId)
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
        } catch (e) {
          console.error('Failed to load cart from server:', e)
        }
      },
    }),
    {
      name: 'marvvn-cart',
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discount: state.discount,
      }),
    }
  )
)
