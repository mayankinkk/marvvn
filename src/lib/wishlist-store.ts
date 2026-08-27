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

async function syncToServer(items: Product[]) {
  try {
    const productIds = items.map((item) => item.id)
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    })
  } catch {}
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          const newItems = [...get().items, product]
          set({ items: newItems })
          syncToServer(newItems)
        }
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((item) => item.id !== productId)
        set({ items: newItems })
        syncToServer(newItems)
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
        syncToServer([])
      },

      loadFromServer: async () => {
        try {
          const res = await fetch('/api/wishlist')
          if (!res.ok) return
          const data = await res.json()
          if (data.wishlist && data.wishlist.length > 0) {
            const productRes = await fetch('/api/products')
            const productData = await productRes.json()
            const allProducts = productData.products || []

            const items: Product[] = data.wishlist
              .map((wi: any) => allProducts.find((p: any) => p.id === wi.product_id))
              .filter(Boolean)

            if (items.length > 0) {
              set({ items })
            }
          }
        } catch {}
      },
    }),
    {
      name: 'marvvn-wishlist',
    }
  )
)
