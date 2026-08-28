'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from './types'

interface WishlistStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  totalItems: () => number
  clearWishlist: () => void
  loadFromServer: () => Promise<void>
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          const newItems = [...get().items, product]
          set({ items: newItems })
          fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id }),
          }).catch((e) => console.error('Wishlist sync failed:', e))
        }
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((item) => item.id !== productId)
        set({ items: newItems })
        fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        }).catch((e) => console.error('Wishlist sync failed:', e))
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId)
      },

      totalItems: () => get().items.length,

      clearWishlist: () => {
        set({ items: [] })
      },

      loadFromServer: async () => {
        try {
          const res = await fetch('/api/wishlist')
          if (!res.ok) return
          const data = await res.json()
          if (data.items && data.items.length > 0) {
            const productRes = await fetch('/api/products')
            const productData = await productRes.json()
            const allProducts = productData.products || []

            const items: Product[] = data.items
              .map((wi: any) => allProducts.find((p: any) => p.id === wi.id))
              .filter(Boolean)

            if (items.length > 0) {
              set({ items })
            }
          }
        } catch (e) {
          console.error('Failed to load wishlist from server:', e)
        }
      },
    }),
    {
      name: 'marvvn-wishlist',
      skipHydration: true,
    }
  )
)
