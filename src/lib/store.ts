'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from './types'
import { trackAddToCart } from '@/components/Analytics'

interface CartStore {
  items: CartItem[]
  savedItems: CartItem[]
  isOpen: boolean
  promoCode: string
  discount: number
  addItem: (product: Product, size: string, color: string, qty?: number) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  saveForLater: (productId: string, size: string, color: string) => void
  moveToCart: (productId: string, size: string, color: string) => void
  removeSavedItem: (productId: string, size: string, color: string) => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  applyPromoCode: (code: string) => Promise<boolean>
  removePromoCode: () => void
  totalItems: () => number
  totalPrice: () => number
  finalPrice: () => number
  loadFromServer: () => Promise<void>
  loadSavedFromServer: () => Promise<void>
}

async function syncToServer(items: CartItem[]) {
  try {
    const serializable = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }))
    if (serializable.length === 0) {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      })
      return
    }
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

async function syncSavedToServer(items: CartItem[]) {
  try {
    if (items.length === 0) {
      await fetch('/api/saved-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      })
      return
    }
    await Promise.all(
      items.map((item) =>
        fetch('/api/saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          }),
        })
      )
    )
  } catch (e) {
    console.error('Saved items sync failed:', e)
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
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

      saveForLater: (productId, size, color) => {
        const item = get().items.find(
          (i) => i.product.id === productId && i.size === size && i.color === color
        )
        if (!item) return

        // Remove from cart
        const newCartItems = get().items.filter(
          (i) => !(i.product.id === productId && i.size === size && i.color === color)
        )

        // Add to saved (or update quantity if already exists)
        const existingSaved = get().savedItems.find(
          (i) => i.product.id === productId && i.size === size && i.color === color
        )
        let newSavedItems: CartItem[]
        if (existingSaved) {
          newSavedItems = get().savedItems.map((i) =>
            i.product.id === productId && i.size === size && i.color === color
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        } else {
          newSavedItems = [...get().savedItems, item]
        }

        set({ items: newCartItems, savedItems: newSavedItems })
        syncToServer(newCartItems)
        syncSavedToServer(newSavedItems)
      },

      moveToCart: (productId, size, color) => {
        const item = get().savedItems.find(
          (i) => i.product.id === productId && i.size === size && i.color === color
        )
        if (!item) return

        // Remove from saved
        const newSavedItems = get().savedItems.filter(
          (i) => !(i.product.id === productId && i.size === size && i.color === color)
        )

        // Add to cart (or update quantity if already exists)
        const existingCart = get().items.find(
          (i) => i.product.id === productId && i.size === size && i.color === color
        )
        let newCartItems: CartItem[]
        if (existingCart) {
          newCartItems = get().items.map((i) =>
            i.product.id === productId && i.size === size && i.color === color
              ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) }
              : i
          )
        } else {
          newCartItems = [...get().items, item]
        }

        set({ items: newCartItems, savedItems: newSavedItems })
        syncToServer(newCartItems)
        syncSavedToServer(newSavedItems)
        trackAddToCart(item.product.id, item.product.title, item.product.price)
      },

      removeSavedItem: (productId, size, color) => {
        const newSavedItems = get().savedItems.filter(
          (i) => !(i.product.id === productId && i.size === size && i.color === color)
        )
        set({ savedItems: newSavedItems })
        syncSavedToServer(newSavedItems)
      },

      clearCart: () => {
        set({ items: [], promoCode: '', discount: 0 })
        syncToServer([])
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

      loadSavedFromServer: async () => {
        try {
          const res = await fetch('/api/saved-items')
          if (!res.ok) return
          const data = await res.json()
          if (data.items && data.items.length > 0) {
            const productRes = await fetch('/api/products')
            const productData = await productRes.json()
            const allProducts = productData.products || []

            const items: CartItem[] = data.items.map((si: any) => {
              const product = allProducts.find((p: any) => p.id === si.productId)
              return product ? {
                product,
                quantity: si.quantity || 1,
                size: si.size || '',
                color: si.color || '',
              } : null
            }).filter(Boolean)

            set({ savedItems: items })
          }
        } catch (e) {
          console.error('Failed to load saved items from server:', e)
        }
      },
    }),
    {
      name: 'marvvn-cart',
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        savedItems: state.savedItems,
        promoCode: state.promoCode,
        discount: state.discount,
      }),
    }
  )
)
